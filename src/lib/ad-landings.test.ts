import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { customerInquiryLine, touchFromSearch } from "./ads-attribution.ts";
import { AD_LANDINGS, getAdLanding, isAdTraffic } from "./ad-landings.ts";
import { filterPlans } from "./plan-filter.ts";
import { mergePortInSearch, toPortInSearch } from "./port-in.ts";
import { compactSearch, parsePlansSearch } from "./search.ts";
import { renderRobotsTxt } from "./seo.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("ad landings", () => {
  it("maps Google Ads URLs onto plans search without excluding a carrier", () => {
    assert.equal(AD_LANDINGS.broadband.search.cat, "broadband");
    assert.equal(AD_LANDINGS.home5g.search.cat, "home5g");
    assert.equal(AD_LANDINGS.village.search.housing, "village");
    assert.equal(AD_LANDINGS.public.search.housing, "public");
    assert.equal(AD_LANDINGS.private.search.housing, "private");
    for (const landing of Object.values(AD_LANDINGS)) {
      assert.equal(landing.search.from, "ad");
      assert.equal(landing.search.exclude, undefined);
      const rows = filterPlans(landing.search);
      assert.ok(rows.length > 0, landing.path);
      assert.ok(rows.some((plan) => plan.providerId === "hkbn"), landing.path);
    }
    const publicRows = filterPlans(AD_LANDINGS.public.search);
    assert.ok(publicRows.every((plan) => plan.housing === "all" || plan.housing.includes("public")));
    assert.equal(getAdLanding("broadband")?.path, "/go/broadband");
    assert.equal(getAdLanding("private")?.path, "/go/private");
    assert.equal(getAdLanding("hkbn")?.path, "/go/hkbn");
    assert.equal(getAdLanding("mobile"), undefined);
    assert.equal(AD_LANDINGS.broadband.search.provider, undefined);
    assert.equal(AD_LANDINGS.village.search.provider, undefined);
    assert.equal(AD_LANDINGS.public.search.provider, undefined);
    assert.equal(AD_LANDINGS.private.search.provider, undefined);
    assert.deepEqual(AD_LANDINGS.hkbn.search, { cat: "broadband", provider: "hkbn", from: "ad" });
    const hkbnRows = filterPlans(AD_LANDINGS.hkbn.search);
    assert.ok(hkbnRows.length > 0);
    assert.ok(hkbnRows.every((plan) => plan.category === "broadband" && plan.providerId === "hkbn"));
    const hkbnParsed = parsePlansSearch({ ...AD_LANDINGS.hkbn.search });
    assert.equal(isAdTraffic(hkbnParsed), true);
    assert.deepEqual(compactSearch(hkbnParsed), { cat: "broadband", provider: "hkbn", from: "ad" });
    assert.equal(
      customerInquiryLine(touchFromSearch("?cat=broadband&provider=hkbn&from=ad")),
      "【查詢】家居寬頻 #2",
    );
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
    const robots = renderRobotsTxt();
    assert.match(robots, /Disallow: \/go\//);
    assert.doesNotMatch(robots, /Allow: \/go/);
    const vercel = JSON.parse(readFileSync(join(here, "../../vercel.json"), "utf8")) as {
      redirects: { source: string; destination: string; statusCode: number }[];
    };
    const go = Object.fromEntries(
      vercel.redirects.filter((rule) => rule.source.startsWith("/go/")).map((rule) => [rule.source, rule]),
    );
    assert.deepEqual(go["/go/broadband"], {
      source: "/go/broadband",
      destination: "/plans?cat=broadband&from=ad",
      statusCode: 302,
    });
    assert.deepEqual(go["/go/home5g"], {
      source: "/go/home5g",
      destination: "/plans?cat=home5g&from=ad",
      statusCode: 302,
    });
    assert.deepEqual(go["/go/village"], {
      source: "/go/village",
      destination: "/plans?cat=broadband&housing=village&from=ad",
      statusCode: 302,
    });
    assert.deepEqual(go["/go/public"], {
      source: "/go/public",
      destination: "/plans?cat=broadband&housing=public&from=ad",
      statusCode: 302,
    });
    assert.deepEqual(go["/go/private"], {
      source: "/go/private",
      destination: "/plans?cat=broadband&housing=private&from=ad",
      statusCode: 302,
    });
    assert.deepEqual(go["/go/hkbn"], {
      source: "/go/hkbn",
      destination: "/plans?cat=broadband&provider=hkbn&from=ad",
      statusCode: 302,
    });
    for (const landing of Object.values(AD_LANDINGS)) {
      const rule = go[landing.path];
      assert.ok(rule, landing.path);
      const dest = new URL(`https://www.chaiquote.hk${rule.destination}`);
      assert.equal(dest.pathname, "/plans");
      assert.equal(dest.searchParams.get("cat"), landing.search.cat);
      assert.equal(dest.searchParams.get("from"), "ad");
      assert.equal(dest.searchParams.get("housing"), landing.search.housing ?? null);
      assert.equal(dest.searchParams.get("provider"), landing.search.provider ?? null);
    }
    const route = readFileSync(join(here, "../routes/go_.$dest.tsx"), "utf8");
    assert.match(route, /getAdLanding/);
    const plans = readFileSync(join(here, "../routes/plans.tsx"), "utf8");
    assert.doesNotMatch(plans, /由廣告入嚟|From an ad/);
  });
});
