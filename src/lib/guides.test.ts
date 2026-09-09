import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GUIDES, getGuide } from "./guides.ts";
import { SITEMAP_PAGES } from "./seo.ts";

const FORBIDDEN = ["保證裝到", "全港最平", "官方", "唔保證裝到"];
const here = dirname(fileURLToPath(import.meta.url));

function guideText(slug: string) {
  const guide = getGuide(slug);
  assert.ok(guide, `missing guide ${slug}`);
  const chunks = [
    guide.title,
    guide.excerpt,
    guide.titleEn,
    guide.excerptEn,
    guide.cta?.lead,
    guide.cta?.leadEn,
    guide.cta?.button,
    guide.cta?.buttonEn,
    guide.cta?.waText,
    guide.cta?.waTextEn,
    ...guide.body.flatMap((section) => [section.heading, ...section.paragraphs]),
    ...guide.bodyEn.flatMap((section) => [section.heading, ...section.paragraphs]),
  ];
  return chunks.filter(Boolean).join("\n");
}

describe("village-onsite guide", () => {
  it("is published on the guides index and sitemap", () => {
    assert.equal(getGuide("village-onsite")?.slug, "village-onsite");
    assert.ok(GUIDES.some((guide) => guide.slug === "village-onsite"));
    assert.ok(SITEMAP_PAGES.some((page) => page.path === "/guides/village-onsite"));
  });

  it("keeps every guide slug in the sitemap", () => {
    for (const guide of GUIDES) {
      assert.ok(
        SITEMAP_PAGES.some((page) => page.path === `/guides/${guide.slug}`),
        `sitemap missing /guides/${guide.slug}`,
      );
    }
  });

  it("includes the 喪簡 soft lock after the onsite and 5G sections", () => {
    const guide = getGuide("village-onsite");
    assert.ok(guide);
    const headings = guide.body.map((section) => section.heading);
    assert.ok(headings.includes("光纖視察"));
    assert.ok(headings.includes("5G 測訊號"));
    const lockIndex = headings.indexOf("視察同測訊號之後");
    assert.ok(lockIndex > headings.indexOf("光纖視察"));
    assert.ok(lockIndex > headings.indexOf("5G 測訊號"));
    const lock = guide.body[lockIndex]?.paragraphs.join("");
    assert.match(lock ?? "", /只係\*\*建議\*\*/);
    assert.match(lock ?? "", /\*\*以電訊商確認為準\*\*/);
    assert.match(lock ?? "", /參考＋查核報價/);
    assert.equal(guide.cta?.button, "WhatsApp 約視察／測訊號");
    assert.match(guide.cta?.lead ?? "", /僅供參考/);
  });

  it("does not use rejected guarantee or official slogans", () => {
    const text = guideText("village-onsite");
    for (const phrase of FORBIDDEN) {
      assert.equal(text.includes(phrase), false, `forbidden phrase: ${phrase}`);
    }
  });

  it("leaves the village overview body in place", () => {
    const village = getGuide("village");
    assert.ok(village);
    const headings = village.body.map((section) => section.heading);
    assert.deepEqual(headings.slice(0, 2), ["先問覆蓋，唔好淨睇月費", "5G 家居係常見方案"]);
    assert.ok(headings.includes("村屋光纖唔係公屋價"));
    assert.ok(headings.includes("可能要現場"));
    assert.ok(village.related?.includes("village-onsite"));
  });

  it("publishes the four category hubs and long articles with unique SEO titles", () => {
    const slugs = [
      "fiber",
      "home5g",
      "mobile",
      "business",
      "public-vs-hos",
      "is-1000m-enough",
      "switch-broadband",
      "gba-mobile",
      "shop-broadband",
      "contract-fees",
      "port-in",
      "fiber-vs-5g",
      "village",
      "village-onsite",
    ];
    for (const slug of slugs) {
      const guide = getGuide(slug);
      assert.ok(guide, slug);
      assert.match(guide.seoTitle, /齊Quote/);
      assert.ok(guide.h1.length > 4);
      assert.ok(guide.description.length >= 20);
      assert.ok(SITEMAP_PAGES.some((page) => page.path === `/guides/${slug}`), slug);
    }
    assert.equal(getGuide("home5g-or-fiber"), undefined);
    const fiberVs = getGuide("fiber-vs-5g");
    assert.ok(fiberVs?.body.some((section) => section.heading === "適用情境"));
    assert.ok(fiberVs?.body.some((section) => section.heading === "數據上限"));
  });

  it("does not change homepage search, prices, tour, or animation files", () => {
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    const panel = readFileSync(join(here, "../components/search-panel.tsx"), "utf8");
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    const tour = readFileSync(join(here, "../components/first-visit-tour.tsx"), "utf8");
    assert.match(home, /slug: "fiber"/);
    assert.match(home, /goCompare/);
    assert.match(panel, /EstateSuggest/);
    assert.match(css, /plan-list-enter/);
    assert.match(css, /chip-press/);
    assert.match(tour, /chaiquote-tour-done/);
  });
});
