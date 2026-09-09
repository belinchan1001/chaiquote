import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { useDesk } from "@/lib/desk";
import {
  estateHousingLabel,
  estatePagesByDistrict,
  estateSelectTarget,
} from "@/lib/estate-pages";
import { searchEstates, type Estate } from "@/lib/estates";
import { usePageTitle } from "@/lib/i18n";
import { canonicalUrl } from "@/lib/seo";

const TITLE = "熱門屋苑價格｜齊Quote";
const DESCRIPTION =
  "熱門屋苑價格。可以直接選擇屋苑，找出最適合計劃。月費同計劃詳情見各屋苑頁或格價頁。實際覆蓋同安裝期以電訊商確認為準。";

const HOUSING_FALLBACK: { id: "public" | "hos" | "private" | "village"; label: string }[] = [
  { id: "public", label: "公屋" },
  { id: "hos", label: "居屋" },
  { id: "private", label: "私樓" },
  { id: "village", label: "村屋" },
];

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
  const navigate = useNavigate();
  const setInquiry = useDesk((s) => s.setInquiry);
  usePageTitle(TITLE);
  const hits = useMemo(() => searchEstates(q, 8), [q]);
  const queried = q.trim().length > 0;

  function go(estate: Estate) {
    setInquiry({
      estate: estate.name,
      housing: estate.housing,
      district: estate.district,
    });
    const target = estateSelectTarget(estate);
    if (target.kind === "page") {
      void navigate({ to: "/estates/$slug", params: { slug: target.slug } });
      return;
    }
    void navigate({
      to: "/plans",
      search: { cat: "broadband", housing: target.housing, estate: target.estate },
    });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (hits[0]) go(hits[0]);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-title font-semibold">熱門屋苑價格</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        可以直接選擇屋苑，找出最適合計劃。
      </p>
      <form className="mt-6 max-w-md" onSubmit={onSubmit}>
        <label htmlFor="estate-dir-q" className="text-xs font-medium tracking-wider text-muted">
          找屋苑
        </label>
        <Input
          id="estate-dir-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="輸入屋苑名稱，例如 天耀邨、華富邨"
          className="mt-2"
          autoComplete="off"
        />
        {queried ? (
          <ul className="mt-2 rounded-xl bg-card py-1 shadow-[var(--shadow-border)]">
            {hits.length ? (
              hits.map((estate) => (
                <li key={estate.name}>
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center px-3 py-2 text-left text-sm hover:bg-surface"
                    onClick={() => go(estate)}
                  >
                    {estate.name} · {estate.district} · {estateHousingLabel(estate.housing)}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-3 text-sm text-muted">
                <p>搵唔到呢個名稱，可揀樓類繼續睇計劃</p>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  {HOUSING_FALLBACK.map((item) => (
                    <Link
                      key={item.id}
                      to="/plans"
                      search={{ cat: "broadband", housing: item.id }}
                      className="text-accent underline-offset-4 hover:underline"
                    >
                      {item.label}
                    </Link>
                  ))}
                </p>
              </li>
            )}
          </ul>
        ) : null}
      </form>

      <div className="mt-10 space-y-10">
        {groups.map((group) => (
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
      </div>
    </div>
  );
}
