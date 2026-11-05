export type AppLocale = "zh" | "en";

/** `?lang=en` is English. Anything else, including a missing param, stays zh-HK. */
export function localeFromHref(href: string): AppLocale {
  const queryIndex = href.indexOf("?");
  if (queryIndex === -1) return "zh";
  const query = href.slice(queryIndex + 1).split("#")[0] ?? "";
  return new URLSearchParams(query).get("lang") === "en" ? "en" : "zh";
}

type SearchStep = {
  search?: Record<string, unknown>;
  meta?: { explicit?: Record<string, unknown> };
};

/**
 * Keep `lang=en` when a link replaces the rest of the query, and drop it when
 * the navigation sets `lang` itself (the 中 / EN toggle passes `undefined`).
 */
export function keepLangSearch(ctx: {
  search: Record<string, unknown>;
  next: (search: Record<string, unknown>, collectMeta?: boolean) => SearchStep | Record<string, unknown>;
}): Record<string, unknown> {
  const stepped = ctx.next(ctx.search, true);
  const wrapped = stepped as SearchStep;
  const result = { ...(wrapped.search ?? (stepped as Record<string, unknown>)) };
  const explicit = wrapped.meta?.explicit;
  if (explicit && Object.prototype.hasOwnProperty.call(explicit, "lang")) {
    if (explicit.lang === "en") result.lang = "en";
    else delete result.lang;
    return result;
  }
  if (ctx.search.lang === "en") result.lang = "en";
  else if (result.lang !== "en") delete result.lang;
  return result;
}
