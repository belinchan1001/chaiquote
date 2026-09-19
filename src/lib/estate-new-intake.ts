import { compact, ESTATES, isRelatedBlock, matchKnownEstate, relatedBlocks, type Estate } from "./estates.ts";
export {
  NEW_INTAKE,
  NEW_INTAKE_NAMES,
  HKBN_INTAKE_OFFER_ESTATES,
  NETVIGATOR_INTAKE_OFFER_ESTATES,
  NETVIGATOR_ONLY_ESTATES,
  HKBN_FLASH_OFFER_ESTATES,
  HKBN_LPR_FLASH_ESTATES,
} from "./estate-new-intake-names.ts";
import { NEW_INTAKE, NEW_INTAKE_NAMES, NETVIGATOR_ONLY_ESTATES, HKBN_FLASH_OFFER_ESTATES, HKBN_LPR_FLASH_ESTATES } from "./estate-new-intake-names.ts";

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
