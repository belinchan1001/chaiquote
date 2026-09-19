import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useDesk, type Inquiry } from "@/lib/desk";
import { useI18n } from "@/lib/i18n";
import type { Plan } from "@/lib/plans";
import { portInQuoteFromInquiry, shouldUsePortInQuote } from "@/lib/port-in";
import { quoteMessage, quoteWhatsappDisplay, quoteWhatsappE164, whatsappHref } from "@/lib/whatsapp";
import { trackWaClick } from "@/lib/track-client";
import { cn } from "@/lib/utils";

export function QuoteLink({
  plan,
  plans,
  inquiry,
  variant = "whatsapp",
  size = "default",
  className,
  children,
  showNumber = false,
  pulse,
}: {
  plan?: Plan;
  plans?: Plan[];
  inquiry?: Partial<Inquiry>;
  variant?: "default" | "outline" | "ghost" | "accent" | "whatsapp";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: ReactNode;
  showNumber?: boolean;
  pulse?: "header";
}) {
  const stored = useDesk((s) => s.inquiry);
  const selected = plans ?? (plan ? [plan] : []);
  const { t, locale } = useI18n();
  const label = showNumber
    ? t("waQuoteWithNumber", { phone: quoteWhatsappDisplay(selected) })
    : t("waQuote");
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn("min-w-0", pulse === "header" && "wa-pulse wa-pulse-header", className)}
    >
      <a
        href={whatsappHref(
          shouldUsePortInQuote(inquiry ?? stored)
            ? portInQuoteFromInquiry(inquiry ?? stored, selected[0])
            : quoteMessage(selected, inquiry ?? stored, locale),
          quoteWhatsappE164(selected),
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        onClick={() =>
          trackWaClick({
            planIds: selected.map((item) => item.id),
            waPhone: quoteWhatsappE164(selected),
          })
        }
      >
        <WhatsAppIcon />
        {children ?? <span className="truncate">{label}</span>}
      </a>
    </Button>
  );
}
