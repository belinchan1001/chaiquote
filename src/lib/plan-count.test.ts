import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PLAN_COUNT } from "./plan-count.ts";
import { PLANS, PROVIDERS } from "./plans.ts";
import { ESTATE_COUNT } from "./estate-count.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("plan-count", () => {
  it("stays in lockstep with the live catalogue", () => {
    assert.equal(PLAN_COUNT, PLANS.length);
    assert.equal(PROVIDERS.length, 8);
    assert.equal(ESTATE_COUNT, 3729);
    const home = readFileSync(join(here, "../routes/index.tsx"), "utf8");
    assert.match(home, /HOME_PROVIDER_COUNT = 8/);
    assert.match(home, /providers: HOME_PROVIDER_COUNT/);
    assert.doesNotMatch(home, /from "@\/lib\/plans"/);
  });
});
