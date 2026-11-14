import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getPlan, type Plan } from "./plans.ts";
import { SITE } from "./site.ts";
import {
  quoteAsk,
  quoteMessage,
  quoteWhatsappDisplay,
  quoteWhatsappE164,
  quoteWhatsappHref,
  QUICK_REPLIES,
  whatsappHref,
} from "./whatsapp.ts";

const here = dirname(fileURLToPath(import.meta.url));
const ASK_MOBILE = "請幫我核對新號碼上台優惠／攜號轉台優惠。";
const ASK_MOBILE_EN = "Please help me check new-number signup offers / number-porting (MNP) offers.";
const ASK_COVERAGE = "請幫我核對覆蓋同最新優惠。";
const ASK_COVERAGE_EN = "Please confirm coverage and the latest offer.";

function plan(id: string): Plan {
  const found = getPlan(id);
  assert.ok(found, `missing plan ${id}`);
  return found;
}

describe("WhatsApp quote links have no sales prefill", () => {
  it("keeps the coverage ask helpers and sends no exclusive-offer text", () => {
    const mobile = plan("three-45g-10-58");
    const fibre = plan("hkbn-ftth-1000-36m-98");
    const mixed = [mobile, fibre];

    assert.equal(quoteAsk([mobile]), ASK_MOBILE);
    assert.equal(quoteAsk([fibre]), ASK_COVERAGE);
    assert.equal(quoteAsk(mixed), ASK_COVERAGE);
    assert.equal(quoteAsk([mobile], "en"), ASK_MOBILE_EN);
    assert.equal(quoteAsk([fibre], "en"), ASK_COVERAGE_EN);
    for (const text of [
      quoteMessage([mobile]),
      quoteMessage([fibre]),
      quoteMessage(mixed),
      quoteMessage([mobile], null, "en"),
      quoteMessage([fibre], null, "en"),
    ]) {
      assert.equal(text, "");
      assert.doesNotMatch(text, /獨家優惠|轉台禮品|心水電訊商/);
    }
  });

  it("routes quote links, the widget and AI staff through bare wa.me builders", () => {
    const quote = readFileSync(join(here, "../components/quote-link.tsx"), "utf8");
    const widget = readFileSync(join(here, "../components/whatsapp-widget.tsx"), "utf8");
    const staff = readFileSync(join(here, "../components/ai-staff.tsx"), "utf8");
    const src = readFileSync(join(here, "whatsapp.ts"), "utf8");
    assert.match(quote, /const resolved = inquiry \?\? stored/);
    assert.match(quote, /quoteWhatsappE164\(selected, resolved\)/);
    assert.match(quote, /whatsappHref\(message, phone\)/);
    assert.match(quote, /quoteWhatsAppActivateProps\(/);
    assert.match(widget, /quoteWhatsappHref\(""/);
    assert.match(widget, /trackWaClick\(/);
    assert.doesNotMatch(widget, /轉台獨家優惠|轉台禮品/);
    assert.match(staff, /portInQuoteFromInquiry\(/);
    assert.match(staff, /quoteWhatsAppActivateProps\(/);
    assert.match(staff, /whatsappHref\(/);
    assert.match(src, /category === "mobile"/);
    assert.match(src, /請幫我核對新號碼上台優惠／攜號轉台優惠/);
    assert.match(src, /請幫我核對覆蓋同最新優惠/);
    assert.match(src, /https:\/\/wa\.me\/\$\{phone\}/);
    assert.doesNotMatch(src, /獨家優惠|轉台禮品|心水電訊商|api\.whatsapp\.com\/send/);
    assert.doesNotMatch(src, /好過轉台|𨍭台/);
    const mobileQuick = QUICK_REPLIES.find((item) => item.id === "mobile");
    assert.ok(mobileQuick);
    assert.equal(mobileQuick.text, "");
    assert.equal(mobileQuick.textEn, "");
  });
});

describe("HKT plan-card WhatsApp routing", () => {
  it("sends Netvigator, CSL and Netvigator business quotes to 5436 3004", () => {
    const netvigator = plan("netvigator-ftth-1000-private-36m");
    const csl = plan("csl-5g-20-108-24m");
    const biz = plan("netvigator-biz-1000");
    assert.equal(quoteWhatsappE164([netvigator]), SITE.hktWhatsappE164);
    assert.equal(quoteWhatsappE164([csl]), SITE.hktWhatsappE164);
    assert.equal(quoteWhatsappE164([biz]), SITE.hktWhatsappE164);
    assert.equal(quoteWhatsappE164([netvigator, csl]), SITE.hktWhatsappE164);
    assert.equal(whatsappHref("你好", quoteWhatsappE164([netvigator])), "https://wa.me/85254363004");
    assert.equal(new URL(whatsappHref("你好", quoteWhatsappE164([netvigator]))).search, "");
  });

  it("keeps other plan cards and generic quotes on the desk number", () => {
    const three = plan("three-45g-10-58");
    const mixed = [plan("netvigator-ftth-1000-private-36m"), plan("hkbn-ftth-1000-36m-98")];
    assert.equal(quoteWhatsappE164([]), SITE.whatsappE164);
    assert.equal(quoteWhatsappE164([three]), SITE.whatsappE164);
    assert.equal(quoteWhatsappE164(mixed), SITE.whatsappE164);
    assert.equal(whatsappHref("你好"), "https://wa.me/85263099966");
    assert.equal(new URL(whatsappHref("你好")).search, "");
    assert.doesNotMatch(whatsappHref("你好"), /54363004|96642675|61118499|text=/);
  });
});

describe("HKBN plan-card WhatsApp routing", () => {
  it("sends HKBN fibre, mobile, business and 5G home quotes to 6111 8499", () => {
    const fibre = plan("hkbn-ftth-1000-36m-98");
    const mobile = plan("hkbn-5g-30");
    const biz = plan("hkbn-biz-1000");
    const home5g = plan("hkbn-home5g");
    assert.equal(quoteWhatsappE164([fibre]), SITE.hkbnWhatsappE164);
    assert.equal(quoteWhatsappE164([mobile]), SITE.hkbnWhatsappE164);
    assert.equal(quoteWhatsappE164([biz]), SITE.hkbnWhatsappE164);
    assert.equal(quoteWhatsappE164([fibre, mobile, biz]), SITE.hkbnWhatsappE164);
    assert.equal(quoteWhatsappE164([], { targetProvider: "香港寬頻" }), SITE.hkbnWhatsappE164);
    assert.equal(quoteWhatsappE164([home5g]), SITE.hkbnWhatsappE164);
    assert.equal(quoteWhatsappDisplay([fibre]), SITE.hkbnPhoneDisplay);
    assert.equal(whatsappHref("你好", quoteWhatsappE164([fibre])), "https://wa.me/85261118499");
    assert.equal(new URL(whatsappHref("你好", quoteWhatsappE164([fibre]))).search, "");
    assert.doesNotMatch(whatsappHref("你好", quoteWhatsappE164([fibre])), /96642675|63099966|text=/);
  });
});

describe("WhatsApp source mark", () => {
  it("does not put a text query or click id on the WhatsApp URL", () => {
    const store = new Map<string, string>();
    const previous = globalThis.window;
    globalThis.window = {
      location: { search: "?cat=broadband&housing=village&from=ad&utm_source=google&utm_medium=cpc&utm_campaign=search-trial&gclid=CjwKCAjwSECRET" },
      sessionStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
      },
    } as unknown as Window & typeof globalThis;
    try {
      const href = quoteWhatsappHref("你好，我想即時報價");
      assert.equal(href, "https://wa.me/85263099966");
      assert.equal(new URL(href).search, "");
      assert.doesNotMatch(href, /CjwKCAjwSECRET|text=|獨家優惠|轉台禮品/);
      assert.equal(quoteWhatsappHref("你好"), href);
    } finally {
      globalThis.window = previous;
    }

    assert.equal(quoteWhatsappHref(""), "https://wa.me/85263099966");
  });
});
