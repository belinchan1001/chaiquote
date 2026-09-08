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
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");

    assert.match(card, /<article[\s\S]*plan\.quotePick && "plan-card-shine"/);
    assert.doesNotMatch(card, /formatFee\(plan\.monthlyFee\)[\s\S]{0,200}plan-card-shine/);
    assert.match(css, /\.plan-card-shine::before/);
    assert.match(css, /@keyframes quote-pick-shine/);
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-card-shine::before[\s\S]*animation:\s*none/,
    );
  });
});
