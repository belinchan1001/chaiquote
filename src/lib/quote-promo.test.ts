import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { HOME_QUOTE_IDS, homeQuotePlans } from "./home-quotes.ts";
import { getPlan } from "./plans.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("homepage quote promo", () => {
  it("uses at most 3 existing quotePick plans with real fees", () => {
    assert.ok(HOME_QUOTE_IDS.length <= 3);
    assert.equal(homeQuotePlans().length, HOME_QUOTE_IDS.length);
    for (const id of HOME_QUOTE_IDS) {
      const plan = getPlan(id);
      assert.ok(plan, id);
      assert.equal(plan.quotePick, true);
      assert.ok(plan.monthlyFee > 0);
    }
  });

  it("is a slow carousel without foil, scale, or homepage filters", () => {
    const src = readFileSync(join(here, "../components/quote-promo.tsx"), "utf8");
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    assert.match(src, /INTERVAL_MS = 6000/);
    assert.match(src, /prefers-reduced-motion/);
    assert.match(src, /lg:grid-cols-3/);
    assert.doesNotMatch(src, /plan-card-shine/);
    assert.doesNotMatch(src, /scale\(/);
    assert.match(home, /QuotePromo/);
    assert.doesNotMatch(home, /SearchPanel/);
    assert.doesNotMatch(home, /FEATURED_IDS/);
  });
});
