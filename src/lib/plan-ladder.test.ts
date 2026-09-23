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
  it("shows every company's cheapest plan before anyone's second plan", () => {
    for (const cat of ["broadband", "mobile", "home5g", "business"] as const) {
      const rows = filterPlans({ cat });
      assert.ok(rows.length > 1, cat);
      firstWaveCoversEveryProvider(rows, (plan) => plan.monthlyFee);
      const avg = filterPlans({ cat, sort: "avg" });
      firstWaveCoversEveryProvider(avg, (plan) => averageFee(plan));
    }
  });

  it("still lists a single company's plans from low fee to high", () => {
    const rows = filterPlans({ cat: "broadband", provider: "hgc" });
    assert.ok(rows.length > 1);
    for (let i = 1; i < rows.length; i += 1) {
      assert.ok(rows[i].monthlyFee >= rows[i - 1].monthlyFee);
    }
  });
});
