import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { filterPlans } from "./plan-filter.ts";
import { getPlan, PLANS } from "./plans.ts";

const ID = "icable-ftth-1000-48m-48-sep29";

describe("i-Cable Sep 29 flash fibre", () => {
  it("is taken down after the 29 Sep booking window", () => {
    assert.equal(getPlan(ID), undefined);
    assert.equal(PLANS.some((plan) => plan.id === ID), false);
    assert.equal(filterPlans({ cat: "broadband" }).some((plan) => plan.id === ID), false);
  });
});
