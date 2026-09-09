import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { getGuide, guideCopy } from "@/lib/guides";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { canonicalUrl } from "@/lib/seo";
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
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

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

function GuidePage() {
  const { guide } = Route.useLoaderData();
  const { t, locale } = useI18n();
  const copy = guideCopy(guide, locale);
  usePageTitle(guide.seoTitle);
  const related = (guide.related ?? [])
    .map((slug) => getGuide(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const plans = guide.plans ?? [];
  const estates = guide.estates ?? [
    { href: "/estates", label: "屋苑目錄" },
    { href: "/estates/tin-yiu", label: "天耀邨" },
  ];

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/guides" className="text-sm text-muted hover:text-fg">
        {t("allArticles")}
      </Link>
      <p className="mt-6 text-xs text-subtle">{t("minutesRead", { n: guide.minutes })}</p>
      <h1 className="mt-2 text-title font-semibold">{copy.h1}</h1>
      {copy.body.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-lg font-semibold">{section.heading}</h2>
          {section.paragraphs.map((p) => (
            <p key={p} className="mt-3 text-base leading-relaxed text-muted">
              <GuideRichText text={p} />
            </p>
          ))}
        </section>
      ))}
      {related.length > 0 ? (
        <p className="mt-8 text-sm text-muted">
          {t("relatedGuides")}{" "}
          {related.map((item, index) => {
            const relatedCopy = guideCopy(item, locale);
            return (
              <span key={item.slug}>
                {index > 0 ? " · " : null}
                <Link
                  to="/guides/$slug"
                  params={{ slug: item.slug }}
                  className="text-accent underline"
                >
                  {relatedCopy.title}
                </Link>
              </span>
            );
          })}
        </p>
      ) : null}

      <div className="mt-8 text-sm text-muted">
        <p>
          {plans.map((item, index) => (
            <span key={item.href}>
              {index > 0 ? " · " : null}
              <a href={item.href} className="text-accent underline-offset-4 hover:underline">
                {item.label}
              </a>
            </span>
          ))}
        </p>
        <p className="mt-3">
          {estates.map((item, index) => (
            <span key={item.href}>
              {index > 0 ? " · " : null}
              <a href={item.href} className="text-accent underline-offset-4 hover:underline">
                {item.label}
              </a>
            </span>
          ))}
        </p>
        <p className="mt-3">實際覆蓋、安裝期同月費以電訊商確認為準，唔好假設一定有線。</p>
      </div>

      <div className="mt-12 bg-surface p-5">
        <p className="font-medium">{copy.ctaLead ?? t("guideCta")}</p>
        {copy.ctaButton && copy.waText ? (
          <Button asChild variant="whatsapp" className="mt-4">
            <a href={whatsappHref(copy.waText)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              <span className="truncate">{copy.ctaButton}</span>
            </a>
          </Button>
        ) : (
          <QuoteLink className="mt-4" inquiry={guide.inquiry}>
            查核報價
          </QuoteLink>
        )}
      </div>
    </article>
  );
}
