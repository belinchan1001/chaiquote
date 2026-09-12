import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createOfferToken,
  isLinkPreviewBot,
  isOfferTokenFormat,
  offerCookieName,
  offerViewPath,
  parseOfferToken,
} from "./offer-link.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("one-time staff offer links", () => {
  it("treats crawlers as preview bots but not WhatsApp in-app browsers", () => {
    assert.equal(isLinkPreviewBot("WhatsApp/10.0.2.1"), true);
    assert.equal(isLinkPreviewBot("facebookexternalhit/1.1"), true);
    assert.equal(isLinkPreviewBot("Mozilla/5.0 iPhone"), false);
    assert.equal(
      isLinkPreviewBot(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1",
      ),
      false,
    );
    assert.equal(
      isLinkPreviewBot(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1 WhatsApp/25.0",
      ),
      false,
    );
    assert.equal(isOfferTokenFormat("abc"), false);
    assert.equal(isOfferTokenFormat("aaa.bbb"), true);
    assert.equal(offerCookieName("nv98"), "cq_o_nv98");
    assert.equal(offerViewPath("nv98", "tok_1"), "/offers/nv98?k=tok_1");
  });

  it("round-trips a signed offer token", async () => {
    const token = await createOfferToken("nv78", "secret");
    assert.equal(isOfferTokenFormat(token), true);
    const parsed = await parseOfferToken(token, "secret");
    assert.equal(parsed?.o, "nv78");
    assert.equal(await parseOfferToken(token, "other"), null);
    assert.equal(await parseOfferToken(token.slice(0, -1) + "0", "secret"), null);
  });

  it("keeps share hidden on staff-offer cards and gates the offer page", () => {
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const detail = readFileSync(join(here, "../routes/plans_.$planId.tsx"), "utf8");
    const page = readFileSync(join(here, "../routes/offers_.$offerId.tsx"), "utf8");
    assert.match(card, /plan\.staffOffer \? null : <PlanShareButton/);
    assert.match(card, /plan\.staffOffer \? \(/);
    assert.match(detail, /plan\.staffOffer \? null : <PlanShareButton/);
    assert.match(detail, /hasOfferSession/);
    assert.match(page, /issueOfferLink/);
    assert.match(page, /claimOfferView/);
    assert.match(page, /peekOfferView/);
    assert.match(page, /t\(issued \? "offerMintAgainPlan" : "offerMintMakePlan"/);
    assert.match(page, /staffOfferLabel\(offerId/);
    assert.match(page, /SITE\.url/);
    assert.doesNotMatch(page, /PlanShareButton/);
  });
});
