import { ESTATES, type Estate } from "./estates.ts";
import { filterPlans, type Housing, type Plan } from "./plans.ts";
import { DISTRICTS } from "./site.ts";

/** First-batch SEO estate pages. Their slugs stay stable. */
export const ESTATE_PAGE_NAMES = [
  "天耀邨",
  "天瑞邨",
  "天慈邨",
  "天盛苑",
  "天華邨",
  "天晴邨",
  "天恒邨",
  "天富苑",
  "天水圍嘉湖山莊",
  "天水圍北",
  "沙田第一城",
  "沙田圍",
  "瀝源邨",
  "禾輋邨",
  "坑口邨",
  "寶林邨",
  "觀塘邨",
  "牛頭角上邨",
  "牛頭角下邨",
  "秀茂坪邨",
  "葵涌邨",
  "良景邨",
  "兆康苑",
  "朗屏邨",
  "太古城",
  "黃埔花園",
  "美孚新邨",
  "黃大仙下邨",
  "黃大仙上邨",
  "慈雲山邨",
] as const;

export const SKIPPED_ESTATE_REQUESTS = [
  { query: "天水圍", reason: "地區／範圍，不是單一屋苑" },
  { query: "沙田", reason: "地區" },
  { query: "將軍澳", reason: "地區" },
  { query: "將軍澳廣場", reason: "資料庫沒有此苑" },
  { query: "荔景", reason: "資料庫沒有此苑" },
  { query: "屯門", reason: "地區" },
  { query: "元朗", reason: "地區" },
] as const;

export const ESTATE_HOUSING_LABEL: Record<Housing, string> = {
  public: "公屋",
  hos: "居屋",
  private: "私樓",
  village: "村屋",
};

export type EstatePage = {
  slug: string;
  estate: Estate;
};

function slugFromEstate(estate: Estate): string {
  const fallback = SLUG_FALLBACK[estate.name];
  if (fallback) return fallback;
  const english = estate.aliases.find((alias) => /[A-Za-z]/.test(alias) && alias.replace(/[^A-Za-z]/g, "").length >= 3);
  const raw = english ?? estate.name;
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length >= 3 && /[a-z]/.test(slug)) return slug;
  return uniqueSlug("estate", new Set());
}

const SLUG_FALLBACK: Record<string, string> = {
  彩虹道邨: "choi-hung-road",
  朗天苑: "long-tin-court",
  朗風苑: "long-fung-court",
  匯熙苑: "wui-hei-court",
  影輝苑: "ying-fai-court",
  海麗: "hoi-lai-mall",
  啟德1號: "kai-tak-1",
  啟陽苑: "kai-yeung-court",
  荃灣廣場: "tsuen-wan-plaza",
  長亨: "cheung-hang-block",
  裕豐苑: "yu-fung-court",
  坑口村: "hang-hau-village",
  天水圍天華: "tin-hua-tin-shui-wai",
  荃灣新村: "tsuen-wan-san-tsuen",
  海壩南台: "hoi-pa-nam-toi",
  綠悅: "the-greenery-ping-shan",
  宏緻苑: "wang-chi-court",
  盛緻苑: "shing-chi-court",
  日出康城: "lohas-park",
  名城: "festival-city",
  迎海: "double-cove",
  爾巒: "the-reach",
  峻巒: "park-yoho",
  柏傲灣: "the-pavilia",
  御龍山: "the-palazzo-sha-tin",
  恆光街項目: "hang-kwong-street-lph",
  青福里項目: "tsing-fuk-lane-lph",
  欣寶路項目: "yan-po-road-lph",
  鴻鵠臺: "hung-woo-terrace",
  世運道簡約公屋: "olympic-avenue-lph",
  柴灣常安街簡約公屋: "sheung-on-street-lph",
  樂嶺都匯: "lok-ling-hub",
  朗日峰: "long-yat-peak",
  朗天峰: "long-tin-peak",
  朗屏8號: "the-spectra",
  荷李活華庭: "hollywood-terrace",
  怡安閣: "yee-on-court",
  雅麗居: "the-astrid",
  古雋邨: "kwu-chun",
  天鑽: "the-regent",
  嵐山: "mont-vert",
  高爾夫御苑: "eden-manor",
  高爾夫景園: "golf-parkview",
  南灣花園: "south-bay-garden",
  聽濤雅苑: "vista-paradiso",
  翠擁華庭: "monte-vista",
  帝欣苑: "parc-versailles",
  滌濤山: "constellation-cove",
  御豪山莊: "park-royale",
  帝琴灣: "symphony-bay",
  淺月灣: "casa-marina",
  聚豪天下: "grand-palisades",
  海傲灣: "one-east-coast",
  比華利山花園: "the-beverly-hills",
  上然: "le-mont",
  寶庭居: "po-ting-home",
  賢庭居: "yin-ting-home",
  仁愛居: "yan-oi-house",
  樂翹樓: "eminence-tower",
  啟福居: "kai-fook-kui",
  逸瓏園: "the-mediterranean-sai-kung",
  樂嘉中心: "roca-centre",
  逸意居: "the-floridian",
  彩頤居: "cheerful-court",
  裕興苑: "yu-hing-court",
  柏傲莊III: "pavilia-farm-iii",
  "101 Kings Road": "101-kings-road",
  "Belgravia Place I": "belgravia-place-i",
  "Blue Coast I & II": "blue-coast-i-ii",
  Finnie: "finnie",
  "Miami Quay II": "miami-quay-ii",
  "Spring Garden": "spring-garden",
  "The Haddon": "the-haddon",
};

function requireEstate(name: string): Estate {
  const estate = ESTATES.find((item) => item.name === name);
  if (!estate) throw new Error(`estate page missing from catalogue: ${name}`);
  return estate;
}

function uniqueSlug(base: string, used: Set<string>): string {
  const seed = base || "estate";
  if (!used.has(seed)) return seed;
  let n = 2;
  while (used.has(`${seed}-${n}`)) n += 1;
  return `${seed}-${n}`;
}

function buildEstatePages(): EstatePage[] {
  const used = new Set<string>();
  const pages: EstatePage[] = [];
  const firstBatch = new Set<string>(ESTATE_PAGE_NAMES);

  function add(estate: Estate) {
    const slug = uniqueSlug(slugFromEstate(estate), used);
    used.add(slug);
    pages.push({ slug, estate });
  }

  for (const name of ESTATE_PAGE_NAMES) add(requireEstate(name));
  for (const estate of ESTATES) {
    if (firstBatch.has(estate.name)) continue;
    add(estate);
  }
  return pages;
}

export const ESTATE_PAGES: readonly EstatePage[] = buildEstatePages();

const PAGE_BY_SLUG = new Map(ESTATE_PAGES.map((page) => [page.slug, page]));
const PAGE_BY_NAME = new Map(ESTATE_PAGES.map((page) => [page.estate.name, page]));

export function getEstatePage(slug: string): EstatePage | undefined {
  try {
    return PAGE_BY_SLUG.get(decodeURIComponent(slug)) ?? PAGE_BY_SLUG.get(slug);
  } catch {
    return PAGE_BY_SLUG.get(slug);
  }
}

export function estatePagePath(page: EstatePage): string {
  return `/estates/${page.slug}`;
}

export function estateHousingLabel(housing: Housing): string {
  return ESTATE_HOUSING_LABEL[housing];
}

export function estateSeoTitle(estate: Estate): string {
  return `${estate.name}寬頻比較｜${estateHousingLabel(estate.housing)}｜齊Quote`;
}

export function estateSeoDescription(estate: Estate): string {
  const place = estate.area ? `${estate.district}${estate.area}` : estate.district;
  const street = estate.street ? `${estate.street}，` : "";
  return `${estate.name}位於${street}${place}，樓類為${estateHousingLabel(estate.housing)}。以下只列出適用該樓類的參考計劃。實際覆蓋同安裝期以電訊商確認為準。`;
}

export function estateIntro(estate: Estate): string {
  const place = estate.area ? `${estate.district}（${estate.area}）` : estate.district;
  const street = estate.street ? `${estate.street}，` : "";
  const check = estate.coverageCheck ? "此地址覆蓋需另行查核。" : "";
  return `${estate.name}位於${street}${place}，樓類為${estateHousingLabel(estate.housing)}。${check}實際覆蓋同安裝期以電訊商確認為準。`.replace(/\s+/g, " ");
}

export function estatePlans(estate: Estate): { broadband: Plan[]; home5g: Plan[] } {
  return {
    broadband: filterPlans({ cat: "broadband", housing: estate.housing, estate: estate.name }),
    home5g: filterPlans({ cat: "home5g", housing: estate.housing, estate: estate.name }),
  };
}

export function nearbyEstatePages(estate: Estate, limit = 6): EstatePage[] {
  const same = ESTATE_PAGES.filter((page) => page.estate.name !== estate.name && page.estate.district === estate.district);
  const rest = ESTATE_PAGES.filter(
    (page) => page.estate.name !== estate.name && page.estate.district !== estate.district,
  );
  return [...same, ...rest].slice(0, limit);
}

export function estatePagesByDistrict(): { district: string; pages: EstatePage[] }[] {
  const grouped = new Map<string, EstatePage[]>();
  for (const page of ESTATE_PAGES) {
    const list = grouped.get(page.estate.district) ?? [];
    list.push(page);
    grouped.set(page.estate.district, list);
  }
  const order = [...DISTRICTS];
  const districts = [...grouped.keys()].sort((a, b) => {
    const ai = order.indexOf(a as (typeof DISTRICTS)[number]);
    const bi = order.indexOf(b as (typeof DISTRICTS)[number]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b, "zh-Hant");
  });
  return districts.map((district) => ({ district, pages: grouped.get(district) ?? [] }));
}

export function relatedGuideSlug(estate: Estate): "village" | "fiber-vs-5g" {
  return estate.housing === "village" ? "village" : "fiber-vs-5g";
}

export function getEstatePageByName(name: string): EstatePage | undefined {
  return PAGE_BY_NAME.get(name);
}

export function estateSelectTarget(estate: Estate): { kind: "page"; slug: string } | { kind: "plans"; estate: string; housing: Housing } {
  const page = PAGE_BY_NAME.get(estate.name);
  if (page) return { kind: "page", slug: page.slug };
  return { kind: "plans", estate: estate.name, housing: estate.housing };
}
