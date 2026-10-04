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
    slug: "sosim-esim-hk",
    published: "2026-10-02",
    desk: "電訊",
    deskEn: "Telecom",
    h1: "SoSIM全面支援eSIM：新卡轉卡免手續費",
    h1En: "SoSIM now supports eSIM: new cards convert without a fee",
  },
  {
    slug: "hkt-ai-data-waiver-oct7",
    published: "2026-10-01",
    desk: "電訊",
    deskEn: "Telecom",
    h1: "10月7日起：1O1O同csl用HKT.AI免本地數據",
    h1En: "From 7 October: HKT.AI local data waived on 1O1O and csl",
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
