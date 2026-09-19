import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { compactSearch, parsePlansSearch } from "./search.ts";
import { ESPORTS_LINE_SEARCH } from "./site.ts";
import {
  ESPORTS_LINE_MIN_SPEED,
  filterPlans,
  getPlan,
  isEsportsLine,
} from "./plans.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("電競神線 chip", () => {
  it("keeps the shortcut label 電競神線", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    assert.match(messages, /shortcutGaming:\s*"電競神線"/);
    assert.match(messages, /shortcutGaming:\s*"Esports fibre"/);
  });

  it("filters fibre plans at 2500M or faster", () => {
    assert.equal(ESPORTS_LINE_SEARCH.esports, true);
    assert.equal(ESPORTS_LINE_SEARCH.minSpeed, 2500);
    const rows = filterPlans(ESPORTS_LINE_SEARCH);
    assert.ok(rows.length >= 10);
    for (const plan of rows) {
      assert.equal(plan.category, "broadband");
      assert.ok((plan.speedMbps ?? 0) >= ESPORTS_LINE_MIN_SPEED, plan.id);
      assert.equal(isEsportsLine(plan), true);
    }
    assert.equal(isEsportsLine(getPlan("hkbn-ftth-2500-24m-149")!), true);
    assert.equal(isEsportsLine(getPlan("hkbn-ftth-1000-36m-98")!), false);
  });

  it("only the 電競神線 shortcut sets the esports glow flag", () => {
    const parsed = parsePlansSearch({ cat: "broadband", minSpeed: "2500", sort: "speed", esports: "1" });
    assert.equal(parsed.esports, true);
    assert.equal(compactSearch(parsed).esports, true);
    assert.equal(compactSearch({ cat: "broadband", minSpeed: 2500, sort: "speed" }).esports, undefined);
    const fromChip = parsePlansSearch({ ...ESPORTS_LINE_SEARCH });
    assert.equal(fromChip.esports, true);
  });

  it("matches the black rounded pill and plan-card bottom red glow", () => {
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    const chip = readFileSync(join(here, "../components/esports-line-tag.tsx"), "utf8");
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const plans = readFileSync(join(here, "../routes/plans.tsx"), "utf8");
    assert.match(chip, /signal-bars/);
    assert.match(chip, /rounded-full/);
    assert.match(chip, /EsportsLineToggle/);
    assert.doesNotMatch(chip, /Zap|esports-line-chip__plate|bloom|kicker/);
    assert.match(css, /animation:\s*esports-glow-pulse/);
    assert.match(css, /\.plan-card-esports\s*\{/);
    assert.match(css, /@keyframes esports-card-glow/);
    assert.match(css, /animation:\s*esports-card-glow 3s ease-in-out infinite/);
    assert.match(css, /\.plan-card-shine\.plan-card-esports/);
    assert.doesNotMatch(css, /@keyframes esports-rgb-wave/);
    assert.doesNotMatch(css, /conic-gradient\(#ff003c/);
    assert.doesNotMatch(css, /\.plan-list-esports \.plan-list-item::before/);
    assert.match(card, /esportsGlow[\s\S]*plan-card-esports/);
    assert.match(plans, /plan-list-esports/);
    assert.doesNotMatch(css, /clip-path:\s*polygon\(/);
  });
});
