import type { Guide } from "./guides.ts";

/**
 * 2027 guide series, first preview batch.
 * Copy follows the approved 建議稿. Reviewer brackets are not rendered.
 * Face-price examples were re-checked against src/lib/plans.ts before use.
 */

const HUB_DISCLAIMER =
  "以上只供參考，唔係排名，亦唔保證你座樓或你個地址一定有表上計劃。實際覆蓋、安裝期、月費、合約同路由器條款，一律以電訊商確認為準。";

const HUB_DISCLAIMER_EN =
  "For reference only. This is not a ranking, and it does not mean your building or address has every plan in the tables. Coverage, install timing, fees, contracts and router terms are confirmed by the carrier.";

const INTAKE_DISCLAIMER =
  "以上只供參考，唔係收樓保證，亦唔係排名。預計關鍵日期唔等於個人收樓或派匙日。覆蓋、安裝期、月費同合約，一律以電訊商確認為準；入伙日期以官方或發展商書面通知為準。";

const INTAKE_DISCLAIMER_EN =
  "For reference only. This is not a handover guarantee and not a ranking. A key date is not your personal handover day. Coverage, install timing, fees and contracts are confirmed by the carrier. Intake dates follow the official or developer notice.";

const METHOD_ZH =
  "齊Quote 唔係電訊商官網、附屬機構或官方客服；用公開市場資料、按同一標準整理，用家自己比較、自己揀計劃。經本站查詢或轉介申請唔會另收費；報酬披露見頁尾。所列月費、覆蓋同條款僅供參考，一律以電訊商公佈及你同電訊商簽署嘅合約為準。";

const METHOD_EN =
  "ChaiQuote is not a carrier website, subsidiary or official customer service. It arranges public market information to one standard so you can compare and choose. Enquiries and referred applications through this site are not charged an extra fee; remuneration disclosure is in the footer. Fees, coverage and terms are for reference only. The carrier’s notice and the contract you sign prevail.";

export const GUIDE_2027: Guide[] = [
  {
    slug: "hk-telecom-broadband-price-comparison",
    minutes: 14,
    category: "fiber",
    seoTitle:
      "2027香港電訊及寬頻月費比較懶人包｜公屋居屋私樓村屋、5G家居及手機轉台全對照｜齊Quote",
    h1: "2027 香港電訊及寬頻月費比較懶人包｜公屋、居屋、私樓、村屋、5G 家居及手機轉台全對照",
    description:
      "2027香港電訊月費懶人包。齊Quote按公屋、居屋、私樓、村屋整理光纖、5G家居及手機轉台參考月費，說明牌面月費同合約期內總開支點分。僅供參考，以電訊商確認為準。",
    title: "2027 香港電訊及寬頻月費比較懶人包",
    excerpt:
      "按公屋、居屋、私樓、村屋整理光纖、5G 家居同手機轉台參考月費，並分開牌面月費同合約期內總開支。",
    titleEn: "2027 Hong Kong telecom and broadband fee guide",
    excerptEn:
      "Fibre, 5G home and mobile reference fees sorted by public housing, HOS, private estates and village houses, with labelled fees kept apart from in-contract spend.",
    descriptionEn:
      "A 2027 Hong Kong telecom fee guide. ChaiQuote sorts fibre, 5G home and mobile reference fees by public housing, HOS, private estates and village houses, and separates the labelled monthly fee from in-contract spend. For reference only; the carrier confirms.",
    h1En:
      "2027 Hong Kong telecom and broadband fees: public housing, HOS, private, village, 5G home and mobile",
    published: "2026-11-29",
    modified: "2026-11-29",
    opening: [
      {
        text: "文案修訂日期：2026-11-29（香港時間）。適用於 2026 年底至 2027 年續約、轉台及新居規劃。數字沿用現網已鎖價帶同原稿已寫內容整理，並已再對站內計劃目錄；呢個係文案修訂日，唔係全表核實日期。",
      },
      { text: METHOD_ZH },
    ],
    disclaimer: HUB_DISCLAIMER,
    disclaimerEn: HUB_DISCLAIMER_EN,
    related: [
      "home-broadband-2026",
      "fiber",
      "broadband-total-cost",
      "public-hos-fees",
      "private-1000-fees",
      "village",
      "village-fees",
      "home5g",
      "home5g-data-cap",
      "new-estate-intake-broadband-timeline",
      "old-building-broadband",
      "port-in",
      "gba-mobile",
      "business",
    ],
    plans: [
      { href: "/plans?cat=broadband", label: "去光纖格價", labelEn: "Fibre plans" },
      { href: "/plans?cat=home5g", label: "去 5G 家居格價", labelEn: "5G home plans" },
      { href: "/plans?cat=mobile", label: "去手機格價", labelEn: "Mobile plans" },
    ],
    estates: [
      { href: "/estates", label: "屋苑目錄", labelEn: "Estate index" },
      { href: "/new-intake", label: "新入伙屋苑", labelEn: "New-intake estates" },
      { href: "/guides/home-broadband-2026", label: "2026 六大電訊 1000M 表", labelEn: "2026 six-carrier 1000M table" },
    ],
    body: [
      {
        heading: "60 秒跨品類核心結論",
        flow: [
          {
            kind: "p",
            text: "香港電訊市場並無全港劃一價目表。同一速度嘅寬頻，要先分**樓宇類別（公屋、居屋、私樓、村屋）**同**合約長度（24 至 48 個月）**。樓類或合約期唔同時，牌面月費合計可以相差幾千元，但牌面合計唔等於合約期內真實總開支。本頁係 2027 系列總樞紐；[2026 家居寬頻 1000M 六大電訊表](/guides/home-broadband-2026) 仍然係六大電訊 1000M 牌面月費快照，兩頁唔合併。",
          },
          {
            kind: "ul",
            items: [
              "**公屋及居屋 1000M 光纖：** 站內參考約 **HK$58 至 HK$98／月**。例如 [有線指定屋苑 48 個月 HK$58](/plans/icable-ftth-1000-48m-58)，適用公屋、居屋、私樓，唔係公屋劃一價，亦唔好用 HK$58 × 24 去估兩年開支；[香港寬頻 36 個月約 HK$98](/plans/hkbn-ftth-1000-36m-98)。公屋同居屋好多時分開計劃，篩選時要分開揀。",
              "**私人屋苑 1000M 光纖：** 站內參考約 **HK$88 至 HK$109／月**。例如 [有線私人樓宇 36 個月 HK$88](/plans/icable-ftth-1000-private-36m)；[香港寬頻 24 個月約 HK$109](/plans/hkbn-ftth-1000-24m-109)（計劃卡列公屋、居屋、私樓，以卡為準）。",
              "**村屋光纖：** 唔好用上面價帶。[中國移動香港村屋 1000M、24 個月、指定地址優惠 HK$218](/plans/cmhk-ftth-1000-village-24m-218)，同系列正價 [HK$378](/plans/cmhk-ftth-1000-village-24m-378)，豁免安裝費原價 **HK$680**，唔等於所有村屋都係呢個價。[香港寬頻特選村屋 2000M、24 個月約 HK$229](/plans/hkbn-village-2000-24m)。網上行村屋 2500M 例子為 **HK$376**：村屋月費頁寫 [36 個月](/plans/netvigator-ftth-2500-village-36m)，目錄另有同牌面 [24 個月](/plans/netvigator-ftth-2500-village-24m) 卡。唔好同中國移動香港正價 HK$378 混寫成一律完約正價，亦唔好用一個月數乘 HK$376 當成所有村屋正價合計。現網列出有村屋光纖計劃嘅固網商包括中國移動香港、香港寬頻、HGC 同網上行；有線同數碼通家居光纖計劃唔適用村屋。有村口覆蓋唔等於入到屋，要填完整門牌由電訊商確認。",
              "**免拉線 5G 家居寬頻：** 站內已發布計劃牌面約 **HK$88 至 HK$190／月**，唔係劃一價。例如 [中國移動香港 350GB、48 個月 HK$88](/plans/cmhk-home5g-350-48-88)，各樓類可用。[3香港真無限 48 個月 HK$138](/plans/three-home5g-unlimited-48-138-public) 只限公屋／居屋；[30 個月 HK$158](/plans/three-home5g-b-158) 各樓類。適合未有光纖、租樓或趕時間；唔好當固定光纖替代。主流計劃設 12 至 24 個月合約，部分達 36 至 48 個月，**唔可以當一兩個月短期過渡**。",
              "**4G／5G 手機及大灣區月費：** 目錄仍見牌面 **HK$38／月** 嘅手機計劃，但其中部分標明限時至 2026-09-30，該日已過；另有須符合長者資格先適用嘅計劃。視計劃、合約同行政費，唔係劃一價。大灣區共享數據要以當時計劃卡為準，本頁唔引用未對到目錄嘅月費區間。簽約前核對係唔係另收每月 HK$18 或 HK$28 行政費；呢筆行政費只見於部分手機計劃，唔好套去光纖或 5G 家居。",
              "**中小企商業寬頻：** 工商及地舖地址常見由 1000M 起跳，可加配固定 IP，支援收銀機及閉路電視；實價須按商業登記及地舖拉線環境獨立核對，唔好套用家居價。",
            ],
          },
          { kind: "p", text: "全站篩選通道：" },
          {
            kind: "ul",
            items: [
              "[光纖格價](/plans?cat=broadband) ｜ [光纖點揀](/guides/fiber)",
              "[5G 家居格價](/plans?cat=home5g) ｜ [5G 家居點揀](/guides/home5g) ｜ [數據上限同公平使用](/guides/home5g-data-cap)",
              "[手機格價](/plans?cat=mobile) ｜ [手機月費點揀](/guides/mobile)",
              "[商業寬頻格價](/plans?cat=business) ｜ [商業寬頻點揀](/guides/business)",
              "[全港屋苑索引](/estates)（2026-11-29 現網首頁顯示 3,732 個屋苑；發佈前再數）",
              "[新入伙屋苑專區](/new-intake) ｜ [2027 新入伙收樓時間表](/guides/new-estate-intake-broadband-timeline)",
            ],
          },
        ],
        paragraphs: [],
      },
      {
        heading: "一、四大樓類同 5G／手機／商業參考對照",
        paragraphs: [
          "以下將常用場景並列，寫明主流合約期同要問嘅條款。表上「牌面月費合計」只係牌面月費乘合約月數，**未計**免月費、回贈、預繳、未豁免安裝費或其他收費，**唔等於**合約期內真實總開支或真實平均月費。計法見 [寬頻合約總成本點計](/guides/broadband-total-cost)。",
        ],
        matrix: {
          caption:
            "齊Quote 2027 香港各類樓宇寬頻、5G 家居及流動通訊參考月費與牌面月費合計（文案修訂 2026-11-29；數字發佈前再同目錄核對）。",
          headers: [
            "服務／樓宇類別",
            "適用電訊商範圍",
            "站內參考月費",
            "主流合約期",
            "合約期內牌面月費合計（唔等於真實總成本）",
            "核心條款",
            "深度攻略",
          ],
          rows: [
            [
              "公屋 1000M 光纖",
              "有線、香港寬頻、中國移動香港、HGC、網上行、數碼通（視屋邨覆蓋）",
              "HK$58–$98／月",
              "24–48 個月",
              "例如 24 個月 × HK$98 ＝ HK$2,352；48 個月 × HK$58 ＝ HK$2,784。只係牌面合計；唔好用 HK$58 × 24。",
              "較低月費多綁 36–48 個月長約。調遷可能另收搬遷費，簽約前必問可唔可以豁免。搬遷費視電訊商同合約而定，本頁唔寫劃一區間。",
              "[公屋／居屋 1000M 參考月費](/guides/public-hos-fees)、[公屋同居屋有咩分別](/guides/public-vs-hos)",
            ],
            [
              "居屋／綠置居 1000M 光纖",
              "同上（資助房屋按指定屋苑名單計價）",
              "先用同一價帶約 HK$58–$98／月；個別屋苑可以唔同，以計劃卡為準",
              "24–48 個月",
              "同公屋行，先用牌面月費乘合約月數，再按該計劃條款計真實平均月費。",
              "唔好誤用私人屋苑價目。公屋同居屋好多時分開批量計劃。新居屋入伙初期，未必所有固網商都已開通機樓。",
              "[2027 新入伙時間表](/guides/new-estate-intake-broadband-timeline) ｜ [新入伙屋苑](/new-intake)",
            ],
            [
              "私人屋苑 1000M",
              "六大固網電訊商（視屋苑）",
              "1000M：HK$88–$109／月",
              "24–36 個月",
              "例如 24 個月 × HK$88 ＝ HK$2,112；24 個月 × HK$109 ＝ HK$2,616。",
              "2500M 要先確認覆蓋，再比較總成本；並核對路由器係送出、包用定完約須還。本頁唔寫死未核嘅 2500M 月費區間。",
              "[私樓 1000M 參考月費](/guides/private-1000-fees)、[1000M 同 2500M 點揀](/guides/1000m-or-2500m)",
            ],
            [
              "村屋光纖",
              "中國移動香港、香港寬頻、HGC、網上行",
              "指定地址優惠：CMHK 1000M 24 個月 HK$218；HKBN 特選村屋 2000M 24 個月約 HK$229。CMHK 同系列正價 HK$378。網上行村屋 2500M 例子 HK$376（月費頁寫 36 個月；目錄另有同牌面 24 個月卡）。",
              "以各計劃為準（常見 24 或 36 個月）",
              "例如 CMHK 優惠 24×218＝HK$5,232；正價 24×378＝HK$9,072；HKBN 24×229＝HK$5,496。網上行 2500M 唔好用一個月數乘 HK$376 當成正價合計。",
              "隔兩個門牌都可以唔同價；有村口覆蓋唔等於入到屋。HK$376 唔等於 CMHK 正價 HK$378。",
              "[村屋光纖點算](/guides/village)、[村屋光纖月費](/guides/village-fees)（2027 村屋長稿待補）",
            ],
            [
              "免拉線 5G 家居寬頻",
              "中國移動香港、3香港、數碼通、csl、香港寬頻等（以目錄為準）",
              "約 HK$88–$190／月。例如 CMHK 350GB、48 個月 HK$88（各樓類）；3HK 真無限 48 個月 HK$138 只限公屋／居屋。",
              "12–48 個月（主流 24–48 個月）",
              "若用 24 個月估算，24×88＝HK$2,112；24×190＝HK$4,560。實際合約未必 24 個月，亦要分開淨 SIM 同包路由器。只係牌面合計。",
              "分「淨 SIM 唔包機」與「包／借 Router」；部分設高速數據上限或公平使用；有合約期，唔可作一兩個月短期過渡。",
              "[5G 家居點揀](/guides/home5g)、[數據上限同公平使用](/guides/home5g-data-cap)",
            ],
            [
              "4G／5G 手機及大灣區",
              "主要流動網絡商及 MVNO",
              "目錄仍見牌面約 HK$38／月，但部分標明限時至 2026-09-30（該日已過），另有長者資格計劃。唔係劃一價。大灣區月費以計劃卡為準，本頁唔引用未核區間。",
              "常見 12–24 個月，亦有更長",
              "12 個月牌面合計視月費而定；若該手機計劃另收行政費，要另計，唔好當成所有計劃一律有或一律無。",
              "每月 HK$18 或 HK$28 行政費只見於部分手機計劃，核對係唔係全期豁免。大灣區數據屬三地共享定額外漫遊，以條款為準。",
              "[攜號轉台](/guides/port-in)、[大灣區手機計劃](/guides/gba-mobile)、[手機月費點揀](/guides/mobile)（2027 大灣區／轉台長稿待補）",
            ],
            [
              "中小企商業寬頻",
              "香港電訊商業、香港寬頻企業、HGC 商業、中國移動香港、數碼通等",
              "常見由 1000M 起跳，按商廈／地舖報價，唔套家居價",
              "常見 24–36 個月",
              "視乎是否加購固定 IP 及地舖拉線工程費，要用該份商用合約嚟計。",
              "須提供有效商業登記；開舖裝鏡頭及收銀機要核對固定 IP。",
              "[商業寬頻點揀](/guides/business)（2027 固定 IP 長稿待補）",
            ],
          ],
        },
      },
      {
        heading: "二、香港六大固網電訊商：覆蓋同合約要注意咩",
        paragraphs: [
          "「邊間寬頻好」唔可以一句斷定，要先睇你住邊類樓、個地址有冇覆蓋，再並排同一樓類、同一速率嘅牌面月費，同合約期、路由器條款。以下按現網 1000M 參考同村屋頁整理，**沿用站內現價，待核實**，唔係排名。",
        ],
        matrix: {
          caption: "六大固網電訊商。沿用站內 1000M 參考，待核實。唔係排名。",
          headers: ["固網電訊商", "核心覆蓋", "定價與合約特點", "簽約前必核對"],
          rows: [
            [
              "有線寬頻 (i-CABLE)",
              "指定公屋、居屋及部分私人屋苑",
              "指定屋苑 1000M 可見 48 個月 HK$58（適用公屋、居屋、私樓，唔適用村屋）；私樓常見亦有約 HK$88（36 個月）。現網 1000M 參考約 HK$58–68（唔計 myTV 組合）。",
              "多數需簽 36 至 48 個月較長約，且只限指定屋苑名單。",
            ],
            [
              "香港寬頻 (HKBN)",
              "公屋、居屋、私人屋苑及特選村屋",
              "現網 1000M 參考約 HK$98–109；私樓可見 24 個月約 HK$109（該卡亦列公屋、居屋，以卡為準）。特選村屋 2000M、24 個月約 HK$229。",
              "部分計劃捆綁串流或路由器，宜分清「淨寬頻」同「組合」開支。快閃計劃另計，唔好當成長期劃一價。",
            ],
            [
              "中國移動香港 (CMHK)",
              "私人屋苑、指定村屋門牌，以及 5G 家居",
              "現網光纖 1000M 參考約 HK$88–98。村屋指定地址 1000M、24 個月優惠 HK$218，同系列正價 HK$378。5G 家居 350GB、48 個月 HK$88。",
              "村屋優惠要對具體門牌。5G 家居須核對高速數據上限及路由器借還條款。",
            ],
            [
              "HGC 環電寬頻",
              "單幢私樓、大型屋苑及指定村屋路段",
              "現網 1000M 參考約 HK$75–89（私樓常見約 HK$89）。沿用站內現價，待核實。",
              "核對係唔係豁免安裝費，以及完約後點續約。",
            ],
            [
              "網上行 (Netvigator)",
              "覆蓋面較廣，包括部分村屋及偏遠地段",
              "現網 1000M 參考約 HK$108。另有 2500M 等方案；村屋 1000M、36 個月例子為 HK$278，村屋 2500M 例子為 HK$376（月費頁寫 36 個月，目錄另有同牌面 24 個月卡）。",
              "獨市路段選擇可能較少，宜先查其他台有冇入線。海外連線同延遲屬用家口碑，唔當本站實測結論。",
            ],
            [
              "數碼通 SmarTone 家居光纖",
              "指定公居屋、私人屋苑；村屋多以 5G 家居替代",
              "現網 1000M 參考約 HK$88；唔適用村屋。沿用站內現價，待核實。",
              "若將手機月費與家居寬頻捆綁，日後轉手機台可能受牽連，宜先分拆計一次。",
            ],
          ],
        },
      },
      {
        heading: "三、牌面月費同合約期內總開支點分",
        flow: [
          {
            kind: "p",
            text: "計劃卡、比較表同開首引用，齊Quote 一律用**牌面月費**（計劃卡上嘅標示月費），方便同一樓類並排比較。呢個數**唔等於**你喺成段合約入面平均每月實際要出嘅錢。",
          },
          {
            kind: "p",
            text: "要計**合約期內總開支**，再除以合約總月數，先得到**真實平均月費**。真實平均月費只供你自己判斷，唔會取代站內牌面月費引用。完整公式、假設例子同注意事項，見 [寬頻合約總成本點計](/guides/broadband-total-cost)。現網計法會計入合約期、免月費、現金回贈、禮券面值、預繳、未豁免安裝費，以及**合約列明**嘅行政費或服務費。本頁唔另造新假設銀碼，亦唔把手機行政費套入光纖例子。",
          },
          { kind: "p", text: "比較時再留心：" },
          {
            kind: "ul",
            items: [
              "36 至 48 個月長約，若合約期內搬屋、或者新地址無該台覆蓋，提早解約可能要賠剩餘月份。解約費要計入搬遷或轉台成本，唔好同日常真實平均月費混成一筆。",
              "牌面月費合計（月費 × 月數）唔等於真實總成本。",
              "完約後可能按月轉較高正價，簽約前問清楚通知期。雜費同路由器條款見 [月費以外：安裝費、預繳、合約](/guides/contract-fees)。",
            ],
          },
        ],
        paragraphs: [],
      },
      {
        heading: "四、六類常見情境點睇",
        flow: [
          {
            kind: "ol",
            items: [
              "**自置公屋／居屋／私樓、預計住滿三年以上：** 先查屋苑有冇指定屋苑 1000M 光纖計劃（公居屋約 HK$58–$98；私樓約 HK$88–$109）。如果唔打算轉台、又確定近期唔搬，先比較 24 個月同 36 個月約嘅真實平均月費同解約風險，而唔好只睇牌面。",
              "**兩年租約租客／唐樓住戶：** 唔好只為牌面月費較平，就簽 36 或 48 個月固網約。租約期滿若要搬，而新單位無該電訊商覆蓋，提早解約可能要賠剩餘月份。租客可先比較 24 個月光纖約，或者可搬遷嘅 5G 家居。見 [舊樓同唐樓寬頻點算](/guides/old-building-broadband)、[5G 家居點揀](/guides/home5g)。（2027 唐樓租客長稿待補，唔當已有新文。）",
              "**輪候公屋／簡約公屋／過渡性房屋住戶：** 簽固網前，向銷售員確認兩件事：合約期內獲派傳統公屋調遷時，會唔會豁免搬遷費；搬入公屋後月費點計。搬遷費視電訊商同合約而定，唔好當成全行劃一價。若唔想處理搬遷同拉線，可比較 12 至 24 個月或以上、可搬走嘅 5G 家居，但仍然有合約期。",
              "**2027 年新入伙公屋、居屋、綠置居及一手私樓：** 收到派匙／收樓信前 30 至 45 日，先核對邊間台已接通大廈機房。見 [2027 新入伙屋苑時間表](/guides/new-estate-intake-broadband-timeline)，並用 [新入伙屋苑專區](/new-intake) 對指定計劃。若收樓首月固網未裝好，**唔好為咗頂檔就簽 5G 家居死約**；短期過渡應用無合約預付數據卡。",
              "**新界村屋住戶：** 先核對具體門牌有冇中國移動香港指定地址優惠（1000M、24 個月 HK$218）或香港寬頻特選村屋計劃（例如 2000M、24 個月約 HK$229）。若被報系列正價 HK$378，或確認無光纖端口，先喺實際放機位置試 5G 訊號，再比較 5G 家居。5G 同光纖正價唔好直接換算「兩年慳幾多」：合約期、服務性質同雜費都唔同，牌面合計亦唔等於真實總開支。見 [村屋光纖點算](/guides/village)、[村屋光纖月費](/guides/village-fees)、[5G 家居點揀](/guides/home5g)。（2027 村屋長稿待補。）",
              "**經常北上大灣區嘅用家：** 手機合約到期前 60 至 90 日，比較中港澳三地共享數據計劃，並問清楚本地同跨境額度係唔係分開計。見 [大灣區手機計劃](/guides/gba-mobile)、[攜號轉台點樣做](/guides/port-in)。（2027 大灣區長稿待補。原稿月費區間未對到而家目錄，本頁唔引用。）",
            ],
          },
        ],
        paragraphs: [],
      },
      {
        heading: "五、完約轉台：建議預留 90 日",
        flow: [
          {
            kind: "p",
            text: "唔少人等到合約到期當日先格價，結果舊台按月收取較高嘅無約後價錢，或者新台安裝期接唔上。",
          },
          {
            kind: "ul",
            items: [
              "**完約前 75–90 日：** 適合先喺齊Quote 對同一屋苑、同一樓類嘅轉台參考價，掌握市場籌碼。舊台挽留優惠未必喺呢段就出到位。",
              "**完約前 30–45 日：** 比較舊台最終挽留方案同新台嘅牌面月費、合約期同真實平均月費。決定轉台嘅話，須按舊台要求提前通知終止（部分要求最少 30 日），以免多收一個月。",
              "**完約前 7–14 日：** 預約新台上門安裝及試通，預留重疊緩衝，等舊線截斷前新線已經穩定。寬頻唔能夠好似手機咁攜號過台；做法係先裝後停。步驟見 [轉寬頻點樣減少斷網](/guides/switch-broadband)。",
            ],
          },
        ],
        paragraphs: [],
      },
      {
        heading: "查詢覆蓋同參考計劃",
        flow: [
          {
            kind: "p",
            text: "唔想逐間電訊商官網翻細字嘅話，可以先喺齊Quote 按樓類篩選。2026-11-29 現網首頁顯示，站內可以一次過睇 **8 間電訊商、204 個參考計劃同 3,732 個屋苑**；目錄有兩種讀法（首頁計數同公開可篩選數未必相同），發佈前再數。呢句只記述當日首頁顯示，唔係全表核實。經本站查詢或轉介申請唔會另收費；營運方或會就部分轉介獲得報酬，細節見頁尾。你亦可撳下面 WhatsApp，話我哋知住址樓類同到期或入伙月份，幫你核對而家目錄入面嘅參考計劃。",
          },
          {
            kind: "ul",
            items: [
              "**家居／村屋寬頻：** 傳送「寬頻格價：[屋苑／村名＋樓類] + 預計完約／入伙月份，想對比 1000M／2500M 參考月費同合約期」",
              "**5G 家居／手機轉台：** 傳送「轉台查詢：[5G家居／手機大灣區]，想核對合約期、路由器同（如適用）行政費」",
            ],
          },
          {
            kind: "p",
            text: "[一鍵開啟 WhatsApp 6309 9966](https://wa.me/85263099966?text=%E4%BD%A0%E5%A5%BD%E9%BD%8AQuote%EF%BC%8C%E6%88%91%E6%83%B3%E6%9F%A5%E8%A9%A22027%E9%9B%BB%E8%A8%8A%E6%9C%88%E8%B2%BB%E6%AF%94%E8%BC%83%EF%BC%9A%E3%80%90%E5%B1%8B%E8%8B%91%EF%BC%8F%E5%9C%B0%E5%8D%80%EF%BC%8B%E6%A8%93%E9%A1%9E%E3%80%91%EF%BC%8C%E9%A0%90%E8%A8%88%E3%80%90%E6%9C%88%E4%BB%BD%E3%80%91%E6%9C%8D%E5%8B%99%E5%88%B0%E6%9C%9F%EF%BC%8F%E5%85%A5%E4%BC%99%E3%80%82)（電郵：info@chaiquote.hk）",
          },
        ],
        paragraphs: [],
      },
      {
        heading: "延伸閱讀",
        flow: [
          {
            kind: "ul",
            items: [
              "[寬頻合約總成本點計](/guides/broadband-total-cost)（現網頁；唔開未有嘅新 slug）",
              "[香港光纖點揀](/guides/fiber) ｜ [2026 家居寬頻 1000M 六大電訊表](/guides/home-broadband-2026)（年份快照頁；本頁係系列總樞紐，今輪唔改該頁、亦唔做 301）",
              "[公屋／居屋 1000M 參考月費](/guides/public-hos-fees) ｜ [公屋同居屋有咩分別](/guides/public-vs-hos) ｜ [私樓 1000M 參考月費](/guides/private-1000-fees)",
              "[1000M 同 2500M 點揀](/guides/1000m-or-2500m)",
              "[村屋光纖點算](/guides/village) ｜ [村屋光纖月費](/guides/village-fees)（2027 村屋長稿待補）",
              "[5G 家居點揀](/guides/home5g) ｜ [5G 家居數據上限同公平使用](/guides/home5g-data-cap)",
              "[舊樓同唐樓寬頻點算](/guides/old-building-broadband)（2027 唐樓租客長稿待補）",
              "[2027 新入伙屋苑時間表](/guides/new-estate-intake-broadband-timeline) ｜ [新入伙屋苑](/new-intake)",
              "[攜號轉台](/guides/port-in) ｜ [大灣區手機計劃](/guides/gba-mobile) ｜ [手機月費點揀](/guides/mobile)（2027 相關長稿待補）",
              "[商業寬頻點揀](/guides/business)（2027 固定 IP 長稿待補）",
              "[轉寬頻點樣減少斷網](/guides/switch-broadband) ｜ [月費以外](/guides/contract-fees)",
            ],
          },
        ],
        paragraphs: [],
      },
    ],
    faq: [
      {
        q: "2027 年香港公屋、居屋、私樓同村屋 1000M 光纖寬頻月費各幾錢？",
        a: "冇全港劃一價，要分樓類。站內 1000M 光纖參考：公屋／居屋約 HK$58 至 HK$98／月（有線指定屋苑 48 個月 HK$58，適用公屋、居屋、私樓，唔係公屋劃一價；香港寬頻 36 個月約 HK$98）；私樓約 HK$88 至 HK$109／月（例如有線私人樓宇 36 個月 HK$88；香港寬頻 24 個月 HK$109）。村屋唔好用上面價帶：中國移動香港村屋 1000M、24 個月、指定地址優惠 HK$218，同系列正價 HK$378，豁免安裝費原價 HK$680，唔等於所有村屋都係呢個價；香港寬頻特選村屋 2000M、24 個月約 HK$229；網上行村屋 2500M 例子為 HK$376（村屋月費頁寫 36 個月，目錄另有同牌面 24 個月卡），唔好同中國移動香港正價 HK$378 混寫成一律完約正價。僅供參考，以電訊商確認為準。",
      },
      {
        q: "點樣計算寬頻合約期內總開支，先唔會只睇牌面月費？",
        a: "完整計法見〈寬頻合約總成本點計〉。計劃卡同比較表用牌面月費並排；要用家自己將合約期內要付嘅月費、未豁免安裝費、預繳同合約列明嘅其他收費加起來，減走確定現金回贈同禮券面值，再除以合約總月數，得出真實平均月費。真實平均月費只供判斷，唔取代站內牌面月費引用。行政費 HK$18 或 HK$28 只見於部分手機計劃，唔好預設加喺光纖或 5G 家居。若簽 36 至 48 個月長約，要一併考慮搬屋或新地址無覆蓋嘅解約風險。牌面月費乘合約月數，唔等於真實總成本。",
      },
      {
        q: "公屋、簡約公屋或租客合約期內搬屋，寬頻搬遷費要幾錢？有冇得豁免？",
        a: "搬遷費視電訊商同合約而定，簽約前要問清楚合約期內調遷或搬屋可唔可以豁免，以及新地址若改為公屋地段，剩餘月份月費點計。實際收費以電訊商確認及正式合約為準。",
      },
      {
        q: "5G 家居寬頻可唔可以只用一兩個月做過渡？月費同合約期係點？",
        a: "唔可以當一兩個月即棄計劃。站內 5G 家居參考約 HK$88 至 HK$190／月，例如中國移動香港 350GB、48 個月 HK$88（各樓類可用）；3香港真無限 48 個月 HK$138 只限公屋／居屋。主流計劃設最少 12 至 24 個月合約，部分達 36 至 48 個月。若只係等固網安裝一兩個月，應使用無合約預付數據卡，而唔好簽約 5G 家居寬頻。數據上限同用完之後點算，見〈5G 家居數據上限同公平使用〉。僅供參考，以電訊商確認為準。",
      },
      {
        q: "2027 年香港入門手機月費同大灣區中港澳數據計劃大約幾錢？",
        a: "目錄仍見牌面約 HK$38／月嘅手機計劃，但部分標明限時至 2026-09-30，該日已過；另有須符合長者資格先適用嘅計劃。視計劃、合約同行政費，唔係劃一價。包含中國內地及澳門共享數據嘅大灣區計劃，要以當時計劃卡同電訊商條款為準。簽約前須核對係唔係另收每月 HK$18 至 HK$28 行政費；呢筆行政費只見於部分手機計劃，唔好套去光纖或 5G 家居。攜號轉台同大灣區條款，見〈攜號轉台點樣做〉同〈大灣區手機計劃〉。僅供參考，以電訊商確認為準。",
      },
    ],
    faqEn: [
      {
        q: "What do 1000M fibre fees look like in 2027 for public housing, HOS, private estates and village houses?",
        a: "There is no territory-wide price. Sort by housing type. Listed 1000M fibre references: public housing and HOS about HK$58 to HK$98 a month (i-Cable named estates, 48 months, HK$58, also listed for public housing, HOS and private estates, not a public-housing flat price; HKBN about HK$98 for 36 months); private estates about HK$88 to HK$109 a month (for example i-Cable private buildings, 36 months, HK$88; HKBN about HK$109 for 24 months). Do not use those bands for village houses: CMHK village 1000M, 24 months, specified-address promo HK$218, list price in the same series HK$378, installation waived from HK$680, and that is not the price at every village house; HKBN selected village 2000M is about HK$229 for 24 months; a Netvigator village 2500M example is HK$376 (the village fee page writes 36 months, and the catalogue also has a 24-month card at the same labelled fee). Do not mix HK$376 with the CMHK list price of HK$378. For reference only; the carrier confirms.",
      },
      {
        q: "How do I work out in-contract spend instead of stopping at the labelled monthly fee?",
        a: "The full method is on the broadband total-cost guide. Plan cards and comparison tables line up the labelled monthly fee. Add the fees you pay over the term, any install fee that is not waived, prepayment and other charges written in the contract, subtract confirmed cash rebates and voucher face values, then divide by the number of contract months. That average is for your own judgement and does not replace the labelled fee quoted on this site. An admin fee of HK$18 or HK$28 appears only on some mobile plans. Do not assume it on fibre or 5G home. A 36- to 48-month term also carries early-exit risk if you move or the new address has no coverage. Labelled fee times months is not the true total cost.",
      },
      {
        q: "If I move during a public-housing, light public housing or rental contract, what is the broadband relocation fee, and can it be waived?",
        a: "The relocation fee depends on the carrier and the contract. Before you sign, ask whether a move during the term can be waived, and how the remaining months are priced if the new address is public housing. The carrier and the signed contract confirm the charge.",
      },
      {
        q: "Can 5G home broadband be used for only a month or two as a stopgap? What are the fee and the term?",
        a: "Do not treat it as a one- or two-month throwaway plan. Listed 5G home references are about HK$88 to HK$190 a month, for example CMHK 350GB, 48 months, HK$88 (all housing types) and 3 Hong Kong unlimited, 48 months, HK$138 (public housing and HOS only). Mainstream plans have a minimum term of 12 to 24 months, and some run 36 to 48 months. If you are only waiting a month or two for fibre, use a no-contract prepaid data SIM instead of signing a 5G home contract. What happens after the data allowance is on the 5G home data-cap guide. For reference only; the carrier confirms.",
      },
      {
        q: "What do entry mobile fees and Greater Bay Area plans look like in 2027?",
        a: "The catalogue still lists some mobile plans at a labelled HK$38 a month, but some are marked limited until 30 September 2026, and that date has passed. Another plan at that labelled fee is for eligible seniors. It depends on the plan, the contract and any admin fee. It is not one price. Greater Bay Area plans that include mainland China and Macau data follow the plan card and the carrier’s terms. Before you sign, check whether a monthly admin fee of HK$18 or HK$28 applies. That fee appears only on some mobile plans, not on fibre or 5G home. Number porting and GBA terms are on those two guides. For reference only; the carrier confirms.",
      },
    ],
    bodyEn: [
      {
        heading: "What to separate in 60 seconds",
        flow: [
          { kind: "p", text: "Copy revised 29 November 2026 (Hong Kong time). For renewals, switches and new-home planning from late 2026 into 2027. Figures follow locked on-site bands and were checked again against the plan catalogue. This is a copy-revision date, not a date on which every figure was re-verified." },
          { kind: "p", text: METHOD_EN },
          {
            kind: "p",
            text: "Hong Kong telecoms has no territory-wide price list. The same speed can differ by housing type (public, HOS, private, village) and by contract length (often 24 to 48 months). Labelled-fee totals can differ by thousands of dollars when the housing type or the term differs, but a labelled-fee total is not the true in-contract spend. This page is the series hub. The [2026 six-carrier 1000M table](/guides/home-broadband-2026) stays the 1000M snapshot. The two pages are not merged.",
          },
          {
            kind: "ul",
            items: [
              "**Public housing and HOS, 1000M fibre:** about **HK$58 to HK$98 a month**. Example: [i-Cable named estates, 48 months, HK$58](/plans/icable-ftth-1000-48m-58), listed for public housing, HOS and private estates, not a public-housing flat price. Do not estimate two years as HK$58 × 24. [HKBN, 36 months, about HK$98](/plans/hkbn-ftth-1000-36m-98). Public housing and HOS are often separate plans.",
              "**Private estates, 1000M fibre:** about **HK$88 to HK$109 a month**. Example: [i-Cable private buildings, 36 months, HK$88](/plans/icable-ftth-1000-private-36m); [HKBN, 24 months, about HK$109](/plans/hkbn-ftth-1000-24m-109) (that card also lists public housing and HOS; follow the card).",
              "**Village fibre:** do not use the bands above. [CMHK village 1000M, 24 months, specified-address promo HK$218](/plans/cmhk-ftth-1000-village-24m-218), list price in the same series [HK$378](/plans/cmhk-ftth-1000-village-24m-378), installation waived from **HK$680**. Not every village house is that price. [HKBN selected village 2000M, 24 months, about HK$229](/plans/hkbn-village-2000-24m). Netvigator village 2500M example **HK$376**: the village fee page writes [36 months](/plans/netvigator-ftth-2500-village-36m); the catalogue also has a [24-month card](/plans/netvigator-ftth-2500-village-24m) at the same labelled fee. Do not mix HK$376 with the CMHK list price of HK$378, and do not multiply HK$376 by one term and call it every village’s list-price total. Village fibre on this site includes CMHK, HKBN, HGC and Netvigator. i-Cable and SmarTone home-fibre plans are not for village houses. Coverage at the village entrance is not coverage inside the house.",
              "**5G home, no cabling:** published labelled fees about **HK$88 to HK$190 a month**, not one price. Example: [CMHK 350GB, 48 months, HK$88](/plans/cmhk-home5g-350-48-88), all housing types. [3 Hong Kong unlimited, 48 months, HK$138](/plans/three-home5g-unlimited-48-138-public) is public housing and HOS only; [30 months, HK$158](/plans/three-home5g-b-158) is all housing types. Useful where fibre is not in, for a rental, or when you are in a hurry. Not a substitute for fixed fibre. Mainstream terms are 12 to 24 months, some 36 to 48. **Not a one- or two-month bridge.**",
              "**Mobile and Greater Bay Area:** the catalogue still lists mobile plans at a labelled **HK$38 a month**, but some are marked limited until 30 September 2026, and that date has passed. Another is for eligible seniors. Not one price. This page does not quote a GBA monthly band that was not confirmed in the current catalogue. An admin fee of HK$18 or HK$28 appears only on some mobile plans. Do not apply it to fibre or 5G home.",
              "**Small-business broadband:** shops and commercial addresses often start at 1000M and may add a static IP. Price the commercial registration and the shop cabling separately. Do not reuse a home price.",
            ],
          },
        ],
        paragraphs: [],
      },
      {
        heading: "Housing types, 5G home, mobile and business",
        paragraphs: [
          "The “labelled-fee total” column is the labelled monthly fee times the number of contract months. It does **not** include free months, rebates, prepayment, an install fee that was not waived, or other charges. It is **not** true in-contract spend. See [how total contract cost is counted](/guides/broadband-total-cost).",
        ],
        matrix: {
          caption:
            "ChaiQuote 2027 reference fees and labelled-fee totals (copy revised 29 November 2026; re-check the catalogue before citing).",
          headers: [
            "Service / housing",
            "Carriers",
            "Listed reference fee",
            "Typical term",
            "Labelled-fee total (not true cost)",
            "Clause to read",
            "Guide",
          ],
          rows: [
            [
              "Public housing 1000M",
              "i-Cable, HKBN, CMHK, HGC, Netvigator, SmarTone, where the estate is covered",
              "HK$58–98 a month",
              "24–48 months",
              "Example: 24 × HK$98 = HK$2,352; 48 × HK$58 = HK$2,784. Labelled totals only. Do not use HK$58 × 24.",
              "Lower labelled fees are often tied to 36–48 month terms. A move may have a relocation fee. Ask about a waiver before you sign. This page states no flat relocation range.",
              "[Public / HOS 1000M](/guides/public-hos-fees), [public vs HOS](/guides/public-vs-hos)",
            ],
            [
              "HOS / Green Form 1000M",
              "Same carriers, priced on the subsidised-housing list",
              "Start from the same about HK$58–98 band; a named estate can differ. Follow the plan card.",
              "24–48 months",
              "Same method as public housing: labelled fee times months, then your own average from that contract.",
              "Do not reuse a private-estate price. Public housing and HOS are often separate plans. Early in a new HOS intake, not every carrier has the building live.",
              "[2027 intake timeline](/guides/new-estate-intake-broadband-timeline), [new-intake estates](/new-intake)",
            ],
            [
              "Private estate 1000M",
              "The six fixed-network carriers, where the estate is covered",
              "1000M: HK$88–109 a month",
              "24–36 months",
              "Example: 24 × HK$88 = HK$2,112; 24 × HK$109 = HK$2,616.",
              "Confirm 2500M coverage before you compare cost, and whether the router is a gift, included, or returned. This page does not freeze an unverified 2500M band.",
              "[Private 1000M](/guides/private-1000-fees), [1000M or 2500M](/guides/1000m-or-2500m)",
            ],
            [
              "Village fibre",
              "CMHK, HKBN, HGC, Netvigator",
              "Specified-address promo: CMHK 1000M, 24 months, HK$218. HKBN selected village 2000M, 24 months, about HK$229. CMHK list price HK$378. Netvigator village 2500M example HK$376.",
              "Follow each plan, often 24 or 36 months",
              "Example: CMHK promo 24×218 = HK$5,232; list price 24×378 = HK$9,072; HKBN 24×229 = HK$5,496. Do not turn HK$376 into a list-price total by multiplying one term.",
              "Two door numbers can differ. Coverage at the village entrance is not coverage indoors. HK$376 is not the CMHK list price of HK$378.",
              "[Village fibre](/guides/village), [village fees](/guides/village-fees). A 2027 village long guide is still to be written.",
            ],
            [
              "5G home, no cabling",
              "CMHK, 3 Hong Kong, SmarTone, csl, HKBN, as listed",
              "About HK$88–190 a month. Example: CMHK 350GB, 48 months, HK$88 (all housing). 3 Hong Kong unlimited, 48 months, HK$138, public housing and HOS only.",
              "12–48 months, often 24–48",
              "A 24-month sketch is 24×88 = HK$2,112 and 24×190 = HK$4,560. The real term may not be 24 months. Separate SIM-only from a router bundle. Labelled totals only.",
              "SIM-only, rented router, or a gifted router are different. Some plans cap high-speed data. There is a term. Not a one- or two-month bridge.",
              "[Choose 5G home](/guides/home5g), [data cap and fair use](/guides/home5g-data-cap)",
            ],
            [
              "Mobile and Greater Bay Area",
              "Mobile networks and MVNOs",
              "Some cards still show a labelled HK$38 a month, including plans marked limited until 30 September 2026 (that date has passed) and a senior plan. Not one price. No unverified GBA band is quoted here.",
              "Often 12–24 months, sometimes longer",
              "A 12-month labelled total depends on the fee. If that mobile plan adds an admin fee, count it separately. Do not assume every plan has one, or that none do.",
              "HK$18 or HK$28 admin fees appear only on some mobile plans. Ask whether a waiver covers the whole term. Local and cross-border quotas are often separate.",
              "[Number porting](/guides/port-in), [GBA mobile](/guides/gba-mobile), [mobile fees](/guides/mobile). 2027 long guides are still to be written.",
            ],
            [
              "Small-business broadband",
              "Commercial arms of the main carriers",
              "Often from 1000M, quoted for the building or shop, not a home price",
              "Often 24–36 months",
              "Count a static IP and shop cabling on that commercial contract.",
              "A valid business registration is usually required. CCTV and tills need the static-IP clause checked.",
              "[Business broadband](/guides/business). A 2027 static-IP long guide is still to be written.",
            ],
          ],
        },
      },
      {
        heading: "Six fixed-network carriers",
        paragraphs: [
          "No one sentence can say which broadband is right. Sort the housing type and the address, then line up labelled fees for the same housing type and the same speed, plus the term and the router. The ranges below follow the on-site 1000M references and the village page. **They reuse current on-site prices and still need checking.** They are not a ranking.",
        ],
        matrix: {
          caption: "Six fixed-network carriers. On-site 1000M references, still to be checked. Not a ranking.",
          headers: ["Carrier", "Coverage", "Price and contract", "Check before you sign"],
          rows: [
            [
              "i-Cable",
              "Named public housing, HOS and some private estates",
              "Named-estate 1000M can show 48 months at HK$58 (public, HOS and private; not village). Private buildings also commonly show about HK$88 for 36 months. The on-site 1000M reference is about HK$58–68, excluding myTV bundles.",
              "Many plans need a 36- to 48-month term and a named-estate list.",
            ],
            [
              "HKBN",
              "Public, HOS, private and selected village houses",
              "On-site 1000M reference about HK$98–109. A 24-month card is about HK$109 and also lists public housing and HOS. Selected village 2000M, 24 months, about HK$229.",
              "Some plans bundle streaming or a router. Separate a bare line from a bundle. Flash prices are not a standing price.",
            ],
            [
              "CMHK",
              "Private estates, specified village addresses, and 5G home",
              "On-site fibre 1000M reference about HK$88–98. Village specified-address 1000M, 24 months, promo HK$218, list price HK$378. 5G home 350GB, 48 months, HK$88.",
              "The village promo needs the exact address. 5G home needs the data cap and the router return clause.",
            ],
            [
              "HGC",
              "Single private blocks, large estates and some village sections",
              "On-site 1000M reference about HK$75–89 (private estates commonly about HK$89). Current on-site prices, still to be checked.",
              "Ask whether installation is waived, and what renewal looks like.",
            ],
            [
              "Netvigator",
              "A wide footprint, including some village and outlying addresses",
              "On-site 1000M reference about HK$108. Village 1000M, 36 months, example HK$278. Village 2500M example HK$376 (the fee page writes 36 months; the catalogue also has a 24-month card at the same labelled fee).",
              "A sole-provider street may have fewer choices. Overseas latency is user comment, not a test result from this site.",
            ],
            [
              "SmarTone home fibre",
              "Named public, HOS and private estates. Village homes more often look at 5G home.",
              "On-site 1000M reference about HK$88. Not for village houses. Current on-site prices, still to be checked.",
              "A mobile-and-broadband bundle can tie a later mobile switch to the home line. Price them apart once.",
            ],
          ],
        },
      },
      {
        heading: "Labelled fee and in-contract spend",
        paragraphs: [
          "Plan cards, comparison tables and the opening cite use the **labelled monthly fee**. That number is **not** what you average across the whole contract.",
          "Add what you pay over the term, divide by the number of months, and you get an **average monthly cost** for your own judgement. It does not replace the labelled fee. The formula and the worked example are on [total contract cost](/guides/broadband-total-cost). This page does not invent a new worked example, and it does not add a mobile admin fee onto a fibre example.",
          "A 36- to 48-month term can mean an early-exit charge if you move or the new address has no coverage. Labelled fee times months is not true total cost. Ask about the out-of-contract price and the notice period. Other charges: [install, prepay, contract](/guides/contract-fees).",
        ],
      },
      {
        heading: "Six situations",
        flow: [
          {
            kind: "ol",
            items: [
              "**Owner-occupier staying three years or more:** check whether the estate has a named 1000M plan (public / HOS about HK$58–98; private about HK$88–109). If you are not switching and not moving, compare the average and the exit risk of a 24-month term and a 36-month term. Do not stop at the labelled fee.",
              "**Two-year tenant or a walk-up:** do not sign a 36- or 48-month fibre contract only because the labelled fee looks lower. If the next flat has no coverage, early exit can cost the remaining months. Compare a 24-month fibre term or a 5G home plan you can take with you. See [older buildings](/guides/old-building-broadband) and [5G home](/guides/home5g). A 2027 tenant long guide is still to be written.",
              "**Waiting for public housing, light public housing, or transitional housing:** before you sign, ask whether a move into traditional public housing waives the relocation fee, and how the fee is counted after the move. The fee is not an industry-wide figure. A 5G home plan can move with you, but it still has a term.",
              "**2027 intake, public, HOS, Green Form or a new private flat:** about 30 to 45 days before the key letter, check which carriers have the building live. See the [2027 intake timeline](/guides/new-estate-intake-broadband-timeline) and the [new-intake list](/new-intake). If fibre is not ready in the first month, **do not sign a long 5G home contract as a bridge.** Use a no-contract prepaid data SIM.",
              "**Village house:** check the exact address for the CMHK specified-address promo (1000M, 24 months, HK$218) or an HKBN selected-village plan (for example 2000M, 24 months, about HK$229). If you are quoted the HK$378 list price, or there is no fibre port, test 5G where the router would sit. Do not convert 5G and fibre list prices into “how much you save over two years”. See [village fibre](/guides/village). A 2027 village long guide is still to be written.",
              "**Frequent trips to the Greater Bay Area:** 60 to 90 days before the mobile contract ends, compare plans that share data across Hong Kong, the mainland and Macau, and ask whether local and cross-border quotas are separate. See [GBA mobile](/guides/gba-mobile) and [number porting](/guides/port-in). A 2027 GBA long guide is still to be written. An unverified monthly band from an earlier draft is not quoted here.",
            ],
          },
        ],
        paragraphs: [],
      },
      {
        heading: "Leave about 90 days before the contract ends",
        flow: [
          {
            kind: "ul",
            items: [
              "**75–90 days before the end:** compare reference prices for the same estate and the same housing type. A retention offer may not be on the table yet.",
              "**30–45 days before the end:** compare the final retention offer with the new carrier’s labelled fee, term and your own average. If you switch, give the notice the old contract requires.",
              "**7–14 days before the end:** book the new install and a test, with overlap so the new line is stable before the old one stops. Broadband cannot port a number. Install first, then stop. See [switching broadband](/guides/switch-broadband).",
            ],
          },
        ],
        paragraphs: [],
      },
      {
        heading: "Check coverage and the listed plans",
        paragraphs: [
          "On 29 November 2026 the homepage showed **8 carriers, 204 reference plans and 3,732 estates**. The catalogue can be counted more than one way (the homepage count and the number of plans you can filter are not always the same). Recount before you cite it. That sentence records what the homepage showed. It is not a full-table verification. Enquiries and referred applications through this site are not charged an extra fee; the operator may receive remuneration for some referrals. Details are in the footer.",
          "Home or village: send the estate or village, the housing type, and the month the contract ends or you move in. 5G home or mobile: send the district, whether you need a router, and the term you want to compare. Admin fees apply only where the mobile plan says so.",
          "[Open WhatsApp 6309 9966](https://wa.me/85263099966?text=%E4%BD%A0%E5%A5%BD%E9%BD%8AQuote%EF%BC%8C%E6%88%91%E6%83%B3%E6%9F%A5%E8%A9%A22027%E9%9B%BB%E8%A8%8A%E6%9C%88%E8%B2%BB%E6%AF%94%E8%BC%83%EF%BC%9A%E3%80%90%E5%B1%8B%E8%8B%91%EF%BC%8F%E5%9C%B0%E5%8D%80%EF%BC%8B%E6%A8%93%E9%A1%9E%E3%80%91%EF%BC%8C%E9%A0%90%E8%A8%88%E3%80%90%E6%9C%88%E4%BB%BD%E3%80%91%E6%9C%8D%E5%8B%99%E5%88%B0%E6%9C%9F%EF%BC%8F%E5%85%A5%E4%BC%99%E3%80%82) (email: info@chaiquote.hk).",
        ],
      },
      {
        heading: "Further reading",
        flow: [
          {
            kind: "ul",
            items: [
              "[Total contract cost](/guides/broadband-total-cost)",
              "[How to choose fibre](/guides/fiber) and the [2026 six-carrier 1000M table](/guides/home-broadband-2026). This hub does not replace that snapshot, and this preview does not redirect it.",
              "[Public / HOS 1000M](/guides/public-hos-fees), [public vs HOS](/guides/public-vs-hos), [private 1000M](/guides/private-1000-fees), [1000M or 2500M](/guides/1000m-or-2500m)",
              "[Village fibre](/guides/village) and [village fees](/guides/village-fees). A 2027 village long guide is still to be written.",
              "[5G home](/guides/home5g) and [data caps](/guides/home5g-data-cap)",
              "[Older buildings](/guides/old-building-broadband). A 2027 tenant long guide is still to be written.",
              "[2027 intake timeline](/guides/new-estate-intake-broadband-timeline) and [new-intake estates](/new-intake)",
              "[Number porting](/guides/port-in), [GBA mobile](/guides/gba-mobile), [mobile fees](/guides/mobile), [business broadband](/guides/business). Those 2027 long guides are still to be written.",
              "[Switch broadband](/guides/switch-broadband) and [fees beyond the monthly price](/guides/contract-fees)",
            ],
          },
        ],
        paragraphs: [],
      },
    ],
  },
  {
    slug: "new-estate-intake-broadband-timeline",
    minutes: 12,
    category: "fiber",
    seoTitle: "2027 新入伙屋苑寬頻：收樓時間表同拉線避伏｜齊Quote",
    h1: "2027 新入伙屋苑寬頻：收樓時間表同拉線避伏",
    description:
      "整理 2027 年附近香港新入伙公屋、居屋、綠置居同私樓嘅收樓寬頻規劃：預查同拉線時間軸、調遷時要問嘅搬遷費，以及 5G 家居唔好當短期過渡。預計關鍵日期唔等於收樓日，亦唔等於全部固網商已接通。屋苑名單同指定優惠，見齊Quote 新入伙專區。",
    title: "2027 新入伙屋苑寬頻：收樓時間表同拉線避伏",
    excerpt: "預計關鍵日期唔等於收樓日，亦唔等於全部固網商已接通。名單同指定優惠見新入伙專區。",
    titleEn: "2027 new-estate broadband: intake timeline and cabling notes",
    excerptEn:
      "A key date is not your handover day, and it does not mean every carrier is live. Named offers stay on the new-intake page.",
    descriptionEn:
      "Planning broadband for Hong Kong public housing, HOS, Green Form and private intakes around 2027: when to check coverage, how to cable during renovation, what to ask about a relocation fee, and why 5G home is not a short bridge. A key date is not the handover day and does not mean every carrier is connected. Estate names and named offers are on the ChaiQuote new-intake page.",
    h1En: "2027 new-estate broadband: intake timeline and cabling notes",
    published: "2026-11-29",
    modified: "2026-11-29",
    opening: [
      {
        text: "教學文案修訂：2026-11-29。部分屋苑落成／關鍵日期、戶數同搬遷費今日未全部獨立核實，或以官方完成報告已有更新，下表唔當作全表已核或收樓保證。",
      },
      {
        text: "齊Quote 唔係電訊商官網、附屬機構或官方客服；用公開市場資料、按同一標準整理，用家自己比較、自己揀計劃。經本站查詢或轉介申請唔會另收費；報酬披露見頁尾。樓盤入伙同收樓日期以官方或發展商書面通知為準；覆蓋、收費同條款以電訊商確認及正式合約為準。",
      },
    ],
    disclaimer: INTAKE_DISCLAIMER,
    disclaimerEn: INTAKE_DISCLAIMER_EN,
    related: [
      "hk-telecom-broadband-price-comparison",
      "fiber",
      "broadband-total-cost",
      "public-vs-hos",
      "public-hos-fees",
      "private-1000-fees",
      "1000m-or-2500m",
      "router-wifi",
      "home5g",
      "home5g-data-cap",
    ],
    plans: [{ href: "/new-intake", label: "去新入伙專區對名單", labelEn: "Open the new-intake list" }],
    estates: [
      { href: "/new-intake", label: "新入伙屋苑", labelEn: "New-intake estates" },
      { href: "/guides/hk-telecom-broadband-price-comparison", label: "2027 月費總樞紐", labelEn: "2027 fee hub" },
    ],
    body: [
      {
        heading: "60 秒先記兩條",
        paragraphs: [
          "2027 年附近有多個公屋、居屋、綠置居、房協資助房屋同私樓項目分階段入伙或收樓。第一，「預計關鍵日期」唔等於全部固網商已經接通機樓，亦唔等於你嘅個人收樓日；入伙初期往往只有率先完成接駁嘅一兩間電訊商可以即時安裝。指定新入伙計劃只適用於電訊商名單內嘅屋苑，名單同有冇指定優惠，去 [新入伙屋苑寬頻專區](/new-intake) 對。第二，全棟集中收樓時安裝檔期會較緊，收到派匙或收樓通知前大約 30 至 45 日，宜先查嗰座覆蓋，並盡量喺驗樓同裝修拉線階段穿好入屋光纖，減少封牆後難穿暗喉、或者入伙之後先至等裝。",
          "站內 1000M 牌面月費參考，見 [香港光纖點揀](/guides/fiber)：公居屋約 HK$58–98／月，私樓約 HK$88–109／月。HK$58 係有線寬頻指定屋苑 48 個月計劃，適用於公屋／居屋／私樓，唔好當成公屋劃一價。實際覆蓋同收費，以電訊商確認同你張計劃卡為準。合約期內總開支同實際平均月費，見 [寬頻合約總成本點計](/guides/broadband-total-cost)，唔好同牌面月費混名。系列總樞紐見 [2027 香港電訊及寬頻月費比較](/guides/hk-telecom-broadband-price-comparison)。",
        ],
      },
      {
        heading: "2027 年附近焦點項目：公開資料同預查備註",
        paragraphs: [
          "下表整理公開資料入面、同 2026 年底至 2027 年收樓或入伙規劃相關嘅焦點項目，方便排預查同裝修檔期。**「預計關鍵日期」係發展項目遵照批准建築圖則完成嘅預計日期，唔等於個人收樓或派匙日，亦可以由賣方或建築師按合約延期；實際以官方或發展商書面通知為準。** 「站內名單」指齊Quote 新入伙名稱表。寫「未見」只代表呢份名稱表未見嗰個名稱，唔等於沒有官方項目，亦唔等於可以借用其他屋苑價。居屋 2025 入面，委員會文件把啟陽苑、影輝苑、朗風苑寫成 2028 年預計，匯熙苑寫 2027 年第三季；呢啲都唔寫進下表，亦唔當保證收樓日。裕興苑唔等於裕豐苑。",
        ],
        matrix: {
          caption:
            "2027 年附近焦點項目。公開資料加預查備註。文案修訂 2026-11-29。唔係收樓保證，亦唔係全表已核。",
          headers: ["屋苑／項目", "地區", "公開資料（唔等於收樓保證）", "站內新入伙名單", "寬頻規劃備註"],
          rows: [
            [
              "鳳凰嶺邨（公屋）",
              "北區（粉嶺北）",
              "區議會文件／房委會商場頁：6 座，約 6,168 伙；分兩期，文件預計第一期 2026 年第 3 季、第二期 2027 年第 1 季竣工。房委會工程項目完成報告（2025-10-01 至 2026-09-30）已列 1 座、1,040 個單位新落成。",
              "已有名稱",
              "大型新邨，剩餘座數仍可能分批入伙。以房委會派匙通知為準，先查嗰座邊間台已接通，再對專區指定計劃。",
            ],
            [
              "雋東邨（公屋）",
              "離島（東涌）",
              "完成報告已列 5 座、5,200 個單位於 2025-10-01 至 2026-09-30 期間新落成。房委會商場頁曾寫預計 2026 年中分階段落成。「2026/27 年度分階段落成」已過時。",
              "已有名稱",
              "宜當已有座數入伙嘅新邨去查覆蓋同指定計劃，唔好再寫成尚未落成嘅 2027 規劃盤。",
            ],
            [
              "麗玥苑（綠置居）",
              "深水埗（長沙灣）",
              "綠置居 2023 售樓須知／說明書曾列預計關鍵日期 2027 年 4 月 30 日；住宅物業總數 2,359。完成報告已列 3 座、2,359 個單位於上述期間新落成。",
              "未見",
              "唔好再把 2027 年 4 月 30 日寫成未來收樓窗口。實際交樓以房委會書面通知為準；指定優惠仍要名稱入到電訊商名單。",
            ],
            [
              "兆湖苑（居屋）",
              "屯門",
              "居屋 2024 售樓說明書：預計關鍵日期 2027 年 4 月 30 日，受買賣協議允許延期規限；說明書寫明預計關鍵日期唔等於買方收樓日。完成報告（至 2026-09-30）未列此苑。委員會文件見 2,768 伙。",
              "未見",
              "收樓通知前大約 30 至 45 日查已開通固網商；對總成本時用牌面月費加條款，見總成本攻略。",
            ],
            [
              "裕豐苑（居屋）",
              "東涌擴展區",
              "居屋 2025 新盤。官方一般銷售資料：單位預計分別在 2027 至 2028 年落成。本表唔寫死季度。唔好同站內已有嘅裕興苑混名。",
              "未見（唔好同裕興苑混淆）",
              "新發展區固網或會分批進駐。短等固網只用無合約數據卡；5G 家居若作主力，要接受其合約期。",
            ],
            [
              "朗然（房協資助房屋）",
              "觀塘",
              "房協 2025-10-17 新聞稿：項目關鍵日期為 2027 年 3 月 31 日。",
              "已有名稱",
              "交樓通知前 30 至 45 日預查。房協項目或附基本交樓裝修，拉線時沿原有通訊管道，避免亂鑽牆。",
            ],
            [
              "樂啟軒（房協）",
              "啟德",
              "房協「樂啟都匯」頁：樂啟軒將提供 700 個單位，預計關鍵日期為 2027 年 3 月 31 日。",
              "未見",
              "名稱唔好同「樂啟都匯」出租部分混成一個新名。指定優惠仍視電訊商名單。",
            ],
            [
              "聚然（房協資助房屋）",
              "粉嶺",
              "房協 2026-01-23 新聞稿：關鍵日期為 2027 年 9 月 30 日。",
              "未見",
              "以房協書面通知為準。唔好同朗然、樂啟軒合成一行。",
            ],
            [
              "PORTO（私人住宅）",
              "南區（鴨脷洲）",
              "原稿曾寫預計關鍵日期 2027 年 2 月 28 日。公開來源對呢個日期並不一致，標為原稿數字、未獨立核實。本表唔寫死日期。",
              "未見",
              "簽約前核對大廈機房已接通嘅固網商名單，同專區／私樓計劃卡。",
            ],
            [
              "雲向（私人住宅）",
              "北區（上水粉錦公路）",
              "公開售樓說明書摘錄見預計關鍵日期 2027 年 3 月 31 日，並註受買賣合約允許延期規限。戶數同日期上線前要用官方指定網站再核。本表唔把戶數寫成已核。",
              "未見",
              "比較 1000M／2500M 同路由器世代時，見現網速度同路由器攻略，唔好當成新盤一定有 2500M 或 Wi-Fi 7。",
            ],
            [
              "簡約公屋（已公布項目）",
              "現頁已有多個簡約公屋名稱；另有觀塘順利邨道、黃大仙竹園道",
              "房屋局 2026-10-16 公報及公屋輪候頁：其餘項目已陸續入伙；觀塘順利邨道及黃大仙竹園道由校舍改建，合共約 210 個單位，預計 2027 年第一季落成啟用。官方名稱用「順利邨道」。",
              "現頁已有多個簡約公屋名稱；順利邨道同竹園道未見",
              "屬過渡居住性質，忌盲簽 36 至 48 個月長約。簽固網前必問日後上傳統公屋或調遷時會唔會豁免搬遷費（金額以合約為準），或評估搬屋可以跟身走嘅 5G 家居。",
            ],
          ],
        },
      },
      {
        heading: "新居收樓裝寬頻時間軸",
        flow: [
          {
            kind: "p",
            text: "無論你係抽中新居屋、獲派新公屋，定係買咗一手私樓，裝修同拉寬頻嘅先後，會影響入伙之後有冇網用。",
          },
          {
            kind: "ol",
            items: [
              "**收樓／派匙前 30 至 45 日（預查邊間台已開通）：** 唔好見街站傳單就即刻簽名。新屋苑落成初期，有時 A 台已經通咗光纖可以裝，B 台雖然收單，但其實大廈機房未完工，簽咗約或要再等。先查清楚邊間台已經正式開通你嗰座嘅機樓 Port 位。名單同指定優惠，去 [新入伙專區](/new-intake) 對；可唔可以預約、幾時裝到，見專區已鎖說明，並以電訊商確認為準。",
              "**收匙驗樓及裝修開工首週（定位同穿入屋暗喉）：** 公屋／綠置居若準備間房，趁未封石膏板或訂造全高入牆櫃前，先決定路由器擺位，由大門側通訊箱預留足夠暗喉（建議留低拉線引線）；若計劃用較高速率或 Mesh Wi-Fi，宜為睡房預先鋪設 Cat6 或 Cat6A 網線，減少主力牆阻隔。1000M 同 2500M 點揀，見 [1000M 同 2500M 寬頻點揀](/guides/1000m-or-2500m)；路由器擺位同 Wi-Fi 世代，見 [寬頻路由器點揀](/guides/router-wifi)。一手私樓或附裝修單位，驗樓時打開弱電箱／通訊箱，確認喉管無被建築廢料塞住。",
              "**預計入住前 14 至 21 日（預約師傅上門拉線）：** 新盤多戶一齊約週末裝機，熱門時段較易滿。較理想係傢俬進場前、油漆完工後約師傅穿光纖試通，搬入當日先至插電用。實際檔期以電訊商確認為準。",
            ],
          },
        ],
        paragraphs: [],
      },
      {
        heading: "新盤準住戶要留意嘅三個伏位",
        flow: [
          {
            kind: "h3",
            text: "1. 簡約公屋、過渡性房屋同預計調遷：忌盲簽超長約，先問搬遷費豁免",
          },
          {
            kind: "p",
            text: "牌面月費睇落平，唔等於合約期內總開支平；有啲計劃會綁 36 至 48 個月合約。點計牌面同平均月費，見 [寬頻合約總成本點計](/guides/broadband-total-cost)。如果你住緊簡約公屋、過渡性房屋，或者預計兩三年內有機會獲派傳統公屋或調遷，簽約前要向電訊商問清楚，並核對合約細則：合約期內因公屋編配或調遷搬屋，會唔會豁免搬遷費；若新地址無覆蓋或無剩餘 Port 位，餘下合約點處理。搬遷費金額以該份合約同電訊商確認為準。居住年期未定，宜優先問 24 個月或以下較短合約；或者評估免拉線、搬屋可以帶走嘅 5G 家居。5G 家居同樣有合約期（常見最少 12 至 24 個月或以上），勝在有訊號就可以跟身搬，免卻固網拉線搬遷費，但唔係按月即棄。詳見 [香港 5G 家居點揀](/guides/home5g)。",
          },
          { kind: "h3", text: "2. 分清公屋價、居屋價、私樓價，唔好報錯樓類" },
          {
            kind: "p",
            text: "新居屋同綠置居雖然係買入做業主，但喺不少電訊商系統入面屬資助房屋／居屋組別，月費可以同一般私樓唔同。唔好用另一個樓類嘅牌面月費去估自己嗰個苑。查詢時報準屋苑名稱，並喺 [新入伙專區](/new-intake) 核對有冇指定新入伙計劃。樓類點解要分開，見 [公屋居屋寬頻分別](/guides/public-vs-hos)；公居屋同私樓 1000M 參考例子，見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees) 同 [私樓 1000M 參考月費](/guides/private-1000-fees)。",
          },
          { kind: "h3", text: "3. 固網未通嗰段時間，唔好亂簽 5G 家居做短期過渡" },
          {
            kind: "p",
            text: "部分新發展區首輪派匙時，個別座數或會遇到固網排期滯後。若你只係等師傅上門幾個星期，**唔好簽 5G 家居嚟頂檔**：市面上常見嘅 5G 家居計劃普遍要簽最少 12 至 24 個月（部分更長），並唔係按月即棄嘅過渡產品。中國移動香港 5G 家居站內參考例子係 [HK$88／48 個月／350GB](/plans/cmhk-home5g-350-48-88)，各樓類可用，唔好寫成劃一價。3香港 [HK$138／48 個月真無限](/plans/three-home5g-unlimited-48-138-public) 只限公屋／居屋，唔好當成所有樓類都有。",
          },
          {
            kind: "ul",
            items: [
              "**只係短等固網：** 用無合約本地預付數據卡，插落手機開熱點或自備 SIM 卡路由器頂檔，固網一通就可以停，無長約手尾。",
              "**決定以 5G 家居做一段時間嘅主力：** 先喺單位現場睇訊號，再對計劃卡嘅牌面月費、合約同數據上限。見 [香港 5G 家居點揀](/guides/home5g) 同 [5G 家居數據上限同公平使用](/guides/home5g-data-cap)。",
            ],
          },
        ],
        paragraphs: [],
      },
      {
        heading: "預查你個新屋苑：去專區對名單，或經本站查詢",
        flow: [
          {
            kind: "p",
            text: "指定新入伙優惠會隨固網商進駐進度更新，單睇全港通用價目表，好易漏咗名單內嘅指定計劃。",
          },
          {
            kind: "p",
            text: "先去 [齊Quote 新入伙屋苑專區](/new-intake) 搜屋苑、對最新計劃卡。經本站查詢或轉介申請唔會另收費；營運方或會就部分轉介獲得報酬，詳見頁尾。你亦可以 WhatsApp 6309 9966，傳送屋苑名同預計收樓月份，查邊幾間電訊商已經開通該地址報價。",
          },
          {
            kind: "ul",
            items: [
              "新公屋／簡約公屋：傳送「新公屋查位：[屋邨名稱＋座數] + 預計派匙月份，想查公屋指定光纖及搬遷費豁免條款」",
              "新居屋／綠置居／私樓：傳送「新盤入伙：[屋苑名稱] + 預計收樓月份，想對比已開通之 1000M／2500M 光纖，並按牌面月費同條款計合約期內開支」",
            ],
          },
          {
            kind: "p",
            text: "[開啟 WhatsApp 6309 9966](https://wa.me/85263099966)（電郵：info@chaiquote.hk）。",
          },
        ],
        paragraphs: [],
      },
      {
        heading: "延伸閱讀",
        flow: [
          {
            kind: "ul",
            items: [
              "[新入伙屋苑寬頻專區：有冇指定優惠？](/new-intake)（名單同指定計劃；本篇唔取代呢頁）",
              "[2027 香港電訊及寬頻月費比較](/guides/hk-telecom-broadband-price-comparison)",
              "[寬頻合約總成本點計：標示月費同實際平均月費](/guides/broadband-total-cost)（現網已有；系列未另交 2027 新長稿）",
              "[公屋居屋寬頻分別](/guides/public-vs-hos)、[公屋／居屋 1000M 參考月費](/guides/public-hos-fees)、[私樓 1000M 參考月費](/guides/private-1000-fees)",
              "[1000M 同 2500M 寬頻點揀](/guides/1000m-or-2500m)、[寬頻路由器點揀](/guides/router-wifi)",
              "[香港 5G 家居點揀](/guides/home5g)、[5G 家居數據上限同公平使用](/guides/home5g-data-cap)",
              "[香港光纖點揀](/guides/fiber)",
              "村屋、唐樓租客、商業固定 IP、大灣區：**待補** 2027 新長稿；而家分別見 [村屋](/guides/village)、[商業寬頻](/guides/business)、[大灣區手機計劃](/guides/gba-mobile)。",
            ],
          },
        ],
        paragraphs: [],
      },
    ],
    faq: [
      {
        q: "新入伙屋苑幾時申請寬頻最啱？收到鎖匙先申請趕唔趕得切？",
        a: "建議喺收到派匙或收樓通知信前 30 至 45 日，先查詢各大電訊商喺你嗰座嘅機房開通進度，並喺收匙驗樓同裝修拉線初期預約師傅上門穿線。新屋苑多戶集中入伙時，安裝檔期會較緊；等到搬入前一星期先申請，可能要再等。實際可唔可以預約、幾時裝到，以電訊商確認為準。",
      },
      {
        q: "點解新居屋或新私樓啱啱收樓時，只有一兩間寬頻公司揀？",
        a: "因為各固網商鋪設大廈主幹光纖及機房驗收進度唔同，新盤入伙初期通常只有率先完成接駁嘅一兩間電訊商可以即時安裝，其餘或需稍後先陸續開通。簽約前要確認實際可安裝日期，而唔係單憑預售登記落單。",
      },
      {
        q: "裝修新公屋或新居屋間房時，寬頻暗喉同網線應該點預留？",
        a: "建議喺封牆及造入牆櫃前，確認大門側通訊箱至客廳路由器位置嘅暗喉暢通；若計劃申請 2500M 光纖或全屋組建 Mesh Wi-Fi，宜預先為睡房鋪設 Cat6 或 Cat6A 網線，避免主力牆阻隔令房內 Wi-Fi 速度大幅衰減。實際可唔可以裝到 2500M，以該地址覆蓋同電訊商確認為準。",
      },
      {
        q: "入住簡約公屋或輪候傳統公屋期間裝寬頻，日後調遷搬屋要注意咩？",
        a: "唔好只睇牌面月費就盲簽 36 至 48 個月固網長約。簽約前必須向電訊商問清楚：日後獲派公屋或調遷時，會唔會豁免搬遷費，以及新地址若無覆蓋時點處理。實際搬遷費以該份合約為準。若唔想煩拉線同搬遷費，可以考慮免拉線 5G 家居（通常有 12 至 24 個月或以上合約，搬屋時可帶走插電即用）。5G 家居本身有合約期；若只係新居等固網師傅排期一段短時間，應改用無合約預付數據卡作短期過渡。",
      },
    ],
    faqEn: [
      {
        q: "When should I apply for broadband in a new estate? Is it too late if I wait for the keys?",
        a: "About 30 to 45 days before the key or handover letter, ask which carriers have your block’s equipment room live, and book the cable during the handover inspection and the early renovation. When many flats move in together, install slots get tight. Waiting until the week you move in may mean waiting again. Whether you can book, and when they can install, is confirmed by the carrier.",
      },
      {
        q: "Why do a new HOS court or a new private estate often have only one or two broadband companies on day one?",
        a: "Carriers finish the building fibre and the equipment-room checks at different times. Early in an intake, often only the first one or two to connect can install immediately. Others open later. Confirm a real install date before you sign. A pre-sale registration is not an install date.",
      },
      {
        q: "How should I leave conduit and network cable when fitting out a new public-housing or HOS flat?",
        a: "Before walls are closed and built-in cabinets go in, check that the conduit from the communications cabinet by the door to the living-room router is clear. If you plan 2500M or whole-home mesh Wi-Fi, run Cat6 or Cat6A to the bedrooms so a solid wall does not cut the Wi-Fi. Whether 2500M can actually be installed depends on coverage at that address and on the carrier.",
      },
      {
        q: "What should I watch if I install broadband in light public housing, or while waiting for traditional public housing, and may be rehoused later?",
        a: "Do not sign a 36- to 48-month fibre contract only because the labelled fee looks lower. Before you sign, ask the carrier whether a later public-housing allocation or a move waives the relocation fee, and what happens if the new address has no coverage. The fee follows that contract. 5G home avoids a new fibre pull and can often move with you, but it usually has a term of 12 to 24 months or more. If you are only waiting a short time for a fibre visit in the new flat, use a no-contract prepaid data SIM instead.",
      },
    ],
    bodyEn: [
      {
        heading: "Two points in 60 seconds",
        paragraphs: [
          "Teaching copy revised 29 November 2026. Some completion dates, flat counts and relocation fees were not independently re-checked, or an official completion report has already moved on. The table below is not a fully verified list and not a handover guarantee.",
          METHOD_EN.replace("Fees, coverage and terms", "Intake and handover dates follow the official or developer notice. Coverage, fees and terms"),
          "Around 2027, public housing, HOS, Green Form, Housing Society and private projects hand over in stages. First, a “key date” does not mean every carrier has the building live, and it is not your personal handover day. Early on, often only the first one or two carriers can install. Named new-intake plans apply only to estates on the carrier’s list. Names and named offers are on the [new-intake page](/new-intake). Second, when a whole block moves in together, install slots get tight. About 30 to 45 days before the key letter, check coverage for that block, and run the in-flat fibre during inspection and renovation.",
          "Listed 1000M labelled fees, on [how to choose fibre](/guides/fiber): public housing and HOS about HK$58–98 a month, private estates about HK$88–109 a month. HK$58 is i-Cable’s named-estate 48-month plan, listed for public housing, HOS and private estates. It is not a public-housing flat price. In-contract spend is on [total contract cost](/guides/broadband-total-cost). The series hub is the [2027 fee comparison](/guides/hk-telecom-broadband-price-comparison).",
        ],
      },
      {
        heading: "Projects around 2027: public sources and what to check",
        paragraphs: [
          "The table collects public sources that matter for handover planning from late 2026 into 2027. A key date is the estimated date for completing the approved building plans. It is not your handover day, and the seller or architect may extend it. “On the site list” means the ChaiQuote new-intake name list. “Not listed” does not mean the project does not exist, and it does not mean you can borrow another estate’s price. HOS 2025 committee papers put Kai Yeung Court, Ying Fai Court and Long Fung Court in 2028, and Wui Hei Court in the third quarter of 2027. Those are not in this table and are not handover guarantees. Yu Hing Court is not Yu Fung Court.",
        ],
        matrix: {
          caption:
            "Focus projects around 2027. Public sources plus planning notes. Copy revised 29 November 2026. Not a handover guarantee.",
          headers: ["Project", "District", "Public source (not a handover guarantee)", "On the site list", "Broadband note"],
          rows: [
            [
              "Fung Wong Leng Estate (public)",
              "North District (Fanling North)",
              "District-council papers and the Housing Authority mall page: 6 blocks, about 6,168 flats, in two phases, with papers estimating phase 1 in Q3 2026 and phase 2 in Q1 2027. The completion report for 1 Oct 2025–30 Sep 2026 already lists 1 block and 1,040 flats as newly completed.",
              "Name is listed",
              "A large new estate. Remaining blocks may still hand over in batches. Follow the Housing Authority key letter, check which carriers are live in that block, then compare named plans.",
            ],
            [
              "Chun Tung Estate (public)",
              "Islands (Tung Chung)",
              "The completion report lists 5 blocks and 5,200 flats as newly completed in that same period. A mall page had estimated a phased completion around mid-2026. “Phased completion in 2026/27” is out of date.",
              "Name is listed",
              "Treat it as an estate that already has completed blocks. Do not write it as a 2027 project that has not been built.",
            ],
            [
              "Lai Yuet Court (GSH)",
              "Sham Shui Po (Cheung Sha Wan)",
              "GSH 2023 sales documents once listed a key date of 30 April 2027 and 2,359 flats. The completion report already lists 3 blocks and 2,359 flats as newly completed in that period.",
              "Not listed",
              "Do not treat 30 April 2027 as a future handover window. Handover follows the Housing Authority’s written notice. A named offer still needs the name on the carrier’s list.",
            ],
            [
              "Siu Wu Court (HOS)",
              "Tuen Mun",
              "HOS 2024 sales brochure: key date 30 April 2027, subject to extension under the agreement, and the brochure says the key date is not the buyer’s handover day. The completion report to 30 Sep 2026 does not list this court. A committee paper shows 2,768 flats.",
              "Not listed",
              "About 30 to 45 days before the handover notice, check which carriers are live. Compare cost with the labelled fee plus the contract terms.",
            ],
            [
              "Yu Fung Court (HOS)",
              "Tung Chung extension",
              "An HOS 2025 sale. Official general sales information: flats estimated to complete in 2027 to 2028. This table does not freeze a quarter. Do not confuse it with Yu Hing Court, which is already on the site list.",
              "Not listed (not Yu Hing Court)",
              "Fibre in a new development area may arrive in batches. A short wait uses a no-contract data SIM. 5G home as the main line means accepting its term.",
            ],
            [
              "Long Yin (Housing Society)",
              "Kwun Tong",
              "Housing Society news release of 17 Oct 2025: project key date 31 March 2027.",
              "Name is listed",
              "Check about 30 to 45 days before the handover notice. If a basic fit-out is included, follow the existing communications ducts.",
            ],
            [
              "Lok Kai Hin (Housing Society)",
              "Kai Tak",
              "The Housing Society’s Lok Kai To Hui page: Lok Kai Hin will provide 700 flats, with a key date of 31 March 2027.",
              "Not listed",
              "Do not merge the name with the rental part of Lok Kai To Hui. A named offer still depends on the carrier’s list.",
            ],
            [
              "Tsui Yin (Housing Society)",
              "Fanling",
              "Housing Society news release of 23 Jan 2026: key date 30 September 2027.",
              "Not listed",
              "Follow the Housing Society’s written notice. Do not fold it into one line with Long Yin and Lok Kai Hin.",
            ],
            [
              "PORTO (private)",
              "Southern District (Ap Lei Chau)",
              "An earlier draft wrote a key date of 28 February 2027. Public sources do not agree on that date. It is an unverified draft figure. This table does not freeze it.",
              "Not listed",
              "Before you sign, check which carriers are live in the building equipment room, then the new-intake list and the private-estate plan cards.",
            ],
            [
              "雲向 (private)",
              "North District (Fan Kam Road, Sheung Shui)",
              "A public sales-brochure extract shows a key date of 31 March 2027, subject to extension under the sale contract. Flat count and date should be re-checked on the official site before anyone treats them as confirmed. This table does not freeze a flat count.",
              "Not listed",
              "When comparing 1000M, 2500M and router generations, use the existing speed and router guides. A new estate is not automatically 2500M or Wi-Fi 7.",
            ],
            [
              "Light public housing (announced projects)",
              "Several names are already on the site list. Also: Shun Lee Tsuen Road, Kwun Tong, and Chuk Yuen Road, Wong Tai Sin",
              "Housing Bureau notice of 16 Oct 2026 and the public-housing waiting page: other projects have been handing over. Shun Lee Tsuen Road and Chuk Yuen Road are converted school sites, about 210 flats together, estimated to open in the first quarter of 2027. The official name is Shun Lee Tsuen Road.",
              "Several light-public-housing names are listed. Shun Lee Tsuen Road and Chuk Yuen Road are not.",
              "This is transitional housing. Do not sign a 36- to 48-month term without asking whether a later move into traditional public housing waives the relocation fee. The amount follows the contract. 5G home can move with you, and it still has a term.",
            ],
          ],
        },
      },
      {
        heading: "When to cable a new home",
        flow: [
          {
            kind: "ol",
            items: [
              "**30 to 45 days before handover:** do not sign a street-booth form on the spot. Early on, carrier A may already have fibre while carrier B is taking orders before the equipment room is finished. Check which carrier has a live port in your block. Names and named offers: [new-intake page](/new-intake). Whether you can book, and when, follows the carrier.",
              "**Inspection week and the first week of renovation:** before plasterboard or full-height cabinets go in, decide where the router sits and leave a draw-wire in the conduit from the cabinet by the door. For a higher speed or mesh Wi-Fi, run Cat6 or Cat6A to the bedrooms. See [1000M or 2500M](/guides/1000m-or-2500m) and [choosing a router](/guides/router-wifi). In a new private flat, open the weak-current cabinet at inspection and check the ducts are not blocked.",
              "**14 to 21 days before you move in:** weekend slots fill up when many flats book together. A better window is after paint and before furniture, so the fibre is tested before move-in day. The carrier confirms the slot.",
            ],
          },
        ],
        paragraphs: [],
      },
      {
        heading: "Three traps for a new estate",
        paragraphs: [
          "A labelled fee that looks lower is not a lower in-contract spend. Some plans tie you for 36 to 48 months. See [total contract cost](/guides/broadband-total-cost). In light public housing, transitional housing, or if you may be rehoused within two or three years, ask whether a move during the term waives the relocation fee, and what happens if the new address has no port. The amount follows that contract. A shorter term, or 5G home you can take with you, is the question to ask. 5G home still has a term, commonly at least 12 to 24 months. See [5G home](/guides/home5g).",
          "A new HOS or Green Form flat is owner-occupied, but many carrier systems still price it as subsidised housing. Do not estimate your court from another housing type’s labelled fee. Use the estate name on the [new-intake page](/new-intake). Why the types are separate: [public vs HOS](/guides/public-vs-hos), [public / HOS 1000M](/guides/public-hos-fees), [private 1000M](/guides/private-1000-fees).",
          "If you are only waiting a few weeks for a fibre visit, **do not sign 5G home as a bridge.** Common 5G home plans run at least 12 to 24 months, and some are longer. A listed CMHK example is [HK$88 / 48 months / 350GB](/plans/cmhk-home5g-350-48-88), all housing types. It is not a flat starting price. 3 Hong Kong [HK$138 / 48 months unlimited](/plans/three-home5g-unlimited-48-138-public) is public housing and HOS only. A short wait uses a no-contract prepaid data SIM. If 5G home will be the main line for a real stretch, test the signal on site and read the labelled fee, the term and the data cap on [5G home](/guides/home5g) and [data caps](/guides/home5g-data-cap).",
        ],
      },
      {
        heading: "Check the estate on the list, or ask through this site",
        paragraphs: [
          "Named new-intake offers change as carriers connect the building. A territory-wide price list misses plans that exist only on a named list.",
          "Search the [new-intake page](/new-intake) first. Enquiries and referred applications through this site are not charged an extra fee. The operator may receive remuneration for some referrals. Details are in the footer. You can also WhatsApp 6309 9966 with the estate name and the expected handover month.",
          "Public or light public housing: send the estate, the block and the expected key month, and ask about named fibre and whether a relocation fee can be waived. HOS, Green Form or private: send the estate and the expected handover month, and ask to compare live 1000M and 2500M using the labelled fee and the contract terms.",
          "[Open WhatsApp 6309 9966](https://wa.me/85263099966) (email: info@chaiquote.hk).",
        ],
      },
      {
        heading: "Further reading",
        flow: [
          {
            kind: "ul",
            items: [
              "[New-intake estates: is there a named offer?](/new-intake). This guide does not replace that list.",
              "[2027 telecom and broadband fee hub](/guides/hk-telecom-broadband-price-comparison)",
              "[Total contract cost](/guides/broadband-total-cost)",
              "[Public vs HOS](/guides/public-vs-hos), [public / HOS 1000M](/guides/public-hos-fees), [private 1000M](/guides/private-1000-fees)",
              "[1000M or 2500M](/guides/1000m-or-2500m), [choosing a router](/guides/router-wifi)",
              "[5G home](/guides/home5g), [data caps](/guides/home5g-data-cap), [fibre](/guides/fiber)",
              "Village, walk-up tenants, business static IP and Greater Bay Area 2027 long guides are still to be written. For now: [village](/guides/village), [business](/guides/business), [GBA mobile](/guides/gba-mobile).",
            ],
          },
        ],
        paragraphs: [],
      },
    ],
  },
];
