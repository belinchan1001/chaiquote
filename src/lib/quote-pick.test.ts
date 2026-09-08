import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PLANS, getPlan } from "./plans.ts";

const FORBIDDEN = ["最優惠", "最平", "保證", "guarantee", "cheapest"];
const here = dirname(fileURLToPath(import.meta.url));

describe("齊Quote pick badge", () => {
  it("uses exact 齊Quote pick copy and never cheapest/guarantee wording", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    assert.match(messages, /quotePick: "齊Quote 推介"/);
    assert.match(messages, /quotePick: "齊Quote pick"/);
    assert.match(messages, /齊Quote 推介/);
    assert.match(messages, /齊Quote pick/);
    assert.doesNotMatch(messages, /齊[Qq]oute/);
    assert.doesNotMatch(messages, /quotePick: "[^"]*[Qq]oute/);

    for (const phrase of FORBIDDEN) {
      assert.equal(messages.includes(`quotePick: "${phrase}`), false, `forbidden: ${phrase}`);
    }
  });

  it("flags hkbn-5g-30-78-youth and icable-ftth-1000-48m-58 without changing youth $78 terms", () => {
    const youth = getPlan("hkbn-5g-30-78-youth");
    assert.ok(youth);
    assert.equal(youth.quotePick, true);
    assert.equal(youth.monthlyFee, 78);
    assert.equal(youth.contractMonths, 24);
    assert.equal(youth.freeMonths, 0);
    assert.equal(youth.dataGb, 30);
    const icable = getPlan("icable-ftth-1000-48m-58");
    assert.ok(icable);
    assert.equal(icable.quotePick, true);
    assert.equal(icable.monthlyFee, 58);
    assert.deepEqual(
      PLANS.filter((plan) => plan.quotePick).map((plan) => plan.id),
      ["icable-ftth-1000-48m-58", "hkbn-5g-30-78-youth"],
    );
  });

  it("keeps the shine on card chrome and disables it for reduced motion", () => {
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");

    assert.match(card, /<article[\s\S]*plan\.quotePick && "plan-card-shine"/);
    assert.doesNotMatch(card, /formatFee\(plan\.monthlyFee\)[\s\S]{0,200}plan-card-shine/);
    assert.match(css, /@property --quote-pick-angle/);
    assert.match(css, /\.plan-card-shine\s*\{/);
    assert.match(css, /conic-gradient\(/);
    assert.match(css, /background-clip:\s*padding-box,\s*border-box/);
    assert.match(css, /background-origin:\s*padding-box,\s*border-box/);
    assert.match(css, /@keyframes quote-pick-shine/);
    assert.match(css, /--quote-pick-angle:\s*360deg/);
    assert.doesNotMatch(css, /\.plan-card-shine::before/);
    assert.doesNotMatch(css, /background-size:\s*240%/);
    assert.doesNotMatch(css, /background-position:\s*130%/);
    assert.doesNotMatch(
      css,
      /@keyframes quote-pick-shine\s*\{[^}]*(opacity|transform|filter|background-position)/,
    );
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-card-shine[\s\S]*animation:\s*none/,
    );
  });
});
