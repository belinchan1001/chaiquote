import { createFileRoute, Link } from "@tanstack/react-router";
import { GUIDE_CATEGORY_META } from "@/lib/guide-articles";
import { GUIDES, guideCopy } from "@/lib/guides";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { canonicalUrl } from "@/lib/seo";

const TITLE = "寬頻同手機攻略｜齊Quote";
const DESCRIPTION = "點揀光纖、5G家居、手機同商業寬頻。粵語攻略，連去格價頁同屋苑頁。實際覆蓋以電訊商確認。";

export const Route = createFileRoute("/guides")({
  component: GuidesPage,
  head: () => {
    const url = canonicalUrl("/guides");
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

function GuidesPage() {
  const { locale } = useI18n();
  usePageTitle(TITLE);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-title font-semibold">點揀光纖、5G家居、手機同商業寬頻</h1>
      <p className="mt-3 text-muted">四個分類下面係全部攻略。月費同安裝以電訊商確認為準。</p>
      <div className="mt-10 space-y-10">
        {GUIDE_CATEGORY_META.map((cat) => {
          const items = GUIDES.filter((guide) => guide.category === cat.id);
          return (
            <section key={cat.id}>
              <h2 className="text-lg font-semibold">{locale === "en" ? cat.labelEn : cat.label}</h2>
              <ul className="mt-3 space-y-2">
                {items.map((guide) => {
                  const copy = guideCopy(guide, locale);
                  return (
                    <li key={guide.slug}>
                      <Link
                        to="/guides/$slug"
                        params={{ slug: guide.slug }}
                        className="flex min-h-11 items-center text-accent underline-offset-4 hover:underline"
                      >
                        {copy.h1}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
