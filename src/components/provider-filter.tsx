import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ProviderLogo } from "@/components/provider-mark";
import { chipClass } from "@/components/filter-link";
import {
  PROVIDERS,
  filterPlans,
  type PlansSearch,
  type ProviderId,
} from "@/lib/plans";
import { compactSearch } from "@/lib/search";
import { cn } from "@/lib/utils";

type ProviderSearch = Pick<
  PlansSearch,
  "cat" | "housing" | "speed" | "maxFee" | "generation" | "gba" | "portIn" | "q" | "estate"
>;

export function ProviderFilter({
  search,
  value,
  onChange,
  savedIds = [],
}: {
  search: ProviderSearch;
  value?: ProviderId;
  onChange?: (id: ProviderId | undefined) => void;
  savedIds?: string[];
}) {
  const counts = useMemo(() => {
    const map = Object.fromEntries(PROVIDERS.map((p) => [p.id, 0])) as Record<ProviderId, number>;
    for (const plan of filterPlans({ ...search, provider: undefined }, savedIds)) {
      map[plan.providerId] += 1;
    }
    return map;
  }, [search, savedIds]);

  const visible = PROVIDERS.filter((p) => counts[p.id] > 0 || value === p.id);
  if (!visible.length) return null;

  return (
    <fieldset>
      <legend className="text-xs font-medium tracking-wider text-muted">網絡供應商</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        <ProviderChip
          selected={!value}
          search={search}
          provider={undefined}
          onChange={onChange}
          label="唔限"
        />
        {visible.map((p) => {
          const count = counts[p.id];
          const selected = value === p.id;
          const disabled = count === 0 && !selected;
          return (
            <ProviderChip
              key={p.id}
              selected={selected}
              disabled={disabled}
              search={search}
              provider={selected ? undefined : p.id}
              onChange={onChange}
              label={p.name}
              count={count}
              logoId={p.id}
            />
          );
        })}
      </div>
    </fieldset>
  );
}

function ProviderChip({
  selected,
  disabled,
  search,
  provider,
  onChange,
  label,
  count,
  logoId,
}: {
  selected: boolean;
  disabled?: boolean;
  search: ProviderSearch;
  provider: ProviderId | undefined;
  onChange?: (id: ProviderId | undefined) => void;
  label: string;
  count?: number;
  logoId?: ProviderId;
}) {
  const inner = (
    <>
      {logoId ? <ProviderLogo id={logoId} size="sm" /> : null}
      <span>{label}</span>
      {typeof count === "number" ? (
        <span className={cn("tabular-nums text-xs", selected ? "text-primary-foreground/80" : "text-muted")}>
          {count}
        </span>
      ) : null}
    </>
  );

  if (disabled) {
    return (
      <span className={cn(chipClass(false), "cursor-not-allowed gap-2 px-3 opacity-40")}>{inner}</span>
    );
  }

  if (onChange) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onChange(provider)}
        className={cn(chipClass(selected), "gap-2 px-3")}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      to="/plans"
      replace
      preload={false}
      search={compactSearch({ ...search, cat: search.cat, provider })}
      aria-current={selected ? "page" : undefined}
      aria-label={typeof count === "number" ? `${label}，${count} 個計劃` : label}
      className={cn(chipClass(selected), "gap-2 px-3")}
    >
      {inner}
    </Link>
  );
}
