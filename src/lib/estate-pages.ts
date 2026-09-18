import { ESTATES, estateDisplayName, estateEnglishName, parentEstate, placeDisplayName, type Estate } from "./estates.ts";
import { NETVIGATOR_ONLY_ESTATES } from "./estate-new-intake.ts";
import { MESSAGES, type Locale, type MessageKey } from "./messages.ts";
import { filterPlans, matchesHousing, PLANS, type Housing, type Plan } from "./plans.ts";
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

const HOUSING_MESSAGE: Record<Housing, MessageKey> = {
  public: "housingPublic",
  hos: "housingHos",
  private: "housingPrivate",
  village: "housingVillage",
};

export type EstatePage = {
  slug: string;
  estate: Estate;
};

function slugFromEstate(estate: Estate): string {
  const fallback = SLUG_FALLBACK[estate.name];
  if (fallback) return fallback;
  const english = estateEnglishName(estate);
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
  啟德1號: "kai-tak-1",
  啟陽苑: "kai-yeung-court",
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
  海翠花園: "pierhead-garden",
  啟豐園: "richland-garden-tuen-mun",
  曉峯灣畔: "mountain-shore",
  海典灣: "ocean-view",
  雅典居: "villa-athena",
  海柏花園: "bayshore-towers",
  翠怡花園: "greenfield-garden",
  宏福花園: "tivoli-garden",
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
  攸壆路簡約公屋: "yau-pok-road-lph",
  彩興路簡約公屋: "choi-hing-road-lph",
  彩園路簡約公屋: "choi-yuen-road-lph",
  順安道簡約公屋: "shun-on-road-lph",
  彩石里簡約公屋: "choi-shek-lane-lph",
  青發街簡約公屋: "tsing-fat-street-lph",
  "Sierra Sea": "sierra-sea",
  黃金海灣: "gold-coast-bay",
  "Double Coast": "double-coast",
  海盈山: "la-montagne",
  逸瓏灣: "mayfair-by-the-sea",
  逸瓏灣II: "mayfair-by-the-sea-ii",
  逸瓏灣8: "mayfair-by-the-sea-8",
  逸瓏海匯: "mayfair-by-the-harbour",
  樂嶺樓: "lok-ling-house",
  盛頤居: "shing-yee-residence",
  蝶翠峰: "park-signature",
  翹翠峰: "the-parkville",
  曉峰園: "mount-haven",
  蔚藍灣畔: "residence-oasis-tko",
  翔龍灣: "grand-waterfront",
  盈翠半島: "tierra-verde",
  藍澄灣: "rambler-crest",
  瓏門: "century-gateway",
  深井浪翠園: "nerine-cove",
  深井麗都花園: "lido-garden",
  帝柏海灣: "imperial-bay-olympic",
  御金國峯: "the-coronation",
  "NOVO LAND": "novo-land",
  傲華: "oria",
  滙都: "high-park-hung-shui-kiu",
  維港雙鑽: "grand-victoria-kai-tak",
  天璽海: "cullinan-harbour",
  天璽天: "cullinan-sky",
  啟德海灣: "kt-marina",
  壹沐: "highwood",
  應天: "21-borrett-road",
  璟南: "vele",
  "Beacon Peak": "beacon-peak",
  尚岸: "the-shore-tuen-mun",
  維港灣畔: "victoria-voyage",
  海德園: "the-headland-residences",
  邑庭居: "yap-ting-home",
  樂嶺軒: "sierra-terrace",
  "Miami Quay I": "miami-quay-i",
  柏傲莊I: "pavilia-farm-i",
  柏傲莊II: "pavilia-farm-ii",
  華富北邨: "wah-fu-north",
  首匯: "chester-hung-hom",
  首岸: "one-victoria-cove",
  "YOHO West": "yoho-west",
  "The Monet": "the-monet",
  博峯: "mount-broadcast",
  錦河邨: "kam-ho-estate",
  漁映樓: "yue-ying-lau",
  瑜一: "in-one",
  揚海: "la-marina",
  晉環: "la-splendeur",
  飛揚: "grand-jete",
  凱和山: "mori-so-kwun-wat",
  蔚藍東岸: "montego-bay",
  華景山莊: "wonderland-villas",
  偉景花園: "broadview-garden",
  高禮閣: "ko-lai-house",
  高賢閣: "ko-yin-house",
  樂啟軒: "delight-terrace",
  清濤苑: "ching-tao-court",
  高宏苑: "ko-wang-court",
  兆翠苑: "siu-chui-court",
  祈德尊新邨: "clague-garden",
  啟悅苑: "kai-yuet-court",
  華富中邨: "wah-fu-central",
  麗玥苑: "lai-yuet-court",
  皇都: "state-pavilia",
  柏蔚森: "the-pavilia-forest",
  尚逸: "des-voeux-w",
  泓璟: "one-liberty",
  恒苑: "hang-yuen-cheung-chau",
  滶晨: "deep-water-pavilia",
  朗賢峯: "onmantin",
  峻譽渣甸山: "jardini",
  "One Stanley": "one-stanley",
  "Mount Pokfulam": "mount-pokfulam",
  海璇: "victoria-harbour-north-point",
  皇璇: "state-residence",
  "滿．意": "one-toscana",
  太子道西233號: "233-prince-edward-road-west",
  灝然: "hao-yin",
  朗然: "hemma-amber",
  叡璟: "the-sterling",
  PORTO: "porto-ap-lei-chau",
  "Deep Water South": "deep-water-south",
  海富苑: "hoi-fu-court",
  海泰閣: "hoi-tai-house",
  茶果嶺村: "cha-kwo-ling-village",
  鯉魚門村: "lei-yue-mun-village",
  三家村: "sam-ka-tsuen",
  俊宏軒: "grandeur-terrace",
  慧景軒: "vianni-cove",
  栢慧豪園: "central-park-towers",
  雅寧苑: "nga-ning-court",
  高翔苑: "ko-cheung-court",
  峻然: "hemma-emerald",
  聚然: "hemma-fab",
  樂啟樓: "delight-tower",
  樂真樓: "lok-chun-lau",
  欣雅苑: "yan-nga-court",
  曉雅苑: "hiu-nga-court",
  安秀苑: "on-sau-court",
  安柏苑: "on-pak-court",
  冠山苑: "koon-shan-court",
  昭明苑: "chiu-ming-court",
  啟欣苑: "kai-yan-court",
  啟鑽苑: "kai-chuen-court",
  鯉安苑: "lei-on-court",
  駿發花園: "prosperous-garden",
  翠塘花園: "lakeside-garden",
  寶石大廈: "bo-shek-mansion",
  傲玟: "grand-homm",
  維港滙: "grand-victoria",
  青怡花園: "tsing-yi-garden",
  恒莆新苑: "hang-po-court",
  路德會雙魚薈: "elchk-pisces",
  新田部屋: "san-tin-residence",
  路德會七星薈: "elchk-seven-stars",
  悅安居: "yuet-on-residence",
  善樓: "the-good-house",
  樂善村: "lok-sin-village",
  恒攸新苑: "hang-yau-court",
  博愛昇平村: "pok-oi-sing-ping",
  光廈: "light-house-yau-tong",
  流浮東寓: "lau-fau-tung-yu",
  華第: "cadenza-sheung-shui",
  尚柏: "the-parkland-yuen-long",
  連方: "bondlane",
  吉喆: "33-catchick-street",
  "THE BOUNDARY": "the-boundary",
  名鑽: "diamond-ho-man-tin",
  "Upper Central": "upper-central",
  "One Wood Road": "one-wood-road",
  "Elize Park": "elize-park",
  恒珀: "hang-park-cheung-sha-wan",
  隆敍: "lung-hsu-ho-man-tin",
  北都滙: "northern-hub-kwu-tung",
  "33清水灣": "33-clear-water-bay",
  "Victoria Blossom": "victoria-blossom",
  映匯: "hung-hom-the-hampton",
  瑜意: "zendo-house",
  薈淳: "connext",
  "One Innovale": "one-innovale",
  雲向: "cloudview",
  滶蘊: "pavilia-rosa",
  海瑅灣: "la-mirabelle",
  "Palo Springs": "palo-springs",
  映居: "tai-kok-tsui-ying-kui",
  芊御: "garden-regency",
  瑧玥: "grand-austin-bohemian",
  南灣苑: "nam-wan-court",
  澐璟: "pano-harbour",
  擎海: "king-hoi-yau-tong",
  凱柏峰: "hoi-pak-fung",
  曉柏峰: "the-paddington",
  "KOKO Reserve": "koko-reserve",
  順利邨道簡約公屋: "shun-lee-tsuen-road-lph",
  竹園道簡約公屋: "chuk-yuen-road-lph",
  柏瓏: "grand-mayfair",
  "UNI Residence": "uni-residence",
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

export function estateHousingLabel(housing: Housing, locale: Locale = "zh"): string {
  if (locale === "en") return MESSAGES.en[HOUSING_MESSAGE[housing]];
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

function fillMessage(locale: Locale, key: MessageKey, vars: Record<string, string | number>) {
  return (MESSAGES[locale][key] ?? MESSAGES.zh[key]).replace(
    /\{(\w+)\}/g,
    (_, name: string) => String(vars[name] ?? `{${name}}`),
  );
}

export function estatePageTitle(estate: Estate, locale: Locale = "zh"): string {
  return fillMessage(locale, "estateTitle", {
    name: estateDisplayName(estate, locale),
    housing: estateHousingLabel(estate.housing, locale),
  });
}

export function estateIntro(estate: Estate, locale: Locale = "zh"): string {
  const name = estateDisplayName(estate, locale);
  const district = placeDisplayName(estate.district, locale);
  const area = estate.area ? placeDisplayName(estate.area, locale) : "";
  const place = area ? (locale === "en" ? `${district} (${area})` : `${district}（${area}）`) : district;
  const street = estate.street ? (locale === "en" ? `${estate.street}, ` : `${estate.street}，`) : "";
  const check = estate.coverageCheck ? MESSAGES[locale].estateIntroCoverageCheck : "";
  return fillMessage(locale, "estateIntroText", {
    name,
    street,
    place,
    housing: estateHousingLabel(estate.housing, locale),
    check,
  }).replace(/\s+/g, " ");
}

export function estatePlans(estate: Estate): { broadband: Plan[]; home5g: Plan[] } {
  return {
    broadband: filterPlans({ cat: "broadband", housing: estate.housing, estate: estate.name }),
    home5g: filterPlans({ cat: "home5g", housing: estate.housing, estate: estate.name }),
  };
}

/**
 * Estates whose listed broadband / home5g cards differ from the generic 樓類
 * catalogue: exclusive `onlyEstates` offers, or a provider lock such as 上然.
 * Related 座／樓／閣 stay on the site but are omitted from the sitemap unless
 * they themselves appear in `onlyEstates`. Built from those lists so sitemap
 * generation does not call `estatePlans` once per catalogue row.
 */
function indexableEstateNames(): Set<string> {
  const names = new Set<string>();
  for (const plan of PLANS) {
    if (plan.staffOffer) continue;
    if (plan.category !== "broadband" && plan.category !== "home5g") continue;
    if (!plan.onlyEstates?.length) continue;
    for (const name of plan.onlyEstates) {
      const estate = ESTATES.find((item) => item.name === name);
      if (estate && !matchesHousing(plan, estate.housing)) continue;
      names.add(name);
    }
  }
  for (const seed of NETVIGATOR_ONLY_ESTATES) {
    if (ESTATES.some((item) => item.name === seed)) names.add(seed);
  }
  return names;
}

const INDEXABLE_ESTATE_NAMES = indexableEstateNames();

/**
 * Sitemap / indexable estate pages.
 *
 * Indexed when either:
 * 1. First-batch flagship estates (`ESTATE_PAGE_NAMES`) — unique name, district
 *    and housing copy, linked from homepage 熱門. These are not doorway pages.
 * 2. The estate lists broadband / home5g cards that differ from the generic
 *    樓類 catalogue (exclusive `onlyEstates` offers or a provider lock).
 *
 * Related 座／樓／閣 stay on the site but stay noindex unless they themselves
 * appear in `onlyEstates`. Other generic catalogue rows stay noindex so Google
 * does not see 1,800 near-duplicate 樓類 templates.
 */
export function isIndexableEstatePage(page: EstatePage): boolean {
  if (parentEstate(page.estate)) return false;
  if ((ESTATE_PAGE_NAMES as readonly string[]).includes(page.estate.name)) return true;
  return INDEXABLE_ESTATE_NAMES.has(page.estate.name);
}

export const INDEXABLE_ESTATE_PAGES: readonly EstatePage[] = ESTATE_PAGES.filter(isIndexableEstatePage);

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
