import { createServerFn } from "@tanstack/react-start";
import { hydratePlanOverrides } from "./plan-overrides.ts";
import { listPlanOverrides } from "./staff-store.ts";

/** Public-site overlay only. Do not import staff-ask from the root layout. */
export const loadCatalogLive = createServerFn({ method: "POST" }).handler(async () => {
  const rows = await listPlanOverrides();
  hydratePlanOverrides(rows);
  return rows;
});

let refreshOnce: Promise<void> | null = null;

/** One background fetch per page view. Callers must not await this during navigation. */
export function refreshCatalogLive(): Promise<void> {
  if (refreshOnce) return refreshOnce;
  refreshOnce = loadCatalogLive()
    .then((rows) => {
      hydratePlanOverrides(rows);
    })
    .catch((error: unknown) => {
      refreshOnce = null;
      throw error;
    });
  return refreshOnce;
}
