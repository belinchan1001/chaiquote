import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PlanCard } from "@/components/plan-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuoteLink } from "@/components/quote-link";
import { useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { claimOfferView, issueOfferLink, peekOfferView, type OfferView } from "@/lib/offer-token";
import { staffOfferPlans } from "@/lib/plans";
import { CATEGORY_SEO } from "@/lib/canonical";

type OfferSearch = { k?: string };

export const Route = createFileRoute("/offers_/$offerId")({
  component: StaffOfferPage,
  validateSearch: (search: Record<string, unknown>): OfferSearch => ({
    k: typeof search.k === "string" && search.k.length > 0 ? search.k : undefined,
  }),
  loaderDeps: ({ search }) => ({ k: search.k }),
  loader: async ({ params, deps }) => {
    const known = staffOfferPlans(params.offerId);
    if (!known.length) throw notFound();
    const view = await peekOfferView({ data: { offerId: params.offerId, token: deps.k } });
    return { offerId: params.offerId, token: deps.k, view };
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
  const { offerId, token, view: initial } = Route.useLoaderData();
  const [view, setView] = useState<OfferView>(initial);
  const [issued, setIssued] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  useHydrateDesk();
  const { t, categoryLabel } = useI18n();
  usePageTitle(CATEGORY_SEO.broadband.title);

  async function mint() {
    setBusy(true);
    try {
      const result = await issueOfferLink({ data: { offerId } });
      if (result.ok) {
        setIssued(`${window.location.origin}${result.path}`);
        setCopied(false);
      }
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(issued);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function openPlans() {
    if (!token) return;
    setBusy(true);
    try {
      const next = await claimOfferView({ data: { offerId, token } });
      setView(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {view.status === "ready" ? (
        <>
          <p className="text-xs font-medium tracking-wider text-accent">{t("filterPlans")}</p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-title font-semibold">{categoryLabel("broadband")}</h1>
            <p className="text-sm text-muted">
              {t("foundPlans", { n: view.plans.length })}
              <span className="mt-1 block text-xs text-subtle sm:mt-0 sm:ml-2 sm:inline">{t("coverageCheck")}</span>
            </p>
          </div>
          <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2">
            {view.plans.map((plan) => (
              <li key={plan.id}>
                <PlanCard plan={plan} />
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {view.status === "mint" ? (
        <>
          <h1 className="text-title font-semibold">{t("offerMintTitle")}</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{t("offerMintLead")}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="button" onClick={() => void mint()} disabled={busy}>
              {t("offerMintMake")}
            </Button>
          </div>
          {issued ? (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input readOnly value={issued} className="font-mono text-sm" />
              <Button type="button" variant="outline" onClick={() => void copyLink()}>
                {copied ? t("shareCopied") : t("offerMintCopy")}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}

      {view.status === "landing" ? (
        <>
          <h1 className="text-title font-semibold">{t("offerOpenTitle")}</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{t("offerOpenLead")}</p>
          <Button type="button" className="mt-6" onClick={() => void openPlans()} disabled={busy}>
            {t("offerOpen")}
          </Button>
        </>
      ) : null}

      {view.status === "used" || view.status === "invalid" ? (
        <>
          <h1 className="text-title font-semibold">{t("offerUsedTitle")}</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{t("offerUsedLead")}</p>
          <div className="mt-6">
            <QuoteLink className="inline-flex">{t("askWa")}</QuoteLink>
          </div>
        </>
      ) : null}

      <p className="mt-8">
        <Link to="/plans" search={{ cat: "broadband" }} className="text-sm text-accent underline">
          {t("backHome")}
        </Link>
      </p>
    </div>
  );
}
