import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { startTransition, useState, type FormEvent } from "react";
import { EstateSuggest } from "@/components/estate-suggest";
import { HousingGuessNote, resolvedHousing } from "@/components/housing-guess";
import { Button } from "@/components/ui/button";
import { addressHitValue } from "@/lib/address-search";
import { useDesk } from "@/lib/desk";
import { estatePagesByDistrict } from "@/lib/estate-pages";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { compactSearch, parsePlansSearch } from "@/lib/search";
import { canonicalUrl } from "@/lib/seo";
import type { Housing } from "@/lib/plans";

const TITLE = "熱門屋苑價格｜齊Quote";
const DESCRIPTION =
  "熱門屋苑價格。可以直接選擇屋苑，找出最適合計劃。月費同計劃詳情見各屋苑頁或格價頁。實際覆蓋同安裝期以電訊商確認為準。";

const HOUSING_FALLBACK: { id: Housing; label: string }[] = [
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
  const [estate, setEstate] = useState("");
  const [housing, setHousing] = useState("");
  const [district, setDistrict] = useState("");
  const navigate = useNavigate();
  const setInquiry = useDesk((s) => s.setInquiry);
  const { t } = useI18n();
  usePageTitle(TITLE);

  function openPlans(next: { estate?: string; housing?: string; district?: string }) {
    const estateValue = (next.estate ?? estate).trim();
    const housingValue = next.housing || housing || resolvedHousing(estateValue) || undefined;
    const districtValue = next.district ?? district;
    setInquiry({
      estate: estateValue,
      housing: housingValue ?? "",
      district: districtValue,
    });
    startTransition(() => {
      void navigate({
        to: "/plans",
        search: compactSearch(
          parsePlansSearch({
            cat: "broadband",
            estate: estateValue || undefined,
            housing: housingValue,
          }),
        ),
      });
    });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    openPlans({});
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-title font-semibold">熱門屋苑價格</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        可以直接選擇屋苑，找出最適合計劃。選完會用同首頁一樣嘅篩選，去格價頁睇啱呢類樓嘅計劃。
      </p>
      <form className="mt-6 max-w-xl space-y-3" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label htmlFor="estate-dir-q" className="text-xs font-medium tracking-wider text-muted">
            {t("estateLabel")}
          </label>
          <EstateSuggest
            id="estate-dir-q"
            value={estate}
            onChange={setEstate}
            name="estate"
            placeholder={t("estatePlaceholder")}
            onSelect={(hit) => {
              const nextHousing = hit.housing ?? resolvedHousing(hit.name) ?? "";
              const nextEstate = addressHitValue(hit);
              if (nextHousing) setHousing(nextHousing);
              if (hit.district) setDistrict(hit.district);
              setEstate(nextEstate);
              openPlans({
                estate: nextEstate,
                housing: nextHousing,
                district: hit.district,
              });
            }}
          />
          <HousingGuessNote query={estate} applied={(housing || undefined) as Housing | undefined} />
        </div>
        <Button type="submit">{t("autoFilter")}</Button>
        <p className="text-sm text-muted">
          或揀樓類：
          {HOUSING_FALLBACK.map((item, i) => (
            <span key={item.id}>
              {i ? <span className="px-1.5 text-subtle">·</span> : " "}
              <Link
                to="/plans"
                search={{ cat: "broadband", housing: item.id }}
                className="text-accent underline-offset-4 hover:underline"
              >
                {item.label}
              </Link>
            </span>
          ))}
        </p>
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
