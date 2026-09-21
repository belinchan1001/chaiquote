import { getSql } from "@/lib/db";
import type { TechNewsArticle } from "./tech-news.ts";
import { isNewsCategory } from "./tech-news-desk.ts";

function asArticle(row: { payload?: unknown }): TechNewsArticle | null {
  const payload = row.payload;
  if (!payload || typeof payload !== "object") return null;
  const article = payload as TechNewsArticle;
  if (!article.slug || !article.h1 || !isNewsCategory(article.category)) return null;
  return article;
}

export async function listPublishedNews(): Promise<TechNewsArticle[]> {
  try {
    const sql = await getSql();
    const rows = await sql.query<{ payload: unknown }>(
      `select payload from tech_news order by published_at desc, created_at desc limit 80`,
    );
    return rows.map(asArticle).filter((item): item is TechNewsArticle => Boolean(item));
  } catch (err) {
    console.error("[tech-news] list failed", err);
    return [];
  }
}

export async function getPublishedNews(slug: string): Promise<TechNewsArticle | null> {
  try {
    const sql = await getSql();
    const rows = await sql.query<{ payload: unknown }>(`select payload from tech_news where slug = $1 limit 1`, [
      slug,
    ]);
    return rows[0] ? asArticle(rows[0]) : null;
  } catch (err) {
    console.error("[tech-news] get failed", err);
    return null;
  }
}

export async function insertPublishedNews(article: TechNewsArticle): Promise<boolean> {
  try {
    const sql = await getSql();
    await sql.query(
      `insert into tech_news (slug, category, source_url, payload, published_at)
       values ($1, $2, $3, $4::jsonb, $5)
       on conflict (slug) do update set
         category = excluded.category,
         source_url = excluded.source_url,
         payload = excluded.payload,
         published_at = excluded.published_at`,
      [
        article.slug,
        article.category,
        article.sourceUrl ?? null,
        JSON.stringify(article),
        article.published,
      ],
    );
    return true;
  } catch (err) {
    console.error("[tech-news] insert failed", err);
    return false;
  }
}
