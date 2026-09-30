export const SITE = {
  name: "齊Quote",
  tagline: "搜寬頻唔使四圍問",
  searchHint: "電訊報價",
  url: "https://www.chaiquote.hk",
  description:
    "齊Quote 係獨立電訊比較平台，提供香港寬頻報價同電訊報價，一次過比較家居寬頻、5G 家居、商業寬頻同手機計劃。所列月費僅供參考，實際以電訊商確認為準。",
  /** Catalogue stamp shown on the homepage hero as YYYY-MM-DD. */
  updated: "2026-10-01",
  phoneDisplay: "6309 9966",
  whatsappE164: "85263099966",
  hktPhoneDisplay: "5436 3004",
  hktWhatsappE164: "85254363004",
  hkbnPhoneDisplay: "9664 2675",
  hkbnWhatsappE164: "85296642675",
  leadEmail: "info@chaiquote.hk",
} as const;

/** Preview: new port-in intake on the homepage. Set false to restore the previous search panel. */
export const HOME_SEARCH_V2 = true;

/** Locked compliance copy. Do not invent a personal legal name. */
export const LEGAL = {
  controllerKind: "個人獨立營運",
  consent:
    "提交即表示你同意我哋以電話／WhatsApp 聯絡你，並在有需要時將查詢轉介相關電訊商跟進。",
  overseas:
    "網站由 Vercel 等服務託管，你提交嘅資料可能儲存或處理於香港以外地區。",
  referencePrice:
    "以上月費及優惠為市場參考資料，實際價格、覆蓋、合約期及安裝安排，一律以電訊商確認為準。",
  whatsappTip:
    "撒落去會開啟 WhatsApp 聯絡我哋（{phone}）。請勿分享銀行戶口或信用卡密碼。非電訊商官方客服。",
} as const;

export const DISCLAIMER = [
  LEGAL.referencePrice,
  "本網站所列之所有月費計劃、禮券優惠及安裝條款僅供參考，實際收費及服務細則受相關電訊供應商之最新合約條款約束。",
  "本平台將盡力維持資料之準確性，惟各營運商之優惠可能隨時調整，最終價格以用戶與電訊商簽署之合約為準。",
] as const;
