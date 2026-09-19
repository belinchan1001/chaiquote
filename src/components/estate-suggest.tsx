import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { QuoteLink } from "@/components/quote-link";
import {
  ADDRESS_SEARCH_DEBOUNCE_MS,
  addressHitName,
  addressHitSubtitle,
  addressHitValue,
  isImpracticalPlace,
  localAddressHits,
  searchAddresses,
  type AddressHit,
} from "@/lib/address-search";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function highlightName(name: string, query: string): ReactNode {
  const raw = query.trim();
  if (raw.length < 1) return name;
  const lowerName = name.toLowerCase();
  const tokens = [raw, ...raw.split(/[\s,，/／]+/)].filter((token) => token.length >= 1);
  tokens.sort((a, b) => b.length - a.length);
  for (const token of tokens) {
    const hit = lowerName.indexOf(token.toLowerCase());
    if (hit >= 0) {
      return (
        <>
          {name.slice(0, hit)}
          <span className="text-primary">{name.slice(hit, hit + token.length)}</span>
          {name.slice(hit + token.length)}
        </>
      );
    }
  }
  for (let n = Math.min(name.length, raw.length); n >= 2; n--) {
    if (raw.toLowerCase().includes(name.slice(0, n).toLowerCase())) {
      return (
        <>
          <span className="text-primary">{name.slice(0, n)}</span>
          {name.slice(n)}
        </>
      );
    }
  }
  return name;
}

export function EstateSuggest({
  id,
  value,
  onChange,
  onSelect,
  placeholder,
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [remote, setRemote] = useState<AddressHit[]>([]);
  const [remoteFor, setRemoteFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [awaiting, setAwaiting] = useState(false);
  const local = localAddressHits(value);
  const query = value.trim();
  const remoteFresh = remoteFor === query;
  const results = query.length >= 2 && remoteFresh && remote.length ? remote : local;
  const busy = loading || awaiting || (query.length >= 2 && !remoteFresh);
  const { t, locale } = useI18n();

  useEffect(() => {
    setActive(0);
  }, [value]);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setRemote([]);
      setRemoteFor("");
      setLoading(false);
      setAwaiting(false);
      return;
    }
    const ac = new AbortController();
    setAwaiting(true);
    const timer = window.setTimeout(() => {
      setAwaiting(false);
      setLoading(true);
      void searchAddresses(q, ac.signal)
        .then((hits) => {
          setRemote(hits);
          setRemoteFor(q);
          setLoading(false);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setLoading(false);
        });
    }, ADDRESS_SEARCH_DEBOUNCE_MS);
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

  function dismissKeyboard() {
    setOpen(false);
    inputRef.current?.blur();
  }

  function pick(hit: AddressHit) {
    onChange(addressHitValue(hit, locale));
    onSelect?.(hit);
    dismissKeyboard();
  }

  /** Keep the typed name. Do not call onSelect (no flash-deal unlock). */
  function keepTypedName() {
    dismissKeyboard();
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
        ref={inputRef}
        id={id}
        name={name}
        role="combobox"
        autoComplete="off"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        value={value}
        placeholder={placeholder ?? t("estatePlaceholder")}
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
          className="popover-in absolute z-50 mt-1 max-h-[min(16rem,40dvh)] w-full overflow-y-auto rounded-xl bg-card py-1 shadow-[var(--shadow-border-hover)] sm:max-h-80"
        >
          {results.length ? (
            results.map((hit, i) => {
              const subtitle = [addressHitSubtitle(hit, locale) || t("hk"), hit.coverageCheck ? t("coverageCheck") : ""]
                .filter(Boolean)
                .join(" · ");
              return (
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
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium">{highlightName(addressHitName(hit, locale), value)}</span>
                      {hit.newIntake ? (
                        <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-accent/15 px-1.5 text-[10px] font-medium text-accent">
                          {t("estatesNewIntakeTag")}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-xs text-muted">{subtitle}</span>
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-3 py-3 text-sm text-muted">
              {isImpracticalPlace(value) ? (
                t("noisePlaceHint")
              ) : busy ? (
                t("searchingAddr")
              ) : (
                <div className="space-y-3">
                  <p>{t("noExactAddr")}</p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center justify-center rounded-md px-3 text-sm font-medium text-accent outline-none hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={keepTypedName}
                    >
                      {t("searchContinueTyped")}
                    </button>
                    <QuoteLink
                      inquiry={{ estate: value.trim() }}
                      size="sm"
                      className="min-h-11 w-full"
                    />
                  </div>
                </div>
              )}
            </li>
          )}
          {loading && results.length ? (
            <li className="px-3 py-2 text-xs text-subtle">{t("fillingAddr")}</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
