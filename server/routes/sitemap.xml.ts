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

export default function sitemapXml() {
  return new Response(renderSitemapXml(runtimeSeoOrigin()), {
    headers: {
      "content-type": SITEMAP_CONTENT_TYPE,
      "cache-control": SEO_CACHE_CONTROL,
    },
  });
}
