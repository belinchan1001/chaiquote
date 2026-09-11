import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

describe("plan card corner brand", () => {
  it("renders a decorative LogoMark / 齊Quote corner mark and leaves quotePick foil markup unchanged", () => {
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const css = readFileSync(join(here, "../styles.css"), "utf8");

    assert.match(card, /import \{ LogoMark \} from "@\/components\/logo"/);
    assert.match(card, /<LogoMark className="size-3\.5"/);
    assert.match(card, /locale === "en" \? "ChaiQuote" : SITE\.name/);
    assert.match(card, /pointer-events-none/);
    assert.match(card, /aria-hidden="true"/);
    assert.match(card, /<article[\s\S]*"relative /);
    assert.match(card, /!absolute right-5 bottom-3/);
    assert.doesNotMatch(card, /<LogoMark[\s\S]{0,80}<Link/);
    assert.doesNotMatch(card, /aria-label=\{SITE\.name\}/);

    assert.match(card, /<article[\s\S]*plan\.quotePick && "plan-card-shine"/);
    assert.match(card, /plan\.quotePick \? <span className="foil" aria-hidden="true" \/> : null/);
    assert.match(card, /registerFoilCard/);
    assert.equal([...card.matchAll(/className="foil"/g)].length, 1);
    assert.doesNotMatch(card, /watermark|brand-foil|plan-card-watermark|foil-mark/i);
    assert.doesNotMatch(card, /is-foil-sweep|playFoilSweep/);
    assert.doesNotMatch(card, /formatFee\(plan\.monthlyFee\)[\s\S]{0,200}(plan-card-shine|className="foil"|LogoMark)/);
    assert.match(card, /<QuoteLink plan=\{plan\}/);
    assert.match(card, /toggleCompare\(plan\.id\)/);

    assert.match(css, /\.plan-card-shine > \.foil\s*\{/);
    assert.match(css, /\.plan-card-shine > \*\s*\{[\s\S]*z-index:\s*1/);
    assert.match(css, /\.plan-card-shine > \.foil\s*\{[\s\S]*z-index:\s*0/);
    assert.doesNotMatch(css, /plan-card-brand|plan-card-watermark/);
  });
});
