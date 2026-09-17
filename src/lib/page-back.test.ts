import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

describe("plans page back button", () => {
  it("puts a previous-page back control at the top of the filter results", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const plans = readFileSync(join(here, "../routes/plans.tsx"), "utf8");
    const button = readFileSync(join(here, "../components/page-back.tsx"), "utf8");
    assert.match(messages, /backPrev:\s*"返回"/);
    assert.match(messages, /backPrev:\s*"Back"/);
    assert.match(plans, /<PageBackButton \/>/);
    assert.match(button, /history\.canGoBack/);
    assert.match(button, /navigate\(\{\s*to:\s*"\/"/);
    assert.match(button, /ArrowLeft/);
  });
});
