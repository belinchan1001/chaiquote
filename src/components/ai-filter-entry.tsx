import { useEffect, useRef } from "react";
import { LogoMarkLooking } from "@/components/logo-mark-looking";
import { Button } from "@/components/ui/button";
import { useDesk } from "@/lib/desk";
import { registerFoilCard } from "@/lib/foil-scroll";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AiFilterEntry({ className }: { className?: string }) {
  const aiOpen = useDesk((s) => s.aiOpen);
  const toggleAi = useDesk((s) => s.toggleAi);
  const { t } = useI18n();
  const shineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = shineRef.current;
    if (!el) return;
    return registerFoilCard(el);
  }, []);

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted", className)}>
      <p>{t("aiEntryLead")}</p>
      <div ref={shineRef} className="plan-card-shine ai-filter-shine inline-flex rounded-md">
        <span className="foil" aria-hidden="true" />
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-expanded={aiOpen}
          aria-label={t("aiEntryCta")}
          className="shadow-none"
          onClick={toggleAi}
        >
          <LogoMarkLooking className="!size-5" />
          {t("aiEntryCta")}
        </Button>
      </div>
    </div>
  );
}
