import { cn } from "@/lib/utils";

/** Decorative LogoMark for the AI filter CTA only. Site header lockup stays static. */
export function LogoMarkLooking({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("logo-mark-looking", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <rect x="6" y="8" width="11" height="16" rx="3.5" className="fill-card" />
      <rect x="15" y="8" width="11" height="16" rx="3.5" className="fill-accent" />
      <g className="logo-mark-looking-eyes">
        <g className="logo-mark-looking-blink">
          <circle cx="11.5" cy="13.5" r="1.7" className="fill-primary" />
          <circle cx="20.5" cy="13.5" r="1.7" className="fill-card" />
        </g>
      </g>
    </svg>
  );
}
