import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export type LogoVariant = "color" | "reverse" | "ink";

export function LogoMark({
  className,
  variant = "color",
}: {
  className?: string;
  variant?: LogoVariant;
}) {
  const field = variant === "color" ? "fill-primary" : variant === "reverse" ? "fill-card" : "fill-fg";
  const quoteA = variant === "color" ? "fill-card" : variant === "reverse" ? "fill-primary" : "fill-card";
  const quoteB = "fill-accent";
  const dotA = variant === "color" ? "fill-primary" : variant === "reverse" ? "fill-card" : "fill-fg";

  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="9" className={field} />
      <rect x="6" y="8" width="11" height="16" rx="3.5" className={quoteA} />
      <rect x="15" y="8" width="11" height="16" rx="3.5" className={quoteB} />
      <circle cx="11.5" cy="13.5" r="1.7" className={dotA} />
      <circle cx="20.5" cy="13.5" r="1.7" className="fill-card" />
    </svg>
  );
}

export function BrandLockup({
  className,
  variant = "color",
  markVariant,
  markClassName,
}: {
  className?: string;
  variant?: LogoVariant;
  /** Icon only. Footer keeps the header mark and only lightens the wordmark. */
  markVariant?: LogoVariant;
  markClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight",
        variant === "color" && "text-fg",
        variant === "reverse" && "text-primary-foreground",
        variant === "ink" && "text-fg",
        className,
      )}
    >
      <LogoMark variant={markVariant ?? variant} className={markClassName} />
      <span className="flex min-w-0 flex-col leading-none">
        <span>{SITE.name}</span>
        <span
          className={cn(
            "mt-[0.18em] whitespace-nowrap font-sans text-[0.62em] font-medium tracking-wide",
            variant === "reverse" ? "text-primary-foreground/75" : "text-muted",
          )}
        >
          {SITE.searchHint}
        </span>
      </span>
    </span>
  );
}

export function Logo({
  className,
  onPrimary = false,
}: {
  className?: string;
  onPrimary?: boolean;
}) {
  return (
    <Link to="/" className={className} aria-label={`${SITE.name} ${SITE.searchHint}`}>
      <BrandLockup variant={onPrimary ? "reverse" : "color"} markVariant="color" />
    </Link>
  );
}
