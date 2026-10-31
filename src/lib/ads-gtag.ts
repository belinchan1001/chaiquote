/** Google Ads account tag from Tag Assistant (AW-18335486204). */
export const GOOGLE_ADS_ID = "AW-18335486204";

/** GA4 web stream. Override with VITE_GA4_MEASUREMENT_ID; empty or invalid values keep this default. */
export const GA4_MEASUREMENT_ID_DEFAULT = "G-HYHDCZN8KG";

const QUOTE_SEND_TO_FALLBACK = "AW-18335486204";
const QUOTE_CONVERSION_DEBOUNCE_MS = 800;
const GA4_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;

/** Windows that already received both config commands. A second install must not send another GA4 page_view. */
const configuredWindows = new WeakSet<object>();

declare global {
  interface ImportMetaEnv {
    readonly VITE_GOOGLE_ADS_QUOTE_SEND_TO?: string;
    readonly VITE_GA4_MEASUREMENT_ID?: string;
  }
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Full `AW-18335486204/label` from env, otherwise the bare account id (not a conversion label). */
export function readQuoteSendToEnv(env: { VITE_GOOGLE_ADS_QUOTE_SEND_TO?: string } | undefined): string {
  const raw = env?.VITE_GOOGLE_ADS_QUOTE_SEND_TO;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return QUOTE_SEND_TO_FALLBACK;
}

export const GOOGLE_ADS_QUOTE_SEND_TO = readQuoteSendToEnv(import.meta.env);

/** GA4 measurement id from env when it looks like `G-...`, otherwise `G-HYHDCZN8KG`. */
export function readGa4MeasurementId(env: { VITE_GA4_MEASUREMENT_ID?: string } | undefined): string {
  const raw = env?.VITE_GA4_MEASUREMENT_ID;
  if (typeof raw === "string" && GA4_MEASUREMENT_ID_PATTERN.test(raw.trim())) return raw.trim();
  return GA4_MEASUREMENT_ID_DEFAULT;
}

export const GA4_MEASUREMENT_ID = readGa4MeasurementId(import.meta.env);

function configAdsAndGa4(gtag: (...args: unknown[]) => void) {
  // Two config commands on one gtag. Do not route GA4 through the Ads tag destination:
  // Google's setup wizard warns that reusing that destination can overwrite Ads settings.
  gtag("config", GOOGLE_ADS_ID);
  gtag("config", GA4_MEASUREMENT_ID);
}

export function isCompleteQuoteSendTo(sendTo: string): boolean {
  return /^AW-18335486204\/[A-Za-z0-9_-]+$/.test(sendTo.trim());
}

export function resolveQuoteSendTo(raw: string | null | undefined): string | null {
  const value = (raw ?? "").trim();
  return isCompleteQuoteSendTo(value) ? value : null;
}

export function adsQuoteConversionEvents(sendTo: string | null): { name: string; params?: { send_to: string } }[] {
  const events: { name: string; params?: { send_to: string } }[] = [];
  if (sendTo) events.push({ name: "conversion", params: { send_to: sendTo } });
  events.push({ name: "generate_lead" });
  return events;
}

export function installGoogleAdsTag() {
  if (typeof window === "undefined") return;
  if (configuredWindows.has(window) && typeof window.gtag === "function") return;
  if (typeof window.gtag === "function") {
    configAdsAndGa4(window.gtag);
    configuredWindows.add(window);
    return;
  }
  window.dataLayer = window.dataLayer ?? [];
  // gtag.js only reads an `arguments` object. Pushing a rest array drops both the Ads hit and the GA4 page view.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params -- gtag.js ignores a rest array and then sends no Ads or GA4 hit
    window.dataLayer?.push(arguments);
  };
  window.gtag("js", new Date());
  configAdsAndGa4(window.gtag);
  configuredWindows.add(window);
  const script = document.createElement("script");
  script.async = true;
  // Keep the loader on the Ads id so gtag/js still fetches the AW tag.
  // GA4 is a second config command, not a replacement for that loader.
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  document.head.appendChild(script);
}

let lastQuoteConversionAt = 0;

export function resetAdsQuoteConversionGuard() {
  lastQuoteConversionAt = 0;
}

export function fireAdsQuoteConversion(now = Date.now()) {
  if (typeof window === "undefined") return;
  if (now - lastQuoteConversionAt < QUOTE_CONVERSION_DEBOUNCE_MS) return;
  lastQuoteConversionAt = now;
  if (typeof window.gtag !== "function") installGoogleAdsTag();
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  // 阿祺：Google Ads → 目標 → 轉換 → 網站 → 「索取報價」活動程式碼片段，把完整 AW-18335486204/標籤 貼到 Vercel env VITE_GOOGLE_ADS_QUOTE_SEND_TO。
  const sendTo = resolveQuoteSendTo(GOOGLE_ADS_QUOTE_SEND_TO);
  for (const event of adsQuoteConversionEvents(sendTo)) {
    if (event.params) gtag("event", event.name, event.params);
    else gtag("event", event.name);
  }
}
