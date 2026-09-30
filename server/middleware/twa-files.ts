/**
 * Digital Asset Links and the stable web manifest.
 *
 * public/ copies are CDN static files when Vite includes them. This middleware
 * is the lambda fallback: Vercel functions cannot read public/ at runtime, so
 * the bytes are bundled with `?raw`. Content-Type is set explicitly because
 * `.webmanifest` is not always `application/manifest+json`.
 */
import assetlinks from "../../public/.well-known/assetlinks.json?raw";
import webManifest from "../../public/manifest.webmanifest?raw";

interface TwaFilesEvent {
  url: URL;
  req: { method: string };
}

function methodOk(method: string): boolean {
  const verb = method.toUpperCase();
  return verb === "GET" || verb === "HEAD";
}

export default function twaFilesMiddleware(
  event: TwaFilesEvent,
  next: () => unknown | Promise<unknown>,
): unknown | Promise<unknown> {
  if (!methodOk(event.req.method ?? "GET")) return next();

  const path = event.url.pathname;
  if (path === "/.well-known/assetlinks.json") {
    return new Response(assetlinks, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }
  if (path === "/manifest.webmanifest") {
    return new Response(webManifest, {
      headers: {
        "content-type": "application/manifest+json; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }
  return next();
}
