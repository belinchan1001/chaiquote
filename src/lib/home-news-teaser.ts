/** Homepage-only. Keep this file tiny — never import article bodies here. */
export type HomeNewsTeaser = {
  slug: string;
  published: string;
  desk: string;
  deskEn: string;
  h1: string;
  h1En: string;
};

export const HOME_NEWS_TEASERS: readonly HomeNewsTeaser[] = [
  {
    slug: "cmhk-mid-autumn-2026",
    published: "2026-09-24",
    desk: "電訊",
    deskEn: "Telecom",
    h1: "中移動雙節至10月11日：指定5G雙倍中澳數據",
    h1En: "CMHK holiday window to 11 October: double data only on named 5G plans",
  },
  {
    slug: "assemble-nintendo-switch-wanchai",
    published: "2026-09-21",
    desk: "電玩",
    deskEn: "Gaming",
    h1: "灣仔合和商場 Assemble：亞洲首個大型 Switch 遊戲生活館",
    h1En: "Assemble in Wan Chai: Asia’s first large Switch lifestyle store",
  },
  {
    slug: "iphone-18-handset-plan",
    published: "2026-09-21",
    desk: "電訊",
    deskEn: "Telecom",
    h1: "iPhone 18 上台：機價折扣同月費要分開計",
    h1En: "iPhone 18 contracts: price the phone and the plan separately",
  },
];
