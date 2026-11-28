import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MESSAGES } from "./messages.ts";
import { ESTATE_COUNT } from "./estate-count.ts";
import { PLAN_COUNT, PROVIDER_COUNT } from "./plan-count.ts";
import { FEE_RANGE_QUESTION, HOME_CONTENT_DATE, INDEPENDENT_FAQ_DATE, PRIVACY_UPDATED, fillSiteTemplate, INDEPENDENT_BODY, SITE, siteFaq } from "./site.ts";
import { ABOUT_SEO, aboutJsonLd, homeJsonLd } from "./canonical.ts";
import { formatFee, getPlan } from "./plans.ts";
import { filterPlans } from "./plan-filter.ts";

const here = dirname(fileURLToPath(import.meta.url));
const CLAIM_WORDS = ["最抵", "最低", "最平"] as const;
const EN_CLAIM = /best-value|cheapest|best price|lowest monthly fee/i;

function quoted(src: string, key: string): string[] {
  return [...src.matchAll(new RegExp(`${key}:\\s*"([^"]*)"`, "g"))].map((match) => match[1]);
}

describe("trust/compliance copy", () => {
  it("locks featured-plan title and lead, and keeps the absolute commission key off the catalogue", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const [zhTitle, enTitle] = quoted(messages, "bestPicksTitle");
    const [zhLead, enLead] = quoted(messages, "bestPicksLead");

    assert.equal(zhTitle, "齊Quote 精選計劃");
    assert.equal(
      zhLead,
      "每個服務類型，由本站現有參考計劃入面揀月費較低嘅一條；唔代表全港最平，實際以電訊商確認為準。",
    );
    assert.equal(quoted(messages, "noCommission").length, 0);
    assert.doesNotMatch(
      messages,
      /無向電訊商收取佣金或廣告費|並沒有向任何電訊商收取佣金|無佣金|零佣金|does not take commission|do not receive commission|No commission|advertising fees/,
    );
    assert.equal(enTitle, "ChaiQuote featured reference plans");

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

  it("shows the approved independence disclosure on about and in the footer", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const about = readFileSync(join(here, "../routes/about.tsx"), "utf8");
    const footer = readFileSync(join(here, "../components/site-footer.tsx"), "utf8");
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    const picks = readFileSync(join(here, "../components/home-best-picks.tsx"), "utf8");
    const aboutBody =
      "齊Quote（chaiquote.hk）係香港獨立比較網站，唔係電訊商官網或附屬機構。我哋用公開市場資料，按同一標準整理家居寬頻、5G 家居、流動通訊同商業寬頻計劃，方便你自己比較、自己揀計劃。經本站查詢或轉介申請唔會另收費；營運方或會就部分轉介獲得報酬，詳見頁尾。";
    assert.match(about, new RegExp(aboutBody.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal(quoted(messages, "aboutWhoText")[0], aboutBody);
    assert.equal(
      quoted(messages, "aboutWhoText")[1],
      "ChaiQuote (chaiquote.hk) is an independent Hong Kong comparison site, not a carrier official website or subsidiary. We compile home broadband, 5G home, mobile and business plans from public market information to the same standard, so you can compare and choose a plan yourself. Enquiries or referred applications through this site do not carry a separate fee; the operator may receive remuneration for some referrals — see the footer.",
    );
    assert.doesNotMatch(quoted(messages, "aboutWhoText")[1] ?? "", /\baffiliate\b/i);
    assert.equal(
      quoted(messages, "footerNotice")[0],
      "齊Quote 係獨立比較站，唔係電訊商官網、附屬機構或官方客服；用公開市場資料按同一標準整理，經本站查詢或轉介申請唔會另收費，營運方或會就部分轉介獲得報酬。所列月費、覆蓋同條款僅供參考，一律以電訊商公佈及你同電訊商簽署嘅合約為準。",
    );
    assert.equal(
      quoted(messages, "footerNotice")[1],
      "ChaiQuote is an independent comparison site, not a carrier official website, subsidiary or official customer service; it compiles public market information to the same standard. Enquiries or referred applications through this site do not carry a separate fee; the operator may receive remuneration for some referrals. Listed monthly fees, coverage and terms are for reference only, and the carrier’s published terms and the contract you sign with the carrier are final.",
    );
    assert.doesNotMatch(quoted(messages, "footerNotice").join("\n"), /\baffiliate\b|commission|廣告費|佣金/i);
    assert.equal(quoted(messages, "disclaimer3")[0], "各電訊商名稱及標誌為其商標，僅供識別所比較之計劃。");
    assert.doesNotMatch(about, /佣金|廣告費|commission/);
    assert.match(about, /https:\/\/wa\.me\/\$\{SITE\.whatsappE164\}/);
    assert.doesNotMatch(about, /t\("aboutIndependent"\)|t\("noCommission"\)|t\("aboutDisclaimer"\)|t\("aboutProviders"\)/);
    assert.doesNotMatch(about, /間電訊商|個參考計劃|個屋苑|資料更新|轉台獨家優惠|排版備註|\/brand|QuoteLink|61118499/);
    assert.match(footer, /t\("footerNotice"\)/);
    assert.match(footer, /t\("disclaimer3"\)/);
    assert.doesNotMatch(footer, /t\("noCommission"\)|t\("referencePrice"\)|t\("disclaimer1"\)|t\("disclaimer2"\)/);
    assert.match(home, /HomeBestPicks/);
    assert.match(picks, /cheapestPlan\("broadband"\)/);
    assert.match(picks, /t\("bestPicksTitle"\)/);
    assert.match(picks, /t\("bestPicksLead"\)/);
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
    assert.match(detail, /<PlanCard plan=\{plan\}/);
    assert.doesNotMatch(note, /businessDisclaimer/);

    for (const staff of [zhHkt, enHkt, zhHkbn, enHkbn]) {
      assert.equal(staff.includes(zh), false);
      assert.equal(staff.includes(en), false);
    }

    const staffThenDisclaimer =
      /CertifiedStaffNote[\s\S]*plan\.category === "business"[\s\S]*t\("businessDisclaimer"\)[\s\S]*t\("referencePrice"\)/;
    assert.match(card, staffThenDisclaimer);
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
    assert.match(header, /to: "\/estates", label: t\("navEstates"\)/);
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
    assert.match(home, /t\("heroAnswer"/);
    assert.doesNotMatch(home, /entry-prices|ENTRY_PLAN_LINKS/);
    const titleAt = home.indexOf('t("heroTitle1")');
    const leadAt = home.indexOf('t("heroLead")');
    const answerAt = home.indexOf('t("heroAnswer"');
    assert.ok(titleAt > 0 && titleAt < leadAt && leadAt < answerAt);
    assert.doesNotMatch(home.slice(titleAt, leadAt), /heroAnswer|HK\$58|佣金/);
    assert.match(home, /providers: HOME_PROVIDER_COUNT/);
    assert.match(home, /plans: PLAN_COUNT/);
    assert.match(home, /estates: ESTATE_COUNT/);
    assert.match(home, /HomeBestPicks/);
    const answer = quoted(messages, "heroAnswer")[0] ?? "";
    assert.equal(answer.includes("189"), false);
    assert.equal(answer.includes("3729"), false);
    assert.match(answer, /HK\$58/);
    assert.match(answer, /HK\$88/);
    assert.match(answer, /HK\$38/);
    assert.match(answer, /HK\$218/);
    assert.match(answer, /唔代表全港最平/);
    assert.equal(answer.includes("佣金"), false);
    assert.equal(answer.includes("廣告費"), false);
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
    assert.equal(quoted(messages, "headerStrip")[0], "資料更新：{date}");
    assert.equal(quoted(messages, "headerStrip")[1], "Data updated: {date}");
    const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
    assert.match(header, /t\("headerStrip", \{ date: updated \}\)/);
    assert.match(header, /text-fg/);
    assert.doesNotMatch(header, /headerStrip[\s\S]*text-subtle/);
    assert.doesNotMatch(home, /t\("hkUpdated"/);
    assert.doesNotMatch(home, /headerStrip/);
    const i18n = readFileSync(join(here, "i18n.tsx"), "utf8");
    assert.match(i18n, /get updated\(\) \{\s*return SITE\.updated;\s*\}/);
    assert.doesNotMatch(i18n, /contentLastmod\(/);
    const hero = home.slice(home.indexOf('t("heroAnswer"'), home.indexOf('t("faqTitle")'));
    const faq = home.slice(home.indexOf('t("faqTitle")'));
    assert.match(hero, /date: updated/);
    assert.match(faq, /date: HOME_CONTENT_DATE/);
    assert.doesNotMatch(faq, /date: updated/);
    assert.equal(quoted(messages, "dataUpdated")[0], "資料更新 {date}");
    assert.equal(quoted(messages, "manuscriptDate")[0], "稿件日期 {date}");
    assert.equal(quoted(messages, "manuscriptUpdated")[0], "稿件日期 {published} · 更新 {modified}");
    assert.equal(quoted(messages, "hkUpdated")[1], "Hong Kong · Updated {date}");
    assert.equal(quoted(messages, "dataUpdated")[1], "Data updated {date}");
    assert.equal(quoted(messages, "manuscriptDate")[1], "Published {date}");
    assert.doesNotMatch(quoted(messages, "hkUpdated")[0], /年|月|日/);
  });
});

describe("privacy Android app section", () => {
  it("inserts the approved written Chinese before the updates section", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const privacy = readFileSync(join(here, "../routes/privacy.tsx"), "utf8");
    assert.equal(quoted(messages, "privacyAndroid")[0], "Android 應用程式");
    assert.equal(
      quoted(messages, "privacyAndroidP1")[0],
      "齊Quote 亦提供 Android 應用程式（Google Play）。該應用程式以網頁殼方式開啟本網站（chaiquote.hk），功能與網站一致，並非另行收集另一套個人資料。",
    );
    assert.equal(
      quoted(messages, "privacyAndroidP2")[0],
      "透過應用程式使用本服務時，適用本私隱政策全部條文。應用程式本身不會額外要求通訊錄、相機、位置等與查詢無關的權限；若日後有變更，會先更新本頁並於應用程式商店說明。",
    );
    assert.equal(
      quoted(messages, "privacyAndroidP3")[0],
      "應用程式沿用網站同一套 Cookie／本機儲存及分析設定，並非另開追蹤。應用程式內的瀏覽技術資料、廣告識別相關處理（如有），以及你透過「留低電話」或 WhatsApp 提交的資料，處理目的、保存及權利與網站相同。查閱或改正個人資料，聯絡方式同上。",
    );
    assert.equal(
      quoted(messages, "privacyUpdateText")[0].replaceAll("{date}", PRIVACY_UPDATED),
      "政策或會更新；重大改動喺本頁公布。最後更新日期：2026-11-14。",
    );
    assert.equal(quoted(messages, "privacyUpdate")[0], "更新");
    assert.match(privacy, /privacyAndroid[\s\S]*privacyUpdate/);
    assert.doesNotMatch(privacy, /privacyOverseas|overseasNote/);
    assert.match(privacy, /<QuoteLink showNumber siteNumber \/>/);
    assert.doesNotMatch(privacy, /privacyUpdate[\s\S]*privacyAndroid/);
    for (const word of ["最平", "保證", "官方"]) {
      for (const key of ["privacyAndroid", "privacyAndroidP1", "privacyAndroidP2", "privacyAndroidP3"]) {
        assert.equal(quoted(messages, key)[0].includes(word), false, `${key} contains ${word}`);
      }
    }
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

describe("homepage FAQ matches FAQPage JSON-LD", () => {
  it("keeps the zh answers identical once catalogue placeholders are filled", () => {
    const ui = [
      [MESSAGES.zh.faq1q, MESSAGES.zh.faq1a],
      [MESSAGES.zh.faq7q, MESSAGES.zh.faq7a],
      [MESSAGES.zh.faq2q, MESSAGES.zh.faq2a],
      [MESSAGES.zh.faq3q, MESSAGES.zh.faq3a],
      [MESSAGES.zh.faq4q, MESSAGES.zh.faq4a],
      [MESSAGES.zh.faq5q, MESSAGES.zh.faq5a],
      [MESSAGES.zh.faq6q, MESSAGES.zh.faq6a],
    ] as const;
    const FAQ = siteFaq();
    assert.equal(FAQ.length, ui.length);
    ui.forEach(([q, a], index) => {
      assert.equal(q, FAQ[index]?.q);
      assert.equal(fillSiteTemplate(a), FAQ[index]?.a);
      assert.equal((FAQ[index]?.a ?? "").includes("{"), false);
    });
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    assert.match(home, /faq1q[\s\S]*faq7q[\s\S]*faq2q/);
    assert.match(home, /providers: HOME_PROVIDER_COUNT/);
    assert.match(home, /estates: ESTATE_COUNT/);
    assert.match(home, /t\("heroTitle1"\)/);
    assert.match(home, /homeJsonLd\(locale\)/);
    const ld = homeJsonLd();
    const org = ld["@graph"].find((node) => node["@type"] === "Organization");
    assert.deepEqual(org?.sameAs, [
      "https://www.instagram.com/chaiquote.hk/",
      "https://www.facebook.com/p/%E9%BD%8AQuote-61594256257767/",
    ]);
    const graph = JSON.stringify(ld);
    JSON.parse(graph);
    const faqLd = ld["@graph"].find((node) => node["@type"] === "FAQPage");
    assert.equal(faqLd?.["@type"], "FAQPage");
    assert.equal(faqLd?.mainEntity.length, FAQ.length);
    for (const entity of faqLd?.mainEntity ?? []) {
      assert.equal(entity["@type"], "Question");
      assert.equal(entity.acceptedAnswer["@type"], "Answer");
      assert.equal(entity.name.length > 0, true);
      assert.equal(entity.acceptedAnswer.text.length > 0, true);
    }
    assert.equal(graph.split('"sameAs"').length - 1, 1);
    assert.equal(graph.includes("擣"), false);
    assert.equal(graph.includes("有唔有"), false);
    assert.equal(graph.includes("摶"), false);
    assert.equal(graph.includes("撲"), false);
    faqLd?.mainEntity.forEach((entity, index) => {
      assert.equal(entity.name, FAQ[index]?.q);
      assert.equal(entity.acceptedAnswer.text, FAQ[index]?.a);
    });
    const independent = FAQ[0];
    assert.match(independent?.q ?? "", /獨立/);
    assert.equal(
      independent?.a,
      `有。齊Quote（chaiquote.hk）係香港獨立比較網站，唔係電訊商官網或附屬機構，用公開市場資料整理。資料更新 ${INDEPENDENT_FAQ_DATE}，可以一次過比較 ${PROVIDER_COUNT} 間電訊商、${PLAN_COUNT} 個參考計劃同 ${ESTATE_COUNT} 個屋苑；公屋、居屋、私樓同村屋分開列。`,
    );
    assert.doesNotMatch(independent?.a ?? "", /佣金|廣告費|報酬|公開參考計劃/);
    assert.doesNotMatch(independent?.a ?? "", new RegExp(HOME_CONTENT_DATE));
    assert.doesNotMatch(independent?.a ?? "", /最終月費、覆蓋同安裝以電訊商確認為準/);
    assert.match(independent?.a ?? "", /公屋、居屋、私樓同村屋分開列。$/);
    const publicHos = FAQ.find((item) => item.q === "公屋同埋居屋價錢會唔會唔同？");
    assert.match(publicHos?.a ?? "", /約 HK\$58／月起/);
    assert.match(publicHos?.a ?? "", /問價填齊屋苑名稱。$/);
    assert.doesNotMatch(publicHos?.a ?? "", /實際以電訊商確認為準/);
    assert.doesNotMatch(publicHos?.a ?? "", /僅供參考，以電訊商確認為準/);
    const fees = FAQ.find((item) => item.q === FEE_RANGE_QUESTION);
    assert.ok(fees);
    assert.match(fees.a, /^冇。香港寬頻冇一條適用所有地區、所有樓類嘅單一參考月費/);
    assert.match(fees.a, /公居屋 1000M 約 HK\$58 至 HK\$98／月/);
    assert.match(fees.a, /私樓 1000M 約 HK\$88 至 HK\$109／月/);
    assert.match(fees.a, /村屋由指定地址優惠 HK\$218／月起（中國移動香港村屋 1000M、24 個月，豁免安裝費原價 HK\$680），唔等於所有村屋都係呢個價；同系列正價為 HK\$378。/);
    assert.doesNotMatch(fees.a, /村屋由 HK\$218(?:／月)?起/);
    assert.doesNotMatch(fees.a, /村屋光纖由 HK\$218／月起/);
    assert.match(fees.a, /HK\$376／月/);
    assert.match(fees.a, /5G 家居約 HK\$88 至 HK\$190／月/);
    assert.match(fees.a, new RegExp(`資料更新 ${HOME_CONTENT_DATE}`));
    assert.doesNotMatch(fees.a, new RegExp(INDEPENDENT_FAQ_DATE));
    assert.match(fees.a, /唔係排名，亦唔代表你座樓一定有。$/);
    assert.doesNotMatch(fees.a, /最終月費、覆蓋同安裝以電訊商確認為準/);
    for (const word of ["最平", "最抵", "最低", "全港最平", "保證"]) {
      assert.equal(independent?.a.includes(word), false, independent?.q);
      assert.equal(independent?.q.includes(word), false, independent?.q);
      assert.equal(fees.a.includes(word), false, fees.q);
      assert.equal(fees.q.includes(word), false, fees.q);
    }
    const village = FAQ.find((item) => item.q.includes("村屋有冇光纖"));
    assert.match(village?.a ?? "", /HK\$218／月起/);
    assert.match(village?.a ?? "", /實際覆蓋要核對門牌。$/);
    assert.doesNotMatch(village?.a ?? "", /以電訊商確認為準/);
    assert.equal((village?.a ?? "").includes("HK$229／月起"), false);
    assert.equal((village?.a ?? "").includes("229／24 個月起"), false);
    assert.match(village?.q ?? "", /有冇/);
    assert.match(fillSiteTemplate(INDEPENDENT_BODY), new RegExp(`${ESTATE_COUNT} 個屋苑`));
    const contact = FAQ.find((item) => item.q === "點樣查核報價？");
    assert.match(contact?.a ?? "", /撳「留低電話」/);
    assert.equal((contact?.a ?? "").includes("撲"), false);
    assert.equal(
      fillSiteTemplate(MESSAGES.zh.whatsappTip),
      `撳落去會開啟 WhatsApp 聯絡我哋（${SITE.phoneDisplay}）。請勿分享銀行戶口或信用卡密碼。非電訊商官方客服。`,
    );
    assert.equal(MESSAGES.zh.whatsappTip.includes("撲"), false);
    assert.equal(getPlan("icable-ftth-1000-48m-58")?.monthlyFee, 58);
    assert.equal(getPlan("icable-ftth-1000-48m-58")?.contractMonths, 48);
    assert.equal(getPlan("hkbn-ftth-1000-36m-98")?.monthlyFee, 98);
    assert.equal(getPlan("icable-ftth-1000-private-36m")?.monthlyFee, 88);
    assert.equal(getPlan("hkbn-ftth-1000-24m-109")?.monthlyFee, 109);
    assert.equal(getPlan("cmhk-ftth-1000-village-24m-218")?.monthlyFee, 218);
    assert.equal(getPlan("hkbn-village-2000-24m")?.monthlyFee, 229);
    assert.equal(getPlan("netvigator-ftth-2500-village-36m")?.monthlyFee, 376);
    assert.equal(getPlan("cmhk-home5g-350-48-88")?.monthlyFee, 88);
    assert.equal(getPlan("three-home5g-c-190")?.monthlyFee, 190);
    assert.equal(PLAN_COUNT, 198);
    assert.equal(PROVIDER_COUNT, 8);
    assert.equal(ESTATE_COUNT, 3732);
    assert.doesNotMatch(MESSAGES.en.faq7a, /cheapest|lowest|best price|best-value/i);
    assert.match(
      fillSiteTemplate(MESSAGES.en.faq7a),
      /These are listed examples, not a ranking, and they do not mean your building has them\.$/,
    );
    assert.doesNotMatch(MESSAGES.en.faq7a, /The carrier confirms the final fee, coverage and installation/);
    assert.match(MESSAGES.en.faq2a, /include the estate name\.$/);
    assert.doesNotMatch(MESSAGES.en.faq2a, /The actual terms are confirmed by the carrier/);
    assert.match(MESSAGES.en.faq3a, /Coverage must be checked against the address\.$/);
    assert.doesNotMatch(MESSAGES.en.faq3a, /the carrier confirms/);
    assert.doesNotMatch(home, /全港最平/);
    const enUi = [
      [MESSAGES.en.faq1q, MESSAGES.en.faq1a],
      [MESSAGES.en.faq7q, MESSAGES.en.faq7a],
      [MESSAGES.en.faq2q, MESSAGES.en.faq2a],
      [MESSAGES.en.faq3q, MESSAGES.en.faq3a],
      [MESSAGES.en.faq4q, MESSAGES.en.faq4a],
      [MESSAGES.en.faq5q, MESSAGES.en.faq5a],
      [MESSAGES.en.faq6q, MESSAGES.en.faq6a],
    ] as const;
    const enLd = homeJsonLd("en");
    const enFaqLd = enLd["@graph"].find((node) => node["@type"] === "FAQPage");
    assert.equal(enFaqLd?.mainEntity.length, enUi.length);
    enUi.forEach(([q, a], index) => {
      assert.equal(enFaqLd?.mainEntity[index]?.name, q);
      assert.equal(enFaqLd?.mainEntity[index]?.acceptedAnswer.text, fillSiteTemplate(a));
    });
    assert.notEqual(enFaqLd?.mainEntity[0]?.name, FAQ[0]?.q);
    assert.equal(
      enFaqLd?.mainEntity[0]?.acceptedAnswer.text,
      `Yes. ChaiQuote (chaiquote.hk) is an independent Hong Kong telecom comparison site, not a carrier official website or subsidiary. It compiles public market information. As of ${INDEPENDENT_FAQ_DATE}, you can compare ${PROVIDER_COUNT} carriers, ${PLAN_COUNT} reference plans and ${ESTATE_COUNT} estates in one place. Public housing, HOS, private estates and village houses are listed separately.`,
    );
    assert.doesNotMatch(enFaqLd?.mainEntity[0]?.acceptedAnswer.text ?? "", /commission|advertising fees|\baffiliate\b/i);
    assert.match(enFaqLd?.mainEntity[1]?.acceptedAnswer.text ?? "", /not a ranking/);
    assert.doesNotMatch(enFaqLd?.mainEntity[1]?.acceptedAnswer.text ?? "", /最終月費/);
  });
});

describe("about page Organization JSON-LD", () => {
  it("reuses the homepage Organization node and the live catalogue counts", () => {
    const about = readFileSync(join(here, "../routes/about.tsx"), "utf8");
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    assert.equal(quoted(messages, "heroTitle1")[0], "搵寬頻唔使四圍問");
    assert.match(home, /t\("heroTitle1"\)/);
    assert.match(about, /<JsonLd data=\{aboutJsonLd\(\)\} \/>/);
    assert.match(about, /https:\/\/wa\.me\/\$\{SITE\.whatsappE164\}/);
    assert.doesNotMatch(about, /quoteWhatsAppActivateProps|quoteMessage|QuoteLink|quoteWhatsappE164|text=/);
    assert.doesNotMatch(about, /providers:|plans:|estates:|date: updated|\/brand/);
    assert.equal(existsSync(join(here, "../routes/brand.tsx")), false);
    assert.doesNotMatch(readFileSync(join(here, "../routeTree.gen.ts"), "utf8"), /\/brand/);
    assert.match(readFileSync(join(here, "../routes/privacy.tsx"), "utf8"), /<QuoteLink showNumber siteNumber \/>/);
    assert.doesNotMatch(about, /providers:\s*8|plans:\s*193|estates:\s*3729|2026-11-12/);
    const aboutLd = aboutJsonLd();
    const { "@context": aboutContext, ...aboutOrg } = aboutLd;
    const homeLd = homeJsonLd();
    const homeOrg = homeLd["@graph"].find((node) => node["@type"] === "Organization");
    assert.equal(aboutContext, "https://schema.org");
    assert.equal(aboutLd["@type"], "Organization");
    assert.equal(aboutOrg["@id"], `${SITE.url}/#organization`);
    assert.equal(aboutOrg.name, SITE.name);
    assert.equal(aboutOrg.url, SITE.url);
    assert.equal(aboutOrg.email, SITE.leadEmail);
    assert.equal(aboutOrg.telephone, `+${SITE.whatsappE164}`);
    assert.equal(aboutOrg.description, SITE.description);
    assert.equal(ABOUT_SEO.title, "齊Quote｜關於我們");
    assert.equal(
      ABOUT_SEO.description,
      "齊Quote 唔係電訊商官網或附屬機構。用公開市場資料整理參考月費，用家自己比較、自己揀計劃，實際以電訊商確認為準。",
    );
    assert.equal(
      aboutOrg.description,
      "齊Quote（chaiquote.hk）係獨立比較網站，唔係電訊商官網或附屬機構。用公開市場資料按同一標準整理，所列月費僅供參考，用家自己比較、自己揀計劃，實際以電訊商公佈及正式合約為準。",
    );
    assert.doesNotMatch(aboutOrg.description, /佣金|廣告費|報酬/);
    assert.doesNotMatch(ABOUT_SEO.description, /佣金|廣告費|報酬/);
    assert.doesNotMatch(aboutOrg.description, /間電訊商|個參考計劃|個屋苑|資料更新/);
    assert.doesNotMatch(JSON.stringify(aboutLd), /8 間電訊商|195 個參考計劃|3729 個屋苑/);
    assert.deepEqual(aboutOrg.sameAs, [...SITE.sameAs]);
    assert.deepEqual(aboutOrg.logo, { "@type": "ImageObject", url: `${SITE.url}/icon-512.png` });
    assert.equal(aboutOrg.image, `${SITE.url}/icon-512.png`);
    assert.equal(aboutOrg.image, aboutOrg.logo.url);
    assert.deepEqual(aboutOrg, homeOrg);
    assert.equal(homeLd["@graph"].filter((node) => node["@type"] === "Organization").length, 1);
    assert.equal(JSON.stringify(aboutLd).split(`${SITE.url}/#organization`).length - 1, 1);
  });
});

describe("broadband hub answer-first summary", () => {
  it("binds the live fibre count and the audited entry plans", () => {
    const plans = readFileSync(join(here, "../routes/plans.tsx"), "utf8");
    const summary = MESSAGES.zh.broadbandHubSummary;
    assert.equal(summary.includes("71"), false);
    assert.match(plans, /filterPlans\(\{ cat: "broadband" \}\)\.length/);
    assert.match(plans, /t\("broadbandHubSummary"/);
    const fibre58 = getPlan("icable-ftth-1000-48m-58");
    const fibre75 = getPlan("hgc-ftth-1000-public-36m");
    const fibre98 = getPlan("hkbn-ftth-1000-36m-98-sep30");
    const fibre218 = getPlan("cmhk-ftth-1000-village-24m-218");
    assert.ok(fibre58 && fibre75 && fibre98 && fibre218);
    assert.equal(fibre58.monthlyFee, 58);
    assert.equal(fibre58.contractMonths, 48);
    assert.equal(fibre75.monthlyFee, 75);
    assert.equal(fibre75.contractMonths, 36);
    assert.equal(fibre98.monthlyFee, 98);
    assert.equal(fibre98.contractMonths, 36);
    assert.match(fibre98.limits ?? "", /2026 年 9 月 22 日/);
    assert.match(fibre98.limits ?? "", /11 月 30 日/);
    assert.equal(fibre218.monthlyFee, 218);
    const fibreCount = filterPlans({ cat: "broadband" }).length;
    assert.equal(fibreCount, 73);
    const filled = summary
      .replaceAll("{date}", SITE.updated)
      .replaceAll("{name}", SITE.name)
      .replaceAll("{n}", String(fibreCount))
      .replaceAll("{fee58}", formatFee(fibre58.monthlyFee))
      .replaceAll("{months58}", String(fibre58.contractMonths))
      .replaceAll("{fee75}", formatFee(fibre75.monthlyFee))
      .replaceAll("{months75}", String(fibre75.contractMonths))
      .replaceAll("{fee98}", formatFee(fibre98.monthlyFee))
      .replaceAll("{months98}", String(fibre98.contractMonths))
      .replaceAll("{fee218}", formatFee(fibre218.monthlyFee));
    assert.equal(
      filled,
      `${SITE.updated}，齊Quote 光纖分類共 ${fibreCount} 個參考計劃。站內可見入門例：指定屋苑 1000M 約 HK$58／月（48 個月）；公居屋轉台 1000M 約 HK$75／月（36 個月，HGC）；香港寬頻 1000M 限時快閃連 Wi-Fi 7 標示 HK$98／月（36 個月，須 2026-09-22 至 2026-11-30 成功預約安裝）。村屋計劃分開列。村屋由指定地址優惠 HK$218／月起（中國移動香港村屋 1000M、24 個月，豁免安裝費原價 HK$680），唔等於所有村屋都係呢個價；同系列正價為 HK$378。唔好用私樓價估。`,
    );
  });
});
