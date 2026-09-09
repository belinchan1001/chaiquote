import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { usePageTitle } from "@/lib/i18n";
import { canonicalUrl } from "@/lib/seo";
import { estatePagesByDistrict } from "@/lib/estate-pages";

const TITLE = "香港屋苑寬頻格價｜齊Quote";
const DESCRIPTION =
  "按地區瀏覽香港屋苑頁。月費同計劃詳情見各屋苑頁或格價頁。實際覆蓋同安裝期以電訊商確認為準。";

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
  const [q, setQ] = useState("");
  usePageTitle(TITLE);
  const filtered = useMemo(() => {
    const needle = q.trim();
    if (!needle) return groups;
    return groups
      .map((group) => ({
        district: group.district,
        pages: group.pages.filter(
          (page) =>
            page.estate.name.includes(needle) ||
            page.estate.district.includes(needle) ||
            (page.estate.area ?? "").includes(needle) ||
            page.estate.aliases.some((alias) => alias.toLowerCase().includes(needle.toLowerCase())),
        ),
      }))
      .filter((group) => group.pages.length > 0);
  }, [groups, q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-title font-semibold">香港屋苑寬頻格價</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        按地區瀏覽屋苑名稱。月費同適用計劃喺各屋苑頁同格價頁。
      </p>
      <div className="mt-6 max-w-md">
        <label htmlFor="estate-dir-q" className="text-xs font-medium tracking-wider text-muted">
          找屋苑
        </label>
        <Input
          id="estate-dir-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="輸入名稱或地區"
          className="mt-2"
        />
      </div>

      <div className="mt-10 space-y-10">
        {filtered.map((group) => (
          <section key={group.district}>
            <h2 className="text-lg font-semibold">{group.district}</h2>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {group.pages.map((page) => (
                <Link
                  key={page.slug}
                  to="/estates/$slug"
                  params={{ slug: page.slug }}
                  className="inline-flex h-11 items-center text-accent underline-offset-4 hover:underline"
                >
                  {page.estate.name}
                </Link>
              ))}
            </p>
          </section>
        ))}
        {filtered.length === 0 ? <p className="text-sm text-muted">搵唔到呢個名稱，可改地區或返格價頁繼續睇計劃。</p> : null}
      </div>
    </div>
  );
}
