import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

describe("filter chips", () => {
  it("marks selected chips without scaling the row", () => {
    const filters = readFileSync(join(here, "../components/filter-link.tsx"), "utf8");
    assert.match(filters, /filter-chip relative inline-flex h-11/);
    assert.match(filters, /selected === true && "filter-chip-on"/);
    assert.match(filters, /selected === false && "filter-chip-off"/);
    assert.match(filters, /opts\?\.provider && selected && "filter-chip-provider-on"/);
    assert.match(filters, /<ChipCheck \/>/);
    assert.doesNotMatch(filters, /scale-\[1\.08\]/);
    assert.doesNotMatch(filters, /active:scale-\[0\.96\]/);
  });

  it("uses selected state on plans filters and keeps list / compare animations untouched", () => {
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    const page = readFileSync(join(here, "../routes/plans.tsx"), "utf8");
    const filters = readFileSync(join(here, "../components/filter-link.tsx"), "utf8");
    const providers = readFileSync(join(here, "../components/provider-filter.tsx"), "utf8");
    const panel = readFileSync(join(here, "../components/search-panel.tsx"), "utf8");
    const compareBar = readFileSync(join(here, "../components/compare-bar.tsx"), "utf8");

    assert.match(filters, /className=\{chipClass\(selected\)\}/);
    assert.match(page, /selected=\{search\.cat === option\.id\}/);
    assert.match(page, /selected=\{!search\.housing\}/);
    assert.match(page, /selected=\{search\.housing === option\.id\}/);
    assert.match(page, /selected=\{!search\.speed\}/);
    assert.match(page, /selected=\{search\.speed === option\.speed\}/);
    assert.match(providers, /chipClass\(selected, \{ provider: Boolean\(logoId\) \}\)/);
    assert.match(providers, /<ChipCheck \/>/);
    assert.match(panel, /<label className=\{chipClass\(\)\}>/);
    assert.match(panel, /<ChipCheck \/>/);

    assert.match(css, /\.filter-chip-on/);
    assert.match(css, /background-size:\s*0% 100%/);
    assert.match(css, /background-size:\s*100% 100%/);
    assert.match(css, /background-size 160ms ease-out/);
    assert.match(css, /transform 120ms ease-out/);
    assert.match(css, /scale\(0\.97\)/);
    assert.doesNotMatch(css, /filter-chip[^{]*scale\(1\.08\)/);
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.filter-chip[\s\S]*transform:\s*none !important;[\s\S]*background-image:\s*none !important/,
    );

    assert.match(page, /plan-list-enter/);
    assert.match(page, /planListReplayKey\(search\)/);
    assert.doesNotMatch(compareBar, /filter-chip/);
    assert.doesNotMatch(page, /wa-pulse|whatsapp-pulse|tilt/);
  });
});
