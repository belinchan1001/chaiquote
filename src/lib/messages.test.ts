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
      "網上行／CSL 計劃經本站核對身份嘅香港電訊 HKT 同事，用指定 WhatsApp 回覆。回覆嘅係該香港電訊 HKT 指定授權銷售同事；本站不是官方客服。",
    );
    assert.equal(
      zhHkbn,
      "香港寬頻計劃經本站核對身份嘅香港寬頻 HKBN 同事，用指定 WhatsApp 回覆。回覆嘅係該香港寬頻 HKBN 指定授權銷售同事；本站不是官方客服。",
    );
    assert.equal(
      enHkt,
      "Netvigator / CSL plans are answered via designated WhatsApp by HKT colleagues whose identity was checked by this site. Replies are from that HKT designated authorized sales colleague; this site is not official customer service.",
    );
    assert.equal(
      enHkbn,
      "HKBN plans are answered via designated WhatsApp by HKBN colleagues whose identity was checked by this site. Replies are from that HKBN designated authorized sales colleague; this site is not official customer service.",
    );

    for (const text of [zhHkt, zhHkbn, enHkt, enHkbn]) {
      assert.equal(text.includes("正式認證"), false, "old certified claim remains");
      assert.equal(text.includes("正式認證員工"), false, "old certified-staff claim remains");
      assert.equal(text.includes("官方認證"), false, "official-certification claim remains");
      assert.equal(text.includes("官方客服熱線"), false, "hotline wording remains");
      assert.doesNotMatch(text, /certified|officially certified|official certification|hotline/i);
    }

    assert.match(note, /from "lucide-react"/);
    assert.match(note, /<Check /);
    assert.match(note, /rounded-full bg-primary/);
    assert.match(note, /t\(key\)/);
    assert.doesNotMatch(note, /businessDisclaimer/);
  });

  it("locks the business broadband disclaimer, separate from staff-note copy", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const plans = readFileSync(join(here, "../routes/plans.tsx"), "utf8");
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const detail = readFileSync(join(here, "../routes/plans_.$planId.tsx"), "utf8");
    const note = readFileSync(join(here, "../components/certified-staff-note.tsx"), "utf8");
    const [zh, en] = quoted(messages, "businessDisclaimer");
    const [zhHkt, enHkt] = quoted(messages, "hktStaffNote");
    const [zhHkbn, enHkbn] = quoted(messages, "hkbnStaffNote");

    assert.equal(
      zh,
      "商業寬頻嘅月費、安裝費同舖址覆蓋僅供參考；實際視乎用途同現場環境，以電訊商確認為準。",
    );
    assert.equal(
      en,
      "Business fibre fees, install charges and shop coverage are for reference only. Actual terms depend on use and the site, and are confirmed by the carrier.",
    );

    for (const word of ["最抵", "保證"]) {
      assert.equal(zh.includes(word), false, `disclaimer still claims ${word}`);
    }
    assert.doesNotMatch(en, /best-value|guaranteed|cheapest|lowest/i);

    assert.match(plans, /search\.cat === "business"/);
    assert.match(plans, /t\("businessDisclaimer"\)/);
    assert.match(card, /plan\.category === "business"/);
    assert.match(card, /t\("businessDisclaimer"\)/);
    assert.match(detail, /plan\.category === "business"/);
    assert.match(detail, /t\("businessDisclaimer"\)/);
    assert.doesNotMatch(note, /businessDisclaimer/);

    for (const staff of [zhHkt, enHkt, zhHkbn, enHkbn]) {
      assert.equal(staff.includes(zh), false);
      assert.equal(staff.includes(en), false);
    }

    const staffThenDisclaimer =
      /CertifiedStaffNote[\s\S]*plan\.category === "business"[\s\S]*t\("businessDisclaimer"\)[\s\S]*t\("referencePrice"\)/;
    assert.match(card, staffThenDisclaimer);
    assert.match(detail, staffThenDisclaimer);
  });

  it("pins homepage 或睇攻略文章 under 去格價 and the four guide hubs", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    const [zh, en] = quoted(messages, "orReadGuide");
    const [zhCompare, enCompare] = quoted(messages, "goCompare");

    assert.equal(zh, "或睇攻略文章");
    assert.equal(en, "Or read the guide");
    assert.equal(zhCompare, "去格價");
    assert.equal(enCompare, "Compare plans");
    for (const word of ["最抵", "必讀", "必看", "最平"]) {
      assert.equal(zh.includes(word), false, `orReadGuide still claims ${word}`);
    }
    assert.doesNotMatch(en, /must-read|best-value|cheapest/i);

    assert.match(home, /to="\/plans"[\s\S]*search=\{\{ cat: item\.planCat \}\}[\s\S]*t\("goCompare"\)/);
    assert.match(
      home,
      /t\("goCompare"\)[\s\S]*to="\/guides\/\$slug"[\s\S]*params=\{\{ slug: item\.slug \}\}[\s\S]*t\("orReadGuide"\)/,
    );

    const destinations = [
      ["fiber", "broadband"],
      ["home5g", "home5g"],
      ["mobile", "mobile"],
      ["business", "business"],
    ] as const;
    for (const [slug, planCat] of destinations) {
      assert.match(home, new RegExp(`slug: "${slug}"[\\s\\S]*planCat: "${planCat}"`));
    }
  });

  it("pins compare page 返回計劃表 as an in-app /plans link", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const compare = readFileSync(join(here, "../routes/compare.tsx"), "utf8");
    const [zh, en] = quoted(messages, "backToPlans");

    assert.equal(zh, "返回計劃表");
    assert.equal(en, "Back to plans");
    assert.match(compare, /to="\/plans"/);
    assert.match(compare, /search=\{plansSearch\}/);
    assert.match(compare, /cat: "broadband"/);
    assert.match(compare, /plan\.category/);
    assert.doesNotMatch(compare, /history\.back|navigate\(-1\)/);
    assert.equal((compare.match(/t\("backToPlans"\)/g) ?? []).length, 3);
  });
});
