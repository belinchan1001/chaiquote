import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CHAIQUOTE_APP_DESCRIPTION,
  CHAIQUOTE_APP_NAME,
  CHAIQUOTE_BACKGROUND_COLOR,
  CHAIQUOTE_START_URL,
  CHAIQUOTE_THEME_COLOR,
  appNameFromHost,
  pwaStartScope,
  renderWebManifest,
} from "../../scripts/grok-pwa-shared.mjs";
import {
  PWA,
  PWA_SERVICE_WORKER_URL,
  isStandaloneDisplay,
  pwaInstallPlatform,
  pwaInstallTip,
  shouldRegisterServiceWorker,
} from "./pwa.ts";
import { isDocumentPath } from "../../scripts/grok-pwa-shared.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("locked PWA copy", () => {
  it("matches the shared grok-pwa brand constants", () => {
    assert.equal(PWA.name, "齊Quote");
    assert.equal(PWA.shortName, "齊Quote");
    assert.equal(PWA.description, "香港寬頻／手機月費參考比較，WhatsApp 查核報價");
    assert.equal(PWA.androidTip, "想更快開啟？加到主畫面，之後撳圖示就用齊Quote。");
    assert.equal(
      PWA.iosTip,
      "用 Safari 開本站 → 分享掣 →「加入主畫面」，之後好似 App 一樣開。",
    );
    assert.equal(PWA.disclaimer, "月費同覆蓋僅供參考，實際以查核報價為準。");
    assert.equal(PWA.name, CHAIQUOTE_APP_NAME);
    assert.equal(PWA.description, CHAIQUOTE_APP_DESCRIPTION);
    assert.equal(PWA.themeColor, CHAIQUOTE_THEME_COLOR);
    assert.equal(PWA.backgroundColor, CHAIQUOTE_BACKGROUND_COLOR);
    assert.equal(PWA.startUrl, CHAIQUOTE_START_URL);
  });
});

describe("pwaInstallPlatform", () => {
  it("detects iPhone Safari, Android Chrome, and desktop", () => {
    assert.equal(
      pwaInstallPlatform(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      ),
      "ios",
    );
    assert.equal(
      pwaInstallPlatform(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
      ),
      "android",
    );
    assert.equal(
      pwaInstallPlatform(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      ),
      "other",
    );
  });
});

describe("pwaInstallTip", () => {
  it("uses the locked iPhone copy only on iOS", () => {
    assert.equal(pwaInstallTip("ios"), PWA.iosTip);
    assert.equal(pwaInstallTip("android"), PWA.androidTip);
    assert.equal(pwaInstallTip("other"), PWA.androidTip);
  });
});

describe("isStandaloneDisplay", () => {
  it("treats standalone / iOS navigator.standalone as installed", () => {
    assert.equal(isStandaloneDisplay({ matchMedia: () => ({ matches: false }) }), false);
    assert.equal(
      isStandaloneDisplay({
        matchMedia: (query: string) => ({ matches: query.includes("standalone") }),
      }),
      true,
    );
    assert.equal(isStandaloneDisplay({ navigator: { standalone: true } }), true);
  });
});

describe("production host naming", () => {
  it("shows 齊Quote on chaiquote hosts and localhost, not Grok App", () => {
    assert.equal(appNameFromHost("www.chaiquote.hk"), "齊Quote");
    assert.equal(appNameFromHost("chaiquote.hk"), "齊Quote");
    assert.equal(appNameFromHost("chaiquote.vercel.app"), "齊Quote");
    assert.equal(appNameFromHost("localhost:8080"), "齊Quote");
    assert.equal(appNameFromHost("wild-race.grok.me"), "Wild Race");
  });
});

describe("renderWebManifest for www.chaiquote.hk", () => {
  it("emits 齊Quote branding, www start_url, and 192/512 icons", () => {
    const manifest = JSON.parse(renderWebManifest("www.chaiquote.hk"));
    assert.equal(manifest.name, "齊Quote");
    assert.equal(manifest.short_name, "齊Quote");
    assert.equal(manifest.description, PWA.description);
    assert.equal(manifest.start_url, "https://www.chaiquote.hk/");
    assert.equal(manifest.scope, "https://www.chaiquote.hk/");
    assert.equal(manifest.display, "standalone");
    assert.deepEqual(manifest.display_override, ["standalone", "minimal-ui"]);
    assert.equal(manifest.theme_color, "#1557C4");
    assert.equal(manifest.background_color, "#EEF4FB");
    const sizes = new Set(manifest.icons.map((icon: { sizes: string }) => icon.sizes));
    assert.ok(sizes.has("192x192"));
    assert.ok(sizes.has("512x512"));
    assert.ok(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === "maskable"));
    assert.deepEqual(pwaStartScope("www.chaiquote.hk"), {
      id: "https://www.chaiquote.hk/",
      start_url: "https://www.chaiquote.hk/",
      scope: "https://www.chaiquote.hk/",
    });
    assert.deepEqual(pwaStartScope("localhost:8080"), {
      id: "/",
      start_url: "/",
      scope: "/",
    });
  });

  it("ships the icon files the manifest names", () => {
    const manifest = JSON.parse(renderWebManifest("www.chaiquote.hk"));
    for (const icon of manifest.icons) {
      const path = join(ROOT, "public", icon.src.replace(/^\//, ""));
      const bytes = readFileSync(path);
      assert.ok(bytes.length > 100, path);
      assert.equal(bytes.subarray(0, 8).toString("binary"), "\x89PNG\r\n\x1a\n");
    }
  });
});

function readPngRgba(bytes: Buffer) {
  let offset = 8;
  const idat: Buffer[] = [];
  let width = 0;
  let height = 0;
  while (offset + 8 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("binary", offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const row = y * (1 + stride);
    if (raw[row] !== 0) throw new Error("unsupported PNG filter");
    raw.copy(pixels, y * stride, row + 1, row + 1 + stride);
  }
  return { width, height, pixels };
}

function innerMarkCoverage(pixels: Buffer, size: number) {
  const pad = Math.floor(size * 0.1);
  let total = 0;
  let marked = 0;
  for (let y = pad; y < size - pad; y += 1) {
    for (let x = pad; x < size - pad; x += 1) {
      const i = (y * size + x) * 4;
      total += 1;
      if (pixels[i] !== 0x15 || pixels[i + 1] !== 0x57 || pixels[i + 2] !== 0xc4) marked += 1;
    }
  }
  return marked / total;
}

function markSpan(pixels: Buffer, size: number) {
  let minX = size;
  let maxX = -1;
  let minY = size;
  let maxY = -1;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      if (pixels[i + 3] < 16) continue;
      if (pixels[i] === 0x15 && pixels[i + 1] === 0x57 && pixels[i + 2] === 0xc4) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  return {
    spanW: maxX >= 0 ? (maxX - minX + 1) / size : 0,
    spanH: maxY >= 0 ? (maxY - minY + 1) / size : 0,
  };
}

describe("maskable icons", () => {
  it("are real 192/512 PNGs with the mark filling ~70–80% of the canvas", () => {
    for (const [file, expected] of [
      ["public/__grok/icon-192-maskable.png", 192],
      ["public/__grok/icon-512-maskable.png", 512],
    ] as const) {
      const bytes = readFileSync(join(ROOT, file));
      const { width, height, pixels } = readPngRgba(bytes);
      assert.equal(width, expected, file);
      assert.equal(height, expected, file);
      const { spanW, spanH } = markSpan(pixels, width);
      assert.ok(spanW >= 0.7, `${file} width span ${spanW} is still sparse`);
      assert.ok(spanH >= 0.7, `${file} height span ${spanH} is still sparse`);
      const coverage = innerMarkCoverage(pixels, width);
      assert.ok(coverage > 0.55, `${file} mark coverage ${coverage} is still too small`);
      // Corners stay solid brand blue so Android masks never show a hole.
      assert.equal(pixels[0], 0x15);
      assert.equal(pixels[1], 0x57);
      assert.equal(pixels[2], 0xc4);
    }
  });
});

describe("any-purpose and apple-touch icons", () => {
  it("use the same bold mark so home-screen tiles are not a tiny glyph", () => {
    for (const [file, expected] of [
      ["public/icon-192.png", 192],
      ["public/icon-512.png", 512],
      ["public/apple-touch-icon.png", 180],
      ["public/__grok/icon-180.png", 180],
      ["public/favicon-48.png", 48],
      ["public/favicon-96.png", 96],
    ] as const) {
      const bytes = readFileSync(join(ROOT, file));
      const { width, height, pixels } = readPngRgba(bytes);
      assert.equal(width, expected, file);
      assert.equal(height, expected, file);
      const coverage = innerMarkCoverage(pixels, width);
      assert.ok(coverage > 0.55, `${file} mark coverage ${coverage} is still too small`);
    }
  });
});

describe("site-root favicon.ico", () => {
  it("is a multi-size ICO with 16, 32, and 48 px images", () => {
    const bytes = readFileSync(join(ROOT, "public/favicon.ico"));
    assert.ok(bytes.length > 200, "favicon.ico should not be empty");
    assert.equal(bytes.readUInt16LE(0), 0);
    assert.equal(bytes.readUInt16LE(2), 1);
    const count = bytes.readUInt16LE(4);
    assert.ok(count >= 2, `expected at least 16 and 32, got ${count} images`);
    const sizes = new Set<number>();
    for (let i = 0; i < count; i += 1) {
      const width = bytes[6 + i * 16] || 256;
      sizes.add(width);
    }
    assert.ok(sizes.has(16), "16px ICO image");
    assert.ok(sizes.has(32), "32px ICO image");
    assert.ok(sizes.has(48), "48px ICO image");
  });
});

describe("service worker", () => {
  it("registers only on the live chaiquote hosts", () => {
    assert.equal(shouldRegisterServiceWorker("www.chaiquote.hk"), true);
    assert.equal(shouldRegisterServiceWorker("chaiquote.hk"), true);
    assert.equal(shouldRegisterServiceWorker("localhost"), false);
    assert.equal(shouldRegisterServiceWorker("127.0.0.1"), false);
    assert.equal(shouldRegisterServiceWorker("chaiquote.vercel.app"), false);
    assert.equal(shouldRegisterServiceWorker("wild-race.grok.me"), false);
    assert.equal(PWA_SERVICE_WORKER_URL, "/sw.js");
  });

  it("ships a fetch handler that leaves documents and other origins alone", () => {
    const sw = readFileSync(join(ROOT, "public/sw.js"), "utf8");
    assert.match(sw, /addEventListener\(\s*["']install["']/);
    assert.match(sw, /addEventListener\(\s*["']fetch["']/);
    assert.match(sw, /url\.origin !== self\.location\.origin/);
    assert.match(sw, /request\.mode === ["']navigate["']/);
    assert.doesNotMatch(sw, /wa\.me/);
    assert.equal(isDocumentPath("/sw.js"), false);
  });
});
