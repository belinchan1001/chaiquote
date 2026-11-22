import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  daysUntil,
  isSpendKind,
  monthlyTotal,
  normalizeItem,
  parseMoney,
  readSpendLedger,
  soonestExpiry,
  SPEND_STORAGE_KEY,
  writeSpendLedger,
} from "./spend-ledger.ts";
import {
  compareSearchFor,
  expiryFromEndDate,
  inquiryPatchFromSpendItem,
  prefillFromPlan,
  providerIdFromName,
  referenceMonthlyFee,
  referencePlansFor,
  referenceSavingNote,
  spendFeeCheckText,
  spendFormIsCollapsed,
  spendFormIssue,
} from "./spend-compare.ts";
import { portInQuoteFromInquiry, staffExpiryText } from "./port-in.ts";
import { getPlan } from "./plans.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("spend ledger", () => {
  it("parses money and kinds", () => {
    assert.equal(parseMoney("$168.4"), 168.4);
    assert.equal(parseMoney("x"), 0);
    assert.equal(isSpendKind("ott"), true);
    assert.equal(isSpendKind("paytv"), true);
    assert.equal(isSpendKind("wifi"), false);
  });

  it("sums monthly fees and finds the next end date", () => {
    const items = [
      normalizeItem({ kind: "broadband", monthly: 168, endDate: "2026-12-01", provider: "HKBN" }),
      normalizeItem({ kind: "mobile", monthly: 98, endDate: "2026-10-01", provider: "CMHK" }),
      normalizeItem({ kind: "paytv", monthly: 199, endDate: "2026-11-01", provider: "Now TV" }),
      normalizeItem({ kind: "ott", monthly: 48, endDate: "", provider: "Netflix" }),
    ];
    assert.equal(monthlyTotal(items), 513);
    assert.equal(soonestExpiry(items, "2026-09-20")?.provider, "CMHK");
    assert.equal(daysUntil("2026-10-20", "2026-09-20"), 30);
  });

  it("keeps fibre speed and maps a compare search", () => {
    const item = normalizeItem({
      kind: "broadband",
      provider: "香港寬頻",
      monthly: 168,
      speedPreset: "1000",
      endDate: "2026-10-01",
    });
    assert.equal(item.speedPreset, "1000");
    assert.equal(providerIdFromName("香港寬頻"), "hkbn");
    const search = compareSearchFor(item);
    assert.equal(search?.cat, "broadband");
    assert.equal(search?.exclude, "hkbn");
    assert.equal(search?.minSpeed, 1000);
    assert.equal(search?.maxFee, 168);
    assert.equal(expiryFromEndDate("2026-10-01", "2026-08-01"), "2-3m");
    assert.equal(search?.expiry, expiryFromEndDate("2026-10-01"));
    assert.equal(compareSearchFor(normalizeItem({ kind: "paytv", provider: "Now TV" })), null);
  });

  it("puts the customer end date into the sales WhatsApp copy", () => {
    const item = normalizeItem({
      kind: "broadband",
      provider: "香港寬頻",
      endDate: "2026-11-08",
    });
    const patch = inquiryPatchFromSpendItem(item);
    assert.equal(patch.customerExpiry, "2026-11-08（客人自行提供）");
    assert.equal(staffExpiryText("2026-11-08"), "2026-11-08（客人自行提供）");
    const text = portInQuoteFromInquiry(patch, { name: "1000M", monthlyFee: 168 });
    assert.match(text, /合約到期日：2026-11-08（客人自行提供）/);
  });

  it("round-trips through storage and reads the v1 key", () => {
    const bag: Record<string, string> = {};
    const storage = {
      getItem: (key: string) => bag[key] ?? null,
      setItem: (key: string, value: string) => {
        bag[key] = value;
      },
    };
    bag["chaiquote-spend-ledger-v1"] = JSON.stringify([{ kind: "mobile", monthly: 88, name: "5G" }]);
    const migrated = readSpendLedger(storage);
    assert.equal(migrated.length, 1);
    assert.equal(migrated[0]?.monthly, 88);
    writeSpendLedger(storage, migrated);
    assert.equal(SPEND_STORAGE_KEY.endsWith("-v2"), true);
    assert.equal(readSpendLedger(storage)[0]?.kind, "mobile");
  });

  it("keeps home 5G speed for the comparison", () => {
    const item = normalizeItem({ kind: "home5g", provider: "3香港", speedPreset: "1000", monthly: 128, endDate: "2027-06-01" });
    assert.equal(item.speedPreset, "1000");
    assert.equal(normalizeItem({ kind: "mobile", speedPreset: "1000" }).speedPreset, "");
    assert.equal(normalizeItem({ kind: "ott", speedPreset: "1000" }).speedPreset, "");
  });
});

describe("spend scheme A comparison", () => {
  const fibre = normalizeItem({
    kind: "broadband",
    provider: "網上行",
    monthly: 168,
    speedPreset: "1000",
    endDate: "2027-02-28",
  });

  it("compares live reference plans and leaves out the current provider", () => {
    const refs = referencePlansFor(fibre, Date.parse("2026-11-22T00:00:00+08:00"));
    assert.ok(refs.length > 0);
    assert.equal(refs.some((plan) => plan.providerId === "netvigator"), false);
    assert.equal(refs.some((plan) => plan.id === "icable-ftth-1000-48m-58"), false);
    assert.equal(refs.some((plan) => plan.name.includes("指定屋苑")), false);
    assert.equal(refs.some((plan) => plan.onlyEstates?.length), false);
    assert.equal(refs.some((plan) => plan.monthlyFee <= 0), false);
    assert.equal(refs.some((plan) => plan.monthlyFee === 58), false);
    for (const plan of refs) {
      assert.ok(plan.monthlyFee <= fibre.monthly);
      assert.ok((plan.speedMbps ?? 0) >= 1000);
    }
    const providers = new Set(refs.map((plan) => plan.providerId));
    assert.equal(providers.size, refs.length);
    const hero = referenceMonthlyFee(refs);
    assert.ok(hero !== null && hero > 0 && hero !== 58);
    assert.equal(referenceSavingNote(168, 88), "較而家少 HK$80（參考）");
    assert.match(referenceSavingNote(168, 88), /（參考）/);
  });

  it("does not force pay TV or OTT into the compare table", () => {
    const paytv = normalizeItem({ kind: "paytv", provider: "Now TV", monthly: 199, endDate: "2027-01-01" });
    const ott = normalizeItem({ kind: "ott", provider: "Netflix", monthly: 48, endDate: "2027-01-01" });
    assert.deepEqual(referencePlansFor(paytv), []);
    assert.deepEqual(referencePlansFor(ott), []);
    assert.equal(referenceMonthlyFee([]), null);
    assert.equal(monthlyTotal([fibre, paytv, ott]), 168 + 199 + 48);
  });

  it("prefills the short form from a plan card and does not invent an end date", () => {
    const plan = getPlan("cmhk-ftth-1000");
    assert.ok(plan);
    const prefill = prefillFromPlan(plan!);
    assert.equal(prefill.kind, "broadband");
    assert.equal(prefill.providerPick, "中國移動香港");
    assert.equal(prefill.providerCustom, "");
    assert.equal(prefill.monthly, String(plan!.monthlyFee));
    assert.match(prefill.note, /合約期 36 個月/);
    assert.equal(prefill.name, plan!.name);
    assert.equal(spendFormIsCollapsed(1, false), true);
    assert.equal(spendFormIsCollapsed(1, true), false);
    assert.equal(spendFormIsCollapsed(0, false), false);
    assert.equal(spendFormIssue({ provider: "", monthly: "168", endDate: "2027-02-28" }), "provider");
    assert.equal(spendFormIssue({ provider: "網上行", monthly: "", endDate: "2027-02-28" }), "fee");
    assert.equal(spendFormIssue({ provider: "網上行", monthly: "168", endDate: "" }), "end");
    assert.equal(spendFormIssue({ provider: "網上行", monthly: "168", endDate: "2027/02/28" }), null);
  });

  it("checks this fee on WhatsApp without the long port-in prefill", () => {
    const text = spendFeeCheckText(fibre, { provider: "中國移動香港", name: "1000M 光纖入屋", monthlyFee: 88 });
    assert.match(text, /查核呢筆月費對照/);
    assert.match(text, /只供參考/);
    assert.match(text, /參考月費/);
    assert.doesNotMatch(text, /轉台獨家優惠|預留轉台禮品|預留禮品/);
  });
});

describe("spend scheme A locked copy", () => {
  const page = readFileSync(join(here, "../routes/spend.tsx"), "utf8");
  const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
  const footer = readFileSync(join(here, "../components/site-footer.tsx"), "utf8");
  const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");

  it("uses one citable H1, intro, title and description", () => {
    const h1 = "個人月費對照";
    const intro = "登記你而家用緊嘅月費同到期日，一次過對照站內參考計劃。資料只存在呢部裝置。";
    const title = "個人月費對照｜齊Quote";
    assert.match(page, new RegExp(`SPEND_H1_ZH = "${h1}"`));
    assert.match(page, new RegExp(`SPEND_INTRO_ZH = "${intro}"`));
    assert.match(page, new RegExp(`SPEND_TITLE = "${title}"`));
    assert.match(page, /description: SPEND_INTRO_ZH/);
    assert.match(page, /headline: SPEND_H1_ZH/);
    assert.match(page, /title: SPEND_TITLE/);
    assert.doesNotMatch(page, /齊Quote｜個人月費開銷|個人月費開銷|資料只存在本機/);
    assert.match(header, /個人月費對照/);
    assert.match(footer, /個人月費對照/);
    assert.doesNotMatch(header, /個人月費開銷/);
    assert.doesNotMatch(footer, /個人月費開銷/);
  });

  it("keeps the short form, collapses it once a record exists, and drops mock instructions", () => {
    assert.match(page, /更多欄位（計劃名稱、生效日、備註）/);
    assert.match(page, /儲存到呢部裝置/);
    assert.match(page, /新增另一項/);
    assert.match(page, /spendFormIsCollapsed/);
    assert.match(page, /牌面月費取自站內參考計劃，一律係參考月費，以電訊商確認為準。/);
    assert.match(page, /只供參考 · 已剔除你而家呢間營辦商/);
    assert.match(page, /去計劃目錄/);
    assert.match(page, /喺計劃目錄睇參考計劃/);
    assert.match(page, /暫時唔會自動對照參考計劃/);
    assert.doesNotMatch(page, /靜態預覽|參考示例|示範一筆|已有一筆記錄|去 \/plans|喺 \/plans|HK\$58 起|最平|最抵|最佳|最真實|低至|#ea580c|color-intake/);
    assert.doesNotMatch(page, /尚餘 98 日|HK\$168|HK\$88|HK\$80/);
    assert.match(page, /data-spend-logged/);
    assert.match(page, /data-spend-compare/);
  });

  it("adds the plan-card secondary action without rewriting the quote path", () => {
    assert.match(card, /設為我而家用緊/);
    assert.match(card, /to="\/spend"/);
    assert.match(card, /usePlan: plan\.id/);
    assert.match(card, /WhatsApp 問呢個計劃/);
    assert.match(card, /\{t\("referencePrice"\)\}/);
    assert.doesNotMatch(card, /靜態預覽唔會真正寫入/);
    assert.match(page, /quoteWhatsAppActivateProps/);
    assert.doesNotMatch(page, /function trackWaClick|轉台獨家優惠/);
  });
});
