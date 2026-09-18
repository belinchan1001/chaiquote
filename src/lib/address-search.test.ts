import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  addressHitAddress,
  addressHitDistrict,
  addressHitFromGov,
  addressHitLabel,
  addressHitName,
  addressHitValue,
  localAddressHits,
  searchAddresses,
} from "./address-search.ts";
import { estateDisplayName, estateEnglishName, estateLabel, ESTATES, placeDisplayName, placeEnglishName } from "./estates.ts";
import { estateHousingLabel, estateIntro, estatePagePath, estateSeoTitle, getEstatePage } from "./estate-pages.ts";
import { MESSAGES } from "./messages.ts";
import { inquiryLines } from "./whatsapp.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

function estate(name: string) {
  return ESTATES.find((item) => item.name === name);
}

describe("locale-aware address display", () => {
  it("uses estate English aliases for EN name and keeps ZH unchanged", () => {
    const tinYiu = estate("天耀邨");
    assert.ok(tinYiu);
    assert.equal(estateEnglishName(tinYiu), "Tin Yiu");

    const zhHits = localAddressHits("天耀");
    const enHits = localAddressHits("Tin Yiu");
    assert.equal(zhHits[0]?.name, "天耀邨");
    assert.equal(enHits[0]?.name, "天耀邨");
    assert.equal(zhHits[0]?.nameEN, "Tin Yiu");

    const hit = zhHits[0]!;
    assert.equal(addressHitName(hit, "zh"), "天耀邨");
    assert.equal(addressHitName(hit, "en"), "Tin Yiu");
    assert.equal(addressHitValue(hit, "zh"), "天耀邨");
    assert.equal(addressHitValue(hit, "en"), "Tin Yiu");
    assert.match(addressHitLabel(hit, "zh"), /公屋/);
    assert.match(addressHitLabel(hit, "en"), /Public housing/);
    assert.doesNotMatch(addressHitLabel(hit, "en"), /公屋|居屋|村屋|私人樓/);
  });

  it("falls back to Chinese when English fields are missing", () => {
    const row = estate("彩虹道邨");
    assert.ok(row);
    assert.equal(estateEnglishName(row), undefined);

    const hit = localAddressHits("彩虹道邨")[0];
    assert.ok(hit);
    assert.equal(hit.name, "彩虹道邨");
    assert.equal(hit.nameEN, undefined);
    assert.equal(addressHitName(hit, "en"), "彩虹道邨");
    assert.equal(addressHitValue(hit, "en"), addressHitValue(hit, "zh"));
  });

  it("prefers gov nameEN / addressEN / districtEN on en, and ZH on zh", () => {
    const hit = addressHitFromGov({
      nameZH: "天耀邨",
      nameEN: "Tin Yiu Estate",
      addressZH: "天水圍天耀路",
      addressEN: "Tin Yiu Road, Tin Shui Wai",
      districtZH: "元朗",
      districtEN: "Yuen Long",
    });
    assert.ok(hit);
    assert.equal(hit.name, "天耀邨");
    assert.equal(hit.address, "天水圍天耀路");
    assert.equal(addressHitName(hit, "zh"), "天耀邨");
    assert.equal(addressHitAddress(hit, "zh"), "天水圍天耀路");
    assert.equal(addressHitDistrict(hit, "zh"), "元朗");
    assert.equal(addressHitValue(hit, "zh"), "天耀邨，天水圍天耀路");
    assert.equal(addressHitName(hit, "en"), "Tin Yiu Estate");
    assert.equal(addressHitAddress(hit, "en"), "Tin Yiu Road, Tin Shui Wai");
    assert.equal(addressHitDistrict(hit, "en"), "Yuen Long");
    assert.equal(addressHitValue(hit, "en"), "Tin Yiu Estate, Tin Yiu Road, Tin Shui Wai");
    assert.equal(addressHitLabel(hit, "zh"), "元朗 · 天水圍天耀路 · 公屋");
    assert.equal(addressHitLabel(hit, "en"), "Yuen Long · Tin Yiu Road, Tin Shui Wai · Public housing");
  });

  it("does not invent English when the map API omits EN fields", () => {
    const hit = addressHitFromGov({
      nameZH: "測試無英文邨",
      addressZH: "測試路88號",
      districtZH: "沙田",
    });
    assert.ok(hit);
    assert.equal(hit.nameEN, undefined);
    assert.equal(hit.addressEN, undefined);
    assert.equal(hit.districtEN, undefined);
    assert.equal(addressHitName(hit, "en"), "測試無英文邨");
    assert.equal(addressHitAddress(hit, "en"), "測試路88號");
    assert.equal(addressHitDistrict(hit, "en"), "沙田");
    assert.equal(addressHitValue(hit, "en"), "測試無英文邨, 測試路88號");
  });

  it("fills nameEN from the estate catalogue when gov omits it", () => {
    const hit = addressHitFromGov({
      nameZH: "天耀邨",
      addressZH: "天水圍",
      districtZH: "元朗",
    });
    assert.ok(hit);
    assert.equal(hit.nameEN, "Tin Yiu");
    assert.equal(addressHitName(hit, "en"), "Tin Yiu");
    assert.equal(addressHitAddress(hit, "en"), "天水圍");
  });

  it("keeps housing labels on existing i18n keys", () => {
    assert.equal(MESSAGES.zh.housingPublic, "公屋");
    assert.equal(MESSAGES.en.housingPublic, "Public housing");
    assert.equal(MESSAGES.en.housingHos, "HOS");
    assert.equal(MESSAGES.en.housingPrivate, "Private");
    assert.equal(MESSAGES.en.housingVillage, "Village house");
    const src = readFileSync(join(ROOT, "src/lib/address-search.ts"), "utf8");
    assert.match(src, /housingPublic/);
    assert.doesNotMatch(src, /hit\.housing === "public"\s*\?\s*"公屋"/);
  });

  it("uses catalogue English names on en and keeps Chinese when missing", () => {
    const tinYiu = estate("天耀邨")!;
    assert.equal(estateDisplayName(tinYiu, "zh"), "天耀邨");
    assert.equal(estateDisplayName(tinYiu, "en"), "Tin Yiu");
    assert.equal(estateDisplayName(estate("彩虹道邨")!, "en"), "彩虹道邨");
    assert.equal(placeDisplayName("元朗", "en"), "元朗");
    assert.equal(placeDisplayName("元朗", "zh"), "元朗");
    assert.equal(placeEnglishName("啟德"), "Kai Tak");
    assert.equal(placeDisplayName("啟德", "en"), "Kai Tak");
    assert.equal(placeDisplayName("啟德", "zh"), "啟德");
    assert.match(estateIntro(tinYiu, "zh"), /^天耀邨位於/);
    assert.match(estateIntro(tinYiu, "en"), /^Tin Yiu位於/);
    assert.match(estateIntro(tinYiu, "en"), /元朗（天水圍）/);
  });

  it("localizes estate type labels on en and keeps zh catalogue wording", () => {
    assert.equal(estateHousingLabel("public", "zh"), "公屋");
    assert.equal(estateHousingLabel("hos", "zh"), "居屋");
    assert.equal(estateHousingLabel("private", "zh"), "私樓");
    assert.equal(estateHousingLabel("village", "zh"), "村屋");
    assert.equal(estateHousingLabel("public", "en"), "Public housing");
    assert.equal(estateHousingLabel("hos", "en"), "HOS");
    assert.equal(estateHousingLabel("private", "en"), "Private");
    assert.equal(estateHousingLabel("village", "en"), "Village house");

    const meiTung = estate("美東樓")!;
    assert.match(estateLabel(meiTung, "zh"), /公屋/);
    assert.match(estateLabel(meiTung, "en"), /Public housing/);
    assert.doesNotMatch(estateLabel(meiTung, "en"), /公屋|居屋|私樓|私人樓|村屋/);

    const wa = inquiryLines({ housing: "public", estate: "Tin Yiu" }, "en").join("\n");
    assert.match(wa, /Public housing/);
    assert.doesNotMatch(wa, /公屋/);
    assert.match(inquiryLines({ housing: "public" }, "zh").join("\n"), /公屋/);
  });

  it("suggest UI reads locale-aware name / label / value", () => {
    const suggest = readFileSync(join(ROOT, "src/components/estate-suggest.tsx"), "utf8");
    assert.match(suggest, /addressHitName\(hit, locale\)/);
    assert.match(suggest, /addressHitLabel\(hit, locale\)/);
    assert.match(suggest, /addressHitValue\(hit, locale\)/);
    const estatePage = readFileSync(join(ROOT, "src/routes/estates_.$slug.tsx"), "utf8");
    assert.match(estatePage, /estateHousingLabel\(estate\.housing, locale\)/);
    assert.match(estatePage, /estateIntro\(estate, locale\)/);
    assert.match(estatePage, /estateDisplayName\(estate, locale\)/);
    assert.match(estatePage, /placeDisplayName\(estate\.district, locale\)/);
    const dir = readFileSync(join(ROOT, "src/routes/estates.tsx"), "utf8");
    assert.match(dir, /housingLabel\(/);
    assert.match(dir, /housingLabel\(id\)/);
    assert.match(dir, /housingLabel\(page\.estate\.housing\)/);
    assert.match(dir, /estateDisplayName\(/);
    assert.match(dir, /placeDisplayName\(/);
    assert.doesNotMatch(dir, /label: "公屋"/);
  });

  it("does not change slugs or sitemap copy this round", () => {
    const tinYiu = getEstatePage("tin-yiu");
    assert.ok(tinYiu);
    assert.equal(estatePagePath(tinYiu), "/estates/tin-yiu");
    assert.equal(getEstatePage("kingswood-villas")?.estate.name, "天水圍嘉湖山莊");
    assert.equal(getEstatePage("taikoo-shing")?.estate.name, "太古城");
    assert.match(estateSeoTitle(tinYiu.estate), /^天耀邨寬頻比較｜公屋｜齊Quote$/);
    const pages = readFileSync(join(ROOT, "src/lib/estate-pages.ts"), "utf8");
    assert.match(pages, /function slugFromEstate\(estate: Estate\)/);
    assert.doesNotMatch(pages, /slugFromEstate\([^)]*locale/);
    assert.match(pages, /export function estateSeoTitle\(estate: Estate\): string/);
    assert.doesNotMatch(pages, /estateSeoTitle\([^)]*locale/);
  });
});

describe("address search still accepts Chinese or English queries", () => {
  it("finds the same local estate from 天耀 and Tin Yiu", () => {
    const byZh = localAddressHits("天耀");
    const byEn = localAddressHits("Tin Yiu");
    assert.ok(byZh.some((hit) => hit.name === "天耀邨"));
    assert.ok(byEn.some((hit) => hit.name === "天耀邨"));
  });

  it("keeps bilingual gov fields after merge so EN display can switch later", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      ({
        ok: true,
        json: async () => [
          {
            nameZH: "測試地圖邨",
            nameEN: "Test Map Estate",
            addressZH: "測試路1號",
            addressEN: "1 Test Road",
            districtZH: "元朗",
            districtEN: "Yuen Long",
          },
        ],
      }) as Response) as typeof fetch;
    try {
      const hits = await searchAddresses("測試地圖邨");
      const gov = hits.find((hit) => hit.source === "gov");
      assert.ok(gov);
      assert.equal(gov.name, "測試地圖邨");
      assert.equal(gov.nameEN, "Test Map Estate");
      assert.equal(addressHitName(gov, "en"), "Test Map Estate");
      assert.equal(addressHitValue(gov, "en"), "Test Map Estate, 1 Test Road");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
