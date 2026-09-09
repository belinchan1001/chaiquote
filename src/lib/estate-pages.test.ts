import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ESTATES } from "./estates.ts";
import {
  ESTATE_PAGE_NAMES,
  ESTATE_PAGES,
  estateHousingLabel,
  estatePlans,
  estateSelectTarget,
  estateSeoTitle,
  getEstatePage,
  SKIPPED_ESTATE_REQUESTS,
} from "./estate-pages.ts";
import { SITEMAP_PAGES } from "./seo.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("estate SEO pages", () => {
  it("publishes every catalogue estate with a unique HTML slug", () => {
    assert.equal(ESTATE_PAGES.length, ESTATES.length);
    const slugs = new Set<string>();
    const names = new Set<string>();
    for (const page of ESTATE_PAGES) {
      assert.equal(slugs.has(page.slug), false, page.slug);
      slugs.add(page.slug);
      names.add(page.estate.name);
      assert.ok(page.slug.length > 2, page.estate.name);
      assert.match(page.slug, /^[a-z0-9-]+$/);
    }
    assert.equal(names.size, ESTATES.length);
    assert.equal(getEstatePage("tin-yiu")?.estate.name, "天耀邨");
    assert.equal(getEstatePage("wah-fu")?.estate.name, "華富邨");
    assert.equal(SKIPPED_ESTATE_REQUESTS.some((item) => item.query === "將軍澳廣場"), true);
    assert.equal(SKIPPED_ESTATE_REQUESTS.some((item) => item.query === "荔景"), true);
  });

  it("keeps public estate pages free of private-only fibre plans", () => {
    const tinYiu = getEstatePage("tin-yiu");
    assert.ok(tinYiu);
    assert.equal(tinYiu.estate.housing, "public");
    const { broadband } = estatePlans(tinYiu.estate);
    assert.ok(broadband.length > 0);
    assert.ok(
      broadband.every((plan) => plan.housing === "all" || plan.housing.includes("public")),
    );
    assert.ok(broadband.every((plan) => plan.housing === "all" || !plan.housing.every((h) => h === "private")));
    assert.match(estateSeoTitle(tinYiu.estate), /天耀邨寬頻比較｜公屋｜齊Quote/);
  });

  it("adds the directory and each estate page to the sitemap", () => {
    assert.ok(SITEMAP_PAGES.some((page) => page.path === "/estates"));
    const estateUrls = SITEMAP_PAGES.filter((page) => page.path.startsWith("/estates/"));
    assert.equal(estateUrls.length, ESTATE_PAGES.length);
    for (const page of ESTATE_PAGES) {
      assert.ok(
        SITEMAP_PAGES.some((item) => item.path === `/estates/${page.slug}`),
        page.slug,
      );
    }
    assert.doesNotMatch(
      SITEMAP_PAGES.map((page) => page.path).join("\n"),
      /\/estates\/.*\?/,
    );
  });

  it("does not change search, plan prices, or locked animation files", () => {
    const search = readFileSync(join(here, "search.ts"), "utf8");
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    const widget = readFileSync(join(here, "../components/whatsapp-widget.tsx"), "utf8");
    assert.match(search, /parsePlansSearch/);
    assert.match(card, /to="\/plans\/\$planId"/);
    assert.match(css, /plan-list-enter/);
    assert.match(widget, /wa-pulse/);
  });

  it("keeps homepage estate entry as a text line, not a quote-product block", () => {
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    const panel = readFileSync(join(here, "../components/search-panel.tsx"), "utf8");
    const dir = readFileSync(join(here, "../routes/estates.tsx"), "utf8");
    assert.doesNotMatch(home, /HOME_ESTATE_SLUGS/);
    assert.doesNotMatch(home, /estatesDirTitle/);
    assert.match(panel, /熱門：/);
    assert.match(panel, /tin-yiu/);
    assert.match(panel, /全部屋苑/);
    assert.match(dir, /estate-dir-q/);
    assert.match(dir, /香港屋苑寬頻比較/);
    assert.match(dir, /href=\{\`\/estates\/\$\{page\.slug\}\`\}/);
    const wahFu = getEstatePage("wah-fu");
    assert.ok(wahFu);
    assert.deepEqual(estateSelectTarget(wahFu.estate), { kind: "page", slug: "wah-fu" });
    const tin = getEstatePage("tin-yiu");
    assert.ok(tin);
    assert.deepEqual(estateSelectTarget(tin.estate), { kind: "page", slug: "tin-yiu" });
  });
});
