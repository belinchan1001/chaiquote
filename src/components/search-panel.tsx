import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AiFilterEntry } from "@/components/ai-filter-entry";
import { Button } from "@/components/ui/button";
import { EstateSuggest } from "@/components/estate-suggest";
import { HousingGuessNote, resolvedHousing } from "@/components/housing-guess";
import { compactSearch, parsePlansSearch } from "@/lib/search";
import { useDesk } from "@/lib/desk";
import { addressHitValue } from "@/lib/address-search";
import { useI18n } from "@/lib/i18n";
import type { Housing } from "@/lib/plans";
import { cn } from "@/lib/utils";
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
    <label
      className={cn(
        "chip-press inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full bg-surface px-4 text-sm font-medium transition-[background-color,color] duration-75 ease-out has-[:checked]:bg-primary has-[:checked]:text-primary-foreground",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        className="sr-only"
        {...(checked === undefined
          ? { defaultChecked }
          : { checked, onChange: () => onChange?.(value) })}
      />
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
  const moreId = useId();
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
  }

  return (
    <form
      method="get"
      action="/plans"
      className="group/search relative z-10 flex flex-col overflow-visible rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-6"
      onSubmit={onSubmit}
    >
      <div className="order-1">
        <p className="text-sm font-medium">{t("searchTitle")}</p>
        <p className="mt-1 hidden text-xs text-muted sm:block">{t("searchLead")}</p>
      </div>
      <div className="order-2 mt-4 space-y-2 sm:mt-5">
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
        <p className="text-sm text-muted">
          熱門：
          <Link to="/estates/$slug" params={{ slug: "tin-yiu" }} className="text-accent underline-offset-4 hover:underline">
            天耀邨
          </Link>
          <span className="px-1.5 text-subtle">·</span>
          <Link to="/estates/$slug" params={{ slug: "kingswood-villas" }} className="text-accent underline-offset-4 hover:underline">
            嘉湖山莊
          </Link>
          <span className="px-1.5 text-subtle">·</span>
          <Link to="/estates/$slug" params={{ slug: "city-one" }} className="text-accent underline-offset-4 hover:underline">
            沙田第一城
          </Link>
          <span className="px-1.5 text-subtle">·</span>
          <Link to="/estates/$slug" params={{ slug: "taikoo-shing" }} className="text-accent underline-offset-4 hover:underline">
            太古城
          </Link>
          <span className="px-1.5 text-subtle">·</span>
          <Link to="/estates" className="text-accent underline-offset-4 hover:underline">
            全部屋苑
          </Link>
        </p>
        <AiFilterEntry className="pt-1" />
      </div>
      <fieldset className="order-3 mt-4 sm:mt-5">
        <legend className="text-xs font-medium tracking-wider text-muted">{t("wantWhat")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((option) => (
            <RadioChip key={option.id} name="cat" value={option.id} defaultChecked={option.id === "broadband"}>
              {t(option.label)}
            </RadioChip>
          ))}
        </div>
      </fieldset>

      <input id={moreId} type="checkbox" className="peer/more sr-only" tabIndex={-1} aria-hidden />
      <label
        htmlFor={moreId}
        className="order-6 mt-1 flex h-11 cursor-pointer items-center text-sm font-medium text-muted sm:hidden peer-checked/more:[&_.more-plus]:rotate-45"
      >
        {t("moreFilters")}
        <span className="more-plus ml-2 text-subtle transition-transform duration-150">+</span>
      </label>

      <div className="order-7 mt-4 hidden space-y-5 peer-checked/more:block sm:order-4 sm:mt-5 sm:block">
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
              <label className="chip-press inline-flex h-11 cursor-pointer items-center rounded-full bg-surface px-4 text-sm font-medium transition-[background-color,color] duration-75 ease-out has-[:checked]:bg-primary has-[:checked]:text-primary-foreground">
                <input type="checkbox" name="gba" value="1" className="sr-only" />
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

      <div className="order-5 mt-4 flex flex-wrap gap-2 sm:order-5 sm:mt-5">
        {shortcuts.map((item) => (
          <Link
            key={item.label}
            to="/plans"
            search={item.search}
            className="chip-press inline-flex h-11 items-center rounded-full bg-surface px-4 text-sm font-medium transition-[background-color] duration-75 ease-out hover:bg-border"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <Button type="submit" size="lg" className="action-apply order-4 mt-5 w-full sm:order-8 sm:mt-6 sm:w-auto">
        {t("autoFilter")}
      </Button>
    </form>
  );
}
