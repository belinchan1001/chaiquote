import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  compareChipLabel,
  compareFieldValue,
  isEmptyCompareValue,
  planSpecToken,
  rowHasAnyValue,
  shortProviderName,
  visibleCompareFields,
  type CompareCopy,
} from "./compare.ts";
import { getPlan, type Category } from "./plans.ts";

const copy: CompareCopy = {
  dash: "—",
  none: "無",
  months: (n) => `${n} 個月`,
  categoryLabel: (category: Category) =>
    ({ broadband: "光纖寬頻", mobile: "手機月費", home5g: "5G 家居寬頻", business: "商業寬頻" })[category],
  tx: (text) => text,
};

function plan(id: string) {
  const found = getPlan(id);
  assert.ok(found, `missing plan ${id}`);
  return found;
}

describe("empty compare cells", () => {
  it("treats dashes and blanks as empty, but keeps 無", () => {
    assert.equal(isEmptyCompareValue("—"), true);
    assert.equal(isEmptyCompareValue(" - "), true);
    assert.equal(isEmptyCompareValue(""), true);
    assert.equal(isEmptyCompareValue("無"), false);
    assert.equal(isEmptyCompareValue("HK$68"), false);
  });

  it("hides a row only when every selected plan is empty", () => {
    assert.equal(rowHasAnyValue(["—", "—", "—"]), false);
    assert.equal(rowHasAnyValue(["—", "本地 3000 分鐘", "—"]), true);
  });
});

describe("visible compare fields", () => {
  it("drops mobile-only dashes when comparing broadband plans", () => {
    const plans = [plan("icable-ftth-200-36m"), plan("cmhk-ftth-1000"), plan("hkbn-ftth-1000-36m-98")];
    const keys = visibleCompareFields(plans, copy).map((field) => field.key);
    assert.deepEqual(keys, ["category", "fee", "avg", "contract", "free", "speed", "install"]);
    assert.equal(keys.includes("data"), false);
    assert.equal(keys.includes("after"), false);
    assert.equal(keys.includes("voice"), false);
    assert.equal(keys.includes("roam"), false);
    assert.equal(keys.includes("port"), false);
  });

  it("keeps data, voice and roaming for mobile plans", () => {
    const plans = [plan("three-45g-44"), plan("cmhk-5g-100")];
    const keys = visibleCompareFields(plans, copy).map((field) => field.key);
    assert.ok(keys.includes("data"));
    assert.ok(keys.includes("voice"));
    assert.ok(keys.includes("roam"));
    assert.equal(compareFieldValue(plans[0], "data", copy), "10GB");
    assert.equal(compareFieldValue(plans[1], "voice", copy), "本地無限分鐘");
  });

  it("keeps a mobile-only row when the set is mixed", () => {
    const plans = [plan("icable-ftth-200-36m"), plan("three-45g-44")];
    const keys = visibleCompareFields(plans, copy).map((field) => field.key);
    assert.ok(keys.includes("voice"));
    assert.equal(compareFieldValue(plans[0], "voice", copy), "—");
    assert.equal(compareFieldValue(plans[1], "voice", copy), "本地 3000 分鐘");
  });
});

describe("compare chips", () => {
  it("uses a short provider + spec + fee label", () => {
    const broadband = plan("icable-ftth-200-36m");
    const mobile = plan("cmhk-5g-100");
    assert.equal(shortProviderName("icable", "zh"), "有線");
    assert.equal(shortProviderName("cmhk", "en"), "CMHK");
    assert.equal(planSpecToken(broadband), "200M");
    assert.equal(planSpecToken(mobile), "100GB");
    assert.equal(compareChipLabel(broadband, "zh"), "有線 200M $68");
    assert.equal(compareChipLabel(mobile, "en"), "CMHK 100GB $149");
  });
});
