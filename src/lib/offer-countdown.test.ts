import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

describe("flash offer countdown clock", () => {
  it("renders digit tiles with inline copy, not i18n key names", () => {
    const clock = readFileSync(join(here, "../components/offer-countdown.tsx"), "utf8");
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    assert.match(clock, /須於 9 月 30 日前成功預約安裝/);
    assert.match(clock, /units: \["日", "時", "分", "秒"\]/);
    assert.match(clock, /font-display text-xl font-bold tabular-nums/);
    assert.match(clock, /countdown-sec/);
    assert.match(clock, /setInterval\(tick, 1000\)/);
    assert.doesNotMatch(clock, /t\("flashBookBy"\)/);
    assert.doesNotMatch(clock, /t\("flashCountdown"/);
    assert.doesNotMatch(clock, />\{t\(/);
    assert.match(css, /\.countdown-sec\s*\{/);
    assert.match(css, /@keyframes countdown-sec-tick/);
    assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*\.countdown-sec/);
  });
});
