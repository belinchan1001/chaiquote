/**
 * Short-circuit crawler files before TanStack Start SSR / Nitro static
 * serving. On Vercel the lambda cannot read public/, and the catch-all
 * used to render /sitemap.xml as an app document (intermittent HTTP 500).
 *
 * server/routes/sitemap.xml.ts and robots.txt.ts are the named routes;
 * this middleware is the guaranteed early hook if a request still hits
 * the function (same pattern as grok-pwa.ts).
 */
import {
  renderRobotsTxt,
  renderSitemapXml,
  ROBOTS_CONTENT_TYPE,
  SEO_CACHE_CONTROL,
  SITEMAP_CONTENT_TYPE,
} from "../../src/lib/seo";

interface SeoFilesEvent {
  url: URL;
  req: { method: string };
}

function methodOk(method: string): boolean {
  const verb = method.toUpperCase();
  return verb === "GET" || verb === "HEAD";
}

export default function seoFilesMiddleware(
  event: SeoFilesEvent,
  next: () => unknown | Promise<unknown>,
): unknown | Promise<unknown> {
  if (!methodOk(event.req.method ?? "GET")) return next();

  const path = event.url.pathname;
  if (path === "/sitemap.xml") {
    return new Response(renderSitemapXml(), {
      headers: {
        "content-type": SITEMAP_CONTENT_TYPE,
        "cache-control": SEO_CACHE_CONTROL,
      },
    });
  }
  if (path === "/robots.txt") {
    return new Response(renderRobotsTxt(), {
      headers: {
        "content-type": ROBOTS_CONTENT_TYPE,
        "cache-control": SEO_CACHE_CONTROL,
      },
    });
  }
  return next();
}
