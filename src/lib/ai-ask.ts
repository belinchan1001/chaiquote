import { createServerFn } from "@tanstack/react-start";
import {
  AI_MAX_MESSAGE_CHARS,
  AI_MAX_OUTPUT_TOKENS,
  AI_MAX_TURNS_PER_SESSION,
  AI_MODEL,
  AI_MONTHLY_BUDGET_USD,
  composeFallback,
  fallbackReply,
  knowledgeBriefs,
  matchKnowledge,
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
      ? "You are the ChaiQuote AI specialist. Two jobs: (1) filter this site’s reference plans (2) answer general questions from the knowledge notes (fibre, 5G home, mobile, village houses, port-in, what ChaiQuote is). JSON only: {\"reply\":\"...\",\"planIds\":[\"id\"]}. Use planIds only when recommending or filtering plans; empty array for general FAQ. Never quote dollar amounts, HK$, averages, cheapest or guarantee. Fees stay on the cards; the carrier confirms terms. Do not invent plans or coverage."
      : "你係齊Quote AI 專員。兩件事：1）幫訪客篩選站內參考計劃 2）用提供嘅知識答一般問題（光纖、5G家居、手機、村屋、攜號轉台、本站係咪官網）。只回 JSON：{\"reply\":\"...\",\"planIds\":[\"id\"]}。只有篩選／推介計劃先填 planIds，一般問題可以空陣列。不准報具體價錢、HK$、平均月費、最平、保證。價錢喺卡片，實際以電訊商確認為準。唔好發明計劃或覆蓋。用廣東話短句。";

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
            knowledge: matchKnowledge(message) ?? knowledgeBriefs(),
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
      const composed = composeFallback({ message, locale, plans: retrieved.plans });
      return {
        ok: true,
        reply: composed.reply,
        planIds: composed.planIds,
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
    const composed = composeFallback({ message, locale, plans: retrieved.plans });
    const chosen = pickAllowedPlanIds(parsed.planIds, retrieved.plans, composed.planIds.length > 0);
    const reply = sanitizeAiReply(parsed.reply ?? composed.reply, locale);
    return {
      ok: true,
      reply,
      planIds: chosen,
      budgetLeftHkd: Math.max(0, Math.round(usdToHkd(AI_MONTHLY_BUDGET_USD - slot.usd))),
      usedModel: Boolean(completion.text),
    };
  });
