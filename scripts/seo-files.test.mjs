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

test("Nitro has dedicated sitemap and robots routes plus early middleware", () => {
  const sitemap = readFileSync(join(ROOT, "server/routes/sitemap.xml.ts"), "utf8");
  const robots = readFileSync(join(ROOT, "server/routes/robots.txt.ts"), "utf8");
  const middleware = readFileSync(join(ROOT, "server/middleware/seo-files.ts"), "utf8");
  assert.match(sitemap, /renderSitemapXml/);
  assert.match(sitemap, /SITEMAP_CONTENT_TYPE/);
  assert.match(robots, /renderRobotsTxt/);
  assert.match(robots, /ROBOTS_CONTENT_TYPE/);
  assert.match(middleware, /\/sitemap\.xml/);
  assert.match(middleware, /\/robots\.txt/);
});
