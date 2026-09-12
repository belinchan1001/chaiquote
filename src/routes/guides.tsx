import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { GUIDE_CATEGORY_META } from "@/lib/guide-articles";
import { GUIDES, getGuide, guideCopy } from "@/lib/guides";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { GUIDES_SEO, canonicalUrl, shareHead } from "@/lib/canonical";

export const Route = createFileRoute("/guides")({
  component: GuidesPage,
  head: () => shareHead(GUIDES_SEO, canonicalUrl("/guides")),
});

function GuidesPage() {
  const { t, locale } = useI18n();
  usePageTitle(GUIDES_SEO.title);
  const url = canonicalUrl("/guides");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: GUIDES_SEO.title,
          description: GUIDES_SEO.description,
          url,
          inLanguage: "zh-HK",
          hasPart: GUIDE_CATEGORY_META.map((cat) => ({
            "@type": "Article",
            name: locale === "en" ? cat.labelEn : cat.label,
            url: canonicalUrl(`/guides/${cat.slug}`),
          })),
        }}
      />
      <nav aria-label={t("crumbNav")} className="text-sm text-muted">
        <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link to="/" className="hover:text-fg">
              {t("crumbHome")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{t("navGuides")}</li>
        </ol>
      </nav>
      <h1 className="mt-6 text-title font-semibold">{t("guidesIndexH1")}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t("guidesIndexLead")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {GUIDE_CATEGORY_META.map((cat) => {
          const hub = getGuide(cat.slug);
          const copy = hub ? guideCopy(hub, locale) : null;
          return (
            <div
              key={cat.id}
              className="flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
            >
              <Link to="/guides/$slug" params={{ slug: cat.slug }} className="group flex min-h-11 flex-1 flex-col">
                <picture>
                  <source srcSet={cat.image.replace(/\.jpg$/, ".webp")} type="image/webp" />
                  <img
                    src={cat.image}
                    alt=""
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    className="h-36 w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
                  />
                </picture>
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-semibold">{locale === "en" ? cat.labelEn : cat.label}</p>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{copy?.excerpt}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                    {t("readGuide")}
                    <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
              <p className="border-t border-border px-4 py-3 text-sm">
                <Link
                  to="/plans"
                  search={{ cat: cat.planCat }}
                  className="text-accent underline-offset-4 hover:underline"
                >
                  {t("goCompare")}
                </Link>
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 space-y-10">
        {GUIDE_CATEGORY_META.map((cat) => {
          const items = GUIDES.filter((guide) => guide.category === cat.id);
          return (
            <section key={cat.id}>
              <h2 className="text-lg font-semibold">{locale === "en" ? cat.labelEn : cat.label}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {items.map((guide) => {
                  const copy = guideCopy(guide, locale);
                  return (
                    <li key={guide.slug}>
                      <Link
                        to="/guides/$slug"
                        params={{ slug: guide.slug }}
                        className="flex h-full min-h-11 flex-col rounded-xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
                      >
                        <p className="font-semibold">{copy.title}</p>
                        <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{copy.excerpt}</p>
                        <p className="mt-3 text-xs text-subtle">{t("minutesRead", { n: guide.minutes })}</p>
                        <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent">
                          {t("seeDetail")}
                          <ArrowRight className="size-4" />
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
