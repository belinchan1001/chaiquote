import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function CertifiedStaffNote({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <p className={cn("flex items-start gap-1.5 text-xs leading-snug text-fg", className)}>
      <span
        className="mt-px inline-flex size-3.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
        aria-hidden
      >
        <Check className="size-2.5" strokeWidth={3} />
      </span>
      {t("hktStaffNote")}
    </p>
  );
}
