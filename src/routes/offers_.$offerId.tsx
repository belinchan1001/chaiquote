import { useRef, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PlanCard } from "@/components/plan-card";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { claimOfferView, issueOfferLink, peekOfferView, type OfferView } from "@/lib/offer-token";
import { formatFee, staffOfferLabel, staffOfferPlans } from "@/lib/plans";
import { CATEGORY_SEO } from "@/lib/canonical";
import { SITE } from "@/lib/site";

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
    return {
      offerId: params.offerId,
      token: deps.k,
      view,
      summaries: known.map((plan) => `${plan.name} · ${formatFee(plan.monthlyFee)}`),
    };
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
  const { offerId, token, view: initial, summaries } = Route.useLoaderData();
  const [view, setView] = useState<OfferView>(initial);
  const [issued, setIssued] = useState("");
  const [copied, setCopied] = useState(false);
  const [mintError, setMintError] = useState(false);
  const [busy, setBusy] = useState(false);
  const linkRef = useRef<HTMLParagraphElement>(null);
  useHydrateDesk();
  const { t, categoryLabel, locale } = useI18n();
  usePageTitle(CATEGORY_SEO.broadband.title);

  async function mint() {
    setBusy(true);
    setMintError(false);
    try {
      const result = await issueOfferLink({ data: { offerId } });
      if (result.ok && result.path) {
        const url = `${SITE.url}${result.path}`;
        setIssued(url);
        setCopied(false);
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      } else {
        setIssued("");
        setMintError(true);
      }
    } catch {
      setIssued("");
      setMintError(true);
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
      const node = linkRef.current;
      if (!node) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
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
          <p className="text-xs font-medium tracking-wider text-accent">{t("staffOfferTitle")}</p>
          <h1 className="mt-2 text-title font-semibold">{staffOfferLabel(offerId, locale)}</h1>
          <ul className="mt-3 list-none space-y-1 p-0 text-sm text-muted">
            {summaries.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{t("offerMintLead")}</p>
          <Button type="button" className="mt-6" onClick={() => void mint()} disabled={busy}>
            {t(issued ? "offerMintAgainPlan" : "offerMintMakePlan", { plan: staffOfferLabel(offerId, locale) })}
          </Button>
          {mintError ? <p className="mt-4 text-sm text-accent">{t("offerMintFail")}</p> : null}
          {issued ? (
            <div className="mt-6 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
              <p className="text-sm font-medium text-fg">{t("offerMintReady")}</p>
              <p className="mt-1 text-xs text-muted">{staffOfferLabel(offerId, locale)}</p>
              <p
                ref={linkRef}
                className="mt-3 break-all font-mono text-sm leading-relaxed text-fg select-all"
              >
                {issued}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button type="button" onClick={() => void copyLink()}>
                  {copied ? t("shareCopied") : t("offerMintCopy")}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <a href={`https://wa.me/?text=${encodeURIComponent(issued)}`} target="_blank" rel="noopener noreferrer">
                    {t("offerMintSend")}
                  </a>
                </Button>
              </div>
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
