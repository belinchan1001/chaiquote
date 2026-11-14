import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { ProviderMark } from "@/components/provider-mark";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { ABOUT_SEO, aboutJsonLd, canonicalUrl, shareHead } from "@/lib/canonical";
import { ESTATE_COUNT } from "@/lib/estate-count";
import { PLANS, PROVIDERS } from "@/lib/plans";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => shareHead(ABOUT_SEO, canonicalUrl("/about")),
});

function AboutPage() {
  const { t, updated } = useI18n();
  usePageTitle(ABOUT_SEO.title);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <JsonLd data={aboutJsonLd()} />
      <h1 className="text-title font-semibold">{t("aboutTitle")}</h1>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">{t("aboutWho")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t("aboutWhoText", {
            date: updated,
            providers: PROVIDERS.length,
            plans: PLANS.length,
            estates: ESTATE_COUNT,
          })}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">{t("aboutWhy")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("aboutWhyText")}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">{t("aboutIndependent")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t("aboutIndependentText", {
            date: updated,
            providers: PROVIDERS.length,
            plans: PLANS.length,
            estates: ESTATE_COUNT,
          })}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("noCommission")}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">{t("aboutProviders")}</h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PROVIDERS.map((p) => (
            <li key={p.id} className="rounded-lg bg-surface px-3 py-3">
              <ProviderMark id={p.id} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">{t("aboutDisclaimer")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("noCommission")}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("referencePrice")}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("disclaimer1")}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("disclaimer2")}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("disclaimer3")}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          <Link to="/privacy" className="text-accent underline-offset-4 hover:underline">
            {t("aboutPrivacy")}
          </Link>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">{t("contactUs")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("contactUsLead")}</p>
        <p className="mt-3 text-sm">
          <a href={`mailto:${SITE.leadEmail}`} className="text-accent underline-offset-4 hover:underline">
            {SITE.leadEmail}
          </a>
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <QuoteLink showNumber siteNumber />
          <Button asChild variant="outline">
            <a href={`mailto:${SITE.leadEmail}`}>
              <Mail />
              {t("emailUs")}
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/quote">{t("formQuote")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
