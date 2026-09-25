import { createMiddleware } from "@tanstack/react-start";
import { createServerFn } from "@tanstack/react-start";
import { PLANS, type Category, type Plan } from "./plans.ts";
import { applyPlanOverride, hydratePlanOverrides, type PlanOverride } from "./plan-overrides.ts";
import {
  STAFF_GROUP_MAP,
  groupOwnsProvider,
  isStaffGroupId,
  isValidEmail,
  normalizeEmail,
  providersForGroup,
  type StaffGroupId,
  type StaffRole,
  type StaffStatus,
} from "./staff-groups.ts";
import {
  countStaffMembers,
  getStaffMember,
  listPlanOverrides,
  listStaffMembers,
  setStaffStatus,
  upsertPlanOverride,
  upsertStaffMember,
  type StaffMemberRow,
} from "./staff-store.ts";

const staffBearer = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("./auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    return next({ context: { bearerToken: context.bearerToken as string | undefined } });
  });

function ownerEmails() {
  const raw = typeof process !== "undefined" ? process.env.STAFF_OWNER_EMAIL ?? "" : "";
  return raw
    .split(/[,;\s]+/)
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
}

export type StaffActor = {
  email: string;
  role: StaffRole;
  groupId: StaffGroupId | "all";
  groupLabel: string;
  providers: Plan["providerId"][];
};

export type StaffDeskPlan = Plan & { unpublished?: boolean };

function toDeskPlan(plan: Plan, override?: PlanOverride): StaffDeskPlan {
  return applyPlanOverride(plan, override);
}

async function resolveActor(bearerToken?: string): Promise<
  | { ok: true; actor: StaffActor }
  | { ok: false; reason: "signin" | "forbidden" | "owner_email" }
> {
  const { authConfigured } = await import("./auth/verify.server");
  const { getSessionUser } = await import("./auth/verify.server");
  if (!authConfigured) {
    return { ok: false, reason: "signin" };
  }
  const user = await getSessionUser(bearerToken);
  const email = user?.email ? normalizeEmail(user.email) : "";
  if (!email) return { ok: false, reason: "signin" };

  const ownerActor = {
    email,
    role: "owner" as const,
    groupId: "all" as const,
    groupLabel: "站長",
    providers: [...new Set(PLANS.map((plan) => plan.providerId))],
  };

  if (ownerEmails().includes(email)) {
    return { ok: true, actor: ownerActor };
  }

  const member = await getStaffMember(email);
  if (member?.rawGroup === "owner" && member.status !== "disabled") {
    return { ok: true, actor: ownerActor };
  }

  if (!ownerEmails().length && !member) {
    const count = await countStaffMembers();
    if (count === 0) {
      await upsertStaffMember(email, "owner", "active");
      return { ok: true, actor: ownerActor };
    }
    return { ok: false, reason: "forbidden" };
  }
  if (!member || member.status === "disabled") return { ok: false, reason: "forbidden" };
  if (!isStaffGroupId(member.groupId)) return { ok: false, reason: "forbidden" };
  if (member.status === "invited") {
    await setStaffStatus(email, "active");
  }
  const group = STAFF_GROUP_MAP[member.groupId];
  return {
    ok: true,
    actor: {
      email,
      role: "editor",
      groupId: member.groupId,
      groupLabel: group.label,
      providers: providersForGroup(member.groupId),
    },
  };
}

export const loadPlanOverrides = createServerFn({ method: "POST" }).handler(async () => {
  const rows = await listPlanOverrides();
  hydratePlanOverrides(rows);
  return rows;
});

export const loadStaffDesk = createServerFn({ method: "POST" })
  .middleware([staffBearer])
  .handler(async ({ context }) => {
    const resolved = await resolveActor(context.bearerToken);
    if (!resolved.ok) return resolved;
    const overrides = await listPlanOverrides();
    hydratePlanOverrides(overrides);
    const byId = Object.fromEntries(overrides.map((row) => [row.planId, row]));
    const plans = PLANS.filter((plan) => {
      if (plan.staffOffer) return false;
      if (resolved.actor.role === "owner") return true;
      return resolved.actor.providers.includes(plan.providerId);
    }).map((plan) => toDeskPlan(plan, byId[plan.id]));
    const members = resolved.actor.role === "owner" ? await listStaffMembers() : [];
    return { ok: true as const, actor: resolved.actor, plans, members, ownerReady: ownerEmails().length > 0 };
  });

export type SaveStaffPlanInput = {
  planId: string;
  unpublished: boolean;
  monthlyFee: number;
  freeMonths: number;
  contractMonths: number;
  rebate: number | null;
  perks: string[];
  hot: boolean;
  latestOffer: boolean;
  newIntakeOffer: boolean;
  flashOffer: boolean;
  offerEndsAt: string | null;
  quotePick?: boolean;
  adImageUrl: string | null;
};

export const saveStaffPlan = createServerFn({ method: "POST" })
  .middleware([staffBearer])
  .inputValidator((data: SaveStaffPlanInput) => data)
  .handler(async ({ context, data }) => {
    const resolved = await resolveActor(context.bearerToken);
    if (!resolved.ok) return resolved;
    const plan = PLANS.find((item) => item.id === data.planId);
    if (!plan || plan.staffOffer) return { ok: false as const, reason: "forbidden" as const };
    if (resolved.actor.role !== "owner" && !resolved.actor.providers.includes(plan.providerId)) {
      return { ok: false as const, reason: "forbidden" as const };
    }
    const monthlyFee = Number(data.monthlyFee);
    const freeMonths = Math.max(0, Math.round(Number(data.freeMonths)));
    const contractMonths = Math.max(1, Math.round(Number(data.contractMonths)));
    if (!Number.isFinite(monthlyFee) || monthlyFee < 0) {
      return { ok: false as const, reason: "forbidden" as const, message: "月費無效" };
    }
    await upsertPlanOverride({
      planId: plan.id,
      unpublished: Boolean(data.unpublished),
      monthlyFee,
      freeMonths,
      contractMonths,
      rebate: data.rebate,
      perks: data.perks.map((item) => item.trim()).filter(Boolean).slice(0, 16),
      hot: Boolean(data.hot),
      latestOffer: Boolean(data.latestOffer),
      newIntakeOffer: Boolean(data.newIntakeOffer),
      flashOffer: Boolean(data.flashOffer),
      offerEndsAt: data.offerEndsAt,
      quotePick: resolved.actor.role === "owner" ? Boolean(data.quotePick) : undefined,
      adImageUrl: data.adImageUrl,
      updatedBy: resolved.actor.email,
    });
    const overrides = await listPlanOverrides();
    hydratePlanOverrides(overrides);
    return { ok: true as const };
  });

export type InviteStaffInput = {
  email: string;
  groupId: string;
};

export const inviteStaffMember = createServerFn({ method: "POST" })
  .middleware([staffBearer])
  .inputValidator((data: InviteStaffInput) => data)
  .handler(async ({ context, data }) => {
    const resolved = await resolveActor(context.bearerToken);
    if (!resolved.ok) return resolved;
    if (resolved.actor.role !== "owner") return { ok: false as const, reason: "forbidden" as const };
    const email = normalizeEmail(data.email);
    if (!isValidEmail(email) || !isStaffGroupId(data.groupId)) {
      return { ok: false as const, reason: "forbidden" as const, message: "電郵或集團無效" };
    }
    if (ownerEmails().includes(email)) {
      return { ok: false as const, reason: "forbidden" as const, message: "呢個係站長電郵" };
    }
    await upsertStaffMember(email, data.groupId, "invited");
    const members = await listStaffMembers();
    return { ok: true as const, members };
  });

export const setStaffMemberStatus = createServerFn({ method: "POST" })
  .middleware([staffBearer])
  .inputValidator((data: { email: string; status: StaffStatus }) => data)
  .handler(async ({ context, data }) => {
    const resolved = await resolveActor(context.bearerToken);
    if (!resolved.ok) return resolved;
    if (resolved.actor.role !== "owner") return { ok: false as const, reason: "forbidden" as const };
    if (data.status !== "active" && data.status !== "disabled" && data.status !== "invited") {
      return { ok: false as const, reason: "forbidden" as const };
    }
    await setStaffStatus(data.email, data.status);
    return { ok: true as const, members: await listStaffMembers() };
  });

export type { Category, StaffMemberRow };
