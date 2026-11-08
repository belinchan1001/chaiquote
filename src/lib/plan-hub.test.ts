import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MESSAGES } from "./messages.ts";
import { SITE } from "./site.ts";
import { formatFee, getPlan } from "./plans.ts";
import { filterPlans } from "./plan-filter.ts";
import {
  BUSINESS_SUMMARY_IDS,
  FIBRE_SUMMARY_IDS,
  HOME5G_SUMMARY_IDS,
  MOBILE_SUMMARY_IDS,
  categoryEntryPlan,
  hubSummaryBullets,
} from "./plan-hub.ts";

const here = dirname(fileURLToPath(import.meta.url));

function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

function assertBulletsCover(text: string) {
  const bullets = hubSummaryBullets(text);
  assert.ok(bullets.length >= 4, text.slice(0, 48));
  let residue = text;
  for (const item of bullets) {
    assert.equal(text.includes(item), true, item);
    residue = residue.replace(item, "");
  }
  assert.equal(residue.replace(/[。；.\s]/g, ""), "");
}

describe("plan category hub", () => {
  it("derives the hero entry fee from the existing catalogue helpers", () => {
    assert.equal(categoryEntryPlan("broadband")?.id, "icable-ftth-1000-48m-58");
    assert.equal(categoryEntryPlan("broadband")?.monthlyFee, 58);
    assert.equal(categoryEntryPlan("broadband", "public")?.monthlyFee, 58);
    assert.equal(categoryEntryPlan("broadband", "village")?.id, "cmhk-ftth-1000-village-24m-218");
    assert.equal(categoryEntryPlan("broadband", "village")?.monthlyFee, 218);
    assert.equal(categoryEntryPlan("home5g")?.id, "cmhk-home5g-350-48-88");
    assert.equal(categoryEntryPlan("home5g")?.monthlyFee, 88);
    assert.equal(categoryEntryPlan("mobile")?.monthlyFee, 38);
    assert.equal(categoryEntryPlan("business")?.id, "hkbn-biz-1000");
    assert.equal(categoryEntryPlan("business")?.monthlyFee, 248);
  });

  it("keeps broadband, 5G home, mobile, and business facts as crawlable bullets", () => {
    const fibre58 = getPlan(FIBRE_SUMMARY_IDS[0]);
    const fibre75 = getPlan(FIBRE_SUMMARY_IDS[1]);
    const fibre98 = getPlan(FIBRE_SUMMARY_IDS[2]);
    const fibre218 = getPlan(FIBRE_SUMMARY_IDS[3]);
    assert.ok(fibre58 && fibre75 && fibre98 && fibre218);
    const fibre = fill(MESSAGES.zh.broadbandHubSummary, {
      date: SITE.updated,
      name: SITE.name,
      n: filterPlans({ cat: "broadband" }).length,
      fee58: formatFee(fibre58.monthlyFee),
      months58: fibre58.contractMonths,
      fee75: formatFee(fibre75.monthlyFee),
      months75: fibre75.contractMonths,
      fee98: formatFee(fibre98.monthlyFee),
      months98: fibre98.contractMonths,
      fee218: formatFee(fibre218.monthlyFee),
    });
    assertBulletsCover(fibre);
    assert.match(fibre, /無收取電訊商佣金或廣告費/);
    assert.match(fibre, /2026-09-22 至 2026-11-30/);

    const home88 = getPlan(HOME5G_SUMMARY_IDS[0]);
    const home98 = getPlan(HOME5G_SUMMARY_IDS[1]);
    const home108 = getPlan(HOME5G_SUMMARY_IDS[2]);
    assert.ok(home88 && home98 && home108);
    assert.equal(filterPlans({ cat: "home5g" }).length, 15);
    assert.equal(home88.monthlyFee, 88);
    assert.equal(home98.monthlyFee, 98);
    assert.equal(home108.monthlyFee, 108);
    assert.equal(home108.freeMonths, 1);
    const home = fill(MESSAGES.zh.home5gHubSummary, {
      date: SITE.updated,
      name: SITE.name,
      n: 15,
      plan88: home88.name,
      fee88: formatFee(home88.monthlyFee),
      months88: home88.contractMonths,
      plan98: home98.name,
      fee98: formatFee(home98.monthlyFee),
      months98: home98.contractMonths,
      plan108: home108.name,
      fee108: formatFee(home108.monthlyFee),
      months108: home108.contractMonths,
      free108: home108.freeMonths,
    });
    assertBulletsCover(home);
    assert.match(home, /免拉線入屋/);
    assert.match(home, /無收取電訊商佣金或廣告費/);

    const low = getPlan(MOBILE_SUMMARY_IDS[0]);
    const five = getPlan(MOBILE_SUMMARY_IDS[1]);
    assert.ok(low && five);
    assert.equal(filterPlans({ cat: "mobile" }).length, 84);
    assert.equal(low.monthlyFee, 38);
    assert.equal(five.monthlyFee, 78);
    assert.match(low.name, /低用量/);
    assert.match(five.network, /^5G/);
    const mobile = fill(MESSAGES.zh.mobileHubSummary, {
      date: SITE.updated,
      name: SITE.name,
      n: 84,
      lowName: low.name,
      lowFee: formatFee(low.monthlyFee),
      lowMonths: low.contractMonths,
      fiveName: five.name,
      fiveFee: formatFee(five.monthlyFee),
      fiveMonths: five.contractMonths,
    });
    assertBulletsCover(mobile);
    assert.match(mobile, /唔代表 5G 月費/);
    assert.match(mobile, /無收取電訊商佣金或廣告費/);

    const biz1000 = getPlan(BUSINESS_SUMMARY_IDS[0]);
    const biz1000b = getPlan(BUSINESS_SUMMARY_IDS[1]);
    const biz10000 = getPlan(BUSINESS_SUMMARY_IDS[2]);
    assert.ok(biz1000 && biz1000b && biz10000);
    assert.equal(filterPlans({ cat: "business" }).length, 6);
    assert.equal(biz1000.monthlyFee, 248);
    assert.equal(biz1000b.monthlyFee, 268);
    assert.equal(biz10000.monthlyFee, 798);
    assert.equal(biz10000.speedMbps, 10000);
    const business = fill(MESSAGES.zh.businessHubSummary, {
      date: SITE.updated,
      name: SITE.name,
      n: 6,
      provider1000: "香港寬頻",
      name1000: biz1000.name,
      fee1000: formatFee(biz1000.monthlyFee),
      months1000: biz1000.contractMonths,
      provider1000b: "網上行",
      name1000b: biz1000b.name,
      fee1000b: formatFee(biz1000b.monthlyFee),
      months1000b: biz1000b.contractMonths,
      fee10000: formatFee(biz10000.monthlyFee),
      months10000: biz10000.contractMonths,
    });
    assertBulletsCover(business);
    assert.match(business, /HK\$248/);
    assert.match(business, /HK\$798/);
    assert.match(business, /無收取電訊商佣金或廣告費/);

    assertBulletsCover(fill(MESSAGES.en.broadbandHubSummary, {
      date: SITE.updated,
      name: SITE.name,
      n: 73,
      fee58: formatFee(fibre58.monthlyFee),
      months58: fibre58.contractMonths,
      fee75: formatFee(fibre75.monthlyFee),
      months75: fibre75.contractMonths,
      fee98: formatFee(fibre98.monthlyFee),
      months98: fibre98.contractMonths,
      fee218: formatFee(fibre218.monthlyFee),
    }));
    for (const key of ["home5gHubSummary", "mobileHubSummary", "businessHubSummary", "planQuoteCta", "feeSummaryTitle", "hubFactsTitle"] as const) {
      assert.equal(typeof MESSAGES.en[key], "string");
      assert.ok(MESSAGES.zh[key].length > 0);
    }
    assert.equal(MESSAGES.zh.planQuoteCta, "索取報價");
    assert.equal(MESSAGES.zh.feeSummaryTitle, "參考月費摘要");
    assert.equal(MESSAGES.zh.hubFactsTitle, "分類說明");
    assert.equal(MESSAGES.en.planQuoteCta, "Request a quote");
    assert.equal(MESSAGES.en.feeSummaryTitle, "Reference fee summary");
    assert.equal(MESSAGES.en.hubFactsTitle, "About this list");
    assert.notEqual(MESSAGES.zh.planQuoteCta, "planQuoteCta");
    assert.notEqual(MESSAGES.zh.feeSummaryTitle, "feeSummaryTitle");
    assert.notEqual(MESSAGES.zh.hubFactsTitle, "hubFactsTitle");
  });

  it("puts search and compact filters above plan cards, and keeps quotes on each card", () => {
    const plans = readFileSync(join(here, "../routes/plans.tsx"), "utf8");
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const root = readFileSync(join(here, "../routes/__root.tsx"), "utf8");
    const widget = readFileSync(join(here, "../components/whatsapp-widget.tsx"), "utf8");
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    const at = (needle: string) => {
      const index = plans.indexOf(needle);
      assert.ok(index >= 0, needle);
      return index;
    };
    assert.ok(at("categoryEntryPlan") < at('id="plans-estate"'));
    assert.ok(at('t("fromFee"') < at('id="plans-estate"'));
    assert.ok(at('id="plans-estate"') < at("data-scenario-chips"));
    assert.ok(at("data-scenario-chips") < at('t("planType")'));
    assert.ok(at('t("planType")') < at("<AiFilterEntry"));
    assert.ok(at("<AiFilterEntry") < at("data-plan-more"));
    assert.ok(at("data-plan-more") < at('t("moreFilters")'));
    assert.ok(at('t("moreFilters")') < at('t("intakeCurrentBb")'));
    assert.ok(at('t("intakeCurrentBb")') < at("<IntakeFields"));
    assert.ok(at("<IntakeFields") < at('t("foundPlans"'));
    assert.ok(at('t("foundPlans"') < at("<PlanCard"));
    assert.ok(at("<PlanCard") < at('t("feeSummaryTitle")'));
    assert.ok(at('t("feeSummaryTitle")') < at("hubSummaryBullets(hubText)"));
    assert.match(plans, /<details/);
    assert.match(plans, /<ul className="mt-2 list-disc/);
    assert.match(plans, /t\("home5gHubSummary"/);
    assert.match(plans, /t\("mobileHubSummary"/);
    assert.match(plans, /t\("businessHubSummary"/);
    assert.doesNotMatch(plans, /planQuoteCta|<QuoteLink/);
    assert.doesNotMatch(plans, /leading-relaxed text-muted">\s*\{t\("broadbandHubSummary"/);
    assert.match(card, /<article[\s\S]*plan\.quotePick && "plan-card-shine"/);
    assert.match(card, /<QuoteLink plan=\{plan\}/);
    assert.match(card, /WhatsApp 問呢個計劃/);
    assert.doesNotMatch(card, /feeSummaryTitle|hubSummaryBullets|planQuoteCta/);
    assert.match(root, /<DeferredWhatsApp \/>/);
    assert.match(widget, /fixed right-4/);
    assert.match(widget, /bg-whatsapp/);
    assert.doesNotMatch(home, /planQuoteCta/);
  });
});
