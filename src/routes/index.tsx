import { createFileRoute, Link } from "@tanstack/react-router";
import { EstateNameSearch } from "@/components/estate-name-search";
import { JsonLd } from "@/components/json-ld";
import { getEstatePageByName, HOT_ESTATE_NAMES } from "@/lib/estate-pages";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { formatFee, minMonthlyFee } from "@/lib/plans";
import { HOME_SEO_TITLE } from "@/lib/seo";
import { SITE } from "@/lib/site";
import type { MessageKey } from "@/lib/messages";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: HOME_SEO_TITLE }],
  }),
});

function Home() {
  const fiberFrom = minMonthlyFee("broadband");
  const home5gFrom = minMonthlyFee("home5g");
  const mobileFrom = minMonthlyFee("mobile");
  const { t } = useI18n();
  usePageTitle(HOME_SEO_TITLE);
  const faqs: { q: MessageKey; a: MessageKey }[] = [
    { q: "faq1q", a: "faq1a" },
    { q: "faq2q", a: "faq2a" },
    { q: "faq3q", a: "faq3a" },
    { q: "faq4q", a: "faq4a" },
    { q: "faq5q", a: "faq5a" },
    { q: "faq6q", a: "faq6a" },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: t(item.q),
            acceptedAnswer: {
              "@type": "Answer",
              text: t(item.a, { phone: SITE.phoneDisplay }),
            },
          })),
        }}
      />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
        <h1 className="text-center font-display text-display font-semibold leading-none tracking-tight">
          搵寬頻唔使四圍問
        </h1>
        <div className="mt-8">
          <EstateNameSearch id="estate-search" size="lg" />
        </div>
        <p className="mt-3 text-center text-sm text-muted">
          填屋苑就會判斷公屋、居屋、私樓定村屋，然後只睇啱你嗰類計劃
        </p>
        <p className="mt-6 text-center text-sm">
          <Link to="/plans" search={{ cat: "broadband" }} className="text-accent underline-offset-4 hover:underline">
            睇晒光纖
          </Link>
          <span className="px-2 text-subtle">·</span>
          <Link to="/plans" search={{ cat: "home5g" }} className="text-accent underline-offset-4 hover:underline">
            5G家居
          </Link>
          <span className="px-2 text-subtle">·</span>
          <Link
            to="/plans"
            search={{ cat: "broadband", housing: "public" }}
            className="text-accent underline-offset-4 hover:underline"
          >
            公屋計劃
          </Link>
          <span className="px-2 text-subtle">·</span>
          <Link
            to="/plans"
            search={{ cat: "broadband", housing: "village" }}
            className="text-accent underline-offset-4 hover:underline"
          >
            村屋計劃
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-muted">
          光纖 {formatFee(fiberFrom)} 起 · 5G家居 {formatFee(home5gFrom)} 起 · 手機 {formatFee(mobileFrom)} 起
        </p>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-title font-semibold">{t("faqTitle")}</h2>
          <div className="mt-6 divide-y divide-border">
            {faqs.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium">
                  {t(item.q)}
                  <span className="text-subtle transition-transform duration-150 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{t(item.a, { phone: SITE.phoneDisplay })}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h2 className="text-sm font-medium tracking-wider text-muted">熱門屋苑</h2>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {HOT_ESTATE_NAMES.map((name) => {
              const page = getEstatePageByName(name);
              if (!page) return null;
              return (
                <Link
                  key={name}
                  to="/estates/$slug"
                  params={{ slug: page.slug }}
                  className="h-11 inline-flex items-center text-accent underline-offset-4 hover:underline"
                >
                  {name}
                </Link>
              );
            })}
          </p>
        </div>
      </section>
    </div>
  );
}
