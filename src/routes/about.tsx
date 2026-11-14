import { createFileRoute, Link } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { ABOUT_SEO, aboutJsonLd, canonicalUrl, shareHead } from "@/lib/canonical";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => shareHead(ABOUT_SEO, canonicalUrl("/about")),
});

function AboutPage() {
  const { t } = useI18n();
  usePageTitle(ABOUT_SEO.title);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <JsonLd data={aboutJsonLd()} />
      <h1 className="text-title font-semibold">{t("aboutTitle")}</h1>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">{t("aboutWho")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("aboutWhoText")}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">{t("aboutWhy")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("aboutWhyText")}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">{t("contactUs")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("contactUsLead")}</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <a
              href="https://wa.me/85263099966"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-4 hover:underline"
            >
              {t("aboutWa", { phone: SITE.phoneDisplay })}
            </a>
          </li>
          <li>
            {t("aboutEmail")}{" "}
            <a href={`mailto:${SITE.leadEmail}`} className="text-accent underline-offset-4 hover:underline">
              {SITE.leadEmail}
            </a>
          </li>
          <li>
            <Link to="/quote" className="text-accent underline-offset-4 hover:underline">
              {t("aboutQuote")}
            </Link>
          </li>
          <li>
            <Link to="/privacy" className="text-accent underline-offset-4 hover:underline">
              {t("aboutPrivacy")}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
