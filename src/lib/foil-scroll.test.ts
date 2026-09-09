import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  FOIL_DESKTOP_FLOOR,
  FOIL_DESKTOP_PEAK,
  FOIL_MAX_FULL,
  FOIL_TOUCH_FLOOR,
  FOIL_TOUCH_PEAK,
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
    const phoneEdge = foilOpacity(0, 0, true);
    const fourth = foilOpacity(1, FOIL_MAX_FULL, false);
    assert.equal(desktopCenter, FOIL_DESKTOP_PEAK);
    assert.equal(phoneCenter, FOIL_TOUCH_PEAK);
    assert.equal(phoneEdge, FOIL_TOUCH_FLOOR);
    assert.ok(phoneCenter > 0.26, `phone peak ${phoneCenter} must be painted, not the old overlay-faint 0.26`);
    assert.ok(phoneCenter >= 0.34, `phone peak ${phoneCenter} must be obviously visible on a white card`);
    assert.ok(phoneCenter < desktopCenter, "phone can stay a bit weaker than desktop");
    assert.ok(phoneEdge >= 0.1, `phone floor ${phoneEdge} must still read as a sheen`);
    assert.ok(FOIL_TOUCH_PEAK > FOIL_DESKTOP_FLOOR);
    assert.ok(fourth < desktopCenter * 0.4);
    assert.ok(foilOpacity(0, 0, false) < 0.12);
    assert.equal(foilOpacity(0, 0, false), FOIL_DESKTOP_FLOOR);
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

    assert.equal(
      [...driver.matchAll(/addEventListener\(\s*["']scroll["']/g)].length,
      3,
      "one shared driver: window, document, visualViewport",
    );
    assert.match(driver, /window\.addEventListener\(\s*["']scroll["'][\s\S]*FOIL_SCROLL_OPTS/);
    assert.match(driver, /document\.addEventListener\(\s*["']scroll["'][\s\S]*FOIL_SCROLL_OPTS/);
    assert.match(driver, /visualViewport\?\.addEventListener\(\s*["']scroll["']/);
    assert.match(driver, /capture:\s*true/);
    assert.match(driver, /document\.removeEventListener\(\s*["']scroll["']/);
    assert.match(driver, /requestAnimationFrame/);
    assert.match(driver, /IntersectionObserver/);
    assert.match(driver, /--foil-opacity/);
    assert.match(driver, /--foil-x/);
    assert.match(driver, /--foil-y/);
    assert.match(driver, /prefers-reduced-motion/);
    assert.match(driver, /pointer:\s*coarse/);
    assert.match(driver, /FOIL_MAX_FULL = 3/);
    assert.match(driver, /FOIL_TOUCH_PEAK = 0\.36/);
    assert.doesNotMatch(driver, /setInterval/);
    assert.doesNotMatch(driver, /is-foil-sweep/);
    assert.doesNotMatch(driver, /0\.26/);

    assert.match(css, /opacity:\s*var\(--foil-opacity\)/);
    assert.match(css, /var\(--foil-x\)\s+var\(--foil-y\)/);
    assert.match(css, /mix-blend-mode:\s*normal/);
    assert.doesNotMatch(css, /mix-blend-mode:\s*overlay/);
    assert.doesNotMatch(css, /@keyframes foil-sweep/);
    assert.doesNotMatch(css, /\.plan-card-shine:hover[^\n]*\.foil[\s\S]*animation:\s*foil-sweep/);
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-card-shine > \.foil[\s\S]*opacity:\s*0\.1/,
    );
  });
});
