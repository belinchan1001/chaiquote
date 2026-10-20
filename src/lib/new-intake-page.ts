import { ESTATE_PAGES } from "./estate-pages.ts";
import { HKBN_INTAKE_OFFER_ESTATES, NEW_INTAKE } from "./estate-new-intake-names.ts";
import { compact, ESTATES } from "./estates.ts";
import { filterPlans } from "./plan-filter.ts";
import type { Housing, Plan } from "./plans.ts";

export type NewIntakeOffer = {
  id: string;
  name: string;
  monthlyFee: number;
  contractMonths: number;
};

export type NewIntakeCard = {
  name: string;
  slug?: string;
  district: string;
  housing?: Housing;
  simplePublic: boolean;
  offers: NewIntakeOffer[];
};

const HKBN_INTAKE = new Set<string>(HKBN_INTAKE_OFFER_ESTATES);

function offerOf(plan: Plan): NewIntakeOffer {
  return {
    id: plan.id,
    name: plan.name,
    monthlyFee: plan.monthlyFee,
    contractMonths: plan.contractMonths,
  };
}

function childBlocks(name: string) {
  const parentKey = compact(name);
  if (parentKey.length < 2) return [];
  return ESTATES.filter((child) => {
    if (child.name === name) return false;
    return [child.name, ...child.aliases].some((raw) => {
      const needle = compact(raw);
      if (!needle.startsWith(parentKey) || needle === parentKey) return false;
      const rest = needle.slice(parentKey.length);
      return rest.length >= 1 && /[座樓閣期]/.test(rest);
    });
  });
}

function housingFor(name: string): Housing | undefined {
  const exact = ESTATES.find((estate) => estate.name === name);
  if (exact) return exact.housing;
  const kids = childBlocks(name);
  const kinds = [...new Set(kids.map((item) => item.housing))];
  if (kinds.length === 1) return kinds[0];
  if (name.includes("簡約公屋") || name.endsWith("邨")) return "public";
  if (HKBN_INTAKE.has(name) && name.endsWith("苑")) return "hos";
  return undefined;
}

/** Every new-move-in name. A fee appears only when that address unlocks a named offer. */
export function newIntakeCards(): NewIntakeCard[] {
  const pageByName = new Map(ESTATE_PAGES.map((page) => [page.estate.name, page]));
  return NEW_INTAKE.map((item) => {
    const housing = housingFor(item.name);
    const offers = housing
      ? filterPlans({ cat: "broadband", estate: item.name, housing, intake: true })
          .map(offerOf)
          .sort((a, b) => a.monthlyFee - b.monthlyFee || a.contractMonths - b.contractMonths || a.id.localeCompare(b.id))
      : [];
    return {
      name: item.name,
      slug: pageByName.get(item.name)?.slug,
      district: item.group,
      housing,
      simplePublic: item.name.includes("簡約公屋"),
      offers,
    };
  });
}
