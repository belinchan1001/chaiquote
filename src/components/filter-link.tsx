import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { compactSearch } from "@/lib/search";
import type { PlansSearch } from "@/lib/plans";
import { cn } from "@/lib/utils";

/** Shared chip shell — h-11, px-3.5, rounded-full, surface/primary tokens. */
const CHIP_SHELL =
  "chip-press inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3.5 text-sm font-medium transition-[background-color,color] duration-75 ease-out";

const CHIP_FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg";

export const chipRowClass = "mt-2 flex flex-wrap gap-2";

export function chipClass(selected: boolean) {
  return cn(
    CHIP_SHELL,
    CHIP_FOCUS,
    selected ? "bg-primary text-primary-foreground" : "bg-surface text-fg hover:bg-border",
  );
}

/** Radio / checkbox chips that paint selected via :checked. */
export function chipInputClass() {
  return cn(
    CHIP_SHELL,
    CHIP_FOCUS,
    "cursor-pointer bg-surface text-fg hover:bg-border",
    "has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:hover:bg-primary",
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
