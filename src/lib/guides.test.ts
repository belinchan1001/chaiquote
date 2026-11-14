import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FEE_RANGE_ANSWER, FEE_RANGE_QUESTION, SITE } from "./site.ts";
import { getGuide, guidePlainText } from "./guides.ts";
import { getPlan } from "./plans.ts";
import { sitemapLastmod } from "./seo.ts";
import { crawlEstateLinksForGuide, guideFooterEstates } from "./estate-pages.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("guide manuscript dates vs catalogue stamp", () => {
  it("keeps guide lastmod on the manuscript date, not SITE.updated", () => {
    assert.equal(SITE.updated, "2026-11-14");
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

describe("village guide cite", () => {
  const opening =
    "村屋光纖站內由[中國移動香港村屋 1000M](/plans/cmhk-ftth-1000-village-24m-218) HK$218／24 個月起，唔好用私樓或公屋價。有冇線睇條村、條街，列出嘅月費係參考例子。完整表見 [村屋光纖月費](/guides/village-fees)。";
  const cite =
    "村屋光纖站內由中國移動香港村屋 1000M HK$218／24 個月起，唔好用太古城、嘉湖或公屋價去估。有冇線睇條村、條街，列出嘅月費係參考例子。覆蓋要填完整地址。";
  const who = "站內村屋光纖包括中國移動香港、香港寬頻、網上行同 HGC。有線同數碼通嘅家居光纖計劃唔適用村屋。";
  const fees =
    "站內村屋光纖由[中國移動香港村屋 1000M](/plans/cmhk-ftth-1000-village-24m-218)（24 個月）HK$218 起。香港寬頻特選村屋 2000M（24 個月）HK$229。網上行村屋 1000M（24 個月）HK$278。HGC 村屋 1G 連電話（24 個月）HK$319。完整表見 [村屋光纖月費](/guides/village-fees)。";

  it("locks the opening, meta cite, and fee examples on CMHK village 1000M HK$218", () => {
    const guide = getGuide("village");
    assert.ok(guide);
    assert.equal(guide.h1, "村屋光纖點算：邊間有、幾多錢");
    assert.equal(guide.excerpt, opening);
    assert.equal(guide.description, cite);
    assert.equal(guide.body[0]?.paragraphs[0], who);
    assert.equal(
      guide.body[0]?.paragraphs[1],
      "有冇線睇條村、條街，甚至左右鄰。下面月費係站內列出嘅參考，唔等於新界每條村都裝到。",
    );
    assert.equal(guide.body[1]?.paragraphs[0], fees);
    assert.equal(
      guide.excerptEn,
      "Village fibre on this site starts at [CMHK village 1000M](/plans/cmhk-ftth-1000-village-24m-218), HK$218 for 24 months. Do not reuse a private-estate or public-housing fee. A line depends on the village and the street; listed fees are examples. Full table: [village fibre fees](/guides/village-fees).",
    );
    assert.equal(
      guide.descriptionEn,
      "Village fibre on this site starts at CMHK village 1000M, HK$218 for 24 months. Do not reuse Taikoo Shing, Kingswood or public-housing fees. Coverage needs the full address. Listed fees are examples, not a promise for every village.",
    );
    assert.equal(
      guide.bodyEn[0]?.paragraphs[0],
      "Village fibre on this site includes CMHK, HKBN, Netvigator and HGC. i-Cable and SmarTone home-fibre plans are not for village houses.",
    );
    assert.equal(
      guide.bodyEn[1]?.paragraphs[0],
      "Sitewide village fibre starts at [CMHK village 1000M](/plans/cmhk-ftth-1000-village-24m-218) (24 months), HK$218. HKBN selected village 2000M (24 months) is HK$229. Netvigator village 1000M (24 months) is HK$278. HGC village 1G with a phone line (24 months) is HK$319. Full table: [village fibre fees](/guides/village-fees).",
    );
    assert.equal(guidePlainText(opening).includes("["), false);
    assert.match(guidePlainText(opening), /中國移動香港村屋 1000M HK\$218／24 個月起/);
    assert.equal(sitemapLastmod("/guides/village"), "2026-11-14");

    const blob = [
      guide.excerpt,
      guide.description,
      guide.excerptEn,
      guide.descriptionEn ?? "",
      ...guide.body.flatMap((section) => section.paragraphs),
      ...guide.bodyEn.flatMap((section) => section.paragraphs),
      ...(guide.faq ?? []).flatMap((item) => [item.q, item.a]),
      ...(guide.faqEn ?? []).flatMap((item) => [item.q, item.a]),
    ].join("\n");
    for (const phrase of [
      "只得三間",
      "只得香港寬頻",
      "由 HK$229 起",
      "特選村屋由 HK$229",
      "中國移動、數碼通",
      "中國移動唔適用",
      "最平",
      "only HKBN",
      "i-Cable, CMHK",
      "CMHK and SmarTone",
      "from HK$229",
      "starts at HK$229",
      "Listed plans start at HK$229",
    ]) {
      assert.equal(blob.includes(phrase), false, phrase);
    }
    assert.doesNotMatch(blob, /中國移動[^。\n]{0,16}唔適用/);
    assert.equal((fees.match(/HK\$229/g) ?? []).length, 1);
    assert.match(opening, /\/plans\/cmhk-ftth-1000-village-24m-218/);
    assert.match(opening, /\/guides\/village-fees/);
    assert.match(fees, /\/plans\/cmhk-ftth-1000-village-24m-218/);
    assert.match(fees, /\/guides\/village-fees/);
    assert.deepEqual(
      guide.plans?.map((item) => item.href),
      ["/plans?cat=broadband&housing=village", "/plans?cat=home5g"],
    );
    assert.equal(guide.cta, undefined);
    assert.equal(guide.plansOnlyCta, undefined);

    const page = readFileSync(join(here, "../routes/guides_.$slug.tsx"), "utf8");
    const index = readFileSync(join(here, "../routes/guides.tsx"), "utf8");
    assert.match(page, /<GuideRichText text=\{copy\.excerpt\} \/>/);
    assert.match(index, /guidePlainText\(copy\?\.excerpt \?\? ""\)/);
    assert.match(index, /guidePlainText\(copy\.excerpt\)/);

    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const hero = messages.match(/heroTitle1:\s*"([^"]+)"/);
    assert.equal(hero?.[1], "搵寬頻唔使四圍問");
    assert.equal(hero?.[1]?.codePointAt(0), 0x6435);
  });
});
