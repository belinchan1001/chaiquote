import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { HOME_NEWS_TEASERS } from "@/lib/home-news-teaser";
import { useI18n } from "@/lib/i18n";

export function HomeNewsRail() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <section className="home-below-fold border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-7">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="home-section-title">{isEn ? "Telecom and tech news" : "電訊新聞"}</h2>
            <p className="home-section-lead">
              {isEn ? "Headlines only. Fees are confirmed by the carrier." : "只放標題。月費以電訊商確認為準。"}
            </p>
          </div>
          <Link
            to="/tech-news"
            className="hidden shrink-0 text-sm font-medium text-accent underline-offset-4 hover:underline sm:inline-flex sm:items-center"
          >
            {isEn ? "All stories" : "睇晒"}
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {HOME_NEWS_TEASERS.map((item) => (
            <li key={item.slug}>
              <Link
                to="/tech-news/$slug"
                params={{ slug: item.slug }}
                className="flex min-h-11 flex-col py-3 hover:text-accent sm:flex-row sm:items-baseline sm:gap-4"
              >
                <p className="shrink-0 text-xs text-subtle">
                  {item.published}
                  {" · "}
                  {isEn ? item.deskEn : item.desk}
                </p>
                <p className="mt-0.5 text-sm font-semibold leading-snug sm:mt-0">{isEn ? item.h1En : item.h1}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 sm:hidden">
          <Link to="/tech-news" className="inline-flex items-center text-sm font-medium text-accent underline-offset-4 hover:underline">
            {isEn ? "All stories" : "睇晒"}
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </p>
      </div>
    </section>
  );
}
