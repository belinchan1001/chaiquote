import { CATEGORY_LABEL, HOUSING_LABEL, PROVIDERS, PROVIDER_MAP, getPlan, type Category, type Housing, type ProviderId } from "./plans.ts";

/** Rows pulled into one report. Above this, the breakdown uses the newest clicks only. */
export const WA_CLICK_REPORT_ROW_CAP = 20_000;
/** Inclusive Hong Kong dates. A quarter is enough for a weekly ops export. */
export const WA_CLICK_RANGE_MAX_DAYS = 93;

const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

const SOURCE_LABEL: Record<string, string> = {
  home: "首頁",
  plans: "計劃列表",
  plan_card: "計劃卡",
  plan_detail: "計劃詳情",
  compare: "比較",
  quote: "報價",
  quote_link: "報價連結",
  widget: "右下角對話",
  header: "頁頭",
  footer: "頁尾",
  ai_staff: "AI 顧問",
  guide: "攻略",
  estate: "屋苑",
  about: "關於",
  privacy: "私隱",
};

const PROVIDER_ALIASES = new Map<string, ProviderId>();

function addProviderAlias(alias: string, id: ProviderId) {
  const trimmed = alias.trim();
  if (!trimmed) return;
  PROVIDER_ALIASES.set(trimmed, id);
  PROVIDER_ALIASES.set(trimmed.toLowerCase(), id);
}

for (const provider of PROVIDERS) {
  addProviderAlias(provider.id, provider.id);
  addProviderAlias(provider.name, provider.id);
  addProviderAlias(provider.nameEn, provider.id);
}
addProviderAlias("中國移動", "cmhk");
addProviderAlias("有線", "icable");
addProviderAlias("3HK", "three");
addProviderAlias("3香港", "three");

export type WaClickEvent = {
  created_at: string | Date;
  event_name: string;
  plan_id?: string | null;
  provider_id?: string | null;
  category?: string | null;
  source?: string | null;
  extra?: Record<string, unknown> | string | null;
};

export type WaClickProviderCount = {
  providerId: string;
  label: string;
  count: number;
};

export type WaClickDetail = {
  day: string;
  providerId: string;
  providerLabel: string;
  planId: string;
  source: string;
  sourceLabel: string;
  category: string;
  categoryLabel: string;
  housing: string;
  housingLabel: string;
  count: number;
};

export type WaClickReport = {
  from: string;
  until: string;
  /** Clicks included in the breakdown. */
  total: number;
  /** Clicks stored in the range. Larger than `total` when the fetch cap truncates. */
  matched: number;
  truncated: boolean;
  byProvider: (WaClickProviderCount & { share: number })[];
  byDay: { day: string; count: number; providers: WaClickProviderCount[] }[];
  byPlan: { planId: string; providerId: string; providerLabel: string; count: number }[];
  bySource: { source: string; label: string; count: number }[];
  byCategory: { category: string; label: string; count: number }[];
  byHousing: { housing: string; label: string; count: number }[];
  details: WaClickDetail[];
};

export function canonicalProviderId(value: unknown): ProviderId | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 40) return null;
  return PROVIDER_ALIASES.get(trimmed) ?? PROVIDER_ALIASES.get(trimmed.toLowerCase()) ?? null;
}

export function waClickProviderLabel(id: string): string {
  if (!id || id === "unknown") return "未標示";
  return PROVIDER_MAP[id as ProviderId]?.name ?? id;
}

export function readEventExtra(extra: unknown): Record<string, unknown> {
  if (!extra) return {};
  if (typeof extra === "string") {
    try {
      const parsed = JSON.parse(extra) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    } catch {
      return {};
    }
    return {};
  }
  if (typeof extra === "object" && !Array.isArray(extra)) return extra as Record<string, unknown>;
  return {};
}

function extraString(extra: Record<string, unknown>, key: string): string {
  const value = extra[key];
  return typeof value === "string" ? value.trim() : "";
}

/** Calendar day in Asia/Hong_Kong. Accepts ISO strings and Postgres timestamptz text. */
export function hongKongYmdFromTimestamp(value: unknown): string {
  let text = value instanceof Date ? value.toISOString() : String(value ?? "").trim();
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2} /.test(text)) text = `${text.slice(0, 10)}T${text.slice(11)}`;
  text = text.replace(/([+-]\d{2})$/, "$1:00");
  text = text.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addHongKongYmd(ymd: string, days: number): string {
  const match = YMD.exec(ymd);
  if (!match) return ymd;
  const utc = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days));
  return utc.toISOString().slice(0, 10);
}

function isRealYmd(ymd: string): boolean {
  const match = YMD.exec(ymd);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day;
}

export function inclusiveYmdSpan(from: string, until: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${until}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000) + 1;
}

export function defaultWaClickRange(now = new Date()): { from: string; until: string } {
  const until = hongKongYmdFromTimestamp(now.toISOString());
  return { from: addHongKongYmd(until, -6), until };
}

export function waClickPresetRange(preset: "7d" | "today" | "yesterday", now = new Date()): { from: string; until: string } {
  const today = defaultWaClickRange(now).until;
  if (preset === "today") return { from: today, until: today };
  if (preset === "yesterday") {
    const day = addHongKongYmd(today, -1);
    return { from: day, until: day };
  }
  return defaultWaClickRange(now);
}

export function parseWaClickRange(
  from: string,
  until: string,
):
  | { ok: true; from: string; until: string; fromIso: string; untilIso: string }
  | { ok: false; reason: "bad-date" | "range" | "too-long" } {
  const start = from.trim();
  const end = until.trim();
  if (!isRealYmd(start) || !isRealYmd(end)) return { ok: false, reason: "bad-date" };
  if (start > end) return { ok: false, reason: "range" };
  if (inclusiveYmdSpan(start, end) > WA_CLICK_RANGE_MAX_DAYS) return { ok: false, reason: "too-long" };
  return {
    ok: true,
    from: start,
    until: end,
    fromIso: `${start}T00:00:00+08:00`,
    untilIso: `${end}T23:59:59.999+08:00`,
  };
}

export function waClickReportError(reason: string): string {
  switch (reason) {
    case "no-token":
      return "未設定 INTEREST_TOKEN 或 STATS_TOKEN。請喺部署環境加同一條鎖匙。";
    case "bad-token":
      return "鎖匙不正確。";
    case "bad-date":
      return "日期格式要係 YYYY-MM-DD。";
    case "range":
      return "開始日期不可遲過結束日期。";
    case "too-long":
      return "日期範圍最多 93 日。";
    default:
      return "查詢失敗，請稍後再試。";
  }
}

function categoryKey(row: WaClickEvent, extra: Record<string, unknown>): string {
  const raw = (row.category ?? "").trim() || extraString(extra, "cat");
  return raw;
}

function categoryLabel(id: string): string {
  if (!id) return "未標示";
  return CATEGORY_LABEL[id as Category] ?? id;
}

function housingKey(extra: Record<string, unknown>): string {
  return extraString(extra, "housing");
}

function housingLabel(id: string): string {
  if (!id) return "";
  return HOUSING_LABEL[id as Housing] ?? id;
}

function sourceKey(row: WaClickEvent): string {
  return (row.source ?? "").trim();
}

function sourceLabel(id: string): string {
  if (!id) return "未標示";
  return SOURCE_LABEL[id] ?? id;
}

export function waClickProviderId(row: WaClickEvent): string {
  const column = (row.provider_id ?? "").trim();
  if (column) return canonicalProviderId(column) ?? column.slice(0, 40);
  const extra = readEventExtra(row.extra);
  const hinted = canonicalProviderId(extraString(extra, "provider")) ?? canonicalProviderId(extraString(extra, "company"));
  if (hinted) return hinted;
  const planId = (row.plan_id ?? "").trim() || extraString(extra, "plan");
  const plan = planId ? getPlan(planId) : undefined;
  return plan?.providerId ?? "unknown";
}

function planKey(row: WaClickEvent, extra: Record<string, unknown>): string {
  return (row.plan_id ?? "").trim() || extraString(extra, "plan");
}

function shareOf(count: number, total: number): number {
  if (!total) return 0;
  return Math.round((count / total) * 1000) / 10;
}

function byCount<T extends { count: number }>(rows: T[], tie: (row: T) => string): T[] {
  return rows.sort((a, b) => b.count - a.count || tie(a).localeCompare(tie(b)));
}

export function summarizeWaClicks(rows: readonly WaClickEvent[], from: string, until: string): WaClickReport {
  const grains = new Map<string, WaClickDetail>();
  for (const row of rows) {
    if (row.event_name !== "wa_click") continue;
    const extra = readEventExtra(row.extra);
    const day = hongKongYmdFromTimestamp(row.created_at) || "unknown";
    const providerId = waClickProviderId(row);
    const planId = planKey(row, extra);
    const source = sourceKey(row);
    const category = categoryKey(row, extra);
    const housing = housingKey(extra);
    const key = [day, providerId, planId, source, category, housing].join("\0");
    const current = grains.get(key);
    if (current) {
      current.count += 1;
      continue;
    }
    grains.set(key, {
      day,
      providerId,
      providerLabel: waClickProviderLabel(providerId),
      planId,
      source,
      sourceLabel: sourceLabel(source),
      category,
      categoryLabel: categoryLabel(category),
      housing,
      housingLabel: housingLabel(housing),
      count: 1,
    });
  }

  const details = [...grains.values()].sort(
    (a, b) => a.day.localeCompare(b.day) || b.count - a.count || a.providerId.localeCompare(b.providerId),
  );
  const total = details.reduce((sum, row) => sum + row.count, 0);

  const providerMap = new Map<string, WaClickProviderCount>();
  const dayMap = new Map<string, { day: string; count: number; providers: Map<string, WaClickProviderCount> }>();
  const planMap = new Map<string, { planId: string; providerId: string; providerLabel: string; count: number }>();
  const sourceMap = new Map<string, { source: string; label: string; count: number }>();
  const categoryMap = new Map<string, { category: string; label: string; count: number }>();
  const housingMap = new Map<string, { housing: string; label: string; count: number }>();

  for (const row of details) {
    const provider = providerMap.get(row.providerId) ?? {
      providerId: row.providerId,
      label: row.providerLabel,
      count: 0,
    };
    provider.count += row.count;
    providerMap.set(row.providerId, provider);

    const day = dayMap.get(row.day) ?? { day: row.day, count: 0, providers: new Map() };
    day.count += row.count;
    const dayProvider = day.providers.get(row.providerId) ?? {
      providerId: row.providerId,
      label: row.providerLabel,
      count: 0,
    };
    dayProvider.count += row.count;
    day.providers.set(row.providerId, dayProvider);
    dayMap.set(row.day, day);

    if (row.planId) {
      const plan = planMap.get(row.planId) ?? {
        planId: row.planId,
        providerId: row.providerId,
        providerLabel: row.providerLabel,
        count: 0,
      };
      plan.count += row.count;
      planMap.set(row.planId, plan);
    }

    const sourceId = row.source || "unknown";
    const source = sourceMap.get(sourceId) ?? { source: sourceId, label: row.sourceLabel, count: 0 };
    source.count += row.count;
    sourceMap.set(sourceId, source);

    const categoryId = row.category || "unknown";
    const category = categoryMap.get(categoryId) ?? { category: categoryId, label: row.categoryLabel, count: 0 };
    category.count += row.count;
    categoryMap.set(categoryId, category);

    if (row.housing) {
      const housing = housingMap.get(row.housing) ?? { housing: row.housing, label: row.housingLabel, count: 0 };
      housing.count += row.count;
      housingMap.set(row.housing, housing);
    }
  }

  return {
    from,
    until,
    total,
    matched: total,
    truncated: false,
    byProvider: byCount([...providerMap.values()], (row) => row.label).map((row) => ({
      ...row,
      share: shareOf(row.count, total),
    })),
    byDay: [...dayMap.values()]
      .sort((a, b) => b.day.localeCompare(a.day))
      .map((day) => ({
        day: day.day,
        count: day.count,
        providers: byCount([...day.providers.values()], (row) => row.label),
      })),
    byPlan: byCount([...planMap.values()], (row) => row.planId),
    bySource: byCount([...sourceMap.values()], (row) => row.label),
    byCategory: byCount([...categoryMap.values()], (row) => row.label),
    byHousing: byCount([...housingMap.values()], (row) => row.label),
    details,
  };
}

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function csvLine(cells: (string | number)[]): string {
  return cells.map(csvCell).join(",");
}

/** One row per Hong Kong day and telecom company. */
export function waClickProviderCsv(report: WaClickReport): string {
  const lines = [csvLine(["日期", "電訊商編號", "電訊商", "點擊"])];
  const days = [...report.byDay].sort((a, b) => a.day.localeCompare(b.day));
  for (const day of days) {
    const providers = [...day.providers].sort(
      (a, b) => b.count - a.count || a.providerId.localeCompare(b.providerId),
    );
    for (const provider of providers) {
      lines.push(csvLine([day.day, provider.providerId, provider.label, provider.count]));
    }
  }
  return `\uFEFF${lines.join("\n")}\n`;
}

/** Optional grain: plan, source, category, and housing inside each day and company. */
export function waClickDetailCsv(report: WaClickReport): string {
  const lines = [csvLine(["日期", "電訊商編號", "電訊商", "計劃", "來源", "類別", "樓宇類型", "點擊"])];
  for (const row of report.details) {
    lines.push(
      csvLine([
        row.day,
        row.providerId,
        row.providerLabel,
        row.planId,
        row.sourceLabel,
        row.categoryLabel,
        row.housingLabel,
        row.count,
      ]),
    );
  }
  return `\uFEFF${lines.join("\n")}\n`;
}
