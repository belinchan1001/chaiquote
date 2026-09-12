import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GUIDES, getGuide } from "./guides.ts";
import { getPlan } from "./plans.ts";
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
      "public-hos-fees",
      "private-1000-fees",
      "village-fees",
      "home-broadband-2026",
      "estate-filter",
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
    assert.match(messages, /bestPicksTitle: "齊Quote 精選計劃"/);
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

const RANKING_FORBIDDEN = ["最抵", "最低", "最平", "必選", "齊Quote 推介", "市價", "平均"];

describe("locked SEO guides", () => {
  it("registers public-hos-fees and estate-filter on the fibre hub and sitemap", () => {
    for (const slug of ["public-hos-fees", "private-1000-fees", "village-fees", "estate-filter", "home-broadband-2026"] as const) {
      assert.equal(getGuide(slug)?.slug, slug);
      assert.ok(GUIDES.some((guide) => guide.slug === slug));
      assert.ok(SITEMAP_PAGES.some((page) => page.path === `/guides/${slug}`));
    }
    assert.ok(getGuide("fiber")?.related?.includes("public-hos-fees"));
    assert.ok(getGuide("fiber")?.related?.includes("private-1000-fees"));
    assert.ok(getGuide("fiber")?.related?.includes("village-fees"));
    assert.ok(getGuide("fiber")?.related?.includes("estate-filter"));
    assert.ok(getGuide("fiber")?.related?.includes("home-broadband-2026"));
    assert.ok(getGuide("switch-broadband")?.related?.includes("public-hos-fees"));
    assert.ok(getGuide("switch-broadband")?.related?.includes("private-1000-fees"));
    assert.ok(getGuide("switch-broadband")?.related?.includes("village-fees"));
    assert.ok(getGuide("switch-broadband")?.related?.includes("estate-filter"));
    assert.ok(getGuide("switch-broadband")?.related?.includes("home-broadband-2026"));
    assert.ok(getGuide("village")?.related?.includes("village-fees"));
  });

  it("locks public-hos-fees listed fees to real plan cards and the 私樓 note", () => {
    const guide = getGuide("public-hos-fees");
    assert.ok(guide);
    assert.equal(guide.h1, "公屋／居屋 1000M 常見參考月費幾多？");
    const tableSection = guide.body.find((section) => section.table);
    assert.ok(tableSection?.table);
    assert.equal(tableSection.table.caption, "站內列出｜僅供參考");
    const expected = [
      { id: "icable-ftth-1000-48m-58", fee: 58, months: 48 },
      { id: "hgc-ftth-1000-public-36m", fee: 75, months: 36 },
      { id: "cmhk-ftth-2500", fee: 88, months: 36 },
      { id: "hgc-ftth-1000-public-39m", fee: 89, months: 39 },
      { id: "icable-ftth-1000-public-36m", fee: 93, months: 36 },
      { id: "hkbn-ftth-1000-36m-98", fee: 98, months: 36 },
    ];
    assert.equal(tableSection.table.rows.length, expected.length);
    for (const [index, row] of tableSection.table.rows.entries()) {
      const want = expected[index];
      assert.equal(row.href, `/plans/${want.id}`);
      const plan = getPlan(want.id);
      assert.ok(plan, want.id);
      assert.equal(plan.monthlyFee, want.fee);
      assert.equal(plan.contractMonths, want.months);
      assert.match(row.value, new RegExp(String(want.fee)));
    }
    const headings = guide.body.map((section) => section.heading);
    const noteIndex = headings.indexOf("點理解呢批例子");
    assert.ok(noteIndex > headings.indexOf("唔係劃一價"));
    assert.equal(guide.body[noteIndex]?.paragraphs[0], "部分例子亦適用私樓；適用樓類以計劃卡為準");
    const text = guideText("public-hos-fees");
    assert.match(text, /站內列出/);
    assert.match(text, /僅供參考/);
    assert.match(text, /唔係保證價/);
    assert.match(text, /樓類篩/);
    assert.match(text, /唔係排名/);
    for (const phrase of [...FORBIDDEN, ...RANKING_FORBIDDEN]) {
      assert.equal(text.includes(phrase), false, `forbidden phrase: ${phrase}`);
    }
  });

  it("locks home-broadband-2026 listed fees to real plan cards and housing notes", () => {
    const guide = getGuide("home-broadband-2026");
    assert.ok(guide);
    assert.equal(guide.h1, "2026 家居寬頻格價：站內列出嘅參考月費");
    assert.equal(guide.published, "2026-09-12");
    assert.equal(guide.minutes, 7);
    assert.equal(guide.category, "fiber");
    assert.deepEqual(guide.related, [
      "public-hos-fees",
      "private-1000-fees",
      "village-fees",
      "estate-filter",
      "switch-broadband",
      "village",
      "fiber",
      "is-1000m-enough",
      "public-vs-hos",
    ]);
    const tables = guide.body.filter((section) => section.table).map((section) => section.table);
    assert.equal(tables.length, 2);
    assert.equal(tables[0]?.caption, "站內列出，僅供參考");
    assert.deepEqual(tables[0]?.headers, ["供應商／計劃例子", "樓類／站內列出"]);
    const expected1000 = [
      { id: "icable-ftth-1000-48m-58", fee: 58 },
      { id: "hgc-ftth-1000-public-36m", fee: 75 },
      { id: "cmhk-ftth-2500", fee: 88 },
      { id: "smartone-ftth-1000", fee: 88 },
      { id: "icable-ftth-1000-private-36m", fee: 88 },
      { id: "hgc-ftth-1000-public-39m", fee: 89 },
      { id: "hkbn-ftth-1000-36m-98", fee: 98 },
      { id: "netvigator-ftth-1000-village-36m", fee: 278 },
    ];
    const expected2500 = [
      { id: "hkbn-ftth-2500-24m-149", fee: 149 },
      { id: "netvigator-ftth-2500-public-36m-158", fee: 158 },
      { id: "netvigator-ftth-2500-private-36m-176", fee: 178 },
      { id: "hkbn-village-2500-24m", fee: 258 },
      { id: "netvigator-ftth-2500-village-36m", fee: 376 },
    ];
    assert.equal(tables[0]?.rows.length, expected1000.length);
    assert.equal(tables[1]?.rows.length, expected2500.length);
    for (const [index, row] of (tables[0]?.rows ?? []).entries()) {
      const want = expected1000[index];
      assert.equal(row.href, `/plans/${want.id}`);
      const plan = getPlan(want.id);
      assert.ok(plan, want.id);
      assert.equal(plan.monthlyFee, want.fee);
      assert.equal(plan.flashOffer, undefined);
      assert.match(row.value, new RegExp(String(want.fee)));
    }
    for (const [index, row] of (tables[1]?.rows ?? []).entries()) {
      const want = expected2500[index];
      assert.equal(row.href, `/plans/${want.id}`);
      const plan = getPlan(want.id);
      assert.ok(plan, want.id);
      assert.equal(plan.monthlyFee, want.fee);
      assert.equal(plan.flashOffer, undefined);
      assert.match(row.value, new RegExp(String(want.fee)));
    }
    const headings = guide.body.map((section) => section.heading);
    const noteIndex = headings.indexOf("點理解 1000M 表");
    assert.ok(noteIndex > headings.indexOf("1000M：站內列出例子"));
    assert.ok(noteIndex < headings.indexOf("2500M：站內列出例子"));
    const note = guide.body[noteIndex]?.paragraphs.join("");
    assert.match(note ?? "", /唔係排名/);
    assert.match(note ?? "", /\/guides\/public-hos-fees/);
    assert.match(note ?? "", /\/guides\/village/);
    assert.match(note ?? "", /唔好混用/);
    assert.ok(guide.faq?.some((item) => /HK\$58/.test(item.q) && /唔可以/.test(item.a)));
    assert.ok(guide.faq?.some((item) => /保證價/.test(item.q) && /唔係保證價/.test(item.a)));
    assert.ok(guide.faq?.some((item) => /快閃/.test(item.q)));
    assert.ok(guide.faq?.some((item) => /公屋同居屋/.test(item.q) && /public-hos-fees/.test(item.a)));
    assert.ok(guide.bodyEn.length >= guide.body.length);
    assert.equal(guide.plans?.[0]?.href, "/plans?cat=broadband");
    const text = guideText("home-broadband-2026");
    assert.match(text, /站內列出/);
    assert.match(text, /僅供參考/);
    assert.match(text, /唔係排名/);
    assert.match(text, /以電訊商確認為準/);
    assert.match(text, /\/guides\/estate-filter/);
    assert.match(text, /\/guides\/switch-broadband/);
    for (const phrase of [...FORBIDDEN, ...RANKING_FORBIDDEN]) {
      assert.equal(text.includes(phrase), false, `forbidden phrase: ${phrase}`);
    }
  });

  it("locks private-1000-fees listed fees to real plan cards and the 公屋 note", () => {
    const guide = getGuide("private-1000-fees");
    assert.ok(guide);
    assert.equal(guide.h1, "私樓 1000M 常見參考月費幾多？");
    assert.equal(guide.published, "2026-09-12");
    assert.equal(guide.minutes, 6);
    assert.equal(guide.category, "fiber");
    const tableSection = guide.body.find((section) => section.table);
    assert.ok(tableSection?.table);
    assert.equal(tableSection.table.caption, "站內列出｜僅供參考");
    const expected = [
      { id: "icable-ftth-1000-48m-58", fee: 58 },
      { id: "cmhk-ftth-2500", fee: 88 },
      { id: "smartone-ftth-1000", fee: 88 },
      { id: "icable-ftth-1000-private-36m", fee: 88 },
      { id: "hgc-ftth-1000-private-39m", fee: 89 },
      { id: "hkbn-ftth-1000-36m-98", fee: 98 },
      { id: "hkbn-ftth-1000-24m-109", fee: 109 },
    ];
    assert.equal(tableSection.table.rows.length, expected.length);
    for (const [index, row] of tableSection.table.rows.entries()) {
      const want = expected[index];
      assert.equal(row.href, `/plans/${want.id}`);
      const plan = getPlan(want.id);
      assert.ok(plan, want.id);
      assert.equal(plan.monthlyFee, want.fee);
      assert.equal(plan.flashOffer, undefined);
      assert.match(row.value, new RegExp(String(want.fee)));
    }
    const headings = guide.body.map((section) => section.heading);
    const noteIndex = headings.indexOf("點理解呢批例子");
    assert.ok(noteIndex > headings.indexOf("唔係劃一價"));
    const note = guide.body[noteIndex]?.paragraphs.join("");
    assert.match(note ?? "", /唔好用公屋/);
    assert.match(note ?? "", /\/guides\/public-hos-fees/);
    assert.match(note ?? "", /\/guides\/home-broadband-2026/);
    assert.match(note ?? "", /唔係排名/);
    assert.ok(guide.faq?.some((item) => /保證價/.test(item.q) && /唔係保證價/.test(item.a)));
    assert.ok(guide.faq?.some((item) => /屋苑/.test(item.q) && /estate-filter/.test(item.a)));
    assert.equal(guide.plans?.[0]?.href, "/plans?cat=broadband&housing=private");
    assert.ok(guide.bodyEn.length >= guide.body.length);
    const text = guideText("private-1000-fees");
    assert.match(text, /站內列出/);
    assert.match(text, /僅供參考/);
    assert.match(text, /以計劃卡為準/);
    assert.match(text, /唔係保證價/);
    assert.match(text, /以電訊商確認為準/);
    for (const phrase of [...FORBIDDEN, ...RANKING_FORBIDDEN]) {
      assert.equal(text.includes(phrase), false, `forbidden phrase: ${phrase}`);
    }
  });

  it("locks village-fees listed fees to real plan cards and the housing-mix note", () => {
    const guide = getGuide("village-fees");
    assert.ok(guide);
    assert.equal(guide.h1, "村屋光纖常見參考月費幾多？");
    assert.equal(guide.published, "2026-09-12");
    assert.equal(guide.minutes, 6);
    assert.equal(guide.category, "fiber");
    const tableSection = guide.body.find((section) => section.table);
    assert.ok(tableSection?.table);
    assert.equal(tableSection.table.caption, "站內列出｜僅供參考");
    const expected = [
      { id: "hkbn-village-2000-24m", fee: 229 },
      { id: "hkbn-village-2500-24m", fee: 258 },
      { id: "netvigator-ftth-1000-village-36m", fee: 278 },
      { id: "hkbn-village-200-27m", fee: 298 },
      { id: "hgc-village-1g-phone-24m", fee: 319 },
      { id: "netvigator-ftth-2500-village-36m", fee: 376 },
    ];
    assert.equal(tableSection.table.rows.length, expected.length);
    for (const [index, row] of tableSection.table.rows.entries()) {
      const want = expected[index];
      assert.equal(row.href, `/plans/${want.id}`);
      const plan = getPlan(want.id);
      assert.ok(plan, want.id);
      assert.equal(plan.monthlyFee, want.fee);
      assert.equal(plan.flashOffer, undefined);
      assert.match(row.value, new RegExp(String(want.fee)));
    }
    const headings = guide.body.map((section) => section.heading);
    const noteIndex = headings.indexOf("點理解呢批例子");
    assert.ok(noteIndex > headings.indexOf("村屋係另一套"));
    const note = guide.body[noteIndex]?.paragraphs.join("");
    assert.match(note ?? "", /唔好混用/);
    assert.match(note ?? "", /\/guides\/home-broadband-2026/);
    assert.match(note ?? "", /\/guides\/village/);
    assert.ok(guide.faq?.some((item) => /拉唔到/.test(item.q) && /home5g/.test(item.a)));
    assert.ok(guide.faq?.some((item) => /私樓/.test(item.q) && /唔可以/.test(item.a)));
    assert.equal(guide.plans?.[0]?.href, "/plans?cat=broadband&housing=village");
    assert.ok(guide.bodyEn.length >= guide.body.length);
    const text = guideText("village-fees");
    assert.match(text, /站內列出/);
    assert.match(text, /僅供參考/);
    assert.match(text, /另一套/);
    assert.match(text, /唔係保證價/);
    assert.match(text, /以電訊商確認為準/);
    for (const phrase of [...FORBIDDEN, ...RANKING_FORBIDDEN]) {
      assert.equal(text.includes(phrase), false, `forbidden phrase: ${phrase}`);
    }
  });

  it("locks estate-filter to 參考適用 and carrier-confirmed coverage", () => {
    const guide = getGuide("estate-filter");
    assert.ok(guide);
    assert.equal(guide.h1, "齊Quote 點用屋苑篩？");
    const text = guideText("estate-filter");
    assert.match(text, /參考適用/);
    assert.match(text, /覆蓋以電訊商確認/);
    assert.match(guide.body.find((section) => section.table)?.table?.caption ?? "", /三步/);
    assert.ok(guide.body.some((section) => section.table?.rows.some((row) => row.label === "輸入")));
    assert.ok(guide.body.some((section) => section.table?.rows.some((row) => row.label === "睇卡")));
    assert.ok(guide.body.some((section) => section.paragraphs.some((p) => p.includes("/guides/village"))));
    assert.match(text, /入伙限定|快閃/);
    assert.match(text, /以電訊商確認為準/);
    for (const phrase of [...FORBIDDEN, ...RANKING_FORBIDDEN]) {
      assert.equal(text.includes(phrase), false, `forbidden phrase: ${phrase}`);
    }
  });

  it("strengthens switch-broadband with 五件事, 先裝後停, and a matching EN body", () => {
    const guide = getGuide("switch-broadband");
    assert.ok(guide);
    const five = guide.body.find((section) => section.heading === "轉台五件事");
    assert.ok(five?.table);
    assert.deepEqual(
      five.table.rows.map((row) => row.label),
      ["完約日", "新線安裝期", "安裝費／預繳", "路由器送定還", "舊台幾時停"],
    );
    const text = guideText("switch-broadband");
    assert.match(text, /先裝後停/);
    assert.match(text, /寬頻.*唔能夠攜號|唔能夠攜號/);
    assert.match(text, /\/guides\/contract-fees/);
    assert.ok(guide.faq?.some((item) => /斷網/.test(item.q)));
    assert.ok(guide.faq?.some((item) => /證件/.test(item.q)));
    assert.ok(guide.faq?.some((item) => /攜號/.test(item.q) && /唔可以/.test(item.a)));
    assert.ok(guide.bodyEn.length >= guide.body.length);
    assert.ok(guide.bodyEn.some((section) => section.table?.rows.length === 5));
    assert.match(guide.bodyEn.flatMap((section) => section.paragraphs).join(""), /install first, then stop/i);
    assert.doesNotMatch(text, /避約方法|點樣避約/);
    for (const phrase of [...FORBIDDEN, ...RANKING_FORBIDDEN]) {
      assert.equal(text.includes(phrase), false, `forbidden phrase: ${phrase}`);
    }
  });
});
