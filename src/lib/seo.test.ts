import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "./site.ts";
import { getPlan, PLANS } from "./plans.ts";
import { getGuide } from "./guides.ts";
import {
  canonicalRedirectLocation,
  canonicalUrl,
  canonicalUrlFromMatches,
  DEFAULT_SEO_ORIGIN,
  HOME_SEO_TITLE,
  isLegacyProductionHost,
  guideJsonLd,
  planJsonLd,
  planSeoDescription,
  planSeoTitle,
  renderRobotsTxt,
  renderSitemapXml,
  runtimeSeoOrigin,
  seoOrigin,
  SITEMAP_PAGES,
} from "./seo.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const WWW = "https://www.chaiquote.hk";

describe("seoOrigin", () => {
  it("uses www.chaiquote.hk as the official host and folds the apex", () => {
    assert.equal(seoOrigin(), WWW);
    assert.equal(seoOrigin(), SITE.url);
    assert.equal(DEFAULT_SEO_ORIGIN, WWW);
    assert.equal(SITE.url, WWW);
    assert.equal(seoOrigin("https://www.chaiquote.hk/"), WWW);
    assert.equal(seoOrigin("https://chaiquote.hk"), WWW);
    assert.equal(seoOrigin("https://chaiquote.hk/"), WWW);
  });

  it("still accepts a vercel.app override for preview", () => {
    assert.equal(seoOrigin("https://chaiquote.vercel.app/"), "https://chaiquote.vercel.app");
  });
});

describe("runtimeSeoOrigin", () => {
  it("defaults to www and honours SEO_ORIGIN for preview", () => {
    const prev = process.env.SEO_ORIGIN;
    try {
      delete process.env.SEO_ORIGIN;
      assert.equal(runtimeSeoOrigin(), WWW);
      process.env.SEO_ORIGIN = "https://chaiquote.vercel.app/";
      assert.equal(runtimeSeoOrigin(), "https://chaiquote.vercel.app");
    } finally {
      if (prev === undefined) delete process.env.SEO_ORIGIN;
      else process.env.SEO_ORIGIN = prev;
    }
  });
});

describe("canonicalUrl", () => {
  it("maps each path to its own www.chaiquote.hk URL", () => {
    assert.equal(canonicalUrl("/"), "https://www.chaiquote.hk/");
    assert.equal(canonicalUrl("/privacy"), "https://www.chaiquote.hk/privacy");
    assert.equal(canonicalUrl("/about"), "https://www.chaiquote.hk/about");
    assert.equal(canonicalUrl("/plans"), "https://www.chaiquote.hk/plans");
    assert.equal(canonicalUrl("/plans/"), "https://www.chaiquote.hk/plans");
    assert.equal(canonicalUrl("guides/village"), "https://www.chaiquote.hk/guides/village");
    assert.equal(
      canonicalUrlFromMatches([{ pathname: "/" }, { pathname: "/privacy" }]),
      "https://www.chaiquote.hk/privacy",
    );
    assert.doesNotMatch(canonicalUrl("/privacy"), /\/$/);
    assert.doesNotMatch(canonicalUrl("/about"), /chaiquote\.vercel\.app/);
    assert.equal(canonicalUrlFromMatches([]), "https://www.chaiquote.hk/");
    assert.equal(
      canonicalUrlFromMatches([{ pathname: "/plans" }]),
      "https://www.chaiquote.hk/plans?cat=broadband",
    );
    assert.equal(
      canonicalUrlFromMatches([{ pathname: "/plans", search: { cat: "home5g", speed: 1000 } }]),
      "https://www.chaiquote.hk/plans?cat=home5g",
    );
    assert.equal(
      canonicalUrlFromMatches([{ pathname: "/plans/hkbn-ftth-1000-36m-98" }]),
      "https://www.chaiquote.hk/plans/hkbn-ftth-1000-36m-98",
    );
  });
});

describe("canonicalRedirectLocation", () => {
  it("301s only the production vercel.app alias, with path and query", () => {
    assert.equal(isLegacyProductionHost("chaiquote.vercel.app"), true);
    assert.equal(isLegacyProductionHost("www.chaiquote.vercel.app"), true);
    assert.equal(isLegacyProductionHost("chaiquote.vercel.app:443"), true);
    assert.equal(
      canonicalRedirectLocation(new URL("https://chaiquote.vercel.app/privacy")),
      "https://www.chaiquote.hk/privacy",
    );
    assert.equal(
      canonicalRedirectLocation(
        new URL("https://example.test/plans?cat=broadband"),
        "chaiquote.vercel.app",
      ),
      "https://www.chaiquote.hk/plans?cat=broadband",
    );
  });

  it("leaves preview *.vercel.app, localhost, and the official host alone", () => {
    assert.equal(isLegacyProductionHost("chaiquote-git-foo-songbill.vercel.app"), false);
    assert.equal(isLegacyProductionHost("www.chaiquote.hk"), false);
    assert.equal(isLegacyProductionHost("localhost:8080"), false);
    assert.equal(
      canonicalRedirectLocation(new URL("https://chaiquote-git-foo.vercel.app/privacy")),
      null,
    );
    assert.equal(canonicalRedirectLocation(new URL("https://www.chaiquote.hk/privacy")), null);
  });
});

describe("renderSitemapXml", () => {
  it("returns a well-formed urlset with absolute www.chaiquote.hk locs", () => {
    const xml = renderSitemapXml();
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n/);
    assert.match(xml, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
    assert.match(xml, /<\/urlset>\n$/);
    assert.equal((xml.match(/<url>/g) ?? []).length, SITEMAP_PAGES.length);
    for (const page of SITEMAP_PAGES) {
      assert.match(
        xml,
        new RegExp(`<loc>https://www\\.chaiquote\\.hk${page.path.replaceAll("?", "\\?")}</loc>`),
      );
    }
    assert.doesNotMatch(xml, /chaiquote\.vercel\.app/);
    assert.doesNotMatch(xml, /https:\/\/chaiquote\.hk\//);
    assert.doesNotMatch(xml, /speed=/);
    assert.doesNotMatch(xml, /provider=/);
    assert.doesNotMatch(xml, /housing=/);
    assert.ok(SITEMAP_PAGES.some((page) => page.path === "/plans?cat=broadband"));
    assert.ok(SITEMAP_PAGES.every((page) => page.path !== "/plans"));
    for (const plan of PLANS.filter((item) => !item.onlyEstates?.length)) {
      assert.ok(
        SITEMAP_PAGES.some((page) => page.path === `/plans/${plan.id}`),
        `sitemap missing /plans/${plan.id}`,
      );
    }
  });

  it("can still render a vercel.app preview sitemap when asked", () => {
    const xml = renderSitemapXml("https://chaiquote.vercel.app");
    assert.match(xml, /<loc>https:\/\/chaiquote\.vercel\.app\/privacy<\/loc>/);
  });

  it("stays in sync with public/sitemap.xml so Vite/CDN and the Nitro route agree", () => {
    const fromDisk = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
    assert.equal(fromDisk, renderSitemapXml());
  });
});

describe("renderRobotsTxt", () => {
  it("allows plan and about pages, blocks preview internals, and points at www sitemap", () => {
    const robots = renderRobotsTxt();
    assert.match(robots, /Allow: \/plans/);
    assert.match(robots, /Allow: \/estates/);
    assert.match(robots, /Allow: \/about/);
    assert.match(robots, /Disallow: \/brand/);
    assert.match(robots, /Disallow: \/__grok\//);
    assert.match(robots, /Disallow: \/api\//);
    assert.match(robots, /Sitemap: https:\/\/www\.chaiquote\.hk\/sitemap\.xml/);
    assert.doesNotMatch(robots, /vercel\.app/);
  });

  it("stays in sync with public/robots.txt", () => {
    const fromDisk = readFileSync(join(ROOT, "public/robots.txt"), "utf8");
    assert.equal(fromDisk, renderRobotsTxt());
  });
});

describe("plan SEO copy", () => {
  it("gives each plan a housing note and a 70–140 character description", () => {
    assert.match(HOME_SEO_TITLE, /寬頻比較/);
    for (const plan of PLANS) {
      const title = planSeoTitle(plan);
      const description = planSeoDescription(plan);
      assert.match(title, /｜齊Quote$/);
      assert.match(title, /月費 HK\$/);
      assert.match(description, /公屋|居屋|私樓|村屋/);
      assert.match(description, /以電訊商確認為準/);
      assert.ok(description.length >= 70, `${plan.id} ${description.length} ${description}`);
      assert.ok(description.length <= 110, `${plan.id} ${description.length} ${description}`);
    }
    const sample = getPlan("hkbn-ftth-1000-36m-98");
    assert.ok(sample);
    assert.match(planSeoTitle(sample), /1000M 連 Wi-Fi 6/);
    assert.equal(planJsonLd(sample)["@type"], "Product");
    assert.equal(planJsonLd(sample).offers.price, 98);
  });
});

describe("guide JSON-LD", () => {
  it("emits Article, BreadcrumbList and FAQPage for the fibre hub", () => {
    const fiber = getGuide("fiber");
    assert.ok(fiber);
    const ld = guideJsonLd(fiber);
    assert.equal(ld["@context"], "https://schema.org");
    const types = ld["@graph"].map((node) => node["@type"]);
    assert.deepEqual(
      types.filter((type) => type === "Article" || type === "BreadcrumbList" || type === "FAQPage").sort(),
      ["Article", "BreadcrumbList", "FAQPage"].sort(),
    );
    const article = ld["@graph"].find((node) => node["@type"] === "Article");
    assert.ok(article);
    assert.equal(article.headline, fiber.h1);
    assert.equal(article.inLanguage, "zh-HK");
    assert.equal(article.url, "https://www.chaiquote.hk/guides/fiber");
    assert.match(String(article.keywords), /香港光纖寬頻/);
    const crumbs = ld["@graph"].find((node) => node["@type"] === "BreadcrumbList");
    assert.ok(crumbs);
    const items = crumbs.itemListElement as { position: number; item: string }[];
    assert.equal(items[0]?.item, "https://www.chaiquote.hk/");
    assert.equal(items[1]?.item, "https://www.chaiquote.hk/guides");
    assert.equal(items[2]?.item, "https://www.chaiquote.hk/guides/fiber");
    const faq = ld["@graph"].find((node) => node["@type"] === "FAQPage");
    assert.ok(faq);
    const questions = faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    assert.equal(questions.length, 5);
    assert.equal(questions.some((item) => item.acceptedAnswer.text.includes("[")), false);
    assert.ok(SITEMAP_PAGES.some((page) => page.path === "/guides/fiber" && page.priority === "0.8"));
    assert.ok(SITEMAP_PAGES.some((page) => page.path === "/guides/village" && page.priority === "0.6"));
  });

  it("emits FAQPage and keywords for 5G home, mobile and business hubs", () => {
    const expected = {
      home5g: /香港5G家居/,
      mobile: /香港手機月費/,
      business: /香港商業寬頻/,
    };
    for (const [slug, keyword] of Object.entries(expected)) {
      const guide = getGuide(slug);
      assert.ok(guide, slug);
      const ld = guideJsonLd(guide);
      const article = ld["@graph"].find((node) => node["@type"] === "Article");
      assert.ok(article, slug);
      assert.match(String(article.keywords), keyword);
      const faq = ld["@graph"].find((node) => node["@type"] === "FAQPage");
      assert.ok(faq, slug);
      const questions = faq.mainEntity as { acceptedAnswer: { text: string } }[];
      assert.equal(questions.length, 5, slug);
      assert.equal(questions.some((item) => item.acceptedAnswer.text.includes("[")), false, slug);
      assert.ok(SITEMAP_PAGES.some((page) => page.path === `/guides/${slug}` && page.priority === "0.8"), slug);
    }
  });
});
