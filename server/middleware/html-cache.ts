/**
 * CDN-cache HTML documents. Browser still revalidates; Vercel edge keeps a
 * short copy so Hong Kong visitors are not hitting iad1 on every navigation.
 * Skip one-time offer links, install tutorial, and cookie'd responses.
 */
const HTML_CACHE = "public, s-maxage=300, stale-while-revalidate=86400";
const NOT_FOUND_CACHE = "public, s-maxage=60, stale-while-revalidate=600";

interface HtmlCacheEvent {
  url: URL;
  req: { method?: string };
}

function shouldCacheHtml(event: HtmlCacheEvent, response: Response): boolean {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET") return false;
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
  const headers = new Headers(result.headers);
  headers.set("Cache-Control", result.status === 404 ? NOT_FOUND_CACHE : HTML_CACHE);
  headers.set("CDN-Cache-Control", headers.get("Cache-Control") ?? HTML_CACHE);
  return new Response(result.body, {
    status: result.status,
    statusText: result.statusText,
    headers,
  });
}
