import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { newIntakeCards } from "./new-intake-page.ts";
import { NEW_INTAKE } from "./estate-new-intake-names.ts";
import { MESSAGES } from "./messages.ts";
import { SITEMAP_PAGES } from "./seo.ts";

const OPENING =
  "呢頁幫你對近年入伙或者即將入伙嘅屋苑，有冇指定新入伙優惠。指定優惠只會喺電訊商名單內嘅屋苑顯示月費；名單以外用同一樓類嘅一般計劃，公屋、居屋同私樓嘅價唔可以混用。";
const FAQ = [
  {
    q: "點解有啲屋苑有價，有啲冇？",
    a: "指定新入伙優惠只會喺電訊商名單內嘅屋苑顯示月費。唔在名單內就用同一樓類嘅一般計劃，唔會借用其他屋苑嘅月費。",
  },
  {
    q: "未入伙可唔可以預約安裝？",
    a: "部分計劃可以選擇延遲服務生效。可唔可以預約、幾時裝到，同覆蓋一併以電訊商確認為準。",
  },
  {
    q: "公屋價可唔可以用喺私樓？",
    a: "唔可以。公屋、居屋同私樓嘅價唔可以混用。每張卡都標明樓類，入去只會見到該樓類適用嘅計劃。",
  },
] as const;

const here = dirname(fileURLToPath(import.meta.url));

describe("new intake landing", () => {
  it("prices each estate from its own named offers and does not borrow another housing type", () => {
    const cards = newIntakeCards();
    const munTin = cards.find((card) => card.name === "滿田邨");
    const chunTung = cards.find((card) => card.name === "雋東邨");
    const privateCard = cards.find((card) => card.name === "朗日峰");
    assert.equal(cards.length, NEW_INTAKE.length);
    assert.ok(munTin);
    assert.equal(munTin.housing, "public");
    assert.equal(munTin.offers[0]?.monthlyFee, 75);
    assert.equal(munTin.offers.some((offer) => offer.id === "hkbn-ftth-2x1000-36m-75-intake"), true);
    assert.equal(munTin.offers.some((offer) => offer.id === "netvigator-ftth-1000-36m-78-intake"), false);
    assert.equal(chunTung?.housing, "public");
    assert.equal(chunTung?.offers.some((offer) => offer.monthlyFee === 75), true);
    assert.ok(privateCard);
    assert.equal(privateCard.housing, undefined);
    assert.equal(privateCard.offers.length, 0);
    assert.ok(cards.some((card) => card.simplePublic && card.housing === "public"));
    assert.ok(SITEMAP_PAGES.some((page) => page.path === "/new-intake"));
    const page = readFileSync(join(here, "../routes/new-intake.tsx"), "utf8");
    assert.match(page, /newIntakeCards\(\)/);
    assert.doesNotMatch(page, /最平|最低|平面圖|未有指定/);
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    assert.match(messages, /newIntakeNoOffer: "可以比較\{housing\}計劃。"/);
    assert.match(messages, /newIntakeOfferOnly: "有指定優惠"/);
    assert.match(messages, /newIntakeGenericPrice: "樓類通用價"/);
    assert.match(messages, /newIntakeMoreAreas: "更多地區"/);
    assert.match(page, /newIntakeOfferOnly/);
    assert.match(page, /newIntakeGenericPrice/);
    assert.match(page, /offerOnly && card\.offers\.length === 0/);
    assert.match(page, /card\.housing === "private"/);
    assert.doesNotMatch(messages, /未有指定新入伙/);
    const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
    assert.match(header, /to: "\/new-intake"/);
  });

  it("uses the approved opening and FAQ copy for the visible page and JSON-LD", () => {
    assert.equal(MESSAGES.zh.newIntakeLead, OPENING);
    assert.equal(MESSAGES.zh.newIntakeFaq1q, FAQ[0].q);
    assert.equal(MESSAGES.zh.newIntakeFaq1a, FAQ[0].a);
    assert.equal(MESSAGES.zh.newIntakeFaq2q, FAQ[1].q);
    assert.equal(MESSAGES.zh.newIntakeFaq2a, FAQ[1].a);
    assert.equal(MESSAGES.zh.newIntakeFaq3q, FAQ[2].q);
    assert.equal(MESSAGES.zh.newIntakeFaq3a, FAQ[2].a);
    assert.equal(MESSAGES.zh.newIntakeTitle, "新入伙屋苑寬頻");
    assert.equal(MESSAGES.zh.crumbHome, "首頁");
    assert.equal(MESSAGES.zh.navEstates, "屋苑索引");
    assert.equal(MESSAGES.zh.navNewIntake, "新入伙");
    for (const text of [OPENING, ...FAQ.flatMap((item) => [item.q, item.a])]) {
      assert.equal(text.includes("的"), false, text);
      assert.equal(text.includes("邸"), false, text);
      assert.equal(text.includes("邭"), false, text);
    }

    const page = readFileSync(join(here, "../routes/new-intake.tsx"), "utf8");
    assert.match(page, /const HEADING = "新入伙屋苑寬頻：有冇指定優惠？"/);
    assert.match(page, /const TITLE = "新入伙屋苑寬頻：有冇指定優惠？｜齊Quote"/);
    assert.ok(page.includes(OPENING));
    for (const item of FAQ) {
      assert.ok(page.includes(item.q));
      assert.ok(page.includes(item.a));
    }
    assert.match(page, /name: TITLE/);
    assert.match(page, /description: DESCRIPTION/);
    assert.match(page, /\{ title: TITLE \}/);
    assert.match(page, /\{ name: "description", content: DESCRIPTION \}/);
    assert.match(page, /\{ property: "og:title", content: TITLE \}/);
    assert.match(page, /\{ property: "og:description", content: DESCRIPTION \}/);
    assert.match(page, /\{ name: "twitter:title", content: TITLE \}/);
    assert.match(page, /\{ name: "twitter:description", content: DESCRIPTION \}/);
    assert.match(page, /name: item\.q/);
    assert.match(page, /text: item\.a/);
    assert.match(page, /locale === "en" \? t\(item\.aKey\) : item\.a/);
    assert.match(page, /locale === "en" \? t\("newIntakeLead"\) : DESCRIPTION/);
    const crumbs = page.slice(page.indexOf('"@type": "BreadcrumbList"'), page.indexOf('"@type": "FAQPage"'));
    assert.match(crumbs, /name: "首頁"/);
    assert.match(crumbs, /name: "屋苑索引"/);
    assert.match(crumbs, /name: "新入伙"/);
    assert.doesNotMatch(crumbs, /TITLE|｜齊Quote/);
    assert.doesNotMatch(page, /的/);
    const restore = readFileSync(join(here, "../../scripts/restore-truncated-catalogues.mjs"), "utf8");
    assert.match(restore, /3cc20e5fbe87a6ee9b1f99f26204b42aa7dd8283\/src\/lib\/messages\.ts/);
    assert.doesNotMatch(page, /display:\s*none|line-clamp|truncate/);
    const listAt = page.indexOf("<ul");
    const faqAt = page.indexOf('t("faqTitle")');
    assert.ok(listAt > 0 && faqAt > listAt);
  });
});
