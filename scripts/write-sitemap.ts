/**
 * Rewrite public/sitemap.xml from the live catalogue.
 * Run after scripts/restore-truncated-catalogues.mjs so 彩頤居 and other
 * restored estates are in the file the CDN serves.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderSitemapXml } from "../src/lib/seo.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const xml = renderSitemapXml();
writeFileSync(join(root, "public/sitemap.xml"), xml);
const count = xml.match(/<loc>/g)?.length ?? 0;
console.log(`[sitemap] wrote public/sitemap.xml (${count} urls)`);
