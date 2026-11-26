import type { ProviderId } from "./plans.ts";

/** Provider ids whose English chip is `providerName`, not the Chinese label. */
const PROVIDER_CHIP = new Set<string>(["hkbn", "netvigator", "hgc", "smartone", "cmhk", "icable", "three"]);

/**
 * English filter chips. CSL stays "CSL / 1O1O" (not the plan-card brand "csl.").
 * Other carriers use the existing provider English name. Remaining labels are
 * whole-string translations of the Chinese chip.
 */
export function filterChipText(
  id: string,
  label: string,
  locale: "zh" | "en",
  providerName: (id: ProviderId) => string,
  translate: (text: string) => string,
): string {
  if (locale !== "en") return label;
  if (id === "csl") return "CSL / 1O1O";
  if (PROVIDER_CHIP.has(id)) return providerName(id as ProviderId);
  return translate(label);
}
