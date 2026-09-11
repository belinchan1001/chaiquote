import { matchKnownEstate, searchEstates, classifyAddress, type Estate } from "./estates.ts";
import {
  PLANS,
  PROVIDER_MAP,
  averageFee,
  filterPlans,
  type Category,
  type Housing,
  type Plan,
  type ProviderId,
} from "./plans.ts";

export const AI_MONTHLY_BUDGET_HKD = 200;
export const HKD_PER_USD = 7.8;
export const AI_MONTHLY_BUDGET_USD = Math.round((AI_MONTHLY_BUDGET_HKD / HKD_PER_USD) * 100) / 100;
export const AI_MODEL = "grok-4-fast";
export const AI_INPUT_USD_PER_MILLION = 0.2;
export const AI_OUTPUT_USD_PER_MILLION = 0.5;
export const AI_MAX_OUTPUT_TOKENS = 350;
export const AI_MAX_MESSAGE_CHARS = 300;
export const AI_MAX_PLANS = 5;
export const AI_MAX_TURNS_PER_SESSION = 12;

const FEE_TALK =
  /HK\s*\$|港幣|月費|平均月費|回贈|行政費|安裝費|保證|最平|最抵|最低|cheapest|guarantee|best price|\$\s*\d/i;

const CATEGORY_HINTS: { cat: Category; re: RegExp }[] = [
  { cat: "mobile", re: /手機|流動|sim|上台|轉台|攜號|5g\s*plan|數據卡/i },
  { cat: "home5g", re: /5g\s*家居|家居寬頻|唔使拉線|插電|家居5g/i },
  { cat: "business", re: /商業|舖頭|鋪頭|寫字樓|商店|公司寬頻/i },
  { cat: "broadband", re: /光纖|寬頻|wifi|路由器|1000m|2500m|5000m|10000m|村屋/i },
];

const SPEED_HINTS: { speed: number; re: RegExp }[] = [
  { speed: 10000, re: /10000\s*m|10g|萬兆/i },
  { speed: 5000, re: /5000\s*m/i },
  { speed: 2500, re: /2500\s*m|2\.5g/i },
  { speed: 2000, re: /2000\s*m/i },
  { speed: 1000, re: /1000\s*m|1g(?!b)/i },
];

export type AiCatalogPlan = {
  id: string;
  name: string;
  provider: string;
  category: Category;
  network: string;
  speedMbps?: number;
  dataGb?: number;
  contractMonths: number;
  housing: Plan["housing"];
  perks: string[];
  quotePick?: boolean;
  flashOffer?: boolean;
  newIntakeOffer?: boolean;
};

export type AiRetrieveResult = {
  estate?: string;
  housing?: Housing;
  category: Category;
  plans: AiCatalogPlan[];
};

export function tokensToUsd(inputTokens: number, outputTokens: number) {
  return (inputTokens / 1e6) * AI_INPUT_USD_PER_MILLION + (outputTokens / 1e6) * AI_OUTPUT_USD_PER_MILLION;
}

export function usdToHkd(usd: number) {
  return Math.round(usd * HKD_PER_USD * 10) / 10;
}

export function monthKey(now = new Date()) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function containsFeeTalk(text: string) {
  return FEE_TALK.test(text);
}

export function stripFeeTalk(text: string) {
  const cleaned = text
    .replace(/HK\s*\$\s*[\d,.]+/gi, "")
    .replace(/\$\s*[\d,.]+/g, "")
    .replace(/平均月費[^。.\n]*/g, "")
    .replace(/月費[^。.\n]*/g, "")
    .replace(/[，,\s]{2,}/g, " ")
    .replace(/^[，,\s]+|[，,\s]+$/g, "")
    .trim();
  if (!cleaned || cleaned.length < 12 || containsFeeTalk(cleaned)) {
    return "";
  }
  return cleaned;
}

export function sanitizeAiReply(text: string, locale: "zh" | "en") {
  const stripped = stripFeeTalk(text);
  if (stripped) return stripped;
  return locale === "en"
    ? "Here are matching reference plans from this site. Fees are on the cards. The carrier confirms the final terms."
    : "我幫你揀咗站內參考計劃，價錢喺下面卡片。實際以電訊商確認為準。";
}

export function stripFeeFromPerk(perk: string) {
  return perk.replace(/HK\s*\$\s*[\d,.]+/gi, "（見計劃卡）").replace(/\$\s*[\d,.]+/g, "（見計劃卡）");
}

export function toCatalogPlan(plan: Plan): AiCatalogPlan {
  const provider = PROVIDER_MAP[plan.providerId as ProviderId];
  return {
    id: plan.id,
    name: plan.name,
    provider: provider?.name ?? plan.providerId,
    category: plan.category,
    network: plan.network,
    speedMbps: plan.speedMbps,
    dataGb: plan.dataGb ?? plan.highSpeedGb,
    contractMonths: plan.contractMonths,
    housing: plan.housing,
    perks: plan.perks.map(stripFeeFromPerk).slice(0, 3),
    quotePick: plan.quotePick,
    flashOffer: plan.flashOffer,
    newIntakeOffer: plan.newIntakeOffer,
  };
}

export function detectCategory(message: string): Category {
  for (const row of CATEGORY_HINTS) {
    if (row.re.test(message)) return row.cat;
  }
  return "broadband";
}

export function detectSpeed(message: string) {
  for (const row of SPEED_HINTS) {
    if (row.re.test(message)) return row.speed;
  }
  return undefined;
}

export function detectProvider(message: string): ProviderId | undefined {
  const blob = message.toLowerCase();
  if (/香港寬頻|hkbn/.test(blob)) return "hkbn";
  if (/網上行|netvigator|pccw/.test(blob)) return "netvigator";
  if (/中國移動|中移動|cmhk/.test(blob)) return "cmhk";
  if (/\bhgc\b/.test(blob)) return "hgc";
  if (/有線|icable|i-cable/.test(blob)) return "icable";
  if (/3香港|3hk|\bthree\b/.test(blob)) return "three";
  if (/數碼通|smartone/.test(blob)) return "smartone";
  if (/\bcsl\b/.test(blob)) return "csl";
  return undefined;
}

export function resolveEstate(message: string, inquiryEstate?: string): Estate | undefined {
  const fromInquiry = inquiryEstate?.trim() ? matchKnownEstate(inquiryEstate) : undefined;
  if (fromInquiry) return fromInquiry;
  const known = matchKnownEstate(message);
  if (known) return known;
  return searchEstates(message, 1)[0];
}

export function retrievePlansForAsk(input: {
  message: string;
  estate?: string;
  housing?: string;
}): AiRetrieveResult {
  const message = input.message.trim().slice(0, AI_MAX_MESSAGE_CHARS);
  const estateRow = resolveEstate(message, input.estate);
  const guessed = classifyAddress(estateRow?.name ?? message);
  const housing = (["public", "hos", "private", "village"] as Housing[]).includes(input.housing as Housing)
    ? (input.housing as Housing)
    : estateRow?.housing ?? guessed.housing;
  const category = detectCategory(message);
  const speed =
    category === "broadband" || category === "business" ? detectSpeed(message) : undefined;
  const provider = detectProvider(message);
  const base = {
    cat: category,
    estate: estateRow?.name ?? input.estate,
    housing,
    provider,
  } as const;
  let rows = filterPlans({ ...base, speed });
  if (!rows.length && speed) rows = filterPlans(base);
  if (!rows.length && provider) {
    rows = filterPlans({ cat: category, estate: base.estate, housing });
  }
  const ranked = [...rows].sort((a, b) => {
    if (!!a.quotePick !== !!b.quotePick) return a.quotePick ? -1 : 1;
    if (!!a.flashOffer !== !!b.flashOffer) return a.flashOffer ? -1 : 1;
    if (!!a.newIntakeOffer !== !!b.newIntakeOffer) return a.newIntakeOffer ? -1 : 1;
    return averageFee(a) - averageFee(b);
  });
  return {
    estate: estateRow?.name,
    housing,
    category,
    plans: ranked.slice(0, AI_MAX_PLANS).map(toCatalogPlan),
  };
}

export type AiModelJson = {
  reply?: string;
  planIds?: string[];
};

export function parseAiJson(raw: string): AiModelJson {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return {};
  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as AiModelJson;
    return {
      reply: typeof parsed.reply === "string" ? parsed.reply : undefined,
      planIds: Array.isArray(parsed.planIds)
        ? parsed.planIds.filter((id): id is string => typeof id === "string")
        : undefined,
    };
  } catch {
    return {};
  }
}

export function pickAllowedPlanIds(wanted: string[] | undefined, allowed: AiCatalogPlan[]) {
  const allow = new Set(allowed.map((plan) => plan.id));
  const picked = (wanted ?? []).filter((id) => allow.has(id)).slice(0, 3);
  if (picked.length) return picked;
  return allowed.slice(0, 3).map((plan) => plan.id);
}

export function fallbackReply(hasPlans: boolean, locale: "zh" | "en") {
  if (locale === "en") {
    return hasPlans
      ? "Here are matching reference plans from this site. Fees are on the cards. The carrier confirms the final terms."
      : "I am not sure which plan fits. WhatsApp us to check, or tell me the estate and whether you need fibre or mobile.";
  }
  return hasPlans
    ? "我幫你揀咗站內參考計劃，價錢喺下面卡片。實際以電訊商確認為準。"
    : "我未肯定邊張啱。可以直接 WhatsApp 查核報價，或者再講下屋苑／想要光纖定手機。";
}
