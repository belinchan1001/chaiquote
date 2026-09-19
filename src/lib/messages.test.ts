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

  it("renames the gaming shortcut to 電競神線 and keeps 2500M+ fibre filter", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const search = readFileSync(join(here, "../components/search-panel.tsx"), "utf8");
    const [zh, en] = quoted(messages, "shortcutGaming");
    assert.equal(zh, "電競神線");
    assert.equal(en, "Esports fibre");
    assert.match(search, /esports-line-chip/);
    assert.match(search, /minSpeed:\s*2500/);
    assert.match(search, /data-armed/);
    assert.doesNotMatch(search, /高速打機首選/);
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
      "網上行／CSL 計劃，會由本站核對身份嘅香港電訊（HKT）指定授權銷售同事，用指定 WhatsApp 回覆。本站唔係官方客服。",
    );
    assert.equal(
      zhHkbn,
      "香港寬頻計劃，會由本站核對身份嘅香港寬頻（HKBN）指定授權銷售同事，用指定 WhatsApp 回覆。本站唔係官方客服。",
    );
    assert.equal(
      enHkt,
      "Netvigator / CSL plans are answered on designated WhatsApp by HKT authorised sales colleagues whose identity this site has checked. This site is not official customer service.",
    );
    assert.equal(
      enHkbn,
      "HKBN plans are answered on designated WhatsApp by HKBN authorised sales colleagues whose identity this site has checked. This site is not official customer service.",
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

  it("locks homepage category blurbs to the launch copy", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const [zhFibre, enFibre] = quoted(messages, "catFibreText");
    const [zhHome5g, enHome5g] = quoted(messages, "catHome5gText");
    const [zhMobile, enMobile] = quoted(messages, "catMobileText");
    const [zhBusiness, enBusiness] = quoted(messages, "catBusinessText");

    assert.equal(
      zhFibre,
      "家居光纖由約 1000M 起，適用樓類包括公屋／居屋／私樓／村屋；月費同安裝費以計劃卡為準。",
    );
    assert.equal(zhHome5g, "免拉線入屋，適合未有光纖或想快裝；實際速度視現場訊號。");
    assert.equal(zhMobile, "4G／5G 本地同大灣區數據計劃；攜號轉台同學生優惠另見計劃卡。");
    assert.equal(zhBusiness, "店舖／寫字樓參考月費由約 1000M 起；實際安裝同報價要向銷售確認。");

    for (const blurb of [zhFibre, zhHome5g, zhMobile, zhBusiness]) {
      assert.equal(blurb.includes("僅供參考"), false, "card blurb must not carry the footer disclaimer");
    }
    assert.match(enFibre, /about 1000M/);
    assert.match(enHome5g, /No cabling/);
    assert.match(enMobile, /Greater Bay Area/);
    assert.match(enBusiness, /1000M/);

    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    const blurb = home.slice(home.indexOf("t(item.text)"), home.indexOf("t(item.text)") + 80);
    assert.match(home, /t\(item\.text\)/);
    assert.doesNotMatch(blurb, /line-clamp/);
    assert.doesNotMatch(home, /line-clamp-3/);
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

  it("pins the estates nav label as 屋苑索引 / Estate index", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
    const [zh, en] = quoted(messages, "navEstates");

    assert.equal(zh, "屋苑索引");
    assert.equal(en, "Estate index");
    assert.match(header, /to: "\/estates", labelKey: "navEstates"/);
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

describe("homepage hero title", () => {
  it("keeps a one-line 搵寬頻唔使四圍問 title with no joining comma or second sentence", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    assert.equal(quoted(messages, "heroTitle1")[0], "搵寬頻唔使四圍問");
    assert.equal(quoted(messages, "heroTitle1")[1], "Stop shopping around for broadband");
    assert.equal(quoted(messages, "heroLead")[0], "輸入你住邊，即刻比較各大電訊商而家嘅月費同優惠。");
    assert.match(home, /t\("heroTitle1"\)/);
    assert.match(home, /t\("heroLead"/);
    assert.doesNotMatch(home, /heroTitle2/);
    assert.doesNotMatch(quoted(messages, "heroTitle1")[0], /，|。/);
    assert.doesNotMatch(messages, /heroTitle2:/);
  });
});

describe("date stamps", () => {
  it("pins homepage 資料更新 YYYY-MM-DD and split 稿件日期 / 資料更新 labels", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    assert.equal(quoted(messages, "hkUpdated")[0], "香港 · 資料更新 {date}");
    assert.equal(
      quoted(messages, "headerStrip")[0],
      "資料更新：{date}　｜　本站無向電訊商收取佣金或廣告費；列出月費僅供參考，以電訊商確認為準。",
    );
    const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
    assert.match(header, /t\("headerStrip", \{ date: updated \}\)/);
    assert.match(header, /text-fg/);
    assert.doesNotMatch(header, /headerStrip[\s\S]*text-subtle/);
    assert.doesNotMatch(home, /t\("hkUpdated"/);
    assert.doesNotMatch(home, /headerStrip/);
    assert.equal(quoted(messages, "dataUpdated")[0], "資料更新 {date}");
    assert.equal(quoted(messages, "manuscriptDate")[0], "稿件日期 {date}");
    assert.equal(quoted(messages, "manuscriptUpdated")[0], "稿件日期 {published} · 更新 {modified}");
    assert.equal(quoted(messages, "hkUpdated")[1], "Hong Kong · Updated {date}");
    assert.equal(quoted(messages, "dataUpdated")[1], "Data updated {date}");
    assert.equal(quoted(messages, "manuscriptDate")[1], "Published {date}");
    assert.doesNotMatch(quoted(messages, "hkUpdated")[0], /年|月|日/);
  });
});

describe("i18n catalogue and error chrome", () => {
  it("keeps both zh and en tables so EN UI cannot crash on missing MESSAGES.en", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    assert.match(messages, /export type MessageKey = keyof \(typeof MESSAGES\)\["zh"\]/);
    assert.equal(quoted(messages, "heroTitle1")[0], "搵寬頻唔使四圍問");
    assert.equal(quoted(messages, "heroTitle1")[1], "Stop shopping around for broadband");
    assert.equal(quoted(messages, "errorTitle")[0], "呢頁暫時出咗問題");
    assert.match(quoted(messages, "errorTitle")[1] ?? "", /This page .+ working right now/);
    assert.equal(quoted(messages, "notFound")[0], "搵唔到呢頁");
    assert.equal(quoted(messages, "searchPopularLabel")[1], "Popular: ");
    assert.match(messages, /\ben:\s*\{/);
    assert.doesNotMatch(messages, /useI18n must be used within I18nProvider/);
  });

  it("wraps root 404 and default error chrome in I18nProvider", () => {
    const root = readFileSync(join(here, "../routes/__root.tsx"), "utf8");
    const error = readFileSync(join(here, "error-component.tsx"), "utf8");
    const i18n = readFileSync(join(here, "i18n.tsx"), "utf8");
    assert.match(root, /errorComponent: AppErrorComponent/);
    assert.match(root, /function NotFound\(\) \{[\s\S]*<I18nProvider>[\s\S]*<NotFoundInner \/>/);
    assert.match(error, /<I18nProvider>[\s\S]*<AppErrorInner/);
    assert.match(i18n, /FALLBACK_I18N/);
    assert.doesNotMatch(i18n, /throw new Error\("useI18n must be used within I18nProvider"\)/);
  });
});
