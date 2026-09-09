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
import { certifiedStaffNoteKey, getPlan, hasCertifiedStaff, isHktPlan, isNetvigatorVillage, PLANS, type Category } from "./plans.ts";

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
    assert.equal(youth.hot, true);
    assert.equal(youth.latestOffer, true);
    assert.equal(youth.quotePick, true);
    assert.deepEqual(
      PLANS.filter((p) => p.latestOffer).map((p) => p.id),
      ["icable-ftth-1000-48m-58", "hkbn-5g-30-78-youth"],
    );
    assert.deepEqual(
      PLANS.filter((p) => p.quotePick).map((p) => p.id),
      [
        "hkbn-ftth-1000-36m-98",
        "hkbn-ftth-2500-24m-149",
        "hkbn-ftth-10000-entertainment",
        "hkbn-village-2000-24m",
        "hgc-ftth-2000-hos-36m",
        "hgc-ftth-1000-private-39m",
        "netvigator-ftth-1000-private-36m",
        "netvigator-ftth-1000-public-36m-98",
        "netvigator-ftth-2500-public-36m-158",
        "netvigator-ftth-2500-private-36m-176",
        "icable-ftth-1000-48m-58",
        "hkbn-5g-30-78-youth",
      ],
    );
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

describe("Netvigator public 1000M $108", () => {
  it("names the included Linksys EA9350 router without changing other plans", () => {
    const plan = getPlan("netvigator-ftth-1000-public-36m-108");
    assert.ok(plan);
    assert.equal(plan.monthlyFee, 108);
    assert.equal(plan.perks[0], "包 Linksys EA9350 Wi-Fi 6 路由器");
    assert.equal(toEnglish(plan.perks[0]), "Includes a Linksys EA9350 Wi-Fi 6 router");

    const sibling = getPlan("netvigator-ftth-1000-private-36m-118");
    assert.ok(sibling);
    assert.equal(sibling.monthlyFee, 108);
    assert.equal(sibling.perks[0], "包 Linksys EA9350 Wi-Fi 6 路由器");
    assert.equal(toEnglish(sibling.perks[0]), "Includes a Linksys EA9350 Wi-Fi 6 router");

    const named = PLANS.filter((p) => p.perks.includes("包 Linksys EA9350 Wi-Fi 6 路由器"));
    assert.deepEqual(
      named.map((p) => p.id),
      [
        "netvigator-ftth-1000-public-36m-108",
        "netvigator-ftth-1000-public-36m-128",
        "netvigator-ftth-1000-private-36m-118",
        "netvigator-ftth-1000-private-36m-128",
      ],
    );
  });
});

describe("Netvigator private 1000M $108", () => {
  it("drops the fee to 108 and names the Linksys router without changing other plans", () => {
    const private118 = plan("netvigator-ftth-1000-private-36m-118");
    assert.equal(private118.id, "netvigator-ftth-1000-private-36m-118");
    assert.equal(private118.providerId, "netvigator");
    assert.equal(private118.category, "broadband");
    assert.equal(private118.name, "私人樓宇 1000M 光纖（36 個月＋路由器）");
    assert.equal(private118.monthlyFee, 108);
    assert.equal(private118.freeMonths, 0);
    assert.equal(private118.contractMonths, 36);
    assert.equal(private118.speedMbps, 1000);
    assert.equal(private118.install, "豁免安裝費");
    assert.deepEqual(private118.housing, ["private"]);
    assert.equal(private118.network, "光纖入屋");
    assert.deepEqual(private118.perks, [
      "包 Linksys EA9350 Wi-Fi 6 路由器",
      "送 Now TV 頻道",
      "豁免搬遷費",
      "可加購每月 HK$68 換購指定家電（須符合資格）",
    ]);
    assert.equal(private118.hot, undefined);
    assert.equal(private118.limits, undefined);
    assert.equal(private118.bestFor, "適合私人屋苑、需要 1000M 光纖之住戶");
    assert.equal(toEnglish(private118.perks[0]), "Includes a Linksys EA9350 Wi-Fi 6 router");

    const public108 = plan("netvigator-ftth-1000-public-36m-108");
    assert.equal(public108.monthlyFee, 108);
    assert.deepEqual(public108.housing, ["public", "hos"]);
    assert.equal(public108.perks[0], "包 Linksys EA9350 Wi-Fi 6 路由器");
    assert.equal(public108.hot, true);

    const public98 = plan("netvigator-ftth-1000-public-36m-98");
    assert.equal(public98.monthlyFee, 98);
    assert.deepEqual(public98.housing, ["public", "hos"]);
    assert.equal(public98.perks.includes("包 Linksys EA9350 Wi-Fi 6 路由器"), false);

    const public128 = plan("netvigator-ftth-1000-public-36m-128");
    assert.equal(public128.monthlyFee, 128);
    assert.equal(public128.perks[1], "包 Linksys EA9350 Wi-Fi 6 路由器");

    const public158 = plan("netvigator-ftth-2500-public-36m-158");
    assert.equal(public158.monthlyFee, 158);
    assert.equal(public158.speedMbps, 2500);
    assert.equal(public158.perks[1], "包 Wi-Fi 7 路由器");
  });
});

describe("Netvigator public/HOS fibre $98 $128 $158", () => {
  const MOVE = "搬遷費津貼 HK$1,000";
  const NOWTV = "Now TV 體驗組合或國際新聞組合（智能電視版）；可加 HK$38 升級機頂盒";
  const FTTH_LIMITS = "可選擇先安裝後啟動服務（最長 365 日）。實際覆蓋視乎個別樓宇而定。";

  it("adds three public/HOS plans without changing $108 or private/village Netvigator plans", () => {
    const plan98 = plan("netvigator-ftth-1000-public-36m-98");
    assert.equal(plan98.providerId, "netvigator");
    assert.equal(plan98.category, "broadband");
    assert.equal(plan98.name, "公居屋 1000M 光纖（36 個月）");
    assert.equal(plan98.monthlyFee, 98);
    assert.equal(plan98.freeMonths, 0);
    assert.equal(plan98.contractMonths, 36);
    assert.equal(plan98.speedMbps, 1000);
    assert.equal(plan98.install, "豁免安裝費");
    assert.deepEqual(plan98.housing, ["public", "hos"]);
    assert.equal(plan98.network, "光纖入屋");
    assert.deepEqual(plan98.perks, [MOVE, "家居固網電話", NOWTV]);
    assert.equal(plan98.limits, FTTH_LIMITS);
    assert.equal(plan98.bestFor, "適合公屋或居屋、需要 1000M 光纖之住戶");
    assert.equal(plan98.hot, undefined);
    assert.equal(toEnglish(plan98.name), "Public/HOS 1000M fibre (36 months)");

    const plan128 = plan("netvigator-ftth-1000-public-36m-128");
    assert.equal(plan128.providerId, "netvigator");
    assert.equal(plan128.category, "broadband");
    assert.equal(plan128.name, "公居屋 1000M 光纖（36 個月＋Wi-Fi 6）");
    assert.equal(plan128.monthlyFee, 128);
    assert.equal(plan128.freeMonths, 0);
    assert.equal(plan128.contractMonths, 36);
    assert.equal(plan128.speedMbps, 1000);
    assert.equal(plan128.install, "豁免安裝費");
    assert.deepEqual(plan128.housing, ["public", "hos"]);
    assert.equal(plan128.network, "光纖入屋");
    assert.deepEqual(plan128.perks, [
      "12 個月 Disney+",
      "包 Linksys EA9350 Wi-Fi 6 路由器",
      MOVE,
      NOWTV,
    ]);
    assert.equal(plan128.limits, FTTH_LIMITS);
    assert.equal(plan128.hot, undefined);
    assert.equal(toEnglish(plan128.name), "Public/HOS 1000M fibre (36 months + Wi-Fi 6)");
    assert.equal(toEnglish(plan128.perks[0]), "12 months Disney+");
    assert.equal(toEnglish(plan128.perks[1]), "Includes a Linksys EA9350 Wi-Fi 6 router");

    const plan158 = plan("netvigator-ftth-2500-public-36m-158");
    assert.equal(plan158.providerId, "netvigator");
    assert.equal(plan158.category, "broadband");
    assert.equal(plan158.name, "公居屋 2500M 光纖（36 個月＋Wi-Fi 7）");
    assert.equal(plan158.monthlyFee, 158);
    assert.equal(plan158.freeMonths, 0);
    assert.equal(plan158.contractMonths, 36);
    assert.equal(plan158.speedMbps, 2500);
    assert.equal(plan158.install, "豁免安裝費");
    assert.deepEqual(plan158.housing, ["public", "hos"]);
    assert.equal(plan158.network, "光纖入屋");
    assert.deepEqual(plan158.perks, [
      "12 個月 Disney+",
      "包 Wi-Fi 7 路由器",
      "家居固網電話",
      MOVE,
      NOWTV,
    ]);
    assert.equal(plan158.limits, FTTH_LIMITS);
    assert.equal(plan158.hot, undefined);
    assert.equal(toEnglish(plan158.name), "Public/HOS 2500M fibre (36 months + Wi-Fi 7)");
    assert.equal(toEnglish(plan158.perks[1]), "Includes Wi-Fi 7 router");
    assert.equal(toEnglish(plan158.perks[2]), "Home landline");

    const plan108 = plan("netvigator-ftth-1000-public-36m-108");
    assert.equal(plan108.name, "公居屋 1000M 光纖（36 個月＋路由器）");
    assert.equal(plan108.monthlyFee, 108);
    assert.equal(plan108.freeMonths, 0);
    assert.equal(plan108.contractMonths, 36);
    assert.equal(plan108.speedMbps, 1000);
    assert.equal(plan108.install, "豁免安裝費");
    assert.deepEqual(plan108.housing, ["public", "hos"]);
    assert.equal(plan108.network, "光纖入屋");
    assert.deepEqual(plan108.perks, [
      "包 Linksys EA9350 Wi-Fi 6 路由器",
      "送 Now TV 頻道",
      "豁免搬遷費",
      "可加購每月 HK$68 換購指定家電（須符合資格）",
    ]);
    assert.equal(plan108.hot, true);
    assert.equal(plan108.limits, undefined);
    assert.equal(plan108.bestFor, "適合公屋或居屋、需要 1000M 光纖之住戶");

    assert.equal(getPlan("netvigator-ftth-2500-public-36m-156"), undefined);
    assert.equal(getPlan("netvigator-ftth-2500-public-36m"), undefined);

    assert.deepEqual(
      PLANS.filter((p) => p.providerId === "netvigator" && p.category === "broadband").map((p) => p.id),
      [
        "netvigator-ftth-1000-private-36m",
        "netvigator-ftth-1000-private-36m-198",
        "netvigator-ftth-1000-specified-24m-198",
        "netvigator-ftth-1000-private-24m",
        "netvigator-ftth-1000-exclusive-36m-186",
        "netvigator-ftth-2500-private-24m",
        "netvigator-ftth-2500-exclusive-36m-244",
        "netvigator-ftth-1000-public-36m-98",
        "netvigator-ftth-1000-public-36m-108",
        "netvigator-ftth-1000-public-36m-128",
        "netvigator-ftth-2500-public-36m-158",
        "netvigator-ftth-1000-private-36m-118",
        "netvigator-ftth-1000-private-36m-128",
        "netvigator-ftth-2500-private-36m-176",
        "netvigator-ftth-1000-village-24m",
        "netvigator-ftth-1000-village-36m",
        "netvigator-ftth-2500-village-24m",
        "netvigator-ftth-2500-village-36m",
        "netvigator-ftth-10000",
      ],
    );

    const private118 = plan("netvigator-ftth-1000-private-36m-118");
    assert.equal(private118.monthlyFee, 108);
    assert.equal(private118.name, "私人樓宇 1000M 光纖（36 個月＋路由器）");
    assert.deepEqual(private118.perks, [
      "包 Linksys EA9350 Wi-Fi 6 路由器",
      "送 Now TV 頻道",
      "豁免搬遷費",
      "可加購每月 HK$68 換購指定家電（須符合資格）",
    ]);

    const private176 = plan("netvigator-ftth-2500-private-36m-176");
    assert.equal(private176.monthlyFee, 178);
    assert.equal(private176.name, "私人樓宇 2500M 光纖（36 個月＋Wi-Fi 7）");
    assert.deepEqual(private176.housing, ["private"]);
    assert.deepEqual(private176.perks, [
      "12 個月 Disney+",
      "包 Wi-Fi 7 二合一路由器",
      "送 Now TV 頻道",
      "豁免搬遷費",
      "可加購每月 HK$68 換購指定家電（須符合資格）",
    ]);

    const village1000 = plan("netvigator-ftth-1000-village-36m");
    assert.equal(village1000.monthlyFee, 278);
    assert.equal(village1000.name, "村屋 1000M 光纖計劃（36 個月）");
    assert.equal(village1000.install, "豁免安裝費");
    assert.equal(village1000.contractMonths, 36);
    assert.deepEqual(village1000.housing, ["village"]);
    assert.ok(village1000.perks.includes("搬遷費津貼 HK$1,000"));

    const village1000m24 = plan("netvigator-ftth-1000-village-24m");
    assert.equal(village1000m24.monthlyFee, 278);
    assert.equal(village1000m24.name, "村屋 1000M 光纖計劃（24 個月）");
    assert.equal(village1000m24.install, "豁免安裝費");
    assert.equal(village1000m24.contractMonths, 24);
    assert.deepEqual(village1000m24.housing, ["village"]);
    assert.ok(village1000m24.perks.includes("搬遷費津貼 HK$1,000"));

    const village2500 = plan("netvigator-ftth-2500-village-36m");
    assert.equal(village2500.monthlyFee, 376);
    assert.equal(village2500.name, "村屋 2500M 光纖計劃（36 個月）");
    assert.equal(village2500.install, "豁免安裝費");
    assert.equal(village2500.contractMonths, 36);
    assert.deepEqual(village2500.housing, ["village"]);
    assert.ok(village2500.perks.includes("搬遷費津貼 HK$1,000"));

    const village2500m24 = plan("netvigator-ftth-2500-village-24m");
    assert.equal(village2500m24.monthlyFee, 376);
    assert.equal(village2500m24.name, "村屋 2500M 光纖計劃（24 個月）");
    assert.equal(village2500m24.install, "豁免安裝費");
    assert.equal(village2500m24.contractMonths, 24);
    assert.deepEqual(village2500m24.housing, ["village"]);
    assert.ok(village2500m24.perks.includes("搬遷費津貼 HK$1,000"));

    assert.equal(isNetvigatorVillage(village1000), true);
    assert.equal(isNetvigatorVillage(village1000m24), true);
    assert.equal(isNetvigatorVillage(village2500), true);
    assert.equal(isNetvigatorVillage(village2500m24), true);
    assert.equal(isNetvigatorVillage(plan("hkbn-village-200-27m")), false);
    assert.equal(isNetvigatorVillage(plan("hgc-village-1g-phone-24m")), false);
    assert.equal(isNetvigatorVillage(plan("netvigator-ftth-1000-private-36m")), false);

    assert.equal(isHktPlan(village1000), true);
    assert.equal(isHktPlan(plan("csl-5g-30")), true);
    assert.equal(isHktPlan(plan("csl-home5g")), true);
    assert.equal(isHktPlan(plan("hkbn-ftth-1000-36m-98")), false);
    assert.equal(isHktPlan(plan("hgc-village-1g-phone-24m")), false);
    assert.ok(PLANS.filter((p) => p.providerId === "netvigator" || p.providerId === "csl").every(isHktPlan));
    assert.ok(PLANS.filter((p) => p.providerId !== "netvigator" && p.providerId !== "csl").every((p) => !isHktPlan(p)));

    assert.equal(certifiedStaffNoteKey(village1000), "hktStaffNote");
    assert.equal(certifiedStaffNoteKey(plan("csl-5g-30")), "hktStaffNote");
    assert.equal(certifiedStaffNoteKey(plan("hkbn-ftth-1000-36m-98")), "hkbnStaffNote");
    assert.equal(certifiedStaffNoteKey(plan("hgc-village-1g-phone-24m")), null);
    assert.ok(PLANS.filter((p) => p.providerId === "hkbn").every(hasCertifiedStaff));
    assert.ok(PLANS.filter((p) => p.providerId === "hgc").every((p) => !hasCertifiedStaff(p)));

    for (const p of [plan98, plan128, plan158]) {
      assert.doesNotMatch(JSON.stringify(p), /保證|最平/);
      assert.equal(p.perks.includes("可加購每月 HK$68 換購指定家電（須符合資格）"), false);
    }
  });
});

describe("Netvigator private 1000M $128", () => {
  const MOVE = "搬遷費津貼 HK$1,000";
  const NOWTV = "Now TV 體驗組合或國際新聞組合（智能電視版）；可加 HK$38 升級機頂盒";
  const FTTH_LIMITS = "可選擇先安裝後啟動服務（最長 365 日）。實際覆蓋視乎個別樓宇而定。";

  it("adds a private-only $128 twin and leaves the public $128 card unchanged", () => {
    const private128 = plan("netvigator-ftth-1000-private-36m-128");
    assert.equal(private128.id, "netvigator-ftth-1000-private-36m-128");
    assert.equal(private128.providerId, "netvigator");
    assert.equal(private128.category, "broadband");
    assert.equal(private128.name, "私人樓宇 1000M 光纖（36 個月＋Wi-Fi 6）");
    assert.equal(private128.monthlyFee, 128);
    assert.equal(private128.freeMonths, 0);
    assert.equal(private128.contractMonths, 36);
    assert.equal(private128.speedMbps, 1000);
    assert.equal(private128.install, "豁免安裝費");
    assert.deepEqual(private128.housing, ["private"]);
    assert.equal(private128.housing.includes("public"), false);
    assert.equal(private128.housing.includes("hos"), false);
    assert.equal(private128.network, "光纖入屋");
    assert.deepEqual(private128.perks, [
      "12 個月 Disney+",
      "包 Linksys EA9350 Wi-Fi 6 路由器",
      MOVE,
      NOWTV,
    ]);
    assert.equal(private128.limits, FTTH_LIMITS);
    assert.equal(private128.bestFor, "適合私人樓宇、需要 1000M 光纖之住戶");
    assert.doesNotMatch(private128.bestFor, /公屋|居屋/);
    assert.equal(private128.quotePick, undefined);
    assert.equal(private128.hot, undefined);
    assert.equal(private128.latestOffer, undefined);
    assert.equal(private128.perks.includes("送 Now TV 頻道"), false);
    assert.equal(private128.perks.includes("豁免搬遷費"), false);
    assert.equal(private128.perks.includes("可加購每月 HK$68 換購指定家電（須符合資格）"), false);
    assert.equal(toEnglish(private128.name), "Private 1000M fibre (36 months + Wi-Fi 6)");
    assert.equal(toEnglish(private128.perks[0]), "12 months Disney+");
    assert.equal(toEnglish(private128.perks[1]), "Includes a Linksys EA9350 Wi-Fi 6 router");

    const public128 = plan("netvigator-ftth-1000-public-36m-128");
    assert.equal(public128.name, "公居屋 1000M 光纖（36 個月＋Wi-Fi 6）");
    assert.match(public128.name, /公居屋/);
    assert.equal(public128.monthlyFee, 128);
    assert.deepEqual(public128.housing, ["public", "hos"]);
    assert.equal(public128.quotePick, undefined);
    assert.equal(public128.hot, undefined);
    assert.equal(public128.bestFor, "適合公屋或居屋、需要 1000M 光纖之住戶");
    assert.deepEqual(public128.perks, [
      "12 個月 Disney+",
      "包 Linksys EA9350 Wi-Fi 6 路由器",
      MOVE,
      NOWTV,
    ]);
    assert.equal(toEnglish(public128.name), "Public/HOS 1000M fibre (36 months + Wi-Fi 6)");
    assert.deepEqual(private128.perks, public128.perks);
    assert.equal(private128.install, public128.install);
    assert.equal(private128.monthlyFee, public128.monthlyFee);
    assert.equal(private128.contractMonths, public128.contractMonths);

    const private118 = plan("netvigator-ftth-1000-private-36m-118");
    assert.equal(private118.name, "私人樓宇 1000M 光纖（36 個月＋路由器）");
    assert.equal(private118.monthlyFee, 108);
    assert.deepEqual(private118.housing, ["private"]);
    assert.equal(private118.quotePick, undefined);
  });
});

describe("Netvigator exclusive-private 1000M $186", () => {
  const NAME = "獨家私人樓宇 1000M 光纖＋Wi-Fi 6 路由器＋家居電話＋手提電話服務";
  const PERKS = [
    "送指定 Wi-Fi 6 路由器",
    "家居固網電話",
    "Now TV 體驗組合或國際新聞組合（智能電視版）；可加 HK$38 升級機頂盒",
    "搬遷費津貼 HK$1,000",
  ];
  const LIMITS = "可選擇先安裝後啟動服務（最長 365 日）。實際覆蓋視乎個別樓宇而定。";

  it("keeps the 24-month card and adds a 36-month twin at the same fee", () => {
    const plan24 = plan("netvigator-ftth-1000-private-24m");
    const plan36 = plan("netvigator-ftth-1000-exclusive-36m-186");

    for (const row of [plan24, plan36]) {
      assert.equal(row.providerId, "netvigator");
      assert.equal(row.category, "broadband");
      assert.equal(row.name, NAME);
      assert.equal(row.monthlyFee, 186);
      assert.equal(row.freeMonths, 0);
      assert.equal(row.speedMbps, 1000);
      assert.equal(row.install, "豁免安裝費");
      assert.deepEqual(row.housing, ["private"]);
      assert.equal(row.network, "光纖入屋");
      assert.deepEqual(row.perks, PERKS);
      assert.equal(row.limits, LIMITS);
      assert.equal(row.bestFor, "適合私人樓宇、需要 Wi-Fi 6 及家居電話之住戶");
      assert.equal(row.hot, undefined);
      assert.equal(toEnglish(row.name), "Exclusive private 1000M fibre + Wi-Fi 6 router + home phone + mobile phone service");
    }

    assert.equal(plan24.contractMonths, 24);
    assert.equal(plan36.contractMonths, 36);
    assert.equal(plan24.perks[1], "家居固網電話");
    assert.equal(plan36.perks[1], "家居固網電話");

    const cheap36 = plan("netvigator-ftth-1000-private-36m");
    assert.equal(cheap36.name, "私人樓宇 1000M 光纖（36 個月＋家居電話）");
    assert.equal(cheap36.monthlyFee, 98);
    assert.equal(cheap36.contractMonths, 36);
    assert.equal(cheap36.hot, true);
    assert.deepEqual(cheap36.perks, [
      "家居固網電話",
      PERKS[2],
      PERKS[3],
      "可加 HK$10 選配 Linksys EA9350 Wi-Fi 6 路由器",
    ]);

    const upgrade36 = plan("netvigator-ftth-1000-private-36m-198");
    assert.equal(upgrade36.name, "指定私人樓宇1000M光纖優惠");
    assert.equal(upgrade36.monthlyFee, 198);
    assert.equal(upgrade36.contractMonths, 36);
  });
});

describe("Netvigator designated-private 1000M $198", () => {
  const NAME = "指定私人樓宇1000M光纖優惠";
  const PERKS = [
    "Now TV 體驗組合或國際新聞組合（智能電視版）；可加 HK$38 升級機頂盒",
    "搬遷費津貼 HK$1,000",
    "新客戶可加每月 HK$98 升級 2500M",
  ];
  const LIMITS = "可選擇先安裝後啟動服務（最長 365 日）。實際覆蓋視乎個別樓宇而定。";

  it("keeps the 36-month card and adds a 24-month twin at the same fee", () => {
    const plan36 = plan("netvigator-ftth-1000-private-36m-198");
    const plan24 = plan("netvigator-ftth-1000-specified-24m-198");

    for (const row of [plan24, plan36]) {
      assert.equal(row.providerId, "netvigator");
      assert.equal(row.category, "broadband");
      assert.equal(row.name, NAME);
      assert.equal(row.monthlyFee, 198);
      assert.equal(row.freeMonths, 0);
      assert.equal(row.speedMbps, 1000);
      assert.equal(row.install, "豁免安裝費");
      assert.deepEqual(row.housing, ["private"]);
      assert.equal(row.network, "光纖入屋");
      assert.deepEqual(row.perks, PERKS);
      assert.equal(row.limits, LIMITS);
      assert.equal(row.bestFor, "適合私人樓宇、可升級 2500M 之住戶");
      assert.equal(row.hot, undefined);
      assert.equal(toEnglish(row.name), "Designated private-building 1000M fibre offer");
    }

    assert.equal(plan24.contractMonths, 24);
    assert.equal(plan36.contractMonths, 36);
    assert.equal(plan36.id, "netvigator-ftth-1000-private-36m-198");
    assert.equal(plan24.id, "netvigator-ftth-1000-specified-24m-198");
    assert.notEqual(plan24.id, "netvigator-ftth-1000-private-24m");
    assert.notEqual(plan36.id, "netvigator-ftth-1000-exclusive-36m-186");

    const exclusive24 = plan("netvigator-ftth-1000-private-24m");
    assert.equal(exclusive24.monthlyFee, 186);
    assert.equal(exclusive24.contractMonths, 24);
    assert.equal(exclusive24.name, "獨家私人樓宇 1000M 光纖＋Wi-Fi 6 路由器＋家居電話＋手提電話服務");

    const exclusive36 = plan("netvigator-ftth-1000-exclusive-36m-186");
    assert.equal(exclusive36.monthlyFee, 186);
    assert.equal(exclusive36.contractMonths, 36);

    const private118 = plan("netvigator-ftth-1000-private-36m-118");
    assert.equal(private118.monthlyFee, 108);
    assert.equal(private118.name, "私人樓宇 1000M 光纖（36 個月＋路由器）");
  });
});

describe("Netvigator exclusive-private 2500M $244", () => {
  const NAME = "獨家私人樓宇 2500M 光纖＋Wi-Fi 7 路由器＋家居電話＋手提電話服務";
  const PERKS = [
    "送指定 Wi-Fi 7 路由器",
    "家居固網電話",
    "Now TV 體驗組合或國際新聞組合（智能電視版）；可加 HK$38 升級機頂盒",
    "搬遷費津貼 HK$1,000",
  ];
  const LIMITS = "可選擇先安裝後啟動服務（最長 365 日）。實際覆蓋視乎個別樓宇而定。僅適用於指定獨家私人樓宇。";

  it("keeps the 24-month card and adds a 36-month twin at the same fee", () => {
    const plan24 = plan("netvigator-ftth-2500-private-24m");
    const plan36 = plan("netvigator-ftth-2500-exclusive-36m-244");

    for (const row of [plan24, plan36]) {
      assert.equal(row.providerId, "netvigator");
      assert.equal(row.category, "broadband");
      assert.equal(row.name, NAME);
      assert.equal(row.monthlyFee, 244);
      assert.equal(row.freeMonths, 0);
      assert.equal(row.speedMbps, 2500);
      assert.equal(row.install, "豁免安裝費");
      assert.deepEqual(row.housing, ["private"]);
      assert.equal(row.network, "光纖入屋");
      assert.deepEqual(row.perks, PERKS);
      assert.equal(row.limits, LIMITS);
      assert.equal(row.bestFor, "適合指定獨家私人樓宇、需要 2500M 光纖及家居電話之住戶");
      assert.equal(row.hot, undefined);
      assert.equal(
        toEnglish(row.name),
        "Exclusive private 2500M fibre + Wi-Fi 7 router + home phone + mobile phone service",
      );
    }

    assert.equal(plan24.contractMonths, 24);
    assert.equal(plan36.contractMonths, 36);
    assert.equal(plan24.perks[1], "家居固網電話");
    assert.equal(plan36.perks[1], "家居固網電話");
    assert.equal(plan24.id, "netvigator-ftth-2500-private-24m");
    assert.equal(plan36.id, "netvigator-ftth-2500-exclusive-36m-244");

    assert.equal(getPlan("netvigator-ftth-2500-private-36m"), undefined);
    assert.notEqual(plan36.id, "netvigator-ftth-2500-private-36m-176");

    const disney36 = plan("netvigator-ftth-2500-private-36m-176");
    assert.equal(disney36.monthlyFee, 178);
    assert.equal(disney36.name, "私人樓宇 2500M 光纖（36 個月＋Wi-Fi 7）");
    assert.equal(disney36.contractMonths, 36);
    assert.deepEqual(disney36.perks, [
      "12 個月 Disney+",
      "包 Wi-Fi 7 二合一路由器",
      "送 Now TV 頻道",
      "豁免搬遷費",
      "可加購每月 HK$68 換購指定家電（須符合資格）",
    ]);
  });
});

describe("HKBN 2.5Gbps 12-month $218", () => {
  it("charges first-time HK$680 install without changing other plans", () => {
    const row = plan("hkbn-ftth-2500-12m-218");
    assert.equal(row.providerId, "hkbn");
    assert.equal(row.category, "broadband");
    assert.equal(row.name, "2.5Gbps 高速上網連 Wi-Fi 7（12 個月）");
    assert.equal(row.monthlyFee, 218);
    assert.equal(row.freeMonths, 0);
    assert.equal(row.contractMonths, 12);
    assert.equal(row.speedMbps, 2500);
    assert.equal(row.install, "首次需繳付 HK$680 安裝費");
    assert.deepEqual(row.housing, ["public", "hos", "private"]);
    assert.equal(row.network, "光纖入屋");
    assert.deepEqual(row.perks, [
      "送指定 TP-Link Archer BE230 Wi-Fi 7 路由器（12 個月）",
      "SAFE 網絡安全防護及防毒軟件 6 個月",
      "可選擇延遲服務生效日（最長 365 日）",
    ]);
    assert.equal(
      row.limits,
      "本計劃為自動續約。可選擇延遲服務生效日（最長 365 日）。適用於指定公屋、居屋及私人住宅。不適用於村屋。",
    );
    assert.equal(row.bestFor, "適合需要 2500M 光纖及 Wi-Fi 7 路由器之住戶");
    const installEn = toEnglish(row.install);
    assert.equal(installEn, "First payment: HK$680 installation fee");
    assert.doesNotMatch(installEn, /waived|豁免/i);
    assert.equal(toEnglish("豁免安裝費（原價 HK$680）"), "Installation waived (was HK$680)");

    const waived = PLANS.filter((p) => p.install === "豁免安裝費（原價 HK$680）");
    assert.ok(waived.length >= 1);
    assert.equal(waived.some((p) => p.id === "hkbn-ftth-2500-12m-218"), false);
    assert.equal(
      PLANS.filter((p) => p.install === "首次需繳付 HK$680 安裝費").map((p) => p.id).join(),
      "hkbn-ftth-2500-12m-218",
    );
    assert.equal(
      PLANS.filter((p) => p.category === "broadband" && p.id !== "hkbn-ftth-2500-12m-218").every(
        (p) => p.install !== "首次需繳付 HK$680 安裝費",
      ),
      true,
    );
  });
});

describe("HGC village broadband install waiver", () => {
  const WAIVED_IDS = [
    "hgc-village-1g-phone-24m",
    "hgc-village-1g-router-30m",
    "hgc-village-2g-24m",
    "hgc-village-2g-tv-30m",
    "hgc-village-2g-wifi6-30m",
    "hgc-village-2g-wifi7-30m",
  ] as const;
  const HGC_VILLAGE_LIMITS =
    "適用於村屋地址。馬灣或若干指定村落未必享有額外特別優惠，詳情請向當值銷售員查詢。不適用於公屋、居屋及私人樓宇。實際覆蓋須核對門牌。";

  it("waives install on six HGC village plans without sweeping any other install", () => {
    const expected = [
      {
        id: "hgc-village-1g-phone-24m",
        name: "村屋 1G 連電話（24 個月）",
        monthlyFee: 319,
        contractMonths: 24,
        speedMbps: 1000,
        perks: [
          "家居／寬頻電話服務",
          "24 個月 100 分鐘 hgc on air Wi-Fi",
          "1GB 電郵儲存量",
          "豁免搬遷費",
        ],
        bestFor: "適合村屋、需要 1G 光纖及電話之住戶",
      },
      {
        id: "hgc-village-1g-router-30m",
        name: "村屋 1G 連路由器＋電話（30 個月）",
        monthlyFee: 329,
        contractMonths: 30,
        speedMbps: 1000,
        perks: [
          "送 TP-Link EX141 路由器",
          "家居／寬頻電話服務",
          "30 個月 100 分鐘 hgc on air Wi-Fi",
          "1GB 電郵儲存量",
          "豁免搬遷費",
        ],
        bestFor: "適合村屋、需要路由器之住戶",
      },
      {
        id: "hgc-village-2g-24m",
        name: "村屋 2G 純寬頻（24 個月）",
        monthlyFee: 329,
        contractMonths: 24,
        speedMbps: 2000,
        perks: ["24 個月 100 分鐘 hgc on air Wi-Fi", "1GB 電郵儲存量", "豁免搬遷費"],
        bestFor: "適合村屋、需要 2G 光纖之住戶",
      },
      {
        id: "hgc-village-2g-tv-30m",
        name: "村屋 2G 連電視娛樂（30 個月）",
        monthlyFee: 329,
        contractMonths: 30,
        speedMbps: 2000,
        perks: [
          "送 24 個月 myTV SUPER 組合（基本、TVB 外購節目、精選基本、跨屏幕同時睇）",
          "30 個月 100 分鐘 hgc on air Wi-Fi",
          "1GB 電郵儲存量",
          "豁免搬遷費",
        ],
        bestFor: "適合村屋、需要影視娛樂之住戶",
      },
      {
        id: "hgc-village-2g-wifi6-30m",
        name: "村屋 2G 連 Wi-Fi 6＋電話（30 個月）",
        monthlyFee: 349,
        contractMonths: 30,
        speedMbps: 2000,
        perks: [
          "送 TP-Link Wi-Fi 6 路由器",
          "家居／寬頻電話服務",
          "30 個月 100 分鐘 hgc on air Wi-Fi",
          "1GB 電郵儲存量",
          "豁免搬遷費",
        ],
        bestFor: "適合村屋、需要 Wi-Fi 6 之住戶",
      },
      {
        id: "hgc-village-2g-wifi7-30m",
        name: "村屋 2G 連 Wi-Fi 7＋電話（30 個月）",
        monthlyFee: 359,
        contractMonths: 30,
        speedMbps: 2000,
        perks: [
          "送 TP-Link Wi-Fi 7 旗艦路由器",
          "家居／寬頻電話服務",
          "30 個月 100 分鐘 hgc on air Wi-Fi",
          "1GB 電郵儲存量",
          "豁免搬遷費",
        ],
        bestFor: "適合村屋、需要 Wi-Fi 7 之住戶",
      },
    ];

    assert.equal(toEnglish("豁免安裝費"), "Installation waived");

    for (const spec of expected) {
      const row = plan(spec.id);
      assert.equal(row.providerId, "hgc");
      assert.equal(row.category, "broadband");
      assert.equal(row.name, spec.name);
      assert.equal(row.monthlyFee, spec.monthlyFee);
      assert.equal(row.freeMonths, 0);
      assert.equal(row.contractMonths, spec.contractMonths);
      assert.equal(row.speedMbps, spec.speedMbps);
      assert.equal(row.install, "豁免安裝費");
      assert.equal(toEnglish(row.install), "Installation waived");
      assert.deepEqual(row.housing, ["village"]);
      assert.equal(row.network, "光纖入屋");
      assert.equal(row.prepaid, "須預繳 HK$300");
      assert.deepEqual(row.perks, spec.perks);
      assert.equal(row.limits, HGC_VILLAGE_LIMITS);
      assert.match(row.limits ?? "", /實際覆蓋須核對門牌/);
      assert.doesNotMatch(row.limits ?? "", /實際覆蓋須另行核對/);
      assert.equal(row.bestFor, spec.bestFor);
    }

    assert.deepEqual(
      PLANS.filter((p) => p.install === "須另行核對").map((p) => p.id),
      [],
    );
    assert.deepEqual(
      PLANS.filter((p) => WAIVED_IDS.includes(p.id as (typeof WAIVED_IDS)[number])).map((p) => p.id),
      [...WAIVED_IDS],
    );

    const limitsWithConfirm = PLANS.filter((p) => p.limits?.includes("實際覆蓋須另行核對"));
    assert.ok(limitsWithConfirm.length >= 1);
    assert.ok(limitsWithConfirm.every((p) => p.providerId === "hkbn"));
    assert.ok(limitsWithConfirm.every((p) => !WAIVED_IDS.includes(p.id as (typeof WAIVED_IDS)[number])));

    const student = plan("hgc-ftth-1000-student");
    assert.equal(student.install, "安裝費 HK$180");
    assert.equal(student.monthlyFee, 149);
    assert.equal(student.name, "留學生 1000M（12 個月）");

    const otherHgc = PLANS.filter((p) => p.providerId === "hgc" && !WAIVED_IDS.includes(p.id as (typeof WAIVED_IDS)[number]));
    assert.ok(otherHgc.length >= 1);
    assert.ok(otherHgc.every((p) => p.install !== "須另行核對"));

    const hkbnVillage = plan("hkbn-village-200-27m");
    assert.equal(hkbnVillage.install, "豁免安裝費（原價 HK$680）");
    assert.match(hkbnVillage.limits ?? "", /實際覆蓋須另行核對/);

    const netvigatorVillage = plan("netvigator-ftth-1000-village-36m");
    assert.equal(netvigatorVillage.install, "豁免安裝費");
    assert.match(netvigatorVillage.limits ?? "", /實際覆蓋須核對門牌/);
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

describe("iCable 1000M FTTH $58 48-month", () => {
  it("adds one $58 plan without changing the two $88 1000M cards", () => {
    const ids = PLANS.map((p) => p.id);
    assert.equal(ids.filter((id) => id === "icable-ftth-1000-48m-58").length, 1);
    assert.notEqual("icable-ftth-1000-48m-58", "icable-ftth-1000-public-48m");
    assert.notEqual("icable-ftth-1000-48m-58", "icable-ftth-1000-private-36m");

    const row = plan("icable-ftth-1000-48m-58");
    assert.equal(row.providerId, "icable");
    assert.equal(row.category, "broadband");
    assert.equal(row.id, "icable-ftth-1000-48m-58");
    assert.equal(row.name, "1000M 光纖入屋（48 個月）");
    assert.equal(row.monthlyFee, 58);
    assert.equal(row.freeMonths, 0);
    assert.equal(row.contractMonths, 48);
    assert.equal(row.speedMbps, 1000);
    assert.equal(row.install, "豁免安裝費");
    assert.ok(Array.isArray(row.housing) && !row.housing.includes("village"));
    assert.deepEqual(row.housing, ["public", "hos", "private"]);
    assert.equal(row.network, "光纖入屋");
    assert.deepEqual(row.perks, ["豁免搬遷費"]);
    assert.equal(row.perks.length, 1);
    assert.doesNotMatch(row.perks.join(" "), /路由器|Now TV|電視/);
    assert.equal(row.hot, true);
    assert.equal(row.latestOffer, true);
    assert.equal(row.quotePick, true);
    assert.equal(row.bestFor, "適合公屋、居屋或私人樓宇、需要 1000M 光纖之住戶");
    assert.doesNotMatch(row.bestFor, /村屋/);
    assert.equal(row.limits, "適用於公屋、居屋及私人樓宇。不適用於村屋。");
    assert.doesNotMatch(row.limits ?? "", /覆蓋視乎|指定地址|保證/);
    assert.equal(row.portInPerk, undefined);
    assert.equal(row.prepaid, undefined);

    assert.equal(toEnglish(row.name), "1000M FTTH (48 months)");
    assert.equal(toEnglish(row.perks[0]), "Relocation fee waived");
    assert.equal(toEnglish(row.bestFor), "For public housing, HOS or private buildings that need 1000M fibre");
    assert.equal(toEnglish(row.limits ?? ""), "Applies to public housing, HOS and private buildings. Not for village houses.");

    const public48 = plan("icable-ftth-1000-public-48m");
    assert.equal(public48.monthlyFee, 88);
    assert.equal(public48.freeMonths, 0);
    assert.equal(public48.contractMonths, 48);
    assert.equal(public48.speedMbps, 1000);
    assert.equal(public48.name, "公居屋 1000M 光纖（48 個月）");
    assert.deepEqual(public48.housing, ["public", "hos"]);
    assert.deepEqual(public48.perks, ["送 TP-Link EX141 路由器", "豁免搬遷費"]);
    assert.equal(public48.hot, undefined);
    assert.equal(public48.latestOffer, undefined);
    assert.equal(public48.quotePick, undefined);
    assert.equal(public48.bestFor, "適合公屋或居屋、需要 1000M 光纖之住戶");

    const private36 = plan("icable-ftth-1000-private-36m");
    assert.equal(private36.monthlyFee, 88);
    assert.equal(private36.freeMonths, 0);
    assert.equal(private36.contractMonths, 36);
    assert.equal(private36.speedMbps, 1000);
    assert.equal(private36.name, "私人樓宇 1000M 光纖（36 個月）");
    assert.deepEqual(private36.housing, ["private"]);
    assert.deepEqual(private36.perks, ["豁免搬遷費"]);
    assert.equal(private36.hot, undefined);
    assert.equal(private36.latestOffer, undefined);
    assert.equal(private36.quotePick, undefined);
    assert.equal(private36.bestFor, "適合私人樓宇、需要 1000M 光纖之住戶");

    assert.deepEqual(
      PLANS.filter((p) => p.providerId === "icable" && p.category === "broadband").map((p) => p.id),
      [
        "icable-ftth-200-36m",
        "icable-ftth-1000-48m-58",
        "icable-ftth-1000-private-36m",
        "icable-ftth-1000-public-48m",
        "icable-ftth-1000-public-36m",
        "icable-ftth-2000-private-36m",
        "icable-ftth-2000-public-36m",
        "icable-ftth-2000-public-24m",
      ],
    );
  });
});
