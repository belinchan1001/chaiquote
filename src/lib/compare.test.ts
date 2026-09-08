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
    assert.equal(youth.hot, true);
    assert.equal(youth.latestOffer, true);
    assert.equal(youth.quotePick, true);
    assert.deepEqual(
      PLANS.filter((p) => p.latestOffer).map((p) => p.id),
      ["hkbn-5g-30-78-youth"],
    );
    assert.deepEqual(
      PLANS.filter((p) => p.quotePick).map((p) => p.id),
      ["hkbn-5g-30-78-youth"],
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
        "netvigator-ftth-1000-private-36m-98",
        "netvigator-ftth-1000-private-36m-198",
        "netvigator-ftth-1000-private-24m",
        "netvigator-ftth-1000-private-36m",
        "netvigator-ftth-2500-private-24m",
        "netvigator-ftth-1000-public-36m-98",
        "netvigator-ftth-1000-public-36m-108",
        "netvigator-ftth-1000-public-36m-128",
        "netvigator-ftth-2500-public-36m-158",
        "netvigator-ftth-1000-private-36m-118",
        "netvigator-ftth-2500-private-36m-176",
        "netvigator-ftth-1000-village-36m",
        "netvigator-ftth-2500-village-36m",
        "netvigator-ftth-10000",
      ],
    );

    const private118 = plan("netvigator-ftth-1000-private-36m-118");
    assert.equal(private118.monthlyFee, 108);
    assert.deepEqual(private118.perks, [
      "包 Linksys EA9350 Wi-Fi 6 路由器",
      "送 Now TV 頻道",
      "豁免搬遷費",
      "可加購每月 HK$68 換購指定家電（須符合資格）",
    ]);

    const private176 = plan("netvigator-ftth-2500-private-36m-176");
    assert.equal(private176.monthlyFee, 176);
    assert.equal(private176.name, "私人樓宇 2500M 光纖（36 個月＋Wi-Fi 7）");
    assert.deepEqual(private176.housing, ["private"]);

    const village1000 = plan("netvigator-ftth-1000-village-36m");
    assert.equal(village1000.monthlyFee, 268);
    assert.deepEqual(village1000.housing, ["village"]);

    const village2500 = plan("netvigator-ftth-2500-village-36m");
    assert.equal(village2500.monthlyFee, 398);
    assert.deepEqual(village2500.housing, ["village"]);

    for (const p of [plan98, plan128, plan158]) {
      assert.doesNotMatch(JSON.stringify(p), /保證|最平/);
      assert.equal(p.perks.includes("可加購每月 HK$68 換購指定家電（須符合資格）"), false);
    }
  });
});

describe("Netvigator exclusive-private 1000M $186", () => {
  const NAME = "獨家私人樓宇 1000M 光纖＋Wi-Fi 6 路由器＋手提電話服務";
  const PERKS = [
    "送指定 Wi-Fi 6 路由器",
    "家居固網電話",
    "Now TV 體驗組合或國際新聞組合（智能電視版）；可加 HK$38 升級機頂盒",
    "搬遷費津貼 HK$1,000",
  ];
  const LIMITS = "可選擇先安裝後啟動服務（最長 365 日）。實際覆蓋視乎個別樓宇而定。";

  it("keeps the 24-month card and adds a 36-month twin at the same fee", () => {
    const plan24 = plan("netvigator-ftth-1000-private-24m");
    const plan36 = plan("netvigator-ftth-1000-private-36m");

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
      assert.equal(toEnglish(row.name), "Exclusive private 1000M fibre + Wi-Fi 6 router + mobile phone service");
    }

    assert.equal(plan24.contractMonths, 24);
    assert.equal(plan36.contractMonths, 36);

    const cheap36 = plan("netvigator-ftth-1000-private-36m-98");
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
