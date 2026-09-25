import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Building2, Loader2, Signal, Smartphone, Wifi, X } from "lucide-react";
import { AiFilterEntry } from "@/components/ai-filter-entry";
import { LazyEstateSuggest as EstateSuggest } from "@/components/lazy-estate-suggest";
import { HousingGuessNote, resolvedHousing } from "@/components/housing-guess";
import { IntakeFields } from "@/components/intake-fields";
import { Button } from "@/components/ui/button";
import { addressHitValue, type AddressHit } from "@/lib/address-search";
import { useDesk } from "@/lib/desk";
import { useI18n } from "@/lib/i18n";
import type { Category, Housing } from "@/lib/plans";
import {
  currentLabel,
  expiryLabel,
  isTargetConflict,
  needLabel,
  serviceTypeLabel,
  targetLabel,
  toPortInSearch,
  type BusinessSpeedId,
  type CurrentId,
  type ExpiryId,
  type FibreSpeedId,
  type MobileNeedId,
  type TargetId,
} from "@/lib/port-in";
import { compactSearch } from "@/lib/search";
import type { MessageKey } from "@/lib/messages";

const SERVICES: {
  cat: Category;
  title: MessageKey;
  hint: MessageKey;
  icon: typeof Wifi;
}[] = [
  { cat: "broadband", title: "intakeOpenFibre", hint: "intakeFibreHint", icon: Wifi },
  { cat: "mobile", title: "intakeOpenMobile", hint: "intakeMobileHint", icon: Smartphone },
  { cat: "home5g", title: "intakeOpenHome5g", hint: "intakeHome5gHint", icon: Signal },
  { cat: "business", title: "intakeOpenBusiness", hint: "intakeBusinessHint", icon: Building2 },
];

export function ServiceSearch() {
  const router = useRouter();
  const navigate = useNavigate();
  const setInquiry = useDesk((s) => s.setInquiry);
  const stored = useDesk((s) => s.inquiry);
  const { t, locale } = useI18n();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const [estate, setEstate] = useState(stored.estate);
  const [housing, setHousing] = useState(stored.housing);
  const [district, setDistrict] = useState(stored.district);
  const [block, setBlock] = useState(stored.block ?? "");
  const [openCat, setOpenCat] = useState<Category | null>(null);
  const [current, setCurrent] = useState<CurrentId | "">("");
  const [target, setTarget] = useState<TargetId>("all");
  const [expiry, setExpiry] = useState<ExpiryId>("6m+");
  const [fibreSpeed, setFibreSpeed] = useState<FibreSpeedId | "">("any");
  const [businessSpeed, setBusinessSpeed] = useState<BusinessSpeedId | "">("any");
  const [mobileNeed, setMobileNeed] = useState<MobileNeedId | "">("");
  const [esports, setEsports] = useState(false);
  const [error, setError] = useState<"address" | "current" | "">("");
  const [searching, setSearching] = useState(false);

  const open = openCat !== null;
  const addressOptional = openCat !== "broadband";

  const housingValue = (
    !openCat || openCat === "business" ? "" : housing || resolvedHousing(estate.trim()) || ""
  ) as Housing | "";
  const pendingSearch = openCat
    ? compactSearch(
        toPortInSearch({
          cat: openCat,
          estate: estate.trim() || undefined,
          housing: housingValue || undefined,
          current,
          target,
          fibreSpeed,
          businessSpeed,
          mobileNeed,
          esports,
          expiry,
        }),
      )
    : undefined;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenCat(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function rememberAddress(next: { estate?: string; housing?: string; district?: string; block?: string }) {
    const estateValue = (next.estate ?? estate).trim();
    const housingValue = next.housing ?? housing;
    const districtValue = next.district ?? district;
    const blockValue = next.block ?? block;
    setInquiry({
      estate: estateValue,
      housing: housingValue,
      district: districtValue,
      block: blockValue,
    });
  }

  function onPickEstate(hit: AddressHit) {
    const nextHousing = hit.housing ?? resolvedHousing(hit.name) ?? housing;
    const nextEstate = addressHitValue(hit);
    setEstate(nextEstate);
    if (nextHousing) setHousing(nextHousing);
    if (hit.district) setDistrict(hit.district);
    rememberAddress({
      estate: nextEstate,
      housing: nextHousing,
      district: hit.district,
      block,
    });
    if (error === "address") setError("");
  }

  function openService(cat: Category) {
    setOpenCat(cat);
    setCurrent("");
    setTarget("all");
    setExpiry("6m+");
    setFibreSpeed(cat === "broadband" ? "any" : "");
    setBusinessSpeed(cat === "business" ? "any" : "");
    setMobileNeed("");
    setEsports(false);
    setError("");
    setSearching(false);
    void router.preloadRoute({ to: "/plans", search: { cat } });
  }

  function submit(event: { preventDefault: () => void; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; button?: number }) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (event.button ?? 0) !== 0) return;
    event.preventDefault();
    if (searching || !openCat || !pendingSearch) return;
    if (!current) {
      setError("current");
      document.getElementById("intake-current")?.scrollIntoView({ block: "center" });
      return;
    }
    const fullEstate = estate.trim();
    const search = pendingSearch;
    setSearching(true);
    setInquiry({
      estate: fullEstate,
      housing: housingValue,
      district,
      block,
      currentProvider: currentLabel(current),
      targetProvider: targetLabel(target),
      expiry: expiryLabel(expiry),
      need: needLabel(
        openCat,
        openCat === "mobile" ? mobileNeed : openCat === "business" ? businessSpeed : fibreSpeed,
        esports,
      ),
      serviceType: serviceTypeLabel(openCat),
      esports,
      source: "filter",
    });
    window.setTimeout(() => {
      void navigate({ to: "/plans", search, hash: "plan-list" });
    }, 0);
  }

  return (
    <div className="relative z-10 rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
      <p className="text-sm font-medium">{t("intakePickService")}</p>
      <div className="mt-4 space-y-2">
        <label htmlFor="intake-estate" className="text-xs font-medium tracking-wider text-muted">
          {t("estateLabel")}
        </label>
        <EstateSuggest
          id="intake-estate"
          value={estate}
          onChange={(value) => {
            setEstate(value);
            if (error === "address") setError("");
          }}
          placeholder={t("intakeAddressPh")}
          onSelect={onPickEstate}
        />
        <HousingGuessNote query={estate} applied={(housing || undefined) as Housing | undefined} />
        <p className="text-xs text-muted">{t("intakeAddressHint")}</p>
        <AiFilterEntry className="pt-1" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {SERVICES.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.cat}
              type="button"
              data-service={item.cat}
              onClick={() => openService(item.cat)}
              className="chip-press flex min-h-[5.75rem] flex-col items-start rounded-xl bg-surface px-3.5 py-3 text-left outline-none hover:bg-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <span className="mt-2 text-sm font-semibold">{t(item.title)}</span>
              <span className="mt-0.5 text-xs leading-snug text-muted">{t(item.hint)}</span>
            </button>
          );
        })}
      </div>

      {open && openCat && typeof document !== "undefined"
        ? createPortal(
            <>
              <div className="intake-overlay" onClick={() => setOpenCat(null)} />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="intake-sheet flex flex-col bg-card text-fg"
              >
            <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <p id={titleId} className="text-base font-semibold">
                  {t(SERVICES.find((item) => item.cat === openCat)!.title)}
                </p>
                <p className="mt-0.5 text-xs text-muted">{t(SERVICES.find((item) => item.cat === openCat)!.hint)}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-fg"
                aria-label={t("intakeSheetClose")}
                onClick={() => setOpenCat(null)}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
              <fieldset>
                <legend className="text-xs font-medium tracking-wider text-muted">
                  {addressOptional ? t("intakeAddressOptional") : t("estateLabel")}
                </legend>
                <div className="mt-2 space-y-2">
                  <EstateSuggest
                    id="intake-sheet-estate"
                    value={estate}
                    onChange={(value) => {
                      setEstate(value);
                      if (error === "address") setError("");
                    }}
                    placeholder={t("intakeAddressPh")}
                    onSelect={onPickEstate}
                  />
                  <p className="text-xs text-muted">
                    {openCat === "business"
                      ? t("intakeAddressOptionalHintBiz")
                      : addressOptional
                        ? t("intakeAddressOptionalHint")
                        : t("intakeAddressHint")}
                  </p>
                  {error === "address" ? (
                    <p className="text-sm text-hot">{t("intakeAddressRequired")}</p>
                  ) : null}
                </div>
              </fieldset>

              <IntakeFields
                cat={openCat}
                housing={housing}
                onHousing={setHousing}
                current={current}
                onCurrent={(id) => {
                  setCurrent(id);
                  if (isTargetConflict(id, target)) setTarget("all");
                  if (error === "current") setError("");
                }}
                target={target}
                onTarget={setTarget}
                expiry={expiry}
                onExpiry={setExpiry}
                fibreSpeed={fibreSpeed}
                onFibreSpeed={(id) => {
                  setEsports(false);
                  setFibreSpeed(id);
                }}
                businessSpeed={businessSpeed}
                onBusinessSpeed={setBusinessSpeed}
                mobileNeed={mobileNeed}
                onMobileNeed={setMobileNeed}
                esports={esports}
                onEsports={(next) => {
                  setEsports(next);
                  setFibreSpeed(next ? "2500" : "any");
                }}
                currentError={error === "current" ? t("intakeNeedCurrent") : undefined}
              />
            </div>

            <div className="border-t border-border px-4 py-3">
              {error === "current" ? (
                <p className="mb-2 text-sm text-hot">{t("intakeNeedCurrent")}</p>
              ) : null}
              {pendingSearch ? (
                <Button
                  asChild
                  size="lg"
                  className={searching ? "action-apply pointer-events-none w-full" : "action-apply w-full"}
                >
                  <Link
                    to="/plans"
                    search={pendingSearch}
                    hash="plan-list"
                    aria-busy={searching}
                    onClick={submit}
                  >
                    {searching ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                    {searching ? (locale === "en" ? "Searching" : "搜尋中") : t("intakeCta")}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
