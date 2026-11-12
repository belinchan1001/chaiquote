import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { confirmedFibreProviders } from "./estate-fibre-coverage.ts";
import { filterPlans } from "./plan-filter.ts";
import { matchKnownEstate } from "./estates.ts";

function providers(estate: string) {
  return [...new Set(filterPlans({ cat: "broadband", estate }).map((plan) => plan.providerId))].sort();
}

describe("confirmed home fibre coverage", () => {
  it("lists only the checked carriers, and blocks inherit the parent estate", () => {
    assert.deepEqual(confirmedFibreProviders("雋東邨"), ["hkbn", "cmhk", "hgc", "netvigator"]);
    assert.deepEqual(providers("雋東邨"), ["cmhk", "hgc", "hkbn", "netvigator"]);
    assert.deepEqual(providers("雋才樓"), ["cmhk", "hgc", "hkbn", "netvigator"]);
    assert.deepEqual(providers("翔東邨"), ["cmhk", "hgc", "hkbn", "netvigator"]);
    assert.deepEqual(providers("青福里簡約公屋"), ["cmhk", "hgc", "hkbn", "netvigator"]);
    assert.deepEqual(providers("101 Kings Road"), ["cmhk", "hgc", "hkbn", "netvigator"]);
    assert.equal(providers("裕興苑").includes("cmhk"), false);
    assert.equal(providers("錦柏苑").includes("icable"), false);
    assert.equal(providers("恆光街簡約公屋").includes("cmhk"), false);
    assert.equal(providers("欣寶路簡約公屋").includes("cmhk"), false);
    assert.equal(providers("滿田邨").includes("cmhk"), false);
    assert.deepEqual(providers("滿田樓"), providers("滿田邨"));
    assert.equal(providers("鴻鵠臺").includes("icable"), false);
    assert.equal(providers("Belgravia Place").includes("cmhk"), false);
    assert.equal(providers("Blue Coast I & II").includes("icable"), false);
    assert.equal(providers("One Central Place").includes("cmhk"), false);
    assert.equal(providers("The Haddon").includes("cmhk"), false);
    assert.equal(providers("Miami Quay II").includes("icable"), true);
    assert.equal(providers("Miami Quay II").includes("cmhk"), false);
  });

  it("keeps every home-fibre carrier at 安樺苑 and 安麗苑", () => {
    for (const name of ["安樺苑", "安麗苑"]) {
      const rows = providers(name);
      for (const id of ["hkbn", "netvigator", "cmhk", "hgc", "smartone", "icable"]) {
        assert.equal(rows.includes(id), true, `${name} ${id}`);
      }
    }
    assert.equal(confirmedFibreProviders("安華苑"), undefined);
  });

  it("maps 柏傲莊三期 onto phase III and leaves other addresses unrestricted", () => {
    assert.equal(matchKnownEstate("柏傲莊三期")?.name, "柏傲莊III");
    assert.equal(providers("柏傲莊三期").includes("cmhk"), false);
    assert.equal(providers("柏傲莊三期").includes("hkbn"), true);
    assert.equal(confirmedFibreProviders("天耀邨"), undefined);
    assert.equal(providers("天耀邨").includes("icable"), true);
    assert.equal(filterPlans({ cat: "home5g", estate: "雋東邨" }).some((plan) => plan.providerId === "three"), true);
  });
});
