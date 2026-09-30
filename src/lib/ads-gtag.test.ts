import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  GOOGLE_ADS_ID,
  GOOGLE_ADS_QUOTE_SEND_TO,
  adsQuoteConversionEvents,
  fireAdsQuoteConversion,
  installGoogleAdsTag,
  readQuoteSendToEnv,
  resetAdsQuoteConversionGuard,
  resolveQuoteSendTo,
} from "./ads-gtag.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("Google Ads tag", () => {
  it("uses the account tag from Tag Assistant", () => {
    assert.equal(GOOGLE_ADS_ID, "AW-18335486204");
    assert.match(GOOGLE_ADS_QUOTE_SEND_TO, /^AW-18335486204/);
    assert.equal(readQuoteSendToEnv(undefined), "AW-18335486204");
    assert.equal(readQuoteSendToEnv({ VITE_GOOGLE_ADS_QUOTE_SEND_TO: "  AW-18335486204/AbC12_x  " }), "AW-18335486204/AbC12_x");
  });

  it("skips an incomplete conversion send_to and still emits generate_lead", () => {
    assert.equal(resolveQuoteSendTo("AW-18335486204"), null);
    assert.equal(resolveQuoteSendTo("AW-18335486204/"), null);
    assert.equal(resolveQuoteSendTo("AW-99999999999/label"), null);
    assert.equal(resolveQuoteSendTo("AW-18335486204/AbC12_x"), "AW-18335486204/AbC12_x");
    assert.deepEqual(adsQuoteConversionEvents(null), [{ name: "generate_lead" }]);
    assert.deepEqual(adsQuoteConversionEvents("AW-18335486204/AbC12_x"), [
      { name: "conversion", params: { send_to: "AW-18335486204/AbC12_x" } },
      { name: "generate_lead" },
    ]);

    const calls: unknown[][] = [];
    const previous = globalThis.window;
    globalThis.window = {
      gtag: (...args: unknown[]) => {
        calls.push(args);
      },
    } as unknown as Window & typeof globalThis;
    resetAdsQuoteConversionGuard();
    try {
      fireAdsQuoteConversion(1_000);
      fireAdsQuoteConversion(1_100);
      assert.deepEqual(calls, [["event", "generate_lead"]]);
      fireAdsQuoteConversion(1_000 + 800);
      assert.deepEqual(calls, [
        ["event", "generate_lead"],
        ["event", "generate_lead"],
      ]);
    } finally {
      resetAdsQuoteConversionGuard();
      globalThis.window = previous;
    }
  });

  it("does not fire 索取報價 when the account tag is installed", () => {
    const calls: unknown[][] = [];
    const previous = globalThis.window;
    globalThis.window = {
      gtag: (...args: unknown[]) => {
        calls.push(args);
      },
    } as unknown as Window & typeof globalThis;
    try {
      installGoogleAdsTag();
      assert.deepEqual(calls, [["config", GOOGLE_ADS_ID]]);
    } finally {
      globalThis.window = previous;
    }
    const src = readFileSync(join(here, "ads-gtag.ts"), "utf8");
    const install = src.slice(src.indexOf("export function installGoogleAdsTag"), src.indexOf("let lastQuoteConversionAt"));
    assert.doesNotMatch(install, /generate_lead|fireAdsQuoteConversion|conversion/);
    assert.match(src, /VITE_GOOGLE_ADS_QUOTE_SEND_TO/);
    assert.match(src, /utm_source=google&utm_medium=cpc&utm_campaign=search-trial|索取報價/);
  });
});
