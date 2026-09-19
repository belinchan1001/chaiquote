import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { inquiryFromAiParse, parseFilterState, retrievePlansForAsk } from "./ai-desk.ts";
import { portInQuoteFromInquiry } from "./port-in.ts";

describe("AI filter parse", () => {
  it("turns a port-in sentence into exclude JSON, not include-the-current-carrier", () => {
    const parsed = parseFilterState({
      message: "我用緊香港寬頻，下個月到期，太古城屋企想搵 1000M 打機寬頻。",
    });
    assert.equal(parsed.cat, "broadband");
    assert.equal(parsed.current, "hkbn");
    assert.equal(parsed.exclude, "hkbn");
    assert.equal(parsed.expiry, "1m");
    assert.equal(parsed.estate, "太古城");
    assert.equal(parsed.speed, 1000);
    assert.equal(parsed.gaming, true);
    assert.equal(parsed.housing, "private");
    const found = retrievePlansForAsk({
      message: "我用緊香港寬頻，下個月到期，太古城屋企想搵 1000M 打機寬頻。",
    });
    assert.ok(found.plans.length > 0);
    assert.equal(
      found.plans.every((plan) => plan.provider !== "香港寬頻"),
      true,
    );
  });

  it("fills a sales WhatsApp with AI parse, selected plan, and AI source tag", () => {
    const parsed = parseFilterState({
      message: "我用緊香港寬頻，想轉網上行，下個月到期，太古城想要電競神線。",
    });
    assert.equal(parsed.current, "hkbn");
    assert.equal(parsed.target, "netvigator");
    assert.equal(parsed.esports, true);
    const inquiry = inquiryFromAiParse(parsed);
    assert.equal(inquiry.source, "ai");
    assert.equal(inquiry.currentProvider, "香港寬頻");
    assert.match(inquiry.targetProvider ?? "", /網上行/);
    assert.equal(inquiry.estate, "太古城");
    assert.match(inquiry.need ?? "", /電競神線/);
    const text = portInQuoteFromInquiry(inquiry, { name: "2500M 光纖", monthlyFee: 149 });
    assert.match(text, /太古城/);
    assert.match(text, /香港寬頻 \(轉台客戶\)/);
    assert.match(text, /指定心水電訊商：網上行/);
    assert.match(text, /2500M 光纖 \(HK\$149\/月\)/);
    assert.match(text, /需要電競神線/);
    assert.match(text, /篩選方式：AI 智能推薦/);
  });

  it("treats 新號碼 as a new line, not a port-in exclude", () => {
    const parsed = parseFilterState({
      message: "我要新號碼，5G 全速無限。",
    });
    assert.equal(parsed.cat, "mobile");
    assert.equal(parsed.current, "none");
    assert.equal(parsed.exclude, undefined);
    assert.equal(parsed.mobileNeed, "5g");
    const inquiry = inquiryFromAiParse(parsed);
    assert.equal(inquiry.currentProvider, "新號碼");
    const text = portInQuoteFromInquiry(inquiry, { name: "5G 無限", monthlyFee: 98 });
    assert.match(text, /現時電訊商：新號碼 \(新號碼\)/);
    assert.match(text, /篩選方式：AI 智能推薦/);
  });
});
