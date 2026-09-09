import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { certifiedStaffNoteKeys, type Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function CertifiedStaffNote({
  plan,
  plans,
  className,
}: {
  plan?: Plan;
  plans?: Plan[];
  className?: string;
}) {
  const { t } = useI18n();
  const keys = certifiedStaffNoteKeys(plans ?? (plan ? [plan] : []));
  if (!keys.length) return null;

  return (
    <div className={cn("space-y-1.5", className)}>
      {keys.map((key) => (
        <p key={key} className="flex items-start gap-1.5 text-xs leading-snug text-fg">
          <span
            className="mt-px inline-flex size-3.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
            aria-hidden
          >
            <Check className="size-2.5" strokeWidth={3} />
          </span>
          {t(key)}
        </p>
      ))}
    </div>
  );
}
