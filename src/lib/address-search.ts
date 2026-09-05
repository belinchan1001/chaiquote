import { compact, ESTATES, searchEstates, type Estate } from "@/lib/estates";
import type { Housing } from "@/lib/plans";

const GOV_SEARCH = "https://www.map.gov.hk/gs/api/v1.0.0/locationSearch";

const NOISE =
  /巴士站|小巴站|專線小巴|智郵|郵政局|電車站|港鐵站|總站|外面|公園|小學|中學|幼稚園|教堂|廟/;

export type AddressHit = {
  key: string;
  name: string;
  address: string;
  district: string;
  housing?: Housing;
  source: "local" | "gov";
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

export function matchKnownEstate(name: string, address = ""): Estate | undefined {
  const hay = compact(`${name}${address}`);
  if (!hay) return undefined;
  let best: { estate: Estate; score: number } | undefined;
  for (const estate of ESTATES) {
    const needles = [estate.name, ...estate.aliases].map(compact).filter((n) => n.length >= 2);
    for (const needle of needles) {
      if (!hay.includes(needle) && !compact(name).includes(needle)) continue;
      const score = needle.length + (compact(estate.name) === compact(name) ? 50 : 0);
      if (!best || score > best.score) best = { estate, score };
    }
  }
  return best?.estate;
}

function guessHousing(name: string, address: string): Housing | undefined {
  const known = matchKnownEstate(name, address);
  if (known) return known.housing;
  const text = `${name}${address}`;
  if (/公屋|屋邨/.test(text)) return "public";
  if (/居屋/.test(text)) return "hos";
  if (/村屋|丁屋/.test(text)) return "village";
  if (/新邨|花園|廣場|中心|大廈|洋房|半島|豪庭|屋苑/.test(text)) return "private";
  if (/邨/.test(text)) return "public";
  const title = name.replace(/[，,].*$/, "").trim();
  if (/(新村|村|圍)$/.test(title) && !/邨/.test(title)) return "village";
  return undefined;
}

export type HousingGuess = {
  housing?: Housing;
  confidence: "high" | "medium" | "none";
};

export function classifyAddress(query: string): HousingGuess {
  const q = query.trim();
  if (q.length < 2) return { confidence: "none" };
  const known = matchKnownEstate(q, "");
  if (known) return { housing: known.housing, confidence: "high" };
  const guessed = guessHousing(q, "");
  if (guessed) return { housing: guessed, confidence: "medium" };
  return { confidence: "none" };
}


function fromLocal(estate: Estate): AddressHit {
  return {
    key: `local:${estate.name}`,
    name: estate.name,
    address: "",
    district: estate.area ?? estate.district,
    housing: estate.housing,
    source: "local",
  };
}

export function localAddressHits(query: string, limit = 6): AddressHit[] {
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
  };
}

export async function searchAddresses(query: string, signal?: AbortSignal): Promise<AddressHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const local = localAddressHits(q, 5);
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
    return [...local, ...gov].slice(0, 12);
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
