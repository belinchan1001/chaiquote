import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { getGuide, guideCopy } from "@/lib/guides";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { whatsappHref } from "@/lib/whatsapp";

export const Route = createFileRoute("/guides_/$slug")({
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    return { guide };
  },
  component: GuidePage,
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.guide.title} · ${SITE.name}` : SITE.name }],
  }),
});

function GuideRichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
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
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function GuidePage() {
  const { guide } = Route.useLoaderData();
  const { t, locale } = useI18n();
  const copy = guideCopy(guide, locale);
  usePageTitle(`${copy.title} · ${SITE.name}`);
  const related = (guide.related ?? [])
    .map((slug) => getGuide(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/guides" className="text-sm text-muted hover:text-fg">
        {t("allArticles")}
      </Link>
      <p className="mt-6 text-xs text-subtle">{t("minutesRead", { n: guide.minutes })}</p>
      <h1 className="mt-2 text-title font-semibold">{copy.title}</h1>
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
          <Button asChild className="mt-4">
            <Link to="/plans" search={{ cat: "broadband" }}>
              {t("goCompare")}
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
