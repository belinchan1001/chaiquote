import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { MESSAGES } from "./messages.ts";
import { LazyIsland } from "./lazy-island.ts";
import {
  isChunkLoadError,
  onVitePreloadError,
  reloadOnceForChunkError,
  rootErrorFields,
  type ReloadDeps,
} from "./public-error.ts";

const here = dirname(fileURLToPath(import.meta.url));
const CHUNK_URL = "https://www.chaiquote.hk/assets/home-news-rail-CpRXvUoE.js";
const CHUNK_ERROR = `Failed to fetch dynamically imported module: ${CHUNK_URL}`;
const COMPARE_URL = "https://www.chaiquote.hk/assets/compare-bar-Q7n3kLm2.js";
const COMPARE_ERROR = `Failed to fetch dynamically imported module: ${COMPARE_URL}`;

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

function quiet<T>(run: () => T): T {
  const original = console.error;
  console.error = () => {};
  try {
    return run();
  } finally {
    console.error = original;
  }
}

function ChunkBomb(): never {
  throw new Error(CHUNK_ERROR);
}

function CompareBomb(): never {
  throw new Error(COMPARE_ERROR);
}

function assertInsideLazyIsland(source: string, name: string) {
  const needle = `<${name}`;
  let from = 0;
  let found = 0;
  while (from < source.length) {
    const at = source.indexOf(needle, from);
    if (at < 0) break;
    const before = source.slice(0, at);
    const opens = before.split("<LazyIsland").length - 1;
    const closes = before.split("</LazyIsland>").length - 1;
    assert.ok(opens > closes, `${name} is outside LazyIsland`);
    found += 1;
    from = at + needle.length;
  }
  assert.equal(found, 1, `${name} should be mounted once inside LazyIsland`);
}

function retarget(code: string, specifier: string, href: string) {
  const escaped = specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return code.replace(
    new RegExp(`from\\s+["']${escaped}["']`, "g"),
    `from ${JSON.stringify(href)}`,
  );
}

async function renderRootError(error: unknown) {
  const require = createRequire(import.meta.url);
  const reactHref = pathToFileURL(require.resolve("react")).href;
  const jsxHref = pathToFileURL(require.resolve("react/jsx-runtime")).href;
  const dir = mkdtempSync(join(tmpdir(), "chaiquote-error-"));
  const copy = JSON.stringify({
    errorTitle: MESSAGES.zh.errorTitle,
    errorLead: MESSAGES.zh.errorLead,
    backHome: MESSAGES.zh.backHome,
  });
  writeFileSync(
    join(dir, "router-stub.mjs"),
    `import { createElement } from ${JSON.stringify(reactHref)};
export function Link({ children, className }) {
  return createElement("a", { className, href: "/" }, children);
}
`,
  );
  writeFileSync(
    join(dir, "icon-stub.mjs"),
    `import { createElement } from ${JSON.stringify(reactHref)};
export function TriangleAlert(props) {
  return createElement("svg", props);
}
`,
  );
  writeFileSync(
    join(dir, "i18n-stub.mjs"),
    `const table = ${copy};
export function useI18n() {
  return { t(key) { return table[key] ?? key; } };
}
export function I18nProvider({ children }) { return children; }
`,
  );
  const publicJs = ts.transpileModule(readFileSync(join(here, "public-error.ts"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  writeFileSync(join(dir, "public-error.mjs"), publicJs);
  let componentJs = ts.transpileModule(readFileSync(join(here, "error-component.tsx"), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  componentJs = retarget(componentJs, "react/jsx-runtime", jsxHref);
  componentJs = retarget(componentJs, "react", reactHref);
  componentJs = retarget(
    componentJs,
    "@tanstack/react-router",
    pathToFileURL(join(dir, "router-stub.mjs")).href,
  );
  componentJs = retarget(
    componentJs,
    "lucide-react",
    pathToFileURL(join(dir, "icon-stub.mjs")).href,
  );
  componentJs = retarget(componentJs, "@/lib/i18n", pathToFileURL(join(dir, "i18n-stub.mjs")).href);
  componentJs = retarget(
    componentJs,
    "@/lib/public-error",
    pathToFileURL(join(dir, "public-error.mjs")).href,
  );
  const componentPath = join(dir, "error-component.mjs");
  writeFileSync(componentPath, componentJs);
  const mod = (await import(pathToFileURL(componentPath).href)) as {
    AppErrorInner: (props: { error: unknown; reset: () => void }) => ReactElement;
  };
  return quiet(() =>
    renderToStaticMarkup(createElement(mod.AppErrorInner, { error, reset: () => {} })),
  );
}

describe("root error UI", () => {
  it("asks only for the existing errorTitle and errorLead strings", () => {
    for (const locale of ["zh", "en"] as const) {
      const seen: string[] = [];
      const fields = rootErrorFields((key) => {
        seen.push(key);
        return MESSAGES[locale][key];
      });
      assert.deepEqual(seen, ["errorTitle", "errorLead"]);
      assert.equal(fields.title, MESSAGES[locale].errorTitle);
      assert.equal(fields.lead, MESSAGES[locale].errorLead);
      assert.equal(fields.title.includes(CHUNK_URL), false);
      assert.equal(fields.lead.includes("Failed to fetch dynamically imported module"), false);
    }
  });

  it("never renders error.message or a dynamically imported module URL", async () => {
    const error = new Error(CHUNK_ERROR);
    error.stack = `${CHUNK_ERROR}\n    at load (${CHUNK_URL}:1:1)`;
    const html = await renderRootError(error);
    assert.equal(html.includes(MESSAGES.zh.errorTitle), true);
    assert.equal(html.includes(MESSAGES.zh.errorLead), true);
    assert.equal(html.includes(MESSAGES.zh.backHome), true);
    assert.equal(html.includes(CHUNK_URL), false);
    assert.equal(html.includes("Failed to fetch dynamically imported module"), false);
    assert.equal(html.includes("home-news-rail"), false);
    assert.equal(html.includes(error.stack), false);

    const asString = await renderRootError(CHUNK_ERROR);
    assert.equal(asString.includes(MESSAGES.zh.errorTitle), true);
    assert.equal(asString.includes(CHUNK_URL), false);
    assert.equal(asString.includes("Failed to fetch dynamically imported module"), false);
  });

  it("does not interpolate the thrown value in the error component source", () => {
    const source = readFileSync(join(here, "error-component.tsx"), "utf8");
    assert.match(source, /rootErrorFields\(t\)/);
    assert.match(source, /\{fields\.title\}/);
    assert.match(source, /\{fields\.lead\}/);
    assert.match(source, /console\.error\(error\)/);
    assert.doesNotMatch(source, /error\.message/);
    assert.doesNotMatch(source, /error\.stack/);
    assert.doesNotMatch(source, /Failed to fetch/);
    assert.doesNotMatch(source, /https?:/);
  });
});

describe("lazy island failures", () => {
  it("does not replace the homepage with the root error heading", () => {
    const html = quiet(() =>
      renderToStaticMarkup(
        createElement(
          "div",
          null,
          createElement("h1", null, MESSAGES.zh.heroTitle1),
          createElement(LazyIsland, null, createElement(ChunkBomb)),
          createElement("a", { href: "/new-intake" }, MESSAGES.zh.newIntakeHome),
        ),
      ),
    );
    assert.equal(html.includes(MESSAGES.zh.heroTitle1), true);
    assert.equal(html.includes(MESSAGES.zh.newIntakeHome), true);
    assert.equal(html.includes(MESSAGES.zh.errorTitle), false);
    assert.equal(html.includes(CHUNK_URL), false);
    assert.equal(html.includes("Failed to fetch dynamically imported module"), false);
    assert.equal(html.includes("home-news-rail"), false);
  });

  it("does not replace /new-intake when the compare bar chunk fails", () => {
    const intake = readFileSync(join(here, "../routes/new-intake.tsx"), "utf8");
    const heading = intake.match(/const HEADING = "([^"]+)";/)?.[1];
    assert.ok(heading);
    const html = quiet(() =>
      renderToStaticMarkup(
        createElement(
          "div",
          null,
          createElement("h1", null, heading),
          createElement(LazyIsland, null, createElement(CompareBomb)),
        ),
      ),
    );
    assert.equal(html.includes(heading), true);
    assert.equal(html.includes(MESSAGES.zh.errorTitle), false);
    assert.equal(html.includes(COMPARE_URL), false);
    assert.equal(html.includes("Failed to fetch dynamically imported module"), false);
  });

  it("keeps a plain address field when the estate catalogue chunk fails", () => {
    const html = quiet(() =>
      renderToStaticMarkup(
        createElement(
          LazyIsland,
          {
            fallback: createElement("input", { name: "estate" }),
            errorFallback: createElement("input", { name: "estate" }),
          },
          createElement(ChunkBomb),
        ),
      ),
    );
    assert.match(html, /<input[^>]*name="estate"/);
    assert.equal(html.includes(CHUNK_URL), false);
    assert.equal(html.includes(MESSAGES.zh.errorTitle), false);
  });

  it("wraps every lazy island that can reach the root error UI", () => {
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    const root = readFileSync(join(here, "../routes/__root.tsx"), "utf8");
    const service = readFileSync(join(here, "../components/service-search.tsx"), "utf8");
    const estate = readFileSync(join(here, "../components/lazy-estate-suggest.tsx"), "utf8");
    const island = readFileSync(join(here, "lazy-island.ts"), "utf8");
    for (const name of ["SearchPanel", "HomeBestPicks", "HomeNewsRail", "HomeFeatured"]) {
      assertInsideLazyIsland(home, name);
    }
    for (const name of ["CompareBar", "PwaInstallTip", "AiStaffPanel", "FirstVisitTour"]) {
      assertInsideLazyIsland(root, name);
    }
    assertInsideLazyIsland(service, "HousingGuessNote");
    assertInsideLazyIsland(estate, "EstateSuggestAsync");
    assert.match(root, /<ChunkLoadRecovery \/>/);
    assert.match(island, /IslandErrorBoundary/);
    assert.match(island, /createElement\(Suspense/);
    assert.match(estate, /errorFallback=\{fallback\}/);
  });
});

describe("chunk reload guard", () => {
  it("reloads at most once per tab for a chunk-load failure", () => {
    const storage = memoryStorage();
    let reloads = 0;
    const deps: ReloadDeps = {
      storage,
      reload: () => {
        reloads += 1;
      },
    };
    assert.equal(isChunkLoadError(new Error("network down")), false);
    assert.equal(reloadOnceForChunkError(new Error("network down"), deps), false);
    assert.equal(reloads, 0);
    assert.equal(isChunkLoadError(new Error(CHUNK_ERROR)), true);
    assert.equal(isChunkLoadError(CHUNK_ERROR), true);
    assert.equal(
      isChunkLoadError(
        new Error("Unable to preload CSS for https://www.chaiquote.hk/assets/index-abc.css"),
      ),
      true,
    );
    assert.equal(reloadOnceForChunkError(new Error(CHUNK_ERROR), deps), true);
    assert.equal(reloads, 1);
    assert.equal(reloadOnceForChunkError(new Error(COMPARE_ERROR), deps), false);
    assert.equal(reloads, 1);

    const blocked = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    assert.equal(
      reloadOnceForChunkError(new Error(CHUNK_ERROR), { storage: blocked, reload: deps.reload }),
      false,
    );
    assert.equal(reloads, 1);
  });

  it("does not swallow Vite's preload error, and still reloads only once", () => {
    const storage = memoryStorage();
    let reloads = 0;
    const deps: ReloadDeps = {
      storage,
      reload: () => {
        reloads += 1;
      },
    };
    const first = new Event("vite:preloadError", { cancelable: true });
    Object.assign(first, { payload: new Error(CHUNK_ERROR) });
    const logged: unknown[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => {
      logged.push(args[0]);
    };
    try {
      onVitePreloadError(first, deps);
    } finally {
      console.error = original;
    }
    assert.equal(first.defaultPrevented, false);
    assert.equal(reloads, 1);
    assert.equal(
      logged.some((entry) => entry instanceof Error && entry.message === CHUNK_ERROR),
      true,
    );

    const second = new Event("vite:preloadError", { cancelable: true });
    Object.assign(second, { payload: new Error(COMPARE_ERROR) });
    quiet(() => onVitePreloadError(second, deps));
    assert.equal(second.defaultPrevented, false);
    assert.equal(reloads, 1);

    const other = new Event("vite:preloadError", { cancelable: true });
    Object.assign(other, { payload: new Error("render blew up") });
    quiet(() => onVitePreloadError(other, deps));
    assert.equal(reloads, 1);
  });
});
