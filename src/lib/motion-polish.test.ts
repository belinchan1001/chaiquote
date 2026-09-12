import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(here, rel), "utf8");
}

describe("light UX motion polish", () => {
  it("fades list cards and plan detail from a painted state, never a blank frame", () => {
    const css = src("../styles.css");
    const detail = src("../routes/plans_.$planId.tsx");
    const root = src("../routes/__root.tsx");
    const list = src("../routes/plans.tsx");

    assert.match(css, /\.plan-list:not\(\.plan-list-enter\) > \*\s*\{[^}]*opacity:\s*0\.88/);
    assert.match(css, /@keyframes plan-card-in\s*\{\s*from\s*\{\s*opacity:\s*0\.88/);
    assert.match(css, /\.plan-detail-enter\s*\{[^}]*animation:\s*plan-detail-in 180ms/);
    assert.match(css, /@keyframes plan-detail-in\s*\{\s*from\s*\{\s*opacity:\s*0\.88;\s*transform:\s*translateY\(6px\)/);
    assert.doesNotMatch(css, /@keyframes plan-detail-in\s*\{\s*from\s*\{\s*opacity:\s*0;/);
    assert.doesNotMatch(css, /@keyframes plan-card-in\s*\{\s*from\s*\{\s*opacity:\s*0;/);

    assert.match(detail, /plan-detail-enter/);
    assert.match(detail, /pendingComponent: PlanDetailPending/);
    assert.match(detail, /pendingMs: 0/);
    assert.doesNotMatch(detail, /function PlanDetailPending\([\s\S]{0,400}plan-detail-enter/);
    assert.doesNotMatch(root, /key=\{pathname\}/);
    assert.match(list, /plan-list-enter/);
    assert.match(list, /prefers-reduced-motion: reduce/);
  });

  it("gives filter and share instant done feedback without waiting on startTransition", () => {
    const chips = src("../components/filter-link.tsx");
    const share = src("../components/plan-share-button.tsx");
    const search = src("../components/search-panel.tsx");
    const plans = src("../routes/plans.tsx");
    const css = src("../styles.css");
    const providers = src("../components/provider-filter.tsx");

    assert.match(chips, /useChipArm/);
    assert.match(chips, /duration-75/);
    assert.match(chips, /onClick=\{chip\.arm\}/);
    assert.match(providers, /useChipArm/);
    assert.match(css, /\.chip-press\s*\{[^}]*transform 90ms ease-out/);
    assert.match(css, /\.chip-press:active\s*\{[^}]*transform:\s*scale\(0\.97\)/);
    assert.match(css, /\.chip-press:not\(\[aria-current="page"\]\):active/);

    assert.match(share, /setHot\(true\)/);
    assert.match(share, /aria-busy=\{hot\}/);
    assert.match(share, /action-hot/);
    assert.match(share, /t\("shareCopied"\)/);
    assert.match(share, /variant="outline"/);
    assert.match(share, /action-done bg-accent text-accent-foreground/);
    assert.match(css, /\.action-hot\s*\{[^}]*transform:\s*scale\(0\.97\)/);

    assert.doesNotMatch(search, /startTransition/);
    assert.doesNotMatch(plans, /startTransition/);
    assert.match(search, /action-apply/);
    assert.match(plans, /action-apply/);
    assert.match(css, /\.action-apply:active\s*\{[^}]*transform:\s*scale\(0\.97\)/);
  });

  it("opens and closes the AI panel without a leftover overlay or ghost", () => {
    const staff = src("../components/ai-staff.tsx");
    const css = src("../styles.css");

    assert.match(staff, /useAiPresence/);
    assert.match(staff, /if \(!mounted\) return null/);
    assert.match(staff, /className=\{cn\("ai-overlay/);
    assert.match(staff, /"ai-panel fixed/);
    assert.match(staff, /shown && "is-open"/);
    assert.match(staff, /inert=\{!shown\}/);
    assert.match(staff, /AI_CLOSE_MS = 180/);
    assert.match(staff, /prefers-reduced-motion: reduce/);
    assert.match(staff, /inset-x-0 bottom-24/);
    assert.match(staff, /lg:left-4 lg:top-20/);
    assert.doesNotMatch(staff, /translate-y-full/);
    assert.doesNotMatch(staff, /pointer-events-none translate-y-full/);

    assert.match(css, /\.ai-overlay\s*\{[^}]*visibility:\s*hidden/);
    assert.match(css, /\.ai-overlay\.is-open\s*\{[^}]*visibility:\s*visible/);
    assert.match(css, /\.ai-panel\s*\{[^}]*visibility:\s*hidden/);
    assert.match(css, /\.ai-panel\.is-open\s*\{[^}]*visibility:\s*visible/);
    assert.match(css, /\.ai-panel\s*\{[^}]*overflow:\s*hidden/);
  });

  it("disables the new motion when prefers-reduced-motion is reduce", () => {
    const css = src("../styles.css");
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-detail-enter[\s\S]*animation:\s*none !important/,
    );
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.ai-overlay[\s\S]*transition:\s*none !important/,
    );
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.ai-panel:not\(\.is-open\)[\s\S]*visibility:\s*hidden !important/,
    );
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-detail-enter\s*\{[\s\S]*opacity:\s*1 !important/,
    );
  });

  it("does not add heavy homepage motion, count-up, or autoplay", () => {
    const home = src("../routes/index.tsx");
    const css = src("../styles.css");
    const detail = src("../routes/plans_.$planId.tsx");

    assert.doesNotMatch(home, /plan-detail-enter|count-?up|autoplay|stagger/);
    assert.doesNotMatch(home, /plan-list-enter/);
    assert.doesNotMatch(detail, /countUp|CountUp|autoplay/);
    assert.doesNotMatch(css, /@keyframes (banner|count-?up|price-up|card-pop)/);
    assert.doesNotMatch(css, /animation:[^;]*infinite[^;]*plan-detail/);
    assert.match(home, /srcSet="\/images\/hero-home\.webp"/);
    assert.match(home, /fetchPriority="high"/);
  });
});
