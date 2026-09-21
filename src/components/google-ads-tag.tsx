import { useEffect } from "react";
import { installGoogleAdsTag } from "@/lib/ads-gtag";

export function GoogleAdsTag() {
  useEffect(() => {
    installGoogleAdsTag();
  }, []);
  return null;
}
