import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { PlansSearch } from "./plans.ts";
import { planListReplayKey } from "./search.ts";
import { isPlanListInView } from "./plan-list-fade.ts";

const here = dirname(fileURLToPath(import.meta.url));
const base: PlansSearch = { cat: "broadband" };

function delayForNthChild(css: string, n: number) {
  const match = css.match(new RegExp(`\\.plan-list-enter > \\*:nth-child\\(${n}\\)\\s*\\{([^}]+)\\}`));
  assert.ok(match, `missing .plan-list-enter > *:nth-child(${n})`);
  const delay = match[1].match(/animation-delay:\s*(\d+)ms/);
  assert.ok(delay, `missing animation-delay for nth-child(${n})`);
  return Number(delay[1]);
}

describe("plan list filter replay", () => {
  it("changes the replay key only for estate, housing, speed, provider, intake, and auto-filter", () => {
    const idle = planListReplayKey(base);
    assert.notEqual(planListReplayKey({ ...base, estate: "太和邨" }), idle);
    assert.notEqual(planListReplayKey({ ...base, housing: "public" }), idle);
    assert.notEqual(planListReplayKey({ ...base, housing: "hos" }), idle);
    assert.notEqual(planListReplayKey({ ...base, housing: "private" }), idle);
    assert.notEqual(planListReplayKey({ ...base, housing: "village" }), idle);
    assert.notEqual(planListReplayKey({ ...base, speed: 1000 }), idle);
    assert.notEqual(planListReplayKey({ ...base, provider: "hkbn" }), idle);
    assert.notEqual(planListReplayKey({ ...base, intake: true }), idle);
    assert.equal(
      planListReplayKey({ ...base, estate: "太和邨", housing: "public" }),
      planListReplayKey({ ...base, estate: "太和邨", housing: "public" }),
    );
    assert.equal(planListReplayKey({ ...base, cat: "mobile" }), idle);
    assert.equal(planListReplayKey({ ...base, saved: true }), idle);
    assert.equal(planListReplayKey({ ...base, sort: "speed" }), idle);
    assert.equal(planListReplayKey({ ...base, q: "hkbn" }), idle);
    assert.equal(planListReplayKey({ ...base, generation: "5g" }), idle);
    assert.equal(planListReplayKey({ ...base, gba: true, portIn: true }), idle);
  });

  it("keeps the same key when only the visible page would change", () => {
    assert.equal(planListReplayKey(base), planListReplayKey({ ...base }));
    assert.equal(
      planListReplayKey({ ...base, estate: "廣明苑", housing: "hos" }),
      planListReplayKey({ ...base, estate: "廣明苑", housing: "hos" }),
    );
  });
});

describe("plan list fade-up", () => {
  it("staggers a 240ms fade-up on list items without remounting foil or blocking clicks", () => {
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    const page = readFileSync(join(here, "../routes/plans.tsx"), "utf8");
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const fade = readFileSync(join(here, "plan-list-fade.ts"), "utf8");
    const chips = readFileSync(join(here, "../components/filter-link.tsx"), "utf8");
    const providers = readFileSync(join(here, "../components/provider-filter.tsx"), "utf8");

    assert.match(page, /planListReplayKey\(search\)/);
    assert.match(page, /plan-list-enter/);
    assert.match(page, /listEntering/);
    assert.doesNotMatch(page, /key=\{planListReplayKey/);
    assert.match(page, /className="plan-list-item"/);
    assert.match(page, /<div key=\{plan\.id\} className="plan-list-item">/);
    assert.match(page, /<PlanCard plan=\{plan\} \/>/);
    assert.doesNotMatch(page, /plan-list[\s\S]{0,200}<PlanCard key=/);
    assert.match(page, /setVisible\(\(n\) => n \+ PAGE_SIZE\)/);
    assert.doesNotMatch(page, /planListReplayKey\([^)]*visible/);
    assert.doesNotMatch(page, /planListReplayKey\([^)]*saved/);
    assert.doesNotMatch(page, /planListReplayKey\([^)]*compare/);
    assert.doesNotMatch(page, /setTimeout\(\(\) => setListEntering\(false\)/);
    assert.match(page, /prevReplayKey/);
    assert.match(page, /setListEntering\(false\)/);
    assert.match(page, /setListEntering\(true\)/);
    assert.match(page, /bringPlanListIntoView\(list\)/);
    assert.match(page, /watchPlanListInView\(list/);
    assert.match(page, /isPlanListInView\(/);
    assert.match(page, /resetScroll:\s*false/);
    assert.match(page, /\[listEntering, setListEntering\] = useState\(false\)/);
    assert.doesNotMatch(page, /addEventListener\(\s*["']scroll["']/);
    assert.doesNotMatch(page, /requestAnimationFrame\(\(\) => setListEntering\(true\)\)/);
    assert.match(chips, /resetScroll=\{false\}/);
    assert.match(providers, /resetScroll=\{false\}/);
    assert.match(fade, /scrollIntoView\(\{\s*behavior:\s*"auto"/);
    assert.match(fade, /IntersectionObserver/);
    assert.match(fade, /scrollend/);
    assert.doesNotMatch(fade, /setListEntering/);
    assert.doesNotMatch(fade, /behavior:\s*"smooth"/);

    assert.match(card, /<article[\s\S]*plan\.quotePick && "plan-card-shine"/);
    assert.match(card, /<QuoteLink plan=\{plan\}/);
    assert.match(card, /toggleCompare\(plan\.id\)/);
    assert.match(card, /toggleSaved\(plan\.id\)/);
    assert.doesNotMatch(card, /plan-list-enter|plan-card-in/);

    assert.match(
      css,
      /@keyframes plan-card-in\s*\{\s*from\s*\{\s*opacity:\s*0;\s*transform:\s*translateY\(12px\);/,
    );
    assert.match(css, /\.plan-list-enter > \*\s*\{[^}]*animation:\s*plan-card-in 240ms ease-out both/);
    assert.match(css, /\.plan-list > \*\s*\{[^}]*pointer-events:\s*auto/);
    assert.match(css, /\.plan-list:not\(\.plan-list-enter\) > \*\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translateY\(12px\)/);
    assert.match(css, /\.plan-list\s*\{[^}]*scroll-margin-top:\s*5rem/);
    assert.match(css, /\.plan-list-enter > \*\s*\{[^}]*animation-delay:\s*450ms/);
    assert.doesNotMatch(css, /\.plan-card-shine[^{]*\{[^}]*plan-card-in/);
    assert.doesNotMatch(css, /\.foil[^{]*\{[^}]*plan-card-in/);

    const delays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => delayForNthChild(css, n));
    assert.deepEqual(delays, [0, 50, 100, 150, 200, 250, 300, 350, 400, 450]);
    assert.equal(css.includes(".plan-list-enter > *:nth-child(11)"), false);

    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-list-enter > \*[\s\S]*animation:\s*none !important;[\s\S]*transform:\s*none !important/,
    );
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-list > \*,\s*\n\s*\.plan-list-enter > \*\s*\{[\s\S]*opacity:\s*1 !important/,
    );
    assert.match(css, /\.plan-card-shine\s*\{[\s\S]*animation:\s*quote-pick-shine 4\.8s linear infinite/);
    assert.doesNotMatch(css, /\.plan-list[^{]*\{[^}]*perspective/);
    assert.doesNotMatch(css, /\.plan-list[\s\S]{0,200}rotateX/);
    assert.doesNotMatch(page, /wa-pulse|whatsapp-pulse|tilt/);
  });

  it("does not treat a below-the-fold list as ready to fade", () => {
    const vh = 700;
    assert.equal(isPlanListInView({ top: 720, bottom: 1400 }, vh), false);
    assert.equal(isPlanListInView({ top: 800, height: 500 }, vh), false);
    assert.equal(isPlanListInView({ top: 680, bottom: 1200 }, vh), false);
    assert.equal(isPlanListInView({ top: 80, bottom: 520 }, vh), true);
    assert.equal(isPlanListInView({ top: 90, bottom: 480 }, vh), true);
    assert.equal(isPlanListInView({ top: 620, bottom: 1100 }, vh), true);
    assert.equal(isPlanListInView({ top: -400, bottom: 40 }, vh), false);
  });
});
