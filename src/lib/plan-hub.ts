import {
  cheapestPlan,
  cheapestVillageBroadbandPlan,
  type Category,
  type Housing,
  type Plan,
} from "./plans.ts";

/** Audited fibre examples already cited by the broadband hub paragraph. */
export const FIBRE_SUMMARY_IDS = [
  "icable-ftth-1000-48m-58",
  "hgc-ftth-1000-public-36m",
  "hkbn-ftth-1000-36m-98-sep30",
  "cmhk-ftth-1000-village-24m-218",
] as const;

/** 5G home examples: catalogue entry, SIM-only, and a router plan with a free month. */
export const HOME5G_SUMMARY_IDS = [
  "cmhk-home5g-350-48-88",
  "smartone-home5g-w6",
  "csl-home5g-wifi6",
] as const;

/** Mobile examples: current low-usage entry, and an open 5G plan (not a carrier-only price). */
export const MOBILE_SUMMARY_IDS = ["cmhk-21m-3-3-38", "three-5g-22-78"] as const;

/** Business examples: the two 1000M rows and a 10000M row. */
export const BUSINESS_SUMMARY_IDS = ["hkbn-biz-1000", "netvigator-biz-1000", "hkbn-biz-10000"] as const;

export const BUSINESS_SCENARIO_SPEEDS = [1000, 2500, 5000, 10000] as const;

/**
 * Turn a hub paragraph into list items without dropping the words.
 * Chinese breaks on 。 and ；. English breaks after a sentence-ending period.
 */
export function hubSummaryBullets(text: string): string[] {
  const parts = /[。；]/.test(text) ? text.split(/[。；]/) : text.split(/(?<=\.)\s+/);
  return parts.map((part) => part.trim()).filter((part) => part.length > 0);
}

/** Entry fee for the plans hero. Village fibre uses the village helper so a non-village price is not shown. */
export function categoryEntryPlan(cat: Category, housing?: Housing): Plan | undefined {
  if (cat === "broadband" && housing === "village") return cheapestVillageBroadbandPlan();
  return cheapestPlan(cat);
}
