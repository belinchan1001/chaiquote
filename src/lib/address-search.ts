import {
  allowGovHitForQuery,
  classifyAddress,
  compact,
  estateEnglishName,
  estateStreet,
  guessHousing,
  isImpracticalPlace,
  matchKnownEstate,
  searchEstates,
  type Estate,
  type HousingGuess,
} from "./estates.ts";
import { MESSAGES, type Locale, type MessageKey } from "./messages.ts";
import type { Housing } from "./plans.ts";
import { isNewIntakeEstate } from "./estate-new-intake.ts";
import { toTraditional } from "./zh-s2t.ts";

export { classifyAddress, isImpracticalPlace, matchKnownEstate };
export type { HousingGuess };

const GOV_SEARCH = "https://www.map.gov.hk/gs/api/v1.0.0/locationSearch";
const RESULT_CACHE = new Map<string, AddressHit[]>();
/** Parent + a scrollable set of 樓／閣 children; keep a few gov rows after that. */
export const LOCAL_SUGGEST_LIMIT = 24;
const GOV_EXTRA = 8;

export type AddressHit = {
  key: string;
  name: string;
  address: string;
  district: string;
  nameEN?: string;
  addressEN?: string;
  districtEN?: string;
  housing?: Housing;
  source: "local" | "gov";
  coverageCheck?: boolean;
  newIntake?: boolean;
};

export type GovRow = {
  nameZH?: string;
  nameEN?: string;
  addressZH?: string;
  addressEN?: string;
  districtZH?: string;
  districtEN?: string;
};

const HOUSING_MESSAGE: Record<Housing, MessageKey> = {
  public: "housingPublic",
  hos: "housingHos",
  private: "housingPrivate",
  village: "housingVillage",
};

function tidy(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function fromLocal(estate: Estate): AddressHit {
  return {
    key: `local:${estate.name}`,
    name: estate.name,
    address: estateStreet(estate),
    district: estate.area ?? estate.district,
    nameEN: estateEnglishName(estate),
    housing: estate.housing,
    source: "local",
    coverageCheck: estate.coverageCheck,
    newIntake: isNewIntakeEstate(estate.name) || undefined,
  };
}

export function localAddressHits(query: string, limit = LOCAL_SUGGEST_LIMIT): AddressHit[] {
  return searchEstates(query, limit)
    .filter((estate) => !isImpracticalPlace(estate.name))
    .map(fromLocal);
}

function pickLocalized(zh: string, en: string | undefined, locale: Locale) {
  if (locale === "en") {
    const english = tidy(en || "");
    if (english) return english;
  }
  return tidy(zh || en || "");
}

export function addressHitName(hit: AddressHit, locale: Locale = "zh") {
  return pickLocalized(hit.name, hit.nameEN, locale);
}

export function addressHitAddress(hit: AddressHit, locale: Locale = "zh") {
  return pickLocalized(hit.address, hit.addressEN, locale);
}

export function addressHitDistrict(hit: AddressHit, locale: Locale = "zh") {
  return pickLocalized(hit.district, hit.districtEN, locale);
}

export function addressHitFromGov(row: GovRow): AddressHit | null {
  const nameZH = tidy(row.nameZH || "");
  const nameEN = tidy(row.nameEN || "");
  const name = nameZH || nameEN;
  if (!name) return null;
  const addressZH = tidy(row.addressZH || "");
  const addressEN = tidy(row.addressEN || "");
  const districtZH = tidy(row.districtZH || "");
  const districtEN = tidy(row.districtEN || "");
  const matchHay = [nameEN && nameEN !== nameZH ? nameEN : "", addressZH, addressEN].filter(Boolean).join(" ");
  const known = matchKnownEstate(nameZH || nameEN, matchHay);
  return {
    key: `gov:${compact(name + addressZH + districtZH)}`,
    name,
    address: addressZH,
    district: known?.district || districtZH,
    nameEN: nameEN || (known ? estateEnglishName(known) : undefined),
    addressEN: addressEN || undefined,
    districtEN: districtEN || undefined,
    housing: known?.housing ?? guessHousing(nameZH || nameEN, [addressZH, addressEN].filter(Boolean).join(" ")),
    source: "gov",
    coverageCheck: known?.coverageCheck,
    newIntake: isNewIntakeEstate(known?.name ?? name) || undefined,
  };
}

function addressHitDedupKeys(hit: AddressHit) {
  const known = matchKnownEstate(hit.name, hit.address);
  return [...new Set([hit.name, hit.nameEN, known?.name].filter(Boolean).map((value) => compact(value!)))];
}

function startsWithQuery(hit: AddressHit, compactQ: string) {
  return [hit.name, hit.nameEN].some((value) => value && compact(value).startsWith(compactQ));
}

export async function searchAddresses(query: string, signal?: AbortSignal): Promise<AddressHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const cacheKey = compact(q);
  const cached = RESULT_CACHE.get(cacheKey);
  if (cached) return cached;
  const local = localAddressHits(q);
  const seen = new Set(local.flatMap(addressHitDedupKeys));

  try {
    const res = await fetch(`${GOV_SEARCH}?q=${encodeURIComponent(toTraditional(q))}`, { signal });
    if (!res.ok) return local;
    const rows = (await res.json()) as GovRow[];
    if (!Array.isArray(rows)) return local;
    const compactQ = compact(q);
    const gov: AddressHit[] = [];
    for (const row of rows) {
      const hit = addressHitFromGov(row);
      if (!hit) continue;
      const matchName = [hit.name, hit.nameEN].filter(Boolean).join(" ");
      const matchAddress = [hit.address, hit.addressEN].filter(Boolean).join(" ");
      if (!allowGovHitForQuery(q, matchName, matchAddress)) continue;
      if (isImpracticalPlace(hit.name, hit.address)) continue;
      if (hit.nameEN && isImpracticalPlace(hit.nameEN, hit.addressEN ?? "")) continue;
      const keys = addressHitDedupKeys(hit);
      if (keys.some((key) => seen.has(key)) || seen.has(hit.key)) continue;
      for (const key of keys) seen.add(key);
      seen.add(hit.key);
      gov.push(hit);
    }
    gov.sort((a, b) => {
      const as = startsWithQuery(a, compactQ) ? 1 : 0;
      const bs = startsWithQuery(b, compactQ) ? 1 : 0;
      return bs - as;
    });
    const cap = Math.max(12, local.length + GOV_EXTRA);
    const merged = [...local, ...gov].slice(0, cap);
    RESULT_CACHE.set(cacheKey, merged);
    return merged;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    return local;
  }
}

export function addressHitLabel(hit: AddressHit, locale: Locale = "zh") {
  const type = hit.housing ? MESSAGES[locale][HOUSING_MESSAGE[hit.housing]] : "";
  const bits = [addressHitDistrict(hit, locale), addressHitAddress(hit, locale), type].filter(Boolean);
  return bits.join(" · ");
}

export function addressHitValue(hit: AddressHit, locale: Locale = "zh") {
  const name = addressHitName(hit, locale);
  const address = addressHitAddress(hit, locale);
  if (!address) return name;
  return locale === "en" ? `${name}, ${address}` : `${name}，${address}`;
}
