import type { Guide } from "./guides.ts";

const DISCLAIMER =
  "以上只供參考。實際覆蓋、安裝期、月費、合約同路由器條款，一律以電訊商確認為準，唔好假設一定有線或者一定裝到。";

const DISCLAIMER_EN =
  "The above is for reference only. Coverage, install dates, fees, contracts and router terms are confirmed by the carrier. Do not assume a line exists or that it can be installed.";

const FEE_CAPTION = "站內列出｜僅供參考";
const FEE_HEADERS: [string, string] = ["計劃例子", "樓類／參考月費"];

const PUBLIC_HOS_1000 = {
  icable58: {
    label: "有線 1000M（48 個月）",
    value: "公屋、居屋、私樓｜HK$58",
    href: "/plans/icable-ftth-1000-48m-58",
  },
  hgc75: {
    label: "HGC 轉台 1000M（36 個月）",
    value: "公屋、居屋｜HK$75",
    href: "/plans/hgc-ftth-1000-public-36m",
  },
  cmhk88: {
    label: "中國移動香港 1000M（36 個月）",
    value: "公屋、居屋、私樓｜HK$88",
    href: "/plans/cmhk-ftth-2500",
  },
  hkbn98: {
    label: "香港寬頻 1000M 連 Wi-Fi 7（36 個月）",
    value: "公屋、居屋、私樓｜HK$98",
    href: "/plans/hkbn-ftth-1000-36m-98",
  },
} as const;

const PRIVATE_1000 = {
  icable88: {
    label: "有線私人樓宇 1000M（36 個月）",
    value: "私樓｜HK$88",
    href: "/plans/icable-ftth-1000-private-36m",
  },
  hgc89: {
    label: "HGC 私人樓宇 1000M（39 個月）",
    value: "私樓｜HK$89",
    href: "/plans/hgc-ftth-1000-private-39m",
  },
} as const;

function feeTable(rows: { label: string; value: string; href: string }[]) {
  return {
    caption: FEE_CAPTION,
    headers: FEE_HEADERS,
    rows,
  };
}

export const DISTRICT_GUIDES: Guide[] = [
  {
    slug: "tin-shui-wai",
    minutes: 7,
    category: "fiber",
    seoTitle: "天水圍寬頻比較｜公屋居屋嘉湖參考月費｜齊Quote",
    h1: "天水圍寬頻點揀：先分公屋、居屋、嘉湖",
    description:
      "天水圍寬頻唔係一張區價。天耀邨、天瑞邨等公屋，天盛苑等居屋，同嘉湖山莊私樓，計劃通常分開報。下列係站內列出參考月費，覆蓋同安裝以電訊商確認為準。",
    title: "天水圍寬頻點揀：先分公屋、居屋、嘉湖",
    excerpt: "天水圍唔係一區一價。公屋、居屋、嘉湖私樓分開睇參考月費，再填地址查核。",
    titleEn: "Tin Shui Wai broadband: public, HOS and Kingswood first",
    excerptEn:
      "Tin Shui Wai is not one district price. Compare public, HOS and Kingswood private estates separately, then confirm the address.",
    descriptionEn:
      "Tin Shui Wai broadband is not one district fee. Public estates such as Tin Yiu, HOS courts and Kingswood Villas are usually quoted separately. Listed fees are a reference. Coverage is confirmed by the carrier.",
    h1En: "Tin Shui Wai broadband: sort public, HOS and Kingswood first",
    published: "2026-09-13",
    related: [
      "public-hos-fees",
      "private-1000-fees",
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
      { href: "/estates/tin-yiu", label: "天耀邨" },
      { href: "/estates/tin-shui", label: "天瑞邨" },
      { href: "/estates/kingswood-villas", label: "嘉湖山莊" },
      { href: "/estates", label: "屋苑目錄" },
    ],
    inquiry: { district: "元朗" },
    cta: {
      lead: "填完整天水圍地址同座數，用 WhatsApp 查核覆蓋同參考月費。僅供參考，以電訊商確認為準。",
      leadEn: "Send the full Tin Shui Wai address on WhatsApp to check coverage and a reference fee. For reference only; the carrier confirms.",
      button: "WhatsApp 查核天水圍報價",
      buttonEn: "WhatsApp a Tin Shui Wai quote",
      waText: "【齊Quote】你好，我想查核天水圍寬頻覆蓋同參考月費。",
      waTextEn: "[ChaiQuote] Hi, I would like to check Tin Shui Wai broadband coverage and a reference fee.",
    },
    body: [
      {
        heading: "天水圍唔係一區一價",
        paragraphs: [
          "搜「天水圍寬頻」見到嘅，多數仍然要先分樓類。天耀邨、天瑞邨、天華邨、俊宏軒係公屋；天盛苑、天富苑、天頌苑係居屋；嘉湖山莊、慧景軒係私樓。同一條 1000M，三種樓類計劃可以完全唔同。",
          "齊Quote 資料庫將天水圍地址歸入元朗區。下列月費係**站內列出**例子，**僅供參考**，唔代表你座樓一定有。呢張表**唔係排名**。覆蓋同安裝以電訊商確認為準。",
        ],
      },
      {
        heading: "公屋／居屋參考 1000M",
        paragraphs: [
          "天水圍公屋、居屋用公居屋表，**唔好**用嘉湖私樓價去估。完整表見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)。",
        ],
        table: feeTable([PUBLIC_HOS_1000.icable58, PUBLIC_HOS_1000.hgc75, PUBLIC_HOS_1000.cmhk88, PUBLIC_HOS_1000.hkbn98]),
      },
      {
        heading: "嘉湖等私樓",
        paragraphs: [
          "嘉湖山莊同附近私樓用私樓表。完整表見 [私樓 1000M 參考月費](/guides/private-1000-fees)。",
        ],
        table: feeTable([PUBLIC_HOS_1000.cmhk88, PRIVATE_1000.icable88, PRIVATE_1000.hgc89, PUBLIC_HOS_1000.hkbn98]),
      },
      {
        heading: "常見屋苑入口",
        paragraphs: [
          "公屋：[天耀邨](/estates/tin-yiu)、[天瑞邨](/estates/tin-shui)、[天華邨](/estates/tin-wah)、[天恒邨](/estates/tin-heng)、[天恩邨](/estates/tin-yan)、[天逸邨](/estates/tin-yat)、[俊宏軒](/estates/grandeur-terrace)。居屋：[天盛苑](/estates/tin-shing-court)、[天富苑](/estates/tin-fu-court)、[天頌苑](/estates/tin-chung-court)。私樓：[嘉湖山莊](/estates/kingswood-villas)。",
          "屋苑頁列出適用樓類計劃。指定屋苑閃購如果有，只會喺搜該屋苑時出現，**唔入**上面摘要表。點用屋苑名見 [齊Quote 點用屋苑篩](/guides/estate-filter)。全部見 [屋苑目錄](/estates)。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "返首頁輸入座數同街道，或者開 [公屋光纖格價](/plans?cat=broadband&housing=public)。附近地區：[沙田寬頻](/guides/sha-tin)、[將軍澳寬頻](/guides/tseung-kwan-o)。屏山、洪水橋、厦村等村屋見 [村屋光纖月費](/guides/village-fees)。2026 年表見 [2026 家居寬頻格價](/guides/home-broadband-2026)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Not one district price",
        paragraphs: [
          "Tin Shui Wai searches still start with housing type. Tin Yiu and Tin Shui are public; Tin Shing Court is HOS; Kingswood Villas is private. The same 1000M line can be a different plan in each.",
          "ChaiQuote files Tin Shui Wai under Yuen Long. Fees below are **listed on this site**, **for reference only**. This table is **not a ranking**. Coverage is confirmed by the carrier.",
        ],
      },
      {
        heading: "Public / HOS 1000M examples",
        paragraphs: [
          "Use the public / HOS table. Do **not** guess a public-estate fee from Kingswood. Full table: [public / HOS 1000M](/guides/public-hos-fees).",
        ],
        table: feeTable([PUBLIC_HOS_1000.icable58, PUBLIC_HOS_1000.hgc75, PUBLIC_HOS_1000.cmhk88, PUBLIC_HOS_1000.hkbn98]),
      },
      {
        heading: "Kingswood and other private estates",
        paragraphs: ["Use the private-estate table. Full table: [private-estate 1000M](/guides/private-1000-fees)."],
        table: feeTable([PUBLIC_HOS_1000.cmhk88, PRIVATE_1000.icable88, PRIVATE_1000.hgc89, PUBLIC_HOS_1000.hkbn98]),
      },
      {
        heading: "Estate pages",
        paragraphs: [
          "Public: [Tin Yiu](/estates/tin-yiu), [Tin Shui](/estates/tin-shui). Private: [Kingswood Villas](/estates/kingswood-villas). Flash offers for named estates are **not** in the summary table. How to type an estate: [estate filter](/guides/estate-filter).",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Type the block and street on the home page, or open [public fibre plans](/plans?cat=broadband&housing=public). Nearby: [Sha Tin](/guides/sha-tin), [Tseung Kwan O](/guides/tseung-kwan-o). Nearby villages: [village fibre fees](/guides/village-fees).",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "天水圍寬頻月費係咪全區一樣？",
        a: "唔係。公屋、居屋、嘉湖私樓通常分開報。頁上數字係站內列出、僅供參考，以電訊商確認為準。",
      },
      {
        q: "天耀邨可唔可以用嘉湖嗰行價？",
        a: "唔可以。天耀邨係公屋，嘉湖山莊係私樓。公居屋例子見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)。",
      },
      {
        q: "點查自己座數有冇線？",
        a: "喺齊Quote 輸入完整地址，再開 WhatsApp 查核。屋苑篩步驟見 [齊Quote 點用屋苑篩](/guides/estate-filter)。覆蓋以電訊商確認為準。",
      },
    ],
    faqEn: [
      {
        q: "Is Tin Shui Wai one broadband fee?",
        a: "No. Public, HOS and Kingswood private estates are usually quoted separately. Figures here are listed on the site, for reference only.",
      },
      {
        q: "Can Tin Yiu use a Kingswood row?",
        a: "No. Tin Yiu is public housing. See [public / HOS 1000M](/guides/public-hos-fees).",
      },
      {
        q: "How do I check my block?",
        a: "Enter the full address on ChaiQuote, then confirm on WhatsApp. See [estate filter](/guides/estate-filter).",
      },
    ],
  },
  {
    slug: "sha-tin",
    minutes: 7,
    category: "fiber",
    seoTitle: "沙田寬頻比較｜第一城瀝源邨參考月費｜齊Quote",
    h1: "沙田寬頻點揀：第一城、瀝源邨同馬鞍山要分開",
    description:
      "沙田寬頻唔係一張區價。沙田第一城、瀝源邨、禾輋邨、水泉澳邨同馬鞍山私樓，樓類不同計劃就不同。下列係站內列出參考月費，覆蓋同安裝以電訊商確認為準。",
    title: "沙田寬頻點揀：第一城、瀝源邨同馬鞍山要分開",
    excerpt: "沙田範圍大。第一城私樓、瀝源邨公屋、馬鞍山屋苑要分開睇參考月費。",
    titleEn: "Sha Tin broadband: City One, Lek Yuen and Ma On Shan separately",
    excerptEn: "Sha Tin is large. Compare City One, Lek Yuen and Ma On Shan by housing type, not as one district fee.",
    descriptionEn:
      "Sha Tin broadband is not one district fee. City One, Lek Yuen, Wo Che, Shui Chuen O and Ma On Shan private estates are quoted by housing type. Listed fees are a reference. Coverage is confirmed by the carrier.",
    h1En: "Sha Tin broadband: City One, Lek Yuen and Ma On Shan separately",
    published: "2026-09-13",
    related: [
      "private-1000-fees",
      "public-hos-fees",
      "tin-shui-wai",
      "tseung-kwan-o",
      "fiber",
      "estate-filter",
      "home-broadband-2026",
      "village-fees",
    ],
    plans: [
      { href: "/plans?cat=broadband&housing=private", label: "私樓光纖計劃" },
      { href: "/plans?cat=broadband&housing=public", label: "公屋光纖計劃" },
    ],
    estates: [
      { href: "/estates/city-one", label: "沙田第一城" },
      { href: "/estates/lek-yuen", label: "瀝源邨" },
      { href: "/estates/wo-che", label: "禾輋邨" },
      { href: "/estates", label: "屋苑目錄" },
    ],
    inquiry: { district: "沙田" },
    cta: {
      lead: "填完整沙田或馬鞍山地址，用 WhatsApp 查核覆蓋同參考月費。僅供參考，以電訊商確認為準。",
      leadEn: "Send the full Sha Tin or Ma On Shan address on WhatsApp. For reference only; the carrier confirms.",
      button: "WhatsApp 查核沙田報價",
      buttonEn: "WhatsApp a Sha Tin quote",
      waText: "【齊Quote】你好，我想查核沙田寬頻覆蓋同參考月費。",
      waTextEn: "[ChaiQuote] Hi, I would like to check Sha Tin broadband coverage and a reference fee.",
    },
    body: [
      {
        heading: "沙田範圍大，唔好當一區價",
        paragraphs: [
          "搜「沙田寬頻」時，沙田第一城係私樓；瀝源邨、禾輋邨、水泉澳邨係公屋；廣林苑、豐盛苑係居屋；名城、迎海、新港城多數當私樓，而且有部分喺大圍、馬鞍山。樓類唔對，月費表就會睇錯。",
          "下列係**站內列出**例子，**僅供參考**。呢張表**唔係排名**。指定屋苑閃購（例如美盈苑、錦暉苑）只喺搜該屋苑時出現，**唔入**摘要表。",
        ],
      },
      {
        heading: "第一城等私樓 1000M",
        paragraphs: ["完整私樓表見 [私樓 1000M 參考月費](/guides/private-1000-fees)。"],
        table: feeTable([PUBLIC_HOS_1000.cmhk88, PRIVATE_1000.icable88, PRIVATE_1000.hgc89, PUBLIC_HOS_1000.hkbn98]),
      },
      {
        heading: "瀝源、禾輋、水泉澳等公屋",
        paragraphs: [
          "公屋用公居屋表，**唔好**用第一城價去估。完整表見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)。",
        ],
        table: feeTable([PUBLIC_HOS_1000.icable58, PUBLIC_HOS_1000.hgc75, PUBLIC_HOS_1000.hkbn98]),
      },
      {
        heading: "常見屋苑入口",
        paragraphs: [
          "私樓：[沙田第一城](/estates/city-one)、[名城](/estates/festival-city)、[迎海](/estates/double-cove)。公屋：[瀝源邨](/estates/lek-yuen)、[禾輋邨](/estates/wo-che)、[水泉澳邨](/estates/shui-chuen-o)。指定屋苑頁：[美盈苑](/estates/mei-ying-court)、[錦暉苑](/estates/kam-fai-court)——呢兩頁如果列出獨家計劃，只適用該苑，唔代表全沙田。",
          "點用屋苑名見 [齊Quote 點用屋苑篩](/guides/estate-filter)。全部見 [屋苑目錄](/estates)。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "返首頁輸入屋苑，或者開 [私樓光纖格價](/plans?cat=broadband&housing=private)。地區：[天水圍寬頻](/guides/tin-shui-wai)、[將軍澳寬頻](/guides/tseung-kwan-o)。大圍、火炭附近村屋見 [村屋光纖月費](/guides/village-fees)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Sha Tin is not one fee",
        paragraphs: [
          "City One is private; Lek Yuen, Wo Che and Shui Chuen O are public; Festival City and Double Cove are usually private, and some sit in Tai Wai or Ma On Shan.",
          "Rows below are **listed on this site**, **for reference only**. This table is **not a ranking**. Named-estate flash offers stay off this summary.",
        ],
      },
      {
        heading: "City One and other private 1000M",
        paragraphs: ["Full table: [private-estate 1000M](/guides/private-1000-fees)."],
        table: feeTable([PUBLIC_HOS_1000.cmhk88, PRIVATE_1000.icable88, PRIVATE_1000.hgc89, PUBLIC_HOS_1000.hkbn98]),
      },
      {
        heading: "Lek Yuen, Wo Che, Shui Chuen O",
        paragraphs: [
          "Use the public / HOS table. Do **not** guess from City One. Full table: [public / HOS 1000M](/guides/public-hos-fees).",
        ],
        table: feeTable([PUBLIC_HOS_1000.icable58, PUBLIC_HOS_1000.hgc75, PUBLIC_HOS_1000.hkbn98]),
      },
      {
        heading: "Estate pages",
        paragraphs: [
          "[City One](/estates/city-one), [Lek Yuen](/estates/lek-yuen), [Wo Che](/estates/wo-che), [Mei Ying Court](/estates/mei-ying-court). Exclusive plans on those last pages apply only there. See [estate filter](/guides/estate-filter).",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Type the estate on the home page or open [private fibre plans](/plans?cat=broadband&housing=private). Also: [Tin Shui Wai](/guides/tin-shui-wai), [Tseung Kwan O](/guides/tseung-kwan-o). Nearby villages: [village fibre fees](/guides/village-fees).",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "沙田第一城同瀝源邨月費會唔會一樣？",
        a: "通常唔會。第一城係私樓，瀝源邨係公屋。分開用樓類篩。頁上數字僅供參考。",
      },
      {
        q: "馬鞍山算唔算沙田寬頻？",
        a: "行政區上馬鞍山屬沙田，但屋苑計劃仍先睇樓類。迎海、新港城當私樓篩。覆蓋以電訊商確認為準。",
      },
      {
        q: "美盈苑、錦暉苑嘅價全沙田得唔得？",
        a: "唔得。呢啲係指定屋苑頁先列出嘅計劃，唔入全區摘要。要用屋苑名搜，見 [齊Quote 點用屋苑篩](/guides/estate-filter)。",
      },
    ],
    faqEn: [
      {
        q: "Are City One and Lek Yuen the same fee?",
        a: "Usually not. City One is private; Lek Yuen is public. Filter by housing type. Figures here are for reference only.",
      },
      {
        q: "Does Ma On Shan count as Sha Tin broadband?",
        a: "Administratively yes, but plans still follow housing type. Double Cove is filtered as private. Coverage is confirmed by the carrier.",
      },
      {
        q: "Can all of Sha Tin use Mei Ying Court pricing?",
        a: "No. Those plans are listed on named estate pages only. See [estate filter](/guides/estate-filter).",
      },
    ],
  },
  {
    slug: "tseung-kwan-o",
    minutes: 7,
    category: "fiber",
    seoTitle: "將軍澳寬頻比較｜康城坑口寶林參考月費｜齊Quote",
    h1: "將軍澳寬頻點揀：康城、坑口、寶林要分樓類",
    description:
      "將軍澳寬頻唔係一張區價。日出康城、維景灣畔等私樓，坑口邨、寶林邨、尚德邨等公屋，計劃通常分開報。下列係站內列出參考月費，覆蓋同安裝以電訊商確認為準。",
    title: "將軍澳寬頻點揀：康城、坑口、寶林要分樓類",
    excerpt: "將軍澳私樓同公屋分開報。康城、坑口邨、寶林邨用對應樓類睇參考月費。",
    titleEn: "Tseung Kwan O broadband: LOHAS, Hang Hau and Po Lam by housing type",
    excerptEn: "Private estates such as LOHAS Park and public estates such as Hang Hau and Po Lam are quoted separately.",
    descriptionEn:
      "Tseung Kwan O broadband is not one district fee. LOHAS Park and Ocean Shores are private; Hang Hau, Po Lam and Sheung Tak are public. Listed fees are a reference. Coverage is confirmed by the carrier.",
    h1En: "Tseung Kwan O broadband: LOHAS, Hang Hau and Po Lam by type",
    published: "2026-09-13",
    related: [
      "private-1000-fees",
      "public-hos-fees",
      "tin-shui-wai",
      "sha-tin",
      "fiber",
      "estate-filter",
      "home-broadband-2026",
      "village-fees",
    ],
    plans: [
      { href: "/plans?cat=broadband&housing=private", label: "私樓光纖計劃" },
      { href: "/plans?cat=broadband&housing=public", label: "公屋光纖計劃" },
    ],
    estates: [
      { href: "/estates/lohas-park", label: "日出康城" },
      { href: "/estates/hang-hau", label: "坑口邨" },
      { href: "/estates/po-lam", label: "寶林邨" },
      { href: "/estates", label: "屋苑目錄" },
    ],
    inquiry: { district: "西貢" },
    cta: {
      lead: "填完整將軍澳地址同座數，用 WhatsApp 查核覆蓋同參考月費。僅供參考，以電訊商確認為準。",
      leadEn: "Send the full Tseung Kwan O address on WhatsApp. For reference only; the carrier confirms.",
      button: "WhatsApp 查核將軍澳報價",
      buttonEn: "WhatsApp a Tseung Kwan O quote",
      waText: "【齊Quote】你好，我想查核將軍澳寬頻覆蓋同參考月費。",
      waTextEn: "[ChaiQuote] Hi, I would like to check Tseung Kwan O broadband coverage and a reference fee.",
    },
    body: [
      {
        heading: "將軍澳行政上屬西貢，報價仍先睇樓類",
        paragraphs: [
          "日出康城、維景灣畔、天晉、將軍澳中心、新都城多數當私樓；坑口邨、寶林邨、尚德邨、厚德邨、健明邨係公屋；廣明苑、英明苑、彩明苑係居屋。村屋（例如坑口村）係**另一套**計劃，見 [村屋光纖月費](/guides/village-fees)。",
          "下列係**站內列出**例子，**僅供參考**。呢張表**唔係排名**。寶庭居、賢庭居等指定屋苑如果有獨家計劃，只喺該屋苑頁出現，**唔入**全區摘要。",
        ],
      },
      {
        heading: "康城、維景灣畔等私樓",
        paragraphs: ["完整表見 [私樓 1000M 參考月費](/guides/private-1000-fees)。"],
        table: feeTable([PUBLIC_HOS_1000.cmhk88, PRIVATE_1000.icable88, PRIVATE_1000.hgc89, PUBLIC_HOS_1000.hkbn98]),
      },
      {
        heading: "坑口、寶林、尚德等公屋",
        paragraphs: [
          "公屋用公居屋表，**唔好**用康城價去估。完整表見 [公屋／居屋 1000M 參考月費](/guides/public-hos-fees)。",
        ],
        table: feeTable([PUBLIC_HOS_1000.icable58, PUBLIC_HOS_1000.hgc75, PUBLIC_HOS_1000.hkbn98]),
      },
      {
        heading: "常見屋苑入口",
        paragraphs: [
          "私樓：[日出康城](/estates/lohas-park)、[維景灣畔](/estates/ocean-shores)、[天晉](/estates/the-wings)、[將軍澳中心](/estates/park-central)、[新都城](/estates/metro-city)。公屋：[坑口邨](/estates/hang-hau)、[寶林邨](/estates/po-lam)、[尚德邨](/estates/sheung-tak)、[厚德邨](/estates/hau-tak)。居屋：[廣明苑](/estates/kwong-ming-court)。指定屋苑：[寶庭居](/estates/po-ting-home)、[賢庭居](/estates/yin-ting-home)。",
          "點用屋苑名見 [齊Quote 點用屋苑篩](/guides/estate-filter)。全部見 [屋苑目錄](/estates)。",
        ],
      },
      {
        heading: "下一步",
        paragraphs: [
          "返首頁輸入屋苑，或者開 [私樓光纖格價](/plans?cat=broadband&housing=private)。地區：[天水圍寬頻](/guides/tin-shui-wai)、[沙田寬頻](/guides/sha-tin)。村屋見 [村屋光纖月費](/guides/village-fees)。",
          DISCLAIMER,
        ],
      },
    ],
    bodyEn: [
      {
        heading: "Tseung Kwan O sits in Sai Kung; quotes still follow housing type",
        paragraphs: [
          "LOHAS Park, Ocean Shores, The Wings and Park Central are usually private; Hang Hau, Po Lam and Sheung Tak are public. Village houses use a **separate** set: [village fibre fees](/guides/village-fees).",
          "Rows below are **listed on this site**, **for reference only**. This table is **not a ranking**. Named-estate exclusives stay on those estate pages.",
        ],
      },
      {
        heading: "LOHAS Park and other private estates",
        paragraphs: ["Full table: [private-estate 1000M](/guides/private-1000-fees)."],
        table: feeTable([PUBLIC_HOS_1000.cmhk88, PRIVATE_1000.icable88, PRIVATE_1000.hgc89, PUBLIC_HOS_1000.hkbn98]),
      },
      {
        heading: "Hang Hau, Po Lam, Sheung Tak",
        paragraphs: [
          "Use the public / HOS table. Do **not** guess from LOHAS Park. Full table: [public / HOS 1000M](/guides/public-hos-fees).",
        ],
        table: feeTable([PUBLIC_HOS_1000.icable58, PUBLIC_HOS_1000.hgc75, PUBLIC_HOS_1000.hkbn98]),
      },
      {
        heading: "Estate pages",
        paragraphs: [
          "[LOHAS Park](/estates/lohas-park), [Hang Hau](/estates/hang-hau), [Po Lam](/estates/po-lam), [Po Ting Home](/estates/po-ting-home). See [estate filter](/guides/estate-filter).",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Type the estate on the home page or open [private fibre plans](/plans?cat=broadband&housing=private). Also: [Tin Shui Wai](/guides/tin-shui-wai), [Sha Tin](/guides/sha-tin). Village: [village fibre fees](/guides/village-fees).",
          DISCLAIMER_EN,
        ],
      },
    ],
    faq: [
      {
        q: "日出康城同坑口邨月費會唔會一樣？",
        a: "通常唔會。康城係私樓，坑口邨係公屋。分開用樓類篩。頁上數字僅供參考。",
      },
      {
        q: "將軍澳村屋可唔可以用康城表？",
        a: "唔可以。村屋光纖係另一套計劃，見 [村屋光纖月費](/guides/village-fees)。",
      },
      {
        q: "寶庭居、賢庭居嘅價全將軍澳得唔得？",
        a: "唔得。指定屋苑頁先列出嘅計劃，只適用該地址。要用屋苑名搜，見 [齊Quote 點用屋苑篩](/guides/estate-filter)。",
      },
    ],
    faqEn: [
      {
        q: "Are LOHAS Park and Hang Hau the same fee?",
        a: "Usually not. LOHAS Park is private; Hang Hau is public. Filter by housing type.",
      },
      {
        q: "Can a Tseung Kwan O village house use the LOHAS table?",
        a: "No. Village fibre is a separate set. See [village fibre fees](/guides/village-fees).",
      },
      {
        q: "Can all of Tseung Kwan O use Po Ting Home pricing?",
        a: "No. Those plans are listed on named estate pages only. See [estate filter](/guides/estate-filter).",
      },
    ],
  },
];
