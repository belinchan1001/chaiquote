import { useEffect, useState } from "react";
import { create } from "zustand";
import type { Housing } from "@/lib/plans";

const COMPARE_KEY = "chaiquote-compare";
const SAVED_KEY = "chaiquote-saved";
const QUOTES_KEY = "chaiquote-quotes";
const INQUIRY_KEY = "chaiquote-inquiry";

export type Inquiry = {
  estate: string;
  housing: string;
  district: string;
};

const EMPTY_INQUIRY: Inquiry = { estate: "", housing: "", district: "" };

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: string[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readInquiry(): Inquiry {
  try {
    const raw = localStorage.getItem(INQUIRY_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Inquiry>) : {};
    return {
      estate: typeof parsed.estate === "string" ? parsed.estate : "",
      housing: typeof parsed.housing === "string" ? parsed.housing : "",
      district: typeof parsed.district === "string" ? parsed.district : "",
    };
  } catch {
    return EMPTY_INQUIRY;
  }
}

export type QuoteRequest = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  housing: string;
  district: string;
  estate: string;
  category: string;
  currentProvider: string;
  planIds: string[];
  notes: string;
};

type DeskState = {
  compare: string[];
  saved: string[];
  quotes: QuoteRequest[];
  inquiry: Inquiry;
  hydrated: boolean;
  notice: string | null;
  hydrate: () => void;
  toggleCompare: (id: string) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
  toggleSaved: (id: string) => void;
  setInquiry: (next: Partial<Inquiry>) => void;
  addQuote: (quote: Omit<QuoteRequest, "id" | "createdAt">) => QuoteRequest;
  clearNotice: () => void;
};

export const useDesk = create<DeskState>((set, get) => ({
  compare: [],
  saved: [],
  quotes: [],
  inquiry: EMPTY_INQUIRY,
  hydrated: false,
  notice: null,
  hydrate: () => {
    if (get().hydrated || typeof window === "undefined") return;
    try {
      const quotesRaw = localStorage.getItem(QUOTES_KEY);
      const quotes = quotesRaw ? (JSON.parse(quotesRaw) as QuoteRequest[]) : [];
      set({
        compare: readList(COMPARE_KEY),
        saved: readList(SAVED_KEY),
        quotes: Array.isArray(quotes) ? quotes : [],
        inquiry: readInquiry(),
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
  toggleCompare: (id) => {
    const { compare } = get();
    if (compare.includes(id)) {
      const next = compare.filter((x) => x !== id);
      writeList(COMPARE_KEY, next);
      set({ compare: next, notice: null });
      return;
    }
    if (compare.length >= 3) {
      set({ notice: "最多比較 3 個，除咗其中一個先再加。" });
      return;
    }
    const next = [...compare, id];
    writeList(COMPARE_KEY, next);
    set({ compare: next, notice: null });
  },
  removeCompare: (id) => {
    const next = get().compare.filter((x) => x !== id);
    writeList(COMPARE_KEY, next);
    set({ compare: next });
  },
  clearCompare: () => {
    writeList(COMPARE_KEY, []);
    set({ compare: [] });
  },
  toggleSaved: (id) => {
    const { saved } = get();
    const next = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    writeList(SAVED_KEY, next);
    set({ saved: next });
  },
  setInquiry: (partial) => {
    const next: Inquiry = { ...get().inquiry, ...partial };
    next.estate = next.estate.trim();
    next.housing = next.housing.trim();
    next.district = next.district.trim();
    localStorage.setItem(INQUIRY_KEY, JSON.stringify(next));
    set({ inquiry: next });
  },
  addQuote: (input) => {
    const quote: QuoteRequest = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const next = [quote, ...get().quotes].slice(0, 20);
    localStorage.setItem(QUOTES_KEY, JSON.stringify(next));
    set({ quotes: next });
    return quote;
  },
  clearNotice: () => set({ notice: null }),
}));

export function useHydrateDesk() {
  const hydrate = useDesk((s) => s.hydrate);
  const hydrated = useDesk((s) => s.hydrated);
  const [ready, setReady] = useState(hydrated);
  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);
  return ready || hydrated;
}

export function isHousing(value: string): value is Housing {
  return value === "public" || value === "hos" || value === "private" || value === "village";
}
