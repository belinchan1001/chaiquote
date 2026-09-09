import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  FOIL_MAX_FULL,
  foilOpacity,
  foilPosition,
  foilProgress,
  foilProximity,
  isFoilOnScreen,
} from "./foil-scroll.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("scroll-driven 齊Quote foil", () => {
  it("maps a card moving up the viewport to a top-left → bottom-right highlight", () => {
    const vh = 800;
    const height = 200;
    const entering = foilProgress({ top: vh, height }, vh);
    const leaving = foilProgress({ top: -height, height }, vh);
    const mid = foilProgress({ top: (vh - height) / 2, height }, vh);
    assert.ok(entering < 0.08, `enter progress ${entering}`);
    assert.ok(leaving > 0.92, `leave progress ${leaving}`);
    assert.ok(mid > entering && mid < leaving);
    const start = foilPosition(0);
    const end = foilPosition(1);
    assert.ok(start.x < end.x && start.y < end.y);
    assert.equal(isFoilOnScreen({ top: vh + 10, height }, vh), false);
    assert.equal(isFoilOnScreen({ top: -height - 10, height }, vh), false);
    assert.equal(isFoilOnScreen({ top: 120, height }, vh), true);
  });

  it("peaks near the viewport middle and fades farther cards plus a 4th pick", () => {
    const vh = 800;
    const height = 200;
    const centered = foilProximity({ top: (vh - height) / 2, height }, vh);
    const edge = foilProximity({ top: 0, height }, vh);
    assert.ok(centered > 0.95, `center proximity ${centered}`);
    assert.ok(edge < centered);
    const desktopCenter = foilOpacity(1, 0, false);
    const phoneCenter = foilOpacity(1, 0, true);
    const fourth = foilOpacity(1, FOIL_MAX_FULL, false);
    assert.ok(desktopCenter <= 0.4 && desktopCenter > 0.3);
    assert.ok(phoneCenter < desktopCenter);
    assert.ok(fourth < desktopCenter * 0.4);
    assert.ok(foilOpacity(0, 0, false) < 0.12);
  });

  it("uses one shared rAF scroll driver and CSS variables, not hover or a one-shot sweep", () => {
    const driver = readFileSync(join(here, "foil-scroll.ts"), "utf8");
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const css = readFileSync(join(here, "../styles.css"), "utf8");

    assert.match(card, /registerFoilCard/);
    assert.match(card, /plan\.quotePick && "plan-card-shine"/);
    assert.match(card, /plan\.quotePick \? <span className="foil"/);
    assert.doesNotMatch(card, /addEventListener\(\s*["']scroll["']/);
    assert.doesNotMatch(card, /onPointerDown/);
    assert.doesNotMatch(card, /is-foil-sweep|playFoilSweep/);
    assert.doesNotMatch(card, /is-featured/);

    assert.ok(
      [...driver.matchAll(/addEventListener\(\s*["']scroll["']/g)].length <= 2,
      "scroll listeners belong on the shared driver, not each card",
    );
    assert.match(driver, /requestAnimationFrame/);
    assert.match(driver, /IntersectionObserver/);
    assert.match(driver, /--foil-opacity/);
    assert.match(driver, /--foil-x/);
    assert.match(driver, /--foil-y/);
    assert.match(driver, /prefers-reduced-motion/);
    assert.match(driver, /pointer:\s*coarse/);
    assert.match(driver, /FOIL_MAX_FULL = 3/);
    assert.doesNotMatch(driver, /setInterval/);
    assert.doesNotMatch(driver, /is-foil-sweep/);

    assert.match(css, /opacity:\s*var\(--foil-opacity\)/);
    assert.match(css, /var\(--foil-x\)\s+var\(--foil-y\)/);
    assert.doesNotMatch(css, /@keyframes foil-sweep/);
    assert.doesNotMatch(css, /\.plan-card-shine:hover[^\n]*\.foil[\s\S]*animation:\s*foil-sweep/);
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-card-shine > \.foil[\s\S]*opacity:\s*0\.1/,
    );
  });
});
