import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AiBetaMark({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span className={cn("text-[10px] font-normal leading-none tracking-normal opacity-80", className)}>
      {t("aiBeta")}
    </span>
  );
}
