import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

test("vite config disables TanStack Start's built-in sitemap writer", () => {
  const viteConfig = readFileSync(join(ROOT, "vite.config.ts"), "utf8");
  assert.match(viteConfig, /tanstackStart\(\{[\s\S]*sitemap:\s*\{\s*enabled:\s*false/);
  assert.match(viteConfig, /serverDir:\s*"\.\/server"/);
});

test("vercel.json 301s only the production vercel.app host to www.chaiquote.hk", () => {
  const vercel = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));
  const redirects = vercel.redirects ?? [];
  assert.ok(redirects.length >= 1);
  for (const rule of redirects) {
    assert.equal(rule.statusCode, 301);
    assert.equal(rule.destination, "https://www.chaiquote.hk/$1");
    assert.equal(rule.has?.[0]?.type, "host");
    assert.match(rule.has?.[0]?.value ?? "", /^((www\.)?chaiquote\.vercel\.app)$/);
    assert.doesNotMatch(rule.has?.[0]?.value ?? "", /^\*\.vercel\.app$/);
  }
  assert.ok(redirects.some((rule) => rule.has?.[0]?.value === "chaiquote.vercel.app"));
});

test("root head emits a per-route canonical, not a hardcoded homepage", () => {
  const root = readFileSync(join(ROOT, "src/routes/__root.tsx"), "utf8");
  assert.match(root, /canonicalUrlFromMatches/);
  assert.match(root, /rel:\s*"canonical"/);
  assert.match(root, /property:\s*"og:url"/);
  assert.doesNotMatch(root, /href:\s*`\$\{SITE\.url\}\/`/);
});

test("root head ships a site-root ICO plus 48/96 PNG favicons for Google Search", () => {
  const root = readFileSync(join(ROOT, "src/routes/__root.tsx"), "utf8");
  const ico = root.indexOf('href: "/favicon.ico"');
  const svg = root.indexOf('href: "/favicon.svg"');
  const png32 = root.indexOf('href: "/favicon-32.png"');
  const png48 = root.indexOf('href: "/favicon-48.png"');
  const png96 = root.indexOf('href: "/favicon-96.png"');
  assert.ok(ico !== -1, "favicon.ico link");
  assert.ok(svg !== -1, "SVG favicon kept");
  assert.ok(png32 !== -1, "32px PNG favicon kept");
  assert.ok(png48 !== -1, "48px PNG favicon");
  assert.ok(png96 !== -1, "96px PNG favicon");
  assert.ok(ico < svg && svg < png32 && png32 < png48 && png48 < png96);
  assert.match(root, /href:\s*"\/icon-192\.png"/);
  assert.match(root, /href:\s*"\/icon-512\.png"/);
  assert.match(root, /href:\s*"\/apple-touch-icon\.png"/);
});

test("Nitro has dedicated sitemap and robots routes plus early middleware", () => {
  const sitemap = readFileSync(join(ROOT, "server/routes/sitemap.xml.ts"), "utf8");
  const robots = readFileSync(join(ROOT, "server/routes/robots.txt.ts"), "utf8");
  const middleware = readFileSync(join(ROOT, "server/middleware/seo-files.ts"), "utf8");
  const canonical = readFileSync(join(ROOT, "server/middleware/canonical-host.ts"), "utf8");
  assert.match(sitemap, /renderSitemapXml/);
  assert.match(sitemap, /SITEMAP_CONTENT_TYPE/);
  assert.match(robots, /renderRobotsTxt/);
  assert.match(robots, /ROBOTS_CONTENT_TYPE/);
  assert.match(middleware, /\/sitemap\.xml/);
  assert.match(middleware, /\/robots\.txt/);
  assert.match(canonical, /canonicalRedirectLocation/);
  assert.match(canonical, /status:\s*301/);
});
