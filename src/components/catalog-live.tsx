import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { refreshCatalogLive } from "@/lib/catalog-live";
import { getCatalogTick, subscribeCatalog } from "@/lib/plan-overrides";

/** Paint the baked catalogue first. Staff price edits arrive after, without blocking filters. */
export function CatalogLive({ children }: { children: ReactNode }) {
  useSyncExternalStore(subscribeCatalog, getCatalogTick, getCatalogTick);
  useEffect(() => {
    void refreshCatalogLive().catch(() => undefined);
  }, []);
  return children;
}
