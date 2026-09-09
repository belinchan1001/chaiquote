import { getPlan, type Plan } from "./plans.ts";

export const HOME_QUOTE_IDS = [
  "hkbn-ftth-1000-36m-98",
  "hgc-ftth-2000-hos-36m",
  "hkbn-village-2000-24m",
] as const;

export function homeQuotePlans(): Plan[] {
  return HOME_QUOTE_IDS.map(getPlan).filter((plan): plan is Plan => Boolean(plan)).slice(0, 3);
}
