import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isLinkPreviewBot,
  isOfferTokenFormat,
  offerCookieName,
  offerViewPath,
} from "./offer-link.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("one-time staff offer links", () => {
  it("treats WhatsApp and crawler user-agents as preview bots", () => {
    assert.equal(isLinkPreviewBot("WhatsApp/10"), true);
    assert.equal(isLinkPreviewBot("facebookexternalhit/1.1"), true);
    assert.equal(isLinkPreviewBot("Mozilla/5.0 iPhone"), false);
    assert.equal(isOfferTokenFormat("abc"), false);
    assert.equal(isOfferTokenFormat("n1u2v3w4x5y6z7a8b9c0d1e2"), true);
    assert.equal(offerCookieName("nv98"), "cq_o_nv98");
    assert.equal(offerViewPath("nv98", "tok_1"), "/offers/nv98?k=tok_1");
  });

  it("keeps share hidden on staff-offer cards and gates the offer page", () => {
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const detail = readFileSync(join(here, "../routes/plans_.$planId.tsx"), "utf8");
    const page = readFileSync(join(here, "../routes/offers_.$offerId.tsx"), "utf8");
    assert.match(card, /plan\.staffOffer \? null : <PlanShareButton/);
    assert.match(detail, /plan\.staffOffer \? null : <PlanShareButton/);
    assert.match(detail, /hasOfferSession/);
    assert.match(page, /issueOfferLink/);
    assert.match(page, /claimOfferView/);
    assert.match(page, /peekOfferView/);
    assert.match(page, /t\("offerMintMake"\)/);
    assert.match(page, /t\("offerMintSend"\)/);
    assert.match(page, /SITE\.url/);
    assert.doesNotMatch(page, /PlanShareButton/);
  });
});
