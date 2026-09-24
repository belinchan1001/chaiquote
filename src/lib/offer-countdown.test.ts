import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { flashBookByLabel } from "./plans.ts";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

describe("flash offer countdown clock", () => {
  it("renders an LED digital clock with inline copy, not i18n key names", () => {
    const clock = readFileSync(join(here, "../components/offer-countdown.tsx"), "utf8");
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    assert.match(clock, /flashBookByLabel\(plan\.offerEndsAt/);
    assert.equal(flashBookByLabel("2026-09-30T23:59:59+08:00", "zh"), "須於 9 月 30 日前成功預約安裝");
    assert.equal(flashBookByLabel("2026-09-29T23:59:59+08:00", "zh"), "須於 9 月 29 日前成功預約安裝");
    assert.equal(flashBookByLabel("2026-09-29T23:59:59+08:00", "en"), "Must book installation by 29 Sep");
    assert.match(clock, /units: \["日", "時", "分", "秒"\]/);
    assert.match(clock, /className="digital-clock /);
    assert.match(clock, /digital-clock-digit/);
    assert.match(clock, /digital-clock-colon/);
    assert.match(clock, /setInterval\(tick, 1000\)/);
    assert.doesNotMatch(clock, /t\("flashBookBy"\)/);
    assert.doesNotMatch(clock, /t\("flashCountdown"/);
    assert.doesNotMatch(clock, />\{t\(/);
    assert.doesNotMatch(clock, /bg-flash/);
    assert.match(css, /\.digital-clock\s*\{/);
    assert.match(css, /background:\s*#12100c/);
    assert.match(css, /color:\s*#ffcc4d/);
    assert.match(css, /@keyframes digital-colon-blink/);
    assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*\.digital-clock-colon/);
  });
});
