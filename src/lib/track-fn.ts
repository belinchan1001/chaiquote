import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import {
  hongKongDayBounds,
  normalizeTrackPayload,
  previousHongKongDay,
  summarizeInterest,
  type InterestSummary,
  type SiteEventRow,
  type TrackPayload,
} from "@/lib/track";

function interestToken() {
  return (process.env.INTEREST_TOKEN || process.env.STATS_TOKEN || "").trim();
}

function tokenOk(token?: string) {
  const expected = interestToken();
  if (!expected) return false;
  return Boolean(token) && token === expected;
}

export const recordSiteEvent = createServerFn({ method: "POST" })
  .inputValidator((data: TrackPayload) => data)
  .handler(async ({ data }) => {
    const row = normalizeTrackPayload(data);
    if (!row) return { ok: false as const };
    try {
      const sql = await getSql();
      await sql.query(
        `insert into site_events
          (event_name, plan_id, plan_ids, provider_id, category, wa_phone, source, path, extra)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
        [
          row.event,
          row.planId,
          row.planIds || null,
          row.providerId,
          row.category,
          row.waPhone,
          row.source,
          row.path,
          row.extra ? JSON.stringify(row.extra) : null,
        ],
      );
      return { ok: true as const };
    } catch (err) {
      console.error("[track] record failed", err);
      return { ok: false as const };
    }
  });

export const loadInterestSummary = createServerFn({ method: "POST" })
  .inputValidator((data: { token?: string; day?: "today" | "yesterday" }) => data)
  .handler(async ({ data }): Promise<{ ok: false; reason: string } | { ok: true; summary: InterestSummary; hasToken: boolean }> => {
    if (!tokenOk(data.token)) {
      return { ok: false, reason: interestToken() ? "bad-token" : "no-token" };
    }
    const bounds = data.day === "today" ? hongKongDayBounds() : previousHongKongDay();
    try {
      const sql = await getSql();
      const rows = await sql.query<SiteEventRow>(
        `select id, created_at::text as created_at, event_name, plan_id, plan_ids, provider_id,
                category, wa_phone, source, path, extra
           from site_events
          where created_at >= $1::timestamptz
            and created_at <= $2::timestamptz
          order by created_at desc
          limit 800`,
        [bounds.from, bounds.until],
      );
      return {
        ok: true,
        hasToken: true,
        summary: summarizeInterest(rows, bounds.from, bounds.until),
      };
    } catch (err) {
      console.error("[track] summary failed", err);
      return { ok: false, reason: "query-failed" };
    }
  });
