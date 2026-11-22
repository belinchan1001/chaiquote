import { filterPlans } from "./plan-filter.ts";
import {
  PROVIDER_MAP,
  cardHeadlineFee,
  formatFee,
  isIcableDesignatedEstatePlan,
  isOfferExpired,
  type Category,
  type Plan,
  type PlansSearch,
  type ProviderId,
} from "./plans.ts";
import { formatCustomerExpiry, serviceTypeLabel } from "./port-in.ts";
import {
  OTHER_PROVIDER,
  SPEND_KIND_LABEL,
  SPEND_PROVIDERS,
  daysUntil,
  isIsoDate,
  parseMoney,
  speedLabel,
  type SpeedPreset,
  type SpendItem,
  type SpendKind,
} from "./spend-ledger.ts";

const PROVIDER_ID: Record<string, ProviderId> = {
  "香港寬頻": "hkbn",
  HKBN: "hkbn",
  "網上行": "netvigator",
  Netvigator: "netvigator",
  "中國移動香港": "cmhk",
  CMHK: "cmhk",
  "HGC 寬頻": "hgc",
  HGC: "hgc",
  "數碼通": "smartone",
  SmarTone: "smartone",
  "3香港": "three",
  "3HK": "three",
  "csl.": "csl",
  CSL: "csl",
  "1O1O": "csl",
  "有線寬頻": "icable",
  "i-Cable": "icable",
};

export function providerIdFromName(name: string): ProviderId | undefined {
  const trimmed = name.trim();
  if (!trimmed || trimmed === "其他") return undefined;
  return PROVIDER_ID[trimmed];
}

export function compareCategory(kind: SpendKind): Category | null {
  if (kind === "broadband") return "broadband";
  if (kind === "home5g") return "home5g";
  if (kind === "mobile") return "mobile";
  return null;
}

export function expiryFromEndDate(endDate: string, today?: string): PlansSearch["expiry"] | undefined {
  const days = daysUntil(endDate, today);
  if (days === null) return undefined;
  if (days <= 30) return "1m";
  if (days <= 90) return "2-3m";
  if (days <= 180) return "4-6m";
  return "6m+";
}

export function compareSearchFor(item: SpendItem): PlansSearch | null {
  const cat = compareCategory(item.kind);
  if (!cat) return null;
  const search: PlansSearch = { cat, sort: "fee" };
  const provider = providerIdFromName(item.provider);
  if (provider) search.exclude = provider;
  if (cat === "broadband" || cat === "home5g") {
    if (item.speedPreset === "1000") search.minSpeed = 1000;
    if (item.speedPreset === "2500") search.minSpeed = 2500;
  }
  if (item.monthly > 0) search.maxFee = item.monthly;
  const expiry = expiryFromEndDate(item.endDate);
  if (expiry) search.expiry = expiry;
  return search;
}

export function canCompareOnSite(kind: SpendKind): boolean {
  return compareCategory(kind) !== null;
}

export function inquiryPatchFromSpendItem(item: SpendItem) {
  const cat = compareCategory(item.kind);
  return {
    currentProvider: item.provider,
    customerExpiry: formatCustomerExpiry(item.endDate),
    expiry: formatCustomerExpiry(item.endDate),
    serviceType: cat ? serviceTypeLabel(cat) : "",
    need: item.kind === "broadband" ? speedLabel(item, "zh") : "",
  };
}

const REFERENCE_LIMIT = 3;

function isVillageOnlyPlan(plan: Plan): boolean {
  return plan.housing !== "all" && plan.housing.every((item) => item === "village");
}

/** General catalogue rows only. Designated-estate and village-only prices stay off the hero. */
export function isSpendReferencePlan(plan: Plan, now = Date.now()): boolean {
  if (plan.unpublished || plan.staffOffer) return false;
  if (plan.monthlyFee <= 0) return false;
  if (plan.onlyEstates?.length) return false;
  if (plan.newIntakeOffer) return false;
  if (isIcableDesignatedEstatePlan(plan)) return false;
  if (plan.name.includes("指定屋苑")) return false;
  if (isVillageOnlyPlan(plan)) return false;
  if (isOfferExpired(plan, now)) return false;
  return true;
}

function providerNameMatches(plan: Plan, providerName: string): boolean {
  const id = providerIdFromName(providerName);
  if (id) return plan.providerId === id;
  const name = providerName.trim().toLowerCase();
  if (!name || name === OTHER_PROVIDER) return false;
  const provider = PROVIDER_MAP[plan.providerId];
  return provider.name.toLowerCase() === name || provider.nameEn.toLowerCase() === name;
}

function underThousand(plan: Plan): boolean {
  const speed = plan.speedMbps ?? 0;
  return speed > 0 && speed < 1000;
}

/**
 * In-site reference plans at or below the registered fee.
 * The current provider is left out. Pay TV and OTT are not compared.
 * One plan per provider, cheapest sticker fee first.
 */
export function referencePlansFor(item: SpendItem, now = Date.now()): Plan[] {
  if (!canCompareOnSite(item.kind) || item.monthly <= 0) return [];
  const search = compareSearchFor(item);
  if (!search) return [];
  const rows = filterPlans(search).filter((plan) => {
    if (!isSpendReferencePlan(plan, now)) return false;
    if (providerNameMatches(plan, item.provider)) return false;
    if (item.kind === "broadband" && item.speedPreset === "under1000" && !underThousand(plan)) return false;
    return true;
  });
  const best = new Map<ProviderId, Plan>();
  for (const plan of rows) {
    const prev = best.get(plan.providerId);
    if (
      !prev ||
      plan.monthlyFee < prev.monthlyFee ||
      (plan.monthlyFee === prev.monthlyFee && plan.id < prev.id)
    ) {
      best.set(plan.providerId, plan);
    }
  }
  return [...best.values()]
    .sort((a, b) => a.monthlyFee - b.monthlyFee || a.providerId.localeCompare(b.providerId))
    .slice(0, REFERENCE_LIMIT);
}

export function referenceMonthlyFee(plans: readonly Plan[]): number | null {
  if (!plans.length) return null;
  return plans.reduce((min, plan) => Math.min(min, plan.monthlyFee), plans[0]!.monthlyFee);
}

export function referenceSavingNote(current: number, reference: number): string {
  const diff = Math.round((current - reference) * 10) / 10;
  const amount = Number.isInteger(diff) ? String(Math.abs(diff)) : Math.abs(diff).toFixed(1);
  if (diff > 0) return `較而家少 HK$${amount}（參考）`;
  if (diff === 0) return "同你而家一樣（參考）";
  return `較而家多 HK$${amount}（參考）`;
}

export function spendFeeCheckText(
  item: SpendItem,
  reference?: { provider: string; name: string; monthlyFee: number },
): string {
  const kind = SPEND_KIND_LABEL.zh[item.kind];
  const who = item.provider.trim() || kind;
  const lines = [
    "你好，想查核呢筆月費對照（只供參考）：",
    `而家用緊：${who} ${kind} ${formatFee(item.monthly)}`,
    item.endDate ? `到期日：${item.endDate}（請自行向電訊商核實）` : "",
    reference
      ? `站內參考：${reference.provider} ${reference.name} ${formatFee(reference.monthlyFee)}（參考月費，以電訊商確認為準）`
      : "想對照站內參考計劃，牌面月費只供參考，以電訊商確認為準。",
  ];
  return lines.filter(Boolean).join("\n");
}

export function speedPresetFromMbps(mbps?: number): SpeedPreset | "" {
  if (!mbps || mbps <= 0) return "";
  if (mbps >= 2500) return "2500";
  if (mbps >= 1000) return "1000";
  return "under1000";
}

export function spendKindForPlan(plan: Plan): SpendKind {
  if (plan.category === "broadband" || plan.category === "home5g" || plan.category === "mobile") return plan.category;
  return "other";
}

/** Card → short form. Nothing is written until the person saves on this device. */
export function prefillFromPlan(plan: Plan) {
  const kind = spendKindForPlan(plan);
  const providerName = PROVIDER_MAP[plan.providerId]?.name ?? "";
  const known = (SPEND_PROVIDERS[kind] as readonly string[]).includes(providerName);
  const fee = cardHeadlineFee(plan);
  return {
    kind,
    providerPick: known ? providerName : providerName ? OTHER_PROVIDER : "",
    providerCustom: known ? "" : providerName,
    name: plan.name,
    monthly: Number.isInteger(fee) ? String(fee) : fee.toFixed(1),
    note: `合約期 ${plan.contractMonths} 個月`,
    speedPreset: kind === "broadband" || kind === "home5g" ? speedPresetFromMbps(plan.speedMbps) : ("" as const),
    speedCustom: "",
  };
}

export function spendFormIssue(input: { provider: string; monthly: string; endDate: string }): "provider" | "fee" | "end" | null {
  if (!input.provider.trim()) return "provider";
  if (!(parseMoney(input.monthly) > 0)) return "fee";
  const end = input.endDate.trim().replace(/\//g, "-");
  if (!isIsoDate(end)) return "end";
  return null;
}

export function normalizeSpendDate(value: string): string {
  const next = value.trim().replace(/\//g, "-");
  return isIsoDate(next) ? next : "";
}

/** Filled ledger keeps the short form closed so the comparison stays on the first screen. */
export function spendFormIsCollapsed(itemCount: number, adding: boolean): boolean {
  return itemCount > 0 && !adding;
}
