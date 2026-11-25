/**
 * Approved /llms.txt body.
 *
 * public/llms.txt is the CDN static copy (and what Vite serves in dev).
 * The Vercel function cannot read public/ at runtime, and a path with no
 * Nitro route falls through TanStack Start as an HTML 404 with noindex.
 * Bundle these exact bytes with `?raw`.
 */
import llmsTxt from "../public/llms.txt?raw";

export const LLMS_CONTENT_TYPE = "text/plain; charset=utf-8";
export const LLMS_CACHE_CONTROL = "public, max-age=3600";

export function llmsTxtResponse(): Response {
  return new Response(llmsTxt, {
    status: 200,
    headers: {
      "content-type": LLMS_CONTENT_TYPE,
      "cache-control": LLMS_CACHE_CONTROL,
    },
  });
}
