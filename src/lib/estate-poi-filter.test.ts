import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  govHitRelevantToQuery,
  isNonResidentialGovHit,
  looksLikeResidentialName,
} from "./estate-poi-filter.ts";
import { isImpracticalPlace } from "./estates.ts";

describe("non-residential gov hits", () => {
  it("drops toilets, stops, wifi, recycling and clinics", () => {
    for (const name of [
      "Aqua Privy",
      "Public Toilet",
      "已登記的WiFi 熱點: 環球全域電訊有限公司 (APID 01220)",
      "回收機構及收集點： 綠在土瓜灣回收流動點 - 012",
      "西醫何德民",
      "巴士總站",
      "太古城停車場",
      "華富邭公廁",
    ]) {
      assert.equal(isNonResidentialGovHit(name), true, name);
      assert.equal(looksLikeResidentialName(name), false, name);
    }
  });

  it("keeps public / HOS / private / village / tong lau names", () => {
    for (const name of ["太古城", "華富邭", "彩明苑", "東頭村", "永樂唐樓", "長沙灣道250號", "偉恆昌新邭"]) {
      assert.equal(looksLikeResidentialName(name), true, name);
      assert.equal(isImpracticalPlace(name), false, name);
    }
  });

  it("drops nearby POIs that do not mention the typed estate", () => {
    assert.equal(govHitRelevantToQuery("偉恆昌新邭", "西醫何德民", "", "九龍城區"), false);
    assert.equal(govHitRelevantToQuery("偉恆昌新邭", "偉恆昌新邭", "", "賈炳達道"), true);
  });
});
