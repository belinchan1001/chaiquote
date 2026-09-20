import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { govHitRelevantToQuery, isNonResidentialGovHit } from "./estate-poi-filter.ts";
import { isImpracticalPlace } from "./estates.ts";

describe("non-residential gov hits", () => {
  it("drops toilets, stops, wifi, recycling and clinics", () => {
    for (const name of [
      "Aqua Privy",
      "東涌 Aqua Privy",
      "Public Toilet",
      "Wi-Fi熱點",
      "東涌新市鎮Wi-Fi接點",
      "已登記的WiFi 熱點: 環球全域電訊有限公司 (APID 01220)",
      "已登記的WiFi 熱點: Hong Kong Telecommunications (HKT) Limited (APID 05975)",
      "回收機構及收集點： 綠在土瓜灣回收流動點 - 012",
      "西醫何德民",
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
    for (const name of ["太古城", "華富邨", "彩明苑", "東頭村", "永樂唐樓", "長沙灣道250號", "偉恆昌新邨"]) {
      assert.equal(isNonResidentialGovHit(name), false, name);
      assert.equal(isImpracticalPlace(name), false, name);
    }
  });

  it("drops nearby POIs that do not mention the typed estate", () => {
    assert.equal(
      govHitRelevantToQuery("偉恆昌新邨", "已登記的WiFi 熱點: 環球全域電訊有限公司", "", "九龍城區"),
      false,
    );
    assert.equal(govHitRelevantToQuery("偉恆昌新邨", "西醫何德民", "", "九龍城區"), false);
    assert.equal(govHitRelevantToQuery("偉恆昌新邨", "偉恆昌新邨", "", "賈炳達道"), true);
    assert.equal(govHitRelevantToQuery("偉恆昌", "偉恆昌新邨第1座", "", ""), true);
  });
});
