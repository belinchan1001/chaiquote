import type { Inquiry } from "./desk.ts";
import { GUIDE_ARTICLES } from "./guide-articles.ts";

export type GuideSection = { heading: string; paragraphs: string[] };
export type GuideCategory = "fiber" | "home5g" | "mobile" | "business";

export type GuideCta = {
  lead: string;
  leadEn: string;
  button: string;
  buttonEn: string;
  waText: string;
  waTextEn: string;
};

export type GuideLink = { href: string; label: string };

export type Guide = {
  slug: string;
  minutes: number;
  category: GuideCategory;
  seoTitle: string;
  h1: string;
  description: string;
  title: string;
  excerpt: string;
  body: GuideSection[];
  titleEn: string;
  excerptEn: string;
  h1En?: string;
  descriptionEn?: string;
  bodyEn: GuideSection[];
  related?: string[];
  plans?: GuideLink[];
  estates?: GuideLink[];
  inquiry?: Partial<Inquiry>;
  cta?: GuideCta;
};

export const CORE_GUIDES: Guide[] = [
  {
    slug: "port-in",
    minutes: 4,
    category: "mobile",
    seoTitle: "攜號轉台點樣做｜齊Quote",
    h1: "攜號轉台點樣做，先唔會斷線",
    description: "留舊號碼轉去新電訊商，行政費、幾時生效、寬頻轉台有咩分別。實際以電訊商確認為準。",
    title: "攜號轉台點樣做，先唔會斷線",
    excerpt: "留舊號碼轉去新電訊商，行政費、幾時生效、寬頻轉台有咩分別。",
    titleEn: "How to port your number without losing service",
    excerptEn: "Keep your number when you switch. Admin fees, when it takes effect, and how broadband switching is different.",
    body: [
      {
        heading: "手機：先申請、後停舊台",
        paragraphs: [
          "帶身分證明同舊台月結單，向新台申請攜號轉台。新 SIM 未生效前，舊卡仍然用得。",
          "一般 1 至 2 個工作天。生效嗰下舊台就停，所以唔好提早自己取消舊合約——未約滿可能要俾提早終止費。",
        ],
      },
      {
        heading: "隧道費同行政費",
        paragraphs: [
          "市場上轉台成日豁免行政費／隧道費。齊Quote 會標有轉台優惠嘅計劃，實際以申請時確認為準。",
        ],
      },
      {
        heading: "寬頻轉台",
        paragraphs: [
          "寬頻唔能夠「攜號」過台，而係新台上門安裝。先約安裝日，新線測好先取消舊台，避免屋企無網。",
          "部分供應商合約期內包一次免費搬遷；如果就嚟搬家，先問清楚再簽約。",
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Mobile: apply first, then stop the old plan",
        paragraphs: [
          "Bring ID and a recent bill from your current carrier and apply for number porting with the new one. The old SIM still works until the new SIM is active.",
          "It usually takes 1–2 working days. The old plan stops the moment porting completes, so do not cancel early — you may pay an early-termination fee.",
        ],
      },
      {
        heading: "Admin and tunnel fees",
        paragraphs: [
          "Port-in offers often waive admin / tunnel fees. ChaiQuote flags those plans; the actual waiver is confirmed at application.",
        ],
      },
      {
        heading: "Switching broadband",
        paragraphs: [
          "Broadband cannot “port a number”. A technician installs the new line. Book the install, test the new line, then cancel the old one so you are not left without internet.",
          "Some contracts include one free relocation. If you are moving soon, ask before you sign.",
        ],
      },
    ],
    related: ["mobile", "gba-mobile", "switch-broadband"],
    plans: [{ href: "/plans?cat=mobile", label: "去手機格價" }],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/mobile", label: "手機月費攻略" },
    ],
  },
  {
    slug: "fiber-vs-5g",
    minutes: 7,
    category: "fiber",
    seoTitle: "光纖同 5G 家居寬頻點揀｜齊Quote",
    h1: "光纖同 5G 家居寬頻點揀",
    description: "拉線穩唔穩、幾時裝到、有冇數據上限、村屋適唔適合。實際覆蓋同安裝以電訊商確認。",
    title: "光纖同 5G 家居寬頻點揀",
    excerpt: "拉線穩唔穩、幾時裝到、有冇數據上限、村屋適唔適合。",
    titleEn: "Fibre vs 5G home broadband",
    excerptEn: "Stability, install time, data caps, and what works for village houses.",
    body: [
      {
        heading: "光纖入屋",
        paragraphs: [
          "用光纖入屋，速度由 1000M 起跳，延遲低，啱雲端備份、幾路 4K、在家開會。",
          "要穿牆拉線同預約師傅，舊樓或者業主唔同意可能裝唔到。",
        ],
      },
      {
        heading: "5G 家居寬頻",
        paragraphs: [
          "路由器插電就用，啱村屋、租樓、等光纖期間嘅後備。",
          "多數計劃有高速數據上限，之後會降速或者降低優先權；附近人多，繁忙時間會慢啲。",
        ],
      },
      {
        heading: "一個簡單法則",
        paragraphs: [
          "可以拉光纖就優先光纖。拉唔到、要即日上網，先睇 5G 家居。預算夠可以兩條線：光纖主用、5G 後備。",
        ],
      },
      {
        heading: "適用情境",
        paragraphs: [
          "長住、要穩、要上傳：優先光纖。租樓、等安裝、未有光纖：先睇 5G 家居。村屋兩條路都可能要問，唔好假設一定有線。",
          "要即日上網或者業主唔批准拉線，5G 家居先有機會；但繁忙時間同室內擺位都會影響，唔好當固定光纖。",
        ],
      },
      {
        heading: "數據上限",
        paragraphs: [
          "5G 家居好多時有高速 GB，用完會降速或降低優先權。光纖入屋通常按該計劃條款提供本地用量，細節以合約為準。",
        ],
      },
      {
        heading: "村屋／未有光纖",
        paragraphs: [
          "村屋光纖唔等於公屋價，亦唔等於一定拉到。現場環境、村路、入線都要電訊商確認。可以同 5G 家居一齊比較，需要就約視察。見 [村屋寬頻點算](/guides/village)、[實地視察同測 5G](/guides/village-onsite)。",
          "實際覆蓋、安裝期同月費以電訊商確認為準。",
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Fibre to the home",
        paragraphs: [
          "FTTH starts from 1000M with low latency. It suits cloud backup, several 4K streams and video calls from home.",
          "A technician has to run a line through walls. Older buildings or a landlord who says no can block install.",
        ],
      },
      {
        heading: "5G home broadband",
        paragraphs: [
          "Plug in a router. Useful for village houses, rentals, and as a backup while you wait for fibre.",
          "Most plans have a high-speed data cap, then slow down or deprioritise. Busy cells nearby can be slower at peak hours.",
        ],
      },
      {
        heading: "A simple rule",
        paragraphs: [
          "If fibre can be installed, pick fibre. If it cannot, or you need internet today, look at 5G home. If budget allows, use fibre as primary and 5G as backup.",
        ],
      },
    ],
    related: ["fiber", "home5g", "village"],
    plans: [
      { href: "/plans?cat=broadband", label: "去光纖格價" },
      { href: "/plans?cat=home5g", label: "去 5G 家居格價" },
    ],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/village", label: "村屋點算" },
    ],
  },
  {
    slug: "village",
    minutes: 6,
    category: "fiber",
    seoTitle: "村屋／丁屋寬頻點算｜齊Quote",
    h1: "村屋／丁屋寬頻點算",
    description: "村屋光纖唔等於公屋價，可能要現場視察。覆蓋同安裝以電訊商確認為準。",
    title: "村屋／丁屋寬頻點算",
    excerpt: "覆蓋點查、5G 家居同光纖到村實際有咩分別。",
    titleEn: "Broadband for village houses",
    excerptEn: "How to check coverage, and how 5G home differs from fibre to the village.",
    body: [
      {
        heading: "先問覆蓋，唔好淨睇月費",
        paragraphs: [
          "新界村屋光纖到屋睇條村、條街甚至左右鄰。報價一定要填完整地址，我哋先可以幫你問裝唔裝到。",
        ],
      },
      {
        heading: "5G 家居係常見方案",
        paragraphs: [
          "未有光纖嘅村屋、唐樓，5G 家居插電就用。記住問清楚高速 GB 同繁忙時間表現。",
        ],
      },
      {
        heading: "村屋光纖唔係公屋價",
        paragraphs: [
          "公屋／居屋有時有指定批量計劃；村屋多數係另一批報價，月費、安裝費、完工期都可以唔同。齊Quote 分開列出參考，唔好用屋邨價去估丁屋。",
        ],
      },
      {
        heading: "可能要現場",
        paragraphs: [
          "拉線路經、井蓋、天台機位，網上相睇唔晒。需要就約 [實地視察同現場測 5G](/guides/village-onsite)，再決定主用光纖定 5G 家居。",
          "實際覆蓋、安裝期同月費以電訊商確認為準，唔好假設一定有線。",
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Check coverage first, not just the fee",
        paragraphs: [
          "Fibre to a New Territories village house depends on the village, the street, even the house next door. Give the full address on a quote so we can ask whether it can be installed.",
        ],
      },
      {
        heading: "5G home is a common option",
        paragraphs: [
          "Village houses and tong lau without fibre can use 5G home — plug in and go. Ask about the high-speed GB cap and peak-hour performance.",
        ],
      },
    ],
    related: ["village-onsite", "fiber", "fiber-vs-5g"],
    plans: [
      { href: "/plans?cat=broadband&housing=village", label: "村屋光纖計劃" },
      { href: "/plans?cat=home5g", label: "5G 家居格價" },
    ],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/village-onsite", label: "實地視察" },
    ],
  },
  {
    slug: "village-onsite",
    minutes: 4,
    category: "fiber",
    seoTitle: "村屋寬頻實地視察同測 5G｜齊Quote",
    h1: "村屋寬頻：實地視察同現場測 5G",
    description: "村屋光纖好唔好裝、5G 家居夠唔夠穩，可約落場睇或測訊號。建議只供參考，以電訊商確認為準。",
    title: "村屋寬頻：實地視察同現場測 5G",
    excerpt: "村屋光纖好唔好裝、5G 家居夠唔夠穩——可約落場睇，或帶路由器去地址測訊號，再俾建議。",
    titleEn: "Village broadband: on-site fibre check and 5G signal test",
    excerptEn:
      "Not sure whether fibre is worth installing at a village house, or whether 5G home is stable enough? We can visit, or bring a router to test the signal, then advise.",
    related: ["village", "fiber-vs-5g"],
    plans: [{ href: "/plans?cat=broadband&housing=village", label: "村屋光纖計劃" }],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/village", label: "村屋點算" },
    ],
    cta: {
      lead: "僅供參考。想約視察或測 5G，用 WhatsApp 查核報價／約時間。",
      leadEn: "For reference only. To book a visit or 5G test, WhatsApp us to check the quote and arrange a time.",
      button: "WhatsApp 約視察／測訊號",
      buttonEn: "WhatsApp to book a visit / 5G test",
      waText:
        "你好，我想約村屋實地視察／現場測 5G。完整地址：（請填）想視察：光纖／測 5G／兩樣",
      waTextEn:
        "Hi, I would like to book a village-house on-site fibre check / 5G signal test. Full address: (please fill in) I want: fibre inspection / 5G test / both",
    },
    body: [
      {
        heading: "點解要落場",
        paragraphs: [
          "村／街／左右鄰都可能唔同。網上難一次講死。",
          "有需要就約去地址睇，再按現場俾建議。",
        ],
      },
      {
        heading: "光纖視察",
        paragraphs: [
          "約現場睇路綫同環境；之後講觀察同建議下一步。",
          "計劃當參考，以查核／申請為準。",
        ],
      },
      {
        heading: "5G 測訊號",
        paragraphs: [
          "帶 5G 家居路由器去你地址開機睇表現同擺位；按結果建議主用定後備。",
          "測試亦係參考。",
        ],
      },
      {
        heading: "視察同測訊號之後",
        paragraphs: [
          "視察／測訊號後只係**建議**；實際安裝同申請結果**以電訊商確認為準**；月費／覆蓋繼續「參考＋查核報價」。",
        ],
      },
      {
        heading: "點約",
        paragraphs: [
          "WhatsApp 報完整地址＋想視察光纖／測 5G／兩樣。",
          "可先睇網上記錄計劃，村屋建議查核／視察定案。",
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Why visit",
        paragraphs: [
          "The village, the street, even the house next door can be different. It is hard to settle this online in one go.",
          "If needed, we book a visit and advise from what we see on site.",
        ],
      },
      {
        heading: "Fibre inspection",
        paragraphs: [
          "We look at the route and the site. Afterwards we share what we observed and suggest the next step.",
          "Plans on the site are for reference; confirmation and application decide.",
        ],
      },
      {
        heading: "5G signal test",
        paragraphs: [
          "We bring a 5G home router to your address, power it up, and check performance and placement. From the result we advise whether to use it as primary or backup.",
          "The test is also for reference.",
        ],
      },
      {
        heading: "After the visit",
        paragraphs: [
          "A visit or signal test is **advice** only. Actual installation and application results are **confirmed by the carrier**. Fees and coverage stay “reference + check quote”.",
        ],
      },
      {
        heading: "How to book",
        paragraphs: [
          "WhatsApp us the full address and whether you want a fibre inspection, a 5G test, or both.",
          "You can browse the plans listed on the site first; for village houses we suggest confirming with a coverage check or an on-site visit.",
        ],
      },
    ],
  },
];

export const GUIDES: Guide[] = [...CORE_GUIDES, ...GUIDE_ARTICLES];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}

export function guideCopy(guide: Guide, locale: "zh" | "en") {
  if (locale === "en") {
    return {
      title: guide.titleEn,
      h1: guide.h1En ?? guide.titleEn,
      excerpt: guide.excerptEn,
      description: guide.descriptionEn ?? guide.excerptEn,
      body: guide.bodyEn,
      ctaLead: guide.cta?.leadEn,
      ctaButton: guide.cta?.buttonEn,
      waText: guide.cta?.waTextEn,
    };
  }
  return {
    title: guide.title,
    h1: guide.h1,
    excerpt: guide.excerpt,
    description: guide.description,
    body: guide.body,
    ctaLead: guide.cta?.lead,
    ctaButton: guide.cta?.button,
    waText: guide.cta?.waText,
  };
}
