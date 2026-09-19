import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseFilterState, retrievePlansForAsk } from "./ai-desk.ts";

describe("AI filter parse", () => {
  it("turns a port-in sentence into exclude JSON, not include-the-current-carrier", () => {
    const parsed = parseFilterState({
      message: "我用緊香港寬頻，下個月到期，太古城屋企想搵 1000M 打機寬頻。",
    });
    assert.equal(parsed.cat, "broadband");
    assert.equal(parsed.current, "hkbn");
    assert.equal(parsed.exclude, "hkbn");
    assert.equal(parsed.expiry, "1m");
    assert.equal(parsed.estate, "太古城");
    assert.equal(parsed.speed, 1000);
    assert.equal(parsed.gaming, true);
    assert.equal(parsed.housing, "private");
    const found = retrievePlansForAsk({
      message: "我用緊香港寬頻，下個月到期，太古城屋企想搵 1000M 打機寬頻。",
    });
    assert.ok(found.plans.length > 0);
    assert.equal(
      found.plans.every((plan) => plan.provider !== "香港寬頻"),
      true,
    );
  });
});
