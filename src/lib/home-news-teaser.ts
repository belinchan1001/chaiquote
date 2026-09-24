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
    slug: "sony-hello-kitty-xperia-hk",
    published: "2026-09-24",
    desk: "手機",
    deskEn: "Phones",
    h1: "Sony Store限定：Xperia Kitty套裝",
    h1En: "Sony Store only: Xperia 10 VIII Hello Kitty bundle",
  },
  {
    slug: "apple-education-sep24-hk",
    published: "2026-09-24",
    desk: "科技",
    deskEn: "Gadgets",
    h1: "Apple教育優惠今日止：買Mac或iPad先對",
    h1En: "Apple education pricing ends today: Mac or iPad only",
  },
  {
    slug: "switch-sports-resort-oct22",
    published: "2026-09-24",
    desk: "電玩",
    deskEn: "Gaming",
    h1: "Sports Resort 10月22日：盒裝$399",
    h1En: "Switch Sports Resort on 22 October: boxed HKD 399",
  },
];
