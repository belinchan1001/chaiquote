/**
 * Compress raster images for the static host.
 * Vercel does not run Cloudflare Polish or Bunny Optimizer, so new
 * PNG/JPEG logos are converted here on every build. Originals stay as fallback.
 *
 * Logos (public/images/providers, public/logos): WebP q80, max edge 96px.
 * Photos: extra 400w WebP for phones. The existing WebP remains the 800w+ file.
 */
import { existsSync } from "node:fs";
import { readdir, stat, mkdir } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const QUALITY = 80;
const LOGO_DIRS = ["public/images/providers", "public/logos"];
const PHOTO_DIR = "public/images";
const RASTER = new Set([".png", ".jpg", ".jpeg"]);

async function filesIn(rel) {
  const dir = join(ROOT, rel);
  if (!existsSync(dir)) return [];
  const names = await readdir(dir);
  return names
    .filter((name) => RASTER.has(extname(name).toLowerCase()))
    .map((name) => join(dir, name));
}

async function writeWebp(input, output, { width }) {
  await mkdir(dirname(output), { recursive: true });
  const image = sharp(input, { failOn: "none" }).rotate();
  if (width) image.resize({ width, withoutEnlargement: true });
  await image.webp({ quality: QUALITY, effort: 4 }).toFile(output);
}

async function logos() {
  let count = 0;
  for (const rel of LOGO_DIRS) {
    for (const file of await filesIn(rel)) {
      const out = file.replace(/\.(png|jpe?g)$/i, ".webp");
      await writeWebp(file, out, { width: 96 });
      count += 1;
    }
  }
  return count;
}

async function photoWidths() {
  let count = 0;
  for (const file of await filesIn(PHOTO_DIR)) {
    const name = basename(file);
    if (name.startsWith("hero-home")) continue;
    const out = join(dirname(file), name.replace(/\.(png|jpe?g)$/i, "-400.webp"));
    const source = await stat(file);
    if (existsSync(out)) {
      const prev = await stat(out);
      if (prev.mtimeMs >= source.mtimeMs) continue;
    }
    await writeWebp(file, out, { width: 400 });
    count += 1;
  }
  return count;
}

const logoCount = await logos();
const photoCount = await photoWidths();
console.log(`webp q${QUALITY}: ${logoCount} logos, ${photoCount} new 400w photos`);
