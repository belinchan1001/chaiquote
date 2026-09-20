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
  "wifihotspot",
  "wifi接點",
  "wifi",
  "無線上網",
  "熱點",
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
