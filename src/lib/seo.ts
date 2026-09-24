import { isListedPlan, PLANS } from "./plans.ts";
import { INDEXABLE_ESTATE_PAGES, estatePagePath, estateSeoDescription, estateSeoTitle, type EstatePage } from "./estate-pages.ts";
import { GUIDES, getGuide, type Guide } from "./guides.ts";
import { TECH_NEWS_ARTICLES, TECH_NEWS_CATEGORIES } from "./tech-news.ts";
import { guideTopicImage } from "./guide-media.ts";
import { SITE } from "./site.ts";
import {
  ABOUT_SEO,
  CATEGORY_SEO,
  DEFAULT_SEO_ORIGIN,
  GUIDES_SEO,
  HOME_SEO,
  HOME_SEO_TITLE,
  INDEXABLE_ROBOTS,
  LOCKED_PAGE_SEO,
  NOT_FOUND_SEO,
  PRIVACY_SEO,
  canonicalUrl,
  canonicalUrlFromMatches,
  canonicalRedirectLocation,
  plansCatRedirectLocation,
  documentFallbackTitle,
  documentRobots,
  isNotFoundDocument,
  isLegacyProductionHost,
  notFoundHead,
  plansCategoryPath,
  requestHostname,
  runtimeSeoOrigin,
  seoOrigin,
  shareHead,
  homeJsonLd,
  LEGACY_PRODUCTION_HOSTS,
} from "./canonical.ts";

export {
  ABOUT_SEO,
  CATEGORY_SEO,
  DEFAULT_SEO_ORIGIN,
  GUIDES_SEO,
  HOME_SEO,
  HOME_SEO_TITLE,
  INDEXABLE_ROBOTS,
  LEGACY_PRODUCTION_HOSTS,
  LOCKED_PAGE_SEO,
  NOT_FOUND_SEO,
  PRIVACY_SEO,
  canonicalUrl,
  canonicalUrlFromMatches,
  canonicalRedirectLocation,
  plansCatRedirectLocation,
  documentFallbackTitle,
  documentRobots,
  isNotFoundDocument,
  notFoundHead,
  isLegacyProductionHost,
  plansCategoryPath,
  requestHostname,
  runtimeSeoOrigin,
  seoOrigin,
  shareHead,
  homeJsonLd,
};

export type SitemapChangefreq = "weekly" | "monthly";

export type SitemapPage = {
  /** Path + optional query, always starting with `/`. */
  path: string;
  changefreq: SitemapChangefreq;
  priority: string;
};

/** Protocol cap. Live URL count is far below this; do not split files yet. */
export const SITEMAP_URL_LIMIT = 50_000;

const W3C_LASTMOD = /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/;

/**
 * SITE.updated is a catalogue stamp (`2026-09-20`, `2026年9月20日`, or `2026年9月`).
 * Convert documented forms to W3C `YYYY-MM` / `YYYY-MM-DD`.
 * Do not invent a clock date.
 */
export function siteDataLastmod(stamp: string = SITE.updated): string | undefined {
  if (W3C_LASTMOD.test(stamp)) return stamp;
  const day = /^(\d{4})年(\d{1,2})月(\d{1,2})日$/.exec(stamp);
  if (day) {
    return `${day[1]}-${day[2]!.padStart(2, "0")}-${day[3]!.padStart(2, "0")}`;
  }
  const match = /^(\d{4})年(\d{1,2})月$/.exec(stamp);
  if (!match) return undefined;
  return `${match[1]}-${match[2]!.padStart(2, "0")}`;
}

/** Last calendar day of SITE.updated, for Offer.priceValidUntil. */
export function siteOfferValidUntil(stamp: string = SITE.updated): string | undefined {
  const month = siteDataLastmod(stamp);
  if (!month) return undefined;
  const year = Number(month.slice(0, 4));
  const mon = Number(month.slice(5, 7));
  if (mon < 1 || mon > 12) return undefined;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return `${month.slice(0, 7)}-${String(days[mon - 1]).padStart(2, "0")}`;
}

/**
 * lastmod only from repo-backed dates. Guide `modified` / `published` win
 * for article URLs. Other URLs use the site catalogue stamp. Omit when
 * neither source exists — never use the clock.
 */
export function sitemapLastmod(path: string): string | undefined {
  if (path.startsWith("/guides/")) {
    const slug = path.slice("/guides/".length);
    if (slug && !slug.includes("/")) {
      const guide = getGuide(slug);
      if (guide) {
        const date = guide.modified ?? guide.published;
        return date && W3C_LASTMOD.test(date) ? date : undefined;
      }
    }
  }
  if (path.startsWith("/tech-news/")) {
    const slug = path.slice("/tech-news/".length);
    if (slug && !slug.includes("/")) {
      const article = TECH_NEWS_ARTICLES.find((item) => item.slug === slug);
      if (article?.published && W3C_LASTMOD.test(article.published)) return article.published;
    }
  }
  return siteDataLastmod();
}

/** Static indexable URLs. Filter-parameter pages are not listed. */
export const STATIC_SITEMAP_PAGES: readonly SitemapPage[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/plans?cat=broadband", changefreq: "weekly", priority: "0.9" },
  { path: "/plans?cat=home5g", changefreq: "weekly", priority: "0.8" },
  { path: "/plans?cat=mobile", changefreq: "weekly", priority: "0.8" },
  { path: "/plans?cat=business", changefreq: "weekly", priority: "0.7" },
  { path: "/guides", changefreq: "monthly", priority: "0.7" },
  { path: "/tech-news", changefreq: "weekly", priority: "0.6" },
  { path: "/estates", changefreq: "weekly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "monthly", priority: "0.4" },
];

/** Category hub guides rank above one-off articles. */
export const HUB_GUIDE_SLUGS = new Set(["fiber", "home5g", "mobile", "business"]);

export const GUIDE_ARTICLE_KEYWORDS: Record<string, string> = {
  fiber: "香港光纖寬頻,公屋寬頻,居屋寬頻,私樓光纖,村屋光纖,村屋光纖月費,1000M",
  home5g: "香港5G家居,5G家居寬頻,免拉線寬頻,村屋5G",
  mobile: "香港手機月費,攜號轉台,大灣區數據,5G月費",
  business: "香港商業寬頻,店舖寬頻,寫字樓寬頻,固定IP",
  "public-hos-fees": "公屋寬頻月費,居屋1000M,公屋光纖參考月費",
  "private-1000-fees": "私樓寬頻月費,私樓1000M,私人樓宇光纖參考月費",
  "village-fees": "村屋光纖月費,丁屋光纖月費,村屋寬頻月費,丁屋寬頻,村屋光纖參考月費",
  "home-broadband-2026": "2026家居寬頻,家居光纖參考月費,1000M月費,2500M月費",
  "estate-filter": "屋苑篩,齊Quote屋苑,寬頻覆蓋查核",
  "switch-broadband": "轉寬頻,轉台寬頻,先裝後停",
  "tin-shui-wai": "天水圍寬頻,天耀邨寬頻,嘉湖山莊寬頻,天水圍光纖",
  "sha-tin": "沙田寬頻,沙田第一城寬頻,瀝源邨寬頻,馬鞍山寬頻",
  "tseung-kwan-o": "將軍澳寬頻,日出康城寬頻,坑口寬頻,寶林邨寬頻",
};

export const SITEMAP_PAGES: readonly SitemapPage[] = [
  ...STATIC_SITEMAP_PAGES,
  ...GUIDES.map((guide) => ({
    path: `/guides/${guide.slug}`,
    changefreq: "monthly" as const,
    priority: HUB_GUIDE_SLUGS.has(guide.slug) ? "0.8" : "0.6",
  })),
  ...TECH_NEWS_CATEGORIES.map((cat) => ({
    path: `/tech-news/${cat.slug}`,
    changefreq: "weekly" as const,
    priority: "0.5",
  })),
  ...TECH_NEWS_ARTICLES.map((article) => ({
    path: `/tech-news/${article.slug}`,
    changefreq: "weekly" as const,
    priority: "0.5",
  })),
  ...INDEXABLE_ESTATE_PAGES.map((page) => ({
    path: estatePagePath(page),
    changefreq: "weekly" as const,
    priority: "0.6",
  })),
  ...PLANS.filter(isListedPlan).map((plan) => ({
    path: `/plans/${plan.id}`,
    changefreq: "weekly" as const,
    priority: "0.7",
  })),
];

export {
  planHousingLabel,
  planJsonLd,
  planJsonLdImage,
  planSeoDescription,
  planSeoTitle,
  planSpeedLabel,
} from "./plan-seo.ts";
export { categoryJsonLd } from "./category-jsonld.ts";

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
      image: `${SITE.url}${guideTopicImage(guide.slug)?.src ?? "/og.jpg"}`,
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

export function estateJsonLd(page: EstatePage) {
  const url = canonicalUrl(estatePagePath(page));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: estateSeoTitle(page.estate),
        description: estateSeoDescription(page.estate),
        url,
        inLanguage: "zh-HK",
        isPartOf: { "@id": `${SITE.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首頁", item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: "香港屋苑寬頻比較", item: canonicalUrl("/estates") },
          { "@type": "ListItem", position: 3, name: page.estate.name, item: url },
        ],
      },
    ],
  };
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function renderSitemapXml(
  origin: string = DEFAULT_SEO_ORIGIN,
  extra: readonly SitemapPage[] = [],
): string {
  const host = seoOrigin(origin);
  const urls = [...SITEMAP_PAGES, ...extra].map((page) => {
    const loc = escapeXml(`${host}${page.path}`);
    const lastmod = sitemapLastmod(page.path);
    const lastmodXml = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
    return `  <url><loc>${loc}</loc>${lastmodXml}<changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`;
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
    "Allow: /tech-news",
    "Allow: /about",
    "Disallow: /brand",
    "Disallow: /tech-news/desk",
    "Disallow: /offers/",
    "Disallow: /go/",
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
