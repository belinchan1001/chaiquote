import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  TECH_NEWS_ARTICLES,
  TECH_NEWS_CATEGORIES,
  TECH_NEWS_SEO,
  EDITOR_TAKE_DISCLAIMER,
  getTechNewsArticle,
  getTechNewsCategory,
} from "./tech-news.ts";
import { SITEMAP_PAGES, renderRobotsTxt } from "./seo.ts";
import { newsShareText, newsWhatsAppHref, shareOrCopyNews } from "./news-share.ts";
import { HOME_NEWS_TEASERS } from "./home-news-teaser.ts";

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
    assert.equal(TECH_NEWS_ARTICLES.length, 11);
    assert.ok(getTechNewsArticle("assemble-nintendo-switch-wanchai"));
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
      assert.match(article.description, /以電訊商確認為準|以官方及平台商店確認為準|以官方公布為準|以 SmarTone 及通訊辦公布為準|以商店確認為準/);
      assert.match(article.published, /^2026-09-(18|21)$/);
      assert.ok(article.editorNote.length > 80, article.slug);
      if (article.category in byDesk) byDesk[article.category] += 1;
    }
    assert.ok(byDesk.telecom >= 2 && byDesk.phones >= 2 && byDesk.gadgets >= 2 && byDesk.gaming >= 2);
  });

  it("is linked from chrome, sitemap and robots", () => {
    const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
    const footer = readFileSync(join(here, "../components/site-footer.tsx"), "utf8");
    const index = readFileSync(join(here, "../routes/tech-news.tsx"), "utf8");
    const slugPage = readFileSync(join(here, "../routes/tech-news_.$slug.tsx"), "utf8");
    const feed = readFileSync(join(here, "../components/news-feed.tsx"), "utf8");
    assert.match(header, /to: "\/tech-news"/);
    assert.match(footer, /to="\/tech-news"/);
    assert.match(index, /NewsDeskChips/);
    assert.match(index, /NewsStoryList/);
    assert.doesNotMatch(index, /photo-strip/);
    assert.doesNotMatch(index, /入專區/);
    assert.match(slugPage, /useI18n, usePageTitle/);
    assert.match(slugPage, /齊Quote編輯觀點/);
    assert.match(slugPage, /EDITOR_TAKE_DISCLAIMER/);
    assert.match(slugPage, /NewsShareBar/);
    assert.equal(EDITOR_TAKE_DISCLAIMER, "純粹編輯個人觀點，一律與本網站無關。");
    assert.equal(HOME_NEWS_TEASERS.length, 3);
    for (const item of HOME_NEWS_TEASERS) {
      assert.ok(getTechNewsArticle(item.slug), item.slug);
    }
    assert.match(feed, /line-clamp-2/);
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
      "assemble-nintendo-switch-wanchai",
    ]) {
      assert.ok(
        SITEMAP_PAGES.some((page) => page.path === `/tech-news/${slug}`),
        slug,
      );
    }
    assert.match(renderRobotsTxt(), /Allow: \/tech-news/);
    assert.match(renderRobotsTxt(), /Disallow: \/tech-news\/desk/);
  });

  it("shares a story URL over WhatsApp or the clipboard", async () => {
    const title = "SmarTone 3G 10 月 9 日停";
    const url = "https://www.chaiquote.hk/tech-news/smartone-3g-close-2026";
    assert.equal(newsShareText(title, url), `${title}\n${url}`);
    assert.match(newsWhatsAppHref(title, url), /^https:\/\/wa\.me\/\?text=/);
    const copied: string[] = [];
    assert.equal(
      await shareOrCopyNews(title, url, {
        writeText: async (text) => {
          copied.push(text);
        },
      }),
      "copied",
    );
    assert.deepEqual(copied, [`${title}\n${url}`]);
    const shared: ShareData[] = [];
    assert.equal(
      await shareOrCopyNews(title, url, {
        canShare: () => true,
        share: async (data) => {
          shared.push(data);
        },
        writeText: async () => {
          throw new Error("should not copy");
        },
      }),
      "shared",
    );
    assert.equal(shared[0]?.url, url);
  });
});
