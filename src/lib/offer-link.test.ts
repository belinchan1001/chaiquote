import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

describe("staff offer links", () => {
  it("shows hidden plans on the offer page with no share and no one-time token flow", () => {
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const detail = readFileSync(join(here, "../routes/plans_.$planId.tsx"), "utf8");
    const page = readFileSync(join(here, "../routes/offers_.$offerId.tsx"), "utf8");
    assert.match(card, /plan\.staffOffer \? null : <PlanShareButton/);
    assert.match(card, /plan\.staffOffer \? \(/);
    assert.match(detail, /plan\.staffOffer \? null : <PlanShareButton/);
    assert.match(detail, /if \(!plan \|\| plan\.staffOffer\) throw notFound\(\)/);
    assert.match(page, /staffOfferPlans\(params\.offerId\)/);
    assert.match(page, /<PlanCard plan=\{plan\} \/>/);
    assert.match(page, /staffOfferLabel\(offerId, locale\)/);
    assert.doesNotMatch(page, /issueOfferLink|peekOfferView|claimOfferView|offerMint|\?k=/);
    assert.doesNotMatch(page, /PlanShareButton/);
  });
});
