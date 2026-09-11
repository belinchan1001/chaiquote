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

/** Locked zh-HK share/SEO copy. Do not paraphrase; never add 最抵／最低／最平. */
export type SeoCopy = {
  title: string;
  description: string;
};

export const HOME_SEO = {
  title: "齊Quote｜香港寬頻同手機月費比較",
  description:
    "一次過比較香港光纖、5G 家居、商業同手機計劃。所列月費僅供參考，實際以電訊商確認為準。",
} as const satisfies SeoCopy;

export const HOME_SEO_TITLE = HOME_SEO.title;

export const ABOUT_SEO = {
  title: "齊Quote｜關於我們",
  description: "齊Quote 係獨立電訊比較平台，並沒有向電訊商收取佣金或廣告費。所列月費僅供參考。",
} as const satisfies SeoCopy;

export const PRIVACY_SEO = {
  title: "齊Quote｜私隱政策",
  description: "了解齊Quote 點樣收集同使用查核報價所需資料，以及你嘅查閱同改正權。",
} as const satisfies SeoCopy;

export const GUIDES_SEO = {
  title: "齊Quote｜寬頻同手機攻略",
  description: "點揀光纖、5G 家居同手機計劃。內容僅供參考，實際以電訊商確認為準。",
} as const satisfies SeoCopy;

export const CATEGORY_SEO: Record<Category, SeoCopy> = {
  broadband: {
    title: "齊Quote｜光纖寬頻比較",
    description: "比較香港家居光纖參考月費同優惠。實際價格、覆蓋同安裝以電訊商確認為準。",
  },
  home5g: {
    title: "齊Quote｜5G 家居寬頻比較",
    description: "比較香港 5G 家居寬頻參考月費。所列月費僅供參考，實際以電訊商確認為準。",
  },
  mobile: {
    title: "齊Quote｜手機月費比較",
    description: "比較香港手機月費參考計劃。所列月費僅供參考，實際以電訊商確認為準。",
  },
  business: {
    title: "齊Quote｜商業寬頻比較",
    description: "比較香港商業寬頻參考月費。實際價格同條款以電訊商確認為準。",
  },
};

/** The eight public surfaces whose share titles/descriptions are locked. */
export const LOCKED_PAGE_SEO = [
  { path: "/", ...HOME_SEO },
  { path: "/plans?cat=broadband", ...CATEGORY_SEO.broadband },
  { path: "/plans?cat=home5g", ...CATEGORY_SEO.home5g },
  { path: "/plans?cat=mobile", ...CATEGORY_SEO.mobile },
  { path: "/plans?cat=business", ...CATEGORY_SEO.business },
  { path: "/about", ...ABOUT_SEO },
  { path: "/privacy", ...PRIVACY_SEO },
  { path: "/guides", ...GUIDES_SEO },
] as const;

type ShareMeta =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

/** Title, description, Open Graph, and Twitter tags for a locked SEO surface. */
export function shareHead(seo: SeoCopy, url?: string): {
  meta: ShareMeta[];
  links?: { rel: string; href: string }[];
} {
  const meta: ShareMeta[] = [
    { title: seo.title },
    { name: "description", content: seo.description },
    { property: "og:title", content: seo.title },
    { property: "og:description", content: seo.description },
    { name: "twitter:title", content: seo.title },
    { name: "twitter:description", content: seo.description },
  ];
  if (url) meta.push({ property: "og:url", content: url });
  return url ? { meta, links: [{ rel: "canonical", href: url }] } : { meta };
}
