import { ESTATE_COUNT } from "./estate-count.ts";
import { PLAN_COUNT, PROVIDER_COUNT } from "./plan-count.ts";

export const SITE = {
  name: "齊Quote",
  tagline: "搵寬頻唔使四圍問",
  searchHint: "電訊報價",
  url: "https://www.chaiquote.hk",
  /** Confirmed public profiles for Organization.sameAs. */
  sameAs: [
    "https://www.instagram.com/chaiquote.hk/",
    "https://www.facebook.com/p/%E9%BD%8AQuote-61594256257767/",
  ],
  description: `齊Quote（chaiquote.hk）係獨立比較網站，唔係電訊商官網，亦無向電訊商收取佣金或廣告費。一次過比較 ${PROVIDER_COUNT} 間電訊商、${PLAN_COUNT} 個參考計劃同 ${ESTATE_COUNT} 個屋苑。所列月費僅供參考，實際以電訊商確認為準。`,
  /** Catalogue stamp shown on the homepage hero as YYYY-MM-DD. */
  updated: "2026-11-13",
  phoneDisplay: "6309 9966",
  whatsappE164: "85263099966",
  hktPhoneDisplay: "5436 3004",
  hktWhatsappE164: "85254363004",
  hkbnPhoneDisplay: "6111 8499",
  hkbnWhatsappE164: "85261118499",
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
    "撲落去會開啟 WhatsApp 聯絡我哋（{phone}）。請勿分享銀行戶口或信用卡密碼。非電訊商官方客服。",
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

/** Facts an answer page can quote without a second copy of the numbers. */
export const INDEPENDENT_BODY =
  "齊Quote（chaiquote.hk）係香港獨立比較網站，唔係電訊商官網，亦無向電訊商收取佣金或廣告費。資料更新 {date}，可以一次過比較 {providers} 間電訊商、{plans} 個參考計劃同 {estates} 個屋苑；公屋、居屋、私樓同村屋分開列。最終月費、覆蓋同安裝以電訊商確認為準。";

export const INDEPENDENT_BODY_EN =
  "ChaiQuote (chaiquote.hk) is an independent Hong Kong telecom comparison site, not a carrier website, and it does not take commission or advertising fees from carriers. As of {date}, you can compare {providers} carriers, {plans} reference plans and {estates} estates in one place. Public housing, HOS, private estates and village houses are listed separately. The carrier confirms the final fee, coverage and installation.";

export const FEE_RANGE_QUESTION = "香港寬頻月費大概幾錢？有冇一條適用全港嘅價？";

export const FEE_RANGE_QUESTION_EN =
  "How much is Hong Kong broadband a month? Is there one territory-wide fee?";

/** Listed 1000M bands shared by the homepage fee answer and the /plans hero. */
export const PUBLIC_HOS_1000_BAND = "HK$58 至 HK$98";
export const PRIVATE_1000_BAND = "HK$88 至 HK$109";
export const VILLAGE_FIBRE_FROM = "HK$218";
export const PUBLIC_HOS_1000_BAND_EN = "HK$58 to HK$98";
export const PRIVATE_1000_BAND_EN = "HK$88 to HK$109";
export const VILLAGE_FIBRE_FROM_EN = "HK$218";

/** Floor-type bands already printed on the public / HOS, private and village fee guides, plus listed 5G home. */
export const FEE_RANGE_ANSWER =
  `冇。香港寬頻冇一條適用所有地區、所有樓類嘅單一參考月費，公屋、居屋、私樓同村屋要分開報。資料更新 {date}，站內列出例子：公居屋 1000M 約 ${PUBLIC_HOS_1000_BAND}／月（有線指定屋苑 48 個月 HK$58 起；香港寬頻 36 個月 HK$98）；私樓 1000M 約 ${PRIVATE_1000_BAND}／月（有線私人樓宇 36 個月 HK$88 起；香港寬頻 24 個月 HK$109）；村屋光纖由 ${VILLAGE_FIBRE_FROM}／月起（中國移動香港村屋 1000M、24 個月），村屋參考表例子去到 HK$376／月；5G 家居約 HK$88 至 HK$190／月（中國移動香港 350GB、48 個月 HK$88 起）。以上只係站內列出參考，唔係排名，亦唔代表你座樓一定有。最終月費、覆蓋同安裝以電訊商確認為準。`;

export const FEE_RANGE_ANSWER_EN =
  `No. There is no single reference monthly fee for every district and housing type. Public housing, HOS, private estates and village houses are quoted separately. As of {date}, examples listed on this site: public / HOS 1000M about ${PUBLIC_HOS_1000_BAND_EN}/month (i-Cable designated estate, 48 months, from HK$58; HKBN 36 months HK$98); private-estate 1000M about ${PRIVATE_1000_BAND_EN}/month (i-Cable private buildings, 36 months, from HK$88; HKBN 24 months HK$109); village fibre from ${VILLAGE_FIBRE_FROM_EN}/month (CMHK village 1000M, 24 months), with village-table examples up to HK$376/month; 5G home about HK$88 to HK$190/month (CMHK 350GB, 48 months, from HK$88). These are listed examples, not a ranking, and they do not mean your building has them. The carrier confirms the final fee, coverage and installation.`;

/** Final /plans broadband first screen. Wording is fixed; do not paraphrase. */
export const PLANS_BROADBAND_H1 = "香港光纖寬頻報價比較";
export const PLANS_BROADBAND_H1_EN = "Compare Hong Kong fibre broadband quotes";

export const PLANS_BROADBAND_LEAD =
  "齊Quote 係獨立寬頻比較站（非電訊商官網、無向電訊商收佣金或廣告費）。光纖參考月費按樓類：公居屋約 HK$58–98、私樓約 HK$88–109、村屋由 HK$218 起（資料更新 2026-11-13）；唔係全港劃一價，以電訊商確認為準。";

export const PLANS_BROADBAND_LEAD_EN =
  "ChaiQuote is an independent broadband comparison site (not a carrier website, and it does not take commission or advertising fees from carriers). Fibre reference fees by housing type: public / HOS about HK$58–98, private estates about HK$88–109, village houses from HK$218 (updated 2026-11-13); not one territory-wide fee. The carrier confirms.";

export function plansBroadbandHero(locale: "zh" | "en") {
  const en = locale === "en";
  return {
    h1: en ? PLANS_BROADBAND_H1_EN : PLANS_BROADBAND_H1,
    lead: en ? PLANS_BROADBAND_LEAD_EN : PLANS_BROADBAND_LEAD,
  };
}

const FAQ_VARS = {
  phone: SITE.phoneDisplay,
  email: SITE.leadEmail,
  date: SITE.updated,
  providers: String(PROVIDER_COUNT),
  plans: String(PLAN_COUNT),
  estates: String(ESTATE_COUNT),
} as const;

export function fillSiteTemplate(template: string, extra?: Record<string, string | number>) {
  const vars: Record<string, string | number> = { ...FAQ_VARS, ...extra };
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

/** zh templates. Homepage copy and FAQPage JSON-LD both read this list. */
export const FAQ_ZH = [
  {
    q: "香港有冇獨立寬頻比較網站？齊Quote 係咪獨立？",
    a: `有。${INDEPENDENT_BODY}`,
  },
  {
    q: FEE_RANGE_QUESTION,
    a: FEE_RANGE_ANSWER,
  },
  {
    q: "公屋同埋居屋價錢會唔會唔同？",
    a: "公屋同埋居屋好多時有指定供應商同批量價，每個屋邨／屋苑合約都可能唔同。站內光纖入門參考可見「指定屋苑 1000M 光纖入屋（48 個月）」約 HK$58／月起（有線寬頻）；篩選時分開揀公屋／居屋，問價填齊屋苑名稱。僅供參考，以電訊商確認為準。",
  },
  {
    q: "村屋有冇光纖？",
    a: "村屋光纖而家主要由香港寬頻、HGC 同網上行等提供指定計劃；公屋、居屋同私樓計劃一般唔適用於村屋地址。站內村屋光纖入門參考約 HK$218／月起（例如中國移動香港「村屋 1000M 光纖（24 個月）」）；另有香港寬頻「特選村屋 2000M 光纖（24 個月）」HK$229 等較高規格計劃。未有光纖可一併比較 5G 家居寬頻（站內約 HK$88 起）。實際覆蓋要核對門牌，以電訊商確認為準。",
  },
  {
    q: "商業寬頻同家居計劃有咩分別？",
    a: "商業寬頻多可加購固定 IP 同辦公時間技術支援，安裝以工商地址為準。月費一般高於家居計劃，適合店舖、寫字樓及工作室。",
  },
  {
    q: "大灣區數據包唔包中國內地？",
    a: "流動通訊計劃可篩選「大灣區數據」，即包含中國內地及／或澳門用量，或三地共享數據池。實際適用地區及用量以電訊商條款為準。",
  },
  {
    q: "點樣查核報價？",
    a: "最快用 WhatsApp {phone}。冇 WhatsApp 可以撲「留低電話」，填姓名同電話，我哋會致電你；亦可直接致電同一號碼，或電郵 {email}。",
  },
] as const;

export const FAQ_EN = [
  {
    q: "Is there an independent broadband comparison site in Hong Kong? Is ChaiQuote independent?",
    a: `Yes. ${INDEPENDENT_BODY_EN}`,
  },
  {
    q: FEE_RANGE_QUESTION_EN,
    a: FEE_RANGE_ANSWER_EN,
  },
  {
    q: "Do public housing and HOS prices differ?",
    a: "Public housing and HOS often have designated providers and bulk rates, and each estate contract can differ. The on-site fibre entry reference is “指定屋苑 1000M 光纖入屋（48 個月）”, about HK$58/month (i-Cable). Filter public housing and HOS separately, and include the estate name. For reference only; the carrier confirms.",
  },
  {
    q: "Can village houses get fibre?",
    a: "Village fibre is mainly offered on designated plans from HKBN, HGC and Netvigator. Public, HOS and private plans usually do not apply to a village address. The on-site entry reference is about HK$218/month (for example CMHK “村屋 1000M 光纖（24 個月）”). HKBN “特選村屋 2000M 光纖（24 個月）” at HK$229 is a higher-spec plan. Where there is no fibre, also compare 5G home broadband (about HK$88 on this site). Coverage must be checked against the address; the carrier confirms.",
  },
  {
    q: "How is business broadband different?",
    a: "Business plans can add a fixed IP and office-hour support. Install is for commercial addresses. Fees are usually higher than home plans.",
  },
  {
    q: "Does Greater Bay Area data include Mainland China?",
    a: "Mobile plans tagged Greater Bay Area include Mainland and/or Macao data, or a shared pool. Regions and quotas follow the carrier’s terms.",
  },
  {
    q: "How do I check a quote?",
    a: "Fastest: WhatsApp {phone}. No WhatsApp? Tap Leave a number. You can also call the same number, or email {email}.",
  },
] as const;

/** Filled zh answers for FAQPage JSON-LD. Visible zh copy uses the same templates. */
export const FAQ = FAQ_ZH.map((item) => ({
  q: item.q,
  a: fillSiteTemplate(item.a),
}));
