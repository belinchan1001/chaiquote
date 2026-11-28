import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import htmlCacheMiddleware from "./html-cache.ts";

const BROWSER_CACHE = "public, max-age=0, must-revalidate";
const CDN_CACHE = "public, s-maxage=3600";
const CACHE_HEADERS = ["cache-control", "cdn-cache-control", "vercel-cdn-cache-control"] as const;

function page(pathname: string, init?: { method?: string; search?: string }) {
  const url = new URL(`https://www.chaiquote.hk${pathname}`);
  if (init?.search) url.search = init.search;
  return {
    url,
    req: { method: init?.method ?? "GET" },
  };
}

function html(status = 200, extra?: Record<string, string>) {
  return new Response("<!doctype html><title>chaiquote</title>", {
    status,
    headers: { "content-type": "text/html; charset=utf-8", ...extra },
  });
}

describe("HTML CDN cache", () => {
  it("keeps a one-hour CDN copy and does not serve stale HTML after it expires", async () => {
    const response = await htmlCacheMiddleware(page("/plans"), async () => html());
    assert.ok(response instanceof Response);
    assert.equal(response.headers.get("cache-control"), BROWSER_CACHE);
    assert.equal(response.headers.get("cdn-cache-control"), CDN_CACHE);
    assert.equal(response.headers.get("vercel-cdn-cache-control"), CDN_CACHE);
    for (const header of CACHE_HEADERS) {
      const value: string = response.headers.get(header) ?? "";
      assert.equal(value.includes("stale-while-revalidate"), false, header);
      assert.equal(value.includes("stale-if-error"), false, header);
    }
  });

  it("applies the same policy to HEAD documents", async () => {
    const response = await htmlCacheMiddleware(page("/plans", { method: "HEAD" }), async () =>
      html(),
    );
    assert.ok(response instanceof Response);
    assert.equal(response.headers.get("cdn-cache-control"), CDN_CACHE);
    assert.equal(response.headers.get("cache-control"), BROWSER_CACHE);
  });

  it("does not cache missing documents, private desks, offers, or cookie responses", async () => {
    const missing = await htmlCacheMiddleware(page("/missing"), async () => html(404));
    assert.ok(missing instanceof Response);
    for (const header of CACHE_HEADERS) {
      assert.equal(missing.headers.get(header), "private, no-store");
    }

    const offer = await htmlCacheMiddleware(page("/offers/abc"), async () => html());
    assert.ok(offer instanceof Response);
    assert.equal(offer.headers.get("cdn-cache-control"), null);

    const cookied = await htmlCacheMiddleware(page("/"), async () =>
      html(200, { "set-cookie": "session=1" }),
    );
    assert.ok(cookied instanceof Response);
    assert.equal(cookied.headers.get("cache-control"), null);
  });

  it("leaves hashed /assets/* immutable", () => {
    const vercel = JSON.parse(
      readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../vercel.json"), "utf8"),
    ) as { headers: { source: string; headers: { key: string; value: string }[] }[] };
    const assets = vercel.headers.find((rule) => rule.source === "/assets/(.*)");
    assert.equal(
      assets?.headers.find((header) => header.key === "Cache-Control")?.value,
      "public, max-age=31536000, immutable",
    );
  });
});
