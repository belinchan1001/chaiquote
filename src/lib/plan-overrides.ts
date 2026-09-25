import { PLANS, type Plan } from "./plans.ts";

export type PlanOverride = {
  planId: string;
  unpublished: boolean;
  monthlyFee: number | null;
  freeMonths: number | null;
  contractMonths: number | null;
  rebate: number | null;
  perks: string[] | null;
  hot: boolean | null;
  latestOffer: boolean | null;
  newIntakeOffer: boolean | null;
  flashOffer: boolean | null;
  offerEndsAt: string | null;
  quotePick: boolean | null;
  adImageUrl: string | null;
};

type OverlayState = { byId: Record<string, PlanOverride> };

const globalRef = globalThis as typeof globalThis & {
  __chaiquotePlanOverlay__?: OverlayState;
};

function state(): OverlayState {
  globalRef.__chaiquotePlanOverlay__ ??= { byId: {} };
  return globalRef.__chaiquotePlanOverlay__;
}

export function hydratePlanOverrides(rows: PlanOverride[]) {
  const byId: Record<string, PlanOverride> = {};
  for (const row of rows) byId[row.planId] = row;
  state().byId = byId;
}

export function getPlanOverride(planId: string): PlanOverride | undefined {
  return state().byId[planId];
}

function pickBool(override: boolean | null, fallback: boolean | undefined) {
  if (override === null) return fallback;
  return override;
}

export function applyPlanOverride(plan: Plan, override?: PlanOverride): Plan {
  if (!override) return plan;
  const next: Plan = { ...plan };
  if (override.monthlyFee != null) next.monthlyFee = override.monthlyFee;
  if (override.freeMonths != null) next.freeMonths = override.freeMonths;
  if (override.contractMonths != null) next.contractMonths = override.contractMonths;
  if (override.rebate != null) next.rebate = override.rebate;
  if (override.perks) next.perks = override.perks;
  next.hot = pickBool(override.hot, plan.hot);
  next.latestOffer = pickBool(override.latestOffer, plan.latestOffer);
  next.newIntakeOffer = pickBool(override.newIntakeOffer, plan.newIntakeOffer);
  next.flashOffer = pickBool(override.flashOffer, plan.flashOffer);
  if (override.offerEndsAt !== null) {
    next.offerEndsAt = override.offerEndsAt || undefined;
  }
  next.quotePick = pickBool(override.quotePick, plan.quotePick);
  if (override.adImageUrl !== null) {
    next.adImageUrl = override.adImageUrl || undefined;
  }
  next.unpublished = override.unpublished;
  return next;
}

export function resolvePlan(plan: Plan | undefined): Plan | undefined {
  if (!plan) return undefined;
  return applyPlanOverride(plan, getPlanOverride(plan.id));
}

export function catalogPlans(): Plan[] {
  const overlay = state().byId;
  if (!Object.keys(overlay).length) return PLANS;
  return PLANS.map((plan) => applyPlanOverride(plan, overlay[plan.id]));
}

export function isPublicPlan(plan: Plan) {
  return !plan.unpublished && !plan.staffOffer;
}
