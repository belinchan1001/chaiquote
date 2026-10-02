import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getPlan } from "./plans.ts";
import { relatedComparePlans } from "./related-plans.ts";

describe("related compare plans", () => {
  it("keeps village suggestions on village fibre or 5G home", () => {
    const rows = relatedComparePlans(getPlan("hkbn-village-200-27m")!, "village");
    assert.equal(rows.length, 2);
    assert.ok(
      rows.every(
        (item) =>
          item.category === "home5g" ||
          (item.housing !== "all" && item.housing.every((kind) => kind === "village")),
      ),
    );
    assert.equal(rows.some((item) => item.id === "icable-ftth-1000-private-36m"), false);
    assert.equal(rows.some((item) => item.id === "icable-ftth-1000-public-48m"), false);
  });

  it("keeps public suggestions on public plans, and flash offers only inside the estate", () => {
    const hidden = relatedComparePlans(getPlan("icable-ftth-1000-public-48m")!, "public", "YOHO Town 二座");
    assert.equal(hidden.some((item) => item.onlyEstates?.length), false);
    assert.equal(hidden.some((item) => item.id === "hkbn-ftth-1000-24m-0-flash"), false);
    assert.ok(hidden.every((item) => item.category === "broadband"));
    assert.ok(hidden.every((item) => item.housing !== "all" && item.housing.includes("public")));
    const unlocked = relatedComparePlans(getPlan("icable-ftth-1000-public-48m")!, "public", "長沙灣邨");
    assert.equal(unlocked[0]?.id, "hkbn-ftth-1000-24m-0-flash");
    assert.equal(unlocked[0]?.flashOffer, true);
  });

  it("keeps private suggestions on private plans and hides estate flash deals", () => {
    const rows = relatedComparePlans(getPlan("icable-ftth-1000-private-36m")!, "private", "YOHO Town 二座");
    assert.equal(rows.some((item) => item.id === "hkbn-ftth-1000-24m-0-flash"), false);
    assert.equal(rows.some((item) => item.id === "hkbn-ftth-2500-36m-148-flash"), false);
    assert.equal(rows.some((item) => item.id === "hkbn-ftth-1000-36m-63-flash"), false);
    assert.equal(rows.some((item) => item.id === "hkbn-village-200-27m"), false);
    assert.ok(rows.every((item) => item.housing !== "all" && item.housing.includes("private")));
    assert.equal(rows.some((item) => item.category === "home5g"), false);
    const unlocked = relatedComparePlans(getPlan("icable-ftth-1000-private-36m")!, "private", "長沙灣邨");
    assert.equal(unlocked[0]?.flashOffer, true);
    assert.equal(unlocked.some((item) => item.id === "hkbn-ftth-2500-36m-148-flash"), true);
  });

  it("puts a 齊Quote pick ahead of an ordinary plan when no flash offer fits", () => {
    const picked = relatedComparePlans(getPlan("hkbn-village-200-27m")!, "village");
    const quoteFirst = picked.findIndex((item) => item.quotePick);
    const plainFirst = picked.findIndex((item) => !item.quotePick && !item.flashOffer);
    if (quoteFirst >= 0 && plainFirst >= 0) assert.ok(quoteFirst < plainFirst);
    assert.equal(
      picked.some((item) => item.id === "hkbn-village-200-27m"),
      false,
    );
  });
});
