import { getSql } from "@/lib/db";
import type { PlanOverride } from "./plan-overrides.ts";
import { isStaffGroupId, normalizeEmail, type StaffGroupId, type StaffStatus } from "./staff-groups.ts";

export type StaffMemberRow = {
  email: string;
  groupId: StaffGroupId;
  status: StaffStatus;
};

function asStatus(value: string): StaffStatus {
  if (value === "active" || value === "disabled" || value === "invited") return value;
  return "invited";
}

function parsePerks(value: unknown): string[] | null {
  if (value == null) return null;
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value;
  return null;
}

export async function countStaffMembers(): Promise<number> {
  const sql = await getSql();
  const rows = await sql.query<{ n: number }>(`select count(*)::int as n from staff_member`);
  return rows[0]?.n ?? 0;
}

export async function listStaffMembers(): Promise<StaffMemberRow[]> {
  const sql = await getSql();
  const rows = await sql.query<{ email: string; group_id: string; status: string }>(
    `select email, group_id, status from staff_member where group_id <> 'owner' order by email`,
  );
  return rows
    .filter((row) => isStaffGroupId(row.group_id) || row.group_id === "owner")
    .map((row) => ({
      email: row.email,
      groupId: row.group_id === "owner" ? ("hkt" as StaffGroupId) : (row.group_id as StaffGroupId),
      status: asStatus(row.status),
    }))
    .filter((row) => row.email !== "__owner__");
}

export async function getStaffMember(email: string): Promise<(StaffMemberRow & { rawGroup: string }) | null> {
  const sql = await getSql();
  const rows = await sql.query<{ email: string; group_id: string; status: string }>(
    `select email, group_id, status from staff_member where email = $1 limit 1`,
    [normalizeEmail(email)],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    email: row.email,
    rawGroup: row.group_id,
    groupId: isStaffGroupId(row.group_id) ? row.group_id : "hkt",
    status: asStatus(row.status),
  };
}

export async function upsertStaffMember(email: string, groupId: StaffGroupId | "owner", status: StaffStatus) {
  const sql = await getSql();
  await sql.query(
    `insert into staff_member (email, group_id, status, updated_at)
     values ($1, $2, $3, now())
     on conflict (email) do update set group_id = excluded.group_id, status = excluded.status, updated_at = now()`,
    [normalizeEmail(email), groupId, status],
  );
}

export async function setStaffStatus(email: string, status: StaffStatus) {
  const sql = await getSql();
  await sql.query(`update staff_member set status = $2, updated_at = now() where email = $1`, [
    normalizeEmail(email),
    status,
  ]);
}

export async function listPlanOverrides(): Promise<PlanOverride[]> {
  try {
    const sql = await getSql();
    const rows = await sql.query<{
      plan_id: string;
      unpublished: boolean;
      monthly_fee: number | null;
      free_months: number | null;
      contract_months: number | null;
      rebate: number | null;
      perks_json: unknown;
      hot: boolean | null;
      latest_offer: boolean | null;
      new_intake_offer: boolean | null;
      flash_offer: boolean | null;
      offer_ends_at: string | null;
      quote_pick: boolean | null;
      ad_image_url: string | null;
    }>(
      `select plan_id, unpublished, monthly_fee, free_months, contract_months, rebate, perks_json,
              hot, latest_offer, new_intake_offer, flash_offer, offer_ends_at, quote_pick, ad_image_url
       from plan_override`,
    );
    return rows.map((row) => ({
      planId: row.plan_id,
      unpublished: row.unpublished === true,
      monthlyFee: row.monthly_fee,
      freeMonths: row.free_months,
      contractMonths: row.contract_months,
      rebate: row.rebate,
      perks: parsePerks(row.perks_json),
      hot: row.hot,
      latestOffer: row.latest_offer,
      newIntakeOffer: row.new_intake_offer,
      flashOffer: row.flash_offer,
      offerEndsAt: row.offer_ends_at,
      quotePick: row.quote_pick,
      adImageUrl: row.ad_image_url,
    }));
  } catch (err) {
    console.error("[staff] list overrides failed", err);
    return [];
  }
}

export type PlanOverridePatch = {
  planId: string;
  unpublished?: boolean;
  monthlyFee?: number;
  freeMonths?: number;
  contractMonths?: number;
  rebate?: number | null;
  perks?: string[];
  hot?: boolean;
  latestOffer?: boolean;
  newIntakeOffer?: boolean;
  flashOffer?: boolean;
  offerEndsAt?: string | null;
  quotePick?: boolean;
  adImageUrl?: string | null;
  updatedBy: string;
};

export async function upsertPlanOverride(patch: PlanOverridePatch) {
  const sql = await getSql();
  await sql.query(
    `insert into plan_override (
        plan_id, unpublished, monthly_fee, free_months, contract_months, rebate, perks_json,
        hot, latest_offer, new_intake_offer, flash_offer, offer_ends_at, quote_pick, ad_image_url,
        updated_by, updated_at
      ) values (
        $1, coalesce($2, false), $3, $4, $5, $6, $7::jsonb,
        $8, $9, $10, $11, $12, $13, $14, $15, now()
      )
      on conflict (plan_id) do update set
        unpublished = coalesce($2, plan_override.unpublished),
        monthly_fee = coalesce($3, plan_override.monthly_fee),
        free_months = coalesce($4, plan_override.free_months),
        contract_months = coalesce($5, plan_override.contract_months),
        rebate = case when $16 then $6 else plan_override.rebate end,
        perks_json = coalesce($7::jsonb, plan_override.perks_json),
        hot = coalesce($8, plan_override.hot),
        latest_offer = coalesce($9, plan_override.latest_offer),
        new_intake_offer = coalesce($10, plan_override.new_intake_offer),
        flash_offer = coalesce($11, plan_override.flash_offer),
        offer_ends_at = case when $17 then $12 else plan_override.offer_ends_at end,
        quote_pick = coalesce($13, plan_override.quote_pick),
        ad_image_url = case when $18 then $14 else plan_override.ad_image_url end,
        updated_by = $15,
        updated_at = now()`,
    [
      patch.planId,
      patch.unpublished ?? null,
      patch.monthlyFee ?? null,
      patch.freeMonths ?? null,
      patch.contractMonths ?? null,
      patch.rebate === undefined ? null : patch.rebate,
      patch.perks ? JSON.stringify(patch.perks) : null,
      patch.hot ?? null,
      patch.latestOffer ?? null,
      patch.newIntakeOffer ?? null,
      patch.flashOffer ?? null,
      patch.offerEndsAt === undefined ? null : patch.offerEndsAt,
      patch.quotePick ?? null,
      patch.adImageUrl === undefined ? null : patch.adImageUrl,
      patch.updatedBy,
      patch.rebate !== undefined,
      patch.offerEndsAt !== undefined,
      patch.adImageUrl !== undefined,
    ],
  );
}
