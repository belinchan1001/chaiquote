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
  plansForAiCards,
  resolveEstate,
  retrievePlansForAsk,
  sanitizeAiReply,
  stripFeeTalk,
  tokensToUsd,
  usdToHkd,
} from "./ai-desk.ts";
import { isBareHousingTypeQuery, matchKnownEstate, searchEstates } from "./estates.ts";
import { averageFee, formatFee, getPlan, type Plan } from "./plans.ts";

const here = dirname(fileURLToPath(import.meta.url));

function planAppliesToVillage(housing: Plan["housing"]) {
  return housing === "all" || housing.includes("village");
}

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
    assert.ok(found.plans.every((plan) => planAppliesToVillage(plan.housing)));
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

  it("does not treat bare 村屋／丁屋／village house as an estate name", () => {
    for (const query of ["村屋", "丁屋", "village house", "village houses", "Village House"]) {
      assert.equal(isBareHousingTypeQuery(query), true, query);
      assert.equal(matchKnownEstate(query), undefined, query);
      assert.deepEqual(searchEstates(query, 8), [], query);
      assert.equal(resolveEstate(query), undefined, query);
      assert.equal(resolveEstate(query, "天耀邨"), undefined, query);
    }
    assert.equal(isBareHousingTypeQuery("東頭村"), false);
    assert.equal(resolveEstate("東頭村 村屋")?.name, "東頭村");
    assert.equal(resolveEstate("村屋 1000M", "健康村"), undefined);
  });

  it("forces village housing for 村屋光纖／村屋 1000M and never lists i-Cable public+private cards", () => {
    const banned = ["icable-ftth-1000-48m-58", "icable-ftth-200-36m"];
    const queries = ["村屋光纖", "村屋 1000M", "丁屋 1000M", "village house 1000M"];
    const extras = [
      {},
      { housing: "public" },
      { housing: "private" },
      { estate: "天耀邨" },
      { estate: "健康村", housing: "public" },
      { estate: "太古城", housing: "private" },
    ];
    for (const message of queries) {
      for (const extra of extras) {
        const found = retrievePlansForAsk({ message, ...extra });
        assert.equal(found.housing, "village", `${message} ${JSON.stringify(extra)}`);
        assert.equal(found.estate, undefined, `${message} should not keep leftover estate`);
        assert.ok(found.plans.length >= 1, message);
        assert.ok(
          found.plans.every((plan) => planAppliesToVillage(plan.housing)),
          `${message} leaked non-village housing`,
        );
        assert.ok(
          found.plans.every((plan) => !banned.includes(plan.id) && plan.provider !== "有線寬頻"),
          `${message} leaked i-Cable`,
        );
      }
    }

    const thousand = retrievePlansForAsk({
      message: "村屋 1000M",
      housing: "public",
      estate: "太古城",
    });
    assert.equal(thousand.housing, "village");
    assert.ok(thousand.plans.every((plan) => plan.speedMbps === 1000));
    assert.ok(thousand.plans.some((plan) => plan.id === "netvigator-ftth-1000-village-24m"));
    const fees = thousand.plans.map((row) => {
      const plan = getPlan(row.id);
      assert.ok(plan, row.id);
      return averageFee(plan);
    });
    assert.deepEqual(fees, [...fees].sort((a, b) => a - b));
    assert.ok(fees[0] >= 270, "village 1000M should be around HK$278, not i-Cable $58");
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
    const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
    const ask = readFileSync(join(here, "ai-ask.ts"), "utf8");
    const desk = readFileSync(join(here, "ai-desk.ts"), "utf8");
    const widget = readFileSync(join(here, "../components/whatsapp-widget.tsx"), "utf8");

    assert.equal(quoted(messages, "aiStaffLead")[0], "講屋苑或想要咩，幫你收窄站內計劃");
    assert.match(quoted(messages, "aiStaffLead")[1] ?? "", /narrow the on-site plans/);
    assert.equal(quoted(messages, "aiBeta")[0], "測試版");
    assert.equal(quoted(messages, "aiBeta")[1], "Beta");
    assert.equal(quoted(messages, "aiWelcome")[0], "講屋苑或想要咩，對到就列俾你。價錢喺卡片，以電訊商確認為準。");
    assert.match(quoted(messages, "aiWelcome")[1] ?? "", /carrier confirms the final terms/);
    assert.equal(quoted(messages, "aiWelcomeTrial")[0], "功能試用中，結果僅供參考");
    assert.match(quoted(messages, "aiWelcomeTrial")[1] ?? "", /on trial/);
    assert.equal(quoted(messages, "aiCardRef")[0], "僅供參考");
    for (const key of ["aiWelcome", "aiWelcomeTrial", "aiHint"] as const) {
      for (const text of quoted(messages, key)) {
        assert.equal(text.includes("幫你揀咗"), false, `${key} still picks`);
        assert.equal(text.includes("幫我揀"), false, `${key} still picks`);
      }
    }

    assert.match(staff, /aiWelcomeCopy\(t\)/);
    assert.match(staff, /<AiBetaMark className="shrink-0 text-primary-foreground\/75" \/>/);
    assert.match(header, /<AiBetaMark className="hidden text-primary-foreground\/80 sm:inline" \/>/);
    assert.match(header, /AiBetaMark className="pointer-events-none absolute inset-x-0 bottom-0.5/);
    assert.match(header, /t\("aiStaffTiny"\)/);
    assert.doesNotMatch(header, /sr-only sm:hidden/);
    assert.doesNotMatch(header, /max-sm:w-11/);
    assert.match(staff, /plansForAiCards\(bubble\.planIds\)/);
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
    assert.match(staff, /inset-x-0 bottom-24/);
    assert.match(staff, /lg:left-4 lg:top-20/);
    assert.doesNotMatch(staff, /lg:right-3|lg:right-4|right-3 top-20/);

    assert.match(ask, /listing or filtering plans/);
    assert.match(ask, /篩選／列出計劃/);
    assert.doesNotMatch(ask, /recommending or filtering/);
    assert.doesNotMatch(ask, /篩選／推介計劃/);

    assert.match(widget, /QUICK_REPLIES\.map/);
    assert.match(widget, /wa-pulse wa-pulse-fab/);
  });

  it("surfaces locked AI filter entries on home, plans, and the mobile header", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const entry = readFileSync(join(here, "../components/ai-filter-entry.tsx"), "utf8");
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    const search = readFileSync(join(here, "../components/search-panel.tsx"), "utf8");
    const plans = readFileSync(join(here, "../routes/plans.tsx"), "utf8");
    const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
    const root = readFileSync(join(here, "../routes/__root.tsx"), "utf8");

    assert.equal(quoted(messages, "aiStaffTiny")[0], "AI");
    assert.equal(quoted(messages, "aiStaffTiny")[1], "AI");
    assert.equal(quoted(messages, "aiEntryLead")[0], "唔知點揀？");
    assert.equal(quoted(messages, "aiEntryCta")[0], "用 AI 篩選（測試版）");
    assert.match(quoted(messages, "aiEntryLead")[1] ?? "", /Not sure how to choose/);
    assert.equal(quoted(messages, "aiEntryCta")[1], "Use AI filter (Beta)");
    assert.equal(quoted(messages, "aiBeta")[0], "測試版");

    assert.match(entry, /toggleAi/);
    assert.match(entry, /t\("aiEntryLead"\)/);
    assert.match(entry, /t\("aiEntryCta"\)/);
    assert.doesNotMatch(entry, /fixed |fab|floating/i);

    assert.match(home, /<SearchPanel \/>/);
    assert.match(search, /<AiFilterEntry className="pt-1" \/>/);
    assert.match(plans, /<AiFilterEntry className="mt-6" \/>/);
    assert.match(plans, /mt-3 space-y-4 rounded-xl bg-card/);
    assert.match(header, /<span className="sm:hidden">\{t\("aiStaffTiny"\)\}<\/span>/);
    assert.match(root, /<DeferredWhatsApp \/>/);
    assert.match(root, /<AiStaffPanel \/>/);
    assert.doesNotMatch(root, /AiFilterEntry/);
  });

  it("allows HK$ only on mini-cards; chat body and catalogue stay fee-free", () => {
    const found = retrievePlansForAsk({ message: "村屋 1000M 光纖" });
    const shuffled = [...found.plans.map((plan) => plan.id)].reverse();
    const cards = plansForAiCards(shuffled);
    assert.ok(cards.length >= 2);
    const fees = cards.map((plan) => averageFee(plan));
    assert.deepEqual(fees, [...fees].sort((a, b) => a - b));
    assert.match(formatFee(cards[0].monthlyFee), /^HK\$/);
    assert.ok(cards[0].contractMonths > 0);

    assert.doesNotMatch(sanitizeAiReply("月費只要 HK$98，好平", "zh"), /HK\$|\$\d/);
    assert.doesNotMatch(sanitizeAiReply("Only $98 / month", "en"), /HK\$|\$\d/);
    assert.doesNotMatch(fallbackReply(true, "zh"), /HK\$|\$\d/);
    assert.doesNotMatch(fallbackReply(true, "en"), /HK\$|\$\d/);
    assert.doesNotMatch(JSON.stringify(found.plans), /monthlyFee|HK\$/);

    const staff = readFileSync(join(here, "../components/ai-staff.tsx"), "utf8");
    assert.match(staff, /\{bubble\.text\}/);
    assert.doesNotMatch(staff, /formatFee\([^)]*bubble\.text/);
    assert.match(staff, /formatFee\(plan\.monthlyFee\)[\s\S]*t\("aiCardRef"\)/);
  });
});
