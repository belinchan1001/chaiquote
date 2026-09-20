import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PLAN_COUNT } from "./plan-count.ts";
import { PLANS } from "./plans.ts";

describe("plan-count", () => {
  it("stays in lockstep with the live catalogue", () => {
    assert.equal(PLAN_COUNT, PLANS.length);
  });
});
