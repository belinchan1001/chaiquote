import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GOOGLE_ADS_ID, GOOGLE_ADS_QUOTE_SEND_TO } from "./ads-gtag.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("Google Ads tag", () => {
  it("uses the account tag from Tag Assistant", () => {
    assert.equal(GOOGLE_ADS_ID, "AW-18335486204");
    assert.match(GOOGLE_ADS_QUOTE_SEND_TO, /^AW-18335486204/);
  });

  it("queues the tag immediately and fetches gtag.js after load or interaction", () => {
    const lib = readFileSync(join(here, "ads-gtag.ts"), "utf8");
    const tag = readFileSync(join(here, "../components/google-ads-tag.tsx"), "utf8");
    assert.match(lib, /gtag\/js\?id=\$\{GOOGLE_ADS_ID\}/);
    assert.match(lib, /scheduleGoogleAdsTag/);
    assert.match(lib, /requestIdleCallback/);
    assert.match(lib, /addEventListener\("pointerdown"/);
    assert.match(lib, /send_to: GOOGLE_ADS_QUOTE_SEND_TO/);
    assert.match(tag, /scheduleGoogleAdsTag/);
    assert.doesNotMatch(tag, /installGoogleAdsTag/);
  });
});
