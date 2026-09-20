export const SPEND_STORAGE_KEY = "chaiquote-spend-ledger-v1";

export const SPEND_KINDS = ["broadband", "home5g", "mobile", "ott", "other"] as const;
export type SpendKind = (typeof SPEND_KINDS)[number];

export type SpendItem = {
  id: string;
  kind: SpendKind;
  provider: string;
  name: string;
  monthly: number;
  startDate: string;
  endDate: string;
  note: string;
};

export const SPEND_KIND_LABEL = {
  zh: {
    broadband: "寬頻",
    home5g: "5G 家居",
    mobile: "手機",
    ott: "OTT／串流",
    other: "其他",
  },
  en: {
    broadband: "Broadband",
    home5g: "Home 5G",
    mobile: "Mobile",
    ott: "OTT / streaming",
    other: "Other",
  },
} as const;

export function newSpendId(): string {
  return `sp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function isSpendKind(value: unknown): value is SpendKind {
  return SPEND_KINDS.includes(value as SpendKind);
}

export function parseMoney(value: unknown): number {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function todayIso(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysUntil(isoDate: string, today = todayIso()): number | null {
  if (!isIsoDate(isoDate) || !isIsoDate(today)) return null;
  const a = Date.parse(`${isoDate}T00:00:00`);
  const b = Date.parse(`${today}T00:00:00`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((a - b) / 86400000);
}

export function monthlyTotal(items: readonly SpendItem[]): number {
  return items.reduce((sum, item) => sum + item.monthly, 0);
}

export function soonestExpiry(items: readonly SpendItem[], today = todayIso()): SpendItem | null {
  const dated = items.filter((item) => isIsoDate(item.endDate));
  if (!dated.length) return null;
  return [...dated].sort((a, b) => {
    const da = daysUntil(a.endDate, today) ?? 99999;
    const db = daysUntil(b.endDate, today) ?? 99999;
    return da - db;
  })[0]!;
}

export function normalizeItem(raw: Partial<SpendItem> & { id?: string }): SpendItem {
  return {
    id: String(raw.id || newSpendId()),
    kind: isSpendKind(raw.kind) ? raw.kind : "other",
    provider: String(raw.provider ?? "").trim().slice(0, 40),
    name: String(raw.name ?? "").trim().slice(0, 60),
    monthly: parseMoney(raw.monthly),
    startDate: isIsoDate(String(raw.startDate ?? "")) ? String(raw.startDate) : "",
    endDate: isIsoDate(String(raw.endDate ?? "")) ? String(raw.endDate) : "",
    note: String(raw.note ?? "").trim().slice(0, 120),
  };
}

export function readSpendLedger(storage: Pick<Storage, "getItem"> | null | undefined): SpendItem[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(SPEND_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row) => normalizeItem(row as Partial<SpendItem>));
  } catch {
    return [];
  }
}

export function writeSpendLedger(
  storage: Pick<Storage, "setItem"> | null | undefined,
  items: readonly SpendItem[],
): void {
  if (!storage) return;
  storage.setItem(SPEND_STORAGE_KEY, JSON.stringify(items.map((item) => normalizeItem(item))));
}
