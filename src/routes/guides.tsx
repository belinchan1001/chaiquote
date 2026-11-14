import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { GUIDE_CATEGORY_META } from "@/lib/guide-articles";
import { GUIDES, getGuide, guideCopy, guideManuscriptDates, guidePlainText, type Guide } from "@/lib/guides";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { CARD_IMAGE_SIZES, webpSrcSet } from "@/lib/image-src";
import { GUIDES_SEO, canonicalUrl, shareHead } from "@/lib/canonical";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/guides")({
  component: GuidesPage,
  head: () => shareHead(GUIDES_SEO, canonicalUrl("/guides")),
});


function GuideCardDate({ guide }: { guide: Guide }) {
  const { t } = useI18n();
  const { published, modified } = guideManuscriptDates(guide);
  const stamp = modified ?? published;
  const read = t("minutesRead", { n: guide.minutes });
  return (
    <p className="mt-3 text-xs text-subtle">
      {stamp ? `${t("dataUpdated", { date: stamp })} · ${read}` : read}
    </p>
  );
}

function GuidesPage() {
  const { t, locale } = useI18n();
  usePageTitle(GUIDES_SEO.title);
  const url = canonicalUrl("/guides");

  return (
    <div data-guide-fab-clear="" className="mx-auto max-w-6xl px-4 py-10">
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
      <p className="mt-2 max-w-2xl text-sm">
        <Link
          to="/guides/$slug"
          params={{ slug: "home-broadband-2026" }}
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          {locale === "en" ? "Six-carrier 1000M reference fees" : "六大電訊 1000M 參考月費表"}
        </Link>
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {GUIDE_CATEGORY_META.map((cat) => {
          const hub = getGuide(cat.slug);
          const copy = hub ? guideCopy(hub, locale) : null;
          const featured = cat.id === "fiber";
          return (
            <div
              key={cat.id}
              className={cn(
                "flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
                featured && "shadow-[var(--shadow-border-hover)] sm:col-span-2 md:col-span-3 md:flex-row",
              )}
            >
              <Link
                to="/guides/$slug"
                params={{ slug: cat.slug }}
                id={featured ? "guide-hub-fiber" : undefined}
                className={cn("group flex min-h-11 flex-1 flex-col", featured && "md:flex-row")}
              >
                <picture
                  className={cn(
                    "photo-strip photo-strip-tile",
                    featured && "photo-strip-feature md:w-[42%] md:shrink-0",
                  )}
                >
                  <source srcSet={webpSrcSet(cat.image)} sizes={CARD_IMAGE_SIZES} type="image/webp" />
                  <img
                    src={cat.image}
                    alt=""
                    width={800}
                    height={600}
                    sizes={CARD_IMAGE_SIZES}
                    loading="lazy"
                    decoding="async"
                    className="outline outline-1 -outline-offset-1 outline-fg/10"
                  />
                </picture>
                <div className={cn("flex flex-1 flex-col p-4", featured && "md:justify-center md:p-8")}>
                  <p className={cn("font-semibold", featured && "text-xl")}>
                    {locale === "en" ? cat.labelEn : cat.label}
                  </p>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{guidePlainText(copy?.excerpt ?? "")}</p>
                  <p
                    className={cn(
                      "mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent",
                      featured && "mt-5",
                    )}
                  >
                    {t("readGuide")}
                    <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-14 divide-y divide-border">
        {GUIDE_CATEGORY_META.map((cat) => {
          const items = GUIDES.filter((guide) => guide.category === cat.id);
          return (
            <section key={cat.id} className="py-8">
              <h2 className="text-sm font-medium text-muted">{locale === "en" ? cat.labelEn : cat.label}</h2>
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
                        <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{guidePlainText(copy.excerpt)}</p>
                        <GuideCardDate guide={guide} />
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
