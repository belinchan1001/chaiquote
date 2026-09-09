import type { Guide } from "./guides.ts";

const DISCLAIMER =
  "以上只供參考。實際覆蓋、安裝期、月費、合約同路由器條款，一律以電訊商確認為準，唔好假設一定有線或者一定裝到。";

export const GUIDE_ARTICLES: Guide[] = [
  {
    slug: "fiber",
    minutes: 6,
    category: "fiber",
    seoTitle: "光纖寬頻攻略｜公屋居屋私樓村屋比較｜齊Quote",
    h1: "光纖寬頻攻略：先分樓類再睇月費",
    description:
      "同樣 1000M，公屋、居屋、私樓、村屋計劃通常不同。先睇樓類同參考價，安裝以電訊商確認。",
    title: "光纖寬頻攻略：先分樓類再睇月費",
    excerpt: "香港光纖唔係一張價表。先分公屋、居屋、私樓、村屋，再對參考月費。",
    titleEn: "Fibre guide: housing type first, then the fee",
    excerptEn: "Hong Kong fibre is not one price list. Sort public, HOS, private and village housing first.",
    descriptionEn: "The same 1000M plan is often priced differently by housing type. Check the type, then confirm install with the carrier.",
    h1En: "Fibre broadband: sort housing type before the monthly fee",
    related: ["fiber-vs-5g", "village", "public-vs-hos", "is-1000m-enough", "switch-broadband"],
    plans: [{ href: "/plans?cat=broadband", label: "去光纖格價" }],
    estates: [
      { href: "/estates/tin-yiu", label: "天耀邨" },
      { href: "/estates/taikoo-shing", label: "太古城" },
    ],
    body: [
      {
        heading: "香港光纖不是一張價表",
        paragraphs: [
          "同一句「1000M 光纖」，公屋、居屋、私樓、村屋見到嘅計劃同月費通常唔同。電訊商會按屋苑類型、批量合約、入線路經報價，所以齊Quote 先叫你揀樓類，而唔係丟一張全港劃一價。",
          "網上記錄嘅月費係參考。覆蓋、完工期、豁免安裝費同路由器條款，申請時先由電訊商確認。",
        ],
      },
      {
        heading: "公屋、居屋、私樓、村屋點分",
        paragraphs: [
          "公屋同埋居屋多數有指定批量價，選擇相對集中，記住用對應樓類去篩，唔好用私樓價去估公屋。想知分別可睇 [公屋同居屋有咩分別](/guides/public-vs-hos)。",
          "私樓選擇通常多啲，合約期、路由器、家居電話組合都較密。村屋係另一批計劃，月費同安裝環境都可以同屋邨差好遠，詳情見 [村屋寬頻點算](/guides/village)。",
        ],
      },
      {
        heading: "1000M 同 2500M+ 點揀",
        paragraphs: [
          "一般家庭上網、開會、一兩路 4K，1000M 已經夠用。屋企人多、經常上傳大檔、或者想預留頻寬，先考慮 2500M 或以上。速度唔等於體驗：樓內 Wi-Fi、舊路由器、牆身先影響日常手感。可再睇 [1000M 夠唔夠](/guides/is-1000m-enough)。",
        ],
      },
      {
        heading: "轉台要問清楚嘅四件事",
        paragraphs: [
          "舊約完約日、新線安裝期、可唔可以豁免安裝費、路由器係送出、包用定合約後要還。寬頻唔能夠攜號過台，要新線裝好先停舊台，先唔會斷網。步驟見 [轉寬頻點樣減少斷網](/guides/switch-broadband)。",
          DISCLAIMER,
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "返首頁輸入屋苑，或者直接開 [光纖格價](/plans?cat=broadband)。想比較免拉線方案，可睇 [光纖同 5G 家居點揀](/guides/fiber-vs-5g)。屋苑例子：[天耀邨](/estates/tin-yiu)、[太古城](/estates/taikoo-shing)。",
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Fibre is not one price list",
        paragraphs: [
          "The same 1000M fibre offer is usually different for public housing, HOS, private and village homes. Carriers quote by estate type and install path.",
          "Fees on this site are a reference. Coverage, install dates and router terms are confirmed by the carrier.",
        ],
      },
      {
        heading: "Next step",
        paragraphs: ["Open the fibre compare page or type your estate on the home page."],
      },
    ],
  },
  {
    slug: "home5g",
    minutes: 5,
    category: "home5g",
    seoTitle: "5G家居寬頻攻略｜唔拉線適唔適合｜齊Quote",
    h1: "5G 家居：免拉線，速度視現場",
    description: "5G家居用流動網絡開家用 Wi-Fi，安裝快但穩定度視訊號，部分計劃有數據上限。",
    title: "5G 家居：免拉線，速度視現場",
    excerpt: "插電路由器就用。啱未有光纖、租樓、趕時間；唔好當固定光纖替代。",
    titleEn: "5G home: no cabling, speed depends on the site",
    excerptEn: "Plug in a router. Useful when fibre is not ready. Not a guaranteed fixed line.",
    descriptionEn: "5G home uses mobile network for Wi-Fi. Install is fast, but stability depends on the signal and some plans have a data cap.",
    h1En: "5G home: no cabling, speed depends on the site",
    related: ["fiber-vs-5g", "village"],
    plans: [{ href: "/plans?cat=home5g", label: "去 5G 家居格價" }],
    estates: [
      { href: "/estates", label: "屋苑目錄" },
      { href: "/guides/village", label: "村屋點算" },
    ],
    body: [
      {
        heading: "適合邊種情況",
        paragraphs: [
          "5G 家居用流動網絡開家用 Wi-Fi，免拉線、隨插即用，安裝通常快過等師傅穿牆。適合未有光纖、租樓、趕住上網，或者等光纖期間嘅後備。",
          "報價時仍然要填屋苑或者街道，因為訊號同可唔可以申請，都視現場。唔好假設全港每個地址都一樣。",
        ],
      },
      {
        heading: "唔適合當「一定固定高速」",
        paragraphs: [
          "繁忙時間、附近用戶多、室內擺位差，速度同穩定度都會變。部分計劃有高速數據上限，用完會降速或降低優先權。若你要穩定上傳、長開鏡頭開會，優先仍然係光纖（如果裝到）。",
          "想兩邊對，見 [光纖同 5G 家居點揀](/guides/fiber-vs-5g)。村屋或者未有光纖，可一併睇 [村屋寬頻點算](/guides/village)。",
        ],
      },
      {
        heading: "點比較先唔會估錯",
        paragraphs: [
          "喺齊Quote 將 5G 家居同光纖一齊睇：月費、合約、數據上限、包定租路由器。填好地址再查核報價。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "When it fits",
        paragraphs: [
          "5G home is plug-and-play. It suits rentals, sites without fibre, and as a stopgap. Speed still depends on the local signal.",
        ],
      },
    ],
  },
  {
    slug: "mobile",
    minutes: 5,
    category: "mobile",
    seoTitle: "手機月費攻略｜4G 5G 大灣區點揀｜齊Quote",
    h1: "手機月費：先分本地、5G、大灣區",
    description: "比較本地數據、5G、大灣區同轉台注意。實際計劃入手機格價頁。",
    title: "手機月費：先分本地、5G、大灣區",
    excerpt: "本地夠用先加漫遊或者大灣區。轉台見攜號轉台攻略。",
    titleEn: "Mobile plans: local, 5G, then Greater Bay Area",
    excerptEn: "Cover local data first, then roaming or GBA. See the port-in guide to switch numbers.",
    descriptionEn: "Compare local data, 5G, Greater Bay Area usage and port-in notes. Real plans are on the mobile compare page.",
    h1En: "Mobile plans: local, 5G, then Greater Bay Area",
    related: ["port-in", "gba-mobile"],
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
          "大灣區、內地數據係額外一層：邊度用、點計額度、會唔會另收費，要睇條款，唔好當「無限中國」。詳情見 [大灣區手機計劃要注意咩](/guides/gba-mobile)。",
        ],
      },
      {
        heading: "轉台",
        paragraphs: [
          "想留舊號碼，用攜號轉台，而唔好自己提早取消舊約。流程、生效同行政費見 [攜號轉台點樣做](/guides/port-in)。",
          "實際月費、數據同轉台優惠以電訊商確認為準。下一步：[手機格價](/plans?cat=mobile)。",
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Local data first",
        paragraphs: ["Cover local 4G/5G usage first, then add Greater Bay Area or roaming if you need it."],
      },
    ],
  },
  {
    slug: "business",
    minutes: 5,
    category: "business",
    seoTitle: "商業寬頻攻略｜店舖寫字樓 1000M起｜齊Quote",
    h1: "商業寬頻：店舖同寫字樓唔好用家居計劃",
    description: "工商地址、固定IP、安裝同支援同家居不同。1000M起，報價以商用地址為準。",
    title: "商業寬頻：店舖同寫字樓唔好用家居計劃",
    excerpt: "舖址、商業登記、固定 IP 同支援時間都同家居唔同。",
    titleEn: "Business broadband: do not use a home plan for a shop",
    excerptEn: "Shop and office lines need a business address, and often a static IP.",
    descriptionEn: "Business fibre differs on address, static IP, install and support. From 1000M; quote against the commercial address.",
    h1En: "Business broadband: shops and offices should not use home plans",
    related: ["shop-broadband", "contract-fees"],
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
          "家居公屋／居屋計劃通常綁住宅地址，店舖、寫字樓、工作室要用商業寬頻。登記、合約、支援時間同安裝窗口都唔同，強行用家居價去舖頭，申請多數會被拒絕或者後期要改約。",
        ],
      },
      {
        heading: "報價前準備",
        paragraphs: [
          "準備工商地址、商業登記或舖租資料，問清楚需唔需要固定 IP、安裝期、故障支援時間。1000M 起跳係常見起步，實際上傳同穩定度先對到收銀、雲端同監控。清單見 [店舖申請商業寬頻要準備咩](/guides/shop-broadband)。",
          DISCLAIMER + " WhatsApp 查核報價可預填「商業寬頻」。下一步：[商業寬頻格價](/plans?cat=business)。",
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Do not use a home plan",
        paragraphs: ["Shops and offices need a business address and contract. Home public-housing rates usually cannot be used."],
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
    related: ["fiber", "is-1000m-enough"],
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
          "用齊Quote 篩 [公屋光纖](/plans?cat=broadband&housing=public) 同 [居屋光纖](/plans?cat=broadband&housing=hos)，你會見到同一速度之下，供應商、合約、路由器同月費可以唔同。呢個係計劃邏輯，唔係話某一個邨已經確認裝到。",
          "想對實樓，開屋苑頁，例如 [天耀邨](/estates/tin-yiu)、[天瑞邨](/estates/tin-shui)。呢啲頁只列出適用該樓類嘅參考計劃，仍然要查核報價。",
        ],
      },
      {
        heading: "點用齊Quote 揀樓類",
        paragraphs: [
          "首頁搜尋框輸入屋苑，系統會判斷公屋、居屋、私樓定村屋，再帶你去格價頁。你亦可以喺格價頁手動揀樓類。揀錯樓類，見到嘅月費就會唔啱你。",
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
    description: "轉寬頻先查舊約完約日同新線安裝期，避免空窗。唔好自行違法解約。實際安排以電訊商確認。",
    title: "轉台寬頻：舊約、安裝期、點樣銜接",
    excerpt: "先查完約日，再約新線。重疊幾日通常好過斷網。手機轉台見攜號文。",
    titleEn: "Switching fibre with less downtime",
    excerptEn: "Check the old contract end date, then book the new install. Overlap beats a gap.",
    descriptionEn: "Check the old contract and the new install date before you switch. Do not break a contract unlawfully. The carrier confirms the schedule.",
    h1En: "Switching broadband: old contract, install date, handover",
    related: ["port-in", "contract-fees", "fiber"],
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
          "本頁唔教你點樣避過合約或者虛報資料。提早終止要按你同電訊商簽嘅合約處理。",
        ],
      },
      {
        heading: "新線安裝期",
        paragraphs: [
          "問新台：幾時可以上門、要唔要管理處批准、舊樓／村屋會唔會加日。村屋有時要現場先確定路經，見 [村屋實地視察](/guides/village-onsite)。",
          "安裝當日先測到上網，先算新線可用。未測好就切舊台，屋企會無網。",
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
        heading: "Do not cancel first",
        paragraphs: ["Book and test the new line before you stop the old one. This page does not advise breaking a contract."],
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
  { id: "fiber" as const, label: "光纖寬頻", labelEn: "Fibre", slug: "fiber" },
  { id: "home5g" as const, label: "5G 家居", labelEn: "5G home", slug: "home5g" },
  { id: "mobile" as const, label: "手機月費", labelEn: "Mobile", slug: "mobile" },
  { id: "business" as const, label: "商業寬頻", labelEn: "Business", slug: "business" },
];
