import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PlanCard } from "@/components/plan-card";
import { useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { staffOfferLabel, staffOfferPlans } from "@/lib/plans";
import { CATEGORY_SEO } from "@/lib/canonical";

export const Route = createFileRoute("/offers_/$offerId")({
  component: StaffOfferPage,
  loader: async ({ params }) => {
    const plans = staffOfferPlans(params.offerId);
    if (!plans.length) throw notFound();
    return { offerId: params.offerId, plans };
  },
  head: () => {
    const { title, description } = CATEGORY_SEO.broadband;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
});

function StaffOfferPage() {
  const { offerId, plans } = Route.useLoaderData();
  useHydrateDesk();
  const { t, locale } = useI18n();
  usePageTitle(CATEGORY_SEO.broadband.title);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-medium tracking-wider text-accent">{t("staffOfferTitle")}</p>
      <h1 className="mt-2 text-title font-semibold">{staffOfferLabel(offerId, locale)}</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{t("staffOfferLead")}</p>
      <p className="mt-2 text-sm text-muted">
        {t("foundPlans", { n: plans.length })}
        <span className="mt-1 block text-xs text-subtle sm:mt-0 sm:ml-2 sm:inline">{t("coverageCheck")}</span>
      </p>
      <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2">
        {plans.map((plan) => (
          <li key={plan.id}>
            <PlanCard plan={plan} />
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <Link to="/plans" search={{ cat: "broadband" }} className="text-sm text-accent underline">
          {t("backHome")}
        </Link>
      </p>
    </div>
  );
}
