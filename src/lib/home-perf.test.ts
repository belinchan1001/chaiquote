import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

function src(rel: string) {
  return readFileSync(join(here, rel), "utf8");
}

function bytes(rel: string) {
  return statSync(join(root, rel)).size;
}

describe("homepage first-load images", () => {
  it("keeps hero + category files small and serves WebP with a JPEG fallback", () => {
    const home = src("../routes/index.tsx");

    assert.match(home, /srcSet="\/images\/hero-home\.webp"/);
    assert.match(home, /src="\/images\/hero-home\.jpg"/);
    assert.match(home, /fetchPriority="high"/);
    assert.doesNotMatch(home.slice(home.indexOf("hero-home.jpg"), home.indexOf("hero-home.jpg") + 400), /loading="lazy"/);

    assert.match(home, /srcSet=\{item\.webp\}/);
    assert.match(home, /loading="lazy"/);
    assert.match(home, /webp: "\/images\/cat-broadband\.webp"/);
    assert.match(src("../components/provider-mark.tsx"), /loading="lazy"/);

    const assets = [
      ["public/images/hero-home.jpg", 90_000],
      ["public/images/hero-home.webp", 70_000],
      ["public/images/cat-broadband.jpg", 50_000],
      ["public/images/cat-broadband.webp", 40_000],
      ["public/images/cat-home5g.jpg", 45_000],
      ["public/images/cat-home5g.webp", 35_000],
      ["public/images/cat-mobile.jpg", 45_000],
      ["public/images/cat-mobile.webp", 35_000],
      ["public/images/cat-business.jpg", 45_000],
      ["public/images/cat-business.webp", 35_000],
    ] as const;

    for (const [path, max] of assets) {
      assert.equal(existsSync(join(root, path)), true, path);
      assert.ok(bytes(path) < max, `${path} is ${bytes(path)} bytes, want < ${max}`);
    }
  });
});
