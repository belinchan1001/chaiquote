import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { NewsDeskChips, NewsStoryList } from "@/components/news-feed";
import { NewsShareBar } from "@/components/news-share-bar";
import {
  articlesInCategory,
  getTechNewsArticle,
  getTechNewsCategory,
  TECH_NEWS_CATEGORIES,
  techNewsCopy,
  type TechNewsArticle,
  type TechNewsCategory,
} from "@/lib/tech-news";
import { loadPublishedNews, loadPublishedNewsBySlug } from "@/lib/tech-news-live";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { canonicalUrl, notFoundHead, shareHead } from "@/lib/canonical";
import { SITE } from "@/lib/site";

function headingId(heading: string) {
  return heading.replace(/\s+/g, "");
}

function NewsRichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, index) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <a key={index} href={link[2]} className="text-accent underline-offset-4 hover:underline">
              {link[1]}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export const Route = createFileRoute("/tech-news_/$slug")({
  loader: async ({ params }) => {
    const local = getTechNewsArticle(params.slug);
    let live = null;
    try {
      live = local ? null : await loadPublishedNewsBySlug({ data: { slug: params.slug } });
    } catch {
      live = null;
    }
    const article = local ?? live;
    if (article) return { kind: "article" as const, article };
    const category = getTechNewsCategory(params.slug);
    if (category) {
      let extra: TechNewsArticle[] = [];
      try {
        extra = (await loadPublishedNews()).filter((item) => item.category === category.id);
      } catch {
        extra = [];
      }
      return { kind: "hub" as const, category, extra };
    }
    throw notFound();
  },
  component: TechNewsSlugPage,
  head: ({ loaderData }) => {
    if (!loaderData) return notFoundHead();
    if (loaderData.kind === "hub") {
      const { category } = loaderData;
      return shareHead(
        {
          title: `齊Quote｜${category.label}`,
          description: category.excerpt,
        },
        canonicalUrl(`/tech-news/${category.slug}`),
      );
    }
    const { article } = loaderData;
    const url = canonicalUrl(`/tech-news/${article.slug}`);
    return {
      meta: [
        { title: article.seoTitle },
        { name: "description", content: article.description },
        { property: "og:title", content: article.seoTitle },
        { property: "og:description", content: article.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:locale", content: "zh_HK" },
        { property: "og:site_name", content: SITE.name },
        ...(article.image
          ? [{ property: "og:image", content: canonicalUrl(article.image) }]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

function HubPage({ category, extra }: { category: TechNewsCategory; extra: TechNewsArticle[] }) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const title = `齊Quote｜${isEn ? category.labelEn : category.label}`;
  usePageTitle(title);
  const items = [...extra, ...articlesInCategory(category.id)].filter(
    (article, index, list) => list.findIndex((item) => item.slug === article.slug) === index,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav aria-label={isEn ? "Breadcrumb" : "面包屑"} className="text-sm text-muted">
        <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link to="/" className="hover:text-fg">
              {isEn ? "Home" : "首頁"}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/tech-news" className="hover:text-fg">
              {isEn ? "Tech news" : "電訊新聞"}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{isEn ? category.labelEn : category.label}</li>
        </ol>
      </nav>
      <h1 className="mt-6 text-title font-semibold">{isEn ? category.labelEn : category.label}</h1>
      <p className="mt-2 text-sm text-muted">{isEn ? category.excerptEn : category.excerpt}</p>
      <div className="mt-6">
        <NewsDeskChips active={category.id} />
      </div>
      <NewsStoryList articles={items} />
      {category.planCat ? (
        <p className="mt-8 text-sm">
          <Link
            to="/plans"
            search={{ cat: category.planCat }}
            className="inline-flex items-center gap-1 font-medium text-accent underline-offset-4 hover:underline"
          >
            {isEn ? "Compare plans" : "比較計劃"}
            <ArrowRight className="size-4" />
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function ArticlePage({ article }: { article: TechNewsArticle }) {
  const { locale } = useI18n();
  const copy = techNewsCopy(article, locale);
  usePageTitle(copy.seoTitle);
  const isEn = locale === "en";
  const url = canonicalUrl(`/tech-news/${article.slug}`);
  const category = TECH_NEWS_CATEGORIES.find((item) => item.id === article.category);
  const related = (article.related ?? [])
    .map((slug) => getTechNewsArticle(slug))
    .filter((item): item is TechNewsArticle => Boolean(item));

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "NewsArticle",
              headline: copy.h1,
              description: copy.description,
              datePublished: article.published,
              dateModified: article.published,
              inLanguage: isEn ? "en-HK" : "zh-HK",
              url,
              author: { "@type": "Organization", name: SITE.name, url: SITE.url },
              publisher: {
                "@type": "Organization",
                name: SITE.name,
                url: SITE.url,
                logo: { "@type": "ImageObject", url: `${SITE.url}/icon-512.png` },
              },
              keywords: copy.tags.join(","),
              ...(article.image ? { image: canonicalUrl(article.image) } : {}),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: isEn ? "Home" : "首頁", item: canonicalUrl("/") },
                { "@type": "ListItem", position: 2, name: isEn ? "Tech news" : "電訊新聞", item: canonicalUrl("/tech-news") },
                { "@type": "ListItem", position: 3, name: copy.h1, item: url },
              ],
            },
          ],
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
          <li>
            <Link to="/tech-news" className="hover:text-fg">
              {isEn ? "Tech news" : "電訊新聞"}
            </Link>
          </li>
          {category ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link to="/tech-news/$slug" params={{ slug: category.slug }} className="hover:text-fg">
                  {isEn ? category.labelEn : category.label}
                </Link>
              </li>
            </>
          ) : null}
        </ol>
      </nav>
      <p className="mt-6 text-xs text-subtle">
        {article.published}
        {" · "}
        {isEn ? `${article.minutes} min read` : `${article.minutes} 分鐘`}
      </p>
      <h1 className="mt-2 text-title font-semibold">{copy.h1}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">{copy.excerpt}</p>
      <div className="mt-5">
        <NewsShareBar title={copy.h1} url={url} />
      </div>
      {article.image ? (
        <figure className="mt-6 overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
          <picture>
            <source srcSet={article.image.replace(/\.jpg$/, ".webp")} type="image/webp" />
            <img
              src={article.image}
              alt={article.imageAlt ?? copy.h1}
              width={1280}
              height={720}
              decoding="async"
              className="h-auto w-full"
            />
          </picture>
          {article.imageCredit ? (
            <figcaption className="px-3 py-2 text-xs text-subtle">
              {isEn ? `Image: ${article.imageCredit}` : `圖片：${article.imageCredit}`}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
      <ul className="mt-6 list-disc space-y-2 pl-5 text-sm leading-relaxed text-fg">
        {copy.bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {copy.body.map((section) => (
        <section key={section.heading} id={headingId(section.heading)} className="mt-8 scroll-mt-24">
          <h2 className="text-lg font-semibold">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-base leading-relaxed text-muted">
              <NewsRichText text={paragraph} />
            </p>
          ))}
        </section>
      ))}
      <section className="mt-10 rounded-xl bg-card px-4 py-4 shadow-[var(--shadow-border)]">
        <h2 className="text-sm font-semibold">{isEn ? "Editor’s note" : "編輯觀點"}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{copy.editorNote}</p>
      </section>
      <p className="mt-6 text-xs text-subtle">{copy.tags.join(" · ")}</p>
      {article.sourceUrl ? (
        <p className="mt-3 text-sm">
          <a href={article.sourceUrl} className="text-accent underline-offset-4 hover:underline" rel="noopener noreferrer">
            {isEn ? "Source" : "來源"}
          </a>
        </p>
      ) : null}
      <div className="mt-8">
        <NewsShareBar title={copy.h1} url={url} />
      </div>
      {related.length ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">{isEn ? "Related" : "延伸閱讀"}</h2>
          <ul className="mt-3 space-y-2">
            {related.map((item) => {
              const relatedCopy = techNewsCopy(item, locale);
              return (
                <li key={item.slug}>
                  <Link
                    to="/tech-news/$slug"
                    params={{ slug: item.slug }}
                    className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                  >
                    {relatedCopy.h1}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

function TechNewsSlugPage() {
  const data = Route.useLoaderData();
  if (data.kind === "hub") return <HubPage category={data.category} extra={data.extra} />;
  return <ArticlePage article={data.article} />;
}
