/**
 * 301 `/plans` without `cat` onto the broadband hub, keeping q/estate.
 * Do not do this in vercel.json: a destination that already has `?cat=`
 * drops the original query, which emptied Google sitelinks search.
 */
import { plansCatRedirectLocation } from "../../src/lib/canonical";

interface PlansCatEvent {
  url: URL;
  req: { method?: string };
}

export default function plansCatMiddleware(
  event: PlansCatEvent,
  next: () => unknown | Promise<unknown>,
): unknown | Promise<unknown> {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return next();
  const location = plansCatRedirectLocation(event.url);
  if (!location) return next();
  return new Response(null, {
    status: 301,
    headers: {
      location,
      "cache-control": "public, max-age=3600",
    },
  });
}
