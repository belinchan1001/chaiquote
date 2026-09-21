import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  TECH_NEWS_ARTICLES,
  TECH_NEWS_CATEGORIES,
  TECH_NEWS_SEO,
  getTechNewsArticle,
  getTechNewsCategory,
} from "./tech-news.ts";
import { SITEMAP_PAGES, renderRobotsTxt } from "./seo.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("tech news channel", () => {
  it("keeps four desks, a GTA 6 gaming story, and no invented cheapest-price claims", () => {
    assert.equal(TECH_NEWS_CATEGORIES.length, 4);
    assert.deepEqual(
      TECH_NEWS_CATEGORIES.map((item) => item.image),
      [
        "/images/news-telecom.jpg",
        "/images/news-phones.jpg",
        "/images/news-gadgets.jpg",
        "/images/news-gaming.jpg",
      ],
    );
    assert.equal(TECH_NEWS_ARTICLES.length, 10);
    assert.ok(getTechNewsArticle("how-we-cover"));
    assert.ok(getTechNewsArticle("read-offer-news"));
    assert.ok(getTechNewsArticle("gta-6-november-2026"));
    assert.ok(getTechNewsArticle("iphone-18-handset-plan"));
    assert.ok(getTechNewsArticle("smartone-3g-close-2026"));
    assert.ok(getTechNewsArticle("iphone-18-pro-hk"));
    assert.ok(getTechNewsArticle("iphone-duo-hk"));
    assert.ok(getTechNewsArticle("apple-watch-12-hk"));
    assert.ok(getTechNewsArticle("airpods-5-hk"));
    assert.ok(getTechNewsArticle("switch-2-hk-3700"));
    assert.equal(getTechNewsArticle("gta-6-november-2026")?.image, "/images/news-gta-6.jpg");
    assert.equal(getTechNewsArticle("gta-6-november-2026")?.imageCredit, "Rockstar Games");
    assert.ok(getTechNewsCategory("telecom"));
    assert.match(TECH_NEWS_SEO.title, /^齊Quote｜/);
    assert.match(TECH_NEWS_SEO.description, /以電訊商確認為準/);
    const blob = JSON.stringify(TECH_NEWS_ARTICLES);
    assert.doesNotMatch(blob, /最抵|最低|最平/);
    const byDesk = { telecom: 0, phones: 0, gadgets: 0, gaming: 0 };
    for (const article of TECH_NEWS_ARTICLES) {
      assert.match(article.description, /以電訊商確認為準|以官方及平台商店確認為準|以官方公布為準|以 SmarTone 及通訊辦公布為準/);
      assert.match(article.published, /^2026-09-(18|21)$/);
      if (article.category in byDesk) byDesk[article.category] += 1;
    }
    assert.ok(byDesk.telecom >= 2 && byDesk.phones >= 2 && byDesk.gadgets >= 2 && byDesk.gaming >= 2);
  });

  it("is linked from chrome, sitemap and robots", () => {
    const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
    const footer = readFileSync(join(here, "../components/site-footer.tsx"), "utf8");
    const index = readFileSync(join(here, "../routes/tech-news.tsx"), "utf8");
    assert.match(header, /to: "\/tech-news"/);
    assert.match(footer, /to="\/tech-news"/);
    const slugPage = readFileSync(join(here, "../routes/tech-news_.$slug.tsx"), "utf8");
    assert.match(slugPage, /useI18n, usePageTitle/);
    assert.ok(SITEMAP_PAGES.some((page) => page.path === "/tech-news"));
    for (const slug of [
      "telecom",
      "phones",
      "gadgets",
      "gaming",
      "how-we-cover",
      "read-offer-news",
      "gta-6-november-2026",
      "iphone-18-handset-plan",
      "smartone-3g-close-2026",
      "iphone-18-pro-hk",
      "iphone-duo-hk",
      "apple-watch-12-hk",
      "airpods-5-hk",
      "switch-2-hk-3700",
    ]) {
      assert.ok(
        SITEMAP_PAGES.some((page) => page.path === `/tech-news/${slug}`),
        slug,
      );
    }
    assert.match(renderRobotsTxt(), /Allow: \/tech-news/);
    assert.match(renderRobotsTxt(), /Disallow: \/tech-news\/desk/);
  });
});
