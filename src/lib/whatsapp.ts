import {
  CATEGORY_LABEL,
  PROVIDER_MAP,
  formatFee,
  isHktPlan,
  type Category,
  type Housing,
} from "./plan-meta.ts";
import type { Plan } from "./plans.ts";
import { SITE } from "./site.ts";
import type { Inquiry } from "./desk.ts";
import { MESSAGES, type Locale, type MessageKey } from "./messages.ts";
import { toEnglishLazy } from "./plan-en-lazy.ts";

const HOUSING_MESSAGE: Record<Housing, MessageKey> = {
  public: "housingPublic",
  hos: "housingHos",
  private: "housingPrivate",
  village: "housingVillage",
};

const BRAND_TAG = `【${SITE.name}】`;

export function withBrandTag(text: string) {
  const body = text.replace(/^\s+/, "");
  if (body.startsWith(BRAND_TAG)) return body;
  return `${BRAND_TAG}\n${body}`;
}

export type QuoteDesk = "hkt" | "hkbn" | "desk";

export function quoteDeskFromHint(hint?: string | null): Exclude<QuoteDesk, "desk"> | null {
  const raw = (hint ?? "").trim();
  if (!raw) return null;
  const text = raw.toLowerCase();
  if (/網上行|netvigator|\bhkt\b|電訊盈科|csl|1o1o|1010/.test(text)) return "hkt";
  if (/香港寬頻|hkbn/.test(text)) return "hkbn";
  return null;
}

export function quoteDeskFromPlans(plans: readonly Plan[]): QuoteDesk | null {
  if (!plans.length) return null;
  if (plans.every(isHktPlan)) return "hkt";
  if (plans.every((plan) => plan.providerId === "hkbn")) return "hkbn";
  return null;
}

function deskNumber(desk: QuoteDesk) {
  if (desk === "hkt") return { e164: SITE.hktWhatsappE164, display: SITE.hktPhoneDisplay };
  if (desk === "hkbn") return { e164: SITE.hkbnWhatsappE164, display: SITE.hkbnPhoneDisplay };
  return { e164: SITE.whatsappE164, display: SITE.phoneDisplay };
}

export function resolveQuoteDesk(plans: Plan[] = [], inquiry?: Partial<Inquiry> | null): QuoteDesk {
  return quoteDeskFromPlans(plans) ?? quoteDeskFromHint(inquiry?.targetProvider) ?? "desk";
}

export function quoteWhatsappE164(plans: Plan[] = [], inquiry?: Partial<Inquiry> | null) {
  return deskNumber(resolveQuoteDesk(plans, inquiry)).e164;
}

export function quoteWhatsappDisplay(plans: Plan[] = [], inquiry?: Partial<Inquiry> | null) {
  return deskNumber(resolveQuoteDesk(plans, inquiry)).display;
}

export function whatsappHref(text: string, phone: string = SITE.whatsappE164) {
  const params = new URLSearchParams({
    phone,
    text: withBrandTag(text),
    type: "phone_number",
    app_absent: "0",
  });
  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

export function planLine(plan: Plan, locale: Locale = "zh") {
  const provider = PROVIDER_MAP[plan.providerId];
  if (locale === "en") {
    return `${provider.nameEn} ${toEnglishLazy(plan.name)} (${toEnglishLazy(CATEGORY_LABEL[plan.category])}, ${formatFee(plan.monthlyFee)} / ${plan.contractMonths} months)`;
  }
  return `${provider.name} ${plan.name}（${CATEGORY_LABEL[plan.category]}，月費 ${formatFee(plan.monthlyFee)}／${plan.contractMonths}個月）`;
}

function housingLabel(value?: string, locale: Locale = "zh") {
  if (!value) return "";
  if (value === "public" || value === "hos" || value === "private" || value === "village") {
    return MESSAGES[locale][HOUSING_MESSAGE[value]];
  }
  return locale === "en" ? toEnglishLazy(value) : value;
}

export function inquiryLines(inquiry?: Partial<Inquiry> | null, locale: Locale = "zh") {
  if (!inquiry) return [];
  const estate = inquiry.estate?.trim() ?? "";
  const district = inquiry.district?.trim() ?? "";
  const housing = housingLabel(inquiry.housing?.trim() ?? "", locale);
  if (locale === "en") {
    return [
      estate ? `Address: ${estate}` : "",
      housing ? `Housing type: ${housing}` : "",
      district && !estate.includes(district) ? `District: ${district}` : "",
    ].filter(Boolean);
  }
  return [
    estate ? `申請地址：${estate}` : "",
    housing ? `樓宇類型：${housing}` : "",
    district && !estate.includes(district) ? `地區：${district}` : "",
  ].filter(Boolean);
}

export function withInquiry(text: string, inquiry?: Partial<Inquiry> | null, locale: Locale = "zh") {
  const extra = inquiryLines(inquiry, locale);
  if (!extra.length) return text;
  if (locale === "en") {
    if (text.includes("Address:") || text.includes("Housing type:")) return text;
  } else if (text.includes("申請地址：") || text.includes("屋苑／街道：")) {
    return text;
  }
  return `${text}\n${extra.join("\n")}`;
}

const ASK_COVERAGE_ZH = "請幫我核對覆蓋同最新優惠。";
const ASK_MOBILE_ZH = "請幫我核對新號碼上台優惠／攜號轉台優惠。";
const ASK_COVERAGE_EN = "Please confirm coverage and the latest offer.";
const ASK_MOBILE_EN = "Please help me check new-number signup offers / number-porting (MNP) offers.";

/** Mobile-only selections never ask for 覆蓋; any non-mobile plan keeps the coverage ask. */
export function quoteAsk(plans: Plan[], locale: Locale = "zh") {
  const mobileOnly = plans.length > 0 && plans.every((plan) => plan.category === "mobile");
  if (locale === "en") return mobileOnly ? ASK_MOBILE_EN : ASK_COVERAGE_EN;
  return mobileOnly ? ASK_MOBILE_ZH : ASK_COVERAGE_ZH;
}

export function quoteMessage(plans: Plan[] = [], inquiry?: Partial<Inquiry> | null, locale: Locale = "zh") {
  const ask = quoteAsk(plans, locale);
  let text: string;
  if (locale === "en") {
    if (plans.length === 1) {
      text = `Hi, I would like a quote for:\n${planLine(plans[0], "en")}\n${ask}`;
    } else if (plans.length > 1) {
      const list = plans.map((plan, i) => `${i + 1}. ${planLine(plan, "en")}`).join("\n");
      text = `Hi, I would like a quote for these plans:\n${list}\n${ask}`;
    } else {
      text = "Hi, I would like a quote for fibre / mobile plans.";
    }
  } else if (plans.length === 1) {
    text = `你好，我想即時報價：\n${planLine(plans[0])}\n${ask}`;
  } else if (plans.length > 1) {
    const list = plans.map((plan, i) => `${i + 1}. ${planLine(plan)}`).join("\n");
    text = `你好，我想即時報價以下計劃：\n${list}\n${ask}`;
  } else {
    text = "你好，我想查詢寬頻／手機月費計劃，請幫手即時報價。";
  }
  return withInquiry(text, inquiry, locale);
}

export function formQuoteMessage(input: {
  name: string;
  phone: string;
  housing: string;
  district: string;
  estate: string;
  category: Category;
  currentProvider: string;
  notes: string;
  plans: Plan[];
}) {
  const lines = [
    "你好，我想申請即時報價。",
    `姓名：${input.name}`,
    `電話：${input.phone}`,
    `樓宇：${housingLabel(input.housing) || input.housing}`,
    input.district ? `地區：${input.district}` : "",
    input.estate ? `申請地址：${input.estate}` : "",
    `想問：${CATEGORY_LABEL[input.category]}`,
    input.plans.length ? `已選計劃：${input.plans.map((plan) => planLine(plan)).join("；")}` : "",
    input.currentProvider ? `而家用：${input.currentProvider}` : "",
    input.notes ? `備註：${input.notes}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

export const QUICK_REPLIES = [
  {
    id: "broadband",
    label: "光纖寬頻",
    text: "你好，我想即時報價光纖寬頻（1000M／2500M／5000M／10000M），請幫手核對覆蓋。",
    textEn: "Hi, I would like a fibre quote (1000M / 2500M / 5000M / 10000M). Please check coverage.",
  },
  {
    id: "mobile",
    label: "手機月費",
    text: "你好，我想即時報價手機月費（4G／5G／大灣區數據），請介紹合適計劃。",
    textEn: "Hi, I would like a mobile plan quote (4G / 5G / Greater Bay Area data). Please recommend a suitable plan.",
  },
  {
    id: "business",
    label: "商業寬頻",
    text: "你好，我想即時報價商業寬頻，請幫手核對工商地址覆蓋。",
    textEn: "Hi, I would like a business fibre quote. Please check coverage for a commercial address.",
  },
  {
    id: "home5g",
    label: "5G 家居",
    text: "你好，我想即時報價 5G 家居寬頻，地址可能未有光纖。",
    textEn: "Hi, I would like a 5G home broadband quote. The address may not have fibre.",
  },
] as const;
