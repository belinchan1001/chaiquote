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
  countPasswordStaff,
  countStaffMembers,
  getPlanChange,
  getStaffByUsername,
  getStaffMember,
  insertPlanChange,
  listPendingPlanChanges,
  listPlanOverrides,
  listStaffMembers,
  markPlanChangeExecuted,
  setStaffStatus,
  upsertPlanOverride,
  upsertStaffLogin,
  upsertStaffMember,
  type StaffMemberRow,
  type StaffPlanChangeRow,
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
  status: StaffStatus | "owner";
  canEdit: boolean;
};

export type StaffDeskPlan = Plan & { unpublished?: boolean };

function toDeskPlan(plan: Plan, override?: PlanOverride): StaffDeskPlan {
  return applyPlanOverride(plan, override);
}

async function resolveActor(bearerToken?: string): Promise<
  | { ok: true; actor: StaffActor }
  | { ok: false; reason: "signin" | "forbidden" | "owner_email" }
> {
  const {
    readDeskUsername,
    envOwnerUsername,
  } = await import("./staff-session.server");
  const deskUser = await readDeskUsername();
  if (deskUser) {
    const ownerName = envOwnerUsername();
    const ownerActor = {
      email: deskUser,
      role: "owner" as const,
      groupId: "all" as const,
      groupLabel: "站長",
      providers: [...new Set(PLANS.map((plan) => plan.providerId))],
      status: "owner" as const,
      canEdit: true,
    };
    if (ownerName && deskUser === ownerName) return { ok: true, actor: ownerActor };
    const member = await getStaffByUsername(deskUser);
    if (member?.rawGroup === "owner" && member.status !== "disabled") {
      return { ok: true, actor: ownerActor };
    }
    if (member && member.status !== "disabled" && isStaffGroupId(member.groupId)) {
      const group = STAFF_GROUP_MAP[member.groupId];
      return {
        ok: true,
        actor: {
          email: member.username,
          role: "editor",
          groupId: member.groupId,
          groupLabel: group.label,
          providers: providersForGroup(member.groupId),
          status: member.status,
          canEdit: member.status === "active",
        },
      };
    }
    return { ok: false, reason: "forbidden" };
  }

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
    status: "owner" as const,
    canEdit: true,
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
  const group = STAFF_GROUP_MAP[member.groupId];
  return {
    ok: true,
    actor: {
      email,
      role: "editor",
      groupId: member.groupId,
      groupLabel: group.label,
      providers: providersForGroup(member.groupId),
      status: member.status,
      canEdit: member.status === "active",
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
    const setupNeeded = (await countPasswordStaff()) === 0 && !process.env.STAFF_DESK_USER;
    if (!resolved.ok) return { ...resolved, setupNeeded };
    const overrides = await listPlanOverrides();
    hydratePlanOverrides(overrides);
    const byId = Object.fromEntries(overrides.map((row) => [row.planId, row]));
    const plans = PLANS.filter((plan) => {
      if (plan.staffOffer) return false;
      if (resolved.actor.role === "owner") return true;
      return resolved.actor.providers.includes(plan.providerId);
    }).map((plan) => toDeskPlan(plan, byId[plan.id]));
    const members = resolved.actor.role === "owner" ? await listStaffMembers() : [];
    const pending = resolved.actor.role === "owner" ? await listPendingPlanChanges() : [];
    return {
      ok: true as const,
      actor: resolved.actor,
      plans,
      members,
      pending,
      setupNeeded,
      ownerReady: true,
    };
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
    if (resolved.actor.role !== "owner" && !resolved.actor.canEdit) {
      return { ok: false as const, reason: "forbidden" as const, message: "帳號未批准，暫時唔可以改計劃" };
    }
    if (resolved.actor.role !== "owner" && !resolved.actor.providers.includes(plan.providerId)) {
      return { ok: false as const, reason: "forbidden" as const };
    }
    const monthlyFee = Number(data.monthlyFee);
    const freeMonths = Math.max(0, Math.round(Number(data.freeMonths)));
    const contractMonths = Math.max(1, Math.round(Number(data.contractMonths)));
    if (!Number.isFinite(monthlyFee) || monthlyFee < 0) {
      return { ok: false as const, reason: "forbidden" as const, message: "月費無效" };
    }
    const payload = {
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
      quotePick: resolved.actor.role === "owner" ? Boolean(data.quotePick) : false,
      adImageUrl: data.adImageUrl,
    };
    const id = `chg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    await insertPlanChange({
      id,
      planId: plan.id,
      actor: resolved.actor.email,
      payload,
    });
    return { ok: true as const, queued: true as const, changeId: id };
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

export const signInDesk = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const {
      clearDeskSession,
      envOwnerPassword,
      envOwnerUsername,
      hashPassword,
      isValidUsername,
      normalizeUsername,
      verifyPassword,
      writeDeskSession,
    } = await import("./staff-session.server");
    const username = normalizeUsername(data.username);
    const password = String(data.password ?? "");
    if (!isValidUsername(username) || password.length < 4) {
      return { ok: false as const, message: "用戶名或密碼唔啱" };
    }
    const envUser = envOwnerUsername();
    const envPass = envOwnerPassword();
    if (envUser && envPass && username === envUser && password === envPass) {
      await writeDeskSession(username);
      return { ok: true as const };
    }
    const existing = await countPasswordStaff();
    if (existing === 0 && !envUser) {
      await upsertStaffLogin(username, "owner", "active", await hashPassword(password));
      await writeDeskSession(username);
      return { ok: true as const, created: true as const };
    }
    const member = await getStaffByUsername(username);
    if (!member?.passwordHash || member.status === "disabled") {
      await clearDeskSession();
      return { ok: false as const, message: "用戶名或密碼唔啱" };
    }
    if (!(await verifyPassword(password, member.passwordHash))) {
      return { ok: false as const, message: "用戶名或密碼唔啱" };
    }
    await writeDeskSession(member.username);
    return { ok: true as const };
  });

export const signOutDesk = createServerFn({ method: "POST" }).handler(async () => {
  const { clearDeskSession } = await import("./staff-session.server");
  await clearDeskSession();
  return { ok: true as const };
});

export const executeStaffChange = createServerFn({ method: "POST" })
  .middleware([staffBearer])
  .inputValidator((data: { changeId: string }) => data)
  .handler(async ({ context, data }) => {
    const resolved = await resolveActor(context.bearerToken);
    if (!resolved.ok) return resolved;
    if (resolved.actor.role !== "owner") return { ok: false as const, reason: "forbidden" as const };
    const change = await getPlanChange(data.changeId);
    if (!change || change.status !== "pending") {
      return { ok: false as const, message: "呢項已經唔喺待執行" };
    }
    const payload = change.payload;
    await upsertPlanOverride({
      planId: change.planId,
      unpublished: Boolean(payload.unpublished),
      monthlyFee: Number(payload.monthlyFee),
      freeMonths: Number(payload.freeMonths),
      contractMonths: Number(payload.contractMonths),
      rebate: payload.rebate == null ? null : Number(payload.rebate),
      perks: Array.isArray(payload.perks) ? payload.perks.map(String) : [],
      hot: Boolean(payload.hot),
      latestOffer: Boolean(payload.latestOffer),
      newIntakeOffer: Boolean(payload.newIntakeOffer),
      flashOffer: Boolean(payload.flashOffer),
      offerEndsAt: payload.offerEndsAt ? String(payload.offerEndsAt) : null,
      quotePick: Boolean(payload.quotePick),
      adImageUrl: payload.adImageUrl ? String(payload.adImageUrl) : null,
      updatedBy: resolved.actor.email,
    });
    await markPlanChangeExecuted(change.id);
    const overrides = await listPlanOverrides();
    hydratePlanOverrides(overrides);
    return { ok: true as const, pending: await listPendingPlanChanges() };
  });

export const addDeskAccount = createServerFn({ method: "POST" })
  .middleware([staffBearer])
  .inputValidator((data: { username: string; password: string; groupId: string }) => data)
  .handler(async ({ context, data }) => {
    const resolved = await resolveActor(context.bearerToken);
    if (!resolved.ok) return resolved;
    if (resolved.actor.role !== "owner") return { ok: false as const, reason: "forbidden" as const };
    const { hashPassword, isValidUsername, normalizeUsername } = await import("./staff-session.server");
    const username = normalizeUsername(data.username);
    if (!isValidUsername(username) || String(data.password).length < 4 || !isStaffGroupId(data.groupId)) {
      return { ok: false as const, message: "用戶名、密碼或集團無效" };
    }
    await upsertStaffLogin(username, data.groupId, "active", await hashPassword(data.password));
    return { ok: true as const, members: await listStaffMembers() };
  });

export const registerSalesAccount = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string; groupId: string }) => data)
  .handler(async ({ data }) => {
    const {
      hashPassword,
      isValidUsername,
      normalizeUsername,
      writeDeskSession,
    } = await import("./staff-session.server");
    const username = normalizeUsername(data.username);
    const password = String(data.password ?? "");
    if (!isValidUsername(username) || password.length < 4 || !isStaffGroupId(data.groupId)) {
      return { ok: false as const, message: "用戶名、密碼或集團無效" };
    }
    const taken = await getStaffByUsername(username);
    if (taken) return { ok: false as const, message: "呢個用戶名已經有人用" };
    await upsertStaffLogin(username, data.groupId, "invited", await hashPassword(password));
    await writeDeskSession(username);
    return { ok: true as const };
  });

export type { Category, StaffMemberRow, StaffPlanChangeRow };
