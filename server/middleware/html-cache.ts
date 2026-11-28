/**
 * CDN-cache HTML documents for the current deployment. The browser revalidates
 * on every navigation; Vercel's edge keeps a one-hour copy so Hong Kong
 * visitors are not hitting a cold function on every click.
 *
 * Do not set stale-while-revalidate. Once an entry is stale, that directive
 * serves the previous document while the cache revalidates in the background
 * (`x-vercel-cache: STALE`) for the whole SWR window. Vercel only strips
 * `s-maxage` and `stale-while-revalidate` from `Cache-Control` when it is the
 * sole cache header. This middleware also sets `CDN-Cache-Control` and
 * `Vercel-CDN-Cache-Control`, so those directives would be forwarded to
 * browsers and to any downstream CDN, neither of which is keyed by deployment.
 * The production alias only has the current deployment's hashed `/assets/*`
 * files, so a stale document keeps requesting hashes that are already gone.
 * `s-maxage=3600` is the fresh CDN lifetime inside this deployment; after that
 * the next request waits for new HTML. Skew Protection can pin a browser to
 * one deployment, but it is optional and this policy does not depend on it.
 *
 * Skip one-time offer links, install tutorial, and cookie'd responses.
 */
const HTML_BROWSER_CACHE = "public, max-age=0, must-revalidate";
const HTML_CDN_CACHE = "public, s-maxage=3600";

interface HtmlCacheEvent {
  url: URL;
  req: { method?: string };
}

function shouldCacheHtml(event: HtmlCacheEvent, response: Response): boolean {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return false;
  if (event.url.pathname.startsWith("/offers")) return false;
  if (event.url.pathname.startsWith("/api/")) return false;
  if (event.url.searchParams.has("install")) return false;
  if (response.headers.has("set-cookie")) return false;
  const type = String(response.headers.get("content-type") ?? "");
  return type.includes("text/html");
}

export default async function htmlCacheMiddleware(
  event: HtmlCacheEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const result = await next();
  if (!(result instanceof Response) || !shouldCacheHtml(event, result)) return result;
  const path = event.url.pathname;
  if (
    result.status === 404 ||
    path === "/staff" ||
    path === "/desk" ||
    path === "/sales" ||
    path === "/sales/register"
  ) {
    const headers = new Headers(result.headers);
    headers.set("Cache-Control", "private, no-store");
    headers.set("CDN-Cache-Control", "private, no-store");
    headers.set("Vercel-CDN-Cache-Control", "private, no-store");
    return new Response(result.body, {
      status: result.status,
      statusText: result.statusText,
      headers,
    });
  }
  const headers = new Headers(result.headers);
  headers.set("Cache-Control", HTML_BROWSER_CACHE);
  headers.set("CDN-Cache-Control", HTML_CDN_CACHE);
  headers.set("Vercel-CDN-Cache-Control", HTML_CDN_CACHE);
  if (result.status === 404) {
    headers.set("X-Robots-Tag", "noindex, follow");
  }
  return new Response(result.body, {
    status: result.status,
    statusText: result.statusText,
    headers,
  });
}
