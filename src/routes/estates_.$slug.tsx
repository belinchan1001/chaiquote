import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { PlanCard } from "@/components/plan-card";
import { QuoteLink } from "@/components/quote-link";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import {
  estateHousingLabel,
  estateIntro,
  estatePagePath,
  estatePageTitle,
  estatePlans,
  estateSeoDescription,
  estateSeoTitle,
  getEstatePage,
  getEstatePageByName,
  isIndexableEstatePage,
  nearbyEstatePages,
  relatedGuideSlug,
} from "@/lib/estate-pages";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { canonicalUrl, notFoundHead } from "@/lib/canonical";
import { estateDisplayName, parentEstate, placeDisplayName } from "@/lib/estates";
import { estateJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { isNetvigatorOnlyEstate } from "@/lib/estate-new-intake";

export const Route = createFileRoute("/estates_/$slug")({
  loader: ({ params }) => {
    const page = getEstatePage(params.slug);
    if (!page) throw notFound();
    return { page };
  },
  component: EstatePage,
  head: ({ loaderData }) => {
    if (!loaderData) return notFoundHead();
    const { page } = loaderData;
    const { estate } = page;
    const title = estateSeoTitle(estate);
    const description = estateSeoDescription(estate);
    const url = canonicalUrl(estatePagePath(page));
    const indexable = isIndexableEstatePage(page);
    const parent = !indexable ? parentEstate(estate) : undefined;
    const parentPage = parent ? getEstatePageByName(parent.name) : undefined;
    const canonicalHref = parentPage ? canonicalUrl(estatePagePath(parentPage)) : url;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonicalHref },
        ...(indexable ? [] : [{ name: "robots", content: "noindex,follow" }]),
      ],
      links: [{ rel: "canonical", href: canonicalHref }],
    };
  },
});

function EstatePage() {
  const { page } = Route.useLoaderData();
  const { estate } = page;
  const { broadband, home5g } = estatePlans(estate);
  const nearby = nearbyEstatePages(estate);
  const { t, locale, updated } = useI18n();
  const housing = estateHousingLabel(estate.housing, locale);
  const displayDistrict = placeDisplayName(estate.district, locale);
  const displayArea = estate.area ? placeDisplayName(estate.area, locale) : "";
  const pageTitle = estatePageTitle(estate, locale);
  const inquiry = { estate: estate.name, housing: estate.housing, district: estate.district };
  const ready = useHydrateDesk();
  const setInquiry = useDesk((s) => s.setInquiry);
  usePageTitle(pageTitle);
  const broadbandPreview = broadband.slice(0, 4);
  const home5gPreview = home5g.slice(0, 3);

  useEffect(() => {
    if (!ready) return;
    setInquiry(inquiry);
  }, [ready, estate.name, estate.housing, estate.district, setInquiry]);

  const guideSlug = relatedGuideSlug(estate);
  const indexable = isIndexableEstatePage(page);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {indexable ? <JsonLd data={estateJsonLd(page)} /> : null}
      <Link to="/estates" className="text-sm text-muted hover:text-fg">
        香港屋苑寬頻比較
      </Link>
      <p className="mt-6 text-xs font-medium tracking-wider text-muted">
        {displayDistrict}
        {displayArea ? ` · ${displayArea}` : ""} · {housing}
      </p>
      <h1 className="mt-2 text-title font-semibold">{pageTitle}</h1>
      <p className="mt-2 text-xs text-subtle">{t("dataUpdated", { date: updated })}</p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{estateIntro(estate, locale)}</p>
      {isNetvigatorOnlyEstate(estate.name) ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{t("plansNetvigatorOnlyNote")}</p>
      ) : null}
      <div className="mt-6">
        <QuoteLink inquiry={inquiry}>{t("waQuote")}</QuoteLink>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">{t("estateFibreTitle", { housing })}</h2>
        <p className="mt-1 text-sm text-muted">{t("estateFibreLead", { housing })}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {broadbandPreview.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
        <p className="mt-4 text-sm">
          <Link
            to="/plans"
            search={{ cat: "broadband", housing: estate.housing, estate: estate.name }}
            className="text-accent underline-offset-4 hover:underline"
          >
            {broadband.length > broadbandPreview.length
              ? t("estateFibreSeeAllN", { housing, n: broadband.length })
              : t("estateFibreSeeAll", { housing })}
          </Link>
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">{t("estateHome5gTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{t("estateHome5gLead")}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {home5gPreview.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
        {home5g.length > home5gPreview.length ? (
          <p className="mt-4 text-sm">
            <Link
              to="/plans"
              search={{ cat: "home5g", housing: estate.housing, estate: estate.name }}
              className="text-accent underline-offset-4 hover:underline"
            >
              {t("estateHome5gSeeAllN", { n: home5g.length })}
            </Link>
          </p>
        ) : null}
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="text-sm font-medium tracking-wider text-muted">同區其他屋苑</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {nearby.map((item) => (
            <li key={item.slug}>
              <Link
                to="/estates/$slug"
                params={{ slug: item.slug }}
                className="inline-flex h-11 items-center rounded-full bg-surface px-3 text-sm"
              >
                {estateDisplayName(item.estate, locale)}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          <Link to="/estates" className="text-accent underline-offset-4 hover:underline">
            返屋苑目錄
          </Link>
          {" · "}
          <Link
            to="/guides/$slug"
            params={{ slug: guideSlug }}
            className="text-accent underline-offset-4 hover:underline"
          >
            {guideSlug === "village" ? "村屋點揀" : "光纖同 5G 家居分別"}
          </Link>
          {" · "}
          <Link
            to="/plans"
            search={{ cat: "broadband", housing: estate.housing }}
            className="text-accent underline-offset-4 hover:underline"
          >
            {housing}計劃說明
          </Link>
        </p>
      </section>
    </div>
  );
}
