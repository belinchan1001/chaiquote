import { hydratePlanOverrides, catalogPlans } from "../../src/lib/plan-overrides";
import { listPlanOverrides } from "../../src/lib/staff-store";
import { PROVIDER_MAP } from "../../src/lib/plans";

export default async function catalogJson() {
  try {
    hydratePlanOverrides(await listPlanOverrides());
  } catch {
    /* static catalogue is enough */
  }
  const plans = catalogPlans()
    .filter((plan) => !plan.staffOffer)
    .map((plan) => ({
      id: plan.id,
      providerId: plan.providerId,
      providerName: PROVIDER_MAP[plan.providerId]?.name ?? plan.providerId,
      category: plan.category,
      name: plan.name,
      monthlyFee: plan.monthlyFee,
      freeMonths: plan.freeMonths,
      contractMonths: plan.contractMonths,
      rebate: plan.rebate ?? null,
      perks: plan.perks,
      hot: Boolean(plan.hot),
      latestOffer: Boolean(plan.latestOffer),
      newIntakeOffer: Boolean(plan.newIntakeOffer),
      flashOffer: Boolean(plan.flashOffer),
      quotePick: Boolean(plan.quotePick),
      offerEndsAt: plan.offerEndsAt ?? null,
      unpublished: Boolean(plan.unpublished),
      adImageUrl: plan.adImageUrl ?? null,
    }));
  return Response.json(
    { plans },
    {
      headers: {
        "cache-control": "public, max-age=30, stale-while-revalidate=120",
        "access-control-allow-origin": "*",
      },
    },
  );
}
