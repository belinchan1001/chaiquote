import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toEnglish } from "@/lib/plan-en";
import { MESSAGES, type Locale, type MessageKey } from "@/lib/messages";
import { PROVIDER_MAP, type Category, type Housing, type ProviderId } from "@/lib/plans";
import { SITE } from "@/lib/site";

const STORAGE_KEY = "chaiquote-lang";

const CATEGORY_KEYS: Record<Category, MessageKey> = {
  broadband: "catBroadband",
  mobile: "catMobile",
  home5g: "catHome5gLong",
  business: "catBusiness",
};

const HOUSING_KEYS: Record<Housing, MessageKey> = {
  public: "housingPublic",
  hos: "housingHos",
  private: "housingPrivate",
  village: "housingVillage",
};

const CALL_WINDOW_KEYS: Record<string, MessageKey> = {
  anytime: "windowAnytime",
  weekday: "windowWeekday",
  evening: "windowEvening",
  weekend: "windowWeekend",
};

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  tx: (text: string) => string;
  providerName: (id: ProviderId) => string;
  categoryLabel: (id: Category) => string;
  housingLabel: (id: Housing) => string;
  housingList: (housing: Housing[] | "all") => string;
  callWindowLabel: (id: string) => string;
  updated: string;
};

const I18nContext = createContext<I18nValue | null>(null);

function fill(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

function readStored(): Locale {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "en" || value === "zh") return value;
  } catch {
    /* ignore */
  }
  return "zh";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    setLocaleState(readStored());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "zh-Hant";
  }, [locale]);

  const value = useMemo<I18nValue>(() => {
    function setLocale(next: Locale) {
      setLocaleState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
    }
    function t(key: MessageKey, vars?: Record<string, string | number>) {
      return fill(MESSAGES[locale][key] ?? MESSAGES.zh[key] ?? key, vars);
    }
    function tx(text: string) {
      if (locale === "zh" || !text) return text;
      return toEnglish(text);
    }
    function providerName(id: ProviderId) {
      const provider = PROVIDER_MAP[id];
      return locale === "en" ? provider.nameEn : provider.name;
    }
    function categoryLabel(id: Category) {
      return t(CATEGORY_KEYS[id]);
    }
    function housingLabel(id: Housing) {
      return t(HOUSING_KEYS[id]);
    }
    function housingList(housing: Housing[] | "all") {
      if (housing === "all") return t("any");
      return housing.map(housingLabel).join(locale === "en" ? ", " : "、");
    }
    function callWindowLabel(id: string) {
      return CALL_WINDOW_KEYS[id] ? t(CALL_WINDOW_KEYS[id]) : id;
    }
    return {
      locale,
      setLocale,
      t,
      tx,
      providerName,
      categoryLabel,
      housingLabel,
      housingList,
      callWindowLabel,
      updated: locale === "en" ? "September 2026" : SITE.updated,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
