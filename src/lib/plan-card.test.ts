import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

describe("plan card corner brand", () => {
  it("locks option ①: LogoMark + 齊Quote corner only, no foil/fee/motion changes", () => {
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const css = readFileSync(join(here, "../styles.css"), "utf8");

    assert.match(card, /import \{ LogoMark \} from "@\/components\/logo"/);
    assert.match(card, /<LogoMark className="size-5"/);
    assert.doesNotMatch(card, /<LogoMark className="size-3\.5"/);
    assert.match(card, /<span>\{SITE\.name\}<\/span>/);
    assert.match(card, /pointer-events-none/);
    assert.match(card, /aria-hidden="true"/);
    assert.match(card, /<article[\s\S]*"relative /);
    assert.match(card, /!absolute right-5 bottom-3/);
    assert.match(card, /text-\[13px\]/);
    assert.match(card, /text-subtle\/50/);
    assert.match(card, /pb-12/);
    assert.doesNotMatch(card, /pb-10/);
    assert.doesNotMatch(card, /<LogoMark[\s\S]{0,80}<Link/);
    assert.doesNotMatch(card, /aria-label=\{SITE\.name\}/);

    assert.match(card, /formatFee\(plan\.monthlyFee\)/);
    assert.match(card, /t\("perMonth", \{ n: plan\.contractMonths \}\)/);
    assert.match(card, /<ProviderMark id=\{plan\.providerId\} \/>\s*<button/);
    assert.match(card, /<PlanBadges plan=\{plan\} \/>/);
    assert.match(card, /<ProviderMark id=\{plan\.providerId\} \/>[\s\S]*<PlanBadges plan=\{plan\} \/>[\s\S]*<h3/);
    assert.doesNotMatch(card, /<ProviderMark[\s\S]{0,220}PlanBadges/);
    assert.doesNotMatch(card, /<PlanBadges plan=\{plan\} \/>\s*<PlanShareButton/);
    assert.match(card, /<QuoteLink plan=\{plan\}/);
    assert.match(card, /toggleCompare\(plan\.id\)/);
    assert.match(card, /\{t\("referencePrice"\)\}/);
    assert.doesNotMatch(
      card,
      /formatFee\(plan\.monthlyFee\)[\s\S]{0,200}(plan-card-shine|className="foil"|LogoMark)/,
    );
    assert.match(card, /<PlanBadges plan=\{plan\} \/>[\s\S]*<QuoteLink plan=\{plan\}[\s\S]*<LogoMark/);
    assert.match(card, /plan\.category === "business"/);
    assert.match(
      card,
      /CertifiedStaffNote[\s\S]*plan\.category === "business"[\s\S]*t\("businessDisclaimer"\)[\s\S]*\{t\("referencePrice"\)\}/,
    );
    assert.match(card, /\{t\("referencePrice"\)\}<\/p>\s*<span[\s\S]*<LogoMark className="size-5"/);
    assert.doesNotMatch(card, /CertifiedStaffNote[\s\S]{0,120}businessDisclaimer/);
    assert.doesNotMatch(card, /<QuoteLink[^>]*>[\s\S]{0,80}<LogoMark/);
    assert.doesNotMatch(card, /<PlanBadges[^>]*>[\s\S]{0,80}<LogoMark/);

    assert.match(card, /<article[\s\S]*plan\.quotePick && "plan-card-shine"/);
    assert.match(card, /plan\.quotePick \? <span className="foil" aria-hidden="true" \/> : null/);
    assert.match(card, /registerFoilCard/);
    assert.equal([...card.matchAll(/className="foil"/g)].length, 1);
    assert.doesNotMatch(card, /watermark|brand-foil|plan-card-watermark|foil-mark|face-watermark/i);
    assert.doesNotMatch(card, /is-foil-sweep|playFoilSweep/);

    assert.match(css, /\.plan-card-shine > \.foil\s*\{/);
    assert.match(css, /\.plan-card-shine > \*\s*\{[\s\S]*z-index:\s*1/);
    assert.match(css, /\.plan-card-shine > \.foil\s*\{[\s\S]*z-index:\s*0/);
    assert.match(css, /border:\s*3px solid transparent/);
    assert.doesNotMatch(css, /plan-card-brand|plan-card-watermark|face-watermark/);
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-card-shine > \.foil[\s\S]*opacity:\s*0\.1/,
    );
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-card-shine > \.foil[\s\S]*animation:\s*none/,
    );
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-card-shine[\s\S]*animation:\s*none/,
    );
    assert.doesNotMatch(css, /prefers-reduced-motion[\s\S]{0,400}LogoMark|plan-card-brand/);
  });
});
