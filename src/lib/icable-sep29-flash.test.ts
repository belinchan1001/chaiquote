import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { filterPlans } from "./plan-filter.ts";
import { averageFee, flashBookByLabel, getPlan, isOfferExpired, remainingOfferMs } from "./plans.ts";

const ID = "icable-ftth-1000-48m-48-sep29";

describe("i-Cable Sep 29 flash fibre", () => {
  it("lists a $48 1000M 48-month card with its own 29 Sep cutoff", () => {
    const plan = getPlan(ID);
    assert.ok(plan);
    assert.equal(plan.providerId, "icable");
    assert.equal(plan.category, "broadband");
    assert.equal(plan.monthlyFee, 48);
    assert.equal(plan.contractMonths, 48);
    assert.equal(plan.freeMonths, 0);
    assert.equal(plan.speedMbps, 1000);
    assert.equal(plan.install, "豁免安裝費");
    assert.equal(averageFee(plan), 48);
    assert.equal(plan.flashOffer, true);
    assert.equal(plan.quotePick, true);
    assert.equal(plan.offerEndsAt, "2026-09-29T23:59:59+08:00");
    assert.deepEqual(plan.housing, ["public", "hos", "private"]);
    assert.equal(flashBookByLabel(plan.offerEndsAt, "zh"), "須於 9 月 29 日前成功預約安裝");
  });

  it("hides the card after 29 Sep and keeps it off village listings", () => {
    const before = Date.parse("2026-09-29T23:59:59+08:00") - 1000;
    const after = Date.parse("2026-09-29T23:59:59+08:00") + 1000;
    const plan = getPlan(ID)!;
    assert.equal(isOfferExpired(plan, before), false);
    assert.equal(isOfferExpired(plan, after), true);
    assert.ok(remainingOfferMs(plan, before) > 0);
    assert.equal(remainingOfferMs(plan, after), 0);
    const listed = filterPlans({ cat: "broadband" }).some((row) => row.id === ID);
    assert.equal(listed, Date.now() <= Date.parse("2026-09-29T23:59:59+08:00"));
    assert.equal(
      filterPlans({ cat: "broadband", housing: "village" }).some((row) => row.id === ID),
      false,
    );
  });
});
