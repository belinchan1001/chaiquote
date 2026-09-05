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

export function whatsappHref(text: string) {
  const params = new URLSearchParams({
    phone: SITE.whatsappE164,
    text,
    type: "phone_number",
    app_absent: "0",
  });
  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

export function planLine(plan: Plan) {
  const provider = PROVIDER_MAP[plan.providerId];
  return `${provider.name} ${plan.name}（${CATEGORY_LABEL[plan.category]}，月費 ${formatFee(plan.monthlyFee)}／${plan.contractMonths}個月）`;
}

export function quoteMessage(plans: Plan[] = []) {
  if (plans.length === 1) {
    return `你好，我想即時報價：\n${planLine(plans[0])}\n請幫我核對覆蓋同最新優惠。`;
  }
  if (plans.length > 1) {
    const list = plans.map((plan, i) => `${i + 1}. ${planLine(plan)}`).join("\n");
    return `你好，我想即時報價以下計劃：\n${list}\n請幫我核對覆蓋同最新優惠。`;
  }
  return "你好，我想查詢寬頻／手機月費計劃，請幫手即時報價。";
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
  const housingLabel =
    input.housing in HOUSING_LABEL ? HOUSING_LABEL[input.housing as Housing] : input.housing;
  const lines = [
    "你好，我想申請即時報價。",
    `姓名：${input.name}`,
    `電話：${input.phone}`,
    `樓宇：${housingLabel}`,
    input.district ? `地區：${input.district}` : "",
    input.estate ? `屋苑／街道：${input.estate}` : "",
    `想問：${CATEGORY_LABEL[input.category]}`,
    input.plans.length ? `已選計劃：${input.plans.map(planLine).join("；")}` : "",
    input.currentProvider ? `而家用：${input.currentProvider}` : "",
    input.notes ? `備註：${input.notes}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

export const QUICK_REPLIES = [
  { id: "broadband", label: "光纖寬頻", text: "你好，我想即時報價光纖寬頻（1000M／2500M／5000M／10000M），請幫手核對覆蓋。" },
  { id: "mobile", label: "手機月費", text: "你好，我想即時報價手機月費（4G／5G／大灣區數據），請介紹合適計劃。" },
  { id: "business", label: "商業寬頻", text: "你好，我想即時報價商業寬頻，請幫手核對工商地址覆蓋。" },
  { id: "home5g", label: "5G 家居", text: "你好，我想即時報價 5G 家居寬頻，地址可能未有光纖。" },
] as const;
