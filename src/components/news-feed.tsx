import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import {
  TECH_NEWS_CATEGORIES,
  newsListingCover,
  techNewsCopy,
  type TechNewsArticle,
  type TechNewsCategoryId,
} from "@/lib/tech-news";
import { isRemoteNewsImage } from "@/lib/tech-news-desk";
import { cn } from "@/lib/utils";

export function NewsDeskChips({ active }: { active?: TechNewsCategoryId }) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <nav aria-label={isEn ? "Desks" : "專區"} className="flex flex-wrap gap-2">
      <Link
        to="/tech-news"
        className={cn(
          "inline-flex h-9 items-center rounded-full px-3 text-sm",
          !active ? "bg-primary text-primary-foreground" : "bg-card text-muted shadow-[var(--shadow-border)]",
        )}
      >
        {isEn ? "All" : "全部"}
      </Link>
      {TECH_NEWS_CATEGORIES.map((cat) => (
        <Link
          key={cat.id}
          to="/tech-news/$slug"
          params={{ slug: cat.slug }}
          className={cn(
            "inline-flex h-9 items-center rounded-full px-3 text-sm",
            active === cat.id
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted shadow-[var(--shadow-border)]",
          )}
        >
          {isEn ? cat.labelEn : cat.label}
        </Link>
      ))}
    </nav>
  );
}

function deskLabel(article: TechNewsArticle, isEn: boolean) {
  const desk = TECH_NEWS_CATEGORIES.find((item) => item.id === article.category);
  if (!desk) return "";
  return isEn ? desk.labelEn : desk.label;
}

function NewsFeaturedStory({ article }: { article: TechNewsArticle }) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const copy = techNewsCopy(article, locale);
  const cover = newsListingCover(article);
  const label = deskLabel(article, isEn);

  return (
    <Link
      to="/tech-news/$slug"
      params={{ slug: article.slug }}
      data-news-feature=""
      data-slug={article.slug}
      data-cover={cover ? "true" : "false"}
      className={cn(
        "mt-5 block overflow-hidden rounded-md border border-border bg-card text-inherit no-underline shadow-[var(--shadow-border)] hover:text-inherit lg:mt-6",
        cover && "lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-stretch",
      )}
    >
      {cover ? (
        <div className="aspect-video overflow-hidden bg-surface lg:aspect-auto lg:h-full lg:min-h-[17.5rem]">
          <img
            src={cover}
            alt=""
            width={1920}
            height={1080}
            decoding="async"
            fetchPriority="high"
            referrerPolicy={isRemoteNewsImage(cover) ? "no-referrer" : undefined}
            className="block size-full object-cover object-center"
          />
        </div>
      ) : null}
      <div className="px-4 pb-[1.1rem] pt-[0.95rem] lg:flex lg:flex-col lg:justify-center lg:px-[1.4rem] lg:pb-[1.45rem] lg:pt-[1.35rem]">
        <p className="flex flex-wrap items-center gap-x-[0.55rem] gap-y-[0.45rem] text-xs leading-[1.3] text-subtle">
          {label ? (
            <span className="inline-flex h-[1.35rem] items-center rounded-full bg-surface px-2 font-medium text-muted">
              {label}
            </span>
          ) : null}
          <span>{article.published}</span>
        </p>
        <h2 className="mt-[0.45rem] text-[1.125rem] font-semibold leading-[1.35] tracking-[-0.01em] text-pretty text-fg lg:mt-[0.55rem] lg:text-[1.375rem] lg:leading-[1.32]">
          {copy.h1}
        </h2>
        <p className="mt-[0.45rem] text-sm leading-[1.7] text-pretty text-muted lg:mt-[0.55rem]">{copy.excerpt}</p>
      </div>
    </Link>
  );
}

function NewsCompactRows({ articles }: { articles: readonly TechNewsArticle[] }) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  if (!articles.length) return null;

  return (
    <ul className="mt-[0.35rem] list-none p-0 lg:mt-[0.45rem]">
      {articles.map((article) => {
        const copy = techNewsCopy(article, locale);
        const label = deskLabel(article, isEn);
        return (
          <li key={article.slug} className="border-t border-border first:border-t-0" data-slug={article.slug}>
            <Link
              to="/tech-news/$slug"
              params={{ slug: article.slug }}
              data-news-row=""
              className="group block px-[0.15rem] py-[0.85rem] text-inherit no-underline hover:text-inherit lg:px-[0.2rem] lg:py-[0.95rem]"
            >
              <p className="text-xs leading-[1.3] text-subtle">
                {article.published}
                {label ? ` · ${label}` : ""}
              </p>
              <p className="mt-[0.28rem] text-[0.9375rem] font-semibold leading-[1.4] text-pretty text-fg group-hover:text-primary lg:text-base">
                {copy.h1}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NewsStoryList({ articles }: { articles: readonly TechNewsArticle[] }) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [featured, ...rest] = articles;

  if (!featured) {
    return (
      <p className="mt-8 text-sm leading-relaxed text-muted">
        {isEn ? "No stories in this desk yet." : "呢個專區暫時未有稿。"}
      </p>
    );
  }

  return (
    <>
      <NewsFeaturedStory article={featured} />
      <NewsCompactRows articles={rest} />
    </>
  );
}
