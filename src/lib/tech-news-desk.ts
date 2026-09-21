import {
  TECH_NEWS_ARTICLES,
  TECH_NEWS_CATEGORIES,
  type TechNewsArticle,
  type TechNewsCategoryId,
} from "./tech-news.ts";

export const NEWS_MAX_SOURCE_CHARS = 12_000;
export const NEWS_MAX_OUTPUT_TOKENS = 2200;
export const NEWS_CLAIM = /最平|最抵|最低|保證|cheapest|guarantee/i;
export const RESERVED_NEWS_SLUGS = new Set([
  "desk",
  ...TECH_NEWS_CATEGORIES.map((item) => item.slug),
  ...TECH_NEWS_ARTICLES.map((item) => item.slug),
]);

export const NEWS_JOURNALIST_SYSTEM = `你是一位專精於香港電訊市場、消費電子及電玩科技的資深科技新聞編輯。文案客觀、專業、節奏明快，用香港用語（出機、續約、開箱、寬頻、數據）。

只回 JSON，欄位如下：
{
  "slug": "english-kebab-slug",
  "minutes": 4,
  "seoTitle": "...｜齊Quote",
  "h1": "...",
  "description": "...",
  "excerpt": "...",
  "seoTitleEn": "...",
  "h1En": "...",
  "descriptionEn": "...",
  "excerptEn": "...",
  "bullets": ["", "", ""],
  "bulletsEn": ["", "", ""],
  "body": [{"heading":"","headingEn":"","paragraphs":["",""],"paragraphsEn":["",""]}],
  "tags": ["", "", ""],
  "tagsEn": ["", "", ""],
  "editorNote": "",
  "editorNoteEn": ""
}

結構：標題 18–30 字、摘要 50–80 字、3–4 個必看重點、2–4 個 H2 分段、最後編輯觀點。
禁忌：唔好用大陸簡轉繁用語（流量改數據、宽带改寬頻、套餐改計劃、智能手环改智能手錶）。唔好標題黨。數字、日期、規格只可以來自來源；來源無寫死就寫「以電訊商確認為準」，不准估月費。唔准寫最平、最抵、最低、保證。description 必須含「以電訊商確認為準」。`;

export function isNewsCategory(value: string): value is TechNewsCategoryId {
  return TECH_NEWS_CATEGORIES.some((item) => item.id === value);
}

export function hongKongDate(now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });
}

export function slugifyNews(raw: string, used: Set<string>): string {
  const base =
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || `news-${hongKongDate()}`;
  let slug = base;
  let n = 2;
  while (used.has(slug) || RESERVED_NEWS_SLUGS.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function isSafeNewsUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host === "127.0.0.1" || host === "::1") return null;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const [a, b] = host.split(".").map(Number);
    if (a === 10 || a === 127 || (a === 192 && b === 168) || (a === 172 && (b ?? 0) >= 16 && (b ?? 0) <= 31)) {
      return null;
    }
  }
  return url;
}

function asStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, max);
}

function asSections(value: unknown): TechNewsArticle["body"] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 5).flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const item = row as Record<string, unknown>;
    const heading = String(item.heading ?? "").trim();
    const headingEn = String(item.headingEn ?? heading).trim();
    const paragraphs = asStringArray(item.paragraphs, 4);
    const paragraphsEn = asStringArray(item.paragraphsEn, 4);
    if (!heading || paragraphs.length === 0) return [];
    return [
      {
        heading,
        headingEn: headingEn || heading,
        paragraphs,
        paragraphsEn: paragraphsEn.length ? paragraphsEn : paragraphs,
      },
    ];
  });
}

export function parseNewsDraft(
  raw: string,
  category: TechNewsCategoryId,
  sourceUrl?: string,
): TechNewsArticle | null {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
  const h1 = String(parsed.h1 ?? "").trim();
  const description = String(parsed.description ?? "").trim();
  const excerpt = String(parsed.excerpt ?? "").trim();
  const bullets = asStringArray(parsed.bullets, 4);
  const body = asSections(parsed.body);
  if (!h1 || !description || !excerpt || bullets.length < 3 || body.length < 2) return null;
  const blob = JSON.stringify(parsed);
  if (NEWS_CLAIM.test(blob)) return null;
  const used = new Set(TECH_NEWS_ARTICLES.map((item) => item.slug));
  const slug = slugifyNews(String(parsed.slug ?? h1), used);
  const minutes = Math.min(12, Math.max(3, Number(parsed.minutes) || 4));
  const withDisclaimer = description.includes("以電訊商確認為準")
    ? description
    : `${description}內容僅供參考，實際條款以電訊商確認為準。`;
  const article: TechNewsArticle = {
    slug,
    category,
    minutes,
    published: hongKongDate(),
    seoTitle: String(parsed.seoTitle ?? `${h1}｜齊Quote`).trim().slice(0, 80),
    h1,
    description: withDisclaimer.slice(0, 180),
    excerpt: excerpt.slice(0, 120),
    seoTitleEn: String(parsed.seoTitleEn ?? `${h1} | 齊Quote`).trim().slice(0, 90),
    h1En: String(parsed.h1En ?? h1).trim(),
    descriptionEn: String(parsed.descriptionEn ?? withDisclaimer).trim().slice(0, 220),
    excerptEn: String(parsed.excerptEn ?? excerpt).trim().slice(0, 160),
    bullets,
    bulletsEn: asStringArray(parsed.bulletsEn, 4).length ? asStringArray(parsed.bulletsEn, 4) : bullets,
    body,
    tags: asStringArray(parsed.tags, 5),
    tagsEn: asStringArray(parsed.tagsEn, 5),
    editorNote: String(parsed.editorNote ?? "實際月費、規格同覆蓋以電訊商確認為準。").trim(),
    editorNoteEn: String(parsed.editorNoteEn ?? "Fees, specs and coverage are confirmed by the carrier.").trim(),
    sourceUrl,
  };
  if (!article.tags.length) article.tags = ["電訊新聞", "齊Quote"];
  if (!article.tagsEn.length) article.tagsEn = ["telecom news", "ChaiQuote"];
  return article;
}

export function newsDeskKey(): string {
  return (process.env.TECH_NEWS_DESK_KEY || process.env.INTEREST_TOKEN || process.env.STATS_TOKEN || "").trim();
}

export function newsDeskKeyOk(token?: string): boolean {
  const expected = newsDeskKey();
  if (!expected) return false;
  return Boolean(token) && token === expected;
}
