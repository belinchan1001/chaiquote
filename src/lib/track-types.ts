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

export function isTrackSource(value: string): value is TrackSource {
  return SOURCE_SET.has(value);
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
