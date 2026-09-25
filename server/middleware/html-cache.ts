/**
 * CDN-cache HTML documents. Browser still revalidates; Vercel edge keeps a
 * copy so Hong Kong visitors are not hitting a cold function on every click.
 * Plan/estate data lives in the repo, so a deploy already busts this cache.
 * Skip one-time offer links, install tutorial, and cookie'd responses.
 */
const HTML_CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";
const NOT_FOUND_CACHE = "public, s-maxage=60, stale-while-revalidate=600";

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
  if (result.status === 404 || path === "/staff" || path.startsWith("/plans/desk")) {
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
  const cache = HTML_CACHE;
  headers.set("Cache-Control", cache);
  headers.set("CDN-Cache-Control", cache);
  headers.set("Vercel-CDN-Cache-Control", cache);
  if (result.status === 404) {
    headers.set("X-Robots-Tag", "noindex, follow");
  }
  return new Response(result.body, {
    status: result.status,
    statusText: result.statusText,
    headers,
  });
}
