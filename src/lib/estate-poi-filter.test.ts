import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isNonResidentialGovHit } from "./estate-poi-filter.ts";
import { isImpracticalPlace } from "./estates.ts";

describe("non-residential gov hits", () => {
  it("drops toilets, stops, wifi and car parks", () => {
    for (const name of [
      "Aqua Privy",
      "東涌 Aqua Privy",
      "Public Toilet",
      "Wi-Fi熱點",
      "東涌新市鎮Wi-Fi接點",
      "巴士總站",
      "東涌巴士總站",
      "Bus Stop",
      "Taxi Stand",
      "Sitting-out Area",
      "太古城停車場",
      "華富邨公廁",
      "村屋廁所",
    ]) {
      assert.equal(isNonResidentialGovHit(name), true, name);
    }
  });

  it("keeps public / HOS / private / village / tong lau names", () => {
    for (const name of ["太古城", "華富邨", "彩明苑", "東頭村", "永樂唐樓", "長沙灣道250號"]) {
      assert.equal(isNonResidentialGovHit(name), false, name);
      assert.equal(isImpracticalPlace(name), false, name);
    }
  });
});
