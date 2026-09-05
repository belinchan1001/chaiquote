import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { compactSearch } from "@/lib/search";
import type { PlansSearch } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function chipClass(selected: boolean) {
  return cn(
    "inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-medium transition-[background-color,color] duration-150",
    selected ? "bg-primary text-primary-foreground" : "bg-surface text-fg hover:bg-border",
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
      search={compactSearch(search)}
      aria-current={selected ? "page" : undefined}
      className={chipClass(selected)}
    >
      {children}
    </Link>
  );
}
