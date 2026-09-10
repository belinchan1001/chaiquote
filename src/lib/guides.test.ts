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
    ...guide.body.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      section.table?.caption,
      ...(section.table?.rows.flatMap((row) => [row.label, row.value]) ?? []),
    ]),
    ...guide.bodyEn.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      section.table?.caption,
      ...(section.table?.rows.flatMap((row) => [row.label, row.value]) ?? []),
    ]),
    ...(guide.faq?.flatMap((item) => [item.q, item.a]) ?? []),
    ...(guide.faqEn?.flatMap((item) => [item.q, item.a]) ?? []),
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

  it("gives the fibre hub a Hong Kong title, unique H1, FAQ and housing table", () => {
    const fiber = getGuide("fiber");
    assert.ok(fiber);
    assert.match(fiber.seoTitle, /香港光纖寬頻/);
    assert.match(fiber.seoTitle, /公屋居屋私樓村屋/);
    assert.match(fiber.seoTitle, /齊Quote$/);
    assert.match(fiber.h1, /香港光纖寬頻點揀/);
    assert.notEqual(fiber.seoTitle, fiber.h1);
    assert.ok(fiber.description.length >= 70, String(fiber.description.length));
    assert.match(fiber.description, /1000M/);
    assert.match(fiber.description, /以電訊商確認為準/);
    assert.equal(fiber.faq?.length, 5);
    assert.ok(fiber.faq?.every((item) => item.q.length > 6 && item.a.length > 20));
    const housing = fiber.body.find((section) => section.table);
    assert.equal(housing?.table?.rows.length, 4);
    assert.deepEqual(
      housing?.table?.rows.map((row) => row.label),
      ["公屋", "居屋", "私樓", "村屋"],
    );
    assert.ok(fiber.related?.includes("contract-fees"));
    assert.ok(fiber.related?.includes("home5g"));
    const text = guideText("fiber");
    for (const phrase of FORBIDDEN) {
      assert.equal(text.includes(phrase), false, `forbidden phrase: ${phrase}`);
    }
  });

  it("gives 5G home, mobile and business hubs FAQ, tables and unique SEO titles", () => {
    const hubs = [
      {
        slug: "home5g",
        title: /香港5G家居/,
        h1: /香港 5G 家居點揀/,
        desc: /免拉線/,
      },
      {
        slug: "mobile",
        title: /香港手機月費/,
        h1: /香港手機月費點揀/,
        desc: /攜號轉台|大灣區/,
      },
      {
        slug: "business",
        title: /香港商業寬頻/,
        h1: /香港商業寬頻點揀/,
        desc: /店舖/,
      },
    ] as const;
    for (const hub of hubs) {
      const guide = getGuide(hub.slug);
      assert.ok(guide, hub.slug);
      assert.match(guide.seoTitle, hub.title);
      assert.match(guide.seoTitle, /齊Quote$/);
      assert.match(guide.h1, hub.h1);
      assert.notEqual(guide.seoTitle, guide.h1);
      assert.ok(guide.description.length >= 70, `${hub.slug} ${guide.description.length}`);
      assert.match(guide.description, hub.desc);
      assert.match(guide.description, /以電訊商確認為準/);
      assert.equal(guide.faq?.length, 5, hub.slug);
      assert.ok(guide.faq?.every((item) => item.q.length > 6 && item.a.length > 20));
      assert.ok(guide.body.filter((section) => section.table).length >= 1, hub.slug);
      assert.ok(guide.body.length >= 5, hub.slug);
      const text = guideText(hub.slug);
      for (const phrase of FORBIDDEN) {
        assert.equal(text.includes(phrase), false, `${hub.slug} forbidden: ${phrase}`);
      }
    }
    assert.ok(getGuide("home5g")?.related?.includes("fiber-vs-5g"));
    assert.ok(getGuide("mobile")?.related?.includes("port-in"));
    assert.ok(getGuide("business")?.related?.includes("shop-broadband"));
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

  it("homepage cheapest picks link to plan cards without naming providers", () => {
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    const messages = readFileSync(join(here, "./messages.ts"), "utf8");
    assert.match(messages, /bestPicksTitle: "齊Quote 最抵推介"/);
    assert.match(home, /bestPicksTitle/);
    assert.match(home, /cheapestPlan\("broadband"\)/);
    assert.match(home, /cheapestVillageBroadbandPlan/);
    assert.match(home, /to="\/plans\/\$planId"/);
    assert.match(home, /bestPicksCta/);
    assert.doesNotMatch(home, /ProviderMark|providerName|PROVIDER_MAP/);
    assert.doesNotMatch(messages, /bestPicksTitle: "[^"]*最平/);
    assert.doesNotMatch(messages, /保證裝到|唔保證裝到|有得裝/);
  });

  it("collapses extra homepage search chips on mobile without new routes", () => {
    const panel = readFileSync(join(here, "../components/search-panel.tsx"), "utf8");
    assert.match(panel, /EstateSuggest/);
    assert.match(panel, /addressHitValue/);
    assert.match(panel, /parsePlansSearch/);
    assert.match(panel, /moreFilters/);
    assert.match(panel, /peer\/more/);
    assert.match(panel, /熱門：/);
    assert.doesNotMatch(panel, /createFileRoute/);
  });

  it("renders the guides index as category cards on the existing /guides route", () => {
    const page = readFileSync(join(here, "../routes/guides.tsx"), "utf8");
    const meta = readFileSync(join(here, "./guide-articles.ts"), "utf8");
    assert.match(page, /createFileRoute\("\/guides"\)/);
    assert.match(page, /GUIDE_CATEGORY_META/);
    assert.match(page, /rounded-xl bg-card/);
    assert.match(page, /cat\.image/);
    assert.match(page, /seeDetail/);
    assert.match(page, /goCompare/);
    assert.match(page, /readGuide/);
    assert.match(page, /CollectionPage/);
    assert.match(meta, /cat-broadband\.jpg/);
    assert.doesNotMatch(page, /createFileRoute\("\/guides\//);
  });
});
