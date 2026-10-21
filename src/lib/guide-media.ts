/** Topic/OG images. The first four live in /images; later guides use /images/guides. */

export const GUIDE_TOPIC_IMAGE_SLUGS = [
  "port-in",
  "fiber",
  "village",
  "fiber-vs-5g",
  "old-building-broadband",
  "home5g-data-cap",
  "move-broadband",
  "yuen-long",
  "mobile-broadband-bundle",
  "router-wifi",
  "tuen-mun",
  "student-plans",
  "elderly-broadband",
] as const;

export type GuideTopicImageSlug = (typeof GUIDE_TOPIC_IMAGE_SLUGS)[number];

export type GuideTopicImage = {
  slug: GuideTopicImageSlug;
  src: string;
  webp: string;
  width: number;
  height: number;
  alt: string;
  altEn: string;
};

export const GUIDE_TOPIC_IMAGES: Record<GuideTopicImageSlug, GuideTopicImage> = {
  "port-in": {
    slug: "port-in",
    src: "/images/guide-port-in.jpg",
    webp: "/images/guide-port-in.webp",
    width: 1200,
    height: 630,
    alt: "暖色客廳：男士喺木枱前同時睇兩部手機，旁邊放住白色路由器",
    altEn: "Warm living-room scene: a man at a wooden table looking at two phones, with a white router beside him",
  },
  fiber: {
    slug: "fiber",
    src: "/images/guide-fiber.jpg",
    webp: "/images/guide-fiber.webp",
    width: 1200,
    height: 630,
    alt: "暖色客廳：一對伴侶坐喺梳化上各自拿住手機，旁邊有白色路由器",
    altEn: "Warm living-room scene: a couple on a sofa each holding a phone, with a white router nearby",
  },
  village: {
    slug: "village",
    src: "/images/guide-village.jpg",
    webp: "/images/guide-village.webp",
    width: 1200,
    height: 630,
    alt: "村屋小巷：女士企喺白牆黑瓦屋前面睇手機",
    altEn: "Village lane scene: a woman standing among tiled-roof houses looking at a phone",
  },
  "fiber-vs-5g": {
    slug: "fiber-vs-5g",
    src: "/images/guide-choose.jpg",
    webp: "/images/guide-choose.webp",
    width: 1280,
    height: 720,
    alt: "暖色客廳：女士坐喺梳化上手持咖啡杯，膝上有手提電腦，茶几上有白色路由器",
    altEn: "Warm living-room scene: a woman on a sofa with a coffee cup and laptop, and a white router on the table",
  },
  "old-building-broadband": {
    slug: "old-building-broadband",
    src: "/images/guides/old-building-broadband.jpg",
    webp: "/images/guides/old-building-broadband.webp",
    width: 1280,
    height: 720,
    alt: "舊樓外牆同窄走廊：白牆、窗同電箱，入線要現場確認",
    altEn: "Older walk-up exterior and a narrow corridor with a meter box. In-building cabling has to be checked on site.",
  },
  "home5g-data-cap": {
    slug: "home5g-data-cap",
    src: "/images/guides/home5g-data-cap.jpg",
    webp: "/images/guides/home5g-data-cap.webp",
    width: 1280,
    height: 720,
    alt: "客廳白路由器同手機數據畫面，用來對 5G 家居合約入面嘅用量條款",
    altEn: "Living room with a white router and a phone data screen, for reading a 5G home usage clause.",
  },
  "move-broadband": {
    slug: "move-broadband",
    src: "/images/guides/move-broadband.jpg",
    webp: "/images/guides/move-broadband.webp",
    width: 1280,
    height: 720,
    alt: "紙箱、鑰匙同白色路由器放喺木地板，準備搬屋銜接寬頻",
    altEn: "Cardboard boxes, keys and a white router on a wooden floor, ready to move a broadband line.",
  },
  "yuen-long": {
    slug: "yuen-long",
    src: "/images/guides/yuen-long.jpg",
    webp: "/images/guides/yuen-long.webp",
    width: 1280,
    height: 720,
    alt: "元朗市中心傍晚街道，旁邊係住宅大廈",
    altEn: "Yuen Long town centre at dusk, with residential towers beside the street.",
  },
  "mobile-broadband-bundle": {
    slug: "mobile-broadband-bundle",
    src: "/images/guides/mobile-broadband-bundle.jpg",
    webp: "/images/guides/mobile-broadband-bundle.webp",
    width: 1280,
    height: 720,
    alt: "木枱上一部手機同一部平板，旁邊有白路由器同稿紙，用來一齊計手機同家居寬頻",
    altEn: "A phone and a tablet on a wooden table beside a white router and a notepad, for adding a mobile plan and home broadband together.",
  },
  "router-wifi": {
    slug: "router-wifi",
    src: "/images/guides/router-wifi.jpg",
    webp: "/images/guides/router-wifi.webp",
    width: 1280,
    height: 720,
    alt: "白色 Wi-Fi 路由器放喺木側几，背景係暖色客廳",
    altEn: "A white Wi-Fi router on a wooden side table in a warm living room.",
  },
  "tuen-mun": {
    slug: "tuen-mun",
    src: "/images/guides/tuen-mun.jpg",
    webp: "/images/guides/tuen-mun.webp",
    width: 1280,
    height: 720,
    alt: "屯門黃金海岸黃昏海濱，住宅大廈同海面",
    altEn: "Tuen Mun Gold Coast waterfront at dusk, with residential towers and the sea.",
  },
  "student-plans": {
    slug: "student-plans",
    src: "/images/guides/student-plans.jpg",
    webp: "/images/guides/student-plans.webp",
    width: 1280,
    height: 720,
    alt: "書枱上打開嘅筆記型電腦、筆記本同手機，旁邊有白路由器",
    altEn: "An open laptop, notebook and phone on a study desk, with a white router nearby.",
  },
  "elderly-broadband": {
    slug: "elderly-broadband",
    src: "/images/guides/elderly-broadband.jpg",
    webp: "/images/guides/elderly-broadband.webp",
    width: 1280,
    height: 720,
    alt: "長輩坐喺暖色客廳梳化睇手機，茶几上有白路由器",
    altEn: "An older adult on a sofa in a warm living room looking at a phone, with a white router on the table.",
  },
};

export function isGuideTopicImageSlug(slug: string): slug is GuideTopicImageSlug {
  return slug in GUIDE_TOPIC_IMAGES;
}

export function guideTopicImage(slug: string): GuideTopicImage | undefined {
  return isGuideTopicImageSlug(slug) ? GUIDE_TOPIC_IMAGES[slug] : undefined;
}

/** Relative JPEG path for og:image / twitter:image. Injector prefixes the public host. */
export function guideShareImagePath(slug: string): string | undefined {
  return guideTopicImage(slug)?.src;
}
