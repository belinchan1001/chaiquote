import { useEffect } from "react";
import { scheduleGoogleAdsTag } from "@/lib/ads-gtag";

export function GoogleAdsTag() {
  useEffect(() => scheduleGoogleAdsTag(), []);
  return null;
}
