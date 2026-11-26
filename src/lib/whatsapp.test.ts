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
  widgetQuoteMessage,
  quoteVisitDesk,
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
    assert.match(text, /申請方式：/);
    assert.match(text, /數據需求：/);
    assert.doesNotMatch(text, /安裝\/常用地址|屋樓類型/);
    assert.match(text, /攜號轉台／新號碼優惠/);
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
    assert.match(quote, /quoteMessage\(selected, siteNumber \? \{\} : resolved, locale\)/);
    assert.match(quote, /siteNumber \? SITE\.whatsappE164 : quoteWhatsappE164/);
    assert.match(quote, /quoteWhatsappE164\(selected, resolved\)/);
    assert.match(quote, /quoteWhatsAppActivateProps\(/);
    assert.match(widget, /widgetQuoteMessage\(/);
    assert.match(widget, /quoteWhatsappHref\(/);
    assert.doesNotMatch(widget, /fabInquiryMessage\(|widgetWhatsappHref\(|來源：/);
    assert.doesNotMatch(widget, /你好，我想查詢覆蓋同計劃/);
    assert.match(widget, /trackWaClick\(/);
    assert.doesNotMatch(quote, /widgetQuoteMessage\(|widgetWhatsappHref\(/);
    assert.doesNotMatch(src, /你好，我想查詢覆蓋同計劃|fabInquiryMessage|widgetWhatsappHref|來源：Google 廣告/);
    assert.match(staff, /<PlanCard /);
    assert.match(staff, /bareWhatsAppActivateProps\(/);
    assert.match(staff, /setInquiry\(/);
    assert.doesNotMatch(staff, /quoteWhatsAppActivateProps\(/);
    assert.match(src, /category === "mobile"/);
    assert.match(src, /請幫我核對新號碼上台優惠／攜號轉台優惠/);
    assert.match(src, /請幫我核對覆蓋同最新優惠/);
    assert.doesNotMatch(src, /好過轉台|𨍭台/);
    const mobileQuick = QUICK_REPLIES.find((item) => item.id === "mobile");
    assert.ok(mobileQuick);
    assert.equal(mobileQuick.text, "流動通訊");
    assert.equal(mobileQuick.textEn, "mobile plans");
    assert.doesNotMatch(mobileQuick.text, /轉台獨家優惠|轉台禮品|心水電訊商/);
    const fibre = plan("hkbn-ftth-1000-36m-98");
    const widgetBody = widgetQuoteMessage("家居寬頻", [fibre]);
    assert.equal(widgetBody, quoteMessage([fibre]));
    assert.match(widgetBody, /轉台獨家優惠/);
    assert.match(widgetBody, /服務類型：光纖寬頻/);
    assert.match(widgetBody, /安裝\/常用地址：/);
    assert.doesNotMatch(widgetBody, /你好，我想查詢覆蓋同計劃|月費：HK\$|申請地址：/);
    const href = quoteWhatsappHref(quoteMessage([]));
    const text = new URL(href).searchParams.get("text") ?? "";
    assert.match(text, /轉台獨家優惠/);
    assert.match(text, /#0$/);
    assert.doesNotMatch(text, /來源：/);
  });
});

describe("HKT plan-card WhatsApp routing", () => {
  it("sends CSL and HKT home quotes to 5436 3004, and Netvigator business to 5588 3226", () => {
    const netvigator = plan("netvigator-ftth-1000-private-36m");
    const csl = plan("csl-5g-20-108-24m");
    const home5g = plan("csl-home5g");
    const biz = plan("netvigator-biz-1000");
    assert.equal(SITE.hktHomeWhatsappE164, "85254363004");
    assert.equal(quoteWhatsappE164([netvigator]), SITE.hktHomeWhatsappE164);
    assert.equal(quoteWhatsappE164([csl]), SITE.hktHomeWhatsappE164);
    assert.equal(quoteWhatsappE164([home5g]), SITE.hktHomeWhatsappE164);
    assert.equal(quoteWhatsappE164([netvigator, csl]), SITE.hktHomeWhatsappE164);
    assert.equal(quoteWhatsappE164([biz]), SITE.hktWhatsappE164);
    assert.equal(SITE.hktWhatsappE164, "85255883226");
    assert.match(whatsappHref("你好", quoteWhatsappE164([netvigator])), /phone=85254363004/);
    assert.doesNotMatch(whatsappHref("你好", quoteWhatsappE164([csl])), /55883226|63099966/);
    assert.match(whatsappHref("你好", quoteWhatsappE164([biz])), /phone=85255883226/);
  });

  it("keeps other plan cards and generic quotes on the desk number", () => {
    const three = plan("three-45g-10-58");
    const mixed = [plan("netvigator-ftth-1000-private-36m"), plan("hkbn-ftth-1000-36m-98")];
    assert.equal(quoteWhatsappE164([]), SITE.whatsappE164);
    assert.equal(quoteWhatsappE164([three]), SITE.whatsappE164);
    assert.equal(quoteWhatsappE164(mixed), SITE.whatsappE164);
    assert.match(whatsappHref("你好"), /phone=85263099966/);
    assert.doesNotMatch(whatsappHref("你好"), /54363004|55883226|96642675|61118499/);
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
    assert.match(whatsappHref("你好", quoteWhatsappE164([fibre])), /phone=85261118499/);
    assert.doesNotMatch(whatsappHref("你好", quoteWhatsappE164([fibre])), /96642675|63099966/);
    const id = fibre.id;
    assert.equal(quoteVisitDesk(`/plans/${id}`, []).e164, SITE.hkbnWhatsappE164);
    assert.equal(quoteVisitDesk("/plans", [], null, "hkbn").e164, SITE.hkbnWhatsappE164);
    assert.equal(quoteVisitDesk("/plans", [fibre]).e164, SITE.hkbnWhatsappE164);
    assert.equal(quoteVisitDesk("/", [], { targetProvider: "網上行" }).e164, SITE.hktHomeWhatsappE164);
    assert.equal(quoteVisitDesk("/", []).e164, SITE.whatsappE164);
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
    assert.equal(blank, "【查詢】網站 #0");
  });
});

function withLead(search: string, run: () => void) {
  const store = new Map<string, string>();
  const previous = globalThis.window;
  globalThis.window = {
    location: { search },
    sessionStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    },
  } as unknown as Window & typeof globalThis;
  try {
    run();
  } finally {
    globalThis.window = previous;
  }
}

function widgetPrefill(search: string, text: string) {
  let out = "";
  withLead(search, () => {
    out = new URL(quoteWhatsappHref(text, SITE.whatsappE164)).searchParams.get("text") ?? "";
  });
  return out;
}

const FLASH_PLAN = "hkbn-ftth-1000-36m-128-sep30";
const GOOGLE_BROADBAND = "?cat=broadband&utm_source=google&utm_medium=cpc&gclid=CjwKCAjwSECRET";

const PLAN_PREFILL = [
  "【齊Quote】",
  "👋 你好！我想查詢／申請【齊Quote 轉台獨家優惠】：",
  "--------------------------------",
  "📌 服務類型：光纖寬頻",
  "📍 安裝/常用地址：",
  "🏢 屋樓類型：",
  "🔄 現時電訊商：",
  "🎯 指定心水電訊商：香港寬頻",
  "📅 合約到期日：",
  "⚡ 需求規格：速度不限 / 預設",
  "🎮 特殊需求：無",
  "🎯 目標心水計劃：香港寬頻 1000M 限時快閃連影視會籍（36 個月） (HK$128/月)",
  "🤖 篩選方式：手動條件篩選",
  "--------------------------------",
  "請幫我確認覆蓋/訊號與預留轉台禮品，謝謝！",
  "【查詢】家居寬頻 #2",
].join("\n");

const CHIP_PREFILL = [
  "【齊Quote】",
  "👋 你好！我想查詢／申請【齊Quote 轉台獨家優惠】：",
  "--------------------------------",
  "📌 服務類型：光纖寬頻",
  "📍 安裝/常用地址：",
  "🏢 屋樓類型：",
  "🔄 現時電訊商：",
  "🎯 指定心水電訊商：",
  "📅 合約到期日：",
  "⚡ 需求規格：速度不限 / 預設",
  "🎮 特殊需求：無",
  "🎯 目標心水計劃：",
  "🤖 篩選方式：手動條件篩選",
  "--------------------------------",
  "請幫我確認覆蓋/訊號與預留轉台禮品，謝謝！",
  "【查詢】家居寬頻 #2",
].join("\n");

const MOBILE_PREFILL = [
  "【齊Quote】",
  "👋 你好！我想查詢／申請【齊Quote 轉台獨家優惠】：",
  "--------------------------------",
  "📌 服務類型：手機月費",
  "📱 申請方式：",
  "🔄 現時電訊商：",
  "🎯 指定心水電訊商：",
  "📅 合約到期日：",
  "📶 數據需求：",
  "🎮 特殊需求：無",
  "🎯 目標心水計劃：",
  "🤖 篩選方式：手動條件篩選",
  "--------------------------------",
  "請幫我確認攜號轉台／新號碼優惠與預留禮品，謝謝！",
  "【查詢】網站 #0",
].join("\n");

describe("floating WhatsApp widget prefill", () => {
  it("uses the plan-card sales form, then the same 【查詢】#n mark", () => {
    const flash = plan(FLASH_PLAN);
    assert.equal(flash.monthlyFee, 128);
    const body = widgetQuoteMessage("", [flash], { estate: "", housing: "" });
    assert.equal(body, quoteMessage([flash], { estate: "", housing: "" }));
    const text = widgetPrefill(GOOGLE_BROADBAND, body);
    assert.equal(text, PLAN_PREFILL);
    assert.doesNotMatch(text, /來源：|你好，我想查詢覆蓋同計劃|月費：HK\$|申請地址：|6309|6111|5436|852\d{8}|最平|最抵|低至|gclid|CjwKCAjwSECRET/);

    const chosen = widgetQuoteMessage("", [flash], { estate: "太古城", housing: "private" });
    assert.equal(chosen, quoteMessage([flash], { estate: "太古城", housing: "private" }));
    assert.match(chosen, /📍 安裝\/常用地址：太古城\n🏢 屋樓類型：私人樓/);
  });

  it("uses the same sales form for a category chip, with blank address fields", () => {
    const body = widgetQuoteMessage("家居寬頻", []);
    assert.equal(body, quoteMessage([], { serviceType: "光纖寬頻" }));
    const text = widgetPrefill(GOOGLE_BROADBAND, body);
    assert.equal(text, CHIP_PREFILL);
    assert.doesNotMatch(text, /來源：|你好，我想查詢覆蓋同計劃/);
  });

  it("uses the mobile sales form for a mobile-only chip or plan", () => {
    const chip = widgetQuoteMessage("流動通訊", []);
    assert.equal(chip, quoteMessage([], { serviceType: "手機月費" }));
    assert.equal(widgetPrefill("", chip), MOBILE_PREFILL);
    assert.doesNotMatch(chip, /安裝\/常用地址|屋樓類型/);

    const mobile = plan("three-45g-10-58");
    const withPlan = widgetQuoteMessage("", [mobile]);
    assert.equal(withPlan, quoteMessage([mobile]));
    assert.match(withPlan, /服務類型：手機月費/);
    assert.match(withPlan, /請幫我確認攜號轉台／新號碼優惠與預留禮品，謝謝！/);
    assert.match(withPlan, new RegExp(`目標心水計劃：3香港 ${mobile.name} \\(HK\\$${mobile.monthlyFee}/月\\)`));
    assert.doesNotMatch(withPlan, /安裝\/常用地址|屋樓類型/);
  });

  it("uses the same #0–#4 inquiry mark as other quote links", () => {
    const body = quoteMessage([plan(FLASH_PLAN)]);
    const cases: [string, string][] = [
      ["", "【查詢】網站 #0"],
      ["?utm_source=organic", "【查詢】網站 #1"],
      ["?utm_source=google&utm_medium=cpc", "【查詢】網站 #2"],
      ["?cat=broadband&utm_source=google&utm_medium=cpc", "【查詢】家居寬頻 #2"],
      ["?fbclid=IwAR2click", "【查詢】網站 #3"],
      ["?utm_source=newsletter&utm_campaign=spring", "【查詢】網站 #4"],
    ];
    for (const [search, label] of cases) {
      const text = widgetPrefill(search, body);
      assert.match(text, new RegExp(`${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
      assert.match(text, /轉台獨家優惠/);
      assert.doesNotMatch(text, /來源：/);
      withLead(search, () => {
        const card = new URL(quoteWhatsappHref(body)).searchParams.get("text") ?? "";
        assert.equal(text, card);
      });
    }
    assert.doesNotMatch(body, /來源：|#\d|【查詢】/);
  });
});
