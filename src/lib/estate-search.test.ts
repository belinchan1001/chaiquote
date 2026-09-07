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
  isCatalogueParent,
  isImpracticalPlace,
  isRelatedBlock,
  matchKnownEstate,
  relatedBlocks,
  searchEstates,
} from "./estates.ts";

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
    for (const name of ["東頭邨", "東頭村", "康東樓", "美東樓", "彩明苑", "彩楊閣", "廟街"]) {
      assert.equal(isImpracticalPlace(name), false, name);
    }
    for (const item of ESTATES) {
      assert.equal(isImpracticalPlace(item.name), false, item.name);
    }
    assert.equal(isImpracticalPlace("黃大仙廟"), true);
    assert.equal(classifyAddress("東頭邨管理處").housing, undefined);
    assert.equal(classifyAddress("東頭邨").housing, "public");
  });
});
