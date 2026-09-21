import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import {
  TECH_NEWS_CATEGORIES,
  techNewsCopy,
  type TechNewsArticle,
  type TechNewsCategoryId,
} from "@/lib/tech-news";
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

export function NewsStoryList({ articles }: { articles: readonly TechNewsArticle[] }) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  if (!articles.length) {
    return (
      <p className="mt-8 text-sm leading-relaxed text-muted">
        {isEn ? "No stories in this desk yet." : "呢個專區暫時未有稿。"}
      </p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-fg/10">
      {articles.map((article) => {
        const copy = techNewsCopy(article, locale);
        const desk = TECH_NEWS_CATEGORIES.find((item) => item.id === article.category);
        return (
          <li key={article.slug}>
            <Link
              to="/tech-news/$slug"
              params={{ slug: article.slug }}
              className="flex min-h-11 gap-4 py-4 hover:text-accent"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-subtle">
                  {article.published}
                  {desk ? ` · ${isEn ? desk.labelEn : desk.label}` : ""}
                </p>
                <p className="mt-1 font-semibold leading-snug">{copy.h1}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{copy.excerpt}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
