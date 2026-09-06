import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "./site.ts";
import {
  renderRobotsTxt,
  renderSitemapXml,
  seoOrigin,
  SITEMAP_PAGES,
} from "./seo.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("seoOrigin", () => {
  it("strips trailing slashes and keeps the vercel.app host", () => {
    assert.equal(seoOrigin("https://chaiquote.vercel.app/"), "https://chaiquote.vercel.app");
    assert.equal(seoOrigin(), SITE.url);
    assert.equal(SITE.url, "https://chaiquote.vercel.app");
  });
});

describe("renderSitemapXml", () => {
  it("returns a well-formed urlset with absolute vercel.app locs", () => {
    const xml = renderSitemapXml();
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n/);
    assert.match(xml, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
    assert.match(xml, /<\/urlset>\n$/);
    assert.equal((xml.match(/<url>/g) ?? []).length, SITEMAP_PAGES.length);
    for (const page of SITEMAP_PAGES) {
      assert.match(xml, new RegExp(`<loc>https://chaiquote\\.vercel\\.app${page.path.replaceAll("?", "\\?")}</loc>`));
    }
    assert.doesNotMatch(xml, /chaiquote\.hk/);
    assert.ok(SITEMAP_PAGES.some((page) => page.path === "/privacy"));
  });

  it("stays in sync with public/sitemap.xml so Vite/CDN and the Nitro route agree", () => {
    const fromDisk = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
    assert.equal(fromDisk, renderSitemapXml());
  });
});

describe("renderRobotsTxt", () => {
  it("allows all crawlers and points at this host's sitemap", () => {
    const robots = renderRobotsTxt();
    assert.match(robots, /^User-agent: \*\nAllow: \/\n\nSitemap: https:\/\/chaiquote\.vercel\.app\/sitemap\.xml\n$/);
    assert.doesNotMatch(robots, /chaiquote\.hk/);
  });

  it("stays in sync with public/robots.txt", () => {
    const fromDisk = readFileSync(join(ROOT, "public/robots.txt"), "utf8");
    assert.equal(fromDisk, renderRobotsTxt());
  });
});
