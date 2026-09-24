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

const GTAG_SRC = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;

let networkStarted = false;

function ensureGtagStub() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  if (typeof window.gtag === "function") return;
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_ID);
}

function loadGtagScript() {
  if (typeof document === "undefined" || networkStarted) return;
  networkStarted = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = GTAG_SRC;
  script.setAttribute("fetchpriority", "low");
  document.head.appendChild(script);
}

/** Load the network script immediately. Conversions call this so the hit is not dropped. */
export function installGoogleAdsTag() {
  ensureGtagStub();
  loadGtagScript();
}

/** After load, wait this long before fetching gtag.js if nobody interacts. */
const GTAG_IDLE_DELAY_MS = 12000;

/**
 * Queue config on the dataLayer now. Fetch gtag.js on the first interaction,
 * or after window load plus a long idle delay. Conversion IDs stay the same.
 */
export function scheduleGoogleAdsTag() {
  if (typeof window === "undefined") return () => undefined;
  ensureGtagStub();
  let idle = 0;
  let timeout = 0;
  let finished = false;
  const run = () => {
    if (finished) return;
    finished = true;
    window.removeEventListener("pointerdown", run);
    window.removeEventListener("keydown", run);
    window.removeEventListener("touchstart", run);
    if (idle && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
    if (timeout) window.clearTimeout(timeout);
    loadGtagScript();
  };
  window.addEventListener("pointerdown", run, { passive: true });
  window.addEventListener("keydown", run);
  window.addEventListener("touchstart", run, { passive: true });
  const arm = () => {
    timeout = window.setTimeout(() => {
      const ric = window.requestIdleCallback;
      if (typeof ric === "function") idle = ric(run, { timeout: 2000 });
      else run();
    }, GTAG_IDLE_DELAY_MS);
  };
  if (document.readyState === "complete") arm();
  else window.addEventListener("load", arm, { once: true });
  return () => {
    finished = true;
    window.removeEventListener("pointerdown", run);
    window.removeEventListener("keydown", run);
    window.removeEventListener("touchstart", run);
    window.removeEventListener("load", arm);
    if (idle && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
    if (timeout) window.clearTimeout(timeout);
  };
}

export function fireAdsQuoteConversion() {
  if (typeof window === "undefined") return;
  ensureGtagStub();
  loadGtagScript();
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  gtag("event", "conversion", { send_to: GOOGLE_ADS_QUOTE_SEND_TO });
  gtag("event", "generate_lead");
}
