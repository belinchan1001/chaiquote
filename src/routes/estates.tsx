import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { startTransition, useMemo, useState, type FormEvent } from "react";
import { EstateSuggest } from "@/components/estate-suggest";
import { HousingGuessNote, resolvedHousing } from "@/components/housing-guess";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { addressHitValue } from "@/lib/address-search";
import { useDesk } from "@/lib/desk";
import { compact, ESTATES } from "@/lib/estates";
import { estateHousingLabel, estatePagesByDistrict, ESTATE_PAGES } from "@/lib/estate-pages";
import { isNewIntakeEstate, NEW_INTAKE_NAMES, newIntakeGroups } from "@/lib/estate-new-intake";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { compactSearch, parsePlansSearch } from "@/lib/search";
import { canonicalUrl } from "@/lib/seo";
import type { Housing } from "@/lib/plans";
import { cn } from "@/lib/utils";

const TITLE = "香港屋苑寬頻比較｜齊Quote";
const DESCRIPTION = `按地區瀏覽香港${ESTATES.length}個屋苑寬頻比較，資料庫同首頁搜尋一樣。每個屋苑可睇適用樓類計劃。實際覆蓋同安裝期以電訊商確認為準。`;

const HOUSING_FALLBACK: { id: Housing; label: string }[] = [
  { id: "public", label: "公屋" },
  { id: "hos", label: "居屋" },
  { id: "private", label: "私樓" },
  { id: "village", label: "村屋" },
];

const HOUSING_COUNTS: Record<Housing, number> = {
  public: ESTATES.filter((item) => item.housing === "public").length,
  hos: ESTATES.filter((item) => item.housing === "hos").length,
  private: ESTATES.filter((item) => item.housing === "private").length,
  village: ESTATES.filter((item) => item.housing === "village").length,
};

const DISTRICT_GROUPS = estatePagesByDistrict();
const NEW_INTAKE_GROUPS = newIntakeGroups(ESTATE_PAGES);
const NEW_INTAKE_COUNT = NEW_INTAKE_NAMES.size;

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
  const [newIntakeFilter, setNewIntakeFilter] = useState(false);
  const navigate = useNavigate();
  const setInquiry = useDesk((s) => s.setInquiry);
  const { t, housingLabel } = useI18n();
  usePageTitle(TITLE);
  const url = canonicalUrl("/estates");
  const districtGroups = newIntakeFilter ? NEW_INTAKE_GROUPS : groups;
  const districtValid = districtGroups.some((group) => group.district === districtFilter);
  const activeDistrict = districtValid ? districtFilter : "";

  const visible = useMemo(() => {
    const q = compact(estate);
    const source = newIntakeFilter ? NEW_INTAKE_GROUPS : groups;
    return source
      .filter((group) => !activeDistrict || group.district === activeDistrict)
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
  }, [activeDistrict, estate, groups, housingFilter, newIntakeFilter]);

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

      <div className="mt-6 grid grid-cols-3 gap-2 lg:grid-cols-6">
        <button
          type="button"
          onClick={() => {
            setDistrictFilter("");
            setHousingFilter("");
            setNewIntakeFilter(false);
          }}
          className={cn(
            "rounded-xl bg-card px-3 py-3 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
            !activeDistrict && !housingFilter && !newIntakeFilter && "ring-2 ring-primary",
          )}
        >
          <p className="text-[11px] font-medium tracking-wider text-muted">{t("navEstates")}</p>
          <p className="mt-0.5 font-display text-base font-semibold tabular-nums sm:text-lg">{ESTATES.length}</p>
        </button>
        <button
          type="button"
          onClick={() => {
            setDistrictFilter("");
            setNewIntakeFilter((on) => !on);
          }}
          className={cn(
            "rounded-xl bg-card px-3 py-3 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
            newIntakeFilter && "ring-2 ring-accent",
          )}
        >
          <p className="text-[11px] font-medium tracking-wider text-accent">{t("estatesNewIntakeTag")}</p>
          <p className="mt-0.5 font-display text-base font-semibold tabular-nums sm:text-lg">{NEW_INTAKE_COUNT}</p>
        </button>
        {HOUSING_FALLBACK.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setHousingFilter((current) => (current === item.id ? "" : item.id));
            }}
            className={cn(
              "rounded-xl bg-card px-3 py-3 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
              housingFilter === item.id && "ring-2 ring-primary",
            )}
          >
            <p className="text-[11px] font-medium tracking-wider text-muted">{housingLabel(item.id)}</p>
            <p className="mt-0.5 font-display text-base font-semibold tabular-nums sm:text-lg">{HOUSING_COUNTS[item.id]}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 max-w-xl space-y-2">
        <label htmlFor="estate-dir-district" className="text-xs font-medium tracking-wider text-muted">
          {t("estatesFilterDistrict")}
        </label>
        <Select
          id="estate-dir-district"
          value={activeDistrict}
          onChange={(e) => setDistrictFilter(e.target.value)}
        >
          <option value="">{t("allDistricts")}</option>
          {districtGroups.map((group) => (
            <option key={group.district} value={group.district}>
              {group.district}（{group.pages.length}）
            </option>
          ))}
        </Select>
        {newIntakeFilter ? <p className="text-sm text-muted">{t("estatesNewIntakeLead")}</p> : null}
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

      <p className="mt-5 text-sm text-muted">
        {t("estatesShowing", { n: visibleCount })}
        {newIntakeFilter ? ` · ${t("estatesNewIntake")}` : ""}
        {housingFilter ? ` · ${housingLabel(housingFilter)}` : ""}
        {activeDistrict ? ` · ${activeDistrict}` : ""}
      </p>

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
              <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {group.pages.map((page) => (
                  <li key={page.slug}>
                    <a
                      href={`/estates/${page.slug}`}
                      className="flex h-full min-h-11 flex-col justify-center rounded-xl bg-card px-2.5 py-2 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
                    >
                      <p className="text-sm font-medium leading-snug">{page.estate.name}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {estateHousingLabel(page.estate.housing)}
                        {isNewIntakeEstate(page.estate.name) ? " · 新入伙" : ""}
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
