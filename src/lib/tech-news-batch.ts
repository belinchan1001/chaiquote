import type { TechNewsArticle } from "./tech-news.ts";

/** Two news pieces per desk. GTA 6 already lives in TECH_NEWS_ARTICLES. */
export const TECH_NEWS_BATCH: readonly TechNewsArticle[] = [
  {
    slug: "iphone-18-handset-plan",
    category: "telecom",
    minutes: 6,
    published: "2026-09-21",
    seoTitle: "iPhone 18 上台：先對官價再拆合約｜齊Quote",
    h1: "iPhone 18 上台：機價折扣同月費要分開計",
    description:
      "iPhone 18 Pro 香港官價 HK$10,499 起，Pro Max HK$11,499 起，9 月 18 日開賣。上台優惠要分開對官價、機價折扣同合約月費，內容僅供參考，實際上台條件以電訊商確認為準。",
    excerpt: "官價已出、舖頭亦開賣。上台唔好只睇減幾多機，要一齊計合約月費同年期。",
    seoTitleEn: "iPhone 18 contracts: split handset discount and monthly fee | 齊Quote",
    h1En: "iPhone 18 contracts: price the phone and the plan separately",
    descriptionEn:
      "iPhone 18 Pro starts at HK$10,499 in Hong Kong; Pro Max at HK$11,499. On sale since 18 September. Carrier extras are confirmed in-store. This is not a ranked deal table.",
    excerptEn: "Official prices are out. A bigger handset discount is not automatically a cheaper 36-month bill.",
    bullets: [
      "Apple 香港：iPhone 18 Pro HK$10,499 起；Pro Max HK$11,499 起；9 月 18 日開賣。",
      "標準版 iPhone 18 今秋未出，摺機 iPhone Duo 10 月 23 日先賣。",
      "上台要分開三項：官價、機價折扣、合約月費同年期。",
      "電訊商折扣每日可改，成交前以門市／官網確認為準。",
    ],
    bulletsEn: [
      "Apple HK: iPhone 18 Pro from HK$10,499; Pro Max from HK$11,499; on sale 18 September.",
      "No base iPhone 18 this autumn. iPhone Duo goes on sale 23 October.",
      "Split three numbers: list price, handset discount, monthly fee and term.",
      "Carrier extras change. Confirm in-store before you sign.",
    ],
    body: [
      {
        heading: "官價先有譜",
        headingEn: "Start from Apple’s list",
        paragraphs: [
          "Apple 香港新聞稿：iPhone 18 Pro 售價 HK$10,499 起，iPhone 18 Pro Max 售價 HK$11,499 起，備 256GB、512GB、1TB、2TB。香港時間 9 月 12 日晚上 8 時起預訂，9 月 18 日起發售。顏色有黑色、銀色、冰川色同布根地紅色。",
          "今秋無標準版 iPhone 18。想等平一檔，要等官方下一輪；現貨只有 Pro、Pro Max，以及 10 月先賣嘅 iPhone Duo。",
        ],
        paragraphsEn: [
          "Apple HK lists iPhone 18 Pro from HK$10,499 and Pro Max from HK$11,499, in 256GB to 2TB. Pre-order 12 September 8 p.m. HKT; on sale 18 September.",
          "There is no base iPhone 18 this autumn. The foldable iPhone Duo is dated 23 October.",
        ],
      },
      {
        heading: "上台唔好只睇減機",
        headingEn: "A handset discount is not the bill",
        paragraphs: [
          "電訊商會用「減機」搶客。機價折扣大，唔等於 24 或者 36 個月總賬平。月費、數據、行政費、預繳、回贈月份、攜號轉台條件全部會改總數。",
          "對合約時至少問三句：官價減幾多、月費包幾多本地數據、合約幾耐同違約點計。報紙或者比較網嘅「全期總開支」只係當時快照，唔係成交價。",
        ],
        paragraphsEn: [
          "A larger handset discount can still lose to a lower monthly fee over 24–36 months. Data caps, admin fees, prepaid and port-in terms all move the total.",
          "Ask three things: list minus discount, included local data, and contract length. Third-party “lifetime cost” tables are snapshots, not a quote.",
        ],
      },
      {
        heading: "轉台客點用齊Quote",
        headingEn: "If you are porting",
        paragraphs: [
          "齊Quote 只做轉台。現用邊間，結果頁唔會再推返同一間。手機月費地址選填；填咗可以一齊問訊號。實際上台條件以電訊商確認為準。",
        ],
        paragraphsEn: [
          "齊Quote is port-in only. Your current carrier is excluded from results. Address is optional on mobile. Confirm the contract with the carrier.",
        ],
      },
    ],
    tags: ["iPhone 18", "上台", "手機月費", "轉台"],
    tagsEn: ["iPhone 18", "handset plan", "mobile", "port-in"],
    editorNote:
      "官價引自 Apple 香港新聞稿。電訊商機價折扣同月費每日可改，本文唔排名、唔寫邊間抵。成交以門市確認為準。",
    editorNoteEn:
      "List prices are from Apple HK. Carrier discounts are not ranked here. Confirm in-store.",
    related: ["iphone-18-pro-hk", "iphone-duo-hk", "read-offer-news"],
    sourceUrl: "https://www.apple.com/hk/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/",
    image: "/images/news-iphone-18-pro.jpg",
    imageAlt: "iPhone 18 Pro 四色官圖：黑、銀、冰川、布根地紅",
    imageCredit: "Apple",
  },
  {
    slug: "smartone-3g-close-2026",
    category: "telecom",
    minutes: 5,
    published: "2026-09-21",
    seoTitle: "SmarTone 3G 10月9日停｜舊機要換卡｜齊Quote",
    h1: "SmarTone 3G 10 月 9 日停：舊機、手錶、車機都要對",
    description:
      "通訊事務管理局批准 SmarTone 於 2026 年 10 月 9 日停止 3G 服務。訊號長期顯示 3G 的手機、舊 SIM、部分行車裝置會受影響。內容僅供參考，實際安排以 SmarTone 及通訊辦公布為準。",
    excerpt: "距離停網大約兩個半星期。門市可免費換 SIM。老人機同車載 3G 最容易漏。",
    seoTitleEn: "SmarTone ends 3G on 9 Oct 2026 | 齊Quote",
    h1En: "SmarTone 3G ends 9 October: check phones, watches and car kits",
    descriptionEn:
      "The Communications Authority consented to SmarTone closing 3G on 9 October 2026. Devices stuck on 3G, old SIMs and some trackers are affected. Confirm with SmarTone and OFCA.",
    excerptEn: "About two and a half weeks left. SmarTone says 4G/5G SIMs can be swapped free in store.",
    bullets: [
      "停網日：2026 年 10 月 9 日（通訊辦 7 月 24 日公布批准）。",
      "訊號長期顯示「3G」就要換卡或者換機；顯示 4G／5G／LTE 一般唔受影響。",
      "SmarTone 稱門市可免費換 4G／5G SIM。",
      "舊式行車記錄儀、定位器、家居警報亦可能用 3G，要問供應商。",
    ],
    bulletsEn: [
      "Cessation: 9 October 2026 (CA consent on 24 July).",
      "A persistent “3G” indicator means swap the SIM or the device. 4G/5G/LTE is generally unaffected.",
      "SmarTone says 4G/5G SIMs are free in store.",
      "Older dash cams, trackers and home alarms may still be 3G.",
    ],
    body: [
      {
        heading: "官方日期",
        headingEn: "The official date",
        paragraphs: [
          "通訊辦 2026 年 7 月 24 日新聞稿：通訊事務管理局批准 SmarTone 於 2026 年 10 月 9 日停止提供 3G 服務。SmarTone 專頁寫明，若到期前未更新 SIM 或者裝置，上網同日常通訊會無法繼續使用。",
          "通訊辦要求 SmarTone 維持 3G 至當日，並為受影響客戶提供換機／終止安排通知。中國移動香港已於 2025 年 6 月 30 日完成 3G 關閉；csl 同 3 香港官方停網日仍要以各商公布為準。",
        ],
        paragraphsEn: [
          "OFCA on 24 July 2026: the CA consented to SmarTone ending 3G on 9 October 2026. SmarTone’s own page says service stops if the SIM or device is not updated.",
          "CMHK closed 3G on 30 June 2025. csl and 3 Hong Kong dates are whatever those carriers publish.",
        ],
      },
      {
        heading: "邊啲人要郁",
        headingEn: "Who needs to act",
        paragraphs: [
          "睇手機訊號欄。長期「3G」：先去門市免費換 SIM；仍顯示 3G 就要換 4G／5G 手機。舊款 4G 若未開 VoLTE，通話亦可能受影響，要喺設定確認。",
          "通訊辦呼籲協助家中長者升級。車載 3G、老人機、舊智能手錶最容易漏。換機上台條件以電訊商確認為準。",
        ],
        paragraphsEn: [
          "If the status bar stays on 3G, swap the SIM first, then the handset if needed. Older 4G phones may need VoLTE enabled for voice.",
          "OFCA asks the public to help elderly relatives. Car kits and 3G watches are easy to miss. Handset offers are confirmed by the carrier.",
        ],
      },
    ],
    tags: ["SmarTone", "3G", "換 SIM", "通訊辦"],
    tagsEn: ["SmarTone", "3G", "SIM swap", "OFCA"],
    editorNote:
      "日期同安排引自通訊辦新聞稿同 SmarTone「3G 服務停止」專頁。換機折扣本文唔報價，以免過時。",
    editorNoteEn: "Dates are from OFCA and SmarTone. Handset discounts are not quoted here.",
    related: ["iphone-18-handset-plan", "read-offer-news"],
    sourceUrl: "https://www.ofca.gov.hk/en/news_info/press_releases/index_id_2401.html",
    image: "/images/news-smartone-3g.jpg",
    imageAlt: "SmarTone 商標同門市形象",
    imageCredit: "SmarTone",
  },
  {
    slug: "iphone-18-pro-hk",
    category: "phones",
    minutes: 5,
    published: "2026-09-18",
    seoTitle: "iPhone 18 Pro 香港開賣｜HK$10499起｜齊Quote",
    h1: "iPhone 18 Pro 開賣：可變光圈、A20 Pro，今秋無標準版",
    description:
      "Apple 香港：iPhone 18 Pro HK$10,499 起、Pro Max HK$11,499 起，9 月 18 日發售。今秋未公布標準版 iPhone 18。內容僅供參考，實際售價同庫存以官方及平台商店確認為準。",
    excerpt: "Pro 系列先出。主鏡頭首次可變光圈；Pro Max 影片播放標到 45 小時。標準版要再等官方。",
    seoTitleEn: "iPhone 18 Pro on sale in HK from HK$10,499 | 齊Quote",
    h1En: "iPhone 18 Pro is out: variable aperture, A20 Pro, no base model this autumn",
    descriptionEn:
      "Apple HK: iPhone 18 Pro from HK$10,499, Pro Max from HK$11,499, on sale 18 September. No base iPhone 18 this autumn. Confirm store price and stock.",
    excerptEn: "Pro first. Variable-aperture main camera; Pro Max video playback listed at 45 hours.",
    bullets: [
      "Pro HK$10,499 起；Pro Max HK$11,499 起；256GB 至 2TB。",
      "9 月 12 日晚 8 時起預訂，9 月 18 日開賣。",
      "48MP 主鏡首次可變光圈；A20 Pro；Pro 影片播放最長 36 小時，Pro Max 45 小時（Apple 標稱）。",
      "今秋無 iPhone 18 標準版。",
    ],
    bulletsEn: [
      "Pro from HK$10,499; Pro Max from HK$11,499; 256GB–2TB.",
      "Pre-order 12 September 8 p.m.; on sale 18 September.",
      "48MP Fusion main camera with variable aperture; A20 Pro; up to 36 / 45 hours video playback (Apple).",
      "No base iPhone 18 this autumn.",
    ],
    body: [
      {
        heading: "今代實際改咗咩",
        headingEn: "What actually changed",
        paragraphs: [
          "Apple 香港新聞稿：iPhone 18 Pro 同 Pro Max 用 A20 Pro，主鏡頭 4800 萬像素 Fusion，首次加入可變光圈。Apple 標稱影片播放時間：Pro 最長 36 小時，Pro Max 最長 45 小時。配色為黑色、銀色、冰川色、布根地紅色。",
          "iOS 27 已於 9 月 14 日以軟件更新推出。標準版 iPhone 18 今次發布會未公布，外電指或延至明年春季，齊Quote 只記「未公布」，唔當發售日。",
        ],
        paragraphsEn: [
          "Apple HK: A20 Pro, 48MP Fusion main camera with variable aperture, four finishes. Video playback: up to 36 hours (Pro) and 45 hours (Pro Max), Apple’s figures.",
          "iOS 27 shipped 14 September. A base iPhone 18 was not announced. We will not invent a date.",
        ],
      },
      {
        heading: "出機定零售",
        headingEn: "Retail or a plan",
        paragraphs: [
          "Apple Trade In 換購：舊 iPhone 13 或更新型號，官方寫 HK$1,300 至 HK$8,750，實際回收價以 Apple 估價頁為準。電訊商上台折扣另計，方法見「iPhone 18 上台」一篇。實際售價同庫存以官方及平台商店確認為準。",
        ],
        paragraphsEn: [
          "Apple Trade In quotes HK$1,300–HK$8,750 for iPhone 13 or later; the estimator is the source. Carrier extras are a separate story. Confirm store price.",
        ],
      },
    ],
    tags: ["iPhone 18 Pro", "A20 Pro", "出機"],
    tagsEn: ["iPhone 18 Pro", "A20 Pro", "handset"],
    editorNote: "售價、日期、續航數字引自 Apple 香港新聞稿。標準版未公布，本文唔估期。",
    editorNoteEn: "Prices and dates from Apple HK. No guessed date for the base model.",
    related: ["iphone-18-handset-plan", "iphone-duo-hk", "apple-watch-12-hk"],
    sourceUrl: "https://www.apple.com/hk/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/",
    image: "/images/news-iphone-18-pro.jpg",
    imageAlt: "iPhone 18 Pro 官方四色背面",
    imageCredit: "Apple",
  },
  {
    slug: "iphone-duo-hk",
    category: "phones",
    minutes: 5,
    published: "2026-09-21",
    seoTitle: "iPhone Duo 摺機｜10月23日開賣 HK$17499｜齊Quote",
    h1: "iPhone Duo：Apple 首部摺機，10 月 23 日香港開賣",
    description:
      "Apple 香港：iPhone Duo 售價 HK$17,499 起，10 月 16 日晚上 8 時預訂，10 月 23 日發售。內螢幕 7.6 吋、外螢幕 5.4 吋，全球版為 eSIM。內容僅供參考，實際售價同規格以官方及平台商店確認為準。",
    excerpt: "距離開賣約一個月。摺開 7.6 吋，摺埋 5.4 吋外屏。無實體 SIM 槽。",
    seoTitleEn: "iPhone Duo foldable: 23 Oct, from HK$17,499 | 齊Quote",
    h1En: "iPhone Duo: Apple’s first foldable, Hong Kong sale 23 October",
    descriptionEn:
      "Apple HK: iPhone Duo from HK$17,499. Pre-order 16 October 8 p.m. HKT; on sale 23 October. 7.6-inch inner and 5.4-inch cover. eSIM only. Confirm store price.",
    excerptEn: "About a month out. 7.6-inch inside, 5.4-inch cover, no physical SIM.",
    bullets: [
      "HK$17,499 起（256GB）；512GB／1TB／2TB 另有官價級距。",
      "10 月 16 日晚 8 時預訂，10 月 23 日開賣。",
      "內屏 7.6 吋、外屏 5.4 吋；A20 Pro；星光白／夜空。",
      "全球版純 eSIM，轉台前要問電訊商支唔支援。",
    ],
    bulletsEn: [
      "From HK$17,499 (256GB); 512GB / 1TB / 2TB listed separately.",
      "Pre-order 16 October 8 p.m.; on sale 23 October.",
      "7.6-inch inner, 5.4-inch cover; A20 Pro; star white / night sky.",
      "eSIM only — ask the carrier before you port.",
    ],
    body: [
      {
        heading: "機身同價錢",
        headingEn: "Body and price",
        paragraphs: [
          "Apple 香港新聞稿：iPhone Duo 星光白色同夜空色，5 級鈦金屬，售價 HK$17,499 起，容量 256GB、512GB、1TB、2TB。護殼同企架摺套各 HK$599。香港時間 10 月 16 日晚上 8 時起預訂，10 月 23 日起發售。",
          "Apple 商店頁：內螢幕 7.6 吋超級 Retina XDR 可摺式，外螢幕 5.4 吋。標稱外螢幕影片播放最長 44 小時，內螢幕 31 小時。用 A20 Pro，後置 4800 萬像素雙融合相機。",
        ],
        paragraphsEn: [
          "Apple HK: star white and night sky, grade-5 titanium, from HK$17,499. Case and folio HK$599 each. Pre-order 16 October 8 p.m. HKT; on sale 23 October.",
          "Store page: 7.6-inch inner foldable Super Retina XDR, 5.4-inch cover. Video playback up to 44 hours (cover) / 31 hours (inner), Apple’s figures. A20 Pro; 48MP dual Fusion rear cameras.",
        ],
      },
      {
        heading: "香港要用 eSIM",
        headingEn: "Hong Kong is eSIM-only",
        paragraphs: [
          "全球版 iPhone Duo 無實體 SIM 卡槽。轉台或者新號碼都要電訊商開到 eSIM。未確認支援就唔好先落訂。實際上台同 eSIM 安排以電訊商確認為準。",
        ],
        paragraphsEn: [
          "There is no physical SIM tray. Port-in needs an eSIM from the carrier. Do not pre-order until that is confirmed. Carrier terms apply.",
        ],
      },
    ],
    tags: ["iPhone Duo", "摺機", "eSIM"],
    tagsEn: ["iPhone Duo", "foldable", "eSIM"],
    editorNote: "售價同日期引自 Apple 香港「推出 iPhone Duo」新聞稿同商店頁。容量級距以商店結帳為準。",
    editorNoteEn: "Prices and dates from Apple HK Newsroom and the store. Capacity steps are confirmed at checkout.",
    related: ["iphone-18-pro-hk", "iphone-18-handset-plan"],
    sourceUrl: "https://www.apple.com/hk/newsroom/2026/09/apple-unveils-iphone-duo/",
    image: "/images/news-iphone-duo.jpg",
    imageAlt: "iPhone Duo 摺開內螢幕官方宣傳圖",
    imageCredit: "Apple",
  },
  {
    slug: "apple-watch-12-hk",
    category: "gadgets",
    minutes: 4,
    published: "2026-09-18",
    seoTitle: "Apple Watch Series 12 開賣｜HK$3199起｜齊Quote",
    h1: "Apple Watch Series 12：新 S11 晶片，舊錶先對兼容",
    description:
      "Apple 香港商店：Apple Watch Series 12 HK$3,199 起，Ultra 4 HK$6,499 起，與 iPhone 18 Pro 同期開賣。S11 晶片同新健康感測為今代重點。內容僅供參考，實際售價同兼容名單以官方及平台商店確認為準。",
    excerpt: "錶面改動少，晶片同感測先係重點。升級前先對 watchOS 兼容名單，舊錶唔一定跟到新系統。",
    seoTitleEn: "Apple Watch Series 12 on sale from HK$3,199 | 齊Quote",
    h1En: "Apple Watch Series 12: new S11 chip — check old-watch support first",
    descriptionEn:
      "Apple HK store: Series 12 from HK$3,199, Ultra 4 from HK$6,499. S11 chip and a new health-sensing stack. Confirm price and watchOS compatibility.",
    excerptEn: "Looks familiar. The chip and sensors are the story. Check Apple’s watchOS list before you keep an old watch.",
    bullets: [
      "Series 12 HK$3,199 起；Ultra 4 HK$6,499 起；Hermès Series 12 HK$10,499 起。",
      "同 iPhone 18 Pro 一樣，9 月 18 日零售。",
      "S11 晶片；健康感測同音訊智能係今代賣點。",
      "舊錶升唔升到 watchOS 27，要以 Apple 兼容名單為準。",
    ],
    bulletsEn: [
      "Series 12 from HK$3,199; Ultra 4 from HK$6,499; Hermès Series 12 from HK$10,499.",
      "Retail from 18 September with iPhone 18 Pro.",
      "S11 chip; health sensing and audio intelligence are the pitch.",
      "watchOS 27 support is whatever Apple’s list says.",
    ],
    body: [
      {
        heading: "香港價錢",
        headingEn: "Hong Kong pricing",
        paragraphs: [
          "Apple 香港商店：Series 12 HK$3,199 起（42／46 毫米，鋁、鈦或精密陶瓷）；Ultra 4 HK$6,499 起；Hermès Series 12 HK$10,499 起。每位顧客限購六隻 GPS 同六隻 GPS + 流動網絡。",
          "錶面無大改。官方重點係 S11 同新一代健康感測（高頻率心率背景追蹤、高血壓通知等，功能視地區同監管而定）。",
        ],
        paragraphsEn: [
          "Apple HK: Series 12 from HK$3,199 (42/46 mm); Ultra 4 from HK$6,499; Hermès Series 12 from HK$10,499. Purchase limits apply.",
          "The look is familiar. Apple’s pitch is S11 and a new health-sensing stack. Feature availability varies by region.",
        ],
      },
      {
        heading: "舊錶先對名單",
        headingEn: "Check the old watch",
        paragraphs: [
          "系統更新通常會切斷一部分舊錶。買新錶定繼續用舊錶，先打開 Apple 官方 watchOS 兼容名單，唔好憑街坊傳聞。實際功能同售價以官方及平台商店確認為準。",
        ],
        paragraphsEn: [
          "OS drops often cut older watches. Check Apple’s official compatibility list — not forum hearsay. Store price applies.",
        ],
      },
    ],
    tags: ["Apple Watch", "Series 12", "Ultra 4"],
    tagsEn: ["Apple Watch", "Series 12", "Ultra 4"],
    editorNote: "售價引自 Apple 香港商店。健康功能視地區法規，香港開唔開齊要以產品頁為準。",
    editorNoteEn: "Prices from Apple HK store. Health features depend on local regulation.",
    related: ["airpods-5-hk", "iphone-18-pro-hk"],
    sourceUrl: "https://www.apple.com/hk-zh/shop/buy-watch",
    image: "/images/news-watch-12.jpg",
    imageAlt: "Apple Watch Series 12 同 Ultra 4 官方產品圖",
    imageCredit: "Apple",
  },
  {
    slug: "airpods-5-hk",
    category: "gadgets",
    minutes: 4,
    published: "2026-09-18",
    seoTitle: "AirPods 5 香港開賣｜HK$1099起｜齊Quote",
    h1: "AirPods 5：開放式主動消噪，HK$1,099 起",
    description:
      "Apple 香港：AirPods 5 售 HK$1,099，無線充電盒版 HK$1,249，9 月 18 日發售。兩款都有主動消噪。即時翻譯要配合支援 Apple Intelligence 的 iPhone。內容僅供參考，實際售價同功能以官方及平台商店確認為準。",
    excerpt: "入門 AirPods 而家個個都有主動消噪。無線充電盒版貴 HK$150，換音量輕掃同耐用電。",
    seoTitleEn: "AirPods 5 on sale in HK from HK$1,099 | 齊Quote",
    h1En: "AirPods 5: open-ear ANC from HK$1,099",
    descriptionEn:
      "Apple HK: AirPods 5 at HK$1,099; wireless-charging case HK$1,249; on sale 18 September. Live Translation needs a supported iPhone. Confirm store price.",
    excerptEn: "Both models now include ANC. The HK$150 step adds the wireless case, volume swipe and extra battery.",
    bullets: [
      "USB-C 充電盒版 HK$1,099；無線充電盒版 HK$1,249。",
      "9 月 18 日同 iPhone 18 Pro 一齊開賣。",
      "一次充電聆聽最長 4 小時（開主動消噪，Apple 標稱）。",
      "即時翻譯要配對支援 Apple Intelligence、iOS 26 或更新嘅 iPhone。",
    ],
    bulletsEn: [
      "USB-C case HK$1,099; wireless-charging case HK$1,249.",
      "On sale 18 September with iPhone 18 Pro.",
      "Up to 4 hours listening with ANC on (Apple).",
      "Live Translation needs an Apple Intelligence iPhone on iOS 26 or later.",
    ],
    body: [
      {
        heading: "兩款差喺邊",
        headingEn: "The two SKUs",
        paragraphs: [
          "Apple 香港新聞稿同商店：AirPods 5 兩款都有主動消噪、適應性音訊、通透模式。USB-C 充電盒版 HK$1,099；無線充電盒版 HK$1,249，加音量輕掃同較長電池。Apple 標稱一次充電（開消噪）聆聽最長 4 小時。",
          "商店頁列明：無損音訊、心率感測、聽力測試同助聽功能呢代無。唔好當成 AirPods Pro 替代品。",
        ],
        paragraphsEn: [
          "Both SKUs include ANC, Adaptive Audio and Transparency. HK$1,099 USB-C case; HK$1,249 wireless case with volume swipe. Up to 4 hours with ANC, Apple’s figure.",
          "No lossless, no heart-rate sensing, no hearing-test features on this model. It is not a Pro substitute.",
        ],
      },
      {
        heading: "翻譯功能有條件",
        headingEn: "Translation is conditional",
        paragraphs: [
          "即時翻譯只喺指定語言同地區，並要配對已啟用 Apple Intelligence、運行 iOS 26 或更新版本嘅 iPhone。香港用家買之前，對商店頁語言名單。實際功能以官方及平台商店確認為準。",
        ],
        paragraphsEn: [
          "Live Translation is limited by language and region, and needs an Apple Intelligence iPhone on iOS 26 or later. Check the store page. Confirm at Apple.",
        ],
      },
    ],
    tags: ["AirPods 5", "主動消噪", "Apple"],
    tagsEn: ["AirPods 5", "ANC", "Apple"],
    editorNote: "售價同續航引自 Apple 香港新聞稿同商店。功能視系統版本同地區。",
    editorNoteEn: "Price and battery figures from Apple HK. Features depend on OS and region.",
    related: ["apple-watch-12-hk", "iphone-18-pro-hk"],
    sourceUrl: "https://www.apple.com/hk/newsroom/2026/09/apple-introduces-airpods-5-featuring-best-in-class-open-ear-active-noise-cancellation/",
    image: "/images/news-airpods-5.jpg",
    imageAlt: "AirPods 5 官方產品圖",
    imageCredit: "Apple",
  },
  {
    slug: "switch-2-hk-3700",
    category: "gaming",
    minutes: 5,
    published: "2026-09-21",
    seoTitle: "Switch 2 港版 HK$3700｜時之笛11月5日｜齊Quote",
    h1: "Switch 2 港版已加至 HK$3,700；時之笛 11 月 5 日",
    description:
      "任天堂香港：Nintendo Switch 2 建議售價由 2026 年 9 月 1 日起由 HK$3,450 調整為 HK$3,700。《薩爾達傳說 時之笛》Switch 2 版 11 月 5 日發售。內容僅供參考，實際售價同發售日以官方及平台商店確認為準。",
    excerpt: "加價已生效。Online 會籍官方話唔跟加。11 月有時之笛，之後有星之卡比。",
    seoTitleEn: "Switch 2 HK now HK$3,700; Ocarina 5 Nov | 齊Quote",
    h1En: "Switch 2 is HK$3,700 in Hong Kong; Ocarina of Time lands 5 November",
    descriptionEn:
      "Nintendo HK raised the Switch 2 SRP from HK$3,450 to HK$3,700 on 1 September 2026. Zelda: Ocarina of Time for Switch 2 is dated 5 November. Confirm store price.",
    excerptEn: "The increase is already in force. Nintendo says Switch Online pricing is unchanged.",
    bullets: [
      "主機建議售價 9 月 1 日起 HK$3,700（原 HK$3,450）。",
      "任天堂香港：Switch Online 會籍價格維持不變；已買主機唔受影響。",
      "《薩爾達傳說 時之笛》Switch 2 版 11 月 5 日發售。",
      "《星之卡比 躍然世界》暫定 2027 年春季。",
    ],
    bulletsEn: [
      "SRP HK$3,700 from 1 September (was HK$3,450).",
      "Nintendo HK: Switch Online pricing unchanged; units already sold are unaffected.",
      "The Legend of Zelda: Ocarina of Time (Switch 2) on 5 November.",
      "Kirby (躍然世界) is listed for spring 2027.",
    ],
    body: [
      {
        heading: "加價已經生效",
        headingEn: "The increase already applied",
        paragraphs: [
          "任天堂香港 2026 年 6 月 29 日公布：Switch 2 建議售價由 HK$3,450 改為 HK$3,700，香港變更日 2026 年 9 月 1 日。官方理由係市場環境變化。日本 5 月已先調價；歐美同香港一齊喺 9 月 1 日實施。",
          "官方同時寫：只調整主機建議售價，香港 Nintendo Switch Online 會籍價格維持不變，已購買主機的用戶不受影響。舖頭有無舊價庫存，要以商店為準。",
        ],
        paragraphsEn: [
          "Nintendo HK, 29 June 2026: SRP HK$3,450 → HK$3,700 from 1 September 2026. Japan moved in May; HK aligned with Europe and the US on 1 September.",
          "Nintendo says Switch Online pricing in Hong Kong is unchanged, and consoles already sold are unaffected. Street stock at the old SRP is a shop question.",
        ],
      },
      {
        heading: "年底遊戲線",
        headingEn: "What is dated next",
        paragraphs: [
          "任天堂香港支援頁：Switch 2《薩爾達傳說 時之笛》2026 年 11 月 5 日（四）發售；特別設計主機同周邊 10 月 29 日。9 月 9 日另公布《星之卡比 躍然世界》暫定 2027 年春季。實際發售同售價以官方及平台商店確認為準。",
        ],
        paragraphsEn: [
          "Nintendo HK: Ocarina of Time on Switch 2, Thursday 5 November 2026; a special hardware bundle on 29 October. Kirby is listed for spring 2027. Store dates apply.",
        ],
      },
    ],
    tags: ["Nintendo Switch 2", "薩爾達", "香港售價"],
    tagsEn: ["Nintendo Switch 2", "Zelda", "Hong Kong price"],
    editorNote:
      "主機價引自任天堂香港「建議售價變更」公告；遊戲日期引自其支援頁。街貨是否仲有舊價，本文唔猜。",
    editorNoteEn: "SRP from Nintendo HK’s June notice; game dates from its support page. We do not guess leftover stock.",
    related: ["gta-6-november-2026"],
    sourceUrl: "https://www.nintendo.com.hk/support/releasenotes/2026-06-29",
    image: "/images/news-switch-2.jpg",
    imageAlt: "Nintendo Switch 2 主機同盒裝官方圖",
    imageCredit: "Nintendo",
  },
];
