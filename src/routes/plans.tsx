import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, startTransition } from "react";
import { PlanCard } from "@/components/plan-card";
import { EstateSuggest } from "@/components/estate-suggest";
import { HousingGuessNote, resolvedHousing } from "@/components/housing-guess";
import { ProviderFilter } from "@/components/provider-filter";
import { FilterLink } from "@/components/filter-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import {
  filterPlans,
  type Category,
  type Generation,
  type Housing,
  type PlansSearch,
  type SpeedMbps,
} from "@/lib/plans";
import { addressHitValue } from "@/lib/address-search";
import { isHkbnFlashEstate, isNetvigatorOnlyEstate } from "@/lib/estate-new-intake";
import { compactSearch, parsePlansSearch, planListReplayKey } from "@/lib/search";
import { CATEGORY_SEO, plansCategoryPath, canonicalUrl, shareHead } from "@/lib/canonical";
import { bringPlanListIntoView, isPlanListInView, watchPlanListInView } from "@/lib/plan-list-fade";
import {
  CATEGORY_OPTIONS,
  GENERATION_OPTIONS,
  HOUSING_OPTIONS,
  SPEED_OPTIONS,
} from "@/lib/site";
import type { MessageKey } from "@/lib/messages";

const PAGE_SIZE = 12;

const CAT_KEYS: Record<Category, MessageKey> = {
  broadband: "catBroadband",
  mobile: "catMobile",
  home5g: "catHome5gLong",
  business: "catBusiness",
};

const HOUSING_KEYS: Record<Housing, MessageKey> = {
  public: "housingPublic",
  hos: "housingHos",
  private: "housingPrivate",
  village: "housingVillage",
};

export const Route = createFileRoute("/plans")({
  validateSearch: (search: Record<string, unknown>) => parsePlansSearch(search),
  component: PlansPage,
  head: ({ match }) => {
    const cat = match.search.cat ?? "broadband";
    return shareHead(CATEGORY_SEO[cat], canonicalUrl(plansCategoryPath(cat)));
  },
});

function catPatch(search: PlansSearch, cat: Category): PlansSearch {
  return {
    ...search,
    cat,
    minSpeed: undefined,
    minData: undefined,
    speed: undefined,
    generation: undefined,
    gba: undefined,
    portIn: undefined,
    housing: cat === "mobile" ? undefined : search.housing,
    intake: cat === "broadband" ? search.intake : undefined,
  };
}

function PlansPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  useHydrateDesk();
  const saved = useDesk((s) => s.saved);
  const setInquiry = useDesk((s) => s.setInquiry);
  const rows = filterPlans(search, saved);
  const showHousing = search.cat !== "mobile";
  const showSpeed = search.cat === "broadband" || search.cat === "business";
  const showMobile = search.cat === "mobile";
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [estateDraft, setEstateDraft] = useState(search.estate ?? "");
  const [qDraft, setQDraft] = useState(search.q ?? "");
  const [listEntering, setListEntering] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const replayKey = planListReplayKey(search);
  const prevReplayKey = useRef(replayKey);
  const { t, providerName, categoryLabel, housingLabel } = useI18n();
  usePageTitle(CATEGORY_SEO[search.cat].title);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [search]);

  useEffect(() => {
    setEstateDraft(search.estate ?? "");
  }, [search.estate]);

  useEffect(() => {
    setQDraft(search.q ?? "");
  }, [search.q]);

  useEffect(() => {
    if (!search.estate && !search.housing) return;
    setInquiry({
      estate: search.estate ?? "",
      housing: search.housing ?? "",
    });
  }, [search.estate, search.housing, setInquiry]);

  useEffect(() => {
    const next = estateDraft.trim();
    if (next === (search.estate ?? "")) return;
    const timer = window.setTimeout(() => {
      patch({ estate: next || undefined });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [estateDraft]);

  useEffect(() => {
    const next = qDraft.trim();
    if (next === (search.q ?? "")) return;
    const timer = window.setTimeout(() => {
      patch({ q: next || undefined });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [qDraft]);

  useEffect(() => {
    const replay = prevReplayKey.current !== replayKey;
    prevReplayKey.current = replayKey;
    if (replay) setListEntering(false);
    if (rows.length === 0) return;

    let cancelled = false;
    let inner = 0;
    let stopWatch = () => {};
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const arm = () => {
      if (cancelled) return;
      const list = listRef.current;
      if (!list) return;
      if (replay) bringPlanListIntoView(list);
      if (reduced) {
        setListEntering(true);
        return;
      }
      if (isPlanListInView(list.getBoundingClientRect(), window.innerHeight)) {
        setListEntering(true);
        return;
      }
      stopWatch = watchPlanListInView(list, () => {
        if (!cancelled) setListEntering(true);
      });
    };

    if (replay) {
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(arm);
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
        stopWatch();
      };
    }

    arm();
    return () => {
      cancelled = true;
      stopWatch();
    };
  }, [replayKey, rows.length]);

  function patch(next: Partial<PlansSearch>) {
    startTransition(() => {
      void navigate({
        resetScroll: false,
        search: (prev) => {
          const merged = { ...prev, ...next };
          if (
            merged.provider &&
            filterPlans({ ...merged, provider: merged.provider }, saved).length === 0
          ) {
            merged.provider = undefined;
          }
          return compactSearch(merged);
        },
      });
    });
    if (next.estate !== undefined || next.housing !== undefined) {
      setInquiry({
        estate: (next.estate ?? search.estate) ?? "",
        housing: (next.housing ?? search.housing) ?? "",
      });
    }
  }

  const resetSearch = compactSearch({ cat: search.cat });

  const active: { key: string; label: string; search: PlansSearch }[] = [];
  if (search.housing) {
    active.push({ key: "housing", label: housingLabel(search.housing), search: { ...search, housing: undefined } });
  }
  if (search.intake) {
    active.push({
      key: "intake",
      label: t("estatesNewIntakeTag"),
      search: { ...search, intake: undefined },
    });
  }
  if (search.speed) {
    active.push({ key: "speed", label: `${search.speed}M`, search: { ...search, speed: undefined } });
  }
  if (search.generation) {
    active.push({
      key: "gen",
      label: search.generation === "5g" ? t("gen5") : t("gen45"),
      search: { ...search, generation: undefined },
    });
  }
  if (search.gba) active.push({ key: "gba", label: t("gba"), search: { ...search, gba: undefined } });
  if (search.portIn) active.push({ key: "port", label: t("portIn"), search: { ...search, portIn: undefined } });
  if (search.maxFee) {
    active.push({ key: "fee", label: t("budgetUnder", { n: search.maxFee }), search: { ...search, maxFee: undefined } });
  }
  if (search.provider) {
    active.push({
      key: "prov",
      label: providerName(search.provider),
      search: { ...search, provider: undefined },
    });
  }
  if (search.saved) active.push({ key: "saved", label: t("savedOnly"), search: { ...search, saved: undefined } });
  if (search.estate) active.push({ key: "estate", label: search.estate, search: { ...search, estate: undefined } });

  const shown = rows.slice(0, visible);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-medium tracking-wider text-accent">{t("filterPlans")}</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-title font-semibold">{categoryLabel(search.cat)}</h1>
        <p className="text-sm text-muted" aria-live="polite">
          {t("foundPlans", { n: rows.length })}
          <span className="mt-1 block text-xs text-subtle sm:mt-0 sm:ml-2 sm:inline">{t("coverageCheck")}</span>
        </p>
      </div>

      {active.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {active.map((chip) => (
            <FilterLink key={chip.key} selected={false} search={chip.search}>
              {chip.label}
              <span className="ml-1 text-subtle">×</span>
            </FilterLink>
          ))}
          <Link
            to="/plans"
            search={resetSearch}
            resetScroll={false}
            className="inline-flex h-11 items-center px-3 text-sm text-muted underline-offset-4 hover:underline"
          >
            {t("clearAll")}
          </Link>
        </div>
      ) : null}

      {search.housing === "village" && search.cat === "broadband" ? (
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm text-muted">
          {t("villageNote")}{" "}
          <Link
            to="/plans"
            search={{ cat: "home5g", housing: "village" }}
            resetScroll={false}
            className="text-accent underline"
          >
            {t("villageNoteLink")}
          </Link>
          {t("villageNoteEnd")}
        </p>
      ) : null}

      {search.intake && search.cat === "broadband" ? (
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm text-muted">{t("plansIntakeNote")}</p>
      ) : null}

      {isNetvigatorOnlyEstate(search.estate) && (search.cat === "broadband" || search.cat === "home5g") ? (
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm text-muted">{t("plansNetvigatorOnlyNote")}</p>
      ) : null}

      {isHkbnFlashEstate(search.estate) && search.cat === "broadband" ? (
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm text-muted">{t("plansFlashNote")}</p>
      ) : null}

      <div className="mt-6 space-y-4 rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
        <div className="space-y-2">
          <label htmlFor="plans-estate" className="text-xs font-medium tracking-wider text-muted">
            {t("estateLabel")}
          </label>
          <EstateSuggest
            id="plans-estate"
            value={estateDraft}
            onChange={setEstateDraft}
            onSelect={(item) => {
              const housing =
                search.cat === "mobile"
                  ? search.housing
                  : item.housing ?? resolvedHousing(item.name) ?? search.housing;
              setInquiry({
                estate: addressHitValue(item),
                housing: housing ?? "",
                district: item.district,
              });
              patch({
                estate: addressHitValue(item),
                housing,
              });
            }}
          />
          {showHousing ? <HousingGuessNote query={estateDraft} applied={search.housing} /> : null}
          {showHousing ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => {
                const next = resolvedHousing(estateDraft, search.housing);
                patch({
                  housing: search.cat === "mobile" ? search.housing : next,
                  estate: estateDraft.trim() || undefined,
                });
              }}
            >
              {t("autoFilter")}
            </Button>
          ) : null}
        </div>
        <fieldset>
          <legend className="text-xs font-medium tracking-wider text-muted">{t("planType")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((option) => (
              <FilterLink
                key={option.id}
                selected={search.cat === option.id}
                search={catPatch(search, option.id as Category)}
              >
                {t(CAT_KEYS[option.id as Category])}
              </FilterLink>
            ))}
          </div>
        </fieldset>

        {showHousing ? (
          <fieldset>
            <legend className="text-xs font-medium tracking-wider text-muted">{t("housingKind")}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterLink selected={!search.housing} search={{ ...search, housing: undefined }}>
                {t("any")}
              </FilterLink>
              {HOUSING_OPTIONS.map((option) => (
                <FilterLink
                  key={option.id}
                  selected={search.housing === option.id}
                  search={{ ...search, housing: option.id as Housing }}
                >
                  {t(HOUSING_KEYS[option.id])}
                </FilterLink>
              ))}
              {search.cat === "broadband" ? (
                <FilterLink
                  selected={!!search.intake}
                  search={{ ...search, intake: search.intake ? undefined : true }}
                >
                  {t("estatesNewIntakeTag")}
                </FilterLink>
              ) : null}
            </div>
          </fieldset>
        ) : null}

        {showSpeed ? (
          <fieldset>
            <legend className="text-xs font-medium tracking-wider text-muted">{t("netSpeed")}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterLink selected={!search.speed} search={{ ...search, speed: undefined }}>
                {t("any")}
              </FilterLink>
              {SPEED_OPTIONS.map((option) => (
                <FilterLink
                  key={option.speed}
                  selected={search.speed === option.speed}
                  search={{ ...search, speed: option.speed as SpeedMbps }}
                >
                  {option.label}
                </FilterLink>
              ))}
            </div>
          </fieldset>
        ) : null}

        {showMobile ? (
          <fieldset>
            <legend className="text-xs font-medium tracking-wider text-muted">{t("mobileNet")}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterLink selected={!search.generation} search={{ ...search, generation: undefined }}>
                {t("anyNetwork")}
              </FilterLink>
              {GENERATION_OPTIONS.map((option) => (
                <FilterLink
                  key={option.id}
                  selected={search.generation === option.id}
                  search={{ ...search, generation: option.id as Generation }}
                >
                  {option.id === "5g" ? t("gen5") : t("gen45")}
                </FilterLink>
              ))}
              <FilterLink selected={!!search.gba} search={{ ...search, gba: search.gba ? undefined : true }}>
                {t("gba")}
              </FilterLink>
              <FilterLink
                selected={!!search.portIn}
                search={{ ...search, portIn: search.portIn ? undefined : true }}
              >
                {t("portIn")}
              </FilterLink>
            </div>
          </fieldset>
        ) : null}

        <ProviderFilter search={search} value={search.provider} savedIds={saved} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-xs text-muted">
            {t("sort")}
            <Select
              className="mt-1"
              value={search.sort ?? "fee"}
              onChange={(e) => patch({ sort: e.target.value as PlansSearch["sort"] })}
            >
              <option value="fee">{t("sortFee")}</option>
              <option value="avg">{t("sortAvg")}</option>
              {search.cat !== "mobile" ? <option value="speed">{t("sortSpeed")}</option> : null}
              {search.cat === "mobile" || search.cat === "home5g" ? (
                <option value="data">{t("sortData")}</option>
              ) : null}
            </Select>
          </label>
          <label className="block text-xs text-muted">
            {t("searchPlan")}
            <Input
              className="mt-1"
              value={qDraft}
              placeholder={t("searchPlanPh")}
              onChange={(e) => setQDraft(e.target.value)}
            />
          </label>
          <div className="flex items-end gap-2">
            <Link
              to="/plans"
              search={compactSearch({ ...search, saved: search.saved ? undefined : true })}
              resetScroll={false}
              className={
                search.saved
                  ? "inline-flex h-11 flex-1 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground"
                  : "inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium"
              }
            >
              {search.saved ? t("savedNow") : t("savedOnly")}
            </Link>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-xl bg-card px-6 py-16 text-center shadow-[var(--shadow-border)]">
          <p className="font-medium">{t("emptyPlans")}</p>
          <p className="mt-2 text-sm text-muted">{t("emptyPlansLead")}</p>
          <Link
            to="/plans"
            search={resetSearch}
            resetScroll={false}
            className="mt-6 inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium"
          >
            {t("resetFilter")}
          </Link>
        </div>
      ) : (
        <>
          <div
            ref={listRef}
            className={
              listEntering
                ? "plan-list plan-list-enter mt-8 grid gap-4 md:grid-cols-2"
                : "plan-list mt-8 grid gap-4 md:grid-cols-2"
            }
          >
            {shown.map((plan) => (
              <div key={plan.id} className="plan-list-item">
                <PlanCard plan={plan} />
              </div>
            ))}
          </div>
          {visible < rows.length ? (
            <div className="mt-6 flex justify-center">
              <Button type="button" variant="outline" onClick={() => setVisible((n) => n + PAGE_SIZE)}>
                {t("loadMoreN", { n: Math.min(PAGE_SIZE, rows.length - visible) })}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
