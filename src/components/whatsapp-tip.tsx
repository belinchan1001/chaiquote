import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export function WhatsAppTip({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <p className={cn("text-xs leading-relaxed text-muted", className)}>
      {t("whatsappTip", { phone: SITE.phoneDisplay })}
    </p>
  );
}
