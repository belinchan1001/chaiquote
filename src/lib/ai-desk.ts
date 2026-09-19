import {
  matchKnownEstate,
  searchEstates,
  classifyAddress,
  isBareHousingTypeQuery,
  type Estate,
} from "./estates.ts";
import {
  PLANS,
  PROVIDER_MAP,
  averageFee,
  getPlan,
  type Category,
  type Housing,
  type Plan,
  type ProviderId,
  type SpeedMbps,
} from "./plans.ts";
import { filterPlans } from "./plan-filter.ts";
import {
  currentIdFromLabel,
  currentLabel,
  currentOptions,
  expiryIdFromLabel,
  expiryLabel,
  needLabel,
  serviceTypeLabel,
  targetLabel,
  toPortInSearch,
  type CurrentId,
  type FibreSpeedId,
  type InquiryQuote,
  type MobileNeedId,
} from "./port-in.ts";

export const AI_MONTHLY_BUDGET_HKD = 200;
export const HKD_PER_USD = 7.8;
export const AI_MONTHLY_BUDGET_USD = Math.round((AI_MONTHLY_BUDGET_HKD / HKD_PER_USD) * 100) / 100;
export const AI_MODEL = "grok-4-fast";
export const AI_INPUT_USD_PER_MILLION = 0.2;
export const AI_OUTPUT_USD_PER_MILLION = 0.5;
export const AI_MAX_OUTPUT_TOKENS = 500;
export const AI_MAX_MESSAGE_CHARS = 300;
export const AI_MAX_PLANS = 5;
export const AI_MAX_TURNS_PER_SESSION = 12;

const FEE_TALK =
  /HK\s*\$|\$\s*\d|港幣\s*\d|平均月費|月費\s*(只需|低至|只要|HK|\$)|保證|最平|最抵|最低|cheapest|guarantee|best price/i;

const CATEGORY_HINTS: { cat: Category; re: RegExp }[] = [
  { cat: "mobile", re: /手機|流動|sim|上台|轉台|攜號|5g\s*plan|數據卡|新號碼|全速無限/i },
  { cat: "home5g", re: /5g\s*家居|家居寬頻|唔使拉線|插電|家居5g/i },
  { cat: "business", re: /商業|舖頭|鋪頭|寫字樓|商店|公司寬頻/i },
  { cat: "broadband", re: /光纖|寬頻|wifi|路由器|1000m|2500m|5000m|10000m|村屋|丁屋|village\s*houses?/i },
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
  parsed?: FilterParse;
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
    : "列出對到嘅站內參考計劃，價錢喺下面卡片。實際以電訊商確認為準。";
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

export function detectCategoryHint(message: string): Category | undefined {
  for (const row of CATEGORY_HINTS) {
    if (row.re.test(message)) return row.cat;
  }
  return undefined;
}

export function detectCategory(message: string): Category {
  return detectCategoryHint(message) ?? "broadband";
}

export function detectSpeed(message: string) {
  const hits = SPEED_HINTS.filter((row) => row.re.test(message));
  if (hits.length !== 1) return undefined;
  return hits[0].speed;
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

const VILLAGE_HOUSING_INTENT = /村屋|丁屋|village\s*houses?/i;

export function isVillageHousingIntent(message: string) {
  return VILLAGE_HOUSING_INTENT.test(message);
}

/** Strip housing-type words so「村屋 1000M」is not searched as an estate name. */
export function estateQueryFromMessage(message: string) {
  return message.replace(VILLAGE_HOUSING_INTENT, " ").replace(/\s+/g, " ").trim();
}

export function resolveEstate(message: string, inquiryEstate?: string): Estate | undefined {
  const villageIntent = isVillageHousingIntent(message);
  const fromInquiry = inquiryEstate?.trim() ? matchKnownEstate(inquiryEstate) : undefined;
  if (fromInquiry && !villageIntent) return fromInquiry;
  const estateMessage = villageIntent ? estateQueryFromMessage(message) : message.trim();
  if (!estateMessage || isBareHousingTypeQuery(estateMessage)) return undefined;
  const known = matchKnownEstate(estateMessage);
  if (known) return known;
  return searchEstates(estateMessage, 1)[0];
}


export function detectTargetProvider(message: string): ProviderId | undefined {
  const clause = message.split(/想轉|轉去|轉做|心水|指定/)[1];
  if (!clause) return undefined;
  return detectProvider(clause);
}

export function detectMobileNeed(message: string) {
  if (/大灣區|中澳|學生優惠/.test(message)) return "gba" as const;
  if (/攜號|帶號|mnp/i.test(message)) return "mnp" as const;
  if (/4\.5g|平價入門/i.test(message)) return "45g" as const;
  if (/5g/i.test(message)) return "5g" as const;
  return undefined;
}

export function detectCurrentProvider(message: string, loose = false): CurrentId | undefined {
  if (/新號碼/.test(message)) return "none";
  if (/新開戶|無用緊|未有寬頻|未裝寬頻/.test(message)) return "none";
  if (!loose && !/用緊|而家用|現用|而家係|轉台|到期|約滿/.test(message)) return undefined;
  return detectProvider(message);
}

export function detectExpiry(message: string): "1m" | "2-3m" | "4-6m" | "6m+" | undefined {
  if (/下個月|一個月內|1個月|就到期|急單|即將到期/.test(message)) return "1m";
  if (/兩個月|2\s*-\s*3|兩三個月|兩至三/.test(message)) return "2-3m";
  if (/四個月|4\s*-\s*6|四至六/.test(message)) return "4-6m";
  if (/半年|唔清楚|不清楚|未到期/.test(message)) return "6m+";
  return undefined;
}

export function detectGaming(message: string) {
  return /電競神線|電競|打機|低延遲/.test(message);
}

export function detectEsportsLine(message: string) {
  return /電競神線|2\.5\s*g|2500\s*m/.test(message);
}

export type FilterParse = {
  cat: Category;
  current?: CurrentId;
  exclude?: ProviderId;
  target?: ProviderId;
  expiry?: "1m" | "2-3m" | "4-6m" | "6m+";
  estate?: string;
  housing?: Housing;
  speed?: SpeedMbps;
  mobileNeed?: "5g" | "45g" | "mnp" | "gba";
  esports: boolean;
  gaming: boolean;
};

export function parseFilterState(input: {
  message: string;
  estate?: string;
  housing?: string;
  looseCurrent?: boolean;
}): FilterParse {
  const message = input.message.trim().slice(0, AI_MAX_MESSAGE_CHARS);
  const villageIntent = isVillageHousingIntent(message);
  const estateRow = resolveEstate(message, villageIntent ? undefined : input.estate);
  const guessed = classifyAddress(estateRow?.name ?? message);
  const housing = villageIntent
    ? "village"
    : (["public", "hos", "private", "village"] as Housing[]).includes(input.housing as Housing)
      ? (input.housing as Housing)
      : estateRow?.housing ?? guessed.housing;
  const cat = detectCategory(message);
  const current = detectCurrentProvider(message, Boolean(input.looseCurrent));
  const target = detectTargetProvider(message);
  const exclude = current && current !== "none" && current !== "other" ? current : undefined;
  const esports = detectEsportsLine(message);
  const speed = cat === "broadband" || cat === "business" ? detectSpeed(message) : undefined;
  const mobileNeed = cat === "mobile" ? detectMobileNeed(message) : undefined;
  return {
    cat,
    current,
    exclude,
    target: target && target !== exclude ? target : undefined,
    expiry: detectExpiry(message),
    estate: estateRow?.name ?? (villageIntent ? undefined : input.estate || undefined),
    housing,
    speed: esports ? undefined : (speed as SpeedMbps | undefined),
    mobileNeed,
    esports,
    gaming: detectGaming(message),
  };
}

export function retrievePlansForAsk(input: {
  message: string;
  estate?: string;
  housing?: string;
  exclude?: ProviderId;
  looseCurrent?: boolean;
}): AiRetrieveResult {
  const parsed = parseFilterState(input);
  const exclude = parsed.exclude ?? input.exclude;
  const base = {
    cat: parsed.cat,
    estate: parsed.estate,
    housing: parsed.housing,
    exclude,
    provider: parsed.target,
    minSpeed: parsed.esports ? 2500 : undefined,
    esports: parsed.esports ? true : undefined,
  };
  let rows = filterPlans({ ...base, speed: parsed.speed });
  if (!rows.length && parsed.speed) rows = filterPlans(base);
  const ranked = [...rows].sort((a, b) => averageFee(a) - averageFee(b));
  return {
    estate: parsed.estate,
    housing: parsed.housing,
    category: parsed.cat,
    plans: ranked.slice(0, AI_MAX_PLANS).map(toCatalogPlan),
    parsed: { ...parsed, exclude, current: parsed.current ?? exclude },
  };
}

function needIdFromParse(parsed: FilterParse) {
  if (parsed.cat === "mobile") return parsed.mobileNeed ?? "";
  if (parsed.esports) return "2500";
  if ((parsed.speed ?? 0) >= 2500) return parsed.cat === "business" ? "dedicated" : "2500";
  if ((parsed.speed ?? 0) >= 1000) return "1000";
  if (parsed.cat === "broadband" || parsed.cat === "business") return "any";
  return "";
}

export function inquiryFromAiParse(
  parsed: FilterParse,
  previous?: {
    estate?: string;
    housing?: string;
    district?: string;
    currentProvider?: string;
    targetProvider?: string;
    expiry?: string;
  },
): InquiryQuote & { source: "ai"; district?: string } {
  const current = parsed.current
    ? (currentOptions(parsed.cat).find((item) => item.id === parsed.current)?.label ?? currentLabel(parsed.current))
    : previous?.currentProvider || "";
  const target = parsed.target ? targetLabel(parsed.target) : previous?.targetProvider || "";
  return {
    estate: parsed.estate || previous?.estate || "",
    housing: parsed.housing || previous?.housing || "",
    district: previous?.district,
    currentProvider: current,
    targetProvider: target,
    expiry: parsed.expiry ? expiryLabel(parsed.expiry) : previous?.expiry || "",
    need: needLabel(parsed.cat, needIdFromParse(parsed), parsed.esports),
    serviceType: serviceTypeLabel(parsed.cat),
    esports: parsed.esports,
    source: "ai",
  };
}

export function mergeFilterParse(
  parsed: FilterParse,
  previous?: {
    estate?: string;
    housing?: string;
    currentProvider?: string;
    expiry?: string;
  },
  prior?: FilterParse,
): FilterParse {
  const current = parsed.current || currentIdFromLabel(previous?.currentProvider ?? "") || prior?.current;
  const expiry = parsed.expiry || expiryIdFromLabel(previous?.expiry ?? "") || prior?.expiry;
  const estate = parsed.estate || previous?.estate || prior?.estate;
  const housing =
    parsed.housing ||
    prior?.housing ||
    ((["public", "hos", "private", "village"] as Housing[]).includes(previous?.housing as Housing)
      ? (previous?.housing as Housing)
      : undefined);
  const exclude = current && current !== "none" && current !== "other" ? current : undefined;
  return {
    ...parsed,
    cat: prior?.cat && parsed.cat === "broadband" && !parsed.speed && !parsed.esports && !parsed.estate
      ? prior.cat
      : parsed.cat,
    current,
    expiry,
    estate,
    housing,
    exclude,
    target: parsed.target ?? prior?.target,
    speed: parsed.speed ?? prior?.speed,
    mobileNeed: parsed.mobileNeed ?? prior?.mobileNeed,
    esports: parsed.esports || Boolean(prior?.esports),
    gaming: parsed.gaming || Boolean(prior?.gaming),
  };
}

export function intakeGap(parsed: FilterParse): "current" | "expiry" | null {
  if (!parsed.current) return "current";
  if (!parsed.expiry) return "expiry";
  return null;
}

export function shouldHoldForIntake(message: string, parsed: FilterParse) {
  if (matchKnowledge(message) && isQuestionIntent(message) && !parsed.current) return false;
  if (!isFilterIntent(message) && !parsed.estate && !parsed.current && !parsed.speed && !parsed.expiry) {
    return false;
  }
  return Boolean(intakeGap(parsed));
}

export function portInInputFromParse(
  parsed: FilterParse,
  previous?: { estate?: string; housing?: string },
) {
  const fibreSpeed: FibreSpeedId | "" = parsed.cat === "broadband" ? needIdFromParse(parsed) as FibreSpeedId : "";
  const businessSpeed = parsed.cat === "business" ? needIdFromParse(parsed) : "";
  const mobileNeed = (parsed.mobileNeed ?? "") as MobileNeedId | "";
  return {
    cat: parsed.cat,
    estate: parsed.estate || previous?.estate,
    housing: parsed.housing,
    current: parsed.current ?? "",
    target: (parsed.target ?? "all") as const,
    fibreSpeed,
    businessSpeed: businessSpeed as "any" | "1000" | "dedicated" | "",
    mobileNeed,
    esports: parsed.esports,
    expiry: parsed.expiry ?? "",
  };
}

export function plansSearchFromAiParse(
  parsed: FilterParse,
  previous?: { estate?: string; housing?: string },
) {
  return toPortInSearch(portInInputFromParse(parsed, previous));
}

export function plansForAiCards(ids: string[]) {
  return ids
    .map((id) => getPlan(id))
    .filter((plan): plan is Plan => Boolean(plan))
    .sort((a, b) => averageFee(a) - averageFee(b));
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

export function pickAllowedPlanIds(
  wanted: string[] | undefined,
  allowed: AiCatalogPlan[],
  fillIfEmpty = true,
) {
  const allow = new Set(allowed.map((plan) => plan.id));
  const picked = (wanted ?? []).filter((id) => allow.has(id)).slice(0, 3);
  if (picked.length) return picked;
  if (!fillIfEmpty) return [];
  return allowed.slice(0, 3).map((plan) => plan.id);
}

export function isQuestionIntent(message: string) {
  return /有冇|係咪|點樣|點做|分別|包唔包|如何|什麼|甚麼|why|how |what |does |can |is chaiquote/i.test(
    message,
  );
}

export function isFilterIntent(message: string) {
  return Boolean(
    detectSpeed(message) ||
      detectProvider(message) ||
      matchKnownEstate(message) ||
      /幫我揀|我想睇|有咩計劃|篩選|1000m|2500m|5000m|光纖|手機|5g 家居|村屋|丁屋|village\s*houses?/i.test(
        message,
      ),
  );
}

export type KnowledgeHit = {
  id: string;
  zh: string;
  en: string;
  attach: boolean;
};

export const QUESTION_CHIPS = [
  { id: "village", zh: "村屋有冇光纖？", en: "Can village houses get fibre?" },
  { id: "port", zh: "攜號轉台點做？", en: "How do I port my number?" },
  { id: "housing", zh: "公屋同埋居屋有分別？", en: "Public housing vs HOS?" },
] as const;

const KNOWLEDGE: (KnowledgeHit & { re: RegExp })[] = [
  {
    id: "official",
    re: /官網|官方|係咪電訊|chaiquote.*(carrier|official)|independent/i,
    zh: "齊Quote 唔係電訊商官網，係獨立比較網站。覆蓋、安裝期同實際條款以電訊商確認為準。想確認可以 WhatsApp 查核報價。",
    en: "ChaiQuote is not a carrier website. It is an independent comparison site. Coverage, install dates and terms are confirmed by the carrier. Use WhatsApp to check a quote.",
    attach: false,
  },
  {
    id: "public-hos",
    re: /公屋|居屋|價錢會唔會唔同|public housing|hos/i,
    zh: "公屋同埋居屋好多時有指定供應商同批量價，每個屋邨／屋苑都可能唔同。篩選時可以分開揀樓類，問價時填齊屋苑名稱。",
    en: "Public housing and HOS often have designated carriers and bulk rates, and each estate can differ. Filter by housing type and give the estate name when you check a quote.",
    attach: true,
  },
  {
    id: "village",
    re: /村屋|丁屋|village house/i,
    zh: "村屋光纖而家主要由香港寬頻、HGC 同網上行提供指定計劃；公屋、居屋同私樓計劃一般唔適用。未有光纖可以一併比較 5G 家居。實際覆蓋要核對門牌。",
    en: "Village fibre is mainly from HKBN, HGC and Netvigator on designated plans. Public, HOS and private plans usually do not apply. If there is no fibre yet, compare 5G home. Coverage must be checked against the address.",
    attach: true,
  },
  {
    id: "business",
    re: /商業|舖頭|寫字樓|工商|business broadband/i,
    zh: "商業寬頻多可加購固定 IP 及辦公時間技術支援，安裝以工商地址為準，適合店舖、寫字樓及工作室。家居計劃一般唔適用。",
    en: "Business fibre often adds a fixed IP and office-hour support. Install is for a commercial address — shop, office or studio. Home plans usually do not apply.",
    attach: true,
  },
  {
    id: "gba",
    re: /大灣區|中澳|內地數據|澳門數據|greater bay/i,
    zh: "手機計劃可篩「大灣區數據」，即包含內地及／或澳門用量，或三地共享數據池。實際地區同用量以電訊商條款為準。",
    en: "Mobile plans can be filtered for Greater Bay Area data — Mainland and/or Macao, or a shared pool. Regions and quota are confirmed in the carrier terms.",
    attach: true,
  },
  {
    id: "quote",
    re: /點樣查核|點查核|點報價|how (do i )?check/i,
    zh: "最快用右下角 WhatsApp 查核報價。篩過地址之後，訊息會帶你嘅申請地址。冇 WhatsApp 可以撳「留低電話」，或電郵 info@chaiquote.hk。",
    en: "The fastest way is the green WhatsApp button. If you already filtered an address, it is included. No WhatsApp? Use leave-a-number, or email info@chaiquote.hk.",
    attach: false,
  },
  {
    id: "port-in",
    re: /攜號|轉台|port-?in|keep (my )?number/i,
    zh: "手機攜號：向新台申請，新 SIM 未生效前舊卡仍然用得，一般 1 至 2 個工作天。唔好提早取消舊約。寬頻唔能夠攜號，要新台上門安裝，新線測好先取消舊台。",
    en: "Mobile port-in: apply with the new carrier first. The old SIM works until the new one is active, usually 1–2 working days. Do not cancel early. Broadband cannot port a number — install the new line, test it, then cancel the old one.",
    attach: true,
  },
  {
    id: "fiber-5g",
    re: /光纖.*5g|5g.*光纖|唔使拉線|fiber vs|fibre vs/i,
    zh: "光纖入屋較穩，適合長住。5G 家居唔使拉線、插電就用，速度視乎現場訊號。村屋未有光纖時，5G 家居係常見後備。實際覆蓋要查核。",
    en: "Fibre is steadier for a long stay. 5G home needs no cabling and depends on the site signal. It is a common fallback when village fibre is not in yet. Coverage must be checked.",
    attach: true,
  },
  {
    id: "contract",
    re: /合約|約滿|提早終止|搬遷|early.terminat|contract/i,
    zh: "合約期、免月費、提早終止同搬遷要以電訊商合約為準。未約滿就轉台，舊台可能收提早終止費。搬家先問清有冇包搬遷。",
    en: "Contract length, free months, early termination and relocation follow the carrier contract. Switching before it ends may incur a fee. Ask about relocation before you move.",
    attach: false,
  },
];

export function matchKnowledge(message: string): KnowledgeHit | undefined {
  const hit = KNOWLEDGE.find((row) => row.re.test(message));
  if (!hit) return undefined;
  return { id: hit.id, zh: hit.zh, en: hit.en, attach: hit.attach };
}

export function knowledgeBriefs() {
  return KNOWLEDGE.map((row) => ({ id: row.id, zh: row.zh, en: row.en }));
}

export function composeFallback(input: {
  message: string;
  locale: "zh" | "en";
  plans: AiCatalogPlan[];
}) {
  const hit = matchKnowledge(input.message);
  const planIds = input.plans.slice(0, 3).map((plan) => plan.id);
  if (hit) {
    return {
      reply: input.locale === "en" ? hit.en : hit.zh,
      planIds: hit.attach ? planIds : [],
    };
  }
  const filtering = isFilterIntent(input.message);
  return {
    reply: fallbackReply(filtering && planIds.length > 0, input.locale),
    planIds: filtering ? planIds : [],
  };
}

export function fallbackReply(hasPlans: boolean, locale: "zh" | "en") {
  if (locale === "en") {
    return hasPlans
      ? "Here are matching reference plans from this site. Fees are on the cards. The carrier confirms the final terms."
      : "I am not sure which plan fits. WhatsApp us to check, or tell me the estate and whether you need fibre or mobile.";
  }
  return hasPlans
    ? "列出對到嘅站內參考計劃，價錢喺下面卡片。實際以電訊商確認為準。"
    : "未肯定對到邊張。可以直接 WhatsApp 查核報價，或者再講下屋苑／想要光纖定手機。";
}
