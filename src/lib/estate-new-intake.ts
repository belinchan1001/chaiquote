/** Newest move-in estates, grouped to match the 屋苑比較頁 category. */
import { compact, ESTATES, isRelatedBlock, matchKnownEstate, relatedBlocks } from "./estates.ts";
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
] as const;

const NEW_INTAKE_PARENTS = ESTATES.filter((estate) => NEW_INTAKE_NAMES.has(estate.name));
const NEW_INTAKE_BLOCK_NAMES = new Set<string>();
for (const parent of NEW_INTAKE_PARENTS) {
  NEW_INTAKE_BLOCK_NAMES.add(parent.name);
  for (const child of relatedBlocks(parent)) NEW_INTAKE_BLOCK_NAMES.add(child.name);
}

export function isNewIntakeEstate(name: string): boolean {
  return NEW_INTAKE_BLOCK_NAMES.has(name);
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
