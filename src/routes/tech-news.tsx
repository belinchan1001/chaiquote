import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { TECH_NEWS_ARTICLES, TECH_NEWS_CATEGORIES, TECH_NEWS_SEO, techNewsCopy } from "@/lib/tech-news";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { canonicalUrl, shareHead } from "@/lib/canonical";

export const Route = createFileRoute("/tech-news")({
  component: TechNewsIndex,
  head: () => shareHead(TECH_NEWS_SEO, canonicalUrl("/tech-news")),
});

function TechNewsIndex() {
  const { locale } = useI18n();
  usePageTitle(TECH_NEWS_SEO.title);
  const url = canonicalUrl("/tech-news");
  const isEn = locale === "en";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
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
      <p className="mt-6 text-xs font-medium tracking-wider text-subtle">{isEn ? "INDEPENDENT DESK" : "獨立頻道"}</p>
      <h1 className="mt-2 text-title font-semibold">{isEn ? "Telecom and tech news" : "電訊同科技新聞"}</h1>
      <p className="mt-3 max-w-2xl text-muted">
        {isEn
          ? "A separate news desk on ChaiQuote: Hong Kong telecom offers, handsets, gadgets and games. Not a live price list. The carrier confirms fees and coverage."
          : "齊Quote 獨立新聞頁：香港電訊優惠、出機、科技同電玩。呢度唔係即時價表。實際月費同覆蓋以電訊商確認為準。"}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TECH_NEWS_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            to="/tech-news/$slug"
            params={{ slug: cat.slug }}
            className="group flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
          >
            <picture className="photo-strip photo-strip-tile">
              <source srcSet={cat.image.replace(/\.jpg$/, ".webp")} type="image/webp" />
              <img
                src={cat.image}
                alt=""
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className="outline outline-1 -outline-offset-1 outline-fg/10"
              />
            </picture>
            <div className="flex flex-1 flex-col p-4">
              <p className="font-semibold">{isEn ? cat.labelEn : cat.label}</p>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{isEn ? cat.excerptEn : cat.excerpt}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                {isEn ? "Open desk" : "入專區"}
                <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </p>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">{isEn ? "Latest" : "最新稿"}</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {TECH_NEWS_ARTICLES.map((article) => {
            const copy = techNewsCopy(article, locale);
            return (
              <li key={article.slug}>
                <Link
                  to="/tech-news/$slug"
                  params={{ slug: article.slug }}
                  className="flex h-full min-h-11 flex-col rounded-xl bg-card px-4 py-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
                >
                  <p className="text-xs text-subtle">
                    {article.published}
                    {" · "}
                    {isEn ? `${article.minutes} min` : `${article.minutes} 分鐘`}
                  </p>
                  <p className="mt-2 font-semibold">{copy.h1}</p>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{copy.excerpt}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
