import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { MESSAGES } from "./messages.ts";
import { PLANS, getPlan } from "./plans.ts";

const FORBIDDEN = ["最優惠", "最平", "保證", "guarantee", "cheapest"];

describe("齊Quote pick badge", () => {
  it("uses exact 齊Quote pick copy and never cheapest/guarantee wording", () => {
    assert.equal(MESSAGES.zh.quotePick, "齊Quote 推介");
    assert.equal(MESSAGES.en.quotePick, "齊Quote pick");
    assert.match(MESSAGES.zh.quotePick, /Quote/);
    assert.match(MESSAGES.en.quotePick, /Quote/);
    assert.doesNotMatch(MESSAGES.zh.quotePick, /[Qq]oute/);
    assert.doesNotMatch(MESSAGES.en.quotePick, /[Qq]oute/);

    const copy = `${MESSAGES.zh.quotePick}\n${MESSAGES.en.quotePick}`;
    for (const phrase of FORBIDDEN) {
      assert.equal(copy.toLowerCase().includes(phrase.toLowerCase()), false, `forbidden: ${phrase}`);
    }
  });

  it("flags only hkbn-5g-30-78-youth and leaves its $78 terms unchanged", () => {
    const youth = getPlan("hkbn-5g-30-78-youth");
    assert.ok(youth);
    assert.equal(youth.quotePick, true);
    assert.equal(youth.monthlyFee, 78);
    assert.equal(youth.contractMonths, 24);
    assert.equal(youth.freeMonths, 0);
    assert.equal(youth.dataGb, 30);
    assert.deepEqual(
      PLANS.filter((plan) => plan.quotePick).map((plan) => plan.id),
      ["hkbn-5g-30-78-youth"],
    );
  });

  it("keeps the shine on card chrome and disables it for reduced motion", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");

    assert.match(card, /plan\.quotePick && "plan-card-shine"/);
    assert.doesNotMatch(card, /formatFee[\s\S]*plan-card-shine/);
    assert.match(css, /\.plan-card-shine::before/);
    assert.match(css, /@keyframes quote-pick-shine/);
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-card-shine::before[\s\S]*animation:\s*none/,
    );
  });
});
