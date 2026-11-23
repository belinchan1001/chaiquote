import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ASK_ADDRESS,
  BUDGET_NO_ADDRESS,
  BUDGET_WITH_ADDRESS,
  CS_HREF,
  CS_LABEL,
  DISCLAIMER,
  HOUSING_CHIPS,
  INSTALL_ASK,
  NEW_INTAKE,
  NEW_INTAKE_HERE,
  OFF_TOPIC,
  OPENING,
  PORT_IN,
  PRODUCT_NAME,
  REMEMBER,
  SKIP_LINE,
  SPEED_ASK,
  UNMATCHED,
  VILLAGE,
  confirmHousing,
  resultsIntro,
} from "./ai-quote-copy.ts";
import {
  applyUserMessage,
  createQuoteSession,
  openingTurn,
  placeholderFor,
  speedChipLabels,
  suggestionChips,
  type QuoteSession,
} from "./ai-quote.ts";
import { FIBRE_SPEEDS } from "./port-in.ts";
import { getPlan } from "./plans.ts";

const here = dirname(fileURLToPath(import.meta.url));

const BANNED = /最平|最抵|最佳|最真實|低至|構想示例|AI 篩選|查參考月費|\/plans|\/spend|\/go\/|218|378|680|HK\$/;

function say(session: QuoteSession, text: string) {
  const result = applyUserMessage(session, text);
  return result;
}

function texts(turns: { text: string }[]) {
  return turns.map((turn) => turn.text).join("\n");
}

describe("齊Quote AI locked conversation", () => {
  it("uses the locked opening, product name, and off-topic handoff", () => {
    assert.equal(PRODUCT_NAME, "齊Quote AI (測試版)");
    assert.equal(OPENING, "輸入申請地址，即刻對照站內參考月費。");
    assert.equal(DISCLAIMER, "只供參考，以電訊商確認為準。");
    assert.equal(OFF_TOPIC, "我只能回覆電訊相關問題，如有其他查詢可直接聯絡齊Quote客服。");
    assert.equal(CS_LABEL, "聯絡齊Quote客服");
    assert.equal(CS_HREF, "https://wa.me/85263099966");
    assert.equal(CS_HREF.includes("?"), false);
    assert.equal(OFF_TOPIC.includes("6309"), false);
    assert.equal(OFF_TOPIC.includes("852"), false);
    const opening = openingTurn();
    assert.equal(opening.text, OPENING);
    assert.equal(opening.disclaimer, true);
    assert.equal(placeholderFor(createQuoteSession()), "屋苑名或申請地址");
  });

  it("walks a matched address through housing, speed, install, and stacked references", () => {
    let session = createQuoteSession();
    const matched = say(session, "太古城");
    session = matched.session;
    assert.equal(matched.turns[0]?.text, confirmHousing("私人樓"));
    assert.deepEqual(suggestionChips(session).map((chip) => chip.label), [...HOUSING_CHIPS]);
    assert.equal(placeholderFor(session), "可以再講預算、網速或者轉台");
    assert.doesNotMatch(texts(matched.turns), /HK\$|構想示例/);

    const speed = say(session, "啱，而家用緊網上行");
    session = speed.session;
    assert.equal(speed.turns[0]?.text, REMEMBER);
    assert.equal(speed.turns[1]?.text, SPEED_ASK);
    assert.deepEqual(suggestionChips(session).map((chip) => chip.label), speedChipLabels());
    assert.deepEqual(speedChipLabels(), FIBRE_SPEEDS.map((row) => row.label));
    assert.equal(suggestionChips(session).some((chip) => chip.label === "公屋"), false);

    const install = say(session, "未定");
    session = install.session;
    assert.deepEqual(install.turns.map((turn) => turn.text), [INSTALL_ASK]);
    assert.equal(suggestionChips(session).length, 0);
    assert.doesNotMatch(texts(install.turns), /未定都冇問題/);

    const results = say(session, "未定");
    session = results.session;
    assert.equal(session.phase, "results");
    assert.equal(suggestionChips(session).length, 0);
    const intro = results.turns[0];
    assert.equal(intro?.text, resultsIntro(intro?.planIds?.length ?? 0, true));
    assert.match(intro?.text ?? "", /已剔除你而家呢間營辦商/);
    assert.ok((intro?.planIds?.length ?? 0) >= 2 && (intro?.planIds?.length ?? 0) <= 3);
    for (const id of intro?.planIds ?? []) {
      const plan = getPlan(id);
      assert.ok(plan, id);
      assert.notEqual(plan?.providerId, "netvigator");
    }
    assert.doesNotMatch(intro?.text ?? "", BANNED);
  });

  it("confirms housing once and does not repeat the bubble", () => {
    const matched = say(createQuoteSession(), "太古城");
    assert.equal(matched.turns[0]?.text, confirmHousing("私人樓"));
    assert.deepEqual(suggestionChips(matched.session).map((chip) => chip.label), [...HOUSING_CHIPS]);

    const chip = say(matched.session, "私人樓");
    assert.equal(chip.turns.at(-1)?.text, SPEED_ASK);
    assert.equal(chip.turns.some((turn) => turn.text.startsWith("站內按")), false);
    assert.equal(suggestionChips(chip.session).some((item) => item.label === "公屋"), false);
    assert.equal(suggestionChips(chip.session).some((item) => item.label === "私人樓"), false);

    const again = say(chip.session, "私人樓");
    assert.equal(again.turns.some((turn) => turn.text.startsWith("站內按")), false);
    assert.notEqual(again.session.phase, "confirm-housing");

    for (const answer of ["正確", "啱", "係", "啱呀"]) {
      const next = say(matched.session, answer);
      assert.equal(next.turns.at(-1)?.text, SPEED_ASK, answer);
      assert.equal(next.turns.some((turn) => turn.text.startsWith("站內按")), false, answer);
      assert.equal(suggestionChips(next.session).some((item) => HOUSING_CHIPS.includes(item.label as (typeof HOUSING_CHIPS)[number])), false, answer);
    }

    const named = say(matched.session, "正確，而家用緊網上行");
    assert.equal(named.turns[0]?.text, REMEMBER);
    assert.equal(named.turns.at(-1)?.text, SPEED_ASK);
    const install = say(named.session, "未定");
    const results = say(install.session, "未定");
    assert.match(results.turns.at(-1)?.text ?? "", /已剔除你而家呢間營辦商/);
  });

  it("asks housing without prices when the street is not an estate", () => {
    const result = say(createQuoteSession(), "觀塘巧明街 9 號");
    assert.equal(result.turns[0]?.text, UNMATCHED);
    assert.equal(result.session.phase, "ask-housing");
    assert.deepEqual(suggestionChips(result.session).map((chip) => chip.label), [...HOUSING_CHIPS]);
    assert.equal(result.turns[0]?.planIds, undefined);
    assert.doesNotMatch(result.turns[0]?.text ?? "", /HK\$|已剔除|218|378|680/);

    const speed = say(result.session, "私人樓");
    assert.equal(speed.turns.at(-1)?.text, SPEED_ASK);
    assert.equal(speed.turns.some((turn) => /已剔除/.test(turn.text)), false);
  });

  it("keeps 嘉湖山莊 on 私人樓 and refuses the rumor with the CS handoff", () => {
    const estate = say(createQuoteSession(), "嘉湖山莊");
    assert.equal(estate.turns[0]?.text, confirmHousing("私人樓"));
    assert.doesNotMatch(estate.turns[0]?.text ?? "", /村屋/);

    const rumor = say(createQuoteSession(), "聽聞下個月寬頻會加價，係咪真？");
    assert.equal(rumor.turns.length, 1);
    assert.equal(rumor.turns[0]?.text, OFF_TOPIC);
    assert.equal(rumor.turns[0]?.cs, true);
    assert.equal(rumor.session.phase, "need-address");
    assert.equal(placeholderFor(rumor.session), "屋苑名或申請地址");
    assert.equal(suggestionChips(rumor.session).length, 0);
  });

  it("uses referral lines for budget, port-in, new intake, and village", () => {
    const budget = say(createQuoteSession(), "預算 100");
    assert.equal(budget.turns[0]?.text, BUDGET_NO_ADDRESS);
    assert.notEqual(budget.turns[0]?.text, OFF_TOPIC);

    let session = createQuoteSession();
    session = say(session, "太古城").session;
    const narrowed = say(session, "預算 150");
    assert.equal(narrowed.turns[0]?.text, BUDGET_WITH_ADDRESS);

    assert.equal(say(createQuoteSession(), "轉台點算").turns[0]?.text, PORT_IN);
    assert.equal(say(createQuoteSession(), "新入伙有冇計劃").turns[0]?.text, NEW_INTAKE);
    const village = say(createQuoteSession(), "村屋點算");
    assert.equal(village.turns[0]?.text, VILLAGE);
    assert.doesNotMatch(village.turns[0]?.text ?? "", /218|378|680/);
  });

  it("does not write 已剔除 for a new application and uses the skip line when asked to skip", () => {
    let session = say(createQuoteSession(), "太古城").session;
    session = say(session, "未有，準備新申請").session;
    assert.equal(session.phase, "ask-speed");
    session = say(session, "跳過").session;
    const last = session;
    assert.equal(last.phase, "results");
    const skipped = say(
      (() => {
        let current = say(createQuoteSession(), "太古城").session;
        current = say(current, "未有，準備新申請").session;
        return current;
      })(),
      "跳過",
    );
    assert.equal(skipped.turns[0]?.text, SKIP_LINE);
    assert.match(skipped.turns[1]?.text ?? "", /站內參考/);
    assert.doesNotMatch(texts(skipped.turns), /已剔除/);
  });

  it("asks the locked new-intake question before housing when the estate is on the list", () => {
    const result = say(createQuoteSession(), "兆翠苑");
    assert.equal(result.turns[0]?.text, NEW_INTAKE_HERE);
    assert.equal(suggestionChips(result.session).length, 0);
  });

  it("asks again when the address is blank or unclear", () => {
    const blank = say(createQuoteSession(), "？");
    assert.equal(blank.turns[0]?.text, ASK_ADDRESS);
  });

  it("keeps the CS control off the plan-card quote path", () => {
    const staff = readFileSync(join(here, "../components/ai-staff.tsx"), "utf8");
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    assert.match(staff, /CS_HREF/);
    assert.match(staff, /CS_LABEL/);
    assert.match(staff, /bareWhatsAppActivateProps/);
    assert.match(staff, /<PlanCard /);
    assert.doesNotMatch(staff, /quoteWhatsAppActivateProps/);
    assert.doesNotMatch(staff, /wa\.me\/[^"'\s]*\?/);
    assert.doesNotMatch(staff, /構想示例|開場時 icon/);
    assert.match(staff, /ai-quote-idle/);
    assert.match(card, /WhatsApp 問呢個計劃/);
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    assert.match(css, /@keyframes ai-quote-idle/);
    assert.match(css, /animation:\s*ai-quote-idle 5\.5s ease-in-out infinite/);
    assert.match(css, /translateY\(-1px\) scale\(1\.03\)/);
    assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*\.ai-quote-idle[\s\S]*animation:\s*none !important/);
  });
});
