import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MESSAGES } from "./messages.ts";

const here = dirname(fileURLToPath(import.meta.url));
const CLAIM_WORDS = ["最抵", "最低", "最平"] as const;
const EN_CLAIM = /best-value|cheapest|best price|lowest monthly fee/i;

describe("trust/compliance copy", () => {
  it("locks featured-plan title, lead, and the no-commission sentence", () => {
    assert.equal(MESSAGES.zh.bestPicksTitle, "齊Quote 精選計劃");
    assert.equal(
      MESSAGES.zh.bestPicksLead,
      "每個服務類型，由本站現有參考計劃入面揀月費較低嘅一條；唔代表全港最平，實際以電訊商確認為準。",
    );
    assert.equal(
      MESSAGES.zh.noCommission,
      "本網站並沒有向任何電訊商收取佣金或廣告費。所列月費僅供參考，實際以電訊商確認為準。",
    );
    assert.equal(MESSAGES.en.bestPicksTitle, "ChaiQuote featured reference plans");
    assert.equal(
      MESSAGES.en.noCommission,
      "We do not receive commission or advertising fees from any carrier. Fees are for reference only; the carrier confirms the final terms.",
    );

    for (const word of CLAIM_WORDS) {
      assert.equal(MESSAGES.zh.bestPicksTitle.includes(word), false, `title still claims ${word}`);
    }
    const leadWithoutNegation = MESSAGES.zh.bestPicksLead.replace("唔代表全港最平", "");
    for (const word of CLAIM_WORDS) {
      assert.equal(leadWithoutNegation.includes(word), false, `lead still claims ${word}`);
    }
    assert.match(MESSAGES.en.bestPicksLead, /lower monthly fee/);
    assert.match(MESSAGES.en.bestPicksLead, /current reference plans/);
    assert.match(MESSAGES.en.bestPicksLead, /not a claim that these are Hong Kong/);
    assert.match(MESSAGES.en.bestPicksLead, /carrier confirms the final terms/);
    assert.doesNotMatch(MESSAGES.en.bestPicksTitle, EN_CLAIM);
    assert.doesNotMatch(MESSAGES.en.bestPicksLead, EN_CLAIM);
    assert.doesNotMatch(MESSAGES.en.bestPicksTitle, /lowest|cheapest|best-value|best price/i);
  });

  it("shows the no-commission line on about and in the footer", () => {
    const about = readFileSync(join(here, "../routes/about.tsx"), "utf8");
    const footer = readFileSync(join(here, "../components/site-footer.tsx"), "utf8");
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    assert.match(about, /t\("aboutIndependent"\)/);
    assert.match(about, /t\("noCommission"\)/);
    assert.match(about, /t\("aboutDisclaimer"\)/);
    assert.match(footer, /t\("noCommission"\)/);
    assert.match(footer, /t\("disclaimer1"\)/);
    assert.match(home, /cheapestPlan\("broadband"\)/);
    assert.match(home, /t\("bestPicksTitle"\)/);
    assert.match(home, /t\("bestPicksLead"\)/);
    assert.equal(MESSAGES.zh.quotePick, "齊Quote 推介");
    assert.equal(MESSAGES.en.quotePick, "齊Quote pick");
  });
});
