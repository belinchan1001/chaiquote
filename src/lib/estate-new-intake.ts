/** Newest move-in estates, grouped to match the 屋苑比較頁 category. */
import { compact, ESTATES, isRelatedBlock, matchKnownEstate, relatedBlocks, type Estate } from "./estates.ts";
export const NEW_INTAKE: { name: string; group: string }[] = [
  { name: "雋東邨", group: "東涌" },
  { name: "翔東邨", group: "東涌" },
  { name: "裕興苑", group: "東涌" },
  { name: "錦柏苑", group: "馬鞍山" },
  { name: "恆光街項目", group: "馬鞍山" },
  { name: "青福里項目", group: "屯門" },
  { name: "欣寶路項目", group: "屯門" },
  { name: "滿田邨", group: "屯門" },
  { name: "鴻鵠臺", group: "九龍" },
  { name: "柏傲莊III", group: "新界" },
  { name: "101 Kings Road", group: "港島" },
  { name: "Belgravia Place I", group: "九龍" },
  { name: "Blue Coast I & II", group: "港島" },
  { name: "Finnie", group: "港島" },
  { name: "Miami Quay II", group: "九龍" },
  { name: "One Central Place", group: "港島" },
  { name: "Spring Garden", group: "港島" },
  { name: "The Haddon", group: "九龍" },
  { name: "安樺苑", group: "九龍" },
  { name: "安麗苑", group: "九龍" },
  { name: "樂翹都匯", group: "新界" },
  { name: "樂嶺都匯", group: "新界" },
  { name: "盛緻苑", group: "九龍" },
  { name: "啟盈苑", group: "九龍" },
  { name: "朗天苑", group: "新界" },
  { name: "朗日峰", group: "新界" },
  { name: "朗天峰", group: "新界" },
  { name: "日出康城第12期", group: "新界" },
  { name: "古雋邨", group: "其他地區" },
  { name: "鳳凰嶺邨", group: "其他地區" },
  { name: "曉茵邨", group: "其他地區" },
  { name: "世運道簡約公屋", group: "其他地區" },
  { name: "柴灣常安街簡約公屋", group: "其他地區" },
  { name: "宏緻苑", group: "其他地區" },
  { name: "彩石邨", group: "其他地區" },
  { name: "安楹苑", group: "其他地區" },
  { name: "上然", group: "大埔" },
  { name: "富蝶邨", group: "大埔" },
  { name: "攸壆路簡約公屋", group: "新界" },
  { name: "彩興路簡約公屋", group: "九龍" },
  { name: "彩園路簡約公屋", group: "新界" },
  { name: "順安道簡約公屋", group: "九龍" },
  { name: "彩石里簡約公屋", group: "九龍" },
  { name: "青發街簡約公屋", group: "屯門" },
  { name: "Sierra Sea", group: "大埔" },
  { name: "黃金海灣", group: "屯門" },
  { name: "Double Coast", group: "九龍" },
  { name: "海盈山", group: "港島" },
  { name: "YOHO West", group: "新界" },
  { name: "NOVO LAND", group: "屯門" },
  { name: "傲華", group: "港島" },
  { name: "滙都", group: "新界" },
  { name: "維港雙鑽", group: "九龍" },
  { name: "天璽海", group: "九龍" },
  { name: "天璽天", group: "九龍" },
  { name: "啟德海灣", group: "九龍" },
  { name: "壹沐", group: "九龍" },
  { name: "應天", group: "港島" },
  { name: "璟南", group: "港島" },
  { name: "Beacon Peak", group: "九龍" },
  { name: "尚岸", group: "屯門" },
  { name: "維港灣畔", group: "九龍" },
  { name: "海德園", group: "港島" },
  { name: "業旺邨", group: "屯門" },
  { name: "顯發邨", group: "屯門" },
  { name: "邑庭居", group: "新界" },
  { name: "樂嶺軒", group: "新界" },
  { name: "盛頤居", group: "新界" },
  { name: "Miami Quay I", group: "九龍" },
  { name: "首匯", group: "九龍" },
  { name: "首岸", group: "九龍" },
  { name: "高宏苑", group: "九龍" },
  { name: "清濤苑", group: "其他地區" },
  { name: "The Monet", group: "九龍" },
  { name: "博峯", group: "九龍" },
  { name: "漁映樓", group: "港島" },
  { name: "兆翠苑", group: "屯門" },
  { name: "啟悅苑", group: "九龍" },
  { name: "瑜一", group: "九龍" },
  { name: "安秀苑", group: "九龍" },
  { name: "安柏苑", group: "九龍" },
  { name: "冠山苑", group: "九龍" },
  { name: "昭明苑", group: "新界" },
  { name: "啟欣苑", group: "九龍" },
  { name: "驥華苑", group: "港島" },
  { name: "啟鑽苑", group: "九龍" },
  { name: "柏蔚森", group: "九龍" },
  { name: "尚逸", group: "港島" },
  { name: "泓璟", group: "九龍" },
  { name: "滶晨", group: "港島" },
  { name: "朗賢峯", group: "九龍" },
  { name: "峻譽渣甸山", group: "港島" },
  { name: "One Stanley", group: "港島" },
  { name: "Mount Pokfulam", group: "港島" },
  { name: "滿．意", group: "其他地區" },
  { name: "恒莆新苑", group: "新界" },
  { name: "路德會雙魚薈", group: "新界" },
  { name: "新田部屋", group: "新界" },
  { name: "路德會七星薈", group: "新界" },
  { name: "悅安居", group: "新界" },
  { name: "恒攸新苑", group: "新界" },
  { name: "流浮東寓", group: "新界" },
  { name: "善樓", group: "大埔" },
  { name: "樂善村", group: "大埔" },
  { name: "博愛昇平村", group: "其他地區" },
  { name: "光廈", group: "九龍" },
];

export const NEW_INTAKE_NAMES = new Set(NEW_INTAKE.map((item) => item.name));

/** HKBN / HGC fibre offers for public / HOS new-move-in estates (blocks inherit the parent). */
export const HKBN_INTAKE_OFFER_ESTATES = [
  "盛緻苑",
  "樂嶺都匯",
  "樂翹都匯",
  "安麗苑",
  "安樺苑",
  "宏緻苑",
  "滿田邨",
  "古雋邨",
  "鳳凰嶺邨",
  "曉茵邨",
  "世運道簡約公屋",
  "柴灣常安街簡約公屋",
  "彩石邨",
  "安楹苑",
  "翔東邨",
  "裕興苑",
  "錦柏苑",
  "恆光街項目",
  "青福里項目",
  "欣寶路項目",
  "雋東邨",
  "鴻鵠臺",
  "啟盈苑",
  "朗天苑",
  "綠置居",
  "攸壆路簡約公屋",
  "彩興路簡約公屋",
  "彩園路簡約公屋",
  "順安道簡約公屋",
  "彩石里簡約公屋",
  "青發街簡約公屋",
  "漁映樓",
  "兆翠苑",
  "高宏苑",
  "清濤苑",
  "樂嶺軒",
  "啟悅苑",
  "安秀苑",
  "安柏苑",
  "冠山苑",
  "昭明苑",
  "啟欣苑",
  "驥華苑",
  "啟鑽苑",
] as const;

/** Netvigator fibre for a subset of new-move-in estates (blocks inherit the parent). */
export const NETVIGATOR_INTAKE_OFFER_ESTATES = [
  "盛緻苑",
  "樂嶺都匯",
  "宏緻苑",
  "滿田邨",
  "鳳凰嶺邨",
  "曉茵邨",
  "世運道簡約公屋",
  "柴灣常安街簡約公屋",
  "綠置居",
  "彩石邨",
  "裕興苑",
  "錦柏苑",
  "欣寶路項目",
  "漁映樓",
  "兆翠苑",
  "高宏苑",
  "清濤苑",
  "啟悅苑",
  "安秀苑",
  "安柏苑",
  "啟欣苑",
  "啟鑽苑",
] as const;

/** Fibre coverage currently Netvigator-only; blocks inherit the parent. */
export const NETVIGATOR_ONLY_ESTATES = ["上然"] as const;

/** HKBN flash fibre for listed estates only. 白田邨 is excluded. */
export const HKBN_FLASH_OFFER_ESTATES = [
  "寶庭居",
  "賢庭居",
  "仁愛居",
  "樂翹樓",
  "錦暉苑",
  "長沙灣邨",
  "康東邨",
  "連翠邨",
  "洪福邨",
  "滿東邨",
  "銀灣邨",
  "常樂邨",
  "東匯邨",
  "寶田邨",
  "啟福居",
] as const;

/** HKBN flash fibre for listed LPR estates (public / HOS / private). */
export const HKBN_LPR_FLASH_ESTATES = [
  "安泰邨",
  "榮昌邨",
  "美盈苑",
  "宏富苑",
  "藍澄灣",
  "逸瓏園",
  "翠怡花園",
  "樂嘉中心",
  "逸意居",
  "帝景灣",
  "彩頤居",
] as const;

const NEW_INTAKE_PARENTS = ESTATES.filter((estate) => NEW_INTAKE_NAMES.has(estate.name));
const NEW_INTAKE_BLOCK_NAMES = new Set<string>();

function intakeBlocksOf(parent: Estate): Estate[] {
  const related = relatedBlocks(parent);
  const parentKey = compact(parent.name);
  if (parentKey.length < 2) return related;
  const extra = ESTATES.filter((child) => {
    if (child.name === parent.name) return false;
    if (related.some((item) => item.name === child.name)) return false;
    return [child.name, ...child.aliases].some((raw) => {
      const needle = compact(raw);
      if (!needle.startsWith(parentKey) || needle === parentKey) return false;
      const rest = needle.slice(parentKey.length);
      return rest.length >= 1 && /[座樓閣期]|tower|block|phase/.test(rest);
    });
  });
  return extra.length ? [...related, ...extra] : related;
}

for (const parent of NEW_INTAKE_PARENTS) {
  NEW_INTAKE_BLOCK_NAMES.add(parent.name);
  for (const child of intakeBlocksOf(parent)) NEW_INTAKE_BLOCK_NAMES.add(child.name);
}

export function isNewIntakeEstate(name: string): boolean {
  return NEW_INTAKE_BLOCK_NAMES.has(name);
}

const NETVIGATOR_ONLY_NAMES = new Set<string>();
for (const name of NETVIGATOR_ONLY_ESTATES) {
  NETVIGATOR_ONLY_NAMES.add(name);
  const parent = ESTATES.find((item) => item.name === name);
  if (parent) for (const child of intakeBlocksOf(parent)) NETVIGATOR_ONLY_NAMES.add(child.name);
}

/** True when the address is 上然 or one of its 座. */
export function isNetvigatorOnlyEstate(query?: string): boolean {
  if (!query?.trim()) return false;
  const known = matchKnownEstate(query);
  if (known) return NETVIGATOR_ONLY_NAMES.has(known.name);
  return NETVIGATOR_ONLY_NAMES.has(query.trim());
}

export function isHkbnFlashEstate(query?: string): boolean {
  return (
    estateUnlocksPlan(query, HKBN_FLASH_OFFER_ESTATES) ||
    estateUnlocksPlan(query, HKBN_LPR_FLASH_ESTATES)
  );
}

export function newIntakeGroups<T extends { estate: { name: string } }>(
  pages: readonly T[],
): { district: string; pages: T[] }[] {
  const byName = new Map(pages.map((page) => [page.estate.name, page]));
  const byGroup = new Map<string, T[]>();
  const order: string[] = [];
  for (const item of NEW_INTAKE) {
    const page = byName.get(item.name);
    if (!page) continue;
    if (!byGroup.has(item.group)) {
      order.push(item.group);
      byGroup.set(item.group, []);
    }
    byGroup.get(item.group)!.push(page);
  }
  return order.map((district) => ({ district, pages: byGroup.get(district) ?? [] }));
}

function isAllowedEstate(estateName: string, allowed: Set<string>): boolean {
  if (allowed.has(estateName)) return true;
  const child = ESTATES.find((item) => item.name === estateName);
  if (!child) return false;
  for (const parentName of allowed) {
    const parent = ESTATES.find((item) => item.name === parentName);
    if (parent && isRelatedBlock(child, parent)) return true;
  }
  return false;
}

/** Hidden fibre offers stay hidden until the query matches a listed new-move-in estate or its 座／樓／閣. */
export function estateUnlocksPlan(estateQuery: string | undefined, onlyEstates: readonly string[]): boolean {
  if (!onlyEstates.length) return true;
  const raw = estateQuery?.trim();
  if (!raw) return false;
  const allowed = new Set(onlyEstates);
  const known = matchKnownEstate(raw);
  if (known && isAllowedEstate(known.name, allowed)) return true;
  const q = compact(raw);
  if (q.length < 3) return false;
  if (onlyEstates.some((name) => {
    const n = compact(name);
    return q === n || q.startsWith(n) || n.startsWith(q);
  })) {
    return true;
  }
  for (const parentName of onlyEstates) {
    for (const child of relatedBlocks(parentName)) {
      const n = compact(child.name);
      if (q === n || q.startsWith(n) || n.startsWith(q)) return true;
      if (child.aliases.some((alias) => compact(alias) === q || q.startsWith(compact(alias)))) return true;
    }
  }
  return false;
}
