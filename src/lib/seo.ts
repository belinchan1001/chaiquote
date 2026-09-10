/**
 * Official canonical host for loc tags, robots Sitemap, and share URLs.
 * Apex chaiquote.hk redirects to www — always prefer www.
 * Keep in sync with SITE.url.
 *
 * Preview: set SEO_ORIGIN (e.g. https://chaiquote.vercel.app) so a Vercel
 * preview can emit its own sitemap without changing production defaults.
 */
import { formatFee, PLANS, PROVIDER_MAP, type Category, type Housing, type Plan } from "./plans.ts";
import { ESTATE_PAGES, estatePagePath } from "./estate-pages.ts";
import { GUIDES, type Guide } from "./guides.ts";
import { SITE } from "./site.ts";

export const DEFAULT_SEO_ORIGIN = "https://www.chaiquote.hk";

/** Production Vercel aliases only — never *.vercel.app preview hosts. */
export const LEGACY_PRODUCTION_HOSTS = [
  "chaiquote.vercel.app",
  "www.chaiquote.vercel.app",
] as const;

export function requestHostname(hostHeader: string | null | undefined): string {
  return String(hostHeader ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
}

export function isLegacyProductionHost(hostHeader: string | null | undefined): boolean {
  return (LEGACY_PRODUCTION_HOSTS as readonly string[]).includes(requestHostname(hostHeader));
}

/** Absolute official URL for a site path (`/` → https://www.chaiquote.hk/). */
export function canonicalUrl(pathname: string): string {
  const raw = pathname.trim() || "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const path = withSlash === "/" ? "/" : withSlash.replace(/\/+$/, "");
  return `${DEFAULT_SEO_ORIGIN}${path}`;
}

export function canonicalUrlFromMatches(
  matches: ReadonlyArray<{ pathname?: string; search?: Record<string, unknown> }>,
): string {
  const last = [...matches].at(-1);
  const path = last?.pathname ?? "/";
  if (path === "/plans" || path === "/plans/") {
    return canonicalUrl(plansCategoryPath(last?.search?.cat));
  }
  return canonicalUrl(path);
}

/** 301 Location for the official www host, or null when this request should stay. */
export function canonicalRedirectLocation(
  requestUrl: URL,
  hostHeader?: string | null,
): string | null {
  if (!isLegacyProductionHost(hostHeader ?? requestUrl.host)) return null;
  return `${DEFAULT_SEO_ORIGIN}${requestUrl.pathname}${requestUrl.search}`;
}

export function seoOrigin(origin: string = DEFAULT_SEO_ORIGIN): string {
  const host = origin.replace(/\/+$/, "");
  if (host === "https://chaiquote.hk" || host === "http://chaiquote.hk") {
    return "https://www.chaiquote.hk";
  }
  return host;
}

/** Runtime origin: SEO_ORIGIN override, else the official www host. */
export function runtimeSeoOrigin(): string {
  const override =
    (typeof process !== "undefined" ? process.env.SEO_ORIGIN?.trim() : "") || "";
  return seoOrigin(override || DEFAULT_SEO_ORIGIN);
}

export type SitemapChangefreq = "weekly" | "monthly";

export type SitemapPage = {
  /** Path + optional query, always starting with `/`. */
  path: string;
  changefreq: SitemapChangefreq;
  priority: string;
};

const CATEGORY_PATHS: Record<Category, string> = {
  broadband: "/plans?cat=broadband",
  home5g: "/plans?cat=home5g",
  mobile: "/plans?cat=mobile",
  business: "/plans?cat=business",
};

export function plansCategoryPath(cat: unknown): string {
  if (cat === "home5g" || cat === "mobile" || cat === "business" || cat === "broadband") {
    return CATEGORY_PATHS[cat];
  }
  return CATEGORY_PATHS.broadband;
}

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
  ...PLANS.map((plan) => ({
    path: `/plans/${plan.id}`,
    changefreq: "weekly" as const,
    priority: "0.7",
  })),
];

export const HOME_SEO_TITLE = "齊Quote｜香港寬頻比較：光纖、5G家居、手機月費";

export const CATEGORY_SEO: Record<Category, { title: string; description: string }> = {
  broadband: {
    title: "光纖寬頻比較｜齊Quote",
    description:
      "比較香港光纖寬頻月費，涵蓋公屋、居屋、私樓及村屋計劃。實際月費、覆蓋及安裝安排以電訊商確認為準。",
  },
  home5g: {
    title: "5G家居寬頻比較｜齊Quote",
    description:
      "比較香港 5G 家居寬頻月費，免拉線隨插即用。實際速度、覆蓋及安裝安排以電訊商確認為準。",
  },
  mobile: {
    title: "手機月費比較｜齊Quote",
    description:
      "比較香港手機月費計劃，包括 5G、4.5G 及轉台優惠。實際月費及用量以電訊商確認為準。",
  },
  business: {
    title: "商業寬頻比較｜齊Quote",
    description:
      "比較香港商業寬頻月費，適合店舖、寫字樓及工作室。實際月費、覆蓋及安裝安排以電訊商確認為準。",
  },
};

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
