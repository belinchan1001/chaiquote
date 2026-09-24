import { createFileRoute, Link } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { NewsDeskChips, NewsStoryList } from "@/components/news-feed";
import { TECH_NEWS_ARTICLES, TECH_NEWS_CATEGORIES } from "@/lib/tech-news";
import { TECH_NEWS_SEO } from "@/lib/tech-news-seo";
import { loadPublishedNews } from "@/lib/tech-news-live";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { canonicalUrl, shareHead } from "@/lib/canonical";

export const Route = createFileRoute("/tech-news")({
  component: TechNewsIndex,
  loader: async () => {
    try {
      return { extra: await loadPublishedNews() };
    } catch {
      return { extra: [] as const };
    }
  },
  head: () => shareHead(TECH_NEWS_SEO, canonicalUrl("/tech-news")),
});

function TechNewsIndex() {
  const { locale } = useI18n();
  usePageTitle(TECH_NEWS_SEO.title);
  const url = canonicalUrl("/tech-news");
  const isEn = locale === "en";
  const { extra } = Route.useLoaderData();
  const latest = [...extra, ...TECH_NEWS_ARTICLES].filter(
    (article, index, list) => list.findIndex((item) => item.slug === article.slug) === index,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TECH_NEWS_SEO.title,
          description: TECH_NEWS_SEO.description,
          url,
          inLanguage: isEn ? "en-HK" : "zh-HK",
          hasPart: TECH_NEWS_CATEGORIES.map((cat) => ({
            "@type": "CollectionPage",
            name: isEn ? cat.labelEn : cat.label,
            url: canonicalUrl(`/tech-news/${cat.slug}`),
          })),
        }}
      />
      <nav aria-label={isEn ? "Breadcrumb" : "面包屑"} className="text-sm text-muted">
        <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link to="/" className="hover:text-fg">
              {isEn ? "Home" : "首頁"}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{isEn ? "Tech news" : "電訊新聞"}</li>
        </ol>
      </nav>
      <h1 className="mt-6 text-title font-semibold">{isEn ? "Telecom and tech news" : "電訊同科技新聞"}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        {isEn
          ? "Hong Kong telecom, phones, gadgets and games. Not a live price list — the carrier confirms fees."
          : "香港電訊、出機、科技同電玩。呢度唔係即時價表，月費以電訊商確認為準。"}
      </p>
      <div className="mt-6">
        <NewsDeskChips />
      </div>
      <NewsStoryList articles={latest} />
    </div>
  );
}
