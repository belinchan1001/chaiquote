import { startTransition, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EstateSuggest } from "@/components/estate-suggest";
import { HousingGuessNote, resolvedHousing } from "@/components/housing-guess";
import { chipClass, ChipCheck } from "@/components/filter-link";
import { compactSearch, parsePlansSearch } from "@/lib/search";
import { useDesk } from "@/lib/desk";
import { addressHitValue } from "@/lib/address-search";
import { useI18n } from "@/lib/i18n";
import type { Housing } from "@/lib/plans";
import type { MessageKey } from "@/lib/messages";

function RadioChip({
  name,
  value,
  defaultChecked,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className={chipClass()}>
      <input
        type="radio"
        name={name}
        value={value}
        className="sr-only"
        {...(checked === undefined
          ? { defaultChecked }
          : { checked, onChange: () => onChange?.(value) })}
      />
      <ChipCheck />
      {children}
    </label>
  );
}

export function SearchPanel() {
  const navigate = useNavigate();
  const setInquiry = useDesk((s) => s.setInquiry);
  const [estate, setEstate] = useState("");
  const [housing, setHousing] = useState("");
  const [district, setDistrict] = useState("");
  const { t } = useI18n();

  const categories: { id: "broadband" | "mobile" | "business" | "home5g"; label: MessageKey }[] = [
    { id: "broadband", label: "catBroadband" },
    { id: "mobile", label: "catMobile" },
    { id: "business", label: "catBusiness" },
    { id: "home5g", label: "catHome5g" },
  ];
  const housingOpts: { id: Housing; label: MessageKey }[] = [
    { id: "public", label: "housingPublic" },
    { id: "hos", label: "housingHos" },
    { id: "private", label: "housingPrivate" },
    { id: "village", label: "housingVillage" },
  ];
  const budgets: { maxFee?: number; n?: number }[] = [
    {},
    { maxFee: 80, n: 80 },
    { maxFee: 120, n: 120 },
    { maxFee: 180, n: 180 },
    { maxFee: 400, n: 400 },
  ];
  const shortcuts = [
    { label: t("shortcutExpiry"), search: { cat: "mobile" as const, portIn: true } },
    { label: t("shortcutCheap"), search: { cat: "broadband" as const, maxFee: 120 } },
    { label: t("shortcutGaming"), search: { cat: "broadband" as const, sort: "speed" as const } },
  ];

  function remember(next: { estate?: string; housing?: string; district?: string }) {
    const estateValue = (next.estate ?? estate).trim();
    const housingValue = next.housing ?? housing;
    const districtValue = next.district ?? district;
    setInquiry({
      estate: estateValue,
      housing: housingValue,
      district: districtValue,
    });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const housingValue = housing || resolvedHousing(estate) || undefined;
    remember({ estate, housing: housingValue ?? "", district });
    startTransition(() => {
      void navigate({
        to: "/plans",
        search: compactSearch(
          parsePlansSearch({
            ...data,
            estate: estate.trim() || undefined,
            housing: housingValue,
          }),
        ),
      });
    });
  }

  return (
    <form
      method="get"
      action="/plans"
      className="group/search relative z-10 overflow-visible rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6"
      onSubmit={onSubmit}
    >
      <p className="text-sm font-medium">{t("searchTitle")}</p>
      <p className="mt-1 text-xs text-muted">{t("searchLead")}</p>
      <div className="mt-5 space-y-5">
        <div className="space-y-2">
          <label htmlFor="estate-search" className="text-xs font-medium tracking-wider text-muted">
            {t("estateLabel")}
          </label>
          <EstateSuggest
            id="estate-search"
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
              remember({
                estate: nextEstate,
                housing: nextHousing,
                district: hit.district,
              });
            }}
          />
          <HousingGuessNote query={estate} applied={(housing || undefined) as Housing | undefined} />
        </div>
        <fieldset>
          <legend className="text-xs font-medium tracking-wider text-muted">{t("wantWhat")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((option) => (
              <RadioChip key={option.id} name="cat" value={option.id} defaultChecked={option.id === "broadband"}>
                {t(option.label)}
              </RadioChip>
            ))}
          </div>
        </fieldset>

        <fieldset className="soft-fold fold-mobile">
          <div className="soft-fold-inner">
            <legend className="text-xs font-medium tracking-wider text-muted">{t("housingType")}</legend>
            <div className="mt-2 flex flex-wrap gap-2 pb-1">
              <RadioChip name="housing" value="" checked={housing === ""} onChange={setHousing}>
                {t("any")}
              </RadioChip>
              {housingOpts.map((option) => (
                <RadioChip
                  key={option.id}
                  name="housing"
                  value={option.id}
                  checked={housing === option.id}
                  onChange={setHousing}
                >
                  {t(option.label)}
                </RadioChip>
              ))}
            </div>
          </div>
        </fieldset>

        <fieldset className="soft-fold fold-fibre">
          <div className="soft-fold-inner">
            <legend className="text-xs font-medium tracking-wider text-muted">{t("netSpeed")}</legend>
            <div className="mt-2 flex flex-wrap gap-2 pb-1">
              <RadioChip name="speed" value="" defaultChecked>
                {t("any")}
              </RadioChip>
              {[200, 500, 1000, 2000, 2500, 5000, 10000].map((speed) => (
                <RadioChip key={speed} name="speed" value={String(speed)}>
                  {speed}M
                </RadioChip>
              ))}
            </div>
          </div>
        </fieldset>

        <fieldset className="soft-fold fold-unless-mobile">
          <div className="soft-fold-inner">
            <legend className="text-xs font-medium tracking-wider text-muted">{t("mobileNet")}</legend>
            <div className="mt-2 flex flex-wrap gap-2 pb-1">
              <RadioChip name="generation" value="" defaultChecked>
                {t("anyNetwork")}
              </RadioChip>
              <RadioChip name="generation" value="4g">
                {t("gen45")}
              </RadioChip>
              <RadioChip name="generation" value="5g">
                {t("gen5")}
              </RadioChip>
              <label className={chipClass()}>
                <input type="checkbox" name="gba" value="1" className="sr-only" />
                <ChipCheck />
                {t("gba")}
              </label>
            </div>
          </div>
        </fieldset>

        <details className="group">
          <summary className="flex h-11 cursor-pointer list-none items-center text-sm font-medium text-muted">
            {t("advancedBudget")}
            <span className="ml-2 text-subtle transition-transform duration-150 group-open:rotate-45">+</span>
          </summary>
          <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-open:grid-rows-[1fr] group-open:opacity-100">
            <div className="min-h-0 overflow-hidden">
              <div className="mt-4 space-y-4 pb-1">
            <fieldset>
              <legend className="text-xs font-medium tracking-wider text-muted">{t("monthlyBudget")}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {budgets.map((option) => (
                  <RadioChip
                    key={option.maxFee ?? "any"}
                    name="maxFee"
                    value={option.maxFee ? String(option.maxFee) : ""}
                    defaultChecked={!option.maxFee}
                  >
                    {option.maxFee ? t("budgetUnder", { n: option.maxFee }) : t("budgetAny")}
                  </RadioChip>
                ))}
              </div>
            </fieldset>
              </div>
            </div>
          </div>
        </details>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {shortcuts.map((item) => (
          <Link
            key={item.label}
            to="/plans"
            search={item.search}
            className={chipClass(false)}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
        {t("autoFilter")}
      </Button>
    </form>
  );
}
