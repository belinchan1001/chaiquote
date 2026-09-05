import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import type { Plan } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { quoteMessage, whatsappHref } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function QuoteLink({
  plan,
  plans,
  variant = "default",
  size = "default",
  className,
  children,
  showNumber = false,
}: {
  plan?: Plan;
  plans?: Plan[];
  variant?: "default" | "outline" | "ghost" | "accent";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: ReactNode;
  showNumber?: boolean;
}) {
  const selected = plans ?? (plan ? [plan] : []);
  return (
    <Button asChild variant={variant} size={size} className={cn("min-w-0", className)}>
      <a
        href={whatsappHref(quoteMessage(selected))}
        target="_blank"
        rel="noopener noreferrer"
      >
        <WhatsAppIcon />
        <span className="truncate">
          {children ?? (showNumber ? `WhatsApp 專人解答 ${SITE.phoneDisplay}` : "WhatsApp 專人解答")}
        </span>
      </a>
    </Button>
  );
}
