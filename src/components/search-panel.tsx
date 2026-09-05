import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EstateSuggest } from "@/components/estate-suggest";
import { HousingGuessNote, resolvedHousing } from "@/components/housing-guess";
import {
  BUDGET_OPTIONS,
  CATEGORY_OPTIONS,
  GENERATION_OPTIONS,
  HOUSING_OPTIONS,
  SHORTCUTS,
  SPEED_OPTIONS,
} from "@/lib/site";
import { compactSearch, parsePlansSearch } from "@/lib/search";
import { useDesk } from "@/lib/desk";
import { addressHitValue } from "@/lib/address-search";
import type { Housing } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
        "inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full bg-surface px-4 text-sm font-medium transition-[background-color,color,transform] duration-150 ease-out has-[:checked]:bg-primary has-[:checked]:text-primary-foreground active:scale-[0.96]",
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
      className="group/search overflow-visible rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6"
      onSubmit={onSubmit}
    >
      <p className="text-sm font-medium">輸入你住邊，即刻比較</p>
      <p className="mt-1 text-xs text-muted">輸入地址後，系統會判斷公屋、居屋、私人樓或村屋，再篩選相應計劃。</p>
      <div className="mt-5 space-y-5">
        <div className="space-y-2">
          <label htmlFor="estate-search" className="text-xs font-medium tracking-wider text-muted">
            屋苑、大廈或街道
          </label>
          <EstateSuggest
            id="estate-search"
            value={estate}
            onChange={setEstate}
            name="estate"
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
          <legend className="text-xs font-medium tracking-wider text-muted">你想睇咩</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((option) => (
              <RadioChip key={option.id} name="cat" value={option.id} defaultChecked={option.id === "broadband"}>
                {option.label}
              </RadioChip>
            ))}
          </div>
        </fieldset>

        <fieldset className="group-has-[[name=cat][value=mobile]:checked]/search:hidden">
          <legend className="text-xs font-medium tracking-wider text-muted">你住邊類樓</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <RadioChip name="housing" value="" checked={housing === ""} onChange={setHousing}>
              唔限
            </RadioChip>
            {HOUSING_OPTIONS.map((option) => (
              <RadioChip
                key={option.id}
                name="housing"
                value={option.id}
                checked={housing === option.id}
                onChange={setHousing}
              >
                {option.label}
              </RadioChip>
            ))}
          </div>
        </fieldset>

        <fieldset className="group-has-[[name=cat][value=mobile]:checked]/search:hidden group-has-[[name=cat][value=home5g]:checked]/search:hidden">
          <legend className="text-xs font-medium tracking-wider text-muted">網絡速度</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <RadioChip name="speed" value="" defaultChecked>
              唔限
            </RadioChip>
            {SPEED_OPTIONS.map((option) => (
              <RadioChip key={option.speed} name="speed" value={String(option.speed)}>
                {option.label}
              </RadioChip>
            ))}
          </div>
        </fieldset>

        <fieldset className="hidden group-has-[[name=cat][value=mobile]:checked]/search:block">
          <legend className="text-xs font-medium tracking-wider text-muted">手機網絡</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <RadioChip name="generation" value="" defaultChecked>
              唔限網絡
            </RadioChip>
            {GENERATION_OPTIONS.map((option) => (
              <RadioChip key={option.id} name="generation" value={option.id}>
                {option.label}
              </RadioChip>
            ))}
            <label className="inline-flex h-11 cursor-pointer items-center rounded-full bg-surface px-4 text-sm font-medium has-[:checked]:bg-primary has-[:checked]:text-primary-foreground">
              <input type="checkbox" name="gba" value="1" className="sr-only" />
              大灣區數據
            </label>
          </div>
        </fieldset>

        <details className="group">
          <summary className="flex h-11 cursor-pointer list-none items-center text-sm font-medium text-muted">
            進階篩選（預算）
            <span className="ml-2 text-subtle transition-transform duration-150 group-open:rotate-45">+</span>
          </summary>
          <div className="mt-4 space-y-4">
            <fieldset>
              <legend className="text-xs font-medium tracking-wider text-muted">每月預算（可選）</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map((option) => (
                  <RadioChip
                    key={option.label}
                    name="maxFee"
                    value={option.maxFee ? String(option.maxFee) : ""}
                    defaultChecked={!option.maxFee}
                  >
                    {option.label}
                  </RadioChip>
                ))}
              </div>
            </fieldset>
          </div>
        </details>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {SHORTCUTS.map((item) => (
          <Link
            key={item.label}
            to="/plans"
            search={item.search}
            className="inline-flex h-11 items-center rounded-full bg-surface px-4 text-sm font-medium hover:bg-border"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
        自動篩選計劃
      </Button>
    </form>
  );
}
