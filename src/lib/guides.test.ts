import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FEE_RANGE_ANSWER, FEE_RANGE_QUESTION, SITE } from "./site.ts";
import { getGuide } from "./guides.ts";
import { getPlan } from "./plans.ts";
import { sitemapLastmod } from "./seo.ts";
import { crawlEstateLinksForGuide, guideFooterEstates } from "./estate-pages.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("guide manuscript dates vs catalogue stamp", () => {
  it("keeps guide lastmod on the manuscript date, not SITE.updated", () => {
    assert.equal(SITE.updated, "2026-11-10");
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

describe("2026 six-carrier 1000M table", () => {
  it("keeps Aki's locked monthly bands and renders them as an HTML table", () => {
    const guide = getGuide("home-broadband-2026");
    assert.ok(guide);
    assert.equal(guide.seoTitle, "2026家居寬頻1000M｜六大電訊月費比較｜齊Quote");
    assert.equal(guide.h1, "2026 家居寬頻 1000M：六大電訊商參考月費比較");
    assert.equal(guide.published, "2026-09-12");
    assert.equal(guide.modified, "2026-11-01");
    assert.equal(sitemapLastmod("/guides/home-broadband-2026"), "2026-11-01");
    assert.match(guide.description, /香港寬頻/);
    assert.match(guide.description, /網上行/);
    assert.match(guide.description, /HGC/);
    assert.match(guide.description, /有線寬頻/);
    assert.match(guide.description, /中國移動香港/);
    assert.match(guide.description, /數碼通/);
    assert.match(guide.description, /6309 9966/);
    assert.match(guide.description, /僅供參考/);

    const section = guide.body.find((item) => item.matrix);
    assert.ok(section?.matrix);
    assert.deepEqual(section.matrix.headers, [
      "電訊商",
      "1000M 參考月費範圍",
      "常見合約期",
      "常見適用樓類",
      "亮點",
      "站內入口",
    ]);
    assert.equal(section.matrix.notes?.length, 3);
    assert.equal(guide.body.findIndex((item) => item.matrix) < guide.body.findIndex((item) => item.table), true);

    const dash = "\u2013";
    const expected = [
      ["香港寬頻 HKBN", `約 HK$98${dash}109／月`, "/plans/hkbn-ftth-1000-36m-98"],
      ["網上行／HKT／Netvigator", "約 HK$108／月", "/plans/netvigator-ftth-1000-public-36m-108"],
      ["HGC", `約 HK$75${dash}89／月（私樓常見約 HK$89）`, "/plans/hgc-ftth-1000-public-36m"],
      ["有線寬頻 i-Cable", `約 HK$58${dash}68／月`, "/plans/icable-ftth-1000-48m-58"],
      ["中國移動香港 CMHK", `約 HK$88${dash}98／月`, "/plans/cmhk-ftth-2500"],
      ["數碼通 SmarTone", "約 HK$88／月", "/plans/smartone-ftth-1000"],
    ] as const;

    assert.equal(section.matrix.rows.length, expected.length);
    section.matrix.rows.forEach((row, index) => {
      const [carrier, fee, href] = expected[index]!;
      assert.equal(row.length, 6);
      assert.equal(row[0], carrier);
      assert.equal(row[1], fee);
      assert.match(row[5]!, new RegExp(href.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")));
      assert.equal(row[1]!.includes("118"), false);
      assert.equal(row[1]!.includes("快閃"), false);
      assert.ok(getPlan(href.slice("/plans/".length)));
    });

    const page = JSON.stringify(guide);
    assert.equal(page.includes("保證最平"), false);
    assert.match(page, /6309 9966/);
    assert.match(page, /本網站並沒有向任何電訊商收取佣金或廣告費/);
    assert.equal(guide.faq?.length, 8);
    assert.equal(guide.faq?.[0]?.q, "香港寬頻月費大概幾錢？有冇一條適用全港嘅價？");
    assert.match(guide.faq?.[0]?.a ?? "", /冇一條適用所有地區、所有樓類嘅單一參考月費/);
    assert.equal((guide.faq?.[0]?.a ?? "").includes("最平"), false);
    assert.equal((guide.faq?.[0]?.a ?? "").includes("最抵"), false);

    const route = readFileSync(join(here, "../routes/guides_.$slug.tsx"), "utf8");
    assert.match(route, /<table/);
    assert.match(route, /section\.matrix/);
  });
});

describe("fiber guide sample rewrite", () => {
  it("leads with the Geo cite and housing table, then a short human body", () => {
    const guide = getGuide("fiber");
    assert.ok(guide);
    assert.equal(guide.h1, "香港光纖點揀：先分樓類，再睇月費");
    assert.equal(guide.plansOnlyCta, true);
    assert.equal(guide.plans?.length, 1);
    assert.equal(guide.plans?.[0]?.href, "/plans?cat=broadband");
    assert.equal(guide.plans?.[0]?.label, "按樓類睇光纖計劃");
    assert.equal(guide.cta, undefined);

    const cite = guide.answer?.cite ?? "";
    assert.match(cite, /香港光纖冇全港劃一價/);
    assert.match(cite, /HK\$58–98／月/);
    assert.match(cite, /HK\$88–109／月/);
    assert.match(cite, /HK\$218／月起/);
    assert.equal(cite.includes(FEE_RANGE_ANSWER.replace("{date}", SITE.updated)), false);

    const table = guide.answer?.table;
    assert.ok(table);
    assert.deepEqual(table.headers, ["樓類", "1000M 參考月費", "備註"]);
    assert.equal(table.rows.length, 3);
    assert.match(table.rows[0][0], /公屋／居屋/);
    assert.match(table.rows[0][0], /\/guides\/public-hos-fees/);
    assert.equal(table.rows[0][1], "約 HK$58–98／月");
    assert.match(table.rows[0][2], /\$58 起（48 個月）/);
    assert.equal(table.rows[1][1], "約 HK$88–109／月");
    assert.match(table.rows[1][0], /\/guides\/private-1000-fees/);
    assert.equal(table.rows[2][1], "約 HK$218／月起");
    assert.match(table.rows[2][0], /\/guides\/village-fees/);
    assert.match(table.rows[2][2], /唔好套公屋／私樓價/);

    assert.deepEqual(
      guide.body.map((section) => section.heading),
      [
        "點解要先分樓類",
        "公屋、居屋、私樓、村屋點睇",
        "1000M 定 2500M",
        "轉台前問清楚四件事",
        "下一步：對自己地址格價",
      ],
    );
    const housing = guide.body[1];
    assert.deepEqual(
      housing?.flow
        ?.filter((block) => block.kind === "h3")
        .map((block) => (block.kind === "h3" ? block.text : "")),
      ["公屋／居屋", "私樓", "村屋／丁屋"],
    );
    const page = JSON.stringify(guide.body) + (guide.disclaimer ?? "");
    assert.match(page, /HK\$218–229／月/);
    assert.match(page, /HK\$376／月/);
    assert.match(page, /\/guides\/1000m-or-2500m/);
    assert.match(page, /\/guides\/home-broadband-2026/);
    assert.equal(page.includes("保證最平"), false);
    const lead = (guide.answer?.lead ?? []).join("\n");
    const leadEn = (guide.answerEn?.lead ?? []).join("\n");
    assert.match(lead, /先分樓類/);
    assert.doesNotMatch(lead, /HK\$58|88–109|HK\$218/);
    assert.match(leadEn, /housing type/);
    assert.doesNotMatch(leadEn, /HK\$58|88–109|HK\$218/);
    assert.equal(guide.answer?.lead.length, 1);
    assert.equal(guide.answerEn?.lead.length, 1);

    assert.doesNotMatch(guide.disclaimer ?? "", /2026-11-08|資料更新/);
    assert.match(guide.disclaimer ?? "", /無向電訊商收取佣金或廣告費/);
    assert.doesNotMatch(guide.disclaimerEn ?? "", /2026-11-08|marked updated/);
    assert.match(guide.disclaimerEn ?? "", /does not take commission/);

    assert.equal(guide.faq?.[0]?.q, "香港光纖有冇一條全港劃一價？");
    assert.notEqual(guide.faq?.[0]?.q, FEE_RANGE_QUESTION);
    assert.match(guide.faq?.[0]?.a ?? "", /^冇。/);
    assert.equal((guide.faq?.[0]?.a ?? "").includes("5G 家居約"), false);
    assert.equal(guide.faq?.length, 6);

    const chips = guideFooterEstates(guide.slug, guide.estates, "zh", guide.estateChipLimit);
    assert.ok(chips.length <= (guide.estateChipLimit ?? 0));
    assert.ok(crawlEstateLinksForGuide("fiber").length > chips.length);
    assert.equal(
      chips.some((item) => item.href === "/estates"),
      false,
    );
    assert.deepEqual(
      chips.map((item) => item.href),
      ["/estates/tin-yiu", "/estates/taikoo-shing"],
    );

    const route = readFileSync(join(here, "../routes/guides_.$slug.tsx"), "utf8");
    const answerAt = route.indexOf("copy.answer.cite");
    const tocAt = route.indexOf("<GuideToc");
    const bodyAt = route.indexOf("{copy.body.map((section)");
    const endAt = route.indexOf('id="guide-end-cta"');
    const relatedAt = route.indexOf('id="guide-related-heading"');
    assert.ok(answerAt > 0 && tocAt > answerAt && bodyAt > tocAt);
    assert.ok(endAt > bodyAt && relatedAt > endAt);
    assert.match(route, /data-answer-led/);
    assert.match(route, /id="guide-answer-table"/);
    assert.match(route, /lg:grid-cols-\[minmax\(0,36rem\)_14rem\]/);
    assert.match(route, /guide-inline-link/);
    assert.doesNotMatch(route, /answerLed \? <GuideTopicPicture/);
    assert.match(route, /guide\.plansOnlyCta/);
    assert.match(route, /睇更多屋苑/);
    assert.doesNotMatch(route, /variant="whatsapp"[\s\S]{0,400}plansOnlyCta/);

    const css = readFileSync(join(here, "../styles.css"), "utf8");
    assert.match(css, /body:has\(\[data-answer-led\]\) \.header-strip/);
    assert.match(css, /\.guide-inline-link/);
    assert.match(css, /guide-fab:not\(\.is-corner-clear\)/);
    const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
    assert.match(header, /header-strip/);
    assert.match(header, /t\("headerStrip", \{ date: updated \}\)/);

    const widget = readFileSync(join(here, "../components/whatsapp-widget.tsx"), "utf8");
    assert.match(widget, /guide-answer-table/);
    assert.match(widget, /guide-end-cta/);
    assert.match(widget, /guide-hub-fiber/);
    assert.match(widget, /is-corner-clear/);
    assert.match(widget, /trackWaClick\(/);

    const tip = readFileSync(join(here, "../components/pwa-install-tip.tsx"), "utf8");
    assert.match(tip, /guides\\\/fiber/);
    assert.match(tip, /relative z-0 mx-auto/);
    const root = readFileSync(join(here, "../routes/__root.tsx"), "utf8");
    const tipAt = root.indexOf("<PwaInstallTip");
    const footerAt = root.indexOf("<SiteFooter");
    assert.ok(tipAt > 0 && footerAt > tipAt);

    const hub = readFileSync(join(here, "../routes/guides.tsx"), "utf8");
    assert.match(hub, /cat\.id === "fiber"/);
    assert.match(hub, /id=\{featured \? "guide-hub-fiber" : undefined\}/);
    assert.match(hub, /data-guide-fab-clear/);
    assert.match(hub, /md:col-span-3/);
    assert.match(hub, /photo-strip photo-strip-tile/);
    assert.match(hub, /t\("readGuide"\)/);
    assert.match(hub, /t\("dataUpdated"/);
    assert.doesNotMatch(hub, /goCompare|manuscriptUpdated|to="\/plans"/);
  });
});

describe("fibre vs 5G home comparison", () => {
  it("keeps the lead and adds the 2026-11-05 entry table", () => {
    const guide = getGuide("fiber-vs-5g");
    assert.ok(guide);
    assert.equal(guide.excerpt, "可以拉光纖就優先光纖。拉唔到或者村屋未有線，先睇 5G 家居。");
    assert.match(guide.body[0]?.paragraphs[0] ?? "", /^可以拉光纖就優先光纖。拉唔到或者村屋未有線，先睇 5G 家居。/);
    assert.equal(guide.modified, "2026-11-05");
    assert.equal(sitemapLastmod("/guides/fiber-vs-5g"), "2026-11-05");
    const matrix = guide.body[0]?.matrix;
    assert.ok(matrix);
    assert.deepEqual(matrix.headers, ["項目", "光纖入屋", "5G 家居寬頻"]);
    assert.equal(matrix.rows.length, 7);
    assert.match(matrix.rows[3]?.[1] ?? "", /HK\$58／月起/);
    assert.match(matrix.rows[3]?.[1] ?? "", /icable-ftth-1000-48m-58/);
    assert.match(matrix.rows[3]?.[2] ?? "", /HK\$88／月起/);
    assert.match(matrix.rows[3]?.[2] ?? "", /cmhk-home5g-350-48-88/);
    assert.match(matrix.rows[5]?.[1] ?? "", /HK\$218／月起/);
    assert.match(matrix.rows[5]?.[1] ?? "", /cmhk-ftth-1000-village-24m-218/);
    assert.equal((matrix.rows[5]?.[1] ?? "").includes("229"), false);
    assert.equal(guide.faq?.length, 3);
    assert.match(guide.faq?.[2]?.a ?? "", /HK\$218／月起/);
    for (const id of ["icable-ftth-1000-48m-58", "cmhk-home5g-350-48-88", "cmhk-ftth-1000-village-24m-218"] as const) {
      assert.ok(getPlan(id), id);
    }
    assert.match(JSON.stringify(guide.body), /cmhk-home5g-350-48-88/);
  });
});
