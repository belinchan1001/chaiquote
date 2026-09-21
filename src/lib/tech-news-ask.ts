import { createServerFn } from "@tanstack/react-start";
import { AI_MODEL, AI_MONTHLY_BUDGET_USD, monthKey, tokensToUsd } from "./ai-desk.ts";
import {
  NEWS_JOURNALIST_SYSTEM,
  NEWS_MAX_OUTPUT_TOKENS,
  NEWS_MAX_SOURCE_CHARS,
  isNewsCategory,
  isSafeNewsUrl,
  newsDeskKey,
  newsDeskKeyOk,
  parseNewsDraft,
  stripHtml,
} from "./tech-news-desk.ts";
import { getPublishedNews, insertPublishedNews } from "./tech-news-store.ts";
import type { TechNewsArticle, TechNewsCategoryId } from "./tech-news.ts";

type SpendSlot = { month: string; usd: number; drafts: number };

const globalRef = globalThis as typeof globalThis & {
  __chaiquoteNewsSpend__?: SpendSlot;
};

function spendSlot() {
  const month = monthKey();
  const current = globalRef.__chaiquoteNewsSpend__;
  if (!current || current.month !== month) {
    const next: SpendSlot = { month, usd: 0, drafts: 0 };
    globalRef.__chaiquoteNewsSpend__ = next;
    return next;
  }
  return current;
}

export type DraftNewsInput = {
  token?: string;
  category: TechNewsCategoryId;
  sourceUrl?: string;
  sourceText?: string;
};

export type DraftNewsResult =
  | { ok: true; article: TechNewsArticle; usedModel: boolean }
  | { ok: false; reason: "token" | "empty" | "fetch" | "budget" | "parse"; message: string };

async function fetchSource(url: URL): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url.href, {
      signal: controller.signal,
      headers: { Accept: "text/html,text/plain;q=0.9", "User-Agent": "ChaiQuoteNewsDesk/1.0" },
      redirect: "follow",
    });
    if (!res.ok) return "";
    const buf = await res.arrayBuffer();
    const text = new TextDecoder("utf-8").decode(buf.slice(0, 80_000));
    return stripHtml(text).slice(0, NEWS_MAX_SOURCE_CHARS);
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

async function completeNews(source: string, category: TechNewsCategoryId, sourceUrl?: string) {
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) return { text: "", usd: 0 };
  const slot = spendSlot();
  if (slot.usd >= AI_MONTHLY_BUDGET_USD) return { text: "", usd: 0, over: true as const };
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.2,
      max_tokens: NEWS_MAX_OUTPUT_TOKENS,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: NEWS_JOURNALIST_SYSTEM },
        {
          role: "user",
          content: JSON.stringify({
            category,
            sourceUrl: sourceUrl || null,
            source,
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
  const usd = tokensToUsd(body.usage?.prompt_tokens ?? 1800, body.usage?.completion_tokens ?? 900);
  slot.usd += usd;
  return { text: body.choices?.[0]?.message?.content ?? "", usd };
}

export const draftTechNews = createServerFn({ method: "POST" })
  .inputValidator((data: DraftNewsInput) => data)
  .handler(async ({ data }): Promise<DraftNewsResult> => {
    if (!newsDeskKeyOk(data.token)) {
      return {
        ok: false,
        reason: "token",
        message: newsDeskKey() ? "編輯鎖匙不正確。" : "未設定編輯鎖匙，暫時只能喺對話出稿。",
      };
    }
    if (!isNewsCategory(data.category)) {
      return { ok: false, reason: "empty", message: "請揀專區。" };
    }
    const slot = spendSlot();
    if (slot.drafts >= 20) {
      return { ok: false, reason: "budget", message: "今日出稿次數用完。" };
    }
    const pasted = (data.sourceText ?? "").trim().slice(0, NEWS_MAX_SOURCE_CHARS);
    let source = pasted;
    let sourceUrl: string | undefined;
    const rawUrl = (data.sourceUrl ?? "").trim();
    if (rawUrl) {
      const safe = isSafeNewsUrl(rawUrl);
      if (!safe) return { ok: false, reason: "fetch", message: "網址唔安全或者格式不正確。" };
      sourceUrl = safe.href;
      if (!source) {
        source = await fetchSource(safe);
        if (source.length < 80) return { ok: false, reason: "fetch", message: "擷取唔到原文，請改貼文字。" };
      }
    }
    if (source.length < 40) {
      return { ok: false, reason: "empty", message: "請貼官方連結或者原文。" };
    }
    if (slot.usd >= AI_MONTHLY_BUDGET_USD) {
      return { ok: false, reason: "budget", message: "呢個月 AI 額度用完。" };
    }
    slot.drafts += 1;
    const completion = await completeNews(source, data.category, sourceUrl);
    if ("over" in completion && completion.over) {
      return { ok: false, reason: "budget", message: "呢個月 AI 額度用完。" };
    }
    const article = parseNewsDraft(completion.text, data.category, sourceUrl);
    if (!article) {
      return { ok: false, reason: "parse", message: "AI 稿未能通過核對（可能缺重點或者寫咗保證句）。請再試一次。" };
    }
    return { ok: true, article, usedModel: Boolean(completion.text) };
  });

export const publishTechNews = createServerFn({ method: "POST" })
  .inputValidator((data: { token?: string; article: TechNewsArticle }) => data)
  .handler(async ({ data }) => {
    if (!newsDeskKeyOk(data.token)) {
      return { ok: false as const, message: "編輯鎖匙不正確，未有上架。" };
    }
    if (!data.article?.slug || !data.article.h1) {
      return { ok: false as const, message: "稿件不完整。" };
    }
    const exists = await getPublishedNews(data.article.slug);
    if (exists) {
      return { ok: false as const, message: "呢個網址已有稿，請改 slug 或先喺對話處理。" };
    }
    const saved = await insertPublishedNews(data.article);
    if (!saved) return { ok: false as const, message: "資料庫未能寫入。請喺對話確認後由編輯上架。" };
    return { ok: true as const, slug: data.article.slug };
  });
