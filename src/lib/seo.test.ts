import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hongKongCalendarDate } from "./catalogue-date.ts";
import { contentLastmod } from "./content-lastmod.ts";
import { MESSAGES } from "./messages.ts";
import {
  CATALOGUE_CONTENT_STAMP,
  FEE_RANGE_ANSWER,
  HOME_CONTENT_DATE,
  INDEPENDENT_BODY,
  PLANS_LISTING_COPY_DATE,
  PRIVACY_UPDATED,
  SITE,
  fillSiteTemplate,
  plansBroadbandLead,
} from "./site.ts";
import { filterPlans } from "./plan-filter.ts";
import { getPlan } from "./plans.ts";
import { HOME_SEO, CATEGORY_SEO, GUIDES_SEO, PLAN_DETAIL_ROUTE_ID, catalogueMonthLabel, canonicalUrlFromMatches } from "./canonical.ts";
import { getGuide } from "./guides.ts";
import { getTechNewsArticle } from "./tech-news.ts";
import { getEstatePage, estateSeoDescription, isIndexableEstatePage } from "./estate-pages.ts";
import {
  AI_CITATION_USER_AGENTS,
  BLOCKED_SCRAPER_USER_AGENTS,
  categoryJsonLd,
  planJsonLd,
  planPageCanonicalUrl,
  planSeoDescription,
  planSeoTitle,
  renderRobotsTxt,
  renderSitemapXml,
  siteDataLastmod,
  sitemapLastmod,
  SITEMAP_PAGES,
} from "./seo.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("catalogue stamp", () => {
  it("keeps the clock off sitemap lastmod and uses each URL's content date", () => {
    assert.equal(hongKongCalendarDate(new Date("2026-11-19T15:59:59.000Z")), "2026-11-19");
    assert.equal(hongKongCalendarDate(new Date("2026-11-19T16:00:00.000Z")), "2026-11-20");
    assert.equal(hongKongCalendarDate(new Date("2026-12-31T16:00:00.000Z")), "2027-01-01");
    assert.equal(SITE.updated, hongKongCalendarDate());
    assert.match(SITE.updated, /^\d{4}-\d{2}-\d{2}$/);
    assert.doesNotMatch(SITE.updated, /\u5e74|\u6708|\u65e5/);
    assert.equal(CATALOGUE_CONTENT_STAMP, "2026-11-14");
    assert.equal(PRIVACY_UPDATED, "2026-11-14");
    assert.equal(siteDataLastmod(), "2026-11-14");
    assert.equal(sitemapLastmod("/"), HOME_CONTENT_DATE);
    assert.equal(contentLastmod("/"), HOME_CONTENT_DATE);
    assert.equal(sitemapLastmod("/plans?cat=broadband"), contentLastmod("/plans?cat=broadband"));
    assert.equal(sitemapLastmod("/plans"), sitemapLastmod("/plans?cat=broadband"));
    assert.equal(sitemapLastmod("/estates"), "2026-11-14");
    assert.equal(sitemapLastmod("/estates/cheerful-court"), "2026-11-20");
    assert.equal(sitemapLastmod("/privacy"), "2026-11-14");
    assert.equal(sitemapLastmod("/new-intake"), "2026-11-22");
    assert.equal(sitemapLastmod("/tech-news"), "2026-11-26");
    const switched = getGuide("switch-broadband");
    assert.ok(switched);
    assert.equal(switched.published, "2026-09-09");
    assert.equal(switched.modified, "2026-11-20");
    assert.equal(sitemapLastmod("/guides/switch-broadband"), "2026-11-20");
    assert.equal(contentLastmod("/guides/switch-broadband"), switched.modified);
    if (SITE.updated !== HOME_CONTENT_DATE) {
      assert.notEqual(sitemapLastmod("/"), SITE.updated);
      assert.notEqual(sitemapLastmod("/guides/switch-broadband"), SITE.updated);
    }
    const listed = filterPlans({ cat: "broadband" });
    const graph = categoryJsonLd("broadband")["@graph"] as { "@type": string; numberOfItems?: number }[];
    const list = graph.find((node) => node["@type"] === "ItemList");
    assert.equal(list?.numberOfItems, listed.length);
    assert.equal(listed.some((plan) => plan.id === "icable-ftth-1000-36m-58-flash"), false);
    assert.equal(listed.some((plan) => plan.id === "cmhk-ftth-1000-36m-98-1111"), false);
    assert.equal(listed.some((plan) => plan.id === "cmhk-ftth-2500-24m-148-1111"), false);
    const privacy = readFileSync(join(here, "../routes/privacy.tsx"), "utf8");
    assert.match(privacy, /date: PRIVACY_UPDATED/);
    assert.doesNotMatch(privacy, /date: updated/);
  });

  it("puts header, footer, homepage, and directory 資料更新 on the Hong Kong day, not sitemap lastmod", () => {
    const beforeMidnight = hongKongCalendarDate(new Date("2026-11-19T15:59:59.000Z"));
    const afterMidnight = hongKongCalendarDate(new Date("2026-11-19T16:00:00.000Z"));
    const newYear = hongKongCalendarDate(new Date("2026-12-31T16:00:00.000Z"));
    assert.equal(beforeMidnight, "2026-11-19");
    assert.equal(afterMidnight, "2026-11-20");
    assert.equal(newYear, "2027-01-01");
    assert.equal(SITE.updated, hongKongCalendarDate());
    assert.notEqual(afterMidnight, HOME_CONTENT_DATE);
    assert.notEqual(newYear, PLANS_LISTING_COPY_DATE.broadband);

    assert.equal(MESSAGES.zh.headerStrip.replaceAll("{date}", afterMidnight), "資料更新：2026-11-20");
    assert.equal(MESSAGES.zh.headerStrip.replaceAll("{date}", beforeMidnight), "資料更新：2026-11-19");
    assert.equal(MESSAGES.en.headerStrip.replaceAll("{date}", newYear), "Data updated: 2027-01-01");
    assert.equal(`${MESSAGES.zh.updatedPrefix}${afterMidnight}`, "資料更新：2026-11-20");
    assert.equal(`${MESSAGES.en.updatedPrefix}${afterMidnight}`, "Data updated: 2026-11-20");
    assert.equal(MESSAGES.zh.dataUpdated.replaceAll("{date}", afterMidnight), "資料更新 2026-11-20");
    assert.equal(MESSAGES.en.dataUpdated.replaceAll("{date}", afterMidnight), "Data updated 2026-11-20");
    assert.equal(MESSAGES.zh.hkUpdated.replaceAll("{date}", newYear), "香港 · 資料更新 2027-01-01");
    assert.match(MESSAGES.zh.heroAnswer, /\{date\} 目錄入面/);
    assert.equal(MESSAGES.zh.heroTitle1, "搵寬頻唔使四圍問");
    assert.equal("搵".codePointAt(0), 0x6435);

    const visibleLead = plansBroadbandLead("zh", afterMidnight);
    const contentLead = plansBroadbandLead("zh");
    assert.equal(contentLead.includes(PLANS_LISTING_COPY_DATE.broadband), true);
    assert.match(visibleLead, /（資料更新 2026-11-20）/);
    assert.equal(visibleLead.replaceAll(afterMidnight, PLANS_LISTING_COPY_DATE.broadband), contentLead);
    assert.match(
      visibleLead,
      /村屋由指定地址優惠 HK\$218／月起（中國移動香港村屋 1000M、24 個月，豁免安裝費原價 HK\$680），唔等於所有村屋都係呢個價；同系列正價為 HK\$378。/,
    );
    const visibleEn = plansBroadbandLead("en", newYear);
    assert.match(visibleEn, /\(updated 2027-01-01\)/);
    assert.equal(visibleEn.replaceAll(newYear, PLANS_LISTING_COPY_DATE.broadband), plansBroadbandLead("en"));

    assert.match(fillSiteTemplate(INDEPENDENT_BODY), new RegExp(`資料更新 ${HOME_CONTENT_DATE}`));
    assert.match(fillSiteTemplate(FEE_RANGE_ANSWER), new RegExp(`資料更新 ${HOME_CONTENT_DATE}`));
    assert.doesNotMatch(fillSiteTemplate(INDEPENDENT_BODY), /2026-11-20|2027-01-01/);
    assert.doesNotMatch(fillSiteTemplate(FEE_RANGE_ANSWER), /2026-11-20|2027-01-01/);

    const i18n = readFileSync(join(here, "i18n.tsx"), "utf8");
    const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
    const footer = readFileSync(join(here, "../components/site-footer.tsx"), "utf8");
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    const plans = readFileSync(join(here, "../routes/plans.tsx"), "utf8");
    const estates = readFileSync(join(here, "../routes/estates.tsx"), "utf8");
    const estatePage = readFileSync(join(here, "../routes/estates_.$slug.tsx"), "utf8");
    assert.match(i18n, /get updated\(\) \{\s*return SITE\.updated;\s*\}/);
    assert.doesNotMatch(i18n, /contentLastmod\(/);
    assert.match(header, /t\("headerStrip", \{ date: updated \}\)/);
    assert.match(footer, /t\("updatedPrefix"\)\}\s*\{updated\}/);
    const hero = home.slice(home.indexOf('t("heroAnswer"'), home.indexOf('t("faqTitle")'));
    assert.match(hero, /date: updated/);
    const faq = home.slice(home.indexOf('t("faqTitle")'));
    assert.match(faq, /date: HOME_CONTENT_DATE/);
    assert.doesNotMatch(faq, /date: updated/);
    assert.match(plans, /plansBroadbandHero\(locale, updated\)/);
    assert.doesNotMatch(plans, /plansBroadbandHero\(locale,\s*(contentLastmod|HOME_CONTENT_DATE|PLANS_LISTING_COPY_DATE)/);
    assert.match(plans, /t\("dataUpdated", \{ date: updated \}\)/);
    assert.match(plans, /t\("broadbandHubSummary", \{\s*date: updated/);
    assert.match(estates, /t\("dataUpdated", \{ date: updated \}\)/);
    assert.match(estatePage, /t\("dataUpdated", \{ date: updated \}\)/);
    const planPage = readFileSync(join(here, "../routes/plans_.$planId.tsx"), "utf8");
    assert.match(planPage, /contentLastmod\(`\/plans\/\$\{plan\.id\}`\)/);
    assert.doesNotMatch(planPage, /As of \$\{updated\}/);

    assert.equal(sitemapLastmod("/"), HOME_CONTENT_DATE);
    assert.notEqual(sitemapLastmod("/"), newYear);
    assert.equal(sitemapLastmod("/plans?cat=broadband"), contentLastmod("/plans?cat=broadband"));
    assert.notEqual(sitemapLastmod("/plans?cat=broadband"), newYear);
    assert.equal(sitemapLastmod("/privacy"), PRIVACY_UPDATED);
    assert.equal(sitemapLastmod("/guides/switch-broadband"), "2026-11-20");
    const news = getTechNewsArticle("iphone-18-handset-plan");
    assert.ok(news?.published);
    assert.equal(sitemapLastmod(`/tech-news/${news.slug}`), news.published);
    assert.notEqual(news.published, newYear);
    const xml = renderSitemapXml();
    assert.equal(xml.includes("<lastmod>2027-01-01</lastmod>"), false);
    const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
    assert.ok(lastmods.length > 20);
    assert.equal(lastmods.every((value) => value === newYear), false);
    assert.equal(lastmods.includes(HOME_CONTENT_DATE), true);
  });
});

describe("search-first titles", () => {
  it("puts the query before 齊Quote and names the catalogue month", () => {
    assert.equal(catalogueMonthLabel(), catalogueMonthLabel(hongKongCalendarDate()));
    assert.equal(HOME_SEO.title, "香港寬頻報價2026｜1000M月費比較｜公屋居屋私樓村屋｜齊Quote");
    assert.match(HOME_SEO.description, new RegExp(`^${catalogueMonthLabel()}`));
    assert.match(HOME_SEO.description, /查屋苑覆蓋/);
    assert.equal(CATEGORY_SEO.broadband.title, "香港光纖寬頻報價比較｜齊Quote");
    assert.equal(CATEGORY_SEO.broadband.description, plansBroadbandLead("zh"));
    assert.match(CATEGORY_SEO.broadband.description, new RegExp(`（資料更新 ${contentLastmod("/plans?cat=broadband")}）`));
    assert.equal(plansBroadbandLead("zh"), plansBroadbandLead("zh", PLANS_LISTING_COPY_DATE.broadband));
    assert.doesNotMatch(CATEGORY_SEO.broadband.title + CATEGORY_SEO.broadband.description, /最平|最抵|最低|全港最平/);
    assert.equal(CATEGORY_SEO.home5g.title, "5G家居寬頻報價｜免拉線月費比較｜齊Quote");
    assert.equal(GUIDES_SEO.title, "寬頻報價攻略｜光纖、村屋同5G家居月費｜齊Quote");
    assert.equal(getGuide("village-fees")?.seoTitle, "村屋寬頻報價｜光纖月費同覆蓋注意｜齊Quote");
    assert.equal(getGuide("tin-shui-wai")?.seoTitle, "天水圍寬頻報價｜公屋／居屋／嘉湖月費比較｜齊Quote");
    assert.equal(getGuide("fiber")?.seoTitle, "香港光纖點揀｜公屋居屋私樓村屋＋1000M月費｜齊Quote");
    assert.equal(getGuide("private-1000-fees")?.seoTitle, "私樓寬頻報價｜1000M月費比較｜齊Quote");
    assert.equal(getGuide("home-broadband-2026")?.seoTitle, "2026家居寬頻1000M｜六大電訊月費比較｜齊Quote");
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
    assert.match(planSeoDescription(hkbn), new RegExp(catalogueMonthLabel()));
    assert.match(planSeoDescription(hkbn), /公屋、居屋、私樓/);
    assert.match(planSeoDescription(hkbn), /查覆蓋/);
    const ld = planJsonLd(hkbn);
    assert.equal(ld.url, "https://www.chaiquote.hk/plans/hkbn-ftth-1000-24m-109");
    assert.equal(ld.offers.url, ld.url);
    assert.equal(ld.offers.availability, "https://schema.org/InStock");
    assert.equal(ld.offers.priceValidUntil, "2026-11-30");
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

function robotsGroupBody(robots: string, agent: string): string {
  const body = robots.split(`User-agent: ${agent}\n`)[1] ?? "";
  return body.split(/\n(?:User-agent: |Sitemap: )/)[0] ?? "";
}

describe("robots.txt", () => {
  it("lets citation bots read public pages and still blocks scrapers and private paths", () => {
    const robots = renderRobotsTxt();
    const privatePaths = ["/brand", "/tech-news/desk", "/offers/", "/go/", "/__grok/", "/api/"];
    const star = robotsGroupBody(robots, "*");

    assert.match(star, /^Allow: \/\n/);
    for (const path of privatePaths) {
      assert.match(star, new RegExp(`^Disallow: ${path}$`, "m"));
    }

    for (const agent of AI_CITATION_USER_AGENTS) {
      const block = robotsGroupBody(robots, agent);
      assert.equal(block, star);
      assert.doesNotMatch(block, /^Disallow: \/$/m);
    }

    for (const agent of BLOCKED_SCRAPER_USER_AGENTS) {
      assert.equal(robotsGroupBody(robots, agent), "Disallow: /\n");
    }

    assert.match(robots, /Sitemap: https:\/\/www\.chaiquote.hk\/sitemap.xml\n$/);
    assert.doesNotMatch(robots, /User-agent: Googlebot/);
    assert.doesNotMatch(robots, /User-agent: AdsBot/);
    assert.doesNotMatch(robots, /User-agent: Bingbot/);
    const file = readFileSync(join(here, "../../public/robots.txt"), "utf8");
    assert.equal(file, robots);
  });
});
