import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { estateLabel, searchEstates, type Estate } from "@/lib/estates";
import { cn } from "@/lib/utils";

export function EstateSuggest({
  id,
  value,
  onChange,
  onSelect,
  placeholder = "請輸入屋苑或大廈名稱...",
  name,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (estate: Estate) => void;
  placeholder?: string;
  name?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = searchEstates(value);

  useEffect(() => {
    setActive(0);
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(estate: Estate) {
    onChange(estate.name);
    onSelect?.(estate);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp") && results.length) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showList = open && value.trim().length > 0;

  return (
    <div ref={rootRef} className="relative">
      <Input
        id={id}
        name={name}
        role="combobox"
        autoComplete="off"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {showList ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl bg-card py-1 shadow-[var(--shadow-border-hover)]"
        >
          {results.length ? (
            results.map((estate, i) => (
              <li key={estate.name} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={cn(
                    "flex min-h-11 w-full flex-col items-start justify-center px-3 py-2 text-left text-sm",
                    i === active && "bg-surface",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(estate)}
                >
                  <span className="font-medium">{estate.name}</span>
                  <span className="text-xs text-muted">{estateLabel(estate)}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-3 text-sm text-muted">搵唔到完全相同嘅屋苑，可以直接用你輸入嘅名稱。</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
