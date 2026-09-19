import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ADDRESS_SEARCH_DEBOUNCE_MS,
  addressHitAddress,
  addressHitDistrict,
  addressHitFromGov,
  addressHitLabel,
  addressHitName,
  addressHitSubtitle,
  addressHitValue,
  blockStepHits,
  blockStepKind,
  catalogueBlockHits,
  collectGovChildBlocks,
  isCatalogueBlockHit,
  isGovChildBlock,
  isHongKongPlace,
  labelGovBlockHit,
  localAddressHits,
  searchAddresses,
} from "./address-search.ts";
import { districtDisplayName, districtEnglishName } from "./district-names.ts";
import { estateDisplayName, estateEnglishName, estateLabel, ESTATES, placeDisplayName, placeEnglishName } from "./estates.ts";
import { estateHousingLabel, estateIntro, estatePagePath, estatePageTitle, estateSeoTitle, getEstatePage } from "./estate-pages.ts";
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

  it("uses Choi Hung Road Estate as the English name for 彩虹道邨", () => {
    const row = estate("彩虹道邨");
    assert.ok(row);
    assert.equal(estateEnglishName(row), "Choi Hung Road Estate");

    const hit = localAddressHits("彩虹道邨")[0];
    assert.ok(hit);
    assert.equal(hit.name, "彩虹道邨");
    assert.equal(hit.nameEN, "Choi Hung Road Estate");
    assert.equal(addressHitName(hit, "en"), "Choi Hung Road Estate");
    assert.equal(addressHitName(hit, "zh"), "彩虹道邨");
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
    assert.equal(addressHitDistrict(hit, "en"), "Sha Tin");
    assert.equal(addressHitDistrict(hit, "zh"), "沙田");
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
    assert.equal(estateDisplayName(estate("彩虹道邨")!, "en"), "Choi Hung Road Estate");
    assert.equal(placeDisplayName("元朗", "en"), "Yuen Long");
    assert.equal(placeDisplayName("元朗", "zh"), "元朗");
    assert.equal(placeEnglishName("啟德"), "Kai Tak");
    assert.equal(placeDisplayName("啟德", "en"), "Kai Tak");
    assert.equal(placeDisplayName("啟德", "zh"), "啟德");
    assert.equal(placeDisplayName("天水圍", "en"), "天水圍");
    assert.match(estateIntro(tinYiu, "zh"), /^天耀邨位於/);
    assert.match(estateIntro(tinYiu, "zh"), /元朗（天水圍）/);
    assert.match(estateIntro(tinYiu, "zh"), /樓類為公屋/);
    assert.match(estateIntro(tinYiu, "zh"), /實際覆蓋同安裝期以電訊商確認為準/);
    assert.match(estateIntro(tinYiu, "en"), /^Tin Yiu is in /);
    assert.match(estateIntro(tinYiu, "en"), /Yuen Long \(天水圍\)/);
    assert.match(estateIntro(tinYiu, "en"), /Housing type is Public housing/);
    assert.match(estateIntro(tinYiu, "en"), /Coverage and install dates are confirmed by the carrier/);
    assert.doesNotMatch(estateIntro(tinYiu, "en"), /位於|樓類為|實際覆蓋/);
    assert.equal(estatePageTitle(tinYiu, "zh"), "天耀邨寬頻比較｜公屋｜齊Quote");
    assert.equal(estatePageTitle(tinYiu, "en"), "Tin Yiu broadband comparison | Public housing | 齊Quote");
    const yoho = estate("YOHO Midtown")!;
    assert.equal(estatePageTitle(yoho, "zh"), "YOHO Midtown寬頻比較｜私樓｜齊Quote");
    assert.equal(estatePageTitle(yoho, "en"), "YOHO Midtown broadband comparison | Private | 齊Quote");
    assert.doesNotMatch(estatePageTitle(yoho, "en"), /寬頻比較|私樓/);
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
    assert.match(suggest, /addressHitSubtitle\(hit, locale\)/);
    assert.match(suggest, /addressHitValue\(hit, locale\)/);
    const estatePage = readFileSync(join(ROOT, "src/routes/estates_.$slug.tsx"), "utf8");
    assert.match(estatePage, /estateHousingLabel\(estate\.housing, locale\)/);
    assert.match(estatePage, /estateIntro\(estate, locale\)/);
    assert.match(estatePage, /estatePageTitle\(estate, locale\)/);
    assert.match(estatePage, /estateDisplayName\(/);
    assert.match(estatePage, /placeDisplayName\(estate\.district, locale\)/);
    assert.match(estatePage, /t\("estateFibreTitle"/);
    assert.match(estatePage, /t\("estateHome5gTitle"\)/);
    assert.doesNotMatch(estatePage, /適用\{housing\}光纖計劃|睇晒適用/);
    const dir = readFileSync(join(ROOT, "src/routes/estates.tsx"), "utf8");
    assert.match(dir, /housingLabel\(/);
    assert.match(dir, /housingLabel\(id\)/);
    assert.match(dir, /housingLabel\(page\.estate\.housing\)/);
    assert.match(dir, /estateDisplayName\(/);
    assert.match(dir, /placeDisplayName\(/);
    assert.doesNotMatch(dir, /label: "公屋"/);
  });

  it("maps official districts on estate cards, index chips, and address search", () => {
    const meiTung = estate("美東樓")!;
    assert.equal(meiTung.district, "黃大仙");
    assert.equal(meiTung.area, undefined);
    assert.equal(placeDisplayName(meiTung.district, "en"), "Wong Tai Sin");
    assert.equal(placeDisplayName(meiTung.district, "zh"), "黃大仙");
    assert.equal(districtEnglishName("觀塘"), "Kwun Tong");
    assert.equal(districtDisplayName("九龍城", "en"), "Kowloon City");

    const local = localAddressHits("美東樓")[0];
    assert.ok(local);
    assert.equal(local.district, "黃大仙");
    assert.equal(addressHitDistrict(local, "en"), "Wong Tai Sin");
    assert.equal(addressHitDistrict(local, "zh"), "黃大仙");
    assert.match(addressHitLabel(local, "en"), /Wong Tai Sin/);
    assert.doesNotMatch(addressHitLabel(local, "en"), /黃大仙/);
    assert.match(addressHitLabel(local, "zh"), /黃大仙/);

    const tinYiuHit = localAddressHits("天耀")[0];
    assert.ok(tinYiuHit);
    assert.equal(tinYiuHit.district, "天水圍");
    assert.equal(addressHitDistrict(tinYiuHit, "en"), "天水圍");

    const dir = readFileSync(join(ROOT, "src/routes/estates.tsx"), "utf8");
    assert.match(dir, /placeDisplayName\(page\.estate\.district, locale\)/);
    assert.match(dir, /placeDisplayName\(group\.district, locale\)/);
    const suggest = readFileSync(join(ROOT, "src/components/estate-suggest.tsx"), "utf8");
    assert.match(suggest, /addressHitSubtitle\(hit, locale\)/);
    const search = readFileSync(join(ROOT, "src/lib/address-search.ts"), "utf8");
    assert.match(search, /districtEnglishName\(hit\.district\)/);
  });

  it("does not change slugs or sitemap copy this round", () => {
    const tinYiu = getEstatePage("tin-yiu");
    assert.ok(tinYiu);
    assert.equal(estatePagePath(tinYiu), "/estates/tin-yiu");
    assert.equal(getEstatePage("kingswood-villas")?.estate.name, "天水圍嘉湖山莊");
    assert.equal(getEstatePage("taikoo-shing")?.estate.name, "太古城");
    assert.match(estateSeoTitle(tinYiu.estate), /^天耀邨寬頻比較｜公屋｜齊Quote$/);
    assert.equal(estatePageTitle(tinYiu.estate, "zh"), estateSeoTitle(tinYiu.estate));
    const pages = readFileSync(join(ROOT, "src/lib/estate-pages.ts"), "utf8");
    assert.match(pages, /function slugFromEstate\(estate: Estate\)/);
    assert.doesNotMatch(pages, /slugFromEstate\([^)]*locale/);
    assert.match(pages, /export function estateSeoTitle\(estate: Estate\): string/);
    assert.doesNotMatch(pages, /estateSeoTitle\([^)]*locale/);
  });

  it("localizes homepage popular estates and estate-page chrome on en only", () => {
    const messages = readFileSync(join(ROOT, "src/lib/messages.ts"), "utf8");
    const panel = readFileSync(join(ROOT, "src/components/search-panel.tsx"), "utf8");
    assert.equal(MESSAGES.zh.searchPopularLabel, "熱門：");
    assert.equal(MESSAGES.en.searchPopularLabel, "Popular: ");
    assert.equal(MESSAGES.zh.searchAllEstates, "全部屋苑");
    assert.equal(MESSAGES.en.searchAllEstates, "All estates");
    assert.equal(MESSAGES.zh.estateTitle, "{name}寬頻比較｜{housing}｜齊Quote");
    assert.equal(MESSAGES.en.estateTitle, "{name} broadband comparison | {housing} | 齊Quote");
    assert.equal(MESSAGES.zh.estateFibreTitle, "適用{housing}光纖計劃");
    assert.equal(MESSAGES.en.estateFibreTitle, "{housing} fibre plans");
    assert.equal(MESSAGES.zh.estateHome5gTitle, "5G 家居寬頻");
    assert.equal(MESSAGES.en.estateHome5gTitle, "5G home broadband");
    assert.match(panel, /searchPopularLabel/);
    assert.match(panel, /searchAllEstates/);
    assert.match(panel, /popularEstateName/);
    assert.match(panel, /estateDisplayName/);
    assert.doesNotMatch(panel, /熱門：/);
    assert.doesNotMatch(panel, /全部屋苑/);

    const kingswood = getEstatePage("kingswood-villas")!;
    const cityOne = getEstatePage("city-one")!;
    const taikoo = getEstatePage("taikoo-shing")!;
    assert.equal(estateDisplayName(kingswood.estate, "en"), "Kingswood Villas");
    assert.equal(estateDisplayName(cityOne.estate, "en"), "City One");
    assert.equal(estateDisplayName(taikoo.estate, "en"), "Taikoo Shing");
    assert.equal(estateDisplayName(kingswood.estate, "zh"), "天水圍嘉湖山莊");
    assert.match(messages, /searchPopularLabel: "熱門："/);
    assert.match(messages, /searchPopularLabel: "Popular: "/);
  });
});

describe("phase 1 address suggest UX and filters", () => {
  it("locks 細蚊 placeholder / loading / empty / continue copy and reuses waQuote", () => {
    assert.equal(MESSAGES.zh.estatePlaceholder, "例：太古城、YOHO Town、長沙灣道");
    assert.equal(MESSAGES.en.estatePlaceholder, "e.g. Taikoo Shing, YOHO Town, Cheung Sha Wan Road");
    assert.equal(MESSAGES.zh.searchingAddr, "搜緊香港地址…");
    assert.equal(MESSAGES.en.searchingAddr, "Searching Hong Kong addresses…");
    assert.equal(
      MESSAGES.zh.noExactAddr,
      "搵唔到相似地址。你可以繼續用呢個名稱睇計劃，或者 WhatsApp 查核覆蓋。",
    );
    assert.equal(
      MESSAGES.en.noExactAddr,
      "No similar address found. You can keep this name to browse plans, or WhatsApp us to check coverage.",
    );
    assert.equal(MESSAGES.zh.searchContinueTyped, "用呢個名稱繼續");
    assert.equal(MESSAGES.en.searchContinueTyped, "Continue with this name");
    assert.equal(MESSAGES.zh.searchSkipBlock, "只用邨／屋苑／街名繼續");
    assert.equal(MESSAGES.en.searchSkipBlock, "Continue with this estate or street name");
    assert.equal(MESSAGES.zh.searchBlockRef, "僅供參考／覆蓋另查");
    assert.equal(MESSAGES.en.searchBlockRef, "For reference / coverage checked separately");
    assert.equal(MESSAGES.zh.searchPickBlock, "揀座數或大廈");
    assert.equal(MESSAGES.en.searchPickBlock, "Choose a block or building");
    assert.equal(MESSAGES.zh.searchingBlocks, "睇下有冇座數…");
    assert.equal(MESSAGES.en.searchingBlocks, "Checking for blocks…");
    assert.equal(MESSAGES.zh.waQuote, "WhatsApp 查核報價");
    assert.equal(MESSAGES.en.waQuote, "Check quote on WhatsApp");
    assert.equal(MESSAGES.zh.searchPopularLabel, "熱門：");
    assert.equal(MESSAGES.en.searchPopularLabel, "Popular: ");
    for (const text of [
      MESSAGES.zh.estatePlaceholder,
      MESSAGES.zh.noExactAddr,
      MESSAGES.zh.searchContinueTyped,
      MESSAGES.zh.searchSkipBlock,
      MESSAGES.zh.searchBlockRef,
      MESSAGES.zh.waQuote,
      MESSAGES.en.estatePlaceholder,
      MESSAGES.en.noExactAddr,
      MESSAGES.en.searchContinueTyped,
      MESSAGES.en.searchSkipBlock,
      MESSAGES.en.searchBlockRef,
      MESSAGES.en.waQuote,
    ]) {
      assert.doesNotMatch(text, /最平|保證|官方|cheapest|guaranteed|official/i);
    }
  });

  it("keeps debounce at 300ms, locale-independent cache, and district · housing subtitle", () => {
    assert.equal(ADDRESS_SEARCH_DEBOUNCE_MS, 300);
    const suggest = readFileSync(join(ROOT, "src/components/estate-suggest.tsx"), "utf8");
    assert.match(suggest, /ADDRESS_SEARCH_DEBOUNCE_MS/);
    assert.match(suggest, /searchContinueTyped/);
    assert.match(suggest, /searchSkipBlock/);
    assert.match(suggest, /searchBlockRef/);
    assert.match(suggest, /searchingBlocks/);
    assert.match(suggest, /QuoteLink/);
    assert.match(suggest, /keepTypedName/);
    assert.match(suggest, /skipParentName/);
    assert.match(suggest, /blockStepKind/);
    assert.match(suggest, /lookupParentBlocks/);
    assert.match(suggest, /lookupGen/);
    assert.match(suggest, /if \(gen !== lookupGen\.current\) return;/);
    assert.doesNotMatch(suggest, /matchKnownEstate/);
    assert.match(suggest, /function keepTypedName\(\) \{\n    clearBlockFlow\(\);\n    dismissKeyboard\(\);/);
    assert.match(suggest, /function skipParentName\(\) \{\n    if \(!blockStep\) return;\n    finalize\(blockStep\.parent\);/);
    assert.match(suggest, /if \(!next\.length\) \{\n          finalize\(hit\);/);
    assert.match(suggest, /min-h-11/);
    assert.match(suggest, /40dvh|45dvh|max-h-\[min/);
    assert.match(suggest, /inputRef\.current\?\.blur/);

    const hit = localAddressHits("天耀")[0]!;
    assert.match(addressHitSubtitle(hit, "zh"), /公屋/);
    assert.match(addressHitSubtitle(hit, "en"), /Public housing/);
    assert.doesNotMatch(addressHitSubtitle(hit, "zh"), /，/);
    assert.equal(isHongKongPlace("東區"), true);
    assert.equal(isHongKongPlace("Eastern District"), true);
    assert.equal(isHongKongPlace("London", "United Kingdom", "Somewhere"), false);
  });

  it("Yoho local hits stay in-series; cache is not keyed by locale", async () => {
    const yoho = localAddressHits("Yoho");
    const names = yoho.map((hit) => hit.name);
    assert.ok(names.includes("YOHO Town"));
    assert.ok(names.includes("YOHO Midtown"));
    assert.ok(names.includes("YOHO West"));
    assert.ok(names.includes("Grand YOHO"));
    assert.ok(!names.includes("朗城匯"));
    assert.ok(!names.includes("芊御"));

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      ({
        ok: true,
        json: async () => [
          {
            nameZH: "朗城匯",
            nameEN: "YOHO Hub",
            addressZH: "元朗",
            addressEN: "Yuen Long",
            districtZH: "元朗",
            districtEN: "Yuen Long",
          },
          {
            nameZH: "芊御",
            nameEN: "The YOHO Garden Regency",
            addressZH: "錦田",
            addressEN: "Kam Tin",
            districtZH: "元朗",
            districtEN: "Yuen Long",
          },
          {
            nameZH: "倫敦",
            nameEN: "London",
            addressZH: "United Kingdom",
            addressEN: "United Kingdom",
            districtZH: "London",
            districtEN: "London",
          },
        ],
      }) as Response) as typeof fetch;
    try {
      const first = await searchAddresses("Yoho");
      const second = await searchAddresses("Yoho");
      assert.equal(first, second);
      const names = first.map((hit) => hit.name);
      assert.ok(names.includes("YOHO Town"));
      assert.ok(!names.includes("朗城匯"));
      assert.ok(!names.includes("芊御"));
      assert.ok(!first.some((hit) => hit.district === "London"));
    } finally {
      globalThis.fetch = originalFetch;
    }
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

describe("phase 2 site-wide parent → block step", () => {
  it("opens catalogue step 2 for 樂富邨 and treats 樂泰樓 as a leaf", () => {
    const parent = localAddressHits("樂富邨").find((hit) => hit.name === "樂富邨");
    const block = localAddressHits("樂泰樓").find((hit) => hit.name === "樂泰樓");
    assert.ok(parent);
    assert.ok(block);
    assert.equal(blockStepKind(parent), "catalogue");
    assert.equal(blockStepKind(block), "none");
    assert.equal(isCatalogueBlockHit(block), true);
    assert.equal(isCatalogueBlockHit(parent), false);
    const children = catalogueBlockHits(parent);
    assert.ok(children.some((hit) => hit.name === "樂泰樓"));
    assert.ok(children.every((hit) => hit.source === "local" && !hit.blockRef));
    assert.equal(blockStepHits(children, []).some((hit) => hit.name === "樂泰樓"), true);
  });

  it("looks up streets / villages / YOHO instead of forcing an empty block sheet", () => {
    const village = localAddressHits("東頭村")[0];
    const yoho = localAddressHits("YOHO Town")[0];
    const street = addressHitFromGov({
      nameZH: "長沙灣道",
      nameEN: "Cheung Sha Wan Road",
      addressZH: "深水埗",
      addressEN: "Sham Shui Po",
      districtZH: "深水埗",
      districtEN: "Sham Shui Po",
    });
    assert.ok(village);
    assert.ok(yoho);
    assert.ok(street);
    assert.equal(blockStepKind(village), "lookup");
    assert.equal(blockStepKind(yoho), "lookup");
    assert.equal(blockStepKind(street), "lookup");
    assert.equal(catalogueBlockHits(village).length, 0);
    assert.equal(catalogueBlockHits(street).length, 0);
    assert.equal(catalogueBlockHits(yoho).length, 0);
  });

  it("labels map.gov children 僅供參考 and ignores the parent / junk / sibling estates", () => {
    const parent = localAddressHits("樂富邨").find((hit) => hit.name === "樂富邨")!;
    const catalogue = catalogueBlockHits(parent);
    const govParent = addressHitFromGov({
      nameZH: "樂富邨",
      nameEN: "Lok Fu Estate",
      districtZH: "黃大仙",
    })!;
    const govBlock = addressHitFromGov({
      nameZH: "示範座",
      nameEN: "Demo House",
      addressZH: "樂富邨",
      districtZH: "黃大仙",
    })!;
    const mall = addressHitFromGov({
      nameZH: "樂富廣場",
      nameEN: "Lok Fu Place",
      addressZH: "樂富邨",
      districtZH: "黃大仙",
    })!;
    const carpark = addressHitFromGov({
      nameZH: "樂富邨停車場",
      nameEN: "Lok Fu Estate Car Park",
      addressZH: "樂富邨",
      districtZH: "黃大仙",
    })!;
    assert.equal(isGovChildBlock(parent, govParent), false);
    assert.equal(isGovChildBlock(parent, govBlock), true);
    assert.equal(isGovChildBlock(parent, mall), false);
    assert.equal(isGovChildBlock(parent, carpark), false);
    const labelled = labelGovBlockHit(govBlock);
    assert.equal(labelled.blockRef, true);
    assert.equal(labelled.coverageCheck, true);
    const extras = collectGovChildBlocks(parent, [govParent, govBlock, mall, carpark, ...catalogue], catalogue);
    assert.equal(extras.length, 1);
    assert.equal(extras[0]?.name, "示範座");
    assert.equal(extras[0]?.blockRef, true);
    assert.ok(blockStepHits(catalogue, extras).some((hit) => hit.name === "樂泰樓"));
    assert.ok(blockStepHits(catalogue, extras).some((hit) => hit.blockRef && hit.name === "示範座"));
  });

  it("does not treat YOHO siblings or Hub as YOHO Town blocks", () => {
    const yoho = localAddressHits("YOHO Town")[0]!;
    const midtown = localAddressHits("YOHO Midtown")[0]!;
    const hub = addressHitFromGov({
      nameZH: "朗城匯",
      nameEN: "YOHO Hub",
      addressZH: "元朗",
      districtZH: "元朗",
    })!;
    const tower = addressHitFromGov({
      nameZH: "YOHO Town 第2座",
      nameEN: "YOHO Town Tower 2",
      addressZH: "元朗YOHO Town",
      districtZH: "元朗",
    })!;
    assert.equal(isGovChildBlock(yoho, midtown), false);
    assert.equal(isGovChildBlock(yoho, hub), false);
    assert.equal(isGovChildBlock(yoho, tower), true);
  });
});
