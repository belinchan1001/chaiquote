import { estateUnlocksPlan, isNetvigatorOnlyEstate } from "./estate-new-intake.ts";
import { matchKnownEstate } from "./estates.ts";
import { estateBlocksHkbnVillage, estateHasHgcVillageCoverage } from "./hgc-village-coverage.ts";
import {
  PLANS,
  PROVIDER_MAP,
  averageFee,
  hasGba,
  isHgcVillage,
  isHkbnVillage,
  isOfferExpired,
  matchesHousing,
  planGeneration,
  type Plan,
  type PlansSearch,
} from "./plans.ts";

export function filterPlans(search: PlansSearch, savedIds: string[] = []) {
  const qEstate = !search.estate?.trim() && search.q ? matchKnownEstate(search.q) : undefined;
  const estate = search.estate?.trim() || qEstate?.name;
  const housing = search.housing ?? qEstate?.housing;
  const blobQ = qEstate ? undefined : search.q;

  let rows = PLANS.filter((plan) => {
    if (plan.category !== search.cat) return false;
    if (plan.staffOffer) return false;
    if (isOfferExpired(plan)) return false;
    if (
      (search.cat === "broadband" || search.cat === "business") &&
      isNetvigatorOnlyEstate(estate) &&
      plan.providerId !== "netvigator"
    ) {
      return false;
    }
    if (plan.onlyEstates?.length) {
      const unlocked = estateUnlocksPlan(estate, plan.onlyEstates);
      if (search.intake) {
        if (estate && !unlocked) return false;
      } else if (!unlocked) {
        return false;
      }
    }
    if (isHgcVillage(plan) && !estateHasHgcVillageCoverage(estate)) return false;
    if (isHkbnVillage(plan) && estateBlocksHkbnVillage(estate)) return false;
    if (search.intake && !plan.newIntakeOffer) return false;
    if (!matchesHousing(plan, housing)) return false;
    if (search.maxFee && plan.monthlyFee > search.maxFee) return false;
    if (search.speed && plan.speedMbps !== search.speed) return false;
    if (search.minSpeed && (plan.speedMbps ?? 0) < search.minSpeed) return false;
    if (search.minData) {
      const data = plan.dataGb ?? plan.highSpeedGb ?? (plan.fupNote ? 0 : 9999);
      if (data < search.minData) return false;
    }
    if (search.exclude && plan.providerId === search.exclude) return false;
    if (search.provider && plan.providerId !== search.provider) return false;
    if (search.portIn && !plan.portInPerk) return false;
    if (search.generation && planGeneration(plan) !== search.generation) return false;
    if (search.gba && !hasGba(plan)) return false;
    if (search.saved && !savedIds.includes(plan.id)) return false;
    if (blobQ) {
      const provider = PROVIDER_MAP[plan.providerId];
      const extra = plan.providerId === "netvigator" ? "電訊盈科 PCCW" : "";
      const blob =
        `${plan.name} ${provider.name} ${provider.nameEn} ${plan.network} ${plan.perks.join(" ")} ${plan.prepaid ?? ""} ${plan.limits ?? ""} ${extra}`.toLowerCase();
      if (!blob.includes(blobQ.trim().toLowerCase())) return false;
    }
    return true;
  });

  const sort = search.sort ?? "fee";
  if (sort === "speed") {
    return [...rows].sort((a, b) => (b.speedMbps ?? 0) - (a.speedMbps ?? 0) || a.id.localeCompare(b.id));
  }
  if (sort === "data") {
    return [...rows].sort(
      (a, b) => (b.dataGb ?? b.highSpeedGb ?? 0) - (a.dataGb ?? a.highSpeedGb ?? 0) || a.id.localeCompare(b.id),
    );
  }
  return pinHkbn98Flash(interleaveCheapestFirst(rows));
}

/** 1000M $98 / 36 個月送 3 個月. Other offers keep the ladder order. */
const HKBN_98_36M_FLASH_ID = "hkbn-ftth-1000-36m-98-sep30";

function pinHkbn98Flash(rows: Plan[]): Plan[] {
  const index = rows.findIndex((plan) => plan.id === HKBN_98_36M_FLASH_ID);
  if (index <= 0) return rows;
  const pinned = rows[index];
  return [pinned, ...rows.slice(0, index), ...rows.slice(index + 1)];
}

/** Ladder by average fee (free months included), then sticker fee. */
function priceRank(plan: Plan) {
  return averageFee(plan);
}

/** Each provider's cheapest plan first, then the next tier, so one company cannot fill the first pages. */
function interleaveCheapestFirst(rows: Plan[]): Plan[] {
  const groups = new Map<string, Plan[]>();
  for (const plan of rows) {
    const bucket = groups.get(plan.providerId);
    if (bucket) bucket.push(plan);
    else groups.set(plan.providerId, [plan]);
  }
  const cheaper = (a: Plan, b: Plan) =>
    priceRank(a) - priceRank(b) || a.monthlyFee - b.monthlyFee || a.id.localeCompare(b.id);
  for (const list of groups.values()) list.sort(cheaper);
  const out: Plan[] = [];
  for (let round = 0; ; round += 1) {
    const wave: Plan[] = [];
    for (const list of groups.values()) {
      const plan = list[round];
      if (plan) wave.push(plan);
    }
    if (!wave.length) break;
    wave.sort((a, b) => cheaper(a, b) || a.providerId.localeCompare(b.providerId));
    out.push(...wave);
  }
  return out;
}
