/** Topic/OG images for port-in, fiber, village, and the fiber-vs-5g choose guide. */

export const GUIDE_TOPIC_IMAGE_SLUGS = ["port-in", "fiber", "village", "fiber-vs-5g"] as const;

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
    width: 1280,
    height: 720,
    alt: "暖色客廳：男士喺木枱前同時睇兩部手機，旁邊放住白色路由器",
    altEn: "Warm living-room scene: a man at a wooden table looking at two phones, with a white router beside him",
  },
  fiber: {
    slug: "fiber",
    src: "/images/guide-fiber.jpg",
    webp: "/images/guide-fiber.webp",
    width: 1280,
    height: 720,
    alt: "暖色客廳：一對伴侶坐喺梳化上各自拿住手機，旁邊有白色路由器",
    altEn: "Warm living-room scene: a couple on a sofa each holding a phone, with a white router nearby",
  },
  village: {
    slug: "village",
    src: "/images/guide-village.jpg",
    webp: "/images/guide-village.webp",
    width: 1280,
    height: 720,
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
