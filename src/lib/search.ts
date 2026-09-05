import type { Category, Generation, Housing, PlansSearch, ProviderId, SpeedMbps } from "@/lib/plans";

const CATS: Category[] = ["broadband", "mobile", "home5g", "business"];
const HOUSING: Housing[] = ["public", "hos", "private", "village"];
const PROVIDERS: ProviderId[] = [
  "hkbn",
  "netvigator",
  "cmhk",
  "hgc",
  "smartone",
  "three",
  "csl",
  "icable",
];
const SPEEDS: SpeedMbps[] = [200, 500, 1000, 2000, 2500, 5000, 10000];
const GENERATIONS: Generation[] = ["4g", "5g"];

function asFlag(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function asNumber(value: unknown) {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function isSort(value: unknown): value is NonNullable<PlansSearch["sort"]> {
  return value === "fee" || value === "avg" || value === "speed" || value === "data";
}

export function parsePlansSearch(search: Record<string, unknown>): PlansSearch {
  const cat = CATS.includes(search.cat as Category) ? (search.cat as Category) : "broadband";
  const housing = HOUSING.includes(search.housing as Housing) ? (search.housing as Housing) : undefined;
  const provider = PROVIDERS.includes(search.provider as ProviderId)
    ? (search.provider as ProviderId)
    : undefined;
  const speedNum = asNumber(search.speed);
  const speed = SPEEDS.includes(speedNum as SpeedMbps) ? (speedNum as SpeedMbps) : undefined;
  const generation = GENERATIONS.includes(search.generation as Generation)
    ? (search.generation as Generation)
    : undefined;
  const portIn = asFlag(search.portIn);
  const saved = asFlag(search.saved);
  const gba = asFlag(search.gba);
  return {
    cat,
    housing,
    provider,
    speed,
    generation,
    sort: isSort(search.sort) ? search.sort : undefined,
    maxFee: asNumber(search.maxFee),
    minSpeed: asNumber(search.minSpeed),
    minData: asNumber(search.minData),
    portIn: portIn ? true : undefined,
    saved: saved ? true : undefined,
    gba: gba ? true : undefined,
    q: typeof search.q === "string" && search.q.length ? search.q : undefined,
    estate: typeof search.estate === "string" && search.estate.length ? search.estate : undefined,
  };
}

export function compactSearch(search: PlansSearch): PlansSearch {
  return {
    cat: search.cat,
    ...(search.housing ? { housing: search.housing } : {}),
    ...(search.maxFee ? { maxFee: search.maxFee } : {}),
    ...(search.speed ? { speed: search.speed } : {}),
    ...(search.minSpeed ? { minSpeed: search.minSpeed } : {}),
    ...(search.minData ? { minData: search.minData } : {}),
    ...(search.provider ? { provider: search.provider } : {}),
    ...(search.generation ? { generation: search.generation } : {}),
    ...(search.portIn ? { portIn: true } : {}),
    ...(search.gba ? { gba: true } : {}),
    ...(search.saved ? { saved: true } : {}),
    ...(search.q ? { q: search.q } : {}),
    ...(search.estate ? { estate: search.estate } : {}),
    ...(search.sort && search.sort !== "fee" ? { sort: search.sort } : {}),
  };
}