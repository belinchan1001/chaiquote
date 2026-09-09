import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ESTATES } from "./estates.ts";
import {
  ESTATE_PAGE_NAMES,
  ESTATE_PAGES,
  estateHousingLabel,
  estatePlans,
  estateSelectTarget,
  estateSeoTitle,
  getEstatePage,
  HOT_ESTATE_NAMES,
  SKIPPED_ESTATE_REQUESTS,
} from "./estate-pages.ts";
import { SITEMAP_PAGES } from "./seo.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("estate SEO pages", () => {
  it("only publishes estates that exist in the catalogue, with unique slugs", () => {
    assert.equal(ESTATE_PAGE_NAMES.length, 30);
    const slugs = new Set<string>();
    for (const name of ESTATE_PAGE_NAMES) {
      assert.ok(ESTATES.some((estate) => estate.name === name), name);
    }
    for (const page of ESTATE_PAGES) {
      assert.equal(slugs.has(page.slug), false, page.slug);
      slugs.add(page.slug);
      assert.ok(page.slug.length > 2);
      assert.match(page.slug, /^[a-z0-9-]+$/);
    }
    assert.equal(SKIPPED_ESTATE_REQUESTS.some((item) => item.query === "將軍澳廣場"), true);
    assert.equal(SKIPPED_ESTATE_REQUESTS.some((item) => item.query === "荔景"), true);
  });

  it("sends published estates to their SEO page and others to /plans with housing", () => {
    const published = getEstatePage("tin-yiu");
    assert.ok(published);
    assert.deepEqual(estateSelectTarget(published.estate), { kind: "page", slug: "tin-yiu" });
    const wahFu = ESTATES.find((item) => item.name === "華富邨");
    assert.ok(wahFu);
    const target = estateSelectTarget(wahFu);
    assert.equal(target.kind, "plans");
    if (target.kind === "plans") {
      assert.equal(target.housing, "public");
      assert.equal(target.estate, "華富邨");
    }
    for (const name of HOT_ESTATE_NAMES) {
      assert.ok(ESTATES.some((item) => item.name === name), name);
    }
  });

  it("keeps public estate pages free of private-only fibre plans", () => {
    const tinYiu = getEstatePage("tin-yiu");
    assert.ok(tinYiu);
    assert.equal(tinYiu.estate.housing, "public");
    const { broadband } = estatePlans(tinYiu.estate);
    assert.ok(broadband.length > 0);
    assert.ok(
      broadband.every((plan) => plan.housing === "all" || plan.housing.includes("public")),
    );
    assert.ok(broadband.every((plan) => plan.housing === "all" || !plan.housing.every((h) => h === "private")));
    assert.match(estateSeoTitle(tinYiu.estate), /天耀邨寬頻比較 2026｜公屋｜齊Quote/);
  });

  it("adds the directory and each estate page to the sitemap", () => {
    assert.ok(SITEMAP_PAGES.some((page) => page.path === "/estates"));
    for (const page of ESTATE_PAGES) {
      assert.ok(
        SITEMAP_PAGES.some((item) => item.path === `/estates/${page.slug}`),
        page.slug,
      );
    }
    assert.doesNotMatch(
      SITEMAP_PAGES.map((page) => page.path).join("\n"),
      /\/estates\/.*\?/,
    );
  });

  it("does not change search, plan prices, or locked animation files", () => {
    const search = readFileSync(join(here, "search.ts"), "utf8");
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    const widget = readFileSync(join(here, "../components/whatsapp-widget.tsx"), "utf8");
    assert.match(search, /parsePlansSearch/);
    assert.match(card, /to="\/plans\/\$planId"/);
    assert.match(css, /plan-list-enter/);
    assert.match(widget, /wa-pulse/);
  });

  it("keeps the homepage search-first without featured plan cards or the full filter panel", () => {
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    assert.match(home, /EstateNameSearch/);
    assert.match(home, /HOT_ESTATE_NAMES/);
    assert.doesNotMatch(home, /SearchPanel/);
    assert.doesNotMatch(home, /FEATURED_IDS/);
    assert.doesNotMatch(home, /PlanCard/);
    const search = readFileSync(join(here, "../components/estate-name-search.tsx"), "utf8");
    assert.match(search, /searchEstates\(q, 8\)/);
    assert.match(search, /ESTATE_SEARCH_DELAY_MS = 180/);
    assert.match(search, /ArrowDown/);
    assert.match(search, /Escape/);
  });
});
