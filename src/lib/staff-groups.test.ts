import assert from "node:assert/strict";
import test from "node:test";
import { applyPlanOverride, catalogPlans, hydratePlanOverrides } from "./plan-overrides.ts";
import { PLANS } from "./plans.ts";
import { groupOwnsProvider, isStaffGroupId, normalizeEmail, providersForGroup } from "./staff-groups.ts";

test("HKT group owns Netvigator and CSL only", () => {
  assert.deepEqual(providersForGroup("hkt"), ["netvigator", "csl"]);
  assert.equal(groupOwnsProvider("hkt", "netvigator"), true);
  assert.equal(groupOwnsProvider("hkt", "csl"), true);
  assert.equal(groupOwnsProvider("hkt", "hkbn"), false);
  assert.equal(isStaffGroupId("hkt"), true);
  assert.equal(isStaffGroupId("owner"), false);
});

test("override changes fee and flash without touching quote pick when null", () => {
  const base = PLANS.find((plan) => plan.providerId === "netvigator" && !plan.staffOffer);
  assert.ok(base);
  const next = applyPlanOverride(base, {
    planId: base.id,
    unpublished: false,
    monthlyFee: 77,
    freeMonths: 2,
    contractMonths: 24,
    rebate: null,
    perks: ["測試優惠"],
    hot: true,
    latestOffer: false,
    newIntakeOffer: false,
    flashOffer: true,
    offerEndsAt: "2026-12-31T23:59:59+08:00",
    quotePick: null,
    adImageUrl: "https://example.com/ad.jpg",
  });
  assert.equal(next.monthlyFee, 77);
  assert.equal(next.hot, true);
  assert.equal(next.flashOffer, true);
  assert.equal(next.quotePick, base.quotePick);
  assert.equal(next.adImageUrl, "https://example.com/ad.jpg");
});

test("hydrate hides unpublished plans from catalog consumers that check the flag", () => {
  const base = PLANS.find((plan) => !plan.staffOffer);
  assert.ok(base);
  hydratePlanOverrides([
    {
      planId: base.id,
      unpublished: true,
      monthlyFee: null,
      freeMonths: null,
      contractMonths: null,
      rebate: null,
      perks: null,
      hot: null,
      latestOffer: null,
      newIntakeOffer: null,
      flashOffer: null,
      offerEndsAt: null,
      quotePick: null,
      adImageUrl: null,
    },
  ]);
  const found = catalogPlans().find((plan) => plan.id === base.id);
  assert.equal(found?.unpublished, true);
  hydratePlanOverrides([]);
  assert.equal(normalizeEmail("  Chan@PCCW.com "), "chan@pccw.com");
});
