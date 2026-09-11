import { createServerFn } from "@tanstack/react-start";
import {
  AI_MAX_MESSAGE_CHARS,
  AI_MAX_OUTPUT_TOKENS,
  AI_MAX_TURNS_PER_SESSION,
  AI_MODEL,
  AI_MONTHLY_BUDGET_USD,
  fallbackReply,
  monthKey,
  parseAiJson,
  pickAllowedPlanIds,
  retrievePlansForAsk,
  sanitizeAiReply,
  tokensToUsd,
  usdToHkd,
  type AiCatalogPlan,
} from "./ai-desk.ts";

export type AskAiInput = {
  message: string;
  estate?: string;
  housing?: string;
  locale?: "zh" | "en";
  sessionId?: string;
};

export type AskAiResult =
  | {
      ok: true;
      reply: string;
      planIds: string[];
      budgetLeftHkd: number;
      usedModel: boolean;
    }
  | {
      ok: false;
      reason: "budget" | "rate" | "empty";
      reply: string;
      planIds: string[];
    };

type SpendSlot = {
  month: string;
  usd: number;
  sessions: Map<string, number>;
};

const globalRef = globalThis as typeof globalThis & {
  __chaiquoteAiSpend__?: SpendSlot;
};

function spendSlot() {
  const month = monthKey();
  const current = globalRef.__chaiquoteAiSpend__;
  if (!current || current.month !== month) {
    const next: SpendSlot = { month, usd: 0, sessions: new Map() };
    globalRef.__chaiquoteAiSpend__ = next;
    return next;
  }
  return current;
}

function catalogForModel(plans: AiCatalogPlan[]) {
  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    provider: plan.provider,
    category: plan.category,
    network: plan.network,
    speedMbps: plan.speedMbps,
    dataGb: plan.dataGb,
    contractMonths: plan.contractMonths,
    housing: plan.housing,
    perks: plan.perks,
    quotePick: plan.quotePick,
    flashOffer: plan.flashOffer,
    newIntakeOffer: plan.newIntakeOffer,
  }));
}

async function completeJson(message: string, plans: AiCatalogPlan[], locale: "zh" | "en") {
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) return { text: "", usd: 0 };
  const slot = spendSlot();
  if (slot.usd >= AI_MONTHLY_BUDGET_USD) return { text: "", usd: 0, over: true as const };

  const system =
    locale === "en"
      ? "You are ChaiQuote, an independent Hong Kong telecom comparison helper. Reply in JSON only: {\"reply\":\"...\",\"planIds\":[\"id\"]}. Pick at most 3 ids from the provided catalogue. Never mention prices, monthly fees, averages, rebates, admin fees, install fees, HK$, or words like cheapest/guarantee/lowest. Tell the user fees are on the cards and the carrier confirms terms. Do not invent plans."
      : "你係齊Quote，獨立香港電訊比較幫手。只回 JSON：{\"reply\":\"...\",\"planIds\":[\"id\"]}。planIds 最多 3 個，必須來自提供嘅目錄。不准提及價錢、月費、平均月費、回贈、行政費、安裝費、HK$、最平、保證、最低。叫用戶睇下面卡片，實際以電訊商確認為準。唔好發明計劃。用廣東話短句。";

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.2,
      max_tokens: AI_MAX_OUTPUT_TOKENS,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: JSON.stringify({
            question: message,
            catalogue: catalogForModel(plans),
          }),
        },
      ],
    }),
  });
  if (!res.ok) return { text: "", usd: 0 };
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const usd = tokensToUsd(body.usage?.prompt_tokens ?? 1200, body.usage?.completion_tokens ?? 180);
  slot.usd += usd;
  return { text: body.choices?.[0]?.message?.content ?? "", usd };
}

export const askAiDesk = createServerFn({ method: "POST" })
  .inputValidator((data: AskAiInput) => data)
  .handler(async ({ data }): Promise<AskAiResult> => {
    const locale = data.locale === "en" ? "en" : "zh";
    const message = (data.message ?? "").trim().slice(0, AI_MAX_MESSAGE_CHARS);
    if (message.length < 2) {
      return {
        ok: false,
        reason: "empty",
        reply: fallbackReply(false, locale),
        planIds: [],
      };
    }

    const sessionId = (data.sessionId ?? "anon").slice(0, 80);
    const slot = spendSlot();
    const used = slot.sessions.get(sessionId) ?? 0;
    if (used >= AI_MAX_TURNS_PER_SESSION) {
      const retrieved = retrievePlansForAsk(data);
      return {
        ok: false,
        reason: "rate",
        reply:
          locale === "en"
            ? "This chat hit the turn limit. Please check the quote on WhatsApp."
            : "呢個對話次數用完。請直接 WhatsApp 查核報價。",
        planIds: retrieved.plans.slice(0, 3).map((plan) => plan.id),
      };
    }
    slot.sessions.set(sessionId, used + 1);

    const retrieved = retrievePlansForAsk({
      message,
      estate: data.estate,
      housing: data.housing,
    });
    const planIds = retrieved.plans.slice(0, 3).map((plan) => plan.id);
    if (slot.usd >= AI_MONTHLY_BUDGET_USD) {
      return {
        ok: false,
        reason: "budget",
        reply:
          locale === "en"
            ? "This month’s AI allowance is used up. Please check the quote on WhatsApp. Fees stay on the plan cards."
            : "呢個月 AI 額度用完。請直接 WhatsApp 查核報價。價錢仍然以計劃卡同電訊商確認為準。",
        planIds,
      };
    }
    if (!process.env.XAI_API_KEY?.trim()) {
      return {
        ok: true,
        reply: fallbackReply(planIds.length > 0, locale),
        planIds,
        budgetLeftHkd: Math.max(0, Math.round(usdToHkd(AI_MONTHLY_BUDGET_USD - slot.usd))),
        usedModel: false,
      };
    }

    const completion = await completeJson(message, retrieved.plans, locale);
    if ("over" in completion && completion.over) {
      const planIds = retrieved.plans.slice(0, 3).map((plan) => plan.id);
      return {
        ok: false,
        reason: "budget",
        reply:
          locale === "en"
            ? "This month’s AI allowance is used up. Please check the quote on WhatsApp. Fees stay on the plan cards."
            : "呢個月 AI 額度用完。請直接 WhatsApp 查核報價。價錢仍然以計劃卡同電訊商確認為準。",
        planIds,
      };
    }

    const parsed = parseAiJson(completion.text);
    const planIds = pickAllowedPlanIds(parsed.planIds, retrieved.plans);
    const reply = sanitizeAiReply(parsed.reply ?? fallbackReply(planIds.length > 0, locale), locale);
    return {
      ok: true,
      reply,
      planIds,
      budgetLeftHkd: Math.max(0, Math.round(usdToHkd(AI_MONTHLY_BUDGET_USD - slot.usd))),
      usedModel: Boolean(completion.text),
    };
  });
