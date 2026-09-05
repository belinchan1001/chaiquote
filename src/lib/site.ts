export const SITE = {
  name: "齊Quote",
  tagline: "搵寬頻唔使四圍問",
  description:
    "齊Quote 為獨立電訊比較平台，協助用戶一次過比較香港家居寬頻、商業寬頻及流動通訊計劃。所列月費僅供參考。",
  updated: "2026年9月",
  phoneDisplay: "9862 2444",
  whatsappE164: "85298622444",
  leadEmail: "",
} as const;

export const DISCLAIMER = [
  "本網站所列之所有月費計劃、禮券優惠及安裝條款僅供參考，實際收費及服務細則受相關電訊供應商之最新合約條款約束。",
  "本平台將盡力維持資料之準確性，惟各營運商之優惠可能隨時調整，最終價格以用戶與電訊商簽署之合約為準。",
] as const;

export const SHORTCUTS = [
  { label: "就到期轉台", search: { cat: "mobile" as const, portIn: true } },
  { label: "平價入門", search: { cat: "broadband" as const, maxFee: 120 } },
  { label: "高速打機首選", search: { cat: "broadband" as const, sort: "speed" as const } },
] as const;

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
    a: "不是。本平台為獨立比較網站，將公開渠道及市場常見優惠整理於同一列表，方便用戶一次過比較。最終月費、網絡覆蓋及安裝期，均以電訊商確認為準。",
  },
  {
    q: "公屋同居屋價錢會唔會唔同？",
    a: "公屋與居屋計劃往往設有指定供應商及批量價格，惟個別屋邨或屋苑合約並不相同。篩選時可分開選擇；申請報價時請填寫完整屋苑名稱。",
  },
  {
    q: "村屋有冇光纖？",
    a: "村屋光纖現時主要由香港寬頻、HGC 及網上行提供指定計劃；公屋、居屋及私人樓宇計劃一般不適用於村屋地址。尚未有光纖的地址，可一併比較 5G 家居寬頻。實際覆蓋須核對門牌。",
  },
  {
    q: "商業寬頻同家居計劃有咩分別？",
    a: "商業寬頻多可加購固定 IP 及辦公時間技術支援，安裝以工商地址為準。月費一般高於家居計劃，適合店舖、寫字樓及工作室。",
  },
  {
    q: "大灣區數據包唔包？",
    a: "流動通訊計劃可篩選「大灣區數據」，即包含中國內地及／或澳門用量，或三地共享數據池。實際適用地區及用量以電訊商條款為準。",
  },
  {
    q: "點樣即時問價？",
    a: "最快用 WhatsApp 9862 2444。冇 WhatsApp 可以撳「留低電話」，填姓名同電話，我哋會致電你；亦可直接致電同一號碼。",
  },
] as const;
