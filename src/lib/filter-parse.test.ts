import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  inquiryFromAiParse,
  mergeFilterParse,
  parseFilterState,
  plansSearchFromAiParse,
  retrievePlansForAsk,
  shouldHoldForIntake,
} from "./ai-desk.ts";
import { compactSearch } from "./search.ts";
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

  it("holds plan cards until current carrier and expiry are known, then writes the same /plans search", () => {
    const first = parseFilterState({ message: "太古城 1000M 光纖" });
    assert.equal(first.estate, "太古城");
    assert.equal(first.current, undefined);
    assert.equal(shouldHoldForIntake("太古城 1000M 光纖", first), true);
    const afterCurrent = mergeFilterParse(
      parseFilterState({ message: "香港寬頻", looseCurrent: true }),
      inquiryFromAiParse(first),
      first,
    );
    assert.equal(afterCurrent.current, "hkbn");
    assert.equal(afterCurrent.estate, "太古城");
    assert.equal(afterCurrent.speed, 1000);
    assert.equal(shouldHoldForIntake("香港寬頻", afterCurrent), true);
    const complete = mergeFilterParse(
      parseFilterState({ message: "下個月到期" }),
      inquiryFromAiParse(afterCurrent),
      afterCurrent,
    );
    assert.equal(complete.current, "hkbn");
    assert.equal(complete.expiry, "1m");
    assert.equal(shouldHoldForIntake("下個月到期", complete), false);
    const search = compactSearch(plansSearchFromAiParse(complete));
    assert.equal(search.cat, "broadband");
    assert.equal(search.estate, "太古城");
    assert.equal(search.exclude, "hkbn");
    assert.equal(search.expiry, "1m");
    assert.equal(search.minSpeed, 1000);
  });

  it("does not block FAQ chips that are not a port-in filter", () => {
    const parsed = parseFilterState({ message: "村屋有冇光纖？" });
    assert.equal(shouldHoldForIntake("村屋有冇光纖？", parsed), false);
  });
});
