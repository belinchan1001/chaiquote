import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CLAIM_WORDS = ["最抵", "最低", "最平"] as const;
const EN_CLAIM = /best-value|cheapest|best price|lowest monthly fee/i;

function quoted(src: string, key: string): string[] {
  return [...src.matchAll(new RegExp(`${key}:\\s*"([^"]*)"`, "g"))].map((match) => match[1]);
}

describe("trust/compliance copy", () => {
  it("locks featured-plan title, lead, and the no-commission sentence", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const [zhTitle, enTitle] = quoted(messages, "bestPicksTitle");
    const [zhLead, enLead] = quoted(messages, "bestPicksLead");
    const [zhCommission, enCommission] = quoted(messages, "noCommission");

    assert.equal(zhTitle, "齊Quote 精選計劃");
    assert.equal(
      zhLead,
      "每個服務類型，由本站現有參考計劃入面揀月費較低嘅一條；唔代表全港最平，實際以電訊商確認為準。",
    );
    assert.equal(
      zhCommission,
      "本網站並沒有向任何電訊商收取佣金或廣告費。所列月費僅供參考，實際以電訊商確認為準。",
    );
    assert.equal(enTitle, "ChaiQuote featured reference plans");
    assert.equal(
      enCommission,
      "We do not receive commission or advertising fees from any carrier. Fees are for reference only; the carrier confirms the final terms.",
    );

    for (const word of CLAIM_WORDS) {
      assert.equal(zhTitle.includes(word), false, `title still claims ${word}`);
    }
    const leadWithoutNegation = zhLead.replace("唔代表全港最平", "");
    for (const word of CLAIM_WORDS) {
      assert.equal(leadWithoutNegation.includes(word), false, `lead still claims ${word}`);
    }

    assert.match(enLead, /lower monthly fee/);
    assert.match(enLead, /current reference plans/);
    assert.match(enLead, /not a claim that these are Hong Kong/);
    assert.match(enLead, /carrier confirms the final terms/);
    assert.doesNotMatch(enTitle, EN_CLAIM);
    assert.doesNotMatch(enTitle, /lowest|cheapest|best-value|best price/i);
    assert.doesNotMatch(enLead, EN_CLAIM);
  });

  it("shows the no-commission line on about and in the footer", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
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
    assert.equal(quoted(messages, "quotePick")[0], "齊Quote 推介");
    assert.equal(quoted(messages, "quotePick")[1], "齊Quote pick");
  });

  it("locks certified-staff notes: identity check, not official certification", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const note = readFileSync(join(here, "../components/certified-staff-note.tsx"), "utf8");
    const [zhHkt, enHkt] = quoted(messages, "hktStaffNote");
    const [zhHkbn, enHkbn] = quoted(messages, "hkbnStaffNote");

    assert.equal(
      zhHkt,
      "網上行／CSL 計劃經本站核對身份嘅電訊商同事，用指定 WhatsApp 回覆。回覆嘅係該電訊商指定授權銷售同事；本站不是官方客服。",
    );
    assert.equal(
      zhHkbn,
      "香港寬頻計劃經本站核對身份嘅電訊商同事，用指定 WhatsApp 回覆。回覆嘅係該電訊商指定授權銷售同事；本站不是官方客服。",
    );
    assert.equal(
      enHkt,
      "Netvigator / CSL plans are answered via the designated WhatsApp by carrier colleagues whose identity was checked by this site. Replies come from that carrier’s designated authorized sales colleagues; this site is not official customer service.",
    );
    assert.equal(
      enHkbn,
      "HKBN plans are answered via the designated WhatsApp by carrier colleagues whose identity was checked by this site. Replies come from that carrier’s designated authorized sales colleagues; this site is not official customer service.",
    );

    for (const text of [zhHkt, zhHkbn, enHkt, enHkbn]) {
      assert.equal(text.includes("正式認證員工"), false, "old certified-staff claim remains");
      assert.equal(text.includes("官方認證"), false, "official-certification claim remains");
      assert.equal(text.includes("官方客服熱線"), false, "hotline wording remains");
      assert.doesNotMatch(text, /certified|officially certified|official certification|hotline/i);
    }

    assert.match(note, /from "lucide-react"/);
    assert.match(note, /<Check /);
    assert.match(note, /rounded-full bg-primary/);
    assert.match(note, /t\(key\)/);
  });
});
