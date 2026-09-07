/* 齊Quote production service worker.
 * Exists so Chrome installability has an active SW. Keeps SSR and
 * third-party links (WhatsApp, analytics) on the network — we only
 * precache static icons and never intercept navigations or other origins.
 */
const CACHE = "chaiquote-pwa-v1";
const PRECACHE = [
  "/icon-192.png",
  "/icon-512.png",
  "/__grok/icon-192-maskable.png",
  "/__grok/icon-512-maskable.png",
  "/apple-touch-icon.png",
  "/favicon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // WhatsApp, grok extensions, OG, etc. — never touch another origin.
  if (url.origin !== self.location.origin) return;
  // Documents stay on the network so TanStack/Nitro SSR is not frozen.
  if (request.mode === "navigate" || request.destination === "document") return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;
  if (url.pathname === "/sw.js" || url.pathname.endsWith(".webmanifest")) return;

  if (!PRECACHE.includes(url.pathname)) return;

  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(request).then((hit) => {
        if (hit) return hit;
        return fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
      }),
    ),
  );
});
