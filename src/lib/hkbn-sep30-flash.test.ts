import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { filterPlans } from "./plan-filter.ts";
import { averageFee, getPlan, isOfferExpired, remainingOfferMs } from "./plans.ts";

const IDS = [
  "hkbn-ftth-1000-24m-98-sep30",
  "hkbn-ftth-1000-36m-98-sep30",
  "hkbn-ftth-1000-36m-128-sep30",
  "hkbn-ftth-2500-24m-148-sep30",
  "hkbn-ftth-2500-36m-158-sep30",
  "hkbn-ftth-2500-36m-178-sep30",
] as const;

describe("HKBN Sep 30 flash fibre", () => {
  it("lists six public/HOS/private cards with a 30 Sep 2026 cutoff", () => {
    for (const id of IDS) {
      const plan = getPlan(id);
      assert.ok(plan, id);
      assert.equal(plan.providerId, "hkbn");
      assert.equal(plan.flashOffer, true);
      assert.equal(plan.quotePick, true);
      assert.equal(plan.offerEndsAt, "2026-09-30T23:59:59+08:00");
      assert.equal(plan.housing === "all" || plan.housing.includes("village"), false, id);
      assert.match(plan.install, /豁免安裝費/);
    }
    assert.deepEqual(getPlan("hkbn-ftth-2500-36m-158-sep30")!.housing, ["public", "hos"]);
    assert.deepEqual(getPlan("hkbn-ftth-2500-36m-178-sep30")!.housing, ["private"]);
  });

  it("matches the published average monthly fees", () => {
    assert.equal(averageFee(getPlan("hkbn-ftth-1000-24m-98-sep30")!), 89.8);
    assert.equal(averageFee(getPlan("hkbn-ftth-1000-36m-98-sep30")!), 89.8);
    assert.equal(averageFee(getPlan("hkbn-ftth-1000-36m-128-sep30")!), 117.3);
    assert.equal(averageFee(getPlan("hkbn-ftth-2500-24m-148-sep30")!), 129.5);
    assert.equal(averageFee(getPlan("hkbn-ftth-2500-36m-158-sep30")!), 144.8);
    assert.equal(averageFee(getPlan("hkbn-ftth-2500-36m-178-sep30")!), 163.2);
  });

  it("hides the cards from listings after the cutoff, but getPlan still resolves", () => {
    const plan = getPlan("hkbn-ftth-1000-24m-98-sep30")!;
    const before = Date.parse("2026-09-30T23:59:59+08:00") - 1000;
    const after = Date.parse("2026-09-30T23:59:59+08:00") + 1000;
    assert.equal(isOfferExpired(plan, before), false);
    assert.equal(isOfferExpired(plan, after), true);
    assert.ok(remainingOfferMs(plan, before) > 0);
    assert.equal(remainingOfferMs(plan, after), 0);
  });

  it("does not show village housing and still appears in broadband listings before expiry", () => {
    const rows = filterPlans({ cat: "broadband" });
    const ids = rows.map((plan) => plan.id);
    for (const id of IDS) {
      if (Date.now() > Date.parse("2026-09-30T23:59:59+08:00")) {
        assert.equal(ids.includes(id), false, id);
      } else {
        assert.equal(ids.includes(id), true, id);
      }
    }
    const village = filterPlans({ cat: "broadband", housing: "village" }).map((plan) => plan.id);
    for (const id of IDS) assert.equal(village.includes(id), false, id);
  });
});
