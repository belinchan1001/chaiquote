import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { formatFee, getPlan, type Plan } from "./plans.ts";
import { planLine, quoteAsk, quoteMessage, QUICK_REPLIES } from "./whatsapp.ts";

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
    assert.match(text, /^你好，我想即時報價：\n/);
    assert.equal(lastLine(text), ASK_MOBILE);
    assert.equal(text.includes("覆蓋"), false);
    assert.match(text, /攜號轉台/);
    assert.doesNotMatch(text, /好過轉台|𨍭台/);
    assert.match(text, /3香港/);
    assert.match(text, /4\.5G 10GB 入門（36 個月）/);
    assert.equal(text.includes(`月費 ${formatFee(mobile.monthlyFee)}`), true);
    assert.match(text, /36個月/);
    assert.equal(text, `你好，我想即時報價：\n${planLine(mobile)}\n${ASK_MOBILE}`);

    assert.equal(quoteAsk([plan("cmhk-5g-limited-50-129"), plan("three-5g-22-78")]), ASK_MOBILE);
    assert.match(another, /^你好，我想即時報價以下計劃：\n/);
    assert.equal(lastLine(another), ASK_MOBILE);
    assert.equal(another.includes("覆蓋"), false);
    assert.match(another, /攜號轉台/);
    assert.doesNotMatch(another, /好過轉台|𨍭台/);
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
      assert.match(text, /^你好，我想即時報價：\n/);
      assert.equal(lastLine(text), ASK_COVERAGE);
      assert.match(text, /覆蓋/);
      assert.doesNotMatch(text, /新號碼上台優惠|攜號轉台/);
      assert.equal(text.includes(found.name), true);
      assert.equal(text.includes(`月費 ${formatFee(found.monthlyFee)}`), true);
      assert.equal(text.includes(`${found.contractMonths}個月`), true);
    }

    const twoFibre = quoteMessage([plan("hkbn-ftth-1000-36m-98"), plan("three-home5g-a-118")]);
    assert.equal(lastLine(twoFibre), ASK_COVERAGE);
    assert.doesNotMatch(twoFibre, /新號碼上台優惠|攜號轉台/);
  });

  it("keeps the coverage ask when a mixed set is not mobile-only", () => {
    const mixed = [plan("three-45g-10-58"), plan("hkbn-ftth-1000-36m-98")];
    const text = quoteMessage(mixed);
    assert.equal(quoteAsk(mixed), ASK_COVERAGE);
    assert.equal(lastLine(text), ASK_COVERAGE);
    assert.doesNotMatch(text, /新號碼上台優惠|攜號轉台/);
  });

  it("uses a coverage-free English ask for mobile only", () => {
    const mobile = plan("three-45g-10-58");
    const fibre = plan("hkbn-ftth-1000-36m-98");
    const mobileText = quoteMessage([mobile], null, "en");
    const fibreText = quoteMessage([fibre], null, "en");
    assert.equal(lastLine(mobileText), ASK_MOBILE_EN);
    assert.doesNotMatch(mobileText, /coverage/i);
    assert.equal(lastLine(quoteMessage([mobile, plan("three-5g-22-78")], null, "en")), ASK_MOBILE_EN);
    assert.equal(lastLine(fibreText), ASK_COVERAGE_EN);
    assert.doesNotMatch(fibreText, /new-number signup|number-porting/);
    assert.equal(lastLine(quoteMessage([mobile, fibre], null, "en")), ASK_COVERAGE_EN);
  });

  it("routes quote links, the widget and AI staff through quoteMessage", () => {
    const quote = readFileSync(join(here, "../components/quote-link.tsx"), "utf8");
    const widget = readFileSync(join(here, "../components/whatsapp-widget.tsx"), "utf8");
    const staff = readFileSync(join(here, "../components/ai-staff.tsx"), "utf8");
    const src = readFileSync(join(here, "whatsapp.ts"), "utf8");
    assert.match(quote, /quoteMessage\(selected, inquiry \?\? stored, locale\)/);
    assert.match(widget, /quoteMessage\(plans, inquiry, locale\)/);
    assert.match(staff, /quoteMessage\(/);
    assert.match(src, /category === "mobile"/);
    assert.match(src, /請幫我核對新號碼上台優惠／攜號轉台優惠/);
    assert.match(src, /請幫我核對覆蓋同最新優惠/);
    assert.doesNotMatch(src, /好過轉台|𨍭台/);
    const mobileQuick = QUICK_REPLIES.find((item) => item.id === "mobile");
    assert.ok(mobileQuick);
    assert.equal(mobileQuick.text.includes("覆蓋"), false);
    assert.equal(mobileQuick.textEn.toLowerCase().includes("coverage"), false);
  });
});
