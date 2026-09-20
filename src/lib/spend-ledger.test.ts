import { describe, it } from "node:test";
import assert from "node:assert/strict";
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

describe("spend ledger", () => {
  it("parses money and kinds", () => {
    assert.equal(parseMoney("$168.4"), 168.4);
    assert.equal(parseMoney("x"), 0);
    assert.equal(isSpendKind("ott"), true);
    assert.equal(isSpendKind("wifi"), false);
  });

  it("sums monthly fees and finds the next end date", () => {
    const items = [
      normalizeItem({ kind: "broadband", monthly: 168, endDate: "2026-12-01", provider: "HKBN" }),
      normalizeItem({ kind: "mobile", monthly: 98, endDate: "2026-10-01", provider: "CMHK" }),
      normalizeItem({ kind: "ott", monthly: 48, endDate: "", provider: "Netflix" }),
    ];
    assert.equal(monthlyTotal(items), 314);
    assert.equal(soonestExpiry(items, "2026-09-20")?.provider, "CMHK");
    assert.equal(daysUntil("2026-10-20", "2026-09-20"), 30);
  });

  it("round-trips through storage", () => {
    const bag: Record<string, string> = {};
    const storage = {
      getItem: (key: string) => bag[key] ?? null,
      setItem: (key: string, value: string) => {
        bag[key] = value;
      },
    };
    writeSpendLedger(storage, [normalizeItem({ kind: "mobile", monthly: 88, name: "5G" })]);
    const loaded = readSpendLedger(storage);
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0]?.monthly, 88);
    assert.equal(SPEND_STORAGE_KEY.startsWith("chaiquote-spend"), true);
  });
});
