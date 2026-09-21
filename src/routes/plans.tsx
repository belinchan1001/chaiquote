import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, startTransition } from "react";
import { PlanCard } from "@/components/plan-card";
import { PageBackButton } from "@/components/page-back";
import { AiFilterEntry } from "@/components/ai-filter-entry";
import { LazyEstateSuggest as EstateSuggest } from "@/components/lazy-estate-suggest";
import { HousingGuessNote, resolvedHousing } from "@/components/housing-guess";
import { Chip, IntakeFields } from "@/components/intake-fields";
import { FilterLink, chipRowClass } from "@/components/filter-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { type Category, type Housing, type PlansSearch } from "@/lib/plans";
import { filterPlans } from "@/lib/plan-filter";
import { addressHitValue, matchKnownEstate } from "@/lib/address-search";
import { isHkbnFlashEstate, isNetvigatorOnlyEstate } from "@/lib/estate-new-intake";
import { compactSearch, parsePlansSearch, planListReplayKey } from "@/lib/search";
import { CATEGORY_SEO, plansCategoryPath, canonicalUrl, shareHead } from "@/lib/canonical";
import { categoryJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { bringPlanListIntoView, isPlanListInView, watchPlanListInView } from "@/lib/plan-list-fade";
import { CATEGORY_OPTIONS } from "@/lib/site";
import {
  currentLabel,
  currentOptions,
  expiryLabel,
  fromPortInSearch,
  isTargetConflict,
  mergePortInSearch,
  serviceTypeLabel,
  targetLabel,
  targetOptions,
} from "@/lib/port-in";
import type { MessageKey } from "@/lib/messages";

const PAGE_SIZE = 12;

const CAT_KEYS: Record<Category, MessageKey> = {
  broadband: "catBroadband",
  mobile: "catMobile",
  home5g: "catHome5gLong",
  business: "catBusiness",
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
  const intake = fromPortInSearch({ ...search, cat });
  const currentOk = currentOptions(cat).some((item) => item.id === intake.current);
  const targetOk = targetOptions(cat).some((item) => item.id === intake.target);
  return compactSearch(
    mergePortInSearch(search, {
      cat,
      estate: search.estate,
      housing: search.housing,
      current: currentOk ? intake.current : "",
      target: targetOk ? intake.target : "all",
      expiry: intake.expiry,
      fibreSpeed: cat === "broadband" ? "any" : "",
      businessSpeed: cat === "business" ? "any" : "",
      mobileNeed: "",
      esports: false,
    }),
  );
}

function PlansPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  useHydrateDesk();
  const saved = useDesk((s) => s.saved);
  const setInquiry = useDesk((s) => s.setInquiry);
  const rows = filterPlans(search, saved);
  const showHousing = search.cat === "broadband" || search.cat === "home5g";
  const intake = fromPortInSearch(search);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [estateDraft, setEstateDraft] = useState(search.estate ?? "");
  const [qDraft, setQDraft] = useState(search.q ?? "");
  const [listEntering, setListEntering] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const replayKey = planListReplayKey(search);
  const prevReplayKey = useRef(replayKey);
  const { t, providerName, categoryLabel, housingLabel, updated, locale } = useI18n();
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
    if (
      !search.estate &&
      !search.housing &&
      !search.exclude &&
      !search.expiry &&
      !search.esports &&
      !search.provider
    )
      return;
    const fromIntake = Boolean(search.exclude || search.expiry || search.esports || search.provider);
    setInquiry({
      estate: search.estate ?? "",
      housing: search.housing ?? "",
      ...(search.exclude ? { currentProvider: currentLabel(search.exclude) } : {}),
      ...(fromIntake
        ? { targetProvider: search.provider ? targetLabel(search.provider) : "" }
        : {}),
      ...(search.expiry ? { expiry: expiryLabel(search.expiry) } : {}),
      ...(search.esports ? { esports: true } : {}),
      ...(fromIntake ? { serviceType: serviceTypeLabel(search.cat) } : {}),
    });
  }, [search.estate, search.housing, search.exclude, search.provider, search.expiry, search.esports, search.cat, setInquiry]);

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
    let failSafe = 0;
    let stopWatch = () => {};
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const show = () => {
      if (cancelled) return;
      window.clearTimeout(failSafe);
      setListEntering(true);
    };
    failSafe = window.setTimeout(show, 900);

    const arm = () => {
      if (cancelled) return;
      const list = listRef.current;
      if (!list) return;
      if (replay) bringPlanListIntoView(list);
      if (reduced) {
        show();
        return;
      }
      if (isPlanListInView(list.getBoundingClientRect(), window.innerHeight)) {
        show();
        return;
      }
      stopWatch = watchPlanListInView(list, show);
    };

    if (replay) {
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(arm);
      });
      return () => {
        cancelled = true;
        window.clearTimeout(failSafe);
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
        stopWatch();
      };
    }

    arm();
    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
      stopWatch();
    };
  }, [replayKey, rows.length]);

  function patch(next: Partial<PlansSearch>) {
    startTransition(() => {
      void navigate({
        resetScroll: false,
        search: (prev) => {
          const merged = { ...prev, ...next, esports: next.esports || undefined };
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

  function applyIntake(next: Partial<ReturnType<typeof fromPortInSearch>> & { housing?: Housing | ""; estate?: string }) {
    const merged = { ...intake, ...next };
    if (merged.current && isTargetConflict(merged.current, merged.target)) merged.target = "all";
    const housingValue = showHousing ? (next.housing !== undefined ? next.housing : search.housing) : undefined;
    startTransition(() => {
      void navigate({
        resetScroll: false,
        search: compactSearch(
          mergePortInSearch(search, {
            cat: search.cat,
            estate: next.estate !== undefined ? next.estate : search.estate,
            housing: housingValue || undefined,
            current: merged.current,
            target: merged.target,
            expiry: merged.expiry,
            fibreSpeed: merged.fibreSpeed,
            businessSpeed: merged.businessSpeed,
            mobileNeed: merged.mobileNeed,
            esports: merged.esports,
          }),
        ),
      });
    });
  }

  const resetSearch = compactSearch({ cat: search.cat, from: search.from });

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
  if (search.esports) {
    active.push({
      key: "esports",
      label: t("shortcutGaming"),
      search: { ...search, esports: undefined, minSpeed: undefined },
    });
  } else if (search.minSpeed) {
    active.push({
      key: "minSpeed",
      label: `${search.minSpeed}M+`,
      search: { ...search, minSpeed: undefined },
    });
  }
  if (search.expiry) {
    active.push({
      key: "expiry",
      label: expiryLabel(search.expiry),
      search: { ...search, expiry: undefined },
    });
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
      label: t("intakeTargetChip", { name: providerName(search.provider) }),
      search: { ...search, provider: undefined },
    });
  }
  if (search.saved) active.push({ key: "saved", label: t("savedOnly"), search: { ...search, saved: undefined } });
  if (search.estate) active.push({ key: "estate", label: search.estate, search: { ...search, estate: undefined } });
  if (search.exclude) {
    active.push({
      key: "exclude",
      label: t("intakeExcludeChip", { name: providerName(search.exclude) }),
      search: { ...search, exclude: undefined },
    });
  }

  const shown = rows.slice(0, visible);
  const showCoverageCheck = Boolean(search.estate && matchKnownEstate(search.estate)?.coverageCheck);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={categoryJsonLd(search.cat)} />
      <PageBackButton />
      <p className="text-xs font-medium tracking-wider text-accent">{t("filterPlans")}</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-title font-semibold">{categoryLabel(search.cat)}</h1>
          <p className="mt-1 text-xs text-subtle">{t("dataUpdated", { date: updated })}</p>
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          {t("foundPlans", { n: rows.length })}
          {showCoverageCheck ? (
            <span className="mt-1 block text-xs text-subtle sm:mt-0 sm:ml-2 sm:inline">{t("coverageCheck")}</span>
          ) : null}
        </p>
      </div>

      {search.from === "ad" && !search.exclude ? (
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm text-muted">
          {locale === "en"
            ? "From an ad — browse these plans first. We only hide your current carrier after you choose it."
            : "由廣告入嚟可以先睇晒呢類計劃。填「而家用緊邊間」之後，先排除你而家嗰台。"}
        </p>
      ) : search.exclude && search.provider ? (
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm text-muted">
          {t("intakeTargetNote", {
            current: providerName(search.exclude),
            target: providerName(search.provider),
          })}
        </p>
      ) : search.exclude ? (
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm text-muted">
          {t("intakeExcludeNote", { name: providerName(search.exclude) })}
        </p>
      ) : null}

      {active.length ? (
        <div className={chipRowClass}>
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

      {search.cat === "business" ? (
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm text-muted">{t("businessDisclaimer")}</p>
      ) : null}

      {search.housing === "village" && search.cat === "broadband" ? (
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm text-muted">
          {t("villageNote")}{" "}
          <Link
            to="/plans"
            search={{ cat: "home5g", housing: "village", from: search.from }}
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

      <AiFilterEntry className="mt-6" />

      <div className="mt-3 space-y-4 rounded-lg border border-border bg-card p-3.5 shadow-[var(--shadow-home)] sm:p-5">
        <div className="space-y-2">
          <label htmlFor="plans-estate" className="text-xs font-medium tracking-wider text-muted">
            {search.cat === "broadband" ? t("estateLabel") : t("intakeAddressOptional")}
          </label>
          <EstateSuggest
            id="plans-estate"
            value={estateDraft}
            onChange={setEstateDraft}
            onSelect={(item) => {
              const housing = showHousing
                ? item.housing ?? resolvedHousing(item.name) ?? search.housing
                : undefined;
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
          <p className="text-xs text-muted">
            {search.cat === "business"
              ? t("intakeAddressOptionalHintBiz")
              : search.cat === "broadband"
                ? t("intakeAddressHint")
                : t("intakeAddressOptionalHint")}
          </p>
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

        <IntakeFields
          cat={search.cat}
          housing={search.housing ?? ""}
          onHousing={(id) => applyIntake({ housing: id })}
          current={intake.current}
          onCurrent={(id) => applyIntake({ current: id })}
          target={intake.target}
          onTarget={(id) => applyIntake({ target: id })}
          expiry={intake.expiry}
          onExpiry={(id) => applyIntake({ expiry: id })}
          fibreSpeed={intake.fibreSpeed}
          onFibreSpeed={(id) => applyIntake({ fibreSpeed: id, esports: false })}
          businessSpeed={intake.businessSpeed}
          onBusinessSpeed={(id) => applyIntake({ businessSpeed: id })}
          mobileNeed={intake.mobileNeed}
          onMobileNeed={(id) => applyIntake({ mobileNeed: id })}
          esports={intake.esports}
          onEsports={(next) => applyIntake({ esports: next, fibreSpeed: next ? "2500" : "any" })}
          extraHousing={
            search.cat === "broadband" ? (
              <Chip selected={!!search.intake} onSelect={() => patch({ intake: search.intake ? undefined : true })}>
                {t("estatesNewIntakeTag")}
              </Chip>
            ) : null
          }
        />

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
              (listEntering
                ? "plan-list plan-list-enter mt-8 grid gap-4 md:grid-cols-2"
                : "plan-list mt-8 grid gap-4 md:grid-cols-2") + (search.esports ? " plan-list-esports" : "")
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
