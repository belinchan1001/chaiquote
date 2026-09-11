import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { PlanCard } from "@/components/plan-card";
import { QuoteLink } from "@/components/quote-link";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import {
  estateHousingLabel,
  estateIntro,
  estatePagePath,
  estatePlans,
  estateSeoDescription,
  estateSeoTitle,
  getEstatePage,
  nearbyEstatePages,
  relatedGuideSlug,
} from "@/lib/estate-pages";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { canonicalUrl } from "@/lib/canonical";
import { isNetvigatorOnlyEstate } from "@/lib/estate-new-intake";

export const Route = createFileRoute("/estates_/$slug")({
  loader: ({ params }) => {
    const page = getEstatePage(params.slug);
    if (!page) throw notFound();
    return { page };
  },
  component: EstatePage,
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "齊Quote" }] };
    const { estate } = loaderData.page;
    const title = estateSeoTitle(estate);
    const description = estateSeoDescription(estate);
    const url = canonicalUrl(estatePagePath(loaderData.page));
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

function EstatePage() {
  const { page } = Route.useLoaderData();
  const { estate } = page;
  const { broadband, home5g } = estatePlans(estate);
  const nearby = nearbyEstatePages(estate);
  const housing = estateHousingLabel(estate.housing);
  const inquiry = { estate: estate.name, housing: estate.housing, district: estate.district };
  const ready = useHydrateDesk();
  const setInquiry = useDesk((s) => s.setInquiry);
  const { t } = useI18n();
  usePageTitle(estateSeoTitle(estate));

  useEffect(() => {
    if (!ready) return;
    setInquiry(inquiry);
  }, [ready, estate.name, estate.housing, estate.district, setInquiry]);

  const guideSlug = relatedGuideSlug(estate);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/estates" className="text-sm text-muted hover:text-fg">
        香港屋苑寬頻比較
      </Link>
      <p className="mt-6 text-xs font-medium tracking-wider text-muted">
        {estate.district}
        {estate.area ? ` · ${estate.area}` : ""} · {housing}
      </p>
      <h1 className="mt-2 text-title font-semibold">{`${estate.name}寬頻比較｜${housing}｜齊Quote`}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{estateIntro(estate)}</p>
      {isNetvigatorOnlyEstate(estate.name) ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{t("plansNetvigatorOnlyNote")}</p>
      ) : null}
      <div className="mt-6">
        <QuoteLink inquiry={inquiry}>{t("waQuote")}</QuoteLink>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">適用{housing}光纖計劃</h2>
        <p className="mt-1 text-sm text-muted">只列出適用{housing}嘅參考月費，並連去原本計劃頁。</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {broadband.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
        <p className="mt-4 text-sm">
          <Link
            to="/plans"
            search={{ cat: "broadband", housing: estate.housing, estate: estate.name }}
            className="text-accent underline-offset-4 hover:underline"
          >
            睇晒適用{housing}光纖計劃
          </Link>
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">5G 家居寬頻</h2>
        <p className="mt-1 text-sm text-muted">免拉線隨插即用，實際速度視訊號而定。</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {home5g.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
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
                {item.estate.name}
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
