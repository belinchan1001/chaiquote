import { getPlan, type Plan } from "./plans.ts";
import { quoteWhatsappE164 } from "./whatsapp.ts";

export const TRACK_EVENTS = [
  "wa_click",
  "plan_open",
  "plan_view",
  "lead_submit",
  "compare_toggle",
  "save_toggle",
] as const;

export type TrackEventName = (typeof TRACK_EVENTS)[number];

export const TRACK_SOURCES = [
  "home",
  "plans",
  "plan_card",
  "plan_detail",
  "compare",
  "quote",
  "quote_link",
  "widget",
  "header",
  "footer",
  "ai_staff",
  "guide",
  "estate",
  "about",
  "privacy",
] as const;

export type TrackSource = (typeof TRACK_SOURCES)[number];

export type TrackPayload = {
  event: TrackEventName;
  planIds?: string[];
  waPhone?: string;
  source?: string;
  path?: string;
  extra?: Record<string, string | number | boolean | null>;
};

export type SiteEventRow = {
  id: number;
  created_at: string;
  event_name: string;
  plan_id: string | null;
  plan_ids: string | null;
  provider_id: string | null;
  category: string | null;
  wa_phone: string | null;
  source: string | null;
  path: string | null;
  extra: Record<string, unknown> | null;
};

const EVENT_SET = new Set<string>(TRACK_EVENTS);
const SOURCE_SET = new Set<string>(TRACK_SOURCES);

export function isTrackEventName(value: string): value is TrackEventName {
  return EVENT_SET.has(value);
}

export function inferTrackSource(pathname = ""): TrackSource {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/plans/") && pathname !== "/plans") return "plan_detail";
  if (pathname.startsWith("/plans")) return "plans";
  if (pathname.startsWith("/compare")) return "compare";
  if (pathname.startsWith("/quote")) return "quote";
  if (pathname.startsWith("/guides")) return "guide";
  if (pathname.startsWith("/estates")) return "estate";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/privacy")) return "privacy";
  return "quote_link";
}

export function plansFromIds(ids: string[] = []): Plan[] {
  return ids.map(getPlan).filter((plan): plan is Plan => Boolean(plan));
}

export function normalizeTrackPayload(input: TrackPayload): {
  event: TrackEventName;
  planId: string | null;
  planIds: string;
  providerId: string | null;
  category: string | null;
  waPhone: string | null;
  source: string;
  path: string | null;
  extra: Record<string, string | number | boolean | null> | null;
} | null {
  if (!isTrackEventName(input.event)) return null;
  const uniqueIds = [...new Set((input.planIds ?? []).map((id) => id.trim()).filter(Boolean))].slice(0, 8);
  const plans = plansFromIds(uniqueIds);
  const first = plans[0];
  const source = input.source && SOURCE_SET.has(input.source) ? input.source : inferTrackSource(input.path ?? "");
  const waPhone = (input.waPhone || (input.event === "wa_click" ? quoteWhatsappE164(plans) : "")).replace(/\D/g, "");
  return {
    event: input.event,
    planId: first?.id ?? uniqueIds[0] ?? null,
    planIds: uniqueIds.join(","),
    providerId: first?.providerId ?? null,
    category: first?.category ?? null,
    waPhone: waPhone || null,
    source,
    path: (input.path ?? "").slice(0, 240) || null,
    extra: input.extra && Object.keys(input.extra).length ? input.extra : null,
  };
}

export function waPhoneLabel(e164: string | null | undefined) {
  const digits = (e164 ?? "").replace(/\D/g, "");
  if (digits === "85263099966") return "6309 9966（預設）";
  if (digits === "85296642675") return "9664 2675（香港寬頻）";
  if (digits === "85254363004") return "5436 3004（網上行／HKT）";
  if (!digits) return "未標示";
  if (digits.startsWith("852") && digits.length === 11) {
    return `${digits.slice(3, 7)} ${digits.slice(7)}`;
  }
  return digits;
}

export type InterestSummary = {
  from: string;
  until: string;
  total: number;
  waClicks: number;
  planOpens: number;
  planViews: number;
  leadSubmits: number;
  byEvent: { name: string; count: number }[];
  byPlan: { planId: string; count: number }[];
  byWhatsApp: { phone: string; label: string; count: number }[];
  bySource: { source: string; count: number }[];
  recent: SiteEventRow[];
};

function countBy(rows: SiteEventRow[], key: (row: SiteEventRow) => string) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const value = key(row);
    if (!value) continue;
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function summarizeInterest(rows: SiteEventRow[], from: string, until: string): InterestSummary {
  const byEvent = countBy(rows, (row) => row.event_name);
  const byPlan = countBy(
    rows.filter((row) => row.event_name === "wa_click" || row.event_name === "plan_open" || row.event_name === "plan_view"),
    (row) => row.plan_id ?? "",
  ).map(({ name, count }) => ({ planId: name, count }));
  const byWhatsApp = countBy(
    rows.filter((row) => row.event_name === "wa_click"),
    (row) => row.wa_phone ?? "",
  ).map(({ name, count }) => ({ phone: name, label: waPhoneLabel(name), count }));
  const bySource = countBy(rows, (row) => row.source ?? "").map(({ name, count }) => ({ source: name, count }));
  return {
    from,
    until,
    total: rows.length,
    waClicks: rows.filter((row) => row.event_name === "wa_click").length,
    planOpens: rows.filter((row) => row.event_name === "plan_open").length,
    planViews: rows.filter((row) => row.event_name === "plan_view").length,
    leadSubmits: rows.filter((row) => row.event_name === "lead_submit").length,
    byEvent,
    byPlan,
    byWhatsApp,
    bySource,
    recent: rows.slice(0, 80),
  };
}

export function hongKongDayBounds(day = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(day);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "01";
  const ymd = `${pick("year")}-${pick("month")}-${pick("day")}`;
  return {
    ymd,
    from: `${ymd}T00:00:00+08:00`,
    until: `${ymd}T23:59:59.999+08:00`,
  };
}

export function previousHongKongDay(now = new Date()) {
  const shifted = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return hongKongDayBounds(shifted);
}
