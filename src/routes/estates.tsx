import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { canonicalUrl } from "@/lib/seo";
import { estateHousingLabel, estatePagesByDistrict } from "@/lib/estate-pages";

const TITLE = "香港屋苑寬頻格價｜齊Quote";
const DESCRIPTION =
  "按地區瀏覽香港屋苑寬頻比較。每頁只列出適用該樓類的參考計劃。實際覆蓋同安裝期以電訊商確認為準。";

export const Route = createFileRoute("/estates")({
  component: EstatesIndexPage,
  head: () => {
    const url = canonicalUrl("/estates");
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

function EstatesIndexPage() {
  const groups = estatePagesByDistrict();
  const { t } = useI18n();
  usePageTitle(TITLE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-medium tracking-wider text-accent">{t("filterPlans")}</p>
      <h1 className="mt-2 text-title font-semibold">香港屋苑寬頻格價</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        按地區同樓類睇適用參考計劃。實際覆蓋同安裝期以電訊商確認為準。
      </p>

      <div className="mt-10 space-y-10">
        {groups.map((group) => (
          <section key={group.district}>
            <h2 className="text-lg font-semibold">{group.district}</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {group.pages.map((page) => (
                <li key={page.slug}>
                  <Link
                    to="/estates/$slug"
                    params={{ slug: page.slug }}
                    className="flex h-11 items-center justify-between gap-3 rounded-lg bg-card px-3 text-sm shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
                  >
                    <span className="font-medium">{page.estate.name}</span>
                    <span className="text-xs text-muted">{estateHousingLabel(page.estate.housing)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
