import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeTrackPayload } from "./track.ts";
import {
  canonicalProviderId,
  defaultWaClickRange,
  hongKongYmdFromTimestamp,
  parseWaClickRange,
  summarizeWaClicks,
  waClickDetailCsv,
  waClickProviderCsv,
  waClickReportError,
  type WaClickEvent,
} from "./wa-click-report.ts";

const here = dirname(fileURLToPath(import.meta.url));

function click(partial: Partial<WaClickEvent> & Pick<WaClickEvent, "created_at">): WaClickEvent {
  return {
    event_name: "wa_click",
    plan_id: null,
    provider_id: null,
    category: null,
    source: null,
    extra: null,
    ...partial,
  };
}

describe("wa click provider report", () => {
  it("maps carrier names and ids onto catalogue provider ids", () => {
    assert.equal(canonicalProviderId("香港寬頻"), "hkbn");
    assert.equal(canonicalProviderId(" HKBN "), "hkbn");
    assert.equal(canonicalProviderId("中國移動"), "cmhk");
    assert.equal(canonicalProviderId("3香港"), "three");
    assert.equal(canonicalProviderId("有線"), "icable");
    assert.equal(canonicalProviderId("not-a-carrier"), null);
  });

  it("buckets WhatsApp clicks by telecom company and Hong Kong date", () => {
    const report = summarizeWaClicks(
      [
        click({
          created_at: "2026-11-01T15:59:59.000Z",
          provider_id: "hkbn",
          plan_id: "hkbn-ftth-1000-36m-98",
          category: "broadband",
          source: "plan_card",
          extra: { housing: "public", cat: "broadband" },
        }),
        click({
          created_at: "2026-11-01 16:00:00+00",
          provider_id: "hkbn",
          plan_id: "hkbn-ftth-1000-36m-98",
          category: "broadband",
          source: "plan_detail",
        }),
        click({
          created_at: "2026-11-02T02:00:00+08:00",
          provider_id: null,
          extra: JSON.stringify({ provider: "網上行", plan: "netvigator-ftth-1000", cat: "broadband" }),
          source: "quote",
        }),
        click({
          created_at: "2026-11-02T03:00:00+08:00",
          source: "header",
        }),
        {
          created_at: "2026-11-02T04:00:00+08:00",
          event_name: "plan_open",
          provider_id: "cmhk",
          plan_id: "cmhk-home5g-350-48-88",
        },
      ],
      "2026-11-01",
      "2026-11-02",
    );

    assert.equal(hongKongYmdFromTimestamp("2026-11-01T16:00:00.000Z"), "2026-11-02");
    assert.equal(report.total, 4);
    assert.equal(report.byProvider[0]?.providerId, "hkbn");
    assert.equal(report.byProvider[0]?.label, "香港寬頻");
    assert.equal(report.byProvider[0]?.count, 2);
    assert.equal(report.byProvider[0]?.share, 50);
    assert.equal(report.byProvider.find((row) => row.providerId === "netvigator")?.count, 1);
    assert.equal(report.byProvider.find((row) => row.providerId === "unknown")?.label, "未標示");
    assert.equal(report.byDay[0]?.day, "2026-11-02");
    assert.equal(report.byDay[0]?.count, 3);
    assert.equal(report.byDay[1]?.day, "2026-11-01");
    assert.equal(report.byDay[1]?.providers[0]?.count, 1);
    assert.equal(report.byPlan[0]?.planId, "hkbn-ftth-1000-36m-98");
    assert.equal(report.byPlan[0]?.count, 2);
    assert.equal(report.bySource.find((row) => row.source === "header")?.label, "頁頭");
    assert.equal(report.byHousing[0]?.label, "公屋");
    assert.equal(report.byHousing[0]?.count, 1);
    assert.equal(report.byCategory.find((row) => row.category === "broadband")?.count, 3);
  });

  it("reads a company stored only on the plan id", () => {
    const report = summarizeWaClicks(
      [click({ created_at: "2026-11-03T10:00:00+08:00", plan_id: "smartone-ftth-1000" })],
      "2026-11-03",
      "2026-11-03",
    );
    assert.equal(report.byProvider[0]?.providerId, "smartone");
    assert.equal(report.byProvider[0]?.label, "數碼通");
  });

  it("exports day-by-company CSV and escapes detail cells", () => {
    const report = summarizeWaClicks(
      [
        click({
          created_at: "2026-11-04T09:00:00+08:00",
          provider_id: "hgc",
          plan_id: 'hgc "plus",1',
          source: "footer",
          category: "business",
        }),
      ],
      "2026-11-04",
      "2026-11-04",
    );
    const providerCsv = waClickProviderCsv(report);
    assert.equal(providerCsv.charCodeAt(0), 0xfeff);
    assert.match(providerCsv, /日期,電訊商編號,電訊商,點擊/);
    assert.match(providerCsv, /2026-11-04,hgc,HGC 寬頻,1/);
    const detailCsv = waClickDetailCsv(report);
    assert.match(detailCsv, /"hgc ""plus"",1"/);
    assert.match(detailCsv, /頁尾/);
    assert.match(detailCsv, /商業寬頻/);
  });

  it("accepts a weekly range and rejects an inverted or oversized one", () => {
    const week = defaultWaClickRange(new Date("2026-11-06T00:30:00+08:00"));
    assert.deepEqual(week, { from: "2026-10-31", until: "2026-11-06" });
    const ok = parseWaClickRange("2026-08-06", "2026-11-06");
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.fromIso, "2026-08-06T00:00:00+08:00");
      assert.equal(ok.untilIso, "2026-11-06T23:59:59.999+08:00");
    }
    assert.equal(parseWaClickRange("2026-11-06", "2026-11-01").ok, false);
    assert.equal(parseWaClickRange("2026-02-31", "2026-03-01").ok, false);
    assert.equal(parseWaClickRange("2026-08-05", "2026-11-06").ok, false);
    assert.match(waClickReportError("bad-token"), /鎖匙/);
  });

  it("stores a company passed only in the click extra without changing the WhatsApp number", () => {
    const row = normalizeTrackPayload({
      event: "wa_click",
      path: "/plans",
      waPhone: "85254363004",
      extra: { company: "中國移動", cat: "home5g", housing: "village" },
    });
    assert.ok(row);
    assert.equal(row.providerId, "cmhk");
    assert.equal(row.planId, null);
    assert.equal(row.category, "home5g");
    assert.equal(row.waPhone, "85254363004");
    assert.equal(row.source, "plans");
    assert.equal(row.extra?.housing, "village");

    const fromPlan = normalizeTrackPayload({
      event: "wa_click",
      extra: { plan: "cmhk-home5g-350-48-88" },
    });
    assert.equal(fromPlan?.providerId, "cmhk");
    assert.equal(fromPlan?.planId, "cmhk-home5g-350-48-88");
    assert.equal(fromPlan?.category, "home5g");
  });

  it("keeps the plan company when a click already names a catalogue plan", () => {
    const row = normalizeTrackPayload({
      event: "wa_click",
      planIds: ["hkbn-ftth-1000-36m-98"],
      extra: { provider: "網上行" },
    });
    assert.equal(row?.providerId, "hkbn");
    assert.equal(row?.planId, "hkbn-ftth-1000-36m-98");
  });

  it("loads the report from stored wa_click rows", () => {
    const source = readFileSync(join(here, "track-fn.ts"), "utf8");
    assert.match(source, /export const loadWaClickReport/);
    assert.match(source, /event_name = 'wa_click'/);
    assert.match(source, /provider_id/);
    assert.match(source, /WA_CLICK_REPORT_ROW_CAP/);
  });
});
