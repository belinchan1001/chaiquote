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
import { toEnglish } from "./plan-en.ts";
import { getPlan, PLANS, type Category } from "./plans.ts";

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
    const plans = [plan("three-45g-44"), plan("cmhk-5g-100-149")];
    const keys = visibleCompareFields(plans, copy).map((field) => field.key);
    assert.ok(keys.includes("data"));
    assert.ok(keys.includes("voice"));
    assert.ok(keys.includes("roam"));
    assert.equal(compareFieldValue(plans[0], "data", copy), "10GB");
    assert.equal(compareFieldValue(plans[1], "voice", copy), "本地通話無限");
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
    const mobile = plan("cmhk-5g-100-149");
    assert.equal(shortProviderName("icable", "zh"), "有線");
    assert.equal(shortProviderName("cmhk", "en"), "CMHK");
    assert.equal(planSpecToken(broadband), "200M");
    assert.equal(planSpecToken(mobile), "100GB");
    assert.equal(compareChipLabel(broadband, "zh"), "有線 200M $68");
    assert.equal(compareChipLabel(mobile, "en"), "CMHK 100GB $149");
  });
});

describe("HKBN student/youth 5G 30GB", () => {
  it("adds one $78 youth/student plan without changing hkbn-5g-30", () => {
    const youth = plan("hkbn-5g-30-78-youth");
    assert.equal(youth.providerId, "hkbn");
    assert.equal(youth.category, "mobile");
    assert.equal(youth.name, "5G 30GB 本地（含每月 3GB 中國內地及澳門）");
    assert.equal(youth.monthlyFee, 78);
    assert.equal(youth.freeMonths, 0);
    assert.equal(youth.contractMonths, 24);
    assert.equal(youth.dataGb, 30);
    assert.equal(youth.highSpeedGb, 30);
    assert.equal(youth.fupNote, "其後本地無限，限速不超過 1Mbps");
    assert.equal(youth.voice, "本地 3000 分鐘；其後 $1／分鐘");
    assert.equal(youth.roaming, "合約期內每月 3GB 中國內地及澳門");
    assert.equal(youth.network, "5G");
    assert.equal(youth.install, "不適用");
    assert.equal(youth.housing, "all");
    assert.deepEqual(youth.perks, ["學生或年青人專題，須符合資格"]);
    assert.equal(youth.bestFor, "適合符合學生或年青人資格之用戶");
    assert.equal(youth.hot, undefined);
    assert.equal(youth.portInPerk, undefined);
    assert.equal(youth.prepaid, undefined);
    assert.doesNotMatch(JSON.stringify(youth), /MT5G|108/);

    const existing = plan("hkbn-5g-30");
    assert.equal(existing.monthlyFee, 98);
    assert.equal(existing.freeMonths, 2);
    assert.equal(existing.contractMonths, 28);
    assert.equal(existing.name, "5G 30GB（28 個月）");
    assert.equal(existing.hot, true);
    assert.ok(existing.portInPerk);

    const hkbnMobile = PLANS.filter((p) => p.category === "mobile" && p.providerId === "hkbn");
    assert.equal(hkbnMobile.filter((p) => p.id === "hkbn-5g-30-78-youth").length, 1);

    assert.equal(toEnglish(youth.name), "5G 30GB Local (incl. monthly 3GB Mainland China & Macau)");
    assert.equal(toEnglish(youth.fupNote ?? ""), "Thereafter local unlimited, speed not exceeding 1Mbps");
    assert.equal(toEnglish(youth.voice ?? ""), "Local 3,000 minutes; $1/minute thereafter");
    assert.equal(toEnglish(youth.roaming ?? ""), "Monthly 3GB Mainland China & Macau during contract period");
    assert.equal(toEnglish(youth.perks[0]), "Student or youth exclusive, must meet eligibility");
    assert.equal(toEnglish(youth.bestFor), "Suitable for users meeting student or youth eligibility");
  });
});

describe("CMHK mobile catalogue", () => {
  it("keeps only the four reference 5G monthly plans", () => {
    const ids = PLANS.filter((p) => p.category === "mobile" && p.providerId === "cmhk").map((p) => p.id);
    assert.deepEqual(ids, [
      "cmhk-5g-local-30-98",
      "cmhk-5g-100-149",
      "cmhk-5g-youth-100-138",
      "cmhk-5g-youth-200-178",
    ]);
  });
});
