import {
  classifyAddress,
  compact,
  guessHousing,
  matchKnownEstate,
  searchEstates,
  type Estate,
  type HousingGuess,
} from "@/lib/estates";
import type { Housing } from "@/lib/plans";

export { classifyAddress, matchKnownEstate };
export type { HousingGuess };

const GOV_SEARCH = "https://www.map.gov.hk/gs/api/v1.0.0/locationSearch";
const RESULT_CACHE = new Map<string, AddressHit[]>();
/** Parent + a scrollable set of 樓／閣 children; keep a few gov rows after that. */
export const LOCAL_SUGGEST_LIMIT = 24;
const GOV_EXTRA = 8;

const NOISE =
  /巴士站|小巴站|專線小巴|智郵|郵政局|電車站|港鐵站|總站|外面|公園|小學|中學|幼稚園|教堂|廟/;

export type AddressHit = {
  key: string;
  name: string;
  address: string;
  district: string;
  housing?: Housing;
  source: "local" | "gov";
  coverageCheck?: boolean;
};

type GovRow = {
  nameZH?: string;
  nameEN?: string;
  addressZH?: string;
  addressEN?: string;
  districtZH?: string;
  districtEN?: string;
};

function tidy(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function fromLocal(estate: Estate): AddressHit {
  return {
    key: `local:${estate.name}`,
    name: estate.name,
    address: "",
    district: estate.area ?? estate.district,
    housing: estate.housing,
    source: "local",
    coverageCheck: estate.coverageCheck,
  };
}

export function localAddressHits(query: string, limit = LOCAL_SUGGEST_LIMIT): AddressHit[] {
  return searchEstates(query, limit).map(fromLocal);
}

function fromGov(row: GovRow): AddressHit | null {
  const name = tidy(row.nameZH || row.nameEN || "");
  if (!name) return null;
  const address = tidy(row.addressZH || "");
  const district = tidy(row.districtZH || "");
  const known = matchKnownEstate(name, address);
  return {
    key: `gov:${compact(name + address + district)}`,
    name,
    address,
    district: known?.district || district,
    housing: known?.housing ?? guessHousing(name, address),
    source: "gov",
    coverageCheck: known?.coverageCheck,
  };
}

export async function searchAddresses(query: string, signal?: AbortSignal): Promise<AddressHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const cacheKey = compact(q);
  const cached = RESULT_CACHE.get(cacheKey);
  if (cached) return cached;
  const local = localAddressHits(q);
  const seen = new Set(local.map((hit) => compact(hit.name)));

  try {
    const res = await fetch(`${GOV_SEARCH}?q=${encodeURIComponent(q)}`, { signal });
    if (!res.ok) return local;
    const rows = (await res.json()) as GovRow[];
    if (!Array.isArray(rows)) return local;
    const compactQ = compact(q);
    const gov: AddressHit[] = [];
    for (const row of rows) {
      const hit = fromGov(row);
      if (!hit) continue;
      if (NOISE.test(hit.name) && !compact(hit.name).startsWith(compactQ)) continue;
      const nameKey = compact(hit.name);
      if (seen.has(nameKey) || seen.has(hit.key)) continue;
      seen.add(nameKey);
      seen.add(hit.key);
      gov.push(hit);
    }
    gov.sort((a, b) => {
      const as = compact(a.name).startsWith(compactQ) ? 1 : 0;
      const bs = compact(b.name).startsWith(compactQ) ? 1 : 0;
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

export function addressHitLabel(hit: AddressHit) {
  const type =
    hit.housing === "public"
      ? "公屋"
      : hit.housing === "hos"
        ? "居屋"
        : hit.housing === "village"
          ? "村屋"
          : hit.housing === "private"
            ? "私人樓"
            : "";
  const bits = [hit.district, hit.address || type].filter(Boolean);
  return bits.join(" · ");
}

export function addressHitValue(hit: AddressHit) {
  return hit.address ? `${hit.name}，${hit.address}` : hit.name;
}
