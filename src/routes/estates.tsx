import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { startTransition, useMemo, useState, type FormEvent } from "react";
import { EstateSuggest } from "@/components/estate-suggest";
import { HousingGuessNote, resolvedHousing } from "@/components/housing-guess";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { addressHitValue } from "@/lib/address-search";
import { useDesk } from "@/lib/desk";
import { compact, ESTATES } from "@/lib/estates";
import { estateHousingLabel, estatePagesByDistrict } from "@/lib/estate-pages";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { compactSearch, parsePlansSearch } from "@/lib/search";
import { canonicalUrl } from "@/lib/seo";
import type { Housing } from "@/lib/plans";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/messages";

const TITLE = "香港屋苑寬頻比較｜齊Quote";
const DESCRIPTION = `按地區瀏覽香港${ESTATES.length}個屋苑寬頻比較，資料庫同首頁搜尋一樣。每個屋苑可睇適用樓類計劃。實際覆蓋同安裝期以電訊商確認為準。`;

const HOUSING_FALLBACK: { id: Housing; label: string }[] = [
  { id: "public", label: "公屋" },
  { id: "hos", label: "居屋" },
  { id: "private", label: "私樓" },
  { id: "village", label: "村屋" },
];

const HOUSING_FILTERS: { id: Housing | ""; label: MessageKey }[] = [
  { id: "", label: "any" },
  { id: "public", label: "housingPublic" },
  { id: "hos", label: "housingHos" },
  { id: "private", label: "housingPrivate" },
  { id: "village", label: "housingVillage" },
];

const HOUSING_COUNTS: Record<Housing, number> = {
  public: ESTATES.filter((item) => item.housing === "public").length,
  hos: ESTATES.filter((item) => item.housing === "hos").length,
  private: ESTATES.filter((item) => item.housing === "private").length,
  village: ESTATES.filter((item) => item.housing === "village").length,
};

const DISTRICT_GROUPS = estatePagesByDistrict();

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
  const groups = DISTRICT_GROUPS;
  const [estate, setEstate] = useState("");
  const [housing, setHousing] = useState("");
  const [district, setDistrict] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [housingFilter, setHousingFilter] = useState<Housing | "">("");
  const navigate = useNavigate();
  const setInquiry = useDesk((s) => s.setInquiry);
  const { t } = useI18n();
  usePageTitle(TITLE);
  const url = canonicalUrl("/estates");

  const visible = useMemo(() => {
    const q = compact(estate);
    return groups
      .filter((group) => !districtFilter || group.district === districtFilter)
      .map((group) => ({
        district: group.district,
        pages: group.pages.filter((page) => {
          if (housingFilter && page.estate.housing !== housingFilter) return false;
          if (q.length < 1) return true;
          if (compact(page.estate.name).includes(q)) return true;
          return page.estate.aliases.some((alias) => compact(alias).includes(q));
        }),
      }))
      .filter((group) => group.pages.length > 0);
  }, [districtFilter, estate, groups, housingFilter]);

  const visibleCount = visible.reduce((sum, group) => sum + group.pages.length, 0);

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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: DESCRIPTION,
          url,
          inLanguage: "zh-HK",
          numberOfItems: ESTATES.length,
        }}
      />
      <nav aria-label={t("crumbNav")} className="text-sm text-muted">
        <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link to="/" className="hover:text-fg">
              {t("crumbHome")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{t("navEstates")}</li>
        </ol>
      </nav>
      <h1 className="mt-6 text-title font-semibold">香港屋苑寬頻比較</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{t("estatesDirLead")}</p>
      <p className="mt-2 text-sm font-medium">{t("estatesIndexCount", { n: ESTATES.length })}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <button
          type="button"
          onClick={() => {
            setDistrictFilter("");
            setHousingFilter("");
          }}
          className={cn(
            "rounded-xl bg-card p-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
            !districtFilter && !housingFilter && "ring-2 ring-primary",
          )}
        >
          <p className="text-xs font-medium tracking-wider text-muted">{t("navEstates")}</p>
          <p className="mt-1 font-display text-lg font-semibold tabular-nums">{ESTATES.length}</p>
        </button>
        {HOUSING_FALLBACK.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setHousingFilter(item.id)}
            className={cn(
              "rounded-xl bg-card p-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
              housingFilter === item.id && "ring-2 ring-primary",
            )}
          >
            <p className="text-xs font-medium tracking-wider text-muted">{item.label}</p>
            <p className="mt-1 font-display text-lg font-semibold tabular-nums">{HOUSING_COUNTS[item.id]}</p>
          </button>
        ))}
      </div>

      <form className="mt-6 max-w-xl space-y-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5" onSubmit={onSubmit}>
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

      <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setDistrictFilter("")}
          className={cn(
            "inline-flex h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
            districtFilter === "" ? "bg-primary text-primary-foreground" : "bg-surface",
          )}
        >
          {t("allDistricts")}
        </button>
        {groups.map((group) => (
          <button
            key={group.district}
            type="button"
            onClick={() => setDistrictFilter(group.district)}
            className={cn(
              "inline-flex h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
              districtFilter === group.district ? "bg-primary text-primary-foreground" : "bg-surface",
            )}
          >
            {group.district}
            <span className="ml-1.5 tabular-nums text-xs opacity-70">{group.pages.length}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {HOUSING_FILTERS.map((item) => (
          <button
            key={item.id || "any"}
            type="button"
            onClick={() => setHousingFilter(item.id)}
            className={cn(
              "inline-flex h-11 items-center rounded-full px-4 text-sm font-medium",
              housingFilter === item.id ? "bg-primary text-primary-foreground" : "bg-surface",
            )}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted">{t("estatesShowing", { n: visibleCount })}</p>

      <div className="mt-6 space-y-10">
        {visible.length === 0 ? (
          <p className="rounded-xl bg-card p-5 text-sm text-muted shadow-[var(--shadow-border)]">
            {t("estatesEmptyFilter")}
          </p>
        ) : (
          visible.map((group) => (
            <section key={group.district} id={`district-${group.district}`}>
              <h2 className="text-lg font-semibold">
                {group.district}
                <span className="ml-2 text-sm font-normal tabular-nums text-muted">{group.pages.length}</span>
              </h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.pages.map((page) => (
                  <li key={page.slug}>
                    <a
                      href={`/estates/${page.slug}`}
                      className="flex h-full min-h-11 flex-col rounded-xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
                    >
                      <p className="font-semibold">{page.estate.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {estateHousingLabel(page.estate.housing)}
                        {page.estate.area ? ` · ${page.estate.area}` : ""}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
