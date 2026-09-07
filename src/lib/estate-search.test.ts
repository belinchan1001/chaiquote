import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyAddress,
  ESTATES,
  estateLabel,
  matchKnownEstate,
  searchEstates,
} from "./estates.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

function estate(name: string) {
  return ESTATES.find((item) => item.name === name);
}

function names(query: string) {
  return searchEstates(query, 12).map((item) => item.name);
}

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
  });
});
