export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  minutes: number;
  body: { heading: string; paragraphs: string[] }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "port-in",
    title: "攜號轉台點樣做，先唔會斷線",
    excerpt: "留舊號碼轉去新電訊商，行政費、幾時生效、寬頻轉台有咩分別。",
    minutes: 4,
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
  },
  {
    slug: "fiber-vs-5g",
    title: "光纖同 5G 家居寬頻點揀",
    excerpt: "拉線穩唔穩、幾時裝到、有冇數據上限、村屋適唔適合。",
    minutes: 5,
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
    ],
  },
  {
    slug: "village",
    title: "村屋／丁屋寬頻點算",
    excerpt: "覆蓋點查、5G 家居同光纖到村實際有咩分別。",
    minutes: 3,
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
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}
