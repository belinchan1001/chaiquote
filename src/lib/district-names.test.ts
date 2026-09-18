import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DISTRICTS } from "./site.ts";
import { DISTRICT_EN, districtDisplayName, districtEnglishName } from "./district-names.ts";

const EXPECTED_EN: Record<(typeof DISTRICTS)[number], string> = {
  中西區: "Central and Western",
  灣仔: "Wan Chai",
  東區: "Eastern",
  南區: "Southern",
  油尖旺: "Yau Tsim Mong",
  深水埗: "Sham Shui Po",
  九龍城: "Kowloon City",
  黃大仙: "Wong Tai Sin",
  觀塘: "Kwun Tong",
  荃灣: "Tsuen Wan",
  屯門: "Tuen Mun",
  元朗: "Yuen Long",
  北區: "North",
  大埔: "Tai Po",
  沙田: "Sha Tin",
  西貢: "Sai Kung",
  葵青: "Kwai Tsing",
  離島: "Islands",
};

describe("district English name map", () => {
  it("covers every official catalogue district and no extras", () => {
    assert.deepEqual([...DISTRICTS], Object.keys(DISTRICT_EN));
    assert.deepEqual([...DISTRICTS], Object.keys(EXPECTED_EN));
    for (const district of DISTRICTS) {
      assert.equal(DISTRICT_EN[district], EXPECTED_EN[district]);
      assert.equal(districtEnglishName(district), EXPECTED_EN[district]);
    }
  });

  it("shows English on en and keeps Chinese on zh", () => {
    assert.equal(districtDisplayName("元朗", "en"), "Yuen Long");
    assert.equal(districtDisplayName("黃大仙", "en"), "Wong Tai Sin");
    assert.equal(districtDisplayName("中西區", "en"), "Central and Western");
    assert.equal(districtDisplayName("元朗", "zh"), "元朗");
    assert.equal(districtDisplayName("黃大仙", "zh"), "黃大仙");
    assert.equal(districtDisplayName("中西區"), "中西區");
  });

  it("keeps Chinese when there is no mapping", () => {
    assert.equal(districtEnglishName("天水圍"), undefined);
    assert.equal(districtEnglishName("啟德"), undefined);
    assert.equal(districtEnglishName("灣仔區"), undefined);
    assert.equal(districtDisplayName("天水圍", "en"), "天水圍");
    assert.equal(districtDisplayName("未知地區", "en"), "未知地區");
  });

  it("trims input and does not invent a translation", () => {
    assert.equal(districtEnglishName(" 沙田 "), "Sha Tin");
    assert.equal(districtEnglishName("Sha Tin"), undefined);
  });
});
