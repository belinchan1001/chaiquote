import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { filterPlans } from "./plan-filter.ts";
import {
  addressRequired,
  currentOptions,
  excludeProvider,
  FIBRE_SPEEDS,
  fromPortInSearch,
  generateWhatsAppLink,
  isTargetConflict,
  mergePortInSearch,
  portInQuoteMessage,
  resolveTargetProvider,
  targetOptions,
  toPortInSearch,
} from "./port-in.ts";
import { parsePlansSearch, compactSearch } from "./search.ts";

describe("port-in intake", () => {
  it("requires an address only for fibre", () => {
    assert.equal(addressRequired("broadband"), true);
    assert.equal(addressRequired("home5g"), false);
    assert.equal(addressRequired("business"), false);
    assert.equal(addressRequired("mobile"), false);
  });

  it("drops 500M and treats any-speed as no minimum", () => {
    assert.equal(
      FIBRE_SPEEDS.map((item) => item.id).includes("500" as (typeof FIBRE_SPEEDS)[number]["id"]),
      false,
    );
    assert.deepEqual(
      FIBRE_SPEEDS.map((item) => item.id),
      ["any", "1000", "2500"],
    );
    const search = toPortInSearch({ cat: "broadband", current: "hkbn", fibreSpeed: "any" });
    assert.equal(search.minSpeed, undefined);
    assert.equal(search.exclude, "hkbn");
  });

  it("does not send housing for business or a speed filter for 5G home", () => {
    const business = toPortInSearch({
      cat: "business",
      housing: "private",
      fibreSpeed: "1000",
      current: "hkbn",
    });
    assert.equal(business.housing, undefined);
    assert.equal(business.minSpeed, undefined);
    const home5g = toPortInSearch({
      cat: "home5g",
      housing: "village",
      fibreSpeed: "2500",
      current: "cmhk",
    });
    assert.equal(home5g.housing, "village");
    assert.equal(home5g.minSpeed, undefined);
  });

  it("keeps 電競神線 as 2500M+ with the glow flag", () => {
    const search = toPortInSearch({
      cat: "broadband",
      current: "hkbn",
      esports: true,
    });
    assert.equal(search.minSpeed, 2500);
    assert.equal(search.esports, true);
    assert.equal(search.sort, "speed");
    const rows = filterPlans(search);
    assert.ok(rows.length > 0);
    assert.equal(rows.every((plan) => plan.providerId !== "hkbn"), true);
    assert.equal(rows.every((plan) => (plan.speedMbps ?? 0) >= 2500), true);
  });

  it("excludes the current provider from fibre results", () => {
    const search = toPortInSearch({
      cat: "broadband",
      current: "hkbn",
      fibreSpeed: "2500",
    });
    assert.equal(search.exclude, "hkbn");
    assert.equal(search.minSpeed, 2500);
    const rows = filterPlans(search);
    assert.ok(rows.length > 0);
    assert.equal(rows.every((plan) => plan.providerId !== "hkbn"), true);
    assert.equal(rows.every((plan) => (plan.speedMbps ?? 0) >= 2500), true);
  });

  it("does not exclude a provider for new-line or other", () => {
    assert.equal(excludeProvider("none"), undefined);
    assert.equal(excludeProvider("other"), undefined);
    const rows = filterPlans(toPortInSearch({ cat: "broadband", current: "none" }));
    assert.ok(rows.some((plan) => plan.providerId === "hkbn"));
  });

  it("maps mobile needs onto existing filters", () => {
    assert.equal(toPortInSearch({ cat: "mobile", current: "csl", mobileNeed: "5g" }).generation, "5g");
    assert.equal(toPortInSearch({ cat: "mobile", current: "csl", mobileNeed: "mnp" }).portIn, true);
    assert.equal(toPortInSearch({ cat: "mobile", current: "csl", mobileNeed: "gba" }).gba, true);
    const rows = filterPlans(toPortInSearch({ cat: "mobile", current: "csl" }));
    assert.ok(rows.length > 0);
    assert.equal(rows.every((plan) => plan.providerId !== "csl"), true);
  });

  it("keeps the exclude flag in the URL search object", () => {
    const parsed = parsePlansSearch({ cat: "broadband", exclude: "hkbn" });
    assert.equal(parsed.exclude, "hkbn");
    assert.equal(compactSearch(parsed).exclude, "hkbn");
  });

  it("syncs expiry and esports onto the URL search object", () => {
    const search = toPortInSearch({
      cat: "broadband",
      current: "hkbn",
      esports: true,
      expiry: "1m",
    });
    assert.equal(search.expiry, "1m");
    assert.equal(search.esports, true);
    const compact = compactSearch(search);
    assert.equal(compact.expiry, "1m");
    assert.equal(compact.esports, true);
    assert.equal(compact.exclude, "hkbn");
    const parsed = parsePlansSearch({ cat: "broadband", expiry: "1m", esports: "1", exclude: "hkbn" });
    assert.equal(parsed.expiry, "1m");
    assert.equal(parsed.esports, true);
    assert.equal(parsed.exclude, "hkbn");
  });

  it("uses category-specific current-provider lists and business dedicated speed", () => {
    assert.equal(
      currentOptions("broadband").some((item) => item.id === "three"),
      false,
    );
    assert.equal(
      currentOptions("home5g").some((item) => item.id === "three"),
      true,
    );
    assert.equal(
      currentOptions("business").some((item) => item.id === "other"),
      true,
    );
    assert.equal(
      currentOptions("mobile").some((item) => item.id === "none" && item.label === "新號碼"),
      true,
    );
    assert.equal(excludeProvider("none"), undefined);
    const newNumber = filterPlans(toPortInSearch({ cat: "mobile", current: "none" }));
    assert.ok(newNumber.length > 0);
    assert.equal(new Set(newNumber.map((plan) => plan.providerId)).size > 1, true);
    const dedicated = toPortInSearch({
      cat: "business",
      current: "hkbn",
      businessSpeed: "dedicated",
    });
    assert.equal(dedicated.minSpeed, 2500);
    assert.equal(dedicated.housing, undefined);
    assert.equal(dedicated.exclude, "hkbn");
  });

  it("filters to a preferred target provider that is not the current one", () => {
    assert.equal(isTargetConflict("hkbn", "hkbn"), true);
    assert.equal(isTargetConflict("hkbn", "netvigator"), false);
    assert.equal(isTargetConflict("none", "hkbn"), false);
    assert.equal(resolveTargetProvider("hkbn", "hkbn"), undefined);
    assert.equal(resolveTargetProvider("hkbn", "all"), undefined);
    assert.equal(resolveTargetProvider("hkbn", "netvigator"), "netvigator");
    assert.equal(
      targetOptions("broadband").some((item) => item.id === "csl"),
      false,
    );
    assert.equal(
      targetOptions("mobile").some((item) => item.id === "icable"),
      false,
    );
    const search = toPortInSearch({
      cat: "broadband",
      current: "hkbn",
      target: "netvigator",
      fibreSpeed: "1000",
    });
    assert.equal(search.exclude, "hkbn");
    assert.equal(search.provider, "netvigator");
    const rows = filterPlans(search);
    assert.ok(rows.length > 0);
    assert.equal(
      rows.every((plan) => plan.providerId === "netvigator"),
      true,
    );
  });

  it("round-trips intake fields onto the shared plans search", () => {
    const built = toPortInSearch({
      cat: "broadband",
      current: "hkbn",
      target: "netvigator",
      fibreSpeed: "1000",
      expiry: "1m",
    });
    const parsed = fromPortInSearch(built);
    assert.equal(parsed.current, "hkbn");
    assert.equal(parsed.target, "netvigator");
    assert.equal(parsed.fibreSpeed, "1000");
    assert.equal(parsed.expiry, "1m");
    const merged = mergePortInSearch(
      { cat: "broadband", q: "光纖", saved: true },
      {
        cat: "mobile",
        current: "csl",
        target: "cmhk",
        mobileNeed: "5g",
        expiry: "2-3m",
      },
    );
    assert.equal(merged.cat, "mobile");
    assert.equal(merged.exclude, "csl");
    assert.equal(merged.provider, "cmhk");
    assert.equal(merged.generation, "5g");
    assert.equal(merged.q, "光纖");
    assert.equal(merged.saved, true);
    assert.equal(merged.minSpeed, undefined);
  });

  it("drops a conflicting target provider from the URL search object", () => {
    const search = toPortInSearch({
      cat: "broadband",
      current: "hkbn",
      target: "hkbn",
    });
    assert.equal(search.exclude, "hkbn");
    assert.equal(search.provider, undefined);
    const parsed = parsePlansSearch({ cat: "broadband", exclude: "hkbn", provider: "hkbn" });
    assert.equal(parsed.exclude, "hkbn");
    assert.equal(parsed.provider, undefined);
    const kept = parsePlansSearch({ cat: "broadband", exclude: "hkbn", provider: "netvigator" });
    assert.equal(kept.provider, "netvigator");
    assert.equal(compactSearch(kept).provider, "netvigator");
  });

  it("builds a structured WhatsApp link for sales", () => {
    const text = portInQuoteMessage({
      serviceType: "光纖寬頻",
      address: "太古城",
      housing: "私人樓",
      currentProvider: "香港寬頻",
      targetProvider: "網上行 (HKT)",
      expiry: "1個月內",
      need: "2.5G / 10G",
      planName: "2500M 光纖",
      monthlyFee: 149,
      esports: true,
      source: "filter",
    });
    assert.match(text, /轉台獨家優惠/);
    assert.match(text, /太古城/);
    assert.match(text, /香港寬頻 \(轉台客戶\)/);
    assert.match(text, /指定心水電訊商：網上行 \(HKT\)/);
    assert.match(text, /2500M 光纖 \(HK\$149\/月\)/);
    assert.match(text, /需要電競神線/);
    assert.match(text, /篩選方式：手動條件篩選/);
    const open = portInQuoteMessage({
      serviceType: "光纖寬頻",
      currentProvider: "網上行",
      expiry: "2–3個月內",
      need: "1000M / 1G",
    });
    assert.match(open, /指定心水電訊商：不限 \(請推薦最抵方案\)/);
    const href = generateWhatsAppLink({
      serviceType: "光纖寬頻",
      currentProvider: "網上行",
      expiry: "2–3個月內",
      need: "1000M / 1G",
    });
    assert.match(href, /api\.whatsapp\.com\/send/);
    assert.match(href, /text=/);
    assert.match(href, /85263099966/);
    const newNumber = portInQuoteMessage({
      serviceType: "手機月費",
      currentProvider: "新號碼",
      expiry: "半年以上／不清楚",
      need: "5G 全速無限",
    });
    assert.match(newNumber, /現時電訊商：新號碼 \(新號碼\)/);
    assert.doesNotMatch(newNumber, /轉台客戶/);
  });
});
