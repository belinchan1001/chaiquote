/**
 * Session-only lead source (sessionStorage). No new cookies and no click ids in WhatsApp text.
 * Google Ads final URL should carry utm_source=google&utm_medium=cpc&utm_campaign=search-trial
 * (auto-tag adds gclid). Existing /go/ landings already keep extra query params; do not change live Ads settings here.
 */

export const LEAD_ATTR_STORAGE_KEY = "cq_lead_attr";
export const SOURCE_MARK_MAX = 40;

const FIELD_MAX = 180;
const CAMPAIGN_MAX = 16;

export const LEAD_TOUCH_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

export type LeadTouchField = (typeof LEAD_TOUCH_FIELDS)[number];

export type LeadTouch = Partial<Record<LeadTouchField, string>> & {
  /** Existing Google Ads landing flag (`/go/*` → `from=ad`). Not shown in WhatsApp. */
  from?: "ad";
  cat?: string;
  housing?: string;
};

export type LeadSource = "google_ads" | "meta" | "organic" | "other";

export type SourceLabel = {
  source: LeadSource;
  campaign?: string;
};

const GOOGLE_SOURCES = new Set(["google", "google_ads", "googleads", "adwords"]);
const META_SOURCES = new Set([
  "meta",
  "meta_ads",
  "facebook",
  "facebook_ads",
  "fb",
  "instagram",
  "ig",
  "ig_ads",
]);
const PAID_MEDIUMS = new Set(["cpc", "ppc", "paid", "paidsocial", "paid_social", "cpm", "display", "ads"]);
const ORGANIC_SOURCES = new Set(["organic", "direct", "(direct)", "(none)", "none"]);

type TouchStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function sanitizeCampaign(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim();
  if (!cleaned || cleaned.includes("@") || /\d{8,}/.test(cleaned)) return undefined;
  const safe = cleaned.replace(/[^\p{L}\p{N}_-]+/gu, "").slice(0, CAMPAIGN_MAX);
  return safe || undefined;
}

export function classifyLeadSource(touch: LeadTouch | null | undefined): SourceLabel {
  const source = (touch?.utm_source ?? "").trim().toLowerCase();
  const medium = (touch?.utm_medium ?? "").trim().toLowerCase();
  const campaign = sanitizeCampaign(touch?.utm_campaign);
  const hasGclid = Boolean(touch?.gclid);
  const hasFbclid = Boolean(touch?.fbclid);
  const fromAd = touch?.from === "ad";
  const label = (kind: LeadSource): SourceLabel => (campaign ? { source: kind, campaign } : { source: kind });

  if (META_SOURCES.has(source)) return label("meta");
  if (GOOGLE_SOURCES.has(source) && (PAID_MEDIUMS.has(medium) || hasGclid)) return label("google_ads");
  if (GOOGLE_SOURCES.has(source) && (medium === "organic" || ORGANIC_SOURCES.has(medium))) return label("organic");
  if (hasGclid || fromAd) return label("google_ads");
  if (hasFbclid) return label("meta");
  if (ORGANIC_SOURCES.has(source) || medium === "organic") return label("organic");
  if (GOOGLE_SOURCES.has(source)) return label("other");
  const tagged = Boolean(
    source || medium || touch?.utm_campaign || touch?.utm_content || touch?.utm_term || hasGclid || hasFbclid || fromAd,
  );
  return label(tagged ? "other" : "organic");
}

const CHANNEL_CODE: Record<LeadSource, string> = {
  organic: "1",
  google_ads: "2",
  meta: "3",
  other: "4",
};

export function customerInquiryLine(touch: LeadTouch | null | undefined): string {
  const housing = touch?.housing;
  const cat = touch?.cat;
  const topic =
    housing === "village"
      ? "村屋寬頻"
      : housing === "public"
        ? "公屋寬頻"
        : housing === "hos"
          ? "居屋寬頻"
          : housing === "private"
            ? "私人樓宇"
            : cat === "home5g"
              ? "5G 家居寬頻"
              : cat === "mobile"
                ? "手機計劃"
                : cat === "business"
                  ? "商業寬頻"
                  : cat === "broadband"
                    ? "家居寬頻"
                    : "網站";
  return `【查詢】${topic} #${CHANNEL_CODE[classifyLeadSource(touch).source]}`;
}

export function appendInquiryMark(text: string, touch: LeadTouch | null | undefined): string {
  const line = customerInquiryLine(touch);
  if (/(^|\n)【查詢】/.test(text)) return text;
  const body = text.replace(/\s+$/, "");
  return body ? `${body}\n${line}` : line;
}

export function sourceMarkLine(label: SourceLabel): string {
  const head = `【來源】${label.source}`.slice(0, SOURCE_MARK_MAX);
  if (!label.campaign) return head;
  const sep = " · ";
  const room = SOURCE_MARK_MAX - head.length - sep.length;
  if (room < 1) return head;
  return `${head}${sep}${label.campaign.slice(0, room)}`;
}

export function appendSourceMark(text: string, label: SourceLabel): string {
  const line = sourceMarkLine(label);
  if (/(^|\n)【來源】/.test(text)) return text;
  const body = text.replace(/\s+$/, "");
  return body ? `${body}\n${line}` : line;
}

export function touchFromSearch(search: string): LeadTouch {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(raw);
  } catch {
    return {};
  }
  const touch: LeadTouch = {};
  for (const key of LEAD_TOUCH_FIELDS) {
    const value = params.get(key)?.trim();
    if (!value) continue;
    touch[key] = value.slice(0, FIELD_MAX);
  }
  if (params.get("from")?.trim() === "ad") touch.from = "ad";
  const cat = params.get("cat")?.trim();
  if (cat === "broadband" || cat === "home5g" || cat === "mobile" || cat === "business") touch.cat = cat;
  const housing = params.get("housing")?.trim();
  if (housing === "public" || housing === "hos" || housing === "private" || housing === "village") {
    touch.housing = housing;
  }
  return touch;
}

function touchHasSignal(touch: LeadTouch): boolean {
  return LEAD_TOUCH_FIELDS.some((key) => Boolean(touch[key])) || touch.from === "ad" || Boolean(touch.cat || touch.housing);
}

function parseStoredTouch(raw: string | null): LeadTouch {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const record = parsed as Record<string, unknown>;
    const touch: LeadTouch = {};
    for (const key of LEAD_TOUCH_FIELDS) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) touch[key] = value.trim().slice(0, FIELD_MAX);
    }
    if (record.from === "ad") touch.from = "ad";
    if (record.cat === "broadband" || record.cat === "home5g" || record.cat === "mobile" || record.cat === "business") {
      touch.cat = record.cat;
    }
    if (
      record.housing === "public" ||
      record.housing === "hos" ||
      record.housing === "private" ||
      record.housing === "village"
    ) {
      touch.housing = record.housing;
    }
    return touch;
  } catch {
    return {};
  }
}

/** First non-empty touch in this store wins. Empty landings do not block a later tagged URL. */
export function captureLeadTouch(search: string, storage: TouchStore): LeadTouch {
  const existing = parseStoredTouch(storage.getItem(LEAD_ATTR_STORAGE_KEY));
  if (touchHasSignal(existing)) return existing;
  const fresh = touchFromSearch(search);
  if (!touchHasSignal(fresh)) return {};
  storage.setItem(LEAD_ATTR_STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function readLeadTouch(): LeadTouch {
  if (typeof window === "undefined") return {};
  try {
    return captureLeadTouch(window.location.search ?? "", window.sessionStorage);
  } catch {
    try {
      return touchFromSearch(window.location.search ?? "");
    } catch {
      return {};
    }
  }
}

/** On-load capture. Does not fire any Ads event. */
export function captureLeadAttribution(): LeadTouch {
  return readLeadTouch();
}
