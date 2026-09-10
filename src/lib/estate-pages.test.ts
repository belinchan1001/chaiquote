import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ESTATES, matchKnownEstate, searchEstates } from "./estates.ts";
import { filterPlans, getPlan } from "./plans.ts";
import {
  ESTATE_PAGES,
  estatePlans,
  estateSelectTarget,
  estateSeoTitle,
  getEstatePage,
  SKIPPED_ESTATE_REQUESTS,
} from "./estate-pages.ts";
import {
  HKBN_INTAKE_OFFER_ESTATES,
  NEW_INTAKE,
  NEW_INTAKE_NAMES,
  estateUnlocksPlan,
  isNewIntakeEstate,
  newIntakeGroups,
} from "./estate-new-intake.ts";
import { SITEMAP_PAGES } from "./seo.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("estate SEO pages", () => {
  it("publishes every catalogue estate with a unique HTML slug", () => {
    assert.equal(ESTATE_PAGES.length, ESTATES.length);
    const slugs = new Set<string>();
    const names = new Set<string>();
    for (const page of ESTATE_PAGES) {
      assert.equal(slugs.has(page.slug), false, page.slug);
      slugs.add(page.slug);
      names.add(page.estate.name);
      assert.ok(page.slug.length > 2, page.estate.name);
      assert.match(page.slug, /^[a-z0-9-]+$/);
    }
    assert.equal(names.size, ESTATES.length);
    assert.equal(getEstatePage("tin-yiu")?.estate.name, "天耀邨");
    assert.equal(getEstatePage("wah-fu")?.estate.name, "華富邨");
    assert.equal(SKIPPED_ESTATE_REQUESTS.some((item) => item.query === "將軍澳廣場"), true);
    assert.equal(SKIPPED_ESTATE_REQUESTS.some((item) => item.query === "荔景"), true);
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
    assert.match(estateSeoTitle(tinYiu.estate), /天耀邨寬頻比較｜公屋｜齊Quote/);
  });

  it("adds the directory and each estate page to the sitemap", () => {
    assert.ok(SITEMAP_PAGES.some((page) => page.path === "/estates"));
    const estateUrls = SITEMAP_PAGES.filter((page) => page.path.startsWith("/estates/"));
    assert.equal(estateUrls.length, ESTATE_PAGES.length);
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

  it("keeps homepage estate entry as a text line, not a quote-product block", () => {
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    const panel = readFileSync(join(here, "../components/search-panel.tsx"), "utf8");
    const dir = readFileSync(join(here, "../routes/estates.tsx"), "utf8");
    assert.doesNotMatch(home, /HOME_ESTATE_SLUGS/);
    assert.doesNotMatch(home, /estatesDirTitle/);
    assert.match(panel, /熱門：/);
    assert.match(panel, /tin-yiu/);
    assert.match(panel, /全部屋苑/);
    assert.match(dir, /estate-dir-q/);
    assert.match(dir, /香港屋苑寬頻比較/);
    assert.match(dir, /href=\{\`\/estates\/\$\{page\.slug\}\`\}/);
    assert.match(dir, /ESTATES\.length/);
    assert.match(dir, /rounded-xl bg-card/);
    assert.match(dir, /estatesIndexCount/);
    assert.match(dir, /estate-dir-district/);
    const wahFu = getEstatePage("wah-fu");
    assert.ok(wahFu);
    assert.deepEqual(estateSelectTarget(wahFu.estate), { kind: "page", slug: "wah-fu" });
    const tin = getEstatePage("tin-yiu");
    assert.ok(tin);
    assert.deepEqual(estateSelectTarget(tin.estate), { kind: "page", slug: "tin-yiu" });
  });

  it("lists 香港最新入伙屋苑 in the same catalogue as address search", () => {
    assert.match(readFileSync(join(here, "../routes/estates.tsx"), "utf8"), /香港最新入伙屋苑|estatesNewIntake/);
    assert.equal(NEW_INTAKE_NAMES.size, NEW_INTAKE.length);
    assert.equal(newIntakeGroups(ESTATE_PAGES).reduce((n, group) => n + group.pages.length, 0), NEW_INTAKE.length);
    for (const item of NEW_INTAKE) {
      const row = ESTATES.find((estate) => estate.name === item.name);
      assert.ok(row, item.name);
      assert.equal(searchEstates(item.name, 8)[0]?.name, item.name, item.name);
      assert.equal(matchKnownEstate(item.name)?.name, item.name, item.name);
    }
    assert.equal(matchKnownEstate("朗天峰")?.name, "朗天峰");
    assert.equal(matchKnownEstate("朗天苑")?.name, "朗天苑");
    assert.equal(searchEstates("柴灣常安街簡約公屋")[0]?.name, "柴灣常安街簡約公屋");
    assert.equal(searchEstates("日出康城第12期")[0]?.name, "日出康城第12期");
    assert.equal(ESTATES.find((item) => item.name === "東頭村")?.district, "元朗");
    assert.equal(ESTATES.find((item) => item.name === "東頭村")?.housing, "village");
    assert.equal(ESTATES.find((item) => item.name === "東頭邨")?.district, "黃大仙");
    assert.equal(ESTATES.find((item) => item.name === "東頭邨")?.housing, "public");
    assert.equal(searchEstates("東頭村")[0]?.district, "元朗");
    assert.equal(searchEstates("東頭邨")[0]?.district, "黃大仙");
  });

  it("hides HKBN new-move-in fibre until a listed estate is searched", () => {
    const ids = [
      "hkbn-ftth-1000-36m-99-intake",
      "hkbn-ftth-2500-24m-149-intake",
      "hkbn-ftth-2500-36m-149-intake",
      "hkbn-ftth-2x1000-36m-75-intake",
      "hgc-ftth-2000-hos-36m",
    ] as const;
    for (const id of ids) {
      const plan = getPlan(id);
      assert.ok(plan, id);
      assert.equal(plan.newIntakeOffer, true, id);
      assert.equal(plan.quotePick, true, id);
      assert.equal(plan.install, "豁免安裝費", id);
      assert.ok(plan.onlyEstates?.includes("盛緻苑"), id);
    }
    const hidden = filterPlans({ cat: "broadband" }).map((plan) => plan.id);
    for (const id of ids) assert.equal(hidden.includes(id), false, id);
    const intake = filterPlans({ cat: "broadband", intake: true }).map((plan) => plan.id);
    for (const id of ids) assert.equal(intake.includes(id), true, id);
    assert.equal(intake.includes("hkbn-ftth-1000-24m-199-mobile"), false);
    const tinYiuIntake = filterPlans({ cat: "broadband", housing: "public", estate: "天耀邨", intake: true }).map(
      (plan) => plan.id,
    );
    for (const id of ids) assert.equal(tinYiuIntake.includes(id), false, id);
    const tinYiu = filterPlans({ cat: "broadband", housing: "public", estate: "天耀邨" }).map((plan) => plan.id);
    for (const id of ids) assert.equal(tinYiu.includes(id), false, id);
    const unlocked = filterPlans({ cat: "broadband", housing: "hos", estate: "盛緻苑" }).map((plan) => plan.id);
    for (const id of ids) assert.equal(unlocked.includes(id), true, id);
    assert.equal(estateUnlocksPlan("盛緻苑", HKBN_INTAKE_OFFER_ESTATES), true);
    assert.equal(estateUnlocksPlan("宋皇臺站簡約公屋", HKBN_INTAKE_OFFER_ESTATES), true);
    assert.equal(estateUnlocksPlan("天耀邨", HKBN_INTAKE_OFFER_ESTATES), false);
    assert.equal(estateUnlocksPlan(undefined, HKBN_INTAKE_OFFER_ESTATES), false);
    assert.equal(isNewIntakeEstate("朗天苑"), true);
    assert.equal(isNewIntakeEstate("朗杏閣"), true);
    assert.equal(isNewIntakeEstate("朗松閣"), true);
    assert.equal(isNewIntakeEstate("朗桃閣"), true);
    assert.equal(isNewIntakeEstate("天耀邨"), false);
    assert.equal(estateUnlocksPlan("朗天苑", HKBN_INTAKE_OFFER_ESTATES), true);
    assert.equal(estateUnlocksPlan("朗杏閣", HKBN_INTAKE_OFFER_ESTATES), true);
    assert.equal(estateUnlocksPlan("朗天苑朗杏閣", HKBN_INTAKE_OFFER_ESTATES), true);
    const longHeng = filterPlans({ cat: "broadband", housing: "hos", estate: "朗杏閣" }).map((plan) => plan.id);
    for (const id of ids) assert.equal(longHeng.includes(id), true, id);
    const lph = filterPlans({ cat: "broadband", housing: "public", estate: "簡約公屋恆光街項目" }).map((plan) => plan.id);
    assert.equal(lph.includes("hgc-ftth-2000-hos-36m"), true);
    const gsh = filterPlans({ cat: "broadband", housing: "hos", estate: "綠置居" }).map((plan) => plan.id);
    assert.equal(gsh.includes("hgc-ftth-2000-hos-36m"), true);
    const shing = estatePlans(ESTATES.find((item) => item.name === "盛緻苑")!);
    assert.ok(ids.every((id) => shing.broadband.some((plan) => plan.id === id)));
    const tin = estatePlans(ESTATES.find((item) => item.name === "天耀邨")!);
    assert.ok(ids.every((id) => !tin.broadband.some((plan) => plan.id === id)));
  });
});
