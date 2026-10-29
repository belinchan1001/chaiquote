import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "./site.ts";
import { getPlan } from "./plans.ts";
import { HOME_SEO, CATEGORY_SEO, GUIDES_SEO, PLAN_DETAIL_ROUTE_ID, catalogueMonthLabel, canonicalUrlFromMatches } from "./canonical.ts";
import { getGuide } from "./guides.ts";
import { getTechNewsArticle } from "./tech-news.ts";
import { getEstatePage, estateSeoDescription, isIndexableEstatePage } from "./estate-pages.ts";
import { planJsonLd, planPageCanonicalUrl, planSeoDescription, planSeoTitle, renderSitemapXml, siteDataLastmod, sitemapLastmod, SITEMAP_PAGES } from "./seo.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("catalogue stamp", () => {
  it("pins the homepage data stamp to today as YYYY-MM-DD", () => {
    assert.equal(SITE.updated, "2026-10-30");
    assert.match(SITE.updated, /^\d{4}-\d{2}-\d{2}$/);
    assert.doesNotMatch(SITE.updated, /\u5e74|\u6708|\u65e5/);
    assert.equal(siteDataLastmod(), "2026-10-30");
    assert.equal(sitemapLastmod("/"), "2026-10-30");
    assert.equal(sitemapLastmod("/plans"), "2026-10-30");
    assert.equal(sitemapLastmod("/estates"), "2026-10-30");
  });
});

describe("search-first titles", () => {
  it("puts the query before 齊Quote and names the catalogue month", () => {
    assert.equal(catalogueMonthLabel(), "2026年10月");
    assert.equal(HOME_SEO.title, "香港寬頻報價2026｜1000M月費比較｜公屋居屋私樓村屋｜齊Quote");
    assert.match(HOME_SEO.description, /^2026年10月/);
    assert.match(HOME_SEO.description, /查屋苑覆蓋/);
    assert.equal(CATEGORY_SEO.broadband.title, "香港寬頻報價2026｜光纖1000M／2500M月費比較｜齊Quote");
    assert.match(CATEGORY_SEO.broadband.description, /網上行/);
    assert.equal(CATEGORY_SEO.home5g.title, "5G家居寬頻報價｜免拉線月費比較｜齊Quote");
    assert.equal(GUIDES_SEO.title, "寬頻報價攻略｜光纖、村屋同5G家居月費｜齊Quote");
    assert.equal(getGuide("village-fees")?.seoTitle, "村屋寬頻報價｜光纖月費同覆蓋注意｜齊Quote");
    assert.equal(getGuide("tin-shui-wai")?.seoTitle, "天水圍寬頻報價｜公屋／居屋／嘉湖月費比較｜齊Quote");
    assert.equal(getGuide("fiber")?.seoTitle, "香港光纖寬頻報價｜1000M／2500M月費比較｜齊Quote");
    assert.equal(getGuide("private-1000-fees")?.seoTitle, "私樓寬頻報價｜1000M月費比較｜齊Quote");
    assert.equal(getGuide("home-broadband-2026")?.seoTitle, "2026家居寬頻報價｜1000M／2500M月費比較｜齊Quote");
    assert.equal(getGuide("home5g")?.seoTitle, "5G家居寬頻點揀｜免拉線月費同覆蓋注意｜齊Quote");
    assert.equal(
      getTechNewsArticle("iphone-18-handset-plan")?.seoTitle,
      "iPhone 18上台邊間抵？機價折扣＋月費一齊計｜齊Quote",
    );
  });

  it("moves 月費 forward on plan titles and keeps speed, carrier, fee, and housing", () => {
    const hkbn = getPlan("hkbn-ftth-1000-24m-109");
    const smartone = getPlan("smartone-ftth-1000");
    assert.ok(hkbn);
    assert.ok(smartone);
    assert.equal(planSeoTitle(hkbn), "1000M 家居寬頻（24 個月）｜月費 HK$109｜香港寬頻 1000M｜齊Quote");
    assert.equal(planSeoTitle(smartone), "1000M 家居寬頻（36 個月）｜月費 HK$88｜數碼通 1000M｜齊Quote");
    assert.match(planSeoDescription(hkbn), /2026年10月/);
    assert.match(planSeoDescription(hkbn), /公屋、居屋、私樓/);
    assert.match(planSeoDescription(hkbn), /查覆蓋/);
    const ld = planJsonLd(hkbn);
    assert.equal(ld.url, "https://www.chaiquote.hk/plans/hkbn-ftth-1000-24m-109");
    assert.equal(ld.offers.url, ld.url);
    assert.equal(ld.offers.availability, "https://schema.org/InStock");
    assert.equal(ld.offers.priceValidUntil, "2026-10-31");
    assert.equal(ld.offers.hasMerchantReturnPolicy.returnPolicyCategory, "https://schema.org/MerchantReturnNotPermitted");
    assert.equal(ld.offers.shippingDetails.doesNotShip, true);
    assert.equal(ld.sku, hkbn.id);
  });
});

describe("plan document canonical", () => {
  it("self-canonicalises the CMHK village 1000M plan and resolves aliases to one catalogue URL", () => {
    const village = "https://www.chaiquote.hk/plans/cmhk-ftth-1000-village-24m-218";
    assert.equal(planPageCanonicalUrl("cmhk-ftth-1000-village-24m-218"), village);
    assert.equal(planPageCanonicalUrl("csl-5g-20"), "https://www.chaiquote.hk/plans/csl-5g-20-108-24m");
    assert.equal(planPageCanonicalUrl("three-home5g-w6"), null);
    assert.equal(planPageCanonicalUrl("netvigator-ftth-1000-private-36m"), null);
    assert.equal(planPageCanonicalUrl("missing-plan"), null);

    const plan = getPlan("cmhk-ftth-1000-village-24m-218");
    assert.ok(plan);
    const ld = planJsonLd(plan);
    assert.equal(ld.url, village);
    assert.equal(ld.offers.url, village);
    assert.equal(ld.sku, "cmhk-ftth-1000-village-24m-218");

    assert.equal(
      canonicalUrlFromMatches([
        { routeId: "__root__", pathname: "/" },
        { routeId: PLAN_DETAIL_ROUTE_ID, pathname: "/plans/csl-5g-20" },
      ]),
      undefined,
    );
    assert.equal(
      canonicalUrlFromMatches([{ routeId: "/about", pathname: "/about" }]),
      "https://www.chaiquote.hk/about",
    );
  });
});

describe("estate discovery", () => {
  it("lists indexable estates in the static sitemap, including 彩頤居", () => {
    const cheerful = getEstatePage("cheerful-court");
    assert.ok(cheerful);
    assert.equal(isIndexableEstatePage(cheerful), true);
    assert.match(estateSeoDescription(cheerful.estate), /黃大仙/);
    assert.match(estateSeoDescription(cheerful.estate), /指定彩頤居/);
    assert.notEqual(estateSeoDescription(cheerful.estate), estateSeoDescription(getEstatePage("tin-yiu")!.estate));
    const hua = getEstatePage("tin-wah");
    const heng = getEstatePage("tin-heng");
    assert.ok(hua);
    assert.ok(heng);
    assert.notEqual(estateSeoDescription(hua.estate), estateSeoDescription(heng.estate));
    assert.match(SITEMAP_PAGES.map((page) => page.path).join("\n"), /\/estates\/cheerful-court/);
    const file = readFileSync(join(here, "../../public/sitemap.xml"), "utf8");
    assert.equal(file, renderSitemapXml());
    assert.match(file, /\/estates\/cheerful-court/);
  });
});
