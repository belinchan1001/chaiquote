/**
 * Public origin for sitemap loc tags and robots.txt Sitemap.
 *
 * TODO: make this host configurable (e.g. via SITE.url / env) once
 * chaiquote.hk is Valid + HTTPS. Do not switch loc URLs off
 * chaiquote.vercel.app until then.
 */
export const DEFAULT_SEO_ORIGIN = "https://chaiquote.vercel.app";

export function seoOrigin(origin = DEFAULT_SEO_ORIGIN): string {
  return origin.replace(/\/+$/, "");
}

export type SitemapChangefreq = "weekly" | "monthly";

export type SitemapPage = {
  /** Path + optional query, always starting with `/`. */
  path: string;
  changefreq: SitemapChangefreq;
  priority: string;
};

/** Indexable URLs. Keep in sync with the customer-facing routes we want crawled. */
export const SITEMAP_PAGES: readonly SitemapPage[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/plans", changefreq: "weekly", priority: "0.9" },
  { path: "/plans?cat=broadband", changefreq: "weekly", priority: "0.8" },
  { path: "/plans?cat=home5g", changefreq: "weekly", priority: "0.8" },
  { path: "/plans?cat=mobile", changefreq: "weekly", priority: "0.8" },
  { path: "/plans?cat=business", changefreq: "weekly", priority: "0.7" },
  { path: "/quote", changefreq: "monthly", priority: "0.8" },
  { path: "/guides", changefreq: "monthly", priority: "0.7" },
  { path: "/guides/port-in", changefreq: "monthly", priority: "0.6" },
  { path: "/guides/fiber-vs-5g", changefreq: "monthly", priority: "0.6" },
  { path: "/guides/village", changefreq: "monthly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
];

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function renderSitemapXml(origin = DEFAULT_SEO_ORIGIN): string {
  const host = seoOrigin(origin);
  const urls = SITEMAP_PAGES.map((page) => {
    const loc = escapeXml(`${host}${page.path}`);
    return `  <url><loc>${loc}</loc><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function renderRobotsTxt(origin = DEFAULT_SEO_ORIGIN): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${seoOrigin(origin)}/sitemap.xml\n`;
}

export const SITEMAP_CONTENT_TYPE = "application/xml; charset=utf-8";
export const ROBOTS_CONTENT_TYPE = "text/plain; charset=utf-8";
export const SEO_CACHE_CONTROL = "public, max-age=3600";
