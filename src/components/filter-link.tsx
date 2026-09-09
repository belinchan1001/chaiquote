import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { compactSearch } from "@/lib/search";
import type { PlansSearch } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function ChipCheck() {
  return <Check className="filter-chip-check size-3 shrink-0" strokeWidth={3} aria-hidden />;
}

export function chipClass(selected?: boolean, opts?: { provider?: boolean }) {
  return cn(
    "filter-chip relative inline-flex h-11 min-w-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-medium",
    selected === true && "filter-chip-on",
    selected === false && "filter-chip-off",
    opts?.provider && selected && "filter-chip-provider-on",
  );
}

export function FilterLink({
  selected,
  search,
  children,
}: {
  selected: boolean;
  search: PlansSearch;
  children: ReactNode;
}) {
  return (
    <Link
      to="/plans"
      replace
      viewTransition={false}
      preload="intent"
      search={compactSearch(search)}
      aria-current={selected ? "page" : undefined}
      className={chipClass(selected)}
    >
      <ChipCheck />
      {children}
    </Link>
  );
}
