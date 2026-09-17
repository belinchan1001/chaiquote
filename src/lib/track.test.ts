import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { inferTrackSource, normalizeTrackPayload, summarizeInterest, waPhoneLabel } from "./track.ts";

describe("track helpers", () => {
  it("infers source from path", () => {
    assert.equal(inferTrackSource("/"), "home");
    assert.equal(inferTrackSource("/plans"), "plans");
    assert.equal(inferTrackSource("/plans/hkbn-ftth-1000-36m-98"), "plan_detail");
    assert.equal(inferTrackSource("/quote"), "quote");
  });

  it("normalizes a WhatsApp click against a HKBN plan", () => {
    const row = normalizeTrackPayload({
      event: "wa_click",
      planIds: ["hkbn-ftth-1000-36m-98"],
      path: "/",
    });
    assert.ok(row);
    assert.equal(row.event, "wa_click");
    assert.equal(row.planId, "hkbn-ftth-1000-36m-98");
    assert.equal(row.providerId, "hkbn");
    assert.equal(row.waPhone, "85296642675");
    assert.equal(row.source, "home");
    assert.equal(waPhoneLabel(row.waPhone), "9664 2675（香港寬頻）");
  });

  it("rejects unknown events", () => {
    assert.equal(
      normalizeTrackPayload({ event: "hack" as "wa_click", planIds: ["x"] }),
      null,
    );
  });

  it("summarizes yesterday-style rows", () => {
    const summary = summarizeInterest(
      [
        {
          id: 1,
          created_at: "2026-09-16T04:00:00+08:00",
          event_name: "wa_click",
          plan_id: "hkbn-ftth-1000-36m-98",
          plan_ids: "hkbn-ftth-1000-36m-98",
          provider_id: "hkbn",
          category: "broadband",
          wa_phone: "85296642675",
          source: "plan_card",
          path: "/",
          extra: null,
        },
        {
          id: 2,
          created_at: "2026-09-16T05:00:00+08:00",
          event_name: "plan_open",
          plan_id: "cmhk-home5g-350-48-88",
          plan_ids: "cmhk-home5g-350-48-88",
          provider_id: "cmhk",
          category: "home5g",
          wa_phone: null,
          source: "home",
          path: "/",
          extra: null,
        },
      ],
      "2026-09-16T00:00:00+08:00",
      "2026-09-16T23:59:59+08:00",
    );
    assert.equal(summary.total, 2);
    assert.equal(summary.waClicks, 1);
    assert.equal(summary.planOpens, 1);
    assert.equal(summary.byWhatsApp[0]?.label, "9664 2675（香港寬頻）");
    assert.equal(summary.byPlan[0]?.planId, "cmhk-home5g-350-48-88");
  });
});
