import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PlanCard } from "@/components/plan-card";
import { PageBackButton } from "@/components/page-back";
import { AiFilterEntry } from "@/components/ai-filter-entry";
import { QuoteLink } from "@/components/quote-link";
import { LazyEstateSuggest as EstateSuggest } from "@/components/lazy-estate-suggest";
import { HousingGuessNote, resolvedHousing } from "@/components/housing-guess";
import { Chip, IntakeFields } from "@/components/intake-fields";
import { FilterLink, chipRowClass } from "@/components/filter-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { formatFee, getPlan, type Category, type Housing, type PlansSearch } from "@/lib/plans";
import {
  BUSINESS_SCENARIO_SPEEDS,
  BUSINESS_SUMMARY_IDS,
  categoryEntryPlan,
  FIBRE_SUMMARY_IDS,
  HOME5G_SUMMARY_IDS,
  hubSummaryBullets,
  MOBILE_SUMMARY_IDS,
} from "@/lib/plan-hub";
import { filterPlans } from "@/lib/plan-filter";
import { addressHitValue, matchKnownEstate } from "@/lib/address-search";
import { isHkbnFlashEstate, isNetvigatorOnlyEstate } from "@/lib/estate-new-intake";
import { compactSearch, parsePlansSearch, planListReplayKey, rememberPlansSearch } from "@/lib/search";
import { CATEGORY_SEO, plansCategoryPath, canonicalUrl, shareHead } from "@/lib/canonical";
import { indexableEstateNavLinks } from "@/lib/estate-pages";
import { categoryJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { bringPlanListIntoView, holdPlanListScroll, isPlanListInView, watchPlanListInView } from "@/lib/plan-list-fade";
import { CATEGORY_OPTIONS, SITE, plansBroadbandHero } from "@/lib/site";
import {
  currentLabel,
  currentOptions,
  expiryLabel,
  fromPortInSearch,
  isTargetConflict,
  mergePortInSearch,
  needLabel,
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
  const fibreCatalogueCount = search.cat === "broadband" ? filterPlans({ cat: "broadband" }).length : 0;
  const fibreEntries = FIBRE_SUMMARY_IDS.map((id) => getPlan(id));
  const [fibre58, fibre75, fibre98, fibre218] = fibreEntries;
  const showFibreSummary =
    search.cat === "broadband" && fibre58 && fibre75 && fibre98 && fibre218;
  const home5gEntries = HOME5G_SUMMARY_IDS.map((id) => getPlan(id));
  const [home88, home98, home108] = home5gEntries;
  const showHome5gSummary = search.cat === "home5g" && home88 && home98 && home108;
  const mobileEntries = MOBILE_SUMMARY_IDS.map((id) => getPlan(id));
  const [mobileLow, mobile5g] = mobileEntries;
  const showMobileSummary = search.cat === "mobile" && mobileLow && mobile5g;
  const businessEntries = BUSINESS_SUMMARY_IDS.map((id) => getPlan(id));
  const [biz1000, biz1000b, biz10000] = businessEntries;
  const showBusinessSummary = search.cat === "business" && biz1000 && biz1000b && biz10000;
  const entry = categoryEntryPlan(search.cat, search.housing);
  const showHousing = search.cat === "broadband" || search.cat === "home5g";
  const intake = fromPortInSearch(search);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [estateDraft, setEstateDraft] = useState(search.estate ?? "");
  const [qDraft, setQDraft] = useState(search.q ?? "");
  const [listEntering, setListEntering] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const replayKey = planListReplayKey(search);
  const prevReplayKey = useRef(replayKey);
  const { t, tx, providerName, categoryLabel, housingLabel, updated, locale } = useI18n();
  const broadbandHero = search.cat === "broadband" ? plansBroadbandHero(locale, updated) : null;
  const estateNav =
    search.cat === "broadband" || search.cat === "home5g" ? indexableEstateNavLinks(locale) : [];
  usePageTitle(CATEGORY_SEO[search.cat].title);

  useEffect(() => {
    rememberPlansSearch(search);
  }, [search]);

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
    if (typeof window === "undefined" || window.location.hash !== "#plan-list") return;
    if (!search.estate?.trim() || holdPlanListScroll()) return;
    const list = document.getElementById("plan-list");
    if (!list) return;
    bringPlanListIntoView(list);
  }, [replayKey, rows.length, search.estate]);

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
      if (replay && !holdPlanListScroll()) bringPlanListIntoView(list);
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
  if (search.need) {
    active.push({
      key: "need",
      label: needLabel("mobile", search.need),
      search: { ...search, need: undefined },
    });
  }
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

  function scenarioSearch(patch: Partial<PlansSearch>): PlansSearch {
    return compactSearch({ ...search, ...patch });
  }

  const scenarioChips: { key: string; label: string; selected: boolean; search: PlansSearch }[] = [];
  if (search.cat === "broadband" || search.cat === "home5g") {
    const housingIds: { id: Housing; label: MessageKey }[] = [
      { id: "public", label: "housingPublic" },
      { id: "private", label: "housingPrivate" },
      { id: "village", label: "housingVillage" },
    ];
    for (const item of housingIds) {
      const selected = search.housing === item.id;
      scenarioChips.push({
        key: item.id,
        label: t(item.label),
        selected,
        search: scenarioSearch({ housing: selected ? undefined : item.id }),
      });
    }
    if (search.cat === "broadband") {
      const selected = Boolean(search.esports);
      scenarioChips.push({
        key: "esports",
        label: t("shortcutGaming"),
        selected,
        search: scenarioSearch(
          selected
            ? { esports: undefined, minSpeed: undefined }
            : { esports: true, minSpeed: 2500, sort: "speed" },
        ),
      });
    } else {
      const selected = search.maxFee === 120;
      scenarioChips.push({
        key: "cheap",
        label: t("shortcutCheap"),
        selected,
        search: scenarioSearch({ maxFee: selected ? undefined : 120 }),
      });
    }
  } else if (search.cat === "mobile") {
    const clearMobile = {
      generation: undefined,
      portIn: undefined,
      gba: undefined,
      need: undefined,
    };
    const fiveOn = search.generation === "5g" && !search.portIn && !search.gba && !search.need;
    const fourOn = search.generation === "4g" && !search.portIn && !search.gba && !search.need;
    const portOn = Boolean(search.portIn) && !search.generation && !search.gba && !search.need;
    const gbaOn = Boolean(search.gba) && !search.generation && !search.portIn && !search.need;
    scenarioChips.push(
      {
        key: "5g",
        label: t("gen5"),
        selected: fiveOn,
        search: scenarioSearch(fiveOn ? clearMobile : { ...clearMobile, generation: "5g" }),
      },
      {
        key: "4g",
        label: t("gen45"),
        selected: fourOn,
        search: scenarioSearch(fourOn ? clearMobile : { ...clearMobile, generation: "4g" }),
      },
      {
        key: "port",
        label: t("shortcutExpiry"),
        selected: portOn,
        search: scenarioSearch(portOn ? clearMobile : { ...clearMobile, portIn: true }),
      },
      {
        key: "gba",
        label: t("gba"),
        selected: gbaOn,
        search: scenarioSearch(gbaOn ? clearMobile : { ...clearMobile, gba: true }),
      },
    );
  } else {
    for (const speed of BUSINESS_SCENARIO_SPEEDS) {
      const selected = search.speed === speed;
      scenarioChips.push({
        key: String(speed),
        label: `${speed}M`,
        selected,
        search: scenarioSearch({ speed: selected ? undefined : speed, minSpeed: undefined }),
      });
    }
  }

  const summaryPlans = (
    search.cat === "broadband"
      ? fibreEntries
      : search.cat === "home5g"
        ? home5gEntries
        : search.cat === "mobile"
          ? mobileEntries
          : businessEntries
  ).flatMap((plan) => (plan ? [plan] : []));

  const hubText =
    showFibreSummary && fibre58 && fibre75 && fibre98 && fibre218
      ? t("broadbandHubSummary", {
          date: updated,
          name: SITE.name,
          n: fibreCatalogueCount,
          fee58: formatFee(fibre58.monthlyFee),
          months58: fibre58.contractMonths,
          fee75: formatFee(fibre75.monthlyFee),
          months75: fibre75.contractMonths,
          fee98: formatFee(fibre98.monthlyFee),
          months98: fibre98.contractMonths,
          fee218: formatFee(fibre218.monthlyFee),
        })
      : showHome5gSummary && home88 && home98 && home108
        ? t("home5gHubSummary", {
            date: updated,
            name: SITE.name,
            n: filterPlans({ cat: "home5g" }).length,
            plan88: tx(home88.name),
            fee88: formatFee(home88.monthlyFee),
            months88: home88.contractMonths,
            plan98: tx(home98.name),
            fee98: formatFee(home98.monthlyFee),
            months98: home98.contractMonths,
            plan108: tx(home108.name),
            fee108: formatFee(home108.monthlyFee),
            months108: home108.contractMonths,
            free108: home108.freeMonths,
          })
        : showMobileSummary && mobileLow && mobile5g
          ? t("mobileHubSummary", {
              date: updated,
              name: SITE.name,
              n: filterPlans({ cat: "mobile" }).length,
              lowName: tx(mobileLow.name),
              lowFee: formatFee(mobileLow.monthlyFee),
              lowMonths: mobileLow.contractMonths,
              fiveName: tx(mobile5g.name),
              fiveFee: formatFee(mobile5g.monthlyFee),
              fiveMonths: mobile5g.contractMonths,
            })
          : showBusinessSummary && biz1000 && biz1000b && biz10000
            ? t("businessHubSummary", {
                date: updated,
                name: SITE.name,
                n: filterPlans({ cat: "business" }).length,
                provider1000: providerName(biz1000.providerId),
                name1000: tx(biz1000.name),
                fee1000: formatFee(biz1000.monthlyFee),
                months1000: biz1000.contractMonths,
                provider1000b: providerName(biz1000b.providerId),
                name1000b: tx(biz1000b.name),
                fee1000b: formatFee(biz1000b.monthlyFee),
                months1000b: biz1000b.contractMonths,
                fee10000: formatFee(biz10000.monthlyFee),
                months10000: biz10000.contractMonths,
              })
            : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={categoryJsonLd(search.cat)} />
      <PageBackButton />
      <p className="text-xs font-medium tracking-wider text-accent">{t("filterPlans")}</p>
      <div className="mt-2">
        <h1 className="text-title font-semibold">{broadbandHero ? broadbandHero.h1 : categoryLabel(search.cat)}</h1>
        {broadbandHero ? (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{broadbandHero.lead}</p>
        ) : null}
        <p className="mt-1 text-sm text-muted">
          {entry ? (
            <>
              <span className="font-medium tabular-nums text-fg">
                {t("fromFee", { fee: formatFee(entry.monthlyFee) })}
              </span>
              {broadbandHero ? null : <span aria-hidden="true"> · </span>}
            </>
          ) : null}
          {broadbandHero ? null : (
            <span className="text-xs text-subtle">{t("dataUpdated", { date: updated })}</span>
          )}
        </p>
      </div>

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
          <legend className="text-xs font-medium tracking-wider text-muted">{t("wantWhat")}</legend>
          <div className={chipRowClass} data-scenario-chips>
            {scenarioChips.map((chip) => (
              <FilterLink key={chip.key} selected={chip.selected} search={chip.search}>
                {chip.label}
              </FilterLink>
            ))}
          </div>
        </fieldset>
        <QuoteLink size="lg" className="h-12 w-full sm:w-auto">
          {t("planQuoteCta")}
        </QuoteLink>
        <AiFilterEntry className="pt-1" />
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

      {search.exclude && search.provider ? (
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

      <p className="mt-8 text-sm text-muted" aria-live="polite">
        {t("foundPlans", { n: rows.length })}
        {showCoverageCheck ? (
          <span className="mt-1 block text-xs text-subtle">{t("coverageCheck")}</span>
        ) : null}
      </p>

      {rows.length === 0 ? (
        <div id="plan-list" className="mt-4 scroll-mt-24 rounded-xl bg-card px-6 py-16 text-center shadow-[var(--shadow-border)]">
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
            id="plan-list"
            ref={listRef}
            className={
              (listEntering
                ? "plan-list plan-list-enter mt-4 scroll-mt-24 grid gap-4 md:grid-cols-2"
                : "plan-list mt-4 scroll-mt-24 grid gap-4 md:grid-cols-2") + (search.esports ? " plan-list-esports" : "")
            }
          >
            {shown.map((plan, index) => (
              <div key={plan.id} className="plan-list-item">
                <PlanCard plan={plan} imagePriority={index < 2} />
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
      {summaryPlans.length || hubText ? (
        <div className="mt-10 rounded-lg border border-border bg-card px-4 shadow-[var(--shadow-home)]">
          {summaryPlans.length ? (
            <details className="group border-b border-border py-2">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-left text-sm font-semibold">
                {t("feeSummaryTitle")}
                <span className="text-muted transition-transform duration-150 group-open:rotate-45">+</span>
              </summary>
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 pb-2 text-sm">
                {summaryPlans.map((plan) => (
                  <li key={plan.id}>
                    <Link
                      to="/plans/$planId"
                      params={{ planId: plan.id }}
                      className="text-accent underline-offset-4 hover:underline"
                    >
                      {tx(plan.name)}
                    </Link>
                  </li>
                ))}
              </ul>
              {search.cat === "broadband" ? (
                <p className="pb-3 text-sm">
                  <Link
                    to="/guides/$slug"
                    params={{ slug: "home-broadband-2026" }}
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    {locale === "en" ? "Six-carrier 1000M reference fees" : "六大電訊 1000M 參考月費表"}
                  </Link>
                </p>
              ) : null}
            </details>
          ) : null}
          {hubText ? (
            <details className="group py-2">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-left text-sm font-semibold">
                {t("hubFactsTitle")}
                <span className="text-muted transition-transform duration-150 group-open:rotate-45">+</span>
              </summary>
              <ul className="mt-2 list-disc space-y-1 pb-3 pl-5 text-sm leading-relaxed text-muted">
                {hubSummaryBullets(hubText).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
      {estateNav.length ? (
        <nav className="mt-12" aria-label={locale === "en" ? "Estate broadband pages" : "屋苑寬頻"}>
          <h2 className="text-lg font-semibold">{locale === "en" ? "Estate pages" : "指定屋苑寬頻"}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            {locale === "en"
              ? "Open an estate to see plans for that housing type, then check coverage. A listed plan is not confirmation the line can be installed."
              : "開屋苑頁睇該樓類嘅參考計劃，再查覆蓋。列出嚟唔等於一定裝到。"}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {estateNav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="inline-flex h-11 items-center rounded-full bg-surface px-3 text-sm">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
