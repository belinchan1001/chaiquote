import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { newIntakeCards } from "./new-intake-page.ts";
import { NEW_INTAKE } from "./estate-new-intake-names.ts";
import { SITEMAP_PAGES } from "./seo.ts";

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
    assert.doesNotMatch(messages, /未有指定新入伙/);
    const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
    assert.match(header, /to: "\/new-intake"/);
  });
});
