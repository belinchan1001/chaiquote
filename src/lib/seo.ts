import { formatFee, PLANS, PROVIDER_MAP, type Housing, type Plan } from "./plans.ts";
import { ESTATE_PAGES, estatePagePath } from "./estate-pages.ts";
import { GUIDES, type Guide } from "./guides.ts";
import { SITE } from "./site.ts";
import {
  ABOUT_SEO,
  CATEGORY_SEO,
  DEFAULT_SEO_ORIGIN,
  GUIDES_SEO,
  HOME_SEO,
  HOME_SEO_TITLE,
  LOCKED_PAGE_SEO,
  PRIVACY_SEO,
  canonicalUrl,
  canonicalUrlFromMatches,
  canonicalRedirectLocation,
  isLegacyProductionHost,
  plansCategoryPath,
  requestHostname,
  runtimeSeoOrigin,
  seoOrigin,
  shareHead,
  LEGACY_PRODUCTION_HOSTS,
} from "./canonical.ts";

export {
  ABOUT_SEO,
  CATEGORY_SEO,
  DEFAULT_SEO_ORIGIN,
  GUIDES_SEO,
  HOME_SEO,
  HOME_SEO_TITLE,
  LEGACY_PRODUCTION_HOSTS,
  LOCKED_PAGE_SEO,
  PRIVACY_SEO,
  canonicalUrl,
  canonicalUrlFromMatches,
  canonicalRedirectLocation,
  isLegacyProductionHost,
  plansCategoryPath,
  requestHostname,
  runtimeSeoOrigin,
  seoOrigin,
  shareHead,
};

export type SitemapChangefreq = "weekly" | "monthly";

export type SitemapPage = {
  /** Path + optional query, always starting with `/`. */
  path: string;
  changefreq: SitemapChangefreq;
  priority: string;
};

/** Static indexable URLs. Filter-parameter pages are not listed. */
export const STATIC_SITEMAP_PAGES: readonly SitemapPage[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/plans?cat=broadband", changefreq: "weekly", priority: "0.9" },
  { path: "/plans?cat=home5g", changefreq: "weekly", priority: "0.8" },
  { path: "/plans?cat=mobile", changefreq: "weekly", priority: "0.8" },
  { path: "/plans?cat=business", changefreq: "weekly", priority: "0.7" },
  { path: "/quote", changefreq: "monthly", priority: "0.6" },
  { path: "/guides", changefreq: "monthly", priority: "0.7" },
  { path: "/estates", changefreq: "weekly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "monthly", priority: "0.4" },
];

/** Category hub guides rank above one-off articles. */
export const HUB_GUIDE_SLUGS = new Set(["fiber", "home5g", "mobile", "business"]);

export const GUIDE_ARTICLE_KEYWORDS: Record<string, string> = {
  fiber: "香港光纖寬頻,公屋寬頻,居屋寬頻,私樓光纖,村屋光纖,1000M",
  home5g: "香港5G家居,5G家居寬頻,免拉線寬頻,村屋5G",
  mobile: "香港手機月費,攜號轉台,大灣區數據,5G月費",
  business: "香港商業寬頻,店舖寬頻,寫字樓寬頻,固定IP",
  "public-hos-fees": "公屋寬頻月費,居屋1000M,公屋光纖參考月費",
  "estate-filter": "屋苑篩,齊Quote屋苑,寬頻覆蓋查核",
  "switch-broadband": "轉寬頻,轉台寬頻,先裝後停",
};

export const SITEMAP_PAGES: readonly SitemapPage[] = [
  ...STATIC_SITEMAP_PAGES,
  ...GUIDES.map((guide) => ({
    path: `/guides/${guide.slug}`,
    changefreq: "monthly" as const,
    priority: HUB_GUIDE_SLUGS.has(guide.slug) ? "0.8" : "0.6",
  })),
  ...ESTATE_PAGES.map((page) => ({
    path: estatePagePath(page),
    changefreq: "weekly" as const,
    priority: "0.6",
  })),
  ...PLANS.filter((plan) => !plan.onlyEstates?.length).map((plan) => ({
    path: `/plans/${plan.id}`,
    changefreq: "weekly" as const,
    priority: "0.7",
  })),
];

const HOUSING_ZH: Record<Housing, string> = {
  public: "公屋",
  hos: "居屋",
  private: "私樓",
  village: "村屋",
};

export function planHousingLabel(plan: Plan): string {
  if (plan.housing === "all") return "公屋、居屋、私樓及村屋";
  return plan.housing.map((id) => HOUSING_ZH[id]).join("、");
}

export function planSpeedLabel(plan: Plan): string {
  if (plan.category === "home5g") return "100M–1000M";
  if (plan.speedMbps) return `${plan.speedMbps}M`;
  return "";
}

export function planSeoTitle(plan: Plan): string {
  const provider = PROVIDER_MAP[plan.providerId].name;
  const speed = planSpeedLabel(plan);
  const mid = speed ? `${provider} ${speed}` : provider;
  return `${plan.name}｜${mid}｜月費 ${formatFee(plan.monthlyFee)}｜齊Quote`;
}

export function planSeoDescription(plan: Plan): string {
  const provider = PROVIDER_MAP[plan.providerId].name;
  const speed = planSpeedLabel(plan);
  const speedBit = speed ? `網絡${speed}。` : "";
  let text = `${plan.name}由${provider}提供，月費${formatFee(plan.monthlyFee)}，${plan.contractMonths}個月合約。適用樓類：${planHousingLabel(plan)}。${speedBit}實際月費、覆蓋及安裝安排以電訊商確認為準。`;
  if (text.length < 70) {
    text = text.replace("以電訊商確認為準。", "詳情請向銷售員查詢，以電訊商確認為準。");
  }
  return text;
}

export function planJsonLd(plan: Plan) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: plan.name,
    brand: { "@type": "Brand", name: PROVIDER_MAP[plan.providerId].name },
    description: planSeoDescription(plan),
    offers: {
      "@type": "Offer",
      price: plan.monthlyFee,
      priceCurrency: "HKD",
      availability: "https://schema.org/InStock",
      url: canonicalUrl(`/plans/${plan.id}`),
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "合約期", value: `${plan.contractMonths}個月` },
      { "@type": "PropertyValue", name: "樓類", value: planHousingLabel(plan) },
    ],
  };
}

function plainText(value: string): string {
  return value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}

export function guideJsonLd(guide: Guide) {
  const url = canonicalUrl(`/guides/${guide.slug}`);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: guide.h1,
      name: guide.seoTitle,
      description: guide.description,
      inLanguage: "zh-HK",
      datePublished: guide.published ?? "2026-09-09",
      dateModified: guide.modified ?? guide.published ?? "2026-09-09",
      mainEntityOfPage: url,
      url,
      author: { "@type": "Organization", name: SITE.name, url: SITE.url },
      publisher: {
        "@type": "Organization",
        name: SITE.name,
        url: SITE.url,
        logo: { "@type": "ImageObject", url: `${SITE.url}/icon-512.png` },
      },
      image: `${SITE.url}/og.jpg`,
      ...(GUIDE_ARTICLE_KEYWORDS[guide.slug]
        ? { keywords: GUIDE_ARTICLE_KEYWORDS[guide.slug] }
        : {}),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "首頁", item: canonicalUrl("/") },
        { "@type": "ListItem", position: 2, name: "攻略", item: canonicalUrl("/guides") },
        { "@type": "ListItem", position: 3, name: guide.h1, item: url },
      ],
    },
  ];
  if (guide.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: guide.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: plainText(item.a) },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&").replaceAll("<", "<").replaceAll(">", ">");
}

export function renderSitemapXml(origin: string = DEFAULT_SEO_ORIGIN): string {
  const host = seoOrigin(origin);
  const urls = SITEMAP_PAGES.map((page) => {
    const loc = escapeXml(`${host}${page.path}`);
    return `  <url><loc>${loc}</loc><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function renderRobotsTxt(origin: string = DEFAULT_SEO_ORIGIN): string {
  const host = seoOrigin(origin);
  return [
    "User-agent: *",
    "Allow: /",
    "Allow: /plans",
    "Allow: /estates",
    "Allow: /guides",
    "Allow: /about",
    "Disallow: /brand",
    "Disallow: /__grok/",
    "Disallow: /api/",
    "",
    `Sitemap: ${host}/sitemap.xml`,
    "",
  ].join("\n");
}

export const SITEMAP_CONTENT_TYPE = "application/xml; charset=utf-8";
export const ROBOTS_CONTENT_TYPE = "text/plain; charset=utf-8";
export const SEO_CACHE_CONTROL = "public, max-age=3600";
