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
import { compareSearchFor, providerIdFromName } from "./spend-compare.ts";

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
    assert.equal(search?.expiry, "2-3m");
    assert.equal(compareSearchFor(normalizeItem({ kind: "paytv", provider: "Now TV" })), null);
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
});
