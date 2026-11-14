import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "./site.ts";
import { GUIDES, getGuide } from "./guides.ts";
import { SITEMAP_PAGES, sitemapLastmod } from "./seo.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("guide manuscript dates vs catalogue stamp", () => {
  it("keeps guide lastmod on the manuscript date, not SITE.updated", () => {
    assert.equal(SITE.updated, "2026-11-12");
    const fiber = getGuide("fiber");
    assert.ok(fiber);
    assert.equal(fiber.published, "2026-09-09");
    assert.equal(fiber.modified, "2026-11-08");
    assert.equal(sitemapLastmod("/guides/fiber"), "2026-11-08");

    const port = getGuide("port-in");
    assert.ok(port);
    assert.equal(port.published, "2026-09-05");
    assert.equal(port.modified, "2026-09-06");
    assert.equal(sitemapLastmod("/guides/port-in"), "2026-09-06");
    assert.notEqual(sitemapLastmod("/guides/port-in"), SITE.updated);

    for (const slug of ["broadband-total-cost", "1000m-or-2500m"] as const) {
      const guide = getGuide(slug);
      assert.ok(guide, slug);
      assert.equal(guide.published, "2026-10-14");
      assert.equal(sitemapLastmod(`/guides/${slug}`), "2026-10-14");
    }

    for (const slug of [
      "broadband-renewal",
      "broadband-stability",
      "old-building-broadband",
      "home5g-data-cap",
      "move-broadband",
      "yuen-long",
      "mobile-broadband-bundle",
      "router-wifi",
      "tuen-mun",
      "student-plans",
      "elderly-broadband",
      "kwun-tong",
      "ma-on-shan",
      "early-termination",
      "10g-broadband",
      "village-5g-test",
      "spectrum-2-3ghz",
    ] as const) {
      const guide = getGuide(slug);
      assert.ok(guide, slug);
      assert.equal(guide.published, "2026-10-21");
      assert.equal(guide.modified, "2026-10-21");
      assert.equal(sitemapLastmod(`/guides/${slug}`), "2026-10-21");
    }
  });
});

describe("HKBN vs Netvigator guide", () => {
  it("opens with the approved cite, then the two-carrier table and one plans exit", () => {
    const guide = getGuide("hkbn-vs-netvigator");
    assert.ok(guide);
    assert.equal(guide.category, "fiber");
    assert.equal(guide.h1, "香港寬頻 vs 網上行：月費、計劃同公司比較");
    assert.equal(guide.seoTitle, "香港寬頻 vs 網上行月費比較｜1000M／2500M 計劃｜齊Quote");
    assert.equal(
      guide.description,
      "用站內可見例子，按公居屋、私樓、村屋對香港寬頻同網上行嘅 1000M／2500M 參考月費、合約同公司分別。價錢同覆蓋以電訊商確認為準。",
    );
    assert.equal(
      guide.excerpt,
      "同一句 1000M，兩間喺公居屋、私樓、村屋見到嘅月費同合約都可以唔同。下面用站內可見例子分開睇。",
    );
    assert.equal(guide.published, "2026-11-10");
    assert.equal(sitemapLastmod("/guides/hkbn-vs-netvigator"), "2026-11-10");
    assert.equal(guide.plansOnlyCta, true);
    assert.equal(guide.cta, undefined);
    assert.equal(guide.plans?.length, 1);
    assert.equal(guide.plans?.[0]?.href, "/plans?cat=broadband");
    assert.equal(guide.plans?.[0]?.label, "按樓類睇光纖計劃");
    assert.deepEqual(guide.estates, []);

    const cite =
      "網上行係 HKT 家居寬頻品牌。全站（各電訊商）光纖參考：公居屋約 HK$58–98／月、私樓約 HK$88–109／月、村屋由 HK$218／月起（中國移動香港村屋 1000M、24 個月）。呢條中國移動香港計劃唔屬呢篇兩間比較。2026 年 11 月站內可見，呢篇只比較香港寬頻同網上行：公居屋／私樓 1000M 香港寬頻約 HK$98／月（24 或 36 個月）、網上行約 HK$108／月（36 個月＋路由器）；村屋係另一套，網上行村屋 1000M 約 HK$278／月，香港寬頻特選村屋 2000M 約 HK$229／月（1000M 村屋例子約 HK$378／月）。HK$108 只係網上行公居屋／私樓 1000M 例子，唔係全站私樓參考；HK$229 只係香港寬頻特選村屋 2000M 例子，唔係全站村屋起步價。月費、覆蓋同安裝以電訊商確認為準。";
    assert.equal(guide.answer?.lead.length, 0);
    assert.equal(guide.answer?.cite, cite);
    assert.match(guide.answer?.cite ?? "", /村屋由 HK\$218／月起/);
    assert.match(guide.answer?.cite ?? "", /呢條中國移動香港計劃唔屬呢篇兩間比較/);
    assert.match(guide.answer?.afterCite?.[0] ?? "", /^你想對香港寬頻同網上行/);

    const table = guide.answer?.table;
    assert.ok(table);
    assert.deepEqual(table.headers, ["樓類／速率", "香港寬頻（站內可見例子）", "網上行（站內可見例子）"]);
    assert.equal(table.rows.length, 5);
    assert.equal(table.rows[1]?.[2], "約 HK$108／月（36 個月＋路由器）；綑綁方案約 HK$186–198／月");
    assert.match(table.rows[4]?.[1] ?? "", /特選 2000M 約 HK\$229／月/);
    assert.match(table.rows[4]?.[1] ?? "", /1000M 約 HK\$378／月/);
    assert.match(table.rows[4]?.[2] ?? "", /1000M 約 HK\$278／月/);
    assert.match(table.notes?.[0] ?? "", /\/plans\?cat=broadband&provider=hkbn/);
    assert.match(table.notes?.[0] ?? "", /\/plans\?cat=broadband&provider=netvigator/);

    const page = JSON.stringify(guide);
    const headToHead = page
      .replace(guide.answer?.cite ?? "", "")
      .replace(guide.answerEn?.cite ?? "", "");
    for (const href of [
      "/guides/fiber",
      "/guides/public-hos-fees",
      "/guides/private-1000-fees",
      "/guides/village",
      "/guides/village-fees",
      "/guides/1000m-or-2500m",
      "/guides/contract-fees",
      "/plans?cat=broadband",
    ]) {
      assert.equal(page.includes(href), true, href);
    }
    assert.equal(page.includes("最平"), false);
    assert.equal(page.includes("村屋由 HK$229"), false);
    assert.equal(page.includes("HK$229／月起"), false);
    assert.equal(headToHead.includes("HK$58–98"), false);
    assert.equal(headToHead.includes("HK$88–109"), false);
    assert.equal(JSON.stringify(table).includes("HK$58–98"), false);
    assert.equal(JSON.stringify(table).includes("HK$88–109"), false);
    assert.equal(JSON.stringify(table).includes("中國移動"), false);
    assert.equal(page.includes("118"), false);
    assert.equal(page.includes("六大電訊"), false);
    assert.equal(page.includes("HGC"), false);
    assert.equal(page.includes("有線"), false);
    assert.equal(page.includes("數碼通"), false);

    assert.deepEqual(
      guide.body.map((section) => section.heading),
      ["點樣睇呢張表", "月費比較", "計劃比較", "公司比較", "下一步：按樓類睇光纖計劃"],
    );
    assert.equal(
      GUIDES.filter((item) => item.category === "fiber").some((item) => item.slug === "hkbn-vs-netvigator"),
      true,
    );
    assert.equal(
      SITEMAP_PAGES.some((item) => item.path === "/guides/hkbn-vs-netvigator"),
      true,
    );

    const route = readFileSync(join(here, "../routes/guides_.$slug.tsx"), "utf8");
    const citeAt = route.indexOf("copy.answer.cite");
    const afterAt = route.indexOf("copy.answer.afterCite");
    const tableAt = route.indexOf("<GuideAnswerTable");
    assert.ok(citeAt > 0 && afterAt > citeAt && tableAt > afterAt);
    assert.match(route, /guide\.plansOnlyCta/);
  });
});

describe("village fibre fee guide", () => {
  it("starts the listed table at CMHK village 1000M HK$218 and keeps HK$229 as the HKBN selected 2000M example", () => {
    const guide = getGuide("village-fees");
    assert.ok(guide);
    assert.equal(
      guide.excerpt,
      "村屋光纖月費係另一套計劃。站內列出由中國移動香港村屋 1000M HK$218／月（24 個月）起，僅供參考。唔好套用公屋／居屋／私樓月費。",
    );
    assert.equal(
      guide.description,
      "2026年10月村屋同丁屋光纖係另一套月費，唔好套用公屋或私樓價。站內列出由中國移動香港村屋 1000M HK$218／月（24 個月）起。可以比較參考計劃，再查你個地址覆蓋。實際安裝以電訊商確認為準。",
    );
    assert.equal(guide.plans?.length, 1);
    assert.equal(guide.plans?.[0]?.href, "/plans?cat=broadband&housing=village");
    assert.equal(guide.plans?.[0]?.label, "村屋光纖計劃");
    assert.ok(guide.cta);

    const table = guide.body[0]?.table;
    assert.ok(table);
    assert.equal(table.rows[0]?.label, "中國移動香港｜村屋 1000M 光纖（24 個月）");
    assert.equal(table.rows[0]?.value, "村屋｜HK$218");
    assert.equal(table.rows[0]?.href, "/plans/cmhk-ftth-1000-village-24m-218");
    assert.equal(table.rows[1]?.label, "香港寬頻｜特選村屋 2000M 光纖（24 個月）");
    assert.equal(table.rows[1]?.value, "村屋｜HK$229");
    assert.equal(table.rows[1]?.href, "/plans/hkbn-village-2000-24m");
    assert.equal(guide.bodyEn[0]?.table?.rows[0]?.href, "/plans/cmhk-ftth-1000-village-24m-218");
    assert.equal(guide.bodyEn[0]?.table?.rows[0]?.value, "Village | HK$218");

    const separate = guide.body.find((section) => section.heading === "點解村屋光纖月費通常分開報");
    assert.equal(
      separate?.paragraphs[0],
      "公屋、居屋好多時有批量合約；村屋、丁屋入線睇條村、條街、井蓋同屋地，所以月費、安裝費、完工期都係另一套。表上由中國移動香港村屋 1000M HK$218／24 個月起。香港寬頻特選村屋 2000M HK$229 係另一行例子，唔等於新界每條村都有。",
    );
    assert.equal(
      guide.faq[0]?.a,
      "村屋光纖站內列出由中國移動香港村屋 1000M HK$218／24 個月起，完整表就係本頁，去到網上行村屋 2500M HK$376／36 個月。香港寬頻特選村屋 2000M 係 HK$229／24 個月，係表上另一個例子，唔係全站村屋起步價。呢啲唔係保證價，亦唔等於你條村一定有。實際以電訊商確認為準。",
    );
    assert.equal(
      guide.faq.find((item) => item.q === "特選村屋計劃係咪每條村都有？")?.a,
      "唔係。香港寬頻特選村屋 2000M HK$229 係特選村屋例子，唔等於新界每條村都有，亦唔係表上起步價。表上由中國移動香港村屋 1000M HK$218／24 個月起。覆蓋以電訊商確認為準。",
    );

    const page = JSON.stringify(guide);
    assert.equal(page.includes("最平"), false);
    assert.equal(page.includes("村屋由 HK$229 起"), false);
    assert.equal(page.includes("表上由 HK$229 起"), false);
    assert.equal(page.includes("由特選村屋 2000M HK$229"), false);
    for (const href of [
      "/plans?cat=broadband&housing=village",
      "/plans?cat=home5g",
      "/guides/village",
      "/guides/village-onsite",
      "/guides/home-broadband-2026",
      "/guides/private-1000-fees",
      "/guides/home5g",
      "/guides/tin-shui-wai",
      "/guides/tseung-kwan-o",
      "/guides/estate-filter",
      "/plans/hkbn-village-2000-24m",
      "/plans/cmhk-ftth-1000-village-24m-218",
    ]) {
      assert.equal(page.includes(href), true, href);
    }
  });
});
