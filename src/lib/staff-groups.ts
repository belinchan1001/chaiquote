import type { ProviderId } from "./plans.ts";

export const STAFF_GROUP_IDS = [
  "hkt",
  "hkbn",
  "cmhk",
  "smartone",
  "three",
  "hgc",
  "icable",
] as const;

export type StaffGroupId = (typeof STAFF_GROUP_IDS)[number];
export type StaffRole = "owner" | "editor";
export type StaffStatus = "invited" | "active" | "disabled";

export const STAFF_GROUPS: {
  id: StaffGroupId;
  label: string;
  providers: ProviderId[];
}[] = [
  { id: "hkt", label: "HKT（網上行 / csl. / CSL 5G 家居）", providers: ["netvigator", "csl"] },
  { id: "hkbn", label: "香港寬頻", providers: ["hkbn"] },
  { id: "cmhk", label: "中國移動香港", providers: ["cmhk"] },
  { id: "smartone", label: "數碼通", providers: ["smartone"] },
  { id: "three", label: "3香港", providers: ["three"] },
  { id: "hgc", label: "HGC 寬頻", providers: ["hgc"] },
  { id: "icable", label: "有線寬頻", providers: ["icable"] },
];

export const STAFF_GROUP_MAP = Object.fromEntries(STAFF_GROUPS.map((g) => [g.id, g])) as Record<
  StaffGroupId,
  (typeof STAFF_GROUPS)[number]
>;

export function isStaffGroupId(value: string): value is StaffGroupId {
  return (STAFF_GROUP_IDS as readonly string[]).includes(value);
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function providersForGroup(groupId: StaffGroupId): ProviderId[] {
  return STAFF_GROUP_MAP[groupId].providers;
}

export function groupOwnsProvider(groupId: StaffGroupId, providerId: ProviderId) {
  return STAFF_GROUP_MAP[groupId].providers.includes(providerId);
}
