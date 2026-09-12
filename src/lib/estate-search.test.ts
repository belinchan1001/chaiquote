import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  allowGovHitForQuery,
  classifyAddress,
  ESTATES,
  estateLabel,
  estateStreet,
  isBareHousingTypeQuery,
  isCatalogueParent,
  isImpracticalPlace,
  isRelatedBlock,
  shouldDropAsNoise,
  matchKnownEstate,
  relatedBlocks,
  searchEstates,
} from "./estates.ts";
import { toTraditional } from "./zh-s2t.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

function estate(name: string) {
  return ESTATES.find((item) => item.name === name);
}

function names(query: string) {
  return searchEstates(query, 12).map((item) => item.name);
}

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
    assert.match(messages, /coverageCheck: "覆蓋需查核"/);
    assert.match(messages, /僅供參考/);
    assert.match(messages, /查核報價/);
    assert.match(messages, /noisePlaceHint: "呢類地點多半唔適合申請，請 WhatsApp 查核報價"/);
    const suggest = readFileSync(join(ROOT, "src/components/estate-suggest.tsx"), "utf8");
    assert.match(suggest, /coverageCheck/);
    assert.match(suggest, /noisePlaceHint/);
    const plans = readFileSync(join(ROOT, "src/routes/plans.tsx"), "utf8");
    assert.match(plans, /coverageCheck/);
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
    assert.match(messages, /coverageCheck: "覆蓋需查核"/);
    assert.match(messages, /僅供參考/);
    assert.match(messages, /查核報價/);
    assert.match(messages, /noisePlaceHint: "呢類地點多半唔適合申請，請 WhatsApp 查核報價"/);
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
    assert.equal(classifyAddress("南灣苑").housing, "private");
    assert.equal(matchKnownEstate("南灣苑")?.name, "南灣花園");
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
      "祈德尊新邨",
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
    ];
    for (const name of publicEstates) {
      assert.equal(estate(name)?.housing, "public", name);
      assert.equal(classifyAddress(name).housing, "public", name);
    }
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
    assert.equal(names("天耀邨耀豐樓")[0], "天耀邨");
    assert.equal(names("華富邨華安樓")[0], "華富邨");
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
});
