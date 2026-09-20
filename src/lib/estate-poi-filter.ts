import { compact, isImpracticalPlace, matchKnownEstate } from "./estates.ts";

/** Extra LandsD / map.gov labels that slip past the shorter catalogue noise list. */
const GOV_POI_MARKERS = [
  "aquaprivy",
  "aquaprivies",
  "publictoilet",
  "toilet",
  "公廁",
  "公共洗手間",
  "公共廁所",
  "廁所",
  "已登記的wifi",
  "wifihotspot",
  "wifi接點",
  "wifi熱點",
  "wifi",
  "無線上網",
  "熱點",
  "apid",
  "回收機構",
  "回收流動點",
  "回收收集點",
  "回收點",
  "回收站",
  "綠在",
  "西醫",
  "中醫",
  "牙醫",
  "診所",
  "醫務所",
  "巴士總站",
  "巴士站",
  "busstop",
  "busterminus",
  "的士站",
  "的士候車",
  "taxistand",
  "taxirank",
  "小巴站",
  "minibus",
  "公共運輸交匯處",
  "publictransportinterchange",
  "pti",
  "停車場",
  "carpark",
  "parkandride",
  "sittingoutarea",
  "休憩處",
  "遊樂場",
  "playground",
  "候車亭",
  "避雨亭",
  "rainshelter",
  "燈柱",
  "街燈",
  "涼亭",
  "郵筒",
  "垃圾收集",
  "垃圾站",
  "垃圾收集站",
  "單車停泊",
  "充電站",
  "行人天橋",
  "電車站",
].sort((a, b) => b.length - a.length);

function haystack(name: string, address = ""): string {
  return compact(`${name} ${address}`);
}

export function isNonResidentialGovHit(name: string, address = ""): boolean {
  if (isImpracticalPlace(name, address)) return true;
  const known = matchKnownEstate(name, address);
  const hay = haystack(name, address);
  const hit = GOV_POI_MARKERS.find((marker) => hay.includes(marker));
  if (!hit) return false;
  if (!known) return true;
  const rest = hay.replace(compact(known.name), "");
  return GOV_POI_MARKERS.some((marker) => rest.includes(marker));
}

/**
 * map.gov often returns nearby POIs that do not contain the typed estate.
 * Keep the row only when the query (or its known-estate name) appears in the hit.
 */
export function govHitRelevantToQuery(
  query: string,
  name: string,
  nameEN = "",
  address = "",
  addressEN = "",
): boolean {
  const q = compact(query);
  if (q.length < 2) return false;
  const hay = compact(`${name}${nameEN}${address}${addressEN}`);
  if (hay.includes(q)) return true;
  if (q.length >= 4 && hay.includes(q.slice(0, 4))) return true;
  const known = matchKnownEstate(query, "");
  if (known && hay.includes(compact(known.name))) return true;
  return false;
}
