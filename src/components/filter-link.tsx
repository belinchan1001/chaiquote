import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { compactSearch } from "@/lib/search";
import type { PlansSearch } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function chipClass(selected: boolean) {
  return cn(
    "chip-press inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-medium transition-[background-color,color] duration-75 ease-out",
    selected ? "bg-primary text-primary-foreground" : "bg-surface text-fg hover:bg-border",
  );
}

/** Paint the selected chip on click so the URL update is not the first visual. */
export function useChipArm(selected: boolean) {
  const href = useRouterState({ select: (s) => s.location.href });
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    setArmed(false);
  }, [href, selected]);
  return { selected: selected || armed, arm: () => setArmed(true) };
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
  const chip = useChipArm(selected);
  return (
    <Link
      to="/plans"
      replace
      resetScroll={false}
      viewTransition={false}
      preload="intent"
      search={compactSearch(search)}
      aria-current={chip.selected ? "page" : undefined}
      className={chipClass(chip.selected)}
      onClick={chip.arm}
    >
      {children}
    </Link>
  );
}
