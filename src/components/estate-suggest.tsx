import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import {
  addressHitLabel,
  addressHitValue,
  localAddressHits,
  searchAddresses,
  type AddressHit,
} from "@/lib/address-search";
import { cn } from "@/lib/utils";

export function EstateSuggest({
  id,
  value,
  onChange,
  onSelect,
  placeholder = "輸入屋苑、大廈或街道名稱…",
  name,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (hit: AddressHit) => void;
  placeholder?: string;
  name?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [remote, setRemote] = useState<AddressHit[]>([]);
  const [loading, setLoading] = useState(false);
  const local = localAddressHits(value, 6);
  const results = value.trim().length >= 2 && remote.length ? remote : local;

  useEffect(() => {
    setActive(0);
  }, [value]);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setRemote([]);
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      void searchAddresses(q, ac.signal)
        .then((hits) => {
          setRemote(hits);
          setLoading(false);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setLoading(false);
        });
    }, 280);
    return () => {
      window.clearTimeout(timer);
      ac.abort();
    };
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(hit: AddressHit) {
    onChange(addressHitValue(hit));
    onSelect?.(hit);
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
            results.map((hit, i) => (
              <li key={hit.key} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={cn(
                    "flex min-h-11 w-full flex-col items-start justify-center px-3 py-2 text-left text-sm",
                    i === active && "bg-surface",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(hit)}
                >
                  <span className="font-medium">{hit.name}</span>
                  <span className="text-xs text-muted">{addressHitLabel(hit) || "香港"}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-3 text-sm text-muted">
              {loading ? "搜緊全港地址…" : "搵唔到完全相同嘅地址，可以直接用你輸入嘅名稱。"}
            </li>
          )}
          {loading && results.length ? (
            <li className="px-3 py-2 text-xs text-subtle">正在補齊全港街道／大廈…</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
