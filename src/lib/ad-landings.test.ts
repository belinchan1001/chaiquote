import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AD_LANDINGS, getAdLanding, isAdTraffic } from "./ad-landings.ts";
import { filterPlans } from "./plan-filter.ts";
import { mergePortInSearch, toPortInSearch } from "./port-in.ts";
import { compactSearch, parsePlansSearch } from "./search.ts";
import { renderRobotsTxt } from "./seo.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("ad landings", () => {
  it("maps three Google Ads URLs onto plans search without excluding a carrier", () => {
    assert.equal(AD_LANDINGS.broadband.search.cat, "broadband");
    assert.equal(AD_LANDINGS.home5g.search.cat, "home5g");
    assert.equal(AD_LANDINGS.village.search.housing, "village");
    for (const landing of Object.values(AD_LANDINGS)) {
      assert.equal(landing.search.from, "ad");
      assert.equal(landing.search.exclude, undefined);
      const rows = filterPlans(landing.search);
      assert.ok(rows.length > 0, landing.path);
      assert.ok(rows.some((plan) => plan.providerId === "hkbn"), landing.path);
    }
    assert.equal(getAdLanding("broadband")?.path, "/go/broadband");
    assert.equal(getAdLanding("mobile"), undefined);
  });

  it("keeps from=ad through the URL parser and intake merges, and only excludes after current is set", () => {
    const parsed = parsePlansSearch({ cat: "broadband", from: "ad" });
    assert.equal(parsed.from, "ad");
    assert.equal(isAdTraffic(parsed), true);
    const kept = compactSearch(parsed);
    assert.equal(kept.from, "ad");
    const afterIntake = mergePortInSearch(parsed, {
      cat: "broadband",
      current: "hkbn",
      target: "all",
    });
    assert.equal(afterIntake.from, "ad");
    assert.equal(afterIntake.exclude, "hkbn");
    const hidden = filterPlans(afterIntake);
    assert.ok(hidden.every((plan) => plan.providerId !== "hkbn"));
    const open = toPortInSearch({ cat: "broadband" });
    assert.equal(open.exclude, undefined);
  });

  it("hides /go/ from robots and wires the edge redirects", () => {
    assert.match(renderRobotsTxt(), /Disallow: \/go\//);
    const vercel = readFileSync(join(here, "../../vercel.json"), "utf8");
    assert.match(vercel, /\/go\/broadband/);
    assert.match(vercel, /from=ad/);
    assert.match(vercel, /housing=village/);
    const route = readFileSync(join(here, "../routes/go_.$dest.tsx"), "utf8");
    assert.match(route, /getAdLanding/);
    const plans = readFileSync(join(here, "../routes/plans.tsx"), "utf8");
    assert.match(plans, /from === "ad"/);
  });
});
