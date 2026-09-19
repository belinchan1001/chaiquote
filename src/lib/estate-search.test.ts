import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  allowGovHitForQuery,
  allowSuggestHitForQuery,
  classifyAddress,
  compact,
  ESTATES,
  estateEnglishName,
  estateLabel,
  estateStreet,
  isBareHousingTypeQuery,
  isCatalogueParent,
  isImpracticalPlace,
  isRelatedBlock,
  shouldDropAsNoise,
  matchKnownEstate,
  parentEstate,
  relatedBlocks,
  searchEstates,
} from "./estates.ts";
import { ESTATE_COUNT } from "./estate-count.ts";
import { toTraditional } from "./zh-s2t.ts";
import {
  HKBN_FLASH_OFFER_ESTATES,
  HKBN_LPR_FLASH_ESTATES,
  estateUnlocksPlan,
  isHkbnFlashEstate,
  isNewIntakeEstate,
} from "./estate-new-intake.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

function estate(name: string) {
  return ESTATES.find((item) => item.name === name);
}

function names(query: string) {
  return searchEstates(query, 12).map((item) => item.name);
}

describe("homepage estate count", () => {
  it("matches the live catalogue length", () => {
    assert.equal(ESTATE_COUNT, ESTATES.length);
  });
});

describe("locked acceptance checks", () => {
  it("1) 東頭村 → village; 東頭邨 → public; searching one must not mis-label the other", () => {
    assert.equal(classifyAddress("東頭村").housing, "village");
    assert.equal(classifyAddress("東頭邨").housing, "public");
    assert.equal(matchKnownEstate("東頭村")?.name, "東頭村");
    assert.equal(matchKnownEstate("東頭邨")?.name, "東頭邨");

    const villageHits = searchEstates("東頭村", 12);
    assert.equal(villageHits[0]?.name, "東頭村");
    assert.equal(villageHits[0]?.housing, "village");
    assert.ok(!villageHits.some((hit) => hit.name === "東頭邨"));
    assert.ok(!villageHits.some((hit) => hit.housing === "public"));

    const estateHits = searchEstates("東頭邨", 12);
    assert.equal(estateHits[0]?.name, "東頭邨");
    assert.equal(estateHits[0]?.housing, "public");
    assert.ok(!estateHits.some((hit) => hit.name === "東頭村"));
    assert.ok(!estateHits.some((hit) => hit.housing === "village"));
  });

  it("2) 美東樓 searchable as public; belongs under 美東邨 aliases (historical 東頭邨美東樓 OK)", () => {
    const row = estate("美東樓");
    assert.equal(row?.housing, "public");
    assert.ok(row?.aliases.includes("美東邨美東樓"));
    assert.ok(row?.aliases.includes("東頭邨美東樓"));
    assert.ok(estate("美東邨")?.aliases.includes("美東"));

    assert.equal(names("美東樓")[0], "美東樓");
    assert.equal(searchEstates("美東樓")[0]?.housing, "public");
    assert.equal(names("美東邨美東樓")[0], "美東樓");
    assert.equal(names("東頭邨美東樓")[0], "美東樓");
    assert.equal(classifyAddress("美東樓").housing, "public");
    assert.equal(classifyAddress("美東邨美東樓").housing, "public");
    assert.equal(classifyAddress("東頭邨美東樓").housing, "public");
    assert.equal(matchKnownEstate("美東邨美東樓")?.name, "美東樓");
    assert.equal(matchKnownEstate("東頭邨美東樓")?.name, "美東樓");
  });

  it("3) 興東樓 / 逸東樓 must NOT collide with 興東邨 / 逸東邨", () => {
    assert.equal(matchKnownEstate("興東樓")?.name, "興東樓");
    assert.equal(matchKnownEstate("興東邨")?.name, "興東邨");
    assert.equal(classifyAddress("興東樓").housing, "public");
    assert.equal(classifyAddress("興東邨").housing, "public");
    assert.equal(names("興東樓")[0], "興東樓");
    assert.ok(!names("興東樓").includes("興東邨"));
    assert.ok(!names("興東邨").includes("興東樓"));

    assert.equal(matchKnownEstate("逸東樓")?.name, "逸東樓");
    assert.equal(matchKnownEstate("逸東邨")?.name, "東涌逸東邨");
    assert.notEqual(matchKnownEstate("逸東樓")?.name, "東涌逸東邨");
    assert.equal(classifyAddress("逸東樓").housing, "public");
    assert.equal(classifyAddress("逸東邨").housing, "public");
    assert.equal(names("逸東樓")[0], "逸東樓");
    assert.ok(!names("逸東樓").includes("東涌逸東邨"));
    assert.ok(!names("逸東邨").includes("逸東樓"));
  });

  it("4) 彩明苑 閣 (彩楊等) → hos; do not mark 彩富／貴／榮／耀閣 as hos if present", () => {
    for (const name of ["彩楊閣", "彩柳閣", "彩松閣", "彩柏閣", "彩桃閣", "彩梅閣"]) {
      assert.equal(estate(name)?.housing, "hos", name);
      assert.equal(classifyAddress(name).housing, "hos", name);
      assert.equal(searchEstates(name)[0]?.housing, "hos", name);
    }
    assert.equal(estate("彩明苑")?.housing, "hos");
    for (const name of ["彩富閣", "彩貴閣", "彩榮閣", "彩耀閣"]) {
      const row = estate(name);
      if (row) assert.notEqual(row.housing, "hos", name);
      assert.notEqual(classifyAddress(name).housing, "hos", name);
    }
  });

  it("5) UI copy remains 參考／覆蓋需查核", () => {
    assert.match(estateLabel(estate("美東樓")!), /覆蓋需查核/);
    assert.doesNotMatch(estateLabel(estate("美東樓")!), /有得裝/);
    const files = [
      "src/lib/estates.ts",
      "src/lib/address-search.ts",
      "src/components/estate-suggest.tsx",
      "src/lib/messages.ts",
      "src/routes/plans.tsx",
      "src/lib/pwa.ts",
    ];
    for (const file of files) {
      const text = readFileSync(join(ROOT, file), "utf8");
      assert.doesNotMatch(text, /有得裝/);
    }
    const messages = readFileSync(join(ROOT, "src/lib/messages.ts"), "utf8");
    assert.match(messages, /coverageCheck: "覆蓋要查核"/);
    assert.match(messages, /僅供參考/);
    assert.match(messages, /查核報價/);
    assert.match(messages, /noisePlaceHint: "呢類地點多半唔適合申請，請 WhatsApp 查核報價。"/);
    const suggest = readFileSync(join(ROOT, "src/components/estate-suggest.tsx"), "utf8");
    assert.match(suggest, /coverageCheck/);
    assert.match(suggest, /noisePlaceHint/);
    for (const file of [...files, "src/lib/messages.ts", "src/components/estate-suggest.tsx"]) {
      const text = readFileSync(join(ROOT, file), "utf8");
      assert.doesNotMatch(text, /官方住宅|純住宅|official residential|residential only/i);
    }
    const plans = readFileSync(join(ROOT, "src/routes/plans.tsx"), "utf8");
    assert.match(plans, /coverageCheck/);
    assert.match(plans, /matchKnownEstate\(search\.estate\)\?\.coverageCheck/);
    const pwa = readFileSync(join(ROOT, "src/lib/pwa.ts"), "utf8");
    assert.match(pwa, /僅供參考/);
    assert.match(pwa, /查核報價/);
  });
});

describe("estate catalogue", () => {
  it("adds Wong Tai Sin public blocks as their own rows", () => {
    const meiTung = estate("美東樓");
    assert.equal(meiTung?.housing, "public");
    assert.equal(meiTung?.district, "黃大仙");
    assert.ok(meiTung?.aliases.includes("美東邨美東樓"));
    assert.ok(meiTung?.aliases.includes("東頭邨美東樓"));
    assert.equal(meiTung?.coverageCheck, true);
    assert.equal(estate("美寶樓")?.coverageCheck, true);
    assert.equal(estate("美東邨")?.housing, "public");
    assert.equal(estate("東匯邨")?.housing, "public");
    assert.ok(estate("美東邨")?.aliases.includes("美東"));
  });

  it("keeps 東頭村 as village and does not alias it onto 東頭邨", () => {
    const village = estate("東頭村");
    const publicEstate = estate("東頭邨");
    assert.equal(village?.housing, "village");
    assert.ok(village?.aliases.includes("東頭村"));
    assert.ok(village?.aliases.includes("Tung Tau Village"));
    assert.equal(publicEstate?.housing, "public");
    assert.ok(publicEstate?.aliases.includes("東頭"));
    assert.ok(!publicEstate?.aliases.includes("東頭村"));
    assert.ok(!village?.aliases.includes("東頭"));
  });

  it("adds 彩明苑 HOS blocks only, not 彩富／貴／榮／耀閣", () => {
    assert.equal(estate("彩楊閣")?.housing, "hos");
    assert.equal(estate("彩楊閣")?.area, "將軍澳");
    assert.equal(estate("彩明苑")?.housing, "hos");
    for (const name of ["彩富閣", "彩貴閣", "彩榮閣", "彩耀閣"]) {
      assert.equal(estate(name), undefined);
    }
  });

  it("deduplicates 廣明苑 and drops malls / district false-estates", () => {
    assert.equal(ESTATES.filter((item) => item.name === "廣明苑").length, 1);
    const removed = [
      "鰂魚涌",
      "炮台山",
      "寶馬山",
      "半山區",
      "西半山",
      "堅尼地城",
      "西營盤",
      "大角咀",
      "九龍塘",
      "廣播道",
      "何文田山道",
      "啟德",
      "濕地公園路",
      "新城市廣場",
      "形點",
      "海麗商場",
      "荃灣廣場",
      "新時代廣場",
    ];
    for (const name of removed) {
      assert.equal(estate(name), undefined, name);
    }
    assert.equal(estate("杏花邨")?.housing, "private");
    assert.equal(estate("啟德1號")?.housing, "private");
  });

  it("only stores public / hos / private / village", () => {
    for (const item of ESTATES) {
      assert.ok(["public", "hos", "private", "village"].includes(item.housing), item.name);
    }
  });
});

describe("searchEstates longest-match / full-name priority", () => {
  it("finds 美東樓 as public and via 美東邨 aliases", () => {
    assert.equal(names("美東樓")[0], "美東樓");
    assert.equal(searchEstates("美東樓")[0]?.housing, "public");
    assert.equal(names("美東邨美東樓")[0], "美東樓");
    assert.equal(names("Mei Tung House")[0], "美東樓");
    assert.equal(names("美東")[0], "美東邨");
  });

  it("ranks 東頭邨 above 東頭村 for alias 東頭", () => {
    const hits = searchEstates("東頭", 12);
    assert.equal(hits[0]?.name, "東頭邨");
    assert.equal(hits[0]?.housing, "public");
    const village = hits.find((item) => item.name === "東頭村");
    if (village) assert.equal(village.housing, "village");
  });

  it("searches 東頭邨 / 東頭村 / 彩楊閣 as specified", () => {
    assert.equal(names("東頭邨")[0], "東頭邨");
    assert.equal(searchEstates("東頭邨")[0]?.housing, "public");
    assert.equal(names("東頭村")[0], "東頭村");
    assert.equal(searchEstates("東頭村")[0]?.housing, "village");
    assert.ok(!names("東頭村").includes("東頭邨"));
    assert.equal(names("彩楊閣")[0], "彩楊閣");
    assert.equal(searchEstates("彩楊閣")[0]?.housing, "hos");
  });

  it("prefers 興東樓 / 逸東樓 over the similarly named estates", () => {
    assert.equal(names("興東樓")[0], "興東樓");
    assert.ok(!names("興東樓").includes("興東邨"));
    assert.equal(names("興東邨")[0], "興東邨");
    assert.equal(names("逸東樓")[0], "逸東樓");
    assert.ok(!names("逸東樓").includes("東涌逸東邨"));
    assert.equal(matchKnownEstate("東涌逸東邨")?.name, "東涌逸東邨");
  });
});

describe("matchKnownEstate / classifyAddress", () => {
  it("does not treat bare 村屋／丁屋／village house as an estate name", () => {
    for (const query of ["村屋", "丁屋", "village house", "village houses"]) {
      assert.equal(isBareHousingTypeQuery(query), true, query);
      assert.equal(matchKnownEstate(query), undefined, query);
      assert.deepEqual(searchEstates(query, 8), [], query);
      assert.equal(classifyAddress(query).housing, "village", query);
    }
    assert.equal(matchKnownEstate("東頭村")?.name, "東頭村");
    assert.equal(searchEstates("東頭村", 1)[0]?.name, "東頭村");
  });

  it("does not let alias 東頭 classify 東頭村 as public", () => {
    assert.equal(matchKnownEstate("東頭村")?.name, "東頭村");
    assert.equal(matchKnownEstate("東頭村")?.housing, "village");
    assert.equal(classifyAddress("東頭村").housing, "village");
    assert.equal(classifyAddress("東頭村").confidence, "high");
    assert.equal(matchKnownEstate("東頭邨")?.housing, "public");
    assert.equal(classifyAddress("東頭").housing, "public");
    assert.equal(matchKnownEstate("東頭")?.name, "東頭邨");
  });

  it("finds common NT villages that were missing from the address catalogue", () => {
    const cases = [
      ["輞井圍", "輞井圍"],
      ["南生圍", "南生圍"],
      ["泰亨", "泰亨"],
      ["石澳村", "石澳村"],
      ["大生圍", "大生圍"],
      ["攸潭尾", "攸潭尾"],
      ["青衣舊墟", "青衣舊墟"],
      ["楊屋村", "屏山楊屋村"],
      ["上攸田村", "上攸田村"],
      ["下攸田村", "下攸田村"],
      ["山貝洪田村", "山貝洪田村"],
      ["米埔新村", "米埔新村"],
      ["馬牯纜村", "馬牯纜村"],
      ["大洞", "西貢大洞村"],
      ["水頭村", "水頭村"],
      ["水尾村", "水尾村"],
      ["錦興圍", "錦興圍"],
      ["落馬洲", "落馬洲"],
    ] as const;
    for (const [query, name] of cases) {
      assert.equal(searchEstates(query, 8)[0]?.name, name, query);
      assert.equal(searchEstates(query, 8)[0]?.housing, "village", query);
      assert.equal(matchKnownEstate(query)?.housing, "village", query);
    }
    assert.equal(estate("鴨脷洲村")?.housing, "village");
    assert.equal(estate("鴨脷洲邨")?.housing, "public");
    assert.equal(searchEstates("鴨脷洲村", 8)[0]?.name, "鴨脷洲村");
    assert.ok(!searchEstates("鴨脷洲村", 8).some((item) => item.name === "鴨脷洲邨"));
    assert.ok(ESTATES.filter((item) => item.housing === "village").length >= 300);
    assert.equal(searchEstates("水邊圍", 8)[0]?.name, "水邊圍邨");
    assert.equal(searchEstates("水邊圍", 8)[0]?.housing, "public");
    assert.equal(searchEstates("三聖", 8)[0]?.name, "三聖邨");
    assert.equal(searchEstates("三聖墟", 8)[0]?.name, "三聖墟");
  });

  it("covers HA public phases and missing HOS / Housing Society courts", () => {
    assert.equal(matchKnownEstate("天瑞一邨")?.name, "天瑞邨");
    assert.equal(matchKnownEstate("天瑞二邨")?.housing, "public");
    assert.equal(matchKnownEstate("梨木樹二邨")?.name, "梨木樹邨");
    assert.equal(matchKnownEstate("石籬一邨")?.housing, "public");
    assert.equal(matchKnownEstate("華富一邨")?.name, "華富邨");
    assert.equal(matchKnownEstate("東頭(二)邨")?.name, "東頭邨");
    assert.equal(matchKnownEstate("東頭(二)邨")?.housing, "public");
    assert.equal(matchKnownEstate("黃大仙下二邨")?.name, "黃大仙下邨");
    assert.equal(matchKnownEstate("翠屏(北)邨")?.name, "翠屏北邨");
    assert.equal(matchKnownEstate("龍田邨")?.name, "大澳龍田邨");
    assert.equal(matchKnownEstate("安秀苑")?.name, "安秀苑");
    assert.equal(matchKnownEstate("觀塘安達臣安秀苑")?.name, "安秀苑");
    assert.equal(matchKnownEstate("安柏苑")?.name, "安柏苑");
    assert.equal(matchKnownEstate("鯉安苑")?.name, "鯉安苑");
    assert.equal(matchKnownEstate("康柏苑")?.name, "康栢苑");
    assert.equal(matchKnownEstate("雲叠花園")?.name, "雲疊花園");
    assert.equal(estate("坪麗苑")?.housing, "hos");
    assert.equal(estate("尚翠苑")?.housing, "hos");
    assert.equal(estate("綠悠雅苑")?.housing, "hos");
    assert.equal(estate("天利苑")?.housing, "hos");
    assert.equal(estate("寧峰苑")?.housing, "hos");
    assert.equal(estate("悅麗苑")?.housing, "hos");
    assert.equal(estate("翠瑤苑")?.housing, "hos");
    assert.equal(estate("賢麗苑")?.housing, "hos");
    assert.equal(estate("怡峰苑")?.housing, "hos");
    assert.equal(estate("青盛苑")?.housing, "hos");
    assert.equal(estate("葵俊苑")?.housing, "hos");
    assert.equal(estate("葵賢苑")?.housing, "hos");
    assert.equal(estate("葵康苑")?.housing, "hos");
    assert.equal(estate("荔欣苑")?.housing, "hos");
    assert.equal(estate("兆安苑")?.housing, "hos");
    assert.equal(estate("兆軒苑")?.housing, "hos");
    assert.equal(estate("兆隆苑")?.housing, "hos");
    assert.equal(estate("新圍苑")?.housing, "hos");
    assert.equal(estate("景峰花園")?.housing, "hos");
    assert.equal(estate("芊紅居")?.housing, "private");
    assert.equal(estate("景新臺")?.housing, "hos");
    assert.equal(estate("海富苑")?.housing, "public");
    assert.equal(estate("海泰閣")?.housing, "public");
    assert.equal(estate("海寧閣")?.housing, "hos");
    assert.equal(estate("康山花園")?.housing, "hos");
    assert.equal(estate("麗晶花園")?.housing, "private");
    assert.equal(estate("富安花園")?.housing, "hos");
    assert.equal(estate("龍門居")?.housing, "hos");
    assert.equal(estate("油塘中心")?.housing, "hos");
    assert.equal(estate("富健花園")?.housing, "hos");
    assert.equal(estate("翠寧花園")?.housing, "hos");
    assert.equal(estate("福安花園")?.housing, "hos");
    assert.equal(estate("富輝花園")?.housing, "hos");
    assert.equal(estate("富寶花園")?.housing, "hos");
    assert.equal(classifyAddress("海富苑").housing, "public");
    assert.equal(estate("灝然")?.housing, "hos");
    assert.equal(estate("朗然")?.housing, "hos");
    assert.equal(estate("叡璟")?.housing, "private");
    assert.equal(estate("PORTO")?.housing, "private");
    assert.equal(estate("Deep Water South")?.housing, "private");
    assert.equal(estate("茶果嶺村")?.housing, "village");
    assert.equal(estate("鯉魚門村")?.housing, "village");
    assert.equal(estate("三家村")?.housing, "village");
    assert.equal(estate("俊宏軒")?.housing, "public");
    assert.equal(estate("俊宏軒")?.street, "天瑞路88號");
    assert.equal(classifyAddress("俊宏軒").housing, "public");
    assert.equal(estate("曉茵邨")?.street, "曉明街9號");
    assert.equal(estate("曉茵邨")?.housing, "public");
    assert.equal(matchKnownEstate("健茵樓")?.name, "健茵樓");
    assert.equal(matchKnownEstate("健茵樓")?.housing, "public");
    assert.equal(parentEstate("健茵樓")?.name, "曉茵邨");
    assert.equal(parentEstate("滿茵樓")?.name, "曉茵邨");
    assert.equal(estate("將軍澳村")?.housing, "village");
    assert.equal(estate("小欖村")?.housing, "village");
    assert.equal(estate("海下村")?.housing, "village");
    assert.equal(estate("雅寧苑")?.housing, "hos");
    assert.equal(estate("高翔苑")?.housing, "hos");
    assert.equal(estate("栢慧豪園")?.housing, "private");
    assert.equal(estate("慧景軒")?.housing, "private");
    assert.equal(estate("峻然")?.housing, "hos");
    assert.equal(estate("聚然")?.housing, "hos");
    assert.equal(matchKnownEstate("Central Park Towers")?.name, "栢慧豪園");
    assert.equal(matchKnownEstate("Grandeur Terrace")?.name, "俊宏軒");
    assert.equal(matchKnownEstate("Vianni Cove")?.name, "慧景軒");
    assert.equal(searchEstates("海富苑", 8)[0]?.name, "海富苑");
    assert.equal(searchEstates("灝然", 8)[0]?.name, "灝然");
    assert.equal(searchEstates("栢慧豪園", 8)[0]?.name, "栢慧豪園");
    assert.equal(searchEstates("俊宏軒", 8)[0]?.name, "俊宏軒");
    assert.equal(estate("浩景臺")?.housing, "hos");
    assert.equal(estate("樂啟軒")?.housing, "hos");
    assert.equal(searchEstates("坪麗苑", 4)[0]?.housing, "hos");
    assert.equal(searchEstates("青俊苑", 4)[0]?.name, "青俊苑");
    assert.equal(searchEstates("寧峰苑", 4)[0]?.name, "寧峰苑");
    assert.equal(matchKnownEstate("Melody Garden")?.name, "美樂花園");
    assert.equal(matchKnownEstate("Yuet Wu Villa")?.name, "悅湖山莊");
    assert.equal(matchKnownEstate("Ocean Court")?.name, "逸港居");
    assert.equal(matchKnownEstate("Broadview Court")?.name, "雅濤閣");
    assert.equal(matchKnownEstate("South Wave Court")?.name, "南濤閣");
    assert.equal(matchKnownEstate("逸東樓")?.name, "逸東樓");
    assert.notEqual(matchKnownEstate("逸東樓")?.name, "東涌逸東邨");
  });

  it("classifies 美東樓 and 彩楊閣 with high confidence", () => {
    assert.equal(classifyAddress("美東樓").housing, "public");
    assert.equal(classifyAddress("美東邨美東樓").housing, "public");
    assert.equal(classifyAddress("彩楊閣").housing, "hos");
    assert.equal(classifyAddress("彩明苑彩楊閣").housing, "hos");
  });

  it("uses longest match for overlapping 邨 / 樓 names", () => {
    assert.equal(matchKnownEstate("興東樓")?.name, "興東樓");
    assert.equal(matchKnownEstate("東頭邨興東樓")?.name, "興東樓");
    assert.equal(matchKnownEstate("興東邨")?.name, "興東邨");
    assert.equal(matchKnownEstate("逸東樓")?.name, "逸東樓");
    assert.equal(matchKnownEstate("東頭邨逸東樓")?.name, "逸東樓");
    assert.equal(matchKnownEstate("逸東邨")?.name, "東涌逸東邨");
  });

  it("does not treat district names or malls as private estates", () => {
    const places = [
      "鰂魚涌",
      "炮台山",
      "寶馬山",
      "半山區",
      "西半山",
      "堅尼地城",
      "西營盤",
      "大角咀",
      "九龍塘",
      "廣播道",
      "何文田山道",
      "啟德",
      "濕地公園路",
      "新城市廣場",
      "形點",
      "海麗商場",
      "荃灣廣場",
      "新時代廣場",
    ];
    for (const place of places) {
      const guess = classifyAddress(place);
      assert.equal(guess.housing, undefined, place);
      assert.equal(guess.confidence, "none", place);
      assert.equal(searchEstates(place).some((hit) => hit.housing === "private" && hit.name === place), false);
    }
    assert.equal(classifyAddress("杏花邨").housing, "private");
    assert.equal(classifyAddress("啟德1號").housing, "private");
  });

  it("does not guess unknown 邨 strings as public", () => {
    const guess = classifyAddress("未知示範邨");
    assert.equal(guess.housing, undefined);
    assert.equal(guess.confidence, "none");
    assert.equal(classifyAddress("彩富閣").housing, undefined);
    assert.equal(classifyAddress("某某屋邨").housing, "public");
    assert.equal(classifyAddress("某某屋邨").confidence, "medium");
  });
});

describe("related blocks in suggest (anti-cross)", () => {
  it("links 樓／閣 children from full parent names only", () => {
    assert.equal(isCatalogueParent(estate("東頭邨")!), true);
    assert.equal(isCatalogueParent(estate("美東邨")!), true);
    assert.equal(isCatalogueParent(estate("彩明苑")!), true);
    assert.equal(isCatalogueParent(estate("東頭村")!), false);

    const tungTauBlocks = relatedBlocks("東頭邨").map((item) => item.name);
    assert.ok(tungTauBlocks.includes("康東樓"));
    assert.ok(tungTauBlocks.includes("興東樓"));
    assert.ok(tungTauBlocks.includes("美東樓"));
    assert.ok(!tungTauBlocks.includes("東頭村"));

    const meiTungBlocks = relatedBlocks("美東邨").map((item) => item.name);
    assert.ok(meiTungBlocks.includes("美東樓"));
    assert.ok(meiTungBlocks.includes("美寶樓"));
    assert.ok(meiTungBlocks.includes("美德樓"));

    const choiMing = relatedBlocks("彩明苑").map((item) => item.name);
    for (const name of ["彩楊閣", "彩柳閣", "彩松閣", "彩柏閣", "彩桃閣", "彩梅閣"]) {
      assert.ok(choiMing.includes(name), name);
    }

    assert.equal(relatedBlocks("東頭村").length, 0);
    assert.equal(isRelatedBlock(estate("康東樓")!, estate("東頭村")!), false);
    assert.equal(isRelatedBlock(estate("康東樓")!, estate("東頭邨")!), true);
    assert.equal(isRelatedBlock(estate("興東樓")!, estate("興東邨")!), false);
    assert.equal(isRelatedBlock(estate("逸東樓")!, estate("東涌逸東邨")!), false);

    assert.equal(parentEstate("康東樓")?.name, "東頭邨");
    assert.equal(parentEstate("彩楊閣")?.name, "彩明苑");
    assert.equal(parentEstate("東頭邨"), undefined);
    assert.equal(parentEstate("東頭村"), undefined);
    assert.equal(parentEstate("健茵樓")?.name, "曉茵邨");
    assert.equal(relatedBlocks("曉茵邨").map((item) => item.name).sort().join(","), "健茵樓,滿茵樓");
  });

  it("1) search 東頭邨 → parent first, then its 樓 children", () => {
    const hits = searchEstates("東頭邨", 24);
    assert.equal(hits[0]?.name, "東頭邨");
    assert.equal(hits[0]?.housing, "public");
    const names = hits.map((item) => item.name);
    assert.ok(names.includes("康東樓"));
    assert.ok(names.includes("裕東樓"));
    assert.ok(names.includes("興東樓"));
    assert.ok(names.includes("美東樓"));
    const firstBlock = hits.findIndex((item) => item.name.endsWith("樓"));
    assert.ok(firstBlock > 0);
    assert.ok(!names.includes("東頭村"));
    assert.ok(!hits.some((item) => item.housing === "village"));
    assert.ok(hits.length > 8);
  });

  it("2) search 東頭村 → only village; zero 東頭邨 blocks", () => {
    const hits = searchEstates("東頭村", 24);
    assert.equal(hits.length, 1);
    assert.equal(hits[0]?.name, "東頭村");
    assert.equal(hits[0]?.housing, "village");
    assert.ok(!hits.some((item) => item.name === "東頭邨"));
    assert.ok(!hits.some((item) => item.housing === "public"));
    for (const block of relatedBlocks("東頭邨")) {
      assert.ok(!hits.some((item) => item.name === block.name), block.name);
    }
  });

  it("3) searching a block name keeps the correct housing type", () => {
    assert.equal(searchEstates("康東樓")[0]?.name, "康東樓");
    assert.equal(searchEstates("康東樓")[0]?.housing, "public");
    assert.equal(searchEstates("美東樓")[0]?.housing, "public");
    assert.equal(searchEstates("彩楊閣")[0]?.name, "彩楊閣");
    assert.equal(searchEstates("彩楊閣")[0]?.housing, "hos");
    assert.equal(classifyAddress("康東樓").housing, "public");
    assert.equal(classifyAddress("彩楊閣").housing, "hos");
  });

  it("does not let short 東頭 treat the village as parent of 東頭邨 blocks", () => {
    const village = estate("東頭村")!;
    const publicEstate = estate("東頭邨")!;
    assert.ok(publicEstate.aliases.includes("東頭"));
    assert.ok(!village.aliases.includes("東頭"));
    assert.equal(isRelatedBlock(estate("康東樓")!, village), false);
    assert.equal(relatedBlocks(village).length, 0);

    const hits = searchEstates("東頭", 24);
    assert.equal(hits[0]?.name, "東頭邨");
    const villageHit = hits.find((item) => item.name === "東頭村");
    if (villageHit) assert.equal(villageHit.housing, "village");
    const beforeVillage = villageHit ? hits.indexOf(villageHit) : hits.length;
    const parentIdx = hits.findIndex((item) => item.name === "東頭邨");
    const hongTung = hits.findIndex((item) => item.name === "康東樓");
    assert.ok(parentIdx === 0);
    assert.ok(hongTung > parentIdx);
    if (villageHit && hongTung >= 0) {
      assert.notEqual(hongTung, beforeVillage, "village must not sit as parent of 東頭邨 blocks");
    }
  });

  it("gov merge may not attach 東頭邨 rows to an exact 東頭村 query", () => {
    assert.equal(allowGovHitForQuery("東頭村", "東頭邨 (前稱)", "東頭村道 183號"), false);
    assert.equal(allowGovHitForQuery("東頭村", "康東樓", ""), false);
    assert.equal(allowGovHitForQuery("東頭村", "護老樂(東頭邨)", "九龍東頭(二)邨康東樓"), false);
    assert.equal(allowGovHitForQuery("東頭村", "東頭村公所", "東頭村 3號"), true);
    assert.equal(allowGovHitForQuery("東頭邨", "東頭邨 (前稱)", "東頭村道 183號"), true);
    assert.equal(allowGovHitForQuery("東頭邨", "康東樓", ""), true);
  });

  it("美東邨 / 彩明苑 expand their own children only", () => {
    const mei = searchEstates("美東邨", 24).map((item) => item.name);
    assert.equal(mei[0], "美東邨");
    assert.ok(mei.includes("美東樓"));
    assert.ok(mei.includes("美仁樓"));
    assert.ok(!mei.includes("康東樓"));
    assert.ok(!mei.includes("東頭村"));

    const choi = searchEstates("彩明苑", 24);
    assert.equal(choi[0]?.name, "彩明苑");
    assert.equal(choi[0]?.housing, "hos");
    assert.ok(choi.some((item) => item.name === "彩楊閣" && item.housing === "hos"));
    assert.ok(!choi.some((item) => item.name === "彩富閣"));
  });
});

describe("locked copy", () => {
  it("keeps 參考／覆蓋需查核 and never says 有得裝", () => {
    assert.match(estateLabel(estate("美東樓")!), /覆蓋需查核/);
    assert.doesNotMatch(estateLabel(estate("美東樓")!), /有得裝/);
    const files = [
      "src/lib/estates.ts",
      "src/lib/address-search.ts",
      "src/components/estate-suggest.tsx",
      "src/lib/messages.ts",
    ];
    for (const file of files) {
      const text = readFileSync(join(ROOT, file), "utf8");
      assert.doesNotMatch(text, /有得裝/);
    }
    const messages = readFileSync(join(ROOT, "src/lib/messages.ts"), "utf8");
    assert.match(messages, /coverageCheck: "覆蓋要查核"/);
    assert.match(messages, /僅供參考/);
    assert.match(messages, /查核報價/);
    assert.match(messages, /noisePlaceHint: "呢類地點多半唔適合申請，請 WhatsApp 查核報價。"/);
  });
});

describe("locked noise acceptance", () => {
  it("1) drop XX公廁 / 的士站 / standalone 管理處 (WhatsApp tip, no housing)", () => {
    for (const name of ["東頭村公廁", "東頭邨公廁", "XX公廁", "的士站", "管理處"]) {
      assert.equal(isImpracticalPlace(name), true, name);
      assert.equal(classifyAddress(name).housing, undefined, name);
      assert.equal(classifyAddress(name).confidence, "none", name);
    }
    assert.equal(isImpracticalPlace("東頭邨管理處"), true);
    assert.equal(classifyAddress("東頭邨管理處").housing, undefined);
  });

  it("2) keep a normal estate hit; 管理處 inside a longer official name is not a false positive", () => {
    assert.equal(isImpracticalPlace("東頭邨"), false);
    assert.equal(isImpracticalPlace("康東樓"), false);
    assert.equal(isImpracticalPlace("彩明苑"), false);
    assert.equal(searchEstates("東頭邨", 24)[0]?.name, "東頭邨");
    assert.equal(classifyAddress("東頭邨").housing, "public");
    for (const item of ESTATES) {
      assert.equal(isImpracticalPlace(item.name), false, item.name);
    }
    assert.equal(shouldDropAsNoise("金管理處華庭", "金管理處華庭"), false);
    assert.equal(shouldDropAsNoise("金管理處華庭管理處", "金管理處華庭"), true);
    assert.equal(shouldDropAsNoise("管理處", undefined), true);
  });

  it("3) village / estate anti-cross still required", () => {
    assert.equal(classifyAddress("東頭村").housing, "village");
    assert.equal(classifyAddress("東頭邨").housing, "public");
    const villageHits = searchEstates("東頭村", 24);
    assert.deepEqual(
      villageHits.map((item) => item.name),
      ["東頭村"],
    );
    assert.ok(!villageHits.some((hit) => hit.housing === "public"));
    const estateHits = searchEstates("東頭邨", 24);
    assert.equal(estateHits[0]?.name, "東頭邨");
    assert.ok(estateHits.some((hit) => hit.name === "康東樓"));
    assert.ok(!estateHits.some((hit) => hit.name === "東頭村"));
    assert.ok(!estateHits.some((hit) => hit.housing === "village"));
  });
});

describe("impractical address noise", () => {
  it("drops toilets, stops, plant rooms, and management offices", () => {
    for (const name of [
      "東頭村公廁",
      "賈炳達道公園 - 近東頭村道洗手間外",
      "的士站",
      "的士候車處",
      "東頭邨管理處",
      "彩明苑物管處",
      "保安室",
      "垃圾房",
      "垃圾收集站",
      "垃圾桶",
      "泵房",
      "變壓站",
      "電掣房",
      "停車場出入口",
      "東頭邨巴士站",
    ]) {
      assert.equal(isImpracticalPlace(name), true, name);
    }
  });

  it("keeps catalogue estates / blocks and does not over-drop 廟街", () => {
    for (const name of ["東頭邨", "東頭村", "康東樓", "美東樓", "彩明苑", "彩楊閣", "廟街", "朗天苑", "朗松閣"]) {
      assert.equal(isImpracticalPlace(name), false, name);
    }
    assert.equal(isImpracticalPlace("黃大仙廟"), true);
  });
});

describe("non-residential gov / catalogue filter", () => {
  it("drops mall / industrial / office gov-style names", () => {
    for (const name of [
      "海麗商場",
      "Hoi Lai Shopping Centre",
      "長沙灣工廈",
      "觀塘工業大廈",
      "觀塘工廠大廈",
      "中環寫字樓",
      "金鐘商業大廈",
      "尖沙咀酒店",
      "Harbour Hotel",
    ]) {
      assert.equal(isImpracticalPlace(name), true, name);
      assert.equal(classifyAddress(name).housing, undefined, name);
      assert.equal(classifyAddress(name).confidence, "none", name);
    }
  });

  it("keeps known residential estates whose names contain 中心／廣場", () => {
    for (const [name, housing] of [
      ["將軍澳中心", "private"],
      ["沙田中心", "private"],
      ["荃灣中心", "private"],
      ["大埔廣場", "hos"],
    ] as const) {
      assert.equal(isImpracticalPlace(name), false, name);
      assert.equal(classifyAddress(name).housing, housing, name);
      assert.equal(searchEstates(name, 8)[0]?.name, name, name);
      assert.equal(searchEstates(name, 8)[0]?.housing, housing, name);
    }
  });

  it("lets a catalogue residential match override a keyword drop", () => {
    assert.equal(estate("葵涌廣場住宅")?.housing, "private");
    assert.equal(isImpracticalPlace("葵涌廣場住宅"), false);
    assert.equal(classifyAddress("葵涌廣場住宅").housing, "private");
    assert.equal(shouldDropAsNoise("葵涌廣場住宅", "葵涌廣場住宅"), false);
    assert.equal(shouldDropAsNoise("海麗商場", "海麗商場"), false);
    assert.equal(shouldDropAsNoise("海麗商場", undefined), true);
    assert.equal(isImpracticalPlace("海麗商場"), true);
    assert.equal(isImpracticalPlace("海麗邨海麗商場"), true);
    assert.equal(isImpracticalPlace("沙田中心商場"), true);
    assert.equal(isImpracticalPlace("將軍澳中心"), false);
  });

  it("does not guess floor use on mixed industrial / commercial names", () => {
    assert.equal(isImpracticalPlace("長沙灣工廈12樓"), true);
    assert.equal(isImpracticalPlace("觀塘工業大廈15樓A室"), true);
    assert.equal(isImpracticalPlace("長沙灣道250號"), false);
    assert.notEqual(classifyAddress("長沙灣道250號").housing, "public");
    assert.notEqual(matchKnownEstate("長沙灣道250號")?.name, "長沙灣邨");
  });

  it("removes non-residential malls from the local catalogue", () => {
    for (const name of ["海麗商場", "荃灣廣場", "新時代廣場"]) {
      assert.equal(estate(name), undefined, name);
      assert.ok(!searchEstates(name, 12).some((hit) => hit.name === name), name);
    }
  });

  it("does not claim official residential-only in search copy", () => {
    const files = [
      "src/lib/estates.ts",
      "src/lib/address-search.ts",
      "src/components/estate-suggest.tsx",
      "src/lib/messages.ts",
    ];
    for (const file of files) {
      const text = readFileSync(join(ROOT, file), "utf8");
      assert.doesNotMatch(text, /官方住宅|純住宅|official residential|residential only/i);
    }
  });
});

describe("朗天苑 and village-address contamination", () => {
  it("classifies 朗天苑 as hos, not 屏山 village", () => {
    assert.equal(estate("朗天苑")?.housing, "hos");
    assert.equal(estate("朗天苑")?.district, "元朗");
    assert.equal(estate("朗天苑")?.area, "屏山");
    assert.equal(estate("朗天苑")?.street, "青山公路－屏山段130號");
    assert.equal(estateStreet(estate("朗天苑")!), "青山公路－屏山段130號");
    assert.equal(classifyAddress("朗天苑").housing, "hos");
    assert.equal(classifyAddress("朗天苑").confidence, "high");
    assert.equal(matchKnownEstate("朗天苑")?.name, "朗天苑");
    assert.equal(matchKnownEstate("朗天苑", "青山公路－屏山段 130號")?.name, "朗天苑");
    assert.equal(matchKnownEstate("朗天苑", "青山公路－屏山段 130號")?.housing, "hos");
    assert.notEqual(matchKnownEstate("朗天苑", "青山公路－屏山段 130號")?.housing, "village");
    assert.equal(matchKnownEstate("青山公路－屏山段130號")?.name, "朗天苑");
    assert.equal(matchKnownEstate("青山公路－屏山段130號")?.housing, "hos");
    assert.equal(classifyAddress("青山公路－屏山段130號").housing, "hos");
  });

  it("links 朗松／桃／杏閣 under 朗天苑 as hos", () => {
    for (const name of ["朗松閣", "朗桃閣", "朗杏閣"]) {
      assert.equal(estate(name)?.housing, "hos", name);
      assert.equal(classifyAddress(name).housing, "hos", name);
      assert.equal(searchEstates(name)[0]?.housing, "hos", name);
    }
    const hits = searchEstates("朗天苑", 12);
    assert.equal(hits[0]?.name, "朗天苑");
    assert.equal(hits[0]?.housing, "hos");
    const names = hits.map((item) => item.name);
    assert.ok(names.includes("朗松閣"));
    assert.ok(names.includes("朗桃閣"));
    assert.ok(names.includes("朗杏閣"));
    assert.equal(matchKnownEstate("朗松閣", "朗天苑")?.housing, "hos");
  });

  it("does not let 屏山／錦田 village addresses relabel 苑／山莊", () => {
    assert.equal(classifyAddress("屏山").housing, "village");
    assert.equal(estate("屏欣苑")?.housing, "hos");
    assert.equal(matchKnownEstate("屏欣苑", "屏山屏廈路 65號")?.housing, "hos");
    assert.equal(estate("匯熙苑")?.housing, "hos");
    assert.equal(matchKnownEstate("匯熙苑", "錦田錦義路1號")?.housing, "hos");
    assert.equal(estate("御豪山莊")?.housing, "private");
    assert.equal(estate("御豪山莊")?.street, "公園北路38號");
    assert.equal(matchKnownEstate("Park Royale")?.name, "御豪山莊");
    assert.equal(matchKnownEstate("御豪山莊", "青山公路－屏山段")?.housing, "private");
    assert.equal(estate("綠悅")?.housing, "private");
    assert.equal(classifyAddress("綠悅").housing, "private");
    assert.equal(estate("帝欣苑")?.housing, "private");
    assert.equal(classifyAddress("帝欣苑").housing, "private");
    assert.equal(estate("海怡半島")?.housing, "private");
  });

  it("guesses unknown 苑 as hos and 山莊 as private", () => {
    assert.equal(classifyAddress("未知示範苑").housing, "hos");
    assert.equal(classifyAddress("未知示範苑").confidence, "medium");
    assert.equal(classifyAddress("未知示範山莊").housing, "private");
    assert.equal(classifyAddress("未知示範山莊").confidence, "medium");
    assert.equal(classifyAddress("未知示範邨").housing, undefined);
  });
});

describe("housing type audit 2026", () => {
  it("keeps 朗天苑 as hos and does not let 屏山 village steal it", () => {
    assert.equal(estate("朗天苑")?.housing, "hos");
    assert.equal(classifyAddress("朗天苑").housing, "hos");
    assert.equal(matchKnownEstate("朗天苑", "青山公路－屏山段 130號")?.housing, "hos");
    assert.equal(estate("屏山")?.housing, "village");
  });

  it("keeps 朗天峰／朗日峰 as 私樓 and does not mix them with 朗天苑", () => {
    assert.equal(estate("朗天峰")?.housing, "private");
    assert.equal(estate("朗天峰")?.street, "十八鄉路39號");
    assert.equal(classifyAddress("朗天峰").housing, "private");
    assert.equal(matchKnownEstate("朗天峰")?.name, "朗天峰");
    assert.equal(matchKnownEstate("Hava")?.name, "朗天峰");
    assert.equal(matchKnownEstate("十八鄉路39號")?.name, "朗天峰");
    assert.equal(matchKnownEstate("十八鄉路39號")?.housing, "private");
    assert.equal(estate("朗日峰")?.housing, "private");
    assert.equal(estate("朗日峰")?.street, "大棠路111號");
    assert.equal(classifyAddress("朗日峰").housing, "private");
    assert.equal(matchKnownEstate("Flora")?.name, "朗日峰");
    assert.equal(matchKnownEstate("大棠路111號")?.name, "朗日峰");
    assert.notEqual(matchKnownEstate("朗天峰")?.name, "朗天苑");
    assert.notEqual(searchEstates("朗天峰")[0]?.name, "朗天苑");
    assert.equal(searchEstates("朗天峰")[0]?.housing, "private");
    assert.equal(searchEstates("朗天苑")[0]?.housing, "hos");
  });

  it("does not steal English names across nearby private estates", () => {
    assert.equal(matchKnownEstate("The Beverly Hills")?.name, "比華利山花園");
    assert.equal(matchKnownEstate("比華利山別墅")?.name, "比華利山花園");
    assert.equal(matchKnownEstate("三門仔路23號")?.name, "比華利山花園");
    assert.equal(matchKnownEstate("Constellation Cove")?.name, "滌濤山");
    assert.equal(matchKnownEstate("紅林路1號")?.name, "滌濤山");
    assert.equal(matchKnownEstate("Alto Residences")?.name, "藍塘傲");
    assert.equal(matchKnownEstate("One East Coast")?.name, "海傲灣");
    assert.equal(matchKnownEstate("鯉魚門徑1號")?.name, "海傲灣");
    assert.equal(estate("海傲灣")?.housing, "private");
    assert.equal(estate("帝琴灣")?.housing, "private");
    assert.equal(estate("帝琴灣")?.district, "大埔");
    assert.equal(matchKnownEstate("Symphony Bay")?.name, "帝琴灣");
    assert.equal(matchKnownEstate("西沙路530號")?.name, "帝琴灣");
    assert.equal(matchKnownEstate("Casa Marina")?.name, "淺月灣");
    assert.equal(estate("天鑽")?.street, "山塘路8號");
    assert.equal(matchKnownEstate("山塘路8號")?.name, "天鑽");
    assert.equal(estate("天鑽")?.coverageCheck, undefined);
  });

  it("classifies 苑-named private courts as 私樓, not 居屋", () => {
    assert.equal(estate("南灣花園")?.housing, "private");
    assert.equal(estate("南灣花園")?.street, "南灣坊33號");
    assert.equal(classifyAddress("南灣苑").housing, "hos");
    assert.equal(matchKnownEstate("南灣苑")?.name, "南灣苑");
    assert.equal(estate("南灣苑")?.housing, "hos");
    assert.equal(estate("南灣苑")?.district, "南區");
    assert.equal(estate("高爾夫御苑")?.housing, "private");
    assert.equal(classifyAddress("高爾夫御苑").housing, "private");
    assert.equal(matchKnownEstate("Eden Manor")?.name, "高爾夫御苑");
    assert.equal(estate("帝欣苑")?.housing, "private");
    assert.equal(estate("帝欣苑")?.street, "梅樹坑路8號");
    assert.equal(matchKnownEstate("Parc Versailles")?.name, "帝欣苑");
    assert.equal(estate("聽濤雅苑")?.housing, "private");
    assert.equal(matchKnownEstate("Vista Paradiso")?.name, "聽濤雅苑");
    assert.equal(matchKnownEstate("Monte Vista")?.name, "翠擁華庭");
    assert.notEqual(matchKnownEstate("Vista Paradiso")?.name, "翠擁華庭");
    assert.equal(classifyAddress("未知示範峰").housing, "private");
  });

  it("classifies 宏緻苑 as hos (綠置居) and links 緻閣 blocks", () => {
    assert.equal(estate("宏緻苑")?.housing, "hos");
    assert.equal(estate("宏緻苑")?.district, "觀塘");
    assert.equal(classifyAddress("宏緻苑").housing, "hos");
    for (const name of ["富緻閣", "喜緻閣", "崇緻閣"]) {
      assert.equal(estate(name)?.housing, "hos", name);
      assert.equal(classifyAddress(name).housing, "hos", name);
    }
    const hits = searchEstates("宏緻苑", 12).map((item) => item.name);
    assert.equal(hits[0], "宏緻苑");
    assert.ok(hits.includes("富緻閣"));
  });

  it("marks large private estates as 私樓, not 居屋／公屋", () => {
    const privateEstates = [
      "日出康城",
      "名城",
      "迎海",
      "維景灣畔",
      "海之戀",
      "柏傲灣",
      "環宇海灣",
      "爾巒",
      "峻巒",
      "麗城花園",
      "御龍山",
      "加州豪園",
      "銀禧花園",
      "駿景園",
      "海怡半島",
      "帝欣苑",
      "聽濤雅苑",
      "御豪山莊",
      "綠悅",
      "朗天峰",
      "朗日峰",
      "南灣花園",
      "高爾夫御苑",
      "天鑽",
      "嵐山",
      "海傲灣",
      "朗譽",
      "帝琴灣",
      "淺月灣",
      "聚豪天下",
      "比華利山花園",
      "滌濤山",
      "翠擁華庭",
      "樂融軒",
      "爵悅庭",
      "朗屏8號",
      "怡安閣",
      "雅麗居",
      "荷李活華庭",
      "文禮閣",
      "栢蕙苑",
      "衛理苑",
      "海翠花園",
      "啟豐園",
      "雅典居",
      "海典灣",
      "曉峯灣畔",
      "海柏花園",
    ];
    for (const name of privateEstates) {
      assert.equal(estate(name)?.housing, "private", name);
      assert.equal(classifyAddress(name).housing, "private", name);
    }
    assert.equal(classifyAddress("Harmony Place").housing, "private");
    assert.equal(classifyAddress("Chelsea Court").housing, "private");
    assert.equal(classifyAddress("The Spectra").housing, "private");
    assert.equal(classifyAddress("The Floridian").housing, "private");
    assert.equal(estate("祈德尊新邨")?.housing, "public");
    assert.equal(classifyAddress("祈德尊新邨").housing, "public");
    assert.equal(estate("駿發花園")?.housing, "hos");
    assert.equal(estate("寶石大廈")?.housing, "hos");
    assert.equal(estate("翠塘花園")?.housing, "hos");
    assert.equal(estate("偉景花園")?.housing, "hos");
    assert.equal(estate("華景山莊")?.housing, "private");
    assert.equal(matchKnownEstate("Wonderland Villas")?.name, "華景山莊");
    assert.equal(matchKnownEstate("Broadview Garden")?.name, "偉景花園");
    assert.equal(matchKnownEstate("瑜一")?.name, "瑜一");
    assert.equal(estate("瑜一")?.housing, "private");
    assert.equal(matchKnownEstate("In One")?.name, "瑜一");
    assert.equal(matchKnownEstate("揚海")?.name, "揚海");
    assert.equal(matchKnownEstate("La Marina")?.name, "揚海");
    assert.equal(estate("漁映樓")?.housing, "public");
    assert.equal(matchKnownEstate("Yue Ying Lau")?.name, "漁映樓");
    assert.equal(matchKnownEstate("厦村")?.name, "廈村");
    assert.equal(estate("山下村")?.housing, "village");
    assert.equal(matchKnownEstate("泥圍")?.name, "屯門泥圍");
    assert.equal(estate("華富中邨")?.housing, "public");
    assert.equal(estate("華富中邨")?.coverageCheck, true);
    assert.equal(matchKnownEstate("華樂徑")?.name, "華富中邨");
    assert.equal(estate("麗玥苑")?.housing, "hos");
    assert.equal(estate("麗玥苑")?.street, "東京街3號");
    assert.equal(estate("麗玥苑")?.area, "長沙灣");
    assert.equal(estate("南灣")?.housing, "private");
    assert.equal(matchKnownEstate("Larvotto")?.name, "南灣");
    assert.equal(estate("南灣")?.street, "鴨脷洲海旁道8號");
    assert.equal(estate("形瑨")?.housing, "private");
    assert.equal(matchKnownEstate("Lime Spark")?.name, "形瑨");
    assert.equal(estate("牛池灣村")?.housing, "village");
    assert.equal(matchKnownEstate("Hemma Anderson")?.name, "灝然");
    assert.equal(matchKnownEstate("Lo So Shing")?.name, "蘆鬚城");
    assert.equal(matchKnownEstate("Victoria Harbour")?.name, "海璇");
    assert.equal(estate("皇都")?.housing, "private");
    assert.equal(matchKnownEstate("State Pavilia")?.name, "皇都");
    assert.equal(estate("啟悅苑")?.street, "沐和街2號");
  });

  it("keeps recent HOS / GSH courts as 居屋", () => {
    const hosEstates = [
      "朗天苑",
      "啟盈苑",
      "啟悅苑",
      "啟欣苑",
      "安楹苑",
      "安樺苑",
      "安麗苑",
      "兆翠苑",
      "穗禾苑",
      "錦豐苑",
      "英明苑",
      "高翔苑",
      "景泰苑",
      "悅湖山莊",
      "盛緻苑",
      "翠嶺峰",
      "愛蝶灣",
      "置樂花園",
      "大埔廣場",
      "新興花園",
      "富雅花園",
      "宏德居",
      "雲疊花園",
      "綠怡雅苑",
    ];
    for (const name of hosEstates) {
      assert.equal(estate(name)?.housing, "hos", name);
      assert.equal(classifyAddress(name).housing, "hos", name);
    }
    assert.equal(matchKnownEstate("愛蝶灣")?.housing, "hos");
    assert.notEqual(matchKnownEstate("愛蝶灣")?.housing, "private");
    assert.equal(classifyAddress("Aldrich Garden").housing, "hos");
    assert.equal(classifyAddress("Chi Lok Fa Yuen").housing, "hos");
    assert.equal(classifyAddress("Tai Po Plaza").housing, "hos");
    assert.equal(classifyAddress("Walton Estate").housing, "hos");
    assert.equal(classifyAddress("Carado Garden").housing, "hos");
    assert.equal(estate("海翠花園")?.housing, "private");
    assert.equal(estate("海翠花園")?.street, "湖翠路168-236號");
    assert.equal(classifyAddress("海翠花園").housing, "private");
    assert.equal(classifyAddress("Pierhead Garden").housing, "private");
    assert.equal(matchKnownEstate("湖翠路168-236號")?.name, "海翠花園");
    assert.equal(estate("啟豐園")?.housing, "private");
    assert.equal(classifyAddress("啟豐園").housing, "private");
    assert.equal(estate("雅典居")?.housing, "private");
    assert.equal(classifyAddress("Villa Athena").housing, "private");
    assert.equal(matchKnownEstate("西沙路600號")?.name, "雅典居");
    assert.equal(estate("海典灣")?.housing, "private");
    assert.equal(classifyAddress("Ocean View").housing, "private");
    assert.equal(estate("曉峯灣畔")?.housing, "private");
    assert.equal(classifyAddress("曉峰灣畔").housing, "private");
    assert.equal(classifyAddress("Mountain Shore").housing, "private");
    assert.notEqual(matchKnownEstate("曉峯灣畔")?.aliases.includes("Double Cove"), true);
    assert.equal(estate("海柏花園")?.housing, "private");
    assert.equal(classifyAddress("海栢花園").housing, "private");
    assert.equal(classifyAddress("Bayshore Towers").housing, "private");
    assert.equal(matchKnownEstate("西沙路608號")?.name, "海柏花園");
  });

  it("keeps large public estates as 公屋", () => {
    const publicEstates = [
      "尚德邨",
      "水泉澳邨",
      "安達邨",
      "安泰邨",
      "迎東邨",
      "海達邨",
      "怡明邨",
      "秀茂坪南邨",
      "長宏邨",
      "石蔭東邨",
      "富昌邨",
      "元州邨",
      "家維邨",
      "麗瑤邨",
      "俊宏軒",
    ];
    for (const name of publicEstates) {
      assert.equal(estate(name)?.housing, "public", name);
      assert.equal(classifyAddress(name).housing, "public", name);
    }
  });
});

describe("road / street false-positive estate matching", () => {
  it("does not map 永安大廈 + 長沙灣道 to 長沙灣邨 or unlock flash", () => {
    const wingOn = "永安大廈，長沙灣道 250-252號";
    assert.notEqual(matchKnownEstate(wingOn)?.name, "長沙灣邨");
    assert.equal(matchKnownEstate(wingOn), undefined);
    assert.equal(matchKnownEstate("永安大廈", "長沙灣道 250-252號"), undefined);
    assert.notEqual(matchKnownEstate("永安大廈")?.name, "長沙灣邨");
    assert.equal(isHkbnFlashEstate(wingOn), false);
    assert.equal(isHkbnFlashEstate("永安大廈"), false);
    assert.equal(estateUnlocksPlan(wingOn, HKBN_FLASH_OFFER_ESTATES), false);
    assert.equal(estateUnlocksPlan("永安大廈", HKBN_FLASH_OFFER_ESTATES), false);
    assert.ok(!names(wingOn).includes("長沙灣邨"));
    assert.ok(!names("永安大廈").includes("長沙灣邨"));
  });

  it("does not treat area aliases inside 道／路／街 as the estate", () => {
    assert.notEqual(matchKnownEstate("長沙灣道")?.name, "長沙灣邨");
    assert.equal(isHkbnFlashEstate("長沙灣道"), false);
    assert.equal(estateUnlocksPlan("長沙灣道", HKBN_FLASH_OFFER_ESTATES), false);
    assert.notEqual(matchKnownEstate("觀塘道")?.name, "觀塘邨");
    assert.notEqual(matchKnownEstate("柴灣道")?.name, "柴灣邨");
    assert.notEqual(matchKnownEstate("紅磡道")?.name, "紅磡邨");
  });

  it("still unlocks real flash estates and keeps 東頭村道 → 東頭村", () => {
    assert.equal(matchKnownEstate("長沙灣邨")?.name, "長沙灣邨");
    assert.equal(isHkbnFlashEstate("長沙灣邨"), true);
    assert.equal(estateUnlocksPlan("長沙灣邨", HKBN_FLASH_OFFER_ESTATES), true);
    assert.equal(matchKnownEstate("安泰邨")?.name, "安泰邨");
    assert.equal(isHkbnFlashEstate("安泰邨"), true);
    assert.equal(estateUnlocksPlan("安泰邨", HKBN_LPR_FLASH_ESTATES), true);
    for (const name of HKBN_FLASH_OFFER_ESTATES) {
      assert.equal(estateUnlocksPlan(name, HKBN_FLASH_OFFER_ESTATES), true, name);
    }
    for (const name of HKBN_LPR_FLASH_ESTATES) {
      assert.equal(estateUnlocksPlan(name, HKBN_LPR_FLASH_ESTATES), true, name);
    }
    assert.equal(matchKnownEstate("東頭村道")?.name, "東頭村");
    assert.equal(names("東頭村道")[0], "東頭村");
    assert.ok(!names("東頭村道").includes("東頭邨"));
  });
});

describe("search query tails, simplified, english", () => {
  it("converts simplified place names to traditional", () => {
    assert.equal(toTraditional("东头邨"), "東頭邨");
    assert.equal(toTraditional("东头村"), "東頭村");
    assert.equal(toTraditional("黄埔花园"), "黃埔花園");
    assert.equal(toTraditional("华富邨"), "華富邨");
    assert.equal(toTraditional("東頭邨"), "東頭邨");
  });

  it("finds estates when the query has 座／期／樓 tails", () => {
    assert.equal(names("太古城3座")[0], "太古城");
    assert.equal(names("太古城 9座")[0], "太古城");
    assert.equal(names("荃灣中心A座")[0], "荃灣中心");
    assert.equal(names("嘉湖山莊1期")[0], "天水圍嘉湖山莊");
    assert.equal(names("黃埔花園3期")[0], "黃埔花園");
    assert.equal(names("天耀邨耀豐樓")[0], "天耀邨耀豐樓");
    assert.equal(names("華富邨華安樓")[0], "華安樓");
  });

  it("finds estates from simplified and English full names", () => {
    assert.equal(names("东头邨")[0], "東頭邨");
    assert.equal(searchEstates("东头邨")[0]?.housing, "public");
    assert.equal(names("东头村")[0], "東頭村");
    assert.equal(searchEstates("东头村")[0]?.housing, "village");
    assert.ok(!names("东头村").includes("東頭邨"));
    assert.equal(names("黄埔花园")[0], "黃埔花園");
    assert.equal(names("Tin Yiu Estate")[0], "天耀邨");
    assert.equal(names("mei foo")[0], "美孚新邨");
  });

  it("still keeps 東頭村／東頭邨 anti-cross after tail matching", () => {
    assert.deepEqual(
      searchEstates("東頭村", 24).map((item) => item.name),
      ["東頭村"],
    );
    const estateHits = searchEstates("東頭邨", 24);
    assert.equal(estateHits[0]?.name, "東頭邨");
    assert.ok(estateHits.some((hit) => hit.name === "康東樓"));
    assert.ok(!estateHits.some((hit) => hit.name === "東頭村"));
    assert.equal(names("東頭村道")[0], "東頭村");
    assert.ok(!names("東頭村道").includes("東頭邨"));
  });

  it("classifies unique prefixes and longer addresses", () => {
    assert.equal(classifyAddress("太古").housing, "private");
    assert.equal(classifyAddress("太古城3座").housing, "private");
    assert.equal(classifyAddress("东头村").housing, "village");
    assert.equal(classifyAddress("东头邨").housing, "public");
    assert.equal(classifyAddress("Tin Yiu Estate").housing, "public");
    assert.equal(classifyAddress("東").housing, undefined);
    assert.equal(classifyAddress("東").confidence, "none");
  });

  it("treats 嶺樂活 as 樂嶺軒, and tags recent occupied estates", () => {
    assert.equal(estate("嶺樂活"), undefined);
    assert.equal(matchKnownEstate("嶺樂活")?.name, "樂嶺軒");
    assert.equal(matchKnownEstate("Sierra Terrace")?.name, "樂嶺軒");
    assert.equal(estate("樂嶺軒")?.housing, "hos");
    assert.equal(estate("盛頤居")?.housing, "public");
    assert.equal(matchKnownEstate("Blossom Place")?.name, "盛頤居");
    assert.equal(matchKnownEstate("Sierra Tower")?.name, "樂嶺樓");
    assert.equal(estate("高宏苑")?.housing, "hos");
    assert.equal(estate("清濤苑")?.housing, "hos");
    assert.equal(estate("The Monet")?.housing, "private");
    assert.equal(estate("The Monet")?.street, "龍庭里8號");
    assert.equal(matchKnownEstate("龍庭里8號")?.name, "The Monet");
    assert.equal(estate("博峯")?.housing, "private");
    assert.equal(matchKnownEstate("Mount Broadcast")?.name, "博峯");
    assert.equal(matchKnownEstate("廣播道79號")?.name, "博峯");
    assert.equal(estate("錦河邨")?.housing, "public");
    assert.equal(estate("錦河邨")?.coverageCheck, true);
    assert.equal(matchKnownEstate("華溢邨")?.name, "華富北邨");
    assert.equal(searchEstates("圓茶壺村", 4)[0]?.housing, "village");
    assert.equal(searchEstates("打鼓嶺新村", 4)[0]?.housing, "village");
    assert.equal(isNewIntakeEstate("漁映樓"), true);
    assert.equal(isNewIntakeEstate("兆翠苑"), true);
    assert.equal(isNewIntakeEstate("啟悅苑"), true);
    assert.equal(isNewIntakeEstate("瑜一"), true);
    assert.equal(isNewIntakeEstate("樂啟軒"), false);
    assert.equal(isNewIntakeEstate("滶晨"), true);
    assert.equal(isNewIntakeEstate("安秀苑"), true);
    assert.equal(isNewIntakeEstate("安柏苑"), true);
    assert.equal(isNewIntakeEstate("冠山苑"), true);
    assert.equal(isNewIntakeEstate("昭明苑"), true);
    assert.equal(isNewIntakeEstate("啟欣苑"), true);
    assert.equal(isNewIntakeEstate("驥華苑"), true);
    assert.equal(isNewIntakeEstate("啟鑽苑"), true);
    assert.equal(isNewIntakeEstate("柏蔚森"), true);
    assert.equal(isNewIntakeEstate("尚逸"), true);
    assert.equal(isNewIntakeEstate("泓璟"), true);
    assert.equal(isNewIntakeEstate("朗賢峯"), true);
    assert.equal(isNewIntakeEstate("峻譽渣甸山"), true);
    assert.equal(isNewIntakeEstate("One Stanley"), true);
    assert.equal(isNewIntakeEstate("Mount Pokfulam"), true);
    assert.equal(isNewIntakeEstate("滿．意"), true);
    assert.equal(isNewIntakeEstate("恒苑"), false);
    assert.equal(isNewIntakeEstate("皇璇"), false);
    assert.equal(isNewIntakeEstate("海璇"), true);
    assert.equal(estate("柏蔚森")?.housing, "private");
    assert.equal(estate("柏蔚森")?.street, "承景街2號");
    assert.equal(matchKnownEstate("The Pavilia Forest")?.name, "柏蔚森");
    assert.equal(estate("尚逸")?.housing, "private");
    assert.equal(matchKnownEstate("德輔道西328號")?.name, "尚逸");
    assert.equal(estate("泓璟")?.housing, "private");
    assert.equal(matchKnownEstate("ONE LIBERTY")?.name, "泓璟");
    assert.equal(estate("滶晨")?.housing, "private");
    assert.equal(estate("滶晨")?.street, "香葉道11號");
    assert.equal(matchKnownEstate("Deep Water Pavilia II")?.name, "滶晨");
    assert.equal(estate("樂啟軒")?.coverageCheck, true);
    assert.equal(estate("樂啟樓")?.housing, "public");
    assert.equal(estate("樂真樓")?.housing, "public");
    assert.equal(matchKnownEstate("沐縉街2號")?.name, "樂啟軒");
    assert.equal(estate("恒苑")?.housing, "village");
    assert.equal(estate("朗賢峯")?.housing, "private");
    assert.equal(matchKnownEstate("Onmantin")?.name, "朗賢峯");
    assert.equal(estate("峻譽渣甸山")?.housing, "private");
    assert.equal(matchKnownEstate("Jardini")?.name, "峻譽渣甸山");
    assert.equal(matchKnownEstate("ONE TOSCANA")?.name, "滿．意");
    assert.equal(estate("海璇")?.street, "渣華道133號");
    assert.equal(estate("皇璇")?.coverageCheck, true);
    assert.equal(matchKnownEstate("STATE RESIDENCE")?.name, "皇璇");
    assert.equal(estate("太子道西233號")?.housing, "private");
    assert.equal(matchKnownEstate("Park Seasons")?.name, "日出康城第12期");
    assert.equal(matchKnownEstate("攸潭美")?.name, "攸潭尾");
    assert.equal(estate("欣雅苑")?.housing, "hos");
    assert.equal(estate("欣雅苑")?.coverageCheck, true);
    assert.equal(estate("曉雅苑")?.street, "頌雅路7號");
    assert.equal(estate("啟陽苑")?.street, "沐和街8號");
    assert.equal(estate("裕豐苑")?.street, "匯東街12號");
    assert.equal(estate("寶石大廈")?.housing, "hos");
    assert.equal(searchEstates("大美督", 4)[0]?.housing, "village");
    assert.equal(searchEstates("衙前圍村", 4)[0]?.housing, "village");
    assert.equal(searchEstates("東涌石門甲", 4)[0]?.name, "東涌石門甲");
    assert.equal(searchEstates("北潭涌", 4)[0]?.housing, "village");
    assert.equal(searchEstates("斬竹灣", 4)[0]?.name, "斬竹灣");
    assert.equal(searchEstates("黃石碼頭", 4)[0]?.name, "西貢黃石");
    assert.equal(searchEstates("大埔龍尾", 4)[0]?.housing, "village");
    assert.equal(estate("華第")?.housing, "private");
    assert.equal(estate("華第")?.street, "粉錦公路333號");
    assert.equal(matchKnownEstate("Cadenza")?.name, "華第");
    assert.equal(estate("尚柏")?.housing, "private");
    assert.equal(matchKnownEstate("The Parkland")?.name, "尚柏");
    assert.equal(estate("連方")?.housing, "private");
    assert.equal(matchKnownEstate("Bondlane")?.name, "連方");
    assert.equal(estate("吉喆")?.street, "吉席街33號");
    assert.equal(estate("THE BOUNDARY")?.street, "界限街2C號");
    assert.equal(estate("北都滙")?.coverageCheck, undefined);
    assert.equal(estate("北都滙")?.street, "鄉梓路25號");
    assert.equal(matchKnownEstate("North Innovale")?.name, "北都滙");
    assert.equal(estate("33清水灣")?.coverageCheck, true);
    assert.equal(estate("Victoria Blossom")?.coverageCheck, true);
    assert.equal(estate("映匯")?.coverageCheck, true);
    assert.equal(estate("皇都")?.coverageCheck, true);
    assert.equal(isNewIntakeEstate("華第"), true);
    assert.equal(isNewIntakeEstate("尚柏"), false);
    assert.equal(isNewIntakeEstate("連方"), true);
    assert.equal(isNewIntakeEstate("北都滙"), true);
    assert.equal(isNewIntakeEstate("皇都"), false);
    assert.equal(estate("瑜意")?.housing, "private");
    assert.equal(estate("瑜意")?.street, "德興街8號");
    assert.equal(matchKnownEstate("Zendo House")?.name, "瑜意");
    assert.equal(isNewIntakeEstate("瑜意"), true);
    assert.equal(estate("薈淳")?.housing, "private");
    assert.equal(estate("薈淳")?.street, "飛鳳街33號");
    assert.equal(matchKnownEstate("CONNEXT")?.name, "薈淳");
    assert.equal(isNewIntakeEstate("薈淳"), true);
    assert.equal(estate("One Innovale")?.street, "馬適路8號");
    assert.equal(isNewIntakeEstate("One Innovale"), false);
    assert.equal(estate("雲向")?.coverageCheck, true);
    assert.equal(matchKnownEstate("CLOUDVIEW")?.name, "雲向");
    assert.equal(isNewIntakeEstate("雲向"), false);
    assert.equal(estate("滶蘊")?.coverageCheck, true);
    assert.equal(matchKnownEstate("Pavilia Rosa")?.name, "滶蘊");
    assert.equal(estate("海瑅灣")?.coverageCheck, true);
    assert.equal(estate("芊御")?.coverageCheck, true);
    assert.equal(searchEstates("粉嶺永寧圍", 4)[0]?.name, "永寧圍");
    assert.equal(searchEstates("西貢鹽田仔", 4)[0]?.housing, "village");
    assert.equal(searchEstates("大嶼山水口", 4)[0]?.name, "大嶼山水口");
    assert.equal(searchEstates("屯門小秀村", 4)[0]?.name, "屯門小秀村");
    assert.equal(searchEstates("鎖羅盆", 4)[0]?.housing, "village");
    assert.equal(searchEstates("萬角咀", 4)[0]?.housing, "village");
    assert.equal(searchEstates("礦山村", 4)[0]?.housing, "village");
    assert.equal(searchEstates("唐人新村", 4)[0]?.housing, "village");
    assert.equal(searchEstates("和生圍", 4)[0]?.name, "和生圍");
    assert.equal(searchEstates("流水响", 4)[0]?.housing, "village");
    assert.equal(searchEstates("鶴藪圍", 4)[0]?.name, "鶴藪");
    assert.equal(estate("南灣苑")?.housing, "hos");
    assert.equal(matchKnownEstate("Nam Wan Court")?.name, "南灣苑");
    assert.equal(estate("漁映樓")?.street, "石排灣道33號");
    assert.equal(matchKnownEstate("石排灣道33號")?.name, "漁映樓");
    assert.equal(estate("澐璟")?.housing, "private");
    assert.equal(estate("澐璟")?.street, "承富里2號");
    assert.equal(matchKnownEstate("Pano Harbour")?.name, "澐璟");
    assert.equal(isNewIntakeEstate("澐璟"), true);
    assert.equal(estate("滶蘊")?.street, "玫瑰街28號");
    assert.equal(isNewIntakeEstate("滶蘊"), false);
    assert.equal(isNewIntakeEstate("海瑅灣"), false);
    assert.equal(isNewIntakeEstate("凱柏峰"), true);
    assert.equal(matchKnownEstate("Villa Garda")?.name, "凱柏峰");
    assert.equal(matchKnownEstate("Montego Bay")?.name, "蔚藍東岸");
    assert.equal(estate("蔚藍東岸")?.housing, "private");
    assert.equal(estate("曉柏峰")?.housing, "private");
    assert.equal(estate("曉柏峰")?.street, "西洋菜北街456號");
    assert.equal(matchKnownEstate("The Paddington")?.name, "曉柏峰");
    assert.equal(isNewIntakeEstate("曉柏峰"), true);
    assert.equal(isNewIntakeEstate("順利邨道簡約公屋"), false);
    assert.equal(estate("順利邨道簡約公屋")?.housing, "public");
    assert.equal(estate("竹園道簡約公屋")?.coverageCheck, true);
    assert.equal(searchEstates("鹽田梓", 4)[0]?.housing, "village");
    assert.equal(searchEstates("飛鵝山村", 4)[0]?.housing, "village");
    assert.equal(estate("翔東邨")?.street, "迎東路11號");
    assert.equal(estate("滿田邨")?.street, "滿田里6號");
    assert.equal(estate("曉茵邨")?.street, "曉明街9號");
    assert.equal(estate("業旺邨")?.street, "天后路21號");
    assert.equal(matchKnownEstate("世運道第二期")?.name, "世運道簡約公屋");
    assert.equal(estate("高曦苑")?.street, "碧雲道5號");
    assert.equal(estate("兆湖苑")?.street, "龍門路75號");
    assert.equal(estate("柏瓏")?.housing, "private");
    assert.equal(estate("柏瓏")?.street, "錦河路29號");
    assert.equal(matchKnownEstate("Grand Mayfair")?.name, "柏瓏");
    assert.equal(isNewIntakeEstate("柏瓏"), true);
    assert.equal(estate("UNI Residence")?.street, "顯和里7號");
    assert.equal(isNewIntakeEstate("UNI Residence"), true);
    assert.equal(estate("映居")?.coverageCheck, undefined);
    assert.equal(estate("映居")?.street, "埃華街3號");
    assert.equal(isNewIntakeEstate("映居"), true);
    assert.equal(estate("擎海")?.coverageCheck, true);
    assert.equal(estate("擎海")?.street, "東源街15號");
    assert.equal(isNewIntakeEstate("擎海"), false);
    assert.equal(estate("朗然")?.housing, "hos");
    assert.equal(isNewIntakeEstate("朗然"), true);
    assert.equal(isNewIntakeEstate("飛揚"), true);
    assert.equal(isNewIntakeEstate("凱和山"), true);
    assert.equal(isNewIntakeEstate("晉環"), true);
    assert.equal(isNewIntakeEstate("揚海"), true);
    assert.equal(isNewIntakeEstate("蔚藍東岸"), true);
    assert.equal(isNewIntakeEstate("天瀧"), true);
    assert.equal(isNewIntakeEstate("天御"), true);
    assert.equal(isNewIntakeEstate("幸薈"), true);
    assert.equal(isNewIntakeEstate("半山名滙"), true);
    assert.equal(isNewIntakeEstate("映匯"), false);
    assert.equal(isNewIntakeEstate("柏景峰"), false);
    assert.equal(estate("天瀧")?.street, "承豐道22號");
    assert.equal(matchKnownEstate("The Knightsbridge")?.name, "天瀧");
    assert.equal(estate("天御")?.street, "衛城道8號");
    assert.equal(matchKnownEstate("THE LEGACY")?.name, "天御");
    assert.equal(estate("幸薈")?.street, "青山道439號");
    assert.equal(matchKnownEstate("Soyo Square")?.name, "幸薈");
    assert.equal(estate("半山名滙")?.housing, "private");
    assert.equal(estate("半山名滙")?.street, "高街6號");
    assert.equal(matchKnownEstate("UPPER MANOR")?.name, "半山名滙");
    assert.equal(matchKnownEstate("高街6號")?.name, "半山名滙");
    assert.equal(estate("海嵎")?.housing, "private");
    assert.equal(estate("海嵎")?.street, "爹核士街1D號");
    assert.equal(isNewIntakeEstate("海嵎"), true);
    assert.equal(matchKnownEstate("KENNEDY BAY")?.name, "海嵎");
    assert.equal(matchKnownEstate("爹核士街1D號")?.name, "海嵎");
    assert.equal(estateEnglishName(estate("海嵎")!), "KENNEDY BAY");
    assert.equal(estate("雅盈峰")?.housing, "private");
    assert.equal(estate("雅盈峰")?.street, "己連拿利3號");
    assert.equal(isNewIntakeEstate("雅盈峰"), true);
    assert.equal(matchKnownEstate("Central Residence By The Park")?.name, "雅盈峰");
    assert.equal(estateEnglishName(estate("雅盈峰")!), "Central Residence By The Park");
    assert.equal(estate("嘉居天后")?.housing, "private");
    assert.equal(estate("嘉居天后")?.coverageCheck, true);
    assert.equal(isNewIntakeEstate("嘉居天后"), false);
    assert.equal(matchKnownEstate("KABITAT TIN HAU")?.name, "嘉居天后");
    assert.equal(matchKnownEstate("英皇道33號")?.name, "嘉居天后");
    assert.equal(estate("堅尼地道33號")?.housing, "private");
    assert.equal(isNewIntakeEstate("堅尼地道33號"), true);
    assert.equal(matchKnownEstate("33 Kennedy Road")?.name, "堅尼地道33號");
    assert.equal(estate("太子壹號")?.street, "基隆街1號");
    assert.equal(isNewIntakeEstate("太子壹號"), true);
    assert.equal(matchKnownEstate("ONE EDWARD")?.name, "太子壹號");
    assert.equal(searchEstates("榕樹灣", 4)[0]?.name, "南丫島榕樹灣");
    assert.equal(searchEstates("索罟灣", 4)[0]?.name, "南丫島索罟灣");
    assert.equal(searchEstates("竹坑村", 4)[0]?.name, "八鄉竹坑");
    assert.equal(estate("八鄉竹坑")?.housing, "village");
    assert.equal(estate("天璽天")?.street, "協調道10號");
    assert.equal(matchKnownEstate("Cullinan Sky II")?.name, "天璽天");
    assert.equal(matchKnownEstate("The Reserve")?.name, "黃金海灣");
    assert.equal(estateEnglishName(estate("尚逸")!), "Des Voeux W Residence");
    assert.equal(estate("柏景峰")?.coverageCheck, true);
    assert.equal(matchKnownEstate("One Park Place")?.name, "柏景峰");
    assert.equal(matchKnownEstate("花語海")?.name, "Victoria Blossom");
    assert.equal(estate("御景園")?.street, "公園南路25號");
    assert.equal(estateEnglishName(estate("御景園")!), "Scenic Gardens");
    assert.equal(estate("啟德1號")?.area, "啟德");
    assert.equal(estateEnglishName(estate("啟德1號")!), "ONE KAI TAK");
    assert.equal(isNewIntakeEstate("啟陽苑"), false);
    assert.equal(isNewIntakeEstate("影輝苑"), false);
    assert.equal(isNewIntakeEstate("匯熙苑"), false);
    assert.equal(isNewIntakeEstate("朗風苑"), false);
    assert.equal(isNewIntakeEstate("裕豐苑"), false);
    assert.equal(matchKnownEstate("Grand Jete")?.name, "飛揚");
    assert.equal(estate("飛揚")?.street, "青山公路－大欖段170號");
    assert.equal(matchKnownEstate("MORI")?.name, "凱和山");
    assert.equal(estate("凱和山")?.street, "管翠路18號");
    assert.equal(estate("尚岸")?.street, "青霞里8號");
    assert.equal(estate("One Central Place")?.street, "卑利街23及25號");
    assert.equal(matchKnownEstate("結志街33號")?.name, "One Central Place");
    assert.equal(estate("Belgravia Place I")?.street, "巴域街1號");
    assert.equal(estate("欣寶路項目")?.coverageCheck, undefined);
    assert.equal(estate("麗晶花園")?.housing, "private");
    assert.equal(estate("雋東邨")?.coverageCheck, undefined);
    assert.equal(estateEnglishName(estate("飛揚")!), "Grand Jete");
    assert.equal(estateEnglishName(estate("凱和山")!), "MORI");
    assert.equal(estateEnglishName(estate("晉環")!), "La Splendeur");
    assert.equal(estateEnglishName(estate("樂嶺都匯")!), "Lok Ling Hub");
    assert.equal(estateEnglishName(estate("名鑽")!), "One Princeton");
    assert.equal(estateEnglishName(estate("隆敍")!), "Terra");
    assert.equal(estateEnglishName(estate("彩虹道邨")!), "Choi Hung Road Estate");
    assert.equal(estate("盛緻苑")?.street, "宏照道3號");
    assert.equal(estate("鳳凰嶺邨")?.street, "馬適路");
    assert.equal(estate("Mount Pokfulam")?.street, "薄扶林道86A-G號");
    assert.equal(estateEnglishName(estate("Sierra Sea")!), "Sierra Sea");
    assert.equal(estateEnglishName(estate("The Monet")!), "The Monet");
    assert.equal(estateEnglishName(estate("One Stanley")!), "One Stanley");
    assert.equal(estateEnglishName(estate("Elize Park")!), "Elize Park");
    assert.equal(estateEnglishName(estate("101 Kings Road")!), "101 Kings Road");
    assert.equal(matchKnownEstate("攸潭美(一)")?.name, "攸潭尾");
    assert.equal(matchKnownEstate("福亨村(上)")?.name, "福亨村");
    assert.equal(matchKnownEstate("元崗村")?.name, "元崗");
    assert.equal(matchKnownEstate("洲頭村")?.name, "洲頭");
    assert.equal(searchEstates("青衣鹽田角村", 4)[0]?.housing, "village");
    assert.equal(searchEstates("青衣楓樹窩村", 4)[0]?.housing, "village");
    assert.equal(matchKnownEstate("海壩(南台)")?.name, "海壩南台");
    assert.equal(matchKnownEstate("海壩(東北台)")?.name, "海壩東北台");
    assert.equal(searchEstates("十塱", 4)[0]?.housing, "village");
    assert.equal(searchEstates("牙鷹洲", 4)[0]?.housing, "village");
    assert.equal(searchEstates("東涌舊碼頭", 4)[0]?.housing, "village");
    assert.equal(searchEstates("荃灣南灣", 4)[0]?.name, "荃灣南灣");
    assert.equal(searchEstates("汾流", 4)[0]?.name, "分流");
    assert.equal(matchKnownEstate("Park Silicon")?.name, "Palo Springs");
    assert.equal(estate("Palo Springs")?.coverageCheck, true);
    assert.equal(estate("朗譽")?.housing, "private");
    assert.equal(estate("朗譽")?.street, "高超道29號");
    assert.equal(estateEnglishName(estate("朗譽")!), "Chill Residence");
    assert.equal(matchKnownEstate("Chill Residence")?.name, "朗譽");
    assert.equal(isNewIntakeEstate("朗譽"), true);
    assert.equal(estate("南首")?.housing, "private");
    assert.equal(estate("南首")?.street, "南角道8號");
    assert.equal(estateEnglishName(estate("南首")!), "Eight Southpark");
    assert.equal(matchKnownEstate("Eight Southpark")?.name, "南首");
    assert.equal(isNewIntakeEstate("南首"), true);
    assert.equal(estateEnglishName(estate("映居")!), "foto+");
    assert.equal(matchKnownEstate("THE RESERVE")?.name, "黃金海灣");
    assert.equal(searchEstates("北角舊村", 4)[0]?.housing, "village");
    assert.equal(searchEstates("梅窩白芒", 4)[0]?.housing, "village");
    assert.equal(searchEstates("坪洲圍仔", 4)[0]?.housing, "village");
    assert.equal(searchEstates("牙較灣", 4)[0]?.name, "牙較灣");
  });
});

describe("Yoho suggest ranking (阿祺 locked case)", () => {
  it("Yoho / yoho lists only the YOHO series, never 朗城匯 or 芊御", () => {
    for (const query of ["Yoho", "yoho", "YOHO"]) {
      const hits = searchEstates(query, 24);
      const hitNames = hits.map((item) => item.name);
      assert.ok(hitNames.includes("YOHO Town"), query);
      assert.ok(hitNames.includes("YOHO Midtown"), query);
      assert.ok(hitNames.includes("YOHO West"), query);
      assert.ok(hitNames.includes("Grand YOHO"), query);
      assert.ok(!hitNames.includes("朗城匯"), query);
      assert.ok(!hitNames.includes("芊御"), query);
      assert.ok(!hitNames.includes("峻巒"), query);
      assert.ok(hits.every((item) => allowSuggestHitForQuery(query, item.name)), query);
    }
  });

  it("still finds YOHO Hub / 朗城匯 / 朗城滙 and 芊御 on specific queries", () => {
    assert.equal(estate("朗城匯")?.aliases.includes("YOHO Hub"), true);
    assert.equal(estate("芊御")?.aliases.includes("The YOHO 芊御"), true);
    assert.equal(names("YOHO Hub")[0], "朗城匯");
    assert.equal(names("The Yoho Hub")[0], "朗城匯");
    assert.equal(names("朗城匯")[0], "朗城匯");
    assert.equal(names("朗城滙")[0], "朗城匯");
    assert.equal(names("芊御")[0], "芊御");
    assert.equal(names("The YOHO 芊御")[0], "芊御");
    assert.equal(matchKnownEstate("YOHO Hub")?.name, "朗城匯");
    assert.equal(matchKnownEstate("朗城匯")?.name, "朗城匯");
    assert.equal(matchKnownEstate("朗城滙")?.name, "朗城匯");
    assert.equal(matchKnownEstate("The YOHO 芊御")?.name, "芊御");
    assert.equal(matchKnownEstate("Yoho")?.name, "YOHO Town");
  });
});

describe("phase 1 search ranking and filters", () => {
  it("prioritises 太古城 for 太古 and mixed CJK/EN / fullwidth input", () => {
    assert.equal(names("太古")[0], "太古城");
    assert.equal(names("太古 Shing")[0], "太古城");
    assert.equal(names("Ｔａｉｋｏｏ Ｓｈｉｎｇ")[0], "太古城");
    assert.equal(compact("Ｔａｉｋｏｏ"), "taikoo");
    assert.equal(compact("朗城滙"), compact("朗城匯"));
  });

  it("expands Rd/St tails without reopening 長沙灣道 → 長沙灣邨", () => {
    assert.equal(names("Choi Hung Rd")[0], "彩虹道邨");
    assert.ok(!names("Choi Hung Rd").includes("彩虹邨"));
    assert.notEqual(matchKnownEstate("長沙灣道")?.name, "長沙灣邨");
    assert.notEqual(matchKnownEstate("Cheung Sha Wan Rd")?.name, "長沙灣邨");
    assert.notEqual(matchKnownEstate("Cheung Sha Wan Road")?.name, "長沙灣邨");
    assert.equal(isHkbnFlashEstate("長沙灣道"), false);
    assert.equal(estateUnlocksPlan("長沙灣道", HKBN_FLASH_OFFER_ESTATES), false);
    assert.equal(isHkbnFlashEstate("用呢個名稱繼續"), false);
    assert.equal(estateUnlocksPlan("長沙灣道", HKBN_FLASH_OFFER_ESTATES), false);
    assert.equal(matchKnownEstate("長沙灣邨")?.name, "長沙灣邨");
    assert.equal(isHkbnFlashEstate("長沙灣邨"), true);
  });

  it("does not drop village houses or tong lau", () => {
    for (const name of ["東頭村", "劉氏村屋", "馬灣漁民村屋1號", "永樂唐樓", "協成唐樓", "官涌唐樓"]) {
      assert.equal(isImpracticalPlace(name), false, name);
    }
    assert.equal(classifyAddress("東頭村").housing, "village");
    assert.equal(searchEstates("東頭村", 8)[0]?.name, "東頭村");
  });

  it("drops more non-residential gov-style names without touching 中心／廣場 estates", () => {
    for (const name of ["太古站", "太古小學", "天耀社區中心", "港鐵太古站", "Henley Park停車場", "Tai Koo Station"]) {
      assert.equal(isImpracticalPlace(name), true, name);
    }
    assert.equal(isImpracticalPlace("將軍澳中心"), false);
    assert.equal(isImpracticalPlace("大埔廣場"), false);
    assert.equal(isImpracticalPlace("廟街"), false);
  });
});

describe("phase 2 Lok Fu catalogue blocks (HA PRH stock)", () => {
  const LOK_FU_HA_BLOCKS = [
    "宏康樓",
    "宏樂樓",
    "宏順樓",
    "宏達樓",
    "宏逸樓",
    "宏旭樓",
    "樂東樓",
    "樂民樓",
    "樂謙樓",
    "樂翠樓",
    "樂泰樓",
  ] as const;

  it("links sourced 樂富邨 blocks including 樂泰樓, and does not invent old names", () => {
    assert.equal(estate("樂富邨")?.housing, "public");
    assert.equal(parentEstate("樂富邨"), undefined);
    const blocks = relatedBlocks("樂富邨").map((item) => item.name);
    for (const name of LOK_FU_HA_BLOCKS) {
      assert.ok(blocks.includes(name), name);
      assert.equal(estate(name)?.housing, "public", name);
      assert.equal(estate(name)?.district, "黃大仙", name);
      assert.ok(estate(name)?.aliases.includes(`樂富邨${name}`), name);
      assert.equal(parentEstate(name)?.name, "樂富邨", name);
      assert.equal(isRelatedBlock(estate(name)!, estate("樂富邨")!), true, name);
    }
    assert.equal(blocks.length, LOK_FU_HA_BLOCKS.length);
    for (const invented of ["康樓", "樂樓", "順樓", "達樓", "逸樓", "旭樓", "樂安樓", "樂智樓", "樂和樓", "樂禧樓", "樂逸樓", "樂旺樓"]) {
      assert.equal(blocks.includes(invented), false, invented);
      assert.notEqual(parentEstate(invented)?.name, "樂富邨", invented);
    }
    assert.equal(matchKnownEstate("樂泰樓")?.name, "樂泰樓");
    assert.equal(matchKnownEstate("樂富邨樂泰樓")?.name, "樂泰樓");
    assert.equal(matchKnownEstate("Lok Tai House")?.name, "樂泰樓");
    assert.equal(searchEstates("樂富邨", 24)[0]?.name, "樂富邨");
    assert.ok(searchEstates("樂富邨", 24).some((item) => item.name === "樂泰樓"));
    assert.equal(searchEstates("樂泰樓")[0]?.name, "樂泰樓");
    assert.equal(matchKnownEstate("樂民")?.name, "樂民新村");
    assert.notEqual(matchKnownEstate("樂民")?.name, "樂民樓");
    assert.equal(matchKnownEstate("樂民樓")?.name, "樂民樓");
  });

  it("does not change flash unlock / matchKnownEstate road rules", () => {
    assert.notEqual(matchKnownEstate("長沙灣道")?.name, "長沙灣邨");
    assert.equal(isHkbnFlashEstate("長沙灣道"), false);
    assert.equal(estateUnlocksPlan("長沙灣道", HKBN_FLASH_OFFER_ESTATES), false);
    assert.equal(matchKnownEstate("長沙灣邨")?.name, "長沙灣邨");
    assert.equal(isHkbnFlashEstate("長沙灣邨"), true);
    assert.equal(relatedBlocks("東頭村").length, 0);
  });
});

function sourcedBlockNames(parent) {
  return relatedBlocks(parent).flatMap((item) => [item.name, ...item.aliases]);
}

describe("HA PRH bulk catalogue blocks", () => {
  it("keeps sourced 樂富邨 blocks and still does not add 樂民 as a short alias", () => {
    const blocks = relatedBlocks("樂富邨").map((item) => item.name);
    assert.ok(blocks.includes("樂泰樓"));
    assert.equal(blocks.length, 11);
    assert.equal(matchKnownEstate("樂民")?.name, "樂民新村");
    assert.equal(estate("樂泰樓")?.aliases.includes("樂民"), false);
    assert.equal(estate("樂民樓")?.aliases.includes("樂民"), false);
  });

  it("links HA blocks on 天耀邨 / 尚德邨 / 水泉澳邨 for Phase 2 step 2", () => {
    assert.ok(sourcedBlockNames("天耀邨").some((name) => name.includes("耀豐樓")));
    assert.ok(sourcedBlockNames("天耀邨").some((name) => name.includes("耀盛樓")));
    assert.equal(parentEstate("天耀邨耀豐樓")?.name, "天耀邨");
    assert.equal(parentEstate("華安樓")?.name, "華富邨");
    assert.equal(parentEstate("尚智樓")?.name, "尚德邨");
    assert.equal(estate("天耀邨")?.housing, "public");
    assert.ok(relatedBlocks("天耀邨").length >= 8);
    assert.ok(relatedBlocks("天耀邨").every((item) => item.housing === "public"));
    assert.ok(relatedBlocks("尚德邨").some((item) => item.name === "尚智樓" || item.aliases.includes("尚德邨尚智樓")));
    assert.ok(relatedBlocks("水泉澳邨").some((item) => item.name === "清泉樓" || item.aliases.includes("水泉澳邨清泉樓")));
    assert.equal(blockStepKindName("天耀邨"), "catalogue");
    assert.equal(blockStepKindName("尚德邨"), "catalogue");
    assert.equal(blockStepKindName("YOHO Town"), "lookup");
  });

  it("does not invent skipped estate names or attach 東頭村 / Yoho / 嘉湖", () => {
    assert.equal(relatedBlocks("東頭村").length, 0);
    assert.equal(relatedBlocks("YOHO Town").length, 0);
    assert.equal(relatedBlocks("天水圍嘉湖山莊").length, 0);
    assert.equal(relatedBlocks("彩明苑").every((item) => item.housing === "hos"), true);
    assert.equal(estate("彩富閣"), undefined);
    assert.equal(searchEstates("嘉湖山莊1期", 8)[0]?.name, "天水圍嘉湖山莊");
  });
});

function blockStepKindName(name) {
  const row = estate(name);
  if (!row) return undefined;
  if (parentEstate(row)) return "none";
  if (relatedBlocks(row).length) return "catalogue";
  return "lookup";
}

