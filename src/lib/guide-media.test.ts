import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GUIDES, getGuide } from "./guides.ts";
import {
  GUIDE_TOPIC_IMAGES,
  GUIDE_TOPIC_IMAGE_SLUGS,
  guideShareImagePath,
  guideTopicImage,
} from "./guide-media.ts";
import { guideJsonLd } from "./seo.ts";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const FORBIDDEN = [
  "保證裝到",
  "全港最平",
  "官方",
  "唔保證裝到",
  "最抵",
  "最低",
  "最平",
  "真實用戶",
  "客戶",
  "已安裝",
  "real customer",
  "installed this plan",
] as const;

const TOPIC_FILE: Record<(typeof GUIDE_TOPIC_IMAGE_SLUGS)[number], string> = {
  "port-in": "guide-port-in",
  fiber: "guide-fiber",
  village: "guide-village",
  "fiber-vs-5g": "guide-choose",
};

function src(rel: string) {
  return readFileSync(join(here, rel), "utf8");
}

function bytes(rel: string) {
  return statSync(join(root, rel)).size;
}

describe("guide topic images", () => {
  it("wires port-in, fiber, village, and fiber-vs-5g choose", () => {
    assert.deepEqual([...GUIDE_TOPIC_IMAGE_SLUGS].sort(), ["fiber", "fiber-vs-5g", "port-in", "village"]);
    assert.deepEqual(Object.keys(GUIDE_TOPIC_IMAGES).sort(), ["fiber", "fiber-vs-5g", "port-in", "village"]);
    for (const slug of GUIDE_TOPIC_IMAGE_SLUGS) {
      const image = guideTopicImage(slug);
      assert.ok(image, slug);
      assert.equal(image.src, `/images/${TOPIC_FILE[slug]}.jpg`);
      assert.equal(image.webp, `/images/${TOPIC_FILE[slug]}.webp`);
      assert.equal(image.width, 1280);
      assert.equal(image.height, 720);
      assert.equal(guideShareImagePath(slug), image.src);
      assert.ok(getGuide(slug), slug);
    }
    for (const guide of GUIDES) {
      if (GUIDE_TOPIC_IMAGE_SLUGS.includes(guide.slug as (typeof GUIDE_TOPIC_IMAGE_SLUGS)[number])) {
        continue;
      }
      assert.equal(guideTopicImage(guide.slug), undefined, guide.slug);
      assert.equal(guideShareImagePath(guide.slug), undefined, guide.slug);
    }
  });

  it("ships compressed jpg + webp under public/images", () => {
    const assets = [
      ["public/images/guide-port-in.jpg", 90_000],
      ["public/images/guide-port-in.webp", 70_000],
      ["public/images/guide-fiber.jpg", 110_000],
      ["public/images/guide-fiber.webp", 70_000],
      ["public/images/guide-village.jpg", 140_000],
      ["public/images/guide-village.webp", 100_000],
      ["public/images/guide-choose.jpg", 100_000],
      ["public/images/guide-choose.webp", 70_000],
    ] as const;
    for (const [path, max] of assets) {
      assert.equal(existsSync(join(root, path)), true, path);
      assert.ok(bytes(path) < max, `${path} is ${bytes(path)} bytes, want < ${max}`);
    }
  });

  it("keeps alt copy free of claim words", () => {
    for (const image of Object.values(GUIDE_TOPIC_IMAGES)) {
      const text = `${image.alt}\n${image.altEn}`;
      for (const phrase of FORBIDDEN) {
        assert.equal(text.includes(phrase), false, `${image.slug} alt has ${phrase}`);
      }
    }
  });

  it("uses the topic asset as JSON-LD image only for those four slugs", () => {
    for (const slug of GUIDE_TOPIC_IMAGE_SLUGS) {
      const guide = getGuide(slug);
      assert.ok(guide, slug);
      const article = guideJsonLd(guide)["@graph"].find((node) => node["@type"] === "Article");
      assert.ok(article, slug);
      assert.equal(article.image, `https://www.chaiquote.hk${GUIDE_TOPIC_IMAGES[slug].src}`);
    }
    const other = getGuide("village-onsite");
    assert.ok(other);
    const article = guideJsonLd(other)["@graph"].find((node) => node["@type"] === "Article");
    assert.equal(article?.image, "https://www.chaiquote.hk/og.jpg");
    const hub = getGuide("home5g");
    assert.ok(hub);
    const hubArticle = guideJsonLd(hub)["@graph"].find((node) => node["@type"] === "Article");
    assert.equal(hubArticle?.image, "https://www.chaiquote.hk/og.jpg");
  });

  it("renders a topic picture and per-page og:image only on the four guide routes", () => {
    const page = src("../routes/guides_.$slug.tsx");
    assert.match(page, /guideTopicImage\(guide\.slug\)/);
    assert.match(page, /property:\s*"og:image"/);
    assert.match(page, /name:\s*"twitter:image"/);
    assert.match(page, /<picture>/);
    assert.match(page, /type="image\/webp"/);
    assert.match(page, /loading="lazy"/);
    assert.doesNotMatch(page, /guide-home5g|guide-mobile|guide-business/);
  });

  it("leaves homepage category photos and plan cards unchanged", () => {
    const home = src("../routes/index.tsx");
    const card = src("../components/plan-card.tsx");
    assert.match(home, /src: "\/images\/cat-broadband\.jpg"/);
    assert.match(home, /webp: "\/images\/cat-broadband\.webp"/);
    assert.match(home, /src: "\/images\/cat-home5g\.jpg"/);
    assert.match(home, /src: "\/images\/cat-mobile\.jpg"/);
    assert.match(home, /src: "\/images\/cat-business\.jpg"/);
    assert.match(home, /src="\/images\/hero-home\.jpg"/);
    assert.doesNotMatch(home, /guide-port-in|guide-fiber|guide-village|guide-choose/);
    assert.doesNotMatch(card, /<img|guide-port-in|guide-fiber|guide-village|guide-choose/);
  });
});
