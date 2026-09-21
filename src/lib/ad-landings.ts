import type { PlansSearch } from "./plans.ts";

export const AD_LANDING_DESTS = ["broadband", "home5g", "village"] as const;
export type AdLandingDest = (typeof AD_LANDING_DESTS)[number];

export type AdLanding = {
  dest: AdLandingDest;
  path: `/go/${AdLandingDest}`;
  search: PlansSearch;
};

export const AD_LANDINGS: Record<AdLandingDest, AdLanding> = {
  broadband: {
    dest: "broadband",
    path: "/go/broadband",
    search: { cat: "broadband", from: "ad" },
  },
  home5g: {
    dest: "home5g",
    path: "/go/home5g",
    search: { cat: "home5g", from: "ad" },
  },
  village: {
    dest: "village",
    path: "/go/village",
    search: { cat: "broadband", housing: "village", from: "ad" },
  },
};

export function isAdLandingDest(value: string): value is AdLandingDest {
  return (AD_LANDING_DESTS as readonly string[]).includes(value);
}

export function getAdLanding(dest: string): AdLanding | undefined {
  return isAdLandingDest(dest) ? AD_LANDINGS[dest] : undefined;
}

export function isAdTraffic(search: Pick<PlansSearch, "from">) {
  return search.from === "ad";
}
