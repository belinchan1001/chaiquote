import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOOGLE_ADS_ID, GOOGLE_ADS_QUOTE_SEND_TO } from "./ads-gtag.ts";

describe("Google Ads tag", () => {
  it("uses the account tag from Tag Assistant", () => {
    assert.equal(GOOGLE_ADS_ID, "AW-18335486204");
    assert.match(GOOGLE_ADS_QUOTE_SEND_TO, /^AW-18335486204/);
  });
});
