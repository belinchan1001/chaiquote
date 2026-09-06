import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const [shown, setShown] = useState(locale);

  useEffect(() => {
    setShown(locale);
  }, [locale]);

  function pick(next: "zh" | "en") {
    if (next === shown) return;
    setShown(next);
    setLocale(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label={t("langAria")}
      className={cn(
        "relative grid h-11 w-[5.75rem] grid-cols-2 rounded-full bg-surface p-[3px] shadow-[inset_0_0_0_1px_rgba(12,34,72,0.12),0_1px_2px_rgba(12,34,72,0.08)] transition-transform duration-150 ease-out active:scale-[0.96]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-[3px] left-[3px] h-[calc(100%-6px)] w-[calc(50%-3px)] rounded-full bg-primary shadow-[0_1px_3px_rgba(12,34,72,0.28)] transition-transform duration-200 ease-out",
          shown === "en" ? "translate-x-full" : "translate-x-0",
        )}
      />
      <button
        type="button"
        role="radio"
        aria-checked={shown === "zh"}
        className={cn(
          "relative z-10 flex h-full items-center justify-center rounded-full text-sm font-semibold tracking-wide transition-colors duration-150",
          shown === "zh" ? "text-primary-foreground" : "text-muted",
        )}
        onClick={() => pick("zh")}
      >
        中
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={shown === "en"}
        className={cn(
          "relative z-10 flex h-full items-center justify-center rounded-full text-sm font-semibold tracking-wide transition-colors duration-150",
          shown === "en" ? "text-primary-foreground" : "text-muted",
        )}
        onClick={() => pick("en")}
      >
        EN
      </button>
    </div>
  );
}
