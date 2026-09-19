export const SITE = {
  name: "齊Quote",
  tagline: "搵寬頻唔使四圍問",
  searchHint: "電訊報價",
  url: "https://www.chaiquote.hk",
  description:
    "齊Quote 係獨立電訊比較平台，提供香港寬頻報價同電訊報價，一次過比較家居寬頻、5G 家居、商業寬頻同手機計劃。所列月費僅供參考，實際以電訊商確認為準。",
  /** Catalogue stamp shown on the homepage hero as YYYY-MM-DD. */
  updated: "2026-09-20",
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
    "撳下去會開啟 WhatsApp 聯絡我哋（{phone}）。請勿分享銀行戶口或信用卡密碼。非電訊商官方客服。",
} as const;

export const DISCLAIMER = [
  LEGAL.referencePrice,
  "本網站所列之所有月費計劃、禮券優惠及安裝條款僅供參考，實際收費及服務細則受相關電訊供應商之最新合約條款約束。",
  "本平台將盡力維持資料之準確性，惟各營運商之優惠可能隨時調整，最終價格以用戶與電訊商簽署之合約為準。",
] as const;

export const SHORTCUTS = [
  { label: "就到期轉台", search: { cat: "mobile" as const, portIn: true } },
  { label: "平價入門", search: { cat: "broadband" as const, maxFee: 120 } },
  { label: "電競神線", search: { cat: "broadband" as const, minSpeed: 2500, sort: "speed" as const } },
] as const;

export const ESPORTS_LINE_SEARCH = {
  cat: "broadband" as const,
  minSpeed: 2500,
  sort: "speed" as const,
  esports: true as const,
};

export const CALL_WINDOWS = [
  { id: "anytime", label: "隨時都可以" },
  { id: "weekday", label: "平日 10:00–18:00" },
  { id: "evening", label: "平日晚上" },
  { id: "weekend", label: "週末" },
] as const;

export const DISTRICTS = [
  "中西區",
  "灣仔",
  "東區",
  "南區",
  "油尖旺",
  "深水埗",
  "九龍城",
  "黃大仙",
  "觀塘",
  "荃灣",
  "屯門",
  "元朗",
  "北區",
  "大埔",
  "沙田",
  "西貢",
  "葵青",
  "離島",
] as const;

export const HOUSING_OPTIONS = [
  { id: "public", label: "公屋" },
  { id: "hos", label: "居屋" },
  { id: "private", label: "私人樓" },
  { id: "village", label: "村屋" },
] as const;

export const CATEGORY_OPTIONS = [
  { id: "broadband", label: "光纖寬頻", hint: "光纖入屋" },
  { id: "mobile", label: "手機月費", hint: "4G／5G SIM" },
  { id: "business", label: "商業寬頻", hint: "舖頭／寫字樓" },
  { id: "home5g", label: "5G 家居", hint: "唔使拉線，插電就用" },
] as const;

export const SPEED_OPTIONS = [
  { speed: 200, label: "200M" },
  { speed: 500, label: "500M" },
  { speed: 1000, label: "1000M" },
  { speed: 2000, label: "2000M" },
  { speed: 2500, label: "2500M" },
  { speed: 5000, label: "5000M" },
  { speed: 10000, label: "10000M" },
] as const;

export const GENERATION_OPTIONS = [
  { id: "4g", label: "4G／4.5G" },
  { id: "5g", label: "5G" },
] as const;

export const BUDGET_OPTIONS = [
  { maxFee: undefined, label: "唔限預算" },
  { maxFee: 80, label: "$80 以下" },
  { maxFee: 120, label: "$120 以下" },
  { maxFee: 180, label: "$180 以下" },
  { maxFee: 400, label: "$400 以下" },
] as const;

export const FAQ = [
  {
    q: "齊Quote 係咪電訊商官網？",
    a: "唔係。我哋係獨立比較網站，將公開渠道同市場常見優惠擺埋一齊。最終月費、覆蓋同安裝期，都以電訊商確認為準。",
  },
  {
    q: "公屋同埋居屋價錢會唔會唔同？",
    a: "公屋同埋居屋好多時有指定供應商同批量價，不過每個屋邨／屋苑合約都可能唔同。篩選時可以分開揀；問價記得填齊屋苑名稱。",
  },
  {
    q: "村屋有冇光纖？",
    a: "村屋光纖而家主要由香港寬頻、HGC 同網上行提供指定計劃；公屋、居屋同私樓計劃一般唔適用於村屋地址。未有光纖嘅地址，可以一併比較 5G 家居寬頻。實際覆蓋要核對門牌。",
  },
  {
    q: "商業寬頻同家居計劃有咩分別？",
    a: "商業寬頻多可加購固定 IP 同辦公時間技術支援，安裝以工商地址為準。月費一般高於家居計劃，適合店舖、寫字樓及工作室。",
  },
  {
    q: "大灣區數據包唔包中國內地？",
    a: "手機計劃可以篩「大灣區數據」，即包中國內地同／或澳門用量，或者三地共用數據池。實際地區同用量以電訊商條款為準。",
  },
  {
    q: "點樣查核報價？",
    a: "最快用 WhatsApp 6309 9966。冇 WhatsApp 可以撳「留低電話」，填姓名同電話，我哋會致電你；亦可直接致電同一號碼，或電郵 info@chaiquote.hk。",
  },
] as const;
