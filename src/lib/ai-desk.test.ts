import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
import { averageFee, getPlan } from "./plans.ts";

const here = dirname(fileURLToPath(import.meta.url));

function quoted(src: string, key: string): string[] {
  return [...src.matchAll(new RegExp(`${key}:\\s*"([^"]*)"`, "g"))].map((match) => match[1]);
}

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
    assert.doesNotMatch(fallbackReply(true, "zh"), /幫你揀咗|幫我揀|幫你揀/);
    assert.doesNotMatch(sanitizeAiReply("", "zh"), /幫你揀咗|幫我揀|幫你揀/);
    assert.match(fallbackReply(true, "zh"), /列出對到/);
    assert.match(sanitizeAiReply("", "zh"), /列出對到/);
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

  it("ranks retrieved plans by average fee ascending, not quotePick / flash / newIntake", () => {
    const found = retrievePlansForAsk({ message: "村屋 1000M 光纖" });
    assert.ok(found.plans.length >= 2);
    const fees = found.plans.map((row) => {
      const plan = getPlan(row.id);
      assert.ok(plan, row.id);
      return averageFee(plan);
    });
    assert.deepEqual(fees, [...fees].sort((a, b) => a - b));

    const quoteFirst = [...found.plans].sort((a, b) => {
      if (!!a.quotePick !== !!b.quotePick) return a.quotePick ? -1 : 1;
      if (!!a.flashOffer !== !!b.flashOffer) return a.flashOffer ? -1 : 1;
      if (!!a.newIntakeOffer !== !!b.newIntakeOffer) return a.newIntakeOffer ? -1 : 1;
      return 0;
    });
    const feeOrderIds = found.plans.map((plan) => plan.id);
    const pickOrderIds = quoteFirst.map((plan) => plan.id);
    if (found.plans.some((plan) => plan.quotePick) && found.plans.some((plan) => !plan.quotePick)) {
      assert.notDeepEqual(feeOrderIds, pickOrderIds);
    }

    const desk = readFileSync(join(here, "ai-desk.ts"), "utf8");
    assert.match(desk, /const ranked = \[\.\.\.rows\]\.sort\(\(a, b\) => averageFee\(a\) - averageFee\(b\)\)/);
    assert.doesNotMatch(desk, /if \(!!a\.quotePick !== !!b\.quotePick\)/);
    assert.doesNotMatch(desk, /if \(!!a\.flashOffer !== !!b\.flashOffer\)/);
    assert.doesNotMatch(desk, /if \(!!a\.newIntakeOffer !== !!b\.newIntakeOffer\)/);
  });

  it("locks filter copy, mini-cards, chips, and panel placement", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const staff = readFileSync(join(here, "../components/ai-staff.tsx"), "utf8");
    const ask = readFileSync(join(here, "ai-ask.ts"), "utf8");
    const desk = readFileSync(join(here, "ai-desk.ts"), "utf8");
    const widget = readFileSync(join(here, "../components/whatsapp-widget.tsx"), "utf8");

    assert.equal(quoted(messages, "aiStaffLead")[0], "講屋苑或想要咩，幫你收窄站內計劃");
    assert.match(quoted(messages, "aiStaffLead")[1] ?? "", /narrow the on-site plans/);
    assert.equal(quoted(messages, "aiWelcome")[0], "講屋苑或想要咩，對到就列俾你。價錢喺卡片。");
    assert.equal(quoted(messages, "aiCardRef")[0], "僅供參考");
    for (const key of ["aiWelcome", "aiHint"] as const) {
      for (const text of quoted(messages, key)) {
        assert.equal(text.includes("幫你揀咗"), false, `${key} still picks`);
        assert.equal(text.includes("幫我揀"), false, `${key} still picks`);
      }
    }

    assert.match(staff, /<ProviderMark id=\{plan\.providerId\} size="sm"/);
    assert.match(staff, /formatFee\(plan\.monthlyFee\)/);
    assert.match(staff, /t\("months", \{ n: plan\.contractMonths \}\)/);
    assert.match(staff, /t\("aiCardRef"\)/);
    assert.match(staff, /to="\/plans\/\$planId"/);
    assert.match(staff, /t\("aiWaCta"\)/);
    assert.doesNotMatch(staff, /QUICK_REPLIES/);
    assert.match(staff, /QUESTION_CHIPS\.map/);
    assert.match(desk, /id: "village"/);
    assert.match(desk, /id: "port"/);
    assert.match(desk, /id: "housing"/);

    assert.doesNotMatch(staff, /fixed right-3 top-20/);
    assert.match(staff, /inset-x-0 bottom-0/);
    assert.match(staff, /lg:left-4 lg:top-20/);
    assert.doesNotMatch(staff, /lg:right-3|lg:right-4|right-3 top-20/);

    assert.match(ask, /listing or filtering plans/);
    assert.match(ask, /篩選／列出計劃/);
    assert.doesNotMatch(ask, /recommending or filtering/);
    assert.doesNotMatch(ask, /篩選／推介計劃/);

    assert.match(widget, /QUICK_REPLIES\.map/);
    assert.match(widget, /wa-pulse wa-pulse-fab/);
  });
});
