import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

function src(rel: string) {
  return readFileSync(join(here, rel), "utf8");
}

function bytes(rel: string) {
  return statSync(join(root, rel)).size;
}

describe("homepage first-load images", () => {
  it("keeps hero + category files small and serves WebP with a JPEG fallback", () => {
    const home = src("../routes/index.tsx");

    assert.match(home, /srcSet="\/images\/hero-home\.webp"/);
    assert.match(home, /src="\/images\/hero-home\.jpg"/);
    assert.match(home, /fetchPriority="high"/);
    assert.match(home, /rel: "preload"/);
    assert.match(home, /href: "\/images\/hero-home\.webp"/);
    assert.doesNotMatch(home.slice(home.indexOf("hero-home.jpg"), home.indexOf("hero-home.jpg") + 400), /loading="lazy"/);

    assert.match(home, /srcSet=\{item\.webp\}/);
    assert.match(home, /loading="lazy"/);
    assert.match(home, /webp: "\/images\/cat-broadband\.webp"/);
    assert.match(src("../components/provider-mark.tsx"), /loading="lazy"/);
    assert.match(src("../components/provider-mark.tsx"), /hkbn\.webp/);

    const assets = [
      ["public/images/hero-home.jpg", 90_000],
      ["public/images/hero-home.webp", 70_000],
      ["public/images/cat-broadband.jpg", 50_000],
      ["public/images/cat-broadband.webp", 40_000],
      ["public/images/cat-home5g.jpg", 45_000],
      ["public/images/cat-home5g.webp", 35_000],
      ["public/images/cat-mobile.jpg", 45_000],
      ["public/images/cat-mobile.webp", 35_000],
      ["public/images/cat-business.jpg", 45_000],
      ["public/images/cat-business.webp", 35_000],
    ] as const;

    for (const [path, max] of assets) {
      assert.equal(existsSync(join(root, path)), true, path);
      assert.ok(bytes(path) < max, `${path} is ${bytes(path)} bytes, want < ${max}`);
    }
  });

  it("keeps provider logos tiny WebP with PNG fallback", () => {
    const ids = ["hkbn", "netvigator", "cmhk", "hgc", "smartone", "three", "csl", "icable"];
    for (const id of ids) {
      const png = `public/images/providers/${id}.png`;
      const webp = `public/images/providers/${id}.webp`;
      assert.equal(existsSync(join(root, png)), true, png);
      assert.equal(existsSync(join(root, webp)), true, webp);
      assert.ok(bytes(png) < 16_000, `${png} is ${bytes(png)}`);
      assert.ok(bytes(webp) < 6_000, `${webp} is ${bytes(webp)}`);
    }
  });

  it("does not ship the English plan dictionary on the default Chinese path", () => {
    const i18n = src("i18n.tsx");
    const wa = src("whatsapp.ts");
    assert.match(i18n, /loadPlanEn/);
    assert.doesNotMatch(i18n, /from "@\/lib\/plan-en"/);
    assert.match(wa, /toEnglishLazy/);
    assert.doesNotMatch(wa, /from "@\/lib\/plan-en"/);
  });

  it("CDN-caches HTML and static images", () => {
    const vercel = readFileSync(join(root, "vercel.json"), "utf8");
    const cache = src("../../server/middleware/html-cache.ts");
    const dir = src("../routes/estates.tsx");
    const estatePage = src("../routes/estates_.$slug.tsx");
    assert.match(vercel, /"regions": \["hkg1"\]/);
    assert.match(vercel, /\/images\/\(\.\*\)/);
    assert.match(vercel, /max-age=2592000/);
    assert.match(vercel, /X-Content-Type-Options/);
    assert.match(cache, /s-maxage=3600/);
    assert.match(cache, /CDN-Cache-Control/);
    assert.match(cache, /Vercel-CDN-Cache-Control/);
    assert.match(cache, /X-Robots-Tag/);
    assert.match(cache, /HEAD/);
    assert.match(estatePage, /broadbandPreview/);
    assert.match(estatePage, /home5gPreview/);
    assert.doesNotMatch(dir, /showCards|openDistricts/);
    assert.match(dir, /const collapseGroups = !compact\(estate\) && !activeDistrict && !newIntakeFilter/);
    assert.match(dir, /return collapseGroups \? \(/);
    assert.match(dir, /<details/);
    assert.match(dir, /href=\{\`\/estates\/\$\{page\.slug\}\`\}/);
  });
});
