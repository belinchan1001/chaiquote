import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getGuide, guideCopy } from "@/lib/guides";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { SITE } from "@/lib/site";

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

function GuidePage() {
  const { guide } = Route.useLoaderData();
  const { t, locale } = useI18n();
  const copy = guideCopy(guide, locale);
  usePageTitle(`${copy.title} · ${SITE.name}`);
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
              {p}
            </p>
          ))}
        </section>
      ))}
      <div className="mt-12 bg-surface p-5">
        <p className="font-medium">{t("guideCta")}</p>
        <Button asChild className="mt-4">
          <Link to="/plans" search={{ cat: "broadband" }}>
            {t("goCompare")}
          </Link>
        </Button>
      </div>
    </article>
  );
}
