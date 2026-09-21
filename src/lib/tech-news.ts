export type TechNewsCategoryId = "telecom" | "phones" | "gadgets" | "gaming";

export type TechNewsSection = {
  heading: string;
  headingEn: string;
  paragraphs: string[];
  paragraphsEn: string[];
};

export type TechNewsCategory = {
  id: TechNewsCategoryId;
  slug: TechNewsCategoryId;
  label: string;
  labelEn: string;
  excerpt: string;
  excerptEn: string;
  image: string;
  planCat?: "broadband" | "home5g" | "mobile" | "business";
};

export type TechNewsArticle = {
  slug: string;
  category: TechNewsCategoryId;
  minutes: number;
  published: string;
  seoTitle: string;
  h1: string;
  description: string;
  excerpt: string;
  seoTitleEn: string;
  h1En: string;
  descriptionEn: string;
  excerptEn: string;
  bullets: string[];
  bulletsEn: string[];
  body: TechNewsSection[];
  tags: string[];
  tagsEn: string[];
  editorNote: string;
  editorNoteEn: string;
  related?: string[];
};

export const TECH_NEWS_SEO = {
  title: "齊Quote｜電訊同科技新聞",
  description:
    "齊Quote 獨立電訊同科技新聞：香港 5G 同寬頻優惠、出機續約、實用科技同電玩情報。內容僅供參考，實際月費同規格以電訊商確認為準。",
} as const;

export const TECH_NEWS_CATEGORIES: readonly TechNewsCategory[] = [
  {
    id: "telecom",
    slug: "telecom",
    label: "電訊與上網優惠",
    labelEn: "Telecom & mobile",
    excerpt: "5G 計劃、續約、SIM、寬頻同漫遊更新。月費以電訊商確認為準。",
    excerptEn: "5G plans, renewals, SIMs, broadband and roaming. Fees are confirmed by the carrier.",
    image: "/images/cat-broadband.jpg",
    planCat: "broadband",
  },
  {
    id: "phones",
    slug: "phones",
    label: "旗艦手機與硬件",
    labelEn: "Phones & hardware",
    excerpt: "新機發佈、出機續約要注意嘅規格同價錢，唔當官價表。",
    excerptEn: "Launches and contract handsets. Specs and prices are not a price list.",
    image: "/images/cat-mobile.jpg",
    planCat: "mobile",
  },
  {
    id: "gadgets",
    slug: "gadgets",
    label: "科技與生活應用",
    labelEn: "Tech & gadgets",
    excerpt: "實用 App、網絡安全同家居數碼產品情報。",
    excerptEn: "Useful apps, network security and home gadgets.",
    image: "/images/cat-home5g.jpg",
  },
  {
    id: "gaming",
    slug: "gaming",
    label: "電玩娛樂情報",
    labelEn: "Gaming & entertainment",
    excerpt: "主機同手遊情報，以及電訊商遊戲數據包點樣核對。",
    excerptEn: "Console and mobile-game news, and how to check carrier gaming data packs.",
    image: "/images/cat-business.jpg",
  },
] as const;

export const TECH_NEWS_ARTICLES: readonly TechNewsArticle[] = [
  {
    slug: "how-we-cover",
    category: "telecom",
    minutes: 4,
    published: "2026-09-21",
    seoTitle: "齊Quote 電訊新聞點寫｜價錢同規格點核對",
    h1: "齊Quote 電訊新聞點寫：價錢同規格點核對",
    description:
      "齊Quote 電訊新聞點樣寫、點核對月費同規格，同報價站有咩分別。內容僅供參考，實際條款以電訊商確認為準。",
    excerpt: "新聞頻道獨立於報價篩選。價錢、日期、規格只跟來源，估唔到就唔寫死。",
    seoTitleEn: "How ChaiQuote covers telecom news | 齊Quote",
    h1En: "How ChaiQuote writes telecom news, and how we check fees",
    descriptionEn:
      "How the ChaiQuote news channel is written, how fees and specs are checked, and how it differs from the quote desk. Terms are confirmed by the carrier.",
    excerptEn: "The news channel is separate from plan filters. Fees, dates and specs follow the source; we do not invent them.",
    bullets: [
      "新聞頁同報價篩選分開，唔會當成即時價表。",
      "月費、日期、規格只可以來自官方或者已標明嘅來源。",
      "電訊優惠稿會連去齊Quote 計劃卡，方便你核對覆蓋。",
      "而家先人手出稿；自動抓稿稍後先加，而且要人批先上線。",
    ],
    bulletsEn: [
      "News is separate from the quote filter and is not a live price list.",
      "Fees, dates and specs come from a named source.",
      "Telecom offer pieces link back to ChaiQuote plan cards so you can check coverage.",
      "Publishing is manual for now. Auto-ingest comes later, and still needs approval.",
    ],
    body: [
      {
        heading: "呢個頻道寫咩",
        headingEn: "What this channel covers",
        paragraphs: [
          "齊Quote 電訊新聞寫香港寬頻、5G 家居、手機月費、出機續約，以及同上網有關嘅科技同電玩情報。目標係幫你判斷一則優惠值唔值得核對，而唔係代替電訊商合約。",
          "報價站仍然負責屋苑、樓類、轉台同計劃卡。新聞頁負責講清楚「發生咗咩事、對續約或者轉台客有咩影響」。",
        ],
        paragraphsEn: [
          "ChaiQuote tech news covers Hong Kong broadband, 5G home, mobile plans, handset contracts, and related gadgets or games. The aim is to help you decide whether an offer is worth checking — not to replace a carrier contract.",
          "The quote desk still handles estates, housing type, port-in and plan cards. News explains what changed and what it means for someone renewing or switching.",
        ],
      },
      {
        heading: "價錢同規格點核對",
        headingEn: "How fees and specs are checked",
        paragraphs: [
          "標題月費可以已經扣咗首月、豁免安裝或者預繳回贈。新聞內文會分開寫「標價」同「要問清楚嘅條件」，避免把廣告句當成保證。",
          "如果來源無寫死數字，我哋會寫「以電訊商確認為準」，唔會估一個看起來好似真嘅月費。日期、合約期、數據用量同一樣。",
        ],
        paragraphsEn: [
          "A headline fee may already exclude the first month, install waiver or prepaid rebate. Copy will separate the advertised figure from the conditions you still need to ask.",
          "If the source does not state a number, we write that the carrier confirms it. We do not invent a fee, date, contract length or data quota.",
        ],
      },
      {
        heading: "同報價站點分工",
        headingEn: "How it sits next to the quote desk",
        paragraphs: [
          "睇完新聞如果想對實你個地址，用 [光纖寬頻報價](/plans?cat=broadband) 或者 [手機月費](/plans?cat=mobile) 篩選。新聞唔會改你已揀嘅轉台條件。",
          "WhatsApp 查核仍然係核對覆蓋同預留禮品，唔係新聞留言區。",
        ],
        paragraphsEn: [
          "After a story, check your address on [fibre quotes](/plans?cat=broadband) or [mobile plans](/plans?cat=mobile). News does not change the port-in filters you already set.",
          "WhatsApp is still for coverage and gifts, not a comments thread.",
        ],
      },
    ],
    tags: ["電訊新聞", "香港寬頻報價", "5G月費", "齊Quote"],
    tagsEn: ["telecom news", "Hong Kong broadband", "5G plans", "ChaiQuote"],
    editorNote:
      "而家呢個頻道先開四個專區同樣板稿，證實獨立頁同 SEO 位。自動 RSS 稍後先接；電訊價錢類永遠要人睇過先出街。",
    editorNoteEn:
      "This launch is four desks plus sample copy, to prove the independent URL and SEO slot. RSS ingest comes later. Telecom fee stories will always need a human pass.",
    related: ["read-offer-news"],
  },
  {
    slug: "read-offer-news",
    category: "telecom",
    minutes: 5,
    published: "2026-09-21",
    seoTitle: "點睇電訊優惠新聞｜先唔好只睇標題月費",
    h1: "點睇電訊優惠新聞，先唔好只睇標題月費",
    description:
      "香港電訊優惠新聞點睇：標題月費、預繳、合約期同覆蓋要分開核對。內容僅供參考，實際條款以電訊商確認為準。",
    excerpt: "標題月費可以好吸引。先問預繳、合約、路由器同你條地址有冇線。",
    seoTitleEn: "How to read a telecom offer story | 齊Quote",
    h1En: "How to read a telecom offer story without trusting the headline fee",
    descriptionEn:
      "How to read Hong Kong telecom offer news: separate the headline fee from prepaid, contract length and coverage. Terms are confirmed by the carrier.",
    excerptEn: "A headline fee can look sharp. Ask about prepaid, contract, router and whether your address is covered.",
    bullets: [
      "標題月費未必等於你每個月實付。",
      "預繳、回贈同豁免安裝要分開計。",
      "覆蓋同樓類（公屋、居屋、私樓、村屋）先決定有冇呢個計劃。",
      "核對完再用齊Quote 篩選，唔好只轉發截圖。",
    ],
    bulletsEn: [
      "The headline fee is not always what you pay each month.",
      "Prepaid, rebates and install waivers should be counted separately.",
      "Coverage and housing type decide whether the plan exists for you.",
      "Check on ChaiQuote after you read; do not forward a screenshot as a quote.",
    ],
    body: [
      {
        heading: "標題月費通常已經包裝過",
        headingEn: "Headline fees are usually packaged",
        paragraphs: [
          "優惠新聞成日寫「月費 $98」或者「轉台送兩個月」。呢啲可以係真，但可能已經扣咗首月、行政費豁免，或者要預繳之後先每月回贈。新聞只可以轉述來源，唔能夠當成你地址嘅報價。",
          "香港寬頻、網上行、數碼通、中國移動香港同 3香港嘅公開優惠會變。見到舊圖，先對稿件日期。",
        ],
        paragraphsEn: [
          "Offer stories often lead with a low monthly fee or free months on port-in. That can be accurate and still hide a prepaid rebate or waived admin fee. A news piece can only restate the source. It is not a quote for your address.",
          "Public offers from HKBN, Netvigator, SmarTone, CMHK and 3HK change. Check the article date before you trust an old screenshot.",
        ],
      },
      {
        heading: "四條要問嘅問題",
        headingEn: "Four questions to ask",
        paragraphs: [
          "一、合約幾耐？提早終止點計。二、有冇預繳、安裝費、路由器要還。三、你而家用緊邊間，轉台包唔包括。四、你條地址係公屋、居屋、私樓定村屋。",
          "村屋同部分新盤覆蓋要另查。新聞就算寫「全港」，都唔等於你條村有光纖。",
        ],
        paragraphsEn: [
          "One: how long is the contract, and what is early termination. Two: prepaid, install fee, and whether the router must be returned. Three: which carrier you are on now, and whether port-in is included. Four: public, HOS, private or village housing.",
          "Village houses and some new estates need a separate coverage check. “Hong Kong-wide” in a story does not mean your village has fibre.",
        ],
      },
      {
        heading: "睇完點用齊Quote",
        headingEn: "What to do on ChaiQuote next",
        paragraphs: [
          "用 [光纖寬頻報價](/plans?cat=broadband) 填屋苑同現用台，結果會排除你而家呢間。手機就去 [手機月費](/plans?cat=mobile)。",
          "實際月費、覆蓋、安裝期同禮品，一律 WhatsApp 查核，以電訊商確認為準。",
        ],
        paragraphsEn: [
          "Open [fibre quotes](/plans?cat=broadband), enter the estate and current carrier; results exclude the one you are on. For mobile, use [mobile plans](/plans?cat=mobile).",
          "The carrier confirms the live fee, coverage, install date and gifts. Check on WhatsApp before you sign.",
        ],
      },
    ],
    tags: ["電訊優惠", "寬頻報價", "轉台", "預繳"],
    tagsEn: ["telecom offers", "broadband quotes", "port-in", "prepaid"],
    editorNote:
      "呢篇係方法文，冇寫死任何一間嘅最新月費。你見到具體優惠稿，仍然要以當時電訊商條款為準。",
    editorNoteEn:
      "This is a method piece. It does not lock any carrier’s current fee. A later offer story still follows that day’s carrier terms.",
    related: ["how-we-cover"],
  },
];

export function getTechNewsCategory(slug: string) {
  return TECH_NEWS_CATEGORIES.find((item) => item.slug === slug);
}

export function getTechNewsArticle(slug: string) {
  return TECH_NEWS_ARTICLES.find((item) => item.slug === slug);
}

export function articlesInCategory(id: TechNewsCategoryId) {
  return TECH_NEWS_ARTICLES.filter((item) => item.category === id);
}

export function techNewsCopy(article: TechNewsArticle, locale: "zh" | "en") {
  if (locale === "en") {
    return {
      seoTitle: article.seoTitleEn,
      h1: article.h1En,
      description: article.descriptionEn,
      excerpt: article.excerptEn,
      bullets: article.bulletsEn,
      body: article.body.map((section) => ({
        heading: section.headingEn,
        paragraphs: section.paragraphsEn,
      })),
      tags: article.tagsEn,
      editorNote: article.editorNoteEn,
    };
  }
  return {
    seoTitle: article.seoTitle,
    h1: article.h1,
    description: article.description,
    excerpt: article.excerpt,
    bullets: article.bullets,
    body: article.body.map((section) => ({
      heading: section.heading,
      paragraphs: section.paragraphs,
    })),
    tags: article.tags,
    editorNote: article.editorNote,
  };
}
