/** Topic/OG images locked to three guide slugs. Other guides keep `/og.jpg`. */

export const GUIDE_TOPIC_IMAGE_SLUGS = ["port-in", "fiber", "village"] as const;

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
    alt: "攜號轉台示意：兩部手機同 SIM 卡",
    altEn: "Number port-in illustration: two phones and a SIM card",
  },
  fiber: {
    slug: "fiber",
    src: "/images/guide-fiber.jpg",
    webp: "/images/guide-fiber.webp",
    width: 1200,
    height: 630,
    alt: "樓類光纖示意：三類住宅樓同入屋光纖",
    altEn: "Housing-type fibre illustration: three building types and a fibre line",
  },
  village: {
    slug: "village",
    src: "/images/guide-village.jpg",
    webp: "/images/guide-village.webp",
    width: 1200,
    height: 630,
    alt: "村屋光纖示意：新界村屋同入屋線路",
    altEn: "Village house fibre illustration: a New Territories house and a drop line",
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
