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
      "網上行係 HKT 家居寬頻品牌。2026 年 11 月站內可見，公居屋／私樓 1000M 參考月費分別由香港寬頻約 HK$98／月（24 或 36 個月）同網上行約 HK$108／月（36 個月＋路由器）起；村屋係另一套，網上行 1000M 約 HK$278／月，香港寬頻村屋可見例子由特選 2000M 約 HK$229／月起（1000M 村屋例子約 HK$378／月）。月費、覆蓋同安裝以電訊商確認為準。";
    assert.equal(guide.answer?.lead.length, 0);
    assert.equal(guide.answer?.cite, cite);
    assert.match(guide.answer?.afterCite?.[0] ?? "", /^你想對香港寬頻同網上行/);

    const table = guide.answer?.table;
    assert.ok(table);
    assert.deepEqual(table.headers, ["樓類／速率", "香港寬頻（站內可見例子）", "網上行（站內可見例子）"]);
    assert.equal(table.rows.length, 5);
    assert.equal(table.rows[1]?.[2], "約 HK$108／月（36 個月＋路由器）；綑綁方案約 HK$186–198／月");
    assert.match(table.notes?.[0] ?? "", /\/plans\?cat=broadband&provider=hkbn/);
    assert.match(table.notes?.[0] ?? "", /\/plans\?cat=broadband&provider=netvigator/);

    const page = JSON.stringify(guide);
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
    assert.equal(page.includes("HK$58–98"), false);
    assert.equal(page.includes("HK$88–109"), false);
    assert.equal(page.includes("118"), false);
    assert.equal(page.includes("六大電訊"), false);
    assert.equal(page.includes("HGC"), false);
    assert.equal(page.includes("有線"), false);
    assert.equal(page.includes("數碼通"), false);
    assert.equal(page.includes("中國移動"), false);

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
