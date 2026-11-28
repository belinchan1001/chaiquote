/** One automatic reload per tab after a stale hashed chunk or CSS URL. */
const CHUNK_RELOAD_KEY = "chaiquote-chunk-reload";

/**
 * Same browser messages TanStack treats as a missing dynamic module, plus Vite's
 * CSS preload failure. The URL stays in the exception; callers must not render it.
 */
const CHUNK_MESSAGE_PREFIXES = [
  "Failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "Importing a module script failed",
  "Unable to preload CSS",
] as const;

export type ReloadDeps = {
  storage?: Pick<Storage, "getItem" | "setItem"> | null;
  reload?: () => void;
};

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "";
}

export function isChunkLoadError(error: unknown): boolean {
  const message = errorMessage(error);
  if (!message) return false;
  return CHUNK_MESSAGE_PREFIXES.some((prefix) => message.startsWith(prefix));
}

function storageFrom(deps?: ReloadDeps): Pick<Storage, "getItem" | "setItem"> | null {
  if (deps && "storage" in deps) return deps.storage ?? null;
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage;
}

/** Returns true only the first time this tab is allowed to reload. */
export function consumeChunkReload(deps?: ReloadDeps): boolean {
  const storage = storageFrom(deps);
  if (!storage) return false;
  try {
    if (storage.getItem(CHUNK_RELOAD_KEY)) return false;
    storage.setItem(CHUNK_RELOAD_KEY, "1");
  } catch {
    return false;
  }
  const reload = deps?.reload ?? (() => window.location.reload());
  reload();
  return true;
}

export function reloadOnceForChunkError(error: unknown, deps?: ReloadDeps): boolean {
  if (!isChunkLoadError(error)) return false;
  return consumeChunkReload(deps);
}

/**
 * Vite dispatches this and then rethrows unless preventDefault runs.
 * Leave the exception alone so the island boundary can drop that section.
 * A preventDefault here would resolve the import to undefined.
 */
export function onVitePreloadError(event: Event, deps?: ReloadDeps): void {
  const payload = "payload" in event ? (event as Event & { payload?: unknown }).payload : undefined;
  console.error(payload ?? event);
  if (isChunkLoadError(payload)) consumeChunkReload(deps);
}

/** Copy the root error screen is allowed to show. The thrown value is not an input. */
export function rootErrorFields(t: (key: "errorTitle" | "errorLead") => string): {
  title: string;
  lead: string;
} {
  return {
    title: t("errorTitle"),
    lead: t("errorLead"),
  };
}
