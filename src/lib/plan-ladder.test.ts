import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { filterPlans } from "./plan-filter.ts";
import { averageFee, type Plan } from "./plans.ts";

function firstWaveCoversEveryProvider(rows: Plan[], key: (plan: Plan) => number) {
  const seen = new Set<string>();
  let wave = 0;
  for (const plan of rows) {
    if (seen.has(plan.providerId)) break;
    seen.add(plan.providerId);
    wave += 1;
  }
  const providers = new Set(rows.map((plan) => plan.providerId));
  assert.equal(wave, providers.size);
  for (const id of providers) {
    const own = rows.filter((plan) => plan.providerId === id);
    for (let i = 1; i < own.length; i += 1) {
      assert.ok(key(own[i]) >= key(own[i - 1]), `${id} steps up`);
    }
  }
}

describe("monthly fee ladder", () => {
  it("pins the HKBN $98 1000M 36-month flash card, then keeps the ladder", () => {
    const rows = filterPlans({ cat: "broadband" });
    assert.equal(rows[0]?.id, "hkbn-ftth-1000-36m-98-sep30");
    const rest = rows.slice(1);
    assert.equal(rest.some((plan) => plan.id === rows[0].id), false);
    firstWaveCoversEveryProvider(rest, (plan) => averageFee(plan));
  });

  it("shows every company's cheapest plan before anyone's second plan", () => {
    for (const cat of ["broadband", "mobile", "home5g", "business"] as const) {
      const rows = filterPlans({ cat }).filter((plan) => plan.id !== "hkbn-ftth-1000-36m-98-sep30");
      assert.ok(rows.length > 1, cat);
      firstWaveCoversEveryProvider(rows, (plan) => averageFee(plan));
      const avg = filterPlans({ cat, sort: "avg" }).filter((plan) => plan.id !== "hkbn-ftth-1000-36m-98-sep30");
      firstWaveCoversEveryProvider(avg, (plan) => averageFee(plan));
    }
  });

  it("ranks a company by average fee, so waived months beat the same sticker price", () => {
    const rows = filterPlans({ cat: "broadband", provider: "hkbn" });
    const ids = rows.map((plan) => plan.id);
    const waived = ids.indexOf("hkbn-ftth-1000-36m-98-sep30");
    const sticker = ids.indexOf("hkbn-ftth-1000-36m-98");
    const waived128 = ids.indexOf("hkbn-ftth-1000-36m-128-sep30");
    assert.ok(waived >= 0 && sticker > waived);
    assert.ok(waived128 > sticker);
    for (let i = 1; i < rows.length; i += 1) {
      const prev = averageFee(rows[i - 1]);
      const next = averageFee(rows[i]);
      assert.ok(next > prev || (next === prev && rows[i].monthlyFee >= rows[i - 1].monthlyFee));
    }
  });
});
