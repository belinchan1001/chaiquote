import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

describe("WhatsApp pulse", () => {
  it("pulses header and fab with a faint 8s ring, not plan cards", () => {
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    const quote = readFileSync(join(here, "../components/quote-link.tsx"), "utf8");
    const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
    const widget = readFileSync(join(here, "../components/whatsapp-widget.tsx"), "utf8");
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const page = readFileSync(join(here, "../routes/plans.tsx"), "utf8");
    const filters = readFileSync(join(here, "../components/filter-link.tsx"), "utf8");
    const compareBar = readFileSync(join(here, "../components/compare-bar.tsx"), "utf8");

    assert.match(quote, /pulse\?: "header"/);
    assert.match(quote, /pulse === "header" && "wa-pulse wa-pulse-header"/);
    assert.match(header, /pulse="header"/);
    assert.match(header, /waHeaderShort/);
    assert.match(header, /max-sm:h-11 max-sm:w-11/);
    assert.match(header, /max-sm:w-20/);
    assert.match(widget, /wa-pulse wa-pulse-fab/);
    assert.doesNotMatch(card, /wa-pulse/);
    assert.doesNotMatch(page, /wa-pulse|whatsapp-pulse|tilt/);
    assert.doesNotMatch(quote, /whatsappHref\([^)]*pulse/);

    assert.match(css, /@keyframes wa-pulse-ring/);
    assert.match(css, /animation:\s*wa-pulse-ring 8s ease-out infinite/);
    assert.match(css, /box-shadow:\s*0px 0px 0px 6px rgb\(18 140 126 \/ 0\.4\)/);
    assert.match(css, /box-shadow:\s*0px 0px 0px 0\.01px rgb\(18 140 126 \/ 0\)/);
    assert.match(css, /\.wa-pulse::after[\s\S]*pointer-events:\s*none/);
    assert.doesNotMatch(css, /\.wa-pulse[^{]*\{[^}]*scale\(/);
    assert.match(css, /\.wa-pulse:hover::after/);
    assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*\.wa-pulse::after[\s\S]*animation:\s*none !important/);
    assert.match(css, /@media \(max-width: 639px\)[\s\S]*\.wa-pulse-header::after[\s\S]*animation:\s*none/);

    assert.match(page, /plan-list-enter/);
    assert.match(filters, /chip-press/);
    assert.doesNotMatch(compareBar, /wa-pulse/);
  });
});
