import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const CLAIM_WORDS = ["最抵", "最低", "最平", "保證價"] as const;

function src(file: string) {
  return readFileSync(join(here, file), "utf8");
}

describe("plan detail share landing", () => {
  it("reuses the list plan card, so share stays on the card and not in a second layout", () => {
    const page = src("../routes/plans_.$planId.tsx");
    const card = src("../components/plan-card.tsx");
    const button = src("../components/plan-share-button.tsx");

    assert.match(page, /<PlanCard plan=\{plan\} \/>/);
    assert.equal([...page.matchAll(/<PlanShareButton/g)].length, 0);
    assert.match(card, /\{plan\.staffOffer \? null : <PlanShareButton plan=\{plan\} \/>\}/);
    assert.doesNotMatch(page, /window\.location/);

    assert.match(button, /shareOrCopyPlan\(plan\)/);
    assert.match(button, /t\("share"\)/);
    assert.match(button, /variant="outline"/);
    assert.match(button, /\{label\}/);
    assert.match(button, /aria-live="polite"/);
  });

  it("keeps 返列表, 僅供參考, WhatsApp, contract, and perks in the card-like hero", () => {
    const page = src("../routes/plans_.$planId.tsx");

    assert.match(page, /to="\/plans"/);
    assert.match(page, /search=\{\{ cat: plan\.category \}\}/);
    assert.match(page, /t\("backTo", \{ cat: categoryLabel\(plan\.category\) \}\)/);
    assert.match(page, /font-medium text-muted hover:text-fg/);

    assert.match(page, /t\("rowContract"\)/);
    assert.match(page, /t\("months", \{ n: plan\.contractMonths \}\)/);
    assert.match(page, /<PlanCard plan=\{plan\} \/>/);
    assert.match(page, /<WhatsAppTip className="mt-3 max-w-3xl" \/>/);
    assert.match(page, /t\("installCoverage"\)[\s\S]*t\("referencePrice"\)[\s\S]*t\("disclaimer1"\)/);

    const heroEnd = page.indexOf("serviceLimits");
    assert.ok(heroEnd > 0, "disclaimer box should follow the hero");
    const hero = page.slice(0, heroEnd);
    assert.match(hero, /<PlanCard plan=\{plan\} \/>/);
    assert.match(hero, /formatFee\(plan\.monthlyFee\)/);

    for (const word of CLAIM_WORDS) {
      assert.equal(page.includes(word), false, `detail page still claims ${word}`);
    }
    assert.doesNotMatch(page, /保證價|最抵|最低|最平/);
  });

  it("avoids a blank flash: sync loader, skeleton, and no page-shell remount", () => {
    const page = src("../routes/plans_.$planId.tsx");
    const root = src("../routes/__root.tsx");

    assert.match(page, /pendingComponent: PlanDetailPending/);
    assert.match(page, /pendingMs: 0/);
    assert.match(page, /function PlanDetailPending\(/);
    assert.match(page, /loader: \(\{ params \}\) => \{/);
    assert.doesNotMatch(page, /loader: async /);
    assert.match(page, /aria-busy="true"/);
    assert.match(page, /rounded-xl bg-card p-5 pb-12 shadow-\[var\(--shadow-border\)\]/);

    assert.doesNotMatch(root, /key=\{pathname\}/);
    assert.match(root, /className="page-shell"/);
    const pending = page.slice(page.indexOf("function PlanDetailPending"), page.indexOf("function PlanDetailPage"));
    assert.match(page, /className="plan-detail-enter mx-auto max-w-6xl px-4 py-8"/);
    assert.doesNotMatch(pending, /plan-detail-enter/);
    assert.doesNotMatch(page, /count-?up|requestAnimationFrame\(\(\) => setFee/);
  });

  it("mirrors list PlanCard shine/foil on quotePick detail only", () => {
    const page = src("../routes/plans_.$planId.tsx");
    const card = src("../components/plan-card.tsx");
    const home = src("../routes/index.tsx");

    assert.match(page, /<PlanCard plan=\{plan\} \/>/);
    assert.doesNotMatch(page, /registerFoilCard/);
    assert.doesNotMatch(page, /className="foil"/);
    assert.doesNotMatch(page, /function PlanDetailPending[\s\S]{0,800}plan-card-shine/);
    assert.doesNotMatch(page, /is-foil-sweep|playFoilSweep|is-featured/);

    assert.match(card, /<article[\s\S]*plan\.quotePick && "plan-card-shine"/);
    assert.match(card, /plan\.quotePick \? <span className="foil" aria-hidden="true" \/> : null/);
    assert.match(card, /registerFoilCard/);

    assert.doesNotMatch(home, /plan-card-shine|className="foil"|registerFoilCard/);
    assert.match(src("../components/home-best-picks.tsx"), /t\("bestPicksTitle"\)/);
    assert.match(src("../components/home-best-picks.tsx"), /t\("bestPicksCta"\)/);
  });

  it("does not change plan SEO head or JSON-LD", () => {
    const page = src("../routes/plans_.$planId.tsx");
    assert.match(page, /const title = planSeoTitle\(plan\)/);
    assert.match(page, /const description = planSeoDescription\(plan\)/);
    assert.match(page, /canonicalUrl\(`\/plans\/\$\{plan\.id\}`\)/);
    assert.match(page, /\{ property: "og:title", content: title \}/);
    assert.match(page, /\{ property: "og:description", content: description \}/);
    assert.match(page, /\{ property: "og:url", content: url \}/);
    assert.match(page, /links: \[\{ rel: "canonical", href: url \}\]/);
    assert.match(page, /<JsonLd data=\{planJsonLd\(plan\)\} \/>/);
    assert.match(page, /usePageTitle\(planSeoTitle\(plan\)\)/);
  });
});
