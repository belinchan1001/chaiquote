import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDesk } from "@/lib/desk";
import { estateHousingLabel, estateSelectTarget } from "@/lib/estate-pages";
import { searchEstates, type Estate } from "@/lib/estates";
import { cn } from "@/lib/utils";

export const ESTATE_SEARCH_DELAY_MS = 180;

const HOUSING_FALLBACK: { id: "public" | "hos" | "private" | "village"; label: string }[] = [
  { id: "public", label: "公屋" },
  { id: "hos", label: "居屋" },
  { id: "private", label: "私樓" },
  { id: "village", label: "村屋" },
];

export function EstateNameSearch({
  id,
  size = "md",
  placeholder,
  value,
  onChange,
  onPickPlans,
}: {
  id: string;
  size?: "md" | "lg";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onPickPlans?: (estate: Estate) => void;
}) {
  const listId = useId();
  const navigate = useNavigate();
  const setInquiry = useDesk((s) => s.setInquiry);
  const rootRef = useRef<HTMLDivElement>(null);
  const [inner, setInner] = useState(value ?? "");
  const query = value ?? inner;

  function setQuery(next: string) {
    if (value === undefined) setInner(next);
    onChange?.(next);
  }

  useEffect(() => {
    if (value !== undefined) setInner(value);
  }, [value]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [hits, setHits] = useState<Estate[]>([]);
  const queried = query.trim().length > 0;
  const showList = open && queried;

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setHits([]);
      return;
    }
    const timer = window.setTimeout(() => {
      setHits(searchEstates(q, 8));
    }, ESTATE_SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setActive(0);
  }, [hits]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function go(estate: Estate) {
    setInquiry({
      estate: estate.name,
      housing: estate.housing,
      district: estate.district,
    });
    setQuery(estate.name);
    setOpen(false);
    const target = estateSelectTarget(estate);
    if (target.kind === "page") {
      void navigate({ to: "/estates/$slug", params: { slug: target.slug } });
      return;
    }
    if (onPickPlans) {
      onPickPlans(estate);
      return;
    }
    void navigate({
      to: "/plans",
      search: { cat: "broadband", housing: target.housing, estate: target.estate },
    });
  }

  function submitTyped() {
    if (hits[0]) {
      go(hits[0]);
      return;
    }
    setOpen(true);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp") && hits.length) {
      setOpen(true);
      return;
    }
    if (e.key === "Enter" && !open) {
      e.preventDefault();
      submitTyped();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(hits.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + hits.length) % Math.max(hits.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hits[active]) go(hits[active]);
      else submitTyped();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submitTyped();
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div ref={rootRef} className="relative">
        <div className="flex gap-2">
          <Input
            id={id}
            role="combobox"
            autoComplete="off"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            value={query}
            placeholder={placeholder ?? "輸入屋苑名稱，例如 天耀邨、太古城"}
            className={cn(size === "lg" && "h-14 rounded-xl px-4 text-base")}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
          <Button type="submit" size={size === "lg" ? "lg" : "default"} className={cn(size === "lg" && "h-14 px-5")}>
            <Search className="size-4" />
            搜尋
          </Button>
        </div>
        {showList ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-xl bg-card py-1 shadow-[var(--shadow-border-hover)]"
          >
            {hits.length ? (
              hits.map((estate, i) => (
                <li key={estate.name} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    className={cn(
                      "flex min-h-11 w-full items-center px-3 py-2 text-left text-sm",
                      i === active && "bg-surface",
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(estate)}
                  >
                    {estate.name} · {estate.district} · {estateHousingLabel(estate.housing)}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-3 text-sm text-muted">
                <p>搵唔到呢個名稱，可揀樓類繼續睇計劃</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  {HOUSING_FALLBACK.map((item) => (
                    <Link
                      key={item.id}
                      to="/plans"
                      search={{ cat: "broadband", housing: item.id }}
                      className="text-sm text-accent underline-offset-4 hover:underline"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </li>
            )}
          </ul>
        ) : null}
      </div>
    </form>
  );
}
