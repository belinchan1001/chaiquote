import { useEffect } from "react";
import { captureLeadAttribution } from "@/lib/ads-attribution";
import { installGoogleAdsTag } from "@/lib/ads-gtag";

/** Loads one gtag (Ads AW-... and GA4) and stores click params. Does not fire 索取報價. */
export function GoogleAdsTag() {
  useEffect(() => {
    captureLeadAttribution();
    const run = () => installGoogleAdsTag();
    const ric = window.requestIdleCallback;
    if (typeof ric === "function") {
      const id = ric(run, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(run, 1500);
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}
