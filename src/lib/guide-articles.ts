import type { Guide } from "./guides.ts";
import { salesQuoteMessage } from "./whatsapp.ts";

const DISCLAIMER =
  "以上只供參考。實際覆蓋、安裝期、月費、合約同路由器條款，一律以電訊商確認為準，唔好假設一定有線或者一定裝到。";

const DISCLAIMER_EN =
  "The above is for reference only. Coverage, install dates, fees, contracts and router terms are confirmed by the carrier. Do not assume a line exists or that it can be installed.";

export const GUIDE_ARTICLES: Guide[] = [
  {
    slug: "fiber",
    minutes: 8,
    category: "fiber",
    seoTitle: "香港光纖寬頻攻略｜公屋居屋私樓村屋比較｜齊Quote",
    h1: "香港光纖寬頻點揀：先分樓類再睇月費",
    description:
      "香港光纖寬頻唔係一張價表。同一條 1000M，公屋、居屋、私樓、村屋月費同計劃通常唔同。先分樓類，再對 1000M／2500M 同轉台注意。覆蓋同安裝以電訊商確認為準。",
    title: "香港光纖寬頻點揀：先分樓類再睇月費",
    excerpt: "香港光纖唔係一張價表。先分公屋、居屋、私樓定村屋，再對 1000M／2500M 參考月費。",
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
      "private-1000-fees",
      "village-fees",
      "home-broadband-2026",
      "estate-filter",
      "is-1000m-enough",
      "broadband-total-cost",
      "1000m-or-2500m",
      "switch-broadband",
      "contract-fees",
      "home5g",
      "tin-shui-wai",
      "sha-tin",
      "tseung-kwan-o",
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
        heading: "香港光纖唔係一張價表",
        paragraphs: [
          "同一句「1000M 光纖」，公屋、居屋、私樓、村屋見到嘅計劃同月費通常唔同。電訊商會按屋苑類型、批量合約、入線路經報價，所以齊Quote 先叫你揀樓類，而唔係丟一張全港劃一價。",
          "網上記錄嘅月費係參考。覆蓋、完工期、豁免安裝費同路由器條款，申請時先由電訊商確認。想一次過對實際計劃，可開 [光纖格價](/plans?cat=broadband)。2026 年站內列出例子見 [2026 家居寬頻格價](/guides/home-broadband-2026)。",
        ],
      },
      {
        heading: "公屋、居屋、私樓、村屋點分",
        paragraphs: [
          "公屋同居屋多數有指定批量價，選擇相對集中，記住用對應樓類去篩，唔好用私樓價去估公屋。想知分別可睇 [公屋同居屋有咩分別](/guides/public-vs-hos)。站內列出嘅 1000M 例子見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)。公屋例子：[天耀邨](/estates/tin-yiu)。",
          "私樓選擇通常多啲，合約期、路由器、家居電話組合都較密，例如 [太古城寬頻](/estates/taikoo-shing)。站內列出嘅 1000M 例子見 [私樓 1000M 參考月費](/guides/private-1000-fees)。村屋係另一批計劃，月費同安裝環境都可以同屋邨差好遠，詳情見 [村屋光纖](/guides/village)。",
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
              value: "另一套計劃。村屋光纖月費同安裝環境都可以同屋邨差好遠。",
              href: "/guides/village-fees",
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
          "返首頁輸入屋苑，或者直接開 [光纖格價](/plans?cat=broadband)。屋苑篩點用見 [齊Quote 點用屋苑篩](/guides/estate-filter)。想比較免拉線方案，可睇 [5G家居定光纖](/guides/fiber-vs-5g) 或者 [5G 家居攻略](/guides/home5g)。屋苑例子：[天耀邨](/estates/tin-yiu)、[太古城寬頻](/estates/taikoo-shing)；地區：[天水圍寬頻](/guides/tin-shui-wai)、[沙田寬頻](/guides/sha-tin)、[將軍澳寬頻](/guides/tseung-kwan-o)；村屋見 [村屋光纖](/guides/village)；全部屋苑見 [屋苑目錄](/estates)。",
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Fibre is not one price list",
        paragraphs: [
          "The same 1000M fibre offer is usually different for public housing, HOS, private and village homes. Carriers quote by estate type and install path. Open the [fibre compare page](/plans?cat=broadband) for reference plans.",
          "Fees on this site are a reference. Coverage, install dates and router terms are confirmed by the carrier. 2026 listed examples: [2026 home broadband](/guides/home-broadband-2026).",
        ],
      },
      {
        heading: "Public, HOS, private, village",
        paragraphs: [
          "Public and HOS housing usually have bulk rates. Do not use a private-estate price to guess a public-estate fee. See [public vs HOS](/guides/public-vs-hos). Listed 1000M examples: [public / HOS 1000M reference fees](/guides/public-hos-fees).",
          "Listed 1000M examples: [private-estate 1000M reference fees](/guides/private-1000-fees). Village houses are a different set of plans. Details: [village broadband](/guides/village). Village fibre monthly fees: [village fibre fees](/guides/village-fees).",
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
              value: "Separate plans. Village fibre fees and install conditions can differ a lot.",
              href: "/guides/village-fees",
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
          "Open the fibre compare page or type your estate on the home page. How to use the estate filter: [estate filter](/guides/estate-filter). District pages: [Tin Shui Wai](/guides/tin-shui-wai), [Sha Tin](/guides/sha-tin), [Tseung Kwan O](/guides/tseung-kwan-o). Village fibre fees: [village fibre fees](/guides/village-fees). To compare a wireless option, see [fibre vs 5G home](/guides/fiber-vs-5g).",
        ],
      },
    ],
    faq: [
      {
        q: "公屋同居屋光纖月費會唔會唔同？",
        a: "會。公屋同居屋多數有指定批量價，選擇相對集中，唔好用私樓價去估公屋。每個屋邨／屋苑合約都可能唔同，篩選時分開揀，申請時填齊屋苑名稱。詳見 [公屋同居屋有咩分別](/guides/public-vs-hos)。",
      },
      {
        q: "一般家庭 1000M 光纖夠唔夠？",
        a: "上網、開會、一兩路 4K，1000M 已經夠用。屋企人多、經常上傳大檔，先考慮 2500M 或以上。速度亦受樓內 Wi-Fi、路由器同牆身影響。可再睇 [1000M 夠唔夠](/guides/is-1000m-enough)。",
      },
      {
        q: "村屋有冇光纖？",
        a: "有指定計劃，但唔等於公屋價，亦唔等於一定拉到。現場環境、村路、入線都要電訊商確認。拉唔到可以一併比較 [5G 家居](/guides/home5g)。詳見 [村屋寬頻點算](/guides/village)。站內列出例子見 [村屋光纖月費](/guides/village-fees)。",
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
        a: "Some do, on separate plans. Coverage and install still need carrier confirmation. See [village broadband](/guides/village). Listed examples: [village fibre fees](/guides/village-fees).",
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
    excerpt: "插電路由器就用。啱未有光纖、租樓或者趕時間；唔好當固定光纖替代。",
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
          "比較時一齊睇：月費、合約、高速數據用量、包定租路由器、冷靜期。詳情見 [月費以外](/guides/contract-fees)。",
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
        a: "部分計劃有高速數據用量，用完會降速或降低優先權。比較時一齊睇月費、合約同路由器係包定租。實際條款以電訊商確認為準。",
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
    excerpt: "舖址、商業登記、固定 IP 同支援時間，都同家居計劃唔同。",
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
    seoTitle: "公屋居屋寬頻分別｜點解唔共用一張價｜齊Quote",
    h1: "公屋居屋寬頻分別",
    description: "公屋居屋寬頻多數分開報價。同樣 1000M 都可能唔同計劃。村屋光纖又係另一套，唔好混用。",
    title: "公屋居屋寬頻分別",
    excerpt: "多數會唔同。批量合約同指定計劃，令公屋、居屋唔好共用一張價。",
    titleEn: "Do public housing and HOS pay different broadband fees?",
    excerptEn: "Usually yes. Carriers often file separate bulk plans.",
    descriptionEn: "Public housing and HOS broadband are usually quoted separately. Pick the right housing type; coverage is confirmed by the carrier.",
    h1En: "Do public housing and HOS broadband fees differ?",
    published: "2026-09-09",
    modified: "2026-09-13",
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
        heading: "結論：多數會唔同",
        paragraphs: [
          "會。公屋同居屋即使都係「1000M 光纖」，電訊商好多時用唔同計劃代碼、合約期同批量價。所以齊Quote 要你揀樓類：公屋頁唔應該見到只限私樓嘅價，居屋亦唔好用公屋價去對。",
          "呢個分別唔等於邊種樓一定平啲。個別屋苑、申請期、有冇指定供應商，都會令參考月費唔同。頁上數字只係市場記錄，唔係你地址嘅確認價。",
        ],
      },
      {
        heading: "點解要分開報價",
        paragraphs: [
          "屋邨同居屋屋苑成日有入場安排、指定供應商或者批量合約，安裝路經同管理處要求都可能同私樓唔同。電訊商按呢啲條件出計劃，先出現「公居屋一套、私樓一套」。",
          "村屋又再另一套，見 [村屋光纖](/guides/village)，唔好將公屋價套去丁屋。覆蓋同可唔可以拉線，仍然要電訊商確認，齊Quote 唔會寫死「一定有線」。",
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
          "Yes. Even when both are “1000M fibre”, carriers often use different plan codes, contract lengths and bulk rates. That is why ChaiQuote asks you to pick a housing type: a public-housing page should not show private-only fees, and HOS should not be compared against a public-housing price.",
          "The difference does not mean one type is always cheaper. Individual estates, application windows and nominated providers all change the listed fee. Numbers on the page are market records, not a confirmed price for your address.",
        ],
      },
      {
        heading: "Why they are quoted separately",
        paragraphs: [
          "Public estates and HOS courts often have bulk contracts, nominated providers, or building-office rules that differ from private blocks. Carriers issue plans against those conditions, which is why you see one set for public/HOS and another for private.",
          "Village houses are a third set. Do not apply a public-housing fee to a ding uk. Coverage and whether a line can be pulled still have to be confirmed by the carrier; ChaiQuote will not write that a line “definitely exists”.",
        ],
      },
      {
        heading: "How to read 1000M without inventing coverage",
        paragraphs: [
          "Filter [public fibre](/plans?cat=broadband&housing=public) and [HOS fibre](/plans?cat=broadband&housing=hos) and you will see different providers, contracts, routers and fees at the same speed. That is plan logic, not confirmation that a given estate can be installed. Listed 1000M examples: [public / HOS 1000M reference fees](/guides/public-hos-fees).",
          "To match a real building, open the estate page, for example [Tin Yiu Estate](/estates/tin-yiu) or [Tin Shui Estate](/estates/tin-shui). Those pages only list reference plans for that housing type. You still need to check the quote.",
        ],
      },
      {
        heading: "How to pick housing type on ChaiQuote",
        paragraphs: [
          "Type the estate on the home page. The site detects public housing, HOS, private or village house, then takes you to the compare page. Steps: [how to use the estate filter](/guides/estate-filter). You can also pick housing type by hand on the compare page. The wrong type shows the wrong fees.",
          DISCLAIMER_EN,
        ],
      },
    ],
  },
  {
    slug: "public-hos-fees",
    minutes: 6,
    category: "fiber",
    seoTitle: "公屋寬頻月費｜居屋1000M參考｜齊Quote",
    h1: "公屋／居屋 1000M 常見參考月費幾多？",
    description:
      "公屋寬頻月費同埋居屋 1000M 唔係劃一價。下列係站內列出例子，僅供參考，唔係保證價。先用樓類篩，覆蓋同月費以電訊商確認為準。",
    title: "公屋／居屋 1000M 常見參考月費幾多？",
    excerpt: "公屋寬頻月費唔係劃一價。下列係站內列出例子，僅供參考，唔代表你屋苑一定有。",
    titleEn: "Public / HOS 1000M: listed reference monthly fees",
    excerptEn: "Not one flat price. The examples below are listed on this site, for reference only — not a guarantee for your estate.",
    descriptionEn:
      "Public and HOS 1000M fibre is not one flat price. Examples below are listed on this site for reference only, not a guaranteed fee. Filter by housing type; coverage and fees are confirmed by the carrier.",
    h1En: "What are common listed 1000M fees for public / HOS housing?",
    published: "2026-09-11",
    modified: "2026-09-13",
    related: ["public-vs-hos", "home-broadband-2026", "private-1000-fees", "village-fees", "estate-filter", "fiber", "switch-broadband", "is-1000m-enough", "tin-shui-wai", "sha-tin"],
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
        heading: "地區例子",
        paragraphs: [
          "天水圍公屋例如 [天耀邨](/estates/tin-yiu)、[天瑞邨](/estates/tin-shui)，用呢張公居屋表，唔好用嘉湖私樓價。詳情見 [天水圍寬頻](/guides/tin-shui-wai)。",
          "沙田公屋例如 [瀝源邨](/estates/lek-yuen)、[禾輋邨](/estates/wo-che)，見 [沙田寬頻](/guides/sha-tin)。將軍澳公屋例如 [坑口邨](/estates/hang-hau)、[寶林邨](/estates/po-lam)，見 [將軍澳寬頻](/guides/tseung-kwan-o)。村屋／丁屋唔入呢張表，見 [村屋光纖月費](/guides/village-fees)。",
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
        heading: "District examples",
        paragraphs: [
          "Tin Shui Wai public estates such as [Tin Yiu](/estates/tin-yiu) use this public / HOS table, not Kingswood private pricing. See [Tin Shui Wai broadband](/guides/tin-shui-wai).",
          "Sha Tin public estates: [Sha Tin broadband](/guides/sha-tin). Tseung Kwan O public estates: [Tseung Kwan O broadband](/guides/tseung-kwan-o). Village houses are not on this table; see [village fibre fees](/guides/village-fees).",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Open [public fibre plans](/plans?cat=broadband&housing=public) or [HOS fibre plans](/plans?cat=broadband&housing=hos) and keep the housing filter on. How to search by estate name: [estate filter](/guides/estate-filter).",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "公屋寬頻月費大概幾錢？",
        a: "站內列出嘅 1000M 例子由有線 HK$58／48 個月、HGC 轉台 HK$75／36 個月，去到香港寬頻 HK$98／36 個月。呢啲**唔係**保證價，亦唔代表你屋邨一定有。實際以電訊商確認為準。",
      },
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
        q: "What are typical public-housing fibre monthly fees?",
        a: "Listed 1000M examples range from i-Cable HK$58 / 48 months and HGC switch HK$75 / 36 months, to HKBN HK$98 / 36 months. These are **not** guaranteed prices and do not mean your estate has them. The carrier confirms the actual fee.",
      },
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
    slug: "home-broadband-2026",
    minutes: 7,
    category: "fiber",
    seoTitle: "2026家居寬頻格價｜站內參考月費｜齊Quote",
    h1: "2026 家居寬頻格價：站內列出嘅參考月費",
    description:
      "2026 年齊Quote 站內列出嘅家居光纖參考月費例子。數字僅供參考，實際覆蓋同月費以電訊商確認為準。",
    title: "2026 家居寬頻格價：站內列出嘅參考月費",
    excerpt: "2026 年站內列出嘅家居光纖參考月費例子。僅供參考，唔係劃一價。",
    titleEn: "2026 home broadband: listed reference monthly fees",
    excerptEn: "Home fibre examples listed on this site for 2026. For reference only — not a territory-wide price.",
    descriptionEn:
      "2026 home fibre examples listed on ChaiQuote. Figures are for reference only. Actual coverage and fees are confirmed by the carrier.",
    h1En: "2026 home broadband: listed reference monthly fees",
    published: "2026-09-12",
    related: [
      "public-hos-fees",
      "private-1000-fees",
      "village-fees",
      "estate-filter",
      "switch-broadband",
      "village",
      "fiber",
      "is-1000m-enough",
      "public-vs-hos",
    ],
    plans: [{ href: "/plans?cat=broadband", label: "去光纖格價" }],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/public-hos-fees", label: "公屋／居屋參考月費" },
      { href: "/guides/private-1000-fees", label: "私樓 1000M 參考月費" },
      { href: "/guides/village-fees", label: "村屋光纖月費" },
      { href: "/guides/village", label: "村屋點算" },
    ],
    body: [
      {
        heading: "唔係全港劃一價",
        paragraphs: [
          "2026 年家居光纖**唔係**全港劃一價。下列係**站內列出**例子，**僅供參考**。實際覆蓋同月費以電訊商確認為準。",
          "部分計劃適用多過一種樓類——以計劃卡為準。呢張表**唔係排名**。",
        ],
      },
      {
        heading: "1000M：站內列出例子",
        paragraphs: ["下列係站內列出嘅 1000M 例子，僅供參考。"],
        table: {
          caption: "站內列出，僅供參考",
          headers: ["供應商／計劃例子", "樓類／站內列出"],
          rows: [
            {
              label: "有線｜指定屋苑 1000M 光纖入屋（48 個月）",
              value: "公屋、居屋、私樓｜HK$58",
              href: "/plans/icable-ftth-1000-48m-58",
            },
            {
              label: "HGC｜公居屋轉台 1000M（36 個月）",
              value: "公屋、居屋｜HK$75",
              href: "/plans/hgc-ftth-1000-public-36m",
            },
            {
              label: "中國移動香港｜1000M 光纖入屋（36 個月）",
              value: "公屋、居屋、私樓｜HK$88",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "數碼通｜1000M 家居寬頻（36 個月）",
              value: "公屋、居屋、私樓｜HK$88",
              href: "/plans/smartone-ftth-1000",
            },
            {
              label: "有線｜私人樓宇 1000M 光纖（36 個月）",
              value: "私樓｜HK$88",
              href: "/plans/icable-ftth-1000-private-36m",
            },
            {
              label: "HGC｜公居屋 1000M（39 個月＋Wi-Fi 6＋電話）",
              value: "公屋、居屋｜HK$89",
              href: "/plans/hgc-ftth-1000-public-39m",
            },
            {
              label: "香港寬頻｜1000M 連 Wi-Fi 7（BE220・36 個月）",
              value: "公屋、居屋、私樓｜HK$98",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
            {
              label: "網上行｜村屋 1000M（36 個月）",
              value: "村屋｜HK$278",
              href: "/plans/netvigator-ftth-1000-village-36m",
            },
          ],
        },
      },
      {
        heading: "點理解 1000M 表",
        paragraphs: [
          "呢張表**唔係排名**，亦唔保證你屋苑有其中一條。",
          "村屋月費同公屋／居屋／私樓**唔好混用**。公居屋 1000M 見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)；私樓 1000M 見 [私樓 1000M 參考月費](/guides/private-1000-fees)；村屋見 [村屋光纖月費](/guides/village-fees)。",
          "適用樓類以計劃卡為準。",
        ],
      },
      {
        heading: "2500M：站內列出例子",
        paragraphs: ["下列係站內列出嘅 2500M 例子，僅供參考。"],
        table: {
          caption: "站內列出，僅供參考",
          headers: ["供應商／計劃例子", "樓類／站內列出"],
          rows: [
            {
              label: "香港寬頻｜2500M 連家居電話（24 個月＋Wi-Fi 7）",
              value: "公屋、居屋、私樓｜HK$149",
              href: "/plans/hkbn-ftth-2500-24m-149",
            },
            {
              label: "網上行｜公居屋 2500M（36 個月＋Wi-Fi 7）",
              value: "公屋、居屋｜HK$158",
              href: "/plans/netvigator-ftth-2500-public-36m-158",
            },
            {
              label: "網上行｜私人樓宇 2500M（36 個月＋Wi-Fi 7）",
              value: "私樓｜HK$178",
              href: "/plans/netvigator-ftth-2500-private-36m-176",
            },
            {
              label: "香港寬頻｜特選村屋 2500M（24 個月）",
              value: "村屋｜HK$258",
              href: "/plans/hkbn-village-2500-24m",
            },
            {
              label: "網上行｜村屋 2500M（36 個月）",
              value: "村屋｜HK$376",
              href: "/plans/netvigator-ftth-2500-village-36m",
            },
          ],
        },
      },
      {
        heading: "點用",
        paragraphs: [
          "先用 [齊Quote 點用屋苑篩](/guides/estate-filter) 對樓類，再睇計劃卡上嘅月費、合約同適用樓類，最後用 WhatsApp 查核。轉台見 [轉寬頻點樣減少斷網](/guides/switch-broadband)。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "去 [光纖格價](/plans?cat=broadband) 對卡。覆蓋同月費以電訊商確認為準。地區例子：[天水圍寬頻](/guides/tin-shui-wai)、[沙田寬頻](/guides/sha-tin)、[將軍澳寬頻](/guides/tseung-kwan-o)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Not one territory-wide price",
        paragraphs: [
          "2026 home fibre is **not** a single Hong Kong-wide fee. The rows below are **listed on this site**, **for reference only**. Coverage and fees are confirmed by the carrier.",
          "Some plans apply to more than one housing type — the plan card wins. This table is **not a ranking**.",
        ],
      },
      {
        heading: "1000M: listed examples",
        paragraphs: ["The 1000M rows below are listed on this site, for reference only."],
        table: {
          caption: "Listed on this site, for reference only",
          headers: ["Provider / example plan", "Housing / listed fee"],
          rows: [
            {
              label: "i-Cable | Designated-estate 1000M FTTH (48 months)",
              value: "Public, HOS, private | HK$58",
              href: "/plans/icable-ftth-1000-48m-58",
            },
            {
              label: "HGC | Public / HOS switch 1000M (36 months)",
              value: "Public, HOS | HK$75",
              href: "/plans/hgc-ftth-1000-public-36m",
            },
            {
              label: "CMHK | 1000M fibre to the home (36 months)",
              value: "Public, HOS, private | HK$88",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "SmarTone | 1000M home broadband (36 months)",
              value: "Public, HOS, private | HK$88",
              href: "/plans/smartone-ftth-1000",
            },
            {
              label: "i-Cable | Private-estate 1000M fibre (36 months)",
              value: "Private | HK$88",
              href: "/plans/icable-ftth-1000-private-36m",
            },
            {
              label: "HGC | Public / HOS 1000M (39 months + Wi-Fi 6 + phone)",
              value: "Public, HOS | HK$89",
              href: "/plans/hgc-ftth-1000-public-39m",
            },
            {
              label: "HKBN | 1000M with Wi-Fi 7 (BE220, 36 months)",
              value: "Public, HOS, private | HK$98",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
            {
              label: "Netvigator | Village 1000M (36 months)",
              value: "Village | HK$278",
              href: "/plans/netvigator-ftth-1000-village-36m",
            },
          ],
        },
      },
      {
        heading: "How to read the 1000M table",
        paragraphs: [
          "This table is **not a ranking**, and it does not guarantee any of these plans at your estate.",
          "Do **not** mix village fees with public / HOS / private fees. Public / HOS 1000M: [public / HOS 1000M reference fees](/guides/public-hos-fees). Private 1000M: [private-estate 1000M reference fees](/guides/private-1000-fees). Village: [village fibre fees](/guides/village-fees).",
          "Housing type is confirmed on the plan card.",
        ],
      },
      {
        heading: "2500M: listed examples",
        paragraphs: ["The 2500M rows below are listed on this site, for reference only."],
        table: {
          caption: "Listed on this site, for reference only",
          headers: ["Provider / example plan", "Housing / listed fee"],
          rows: [
            {
              label: "HKBN | 2500M with home phone (24 months + Wi-Fi 7)",
              value: "Public, HOS, private | HK$149",
              href: "/plans/hkbn-ftth-2500-24m-149",
            },
            {
              label: "Netvigator | Public / HOS 2500M (36 months + Wi-Fi 7)",
              value: "Public, HOS | HK$158",
              href: "/plans/netvigator-ftth-2500-public-36m-158",
            },
            {
              label: "Netvigator | Private-estate 2500M (36 months + Wi-Fi 7)",
              value: "Private | HK$178",
              href: "/plans/netvigator-ftth-2500-private-36m-176",
            },
            {
              label: "HKBN | Selected village 2500M (24 months)",
              value: "Village | HK$258",
              href: "/plans/hkbn-village-2500-24m",
            },
            {
              label: "Netvigator | Village 2500M (36 months)",
              value: "Village | HK$376",
              href: "/plans/netvigator-ftth-2500-village-36m",
            },
          ],
        },
      },
      {
        heading: "How to use this page",
        paragraphs: [
          "Start with the [estate filter](/guides/estate-filter) to match housing type, read the fee, contract and housing tags on the plan card, then confirm on WhatsApp. Switching: [switching broadband](/guides/switch-broadband).",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Open [fibre compare](/plans?cat=broadband) and read the cards. Coverage and fees are confirmed by the carrier. District pages: [Tin Shui Wai](/guides/tin-shui-wai), [Sha Tin](/guides/sha-tin), [Tseung Kwan O](/guides/tseung-kwan-o).",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "點解公屋同居屋月費會唔同？",
        a: "公屋同居屋好多時分開批量計劃，篩選時分開揀。公居屋 1000M 例子見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)。頁上數字只係站內列出、僅供參考。",
      },
      {
        q: "村屋可唔可以用 HK$58 嗰行？",
        a: "唔可以。HK$58 嗰行係有線 1000M（48 個月），適用公屋、居屋、私樓，唔適用村屋。村屋月費同安裝環境係另一套，見 [村屋光纖月費](/guides/village-fees)。",
      },
      {
        q: "表上數字係咪保證價？",
        a: "唔係保證價。站內列出只供參考，實際月費、合約同覆蓋一律以電訊商確認為準。",
      },
      {
        q: "點解表入面冇快閃優惠？",
        a: "快閃／入伙限定只適用指定屋苑同限期，**唔入**呢張摘要表。要對自己屋苑，用 [齊Quote 點用屋苑篩](/guides/estate-filter)。",
      },
    ],
    faqEn: [
      {
        q: "Why do public-housing and HOS fees differ?",
        a: "They often have separate bulk plans and should be filtered separately. Public / HOS 1000M examples: [public / HOS 1000M reference fees](/guides/public-hos-fees). Figures on this page are listed on the site, for reference only.",
      },
      {
        q: "Can a village house use the HK$58 row?",
        a: "No. The HK$58 row is i-Cable 1000M (48 months) for public, HOS and private housing, not village houses. Village fees and install conditions are a separate set; see [village fibre fees](/guides/village-fees).",
      },
      {
        q: "Is the table a guaranteed price?",
        a: "No. Listed fees are for reference only. Actual fees, contracts and coverage are confirmed by the carrier.",
      },
      {
        q: "Why are flash offers missing?",
        a: "Flash and intake-only offers apply to named estates and time windows. They are **not** in this summary table. Match your estate with the [estate filter](/guides/estate-filter).",
      },
    ],
  },
  {
    slug: "private-1000-fees",
    minutes: 6,
    category: "fiber",
    seoTitle: "私樓寬頻月費｜私樓1000M參考｜齊Quote",
    h1: "私樓 1000M 常見參考月費幾多？",
    description:
      "私樓 1000M 唔係劃一價。下列係站內列出例子，僅供參考，唔係保證價。部分計劃亦適用公屋／居屋，以計劃卡為準。覆蓋同月費以電訊商確認為準。",
    title: "私樓 1000M 常見參考月費幾多？",
    excerpt: "唔係劃一價。下列係站內列出例子，僅供參考。部分計劃亦適用公屋／居屋，以計劃卡為準。",
    titleEn: "Private-estate 1000M: listed reference monthly fees",
    excerptEn:
      "Not one flat price. The examples below are listed on this site, for reference only. Some plans also apply to public / HOS — the plan card wins.",
    descriptionEn:
      "Private-estate 1000M fibre is not one flat price. Examples below are listed on this site for reference only, not a guaranteed fee. Some plans also apply to public / HOS; the plan card wins. Coverage and fees are confirmed by the carrier.",
    h1En: "What are common listed 1000M fees for private estates?",
    published: "2026-09-12",
    modified: "2026-09-13",
    related: ["public-hos-fees", "home-broadband-2026", "village-fees", "estate-filter", "fiber", "public-vs-hos", "sha-tin", "tseung-kwan-o"],
    plans: [{ href: "/plans?cat=broadband&housing=private", label: "私樓光纖計劃" }],
    estates: [
      { href: "/estates/taikoo-shing", label: "太古城" },
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/public-hos-fees", label: "公屋／居屋參考月費" },
    ],
    body: [
      {
        heading: "唔係劃一價",
        paragraphs: [
          "私樓 1000M **唔係**全港劃一價。下列係**站內列出**例子，僅供參考。部分計劃亦適用公屋／居屋——**以計劃卡為準**。",
        ],
        table: {
          caption: "站內列出｜僅供參考",
          headers: ["供應商／計劃例子", "樓類／站內列出"],
          rows: [
            {
              label: "有線｜指定屋苑 1000M 光纖入屋（48 個月）",
              value: "公屋、居屋、私樓｜HK$58",
              href: "/plans/icable-ftth-1000-48m-58",
            },
            {
              label: "中國移動香港｜1000M 光纖入屋（36 個月）",
              value: "公屋、居屋、私樓｜HK$88",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "數碼通｜1000M 家居寬頻（36 個月）",
              value: "公屋、居屋、私樓｜HK$88",
              href: "/plans/smartone-ftth-1000",
            },
            {
              label: "有線｜私人樓宇 1000M 光纖（36 個月）",
              value: "私樓｜HK$88",
              href: "/plans/icable-ftth-1000-private-36m",
            },
            {
              label: "HGC｜私人樓宇 1000M（39 個月＋Wi-Fi 6＋電話）",
              value: "私樓｜HK$89",
              href: "/plans/hgc-ftth-1000-private-39m",
            },
            {
              label: "香港寬頻｜1000M 連 Wi-Fi 7（BE220・36 個月）",
              value: "公屋、居屋、私樓｜HK$98",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
            {
              label: "香港寬頻｜1000M 家居寬頻（24 個月）",
              value: "公屋、居屋、私樓｜HK$109",
              href: "/plans/hkbn-ftth-1000-24m-109",
            },
          ],
        },
      },
      {
        heading: "點理解呢批例子",
        paragraphs: [
          "唔好用公屋／居屋價去估私樓。公居屋 1000M 見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)。2026 年站內列出例子見 [2026 家居寬頻格價](/guides/home-broadband-2026)。村屋唔入呢張表，見 [村屋光纖月費](/guides/village-fees)。",
          "呢張表**唔係排名**，亦唔保證你屋苑有其中一條。適用樓類以計劃卡為準。",
          "點查：先用樓類篩（私樓），再睇計劃卡上嘅月費、合約同適用樓類，最後用 WhatsApp 查核。覆蓋同月費以電訊商確認為準。",
        ],
      },
      {
        heading: "地區例子",
        paragraphs: [
          "嘉湖山莊見 [天水圍寬頻](/guides/tin-shui-wai)。沙田第一城、名城見 [沙田寬頻](/guides/sha-tin)。日出康城、維景灣畔見 [將軍澳寬頻](/guides/tseung-kwan-o)。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "去 [私樓光纖格價](/plans?cat=broadband&housing=private)，配合樓類篩再對卡。想知點用屋苑名，見 [齊Quote 點用屋苑篩](/guides/estate-filter)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Not one flat price",
        paragraphs: [
          "Private-estate 1000M is **not** a single Hong Kong-wide fee. The rows below are **listed on this site**, for reference only. Some plans also apply to public housing / HOS — **the plan card wins**.",
        ],
        table: {
          caption: "Listed on this site | for reference only",
          headers: ["Provider / example plan", "Housing / listed fee"],
          rows: [
            {
              label: "i-Cable | Designated-estate 1000M FTTH (48 months)",
              value: "Public, HOS, private | HK$58",
              href: "/plans/icable-ftth-1000-48m-58",
            },
            {
              label: "CMHK | 1000M fibre to the home (36 months)",
              value: "Public, HOS, private | HK$88",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "SmarTone | 1000M home broadband (36 months)",
              value: "Public, HOS, private | HK$88",
              href: "/plans/smartone-ftth-1000",
            },
            {
              label: "i-Cable | Private-estate 1000M fibre (36 months)",
              value: "Private | HK$88",
              href: "/plans/icable-ftth-1000-private-36m",
            },
            {
              label: "HGC | Private-estate 1000M (39 months + Wi-Fi 6 + phone)",
              value: "Private | HK$89",
              href: "/plans/hgc-ftth-1000-private-39m",
            },
            {
              label: "HKBN | 1000M with Wi-Fi 7 (BE220, 36 months)",
              value: "Public, HOS, private | HK$98",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
            {
              label: "HKBN | 1000M home broadband (24 months)",
              value: "Public, HOS, private | HK$109",
              href: "/plans/hkbn-ftth-1000-24m-109",
            },
          ],
        },
      },
      {
        heading: "How to read these examples",
        paragraphs: [
          "Do not guess a private-estate fee from a public-housing price. Public / HOS 1000M: [public / HOS 1000M reference fees](/guides/public-hos-fees). 2026 listed examples: [2026 home broadband](/guides/home-broadband-2026). Village houses: [village fibre fees](/guides/village-fees).",
          "This table is **not a ranking**, and it does not guarantee any of these plans at your estate. Housing type is confirmed on the plan card.",
          "How to check: filter by housing type (private), read the fee, contract and housing tags on the plan card, then confirm on WhatsApp. Coverage and fees are confirmed by the carrier.",
        ],
      },
      {
        heading: "District examples",
        paragraphs: [
          "Kingswood Villas: [Tin Shui Wai broadband](/guides/tin-shui-wai). City One: [Sha Tin broadband](/guides/sha-tin). LOHAS Park: [Tseung Kwan O broadband](/guides/tseung-kwan-o).",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Open [private fibre plans](/plans?cat=broadband&housing=private) and keep the housing filter on. How to search by estate name: [estate filter](/guides/estate-filter).",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "私樓寬頻月費大概幾錢？",
        a: "站內列出嘅私樓 1000M 例子包括有線私人樓宇 HK$88／36 個月、HGC HK$89／39 個月、香港寬頻 HK$98／36 個月。部分計劃亦適用公屋／居屋，**以計劃卡為準**。唔係保證價。",
      },
      {
        q: "係咪保證價？",
        a: "唔係保證價。站內列出只供參考，實際月費、合約同覆蓋一律以電訊商確認為準。",
      },
      {
        q: "點查覆蓋／自己屋苑？",
        a: "先用樓類篩（私樓），再睇計劃卡，最後用 WhatsApp 查核。輸入屋苑名見 [齊Quote 點用屋苑篩](/guides/estate-filter)。覆蓋以電訊商確認為準。",
      },
    ],
    faqEn: [
      {
        q: "What are typical private-estate fibre monthly fees?",
        a: "Listed private 1000M examples include i-Cable HK$88 / 36 months, HGC HK$89 / 39 months and HKBN HK$98 / 36 months. Some plans also apply to public / HOS — **the plan card wins**. Not a guaranteed price.",
      },
      {
        q: "Is this a guaranteed price?",
        a: "No. Listed fees are for reference only. Actual fees, contracts and coverage are confirmed by the carrier.",
      },
      {
        q: "How do I check coverage for my estate?",
        a: "Filter by housing type (private), read the plan card, then confirm on WhatsApp. How to type an estate name: [estate filter](/guides/estate-filter). Coverage is confirmed by the carrier.",
      },
    ],
  },
  {
    slug: "village-fees",
    minutes: 6,
    category: "fiber",
    seoTitle: "村屋光纖月費｜丁屋參考計劃｜齊Quote",
    h1: "村屋光纖常見參考月費幾多？",
    description:
      "村屋光纖月費係另一套計劃，唔好套用公屋／居屋／私樓價。下列係站內列出例子，僅供參考。丁屋、新界村屋覆蓋同安裝以電訊商確認為準。",
    title: "村屋光纖月費幾多？站內列出參考",
    excerpt: "村屋光纖月費係另一套計劃。下列係站內列出例子，僅供參考。唔好套用公屋／居屋／私樓月費。",
    titleEn: "Village fibre: listed reference monthly fees",
    excerptEn:
      "Village fibre is a separate set of plans. The examples below are listed on this site, for reference only. Do not apply public / HOS / private fees.",
    descriptionEn:
      "Village fibre is a separate set of plans. Examples below are listed on this site for reference only. Do not apply public, HOS or private fees. Coverage and install are confirmed by the carrier.",
    h1En: "What are common listed village fibre monthly fees?",
    published: "2026-09-12",
    modified: "2026-09-13",
    related: ["village", "home-broadband-2026", "village-onsite", "fiber", "estate-filter", "tseung-kwan-o", "tin-shui-wai"],
    plans: [{ href: "/plans?cat=broadband&housing=village", label: "村屋光纖計劃" }],
    estates: [
      { href: "/guides/village", label: "村屋點算" },
      { href: "/guides/village-onsite", label: "實地視察" },
      { href: "/estates", label: "屋苑目錄" },
    ],
    inquiry: { housing: "village" },
    cta: {
      lead: "填完整村屋／丁屋地址，用 WhatsApp 查核覆蓋同村屋光纖月費。僅供參考，以電訊商確認為準。",
      leadEn: "Send the full village-house address on WhatsApp to check coverage and village fibre fees. For reference only; the carrier confirms.",
      button: "WhatsApp 查核村屋光纖月費",
      buttonEn: "WhatsApp a village fibre quote",
      waText: salesQuoteMessage({ serviceType: "光纖寬頻", housing: "村屋", source: "filter" }),
      waTextEn: salesQuoteMessage({ serviceType: "光纖寬頻", housing: "村屋", source: "filter" }),
    },
    body: [
      {
        heading: "村屋係另一套",
        paragraphs: [
          "村屋光纖月費係**另一套**計劃，**唔好**套用公屋／居屋／私樓月費。下列係**站內列出**例子，僅供參考。",
        ],
        table: {
          caption: "站內列出｜僅供參考",
          headers: ["供應商／計劃例子", "樓類／站內列出"],
          rows: [
            {
              label: "香港寬頻｜特選村屋 2000M 光纖（24 個月）",
              value: "村屋｜HK$229",
              href: "/plans/hkbn-village-2000-24m",
            },
            {
              label: "香港寬頻｜特選村屋 2500M 光纖（24 個月）",
              value: "村屋｜HK$258",
              href: "/plans/hkbn-village-2500-24m",
            },
            {
              label: "網上行｜村屋 1000M 光纖計劃（36 個月）",
              value: "村屋｜HK$278",
              href: "/plans/netvigator-ftth-1000-village-36m",
            },
            {
              label: "香港寬頻｜村屋 200M 光纖（27 個月）",
              value: "村屋｜HK$298",
              href: "/plans/hkbn-village-200-27m",
            },
            {
              label: "HGC｜村屋 1G 連電話（24 個月）",
              value: "村屋｜HK$319",
              href: "/plans/hgc-village-1g-phone-24m",
            },
            {
              label: "網上行｜村屋 2500M 光纖計劃（36 個月）",
              value: "村屋｜HK$376",
              href: "/plans/netvigator-ftth-2500-village-36m",
            },
          ],
        },
      },
      {
        heading: "點理解呢批例子",
        paragraphs: [
          "呢張表**唔係排名**，亦唔保證你條村一定有其中一條。",
          "村屋月費同公屋／居屋／私樓**唔好混用**。2026 年站內列出例子見 [2026 家居寬頻格價](/guides/home-broadband-2026)。覆蓋同安裝見 [村屋寬頻點算](/guides/village)。",
        ],
      },
      {
        heading: "點解村屋光纖月費通常分開報",
        paragraphs: [
          "公屋、居屋好多時有批量合約；村屋、丁屋入線睇條村、條街、井蓋同屋地，所以月費、安裝費、完工期都係另一套。表上由 HK$229 起嗰幾行係**特選村屋**計劃，唔等於新界每條村都有。",
          "報價一定要填完整地址，唔好只寫「元朗村屋」。需要可以約 [實地視察同現場測 5G](/guides/village-onsite)。",
        ],
      },
      {
        heading: "拉唔到光纖點算",
        paragraphs: [
          "村屋未必拉到光纖。可以一併睇 [5G 家居攻略](/guides/home5g) 同 [5G 家居格價](/plans?cat=home5g)。5G 家居速度視訊號，唔好當固定光纖替代。",
        ],
      },
      {
        heading: "新界村屋、丁屋點報價",
        paragraphs: [
          "元朗、錦田、八鄉、屏山、大埔、西貢、坑口村等新界村屋／丁屋，唔好用公屋表去估村屋光纖月費。月費睇條村、條街，唔係一區一價。將軍澳範圍村屋見 [將軍澳寬頻](/guides/tseung-kwan-o)；天水圍附近村屋仍然用呢張村屋表，唔好用嘉湖價，見 [天水圍寬頻](/guides/tin-shui-wai)。",
          "報價一定要填完整地址同門牌，唔好只寫區名。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "去 [村屋光纖格價](/plans?cat=broadband&housing=village) 對卡。拉唔到光纖可一併睇 [5G 家居格價](/plans?cat=home5g)。地區：[天水圍寬頻](/guides/tin-shui-wai)、[將軍澳寬頻](/guides/tseung-kwan-o)。想知點用屋苑名，見 [齊Quote 點用屋苑篩](/guides/estate-filter)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Village is a separate set",
        paragraphs: [
          "Village fibre monthly fees are a **separate set** of plans. Do **not** apply public / HOS / private fees. The rows below are **listed on this site**, for reference only.",
        ],
        table: {
          caption: "Listed on this site | for reference only",
          headers: ["Provider / example plan", "Housing / listed fee"],
          rows: [
            {
              label: "HKBN | Selected village 2000M fibre (24 months)",
              value: "Village | HK$229",
              href: "/plans/hkbn-village-2000-24m",
            },
            {
              label: "HKBN | Selected village 2500M fibre (24 months)",
              value: "Village | HK$258",
              href: "/plans/hkbn-village-2500-24m",
            },
            {
              label: "Netvigator | Village 1000M fibre plan (36 months)",
              value: "Village | HK$278",
              href: "/plans/netvigator-ftth-1000-village-36m",
            },
            {
              label: "HKBN | Village 200M fibre (27 months)",
              value: "Village | HK$298",
              href: "/plans/hkbn-village-200-27m",
            },
            {
              label: "HGC | Village 1G with phone (24 months)",
              value: "Village | HK$319",
              href: "/plans/hgc-village-1g-phone-24m",
            },
            {
              label: "Netvigator | Village 2500M fibre plan (36 months)",
              value: "Village | HK$376",
              href: "/plans/netvigator-ftth-2500-village-36m",
            },
          ],
        },
      },
      {
        heading: "How to read these examples",
        paragraphs: [
          "This table is **not a ranking**, and it does not guarantee any of these plans at your village.",
          "Do **not** mix village fees with public / HOS / private fees. 2026 listed examples: [2026 home broadband](/guides/home-broadband-2026). Coverage and install: [village broadband](/guides/village).",
        ],
      },
      {
        heading: "Why village fibre is quoted separately",
        paragraphs: [
          "Public and HOS estates often have bulk contracts. Village houses depend on the village, the street and the install path, so the fee table is a **separate set**. Rows from HK$229 are **selected village** plans, not every village in the New Territories.",
          "Give the full address. You can book [an on-site visit / 5G test](/guides/village-onsite).",
        ],
      },
      {
        heading: "If fibre cannot be pulled",
        paragraphs: [
          "Village houses may not get fibre. Also see [5G home](/guides/home5g) and [5G home plans](/plans?cat=home5g). Speed depends on the signal; do not treat it as fixed fibre.",
        ],
      },
      {
        heading: "How New Territories village houses are quoted",
        paragraphs: [
          "Village houses and ding uk in Yuen Long, Kam Tin, Pat Heung, Ping Shan, Tai Po, Sai Kung and Hang Hau Village should not reuse a public-housing table for village fibre fees. The fee depends on the village and the street, not one district price. Tseung Kwan O villages: [Tseung Kwan O broadband](/guides/tseung-kwan-o). Villages near Tin Shui Wai still use this village table, not Kingswood pricing: [Tin Shui Wai broadband](/guides/tin-shui-wai).",
          "Give the full address and house number. A district name alone is not enough.",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Open [village fibre plans](/plans?cat=broadband&housing=village) and read the cards. If fibre cannot be pulled, also see [5G home plans](/plans?cat=home5g). Districts: [Tin Shui Wai](/guides/tin-shui-wai), [Tseung Kwan O](/guides/tseung-kwan-o). How to search by estate name: [estate filter](/guides/estate-filter).",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "村屋光纖月費大概幾錢？",
        a: "站內列出例子由特選村屋 2000M HK$229／24 個月起，去到網上行村屋 2500M HK$376／36 個月。呢啲**唔係**保證價，亦唔等於你條村一定有。實際以電訊商確認為準。",
      },
      {
        q: "拉唔到光纖點算？",
        a: "村屋未必拉到光纖。可以先睇 [5G 家居攻略](/guides/home5g)，或者約 [實地視察同現場測 5G](/guides/village-onsite)。覆蓋以電訊商確認為準。",
      },
      {
        q: "可唔可以用私樓表上嘅價？",
        a: "唔可以。私樓 1000M 例子見 [私樓 1000M 參考月費](/guides/private-1000-fees)。村屋係另一套計劃，唔好套用公屋／居屋／私樓月費。頁上例子只係站內列出、僅供參考。",
      },
      {
        q: "丁屋光纖月費同村屋一樣？",
        a: "丁屋同村屋都歸入村屋計劃，唔好套用公屋／居屋／私樓月費。實際村屋光纖月費以電訊商確認為準，表上只係站內列出例子。",
      },
      {
        q: "特選村屋計劃係咪每條村都有？",
        a: "唔係。表上由 HK$229 起嗰幾行係特選村屋計劃，唔等於新界每條村都有。覆蓋以電訊商確認為準。",
      },
      {
        q: "係咪保證價？",
        a: "唔係保證價。站內列出只供參考，實際月費、合約同覆蓋一律以電訊商確認為準。",
      },
    ],
    faqEn: [
      {
        q: "What are typical village fibre monthly fees?",
        a: "Listed examples start at selected-village 2000M HK$229 / 24 months, up to Netvigator village 2500M HK$376 / 36 months. These are **not** guaranteed prices and do not mean every village has them. The carrier confirms the actual fee.",
      },
      {
        q: "What if fibre cannot be pulled?",
        a: "Village houses may not get fibre. See [5G home](/guides/home5g), or book [an on-site visit / 5G test](/guides/village-onsite). Coverage is confirmed by the carrier.",
      },
      {
        q: "Can I use the private-estate table prices?",
        a: "No. Private-estate 1000M examples: [private-estate 1000M reference fees](/guides/private-1000-fees). Village plans are a separate set. Do not reuse public / HOS / private fees. The examples on this page are listed on the site, for reference only.",
      },
      {
        q: "Are ding uk fees the same as village fibre fees?",
        a: "Ding uk and village houses both use village plans. Do not reuse public / HOS / private fees. Actual village fibre fees are confirmed by the carrier; the table is listed examples only.",
      },
      {
        q: "Does every village have the selected-village plans?",
        a: "No. Rows from HK$229 are selected-village plans, not every village in the New Territories. Coverage is confirmed by the carrier.",
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
    related: ["fiber", "village", "public-hos-fees", "private-1000-fees", "village-fees", "public-vs-hos", "switch-broadband"],
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
        paragraphs: [
          "跟住三步：輸入 → 睇卡 → 分享或 WhatsApp。",
          "唔知屋苑名或者想講條件，可用頁面「AI 篩選（測試版）」講樓類或預算；對到會列出參考計劃（僅供參考）。價錢睇卡片，實際以電訊商確認為準。",
        ],
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
          "村屋係另一套，見 [村屋寬頻點算](/guides/village)、[村屋光纖月費](/guides/village-fees)。",
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
        paragraphs: [
          "Type → read the card → share or WhatsApp.",
          "If you do not know the estate name or want to describe conditions, use the page **AI filter (Beta)** to mention housing type or budget. Matches list **reference plans** (for reference only). Read fees on the cards; the carrier confirms the actual terms.",
        ],
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
          "Village houses are a separate set of plans; see [village broadband](/guides/village) and [village fibre fees](/guides/village-fees).",
          DISCLAIMER_EN,
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
        a: "村屋唔好用公屋價去估。月費例子見 [村屋光纖月費](/guides/village-fees)。另見 [村屋寬頻點算](/guides/village)，需要可以約 [實地視察](/guides/village-onsite)。",
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
        a: "Do not reuse a public-housing fee for a village house. Fee examples: [village fibre fees](/guides/village-fees). Also see [village broadband](/guides/village); book an [on-site check](/guides/village-onsite) if needed.",
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
    published: "2026-09-09",
    modified: "2026-09-13",
    related: ["fiber", "fiber-vs-5g", "contract-fees", "broadband-total-cost", "1000m-or-2500m"],
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
        paragraphs: [
          "Streaming, video calls, cloud sync, and several phones and TVs at once: 1000M fibre already has headroom for most households. You do not have to chase 2500M or 10000M from day one.",
          "The real bottleneck is often an old router, Wi-Fi placement, walls, or the device’s network card — not the fibre into the home. Before paying for more speed, check whether the current Wi-Fi is already using the full 1000M.",
        ],
      },
      {
        heading: "What you actually use",
        paragraphs: [
          "One or two 4K streams, daily calls and classes: 1000M is usually enough. A busy home, several HD streams at once, frequent large uploads or a NAS: consider 2500M. Very many devices, or spare bandwidth, may need a higher rate — and a higher fee and better hardware.",
          "Do not treat a 5G home headline speed as fibre 1000M. On-site signal and data caps limit the experience. Compare: [fibre vs 5G home](/guides/fiber-vs-5g).",
        ],
      },
      {
        heading: "Fix in-home Wi-Fi before buying more speed",
        paragraphs: [
          "After fibre is in, a Wi-Fi 6 / Wi-Fi 7 router, sensible placement, and avoiding microwaves and thick walls often help more than the next speed tier. Ask whether the contract “includes” a router or “gifts” one that must be returned; see [install, prepay, contract](/guides/contract-fees).",
          "Next: [fibre compare](/plans?cat=broadband). Estate examples: [Taikoo Shing](/estates/taikoo-shing), [Mei Foo Sun Chuen](/estates/mei-foo-sun-chuen). " + DISCLAIMER_EN,
        ],
      },
    ],
  },
  {
    slug: "broadband-total-cost",
    minutes: 7,
    category: "fiber",
    seoTitle: "寬頻合約總成本點計｜免月費同回贈點計｜齊Quote",
    h1: "寬頻合約總成本點計：標示月費同實際平均月費",
    description:
      "標示月費唔等於合約期內實際平均月費。要計合約期、免月費、回贈、預繳同安裝費。公屋、居屋、私樓同村屋唔好混用數字。僅供參考，以電訊商確認為準。",
    title: "寬頻合約總成本點計：標示月費同實際平均月費",
    excerpt: "標示月費唔等於實際平均月費。要計合約期、免月費、回贈同預繳，樓類唔好混用。",
    titleEn: "How to calculate broadband total contract cost",
    excerptEn:
      "The listed monthly fee is not the average over the contract. Count free months, rebates, prepayment and installation. Do not mix housing types.",
    descriptionEn:
      "The listed monthly fee is not the average you pay over the contract. Count free months, rebates, prepayment and installation fees. Public, HOS, private and village fees must not be mixed. For reference only.",
    h1En: "How to calculate broadband total contract cost",
    published: "2026-10-14",
    modified: "2026-10-14",
    related: ["fiber", "home-broadband-2026", "public-vs-hos", "estate-filter", "contract-fees", "is-1000m-enough"],
    plans: [{ href: "/plans?cat=broadband", label: "去光纖格價" }],
    estates: [{ href: "/estates", label: "屋苑目錄" }],
    body: [
      {
        heading: "標示月費同實際平均月費",
        paragraphs: [
          "計劃卡上的月費通常是標示月費。合約期內如果有免月費、回贈或預繳，實際平均月費會唔同。",
          "計算時先分清：合約總月數、免月費月份、回贈金額、預繳金額，同有冇豁免安裝費。提早終止費亦要問清楚。",
        ],
      },
      {
        heading: "點計平均月費",
        paragraphs: [
          "簡單例子：標示 HK$98／月，36 個月合約，其中 3 個月免月費。合約期內實際付款月數是 33 個月。",
          "總付款約 HK$98 × 33 = HK$3,234。除以 36 個月，平均約 HK$89.8／月。這只是站內列出例子，唔代表所有計劃。",
          "如果有預繳或回贈，要先加回或減去，再計算平均。安裝費如果未豁免，亦要計入初期成本。",
        ],
      },
      {
        heading: "樓類唔好混用",
        paragraphs: [
          "公屋、居屋、私樓同村屋的計劃同月費通常唔同。批量合約、指定供應商同入線安排都會影響。",
          "用錯樓類的數字去估自己屋苑，會令總成本計算失準。先用屋苑篩對樓類，再睇該樓類的計劃卡。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "輸入屋苑對樓類，再睇計劃卡上的月費、合約期同適用樓類。最後用 WhatsApp 核實覆蓋、安裝同實際條款。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Listed fee versus average fee",
        paragraphs: [
          "The fee on a plan card is usually the listed monthly fee. Free months, rebates or prepayment change the average over the contract.",
          "Count the total months, free months, rebate amount, prepayment and whether the installation fee is waived. Ask about early-termination fees.",
        ],
      },
      {
        heading: "How to calculate the average",
        paragraphs: [
          "Example: listed HK$98 per month, 36-month contract, 3 free months. You pay for 33 months.",
          "Total paid is roughly HK$98 × 33 = HK$3,234. Divided by 36 months, the average is about HK$89.8. This is a listed example only.",
          "Add or subtract prepayment and rebates before averaging. Include any installation fee that is not waived.",
        ],
      },
      {
        heading: "Do not mix housing types",
        paragraphs: [
          "Public, HOS, private and village plans usually differ. Bulk contracts, nominated providers and the pull path all affect the fee.",
          "Using the wrong housing type produces an inaccurate total cost. Match the estate first, then read the plan card for that type.",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Enter the estate to match the housing type, then check the fee, contract length and applicable type on the card. Confirm coverage and terms by WhatsApp.",
          DISCLAIMER_EN,
        ],
      },
    ],
  },
  {
    slug: "1000m-or-2500m",
    minutes: 6,
    category: "fiber",
    seoTitle: "1000M 同 2500M 寬頻點揀｜齊Quote",
    h1: "1000M 同 2500M 寬頻點揀",
    description:
      "一般家庭 1000M 已足夠日常使用。2500M 適合同時多路大檔下載或重度上傳。實際體感受路由器同屋內佈線影響。先確認屋苑覆蓋，再比較總成本。僅供參考。",
    title: "1000M 同 2500M 寬頻點揀",
    excerpt: "一般家庭 1000M 已足夠。2500M 適合同時多路大檔下載。先確認覆蓋再比較總成本。",
    titleEn: "How to choose between 1000M and 2500M broadband",
    excerptEn:
      "1000M is enough for most homes. 2500M suits simultaneous large downloads or heavy upload. Confirm coverage first, then compare total cost.",
    descriptionEn:
      "1000M is enough for most households. 2500M suits simultaneous large downloads or heavy upload. Real experience depends on the router and internal wiring. Confirm estate coverage first, then compare total cost. For reference only.",
    h1En: "How to choose between 1000M and 2500M",
    published: "2026-10-14",
    modified: "2026-10-14",
    related: ["fiber", "broadband-total-cost", "home-broadband-2026", "estate-filter", "is-1000m-enough"],
    plans: [{ href: "/plans?cat=broadband", label: "去光纖格價" }],
    estates: [{ href: "/estates", label: "屋苑目錄" }],
    body: [
      {
        heading: "一般家庭 1000M 已足夠",
        paragraphs: [
          "1000M 光纖入屋已可以應付多設備同時使用、4K 串流同在家工作。大多數家庭日常使用唔會感到明顯瓶頸。",
          "實際體感亦受路由器規格、屋內佈線同同時使用裝置數量影響，唔單止取決於標示速度。",
        ],
      },
      {
        heading: "2500M 適合邊類情況",
        paragraphs: [
          "2500M 適合同時有多路大檔下載、重度上傳（例如雲端備份或創作）、或者家中有多個重度用戶同時使用。",
          "如果屋苑有 2500M 覆蓋，可以同 1000M 一齊比較總成本同合約期，再決定是否值得升級。",
        ],
      },
      {
        heading: "先確認覆蓋再比較",
        paragraphs: [
          "唔係每個屋苑都有 2500M。先用屋苑篩對樓類同可用速度，再睇該樓類的計劃卡。",
          "村屋、公屋同私樓的可用速度同月費通常唔同，唔好用其他樓類的數字去估。",
          "比較時一併睇總成本（合約期、免月費、回贈），唔好只睇標示月費。見 [寬頻合約總成本點計](/guides/broadband-total-cost)。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "輸入屋苑確認樓類同可用計劃，再按需要比較 1000M 同 2500M 的總成本。最後用 WhatsApp 核實覆蓋同安裝。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "1000M is enough for most homes",
        paragraphs: [
          "1000M fibre to the home handles multiple devices, 4K streaming and work from home for most households.",
          "Real experience also depends on the router, internal wiring and the number of simultaneous users, not only the listed speed.",
        ],
      },
      {
        heading: "When 2500M makes sense",
        paragraphs: [
          "2500M suits simultaneous large downloads, heavy upload (cloud backup or content creation), or several heavy users at the same time.",
          "If the estate has 2500M coverage, compare the total cost and contract length with 1000M before deciding.",
        ],
      },
      {
        heading: "Confirm coverage first",
        paragraphs: [
          "Not every estate has 2500M. Match the estate and housing type first, then read the available plan cards.",
          "Village, public and private estates usually differ in available speed and fee. Do not reuse numbers from another housing type.",
          "Compare total cost (contract length, free months, rebates) as well as the listed fee. See [how to calculate total contract cost](/guides/broadband-total-cost).",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Enter the estate to confirm the housing type and available plans, then compare the total cost of 1000M and 2500M if both are available. Confirm coverage by WhatsApp.",
          DISCLAIMER_EN,
        ],
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
    related: ["port-in", "contract-fees", "fiber", "public-hos-fees", "private-1000-fees", "village-fees", "home-broadband-2026", "estate-filter"],
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
          DISCLAIMER_EN,
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
    published: "2026-09-09",
    modified: "2026-09-13",
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
        heading: "GBA coverage is a contract term, not a travel guarantee",
        paragraphs: [
          "“Greater Bay Area” on a plan usually means the zones and networks listed in the carrier’s terms — not that every city, village or basement is equally fast. Which partner network you use, and any roaming limits, follow the product sheet at application. This page does not freeze city-by-city detail that goes stale.",
        ],
      },
      {
        heading: "Local vs GBA quotas",
        paragraphs: [
          "Local GB and GBA GB are often counted separately. After the GBA quota, speed may drop, roaming charges may apply, or a daily add-on may start. Before you travel, ask how many GB are included, how usage is shown, and what happens after. Do not treat “GBA” as unlimited.",
        ],
      },
      {
        heading: "When you port",
        paragraphs: [
          "After number porting, GBA benefits follow the new plan. They do not inherit the old add-on. During the cutover, roaming and cross-border data may pause. Flow: [number porting](/guides/port-in).",
          "Next: [mobile compare](/plans?cat=mobile), then check the quote on WhatsApp. Actual charges are confirmed by the carrier.",
        ],
      },
    ],
  },
  {
    slug: "shop-broadband",
    minutes: 7,
    category: "business",
    seoTitle: "店舖申請商業寬頻要準備咩｜齊Quote",
    h1: "店舖／寫字樓申請寬頻清單",
    description: "店舖同寫字樓要用商業寬頻。準備地址、文件、固定IP同安裝預約。家居計劃通常唔能夠搬去舖。",
    title: "店舖／寫字樓申請寬頻清單",
    excerpt: "地址類型、文件、固定 IP、安裝預約。家居公屋價唔能夠直接用喺舖。",
    titleEn: "Checklist for shop and office broadband",
    excerptEn: "Address type, documents, static IP, install booking. Home plans usually cannot move to a shop.",
    descriptionEn: "Business fibre needs a commercial address, documents and often a static IP. Home plans cannot usually be used in a shop.",
    h1En: "Shop / office broadband application checklist",
    published: "2026-09-09",
    modified: "2026-09-13",
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
        heading: "家居計劃唔能夠直接搬去舖",
        paragraphs: [
          "公屋／居屋家居價綁住宅用途。搬去舖頭或者報住宅裝商用，後期好容易被改約或者終止。正確入口係 [商業寬頻格價](/plans?cat=business)，WhatsApp 預填「商業寬頻」查核報價。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Address type",
        paragraphs: [
          "Shops, offices, workshops and warehouses usually need business broadband. A ground-floor conversion, industrial building or mall shop can have different cabling and management-office rules. Quote against the trading address, not the owner’s home.",
        ],
      },
      {
        heading: "Documents",
        paragraphs: [
          "Carriers commonly ask for a business registration, lease or title, and the responsible person’s ID. The exact list varies. Coverage can be checked first; documents are usually needed to sign.",
        ],
      },
      {
        heading: "Static IP and install booking",
        paragraphs: [
          "Tills, VPN, cameras and mail servers may need a static IP. A home dynamic IP may not do. Ask about the install window: commercial addresses often have to work around mall management, and out-of-hours visits may cost extra.",
        ],
      },
      {
        heading: "A home plan cannot move to a shop",
        paragraphs: [
          "Public / HOS home rates are tied to residential use. Moving them to a shop, or registering a home address for commercial use, is often rewritten or terminated later. The right door is [business compare](/plans?cat=business). WhatsApp can be pre-filled with “商業寬頻”.",
          DISCLAIMER_EN,
        ],
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
    published: "2026-09-09",
    modified: "2026-09-13",
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
        heading: "Sticker fee vs year-one cost",
        paragraphs: [
          "The advertised monthly fee may already include a free first month, waived install or a voucher. What you actually count: install fee, prepayment, set-top / router deposit, visit charges, and the sum of monthly fees in the term. A “cheap” fee sometimes just moves the cost into prepay or a longer contract.",
        ],
      },
      {
        heading: "Router: gift, included, or return at the end",
        paragraphs: [
          "“Gifted router” and “router included” are not the same. Included often means you return it when the contract ends; gifted is yours. 5G home routers especially are often on loan. Ask the model, how a fault is swapped, and what a loss costs, before you sign.",
        ],
      },
      {
        heading: "Early termination",
        paragraphs: [
          "Stopping before the term usually means a termination fee or clawing back the offer. Moving house, renovation, or a shop closing can all trigger it. This page does not advise how to exit a contract — only to read the original terms.",
          "After you have a reference fee, check the quote on WhatsApp and ask about install, prepay, the router and end-of-term rules. Next: [fibre compare](/plans?cat=broadband).",
          DISCLAIMER_EN,
        ],
      },
    ],
  },
  {
    slug: "broadband-renewal",
    minutes: 8,
    category: "fiber",
    seoTitle: "寬頻續約點做｜新客價 vs 續約價｜齊Quote",
    h1: "寬頻續約點做：新客價同續約價點計",
    description:
      "寬頻續約要同時睇續約價同新客價。標示月費未計免月費、回贈同合約期，平均月費先反映真正支出，然後先決定續約或者轉台。最終報價以電訊商確認為準。站內數字只作參考。",
    title: "寬頻續約點做：新客價同續約價點計",
    excerpt: "新客價多數吸引轉台，續約價可能較高。點計實際月費同決定續約定轉台。",
    titleEn: "Renewing broadband: new-customer price vs renewal price",
    excerptEn: "New-customer offers are usually better. How to calculate the real monthly cost and decide whether to renew or switch.",
    descriptionEn:
      "Broadband renewal prices often differ from new-customer deals. Count free months and rebates to find the real average monthly fee before you renew or switch.",
    h1En: "Renewing broadband: new-customer price vs renewal price",
    published: "2026-10-21",
    modified: "2026-10-21",
    related: [
      "broadband-total-cost",
      "switch-broadband",
      "contract-fees",
      "fiber",
      "is-1000m-enough",
    ],
    plans: [{ href: "/plans?cat=broadband", label: "去光纖格價" }],
    estates: [{ href: "/estates", label: "屋苑目錄" }],
    body: [
      {
        heading: "新客價同續約價通常唔同",
        paragraphs: [
          "電訊商多數用較吸引嘅新客優惠（免月費、回贈、送路由器）拉轉台客戶。續約價係俾而家用緊同一條線嘅人，優惠可以少啲，月費可以高啲，亦可以只係頭幾個月平、之後恢復另一個價。兩種價唔好當同一個數。",
          "站內列出嘅月費多為市場參考，唔係你嘅續約報價。實際續約價要向你現有供應商查核，再同其他電訊商嘅新客參考計劃並排睇。",
        ],
      },
      {
        heading: "點計實際平均月費",
        paragraphs: [
          "唔好用標示月費直接當平均。計法可以寫成：實付金額 = 標示月費 ×（合約月數 − 免月費月數）− 回贈 + 未豁免嘅預繳或安裝費。平均月費 = 實付金額 ÷ 合約月數。免月費或者回贈如果只適用其中一段，就只減一次，唔好兩邊都減。",
          "用現有供應商書面或者訊息上嘅標示月費、合約期、免月費、回贈，同未豁免嘅預繳或安裝費，代入上面條式。呢頁唔放具體數字例子，避免被當成報價。你嘅續約價、免月費同回贈以供應商確認為準。步驟見 [寬頻合約總成本點計](/guides/broadband-total-cost)。",
        ],
      },
      {
        heading: "續約前要問清楚嘅四件事",
        paragraphs: [
          "1. 現約完約日。2. 續約後月費同合約期，包括優惠完咗之後嘅月費。3. 路由器係繼續用、要換定合約後要還。4. 可唔可以豁免安裝費或搬遷費（如適用）。",
          "問清楚之後，再用上面嘅計法同市場新客參考價比較。如果差距明顯，可以考慮轉台。路由器係送出定借用，見 [寬頻路由器點揀](/guides/router-wifi)。",
        ],
      },
      {
        heading: "續約常見陷阱",
        paragraphs: [
          "自動續約：有啲合約完約如果冇回覆，會自動續或者轉去另一個月費；有啲會停。問你現有嗰份點寫，唔好假設「唔理就會停」或者「唔理就會平價續」。",
          "路由器要還：續約後可能要換機、繼續借，或者舊機要還。送出同包用唔同，遺失同壞機點計都要問。合約後月費：頭段優惠月費完咗，後面可能係另一個價，平均月費要計完整段，唔好只記開頭。提早終止：一簽續約就係新合約，未完又轉走，可能有終止費或者要補回優惠。本頁唔教避約。細節見 [月費以外](/guides/contract-fees)。",
        ],
      },
      {
        heading: "邊種情況續約、邊種轉台",
        paragraphs: [
          "續約價同你查到嘅新客參考價差唔多，而且唔想等師傅上門：續約通常省事。續約價明顯高、新供應商又確認覆蓋到你屋苑：可以考慮轉台。寬頻唔能夠攜號，要新線裝好先停舊線，先唔會斷網。步驟見 [轉台寬頻：舊約、安裝期、點樣銜接](/guides/switch-broadband)。",
          "就嚟搬家：長約續約未必適合，先問搬遷費同新址可唔可以入線。只係部路由器舊：未必需要為咗換機而轉台，先問續約包唔包換機、部機係送定借。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "返首頁輸入屋苑，或開 [光纖格價](/plans?cat=broadband) 對一對市場參考計劃，再用 WhatsApp 向現有供應商查核續約報價、完約日同自動續約點寫。",
          "以上只供參考。實際覆蓋、安裝期、月費、合約同路由器條款，一律以電訊商確認為準。",
        ],
      },
    ],
    bodyEn: [
      {
        heading: "New-customer and renewal prices are usually different",
        paragraphs: [
          "Carriers often use better new-customer offers — free months, rebates, a router — to attract switchers. A renewal price is for the line you already have. It may be higher, have fewer free months, or look cheap only for the first stretch and then change. Do not treat the two prices as one number.",
          "Fees listed on this site are references, not your renewal quote. Ask your current provider, then set that quote beside other carriers’ new-customer reference plans.",
        ],
      },
      {
        heading: "How to calculate the real average monthly fee",
        paragraphs: [
          "Do not use the sticker fee as the average. Amount paid = sticker fee × (contract months − free months) − rebate + any prepayment or install fee that is not waived. Average = amount paid ÷ contract months. If a free month or rebate applies to only one part of the term, subtract it once.",
          "Put the sticker fee, contract length, free months, rebate, and any prepayment or install fee that is not waived — taken from your provider’s writing — into that formula. This page does not include a worked example with figures, so nothing here should be read as a quote. Your renewal fee, free months and rebate come from your provider. See [broadband total cost](/guides/broadband-total-cost).",
        ],
      },
      {
        heading: "Four things to ask before renewing",
        paragraphs: [
          "Contract end date. The renewal fee and the length, including the fee after any introductory stretch. Whether the router stays, is replaced, or must be returned. Whether an install or relocation fee can be waived.",
          "Then run the average above against new-customer reference prices. A router that is gifted and a router that is loaned are different. See [choosing a router](/guides/router-wifi).",
        ],
      },
      {
        heading: "Common renewal pitfalls",
        paragraphs: [
          "Auto-renewal: some contracts renew or move to another fee if you do not reply; some stop. Ask how yours is written. Do not assume silence means it ends, or that it renews at the same price.",
          "The router may have to go back, stay on loan, or be swapped. A gift and an included unit are not the same. The fee after the offer can differ from the opening months, so average the whole term. Signing a renewal starts a new contract; leaving early can mean a termination fee or clawback. This page does not explain how to exit a contract. See [install, prepay, contract](/guides/contract-fees).",
        ],
      },
      {
        heading: "Which situation fits renewing or switching",
        paragraphs: [
          "If the renewal price is close to the new-customer references you have checked, and you do not want to wait for a technician, renewing is usually simpler. If the renewal price is clearly higher and another provider confirms coverage, switching may suit you. Broadband cannot port a number — install the new line first. See [switching broadband](/guides/switch-broadband).",
          "If you are about to move, a long renewal may be a poor fit; ask about a relocation fee and whether the new address can be cabled. If only the router is old, ask whether renewal includes a replacement before you switch just for the hardware.",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Compare reference plans on the [fibre page](/plans?cat=broadband), then confirm your renewal quote, end date and auto-renewal wording on WhatsApp.",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "續約價會唔會同新客價一樣？",
        a: "通常唔會。新客價多數有較多免月費或回贈，續約價可能較高。實際報價要向現有供應商確認。",
      },
      {
        q: "點計續約嘅實際平均月費？",
        a: "用標示月費乘實付月數，減回贈，加未豁免嘅預繳或安裝費，再除以合約月數。實際數字以現有供應商確認為準。詳見 [寬頻合約總成本點計](/guides/broadband-total-cost)。",
      },
      {
        q: "續約定轉台好？",
        a: "如果續約價明顯高過市場新客價，可考慮轉台。寬頻不能攜號，要新線裝好先停舊線。見 [轉台寬頻](/guides/switch-broadband)。",
      },
      {
        q: "完約冇回覆會唔會自動續？",
        a: "有啲會自動續或者轉去另一個月費，有啲會停。問現有供應商你嗰份合約點寫，唔好假設。見 [月費以外](/guides/contract-fees)。",
      },
    ],
    faqEn: [
      {
        q: "Is the renewal price the same as the new-customer price?",
        a: "Usually not. New-customer offers often include more free months. Confirm with your provider.",
      },
      {
        q: "How do I calculate the real average monthly fee?",
        a: "Multiply the sticker fee by the months you actually pay, subtract rebates, add any install or prepay that is not waived, then divide by the full term. Use the figures from your provider. See [broadband total cost](/guides/broadband-total-cost).",
      },
      {
        q: "Should I renew or switch?",
        a: "If the renewal price is clearly higher, consider switching. Install the new line first. See [switching broadband](/guides/switch-broadband).",
      },
      {
        q: "What happens if I do nothing at the end of the contract?",
        a: "Some contracts renew or move to another fee; some stop. Ask your provider how yours is written. See [install, prepay, contract](/guides/contract-fees).",
      },
    ],
  },
  {
    slug: "broadband-stability",
    minutes: 8,
    category: "fiber",
    seoTitle: "寬頻邊間最穩｜打機 WFH 點揀｜齊Quote",
    h1: "香港邊間寬頻最穩？打機同在家工作點揀",
    description:
      "想要寬頻穩定，打機同在家工作應先睇延遲，而唔係只睇月費。光纖多數比 5G 家居穩，樓內線路同路由器擺位亦會改變手感。實際覆蓋、速度同穩定性都要以電訊商現場確認為準。",
    title: "香港邊間寬頻最穩？打機同在家工作點揀",
    excerpt: "穩定性受覆蓋、樓內線路同路由器影響。光纖通常較穩，1000M 多數夠用。",
    titleEn: "Which Hong Kong broadband is most stable for gaming and WFH?",
    excerptEn: "Stability depends on coverage, in-building wiring and the router. Fibre is usually more stable than 5G home.",
    descriptionEn:
      "Gaming and working from home need stable broadband and low latency more than a low price. Fibre is usually steadier than 5G home. Confirm it on site.",
    h1En: "Which Hong Kong broadband is most stable for gaming and working from home?",
    published: "2026-10-21",
    modified: "2026-10-21",
    related: [
      "fiber-vs-5g",
      "is-1000m-enough",
      "1000m-or-2500m",
      "home5g",
      "fiber",
      "broadband-renewal",
    ],
    plans: [
      { href: "/plans?cat=broadband", label: "去光纖格價" },
      { href: "/plans?cat=home5g", label: "去 5G 家居格價" },
    ],
    estates: [{ href: "/estates", label: "屋苑目錄" }],
    body: [
      {
        heading: "「最穩」唔等於最平",
        paragraphs: [
          "穩定性受覆蓋、樓內線路、路由器位置同屋企有幾多人同時用影響，唔係單靠月費高低決定。站內列出嘅月費只係參考，實際體驗要現場確認。",
          "打機同在家工作，延遲通常比峰值下載速度更重要。標示 1000M 或者更高，唔代表遊戲或者視像會議一定順。光纖入屋多數比 5G 家居穩定，但樓入面嘅線路同擺位仍然可以拖低手感。",
        ],
      },
      {
        heading: "影響穩定性嘅因素",
        paragraphs: [
          "覆蓋：電訊商確認呢個地址有光纖入到你個單位，先有得談穩定。未確認之前，廣告速度都只係參考。樓內線路：走廊、電箱、舊線或者分線太多，入屋之後都可以慢或者斷。呢部分要師傅現場先知，唔好靠屋苑名估。",
          "路由器同擺位：部機舊、收埋櫃入面，或者離常用房間好遠，Wi-Fi 手感會差過線本身。同時使用：幾個人開會、備份、睇片一齊發生，感覺會似不穩，有時只係頻寬分薄咗。",
          "5G 家居仲多兩樣：現場訊號，同合約入面嘅高速用量或者公平使用。用到某個用量之後降速，手感可以似斷線。點睇條款見 [5G 家居數據上限](/guides/home5g-data-cap)。",
        ],
      },
      {
        heading: "光纖同 5G 家居嘅延遲",
        paragraphs: [
          "光纖用固定線路入屋，延遲通常較平穩，少受附近有幾多人用流動網絡影響。啱打機、在家工作、要上傳嘅情況。本頁唔會寫死幾多毫秒：同一條線、同一個遊戲伺服器，數字都可以唔同，實測先算。",
          "5G 家居用流動網絡。窗邊同屋入面可以差好遠，繁忙時段附近用戶多，延遲同速度都可以浮動。可以做後備，或者暫時未有光纖嘅地址，唔好當固定光纖。比較見 [5G家居定光纖](/guides/fiber-vs-5g)。村屋或舊樓暫時拉唔到線，先喺打算放路由器嘅位置試訊號，見 [香港 5G 家居點揀](/guides/home5g)。",
        ],
      },
      {
        heading: "1000M 定 2500M+ 先夠",
        paragraphs: [
          "一般打機、開會、一兩路 4K，1000M 多數已經夠用。屋企人多、經常同時上傳大檔，或者想預留頻寬，先考慮 2500M 或以上。再高一檔下載速度，唔會自動解決延遲或者 Wi-Fi 死角。詳見 [1000M 夠唔夠](/guides/is-1000m-enough) 同 [1000M 同 2500M 寬頻點揀](/guides/1000m-or-2500m)。",
        ],
      },
      {
        heading: "路由器點擺",
        paragraphs: [
          "放喺常用區域中間、少少高，避開金屬櫃、鏡、厚牆同微波爐。房門長期關住，訊號要再穿一層。打機或者在家工作嘅位置如果離路由器遠，先試搬位，或者用線接電腦，再考慮加擴展。",
          "Wi-Fi 6 對一般家庭多數夠用。Wi-Fi 7 要手機同電腦都支援，先有分別。點揀同部機係送定借，見 [寬頻路由器點揀](/guides/router-wifi)。5G 家居路由器多數要靠訊號較強嘅位置，例如窗邊，唔好鎖喺電箱櫃。擺完再喺你實際坐嘅位置試一次。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "返首頁輸入屋苑，或開 [光纖格價](/plans?cat=broadband) 對適用計劃。打機或在家工作可優先問覆蓋得到嘅光纖，再喺現場確認穩定性。",
          "以上只供參考。實際覆蓋、速度同穩定性以電訊商現場確認為準。",
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Stability is not the same as the lowest price",
        paragraphs: [
          "Stability depends on coverage, in-building wiring, where the router sits, and how many people use the line at once. A listed monthly fee is only a reference. The feel of the line is confirmed on site.",
          "For gaming and working from home, latency usually matters more than peak download speed. A 1000M label, or a higher one, does not mean a game or a video call will feel smooth. Fibre into the flat is usually steadier than 5G home, but the wiring inside the building and the router placement can still drag it down.",
        ],
      },
      {
        heading: "What affects stability",
        paragraphs: [
          "Coverage: stability only starts once a carrier confirms fibre can reach your flat. Until then, an advertised speed is a reference. In-building wiring: the corridor, the meter cupboard, an old cable, or too many splits can still make the line slow or drop after it enters. A technician sees that on site. Do not guess from the estate name.",
          "The router and where it sits: an old unit, a cupboard, or a long walk from the rooms you use can make Wi-Fi feel worse than the line itself. Several people on calls, backups and video at once can feel unstable when the bandwidth is only being shared.",
          "5G home adds two more: the signal where you are, and any high-speed allowance or fair-use clause. After that usage, a slowdown can feel like a drop. How to read it: [5G home data caps](/guides/home5g-data-cap).",
        ],
      },
      {
        heading: "Fibre and 5G home latency",
        paragraphs: [
          "Fibre uses a fixed line into the flat. Latency is usually steadier, and less tied to how busy the mobile network nearby is. That suits gaming, working from home, and uploads. This page does not state a millisecond figure. The same line and the same game server can still differ. Measure it.",
          "5G home uses the mobile network. A window and the inside of the flat can differ, and busy hours can move both latency and speed. It can be a backup, or a temporary option where fibre is not in. Do not treat it as fixed fibre. See [fibre vs 5G home](/guides/fiber-vs-5g). If a village house or older building cannot be cabled yet, test the signal where you would leave the router. See [5G home](/guides/home5g).",
        ],
      },
      {
        heading: "1000M or 2500M+",
        paragraphs: [
          "For gaming, video calls and one or two 4K streams, 1000M is usually enough. A busier home, frequent large uploads, or spare bandwidth is when 2500M or above is worth asking about. A higher download tier does not by itself fix latency or a Wi-Fi dead spot. See [is 1000M enough](/guides/is-1000m-enough) and [1000M or 2500M](/guides/1000m-or-2500m).",
        ],
      },
      {
        heading: "Where to put the router",
        paragraphs: [
          "Leave it near the middle of the rooms you use, a little raised, away from metal cabinets, mirrors, thick walls and the microwave. A door that stays shut is another wall. If the desk is far from the router, try moving it, or use a cable to the computer, before you add an extender.",
          "Wi-Fi 6 is enough for many homes. Wi-Fi 7 only helps when the phone and computer support it. How to choose, and whether the unit is a gift or a loan: [choosing a router](/guides/router-wifi). A 5G home router usually wants a stronger-signal spot, such as near a window, not the inside of a meter cupboard. After you place it, test the seat you actually use.",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Compare reference plans on the [fibre page](/plans?cat=broadband). For gaming or working from home, ask first about fibre that can actually reach the flat, then confirm stability on site.",
          "The above is for reference only. Coverage, speed and stability are confirmed by the carrier on site.",
        ],
      },
    ],
    faq: [
      {
        q: "邊間寬頻最穩？",
        a: "穩定性主要睇覆蓋同樓內線路，唔係單靠供應商。光纖通常比 5G 家居穩定。實際體驗要現場確認。",
      },
      {
        q: "打機用 1000M 夠唔夠？",
        a: "一般夠用。延遲比峰值速度更重要。屋企人多或經常上傳大檔，可考慮 2500M+。詳見 [1000M 夠唔夠](/guides/is-1000m-enough)。",
      },
      {
        q: "5G 家居夠唔夠穩用嚟打機？",
        a: "視現場訊號而定，通常不如光纖穩定。可先實測。詳見 [5G 家居點揀](/guides/home5g)。",
      },
      {
        q: "擺位唔好，買高一檔會唔會穩啲？",
        a: "未必。延遲同 Wi-Fi 死角多數唔係靠再高一檔下載速度解決。先試中央、少少高、避開金屬櫃同厚牆。見 [寬頻路由器點揀](/guides/router-wifi) 同 [1000M 夠唔夠](/guides/is-1000m-enough)。",
      },
    ],
    faqEn: [
      {
        q: "Which broadband is the most stable?",
        a: "Stability depends more on coverage and in-building wiring than the provider. Fibre is usually more stable than 5G home.",
      },
      {
        q: "Is 1000M enough for gaming?",
        a: "Usually yes. Latency matters more than peak speed. See [is 1000M enough](/guides/is-1000m-enough).",
      },
      {
        q: "Is 5G home stable enough for gaming?",
        a: "It depends on the signal on site, and it is usually less steady than fibre. Test it first. See [5G home](/guides/home5g).",
      },
      {
        q: "If placement is poor, will a higher speed tier be more stable?",
        a: "Not necessarily. Latency and Wi-Fi dead spots are rarely fixed by the next download tier. Try a central, slightly raised spot away from metal cabinets and thick walls first. See [choosing a router](/guides/router-wifi) and [is 1000M enough](/guides/is-1000m-enough).",
      },
    ],
  },
  {
    slug: "old-building-broadband",
    minutes: 7,
    category: "fiber",
    seoTitle: "舊樓唐樓寬頻點算｜冇光纖有咩選擇｜齊Quote",
    h1: "舊樓同唐樓寬頻點算：冇光纖有咩選擇",
    description:
      "舊樓同唐樓先問有冇光纖入到你個單位。拉唔到先比較 5G 家居，並喺現場試訊號同路由器擺位。覆蓋、入線同安裝以電訊商確認為準。",
    title: "舊樓同唐樓寬頻點算：冇光纖有咩選擇",
    excerpt: "舊樓先查有冇光纖。拉唔到就比較 5G 家居，再喺現場試訊號同路由器擺位。",
    titleEn: "Broadband in older walk-ups: options when fibre is not in",
    excerptEn: "Ask about fibre first. If it cannot be pulled in, compare 5G home and test the signal on site.",
    descriptionEn:
      "In an older walk-up, confirm whether fibre can reach the flat before you sign. If it cannot, compare 5G home, test the signal on site, and place the router carefully. Coverage and install are confirmed by the carrier.",
    h1En: "Broadband in older walk-ups: what to do without fibre",
    published: "2026-10-21",
    modified: "2026-10-21",
    related: ["fiber", "fiber-vs-5g", "home5g", "village", "village-onsite", "estate-filter", "switch-broadband"],
    plans: [
      { href: "/plans?cat=broadband", label: "去光纖格價" },
      { href: "/plans?cat=home5g", label: "去 5G 家居格價" },
    ],
    estates: [{ href: "/estates", label: "屋苑目錄" }],
    body: [
      {
        heading: "先確認光纖入唔入到",
        paragraphs: [
          "舊樓、唐樓唔等於一定冇光纖，亦唔等於一定拉到。樓齡、走廊、電箱、管理處或者業主同唔同意穿牆，都會影響。第一步係用地址問覆蓋，而唔係睇廣告就假設有線。",
          "喺齊Quote 輸入屋苑或者街道，先對樓類。點用屋苑名見 [齊Quote 點用屋苑篩](/guides/estate-filter)。光纖同 5G 家居點分，見 [5G家居定光纖](/guides/fiber-vs-5g)。",
        ],
      },
      {
        heading: "拉唔到先比較 5G 家居",
        paragraphs: [
          "電訊商確認暫時入唔到光纖，先睇 5G 家居：插電路由器，用流動網絡開家用 Wi-Fi。速度快慢視現場訊號，唔好當固定光纖。詳見 [香港 5G 家居點揀](/guides/home5g)。",
          "村屋或者入線特別難嘅地址，光纖同 5G 可以一齊問。需要現場睇路經，見 [村屋寬頻點算](/guides/village) 同 [實地視察](/guides/village-onsite)。",
        ],
        table: {
          caption: "舊樓先問邊樣",
          headers: ["情況", "點做"],
          rows: [
            {
              label: "未知有冇光纖",
              value: "用完整地址查核覆蓋同可唔可以入線。",
              href: "/guides/estate-filter",
            },
            {
              label: "確認拉唔到",
              value: "再比較 5G 家居，唔好當固定線替代。",
              href: "/guides/home5g",
            },
            {
              label: "業主唔批准穿牆",
              value: "問有冇唔使穿牆嘅方案，再決定。",
              href: "/guides/fiber-vs-5g",
            },
          ],
        },
      },
      {
        heading: "現場試訊號",
        paragraphs: [
          "5G 家居唔好只靠地圖色塊。簽約前最好喺你個單位、你打算放路由器嘅位置試一次。窗邊、大廳同睡房可以差好遠。試完先決定做主線定後備。",
          "試到嘅速度只代表嗰一下。繁忙時段、隔牆、天氣都可能唔同。實際可唔可以申請，仍然以電訊商確認為準。",
        ],
      },
      {
        heading: "路由器點擺",
        paragraphs: [
          "光纖入到屋之後，路由器放喺常用區域中間、少少高、避開金屬櫃同厚牆，通常比再買高一檔月費更有用。見 [1000M 夠唔夠](/guides/is-1000m-enough)。",
          "5G 家居路由器多數要靠窗或者訊號較強嘅位置，唔好鎖喺電箱櫃入面。合約寫「包路由器」定「送出、到期要還」，簽約前問清楚，見 [月費以外](/guides/contract-fees)。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "返首頁輸入地址，或者開 [光纖格價](/plans?cat=broadband) 同 [5G 家居格價](/plans?cat=home5g) 對參考計劃。轉台步驟見 [轉台寬頻](/guides/switch-broadband)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Confirm fibre before you assume there is none",
        paragraphs: [
          "An older walk-up is not automatically without fibre, and fibre is not automatically installable. Age, the corridor, the meter cupboard and whether the owner allows drilling all matter. Check the address first.",
          "How to type an estate: [estate filter](/guides/estate-filter). Fibre or 5G home: [fibre vs 5G home](/guides/fiber-vs-5g).",
        ],
      },
      {
        heading: "Compare 5G home only after fibre is ruled out",
        paragraphs: [
          "If the carrier says fibre cannot be pulled in, compare 5G home: a plug-in router on the mobile network. It is not a fixed line. See [5G home](/guides/home5g).",
          "Village houses and difficult routes can compare both. See [village broadband](/guides/village) and [an on-site visit](/guides/village-onsite).",
        ],
        table: {
          caption: "What to ask first",
          headers: ["Situation", "What to do"],
          rows: [
            {
              label: "Fibre unknown",
              value: "Check coverage and whether a line can be pulled in.",
              href: "/guides/estate-filter",
            },
            {
              label: "Fibre ruled out",
              value: "Then compare 5G home. Do not treat it as a fixed line.",
              href: "/guides/home5g",
            },
            {
              label: "No drilling allowed",
              value: "Ask about an option that does not need a new hole.",
              href: "/guides/fiber-vs-5g",
            },
          ],
        },
      },
      {
        heading: "Test the signal on site",
        paragraphs: [
          "Do not rely on a coverage map alone. Try the router where you would actually leave it. A window, the living room and a bedroom can differ.",
          "A short test is one moment. Busy hours and walls can change it. Whether you can apply is still confirmed by the carrier.",
        ],
      },
      {
        heading: "Where to put the router",
        paragraphs: [
          "Once fibre is in, a central, slightly raised router away from metal cabinets often helps more than the next speed tier. See [is 1000M enough](/guides/is-1000m-enough).",
          "A 5G home router usually wants a stronger-signal spot, not the inside of a cupboard. Ask whether the router is a gift or must be returned. See [install, prepay, contract](/guides/contract-fees).",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Enter the address on the home page, or open [fibre plans](/plans?cat=broadband) and [5G home plans](/plans?cat=home5g). Switching: [switching broadband](/guides/switch-broadband).",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "舊樓係咪一定冇光纖？",
        a: "唔係。有啲舊樓已經入到線，有啲要現場先知道。用完整地址向電訊商查核，唔好靠樓齡估。",
      },
      {
        q: "確認拉唔到光纖，下一步係咩？",
        a: "再比較 5G 家居，並喺你打算放路由器嘅位置試訊號。見 [香港 5G 家居點揀](/guides/home5g)。",
      },
      {
        q: "路由器放邊先穩啲？",
        a: "光纖路由器放常用區域中間、避開厚牆。5G 家居多數要靠訊號較強嘅位置。實際擺位同安裝以電訊商確認為準。",
      },
    ],
    faqEn: [
      {
        q: "Do older buildings never have fibre?",
        a: "No. Some already have a route in, and some need a site check. Confirm the full address with the carrier.",
      },
      {
        q: "What if fibre cannot be installed?",
        a: "Compare 5G home and test the signal where the router would sit. See [5G home](/guides/home5g).",
      },
      {
        q: "Where should the router go?",
        a: "For fibre, keep it central and clear of thick walls. A 5G home router usually needs a stronger-signal spot. Placement is still confirmed on site.",
      },
    ],
  },
  {
    slug: "home5g-data-cap",
    minutes: 7,
    category: "home5g",
    seoTitle: "5G家居數據上限同公平使用｜點睇合約｜齊Quote",
    h1: "5G 家居寬頻數據上限同公平使用點睇",
    description:
      "5G 家居有機會有高速數據上限或者公平使用條款，用到某個用量之後可能降速或者降低優先權。點樣睇合約，同光纖有咩分別。實際條款以電訊商確認為準。",
    title: "5G 家居寬頻數據上限同公平使用點睇",
    excerpt: "5G 家居唔好只睇標示速度。問清楚用量上限、公平使用同用完之後點算。",
    titleEn: "5G home data caps and fair-use clauses",
    excerptEn: "Do not stop at the headline speed. Read the usage cap, the fair-use clause and what happens after it.",
    descriptionEn:
      "A 5G home plan may include a high-speed data allowance or a fair-use clause, and speed or priority can change after that usage. Learn how to read the contract and how it differs from fibre. The carrier confirms the terms.",
    h1En: "How to read a 5G home data cap and fair-use clause",
    published: "2026-10-21",
    modified: "2026-10-21",
    related: ["home5g", "fiber-vs-5g", "fiber", "is-1000m-enough", "contract-fees", "broadband-total-cost"],
    plans: [
      { href: "/plans?cat=home5g", label: "去 5G 家居格價" },
      { href: "/plans?cat=broadband", label: "去光纖格價" },
    ],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/home5g", label: "5G 家居攻略" },
    ],
    body: [
      {
        heading: "公平使用唔等於無限全速",
        paragraphs: [
          "5G 家居用流動網絡做家用 Wi-Fi。有啲計劃寫「無限」或者「任上」，但合約入面可以另有公平使用（fair use）或者高速數據上限。用到某個用量之後，速度或者優先權可以下降。",
          "齊Quote 列出嘅月費係參考，**唔係**每一條計劃嘅用量條款。上限幾多、用完點計，要睇你將要簽嘅合約原文，再向電訊商確認。背景見 [香港 5G 家居點揀](/guides/home5g)。",
        ],
      },
      {
        heading: "用完之後可能降速",
        paragraphs: [
          "常見寫法係：高速用量用完，其後降速、降低優先，或者繁忙時間先受限。字眼每份合約唔同，唔好用另一間電訊商嘅例子套落自己張單。",
          "屋企如果成日 4K、雲端備份、視像會議，要問「用完之後仲用唔用得」，而唔係只問廣告最高速度。一般家用幾多先夠，見 [1000M 夠唔夠](/guides/is-1000m-enough)。",
        ],
      },
      {
        heading: "合約要對邊幾行",
        paragraphs: [
          "簽約前對一次：高速數據係幾多、公平使用點寫、用完係降速定停、計費週期由邊日開始、路由器係包用定到期要還。月費以外見 [安裝費、預繳、合約](/guides/contract-fees)。計平均月費見 [寬頻合約總成本點計](/guides/broadband-total-cost)。",
        ],
        table: {
          caption: "睇 5G 家居合約",
          headers: ["條款", "問咩"],
          rows: [
            {
              label: "高速用量",
              value: "有冇上限，定係公平使用先限制。",
              href: "/guides/home5g",
            },
            {
              label: "用完之後",
              value: "降速、降低優先，定仍然全速。",
              href: "/guides/contract-fees",
            },
            {
              label: "計費週期",
              value: "用量幾時重置，跨月點計。",
              href: "/guides/broadband-total-cost",
            },
            {
              label: "路由器",
              value: "送出、包用，定合約後要還。",
              href: "/guides/contract-fees",
            },
          ],
        },
      },
      {
        heading: "同光纖點比",
        paragraphs: [
          "可以拉光纖，多數人會用光纖做主線，因為唔使靠現場流動訊號。5G 家居啱未有光纖、租樓、或者等安裝期間做後備。兩邊分別見 [5G家居定光纖](/guides/fiber-vs-5g)。",
          "比較之前最好喺你個單位試一次訊號。試到嘅速度只係參考，繁忙時段可以唔同。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "開 [5G 家居格價](/plans?cat=home5g) 睇參考月費，再用 WhatsApp 問該計劃嘅用量上限同公平使用原文。可以拉線就一併睇 [光纖格價](/plans?cat=broadband)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Fair use is not the same as full speed without a limit",
        paragraphs: [
          "5G home is household Wi-Fi on a mobile network. A plan can say unlimited and still have a fair-use clause or a high-speed allowance. After that usage, speed or priority can drop.",
          "Fees on this site are a reference. They are **not** the usage clause of every plan. Read the contract you will sign. Background: [5G home](/guides/home5g).",
        ],
      },
      {
        heading: "Speed can change after the allowance",
        paragraphs: [
          "Typical wording is a slower speed, lower priority, or a limit only at busy times. The words differ by contract. Do not copy another carrier’s example onto your own bill.",
          "If the home streams, backs up and takes video calls all day, ask what happens after the allowance. See [is 1000M enough](/guides/is-1000m-enough).",
        ],
      },
      {
        heading: "Lines to read in the contract",
        paragraphs: [
          "Check the high-speed allowance, how fair use is written, what happens after it, when the cycle resets, and whether the router is returned. See [install, prepay, contract](/guides/contract-fees) and [total contract cost](/guides/broadband-total-cost).",
        ],
        table: {
          caption: "Reading a 5G home contract",
          headers: ["Clause", "Ask"],
          rows: [
            {
              label: "High-speed data",
              value: "Is there a cap, or only a fair-use limit?",
              href: "/guides/home5g",
            },
            {
              label: "After the allowance",
              value: "Slower speed, lower priority, or still full speed.",
              href: "/guides/contract-fees",
            },
            {
              label: "Billing cycle",
              value: "When usage resets.",
              href: "/guides/broadband-total-cost",
            },
            {
              label: "Router",
              value: "Gift, included, or returned at the end.",
              href: "/guides/contract-fees",
            },
          ],
        },
      },
      {
        heading: "Compared with fibre",
        paragraphs: [
          "Where fibre can be installed, most homes use it as the main line. 5G home fits when fibre is not in yet, for a rental, or as a backup while you wait. See [fibre vs 5G home](/guides/fiber-vs-5g).",
          "Test the signal in the flat first. One test is a reference; busy hours can differ.",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Open [5G home plans](/plans?cat=home5g), then ask on WhatsApp for that plan’s allowance and fair-use wording. If a line can be pulled in, also see [fibre plans](/plans?cat=broadband).",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "5G 家居寫無限係咪就唔會降速？",
        a: "唔一定。合約可以另有公平使用或者高速用量。用完之後點計，要以該份合約同電訊商確認為準。",
      },
      {
        q: "用量上限喺邊度睇？",
        a: "睇合約入面高速數據、公平使用、計費週期同用完之後嘅速度。頁上月費只係參考，唔代替條款原文。",
      },
      {
        q: "有光纖仲使唔使用 5G 家居？",
        a: "可以拉光纖，多數用光纖做主線。5G 家居可以做後備或者過渡。見 [5G家居定光纖](/guides/fiber-vs-5g)。",
      },
    ],
    faqEn: [
      {
        q: "Does unlimited 5G home stay at full speed?",
        a: "Not always. The contract can still have a fair-use clause or a high-speed allowance. Confirm that wording with the carrier.",
      },
      {
        q: "Where is the data cap written?",
        a: "In the high-speed allowance, the fair-use clause, the billing cycle and the speed after the allowance. Listed fees are only a reference.",
      },
      {
        q: "Do I still want 5G home if fibre is available?",
        a: "Most homes use fibre as the main line when it can be installed. 5G home can be a backup or a stopgap. See [fibre vs 5G home](/guides/fiber-vs-5g).",
      },
    ],
  },
  {
    slug: "move-broadband",
    minutes: 7,
    category: "fiber",
    seoTitle: "搬屋寬頻點做｜舊約搬遷費同新裝｜齊Quote",
    h1: "搬屋寬頻點做：舊約、搬遷費同新裝",
    description:
      "搬屋先查舊約完約日、可唔可以搬遷、搬遷費同新址安裝期。新線測好先停舊線。路由器係搬走、換機定要還，以電訊商合約確認為準。",
    title: "搬屋寬頻點做：舊約、搬遷費同新裝",
    excerpt: "先查完約日同搬遷費，再約新址安裝。新線測好先停舊線，路由器點處理亦要問清楚。",
    titleEn: "Moving home with broadband: contract, relocation fee, new install",
    excerptEn: "Check the contract end date and any relocation fee, then book the new install. Test the new line before you stop the old one.",
    descriptionEn:
      "Before you move, check the old contract end date, whether the line can move, any relocation fee and the install window at the new address. Test the new line before you stop the old one. Router terms are in the carrier contract.",
    h1En: "Moving home: old contract, relocation fee and a new install",
    published: "2026-10-21",
    modified: "2026-10-21",
    related: ["switch-broadband", "contract-fees", "fiber", "broadband-renewal", "estate-filter", "port-in"],
    plans: [{ href: "/plans?cat=broadband", label: "去光纖格價" }],
    estates: [{ href: "/estates", label: "屋苑目錄" }],
    body: [
      {
        heading: "先查舊約完約日",
        paragraphs: [
          "搬屋唔等於自動可以帶走舊約。先睇完約日、提早終止點計、合約有冇寫搬遷。未約滿就停，可能要俾終止費或者補回優惠。本頁唔教你點樣避約。",
          "寬頻**唔能夠攜號**。手機先至係攜號，見 [攜號轉台](/guides/port-in)。寬頻係新址安裝，步驟同轉台一樣要**先裝後停**，見 [轉台寬頻](/guides/switch-broadband)。",
        ],
      },
      {
        heading: "搬遷費同新裝期",
        paragraphs: [
          "有啲合約包一次搬遷，有啲要另計上門費，有啲新址根本搬唔到、要當新申請。金額同日數每間電訊商、每個地址都唔同，唔好用別人嘅例子當自己張單。",
          "問清楚：新址可唔可以入線、最早幾時上門、要唔要管理處或者業主批准、舊址幾時要交還設備。月費以外見 [安裝費、預繳、合約](/guides/contract-fees)。",
        ],
        table: {
          caption: "搬屋對一次",
          headers: ["事項", "問咩"],
          rows: [
            {
              label: "完約日",
              value: "舊約幾時完，未完就搬點計。",
              href: "/guides/contract-fees",
            },
            {
              label: "搬遷費",
              value: "包一次、另計，定新址要重新申請。",
              href: "/guides/contract-fees",
            },
            {
              label: "新裝期",
              value: "幾時上門，要唔要管理處批准。",
              href: "/guides/switch-broadband",
            },
            {
              label: "先裝後停",
              value: "新線測好先停舊線，避免空窗。",
              href: "/guides/switch-broadband",
            },
          ],
        },
      },
      {
        heading: "新線測好先停舊線",
        paragraphs: [
          "新址未測到上網，就唔好先取消舊址。理想係兩頭重疊短時間，新線穩陣先停舊約。完全銜接唔到，可能要短暫用 5G 家居或者手機熱點，但嗰啲只係權宜，穩定度視現場。",
          "新址先用屋苑篩對樓類，再睇參考計劃。見 [齊Quote 點用屋苑篩](/guides/estate-filter)。",
        ],
      },
      {
        heading: "路由器搬走定換機",
        paragraphs: [
          "「搬路由器」同「換新機」唔同。舊機可能綁住舊址、要還、或者新址要另一隻型號。送出嘅機通常可以帶走；包用或者借用就要問遺失同歸還點計。",
          "如果舊約就嚟完，一併問續約價同新址新客價差幾遠。見 [寬頻續約點做](/guides/broadband-renewal)。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "新址開 [光纖格價](/plans?cat=broadband)，再用 WhatsApp 問舊約搬遷費、新址安裝期同路由器點處理。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Start with the old contract end date",
        paragraphs: [
          "Moving does not automatically take the old contract with you. Read the end date, early termination and any relocation clause. This page does not explain how to exit a contract.",
          "Broadband **cannot port a number**. Number porting is for mobile: [port-in](/guides/port-in). At the new address, **install first, then stop** the old line. See [switching broadband](/guides/switch-broadband).",
        ],
      },
      {
        heading: "Relocation fee and the new install window",
        paragraphs: [
          "Some contracts include one move, some charge a visit, and some addresses cannot take the old line at all and need a new application. Do not reuse someone else’s fee.",
          "Ask whether the new address can be cabled, the earliest visit, whether management must approve, and when equipment must go back. See [install, prepay, contract](/guides/contract-fees).",
        ],
        table: {
          caption: "Moving checklist",
          headers: ["Item", "Ask"],
          rows: [
            {
              label: "End date",
              value: "When the old term ends, and what an early move costs.",
              href: "/guides/contract-fees",
            },
            {
              label: "Relocation fee",
              value: "Included once, charged, or a new application.",
              href: "/guides/contract-fees",
            },
            {
              label: "Install window",
              value: "When they can visit, and whether management must approve.",
              href: "/guides/switch-broadband",
            },
            {
              label: "Install first",
              value: "Test the new line before you stop the old one.",
              href: "/guides/switch-broadband",
            },
          ],
        },
      },
      {
        heading: "Test the new line before you stop the old one",
        paragraphs: [
          "Do not cancel the old address before the new one is online. A short overlap is safer. If the dates cannot overlap, a short 5G home or phone hotspot is only a stopgap.",
          "Match the new estate’s housing type first. See [estate filter](/guides/estate-filter).",
        ],
      },
      {
        heading: "Move the router or replace it",
        paragraphs: [
          "Taking the old router and getting a new one are different. The old unit may be tied to the old address, due back, or the wrong model. A gifted router is usually yours; a loaned one needs a return rule.",
          "If the old term is almost over, also compare the renewal price with a new-customer price at the new address. See [renewing broadband](/guides/broadband-renewal).",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Open [fibre plans](/plans?cat=broadband) for the new address, then ask on WhatsApp about the relocation fee, the install window and the router.",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "搬屋可唔可以原約搬走？",
        a: "視合約同新址覆蓋。有啲包搬遷，有啲要重新申請。完約日、搬遷費同新裝期要向現有電訊商確認。",
      },
      {
        q: "幾時先停舊址寬頻？",
        a: "新址測到上網先停。寬頻不能攜號。見 [轉台寬頻](/guides/switch-broadband)。",
      },
      {
        q: "舊路由器可唔可以搬去新屋？",
        a: "送出嘅機多數可以帶走。包用或者借用就要問歸還。新址亦可能要另一隻型號。以合約為準。",
      },
    ],
    faqEn: [
      {
        q: "Can I move the same contract to the new flat?",
        a: "It depends on the contract and coverage at the new address. Some include a move; some need a new application. Confirm the end date, fee and install window with your provider.",
      },
      {
        q: "When do I stop the old line?",
        a: "After the new address is online. Broadband cannot port a number. See [switching broadband](/guides/switch-broadband).",
      },
      {
        q: "Can I take the old router?",
        a: "A gifted router is usually yours. A loaned one may have to go back, and the new address may need a different model. Follow the contract.",
      },
    ],
  },
  {
    slug: "yuen-long",
    minutes: 7,
    category: "fiber",
    seoTitle: "元朗寬頻比較｜公屋居屋私樓參考月費｜齊Quote",
    h1: "元朗寬頻點揀：公屋、居屋同私樓分開睇",
    description:
      "元朗寬頻唔係一張區價。朗屏邨、水邊圍邨等公屋，鳳庭苑等居屋，同 YOHO Town 等私樓，計劃通常分開報。天水圍有自己一頁。下列係站內列出參考月費，覆蓋同安裝以電訊商確認為準。",
    title: "元朗寬頻點揀：公屋、居屋同私樓分開睇",
    excerpt: "元朗唔係一區一價。公屋、居屋、私樓分開睇參考月費，天水圍另見天水圍頁。",
    titleEn: "Yuen Long broadband: public, HOS and private estates separately",
    excerptEn:
      "Yuen Long is not one district price. Compare public, HOS and private estates separately. Tin Shui Wai has its own page.",
    descriptionEn:
      "Yuen Long broadband is not one district fee. Public estates such as Long Ping, HOS courts and private estates such as YOHO Town are usually quoted separately. Tin Shui Wai has its own guide. Listed fees are a reference. Coverage is confirmed by the carrier.",
    h1En: "Yuen Long broadband: sort public, HOS and private estates first",
    published: "2026-10-21",
    modified: "2026-10-21",
    related: [
      "public-hos-fees",
      "private-1000-fees",
      "tin-shui-wai",
      "sha-tin",
      "tseung-kwan-o",
      "fiber",
      "estate-filter",
      "home-broadband-2026",
      "public-vs-hos",
      "village-fees",
    ],
    plans: [
      { href: "/plans?cat=broadband&housing=public", label: "公屋光纖計劃" },
      { href: "/plans?cat=broadband&housing=hos", label: "居屋光纖計劃" },
      { href: "/plans?cat=broadband&housing=private", label: "私樓光纖計劃" },
    ],
    estates: [
      { href: "/estates/long-ping", label: "朗屏邨" },
      { href: "/estates/shui-pin-wai", label: "水邊圍邨" },
      { href: "/estates/fung-ting-court", label: "鳳庭苑" },
      { href: "/estates/yoho", label: "YOHO Town" },
      { href: "/estates", label: "屋苑目錄" },
    ],
    inquiry: { district: "元朗" },
    cta: {
      lead: "填完整元朗地址同座數，用 WhatsApp 查核覆蓋同參考月費。僅供參考，以電訊商確認為準。",
      leadEn: "Send the full Yuen Long address on WhatsApp to check coverage and a reference fee. For reference only; the carrier confirms.",
      button: "WhatsApp 查核元朗報價",
      buttonEn: "WhatsApp a Yuen Long quote",
      waText: salesQuoteMessage({ serviceType: "光纖寬頻", address: "元朗", source: "filter" }),
      waTextEn: salesQuoteMessage({ serviceType: "光纖寬頻", address: "元朗", source: "filter" }),
    },
    body: [
      {
        heading: "元朗唔係一區一價",
        paragraphs: [
          "搜「元朗寬頻」見到嘅，多數仍然要先分樓類。朗屏邨、水邊圍邨係公屋；鳳庭苑、宏富苑係居屋；YOHO Town、YOHO Midtown、加州花園、錦繡花園、峻巒係私樓。同一條 1000M，三種樓類計劃可以完全唔同。",
          "天水圍地址喺齊Quote 歸入元朗區，但天耀邨、嘉湖山莊**唔好**用呢頁嘅例子混埋，見 [天水圍寬頻](/guides/tin-shui-wai)。下列月費係**站內列出**例子，**僅供參考**，唔代表你座樓一定有。呢張表**唔係排名**。公屋同居屋點分，見 [公屋同居屋有咩分別](/guides/public-vs-hos)。",
        ],
      },
      {
        heading: "公屋／居屋參考 1000M",
        paragraphs: [
          "朗屏、水邊圍等公屋，同鳳庭苑等居屋，用公居屋表，**唔好**用 YOHO 私樓價去估。居屋亦唔好用村屋價。完整表見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)。",
        ],
        table: {
          caption: "站內列出｜僅供參考",
          headers: ["計劃例子", "樓類／參考月費"],
          rows: [
            {
              label: "有線 1000M（48 個月）",
              value: "公屋、居屋、私樓｜HK$58",
              href: "/plans/icable-ftth-1000-48m-58",
            },
            {
              label: "HGC 轉台 1000M（36 個月）",
              value: "公屋、居屋｜HK$75",
              href: "/plans/hgc-ftth-1000-public-36m",
            },
            {
              label: "中國移動香港 1000M（36 個月）",
              value: "公屋、居屋、私樓｜HK$88",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "香港寬頻 1000M 連 Wi-Fi 7（36 個月）",
              value: "公屋、居屋、私樓｜HK$98",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
          ],
        },
      },
      {
        heading: "YOHO 等私樓",
        paragraphs: [
          "YOHO Town、YOHO Midtown 同附近私樓用私樓表。**唔好**用朗屏邨公屋價去估。完整表見 [私樓 1000M 參考月費](/guides/private-1000-fees)。",
        ],
        table: {
          caption: "站內列出｜僅供參考",
          headers: ["計劃例子", "樓類／參考月費"],
          rows: [
            {
              label: "中國移動香港 1000M（36 個月）",
              value: "公屋、居屋、私樓｜HK$88",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "有線私人樓宇 1000M（36 個月）",
              value: "私樓｜HK$88",
              href: "/plans/icable-ftth-1000-private-36m",
            },
            {
              label: "HGC 私人樓宇 1000M（39 個月）",
              value: "私樓｜HK$89",
              href: "/plans/hgc-ftth-1000-private-39m",
            },
            {
              label: "香港寬頻 1000M 連 Wi-Fi 7（36 個月）",
              value: "公屋、居屋、私樓｜HK$98",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
          ],
        },
      },
      {
        heading: "常見屋苑入口",
        paragraphs: [
          "公屋：[朗屏邨](/estates/long-ping)、[水邊圍邨](/estates/shui-pin-wai)。居屋：[鳳庭苑](/estates/fung-ting-court)、[宏富苑](/estates/wang-fu-court)。私樓：[YOHO Town](/estates/yoho)、[YOHO Midtown](/estates/yoho-midtown)、[加州花園](/estates/palm-springs)、[錦繡花園](/estates/fairview-park)、[峻巒](/estates/park-yoho)。",
          "屋苑頁列出適用樓類計劃。指定屋苑計劃只會喺搜該屋苑時出現，**唔入**上面摘要表。點用屋苑名見 [齊Quote 點用屋苑篩](/guides/estate-filter)。全部見 [屋苑目錄](/estates)。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "返首頁輸入座數同街道，或者開 [公屋光纖格價](/plans?cat=broadband&housing=public)。天水圍見 [天水圍寬頻](/guides/tin-shui-wai)。其他地區：[沙田寬頻](/guides/sha-tin)、[將軍澳寬頻](/guides/tseung-kwan-o)。錦田、八鄉、屏山、洪水橋等村屋見 [村屋光纖月費](/guides/village-fees)。2026 年表見 [2026 家居寬頻格價](/guides/home-broadband-2026)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Not one district price",
        paragraphs: [
          "Yuen Long searches still start with housing type. Long Ping and Shui Pin Wai are public; Fung Ting Court is HOS; YOHO Town is private. The same 1000M line can be a different plan in each.",
          "Tin Shui Wai is filed under Yuen Long, but Tin Yiu and Kingswood **do not** use this page. See [Tin Shui Wai](/guides/tin-shui-wai). Fees below are **listed on this site**, **for reference only**. This table is **not a ranking**. Public vs HOS: [public vs HOS](/guides/public-vs-hos).",
        ],
      },
      {
        heading: "Public / HOS 1000M examples",
        paragraphs: [
          "Use the public / HOS table for Long Ping and Fung Ting Court. Do **not** guess from a YOHO private-estate row. Full table: [public / HOS 1000M](/guides/public-hos-fees).",
        ],
        table: {
          caption: "Listed on this site, for reference only",
          headers: ["Example", "Housing / reference fee"],
          rows: [
            {
              label: "有線 1000M（48 個月）",
              value: "公屋、居屋、私樓｜HK$58",
              href: "/plans/icable-ftth-1000-48m-58",
            },
            {
              label: "HGC 轉台 1000M（36 個月）",
              value: "公屋、居屋｜HK$75",
              href: "/plans/hgc-ftth-1000-public-36m",
            },
            {
              label: "中國移動香港 1000M（36 個月）",
              value: "公屋、居屋、私樓｜HK$88",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "香港寬頻 1000M 連 Wi-Fi 7（36 個月）",
              value: "公屋、居屋、私樓｜HK$98",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
          ],
        },
      },
      {
        heading: "YOHO and other private estates",
        paragraphs: [
          "Use the private-estate table. Do **not** guess a YOHO fee from Long Ping. Full table: [private-estate 1000M](/guides/private-1000-fees).",
        ],
        table: {
          caption: "Listed on this site, for reference only",
          headers: ["Example", "Housing / reference fee"],
          rows: [
            {
              label: "中國移動香港 1000M（36 個月）",
              value: "公屋、居屋、私樓｜HK$88",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "有線私人樓宇 1000M（36 個月）",
              value: "私樓｜HK$88",
              href: "/plans/icable-ftth-1000-private-36m",
            },
            {
              label: "HGC 私人樓宇 1000M（39 個月）",
              value: "私樓｜HK$89",
              href: "/plans/hgc-ftth-1000-private-39m",
            },
            {
              label: "香港寬頻 1000M 連 Wi-Fi 7（36 個月）",
              value: "公屋、居屋、私樓｜HK$98",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
          ],
        },
      },
      {
        heading: "Estate pages",
        paragraphs: [
          "Public: [Long Ping](/estates/long-ping), [Shui Pin Wai](/estates/shui-pin-wai). HOS: [Fung Ting Court](/estates/fung-ting-court). Private: [YOHO Town](/estates/yoho). Named-estate offers stay off this summary. See [estate filter](/guides/estate-filter).",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Type the block and street on the home page, or open [public fibre plans](/plans?cat=broadband&housing=public). Tin Shui Wai: [Tin Shui Wai](/guides/tin-shui-wai). Also: [Sha Tin](/guides/sha-tin), [Tseung Kwan O](/guides/tseung-kwan-o). Nearby villages: [village fibre fees](/guides/village-fees).",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "元朗寬頻月費係咪全區一樣？",
        a: "唔係。公屋、居屋、私樓通常分開報。天水圍見 [天水圍寬頻](/guides/tin-shui-wai)。頁上數字係站內列出、僅供參考，以電訊商確認為準。",
      },
      {
        q: "朗屏邨可唔可以用 YOHO 嗰行價？",
        a: "唔可以。朗屏邨係公屋，YOHO Town 係私樓。公居屋例子見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)。",
      },
      {
        q: "元朗村屋用唔用得公屋表？",
        a: "唔得。錦田、八鄉、屏山、洪水橋等村屋係另一套計劃，見 [村屋光纖月費](/guides/village-fees)。",
      },
    ],
    faqEn: [
      {
        q: "Is Yuen Long one broadband fee?",
        a: "No. Public, HOS and private estates are usually quoted separately. Tin Shui Wai has its own page. Figures here are listed on the site, for reference only.",
      },
      {
        q: "Can Long Ping use a YOHO row?",
        a: "No. Long Ping is public housing. See [public / HOS 1000M](/guides/public-hos-fees).",
      },
      {
        q: "Can a Yuen Long village house use the public table?",
        a: "No. Kam Tin, Pat Heung, Ping Shan and Hung Shui Kiu use a separate set. See [village fibre fees](/guides/village-fees).",
      },
    ],
  },
  {
    slug: "mobile-broadband-bundle",
    minutes: 7,
    category: "mobile",
    seoTitle: "手機加寬頻組合點計｜免月費同合約期｜齊Quote",
    h1: "手機 + 寬頻組合優惠點計最抵",
    description:
      "手機加寬頻組合要分開計兩條合約：免月費、回贈、合約期長短可以唔同。同一間電訊商一齊申請，同分開申請，總支出可以唔同。實際條款以電訊商確認為準。",
    title: "手機 + 寬頻組合優惠點計最抵",
    excerpt: "組合唔好只睇一句「一齊申請有優惠」。分開計手機同寬頻嘅月數、免月費同回贈。",
    titleEn: "How to add up a mobile and broadband bundle",
    excerptEn: "A bundle is two contracts. Count free months, rebates and the length of each one before you compare it with applying separately.",
    descriptionEn:
      "A mobile plus broadband bundle is two contracts. Free months, rebates and contract lengths can differ. Applying together and applying separately can cost different totals. The carrier confirms the terms.",
    h1En: "How to add up a mobile and broadband bundle",
    published: "2026-10-21",
    modified: "2026-10-21",
    related: ["mobile", "fiber", "broadband-total-cost", "contract-fees", "port-in", "broadband-renewal"],
    plans: [
      { href: "/plans?cat=mobile", label: "去手機格價" },
      { href: "/plans?cat=broadband", label: "去光纖格價" },
    ],
    estates: [{ href: "/estates", label: "屋苑目錄" }],
    body: [
      {
        heading: "組合係兩條合約，唔係一個月費",
        paragraphs: [
          "「手機 + 寬頻」多數仍然係兩份合約：一份手機、一份家居寬頻。優惠可以係免幾個月、回贈、或者只要同一個名申請。標示月費加埋，唔等於你實際俾嘅數。",
          "計法同單一線一樣，見 [寬頻合約總成本點計](/guides/broadband-total-cost)。分別係你要計兩次，再加總。月費以外仲有安裝費、預繳、行政費，見 [月費以外](/guides/contract-fees)。",
        ],
      },
      {
        heading: "免月費同回贈點先計得準",
        paragraphs: [
          "先分開寫：手機合約幾多個月、免幾多個月、有冇回贈；寬頻合約幾多個月、免幾多個月、有冇回贈或者預繳。免月費只適用其中一條，就唔好當兩條都平咗。",
          "回贈如果要分期、要預繳、或者要維持兩條線先至有，都要問清楚先至減。頁上列出嘅月費係參考，唔係你張組合單。",
        ],
      },
      {
        heading: "一齊申請，定分開申請",
        paragraphs: [
          "一齊申請有時有額外回贈或者免月費，分開申請有時手機同寬頻各自嘅新客條件更適合你。兩邊都要計完總支出先比較，唔好只睇多咗一句優惠。",
          "手機轉台見 [攜號轉台](/guides/port-in)。寬頻唔能夠攜號，新線裝好先停舊線，見 [轉台寬頻](/guides/switch-broadband)。如果就嚟完約，一併睇 [寬頻續約](/guides/broadband-renewal)。",
        ],
      },
      {
        heading: "合約期長短唔同",
        paragraphs: [
          "手機 24 個月、寬頻 36 個月，係常見情況。唔好用較短嗰條嘅平均月費，當成兩條線之後都係嗰個價。短約完咗，手機可能要續約或者轉台，寬頻仍然綁住。",
          "問：其中一條提早停，另一條嘅組合優惠會唔會收回。提早終止以你簽嘅合約為準。本頁唔提供避約方法。",
        ],
        table: {
          caption: "組合對一次",
          headers: ["事項", "點計"],
          rows: [
            {
              label: "兩條月費",
              value: "手機同寬頻分開寫低，再加總。",
              href: "/guides/broadband-total-cost",
            },
            {
              label: "免月費／回贈",
              value: "睇清適用邊一條，唔好兩邊都減。",
              href: "/guides/broadband-total-cost",
            },
            {
              label: "合約期",
              value: "長短唔同就分開計，唔好拉勻當一個價。",
              href: "/guides/contract-fees",
            },
            {
              label: "分開申請",
              value: "計完先同組合比，唔好只睇多咗一句優惠。",
              href: "/plans?cat=mobile",
            },
          ],
        },
      },
      {
        heading: "下一步",
        paragraphs: [
          "開 [手機格價](/plans?cat=mobile) 同 [光纖格價](/plans?cat=broadband)，再 WhatsApp 問組合係咪兩份合約、免月費適用邊條、完約日係咪同一日。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "A bundle is two contracts, not one fee",
        paragraphs: [
          "Mobile plus broadband is usually still two contracts. The offer may be free months, a rebate, or a discount only if both are in the same name. Adding the sticker fees is not what you pay.",
          "The method is the same as one line, twice. See [broadband total cost](/guides/broadband-total-cost) and [install, prepay, contract](/guides/contract-fees).",
        ],
      },
      {
        heading: "Free months and rebates",
        paragraphs: [
          "Write the mobile term, free months and rebate on one line, and the broadband term on another. If a free month applies to only one service, do not subtract it twice.",
          "Ask whether a rebate is paid in stages, needs a prepayment, or disappears if you drop one line. Listed fees are a reference, not your bundle bill.",
        ],
      },
      {
        heading: "Together or separately",
        paragraphs: [
          "Applying together can add a rebate. Applying separately can suit the new-customer terms of each service. Compare the totals, not the extra slogan.",
          "Mobile porting: [port-in](/guides/port-in). Broadband cannot port a number. See [switching broadband](/guides/switch-broadband) and, near the end of a term, [renewing broadband](/guides/broadband-renewal).",
        ],
      },
      {
        heading: "Mismatched contract lengths",
        paragraphs: [
          "A 24-month mobile plan beside a 36-month fibre plan is common. Do not treat the shorter average as the price of both lines after that. When the short term ends, the mobile plan may renew while fibre is still tied.",
          "Ask whether stopping one line claws back the bundle offer. This page does not explain how to exit a contract.",
        ],
        table: {
          caption: "Bundle checklist",
          headers: ["Item", "How to count"],
          rows: [
            {
              label: "Two fees",
              value: "Write mobile and broadband separately, then add them.",
              href: "/guides/broadband-total-cost",
            },
            {
              label: "Free months / rebate",
              value: "See which line they apply to. Do not subtract twice.",
              href: "/guides/broadband-total-cost",
            },
            {
              label: "Term length",
              value: "Different lengths stay separate. Do not blend them into one price.",
              href: "/guides/contract-fees",
            },
            {
              label: "Separate applications",
              value: "Compare the totals with the bundle, not the slogan.",
              href: "/plans?cat=mobile",
            },
          ],
        },
      },
      {
        heading: "Next step",
        paragraphs: [
          "Open [mobile plans](/plans?cat=mobile) and [fibre plans](/plans?cat=broadband), then ask on WhatsApp whether the bundle is two contracts, which line the free months hit, and whether the end dates match.",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "組合月費係咪兩個標價加埋？",
        a: "唔係。要再計免月費、回贈、預繳同合約期。免月費可能只適用其中一條。見 [寬頻合約總成本點計](/guides/broadband-total-cost)。",
      },
      {
        q: "手機 24 個月、寬頻 36 個月點比？",
        a: "分開計。短約完咗，手機可能要續或者轉，寬頻仍然綁住。唔好拉勻當一個價。",
      },
      {
        q: "分開申請會唔會更平？",
        a: "有機會，亦有機會組合先有回贈。兩邊計完總支出先比較。實際條款以電訊商確認為準。",
      },
    ],
    faqEn: [
      {
        q: "Is the bundle just the two sticker fees added together?",
        a: "No. Count free months, rebates, prepayment and each term. A free month may apply to only one line. See [broadband total cost](/guides/broadband-total-cost).",
      },
      {
        q: "What if mobile is 24 months and broadband is 36?",
        a: "Count them separately. When the shorter term ends, mobile may need a new deal while fibre is still tied. Do not blend them into one price.",
      },
      {
        q: "Can applying separately cost less?",
        a: "Sometimes. Sometimes the bundle rebate wins. Compare the totals. The carrier confirms the terms.",
      },
    ],
  },
  {
    slug: "router-wifi",
    minutes: 7,
    category: "fiber",
    seoTitle: "寬頻路由器點揀｜Wi-Fi 6 同 Wi-Fi 7｜齊Quote",
    h1: "寬頻路由器點揀：Wi-Fi 6／Wi-Fi 7 值唔值得",
    description:
      "Wi-Fi 6 對一般家庭多數夠用。Wi-Fi 7 要手機同平板都支援先發揮到。計劃包嘅路由器可能係送出或者借用。擺位往往比再買高一檔更影響手感。實際規格以電訊商確認為準。",
    title: "寬頻路由器點揀：Wi-Fi 6／Wi-Fi 7 值唔值得",
    excerpt: "一般家用 Wi-Fi 6 多數夠。人多、打機、部部機都新，先再問 Wi-Fi 7。先問清部機係送定借。",
    titleEn: "Choosing a broadband router: Wi-Fi 6 or Wi-Fi 7",
    excerptEn: "Wi-Fi 6 is enough for many homes. Wi-Fi 7 helps when devices support it. Ask whether the included router is a gift or a loan.",
    descriptionEn:
      "Wi-Fi 6 is enough for many homes. Wi-Fi 7 only helps when phones and laptops support it. A plan-included router may be a gift or a loan. Placement often changes the feel more than the next badge. Specs are confirmed by the carrier.",
    h1En: "Choosing a broadband router: is Wi-Fi 6 or Wi-Fi 7 worth it?",
    published: "2026-10-21",
    modified: "2026-10-21",
    related: ["fiber", "is-1000m-enough", "1000m-or-2500m", "contract-fees", "broadband-stability", "fiber-vs-5g"],
    plans: [{ href: "/plans?cat=broadband", label: "去光纖格價" }],
    estates: [{ href: "/estates", label: "屋苑目錄" }],
    body: [
      {
        heading: "Wi-Fi 6 同 Wi-Fi 7 差喺邊",
        paragraphs: [
          "Wi-Fi 6 同 Wi-Fi 7 係路由器同裝置之間嘅無線世代，唔係光纖入屋嗰條線嘅速度。線係 1000M，手機唔支援新世代，天花板仍然係部手機。",
          "Wi-Fi 7 通常要路由器同裝置兩邊都支援，先用到較新嘅功能。屋企部部機都舊，換一部寫住 Wi-Fi 7 嘅路由器，手感未必跟住標籤走。一般家用幾多先夠，見 [1000M 夠唔夠](/guides/is-1000m-enough)。",
        ],
      },
      {
        heading: "一般家庭夠唔夠",
        paragraphs: [
          "上網、視像會議、一兩路影片，Wi-Fi 6 同放得啱嘅位置，多數已經夠。牆多、單位大、路由器鎖喺櫃入面，先會覺得慢，呢個唔係單靠換世代就一定好。",
          "1000M 同 2500M 點揀，見 [1000M 同 2500M 寬頻點揀](/guides/1000m-or-2500m)。速度手感亦受覆蓋同樓內線路影響，見 [邊間比較穩](/guides/broadband-stability)。",
        ],
      },
      {
        heading: "打機同屋企人多",
        paragraphs: [
          "打機在意延遲多過峰值下載。可以拉線去機，通常穩過全程靠 Wi-Fi。人多、同時上傳大檔，先再問多頻段、多天線，或者 Wi-Fi 7 係咪有用。",
          "5G 家居路由器跟流動訊號，擺位同光纖路由器唔同，見 [5G家居定光纖](/guides/fiber-vs-5g)。",
        ],
        table: {
          caption: "路由器點睇",
          headers: ["情況", "點揀"],
          rows: [
            {
              label: "一般家用",
              value: "Wi-Fi 6 加啱嘅擺位，多數夠。",
              href: "/guides/is-1000m-enough",
            },
            {
              label: "部部機都新、人多",
              value: "先問裝置支唔支援 Wi-Fi 7，再決定使唔使換。",
              href: "/guides/1000m-or-2500m",
            },
            {
              label: "打機",
              value: "延遲優先。可以就用線，唔好只追標籤。",
              href: "/guides/broadband-stability",
            },
          ],
        },
      },
      {
        heading: "計劃包機，定自己買",
        paragraphs: [
          "合約寫「送路由器」同「包路由器」唔同。送出通常係你嘅；包用或者借用，合約完可能要還，遺失要另計。自己買一部，可以留低，但電訊商借出嗰部仍然要按合約歸還。",
          "簽約前問型號、壞機點換、可唔可以換自己嘅機。見 [月費以外](/guides/contract-fees)。",
        ],
      },
      {
        heading: "擺位",
        paragraphs: [
          "放喺常用區域中間、少少高、避開金屬櫃、厚牆同微波爐。光纖入咗屋，擺位往往比再上一檔月費更明顯。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "What Wi-Fi 6 and Wi-Fi 7 actually change",
        paragraphs: [
          "Wi-Fi 6 and Wi-Fi 7 are the link between the router and your devices, not the fibre speed into the flat. A 1000M line still meets the phone’s own limit.",
          "Wi-Fi 7 usually needs both the router and the device. Older phones may not feel the badge. See [is 1000M enough](/guides/is-1000m-enough).",
        ],
      },
      {
        heading: "Enough for a typical home?",
        paragraphs: [
          "Browsing, calls and one or two video streams are often fine on Wi-Fi 6 if the router is placed well. Thick walls and a router in a cupboard feel slow for reasons a newer badge does not automatically fix.",
          "Speed tiers: [1000M or 2500M](/guides/1000m-or-2500m). Stability: [which broadband is more stable](/guides/broadband-stability).",
        ],
      },
      {
        heading: "Gaming and busy homes",
        paragraphs: [
          "Gaming cares more about latency than peak download. A cable to the computer is usually steadier than Wi-Fi all the way. Ask about Wi-Fi 7 when many new devices upload at once.",
          "A 5G home router follows the mobile signal. See [fibre vs 5G home](/guides/fiber-vs-5g).",
        ],
        table: {
          caption: "How to read the router",
          headers: ["Situation", "How to choose"],
          rows: [
            {
              label: "Typical home",
              value: "Wi-Fi 6 and a sensible spot are often enough.",
              href: "/guides/is-1000m-enough",
            },
            {
              label: "New devices, many people",
              value: "Check that devices support Wi-Fi 7 before you pay for it.",
              href: "/guides/1000m-or-2500m",
            },
            {
              label: "Gaming",
              value: "Latency first. Use a cable when you can.",
              href: "/guides/broadband-stability",
            },
          ],
        },
      },
      {
        heading: "Included router or your own",
        paragraphs: [
          "“Gifted router” and “router included” are not the same. A gift is usually yours. An included or loaned unit often goes back at the end. If you buy your own, you may still have to return the carrier’s unit.",
          "Ask the model, how a fault is swapped, and whether your own router is allowed. See [install, prepay, contract](/guides/contract-fees).",
        ],
      },
      {
        heading: "Placement",
        paragraphs: [
          "Put it near the middle of where you actually sit, slightly raised, away from metal cabinets, thick walls and the microwave. Once fibre is in, placement often matters more than the next monthly tier.",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "Wi-Fi 7 係咪一定快過 Wi-Fi 6？",
        a: "唔一定。手機同平板都要支援，而且牆同擺位會蓋過標籤。一般家用 Wi-Fi 6 多數夠。實際規格以電訊商確認為準。",
      },
      {
        q: "計劃包嘅路由器係咪我嘅？",
        a: "要睇合約。送出同包用唔同，包用可能到期要還。見 [月費以外](/guides/contract-fees)。",
      },
      {
        q: "打機使唔使換 Wi-Fi 7？",
        a: "延遲同可唔可以拉線更重要。人多、裝置新，先再問使唔使換。見 [邊間比較穩](/guides/broadband-stability)。",
      },
    ],
    faqEn: [
      {
        q: "Is Wi-Fi 7 always faster than Wi-Fi 6?",
        a: "Not always. Phones have to support it, and walls and placement can matter more than the badge. Wi-Fi 6 is enough for many homes. Specs are confirmed by the carrier.",
      },
      {
        q: "Is the included router mine?",
        a: "Read the contract. A gift and a loan are different. A loan is often returned. See [install, prepay, contract](/guides/contract-fees).",
      },
      {
        q: "Do I need Wi-Fi 7 for gaming?",
        a: "Latency and a cable matter more. Ask about a newer router when many new devices share the line. See [which broadband is more stable](/guides/broadband-stability).",
      },
    ],
  },
  {
    slug: "tuen-mun",
    minutes: 7,
    category: "fiber",
    seoTitle: "屯門寬頻比較｜公屋居屋私樓參考月費｜齊Quote",
    h1: "屯門寬頻點揀：先分樓類再比較月費",
    description:
      "屯門寬頻唔係一張區價。良景邨、山景邨等公屋，兆康苑等居屋，同黃金海岸、瓏門等私樓，計劃通常分開報。下列係站內列出參考月費，覆蓋同安裝以電訊商確認為準。",
    title: "屯門寬頻點揀：先分樓類再比較月費",
    excerpt: "屯門唔係一區一價。公屋、居屋、私樓分開睇參考月費，再填地址查核。",
    titleEn: "Tuen Mun broadband: housing type first, then the fee",
    excerptEn: "Tuen Mun is not one district price. Compare public, HOS and private estates separately, then confirm the address.",
    descriptionEn:
      "Tuen Mun broadband is not one district fee. Public estates such as Leung King, HOS courts such as Siu Hong Court, and private estates such as Gold Coast are usually quoted separately. Listed fees are a reference. Coverage is confirmed by the carrier.",
    h1En: "Tuen Mun broadband: sort housing type before the monthly fee",
    published: "2026-10-21",
    modified: "2026-10-21",
    related: [
      "public-hos-fees",
      "private-1000-fees",
      "yuen-long",
      "tin-shui-wai",
      "sha-tin",
      "tseung-kwan-o",
      "fiber",
      "estate-filter",
      "home-broadband-2026",
      "public-vs-hos",
      "village-fees",
    ],
    plans: [
      { href: "/plans?cat=broadband&housing=public", label: "公屋光纖計劃" },
      { href: "/plans?cat=broadband&housing=hos", label: "居屋光纖計劃" },
      { href: "/plans?cat=broadband&housing=private", label: "私樓光纖計劃" },
    ],
    estates: [
      { href: "/estates/leung-king", label: "良景邨" },
      { href: "/estates/shan-king", label: "山景邨" },
      { href: "/estates/siu-hong-court", label: "兆康苑" },
      { href: "/estates/gold-coast", label: "黃金海岸" },
      { href: "/estates", label: "屋苑目錄" },
    ],
    inquiry: { district: "屯門" },
    cta: {
      lead: "填完整屯門地址同座數，用 WhatsApp 查核覆蓋同參考月費。僅供參考，以電訊商確認為準。",
      leadEn: "Send the full Tuen Mun address on WhatsApp to check coverage and a reference fee. For reference only; the carrier confirms.",
      button: "WhatsApp 查核屯門報價",
      buttonEn: "WhatsApp a Tuen Mun quote",
      waText: salesQuoteMessage({ serviceType: "光纖寬頻", address: "屯門", source: "filter" }),
      waTextEn: salesQuoteMessage({ serviceType: "光纖寬頻", address: "屯門", source: "filter" }),
    },
    body: [
      {
        heading: "屯門唔係一區一價",
        paragraphs: [
          "搜「屯門寬頻」見到嘅，多數仍然要先分樓類。良景邨、山景邨、大興邨、安定邨係公屋；兆康苑、兆翠苑係居屋；黃金海岸、瓏門、愛琴灣係私樓。同一條 1000M，三種樓類計劃可以完全唔同。",
          "下列月費係**站內列出**例子，**僅供參考**，唔代表你座樓一定有。呢張表**唔係排名**。公屋同居屋點分，見 [公屋同居屋有咩分別](/guides/public-vs-hos)。",
        ],
      },
      {
        heading: "公屋／居屋參考 1000M",
        paragraphs: [
          "良景、山景等公屋，同兆康苑等居屋，用公居屋表，**唔好**用黃金海岸私樓價去估。完整表見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)。",
        ],
        table: {
          caption: "站內列出｜僅供參考",
          headers: ["計劃例子", "樓類／參考月費"],
          rows: [
            {
              label: "有線 1000M（48 個月）",
              value: "公屋、居屋、私樓｜HK$58",
              href: "/plans/icable-ftth-1000-48m-58",
            },
            {
              label: "HGC 轉台 1000M（36 個月）",
              value: "公屋、居屋｜HK$75",
              href: "/plans/hgc-ftth-1000-public-36m",
            },
            {
              label: "中國移動香港 1000M（36 個月）",
              value: "公屋、居屋、私樓｜HK$88",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "香港寬頻 1000M 連 Wi-Fi 7（36 個月）",
              value: "公屋、居屋、私樓｜HK$98",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
          ],
        },
      },
      {
        heading: "黃金海岸等私樓",
        paragraphs: [
          "黃金海岸、瓏門、愛琴灣用私樓表。**唔好**用良景邨公屋價去估。完整表見 [私樓 1000M 參考月費](/guides/private-1000-fees)。",
        ],
        table: {
          caption: "站內列出｜僅供參考",
          headers: ["計劃例子", "樓類／參考月費"],
          rows: [
            {
              label: "中國移動香港 1000M（36 個月）",
              value: "公屋、居屋、私樓｜HK$88",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "有線私人樓宇 1000M（36 個月）",
              value: "私樓｜HK$88",
              href: "/plans/icable-ftth-1000-private-36m",
            },
            {
              label: "HGC 私人樓宇 1000M（39 個月）",
              value: "私樓｜HK$89",
              href: "/plans/hgc-ftth-1000-private-39m",
            },
            {
              label: "香港寬頻 1000M 連 Wi-Fi 7（36 個月）",
              value: "公屋、居屋、私樓｜HK$98",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
          ],
        },
      },
      {
        heading: "常見屋苑入口",
        paragraphs: [
          "公屋：[良景邨](/estates/leung-king)、[山景邨](/estates/shan-king)、[大興邨](/estates/tai-hing)、[安定邨](/estates/on-ting)。居屋：[兆康苑](/estates/siu-hong-court)、[兆翠苑](/estates/siu-chui-court)。私樓：[黃金海岸](/estates/gold-coast)、[瓏門](/estates/century-gateway)、[愛琴灣](/estates/aegean-coast)。",
          "屋苑頁列出適用樓類計劃。指定屋苑計劃只會喺搜該屋苑時出現，**唔入**上面摘要表。點用屋苑名見 [齊Quote 點用屋苑篩](/guides/estate-filter)。全部見 [屋苑目錄](/estates)。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "返首頁輸入座數同街道，或者開 [公屋光纖格價](/plans?cat=broadband&housing=public)。附近地區：[元朗寬頻](/guides/yuen-long)、[天水圍寬頻](/guides/tin-shui-wai)。其他：[沙田寬頻](/guides/sha-tin)、[將軍澳寬頻](/guides/tseung-kwan-o)。龍鼓灘、青山村等村屋見 [村屋光纖月費](/guides/village-fees)。2026 年表見 [2026 家居寬頻格價](/guides/home-broadband-2026)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Not one district price",
        paragraphs: [
          "Tuen Mun searches still start with housing type. Leung King and Shan King are public; Siu Hong Court is HOS; Gold Coast and Century Gateway are private. The same 1000M line can be a different plan in each.",
          "Fees below are **listed on this site**, **for reference only**. This table is **not a ranking**. Public vs HOS: [public vs HOS](/guides/public-vs-hos).",
        ],
      },
      {
        heading: "Public / HOS 1000M examples",
        paragraphs: [
          "Use the public / HOS table for Leung King and Siu Hong Court. Do **not** guess from a Gold Coast private-estate row. Full table: [public / HOS 1000M](/guides/public-hos-fees).",
        ],
        table: {
          caption: "Listed on this site, for reference only",
          headers: ["Example", "Housing / reference fee"],
          rows: [
            {
              label: "有線 1000M（48 個月）",
              value: "公屋、居屋、私樓｜HK$58",
              href: "/plans/icable-ftth-1000-48m-58",
            },
            {
              label: "HGC 轉台 1000M（36 個月）",
              value: "公屋、居屋｜HK$75",
              href: "/plans/hgc-ftth-1000-public-36m",
            },
            {
              label: "中國移動香港 1000M（36 個月）",
              value: "公屋、居屋、私樓｜HK$88",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "香港寬頻 1000M 連 Wi-Fi 7（36 個月）",
              value: "公屋、居屋、私樓｜HK$98",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
          ],
        },
      },
      {
        heading: "Gold Coast and other private estates",
        paragraphs: [
          "Use the private-estate table. Do **not** guess a Gold Coast fee from Leung King. Full table: [private-estate 1000M](/guides/private-1000-fees).",
        ],
        table: {
          caption: "Listed on this site, for reference only",
          headers: ["Example", "Housing / reference fee"],
          rows: [
            {
              label: "中國移動香港 1000M（36 個月）",
              value: "公屋、居屋、私樓｜HK$88",
              href: "/plans/cmhk-ftth-2500",
            },
            {
              label: "有線私人樓宇 1000M（36 個月）",
              value: "私樓｜HK$88",
              href: "/plans/icable-ftth-1000-private-36m",
            },
            {
              label: "HGC 私人樓宇 1000M（39 個月）",
              value: "私樓｜HK$89",
              href: "/plans/hgc-ftth-1000-private-39m",
            },
            {
              label: "香港寬頻 1000M 連 Wi-Fi 7（36 個月）",
              value: "公屋、居屋、私樓｜HK$98",
              href: "/plans/hkbn-ftth-1000-36m-98",
            },
          ],
        },
      },
      {
        heading: "Estate pages",
        paragraphs: [
          "Public: [Leung King](/estates/leung-king), [Shan King](/estates/shan-king). HOS: [Siu Hong Court](/estates/siu-hong-court). Private: [Gold Coast](/estates/gold-coast). Named-estate offers stay off this summary. See [estate filter](/guides/estate-filter).",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Type the block and street on the home page, or open [public fibre plans](/plans?cat=broadband&housing=public). Nearby: [Yuen Long](/guides/yuen-long), [Tin Shui Wai](/guides/tin-shui-wai). Also: [Sha Tin](/guides/sha-tin), [Tseung Kwan O](/guides/tseung-kwan-o). Nearby villages: [village fibre fees](/guides/village-fees).",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "屯門寬頻月費係咪全區一樣？",
        a: "唔係。公屋、居屋、私樓通常分開報。頁上數字係站內列出、僅供參考，以電訊商確認為準。",
      },
      {
        q: "良景邨可唔可以用黃金海岸嗰行價？",
        a: "唔可以。良景邨係公屋，黃金海岸係私樓。公居屋例子見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)。",
      },
      {
        q: "屯門村屋用唔用得公屋表？",
        a: "唔得。龍鼓灘、青山村等村屋係另一套計劃，見 [村屋光纖月費](/guides/village-fees)。",
      },
    ],
    faqEn: [
      {
        q: "Is Tuen Mun one broadband fee?",
        a: "No. Public, HOS and private estates are usually quoted separately. Figures here are listed on the site, for reference only.",
      },
      {
        q: "Can Leung King use a Gold Coast row?",
        a: "No. Leung King is public housing. See [public / HOS 1000M](/guides/public-hos-fees).",
      },
      {
        q: "Can a Tuen Mun village house use the public table?",
        a: "No. Places such as Lung Kwu Tan use a separate set. See [village fibre fees](/guides/village-fees).",
      },
    ],
  },
  {
    slug: "student-plans",
    minutes: 7,
    category: "mobile",
    seoTitle: "學生寬頻同手機計劃點揀｜資格同用量｜齊Quote",
    h1: "學生寬頻同手機計劃點揀最抵",
    description:
      "學生計劃通常要核實學生身份，優惠先至用得。先睇本地數據夠唔夠，再決定手機同家居寬頻分開申請定一齊計。預算要計合約期同免月費。資格同月費以電訊商確認為準。",
    title: "學生寬頻同手機計劃點揀最抵",
    excerpt: "學生優惠要先核實身份。本地數據、分開定組合、合約期，三樣計完先好簽約。",
    titleEn: "Student broadband and mobile plans",
    excerptEn: "Student offers usually need proof of status. Count local data, whether to bundle, and the contract length before you sign.",
    descriptionEn:
      "Student plans usually need the carrier to confirm student status before the offer applies. Start with local data, then decide whether mobile and home broadband should be separate or counted together. Budget for the term and any free months. Eligibility and fees are confirmed by the carrier.",
    h1En: "Student broadband and mobile plans: how to choose",
    published: "2026-10-21",
    modified: "2026-10-21",
    related: ["mobile", "port-in", "gba-mobile", "contract-fees", "broadband-total-cost", "fiber", "mobile-broadband-bundle"],
    plans: [
      { href: "/plans?cat=mobile", label: "去手機格價" },
      { href: "/plans?cat=broadband", label: "去光纖格價" },
    ],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/mobile", label: "手機月費攻略" },
    ],
    body: [
      {
        heading: "學生身份要電訊商核實",
        paragraphs: [
          "市面上有時會見到學生手機或者學生寬頻，條件通常係在學證明、學生證，或者某個年齡。呢頁唔列出邊間有、優惠幾多。有定冇、你合唔合格，申請時先由電訊商確認。",
          "未核實之前，唔好當自己一定用得學生價。普通計劃同學生計劃要並排睇，見 [手機月費點揀](/guides/mobile)。",
        ],
      },
      {
        heading: "先睇數據夠唔夠",
        paragraphs: [
          "上課、短片、熱點開電腦，本地數據先決。漫遊或者大灣區係額外一層，額度好多時同本地分開計，見 [大灣區手機計劃](/guides/gba-mobile)。",
          "宿舍或者屋企要另開一條寬頻，就唔好將手機用量當成屋企 Wi-Fi。家居線見 [光纖寬頻](/guides/fiber)。",
        ],
      },
      {
        heading: "分開申請定一齊計",
        paragraphs: [
          "學生優惠有時只覆蓋手機，寬頻仍然係普通家居計劃；有時兩條一齊先有回贈。分開寫低每條嘅月費、免月費同合約期，再同分開申請比較。計法見 [手機加寬頻組合](/guides/mobile-broadband-bundle) 同 [寬頻合約總成本點計](/guides/broadband-total-cost)。",
          "轉手機號碼見 [攜號轉台](/guides/port-in)。唔好為咗學生優惠提早取消未完嘅舊約。",
        ],
        table: {
          caption: "學生計劃對一次",
          headers: ["事項", "問咩"],
          rows: [
            {
              label: "資格",
              value: "要咩證明、讀到幾時、畢業之後點算。",
              href: "/guides/mobile",
            },
            {
              label: "本地數據",
              value: "夠唔夠課堂同熱點，漫遊係咪另計。",
              href: "/guides/gba-mobile",
            },
            {
              label: "組合",
              value: "優惠係咪只覆蓋手機，寬頻使唔使另計。",
              href: "/guides/mobile-broadband-bundle",
            },
            {
              label: "預算",
              value: "合約期、免月費、預繳，唔好只睇首月。",
              href: "/guides/broadband-total-cost",
            },
          ],
        },
      },
      {
        heading: "預算",
        paragraphs: [
          "首月平，唔代表合約期內平。問免月費有幾多、完約之後恢復咩價、行政費同預繳。見 [月費以外](/guides/contract-fees)。",
          "頁上月費係市場參考，唔係學生專屬價。合資格先至有嘅條件，以電訊商確認為準。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "The carrier confirms student status",
        paragraphs: [
          "A student mobile or broadband offer usually needs proof of study, a student card, or an age rule. This page does not list who has one or what it costs. The carrier confirms whether you qualify.",
          "Until that check, do not assume the student price applies. Compare it with a regular plan. See [mobile plans](/guides/mobile).",
        ],
      },
      {
        heading: "Data first",
        paragraphs: [
          "Classes, video and a laptop hotspot use local data first. Roaming or Greater Bay Area quota is often a separate pot. See [GBA mobile](/guides/gba-mobile).",
          "A home or dorm line is not the same as the phone’s data. See [fibre](/guides/fiber).",
        ],
      },
      {
        heading: "Separate or together",
        paragraphs: [
          "A student offer may cover only the phone, while broadband stays a normal home plan. Sometimes the rebate needs both. Write each fee, free months and term, then compare with applying separately. See [mobile and broadband bundles](/guides/mobile-broadband-bundle) and [broadband total cost](/guides/broadband-total-cost).",
          "Changing number: [port-in](/guides/port-in). Do not cancel an unfinished contract early just to chase a student offer.",
        ],
        table: {
          caption: "Student-plan checklist",
          headers: ["Item", "Ask"],
          rows: [
            {
              label: "Eligibility",
              value: "What proof, until when, and what happens after you graduate.",
              href: "/guides/mobile",
            },
            {
              label: "Local data",
              value: "Enough for class and a hotspot, and whether roaming is separate.",
              href: "/guides/gba-mobile",
            },
            {
              label: "Bundle",
              value: "Whether the offer is phone-only and broadband is extra.",
              href: "/guides/mobile-broadband-bundle",
            },
            {
              label: "Budget",
              value: "Term, free months and prepayment, not just the first month.",
              href: "/guides/broadband-total-cost",
            },
          ],
        },
      },
      {
        heading: "Budget",
        paragraphs: [
          "A cheap first month is not the cost over the term. Ask how many months are free, the price after that, and any admin or prepay fee. See [install, prepay, contract](/guides/contract-fees).",
          "Fees on this site are a market reference, not a student price. Eligibility is confirmed by the carrier.",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "有學生證係咪一定有學生價？",
        a: "唔一定。電訊商先確認你合唔合格、證明要咩、讀到幾時。未確認之前，當普通計劃一齊比較。",
      },
      {
        q: "學生優惠包唔包屋企寬頻？",
        a: "有時只包手機。寬頻要另計月費、免月費同合約期。見 [手機加寬頻組合](/guides/mobile-broadband-bundle)。",
      },
      {
        q: "點樣先唔會估錯預算？",
        a: "計合約期、免月費、回贈同預繳，唔好只睇首月。見 [寬頻合約總成本點計](/guides/broadband-total-cost)。實際以電訊商確認為準。",
      },
    ],
    faqEn: [
      {
        q: "Does a student card guarantee a student price?",
        a: "No. The carrier confirms whether you qualify, what proof they need, and until when. Until then, compare a regular plan as well.",
      },
      {
        q: "Does a student offer include home broadband?",
        a: "Sometimes it is the phone only. Broadband still has its own fee, free months and term. See [mobile and broadband bundles](/guides/mobile-broadband-bundle).",
      },
      {
        q: "How do I budget it?",
        a: "Count the term, free months, rebates and prepayment, not just the first month. See [broadband total cost](/guides/broadband-total-cost). The carrier confirms the figures.",
      },
    ],
  },
  {
    slug: "elderly-broadband",
    minutes: 7,
    category: "fiber",
    seoTitle: "長者寬頻優惠點睇｜資格同月費｜齊Quote",
    h1: "長者寬頻優惠有邊間？月費幾多",
    description:
      "長者寬頻優惠唔係全港一個價。常見係要核實年齡或者身份，先至有另一個月費、簡化計劃，或者同普通計劃唔同嘅合約。呢頁唔報邊間幾多。資格、月費同操作以電訊商確認為準。",
    title: "長者寬頻優惠有邊間？月費幾多",
    excerpt: "冇一張全港長者價。先核實資格，再同普通計劃比較月費、穩定性同好唔好用。",
    titleEn: "Senior broadband offers: eligibility and the monthly fee",
    excerptEn: "There is no single senior price for the whole city. Confirm eligibility, then compare the fee, stability and how simple the service is.",
    descriptionEn:
      "A senior broadband offer is not one city-wide fee. It usually needs an age or identity check before a different monthly fee, a simpler plan, or a different contract applies. This page does not name a carrier price. Eligibility, fees and how the service works are confirmed by the carrier.",
    h1En: "Senior broadband offers: what they look like and what to confirm",
    published: "2026-10-21",
    modified: "2026-10-21",
    related: ["fiber", "is-1000m-enough", "contract-fees", "broadband-total-cost", "estate-filter", "fiber-vs-5g", "home5g"],
    plans: [{ href: "/plans?cat=broadband", label: "去光纖格價" }],
    estates: [{ href: "/estates", label: "屋苑目錄" }],
    body: [
      {
        heading: "呢頁唔報一個全港長者價",
        paragraphs: [
          "「長者寬頻幾多」要睇邊個地址、邊種樓、以及電訊商認唔認定你符合長者條件。齊Quote 呢頁**唔列出**邊間有長者價、月費係幾多。站內其他頁嘅月費係一般參考計劃，唔等於長者優惠。",
          "想對一般參考月費，用屋苑篩分樓類，見 [齊Quote 點用屋苑篩](/guides/estate-filter) 同 [光纖寬頻](/guides/fiber)。",
        ],
      },
      {
        heading: "常見係點樣嘅優惠",
        paragraphs: [
          "常見形式係：要出示年齡或者身份證明，先至用另一個月費；或者計劃功能較少、合約寫法較簡單；又或者同普通家居計劃差在免月費、合約期。每一間嘅門檻都唔同，唔好用街坊嘅例子套落自己。",
          "問清楚：幾多歲先算、要咩文件、優惠維持幾耐、完約之後恢復邊個價。計平均月費見 [寬頻合約總成本點計](/guides/broadband-total-cost)。",
        ],
      },
      {
        heading: "簡單、穩，先至好用",
        paragraphs: [
          "長者用嚟打電話、視像見家人、睇新聞，穩定同好上手通常比峰值速度重要。一般家用 1000M 多數夠，見 [1000M 夠唔夠](/guides/is-1000m-enough)。",
          "路由器放喺常用嘅廳，少啲功能、大個按鈕，往往好過一部設定繁複嘅機。光纖入到屋，通常穩過靠流動訊號；拉唔到先再問 5G 家居，見 [5G家居定光纖](/guides/fiber-vs-5g) 同 [5G 家居](/guides/home5g)。",
        ],
        table: {
          caption: "長者優惠對一次",
          headers: ["事項", "問咩"],
          rows: [
            {
              label: "資格",
              value: "年齡、文件、優惠維持幾耐。",
              href: "/guides/contract-fees",
            },
            {
              label: "月費",
              value: "同普通計劃並排，唔好只聽口頭一個數。",
              href: "/guides/broadband-total-cost",
            },
            {
              label: "好唔好用",
              value: "設定簡唔簡單、壞機點換。",
              href: "/guides/is-1000m-enough",
            },
            {
              label: "穩唔穩",
              value: "光纖入唔入到，定要靠 5G 家居。",
              href: "/guides/fiber-vs-5g",
            },
          ],
        },
      },
      {
        heading: "同普通計劃比較",
        paragraphs: [
          "長者價如果合約更長、免月費更少、或者路由器要還，總支出可以同普通計劃差不多。兩邊都計完合約期先比較。見 [月費以外](/guides/contract-fees)。",
          "未確認資格之前，當普通參考計劃睇。確認咗先用長者條件。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "This page does not quote one senior fee",
        paragraphs: [
          "“How much is senior broadband?” depends on the address, the housing type, and whether the carrier accepts the senior status. This page **does not list** which carrier has a senior price or what it is. Other fees on the site are ordinary reference plans, not a senior offer.",
          "For ordinary reference fees, filter by housing type. See [estate filter](/guides/estate-filter) and [fibre](/guides/fiber).",
        ],
      },
      {
        heading: "What these offers usually look like",
        paragraphs: [
          "Common forms: proof of age or identity before a different monthly fee; a simpler plan; or a different free-month or contract length from the regular home plan. The threshold differs. Do not reuse a neighbour’s example.",
          "Ask the age rule, the documents, how long the offer lasts, and the price after the term. See [broadband total cost](/guides/broadband-total-cost).",
        ],
      },
      {
        heading: "Simple and stable comes first",
        paragraphs: [
          "Calls, family video and news need stability and a simple setup more than peak speed. 1000M is enough for many homes. See [is 1000M enough](/guides/is-1000m-enough).",
          "Keep the router in the living room. Fibre, where it can be installed, is usually steadier than a mobile signal. If it cannot, ask about 5G home. See [fibre vs 5G home](/guides/fiber-vs-5g) and [5G home](/guides/home5g).",
        ],
        table: {
          caption: "Senior-offer checklist",
          headers: ["Item", "Ask"],
          rows: [
            {
              label: "Eligibility",
              value: "Age, documents, and how long the offer lasts.",
              href: "/guides/contract-fees",
            },
            {
              label: "Monthly fee",
              value: "Compare it with a regular plan. Do not rely on one spoken number.",
              href: "/guides/broadband-total-cost",
            },
            {
              label: "Ease of use",
              value: "How simple the setup is, and how a fault is swapped.",
              href: "/guides/is-1000m-enough",
            },
            {
              label: "Stability",
              value: "Whether fibre can be installed, or 5G home is the option.",
              href: "/guides/fiber-vs-5g",
            },
          ],
        },
      },
      {
        heading: "Compare with a regular plan",
        paragraphs: [
          "A senior price with a longer term, fewer free months, or a router that must be returned can land close to a regular plan. Count both over the term. See [install, prepay, contract](/guides/contract-fees).",
          "Until eligibility is confirmed, read the ordinary reference plans. Use the senior terms only after the carrier accepts them.",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "長者寬頻月費係幾多？",
        a: "冇一個全港價。要電訊商確認你合唔符合長者條件，同埋該地址用邊個計劃。頁上其他月費係一般參考，唔係長者優惠。",
      },
      {
        q: "邊間有長者優惠？",
        a: "呢頁唔點名、唔報價。申請時問年齡門檻、要咩文件、優惠維持幾耐。以電訊商確認為準。",
      },
      {
        q: "長者使唔使追求高速計劃？",
        a: "打電話、視像、睇新聞，穩定同簡單通常更重要。一般家用見 [1000M 夠唔夠](/guides/is-1000m-enough)。",
      },
    ],
    faqEn: [
      {
        q: "What is the senior broadband fee?",
        a: "There is no single city-wide fee. The carrier confirms senior status and which plan fits the address. Other fees on this site are ordinary references, not a senior offer.",
      },
      {
        q: "Which carrier has a senior offer?",
        a: "This page does not name one or quote a price. Ask the age rule, the documents and how long the offer lasts. The carrier confirms it.",
      },
      {
        q: "Do seniors need the fastest plan?",
        a: "Calls, video and news usually need stability and a simple setup more than peak speed. See [is 1000M enough](/guides/is-1000m-enough).",
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
