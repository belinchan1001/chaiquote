/** Google Ads account tag from Tag Assistant (AW-18335486204). */
export const GOOGLE_ADS_ID = "AW-18335486204";

/**
 * 索取報價 event. Until the Ads “活動程式碼片段” send_to label is pasted,
 * we still load the account tag so gclid is stored; the click event is queued.
 */
export const GOOGLE_ADS_QUOTE_SEND_TO = "AW-18335486204";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
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

export function fireAdsQuoteConversion() {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  gtag("event", "conversion", { send_to: GOOGLE_ADS_QUOTE_SEND_TO });
  gtag("event", "generate_lead");
}
