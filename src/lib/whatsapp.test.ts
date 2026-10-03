import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { formatFee, getPlan, type Plan } from "./plans.ts";
import { SITE } from "./site.ts";
import {
  planLine,
  quoteAsk,
  quoteMessage,
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

function lastLine(text: string) {
  return text.trim().split("\n").at(-1) ?? "";
}

function plan(id: string): Plan {
  const found = getPlan(id);
  assert.ok(found, `missing plan ${id}`);
  return found;
}

describe("WhatsApp quote prefill closing line", () => {
  it("uses the locked mobile ask and never mentions 覆蓋", () => {
    const mobile = plan("three-45g-10-58");
    const text = quoteMessage([mobile]);
    const another = quoteMessage([plan("cmhk-5g-limited-50-129"), plan("three-5g-22-78")]);

    assert.equal(quoteAsk([mobile]), ASK_MOBILE);
    assert.match(text, /轉台獨家優惠/);
    assert.match(text, /服務類型：手機月費/);
    assert.match(text, /3香港/);
    assert.match(text, /4\.5G 10GB 入門（36 個月）/);
    assert.match(text, /目標心水計劃：/);
    assert.match(another, /服務類型：手機月費/);
    assert.match(another, /中國移動香港/);
  });

  it("keeps 核對覆蓋同最新優惠 for broadband, home5g and business", () => {
    const cases: [string, string][] = [
      ["hkbn-ftth-1000-36m-98", "broadband"],
      ["three-home5g-a-118", "home5g"],
      ["hkbn-biz-1000", "business"],
    ];
    for (const [id, category] of cases) {
      const found = plan(id);
      assert.equal(found.category, category);
      const text = quoteMessage([found]);
      assert.equal(quoteAsk([found]), ASK_COVERAGE);
      assert.match(text, /轉台獨家優惠/);
      assert.match(text, new RegExp(`服務類型：${found.category === "broadband" ? "光纖寬頻" : found.category === "home5g" ? "5G 家居寬頻" : "商業寬頻"}`));
      assert.match(text, /請幫我確認覆蓋\/訊號/);
      assert.equal(text.includes(found.name), true);
    }

    const twoFibre = quoteMessage([plan("hkbn-ftth-1000-36m-98"), plan("three-home5g-a-118")]);
    assert.match(twoFibre, /轉台獨家優惠/);
    assert.match(twoFibre, /香港寬頻/);
  });

  it("keeps the coverage ask when a mixed set is not mobile-only", () => {
    const mixed = [plan("three-45g-10-58"), plan("hkbn-ftth-1000-36m-98")];
    const text = quoteMessage(mixed);
    assert.equal(quoteAsk(mixed), ASK_COVERAGE);
    assert.match(text, /轉台獨家優惠/);
    assert.match(text, /3香港/);
    assert.match(text, /香港寬頻/);
  });

  it("uses a coverage-free English ask for mobile only", () => {
    const mobile = plan("three-45g-10-58");
    const fibre = plan("hkbn-ftth-1000-36m-98");
    const mobileText = quoteMessage([mobile], null, "en");
    const fibreText = quoteMessage([fibre], null, "en");
    assert.match(mobileText, /服務類型：手機月費/);
    assert.match(mobileText, /轉台獨家優惠/);
    assert.match(fibreText, /服務類型：光纖寬頻/);
    assert.match(quoteMessage([mobile, plan("three-5g-22-78")], null, "en"), /服務類型：手機月費/);
    assert.match(quoteMessage([mobile, fibre], null, "en"), /3香港/);
    assert.match(quoteMessage([mobile, fibre], null, "en"), /香港寬頻/);
  });

  it("routes quote links, the widget and AI staff through quote builders", () => {
    const quote = readFileSync(join(here, "../components/quote-link.tsx"), "utf8");
    const widget = readFileSync(join(here, "../components/whatsapp-widget.tsx"), "utf8");
    const staff = readFileSync(join(here, "../components/ai-staff.tsx"), "utf8");
    const src = readFileSync(join(here, "whatsapp.ts"), "utf8");
    assert.match(quote, /const resolved = inquiry \?\? stored/);
    assert.match(quote, /quoteMessage\(selected, resolved, locale\)/);
    assert.match(quote, /quoteWhatsappE164\(selected, resolved\)/);
    assert.match(quote, /quoteWhatsAppActivateProps\(/);
    assert.match(widget, /quoteMessage\(plans, inquiry, locale\)/);
    assert.match(widget, /quoteWhatsappHref\(/);
    assert.match(widget, /trackWaClick\(/);
    assert.match(staff, /portInQuoteFromInquiry\(/);
    assert.match(staff, /quoteWhatsAppActivateProps\(/);
    assert.match(src, /category === "mobile"/);
    assert.match(src, /請幫我核對新號碼上台優惠／攜號轉台優惠/);
    assert.match(src, /請幫我核對覆蓋同最新優惠/);
    assert.doesNotMatch(src, /好過轉台|𨍭台/);
    const mobileQuick = QUICK_REPLIES.find((item) => item.id === "mobile");
    assert.ok(mobileQuick);
    assert.match(mobileQuick.text, /服務類型：手機月費/);
    assert.match(mobileQuick.text, /轉台獨家優惠/);
    assert.match(mobileQuick.textEn, /服務類型：手機月費/);
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
    assert.match(whatsappHref("你好", quoteWhatsappE164([netvigator])), /phone=85254363004/);
  });

  it("keeps other plan cards and generic quotes on the desk number", () => {
    const three = plan("three-45g-10-58");
    const mixed = [plan("netvigator-ftth-1000-private-36m"), plan("hkbn-ftth-1000-36m-98")];
    assert.equal(quoteWhatsappE164([]), SITE.whatsappE164);
    assert.equal(quoteWhatsappE164([three]), SITE.whatsappE164);
    assert.equal(quoteWhatsappE164(mixed), SITE.whatsappE164);
    assert.match(whatsappHref("你好"), /phone=85263099966/);
    assert.doesNotMatch(whatsappHref("你好"), /54363004|96642675/);
  });
});

describe("HKBN plan-card WhatsApp routing", () => {
  it("sends HKBN fibre, mobile and business quotes to 9664 2675", () => {
    const fibre = plan("hkbn-ftth-1000-36m-98");
    const mobile = plan("hkbn-5g-30");
    const biz = plan("hkbn-biz-1000");
    assert.equal(quoteWhatsappE164([fibre]), SITE.hkbnWhatsappE164);
    assert.equal(quoteWhatsappE164([mobile]), SITE.hkbnWhatsappE164);
    assert.equal(quoteWhatsappE164([biz]), SITE.hkbnWhatsappE164);
    assert.equal(quoteWhatsappE164([fibre, mobile, biz]), SITE.hkbnWhatsappE164);
    assert.match(whatsappHref("你好", quoteWhatsappE164([fibre])), /phone=85296642675/);
  });
});

describe("WhatsApp source mark", () => {
  it("appends one short 【來源】line and does not put the click id in the prefill", () => {
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
      const text = new URL(href).searchParams.get("text") ?? "";
      assert.match(text, /^【齊Quote】\n你好，我想即時報價\n【查詢】村屋寬頻 #2$/);
      assert.doesNotMatch(text, /CjwKCAjwSECRET|google_ads|Google/);
      const line = text.split("\n").at(-1) ?? "";
      assert.ok(line.length <= 40, line);
      const again = new URL(quoteWhatsappHref("你好")).searchParams.get("text") ?? "";
      assert.match(again, /【查詢】村屋寬頻 #2/);
      assert.doesNotMatch(again, /fbclid|facebook|google_ads/);
    } finally {
      globalThis.window = previous;
    }

    const blank = new URL(quoteWhatsappHref("")).searchParams.get("text") ?? "";
    assert.equal(blank, "【查詢】網站 #1");
  });
});
