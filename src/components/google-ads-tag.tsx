import { useEffect } from "react";
import { captureLeadAttribution } from "@/lib/ads-attribution";
import { installGoogleAdsTag } from "@/lib/ads-gtag";

/** Loads one gtag (Ads AW-... and GA4) and stores click params. Does not fire 索取報價. */
export function GoogleAdsTag() {
  useEffect(() => {
    captureLeadAttribution();
    installGoogleAdsTag();
  }, []);
  return null;
}
