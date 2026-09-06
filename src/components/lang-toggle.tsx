import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const next = locale === "zh" ? "en" : "zh";
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-full border border-border px-3 text-sm font-medium transition-[background-color,color] duration-150 hover:bg-surface",
        className,
      )}
      aria-label={t("langAria")}
      onClick={() => setLocale(next)}
    >
      <span className={locale === "zh" ? "text-fg" : "text-muted"}>中</span>
      <span className="text-subtle">/</span>
      <span className={locale === "en" ? "text-fg" : "text-muted"}>EN</span>
    </button>
  );
}
