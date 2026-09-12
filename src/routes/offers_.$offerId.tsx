import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PlanCard } from "@/components/plan-card";
import { useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { staffOfferPlans } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { canonicalUrl } from "@/lib/canonical";

export const Route = createFileRoute("/offers_/$offerId")({
  component: StaffOfferPage,
  loader: ({ params }) => {
    const plans = staffOfferPlans(params.offerId);
    if (!plans.length) throw notFound();
    return { offerId: params.offerId, plans };
  },
  head: () => {
    const title = `指定優惠｜${SITE.name}`;
    const description = "此頁為指定優惠連結，所列月費僅供參考，實際以電訊商確認為準。";
    const url = canonicalUrl("/offers/nv98");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
    };
  },
});

function StaffOfferPage() {
  const { plans } = Route.useLoaderData();
  useHydrateDesk();
  const { t } = useI18n();
  usePageTitle(`${t("staffOfferTitle")}｜${SITE.name}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-medium tracking-wider text-accent">{t("staffOfferTitle")}</p>
      <h1 className="mt-2 text-title font-semibold">{t("staffOfferTitle")}</h1>
      <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm text-muted">{t("staffOfferLead")}</p>
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
