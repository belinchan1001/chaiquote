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

    assert.match(home, /srcSet="\/images\/hero-home-768\.webp 768w, \/images\/hero-home\.webp 1280w"/);
    assert.match(home, /src="\/images\/hero-home\.jpg"/);
    assert.match(home, /fetchPriority="high"/);
    assert.match(home, /rel: "preload"/);
    assert.match(home, /href: "\/images\/hero-home-768\.webp"/);
    assert.match(home, /href: "\/images\/hero-home\.webp"/);
    assert.match(home, /media: "\(max-width: 767px\)"/);
    assert.match(home, /sizes="100vw"/);
    assert.doesNotMatch(home.slice(home.indexOf("hero-home.jpg"), home.indexOf("hero-home.jpg") + 400), /loading="lazy"/);

    assert.match(home, /srcSet=\{item\.webp\}/);
    assert.match(home, /loading="lazy"/);
    assert.match(home, /webp: "\/images\/cat-broadband\.webp"/);
    assert.match(home, /photo-strip photo-strip-card/);
    assert.doesNotMatch(home, /aspect-\[16\/10\]/);
    const css = src("../styles.css");
    assert.match(css, /\.photo-strip\s*\{[^}]*display:\s*block/);
    assert.match(css, /\.photo-strip img\s*\{[^}]*object-position:\s*top/);
    assert.match(css, /\.photo-strip-card img\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*11/);
    assert.match(src("../components/provider-mark.tsx"), /loading="lazy"/);
    assert.match(src("../components/provider-mark.tsx"), /hkbn\.webp/);
    assert.doesNotMatch(src("../components/provider-mark.tsx"), /sr-only/);

    const assets = [
      ["public/images/hero-home.jpg", 90_000],
      ["public/images/hero-home.webp", 70_000],
      ["public/images/hero-home-768.webp", 35_000],
      ["public/images/cat-broadband.jpg", 140_000],
      ["public/images/cat-broadband.webp", 70_000],
      ["public/images/cat-home5g.jpg", 130_000],
      ["public/images/cat-home5g.webp", 65_000],
      ["public/images/cat-mobile.jpg", 145_000],
      ["public/images/cat-mobile.webp", 75_000],
      ["public/images/cat-business.jpg", 130_000],
      ["public/images/cat-business.webp", 65_000],
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
    assert.match(vercel, /Strict-Transport-Security/);
    assert.match(cache, /s-maxage=3600/);
    assert.match(cache, /CDN-Cache-Control/);
    assert.match(cache, /Vercel-CDN-Cache-Control/);
    assert.match(cache, /X-Robots-Tag/);
    assert.match(cache, /HEAD/);
    assert.match(estatePage, /broadbandPreview/);
    assert.match(estatePage, /home5gPreview/);
    assert.match(estatePage, /isIndexableEstatePage/);
    assert.match(estatePage, /noindex,follow/);
    assert.doesNotMatch(dir, /showCards|openDistricts/);
    assert.match(dir, /INDEXABLE_ESTATE_PAGES/);
    assert.match(dir, /指定屋苑計劃/);
    assert.match(dir, /const collapseGroups = !compact\(estate\) && !activeDistrict && !newIntakeFilter/);
    assert.match(dir, /return collapseGroups \? \(/);
    assert.match(dir, /<details/);
    assert.match(dir, /href=\{\`\/estates\/\$\{page\.slug\}\`\}/);
  });

  it("keeps the trial-period paper tokens and unclamped category blurbs", () => {
    const css = src("../styles.css");
    const home = src("../routes/index.tsx");
    assert.match(css, /--color-bg: #f4f8ff;/);
    assert.match(css, /--color-surface: #eaf2ff;/);
    assert.match(css, /--color-fg: #0f274f;/);
    assert.match(css, /--color-muted: #5b6b86;/);
    assert.match(css, /--color-border: #d7e3f5;/);
    assert.match(css, /--color-primary: #1557c4;/);
    assert.match(css, /--color-accent: #00a8c5;/);
    assert.match(home, /t\(item\.text\)/);
    assert.doesNotMatch(home, /line-clamp/);
    assert.match(home, /<PlanCard key=\{plan\.id\} plan=\{plan\} \/>/);
    assert.doesNotMatch(home, /className="plan"/);

    const chips = src("../components/filter-link.tsx");
    const panel = src("../components/search-panel.tsx");
    const plans = src("../routes/plans.tsx");
    assert.match(chips, /bg-surface text-fg hover:bg-border/);
    assert.match(chips, /bg-primary text-primary-foreground/);
    assert.doesNotMatch(chips, /#[0-9a-fA-F]{3,8}/);
    assert.match(panel, /chipInputClass/);
    assert.match(panel, /chipRowClass/);
    assert.match(plans, /chipRowClass/);
    assert.match(plans, /rounded-lg border border-border bg-card p-3\.5 shadow-\[var\(--shadow-home\)\]/);
    assert.match(panel, /rounded-lg border border-border bg-card p-3\.5 shadow-\[var\(--shadow-home\)\]/);
  });

  it("keeps the first-visit tour off until after LCP and skips crawlers", () => {
    const tour = src("../components/first-visit-tour.tsx");
    assert.match(tour, /TOUR_DELAY_MS = 4000/);
    assert.match(tour, /BOT_UA/);
    assert.match(tour, /addEventListener\("load", arm/);
    assert.doesNotMatch(tour, /setTimeout\(\(\) => setOpen\(true\), 400\)/);
  });

  it("does not download the estate catalogue until the address field is used", () => {
    const home = src("../routes/index.tsx");
    const lazy = src("../components/lazy-estate-suggest.tsx");
    const plans = src("../routes/plans.tsx");
    const service = src("../components/service-search.tsx");

    assert.doesNotMatch(home, /from "@\/components\/search-panel"/);
    assert.doesNotMatch(home, /from "@\/components\/estate-suggest"/);
    assert.match(home, /lazy\(\(\) =>\s*import\("@\/components\/search-panel"\)/);
    assert.match(service, /LazyEstateSuggest/);
    assert.match(plans, /LazyEstateSuggest/);
    assert.doesNotMatch(plans, /from "@\/components\/estate-suggest"/);
    assert.match(lazy, /onFocus=\{\(\) => setActive\(true\)\}/);
    assert.doesNotMatch(lazy, /requestIdleCallback/);
    assert.doesNotMatch(lazy, /setTimeout\(start, 2500\)/);
  });
});
