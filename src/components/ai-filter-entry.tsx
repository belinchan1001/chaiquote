import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDesk } from "@/lib/desk";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AiFilterEntry({
  tone = "page",
  className,
}: {
  tone?: "hero" | "page";
  className?: string;
}) {
  const aiOpen = useDesk((s) => s.aiOpen);
  const toggleAi = useDesk((s) => s.toggleAi);
  const { t } = useI18n();
  const hero = tone === "hero";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 text-sm",
        hero ? "text-primary-foreground/85" : "text-muted",
        className,
      )}
    >
      <p>{t("aiEntryLead")}</p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-expanded={aiOpen}
        aria-label={t("aiEntryCta")}
        className={
          hero
            ? "border-primary-foreground/30 bg-card text-fg hover:bg-card/90"
            : undefined
        }
        onClick={toggleAi}
      >
        <Sparkles />
        {t("aiEntryCta")}
      </Button>
    </div>
  );
}
