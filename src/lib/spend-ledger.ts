export const SPEND_STORAGE_KEY = "chaiquote-spend-ledger-v2";
const LEGACY_STORAGE_KEY = "chaiquote-spend-ledger-v1";

export const SPEND_KINDS = ["broadband", "home5g", "mobile", "paytv", "ott", "other"] as const;
export type SpendKind = (typeof SPEND_KINDS)[number];

export const SPEED_PRESETS = ["under1000", "1000", "2500", "custom"] as const;
export type SpeedPreset = (typeof SPEED_PRESETS)[number];

export type SpendItem = {
  id: string;
  kind: SpendKind;
  provider: string;
  name: string;
  monthly: number;
  startDate: string;
  endDate: string;
  note: string;
  speedPreset: SpeedPreset | "";
  speedCustom: string;
};

export const SPEND_KIND_LABEL = {
  zh: {
    broadband: "寬頻",
    home5g: "5G 家居",
    mobile: "手機",
    paytv: "收費電視",
    ott: "OTT／串流",
    other: "其他",
  },
  en: {
    broadband: "Broadband",
    home5g: "Home 5G",
    mobile: "Mobile",
    paytv: "Pay TV",
    ott: "OTT / streaming",
    other: "Other",
  },
} as const;

export const SPEED_PRESET_LABEL = {
  zh: {
    under1000: "1000M 以下",
    "1000": "1000M",
    "2500": "2500M",
    custom: "自行輸入",
  },
  en: {
    under1000: "Under 1000M",
    "1000": "1000M",
    "2500": "2500M",
    custom: "Custom",
  },
} as const;

export const OTHER_PROVIDER = "其他";

export const SPEND_PROVIDERS: Record<SpendKind, readonly string[]> = {
  broadband: ["香港寬頻", "網上行", "數碼通", "中國移動香港", "有線寬頻", "HGC 寬頻"],
  home5g: ["香港寬頻", "網上行", "數碼通", "中國移動香港", "3香港", "csl."],
  mobile: ["csl.", "數碼通", "中國移動香港", "3香港", "香港寬頻"],
  paytv: ["Now TV", "有線電視", "myTV SUPER"],
  ott: ["Netflix", "Disney+", "HBO Max", "愛奇藝", "weTV", "myTV SUPER"],
  other: ["香港寬頻", "網上行", "數碼通", "中國移動香港", "3香港", "csl.", "有線寬頻"],
};

export function newSpendId(): string {
  return `sp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function isSpendKind(value: unknown): value is SpendKind {
  return SPEND_KINDS.includes(value as SpendKind);
}

export function isSpeedPreset(value: unknown): value is SpeedPreset {
  return SPEED_PRESETS.includes(value as SpeedPreset);
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

export function speedLabel(item: Pick<SpendItem, "speedPreset" | "speedCustom">, lang: "zh" | "en"): string {
  if (item.speedPreset === "custom") return item.speedCustom.trim();
  if (item.speedPreset && item.speedPreset in SPEED_PRESET_LABEL[lang]) {
    return SPEED_PRESET_LABEL[lang][item.speedPreset];
  }
  return "";
}

export function normalizeItem(raw: Partial<SpendItem> & { id?: string }): SpendItem {
  const kind = isSpendKind(raw.kind) ? raw.kind : "other";
  const speedPreset = kind === "broadband" && isSpeedPreset(raw.speedPreset) ? raw.speedPreset : "";
  return {
    id: String(raw.id || newSpendId()),
    kind,
    provider: String(raw.provider ?? "").trim().slice(0, 40),
    name: String(raw.name ?? "").trim().slice(0, 60),
    monthly: parseMoney(raw.monthly),
    startDate: isIsoDate(String(raw.startDate ?? "")) ? String(raw.startDate) : "",
    endDate: isIsoDate(String(raw.endDate ?? "")) ? String(raw.endDate) : "",
    note: String(raw.note ?? "").trim().slice(0, 120),
    speedPreset,
    speedCustom: speedPreset === "custom" ? String(raw.speedCustom ?? "").trim().slice(0, 20) : "",
  };
}

function parseList(raw: string | null): SpendItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row) => normalizeItem(row as Partial<SpendItem>));
  } catch {
    return [];
  }
}

export function readSpendLedger(storage: Pick<Storage, "getItem"> | null | undefined): SpendItem[] {
  if (!storage) return [];
  const current = parseList(storage.getItem(SPEND_STORAGE_KEY));
  if (current.length) return current;
  return parseList(storage.getItem(LEGACY_STORAGE_KEY));
}

export function writeSpendLedger(
  storage: Pick<Storage, "setItem"> | null | undefined,
  items: readonly SpendItem[],
): void {
  if (!storage) return;
  storage.setItem(SPEND_STORAGE_KEY, JSON.stringify(items.map((item) => normalizeItem(item))));
}
