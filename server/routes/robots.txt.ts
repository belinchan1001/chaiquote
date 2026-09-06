/**
 * Dedicated /robots.txt handler for the Nitro / Vercel function.
 * Same rationale as server/routes/sitemap.xml.ts — keep Allow: / and the
 * Sitemap line pointed at this host's /sitemap.xml.
 */
import { renderRobotsTxt, ROBOTS_CONTENT_TYPE, runtimeSeoOrigin, SEO_CACHE_CONTROL } from "../../src/lib/seo";

export default function robotsTxt() {
  return new Response(renderRobotsTxt(runtimeSeoOrigin()), {
    headers: {
      "content-type": ROBOTS_CONTENT_TYPE,
      "cache-control": SEO_CACHE_CONTROL,
    },
  });
}
