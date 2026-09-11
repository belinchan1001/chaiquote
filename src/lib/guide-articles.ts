import type { Guide } from "./guides.ts";

const DISCLAIMER =
  "以上只供參考。實際覆蓋、安裝期、月費、合約同路由器條款，一律以電訊商確認為準，唔好假設一定有線或者一定裝到。";

export const GUIDE_ARTICLES: Guide[] = [
  {
    slug: "fiber",
    minutes: 8,
    category: "fiber",
    seoTitle: "香港光纖寬頻攻略｜公屋居屋私樓村屋比較｜齊Quote",
    h1: "香港光纖寬頻點揀：先分樓類再睇月費",
    description:
      "香港光纖寬頻唔係一張價表。同樣 1000M，公屋、居屋、私樓、村屋月費同計劃通常不同。先分樓類，再對 1000M／2500M 同轉台注意。覆蓋同安裝以電訊商確認為準。",
    title: "香港光纖寬頻點揀：先分樓類再睇月費",
    excerpt: "香港光纖唔係一張價表。先分公屋、居屋、私樓、村屋，再對參考月費同 1000M／2500M。",
    titleEn: "Hong Kong fibre guide: housing type first, then the fee",
    excerptEn:
      "Hong Kong fibre is not one price list. Sort public, HOS, private and village housing first, then compare 1000M and 2500M.",
    descriptionEn:
      "Hong Kong fibre is not one price list. The same 1000M plan is often priced differently for public housing, HOS, private and village homes. Sort the type, then confirm install with the carrier.",
    h1En: "Hong Kong fibre: sort housing type before the monthly fee",
    published: "2026-09-09",
    modified: "2026-09-10",
    related: [
      "fiber-vs-5g",
      "village",
      "public-vs-hos",
      "public-hos-fees",
      "estate-filter",
      "is-1000m-enough",
      "switch-broadband",
      "contract-fees",
      "home5g",
    ],
    plans: [
      { href: "/plans?cat=broadband", label: "去光纖格價" },
      { href: "/plans?cat=home5g", label: "去 5G 家居格價" },
    ],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/estates/tin-yiu", label: "天耀邨" },
      { href: "/estates/taikoo-shing", label: "太古城" },
    ],
    body: [
      {
        heading: "香港光纖不是一張價表",
        paragraphs: [
          "同一句「1000M 光纖」，公屋、居屋、私樓、村屋見到嘅計劃同月費通常唔同。電訊商會按屋苑類型、批量合約、入線路經報價，所以齊Quote 先叫你揀樓類，而唔係丟一張全港劃一價。",
          "網上記錄嘅月費係參考。覆蓋、完工期、豁免安裝費同路由器條款，申請時先由電訊商確認。想一次過對實際計劃，可開 [光纖格價](/plans?cat=broadband)。",
        ],
      },
      {
        heading: "公屋、居屋、私樓、村屋點分",
        paragraphs: [
          "公屋同埋居屋多數有指定批量價，選擇相對集中，記住用對應樓類去篩，唔好用私樓價去估公屋。想知分別可睇 [公屋同居屋有咩分別](/guides/public-vs-hos)。站內列出嘅 1000M 例子見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)。公屋例子：[天耀邨](/estates/tin-yiu)。",
          "私樓選擇通常多啲，合約期、路由器、家居電話組合都較密，例如 [太古城](/estates/taikoo-shing)。村屋係另一批計劃，月費同安裝環境都可以同屋邨差好遠，詳情見 [村屋寬頻點算](/guides/village)。",
        ],
        table: {
          caption: "四類樓點分",
          headers: ["樓類", "點揀"],
          rows: [
            {
              label: "公屋",
              value: "指定批量價，選擇集中。唔好用私樓價去估。",
              href: "/guides/public-vs-hos",
            },
            {
              label: "居屋",
              value: "同樣有批量價，同公屋分開篩，每個屋苑合約可能唔同。",
              href: "/guides/public-vs-hos",
            },
            {
              label: "私樓",
              value: "選擇較多，合約期、路由器、家居電話組合較密。",
              href: "/estates/taikoo-shing",
            },
            {
              label: "村屋",
              value: "另一批計劃，月費同安裝環境都可以同屋邨差好遠。",
              href: "/guides/village",
            },
          ],
        },
      },
      {
        heading: "1000M 同 2500M+ 點揀",
        paragraphs: [
          "一般家庭上網、開會、一兩路 4K，1000M 已經夠用。屋企人多、經常上傳大檔、或者想預留頻寬，先考慮 2500M 或以上。速度唔等於體驗：樓內 Wi-Fi、舊路由器、牆身先影響日常手感。可再睇 [1000M 夠唔夠](/guides/is-1000m-enough)。",
        ],
        table: {
          caption: "1000M 同 2500M+",
          headers: ["速度", "適合"],
          rows: [
            {
              label: "1000M",
              value: "上網、開會、一兩路 4K。一般家庭夠用。",
              href: "/guides/is-1000m-enough",
            },
            {
              label: "2500M+",
              value: "屋企人多、經常上傳大檔，或者想預留頻寬。",
              href: "/guides/is-1000m-enough",
            },
          ],
        },
      },
      {
        heading: "轉台要問清楚嘅四件事",
        paragraphs: [
          "舊約完約日、新線安裝期、可唔可以豁免安裝費、路由器係送出、包用定合約後要還。寬頻唔能夠攜號過台，要新線裝好先停舊台，先唔會斷網。步驟見 [轉寬頻點樣減少斷網](/guides/switch-broadband)。月費以外仲有安裝費、預繳、合約，見 [月費以外](/guides/contract-fees)。",
          DISCLAIMER,
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "返首頁輸入屋苑，或者直接開 [光纖格價](/plans?cat=broadband)。屋苑篩點用見 [齊Quote 點用屋苑篩](/guides/estate-filter)。想比較免拉線方案，可睇 [光纖同 5G 家居點揀](/guides/fiber-vs-5g) 或者 [5G 家居攻略](/guides/home5g)。屋苑例子：[天耀邨](/estates/tin-yiu)、[太古城](/estates/taikoo-shing)；全部屋苑見 [屋苑目錄](/estates)。",
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Fibre is not one price list",
        paragraphs: [
          "The same 1000M fibre offer is usually different for public housing, HOS, private and village homes. Carriers quote by estate type and install path. Open the [fibre compare page](/plans?cat=broadband) for reference plans.",
          "Fees on this site are a reference. Coverage, install dates and router terms are confirmed by the carrier.",
        ],
      },
      {
        heading: "Public, HOS, private, village",
        paragraphs: [
          "Public and HOS housing usually have bulk rates. Do not use a private-estate price to guess a public-estate fee. See [public vs HOS](/guides/public-vs-hos). Listed 1000M examples: [public / HOS 1000M reference fees](/guides/public-hos-fees).",
          "Village houses are a different set of plans. Details: [village broadband](/guides/village).",
        ],
        table: {
          caption: "Housing types",
          headers: ["Type", "How to choose"],
          rows: [
            {
              label: "Public",
              value: "Bulk rates, fewer choices. Do not use private-estate prices.",
              href: "/guides/public-vs-hos",
            },
            {
              label: "HOS",
              value: "Also bulk-rated; filter separately from public housing.",
              href: "/guides/public-vs-hos",
            },
            {
              label: "Private",
              value: "More plans, contracts and router bundles.",
              href: "/estates/taikoo-shing",
            },
            {
              label: "Village",
              value: "Separate plans; install conditions can differ a lot.",
              href: "/guides/village",
            },
          ],
        },
      },
      {
        heading: "1000M vs 2500M+",
        paragraphs: [
          "For browsing, calls and one or two 4K streams, 1000M is usually enough. A busy household or lots of uploads may want 2500M+. See [is 1000M enough](/guides/is-1000m-enough).",
        ],
        table: {
          caption: "1000M vs 2500M+",
          headers: ["Speed", "Best for"],
          rows: [
            {
              label: "1000M",
              value: "Browsing, calls, one or two 4K streams. Enough for most homes.",
              href: "/guides/is-1000m-enough",
            },
            {
              label: "2500M+",
              value: "Busy household, lots of uploads, or spare bandwidth.",
              href: "/guides/is-1000m-enough",
            },
          ],
        },
      },
      {
        heading: "Four things to ask when you switch",
        paragraphs: [
          "Contract end date, install date, install-fee waiver, and whether the router is a gift or must be returned. Broadband cannot port a number. See [switching broadband](/guides/switch-broadband).",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Open the fibre compare page or type your estate on the home page. How to use the estate filter: [estate filter](/guides/estate-filter). To compare a wireless option, see [fibre vs 5G home](/guides/fiber-vs-5g).",
        ],
      },
    ],
    faq: [
      {
        q: "公屋同居屋光纖月費會唔會不同？",
        a: "會。公屋同埋居屋多數有指定批量價，選擇相對集中，唔好用私樓價去估公屋。每個屋邨／屋苑合約都可能唔同，篩選時分開揀，申請時填齊屋苑名稱。詳見 [公屋同居屋有咩分別](/guides/public-vs-hos)。",
      },
      {
        q: "一般家庭 1000M 光纖夠唔夠？",
        a: "上網、開會、一兩路 4K，1000M 已經夠用。屋企人多、經常上傳大檔，先考慮 2500M 或以上。速度亦受樓內 Wi-Fi、路由器同牆身影響。可再睇 [1000M 夠唔夠](/guides/is-1000m-enough)。",
      },
      {
        q: "村屋有冇光纖？",
        a: "有指定計劃，但唔等於公屋價，亦唔等於一定拉到。現場環境、村路、入線都要電訊商確認。拉唔到可以一併比較 [5G 家居](/guides/home5g)。詳見 [村屋寬頻點算](/guides/village)。",
      },
      {
        q: "轉寬頻會唔會斷網？",
        a: "寬頻唔能夠攜號過台。要新線裝好先停舊台，先唔會斷網。問清楚舊約完約日、新線安裝期、豁免安裝費同路由器條款。步驟見 [轉寬頻點樣減少斷網](/guides/switch-broadband)。",
      },
      {
        q: "點樣查核自己屋苑嘅光纖報價？",
        a: "喺齊Quote 輸入屋苑，或者開 [光纖格價](/plans?cat=broadband) 揀樓類，再用 WhatsApp 查核。屋苑篩步驟見 [齊Quote 點用屋苑篩](/guides/estate-filter)。覆蓋、完工期同月費以電訊商確認為準。",
      },
    ],
    faqEn: [
      {
        q: "Are public-housing and HOS fibre fees the same?",
        a: "Usually not. They often have bulk rates and should be filtered separately. See [public vs HOS](/guides/public-vs-hos).",
      },
      {
        q: "Is 1000M enough for a typical home?",
        a: "For browsing, calls and one or two 4K streams, yes. A busier household may want 2500M+. See [is 1000M enough](/guides/is-1000m-enough).",
      },
      {
        q: "Do village houses have fibre?",
        a: "Some do, on separate plans. Coverage and install still need carrier confirmation. See [village broadband](/guides/village).",
      },
      {
        q: "Will switching broadband cut the connection?",
        a: "Broadband cannot port a number. Install the new line first, then stop the old one. See [switching broadband](/guides/switch-broadband).",
      },
      {
        q: "How do I check a quote for my estate?",
        a: "Enter the estate on ChaiQuote or open the [fibre compare page](/plans?cat=broadband), then confirm on WhatsApp. See [how to use the estate filter](/guides/estate-filter). Fees and coverage are confirmed by the carrier.",
      },
    ],
  },
  {
    slug: "home5g",
    minutes: 8,
    category: "home5g",
    seoTitle: "香港5G家居寬頻攻略｜免拉線適唔適合｜齊Quote",
    h1: "香港 5G 家居點揀：免拉線，速度視現場",
    description:
      "香港 5G 家居用流動網絡開家用 Wi-Fi，免拉線、隨插即用。啱未有光纖、租樓、村屋；唔好當固定光纖替代。數據上限、訊號同月費以電訊商確認為準。",
    title: "香港 5G 家居點揀：免拉線，速度視現場",
    excerpt: "插電路由器就用。啱未有光纖、租樓、趕時間；唔好當固定光纖替代。",
    titleEn: "Hong Kong 5G home: no cabling, speed depends on the site",
    excerptEn: "Plug in a router. Useful when fibre is not ready. Not a guaranteed fixed line.",
    descriptionEn:
      "Hong Kong 5G home uses a mobile network for Wi-Fi. Fast to install, but speed depends on the signal and some plans have a data cap. Confirm with the carrier.",
    h1En: "Hong Kong 5G home: no cabling, speed depends on the site",
    published: "2026-09-09",
    modified: "2026-09-10",
    related: ["fiber-vs-5g", "village", "village-onsite", "fiber", "is-1000m-enough"],
    plans: [
      { href: "/plans?cat=home5g", label: "去 5G 家居格價" },
      { href: "/plans?cat=broadband", label: "去光纖格價" },
    ],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/village", label: "村屋點算" },
    ],
    body: [
      {
        heading: "5G 家居唔係光纖",
        paragraphs: [
          "5G 家居用流動網絡開家用 Wi-Fi：插電、擺好路由器，就開到熱點。唔使穿牆拉線，安裝通常快過等師傅。速度同穩定度跟現場訊號、室內擺位、附近用量走，而唔係跟一條固定光纖。",
          "報價時仍然要填屋苑或者街道。訊號同可唔可以申請，都視現場，唔好假設全港每個地址都一樣。想兩邊對，見 [光纖同 5G 家居點揀](/guides/fiber-vs-5g)。",
        ],
      },
      {
        heading: "適合邊種情況",
        paragraphs: [
          "未有光纖、租樓、趕住上網，或者等光纖期間當後備，5G 家居先有機會。村屋／丁屋如果入線困難，亦常見一齊比較。長住、要穩定上傳、長開鏡頭開會，仍然優先問光纖——如果現場裝到。",
        ],
        table: {
          caption: "邊種情況先睇 5G 家居",
          headers: ["情況", "點揀"],
          rows: [
            {
              label: "租樓／趕時間",
              value: "插電就用，唔使等穿牆。業主唔批准拉線時常見選擇。",
              href: "/guides/fiber-vs-5g",
            },
            {
              label: "未有光纖／等安裝",
              value: "可以當過渡。有光纖之後，多數人會轉返固定線。",
              href: "/guides/fiber",
            },
            {
              label: "村屋／丁屋",
              value: "入線視現場。光纖同 5G 家居一齊問，需要就約視察。",
              href: "/guides/village",
            },
            {
              label: "長住要穩",
              value: "優先問光纖。5G 家居適合後備，唔好當固定線替代。",
              href: "/guides/fiber",
            },
          ],
        },
      },
      {
        heading: "數據上限同速度",
        paragraphs: [
          "部分計劃有高速數據上限，用完會降速或者降低優先權。繁忙時間、附近用戶多、室內擺位差，體感都會變。廣告上嘅「最高速度」唔等於你屋企每個鐘都係嗰個數。",
          "比較時一齊睇：月費、合約、高速 GB、包定租路由器、冷靜期。詳情見 [月費以外](/guides/contract-fees)。",
        ],
      },
      {
        heading: "同光纖點揀",
        paragraphs: [
          "可以拉光纖就優先光纖。拉唔到、要即日上網，先睇 5G 家居。預算夠可以兩條線：光纖主用、5G 後備。村屋兩邊都可能要問，見 [村屋寬頻點算](/guides/village)、[實地視察同測 5G](/guides/village-onsite)。",
        ],
        table: {
          caption: "光纖 vs 5G 家居",
          headers: ["方案", "重點"],
          rows: [
            {
              label: "光纖",
              value: "固定線、延遲低。要穿牆同預約師傅，舊樓或業主唔同意可能裝唔到。",
              href: "/guides/fiber",
            },
            {
              label: "5G 家居",
              value: "免拉線、安裝快。速度視訊號，部分計劃有高速數據上限。",
              href: "/guides/fiber-vs-5g",
            },
          ],
        },
      },
      {
        heading: "下一步",
        paragraphs: [
          "開 [5G 家居格價](/plans?cat=home5g)，填地址再 WhatsApp 查核。可以拉線就一併睇 [光纖格價](/plans?cat=broadband)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "5G home is not fibre",
        paragraphs: [
          "5G home is a plug-in router on the mobile network. Install is usually faster than waiting for a technician, but speed follows the local signal.",
        ],
      },
      {
        heading: "When it fits",
        paragraphs: [
          "Useful for rentals, sites without fibre, and as a stopgap. Village houses often compare both. For a long stay with stable uploads, ask about fibre first.",
        ],
        table: {
          caption: "When to look at 5G home",
          headers: ["Situation", "How to choose"],
          rows: [
            {
              label: "Rental / in a hurry",
              value: "Plug in. Common when the landlord will not allow cabling.",
              href: "/guides/fiber-vs-5g",
            },
            {
              label: "No fibre yet",
              value: "A stopgap. Many people switch to a fixed line later.",
              href: "/guides/fiber",
            },
            {
              label: "Village house",
              value: "Coverage is site-by-site. Compare fibre and 5G home together.",
              href: "/guides/village",
            },
            {
              label: "Long stay, need stability",
              value: "Ask for fibre first. Treat 5G home as backup.",
              href: "/guides/fiber",
            },
          ],
        },
      },
      {
        heading: "Data caps and speed",
        paragraphs: [
          "Some plans cap high-speed data, then slow down or deprioritise. Peak hours and indoor placement also change the feel.",
        ],
      },
      {
        heading: "Fibre or 5G home",
        paragraphs: [
          "If fibre can be installed, pick fibre. If not, or you need internet today, look at 5G home. See [fibre vs 5G home](/guides/fiber-vs-5g).",
        ],
        table: {
          caption: "Fibre vs 5G home",
          headers: ["Option", "Notes"],
          rows: [
            {
              label: "Fibre",
              value: "Fixed line, low latency. Needs a technician and building access.",
              href: "/guides/fiber",
            },
            {
              label: "5G home",
              value: "No cabling. Speed depends on signal; some plans have a data cap.",
              href: "/guides/fiber-vs-5g",
            },
          ],
        },
      },
      {
        heading: "Next step",
        paragraphs: [
          "Open the [5G home compare page](/plans?cat=home5g) and confirm on WhatsApp. Coverage and fees are confirmed by the carrier.",
        ],
      },
    ],
    faq: [
      {
        q: "5G 家居同光纖有咩分別？",
        a: "光纖係固定線，延遲低，要穿牆同預約師傅。5G 家居用流動網絡，插電就用，速度視現場訊號。可以拉光纖就優先光纖。詳見 [光纖同 5G 家居點揀](/guides/fiber-vs-5g)。",
      },
      {
        q: "5G 家居有冇數據上限？",
        a: "部分計劃有高速 GB，用完會降速或降低優先權。比較時一齊睇月費、合約同路由器係包定租。實際條款以電訊商確認為準。",
      },
      {
        q: "村屋可唔可以申請 5G 家居？",
        a: "好多時可以問，但訊號同可唔可以申請都視現場，唔好假設條村一定得。光纖同 5G 家居一齊比較，需要就約視察。見 [村屋寬頻點算](/guides/village)。",
      },
      {
        q: "5G 家居速度穩唔穩？",
        a: "繁忙時間、附近用戶多、室內擺位差，速度同穩定度都會變。長開鏡頭開會或者大量上傳，優先仍然係光纖（如果裝到）。",
      },
      {
        q: "點樣查核 5G 家居報價？",
        a: "喺齊Quote 填地址，開 [5G 家居格價](/plans?cat=home5g)，再用 WhatsApp 查核。覆蓋、數據上限同月費以電訊商確認為準。",
      },
    ],
    faqEn: [
      {
        q: "How is 5G home different from fibre?",
        a: "Fibre is a fixed line. 5G home is wireless. If fibre can be installed, pick fibre. See [fibre vs 5G home](/guides/fiber-vs-5g).",
      },
      {
        q: "Does 5G home have a data cap?",
        a: "Some plans cap high-speed data, then slow down. Confirm the contract with the carrier.",
      },
      {
        q: "Can a village house apply?",
        a: "Often you can ask, but signal is site-by-site. See [village broadband](/guides/village).",
      },
      {
        q: "Is the speed stable?",
        a: "Peak hours and indoor placement change it. For stable uploads, ask about fibre first.",
      },
      {
        q: "How do I check a quote?",
        a: "Open the [5G home compare page](/plans?cat=home5g) and confirm on WhatsApp.",
      },
    ],
  },
  {
    slug: "mobile",
    minutes: 8,
    category: "mobile",
    seoTitle: "香港手機月費攻略｜4G 5G 大灣區轉台｜齊Quote",
    h1: "香港手機月費點揀：先分本地、5G、大灣區",
    description:
      "香港手機月費唔好一睇標價。先分本地數據、4G／5G，再決定大灣區同轉台。攜號轉台唔好提早取消舊約。實際月費、數據、轉台優惠同生效日以電訊商確認為準。",
    title: "香港手機月費點揀：先分本地、5G、大灣區",
    excerpt: "本地夠用先加漫遊或者大灣區。轉台見攜號轉台攻略。",
    titleEn: "Hong Kong mobile plans: local, 5G, then Greater Bay Area",
    excerptEn: "Cover local data first, then roaming or GBA. See the port-in guide to switch numbers.",
    descriptionEn:
      "Compare local data, 4G/5G, Greater Bay Area usage and port-in notes. Real plans are on the mobile compare page. The carrier confirms fees and activation.",
    h1En: "Hong Kong mobile plans: local data first, then 5G and GBA",
    published: "2026-09-09",
    modified: "2026-09-10",
    related: ["port-in", "gba-mobile", "contract-fees", "fiber-vs-5g"],
    plans: [{ href: "/plans?cat=mobile", label: "去手機格價" }],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/port-in", label: "攜號轉台" },
    ],
    body: [
      {
        heading: "先睇本地夠唔夠",
        paragraphs: [
          "揀手機月費，第一步係本地數據同網絡世代（4G／5G），而唔係先加一堆漫遊。日常通勤、短片、地圖，多數人用本地用量就處理到。用量好大、成日出外，先考慮更高本地 GB 或者 5G 優先。",
          "實際計劃見 [手機格價](/plans?cat=mobile)。月費以外仲有行政費、預繳、合約，見 [月費以外](/guides/contract-fees)。",
        ],
      },
      {
        heading: "4G 同 5G 點分",
        paragraphs: [
          "5G 喺覆蓋得到嘅地方，下載同低延遲通常好過 4G，但月費同手機都要支援。覆蓋唔到 5G 嘅地方，張卡會跌返 4G。唔好只睇「5G」兩個字，要問實際覆蓋同本地 GB。",
        ],
        table: {
          caption: "4G 同 5G",
          headers: ["網絡", "點揀"],
          rows: [
            {
              label: "4G／4.5G",
              value: "日常短片、地圖、通訊夠用。月費通常較入門。",
              href: "/plans?cat=mobile",
            },
            {
              label: "5G",
              value: "覆蓋得到先有體感分別。用量大、要低延遲先值得加。",
              href: "/plans?cat=mobile",
            },
          ],
        },
      },
      {
        heading: "大灣區同漫遊",
        paragraphs: [
          "大灣區、內地數據係額外一層：邊度用、點計額度、會唔會另收費，要睇條款，唔好當「無限中國」。本地 GB 同跨境 GB 好多時分開計。詳情見 [大灣區手機計劃要注意咩](/guides/gba-mobile)。",
        ],
        table: {
          caption: "本地、大灣區、轉台",
          headers: ["項目", "重點"],
          rows: [
            {
              label: "本地數據",
              value: "日常用量嘅底。先夠本地，先加跨境。",
              href: "/plans?cat=mobile",
            },
            {
              label: "大灣區",
              value: "指定區域同額度，用完可能降速或另收費。",
              href: "/guides/gba-mobile",
            },
            {
              label: "攜號轉台",
              value: "留舊號碼轉去新台。唔好提早自己取消舊約。",
              href: "/guides/port-in",
            },
          ],
        },
      },
      {
        heading: "轉台",
        paragraphs: [
          "想留舊號碼，用攜號轉台，而唔好自己提早取消舊約。新 SIM 未生效前，舊卡仍然用得。流程、生效同行政費見 [攜號轉台點樣做](/guides/port-in)。",
          "寬頻轉台同手機唔同：寬頻唔能夠攜號過台，見 [轉寬頻點樣減少斷網](/guides/switch-broadband)。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "開 [手機格價](/plans?cat=mobile)，用 WhatsApp 查核報價。實際月費、數據同轉台優惠以電訊商確認為準。",
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Local data first",
        paragraphs: [
          "Cover local 4G/5G usage first, then add Greater Bay Area or roaming if you need it.",
        ],
      },
      {
        heading: "4G vs 5G",
        paragraphs: [
          "5G is faster where coverage exists. The phone must support it. Outside 5G areas the SIM falls back to 4G.",
        ],
        table: {
          caption: "4G and 5G",
          headers: ["Network", "How to choose"],
          rows: [
            {
              label: "4G / 4.5G",
              value: "Enough for clips, maps and chat. Usually the cheaper start.",
              href: "/plans?cat=mobile",
            },
            {
              label: "5G",
              value: "Worth it for heavy use and lower latency, where coverage exists.",
              href: "/plans?cat=mobile",
            },
          ],
        },
      },
      {
        heading: "Greater Bay Area and roaming",
        paragraphs: [
          "Local and GBA quotas are often separate. Do not treat it as unlimited China data. See [GBA mobile](/guides/gba-mobile).",
        ],
        table: {
          caption: "Local, GBA, port-in",
          headers: ["Item", "Notes"],
          rows: [
            {
              label: "Local data",
              value: "The base. Cover local use before adding cross-border data.",
              href: "/plans?cat=mobile",
            },
            {
              label: "Greater Bay Area",
              value: "A defined zone and quota. Extra fees may apply after the cap.",
              href: "/guides/gba-mobile",
            },
            {
              label: "Port-in",
              value: "Keep your number. Do not cancel the old contract early.",
              href: "/guides/port-in",
            },
          ],
        },
      },
      {
        heading: "Switching",
        paragraphs: [
          "Use number porting to keep your number. See [port-in](/guides/port-in).",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Open the [mobile compare page](/plans?cat=mobile) and confirm on WhatsApp.",
        ],
      },
    ],
    faq: [
      {
        q: "揀手機月費要先睇咩？",
        a: "先睇本地數據同 4G／5G，夠用先加漫遊或者大灣區。實際計劃見 [手機格價](/plans?cat=mobile)。",
      },
      {
        q: "4G 同 5G 差喺邊？",
        a: "5G 喺覆蓋得到嘅地方下載同低延遲通常好過 4G，但手機同月費都要支援。覆蓋唔到會跌返 4G。",
      },
      {
        q: "大灣區數據係咪無限用內地？",
        a: "唔係。通常有指定區域同額度，本地同跨境好多時分開計。用完可能降速或另收費。見 [大灣區手機計劃](/guides/gba-mobile)。",
      },
      {
        q: "攜號轉台會唔會斷線？",
        a: "新 SIM 未生效前，舊卡仍然用得。唔好提早自己取消舊約。流程見 [攜號轉台點樣做](/guides/port-in)。",
      },
      {
        q: "點樣比較手機報價？",
        a: "開 [手機格價](/plans?cat=mobile)，再用 WhatsApp 查核。月費、數據同轉台優惠以電訊商確認為準。",
      },
    ],
    faqEn: [
      {
        q: "What should I check first on a mobile plan?",
        a: "Local data and 4G/5G first, then GBA or roaming. See the [mobile compare page](/plans?cat=mobile).",
      },
      {
        q: "What is the difference between 4G and 5G?",
        a: "5G is faster where coverage exists. Outside those areas the SIM falls back to 4G.",
      },
      {
        q: "Is Greater Bay Area data unlimited in the mainland?",
        a: "No. It is a defined zone and quota. See [GBA mobile](/guides/gba-mobile).",
      },
      {
        q: "Will porting my number cut service?",
        a: "Keep the old SIM until the new one is active. See [port-in](/guides/port-in).",
      },
      {
        q: "How do I compare quotes?",
        a: "Open the [mobile compare page](/plans?cat=mobile) and confirm on WhatsApp.",
      },
    ],
  },
  {
    slug: "business",
    minutes: 8,
    category: "business",
    seoTitle: "香港商業寬頻攻略｜店舖寫字樓點申請｜齊Quote",
    h1: "香港商業寬頻點揀：店舖同寫字樓唔好用家居計劃",
    description:
      "香港店舖、寫字樓、工作室要用商業寬頻，唔好用家居公屋價去舖頭申請。固定 IP、安裝窗口、商業登記都要問清楚。月費、覆蓋同安裝期以電訊商確認為準。",
    title: "香港商業寬頻點揀：店舖同寫字樓唔好用家居計劃",
    excerpt: "舖址、商業登記、固定 IP 同支援時間都同家居唔同。",
    titleEn: "Hong Kong business broadband: do not use a home plan for a shop",
    excerptEn: "Shop and office lines need a business address, and often a static IP.",
    descriptionEn:
      "Hong Kong shops and offices need business fibre. Address, static IP, install window and support differ from home plans. Confirm against the commercial address.",
    h1En: "Hong Kong business broadband: shops and offices should not use home plans",
    published: "2026-09-09",
    modified: "2026-09-10",
    related: ["shop-broadband", "contract-fees", "fiber", "switch-broadband"],
    plans: [{ href: "/plans?cat=business", label: "去商業寬頻格價" }],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/shop-broadband", label: "店舖申請清單" },
    ],
    inquiry: { estate: "商業寬頻" },
    body: [
      {
        heading: "點解唔能直接用家居價",
        paragraphs: [
          "家居公屋／居屋計劃通常綁住宅地址。店舖、寫字樓、工作室要用商業寬頻。登記、合約、支援時間同安裝窗口都唔同，強行用家居價去舖頭，申請多數會被拒絕或者後期要改約。",
          "正確入口係 [商業寬頻格價](/plans?cat=business)，而唔係套用住宅篩選。",
        ],
      },
      {
        heading: "店舖、寫字樓、工作室",
        paragraphs: [
          "營業地址先決定入線同管理處批文。住宅地下改舖、工廈、商場舖，手續都可以唔同。報價一定要寫營業地址，而唔係老闆屋企。清單見 [店舖申請商業寬頻要準備咩](/guides/shop-broadband)。",
        ],
        table: {
          caption: "商用地址點分",
          headers: ["類型", "要問"],
          rows: [
            {
              label: "店舖／商場舖",
              value: "管理處批文、安裝窗口、非辦公時間可能另計。",
              href: "/guides/shop-broadband",
            },
            {
              label: "寫字樓",
              value: "大廈電訊房、固定 IP、辦公時間支援較常見。",
              href: "/guides/shop-broadband",
            },
            {
              label: "工作室／工廈",
              value: "入線同用途限制視大廈。先查覆蓋再補文件。",
              href: "/guides/shop-broadband",
            },
          ],
        },
      },
      {
        heading: "固定 IP、安裝、支援",
        paragraphs: [
          "收銀機、VPN、鏡頭、郵件伺服器可能需要固定 IP，家居動態 IP 未必夠。1000M 起跳係常見起步，實際上傳同穩定度先對到日常營運。",
          "問安裝窗口同故障支援時間。商用地址好多時要配合商場或大廈管理。月費以外見 [安裝費、預繳、合約](/guides/contract-fees)。",
        ],
        table: {
          caption: "簽約前要問",
          headers: ["項目", "點問"],
          rows: [
            {
              label: "固定 IP",
              value: "收銀、VPN、鏡頭需唔需要。家居動態 IP 未必夠。",
              href: "/guides/shop-broadband",
            },
            {
              label: "安裝窗口",
              value: "可唔可以配合非辦公時間，大廈／商場點批。",
              href: "/guides/shop-broadband",
            },
            {
              label: "合約同終止",
              value: "合約期、提早終止、搬舖可唔可以跟約。",
              href: "/guides/contract-fees",
            },
          ],
        },
      },
      {
        heading: "報價前準備",
        paragraphs: [
          "準備工商地址、商業登記或舖租資料，問清楚需唔需要固定 IP、安裝期、故障支援時間。未齊件可以先查覆蓋，簽約前通常要補齊。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "開 [商業寬頻格價](/plans?cat=business)。WhatsApp 查核報價可預填「商業寬頻」。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Do not use a home plan",
        paragraphs: [
          "Shops and offices need a business address and contract. Home public-housing rates usually cannot be used.",
        ],
      },
      {
        heading: "Shops, offices, studios",
        paragraphs: [
          "Quote against the trading address. See the [shop checklist](/guides/shop-broadband).",
        ],
        table: {
          caption: "Business addresses",
          headers: ["Type", "Ask about"],
          rows: [
            {
              label: "Shop",
              value: "Building access and install windows, especially in malls.",
              href: "/guides/shop-broadband",
            },
            {
              label: "Office",
              value: "Telecom room, static IP, support during office hours.",
              href: "/guides/shop-broadband",
            },
            {
              label: "Studio / industrial",
              value: "Use limits vary by building. Check coverage first.",
              href: "/guides/shop-broadband",
            },
          ],
        },
      },
      {
        heading: "Static IP, install, support",
        paragraphs: [
          "Tills, VPN and cameras may need a static IP. Ask about install windows and fault support.",
        ],
        table: {
          caption: "Ask before you sign",
          headers: ["Item", "What to ask"],
          rows: [
            {
              label: "Static IP",
              value: "Needed for tills, VPN or cameras. Home dynamic IPs may not do.",
              href: "/guides/shop-broadband",
            },
            {
              label: "Install window",
              value: "Can they work outside office hours? Who approves access?",
              href: "/guides/shop-broadband",
            },
            {
              label: "Contract",
              value: "Term, early termination, and whether you can move the line.",
              href: "/guides/contract-fees",
            },
          ],
        },
      },
      {
        heading: "Before you quote",
        paragraphs: [
          "Have the business address and registration or lease ready. Coverage can be checked first; documents are usually needed to sign.",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Open the [business compare page](/plans?cat=business). WhatsApp can be pre-filled with “商業寬頻”.",
        ],
      },
    ],
    faq: [
      {
        q: "舖頭可唔可以用家居寬頻計劃？",
        a: "多數唔得。家居公屋／居屋價綁住宅用途，舖頭要用商業寬頻。詳見 [店舖申請清單](/guides/shop-broadband)。",
      },
      {
        q: "商業寬頻要唔要固定 IP？",
        a: "收銀機、VPN、鏡頭、郵件伺服器可能需要。家居動態 IP 未必夠。報價時一齊問。",
      },
      {
        q: "申請前要準備咩？",
        a: "工商地址、商業登記或舖租、負責人身分證明係常見清單。實際視供應商。見 [店舖申請清單](/guides/shop-broadband)。",
      },
      {
        q: "店舖 1000M 夠唔夠？",
        a: "1000M 起跳係常見起步。實際上傳、穩定度、固定 IP 先對到收銀同雲端。以現場同電訊商確認為準。",
      },
      {
        q: "點樣查核商業寬頻報價？",
        a: "開 [商業寬頻格價](/plans?cat=business)，WhatsApp 可預填「商業寬頻」。覆蓋、安裝期同月費以電訊商確認為準。",
      },
    ],
    faqEn: [
      {
        q: "Can a shop use a home broadband plan?",
        a: "Usually no. Home rates are tied to residential use. See the [shop checklist](/guides/shop-broadband).",
      },
      {
        q: "Do I need a static IP?",
        a: "Tills, VPN and cameras often do. Ask when you quote.",
      },
      {
        q: "What should I prepare?",
        a: "Business address, registration or lease, and ID are common. See the [shop checklist](/guides/shop-broadband).",
      },
      {
        q: "Is 1000M enough for a shop?",
        a: "It is a common starting speed. Upload, stability and static IP matter more. Confirm with the carrier.",
      },
      {
        q: "How do I check a business quote?",
        a: "Open the [business compare page](/plans?cat=business) and confirm on WhatsApp.",
      },
    ],
  },
  {
    slug: "public-vs-hos",
    minutes: 7,
    category: "fiber",
    seoTitle: "公屋寬頻同居屋有咩分別｜齊Quote",
    h1: "公屋同埋居屋，寬頻價錢會唔會不同？",
    description:
      "公屋同居屋寬頻多數分開報價。同樣 1000M 都可能唔同計劃。先揀樓類，實際覆蓋以電訊商確認。",
    title: "公屋同埋居屋，寬頻價錢會唔會不同？",
    excerpt: "多數會不同。批量合約同指定計劃，令公屋、居屋唔好共用一張價。",
    titleEn: "Do public housing and HOS pay different broadband fees?",
    excerptEn: "Usually yes. Carriers often file separate bulk plans.",
    descriptionEn: "Public housing and HOS broadband are usually quoted separately. Pick the right housing type; coverage is confirmed by the carrier.",
    h1En: "Do public housing and HOS broadband fees differ?",
    related: ["fiber", "is-1000m-enough", "public-hos-fees", "estate-filter"],
    plans: [
      { href: "/plans?cat=broadband&housing=public", label: "公屋光纖計劃" },
      { href: "/plans?cat=broadband&housing=hos", label: "居屋光纖計劃" },
    ],
    estates: [
      { href: "/estates/tin-yiu", label: "天耀邨" },
      { href: "/estates/tin-shui", label: "天瑞邨" },
    ],
    body: [
      {
        heading: "結論：多數會不同",
        paragraphs: [
          "會。公屋同埋居屋即使都係「1000M 光纖」，電訊商好多時用唔同計劃代碼、合約期同批量價。所以齊Quote 要你揀樓類：公屋頁唔應該見到只限私樓嘅價，居屋亦唔好用公屋價去對。",
          "呢個分別唔等於邊種樓一定平啲。個別屋苑、申請期、有冇指定供應商，都會令參考月費唔同。頁上數字只係市場記錄，唔係你地址嘅確認價。",
        ],
      },
      {
        heading: "點解要分開報價",
        paragraphs: [
          "屋邨同居屋屋苑成日有入場安排、指定供應商或者批量合約，安裝路經同管理處要求都可能同私樓唔同。電訊商按呢啲條件出計劃，先出現「公居屋一套、私樓一套」。",
          "村屋又再另一套，唔好將公屋價套去丁屋。覆蓋同可唔可以拉線，仍然要電訊商確認，齊Quote 唔會寫死「一定有線」。",
        ],
      },
      {
        heading: "1000M 點樣睇，但唔好虛構覆蓋",
        paragraphs: [
          "用齊Quote 篩 [公屋光纖](/plans?cat=broadband&housing=public) 同 [居屋光纖](/plans?cat=broadband&housing=hos)，你會見到同一速度之下，供應商、合約、路由器同月費可以唔同。呢個係計劃邏輯，唔係話某一個邨已經確認裝到。站內列出嘅 1000M 例子見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)。",
          "想對實樓，開屋苑頁，例如 [天耀邨](/estates/tin-yiu)、[天瑞邨](/estates/tin-shui)。呢啲頁只列出適用該樓類嘅參考計劃，仍然要查核報價。",
        ],
      },
      {
        heading: "點用齊Quote 揀樓類",
        paragraphs: [
          "首頁搜尋框輸入屋苑，系統會判斷公屋、居屋、私樓定村屋，再帶你去格價頁。步驟見 [齊Quote 點用屋苑篩](/guides/estate-filter)。你亦可以喺格價頁手動揀樓類。揀錯樓類，見到嘅月費就會唔啱你。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Usually different",
        paragraphs: [
          "Public housing and HOS often have separate fibre SKUs. Filter by housing type; do not reuse a private-building price.",
        ],
      },
    ],
  },
  {
    slug: "public-hos-fees",
    minutes: 6,
    category: "fiber",
    seoTitle: "公屋居屋 1000M 參考月費｜齊Quote",
    h1: "公屋／居屋 1000M 常見參考月費幾多？",
    description:
      "公屋／居屋 1000M 唔係劃一價。下列係站內列出例子，僅供參考，唔係保證價。先用樓類篩，覆蓋同月費以電訊商確認為準。",
    title: "公屋／居屋 1000M 常見參考月費幾多？",
    excerpt: "唔係劃一價。下列係站內列出例子，僅供參考，唔代表你屋苑一定有。",
    titleEn: "Public / HOS 1000M: listed reference monthly fees",
    excerptEn: "Not one flat price. The examples below are listed on this site, for reference only — not a guarantee for your estate.",
    descriptionEn:
      "Public and HOS 1000M fibre is not one flat price. Examples below are listed on this site for reference only, not a guaranteed fee. Filter by housing type; coverage and fees are confirmed by the carrier.",
    h1En: "What are common listed 1000M fees for public / HOS housing?",
    published: "2026-09-11",
    related: ["public-vs-hos", "estate-filter", "fiber", "switch-broadband", "is-1000m-enough"],
    plans: [
      { href: "/plans?cat=broadband&housing=public", label: "公屋光纖計劃" },
      { href: "/plans?cat=broadband&housing=hos", label: "居屋光纖計劃" },
    ],
    estates: [
      { href: "/estates/tin-yiu", label: "天耀邨" },
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/public-vs-hos", label: "公屋 vs 居屋" },
    ],
    body: [
      {
        heading: "唔係劃一價",
        paragraphs: [
          "公屋／居屋 1000M **唔係**全港劃一價。下列係**站內列出**例子，僅供參考。",
        ],
        table: {
          caption: "站內列出｜僅供參考",
          headers: ["計劃例子", "參考月費／合約"],
          rows: [
            {
              label: "有線 1000M（48 個月）",
              value: "HK$58／48 個月",
              href: "/plans/icable-ftth-1000-48m-58",
            },
            {
              label: "HGC 轉台 1000M",
              value: "HK$75／36 個月",
              href: "/plans/hgc-ftth-1000-public-36m",
            },
            {
              label: "CMHK 1000M",
              value: "HK$88／36 個月",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "HGC＋路由電話 1000M",
              value: "HK$89／39 個月",
              href: "/plans/hgc-ftth-1000-public-39m",
            },
            {
              label: "有線 1000M（36 個月）",
              value: "HK$93／36 個月",
              href: "/plans/icable-ftth-1000-public-36m",
            },
            {
              label: "HKBN BE220 1000M",
              value: "HK$98／36 個月",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
            {
              label: "網上行 1000M",
              value: "HK$98／36 個月",
              href: "/plans/netvigator-ftth-1000-public-36m-98",
            },
          ],
        },
      },
      {
        heading: "點理解呢批例子",
        paragraphs: [
          "部分例子亦適用私樓；適用樓類以計劃卡為準",
          "呢張表**唔係排名**，亦唔保證你屋苑有其中一條。公屋同居屋好多時分開報價，分別見 [公屋同居屋有咩分別](/guides/public-vs-hos)。",
          "點查：先用樓類篩（公屋／居屋），再睇計劃卡上嘅月費、合約同適用樓類，最後用 WhatsApp 查核。覆蓋同月費以電訊商確認為準。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "去 [公屋光纖格價](/plans?cat=broadband&housing=public) 或 [居屋光纖格價](/plans?cat=broadband&housing=hos)，配合樓類篩再對卡。想知點用屋苑名，見 [齊Quote 點用屋苑篩](/guides/estate-filter)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Not one flat price",
        paragraphs: [
          "Public / HOS 1000M is **not** a single Hong Kong-wide fee. The rows below are **listed on this site**, for reference only.",
        ],
        table: {
          caption: "Listed on this site | for reference only",
          headers: ["Example plan", "Reference fee / contract"],
          rows: [
            {
              label: "i-Cable 1000M (48 months)",
              value: "HK$58 / 48 months",
              href: "/plans/icable-ftth-1000-48m-58",
            },
            {
              label: "HGC switch 1000M",
              value: "HK$75 / 36 months",
              href: "/plans/hgc-ftth-1000-public-36m",
            },
            {
              label: "CMHK 1000M",
              value: "HK$88 / 36 months",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "HGC + router + phone 1000M",
              value: "HK$89 / 39 months",
              href: "/plans/hgc-ftth-1000-public-39m",
            },
            {
              label: "i-Cable 1000M (36 months)",
              value: "HK$93 / 36 months",
              href: "/plans/icable-ftth-1000-public-36m",
            },
            {
              label: "HKBN BE220 1000M",
              value: "HK$98 / 36 months",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
            {
              label: "Netvigator 1000M",
              value: "HK$98 / 36 months",
              href: "/plans/netvigator-ftth-1000-public-36m-98",
            },
          ],
        },
      },
      {
        heading: "How to read these examples",
        paragraphs: [
          "Some examples also apply to private estates; check the housing type on the plan card.",
          "This table is **not a ranking**, and it does not guarantee any of these plans at your estate. Public housing and HOS are often quoted separately; see [public vs HOS](/guides/public-vs-hos).",
          "How to check: filter by housing type (public / HOS), read the fee, contract and housing tags on the plan card, then confirm on WhatsApp. Coverage and fees are confirmed by the carrier.",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Open [public fibre plans](/plans?cat=broadband&housing=public) or [HOS fibre plans](/plans?cat=broadband&housing=hos) and keep the housing filter on. How to search by estate name: [estate filter](/guides/estate-filter).",
          DISCLAIMER,
        ],
      },
    ],
    faq: [
      {
        q: "公屋同居屋價會唔會一樣？",
        a: "唔一定。好多時分開批量計劃，篩選時分開揀。分別見 [公屋同居屋有咩分別](/guides/public-vs-hos)。頁上例子只係站內列出、僅供參考。",
      },
      {
        q: "點查覆蓋／自己屋苑？",
        a: "先用樓類篩，再睇計劃卡，最後用 WhatsApp 查核。輸入屋苑名見 [齊Quote 點用屋苑篩](/guides/estate-filter)。覆蓋以電訊商確認為準。",
      },
      {
        q: "係咪保證價？",
        a: "唔係保證價。站內列出只供參考，實際月費、合約同覆蓋一律以電訊商確認為準。",
      },
    ],
    faqEn: [
      {
        q: "Are public-housing and HOS fees the same?",
        a: "Not necessarily. They often have separate bulk plans and should be filtered separately. See [public vs HOS](/guides/public-vs-hos). The examples on this page are listed on the site, for reference only.",
      },
      {
        q: "How do I check coverage for my estate?",
        a: "Filter by housing type, read the plan card, then confirm on WhatsApp. How to type an estate name: [estate filter](/guides/estate-filter). Coverage is confirmed by the carrier.",
      },
      {
        q: "Is this a guaranteed price?",
        a: "No. Listed fees are for reference only. Actual fees, contracts and coverage are confirmed by the carrier.",
      },
    ],
  },
  {
    slug: "estate-filter",
    minutes: 5,
    category: "fiber",
    seoTitle: "屋苑篩點用：對樓類同參考計劃｜齊Quote",
    h1: "齊Quote 點用屋苑篩？",
    description:
      "輸入屋苑，對樓類同參考適用計劃。名唔全或者入伙限定唔等於全港都有。覆蓋以電訊商確認為準。",
    title: "齊Quote 點用屋苑篩？",
    excerpt: "輸入屋苑，對樓類同參考適用計劃。覆蓋以電訊商確認，篩完唔等於已經裝到。",
    titleEn: "How to use the ChaiQuote estate filter",
    excerptEn: "Type an estate to match housing type and reference-applicable plans. Coverage is confirmed by the carrier.",
    descriptionEn:
      "Type an estate name to match housing type and reference-applicable plans. Incomplete names or intake-only offers are not city-wide. Coverage is confirmed by the carrier.",
    h1En: "How do I use the ChaiQuote estate filter?",
    published: "2026-09-11",
    related: ["fiber", "village", "public-hos-fees", "public-vs-hos", "switch-broadband"],
    plans: [
      { href: "/", label: "返首頁搜屋苑" },
      { href: "/plans?cat=broadband", label: "去光纖格價" },
    ],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/village", label: "村屋點算" },
    ],
    body: [
      {
        heading: "屋苑篩做咩",
        paragraphs: [
          "喺首頁搜尋框輸入屋苑名，系統會對樓類，再列出**參考適用**計劃。**覆蓋以電訊商確認**，篩完唔等於已經裝到。",
        ],
      },
      {
        heading: "三步用屋苑篩",
        paragraphs: ["跟住三步：輸入 → 睇卡 → 分享或 WhatsApp。"],
        table: {
          caption: "三步用屋苑篩",
          headers: ["步驟", "做咩"],
          rows: [
            {
              label: "輸入",
              value: "入屋苑名，對樓類。",
              href: "/",
            },
            {
              label: "睇卡",
              value: "月費、合約、路由器。",
              href: "/plans?cat=broadband",
            },
            {
              label: "分享或 WhatsApp",
              value: "查核報價，確認覆蓋。",
              href: "/estates",
            },
          ],
        },
      },
      {
        heading: "使用注意",
        paragraphs: [
          "名唔全、錯字或者嘈音，結果可能唔準；可以改少少字再試，或者去 [屋苑目錄](/estates) 搵。",
          "入伙限定、快閃計劃只適用指定屋苑，**唔等於全港**都有同一價。",
          "村屋係另一套，見 [村屋寬頻點算](/guides/village)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "What the estate filter does",
        paragraphs: [
          "Type an estate name in the home search box. The site matches the housing type and lists **reference-applicable** plans. **Coverage is confirmed by the carrier**; a filter match is not an install confirmation.",
        ],
      },
      {
        heading: "Three steps",
        paragraphs: ["Type → read the card → share or WhatsApp."],
        table: {
          caption: "Three steps for the estate filter",
          headers: ["Step", "What you do"],
          rows: [
            {
              label: "Type",
              value: "Enter the estate name to match housing type.",
              href: "/",
            },
            {
              label: "Read the card",
              value: "Monthly fee, contract, router.",
              href: "/plans?cat=broadband",
            },
            {
              label: "Share or WhatsApp",
              value: "Check the quote and confirm coverage.",
              href: "/estates",
            },
          ],
        },
      },
      {
        heading: "Notes",
        paragraphs: [
          "Incomplete names, typos or noisy results can miss. Try a shorter name, or browse the [estate directory](/estates).",
          "Intake-only and flash offers apply to named estates. They are **not** the same fee across Hong Kong.",
          "Village houses are a separate set of plans; see [village broadband](/guides/village).",
          DISCLAIMER,
        ],
      },
    ],
    faq: [
      {
        q: "屋苑名唔齊點算？",
        a: "試改少少字、用屋邨／屋苑簡稱，或者去 [屋苑目錄](/estates) 搵。仍然對唔到，用 WhatsApp 報完整名稱同座數。",
      },
      {
        q: "篩完係咪等於裝到？",
        a: "唔係。篩完只係對到**參考適用**計劃，**覆蓋以電訊商確認**，唔等於已經裝到。",
      },
      {
        q: "村屋點處理？",
        a: "村屋唔好用公屋價去估。另見 [村屋寬頻點算](/guides/village)，需要可以約 [實地視察](/guides/village-onsite)。",
      },
    ],
    faqEn: [
      {
        q: "What if the estate name is incomplete?",
        a: "Try a shorter name or an estate abbreviation, or browse the [estate directory](/estates). If it still misses, WhatsApp the full name and block.",
      },
      {
        q: "Does a filter match mean it can be installed?",
        a: "No. A match only shows **reference-applicable** plans. **Coverage is confirmed by the carrier** — it is not an install confirmation.",
      },
      {
        q: "How should village houses be handled?",
        a: "Do not reuse a public-housing fee for a village house. See [village broadband](/guides/village); book an [on-site check](/guides/village-onsite) if needed.",
      },
    ],
  },
  {
    slug: "is-1000m-enough",
    minutes: 7,
    category: "fiber",
    seoTitle: "家用寬頻 1000M 夠唔夠｜齊Quote",
    h1: "1000M 夠唔夠？幾時先要 2500M",
    description: "多數家庭 1000M 已夠。樓內 Wi-Fi 先於再加速度。實際速度同安裝以電訊商確認。",
    title: "1000M 夠唔夠？幾時先要 2500M",
    excerpt: "一般家用 1000M 夠。多人 4K、成日上傳，先考慮 2500M+。",
    titleEn: "Is 1000M enough at home?",
    excerptEn: "For most homes, yes. Upgrade when many people stream and upload at once.",
    descriptionEn: "Most households are fine on 1000M. Fix Wi-Fi before buying more speed. Install is confirmed by the carrier.",
    h1En: "Is 1000M enough? When to consider 2500M",
    related: ["fiber", "fiber-vs-5g", "contract-fees"],
    plans: [{ href: "/plans?cat=broadband", label: "去光纖格價" }],
    estates: [
      { href: "/estates/taikoo-shing", label: "太古城" },
      { href: "/estates/mei-foo-sun-chuen", label: "美孚新邨" },
    ],
    body: [
      {
        heading: "結論：多數家庭 1000M 夠",
        paragraphs: [
          "睇片、視像會議、雲端同步、屋企幾部電話同電視一齊用，1000M 光纖對大部分家庭已經有餘地。未必要一開始就追 2500M 或者 10000M。",
          "真正瓶頸好多時唔係入屋光纖，而係舊路由器、Wi-Fi 擺位、牆身同裝置網卡。加速度之前，先問而家 Wi-Fi 係咪已經用盡 1000M。",
        ],
      },
      {
        heading: "用途對照",
        paragraphs: [
          "一兩路 4K、日常開會、上堂：1000M 通常夠。屋企人多、幾路高清同時、經常上傳大檔或者開 NAS：先考慮 2500M。極多裝置、想預留頻寬，先睇更高速率，但要接受月費同設備都可能要跟上。",
          "5G 家居嘅標稱速度唔好直接當光纖 1000M 用：現場訊號同數據上限會限制體驗。比較見 [光纖同 5G 家居點揀](/guides/fiber-vs-5g)。",
        ],
      },
      {
        heading: "樓內 Wi-Fi 先於再加速度",
        paragraphs: [
          "光纖入屋之後，Wi-Fi 6／Wi-Fi 7 路由器、適中擺位、避免微波爐同厚牆阻擋，往往比再買高一檔月費更明顯。合約入面「包路由器」定「送路由器、到期要還」，簽約前問清楚，見 [安裝費、預繳、合約](/guides/contract-fees)。",
          "下一步：[光纖格價](/plans?cat=broadband)。屋苑例子：[太古城](/estates/taikoo-shing)、[美孚新邨](/estates/mei-foo-sun-chuen)。" + DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Most homes are fine on 1000M",
        paragraphs: ["Fix Wi-Fi placement before paying for 2500M. Fibre still depends on whether the carrier can install it."],
      },
    ],
  },
  {
    slug: "switch-broadband",
    minutes: 8,
    category: "fiber",
    seoTitle: "轉寬頻點樣減少斷網｜齊Quote",
    h1: "轉台寬頻：舊約、安裝期、點樣銜接",
    description: "轉寬頻先查舊約完約日同新線安裝期，避免空窗。寬頻唔能夠攜號，要先裝後停。唔好自行違法解約。實際安排以電訊商確認。",
    title: "轉台寬頻：舊約、安裝期、點樣銜接",
    excerpt: "先查完約日，再約新線。寬頻唔能夠攜號，要先裝後停。手機轉台見攜號文。",
    titleEn: "Switching fibre with less downtime",
    excerptEn: "Check the old contract end date, then book the new install. Broadband cannot port a number — install first, then stop the old line.",
    descriptionEn:
      "Check the old contract and the new install date before you switch. Broadband cannot port a number; install the new line first, then stop the old one. Do not break a contract unlawfully. The carrier confirms the schedule.",
    h1En: "Switching broadband: old contract, install date, handover",
    published: "2026-09-09",
    modified: "2026-09-11",
    related: ["port-in", "contract-fees", "fiber", "public-hos-fees", "estate-filter"],
    plans: [{ href: "/plans?cat=broadband", label: "去光纖格價" }],
    estates: [
      { href: "/estates/tin-yiu", label: "天耀邨" },
      { href: "/estates", label: "屋苑目錄" },
    ],
    body: [
      {
        heading: "先查舊約完約日",
        paragraphs: [
          "轉寬頻唔係攜號。新供應商要上門拉線或者換機，舊合約亦可能未完。第一步係睇清楚完約日、提早終止費、有冇搬遷或者轉台條款，而唔係先取消舊台。",
          "寬頻**唔能夠攜號**；做法係**先裝後停**（新線測好先停舊台）。本頁唔教你點樣避過合約或者虛報資料。提早終止要按你同電訊商簽嘅合約處理。",
        ],
      },
      {
        heading: "轉台五件事",
        paragraphs: [
          "簽約或者約安裝之前，用下面五件事對一次。月費以外仲有安裝費、預繳、合約，見 [月費以外的費用](/guides/contract-fees)。",
        ],
        table: {
          caption: "轉台五件事",
          headers: ["事項", "點睇"],
          rows: [
            {
              label: "完約日",
              value: "舊約幾時完、有冇提早終止費。",
              href: "/guides/contract-fees",
            },
            {
              label: "新線安裝期",
              value: "幾時上門、要唔要管理處批准。",
              href: "/guides/village-onsite",
            },
            {
              label: "安裝費／預繳",
              value: "豁免定要繳、有冇預繳。",
              href: "/guides/contract-fees",
            },
            {
              label: "路由器送定還",
              value: "送出、包用，定合約後要還。",
              href: "/guides/contract-fees",
            },
            {
              label: "舊台幾時停",
              value: "先裝後停：新線測好先停舊。",
              href: "/guides/port-in",
            },
          ],
        },
      },
      {
        heading: "新線安裝期",
        paragraphs: [
          "問新台：幾時可以上門、要唔要管理處批准、舊樓／村屋會唔會加日。村屋有時要現場先確定路經，見 [村屋實地視察](/guides/village-onsite)。",
          "安裝當日先測到上網，先算新線可用。未測好就切舊台，屋企會無網。記住**先裝後停**。",
        ],
      },
      {
        heading: "重疊幾日，好過空窗",
        paragraphs: [
          "理想做法係新線開通前後同舊約重疊短時間，確認穩定再停舊台。完全銜接唔到就要有後備，例如短暫用 5G 家居或者手機熱點，但呢啲都係權宜，穩定度視現場。",
        ],
      },
      {
        heading: "豁免安裝費、預繳、路由器",
        paragraphs: [
          "轉台優惠成日包豁免安裝費或者首月。同時問預繳、合約期、路由器係包用定到期歸還。計過先年總支出，唔好只睇標價月費。詳見 [月費以外的費用](/guides/contract-fees)。",
          "手機留號碼係另一套流程，見 [攜號轉台](/guides/port-in)。寬頻就去 [光纖格價](/plans?cat=broadband) 再 WhatsApp 查核報價。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Check the old contract end date first",
        paragraphs: [
          "Switching broadband is not number porting. The new carrier has to install a line or swap equipment, and the old contract may still be running. Start with the end date, early-termination fee, and any move or switch terms — do not cancel the old plan first.",
          "Broadband **cannot port a number**. The sequence is **install first, then stop** (test the new line before you stop the old one). This page does not advise breaking a contract or misstating facts. Early termination follows the contract you signed.",
        ],
      },
      {
        heading: "Five things to check when you switch",
        paragraphs: [
          "Go through these five items before you sign or book an install. Costs beyond the monthly fee are in [install, prepay, contract](/guides/contract-fees).",
        ],
        table: {
          caption: "Five things when you switch",
          headers: ["Item", "What to check"],
          rows: [
            {
              label: "Contract end date",
              value: "When the old contract ends, and any early-termination fee.",
              href: "/guides/contract-fees",
            },
            {
              label: "New-line install date",
              value: "When a technician can come, and whether management approval is needed.",
              href: "/guides/village-onsite",
            },
            {
              label: "Install fee / prepay",
              value: "Waived or payable, and any prepayment.",
              href: "/guides/contract-fees",
            },
            {
              label: "Router: gift or return",
              value: "Gifted, included, or must be returned after the contract.",
              href: "/guides/contract-fees",
            },
            {
              label: "When to stop the old plan",
              value: "Install first, then stop: test the new line before you cancel.",
              href: "/guides/port-in",
            },
          ],
        },
      },
      {
        heading: "New-line install window",
        paragraphs: [
          "Ask the new carrier when they can visit, whether the building office must approve, and whether an older block or village house adds days. Village houses sometimes need a site visit first; see [village on-site check](/guides/village-onsite).",
          "The new line counts as ready only after it is tested on install day. Cutting the old plan before that leaves the home offline. Remember: **install first, then stop**.",
        ],
      },
      {
        heading: "A few days of overlap beats a gap",
        paragraphs: [
          "The usual approach is a short overlap around the new install, then stop the old plan once the new line is stable. If the dates cannot meet, have a backup such as 5G home or a phone hotspot — those are stopgaps and depend on the site.",
        ],
      },
      {
        heading: "Install-fee waiver, prepay, router",
        paragraphs: [
          "Switch offers often waive the install fee or the first month. Also ask about prepay, contract length, and whether the router is included or must be returned. Count year-one cost, not just the sticker fee. Details: [beyond the monthly fee](/guides/contract-fees).",
          "Keeping a mobile number is a different flow; see [number porting](/guides/port-in). For fibre, open [fibre compare](/plans?cat=broadband) and confirm the quote on WhatsApp.",
          DISCLAIMER,
        ],
      },
    ],
    faq: [
      {
        q: "轉寬頻會唔會斷網？",
        a: "新線未測好就停舊台，屋企會無網。寬頻唔能夠攜號，要**先裝後停**：新線裝好、測到上網，先取消舊台。實際安裝期以電訊商確認為準。",
      },
      {
        q: "申請要唔要證件？",
        a: "通常要身分證明同安裝地址；有時會問舊台月結單或者管理處資料。實際清單以電訊商申請要求為準，本頁唔會寫死每一間嘅文件。",
      },
      {
        q: "寬頻可唔可以攜號？",
        a: "唔可以。寬頻唔能夠攜號過台，要上門裝新線。留手機號碼先至係攜號，見 [攜號轉台](/guides/port-in)。",
      },
    ],
    faqEn: [
      {
        q: "Will switching broadband cut the connection?",
        a: "Stopping the old plan before the new line is tested leaves the home offline. Broadband cannot port a number. **Install first, then stop**: test the new line, then cancel the old one. The carrier confirms the install date.",
      },
      {
        q: "Do I need ID documents?",
        a: "Applications usually need ID and the install address. Some carriers also ask for a recent bill or building-office details. The exact list is confirmed by the carrier.",
      },
      {
        q: "Can broadband port a number?",
        a: "No. Broadband cannot port a number; a technician installs a new line. Keeping a mobile number is a different flow; see [number porting](/guides/port-in).",
      },
    ],
  },
  {
    slug: "gba-mobile",
    minutes: 7,
    category: "mobile",
    seoTitle: "大灣區手機計劃要注意咩｜齊Quote",
    h1: "大灣區數據：邊度用、點計、點避免額外費",
    description: "大灣區數據要分本地額同跨境額。覆蓋範圍以電訊商條款為準，唔好當無限漫遊。",
    title: "大灣區數據：邊度用、點計、點避免額外費",
    excerpt: "先搞清楚邊度用、點扣數據，轉台前問清楚額外費。",
    titleEn: "Greater Bay Area mobile: where it works and how it is billed",
    excerptEn: "Separate local data from GBA data. Do not treat it as unlimited China roaming.",
    descriptionEn: "GBA add-ons depend on the carrier’s zone and quota. Confirm extra charges before you port.",
    h1En: "Greater Bay Area data: where, how it counts, how to avoid extra fees",
    related: ["mobile", "port-in"],
    plans: [{ href: "/plans?cat=mobile", label: "去手機格價" }],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/mobile", label: "手機月費攻略" },
    ],
    body: [
      {
        heading: "大灣區覆蓋係概括條款，唔係旅遊保證",
        paragraphs: [
          "計劃寫「大灣區」，通常指電訊商條款列出嘅指定區域同網絡，而唔係保證每一個城市、每一條村、每一層地庫都同樣快。實際用邊個營運商網絡、有冇合作限制，以申請時嘅產品說明為準。呢度唔會寫死每個城市細節，避免過時。",
        ],
      },
      {
        heading: "本地 vs 大灣區額度",
        paragraphs: [
          "本地 GB 同大灣區 GB 好多時分開計。用完大灣區額可以降速、扣漫遊費或者要額外日費。出發前問：包幾多 GB、點樣顯示用量、超過之後點計。唔好當「話咗大灣區就無限」。",
        ],
      },
      {
        heading: "轉台注意",
        paragraphs: [
          "攜號轉台之後，大灣區權益跟新計劃，唔會自動繼承舊台嘅跨境包。生效空窗期間，漫遊同跨境數據可能暫停。流程見 [攜號轉台](/guides/port-in)。",
          "下一步：[手機格價](/plans?cat=mobile)，再用 WhatsApp 查核報價。實際收費以電訊商確認為準。",
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Read the zone, not the slogan",
        paragraphs: ["GBA data is defined by the carrier. Local and GBA quotas are often separate."],
      },
    ],
  },
  {
    slug: "shop-broadband",
    minutes: 7,
    category: "business",
    seoTitle: "店舖申請商業寬頻要準備咩｜齊Quote",
    h1: "店舖／寫字樓申請寬頻清單",
    description: "店舖同寫字樓要用商業寬頻。準備地址、文件、固定IP同安裝預約。家居計劃通常不能搬去舖。",
    title: "店舖／寫字樓申請寬頻清單",
    excerpt: "地址類型、文件、固定 IP、安裝預約。家居公屋價唔能直接用喺舖。",
    titleEn: "Checklist for shop and office broadband",
    excerptEn: "Address type, documents, static IP, install booking. Home plans usually cannot move to a shop.",
    descriptionEn: "Business fibre needs a commercial address, documents and often a static IP. Home plans cannot usually be used in a shop.",
    h1En: "Shop / office broadband application checklist",
    related: ["business", "contract-fees"],
    plans: [{ href: "/plans?cat=business", label: "去商業寬頻格價" }],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/business", label: "商業寬頻攻略" },
    ],
    inquiry: { estate: "商業寬頻" },
    body: [
      {
        heading: "地址類型",
        paragraphs: [
          "店舖、寫字樓、工場、倉庫通常都要商業寬頻。住宅地下改舖、工廈、商場舖，入線同管理處批文都可以唔同。報價一定要寫營業地址，而唔係老闆屋企。",
        ],
      },
      {
        heading: "需要文件",
        paragraphs: [
          "常見會問商業登記、租約或者業權、負責人身分證明。實際清單視供應商。未齊件可以先查覆蓋，但簽約前通常要補齊。",
        ],
      },
      {
        heading: "固定 IP、安裝預約",
        paragraphs: [
          "收銀機、VPN、鏡頭、郵件伺服器可能需要固定 IP，家居動態 IP未必夠。問安裝窗口：商用地址好多時要配合商場管理、非辦公時間可能另收費。",
        ],
      },
      {
        heading: "家居計劃不能直接搬去舖",
        paragraphs: [
          "公屋／居屋家居價綁住宅用途。搬去舖頭或者報住宅裝商用，後期好容易被改約或者終止。正確入口係 [商業寬頻格價](/plans?cat=business)，WhatsApp 預填「商業寬頻」查核報價。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Use a business address",
        paragraphs: ["Do not reuse a home public-housing plan for a shop. Ask about static IP and building access."],
      },
    ],
  },
  {
    slug: "contract-fees",
    minutes: 8,
    category: "fiber",
    seoTitle: "寬頻安裝費、預繳、合約期點睇｜齊Quote",
    h1: "月費以外：安裝費、預繳、合約",
    description: "表面月費之外仲有安裝費、預繳、路由器同提早終止。實際條款以電訊商確認為準。",
    title: "月費以外：安裝費、預繳、合約",
    excerpt: "計首年總支出，唔好只睇標價。問路由器送定租、提早終止點計。",
    titleEn: "Beyond the monthly fee: install, prepay, contract",
    excerptEn: "Count year-one cost, router terms and early termination, not just the sticker fee.",
    descriptionEn: "Install fees, prepayments, router ownership and early termination sit outside the monthly fee. The carrier confirms the contract.",
    h1En: "Beyond the monthly fee: install, prepay, contract",
    related: ["switch-broadband", "fiber", "shop-broadband"],
    plans: [{ href: "/plans?cat=broadband", label: "去光纖格價" }],
    estates: [
      { href: "/estates/tin-yiu", label: "天耀邨" },
      { href: "/estates/taikoo-shing", label: "太古城" },
    ],
    body: [
      {
        heading: "表面月費 vs 首年支出",
        paragraphs: [
          "廣告月費可以已經扣咗首月、豁免安裝或者禮券。真正要計：安裝費、預繳、機頂盒／路由器按金、上門費、合約期內總月費。有時「好平嘅月費」只係把成本搬咗去預繳或者較長約。",
        ],
      },
      {
        heading: "路由器：送、包，定到期要還",
        paragraphs: [
          "「送路由器」同「包路由器」唔同。包用可能合約完要歸還；送出先先至係你嘅。5G 家居路由器尤其常見要還。簽約前問型號、壞機點換、遺失點計。",
        ],
      },
      {
        heading: "提早終止",
        paragraphs: [
          "未約滿就停，通常有終止費或者要補回優惠。搬屋、裝修、店舖結業都可能中招。本頁唔提供避約方法，只提醒你對住合約原文問清楚。",
          "核對完參考月費，用 WhatsApp 查核報價，問安裝費、預繳、路由器同完約條款。下一步：[光纖格價](/plans?cat=broadband)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Count year one, not the sticker",
        paragraphs: ["Ask whether the router is included or must be returned, and how early termination is billed."],
      },
    ],
  },
];

export const GUIDE_CATEGORY_META = [
  {
    id: "fiber" as const,
    label: "光纖寬頻",
    labelEn: "Fibre",
    slug: "fiber",
    image: "/images/cat-broadband.jpg",
    planCat: "broadband" as const,
  },
  {
    id: "home5g" as const,
    label: "5G 家居",
    labelEn: "5G home",
    slug: "home5g",
    image: "/images/cat-home5g.jpg",
    planCat: "home5g" as const,
  },
  {
    id: "mobile" as const,
    label: "手機月費",
    labelEn: "Mobile",
    slug: "mobile",
    image: "/images/cat-mobile.jpg",
    planCat: "mobile" as const,
  },
  {
    id: "business" as const,
    label: "商業寬頻",
    labelEn: "Business",
    slug: "business",
    image: "/images/cat-business.jpg",
    planCat: "business" as const,
  },
];
