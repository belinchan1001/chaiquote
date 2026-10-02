import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LEAD_ATTR_STORAGE_KEY,
  SOURCE_MARK_MAX,
  appendSourceMark,
  captureLeadTouch,
  classifyLeadSource,
  sourceMarkLine,
  customerInquiryLine,
  touchFromSearch,
} from "./ads-attribution.ts";
import { shouldRecordQuoteOpen } from "./wa-open-guard.ts";

const here = dirname(fileURLToPath(import.meta.url));

function memoryStore() {
  const data = new Map<string, string>();
  return {
    data,
    getItem(key: string) {
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
  };
}

describe("lead source label", () => {
  it("classifies google ads, meta, organic and other", () => {
    assert.deepEqual(classifyLeadSource({ gclid: "CjwKCAjwSECRET" }), { source: "google_ads" });
    assert.deepEqual(
      classifyLeadSource({
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "search-trial",
      }),
      { source: "google_ads", campaign: "search-trial" },
    );
    assert.equal(classifyLeadSource({ from: "ad" }).source, "google_ads");
    assert.equal(classifyLeadSource({ fbclid: "IwAR2click" }).source, "meta");
    assert.equal(classifyLeadSource({ utm_source: "facebook", utm_medium: "paid" }).source, "meta");
    assert.equal(classifyLeadSource({ utm_source: "instagram" }).source, "meta");
    assert.equal(classifyLeadSource({}).source, "organic");
    assert.equal(classifyLeadSource(null).source, "organic");
    assert.equal(classifyLeadSource({ utm_source: "google", utm_medium: "organic" }).source, "organic");
    assert.equal(classifyLeadSource({ utm_source: "newsletter", utm_campaign: "spring" }).source, "other");
    assert.equal(classifyLeadSource({ utm_source: "Google", utm_medium: "CPC" }).source, "google_ads");
  });

  it("keeps the desk line short and drops personal or click-id noise from the campaign", () => {
    const trial = sourceMarkLine(classifyLeadSource({ utm_source: "google", utm_medium: "cpc", utm_campaign: "試水" }));
    assert.equal(trial, "【來源】google_ads · 試水");
    assert.ok(trial.length <= SOURCE_MARK_MAX);

    const long = classifyLeadSource({ gclid: "x", utm_campaign: "a".repeat(80) });
    const line = sourceMarkLine(long);
    assert.ok(line.length <= SOURCE_MARK_MAX);
    assert.match(line, /^【來源】google_ads · a+$/);

    assert.equal(classifyLeadSource({ utm_campaign: "user@example.com" }).campaign, undefined);
    assert.equal(classifyLeadSource({ utm_campaign: "tel91234567" }).campaign, undefined);
    const text = appendSourceMark("你好，我想即時報價", classifyLeadSource({ gclid: "CjwKCAjwSECRET", utm_campaign: "search-trial" }));
    assert.match(text, /你好，我想即時報價\n【來源】google_ads · search-trial$/);
    assert.doesNotMatch(text, /CjwKCAjwSECRET|gclid|fbclid/);
    assert.equal(appendSourceMark(text, { source: "meta" }), text);
    assert.equal(appendSourceMark("", { source: "organic" }), "【來源】organic");
  });

  it("stores the first tagged touch in the session and ignores a later one", () => {
    const store = memoryStore();
    const first = captureLeadTouch(
      "?utm_source=google&utm_medium=cpc&utm_campaign=search-trial&gclid=GCLID1&fbclid=FB1",
      store,
    );
    assert.equal(first.gclid, "GCLID1");
    assert.equal(first.utm_campaign, "search-trial");
    assert.equal(store.data.has(LEAD_ATTR_STORAGE_KEY), true);
    const second = captureLeadTouch("?utm_source=facebook&fbclid=LATER", store);
    assert.equal(second.gclid, "GCLID1");
    assert.equal(second.utm_source, "google");
    assert.equal(captureLeadTouch("", memoryStore()).utm_source, undefined);
    assert.equal(touchFromSearch("?from=ad").from, "ad");
    assert.equal(customerInquiryLine(touchFromSearch("?cat=broadband&housing=public&from=ad")), "【查詢】公屋寬頻 #2");
    assert.equal(customerInquiryLine(touchFromSearch("?cat=home5g&utm_source=google&utm_medium=cpc")), "【查詢】5G 家居寬頻 #2");
    assert.equal(customerInquiryLine(touchFromSearch("?cat=broadband&housing=private")), "【查詢】私人樓宇 #1");
    assert.equal(customerInquiryLine({ fbclid: "IwAR2click" }), "【查詢】網站 #3");
    assert.equal(customerInquiryLine({}), "【查詢】網站 #1");
    assert.doesNotMatch(customerInquiryLine({ from: "ad", gclid: "secret" }), /google|ads|secret/i);
    assert.match(
      readFileSync(join(here, "ads-attribution.ts"), "utf8"),
      /utm_source=google&utm_medium=cpc&utm_campaign=search-trial/,
    );
  });
});

describe("quote open guard", () => {
  it("records a real click or middle-click, not pointer-down or the context menu", () => {
    assert.equal(shouldRecordQuoteOpen("pointerdown", 0), false);
    assert.equal(shouldRecordQuoteOpen("click", 0), true);
    assert.equal(shouldRecordQuoteOpen("auxclick", 1), true);
    assert.equal(shouldRecordQuoteOpen("auxclick", 2), false);
    assert.equal(shouldRecordQuoteOpen("mount"), false);
  });
});

describe("conversion is not wired to page load", () => {
  it("calls fireAdsQuoteConversion only from the WhatsApp click tracker", () => {
    const srcRoot = join(here, "..");
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
          continue;
        }
        if (!full.endsWith(".ts") && !full.endsWith(".tsx")) continue;
        if (full.endsWith(".test.ts")) continue;
        const text = readFileSync(full, "utf8");
        if (text.includes("fireAdsQuoteConversion(")) hits.push(relative(srcRoot, full));
      }
    };
    walk(srcRoot);
    hits.sort();
    assert.deepEqual(hits, ["lib/ads-gtag.ts", "lib/track-client.ts"]);
    const track = readFileSync(join(here, "track-client.ts"), "utf8");
    assert.match(track, /if \(payload\.event === "wa_click"\) fireAdsQuoteConversion\(\)/);
    const tag = readFileSync(join(here, "../components/google-ads-tag.tsx"), "utf8");
    assert.match(tag, /captureLeadAttribution\(\)/);
    assert.match(tag, /installGoogleAdsTag\(\)/);
    assert.doesNotMatch(tag, /fireAdsQuoteConversion/);
    for (const file of [
      "../components/quote-link.tsx",
      "../components/site-header.tsx",
      "../components/site-footer.tsx",
      "../components/ai-staff.tsx",
      "../components/whatsapp-widget.tsx",
      "../routes/guides_.$slug.tsx",
    ]) {
      assert.match(readFileSync(join(here, file), "utf8"), /quoteWhatsAppActivateProps\(|quoteWhatsappHref\(/);
    }
    assert.doesNotMatch(readFileSync(join(here, "news-share.ts"), "utf8"), /fireAdsQuoteConversion|trackWaClick/);
  });
});
