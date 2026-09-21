/**
 * Dedicated /sitemap.xml handler for the Nitro / Vercel function.
 *
 * public/sitemap.xml is still copied to the CDN static output (and served by
 * Vite in `dev`). On Vercel, unmatched or function-routed requests used to
 * fall through TanStack Start SSR and 500. This route returns the XML from
 * the same generator as the static file — no React, no DB, no filesystem
 * read of public/ (that directory is not on the lambda).
 */
import { renderSitemapXml, runtimeSeoOrigin, SEO_CACHE_CONTROL, SITEMAP_CONTENT_TYPE } from "../../src/lib/seo";
import { listPublishedNews } from "../../src/lib/tech-news-store";

export default async function sitemapXml() {
  let extra: { path: string; changefreq: "weekly"; priority: string }[] = [];
  try {
    extra = (await listPublishedNews()).map((article) => ({
      path: `/tech-news/${article.slug}`,
      changefreq: "weekly" as const,
      priority: "0.5",
    }));
  } catch {
    extra = [];
  }
  return new Response(renderSitemapXml(runtimeSeoOrigin(), extra), {
    headers: {
      "content-type": SITEMAP_CONTENT_TYPE,
      "cache-control": SEO_CACHE_CONTROL,
    },
  });
}
