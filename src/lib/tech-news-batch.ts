import type { TechNewsArticle } from "./tech-news.ts";

/** Extra news pieces. GTA 6 still lives in TECH_NEWS_ARTICLES. */
export const TECH_NEWS_BATCH: readonly TechNewsArticle[] = [
  {
    slug: "sim-realname-offence-draft",
    category: "telecom",
    minutes: 4,
    published: "2026-10-08",
    seoTitle: "借名登記電話卡擬刑事化｜齊Quote",
    h1: "借名登記電話卡：商經局籌備列為新罪行",
    description:
      "商務及經濟發展局局長丘應樺10月7日書面答覆立法會：正籌備修例，將無合法權限或無合理辯解下不當使用他人名義登記電話智能卡列為新罪行，並降低個人儲值卡登記上限。新上限同諮詢日期未公布。內容僅供參考，以官方公布為準。",
    excerpt: "商經局局長書面答覆指，正籌備將無合法權限借名登記電話卡列為新罪行，並降低儲值卡登記上限。新上限同諮詢日期未寫死，而家唔好借證幫人登記。",
    seoTitleEn: "SIM registration in another person’s name may become an offence | 齊Quote",
    h1En: "Registering a SIM in someone else’s name: a new offence is being drafted",
    descriptionEn:
      "On 7 October the Secretary for Commerce and Economic Development told LegCo in writing that the government is drafting an offence for registering a SIM in another person’s name without lawful authority or a reasonable excuse, and will lower the personal prepaid-SIM cap. The new cap and the consultation date are not published. Official announcements prevail.",
    excerptEn: "The written reply says a new offence is being drafted for registering a SIM in someone else’s name, and the prepaid cap will fall. Neither the new cap nor the consultation date is set.",
    bullets: [
      "10月7日書面答覆：正籌備修例，將無合法權限或無合理辯解下，不當使用他人名義登記電話智能卡列為新罪行。",
      "同一答覆寫會降低個人可登記電話儲值卡上限；新上限數字未公布，呢篇唔代填。",
      "政府話適時諮詢公眾，未寫諮詢開始日。修例未生效，唔等於而家借證登記已經無事。",
      "答覆引通訊局：今年1至8月平均每月暫停約5700個可疑本地號碼，較去年同期約11400個少近半。被停要問返自己電訊商。",
    ],
    bulletsEn: [
      "The 7 October written reply: an offence is being drafted for registering a SIM in another person’s name without lawful authority or a reasonable excuse.",
      "The same reply says the personal prepaid-SIM cap will be lowered. The new number is not published, and is not filled in here.",
      "A public consultation is promised, with no start date. The bill is not in force; lending an ID to register a SIM is already a bad idea.",
      "The reply cites the Authority: about 5,700 local numbers a month were suspended in January–August, versus about 11,400 a year earlier. A paused number is a carrier question.",
    ],
    body: [
      {
        heading: "新罪行寫到邊",
        headingEn: "What the new offence actually says",
        paragraphs: [
          "商務及經濟發展局局長丘應樺10月7日書面答覆立法會質詢，香港電台同商業電台都有引述；商業電台註明來源係政府新聞處。答覆話，為打擊電訊網絡詐騙，政府正全面檢視電話智能卡實名登記制，並着手制訂針對性措施。",
          "寫死嘅方向有兩項：降低個人用戶可登記電話儲值卡嘅數量上限；以及訂立全新罪行，將在沒有合法權限或沒有合理辯解下，不當使用他人名義登記電話智能卡嘅行為刑事化。政府正籌備修例細節，會適時諮詢公眾。諮詢幾時開始、新罪行點樣定義「合理辯解」，答覆未寫。",
        ],
        paragraphsEn: [
          "On 7 October the Secretary for Commerce and Economic Development answered a LegCo question in writing. RTHK and Commercial Radio both quoted it; Commercial Radio attributes the copy to the Information Services Department. The reply says the real-name SIM regime is under review, to curb telecom fraud.",
          "Two directions are written: a lower cap on prepaid SIMs one person may register, and a new offence for registering a SIM in another person’s name without lawful authority or a reasonable excuse. Details are being drafted, with a public consultation to follow. No start date, and no definition of “reasonable excuse”, is in the reply.",
        ],
      },
      {
        heading: "上限會降，數字未公布",
        headingEn: "The cap will fall; the number is not out",
        paragraphs: [
          "答覆只寫「降低」上限，冇寫新數字。而家每人向每間電訊商可登記不多於10張儲值卡，係現行動規，唔係今次答覆改咗嘅數。新上限未公布之前，唔好當已經改到2張或者其他數。",
          "想核對自己名下有幾多張儲值卡，問返出卡嗰間電訊商，或者睇通訊辦實名登記頁。借身份證幫人登記、或者買「已實名」嘅卡，答覆未生效都唔好做。舊有法例已經可以處理虛假文書同以欺騙手段取得服務，今次係再加一條針對借名登記嘅罪。",
        ],
        paragraphsEn: [
          "The reply only says the cap will be lowered. It does not give the new number. The current rule is still up to 10 prepaid SIMs per person per carrier. That is the existing regulation, not a figure changed by this reply. Do not treat 2, or any other number, as already decided.",
          "To see how many prepaid SIMs are in your name, ask the carrier that issued them, or use the OFCA real-name page. Do not lend an identity document to register a SIM, and do not buy a card that is already registered. Existing offences on false instruments and obtaining services by deception already apply; this bill would add a specific offence.",
        ],
      },
      {
        heading: "號碼被停，問電訊商唔好估",
        headingEn: "A paused number is a carrier question",
        paragraphs: [
          "同一答覆引通訊局數字：今年1至8月，電訊商因電話或短訊模式可疑而暫停服務嘅本地號碼，平均每月約5700個，較去年同期約11400個少近半。通訊局去年12月收緊《業務守則》嘅識別準則。截至8月底，電訊商聯同警方累計攔截或暫停逾12萬個網頁連結，以及超過17000個本地及非本地號碼；以「+852」開頭嘅可疑境外來電，阻截超過890萬個。",
          "呢啲係暫停服務，唔係今次新罪行已經落實。自己個號突然打唔出，先打返所屬電訊商熱線核對，唔好轉發「全港封號」截圖。實名登記同月費計劃係兩件事，呢篇唔寫任何月費。",
        ],
        paragraphsEn: [
          "The same reply cites the Authority: in January–August, carriers suspended about 5,700 local numbers a month for suspicious call or SMS patterns, against about 11,400 a year earlier. The code of practice was tightened last December. By end-August, carriers and police had intercepted or suspended more than 120,000 links and over 17,000 local and non-local numbers, and blocked more than 8.9 million suspicious calls showing a +852 prefix.",
          "Those are service suspensions, not the new offence already in force. If your number suddenly cannot dial out, call your own carrier. Do not forward a “citywide shutdown” screenshot. Real-name registration is not a monthly fee, and none is written here.",
        ],
      },
    ],
    tags: ["實名登記", "電話卡", "電騙", "通訊辦"],
    tagsEn: ["SIM registration", "prepaid SIM", "phone fraud", "OFCA"],
    editorNote:
      "科技專區今次無鎖死嘅香港店價，唔好用三星平板開賣去填。跟到嘅新事實係10月7日書面答覆：借名登記電話卡，政府正籌備列為新罪行，儲值卡上限會降。新上限同諮詢日都未寫。\\n\\n我唔會代填「降到幾多張」，亦唔會話修例已經生效。借證幫人開卡，而家已經唔應該做；等諮詢稿出咗先算數。號碼被停，打自己電訊商，唔好當呢篇係封號名單。",
    editorNoteEn:
      "Gadgets had no locked Hong Kong store price, so this is not a tablet launch filler. The new fact is the 7 October written reply: registering a SIM in someone else’s name is being drafted as an offence, and the prepaid cap will fall. Neither the new cap nor the consultation date is written.\\n\\nThe new number is not filled in, and the bill is not treated as already in force. Lending an ID to open a SIM should already stop. A paused number is a call to your carrier, not a list in this piece.",
    related: ["sosim-esim-hk", "smartone-3g-close-2026"],
    sourceUrl: "https://news.rthk.hk/rthk/ch/component/k2/1873020-20261007.htm",
    image: "/images/news-sim-realname.jpg",
    imageAlt: "商務及經濟發展局局長丘應樺出席公開場合",
    imageCredit: "香港電台",
  },
  {
    slug: "smartone-iphone-duo-prereg-oct15",
    category: "phones",
    minutes: 4,
    published: "2026-10-05",
    seoTitle: "SmarTone Duo預先登記：10月15日截止｜齊Quote",
    h1: "SmarTone Duo預先登記：10月15日截止",
    description:
      "SmarTone官方頁寫：iPhone Duo預先登記要喺2026年10月15日23:59前完成，SmarT Pass要喺10月18日23:59前行使，並要選用指定5G計劃。Apple香港預訂日仍然係10月16日晚8時。內容僅供參考，以電訊商確認為準。",
    excerpt: "SmarTone官方頁寫iPhone Duo預先登記10月15日23:59截止，SmarT Pass要10月18日23:59前行使。指定5G計劃先得。",
    seoTitleEn: "SmarTone Duo pre-register by 15 Oct 23:59 | 齊Quote",
    h1En: "SmarTone Duo pre-register by 15 October, 23:59",
    descriptionEn:
      "SmarTone’s page says iPhone Duo pre-registration closes at 23:59 on 15 October 2026, and SmarT Pass must be exercised by 23:59 on 18 October, on a designated 5G plan. Apple HK pre-order remains 16 October at 8 p.m. Confirm with the carrier.",
    excerptEn: "SmarTone’s page sets Duo pre-registration at 23:59 on 15 October, and SmarT Pass exercise at 23:59 on 18 October. A designated 5G plan is required.",
    bullets: [
      "SmarTone官方頁：iPhone Duo預先登記要喺2026年10月15日23:59或之前完成。",
      "同一頁寫SmarT Pass要喺10月18日23:59或之前行使；持證唔等於已經留到機。",
      "頁面寫要選用指定5G計劃；現有客戶用SmarTone流動電話號碼登入先登記。",
      "Apple香港預訂仍然係10月16日晚8時、10月23日發售。電訊商截止日期可以早過官網。",
    ],
    bulletsEn: [
      "SmarTone’s page: finish iPhone Duo pre-registration by 23:59 on 15 October 2026.",
      "The same page says exercise SmarT Pass by 23:59 on 18 October. Holding a pass is not a reserved handset.",
      "It requires a designated 5G plan. Existing customers log in with their SmarTone mobile number.",
      "Apple HK pre-order is still 8 p.m. on 16 October, on sale 23 October. A carrier deadline can be earlier.",
    ],
    body: [
      {
        heading: "兩個截止日期",
        headingEn: "Two deadlines",
        paragraphs: [
          "SmarTone「iPhone 18 Pro系列預訂及iPhone Duo預先登記」頁寫：請於2026年10月15日23:59或之前完成預先登記，並於10月18日23:59或之前行使SmarT Pass。呢兩個時間係電訊商頁面寫死嘅，唔係Apple官網嘅預訂鐘。",
          "Apple香港新聞稿仍然係10月16日晚上8時起預訂、10月23日起發售。想跟SmarTone出機快證，就要跟電訊商頁，唔好以為16日晚先至開始登記。",
        ],
        paragraphsEn: [
          "SmarTone’s iPhone 18 Pro booking and iPhone Duo pre-registration page says finish pre-registration by 23:59 on 15 October 2026, and exercise SmarT Pass by 23:59 on 18 October. Those times are on the carrier page, not Apple’s pre-order clock.",
          "Apple HK still lists pre-order from 8 p.m. on 16 October and sale from 23 October. A SmarT Pass path follows the carrier page, not an assumption that registration starts on the 16th.",
        ],
      },
      {
        heading: "邊個可以登記",
        headingEn: "Who can register",
        paragraphs: [
          "同一頁寫：選用SmarTone指定5G計劃，就可以預訂iPhone 18 Pro系列或預先登記iPhone Duo。現有客戶要輸入SmarTone流動電話號碼，收取驗證碼先登入。頁面冇寫死月費級數同機價，呢度唔代填。",
          "SmarT Pass條款頁寫，每張證只可預先訂購一部旗艦機，不可轉讓；持證唔代表成功留機。一般行使期係旗艦機開始接受預訂後48小時，但條款寫行使期可因供貨而縮短或取消。今次活動頁寫到10月18日23:59，以活動頁同門市確認為準。",
        ],
        paragraphsEn: [
          "The same page says a designated SmarTone 5G plan can book an iPhone 18 Pro or pre-register an iPhone Duo. Existing customers enter a SmarTone mobile number and a verification code. The page does not lock a monthly fee or a handset price, so none is filled in here.",
          "SmarT Pass terms say each pass pre-orders one flagship and is not transferable. Holding one is not a successful reservation. The usual exercise window is 48 hours after pre-order opens, and the terms say that window can be shortened or cancelled. This campaign page writes 23:59 on 18 October; confirm on the page or in store.",
        ],
      },
      {
        heading: "同Apple官網點分開",
        headingEn: "Split it from Apple’s store",
        paragraphs: [
          "機身規格同官價已經寫過：HK$17,499起、內屏7.6吋、外屏5.4吋、全球版純eSIM、10月23日開賣。今次新事實只係SmarTone渠道嘅登記同行使截止。",
          "未有SmarTone號碼、又未選指定5G計劃，呢張預先登記頁登入唔到。可以等Apple官網10月16日晚8時，或者其他電訊商自己嘅登記頁。成交前再對一次截止時間，頁面可以改。",
        ],
        paragraphsEn: [
          "Specs and the official price are already on the site: from HK$17,499, 7.6-inch inner screen, 5.4-inch cover, eSIM only, on sale 23 October. The new fact is only SmarTone’s registration and exercise cutoff.",
          "Without a SmarTone number and a designated 5G plan, this pre-registration page will not log you in. Apple’s store opens at 8 p.m. on 16 October, and other carriers may have their own pages. Check the cutoff again before you commit; the page can change.",
        ],
      },
    ],
    tags: ["iPhone Duo", "SmarTone", "SmarT Pass", "預先登記"],
    tagsEn: ["iPhone Duo", "SmarTone", "SmarT Pass", "pre-register"],
    editorNote:
      "手機專區今次唔係再講一次10月23日開賣。新事實係SmarTone活動頁寫死兩個鐘：10月15日23:59前完成預先登記，10月18日23:59前行使SmarT Pass。Apple官網預訂仍然係16日晚8時。\n\n我唔會喺度填月費或者話邊個折扣最大。頁面只寫指定5G計劃，無機價表。持證唔等於留到機，條款亦寫行使期可以縮。有SmarTone號碼先登入對一次；冇就等官網或其他電訊商頁。",
    editorNoteEn:
      "This is not another reminder that sale day is 23 October. The new fact is two clocks on SmarTone’s page: pre-register by 23:59 on 15 October, and exercise SmarT Pass by 23:59 on 18 October. Apple’s pre-order is still 8 p.m. on the 16th.\n\nNo monthly fee is filled in, and no discount is ranked. The page only says a designated 5G plan. A pass is not a reserved phone, and the terms say the exercise window can shrink. Log in if you have a SmarTone number; otherwise wait for Apple or another carrier page.",
    related: ["iphone-duo-hk", "iphone-18-handset-plan"],
    sourceUrl: "https://www.smartone.com/hk/260910_SSP_Pre-reg_Priority1_IN_mms_tc",
    image: "/images/news-iphone-duo.jpg",
    imageAlt: "Apple官方iPhone Duo摺開內螢幕宣傳圖",
    imageCredit: "Apple",
  },
  {
    slug: "sosim-esim-hk",
    category: "telecom",
    minutes: 4,
    published: "2026-10-02",
    seoTitle: "SoSIM全面支援eSIM：新卡轉卡免手續費｜齊Quote",
    h1: "SoSIM全面支援eSIM：新卡轉卡免手續費",
    description:
      "和記電訊香港2026年9月24日新聞稿：SoSIM現已全面支援eSIM。全新主卡可免費將實體SIM轉eSIM；現有帳戶轉換手續費新聞稿寫HK$28，eSIM轉實體卡HK$48。額外50GB香港數據至11月30日。內容僅供參考，以電訊商確認為準。",
    excerpt: "新聞稿寫SoSIM已全面支援eSIM。全新主卡可免費將實體卡轉eSIM，現有轉換手續費寫HK$28。額外50GB優惠至11月30日，啟用前對App。",
    seoTitleEn: "SoSIM now supports eSIM: new cards convert free | 齊Quote",
    h1En: "SoSIM now supports eSIM: new cards convert without a fee",
    descriptionEn:
      "Hutchison Telecom Hong Kong’s 24 September 2026 release says SoSIM now supports eSIM. New main-card customers can convert a physical SIM to eSIM free; an existing conversion is listed at HK$28, and eSIM back to a physical SIM at HK$48. An extra 50GB runs to 30 November. Confirm with the carrier.",
    excerptEn: "The release says SoSIM now supports eSIM. New main cards convert free; existing conversions are listed at HK$28. Extra 50GB runs to 30 November.",
    bullets: [
      "和記電訊香港9月24日新聞稿：SoSIM現已全面支援eSIM，新客可於網上商店直接選購eSIM。",
      "全新主卡可獲免費實體卡轉eSIM優惠券；現有帳戶轉換，新聞稿寫手續費HK$28，eSIM轉回實體卡HK$48。",
      "即日起至11月30日，成功啟用SoSIM主卡可獲額外50GB香港數據；選50GB預設組合，首30日新聞稿寫共100GB。",
      "新聞稿寫HK$33可揀30日50GB香港數據，或5日亞太外遊數據。手機要支援eSIM，啟用前對SoSIM App。",
    ],
    bulletsEn: [
      "Hutchison’s 24 September release: SoSIM now supports eSIM, and new customers can buy an eSIM in the online store.",
      "A new main card includes a free physical-to-eSIM voucher. Existing conversions are listed at HK$28; eSIM back to a physical SIM at HK$48.",
      "Through 30 November, activating a SoSIM main card adds 50GB of Hong Kong data. A 50GB starter is written as 100GB for the first 30 days.",
      "The release lists HK$33 for 30-day 50GB Hong Kong data, or 5-day Asia-Pacific roaming data. The phone must support eSIM.",
    ],
    body: [
      {
        heading: "邊個可以轉eSIM",
        headingEn: "Who can move to eSIM",
        paragraphs: [
          "和記電訊香港9月24日新聞稿寫：旗下儲值卡品牌SoSIM現已全面支援eSIM。換一部支援eSIM嘅手機，唔使插實體卡，最快3分鐘掃碼安裝。新客可以喺SoSIM網上商店直接選購eSIM。",
          "呢個係儲值卡品牌嘅新渠道，唔等於3香港月費計劃自動有同一套轉換費。你用緊邊張卡、部機支唔支援eSIM，以SoSIM App同手機規格頁為準。",
        ],
        paragraphsEn: [
          "Hutchison’s 24 September release says SoSIM now supports eSIM. On a compatible phone, setup is a QR code, listed as about three minutes. New customers can buy an eSIM in the SoSIM online store.",
          "This is the prepaid brand, not an automatic rule for a 3HK monthly plan. Check the SoSIM app and the phone’s eSIM support.",
        ],
      },
      {
        heading: "手續費同新卡優惠券",
        headingEn: "Fees and the new-card voucher",
        paragraphs: [
          "新聞稿分開兩種情況。全新SoSIM主卡客戶，啟用後可喺帳戶攞免費實體SIM轉eSIM電子優惠券，用App自助辦，唔使行門市。現有帳戶自行將實體卡轉eSIM，新聞稿寫手續費HK$28；eSIM轉回實體卡，寫HK$48。",
          "免費券只寫畀全新主卡。舊卡會唔會都免，新聞稿冇寫死，唔好當人人免手續費。條款以SoSIM帳戶頁為準。",
        ],
        paragraphsEn: [
          "The release splits two cases. A new SoSIM main card gets a free physical-to-eSIM voucher in the account, done in the app. An existing conversion is listed at HK$28, and eSIM back to a physical SIM at HK$48.",
          "The free voucher is written for new main cards only. Do not assume every existing SIM converts free.",
        ],
      },
      {
        heading: "11月30日前額外數據點核對",
        headingEn: "The extra data runs to 30 November",
        paragraphs: [
          "由即日起至2026年11月30日，成功啟用SoSIM主卡可獲額外50GB香港數據。新聞稿寫：如果預設組合本身係50GB香港數據，首30日可享共100GB。呢個係啟用贈送，唔係每月固定加額。",
          "同一段寫HK$33可以揀30日50GB香港數據，或者5日亞太外遊數據，再加上面嗰份限時額外數據。外遊日數同本地GB唔好撈亂。實際組合、剩餘日數同會唔會另收，以電訊商確認為準。",
        ],
        paragraphsEn: [
          "Through 30 November 2026, activating a SoSIM main card adds 50GB of Hong Kong data. A 50GB starter is written as 100GB for the first 30 days. That is an activation extra, not a standing monthly top-up.",
          "The same section lists HK$33 for 30-day 50GB Hong Kong data, or 5-day Asia-Pacific roaming data, plus that limited extra. Do not mix roaming days with local gigabytes. Confirm the live bundle in the app.",
        ],
      },
    ],
    tags: ["SoSIM", "eSIM", "3香港", "儲值卡"],
    tagsEn: ["SoSIM", "eSIM", "3HK", "prepaid"],
    editorNote:
      "手機專區今次無新SKU。iPhone Duo預購日已經寫過，唔好再講一次10月23日。跟到嘅新事實係SoSIM：9月24日新聞稿先寫全面支援eSIM，新卡轉卡有免費券，舊卡轉換先至寫HK$28。\n\n我唔會順手叫佢至抵。HK$33係新聞稿列出嘅兩款組合價，唔係月費比較。想轉，先對部機支唔支援eSIM，再開SoSIM App睇張券仲喺唔喺度。額外50GB寫到11月30日，過咗期就當冇。",
    editorNoteEn:
      "Phones had no new SKU. The iPhone Duo date is already on the site. The new fact is SoSIM: the 24 September release is the first full eSIM note, with a free voucher on new cards and HK$28 on an existing conversion.\n\nHK$33 is a listed bundle price, not a plan ranking. Check eSIM support on the phone, then the voucher in the SoSIM app. The extra 50GB is dated through 30 November.",
    related: ["hkt-ai-data-waiver-oct7", "smartone-3g-close-2026"],
    sourceUrl: "https://www.hthkh.com/tc/media/press.php?prid=/press/cp260924",
    image: "/images/news-telecom.jpg",
    imageAlt: "電訊與上網優惠專區配圖",
    imageCredit: "和記電訊香港新聞稿",
  },
  {
    slug: "hkt-ai-data-waiver-oct7",
    category: "telecom",
    minutes: 4,
    published: "2026-10-01",
    seoTitle: "10月7日起用HKT.AI：本地數據可豁免｜齊Quote",
    h1: "10月7日起：1O1O同csl用HKT.AI免本地數據",
    description:
      "香港電訊2026年9月17日新聞稿註腳寫明：由10月7日起，1O1O、csl同Club Sim月費客戶經註冊SIM喺香港用HKT.AI，可豁免本地流動數據。外遊另計。內容僅供參考，以電訊商確認為準。",
    excerpt: "新聞稿註腳寫10月7日起，1O1O、csl同Club Sim月費客戶喺香港用HKT.AI，註冊SIM本地數據可豁免。外遊另計，平台上旬先啟用。",
    seoTitleEn: "From 7 Oct: HKT.AI local data waiver on 1O1O and csl | 齊Quote",
    h1En: "From 7 October: HKT.AI local data waived on 1O1O and csl",
    descriptionEn:
      "HKT’s 17 September 2026 release says that from 7 October, 1O1O, csl and Club Sim monthly users can have local data waived when using HKT.AI in Hong Kong on a registered SIM. Roaming is separate. Confirm with the carrier.",
    excerptEn: "The footnote dates 7 October. 1O1O, csl and Club Sim monthly SIMs can skip local data for HKT.AI in Hong Kong. Roaming is extra.",
    bullets: [
      "由2026年10月7日起：1O1O、csl、Club Sim月費客戶，用註冊SIM喺香港用HKT.AI，本地流動數據可豁免。",
      "同一註腳寫：外遊用HKT.AI，可能要另付漫遊數據費。",
      "平台本身寫10月上旬啟用，細節由HKT另公布；唔好當10月7日已經全日開放。",
      "10月22日或之前申請指定計劃，可多一次過18,000 credits；90日有效，12月31日前發放。",
    ],
    bulletsEn: [
      "From 7 October 2026: 1O1O, csl and Club Sim monthly users on a registered SIM can have local data waived for HKT.AI in Hong Kong.",
      "The same footnote says overseas use may still incur roaming data charges.",
      "The platform itself is dated early October, with details to follow. 7 October is the waiver date, not a full launch clock.",
      "Specified plans applied for on or before 22 October get an extra one-time 18,000 credits, valid 90 days, issued by 31 December.",
    ],
    body: [
      {
        heading: "10月7日豁免邊啲人",
        headingEn: "Who the 7 October waiver covers",
        paragraphs: [
          "香港電訊9月17日新聞稿註腳(c)寫死：由2026年10月7日起，所有1O1O、csl、Club Sim月費服務計劃用戶，透過註冊SIM卡提供嘅本地流動數據，可豁免喺香港地區內使用HKT.AI時所產生嘅流動數據用量。",
          "呢句唔限新簽「HKT.AI全能助手計劃」。現有月費客戶都包，但要用返註冊咗嘅SIM。網頁版、第二張卡、或者朋友分享熱點，新聞稿冇寫可以一併豁免，成交或使用前對[1O1O](https://1010.com.hk/iphone-hktai)同[csl](https://www.hkcsl.com/zh_HK/hkt-ai)條款。",
        ],
        paragraphsEn: [
          "Footnote (c) of HKT’s 17 September release dates the waiver to 7 October 2026 for all 1O1O, csl and Club Sim monthly plans, on local data from the registered SIM, while using HKT.AI in Hong Kong.",
          "It is not limited to a new HKT.AI Super Assistants plan. A second SIM or a shared hotspot is not named. Check the 1O1O and csl terms before you rely on it.",
        ],
      },
      {
        heading: "外遊同credits唔好撈亂",
        headingEn: "Roaming and credits are separate",
        paragraphs: [
          "同一註腳寫：如果喺海外用HKT.AI，或需另行支付漫遊數據費。免本地數據唔等於漫遊都免。",
          "高達648,000 HKT.AI Credits係另一條註腳(d)：要選用包括每月18,000 credits嘅指定1O1O、csl或網上行月費計劃，而且簽36個月。唔係所有月費客戶自動有呢個額。生成張數只係參考，註腳(e)寫會因使用模式而變。",
        ],
        paragraphsEn: [
          "The same footnote says overseas HKT.AI use may still be charged as roaming data. A local waiver is not a roaming waiver.",
          "Up to 648,000 credits is footnote (d): a specified 1O1O, csl or Netvigator plan that includes 18,000 credits a month, on a 36-month term. It is not automatic for every monthly user. Generation counts are illustrative.",
        ],
      },
      {
        heading: "想用之前對邊度",
        headingEn: "Where to check before you use it",
        paragraphs: [
          "註腳(b)寫HKT.AI服務將於2026年10月上旬正式啟用，詳情由HKT另行公布。10月7日係數據豁免生效日，平台開關以當日官網為準。條款頁：[1O1O](https://1010.com.hk/iphone-hktai)、[csl](https://www.hkcsl.com/zh_HK/hkt-ai)、[網上行](https://www.netvigator.com/zh_HK/tnc-hktai-monthly-service-plan)。",
          "早鳥係另一個日子：2026年10月22日或之前成功選用指定計劃，可享額外一次過18,000 credits，有效期90日，將於12月31日前發放，到時有短訊。呢個係credits，唔係月費減免。機價折扣同合約月費仍然要分開問門市，以電訊商確認為準。",
        ],
        paragraphsEn: [
          "Footnote (b) says HKT.AI turns on in early October, with details to follow. 7 October is the data-waiver date. Confirm the live page on 1O1O, csl or Netvigator.",
          "The early-bird date is separate: specified plans taken on or before 22 October get an extra 18,000 credits, valid 90 days, issued by 31 December with an SMS. That is credits, not a bill cut. Handset discounts and monthly fees still have to be priced in-store.",
        ],
      },
    ],
    tags: ["HKT.AI", "1O1O", "csl", "Club Sim", "本地數據"],
    tagsEn: ["HKT.AI", "1O1O", "csl", "Club Sim", "local data"],
    editorNote:
      "呢則唔係再講一次iPhone減幾多。減機嗰頁已經寫過：折扣同月費要分開計。今次新事實係註腳入面個日子——10月7日，現有1O1O、csl、Club Sim月費客戶喺香港用HKT.AI，本地數據可以豁免。\n\n我唔會順手寫一個「全能助手月費」。新聞稿主文冇把月費寫死，credits又要指定計劃加36個月先至有上限。外遊照計漫遊。想用，10月7日對返自己SIM係咪註冊卡，再打開官網睇平台開未開。",
    editorNoteEn:
      "This is not another handset-discount recap. The new fact is the footnote date: from 7 October, existing 1O1O, csl and Club Sim monthly users can have local data waived for HKT.AI in Hong Kong.\n\nI am not inventing a plan fee. The release does not lock a monthly price in the main text, and the credit cap needs a specified plan plus 36 months. Roaming is still roaming. On the day, check that the SIM is the registered one and that the platform is actually on.",
    related: ["iphone-18-handset-plan", "cmhk-mid-autumn-2026"],
    sourceUrl: "https://www.hkt.com/about-hkt/press-release/iphone-duo-iphone-18-preorders-hkt/",
  },
  {
    slug: "minecraft-dungeons-2-sep29",
    category: "gaming",
    minutes: 4,
    published: "2026-09-28",
    seoTitle: "Dungeons II 9月29日：商店寫HK$199｜齊Quote",
    h1: "Dungeons II 9月29日：商店寫$199",
    description:
      "Xbox 香港商店同任天堂香港商店：《Minecraft Dungeons II》發售日寫 2026 年 9 月 29 日。標準版 HK$199、豪華版 HK$349。Xbox 香港頁寫預購贈品至 9 月 28 日。內容僅供參考，實際售價、平台同檔期以官方及平台商店確認為準。",
    excerpt: "Xbox同任天堂香港商店寫 9 月 29 日。標準版 HK$199、豪華版 HK$349。預購贈品官方寫到 9 月 28 日。",
    seoTitleEn: "Dungeons II on 29 Sep: stores list HK$199 | 齊Quote",
    h1En: "Dungeons II on 29 September: stores list $199",
    descriptionEn:
      "Xbox Hong Kong and Nintendo HK storefronts date Minecraft Dungeons II to 29 September 2026. Standard HK$199, Deluxe HK$349. The Xbox HK page dates the pre-order extra through 28 September. Confirm price and platform in the store.",
    excerptEn: "Both HK stores date 29 September. Standard HK$199, Deluxe HK$349. Pre-order extras are dated through 28 September.",
    bullets: [
      "Xbox 香港商店：發售日 2026 年 9 月 29 日；標準版 HK$199、豪華版 HK$349。",
      "任天堂香港商店同一日：標準版 HKD 199、豪華版 HKD 349。",
      "Xbox 香港頁寫：預購可獲兩款英雄外觀、扭曲斗篷同扭曲小雞寵物，優惠至 9 月 28 日。",
      "Xbox 頁另寫 Game Pass 上市當日可玩；月費同庫存以商店當頁為準。",
    ],
    bulletsEn: [
      "Xbox HK store: 29 September 2026. Standard HK$199, Deluxe HK$349.",
      "Nintendo HK store, same date: HKD 199 and HKD 349.",
      "Xbox HK page: pre-order extras through 28 September — two hero skins, Twisted cape, Twisted chicken pet.",
      "The same page says Game Pass on day one. The fee is whatever the store shows.",
    ],
    body: [
      {
        heading: "兩個香港商店都寫死日期",
        headingEn: "Both Hong Kong stores print the date",
        paragraphs: [
          "Xbox 香港產品頁（《Minecraft Dungeons II》）寫發售日 2026 年 9 月 29 日，標準版 HK$199、豪華版 HK$349，平台寫 Xbox Series X|S 同 Windows。任天堂香港商店同一日列出標準版 HKD 199、豪華版 HKD 349。",
          "呢個係商店頁寫死嘅發售日同標價，唔係討論區傳聞。其他主機有無上架、盒裝舖頭有無貨，要以當時商店為準，齊Quote 唔代宣布全平台同時有實體。",
        ],
        paragraphsEn: [
          "The Xbox Hong Kong product page dates Minecraft Dungeons II to 29 September 2026 at HK$199 standard and HK$349 Deluxe, on Xbox Series X|S and Windows. Nintendo’s Hong Kong store lists the same date at HKD 199 and HKD 349.",
          "Those figures are on the storefronts. Whether another console shop or a boxed copy exists is whatever that shop shows. We will not invent a full platform list.",
        ],
      },
      {
        heading: "預購贈品寫到今日",
        headingEn: "The pre-order extra is dated today",
        paragraphs: [
          "Xbox 香港頁寫：立即預購可獲兩個英雄外觀、扭曲斗篷同扭曲小雞寵物；優惠將於 2026 年 9 月 28 日到期，每個帳戶僅限一次。想攞呢批贈品，要喺商店截止前完成預購，過咗今日以當時頁面為準。",
          "豪華版頁面寫包標準版之外另有後續 DLC 同額外外觀。標準版同豪華版係兩張單，唔好當買標準版就自動有豪華內容。實際包含項目以結帳頁為準。",
        ],
        paragraphsEn: [
          "Xbox HK: pre-order for two hero skins, the Twisted cape and the Twisted chicken pet, through 28 September 2026, once per account. After today, use whatever the page then shows.",
          "Deluxe is a separate ticket with later DLC and extra cosmetics. The checkout page is the list that counts.",
        ],
      },
    ],
    tags: ["Minecraft", "Xbox", "Nintendo", "香港商店"],
    tagsEn: ["Minecraft", "Xbox", "Nintendo", "Hong Kong store"],
    editorNote:
      "唔係等 GTA 6，亦唔係重複 Sports Resort 嗰個 10 月 22 日。呢篇只寫兩個香港商店而家寫死嘅 9 月 29 日、兩個標價，同 Xbox 頁寫到今日嘅預購贈品。\n\n有 Game Pass 嘅人先對訂閱頁，唔好估月費。想攞預購贈品就今日對 Xbox 商店；淨係等上市，就 29 日再對一次價錢同平台。",
    editorNoteEn:
      "This is not another GTA 6 hold. It is the 29 September date and the two ticket prices printed on the Hong Kong stores, plus the Xbox pre-order extra dated today.\n\nGame Pass users should open the subscription page. Do not invent a monthly fee. Pre-order extras need the Xbox store today. Everyone else can wait for the 29th and read the price again.",
    related: ["switch-sports-resort-oct22", "switch-2-hk-3700", "gta-6-november-2026"],
    sourceUrl: "https://www.xbox.com/zh-HK/games/minecraft-dungeons-ii",
    image: "/images/news-gaming.jpg",
    imageAlt: "電玩娛樂情報專區配圖",
    imageCredit: "Xbox / Nintendo Hong Kong storefronts",
  },
  {
    slug: "sony-hello-kitty-xperia-hk",
    category: "phones",
    minutes: 5,
    published: "2026-09-24",
    seoTitle: "Sony Store限定：Xperia Hello Kitty套裝｜齊Quote",
    h1: "Sony Store限定：Xperia Kitty套裝",
    description:
      "Sony 香港官方：Xperia 10 VIII Hello Kitty 聯乘套裝 HK$5,399，只限 Sony Store 門市、網上專門店同銷售熱線。2026 年 9 月 8 日起發售，數量有限。內容僅供參考，實際售價同庫存以官方及平台商店確認為準。",
    excerpt: "官方寫 HK$5,399，Sony Store 獨家。套裝送斜揹袋同帆布袋。機身無 Kitty 圖案，先對舖頭庫存。",
    seoTitleEn: "Sony Store exclusive: Xperia Hello Kitty bundle | 齊Quote",
    h1En: "Sony Store only: Xperia 10 VIII Hello Kitty bundle",
    descriptionEn:
      "Sony Hong Kong lists the Xperia 10 VIII Hello Kitty bundle at HK$5,399, exclusive to Sony Store shops, the online store and the sales hotline from 8 September 2026. Confirm stock and price in store.",
    excerptEn: "Listed at HK$5,399, Sony Store exclusive. Bags included; the phone itself is not printed Hello Kitty.",
    bullets: [
      "Sony 香港官方：Xperia 10 VIII · Hello Kitty 套裝 HK$5,399。",
      "9 月 8 日起於 Sony Store 專門店、網上專門店同熱線 2833-5129 發售；數量有限，售完即止。",
      "套裝附 Hello Kitty 輕便斜揹袋同帆布袋；官方更正帆布袋為黑色。",
      "耳機聯乘套裝另計：WH-1000XM6 HK$3,249、WH-CH730N HK$1,249、WH-CH530 HK$699。",
    ],
    bulletsEn: [
      "Sony HK: Xperia 10 VIII Hello Kitty set HK$5,399.",
      "On sale from 8 September at Sony Stores, sony.com.hk/store and hotline 2833-5129. Limited stock.",
      "Includes a sling and a tote. Sony later said the tote is black.",
      "Headphone sets are listed separately: XM6 HK$3,249, CH730N HK$1,249, CH530 HK$699.",
    ],
    body: [
      {
        heading: "邊度買、幾多錢",
        headingEn: "Where and how much",
        paragraphs: [
          "Sony 香港官方帳號同專頁寫：首度同 Sanrio Hello Kitty 聯乘，推出 4 款 Sony Store 限量套裝。手機套裝係 Xperia 10 VIII，官方標價 HK$5,399。發售渠道寫明 Sony Store 專門店、Sony Store 網上專門店（www.sony.com.hk/store）同銷售熱線（852）2833-5129，由 2026 年 9 月 8 日起，數量有限。",
          "銅鑼灣希慎同旺角朗豪坊 Sony Store 另有打卡點；社交媒體比賽官方寫 9 月 8 日至 30 日。比賽同套裝係兩件事，庫存以舖頭為準。",
        ],
        paragraphsEn: [
          "Sony Hong Kong lists four Sony Store-only Hello Kitty sets. The phone set is Xperia 10 VIII at HK$5,399, from 8 September, via shops, sony.com.hk/store and 2833-5129.",
          "Photo spots are at the Hysan Place and Langham Place stores. A social contest runs 8–30 September. That is separate from stock.",
        ],
      },
      {
        heading: "套裝有咩、機身有冇圖案",
        headingEn: "What is in the box",
        paragraphs: [
          "手機套裝包括 Xperia 10 VIII、Hello Kitty 輕便斜揹袋同帆布袋。官方後補更正：聯乘帆布袋均為黑色。報道同台灣對照頁都寫機身本身無 Hello Kitty 印刷，圖案喺袋。買之前問舖頭睇實物。",
          "三款耳機套裝官方標價：WH-1000XM6 HK$3,249、WH-CH730N HK$1,249、WH-CH530 HK$699，各附收納袋同帆布袋。耳機價錢唔好同手機套裝混用。實際售價同庫存以官方及平台商店確認為準。",
        ],
        paragraphsEn: [
          "The phone set is the handset plus a sling and a tote. Sony later said the tote is black. Coverage matches Taiwan copy: the phone itself is not printed Hello Kitty.",
          "Headphone sets are listed at HK$3,249 / HK$1,249 / HK$699. Do not mix those figures with the phone bundle. Confirm in store.",
        ],
      },
    ],
    tags: ["Sony", "Xperia 10 VIII", "Hello Kitty", "Sony Store"],
    tagsEn: ["Sony", "Xperia 10 VIII", "Hello Kitty", "Sony Store"],
    editorNote:
      "呢個唔係新旗艦發布，係 Sony Store 獨家袋。HK$5,399 買嘅係一部中階 Xperia 加兩隻袋，唔係部機印咗 Kitty。鍾意袋先去希慎或者朗豪坊問有冇貨；唔鍾意袋，官價對你冇意義。\n\n熱線同網店都寫得到。週末打卡位會逼，庫存唔保證。我哋唔比較「抵唔抵」，只記官方渠道同標價。",
    editorNoteEn:
      "This is a Sony Store bag exclusive, not a flagship launch. HK$5,399 is a mid-range Xperia plus two bags. The phone is not printed Hello Kitty.\n\nGo to Hysan or Langham Place if you want the bags. The hotline and web store are listed. We are not ranking value.",
    related: ["iphone-duo-hk", "iphone-18-pro-hk", "airpods-5-hk"],
    sourceUrl: "https://www.sony.com.hk/campaigns/hellosony/headphones.jsp",
    image: "/images/news-phones.jpg",
    imageAlt: "旗艦手機與硬件專區配圖",
    imageCredit: "Sony Hong Kong",
  },
  {
    slug: "apple-education-sep24-hk",
    category: "gadgets",
    minutes: 4,
    published: "2026-09-24",
    seoTitle: "Apple教育優惠9月24日止：買Mac或iPad｜齊Quote",
    h1: "Apple教育優惠今日止：買Mac或iPad先對",
    description:
      "Apple 香港網上商店寫明：買 Mac 或 iPad 可享教育優惠，並可獲 HK$800 至 HK$1,200 Apple Store 禮品卡，優惠至 2026 年 9 月 24 日止。內容僅供參考，資格同禮品卡金額以官方及平台商店確認為準。",
    excerpt: "官方寫到 9 月 24 日。對象係 Mac 或 iPad，唔係手機。資格同禮品卡金額要對教育商店頁。",
    seoTitleEn: "Apple HK education offer ends 24 Sep | 齊Quote",
    h1En: "Apple education pricing ends today: Mac or iPad only",
    descriptionEn:
      "Apple’s Hong Kong store: education pricing on Mac or iPad, with an HK$800–HK$1,200 Apple Store Gift Card, through 24 September 2026. Eligibility is confirmed on the education store.",
    excerptEn: "Dated 24 September. Mac or iPad, not iPhone. Gift-card amount depends on the education store page.",
    bullets: [
      "Apple 香港商店：優惠至 9 月 24 日止。",
      "對象寫明買 Mac 或 iPad；禮品卡官方寫 HK$800 至 HK$1,200。",
      "要走教育商店核對資格，唔係普通結帳自動減。",
      "iPhone、錶、耳機今頁無寫入呢個教育檔期。",
    ],
    bulletsEn: [
      "Apple HK store: offer ends 24 September.",
      "Mac or iPad. Gift card worded HK$800–HK$1,200.",
      "Use the education storefront. Ordinary checkout is not the same path.",
      "iPhone, Watch and AirPods are not named in this banner.",
    ],
    body: [
      {
        heading: "官方寫到今日",
        headingEn: "The store dates it today",
        paragraphs: [
          "Apple 香港網上商店頁頭寫：把握最後時機，買 Mac 或 iPad 可享教育優惠，並可獲最高達 HK$1,200 Apple Store 禮品卡；另一句寫 HK$800 至 HK$1,200，優惠至 9 月 24 日止。",
          "呢個截止日期係商店頁寫死嘅。過咗今日，頁面撤回定續期，要以當時 Apple 商店為準，齊Quote 唔代宣布延期。",
        ],
        paragraphsEn: [
          "Apple’s Hong Kong store banner: education pricing on Mac or iPad, with an Apple Store Gift Card worded up to HK$1,200, and separately HK$800–HK$1,200, through 24 September.",
          "That end date is on the storefront. Whether it is extended is whatever Apple shows next. We will not invent a sequel.",
        ],
      },
      {
        heading: "點核對資格",
        headingEn: "How to check you qualify",
        paragraphs: [
          "教育優惠通常要經教育商店核對身份，唔係隨便用普通結帳。禮品卡金額視型號，商店用「最高達」同「HK$800 至 HK$1,200」兩種寫法，成交前對教育商店當頁。",
          "今個檔期商店只寫 Mac 或 iPad。想買 iPhone 18 Pro 或者 AirPods 5，唔好當呢張禮品卡自動跟。實際資格同金額以官方及平台商店確認為準。",
        ],
        paragraphsEn: [
          "Education pricing is checked on the education storefront, not ordinary checkout. The gift-card band is model-specific.",
          "The banner names Mac or iPad only. Do not assume an iPhone 18 Pro or AirPods 5 picks up the same card. Confirm on Apple’s page.",
        ],
      },
    ],
    tags: ["Apple", "教育優惠", "Mac", "iPad"],
    tagsEn: ["Apple", "education pricing", "Mac", "iPad"],
    editorNote:
      "呢篇有期限先值得寫：商店自己寫到今日。過咗 9 月 24 日，數字就唔好再當仲有效。\n\n教育優惠最易睇漏資格。學生證、教職員電郵、一次一部，規矩以教育商店為準。禮品卡唔係現金，用唔用得着先決定你出唔出門。",
    editorNoteEn:
      "This is dated today on Apple’s own store. After 24 September, do not keep quoting it.\n\nEducation pricing is an identity check. A gift card is not cash. If you cannot use the card, the banner does not matter.",
    related: ["airpods-5-hk", "apple-watch-12-hk", "iphone-18-pro-hk"],
    sourceUrl: "https://www.apple.com/hk-zh/store",
    image: "/images/news-gadgets.jpg",
    imageAlt: "科技與生活應用專區配圖",
    imageCredit: "Apple",
  },
  {
    slug: "switch-sports-resort-oct22",
    category: "gaming",
    minutes: 4,
    published: "2026-09-24",
    seoTitle: "Switch Sports Resort 10月22日｜盒裝HK$399｜齊Quote",
    h1: "Sports Resort 10月22日：盒裝$399",
    description:
      "任天堂香港：Nintendo Switch Sports Resort 於 2026 年 10 月 22 日在 Switch 2 發售。官方建議售價盒裝 HKD 399、下載版 HKD 349。內容僅供參考，實際售價同發售日以官方及平台商店確認為準。",
    excerpt: "官方發售日 10 月 22 日。盒裝 HKD 399、下載版 HKD 349。下載版已開預購，舖頭貨以商店為準。",
    seoTitleEn: "Switch Sports Resort 22 Oct, boxed HKD 399 | 齊Quote",
    h1En: "Switch Sports Resort on 22 October: boxed HKD 399",
    descriptionEn:
      "Nintendo HK: Nintendo Switch Sports Resort launches on Switch 2 on 22 October 2026. SRP HKD 399 boxed, HKD 349 download. Confirm store price.",
    excerptEn: "Dated 22 October. Boxed HKD 399, download HKD 349. Download pre-orders are open.",
    bullets: [
      "任天堂香港：2026 年 10 月 22 日（四）Switch 2 發售。",
      "建議售價：盒裝 HKD 399、下載版 HKD 349；下載版現已接受預購。",
      "官方寫 12 種體感運動，新項目包括「拇指大戰」。",
      "主機加遊戲組合另見商品陣容頁，價錢以該頁為準。",
    ],
    bulletsEn: [
      "Nintendo HK: Thursday 22 October 2026 on Switch 2.",
      "SRP HKD 399 boxed, HKD 349 download. Download pre-order is open.",
      "Twelve motion sports; official new mode is thumb wrestling.",
      "A console bundle is on the hardware lineup page. Use that page’s price.",
    ],
    body: [
      {
        heading: "官方期同官價",
        headingEn: "The dated price",
        paragraphs: [
          "任天堂香港 TOPICS（2026 年 6 月 9 日）：《Nintendo Switch Sports Resort》（Nintendo Switch 運動 度假勝地）將於 2026 年 10 月 22 日（四）在 Nintendo Switch 2 登場。建議售價盒裝 HKD 399、下載版 HKD 349，下載版現已接受預購，支援繁體同簡體中文。",
          "距離發售約四個星期。舖頭有無實體預訂，要以商店為準，唔好當 eShop 預購等同櫃檯有貨。",
        ],
        paragraphsEn: [
          "Nintendo HK topics, 9 June 2026: Sports Resort lands on Switch 2 on Thursday 22 October. SRP HKD 399 boxed, HKD 349 download. Traditional and Simplified Chinese. Download pre-order is open.",
          "About four weeks out. A shop pre-order is not the same as an eShop pre-order.",
        ],
      },
      {
        heading: "入面有咩、組合另計",
        headingEn: "What is in the game",
        paragraphs: [
          "官方簡介：舞台係「烏富島」，可用 Joy-Con 2 玩拳擊、乒乓球、射箭、網球、排球、保齡球、籃球、高爾夫球、滑板、水上摩托車、螺旋槳飛機，以及新項目「拇指大戰」，另有跳繩暖身。",
          "任天堂香港商品陣容頁另列 Switch 2 主機連 Sports Resort 組合，發售日同樣 10 月 22 日，建議售價 HKD 3,935。組合包唔包其他遊戲。實際售價同庫存以官方及平台商店確認為準。",
        ],
        paragraphsEn: [
          "Official list: twelve sports on Wuhu Island, plus skip-rope warm-up. The new mode is thumb wrestling.",
          "The hardware lineup also lists a Switch 2 + Sports Resort bundle on the same date at HKD 3,935. That bundle does not add other games. Confirm store price.",
        ],
      },
    ],
    tags: ["Nintendo Switch 2", "Sports Resort", "體感"],
    tagsEn: ["Nintendo Switch 2", "Sports Resort", "motion"],
    editorNote:
      "時之笛 11 月 5 日已經寫過。呢篇補官方寫死嘅 10 月 22 日同兩個建議售價，方便想預購體感遊戲嘅人對期。\n\n盒裝貴下載版 HKD 50。主機組合 HKD 3,935 係另一張單，唔好當買遊戲就送主機。Joy-Con 2 體感先係賣點；坐梳化撳制，呢隻遊戲無謂買。",
    editorNoteEn:
      "Ocarina of Time on 5 November is already on the site. This page adds the 22 October date and the two SRPs.\n\nBoxed is HKD 50 above download. The HKD 3,935 bundle is a separate ticket. This game is motion controls. Sitting on a sofa with buttons is the wrong reason.",
    related: ["switch-2-hk-3700", "assemble-nintendo-switch-wanchai", "gta-6-november-2026"],
    sourceUrl: "https://www.nintendo.com/hk/topics/article/5m1STF4LIUsDH3xCCnmFKv",
    image: "/images/news-gaming.jpg",
    imageAlt: "電玩娛樂情報專區配圖",
    imageCredit: "Nintendo",
  },
  {
    slug: "cmhk-mid-autumn-2026",
    category: "telecom",
    minutes: 5,
    published: "2026-09-24",
    seoTitle: "中移動雙節至10月11日：指定5G雙倍中澳數據｜齊Quote",
    h1: "中移動雙節至10月11日：指定5G雙倍中澳數據",
    description:
      "中國移動香港 2026 年 9 月 23 日新聞稿：雙節通訊優惠即日起至 10 月 11 日。指定 5G 本地計劃可享雙倍中國內地及澳門數據；5G 一咭大中華 50GB 新聞稿寫每月 $179（原價每月 $209）。內容僅供參考，實際月費、合約同適用計劃以電訊商確認為準。",
    excerpt: "官方寫到 10 月 11 日。指定 5G 本地計劃可雙倍中澳數據；一咭大中華 50GB 新聞稿寫每月 $179。成交前對官網。",
    seoTitleEn: "CMHK holiday offers to 11 Oct: double Mainland-Macau data | 齊Quote",
    h1En: "CMHK holiday window to 11 October: double data only on named 5G plans",
    descriptionEn:
      "China Mobile Hong Kong’s 23 September 2026 release: the holiday telecom offers run through 11 October. Named 5G local plans get double Mainland and Macau data. The Greater China 50GB plan is listed at $179 a month, from $209. Confirm fees and eligible plans with the carrier.",
    excerptEn: "The release ends 11 October. Double roaming data is only on named 5G local plans. Greater China 50GB is listed at $179.",
    bullets: [
      "中國移動香港新聞稿日期：2026 年 9 月 23 日；優惠寫「即日起至 10 月 11 日」。",
      "優惠期內申請指定 5G 本地服務計劃，可享雙倍中國內地及澳門數據；邊幾個計劃算「指定」，要以官網名單為準。",
      "5G 一咭大中華 50GB：新聞稿寫每月 $179（原價每月 $209），適用中國內地、香港、澳門及台灣。",
      "1000M 家居寬頻新聞稿寫「限時限量優惠月費 $77 起」；覆蓋、年期同埋你條地址裝唔裝到，以電訊商確認為準。",
    ],
    bulletsEn: [
      "CMHK release dated 23 September 2026; offers run through 11 October.",
      "Named 5G local plans applied in the window get double Mainland and Macau data. The named list is on CMHK’s page.",
      "5G Greater China 50GB is listed at $179 a month, from $209, for Mainland China, Hong Kong, Macau and Taiwan.",
      "1000M home broadband is worded “from $77”, limited time and quantity. Coverage is confirmed at your address.",
    ],
    body: [
      {
        heading: "官方寫到邊日",
        headingEn: "What the release actually dates",
        paragraphs: [
          "中國移動香港 2026 年 9 月 23 日經美通社發出新聞稿，主題係國慶同中秋「雙節送暖」。通訊優惠一段寫明：即日起至 10 月 11 日，涵蓋 5G 服務、漫遊數據、儲值卡、家居寬頻及指定手機優惠。",
          "同一稿另寫 10 月 1 日可無限次免費乘搭普通載客電車，由中國移動香港聯同香港中國企業協會舉行。電車係節日活動，唔係上台條件；要乘搭以當日電車公司安排為準。詳情頁新聞稿指向 [中國移動香港雙節頁](http://hk.chinamobile.com/tc/home/jetso/2026-mid-autumn)。",
        ],
        paragraphsEn: [
          "China Mobile Hong Kong issued a 23 September 2026 release via PR Newswire. The telecom offers are dated through 11 October and cover named 5G plans, roaming packs, prepaid cards, home broadband and selected handsets.",
          "The same release also describes free ordinary tram rides on 1 October with the Hong Kong Chinese Enterprises Association. That is a festival activity, not a contract term. The landing page in the release is [CMHK’s holiday page](http://hk.chinamobile.com/tc/home/jetso/2026-mid-autumn).",
        ],
      },
      {
        heading: "北上同外遊要對邊項",
        headingEn: "What to check before you travel",
        paragraphs: [
          "新聞稿寫：優惠期內申請「指定」5G 本地服務計劃，可享雙倍中國內地及澳門數據。重點係「指定」兩個字——唔係所有本地 5G 計劃自動加倍，名單以官網同門市當時顯示為準。",
          "5G 一咭大中華 50GB 服務計劃，新聞稿寫每月 $179（原價每月 $209），適用中國內地、香港、澳門及台灣。月費計劃客戶申請中國內地及澳門漫遊數據，新聞稿寫可享低至 $5.9/GB。指定儲值卡享 77 折，稿件點名亞太卡 30 日數據卡、中國內地及澳門數據卡、5G 香港自遊行卡。行政費、合約期、其後限速同埋邊張卡納入 77 折，成交前以電訊商確認為準。",
        ],
        paragraphsEn: [
          "The release says applying for *named* 5G local plans in the window doubles Mainland and Macau data. “Named” is the word that matters. It is not every local 5G plan.",
          "The Greater China 50GB plan is listed at $179 a month, from $209, for Mainland China, Hong Kong, Macau and Taiwan. Plan customers buying Mainland/Macau roaming are worded “from $5.9/GB”. Named prepaid cards are 23% off: Asia-Pacific 30-day, Mainland and Macau data, and the 5G Hong Kong visitor card. Admin fees, term and fair-use caps are confirmed by the carrier.",
        ],
      },
      {
        heading: "寬頻「$77起」唔等於你屋企個價",
        headingEn: "“From $77” is not your address quote",
        paragraphs: [
          "新聞稿寫：申請 1000M 家居寬頻服務，可享限時限量優惠月費 $77 起；購買指定型號手機可享高達 $3,200 折扣。呢兩句都有「起」同「指定／限量」，即係唔保證你條地址、你部機有同一個數字。",
          "想核對寬頻，先用自己屋苑查覆蓋，再問合約期、路由器、預繳同埋優惠係咪仍然有位。手機折扣要對型號同門市當日單。以上只跟 9 月 23 日新聞稿，實際以電訊商確認為準。",
        ],
        paragraphsEn: [
          "The release lists 1000M home broadband “from $77” on a limited-time, limited-quantity basis, and selected handsets off by up to $3,200. “From” and “selected” mean your address and your SKU can differ.",
          "Check coverage at your estate first, then term, router, prepayment and whether the quota is still open. Handset discounts are SKU- and store-specific. This page follows the 23 September release only.",
        ],
      },
    ],
    tags: ["中國移動香港", "中秋", "國慶", "漫遊數據", "家居寬頻"],
    tagsEn: ["CMHK", "Mid-Autumn", "National Day", "roaming", "home broadband"],
    editorNote:
      "節日稿最易令人以為「而家全線平咗」。呢篇新聞稿其實只做咗三件有日期嘅事：優惠窗到 10 月 11 日、指定本地 5G 先有雙倍中澳數據、一咭大中華 50GB 寫死每月 $179。其他「起」字全部要打回頭問。\n\n10 月 1 日免費電車係活動，唔好當成上台禮品。寬頻 $77 起如果唔對你條地址，個數字對你冇用。去官網對名單，門市對合約，先至係讀者用得着嘅一步。",
    editorNoteEn:
      "Holiday copy tempts people to think every plan just got cheaper. The release actually dates three things: the window closes 11 October, only named local 5G plans get double roaming data, and Greater China 50GB is listed at $179. Every “from” price needs a follow-up question.\n\nThe 1 October tram ride is an event, not a contract gift. A $77-from broadband line that does not cover your estate is a number for someone else. Check the named list, then the contract.",
    related: ["iphone-18-handset-plan", "read-offer-news", "smartone-3g-close-2026"],
    sourceUrl: "https://www.prnewswire.com/apac/zh/news-releases/--302887451.html",
    image: "/images/news-telecom.jpg",
    imageAlt: "電訊與上網優惠專區配圖",
    imageCredit: "中國移動香港新聞稿／齊Quote",
  },
  {
    slug: "assemble-nintendo-switch-wanchai",
    category: "gaming",
    minutes: 6,
    published: "2026-09-21",
    seoTitle: "灣仔Assemble Switch生活館｜合和商場｜齊Quote",
    h1: "灣仔合和商場 Assemble：亞洲首個大型 Switch 遊戲生活館",
    description:
      "Assemble | Nintendo Switch 商品專門店位於灣仔皇后大道東 183 號合和商場 4 樓 414-415 號舖。合和商場官方寫明為亞洲首個大型 Nintendo Switch 遊戲生活館，佔地近 12,000 呎。內容僅供參考，營業時間、庫存同售價以商店確認為準。",
    excerpt: "唔係任天堂直營。合和 4 樓逾萬呎，試玩、周邊、多間日廠專區同場。去之前對營業時間。",
    seoTitleEn: "Assemble Switch lifestyle store, Hopewell Mall | 齊Quote",
    h1En: "Assemble in Wan Chai: Asia’s first large Switch lifestyle store",
    descriptionEn:
      "Assemble | Nintendo Switch Specialty Store is at shops 414-415, 4/F, Hopewell Mall, 183 Queen’s Road East, Wan Chai. The mall calls it Asia’s first large Nintendo Switch game lifestyle centre, nearly 12,000 sq ft. Hours and stock are confirmed by the shop.",
    excerptEn: "Not a Nintendo-run store. Over 10,000 sq ft on Hopewell 4/F: try-play, merch, multiple Japanese publisher zones.",
    bullets: [
      "地址：灣仔皇后大道東 183 號合和商場 4 樓 414-415 號舖。",
      "商場官方：亞洲首個大型 Nintendo Switch 遊戲生活館，佔地近 12,000 呎。",
      "營業時間（商場頁）：一至四 11:30–20:30；五至日及公眾假期 11:00–21:00。",
      "查詢電話 5364 5099。唔係任天堂直營店，庫存以舖頭為準。",
    ],
    bulletsEn: [
      "Shop 414-415, 4/F, Hopewell Mall, 183 Queen’s Road East, Wan Chai.",
      "Mall copy: Asia’s first large Nintendo Switch game lifestyle centre, nearly 12,000 sq ft.",
      "Hours (mall page): Mon–Thu 11:30–20:30; Fri–Sun and public holidays 11:00–21:00.",
      "Tel 5364 5099. Not Nintendo-operated. Stock is whatever is on the shelf.",
    ],
    body: [
      {
        heading: "邊度、幾大、開唔開",
        headingEn: "Where, how big, when",
        paragraphs: [
          "合和商場租戶頁寫：Assemble 係亞洲首個大型 Nintendo Switch「Game Lifestyle Center」，圍繞遊戲文化、佔地近 12,000 呎，匯集日本遊戲公司專區、過百款熱門遊戲、現場試玩同官方授權周邊。SNK Asia 2024 年 11 月開幕前亦用過「亞洲首個遊戲生活館」呢句。",
          "舖位：灣仔皇后大道東 183 號合和商場 4 樓 414-415。商場列營業時間星期一至四 11:30–20:30，星期五至日及公眾假期 11:00–21:00，電話 5364 5099。2024 年 11 月 14 日開業。出門前打去或者睇 [合和租戶頁](https://www.hopewellhill.com.hk/shopping/assemble-nintendo-switch-specialty-store)，假期可能改時間。",
        ],
        paragraphsEn: [
          "Hopewell’s tenant page calls Assemble the first large-scale Nintendo Switch Game Lifestyle Center in Asia, nearly 12,000 sq ft, with Japanese publisher zones, try-play and licensed merch. SNK Asia used the same “first in Asia” line before the 14 November 2024 opening.",
          "Shop 414-415, 4/F, Hopewell Mall, 183 Queen’s Road East. Hours on the mall page: Mon–Thu 11:30–20:30; Fri–Sun and PH 11:00–21:00. Tel 5364 5099. Check the [mall listing](https://www.hopewellhill.com.hk/shopping/assemble-nintendo-switch-specialty-store) before you go.",
        ],
      },
      {
        heading: "入去會見到咩",
        headingEn: "What is actually inside",
        paragraphs: [
          "開業報道同商場簡介一致：任天堂專區之外，還有 BANDAI NAMCO、SEGA、Capcom、Square Enix、Konami、SNK、Cygames、Koei Tecmo 等形象區，部分有大型角色雕塑。另有限定活動主題區、家居概念試玩／直播室、復古同獨立遊戲、乙女遊戲專區。開幕當年《勇者鬥惡龍 III HD-2D Remake》中庭活動已經完，而家有咩主題要以店內告示為準。",
          "呢度賣遊戲同周邊，亦俾人試。Switch 2 港版已經加到 HK$3,700，想摸過先決定，灣仔呢舖比起淨睇網圖實際。主機、遊戲、amiibo 有冇貨，齊Quote 唔代舖頭報。",
        ],
        paragraphsEn: [
          "Launch coverage matches the mall brief: a Nintendo zone plus BANDAI NAMCO, SEGA, Capcom, Square Enix, Konami, SNK, Cygames, Koei Tecmo and others, some with giant figures. There is an event bay, a glass try-play/livestream room, retro, indie and otome corners. The 2024 Dragon Quest atrium event is over; current themes are whatever the shop has posted.",
          "It sells games and merch, and lets you play. Switch 2 already lists at HK$3,700 in Hong Kong — trying one in Wan Chai is more useful than another screenshot. We will not quote shelf stock.",
        ],
      },
      {
        heading: "去之前三句老實話",
        headingEn: "Three practical notes",
        paragraphs: [
          "一、唔好當 Nintendo Store。商標、貨、試玩都圍住 Switch，營運係專門店，保養同換貨跟舖頭單據。二、合和商場喺皇后大道東，灣仔站行過去；精確出口各站指引唔一致，跟地圖去 183 號最穩。三、週末同放學時段會逼，平日晏晝較易試機。",
          "實際營業、庫存、價錢以商店確認為準。",
        ],
        paragraphsEn: [
          "One: this is not a Nintendo-operated Nintendo Store. Warranty follows the shop receipt. Two: Hopewell is on Queen’s Road East; walk from Wan Chai station to no. 183 rather than arguing over which exit. Three: weekends fill up; weekday afternoons are easier for try-play.",
          "Hours, stock and prices are confirmed by the shop.",
        ],
      },
    ],
    tags: ["Nintendo Switch", "Assemble", "灣仔", "合和商場"],
    tagsEn: ["Nintendo Switch", "Assemble", "Wan Chai", "Hopewell Mall"],
    editorNote:
      "香港終於有一間唔使去日本、又唔使困喺電器舖玻璃櫃後面嘅 Switch 場。12,000 呎聽落誇張，入去其實係「試完再決定買唔買」，同淨係比價網完全兩回事。\n\n我哋唔會叫你為打卡專程過海。但如果你已經想摸 Switch 2，或者陪細路揀一隻實體帶，灣仔合和呢舖係而家香港最齊嗰種。記住：唔係任天堂員工幫你保養，單據留低。週末唔好估準有機試。",
    editorNoteEn:
      "Hong Kong finally has a Switch floor that is not a glass cabinet in an electronics shop. The 12,000 sq ft is really “try, then decide” — the opposite of a price-comparison tab.\n\nWe will not tell you to cross the harbour just for photos. If you already want hands on a Switch 2, or a physical game with a kid, this is the fullest room in town. It is not staffed by Nintendo. Keep the receipt. Do not assume a free machine at the weekend.",
    related: ["switch-2-hk-3700", "gta-6-november-2026"],
    sourceUrl: "https://www.hopewellhill.com.hk/shopping/assemble-nintendo-switch-specialty-store",
    image: "/images/news-assemble.jpg",
    imageAlt: "灣仔合和商場 Assemble | Nintendo Switch 商品專門店店面",
    imageCredit: "Hopewell Mall / Assemble",
  },
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
      "上台戰每年都一樣：舖頭海報寫減三千，月費就靜靜墊返嚟。我寧願你用紙筆計 24 或者 36 個月，唔好信任何「全期」排名表——昨日啱，聽日折扣就撤。\n\n齊Quote 唔排名邊間上台抵，唔係怕得罪人，係呢啲數唔應該由新聞稿決定。官價我哋引 Apple；折扣你自己問門市。想轉台，先講而家用緊邊間，結果頁先有意義。",
    editorNoteEn:
      "Every autumn the same trick: a fat handset discount on the poster, and the monthly fee quietly climbs back. Do the 24- or 36-month sum yourself. Yesterday’s “lifetime cost” table is already stale.\n\nWe will not rank carriers. Apple’s list price is the only number we will print. Ask the shop for the discount. If you are porting, say which carrier you are on first — otherwise the results page is theatre.",
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
    excerpt: "停網日就係今日。門市可免費換 SIM。老人機同車載 3G 最容易漏。",
    seoTitleEn: "SmarTone ends 3G on 9 Oct 2026 | 齊Quote",
    h1En: "SmarTone 3G ends 9 October: check phones, watches and car kits",
    descriptionEn:
      "The Communications Authority consented to SmarTone closing 3G on 9 October 2026. Devices stuck on 3G, old SIMs and some trackers are affected. Confirm with SmarTone and OFCA.",
    excerptEn: "Shutdown day is today. SmarTone says 4G/5G SIMs can be swapped free in store.",
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
      "3G 停網唔係科技新聞，係屋企新聞。最容易中招唔係追 5G 嘅人，而係阿爸阿媽仲用緊十年前部機、部車 Cam、隻老人錶。停網日就係今日（10 月 9 日）。未換 SIM 就盡快去門市，仲有得補。\n\nSmarTone 話門市免費換卡。真係換唔到訊號，就要換機——呢步先至有人想推你上台。換機條件你自己問，我哋呢篇刻意唔報折扣，免得你以為新聞價就係成交價。",
    editorNoteEn:
      "A 3G shutdown is a family story, not a gadget story. The people who get cut off are parents on a ten-year-old handset, a dash cam, a watch. The shutdown date is today, 9 October.\n\nSmarTone says the SIM swap is free in store. If the radio still says 3G, you need a new phone — that is when the contract pitch starts. We deliberately did not print handset discounts. A news figure is not a quote.",
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
    editorNote:
      "今代 Pro 係相機同續航嘅機，唔係「人人都要換」嘅機。Apple 今秋唔出標準版，我睇係產能同利潤兩邊夾——中階客要嘛捱 Pro 價，要嘛留喺 iPhone 17。\n\n你部 15、16 用得順，無謂為冰川色排隊。真係夜拍或者打機先熱，Pro Max 張電先有說服力。標準版幾時出我唔估；估期嘅稿，通常係廣告。",
    editorNoteEn:
      "This Pro is a camera and battery phone, not a must-upgrade. Skipping the base model looks like a squeeze on the mid-tier: pay Pro money or keep a 17.\n\nIf a 15 or 16 is fine, skip the glacier queue. Night photography and long sessions are the only honest reasons for a Pro Max. We will not guess a date for the missing base model.",
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
    editorNote:
      "HK$17,499 起已經係一部「決定型」電話，唔係玩票。摺機幾靚，鉸位同內屏花幾耐先出現，要等第一批用家先有數，新聞稿幫唔到你。\n\n香港更大嘅坑係 eSIM。Duo 無卡槽，你而家張實體 SIM 帶唔入去。未問清楚電訊商開唔開到 eSIM，唔好先比訂金。我個人會等到 10 月中先決定，Pro 系列已經喺街。",
    editorNoteEn:
      "From HK$17,499 this is a commitment, not a toy. Foldables look finished in photos; creases and hinges show up months later. A press release will not tell you that.\n\nHong Kong’s real trap is eSIM-only. If your carrier cannot issue one, the pre-order is wasted. I would wait until mid-October. The Pro phones are already in shops.",
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
    editorNote:
      "Series 12 戴上手，路人未必睇得出同舊款分別。錢其實買喺 S11 同感測。健康功能香港開幾多，要對產品頁，唔好信發布會演示。\n\n舊錶值唔值得留，先打開 Apple 兼容名單。系統一刀切，你先至知部 SE 定 Series 8 仲有冇得跟。為咗錶面新顏色換錶，我覺得唔抵；為咗舊錶即將唔支援，先有理由。",
    editorNoteEn:
      "On a wrist, Series 12 does not announce itself. You are paying for S11 and the sensors. Which health features Hong Kong actually gets is on the store page, not the keynote.\n\nCheck Apple’s compatibility list before you keep an old watch. A new colour is a weak reason to spend. A cutoff is a real one.",
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
    editorNote:
      "AirPods 5 真正有趣嘅唔係翻譯 demo，而係入門價都有主動消噪。已經有 Pro 嘅人，無謂為咗「5」個字再買一副。\n\n無線充電盒嗰 HK$150，換嚟輕掃音量同多啲電，視你幾常喺街上調歌。翻譯要指定 iPhone 同語言，香港用家買之前對名單，唔好當日用廣東話實時譯。一次充電 4 小時開咗消噪，出街要帶盒，唔係全天一副搞掂。",
    editorNoteEn:
      "The interesting part of AirPods 5 is ANC at the lower price, not the translation demo. If you already own Pros, skip the numeral.\n\nThe extra HK$150 for the wireless case buys volume swipe and battery. Live Translation needs a listed iPhone and language — do not assume Cantonese on day one. Four hours with ANC means you still carry the case.",
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
      "HK$250 加幅唔好聽，但比起日本今輪，香港呢刀其實收得較細。已經入手嘅人當無事；而家先買就要當 HK$3,700 係新常態，唔好再等舊價回流，街貨剩幾部我唔估。\n\nOnline 會籍官方話唔跟加，呢句值得記。今秋若果只為一隻遊戲入主機，11 月 5 日《時之笛》先係理由，唔係「加價前最後機會」呢類口號——機會已經過咗。想摸機，灣仔合和商場 Assemble 生活館仲開住。",
    editorNoteEn:
      "HK$250 is annoying. Japan’s hike was worse. If you already own a Switch 2, ignore this. If you are buying now, HK$3,700 is the number. I will not guess leftover stock at the old SRP.\n\nNintendo says Switch Online is unchanged — remember that. Ocarina of Time on 5 November is a reason to walk into a shop. “Last chance before the hike” is not; that date has passed. Assemble in Hopewell Mall is still open if you want hands-on.",
    related: ["gta-6-november-2026"],
    sourceUrl: "https://www.nintendo.com.hk/support/releasenotes/2026-06-29",
    image: "/images/news-switch-2.jpg",
    imageAlt: "Nintendo Switch 2 主機同盒裝官方圖",
    imageCredit: "Nintendo",
  },
];
