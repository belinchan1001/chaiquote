import { hongKongCalendarDate } from "./catalogue-date.ts";
import { GUIDES, getGuide } from "./guides.ts";
import { getPlan, hasOnSiteTest, isListedPlan, isOfferExpired, PLANS, type Category } from "./plans.ts";
import {
  CATALOGUE_CONTENT_STAMP,
  ESTATE_PAGE_CONTENT_DATE,
  HOME_CONTENT_DATE,
  NEW_INTAKE_CONTENT_DATE,
  PLANS_LISTING_COPY_DATE,
} from "./site.ts";
import { TECH_NEWS_ARTICLES, TECH_NEWS_CATEGORIES } from "./tech-news.ts";

const W3C_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Plan cards whose own copy changed after the catalogue stamp.
 * Disney+ replaced HBO Max on these two HKBN flash rows on 2026-11-20.
 */
const PLAN_COPY_LASTMOD: Record<string, string> = {
  "hkbn-ftth-1000-36m-128-sep30": "2026-11-20",
  "hkbn-ftth-2500-36m-178-sep30": "2026-11-20",
};

/** 3HK 5G home cards gained the on-site test badge on this day. */
const ONSITE_TEST_CONTENT_DATE = "2026-11-21";

function later(a: string, b: string | undefined): string {
  if (!b || !W3C_DAY.test(b)) return a;
  return b > a ? b : a;
}

/** First Hong Kong calendar day on which an offer is no longer listed. */
export function offerDropDate(offerEndsAt: string): string | undefined {
  const ends = Date.parse(offerEndsAt);
  if (!Number.isFinite(ends)) return undefined;
  return hongKongCalendarDate(new Date(ends + 1000));
}

/** Category listing date: hub copy, or the day a listed offer dropped off, whichever is later. */
export function plansListingLastmod(cat: Category, now = Date.now()): string {
  let latest: string = PLANS_LISTING_COPY_DATE[cat];
  for (const plan of PLANS) {
    if (plan.category !== cat || !isListedPlan(plan) || !plan.offerEndsAt) continue;
    if (!isOfferExpired(plan, now)) continue;
    latest = later(latest, offerDropDate(plan.offerEndsAt));
  }
  return latest;
}

function guideLastmod(slug: string): string | undefined {
  const guide = getGuide(slug);
  if (!guide) return undefined;
  const date = guide.modified ?? guide.published;
  return date && W3C_DAY.test(date) ? date : undefined;
}

function latestGuideDate(): string {
  let latest: string = CATALOGUE_CONTENT_STAMP;
  for (const guide of GUIDES) {
    latest = later(latest, guide.modified ?? guide.published);
  }
  return latest;
}

function newsArticleLastmod(slug: string): string | undefined {
  const article = TECH_NEWS_ARTICLES.find((item) => item.slug === slug);
  return article?.published && W3C_DAY.test(article.published) ? article.published : undefined;
}

function newsCategoryLastmod(slug: string): string {
  let latest: string = CATALOGUE_CONTENT_STAMP;
  for (const article of TECH_NEWS_ARTICLES) {
    if (article.category === slug) latest = later(latest, article.published);
  }
  return latest;
}

function newsIndexLastmod(): string {
  let latest: string = CATALOGUE_CONTENT_STAMP;
  for (const article of TECH_NEWS_ARTICLES) latest = later(latest, article.published);
  return latest;
}

function planLastmod(id: string): string {
  const plan = getPlan(id);
  const key = plan?.id ?? id;
  let latest: string = PLAN_COPY_LASTMOD[key] ?? CATALOGUE_CONTENT_STAMP;
  if (plan && hasOnSiteTest(plan)) latest = later(latest, ONSITE_TEST_CONTENT_DATE);
  return latest;
}

/** Path the sitemap and the visible「資料更新」share. Query filters other than `cat` are ignored. */
export function canonicalContentPath(hrefOrPath: string): string {
  let path = hrefOrPath.trim();
  const hash = path.indexOf("#");
  if (hash !== -1) path = path.slice(0, hash);
  if (path.startsWith("http://") || path.startsWith("https://")) {
    const url = new URL(path);
    path = `${url.pathname}${url.search}`;
  }
  const queryAt = path.indexOf("?");
  const pathname = queryAt === -1 ? path : path.slice(0, queryAt);
  const params = new URLSearchParams(queryAt === -1 ? "" : path.slice(queryAt + 1));
  const normalized = pathname === "" ? "/" : pathname;
  if (normalized === "/plans") {
    const cat = params.get("cat");
    const category =
      cat === "home5g" || cat === "mobile" || cat === "business" || cat === "broadband" ? cat : "broadband";
    return `/plans?cat=${category}`;
  }
  return normalized;
}

const HUB_LASTMOD: Record<string, string> = {
  "/": HOME_CONTENT_DATE,
  "/new-intake": NEW_INTAKE_CONTENT_DATE,
  "/about": CATALOGUE_CONTENT_STAMP,
  "/privacy": CATALOGUE_CONTENT_STAMP,
  "/estates": CATALOGUE_CONTENT_STAMP,
};

/**
 * Last meaningful content change for a public URL.
 * Never the clock. Guide and news dates come from the manuscript.
 * Other URLs use the catalogue stamp unless that page's copy changed later.
 */
export function contentLastmod(hrefOrPath: string): string {
  const path = canonicalContentPath(hrefOrPath);
  if (path.startsWith("/plans?cat=")) {
    const cat = path.slice("/plans?cat=".length) as Category;
    if (cat in PLANS_LISTING_COPY_DATE) return plansListingLastmod(cat);
  }
  if (path.startsWith("/plans/")) {
    const id = path.slice("/plans/".length);
    if (id && !id.includes("/")) return planLastmod(id);
  }
  if (path === "/guides") return latestGuideDate();
  if (path.startsWith("/guides/")) {
    const slug = path.slice("/guides/".length);
    if (slug && !slug.includes("/")) return guideLastmod(slug) ?? CATALOGUE_CONTENT_STAMP;
  }
  if (path.startsWith("/estates/") && path !== "/estates") return ESTATE_PAGE_CONTENT_DATE;
  if (path === "/tech-news") return newsIndexLastmod();
  if (path.startsWith("/tech-news/")) {
    const slug = path.slice("/tech-news/".length);
    if (slug && !slug.includes("/")) {
      if (TECH_NEWS_CATEGORIES.some((cat) => cat.slug === slug)) return newsCategoryLastmod(slug);
      return newsArticleLastmod(slug) ?? CATALOGUE_CONTENT_STAMP;
    }
  }
  return HUB_LASTMOD[path] ?? CATALOGUE_CONTENT_STAMP;
}
