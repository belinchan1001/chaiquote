import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  GA4_MEASUREMENT_ID,
  GA4_MEASUREMENT_ID_DEFAULT,
  GOOGLE_ADS_ID,
  GOOGLE_ADS_QUOTE_SEND_TO,
  adsQuoteConversionEvents,
  fireAdsQuoteConversion,
  installGoogleAdsTag,
  readGa4MeasurementId,
  readQuoteSendToEnv,
  resetAdsQuoteConversionGuard,
  resolveQuoteSendTo,
} from "./ads-gtag.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("Google Ads tag", () => {
  it("uses the GA4 measurement id without replacing the Ads id", () => {
    assert.equal(GOOGLE_ADS_ID, "AW-18335486204");
    assert.equal(GA4_MEASUREMENT_ID_DEFAULT, "G-HYHDCZN8KG");
    assert.match(GA4_MEASUREMENT_ID, /^G-[A-Z0-9]+$/);
    assert.equal(readGa4MeasurementId(undefined), "G-HYHDCZN8KG");
    assert.equal(readGa4MeasurementId({}), "G-HYHDCZN8KG");
    assert.equal(readGa4MeasurementId({ VITE_GA4_MEASUREMENT_ID: "  " }), "G-HYHDCZN8KG");
    assert.equal(readGa4MeasurementId({ VITE_GA4_MEASUREMENT_ID: "AW-18335486204" }), "G-HYHDCZN8KG");
    assert.equal(readGa4MeasurementId({ VITE_GA4_MEASUREMENT_ID: "g-lowercase" }), "G-HYHDCZN8KG");
    assert.equal(readGa4MeasurementId({ VITE_GA4_MEASUREMENT_ID: "  G-OTHER12345  " }), "G-OTHER12345");
  });

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
      installGoogleAdsTag();
      assert.deepEqual(calls, [
        ["config", GOOGLE_ADS_ID],
        ["config", GA4_MEASUREMENT_ID],
      ]);
    } finally {
      globalThis.window = previous;
    }
    const src = readFileSync(join(here, "ads-gtag.ts"), "utf8");
    const install = src.slice(src.indexOf("export function installGoogleAdsTag"), src.indexOf("let lastQuoteConversionAt"));
    const configs = src.slice(src.indexOf("function configAdsAndGa4"), src.indexOf("export function isCompleteQuoteSendTo"));
    assert.doesNotMatch(install, /generate_lead|fireAdsQuoteConversion|conversion/);
    assert.doesNotMatch(configs, /generate_lead|fireAdsQuoteConversion|conversion/);
    assert.match(configs, /gtag\("config", GOOGLE_ADS_ID\)/);
    assert.match(configs, /gtag\("config", GA4_MEASUREMENT_ID\)/);
    assert.match(install, /gtag\/js\?id=\$\{GOOGLE_ADS_ID\}/);
    assert.doesNotMatch(install, /gtag\/js\?id=\$\{GA4_MEASUREMENT_ID\}/);
    assert.match(install, /dataLayer\?\.push\(arguments\)/);
    assert.doesNotMatch(install, /function gtag\(\.\.\.args/);
    assert.match(src, /VITE_GA4_MEASUREMENT_ID/);
    assert.match(src, /G-HYHDCZN8KG/);
    assert.match(src, /VITE_GOOGLE_ADS_QUOTE_SEND_TO/);
    assert.match(src, /utm_source=google&utm_medium=cpc&utm_campaign=search-trial|索取報價/);
  });

  it("loads gtag.js once on the Ads id and still configs GA4", () => {
    const scripts: { async: boolean; src: string }[] = [];
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    globalThis.window = {} as unknown as Window & typeof globalThis;
    globalThis.document = {
      createElement() {
        return { async: false, src: "" };
      },
      head: {
        appendChild(node: { async: boolean; src: string }) {
          scripts.push(node);
          return node;
        },
      },
    } as unknown as Document;
    resetAdsQuoteConversionGuard();
    try {
      installGoogleAdsTag();
      installGoogleAdsTag();
      assert.equal(scripts.length, 1);
      assert.equal(scripts[0].async, true);
      assert.equal(scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`);
      const queued = () =>
        ((globalThis.window as Window).dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));
      let layer = queued();
      assert.equal(layer.length, 3);
      assert.equal(layer[0][0], "js");
      assert.ok(layer[0][1] instanceof Date);
      assert.deepEqual(layer.slice(1), [
        ["config", GOOGLE_ADS_ID],
        ["config", GA4_MEASUREMENT_ID],
      ]);

      fireAdsQuoteConversion(9_000);
      layer = queued();
      const expectedEvents = adsQuoteConversionEvents(resolveQuoteSendTo(GOOGLE_ADS_QUOTE_SEND_TO)).map((event) =>
        event.params ? ["event", event.name, event.params] : ["event", event.name],
      );
      assert.deepEqual(layer.slice(3), expectedEvents);
      assert.equal(scripts.length, 1);
    } finally {
      resetAdsQuoteConversionGuard();
      globalThis.window = previousWindow;
      globalThis.document = previousDocument;
    }
  });
});
