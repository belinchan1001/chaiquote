import type { Category, PlansSearch, ProviderId } from "./plans.ts";
import { formatCustomerExpiry, serviceTypeLabel } from "./port-in.ts";
import { daysUntil, speedLabel, type SpendItem, type SpendKind } from "./spend-ledger.ts";

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
  if (cat === "broadband") {
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
