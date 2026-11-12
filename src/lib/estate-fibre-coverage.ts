import { compact, matchKnownEstate, parentEstate } from "./estates.ts";
import type { ProviderId } from "./plans.ts";

/** Home-fibre carriers. 全齊 means every one of these has coverage. */
const ALL_FIBRE = ["hkbn", "netvigator", "cmhk", "hgc", "smartone", "icable"] as const satisfies readonly ProviderId[];
const HKT = ["hkbn", "hgc", "netvigator"] as const satisfies readonly ProviderId[];
const HKT_CMHK = ["hkbn", "cmhk", "hgc", "netvigator"] as const satisfies readonly ProviderId[];
const HKT_ICABLE = ["hkbn", "hgc", "netvigator", "icable"] as const satisfies readonly ProviderId[];

/**
 * Manually checked home-fibre coverage. Listed carriers have coverage.
 * A carrier that is absent does not. 安華苑 is the catalogue name 安樺苑.
 */
export const CONFIRMED_FIBRE_COVERAGE: Record<string, readonly ProviderId[]> = {
  雋東邨: HKT_CMHK,
  翔東邨: HKT_CMHK,
  裕興苑: HKT,
  錦柏苑: HKT,
  恆光街項目: HKT,
  青福里項目: HKT_CMHK,
  欣寶路項目: HKT,
  滿田邨: HKT,
  鴻鵠臺: HKT,
  柏傲莊III: HKT,
  "101 Kings Road": HKT_CMHK,
  "Belgravia Place I": HKT,
  "Blue Coast I & II": HKT,
  "One Central Place": HKT,
  "Miami Quay II": HKT_ICABLE,
  "The Haddon": HKT,
  安樺苑: ALL_FIBRE,
  安麗苑: ALL_FIBRE,
};

/** Carriers allowed for this address, or undefined when coverage has not been checked. */
export function confirmedFibreProviders(query?: string): readonly ProviderId[] | undefined {
  const raw = query?.trim();
  if (!raw) return undefined;
  const folded = compact(raw);
  if (folded.includes("柏傲莊") && /三期|3期|iii/.test(folded)) return CONFIRMED_FIBRE_COVERAGE["柏傲莊III"];
  const known = matchKnownEstate(raw);
  const names = [known?.name, known ? parentEstate(known)?.name : undefined, parentEstate(raw)?.name];
  for (const name of names) {
    const hit = name ? CONFIRMED_FIBRE_COVERAGE[name] : undefined;
    if (hit) return hit;
  }
  return undefined;
}
