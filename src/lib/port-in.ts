import {
  CATEGORY_LABEL,
  HOUSING_LABEL,
  PROVIDER_MAP,
  formatFee,
  type Category,
  type Housing,
  type PlansSearch,
  type ProviderId,
} from "./plans.ts";
import { SITE } from "./site.ts";

export const FIBRE_CURRENT = [
  { id: "hkbn", label: "香港寬頻" },
  { id: "netvigator", label: "網上行" },
  { id: "smartone", label: "數碼通" },
  { id: "cmhk", label: "中國移動香港" },
  { id: "icable", label: "有線寬頻" },
  { id: "none", label: "新開戶／無用緊" },
] as const;

export const HOME5G_CURRENT = [
  { id: "hkbn", label: "香港寬頻" },
  { id: "netvigator", label: "網上行" },
  { id: "smartone", label: "數碼通" },
  { id: "cmhk", label: "中國移動香港" },
  { id: "three", label: "3香港" },
  { id: "none", label: "新開戶／無用緊" },
] as const;

export const BUSINESS_CURRENT = [
  { id: "hkbn", label: "香港寬頻" },
  { id: "netvigator", label: "網上行／HKT" },
  { id: "smartone", label: "數碼通" },
  { id: "cmhk", label: "中國移動香港" },
  { id: "other", label: "其他" },
  { id: "none", label: "新開戶" },
] as const;

export const MOBILE_CURRENT = [
  { id: "csl", label: "CSL / 1O1O" },
  { id: "smartone", label: "數碼通" },
  { id: "cmhk", label: "中國移動香港" },
  { id: "three", label: "3香港" },
  { id: "hkbn", label: "香港寬頻" },
  { id: "other", label: "其他" },
  { id: "none", label: "新號碼" },
] as const;

export const FIBRE_TARGETS = [
  { id: "all", label: "不限／睇晒所有" },
  { id: "hkbn", label: "香港寬頻" },
  { id: "netvigator", label: "網上行 (HKT)" },
  { id: "smartone", label: "SmarTone" },
  { id: "cmhk", label: "中國移動 (CMHK)" },
  { id: "icable", label: "有線寬頻" },
] as const;

export const HOME5G_TARGETS = FIBRE_TARGETS;

export const BUSINESS_TARGETS = [
  { id: "all", label: "不限／睇晒所有" },
  { id: "hkbn", label: "香港寬頻" },
  { id: "netvigator", label: "網上行 (HKT)" },
  { id: "smartone", label: "SmarTone" },
  { id: "cmhk", label: "中國移動 (CMHK)" },
] as const;

export const MOBILE_TARGETS = [
  { id: "all", label: "不限／睇晒所有" },
  { id: "csl", label: "CSL / 1O1O" },
  { id: "smartone", label: "SmarTone" },
  { id: "cmhk", label: "中國移動 (CMHK)" },
  { id: "three", label: "3香港" },
  { id: "hkbn", label: "香港寬頻" },
] as const;

export const EXPIRY_OPTIONS = [
  { id: "1m", label: "1個月內", urgent: true },
  { id: "2-3m", label: "2–3個月內", urgent: false },
  { id: "4-6m", label: "4–6個月內", urgent: false },
  { id: "6m+", label: "半年以上／不清楚", urgent: false },
] as const;

export const FIBRE_SPEEDS = [
  { id: "any", label: "速度不限", minSpeed: undefined },
  { id: "1000", label: "1000M / 1G", minSpeed: 1000 },
  { id: "2500", label: "2.5G / 10G", minSpeed: 2500 },
] as const;

export const MOBILE_NEEDS = [
  { id: "5g", label: "5G 全速無限" },
  { id: "45g", label: "4.5G 平價入門" },
  { id: "mnp", label: "帶號轉台 MNP" },
  { id: "gba", label: "大灣區／學生優惠" },
] as const;

export const BUSINESS_SPEEDS = [
  { id: "any", label: "速度不限", minSpeed: undefined },
  { id: "1000", label: "1000M / 1G", minSpeed: 1000 },
  { id: "dedicated", label: "商業專線／高頻寬", minSpeed: 2500 },
] as const;

export const CUSTOMER_EXPIRY_NOTE = "客人自行提供";

export type BusinessSpeedId = (typeof BUSINESS_SPEEDS)[number]["id"];
export type TargetId = ProviderId | "all";

export function currentOptions(cat: Category) {
  if (cat === "mobile") return MOBILE_CURRENT;
  if (cat === "home5g") return HOME5G_CURRENT;
  if (cat === "business") return BUSINESS_CURRENT;
  return FIBRE_CURRENT;
}

export function targetOptions(cat: Category) {
  if (cat === "mobile") return MOBILE_TARGETS;
  if (cat === "home5g") return HOME5G_TARGETS;
  if (cat === "business") return BUSINESS_TARGETS;
  return FIBRE_TARGETS;
}

export type CurrentId = ProviderId | "none" | "other";
export type ExpiryId = (typeof EXPIRY_OPTIONS)[number]["id"];
export type FibreSpeedId = (typeof FIBRE_SPEEDS)[number]["id"];
export type MobileNeedId = (typeof MOBILE_NEEDS)[number]["id"];

export function addressRequired(cat: Category) {
  return cat === "broadband";
}

export function currentLabel(id: CurrentId | "") {
  if (!id) return "";
  for (const list of [FIBRE_CURRENT, HOME5G_CURRENT, BUSINESS_CURRENT, MOBILE_CURRENT]) {
    const hit = list.find((item) => item.id === id);
    if (hit) return hit.label;
  }
  if (id in PROVIDER_MAP) return PROVIDER_MAP[id as ProviderId].name;
  return id;
}

export function targetLabel(id: TargetId | "") {
  if (!id || id === "all") return "不限 (請推薦最抵方案)";
  for (const list of [FIBRE_TARGETS, BUSINESS_TARGETS, MOBILE_TARGETS]) {
    const hit = list.find((item) => item.id === id);
    if (hit) return hit.label;
  }
  if (id in PROVIDER_MAP) return PROVIDER_MAP[id as ProviderId].name;
  return id;
}

export function expiryLabel(id: ExpiryId | "") {
  return EXPIRY_OPTIONS.find((item) => item.id === id)?.label ?? "";
}

export function expiryIdFromLabel(label: string): ExpiryId | "" {
  const trimmed = label.trim();
  if (!trimmed) return "";
  return EXPIRY_OPTIONS.find((item) => item.label === trimmed)?.id ?? "";
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

export function formatCustomerExpiry(endDate: string): string {
  const trimmed = endDate.trim();
  if (!isIsoDate(trimmed)) return "";
  if (trimmed.includes(CUSTOMER_EXPIRY_NOTE)) return trimmed;
  return `${trimmed}（${CUSTOMER_EXPIRY_NOTE}）`;
}

export function isCustomerExpiry(value: string | undefined | null): boolean {
  const trimmed = (value ?? "").trim();
  return trimmed.includes(CUSTOMER_EXPIRY_NOTE) || /^\d{4}-\d{2}-\d{2}/.test(trimmed);
}

export function staffExpiryText(raw: string | undefined | null): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "未填寫";
  const iso = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) {
    return trimmed.includes(CUSTOMER_EXPIRY_NOTE) ? trimmed : `${iso[1]}（${CUSTOMER_EXPIRY_NOTE}）`;
  }
  return trimmed;
}

export function needLabel(cat: Category, id: string, esports = false) {
  if (esports) return "電競神線 2.5G+";
  if (cat === "mobile") return MOBILE_NEEDS.find((item) => item.id === id)?.label ?? "";
  if (cat === "business") return BUSINESS_SPEEDS.find((item) => item.id === id)?.label ?? "";
  return FIBRE_SPEEDS.find((item) => item.id === id)?.label ?? "";
}

export function excludeProvider(id: CurrentId | ""): ProviderId | undefined {
  if (!id || id === "none" || id === "other") return undefined;
  return id;
}

export function isTargetConflict(current: CurrentId | "", target: TargetId | "") {
  if (!target || target === "all") return false;
  const exclude = excludeProvider(current);
  return Boolean(exclude && exclude === target);
}

export function resolveTargetProvider(
  current: CurrentId | "",
  target: TargetId | "",
): ProviderId | undefined {
  if (!target || target === "all" || isTargetConflict(current, target)) return undefined;
  return target;
}

export function currentIdFromLabel(label: string): ProviderId | undefined {
  const trimmed = label.trim();
  if (!trimmed) return undefined;
  for (const list of [FIBRE_CURRENT, HOME5G_CURRENT, BUSINESS_CURRENT, MOBILE_CURRENT]) {
    const hit = list.find((item) => item.label === trimmed);
    if (hit) return excludeProvider(hit.id);
  }
  const fromMap = (Object.keys(PROVIDER_MAP) as ProviderId[]).find(
    (id) => PROVIDER_MAP[id].name === trimmed || PROVIDER_MAP[id].nameEn === trimmed,
  );
  return fromMap;
}

export function toPortInSearch(input: {
  cat: Category;
  estate?: string;
  housing?: Housing;
  current?: CurrentId | "";
  target?: TargetId | "";
  fibreSpeed?: FibreSpeedId | "";
  businessSpeed?: BusinessSpeedId | "";
  mobileNeed?: MobileNeedId | "";
  esports?: boolean;
  expiry?: ExpiryId | "";
}): PlansSearch {
  const exclude = excludeProvider(input.current ?? "");
  const fibreSpeed = input.cat === "broadband" ? FIBRE_SPEEDS.find((item) => item.id === input.fibreSpeed) : undefined;
  const businessSpeed =
    input.cat === "business" ? BUSINESS_SPEEDS.find((item) => item.id === input.businessSpeed) : undefined;
  const mobile = input.mobileNeed;
  const housing = input.cat === "broadband" || input.cat === "home5g" ? input.housing : undefined;
  return {
    cat: input.cat,
    estate: input.estate?.trim() || undefined,
    housing,
    exclude,
    provider: resolveTargetProvider(input.current ?? "", input.target ?? ""),
    minSpeed: input.esports ? 2500 : fibreSpeed?.minSpeed ?? businessSpeed?.minSpeed,
    generation: mobile === "5g" ? "5g" : mobile === "45g" ? "4g" : undefined,
    portIn: mobile === "mnp" ? true : undefined,
    gba: mobile === "gba" ? true : undefined,
    esports: input.esports ? true : undefined,
    sort: input.esports ? "speed" : undefined,
    expiry: input.expiry || undefined,
  };
}

export function fromPortInSearch(search: PlansSearch) {
  const current = (search.exclude ?? "") as CurrentId | "";
  const target = (search.provider ?? "all") as TargetId;
  const expiry = (search.expiry ?? "") as ExpiryId | "";
  const esports = Boolean(search.esports);
  const floor = search.minSpeed ?? search.speed ?? 0;
  let fibreSpeed: FibreSpeedId | "" = "";
  if (search.cat === "broadband") {
    fibreSpeed = esports || floor >= 2500 ? "2500" : floor >= 1000 ? "1000" : "any";
  }
  let businessSpeed: BusinessSpeedId | "" = "";
  if (search.cat === "business") {
    businessSpeed = floor >= 2500 ? "dedicated" : floor >= 1000 ? "1000" : "any";
  }
  let mobileNeed: MobileNeedId | "" = "";
  if (search.cat === "mobile") {
    if (search.gba) mobileNeed = "gba";
    else if (search.portIn) mobileNeed = "mnp";
    else if (search.generation === "5g") mobileNeed = "5g";
    else if (search.generation === "4g") mobileNeed = "45g";
  }
  return { current, target, expiry, fibreSpeed, businessSpeed, mobileNeed, esports };
}

export function mergePortInSearch(
  base: PlansSearch,
  intake: Parameters<typeof toPortInSearch>[0],
): PlansSearch {
  const next = toPortInSearch(intake);
  return {
    cat: next.cat,
    estate: next.estate,
    housing: next.housing,
    exclude: next.exclude,
    provider: next.provider,
    minSpeed: next.minSpeed,
    generation: next.generation,
    portIn: next.portIn,
    gba: next.gba,
    esports: next.esports,
    expiry: next.expiry,
    sort: next.sort ?? base.sort,
    q: base.q,
    saved: base.saved,
    intake: base.intake && next.cat === "broadband" ? true : undefined,
  };
}

export type WhatsAppFormData = {
  serviceType: string;
  address?: string;
  housing?: string;
  currentProvider: string;
  targetProvider?: string;
  expiry: string;
  need: string;
  planName?: string;
  monthlyFee?: number;
  esports?: boolean;
  source?: "ai" | "filter";
};

export function portInQuoteMessage(formData: WhatsAppFormData) {
  const address = formData.address?.trim() || "未填寫 (請銷售員協助查詢/推薦)";
  const housing = formData.housing?.trim() || "不適用 / 未填寫";
  const current = formData.currentProvider.trim() || "未填寫";
  const target = formData.targetProvider?.trim() || "不限 (請推薦最抵方案)";
  const expiry = staffExpiryText(formData.expiry);
  const need = formData.need.trim() || "速度不限 / 預設";
  const plan = formData.planName
    ? `${formData.planName}${formData.monthlyFee != null ? ` (${formatFee(formData.monthlyFee)}/月)` : ""}`
    : "";
  const switching =
    current === "新號碼"
      ? "新號碼"
      : current === "新開戶／無用緊" || current === "新開戶"
        ? "新開戶"
        : "轉台客戶";
  return [
    `👋 你好！我想查詢／申請【${SITE.name} 轉台獨家優惠】：`,
    "--------------------------------",
    `📌 服務類型：${formData.serviceType || "未選擇"}`,
    `📍 安裝/常用地址：${address}`,
    `🏢 屋樓類型：${housing}`,
    `🔄 現時電訊商：${current} (${switching})`,
    `🎯 指定心水電訊商：${target}`,
    `📅 合約到期日：${expiry}`,
    `⚡ 需求規格：${need}`,
    `🎮 特殊需求：${formData.esports ? "需要電競神線" : "無"}`,
    plan ? `🎯 目標心水計劃：${plan}` : "",
    `🤖 篩選方式：${formData.source === "ai" ? "AI 智能推薦" : "手動條件篩選"}`,
    "--------------------------------",
    "請幫我確認覆蓋/訊號與預留轉台禮品，謝謝！",
  ]
    .filter(Boolean)
    .join("\n");
}

export function generateWhatsAppLink(formData: WhatsAppFormData, phone: string = SITE.whatsappE164) {
  const body = portInQuoteMessage(formData);
  const tag = `【${SITE.name}】`;
  const text = body.startsWith(tag) ? body : `${tag}\n${body}`;
  const params = new URLSearchParams({
    phone,
    text,
    type: "phone_number",
    app_absent: "0",
  });
  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

export function housingDisplay(housing?: string) {
  if (!housing) return "";
  return housing in HOUSING_LABEL ? HOUSING_LABEL[housing as Housing] : housing;
}

export function serviceTypeLabel(cat: Category) {
  return CATEGORY_LABEL[cat];
}

export type InquiryQuote = {
  estate?: string;
  housing?: string;
  currentProvider?: string;
  targetProvider?: string;
  expiry?: string;
  customerExpiry?: string;
  need?: string;
  serviceType?: string;
  esports?: boolean;
  source?: "ai" | "filter";
};

export function shouldUsePortInQuote(inquiry?: InquiryQuote | null) {
  return Boolean(inquiry?.currentProvider || inquiry?.source === "ai" || inquiry?.serviceType || inquiry?.customerExpiry);
}

export function portInQuoteFromInquiry(
  inquiry: InquiryQuote,
  plan?: { name: string; monthlyFee: number },
) {
  return portInQuoteMessage({
    serviceType: inquiry.serviceType || "",
    address: inquiry.estate,
    housing: housingDisplay(inquiry.housing),
    currentProvider: inquiry.currentProvider || "",
    targetProvider: inquiry.targetProvider || "",
    expiry: inquiry.customerExpiry || inquiry.expiry || "",
    need: inquiry.need || "",
    planName: plan?.name,
    monthlyFee: plan?.monthlyFee,
    esports: inquiry.esports,
    source: inquiry.source === "ai" ? "ai" : "filter",
  });
}
