import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { QuoteLink } from "@/components/quote-link";
import {
  ADDRESS_SEARCH_DEBOUNCE_MS,
  addressHitName,
  addressHitSubtitle,
  addressHitValue,
  blockStepHits,
  blockStepKind,
  catalogueBlockHits,
  isImpracticalPlace,
  localAddressHits,
  lookupParentBlocks,
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

type BlockStep = {
  parent: AddressHit;
  catalogue: AddressHit[];
  gov: AddressHit[];
};

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
  const [blockStep, setBlockStep] = useState<BlockStep | null>(null);
  const [lookupPending, setLookupPending] = useState(false);
  const lookupGen = useRef(0);
  const local = localAddressHits(value);
  const query = value.trim();
  const remoteFresh = remoteFor === query;
  const results = query.length >= 2 && remoteFresh && remote.length ? remote : local;
  const busy = loading || awaiting || (query.length >= 2 && !remoteFresh);
  const { t, locale } = useI18n();
  const stepBlocks = blockStep ? blockStepHits(blockStep.catalogue, blockStep.gov) : [];

  useEffect(() => {
    setActive(0);
  }, [value, blockStep, lookupPending]);

  useEffect(() => {
    if (blockStep || lookupPending) return;
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
  }, [value, blockStep, lookupPending]);

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

  function clearBlockFlow() {
    lookupGen.current += 1;
    setBlockStep(null);
    setLookupPending(false);
  }

  function finalize(hit: AddressHit) {
    onChange(addressHitValue(hit, locale));
    onSelect?.(hit);
    clearBlockFlow();
    dismissKeyboard();
  }

  /** Keep the typed name. Do not call onSelect (no flash-deal unlock). */
  function keepTypedName() {
    clearBlockFlow();
    dismissKeyboard();
  }

  /** Confirm the selected parent only — never rematch the typed query. */
  function skipParentName() {
    if (!blockStep) return;
    finalize(blockStep.parent);
  }

  function showCatalogueStep(hit: AddressHit) {
    const catalogue = catalogueBlockHits(hit);
    if (!catalogue.length) {
      finalize(hit);
      return;
    }
    onChange(addressHitValue(hit, locale));
    inputRef.current?.blur();
    setLookupPending(false);
    setBlockStep({ parent: hit, catalogue, gov: [] });
    setOpen(true);
    const gen = lookupGen.current;
    const ac = new AbortController();
    void lookupParentBlocks(hit, ac.signal)
      .then(({ gov }) => {
        if (gen !== lookupGen.current) return;
        setBlockStep((current) => (current && current.parent.key === hit.key ? { ...current, gov } : current));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      });
  }

  function pick(hit: AddressHit) {
    lookupGen.current += 1;
    const kind = blockStepKind(hit);
    if (kind === "none") {
      finalize(hit);
      return;
    }
    if (kind === "catalogue") {
      showCatalogueStep(hit);
      return;
    }
    onChange(addressHitValue(hit, locale));
    inputRef.current?.blur();
    setLookupPending(true);
    setBlockStep(null);
    setOpen(true);
    const gen = ++lookupGen.current;
    const ac = new AbortController();
    void lookupParentBlocks(hit, ac.signal)
      .then(({ catalogue, gov }) => {
        if (gen !== lookupGen.current) return;
        const next = blockStepHits(catalogue, gov);
        if (!next.length) {
          finalize(hit);
          return;
        }
        setLookupPending(false);
        setBlockStep({ parent: hit, catalogue, gov });
        setOpen(true);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        finalize(hit);
      });
  }

  const listLength = blockStep ? stepBlocks.length + 1 : results.length;

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (lookupPending) {
      if (e.key === "Escape") {
        setLookupPending(false);
        setOpen(false);
      }
      return;
    }
    if (blockStep) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % Math.max(listLength, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i - 1 + listLength) % Math.max(listLength, 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (active >= stepBlocks.length) skipParentName();
        else if (stepBlocks[active]) finalize(stepBlocks[active]);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
      return;
    }
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

  const showList = open && (value.trim().length > 0 || Boolean(blockStep) || lookupPending);

  function hitButton(hit: AddressHit, i: number, queryText: string, refLabel = false) {
    const subtitle = [
      addressHitSubtitle(hit, locale) || t("hk"),
      hit.coverageCheck ? t("coverageCheck") : "",
      refLabel || hit.blockRef ? t("searchBlockRef") : "",
    ]
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
          onClick={() => finalize(hit)}
        >
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium">{highlightName(addressHitName(hit, locale), queryText)}</span>
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
  }

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
          clearBlockFlow();
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
          className={cn(
            "popover-in absolute z-50 mt-1 w-full overflow-y-auto rounded-xl bg-card py-1 shadow-[var(--shadow-border-hover)] sm:max-h-80",
            blockStep ? "max-h-[min(20rem,45dvh)]" : "max-h-[min(16rem,40dvh)]",
          )}
        >
          {lookupPending ? (
            <li className="px-3 py-3 text-sm text-muted">{t("searchingBlocks")}</li>
          ) : blockStep ? (
            <>
              <li className="px-3 py-2 text-xs text-muted">{t("searchPickBlock")}</li>
              {stepBlocks.map((hit, i) => hitButton(hit, i, addressHitName(blockStep.parent, locale), hit.blockRef))}
              <li role="option" aria-selected={active === stepBlocks.length}>
                <button
                  type="button"
                  className={cn(
                    "inline-flex min-h-11 w-full items-center px-3 text-left text-sm font-medium text-accent outline-none hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring",
                    active === stepBlocks.length && "bg-surface",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(stepBlocks.length)}
                  onClick={skipParentName}
                >
                  {t("searchSkipBlock")}
                </button>
              </li>
            </>
          ) : results.length ? (
            <>
              {results.map((hit, i) => {
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
              })}
              {loading ? <li className="px-3 py-2 text-xs text-subtle">{t("fillingAddr")}</li> : null}
            </>
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
                    <QuoteLink inquiry={{ estate: value.trim() }} size="sm" className="min-h-11 w-full" />
                  </div>
                </div>
              )}
            </li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
