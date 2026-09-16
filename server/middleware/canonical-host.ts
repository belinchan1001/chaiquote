/**
 * 301 production traffic on the apex and the old Vercel alias to www.
 * Preview deployments use *.vercel.app (or project-git-*.vercel.app) and
 * must keep serving locally — only chaiquote.hk and the exact production
 * alias are redirected.
 */
import { canonicalRedirectLocation } from "../../src/lib/seo";

interface CanonicalHostEvent {
  url: URL;
  req: { headers?: Headers; headersList?: { get?: (name: string) => string | null } };
}

function header(event: CanonicalHostEvent, name: string): string | null {
  return event.req.headers?.get?.(name) ?? event.req.headersList?.get?.(name) ?? null;
}

export default function canonicalHostMiddleware(
  event: CanonicalHostEvent,
  next: () => unknown | Promise<unknown>,
): unknown | Promise<unknown> {
  const host = header(event, "x-forwarded-host") ?? header(event, "host") ?? event.url.host;
  const location = canonicalRedirectLocation(event.url, host);
  if (!location) return next();
  return new Response(null, {
    status: 301,
    headers: {
      location,
      "cache-control": "public, max-age=3600",
    },
  });
}
