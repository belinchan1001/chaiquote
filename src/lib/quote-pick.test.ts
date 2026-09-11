import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PLANS, getPlan } from "./plans.ts";

const FORBIDDEN = ["最優惠", "最平", "保證", "guarantee", "cheapest"];
const here = dirname(fileURLToPath(import.meta.url));

describe("齊Quote pick badge", () => {
  it("uses exact 齊Quote pick copy and never cheapest/guarantee wording", () => {
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const badges = readFileSync(join(here, "../components/plan-badges.tsx"), "utf8");
    assert.match(messages, /quotePick: "齊Quote 推介"/);
    assert.match(messages, /quotePick: "齊Quote pick"/);
    assert.match(messages, /齊Quote 推介/);
    assert.match(messages, /齊Quote pick/);
    assert.doesNotMatch(messages, /齊[Qq]oute/);
    assert.doesNotMatch(messages, /quotePick: "[^"]*[Qq]oute/);
    assert.match(badges, /👍 \{t\("quotePick"\)\}/);
    assert.match(badges, /quotePickClass = "[^"]*bg-fg[^"]*text-white/);
    assert.match(badges, /pillClass = "rounded-full bg-hot px-2 py-1 text-xs font-medium text-hot-foreground"/);
    assert.match(badges, /plan\.quotePick \? <span className=\{quotePickClass\}>👍 \{t\("quotePick"\)\}/);
    assert.match(badges, /plan\.latestOffer \? <span className=\{pillClass\}>\{t\("latestOffer"\)\}/);
    assert.match(badges, /plan\.hot \? <span className=\{pillClass\}>\{t\("hot"\)\}/);
    assert.match(badges, /intakeClass = "[^"]*bg-intake[^"]*text-intake-foreground"/);
    assert.match(messages, /newIntakeOffer: "新入伙優惠"/);
    assert.match(messages, /flashOffer: "超限定快閃優惠"/);
    assert.match(badges, /flashClass = "[^"]*bg-flash[^"]*text-flash-foreground"/);
    assert.doesNotMatch(badges, /最平|保證|最優惠/);

    for (const phrase of FORBIDDEN) {
      assert.equal(messages.includes(`quotePick: "${phrase}`), false, `forbidden: ${phrase}`);
      assert.equal(badges.includes(phrase), false, `forbidden in badge: ${phrase}`);
    }
  });

  it("flags hkbn-5g-30-78-youth and icable-ftth-1000-48m-58 without changing youth $78 terms", () => {
    const youth = getPlan("hkbn-5g-30-78-youth");
    assert.ok(youth);
    assert.equal(youth.quotePick, true);
    assert.equal(youth.monthlyFee, 78);
    assert.equal(youth.contractMonths, 24);
    assert.equal(youth.freeMonths, 0);
    assert.equal(youth.dataGb, 30);
    const icable = getPlan("icable-ftth-1000-48m-58");
    assert.ok(icable);
    assert.equal(icable.quotePick, true);
    assert.equal(icable.monthlyFee, 58);
    assert.deepEqual(
      PLANS.filter((plan) => plan.quotePick).map((plan) => plan.id),
      [
        "hkbn-ftth-1000-36m-98",
        "hkbn-ftth-1000-24m-199-mobile",
        "hkbn-ftth-2500-24m-149",
        "hkbn-ftth-10000-entertainment",
        "hkbn-ftth-1000-36m-99-intake",
        "hkbn-ftth-2500-24m-149-intake",
        "hkbn-ftth-2500-36m-149-intake",
        "hkbn-ftth-2x1000-36m-75-intake",
        "hkbn-village-2000-24m",
        "hgc-ftth-2000-hos-36m",
        "hgc-ftth-1000-private-39m",
        "netvigator-ftth-1000-private-36m",
        "netvigator-ftth-1000-public-36m-98",
        "netvigator-ftth-2500-public-36m-158",
        "netvigator-ftth-2500-private-36m-176",
        "icable-ftth-1000-48m-58",
        "hkbn-ftth-1000-24m-0-flash",
        "hkbn-ftth-2500-36m-148-flash",
        "hkbn-5g-30-78-youth",
      ],
    );
  });

  it("flags four HKBN fibre quote picks and leaves the gaming 10000M combo unmarked", () => {
    const picks = [
      "hkbn-ftth-2500-24m-149",
      "hkbn-ftth-10000-entertainment",
      "hkbn-village-2000-24m",
      "hkbn-ftth-1000-36m-98",
    ] as const;
    for (const id of picks) {
      const plan = getPlan(id);
      assert.ok(plan, `missing plan ${id}`);
      assert.equal(plan.quotePick, true, id);
    }

    const entertainment = getPlan("hkbn-ftth-10000-entertainment");
    assert.ok(entertainment);
    assert.equal(entertainment.monthlyFee, 998);
    assert.equal(entertainment.contractMonths, 24);
    assert.match(entertainment.name, /娛樂組合/);
    assert.doesNotMatch(entertainment.name, /遊戲路由器/);

    const gaming = getPlan("hkbn-ftth-10000-ge800");
    assert.ok(gaming);
    assert.equal(gaming.quotePick, undefined);
    assert.equal(gaming.monthlyFee, 998);
    assert.match(gaming.name, /遊戲路由器/);
  });

  it("flags two HGC fibre quote picks and leaves the same-fee public twins unmarked", () => {
    const private89 = getPlan("hgc-ftth-1000-private-39m");
    assert.ok(private89);
    assert.equal(private89.quotePick, true);
    assert.equal(private89.monthlyFee, 89);
    assert.equal(private89.contractMonths, 39);
    assert.match(private89.name, /私人樓宇 1000M/);

    const hos75 = getPlan("hgc-ftth-2000-hos-36m");
    assert.ok(hos75);
    assert.equal(hos75.quotePick, true);
    assert.equal(hos75.monthlyFee, 75);
    assert.equal(hos75.contractMonths, 36);
    assert.match(hos75.name, /新居屋／簡約公屋 2000M/);

    const public89 = getPlan("hgc-ftth-1000-public-39m");
    assert.ok(public89);
    assert.equal(public89.quotePick, undefined);
    assert.equal(public89.monthlyFee, 89);
    assert.match(public89.name, /公居屋 1000M/);

    const public75 = getPlan("hgc-ftth-1000-public-36m");
    assert.ok(public75);
    assert.equal(public75.quotePick, undefined);
    assert.equal(public75.monthlyFee, 75);
    assert.match(public75.name, /公居屋轉台 1000M/);
  });

  it("flags four Netvigator fibre quote picks and leaves the excluded twins unmarked", () => {
    const private2500 = getPlan("netvigator-ftth-2500-private-36m-176");
    assert.ok(private2500);
    assert.equal(private2500.quotePick, true);
    assert.equal(private2500.monthlyFee, 178);
    assert.equal(private2500.contractMonths, 36);
    assert.match(private2500.name, /私人樓宇 2500M 光纖/);

    const private1000 = getPlan("netvigator-ftth-1000-private-36m");
    assert.ok(private1000);
    assert.equal(private1000.quotePick, true);
    assert.equal(private1000.monthlyFee, 98);
    assert.match(private1000.name, /私人樓宇 1000M 光纖/);

    const public2500 = getPlan("netvigator-ftth-2500-public-36m-158");
    assert.ok(public2500);
    assert.equal(public2500.quotePick, true);
    assert.equal(public2500.monthlyFee, 158);
    assert.match(public2500.name, /公居屋 2500M 光纖/);

    const public1000 = getPlan("netvigator-ftth-1000-public-36m-98");
    assert.ok(public1000);
    assert.equal(public1000.quotePick, true);
    assert.equal(public1000.monthlyFee, 98);
    assert.match(public1000.name, /公居屋 1000M 光纖（36 個月）/);

    const excluded = [
      "netvigator-ftth-1000-public-36m-108",
      "netvigator-ftth-1000-public-36m-128",
      "netvigator-ftth-1000-exclusive-36m-186",
      "netvigator-ftth-2500-exclusive-36m-244",
      "netvigator-ftth-1000-private-36m-198",
      "netvigator-ftth-1000-private-36m-118",
      "netvigator-ftth-1000-private-36m-128",
    ] as const;
    for (const id of excluded) {
      const plan = getPlan(id);
      assert.ok(plan, `missing plan ${id}`);
      assert.equal(plan.quotePick, undefined, id);
    }
    assert.equal(getPlan("netvigator-ftth-1000-public-36m-108")?.monthlyFee, 108);
    assert.equal(getPlan("netvigator-ftth-1000-public-36m-128")?.monthlyFee, 128);
    assert.equal(getPlan("netvigator-ftth-1000-exclusive-36m-186")?.monthlyFee, 186);
    assert.equal(getPlan("netvigator-ftth-2500-exclusive-36m-244")?.monthlyFee, 244);
    assert.equal(getPlan("netvigator-ftth-1000-private-36m-118")?.monthlyFee, 108);
    assert.equal(getPlan("netvigator-ftth-1000-private-36m-128")?.monthlyFee, 128);
    assert.deepEqual(
      PLANS.filter((plan) => plan.providerId === "netvigator" && plan.quotePick).map((plan) => plan.id),
      [
        "netvigator-ftth-1000-private-36m",
        "netvigator-ftth-1000-public-36m-98",
        "netvigator-ftth-2500-public-36m-158",
        "netvigator-ftth-2500-private-36m-176",
      ],
    );
  });

  it("keeps the shine on card chrome and disables it for reduced motion", () => {
    const css = readFileSync(join(here, "../styles.css"), "utf8");
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");

    assert.match(card, /<article[\s\S]*plan\.quotePick && "plan-card-shine"/);
    assert.match(card, /plan\.quotePick \? <span className="foil"/);
    assert.match(card, /registerFoilCard/);
    assert.doesNotMatch(card, /is-featured/);
    assert.doesNotMatch(card, /formatFee\(plan\.monthlyFee\)[\s\S]{0,200}(plan-card-shine|className="foil")/);
    assert.doesNotMatch(card, /onPointerDown/);
    assert.doesNotMatch(card, /is-foil-sweep|playFoilSweep/);
    assert.doesNotMatch(card, /addEventListener\(\s*["']scroll["']/);
    assert.match(css, /@property --quote-pick-angle/);
    assert.match(css, /\.plan-card-shine\s*\{/);
    assert.match(css, /conic-gradient\(/);
    assert.match(css, /background-clip:\s*padding-box,\s*border-box/);
    assert.match(css, /background-origin:\s*padding-box,\s*border-box/);
    assert.match(css, /@keyframes quote-pick-shine/);
    assert.match(css, /--quote-pick-angle:\s*360deg/);
    assert.match(css, /border:\s*3px solid transparent/);
    assert.match(css, /animation:\s*quote-pick-shine 4\.8s linear infinite/);
    assert.match(css, /rgba\(196, 230, 255, 0\.72\) 0deg/);
    assert.match(css, /rgba\(196, 230, 255, 0\.72\) 292deg/);
    assert.match(css, /rgba\(165, 243, 252, 0\.92\) 308deg/);
    assert.match(css, /rgba\(255, 255, 255, 1\) 324deg/);
    assert.match(css, /rgba\(221, 214, 254, 0\.95\) 336deg/);
    assert.match(css, /rgba\(186, 230, 253, 1\) 348deg/);
    assert.match(
      css,
      /prefers-reduced-motion:[\s\S]*\.plan-card-shine[\s\S]*rgba\(165, 243, 252, 0\.92\)[\s\S]*rgba\(255, 255, 255, 1\)[\s\S]*rgba\(221, 214, 254, 0\.95\)/,
    );
    assert.doesNotMatch(css, /rgba\(12, 48, 118/);
    assert.doesNotMatch(css, /rgba\(0, 110, 150/);
    assert.doesNotMatch(css, /rgba\(15, 70, 150/);
    assert.doesNotMatch(css, /border:\s*2px solid transparent/);
    assert.doesNotMatch(css, /quote-pick-shine 3\.2s/);
    assert.doesNotMatch(css, /rgba\(21, 87, 196, 0\.55\)/);
    assert.doesNotMatch(css, /background-size:\s*240%/);
    assert.doesNotMatch(css, /background-position:\s*130%/);
    assert.doesNotMatch(
      css,
      /@keyframes quote-pick-shine\s*\{[^}]*(opacity|transform|filter|background-position)/,
    );
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-card-shine[\s\S]*animation:\s*none/,
    );
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-card-shine::before[\s\S]*animation:\s*none/,
    );

    const foil =
      [...css.matchAll(/\.plan-card-shine > \.foil\s*\{([^}]+)\}/g)]
        .map((match) => match[1])
        .find((block) => /linear-gradient/.test(block)) ?? "";
    assert.match(css, /\.plan-card-shine > \.foil\s*\{/);
    assert.match(foil, /pointer-events:\s*none/);
    assert.match(foil, /inset:\s*3px/);
    assert.match(foil, /linear-gradient/);
    assert.match(foil, /mix-blend-mode:\s*normal/);
    assert.doesNotMatch(foil, /mix-blend-mode:\s*overlay/);
    assert.doesNotMatch(css, /mix-blend-mode:\s*overlay/);
    assert.match(foil, /rgba\(186, 230, 253/);
    assert.match(foil, /rgba\(255, 255, 255/);
    assert.match(foil, /rgba\(221, 214, 254/);
    assert.match(foil, /rgba\(251, 207, 232/);
    assert.doesNotMatch(foil, /animation:/);
    assert.match(foil, /opacity:\s*var\(--foil-opacity\)/);
    assert.match(foil, /var\(--foil-x\)\s+var\(--foil-y\)/);
    assert.doesNotMatch(css, /@keyframes foil-sweep/);
    assert.doesNotMatch(css, /\.plan-card-shine:hover[^\n]*\.foil[\s\S]*animation:\s*foil-sweep/);
    assert.doesNotMatch(css, /\.is-foil-sweep/);
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-card-shine > \.foil[\s\S]*opacity:\s*0\.1/,
    );
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.plan-card-shine > \.foil[\s\S]*animation:\s*none/,
    );
    assert.match(css, /\.plan-card-shine > \*\s*\{[\s\S]*z-index:\s*1/);
    assert.match(css, /\.plan-card-shine > \.foil\s*\{[\s\S]*z-index:\s*0/);
    assert.doesNotMatch(css, /\.is-featured/);
    assert.doesNotMatch(css, /\.plan-card-shine\s*\{[^}]*animation:[^;}]*opacity/);
  });
});
