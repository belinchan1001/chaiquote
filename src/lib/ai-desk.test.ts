import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AI_MONTHLY_BUDGET_HKD,
  containsFeeTalk,
  detectCategory,
  detectSpeed,
  composeFallback,
  fallbackReply,
  matchKnowledge,
  parseAiJson,
  pickAllowedPlanIds,
  retrievePlansForAsk,
  sanitizeAiReply,
  stripFeeTalk,
  tokensToUsd,
  usdToHkd,
} from "./ai-desk.ts";

describe("AI desk safety", () => {
  it("caps the monthly budget at HK$200 and never lets the model talk fees", () => {
    assert.equal(AI_MONTHLY_BUDGET_HKD, 200);
    assert.equal(usdToHkd(200 / 7.8), 200);
    assert.equal(containsFeeTalk("月費 HK$378"), true);
    assert.equal(containsFeeTalk("平均月費 336"), true);
    assert.equal(containsFeeTalk("保證最平"), true);
    assert.equal(containsFeeTalk("我幫你睇光纖同手機計劃"), false);
    assert.equal(stripFeeTalk("呢張月費 HK$378，適合村屋"), "");
    assert.match(sanitizeAiReply("月費只要 $98", "zh"), /卡片/);
    assert.doesNotMatch(sanitizeAiReply("月費只要 $98", "zh"), /\$|月費/);
    assert.doesNotMatch(fallbackReply(true, "zh"), /最平|保證|月費 HK/);
  });

  it("parses model JSON and only keeps catalogue ids", () => {
    const parsed = parseAiJson('note\n{"reply":"睇下面卡片","planIds":["hkbn-village-1000-27m","nope"]}\n');
    assert.equal(parsed.reply, "睇下面卡片");
    const picked = pickAllowedPlanIds(parsed.planIds, [
      {
        id: "hkbn-village-1000-27m",
        name: "村屋 1000M",
        provider: "香港寬頻",
        category: "broadband",
        network: "光纖入屋",
        contractMonths: 27,
        housing: ["village"],
        perks: [],
      },
    ]);
    assert.deepEqual(picked, ["hkbn-village-1000-27m"]);
  });

  it("retrieves village fibre without putting fees in the catalogue payload", () => {
    assert.equal(detectCategory("村屋 1000M 光纖"), "broadband");
    assert.equal(detectSpeed("村屋 1000M 光纖"), 1000);
    assert.equal(detectSpeed("1000M／2500M／5000M／10000M"), undefined);
    const found = retrievePlansForAsk({ message: "村屋 1000M 光纖" });
    assert.equal(found.category, "broadband");
    assert.ok(found.plans.length >= 1);
    assert.ok(found.plans.every((plan) => plan.category === "broadband"));
    assert.ok(found.plans.some((plan) => plan.id.includes("village") || plan.housing === "village" || plan.housing === "all"));
    const blob = JSON.stringify(found.plans);
    assert.doesNotMatch(blob, /monthlyFee|averageFee|"rebate"/);
    assert.equal(containsFeeTalk("最終條款以電訊商確認為準"), false);
    assert.equal(tokensToUsd(1_000_000, 0), 0.2);
    assert.equal(tokensToUsd(0, 1_000_000), 0.5);
  });

  it("answers general questions without dumping random plan cards", () => {
    const official = matchKnowledge("齊Quote係咪電訊商官網");
    assert.equal(official?.id, "official");
    assert.equal(official?.attach, false);
    assert.match(official?.zh ?? "", /獨立比較/);
    const village = composeFallback({
      message: "村屋有冇光纖？",
      locale: "zh",
      plans: [{ id: "hkbn-village-1000-27m", name: "村屋", provider: "香港寬頻", category: "broadband", network: "光纖", contractMonths: 27, housing: ["village"], perks: [] }],
    });
    assert.match(village.reply, /村屋光纖/);
    assert.deepEqual(village.planIds, ["hkbn-village-1000-27m"]);
    const faq = composeFallback({
      message: "齊Quote係咪官網",
      locale: "zh",
      plans: [{ id: "hkbn-village-1000-27m", name: "村屋", provider: "香港寬頻", category: "broadband", network: "光纖", contractMonths: 27, housing: ["village"], perks: [] }],
    });
    assert.equal(faq.planIds.length, 0);
    assert.doesNotMatch(faq.reply, /最平|保證|HK\$/);
  });
});
