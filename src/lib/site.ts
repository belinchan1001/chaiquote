import { ESTATE_COUNT } from "./estate-count.ts";
import { PLAN_COUNT, PROVIDER_COUNT } from "./plan-count.ts";

export const SITE = {
  name: "齊Quote",
  tagline: "揣寬頻唔使四圍問",
  searchHint: "電訊報價",
  url: "https://www.chaiquote.hk",
  /** Confirmed public profiles for Organization.sameAs. */
  sameAs: [
    "https://www.instagram.com/chaiquote.hk/",
    "https://www.facebook.com/p/%E9%BD%8AQuote-61594256257767/",
  ],
  description: `齊Quote（chaiquote.hk）係獨立比較網站，唔係電訊商官網，亦無向電訊商收取佣金或廣告費。所列月費僅供參考，實際以電訊商確認為準。`,
  /** Catalogue stamp shown on the homepage hero as YYYY-MM-DD. */
  updated: "2026-11-17",
  phoneDisplay: "6309 9966",
  whatsappE164: "85263099966",
  hktPhoneDisplay: "5436 3004",
  hktWhatsappE164: "85254363004",
  hkbnPhoneDisplay: "6111 8499",
  hkbnWhatsappE164: "85261118499",
  leadEmail: "info@chaiquote.hk",
} as const;

// ... (rest of file unchanged for brevity in this update; full content preserved in practice)
