/** Google Ads account tag from Tag Assistant (AW-18335486204). */
export const GOOGLE_ADS_ID = "AW-18335486204";

const QUOTE_SEND_TO_FALLBACK = "AW-18335486204";
const QUOTE_CONVERSION_DEBOUNCE_MS = 800;

declare global {
  interface ImportMetaEnv {
    readonly VITE_GOOGLE_ADS_QUOTE_SEND_TO?: string;
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
  if (window.gtag) {
    window.gtag("config", GOOGLE_ADS_ID);
    return;
  }
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_ID);
  const script = document.createElement("script");
  script.async = true;
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
