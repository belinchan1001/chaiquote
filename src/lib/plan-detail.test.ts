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
  it("reuses a labeled 分享 outline button beside WhatsApp, not in the top-right corner", () => {
    const page = src("../routes/plans_.$planId.tsx");
    const button = src("../components/plan-share-button.tsx");

    assert.equal([...page.matchAll(/<PlanShareButton plan=\{plan\} \/>/g)].length, 1);
    assert.match(page, /import \{ PlanShareButton \} from "@\/components\/plan-share-button"/);
    assert.match(
      page,
      /<QuoteLink plan=\{plan\} className="flex-1" \/>\s*\{plan\.staffOffer \? null : <PlanShareButton plan=\{plan\} \/>\}/,
    );
    assert.match(page, /<ProviderMark id=\{plan\.providerId\} \/>[\s\S]*<PlanBadges plan=\{plan\} \/>[\s\S]*<h1/);
    assert.doesNotMatch(page, /<PlanBadges plan=\{plan\} \/>\s*<PlanShareButton/);
    assert.doesNotMatch(page, /<ProviderMark[\s\S]{0,220}PlanShareButton/);
    assert.match(page, /formatFee\(plan\.monthlyFee\)[\s\S]*<PlanShareButton plan=\{plan\} \/>/);
    assert.doesNotMatch(page, /PlanShareButton[\s\S]{0,80}<LogoMark/);
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

    assert.match(page, /t\("perMonth", \{ n: plan\.contractMonths \}\)/);
    assert.match(page, /t\("rowContract"\)/);
    assert.match(page, /t\("months", \{ n: plan\.contractMonths \}\)/);
    assert.match(page, /planPerks\(plan\)/);
    assert.match(page, /t\("rowPerks"\)/);
    assert.match(page, /<QuoteLink plan=\{plan\}/);
    assert.match(page, /<WhatsAppTip className="mt-3" \/>/);
    assert.match(page, /\{t\("referencePrice"\)\}/);
    assert.match(page, /plan\.category === "business"/);
    assert.match(
      page,
      /CertifiedStaffNote[\s\S]*plan\.category === "business"[\s\S]*t\("businessDisclaimer"\)[\s\S]*\{t\("referencePrice"\)\}/,
    );
    assert.doesNotMatch(page, /CertifiedStaffNote[\s\S]{0,120}businessDisclaimer/);
    assert.match(page, /t\("installCoverage"\)[\s\S]*t\("referencePrice"\)[\s\S]*t\("disclaimer1"\)/);

    const heroEnd = page.indexOf("serviceLimits");
    assert.ok(heroEnd > 0, "disclaimer box should follow the hero");
    const hero = page.slice(0, heroEnd);
    assert.match(hero, /<PlanShareButton plan=\{plan\} \/>/);
    assert.match(hero, /formatFee\(plan\.monthlyFee\)/);
    assert.match(hero, /t\("perMonth", \{ n: plan\.contractMonths \}\)/);
    assert.match(hero, /t\("rowPerks"\)/);
    assert.match(hero, /<QuoteLink plan=\{plan\}/);
    assert.match(hero, /\{t\("referencePrice"\)\}/);
    assert.match(hero, /relative mt-6 max-w-3xl rounded-xl bg-card/);
    assert.match(hero, /<article[\s\S]*plan\.quotePick && "plan-card-shine"/);
    assert.match(hero, /plan\.quotePick \? <span className="foil" aria-hidden="true" \/> : null/);
    assert.match(hero, /registerFoilCard/);

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
  });

  it("mirrors list PlanCard shine/foil on quotePick detail only", () => {
    const page = src("../routes/plans_.$planId.tsx");
    const card = src("../components/plan-card.tsx");
    const home = src("../routes/index.tsx");

    assert.match(page, /import \{ registerFoilCard \} from "@\/lib\/foil-scroll"/);
    assert.match(page, /if \(!plan\.quotePick\) return;/);
    assert.match(page, /return registerFoilCard\(el\)/);
    assert.match(page, /plan\.quotePick && "plan-card-shine"/);
    assert.match(page, /plan\.quotePick \? <span className="foil" aria-hidden="true" \/> : null/);
    assert.equal([...page.matchAll(/className="foil"/g)].length, 1);
    assert.doesNotMatch(page, /function PlanDetailPending[\s\S]{0,800}plan-card-shine/);
    assert.doesNotMatch(page, /is-foil-sweep|playFoilSweep|is-featured/);

    assert.match(card, /<article[\s\S]*plan\.quotePick && "plan-card-shine"/);
    assert.match(card, /plan\.quotePick \? <span className="foil" aria-hidden="true" \/> : null/);
    assert.match(card, /registerFoilCard/);

    assert.doesNotMatch(home, /plan-card-shine|className="foil"|registerFoilCard/);
    assert.match(home, /t\("bestPicksTitle"\)/);
    assert.match(home, /t\("bestPicksCta"\)/);
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
