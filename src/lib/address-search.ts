import { DISTRICT_EN, districtEnglishName } from "./district-names.ts";
import {
  allowGovHitForQuery,
  allowSuggestHitForQuery,
  classifyAddress,
  compact,
  estateEnglishName,
  estateStreet,
  guessHousing,
  isImpracticalPlace,
  matchKnownEstate,
  parentEstate,
  relatedBlocks,
  searchEstates,
  type Estate,
  type HousingGuess,
} from "./estates.ts";
import { MESSAGES, type Locale, type MessageKey } from "./messages.ts";
import type { Housing } from "./plans.ts";
import { isNewIntakeEstate } from "./estate-new-intake.ts";
import { isNonResidentialGovHit } from "./estate-poi-filter.ts";
import { DISTRICTS } from "./site.ts";
import { toTraditional } from "./zh-s2t.ts";

export { classifyAddress, isImpracticalPlace, matchKnownEstate, allowSuggestHitForQuery };
export type { HousingGuess };

const GOV_SEARCH = "https://www.map.gov.hk/gs/api/v1.0.0/locationSearch";
/** Locale-independent: hits keep ZH+EN fields. Do not key by locale. */
const RESULT_CACHE = new Map<string, AddressHit[]>();
/** Homepage / suggest debounce. Keep Abort + cache; do not spam map.gov. */
export const ADDRESS_SEARCH_DEBOUNCE_MS = 300;
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
  /** Gov-suggested block/building — UI must say 僅供參考／覆蓋另查. */
  blockRef?: boolean;
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

const HK_DISTRICT_LABELS = new Set<string>([
  ...DISTRICTS,
  ...DISTRICTS.map((name) => (name.endsWith("區") ? name : `${name}區`)),
  ...Object.values(DISTRICT_EN),
  ...Object.values(DISTRICT_EN).map((name) => `${name} District`),
]);

const HK_PLACE_MARKERS = ["香港", "九龍", "新界", "港島", "hongkong", "kowloon", "newterritories", "hong kong"];
const OVERSEAS_MARKERS = [
  "united kingdom",
  "united states",
  "singapore",
  "tokyo",
  "osaka",
  "beijing",
  "shanghai",
  "shenzhen",
  "guangzhou",
  "macau",
  "macao",
  "taiwan",
  "英國",
  "美國",
  "新加坡",
  "東京",
  "大阪",
  "北京",
  "上海",
  "深圳",
  "廣州",
  "澳門",
  "台灣",
];

function normalizeDistrictLabel(value: string) {
  return tidy(value)
    .replace(/\s*District$/i, "")
    .replace(/區$/, "");
}

export function isKnownHkDistrict(value: string): boolean {
  const raw = tidy(value);
  if (!raw) return false;
  if (HK_DISTRICT_LABELS.has(raw)) return true;
  const stripped = normalizeDistrictLabel(raw);
  if (HK_DISTRICT_LABELS.has(stripped)) return true;
  const folded = stripped.toLowerCase();
  return [...HK_DISTRICT_LABELS].some((label) => label.toLowerCase() === folded || label.toLowerCase() === raw.toLowerCase());
}

/** map.gov rows are HK; drop only when a district/address is clearly not HK. */
export function isHongKongPlace(district: string, address = "", name = ""): boolean {
  if (isKnownHkDistrict(district)) return true;
  const hay = compact(`${name}${address}${district}`);
  if (!hay) return true;
  if (HK_PLACE_MARKERS.some((marker) => hay.includes(compact(marker)))) return true;
  if (district && !isKnownHkDistrict(district) && OVERSEAS_MARKERS.some((marker) => compact(district).includes(compact(marker)))) {
    return false;
  }
  if (OVERSEAS_MARKERS.some((marker) => hay.includes(compact(marker))) && !HK_PLACE_MARKERS.some((marker) => hay.includes(compact(marker)))) {
    return false;
  }
  return true;
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
  return pickLocalized(hit.district, hit.districtEN || districtEnglishName(hit.district), locale);
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
      if (!allowSuggestHitForQuery(q, hit.name, hit.nameEN ?? "")) continue;
      if (!isHongKongPlace(hit.district || hit.districtEN || "", `${hit.address} ${hit.addressEN ?? ""}`, hit.name)) {
        continue;
      }
      if (isNonResidentialGovHit(hit.name, hit.address)) continue;
      if (hit.nameEN && isNonResidentialGovHit(hit.nameEN, hit.addressEN ?? "")) continue;
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

/** Dropdown line: district · housing type (street stays on the value / label). */
export function addressHitSubtitle(hit: AddressHit, locale: Locale = "zh") {
  const type = hit.housing ? MESSAGES[locale][HOUSING_MESSAGE[hit.housing]] : "";
  return [addressHitDistrict(hit, locale), type].filter(Boolean).join(" · ");
}

export function addressHitValue(hit: AddressHit, locale: Locale = "zh") {
  const name = addressHitName(hit, locale);
  const address = addressHitAddress(hit, locale);
  if (!address) return name;
  return locale === "en" ? `${name}, ${address}` : `${name}，${address}`;
}

const BUILDING_MARK = /[樓閣座]|大廈|house|block|tower|building/i;

export function isBuildingLikeName(name: string): boolean {
  return BUILDING_MARK.test(name);
}

export function knownEstateForHit(hit: AddressHit): Estate | undefined {
  return matchKnownEstate(hit.name, hit.address);
}

/** Already a 樓／閣 catalogue child — finalize, do not open another block step. */
export function isCatalogueBlockHit(hit: AddressHit): boolean {
  const known = knownEstateForHit(hit);
  return Boolean(known && parentEstate(known));
}

export type BlockStepKind = "none" | "catalogue" | "lookup";

/**
 * Site-wide parent → block/building. Catalogue children open step 2 immediately.
 * Parents with no catalogue blocks look up map.gov / ALS; empty results skip step 2.
 */
export function blockStepKind(hit: AddressHit): BlockStepKind {
  const known = knownEstateForHit(hit);
  if (known && parentEstate(known)) return "none";
  if (known && relatedBlocks(known).length) return "catalogue";
  return "lookup";
}

export function catalogueBlockHits(hit: AddressHit): AddressHit[] {
  const known = knownEstateForHit(hit);
  if (!known || parentEstate(known)) return [];
  return relatedBlocks(known).map(fromLocal);
}

function displayDedupKeys(hit: AddressHit): string[] {
  return [...new Set([hit.name, hit.nameEN].filter(Boolean).map((value) => compact(value!)).filter((key) => key.length >= 2))];
}

function catalogueNameKey(hit: AddressHit): string | undefined {
  /** Name only — an address that mentions the parent must not collapse the child onto the estate. */
  return matchKnownEstate(hit.name, "")?.name;
}

export function isGovChildBlock(parent: AddressHit, child: AddressHit): boolean {
  if (child.key === parent.key) return false;
  const parentNames = displayDedupKeys(parent);
  if (displayDedupKeys(child).some((key) => parentNames.includes(key))) return false;
  if (!isBuildingLikeName(child.name) && !isBuildingLikeName(child.nameEN ?? "")) return false;
  if (isNonResidentialGovHit(child.name, child.address)) return false;
  if (child.nameEN && isNonResidentialGovHit(child.nameEN, child.addressEN ?? "")) return false;
  const childHay = compact(`${child.name}${child.nameEN ?? ""}${child.address}${child.addressEN ?? ""}`);
  if (!parentNames.some((key) => childHay.includes(key))) return false;
  if (!allowSuggestHitForQuery(parent.name, child.name, child.nameEN ?? "")) return false;
  return true;
}

export function labelGovBlockHit(hit: AddressHit): AddressHit {
  return { ...hit, blockRef: true, coverageCheck: true };
}

export function collectGovChildBlocks(parent: AddressHit, hits: AddressHit[], catalogue: AddressHit[] = []): AddressHit[] {
  const seen = new Set<string>([parent.key, ...displayDedupKeys(parent)]);
  for (const hit of catalogue) {
    seen.add(hit.key);
    for (const key of displayDedupKeys(hit)) seen.add(key);
    const known = catalogueNameKey(hit);
    if (known) seen.add(compact(known));
  }
  const parentKnown = catalogueNameKey(parent);
  const out: AddressHit[] = [];
  for (const hit of hits) {
    if (!isGovChildBlock(parent, hit)) continue;
    const keys = [...displayDedupKeys(hit), hit.key];
    const known = catalogueNameKey(hit);
    if (known && known !== parentKnown) keys.push(compact(known));
    if (keys.some((key) => seen.has(key))) continue;
    out.push(labelGovBlockHit(hit));
    for (const key of keys) seen.add(key);
  }
  return out;
}

export async function lookupParentBlocks(
  parent: AddressHit,
  signal?: AbortSignal,
): Promise<{ catalogue: AddressHit[]; gov: AddressHit[] }> {
  const catalogue = catalogueBlockHits(parent);
  const hits = await searchAddresses(parent.name, signal);
  return { catalogue, gov: collectGovChildBlocks(parent, hits, catalogue) };
}

export function blockStepHits(catalogue: AddressHit[], gov: AddressHit[]): AddressHit[] {
  return [...catalogue, ...gov];
}
