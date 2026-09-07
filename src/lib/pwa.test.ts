import { describe, it } from "node:test";
import assert from "node:assert/strict";
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
import { PWA, isStandaloneDisplay, pwaInstallPlatform, pwaInstallTip } from "./pwa.ts";

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
