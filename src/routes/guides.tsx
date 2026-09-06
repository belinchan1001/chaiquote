import { createFileRoute, Link } from "@tanstack/react-router";
import { GUIDES, guideCopy } from "@/lib/guides";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/guides")({
  component: GuidesPage,
  head: () => ({ meta: [{ title: `選購教學 · ${SITE.name}` }] }),
});

function GuidesPage() {
  const { t, locale } = useI18n();
  usePageTitle(`${t("guidesTitle")} · ${SITE.name}`);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-title font-semibold">{t("guidesTitle")}</h1>
      <p className="mt-3 text-muted">{t("guidesLead")}</p>
      <ul className="mt-10 space-y-4">
        {GUIDES.map((guide) => {
          const copy = guideCopy(guide, locale);
          return (
            <li key={guide.slug}>
              <Link
                to="/guides/$slug"
                params={{ slug: guide.slug }}
                className="block rounded-xl bg-card p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
              >
                <p className="text-xs text-subtle">{t("minutesRead", { n: guide.minutes })}</p>
                <h2 className="mt-2 text-lg font-semibold">{copy.title}</h2>
                <p className="mt-2 text-sm text-muted">{copy.excerpt}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
