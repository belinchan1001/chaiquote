import {
  CATEGORY_LABEL,
  PROVIDER_MAP,
  formatFee,
  cardHeadlineFee,
  isHktPlan,
  type Category,
  type Housing,
  type Plan,
} from "./plans.ts";
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
  if (
    plans.every(
      (plan) =>
        plan.providerId === "hkbn" &&
        (plan.category === "broadband" ||
          plan.category === "mobile" ||
          plan.category === "business" ||
          plan.category === "home5g"),
    )
  ) {
    return "hkbn";
  }
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

/** Inquiry chats open with no prefilled text. */
export function whatsappHref(_text = "", phone: string = SITE.whatsappE164) {
  return `https://wa.me/${phone}`;
}

/** Same bare chat link. Click stamps must not put a text query back on the URL. */
export function quoteWhatsappHref(_text = "", phone: string = SITE.whatsappE164) {
  return whatsappHref("", phone);
}

export function planLine(plan: Plan, locale: Locale = "zh") {
  const provider = PROVIDER_MAP[plan.providerId];
  const headline = cardHeadlineFee(plan);
  const listed =
    plan.double11Offer && headline !== plan.monthlyFee
      ? locale === "en"
        ? `average ${formatFee(headline)}/mo, listed ${formatFee(plan.monthlyFee)}`
        : `平均月費 ${formatFee(headline)}／月，標示 ${formatFee(plan.monthlyFee)}`
      : locale === "en"
        ? formatFee(plan.monthlyFee)
        : `月費 ${formatFee(plan.monthlyFee)}`;
  if (locale === "en") {
    return `${provider.nameEn} ${toEnglishLazy(plan.name)} (${toEnglishLazy(CATEGORY_LABEL[plan.category])}, ${listed} / ${plan.contractMonths} months)`;
  }
  return `${provider.name} ${plan.name}（${CATEGORY_LABEL[plan.category]}，${listed}／${plan.contractMonths}個月）`;
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

export type SalesQuoteInput = {
  serviceType?: string;
  address?: string;
  housing?: string;
  currentProvider?: string;
  targetProvider?: string;
  expiry?: string;
  need?: string;
  planName?: string;
  monthlyFee?: number;
  esports?: boolean;
  special?: string;
  source?: "ai" | "filter" | "";
  /** Phone plans use the mobile form. Address and housing stay off that form. */
  mobile?: boolean;
};

/** Inquiry WhatsApp opens with no sales prefill. */
export function salesQuoteMessage(_input: SalesQuoteInput = {}) {
  return "";
}

export function quoteMessage(
  plans: Plan[] = [],
  inquiry?: Partial<Inquiry> | null,
  _locale: Locale = "zh",
  special?: string,
) {
  const first = plans[0];
  const mobileOnly = plans.length
    ? plans.every((plan) => plan.category === "mobile")
    : /手機/.test(inquiry?.serviceType ?? "");
  const planName = plans
    .map((plan) => `${PROVIDER_MAP[plan.providerId]?.name ?? ""} ${plan.name}`.trim())
    .join("；");
  return salesQuoteMessage({
    serviceType: inquiry?.serviceType?.trim() || (first ? CATEGORY_LABEL[first.category] : ""),
    address: inquiry?.estate,
    housing: housingLabel(inquiry?.housing?.trim() ?? "", "zh"),
    currentProvider: inquiry?.currentProvider ?? "",
    targetProvider: inquiry?.targetProvider || (plans.length === 1 ? PROVIDER_MAP[first.providerId]?.name : ""),
    expiry: inquiry?.customerExpiry || inquiry?.expiry || "",
    need: inquiry?.need || "",
    planName,
    monthlyFee: plans.length === 1 ? first.monthlyFee : undefined,
    esports: inquiry?.esports,
    special,
    source: inquiry?.source === "ai" ? "ai" : "filter",
    mobile: mobileOnly || /手機/.test(inquiry?.serviceType ?? ""),
  });
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
  const planName = input.plans.map((plan) => planLine(plan, "zh")).join("；");
  const who = [input.name, input.phone].filter(Boolean).join(" ");
  return salesQuoteMessage({
    serviceType: CATEGORY_LABEL[input.category],
    address: [input.estate, input.district].filter(Boolean).join(" "),
    housing: housingLabel(input.housing) || input.housing,
    currentProvider: input.currentProvider,
    planName,
    special: [who ? `聯絡：${who}` : "", input.notes].filter(Boolean).join("；") || undefined,
    source: "filter",
  });
}

export const QUICK_REPLIES = [
  {
    id: "broadband",
    label: "光纖寬頻",
    text: salesQuoteMessage({ serviceType: "光纖寬頻", source: "filter" }),
    textEn: salesQuoteMessage({ serviceType: "光纖寬頻", source: "filter" }),
  },
  {
    id: "mobile",
    label: "手機月費",
    text: salesQuoteMessage({ serviceType: "手機月費", source: "filter", mobile: true }),
    textEn: salesQuoteMessage({ serviceType: "手機月費", source: "filter", mobile: true }),
  },
  {
    id: "business",
    label: "商業寬頻",
    text: salesQuoteMessage({ serviceType: "商業寬頻", source: "filter" }),
    textEn: salesQuoteMessage({ serviceType: "商業寬頻", source: "filter" }),
  },
  {
    id: "home5g",
    label: "5G 家居",
    text: salesQuoteMessage({ serviceType: "5G 家居寬頻", source: "filter" }),
    textEn: salesQuoteMessage({ serviceType: "5G 家居寬頻", source: "filter" }),
  },
] as const;
