import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PlanCard } from "@/components/plan-card";
import { EstateSuggest } from "@/components/estate-suggest";
import { ProviderFilter } from "@/components/provider-filter";
import { FilterLink } from "@/components/filter-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import {
  CATEGORY_LABEL,
  HOUSING_LABEL,
  PROVIDERS,
  filterPlans,
  type Category,
  type Generation,
  type Housing,
  type PlansSearch,
  type SpeedMbps,
} from "@/lib/plans";
import { compactSearch, parsePlansSearch } from "@/lib/search";
import {
  CATEGORY_OPTIONS,
  GENERATION_OPTIONS,
  HOUSING_OPTIONS,
  SPEED_OPTIONS,
  SITE,
} from "@/lib/site";

const PAGE_SIZE = 12;

export const Route = createFileRoute("/plans")({
  validateSearch: (search: Record<string, unknown>) => parsePlansSearch(search),
  component: PlansPage,
  head: () => ({
    meta: [{ title: `格價 · ${SITE.name}` }],
  }),
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
  };
}

function PlansPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  useHydrateDesk();
  const saved = useDesk((s) => s.saved);
  const rows = filterPlans(search, saved);
  const showHousing = search.cat !== "mobile";
  const showSpeed = search.cat === "broadband" || search.cat === "business";
  const showMobile = search.cat === "mobile";
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [search]);

  function patch(next: Partial<PlansSearch>) {
    const merged = { ...search, ...next };
    if (
      merged.provider &&
      filterPlans({ ...merged, provider: merged.provider }, saved).length === 0
    ) {
      merged.provider = undefined;
    }
    void navigate({ search: compactSearch(merged) });
  }

  const resetSearch = compactSearch({ cat: search.cat });

  const active: { key: string; label: string; search: PlansSearch }[] = [];
  if (search.housing) {
    active.push({ key: "housing", label: HOUSING_LABEL[search.housing], search: { ...search, housing: undefined } });
  }
  if (search.speed) {
    active.push({ key: "speed", label: `${search.speed}M`, search: { ...search, speed: undefined } });
  }
  if (search.generation) {
    active.push({
      key: "gen",
      label: search.generation === "5g" ? "5G" : "4G／4.5G",
      search: { ...search, generation: undefined },
    });
  }
  if (search.gba) active.push({ key: "gba", label: "大灣區數據", search: { ...search, gba: undefined } });
  if (search.portIn) active.push({ key: "port", label: "轉台優惠", search: { ...search, portIn: undefined } });
  if (search.maxFee) {
    active.push({ key: "fee", label: `$${search.maxFee} 以下`, search: { ...search, maxFee: undefined } });
  }
  if (search.provider) {
    active.push({
      key: "prov",
      label: PROVIDERS.find((p) => p.id === search.provider)?.name ?? "",
      search: { ...search, provider: undefined },
    });
  }
  if (search.saved) active.push({ key: "saved", label: "淨係睇收藏", search: { ...search, saved: undefined } });
  if (search.estate) active.push({ key: "estate", label: search.estate, search: { ...search, estate: undefined } });

  const shown = rows.slice(0, visible);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-medium tracking-wider text-accent">篩選計劃</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-title font-semibold">{CATEGORY_LABEL[search.cat]}</h1>
        <p className="text-sm text-muted" aria-live="polite">
          搵到 {rows.length} 個計劃
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
            className="inline-flex h-11 items-center px-3 text-sm text-muted underline-offset-4 hover:underline"
          >
            清晒
          </Link>
        </div>
      ) : null}

      {search.housing === "village" && search.cat === "broadband" ? (
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm text-muted">
          村屋光纖現時主要由香港寬頻、HGC 及網上行提供指定計劃；公屋、居屋及私人樓宇計劃一般不適用於村屋地址。香港寬頻村屋計劃豁免安裝費，並可延遲服務生效日（最長 365 日）；HGC 村屋計劃多須預繳 HK$300，馬灣或若干指定村落未必享有額外特別優惠，詳情請向當值銷售員查詢。網上行村屋／唐樓計劃須另行繳付安裝費。實際覆蓋須核對門牌。你可以一併睇{" "}
          <Link to="/plans" search={{ cat: "home5g", housing: "village" }} className="text-accent underline">
            5G 家居寬頻
          </Link>
          。
        </p>
      ) : null}

      <div className="mt-6 space-y-4 rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
        <div className="space-y-2">
          <label htmlFor="plans-estate" className="text-xs font-medium tracking-wider text-muted">
            屋苑或大廈
          </label>
          <EstateSuggest
            id="plans-estate"
            value={search.estate ?? ""}
            onChange={(value) => patch({ estate: value || undefined })}
            onSelect={(item) =>
              patch({
                estate: item.name,
                housing: search.cat === "mobile" ? search.housing : item.housing,
              })
            }
          />
        </div>
        <fieldset>
          <legend className="text-xs font-medium tracking-wider text-muted">計劃類型</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((option) => (
              <FilterLink
                key={option.id}
                selected={search.cat === option.id}
                search={catPatch(search, option.id as Category)}
              >
                {option.label}
              </FilterLink>
            ))}
          </div>
        </fieldset>

        {showHousing ? (
          <fieldset>
            <legend className="text-xs font-medium tracking-wider text-muted">屋苑種類</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterLink selected={!search.housing} search={{ ...search, housing: undefined }}>
                唔限
              </FilterLink>
              {HOUSING_OPTIONS.map((option) => (
                <FilterLink
                  key={option.id}
                  selected={search.housing === option.id}
                  search={{ ...search, housing: option.id as Housing }}
                >
                  {option.label}
                </FilterLink>
              ))}
            </div>
          </fieldset>
        ) : null}

        {showSpeed ? (
          <fieldset>
            <legend className="text-xs font-medium tracking-wider text-muted">網絡速度</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterLink selected={!search.speed} search={{ ...search, speed: undefined }}>
                唔限
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
            <legend className="text-xs font-medium tracking-wider text-muted">手機網絡</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterLink selected={!search.generation} search={{ ...search, generation: undefined }}>
                唔限網絡
              </FilterLink>
              {GENERATION_OPTIONS.map((option) => (
                <FilterLink
                  key={option.id}
                  selected={search.generation === option.id}
                  search={{ ...search, generation: option.id as Generation }}
                >
                  {option.label}
                </FilterLink>
              ))}
              <FilterLink selected={!!search.gba} search={{ ...search, gba: search.gba ? undefined : true }}>
                大灣區數據
              </FilterLink>
              <FilterLink
                selected={!!search.portIn}
                search={{ ...search, portIn: search.portIn ? undefined : true }}
              >
                轉台優惠
              </FilterLink>
            </div>
          </fieldset>
        ) : null}

        <ProviderFilter search={search} value={search.provider} savedIds={saved} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-xs text-muted">
            排法
            <Select
              className="mt-1"
              value={search.sort ?? "fee"}
              onChange={(e) => patch({ sort: e.target.value as PlansSearch["sort"] })}
            >
              <option value="fee">月費由低至高</option>
              <option value="avg">均價由低至高</option>
              {search.cat !== "mobile" ? <option value="speed">速度由高至低</option> : null}
              {search.cat === "mobile" || search.cat === "home5g" ? (
                <option value="data">數據由高至低</option>
              ) : null}
            </Select>
          </label>
          <label className="block text-xs text-muted">
            搜計劃
            <Input
              className="mt-1"
              value={search.q ?? ""}
              placeholder="公司名、計劃名"
              onChange={(e) => patch({ q: e.target.value || undefined })}
            />
          </label>
          <div className="flex items-end gap-2">
            <Link
              to="/plans"
              search={compactSearch({ ...search, saved: search.saved ? undefined : true })}
              className={
                search.saved
                  ? "inline-flex h-11 flex-1 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground"
                  : "inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium"
              }
            >
              {search.saved ? "而家淨睇收藏" : "淨係睇收藏"}
            </Link>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-xl bg-card px-6 py-16 text-center shadow-[var(--shadow-border)]">
          <p className="font-medium">冇啱嘅計劃</p>
          <p className="mt-2 text-sm text-muted">試下放寬屋苑、網速，或者取消大灣區／收藏。</p>
          <Link
            to="/plans"
            search={resetSearch}
            className="mt-6 inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium"
          >
            重新篩
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {shown.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
          {visible < rows.length ? (
            <div className="mt-6 flex justify-center">
              <Button type="button" variant="outline" onClick={() => setVisible((n) => n + PAGE_SIZE)}>
                再睇 {Math.min(PAGE_SIZE, rows.length - visible)} 個
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
