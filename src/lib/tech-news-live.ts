import { createServerFn } from "@tanstack/react-start";
import { getPublishedNews, listPublishedNews } from "./tech-news-store.ts";

export const loadPublishedNews = createServerFn({ method: "POST" }).handler(async () => {
  return listPublishedNews();
});

export const loadPublishedNewsBySlug = createServerFn({ method: "POST" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    return getPublishedNews((data.slug ?? "").trim());
  });
