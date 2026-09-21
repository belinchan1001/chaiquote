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
  {
    slug: "smartone-3g-close-2026",
    published: "2026-09-21",
    desk: "電訊",
    deskEn: "Telecom",
    h1: "SmarTone 3G 10 月 9 日停：舊機、手錶、車機都要對",
    h1En: "SmarTone 3G ends 9 October: check phones, watches and car kits",
  },
];
