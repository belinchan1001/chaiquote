import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { QuoteLink } from "@/components/quote-link";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { getGuide, guideCopy, type GuideTable } from "@/lib/guides";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { canonicalUrl, guideJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { whatsappHref } from "@/lib/whatsapp";

export const Route = createFileRoute("/guides_/$slug")({
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    return { guide };
  },
  component: GuidePage,
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: SITE.name }] };
    const { guide } = loaderData;
    const url = canonicalUrl(`/guides/${guide.slug}`);
    return {
      meta: [
        { title: guide.seoTitle },
        { name: "description", content: guide.description },
        { property: "og:title", content: guide.seoTitle },
        { property: "og:description", content: guide.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:locale", content: "zh_HK" },
        { property: "og:site_name", content: SITE.name },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

function headingId(heading: string) {
  return heading.replace(/\s+/g, "");
}

function GuideRichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        const bold = part.match(/^\*\*([^*]+)\*\*$/);
        if (bold) {
          return (
            <strong key={index} className="font-semibold text-fg">
              {bold[1]}
            </strong>
          );
        }
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <a key={index} href={link[2]} className="text-accent underline-offset-4 hover:underline">
              {link[1]}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function GuideCompareCards({ table, seeDetail }: { table: GuideTable; seeDetail: string }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {table.rows.map((row) => (
        <a
          key={row.label}
          href={row.href}
          className="flex h-full min-h-11 flex-col rounded-xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
        >
          <p className="font-semibold">{row.label}</p>
          <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{row.value}</p>
          <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
            {seeDetail}
            <ArrowRight className="size-4" />
          </p>
        </a>
      ))}
    </div>
  );
}

function GuidePage() {
  const { guide } = Route.useLoaderData();
  const { t, locale } = useI18n();
  const copy = guideCopy(guide, locale);
  usePageTitle(guide.seoTitle);
  const related = (guide.related ?? [])
    .map((slug) => getGuide(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const plans = guide.plans ?? [];
  const primaryPlan = plans[0];
  const estates = guide.estates ?? [
    { href: "/estates", label: "屋苑目錄" },
    { href: "/estates/tin-yiu", label: "天耀邨" },
  ];
  const toc = [
    ...copy.body.map((section) => ({ id: headingId(section.heading), label: section.heading })),
    ...(copy.faq.length ? [{ id: "faq", label: t("faqHeading") }] : []),
  ];
  const firstTableHeading = copy.body.find((section) => section.table)?.heading;

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <JsonLd data={guideJsonLd(guide)} />
      <nav aria-label={t("crumbNav")} className="text-sm text-muted">
        <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link to="/" className="hover:text-fg">
              {t("crumbHome")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/guides" className="hover:text-fg">
              {t("navGuides")}
            </Link>
          </li>
        </ol>
      </nav>
      <p className="mt-6 text-xs text-subtle">{t("minutesRead", { n: guide.minutes })}</p>
      <h1 className="mt-2 text-title font-semibold">{copy.h1}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">{copy.excerpt}</p>
      {toc.length > 2 ? (
        <nav
          aria-label={t("tocLabel")}
          className="mt-6 rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]"
        >
          <p className="text-xs font-medium tracking-wider text-subtle uppercase">{t("tocLabel")}</p>
          <ol className="mt-1">
            {toc.map((item, index) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="flex min-h-11 items-center gap-3 text-sm text-fg hover:text-accent"
                >
                  <span className="w-6 shrink-0 tabular-nums text-subtle">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      {copy.body.map((section) => (
        <section key={section.heading} id={headingId(section.heading)} className="mt-8 scroll-mt-24">
          <h2 className="text-lg font-semibold">{section.heading}</h2>
          {section.paragraphs.map((p) => (
            <p key={p} className="mt-3 text-base leading-relaxed text-muted">
              <GuideRichText text={p} />
            </p>
          ))}
          {section.table ? <GuideCompareCards table={section.table} seeDetail={t("seeDetail")} /> : null}
          {section.heading === firstTableHeading && primaryPlan ? (
            <Button asChild className="mt-5 w-full sm:w-auto">
              <a href={primaryPlan.href}>
                {primaryPlan.label}
                <ArrowRight className="size-4" />
              </a>
            </Button>
          ) : null}
        </section>
      ))}
      {copy.faq.length > 0 ? (
        <section id="faq" className="mt-10 scroll-mt-24">
          <h2 className="text-lg font-semibold">{t("faqHeading")}</h2>
          <div className="mt-3 divide-y divide-border rounded-xl bg-card px-4 shadow-[var(--shadow-border)]">
            {copy.faq.map((item) => (
              <details key={item.q} className="group py-3">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium">
                  {item.q}
                  <span className="text-subtle transition-transform duration-150 group-open:rotate-45">+</span>
                </summary>
                <p className="pb-3 text-sm leading-relaxed text-muted">
                  <GuideRichText text={item.a} />
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}
      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">{t("relatedHeading")}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {related.map((item) => {
              const relatedCopy = guideCopy(item, locale);
              return (
                <li key={item.slug}>
                  <Link
                    to="/guides/$slug"
                    params={{ slug: item.slug }}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 text-sm font-medium shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
                  >
                    <span>{relatedCopy.title}</span>
                    <ArrowRight className="size-4 shrink-0 text-accent" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="mt-10 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <p className="font-semibold">{copy.ctaLead ?? t("guideCta")}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          實際覆蓋、安裝期同月費以電訊商確認為準，唔好假設一定有線。
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {primaryPlan ? (
            <Button asChild className="w-full sm:w-auto">
              <a href={primaryPlan.href}>
                {primaryPlan.label}
                <ArrowRight className="size-4" />
              </a>
            </Button>
          ) : null}
          {copy.ctaButton && copy.waText ? (
            <Button asChild variant="whatsapp" className="w-full sm:w-auto">
              <a href={whatsappHref(copy.waText)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon />
                <span className="truncate">{copy.ctaButton}</span>
              </a>
            </Button>
          ) : (
            <QuoteLink className="w-full sm:w-auto" inquiry={guide.inquiry}>
              查核報價
            </QuoteLink>
          )}
        </div>
        {plans.length > 1 ? (
          <p className="mt-4 text-sm text-muted">
            {plans.slice(1).map((item, index) => (
              <span key={item.href}>
                {index > 0 ? " · " : null}
                <a href={item.href} className="text-accent underline-offset-4 hover:underline">
                  {item.label}
                </a>
              </span>
            ))}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {estates.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex h-11 items-center rounded-full bg-surface px-4 text-sm text-fg hover:bg-border"
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
