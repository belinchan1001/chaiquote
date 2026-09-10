/**
 * Official canonical host helpers. Kept separate from sitemap generation so
 * homepage / shell do not load the full estate catalogue on first paint.
 */
import type { Category } from "./plans.ts";

export const DEFAULT_SEO_ORIGIN = "https://www.chaiquote.hk";

/** Production Vercel aliases only — never *.vercel.app preview hosts. */
export const LEGACY_PRODUCTION_HOSTS = [
  "chaiquote.vercel.app",
  "www.chaiquote.vercel.app",
] as const;

export function requestHostname(hostHeader: string | null | undefined): string {
  return String(hostHeader ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
}

export function isLegacyProductionHost(hostHeader: string | null | undefined): boolean {
  return (LEGACY_PRODUCTION_HOSTS as readonly string[]).includes(requestHostname(hostHeader));
}

/** Absolute official URL for a site path (`/` → https://www.chaiquote.hk/). */
export function canonicalUrl(pathname: string): string {
  const raw = pathname.trim() || "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const path = withSlash === "/" ? "/" : withSlash.replace(/\/+$/, "");
  return `${DEFAULT_SEO_ORIGIN}${path}`;
}

export function canonicalUrlFromMatches(
  matches: ReadonlyArray<{ pathname?: string; search?: Record<string, unknown> }>,
): string {
  const last = [...matches].at(-1);
  const path = last?.pathname ?? "/";
  if (path === "/plans" || path === "/plans/") {
    return canonicalUrl(plansCategoryPath(last?.search?.cat));
  }
  return canonicalUrl(path);
}

/** 301 Location for the official www host, or null when this request should stay. */
export function canonicalRedirectLocation(
  requestUrl: URL,
  hostHeader?: string | null,
): string | null {
  if (!isLegacyProductionHost(hostHeader ?? requestUrl.host)) return null;
  return `${DEFAULT_SEO_ORIGIN}${requestUrl.pathname}${requestUrl.search}`;
}

export function seoOrigin(origin: string = DEFAULT_SEO_ORIGIN): string {
  const host = origin.replace(/\/+$/, "");
  if (host === "https://chaiquote.hk" || host === "http://chaiquote.hk") {
    return "https://www.chaiquote.hk";
  }
  return host;
}

/** Runtime origin: SEO_ORIGIN override, else the official www host. */
export function runtimeSeoOrigin(): string {
  const override =
    (typeof process !== "undefined" ? process.env.SEO_ORIGIN?.trim() : "") || "";
  return seoOrigin(override || DEFAULT_SEO_ORIGIN);
}

const CATEGORY_PATHS: Record<Category, string> = {
  broadband: "/plans?cat=broadband",
  home5g: "/plans?cat=home5g",
  mobile: "/plans?cat=mobile",
  business: "/plans?cat=business",
};

export function plansCategoryPath(cat: unknown): string {
  if (cat === "home5g" || cat === "mobile" || cat === "business" || cat === "broadband") {
    return CATEGORY_PATHS[cat];
  }
  return CATEGORY_PATHS.broadband;
}

export const HOME_SEO_TITLE = "齊Quote｜香港寬頻比較：光纖、5G家居、手機月費";

export const CATEGORY_SEO: Record<Category, { title: string; description: string }> = {
  broadband: {
    title: "光纖寬頻比較｜齊Quote",
    description:
      "比較香港光纖寬頻月費，涵蓋公屋、居屋、私樓及村屋計劃。實際月費、覆蓋及安裝安排以電訊商確認為準。",
  },
  home5g: {
    title: "5G家居寬頻比較｜齊Quote",
    description:
      "比較香港 5G 家居寬頻月費，免拉線隨插即用。實際速度、覆蓋及安裝安排以電訊商確認為準。",
  },
  mobile: {
    title: "手機月費比較｜齊Quote",
    description:
      "比較香港手機月費計劃，包括 5G、4.5G 及轉台優惠。實際月費及用量以電訊商確認為準。",
  },
  business: {
    title: "商業寬頻比較｜齊Quote",
    description:
      "比較香港商業寬頻月費，適合店舖、寫字樓及工作室。實際月費、覆蓋及安裝安排以電訊商確認為準。",
  },
};
