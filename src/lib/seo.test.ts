import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "./site.ts";
import {
  canonicalRedirectLocation,
  canonicalUrl,
  canonicalUrlFromMatches,
  DEFAULT_SEO_ORIGIN,
  isLegacyProductionHost,
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
    assert.ok(SITEMAP_PAGES.some((page) => page.path === "/privacy"));
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
  it("allows all crawlers and points at the official www sitemap", () => {
    const robots = renderRobotsTxt();
    assert.match(
      robots,
      /^User-agent: \*\nAllow: \/\n\nSitemap: https:\/\/www\.chaiquote\.hk\/sitemap\.xml\n$/,
    );
    assert.doesNotMatch(robots, /vercel\.app/);
  });

  it("stays in sync with public/robots.txt", () => {
    const fromDisk = readFileSync(join(ROOT, "public/robots.txt"), "utf8");
    assert.equal(fromDisk, renderRobotsTxt());
  });
});
