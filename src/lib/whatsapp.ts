import {
  CATEGORY_LABEL,
  HOUSING_LABEL,
  PROVIDER_MAP,
  formatFee,
  type Category,
  type Housing,
  type Plan,
} from "@/lib/plans";
import { SITE } from "@/lib/site";
import type { Inquiry } from "@/lib/desk";
import type { Locale } from "@/lib/messages";
import { toEnglish } from "@/lib/plan-en";

export function whatsappHref(text: string) {
  const params = new URLSearchParams({
    phone: SITE.whatsappE164,
    text,
    type: "phone_number",
    app_absent: "0",
  });
  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

export function planLine(plan: Plan, locale: Locale = "zh") {
  const provider = PROVIDER_MAP[plan.providerId];
  if (locale === "en") {
    return `${provider.nameEn} ${toEnglish(plan.name)} (${toEnglish(CATEGORY_LABEL[plan.category])}, ${formatFee(plan.monthlyFee)} / ${plan.contractMonths} months)`;
  }
  return `${provider.name} ${plan.name}（${CATEGORY_LABEL[plan.category]}，月費 ${formatFee(plan.monthlyFee)}／${plan.contractMonths}個月）`;
}

function housingLabel(value?: string, locale: Locale = "zh") {
  if (!value) return "";
  const label = value in HOUSING_LABEL ? HOUSING_LABEL[value as Housing] : value;
  return locale === "en" ? toEnglish(label) : label;
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

export function quoteMessage(plans: Plan[] = [], inquiry?: Partial<Inquiry> | null, locale: Locale = "zh") {
  let text: string;
  if (locale === "en") {
    if (plans.length === 1) {
      text = `Hi, I would like a quote for:\n${planLine(plans[0], "en")}\nPlease confirm coverage and the latest offer.`;
    } else if (plans.length > 1) {
      const list = plans.map((plan, i) => `${i + 1}. ${planLine(plan, "en")}`).join("\n");
      text = `Hi, I would like a quote for these plans:\n${list}\nPlease confirm coverage and the latest offer.`;
    } else {
      text = "Hi, I would like a quote for fibre / mobile plans.";
    }
  } else if (plans.length === 1) {
    text = `你好，我想即時報價：\n${planLine(plans[0])}\n請幫我核對覆蓋同最新優惠。`;
  } else if (plans.length > 1) {
    const list = plans.map((plan, i) => `${i + 1}. ${planLine(plan)}`).join("\n");
    text = `你好，我想即時報價以下計劃：\n${list}\n請幫我核對覆蓋同最新優惠。`;
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
