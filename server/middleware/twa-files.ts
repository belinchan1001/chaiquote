/**
 * Digital Asset Links and the stable web manifest.
 *
 * public/ copies are CDN static files when Vite includes them. This middleware
 * is the lambda fallback: Vercel functions cannot read public/ at runtime, so
 * the bytes are bundled with `?raw`. Content-Type is set explicitly because
 * `.webmanifest` is not always `application/manifest+json`.
 *
 * Chrome's TWA check GETs `/.well-known/assetlinks.json` itself. It does not
 * call the Digital Asset Links API, run JavaScript, or send the page's
 * challenge cookie. HTTP 429 HTML (`x-vercel-mitigated: challenge`) fails
 * verification and the shell becomes a Custom Tab. `vercel.json` cannot set a
 * WAF bypass; the Firewall rule is in `android/README.md`.
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
