import { estateUnlocksPlan } from "./estate-new-intake.ts";
import { catalogPlans } from "./plan-overrides.ts";
import { isOfferExpired, type Housing, type Plan } from "./plans.ts";

const HOUSING = new Set<Housing>(["public", "hos", "private", "village"]);

export function parseHousingParam(value: unknown): Housing | undefined {
  return typeof value === "string" && HOUSING.has(value as Housing) ? (value as Housing) : undefined;
}

export function parseEstateParam(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const estate = value.trim().slice(0, 80);
  return estate || undefined;
}

/** Plans under「其他人亦比較」. Housing stays matched; flash offers, then 齊Quote picks, come first. */
export function relatedComparePlans(plan: Plan, housing?: Housing, estate?: string, limit = 2): Plan[] {
  const context = housing ?? inferredHousing(plan);
  return catalogPlans()
    .filter(
      (item) =>
        item.id !== plan.id &&
        !item.staffOffer &&
        !item.unpublished &&
        !isOfferExpired(item) &&
        fitsRelated(plan, item, context) &&
        fitsEstate(item, estate),
    )
    .map((item, index) => ({ item, index }))
    .sort((a, b) => relatedRank(a.item) - relatedRank(b.item) || a.index - b.index)
    .slice(0, limit)
    .map((row) => row.item);
}

function inferredHousing(plan: Plan): Housing | undefined {
  if (villageOnly(plan)) return "village";
  if (plan.housing !== "all" && plan.housing.length === 1) return plan.housing[0];
  return undefined;
}

function villageOnly(plan: Plan) {
  return plan.housing !== "all" && plan.housing.every((item) => item === "village");
}

function listedFor(plan: Plan, housing: Housing): boolean {
  if (plan.housing === "all") return false;
  return plan.housing.includes(housing);
}

function fitsRelated(current: Plan, item: Plan, housing?: Housing): boolean {
  if (housing === "village") return villageOnly(item) || item.category === "home5g";
  if (housing === "public" || housing === "hos" || housing === "private") {
    return item.category === current.category && listedFor(item, housing);
  }
  return item.category === current.category && !villageOnly(item);
}

function fitsEstate(item: Plan, estate?: string): boolean {
  if (!item.onlyEstates?.length) return true;
  return estateUnlocksPlan(estate, item.onlyEstates);
}

function relatedRank(plan: Plan): number {
  if (plan.flashOffer) return 0;
  if (plan.quotePick) return 1;
  return 2;
}
