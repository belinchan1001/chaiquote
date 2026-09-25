import { createServerFn } from "@tanstack/react-start";
import { hydratePlanOverrides } from "./plan-overrides.ts";
import { listPlanOverrides } from "./staff-store.ts";

/** Public-site overlay only. Do not import staff-ask from the root layout. */
export const loadCatalogLive = createServerFn({ method: "POST" }).handler(async () => {
  const rows = await listPlanOverrides();
  hydratePlanOverrides(rows);
  return rows;
});
