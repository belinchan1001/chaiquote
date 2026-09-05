import { PROVIDER_MAP, type ProviderId } from "@/lib/plans";
import { cn } from "@/lib/utils";

function LogoSvg({
  id,
  className,
}: {
  id: ProviderId;
  className?: string;
}) {
  const common = "size-full";
  switch (id) {
    case "hkbn":
      return (
        <svg viewBox="0 0 32 32" className={cn(common, className)} aria-hidden>
          <rect width="32" height="32" rx="8" className="fill-provider-hkbn" />
          <path
            d="M8 18.5 16 8.5 24 18.5H19.5L16 14l-3.5 4.5H8Z"
            className="fill-card"
          />
          <rect x="11" y="20" width="10" height="3.2" rx="1" className="fill-card" />
        </svg>
      );
    case "netvigator":
      return (
        <svg viewBox="0 0 32 32" className={cn(common, className)} aria-hidden>
          <rect width="32" height="32" rx="8" className="fill-provider-netvigator" />
          <circle cx="16" cy="16" r="3" className="fill-card" />
          <path
            d="M16 9.2a6.8 6.8 0 0 1 6.8 6.8M16 6a10 10 0 0 1 10 10"
            fill="none"
            stroke="currentColor"
            className="text-card"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M16 22.8A6.8 6.8 0 0 1 9.2 16M16 26A10 10 0 0 1 6 16"
            fill="none"
            stroke="currentColor"
            className="text-card"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "cmhk":
      return (
        <svg viewBox="0 0 32 32" className={cn(common, className)} aria-hidden>
          <rect width="32" height="32" rx="8" className="fill-provider-cmhk" />
          <rect x="7" y="18" width="3.2" height="7" rx="1" className="fill-card" />
          <rect x="12.3" y="14" width="3.2" height="11" rx="1" className="fill-card" />
          <rect x="17.5" y="10.5" width="3.2" height="14.5" rx="1" className="fill-card" />
          <rect x="22.8" y="7.5" width="3.2" height="17.5" rx="1" className="fill-card" />
        </svg>
      );
    case "hgc":
      return (
        <svg viewBox="0 0 32 32" className={cn(common, className)} aria-hidden>
          <rect width="32" height="32" rx="8" className="fill-provider-hgc" />
          <path
            d="M16 6.5 25 11.2v9.6L16 25.5 7 20.8v-9.6L16 6.5Z"
            fill="none"
            stroke="currentColor"
            className="text-card"
            strokeWidth="2"
          />
          <path
            d="M12.2 12.2v7.6h2.2v-2.7h3.2v2.7h2.2v-7.6h-2.2v2.6h-3.2v-2.6H12.2Z"
            className="fill-card"
          />
        </svg>
      );
    case "smartone":
      return (
        <svg viewBox="0 0 32 32" className={cn(common, className)} aria-hidden>
          <rect width="32" height="32" rx="8" className="fill-provider-smartone" />
          <circle cx="16" cy="16" r="6.2" fill="none" stroke="currentColor" className="text-card" strokeWidth="2.2" />
          <path d="M16 9.2 17.1 13h4.1l-3.3 2.4 1.2 3.8L16 16.9l-3.1 2.3 1.2-3.8-3.3-2.4h4.1L16 9.2Z" className="fill-card" />
        </svg>
      );
    case "three":
      return (
        <svg viewBox="0 0 32 32" className={cn(common, className)} aria-hidden>
          <rect width="32" height="32" rx="8" className="fill-provider-three" />
          <path
            d="M12 9.2h6.2c2.4 0 3.8 1.3 3.8 3.2 0 1.2-.7 2.2-1.9 2.7 1.5.4 2.4 1.6 2.4 3.1 0 2.2-1.6 3.6-4.2 3.6H12v-2.3h5.4c1.1 0 1.8-.5 1.8-1.4s-.7-1.4-1.8-1.4H13.6v-2.1h3.6c1 0 1.6-.5 1.6-1.3s-.6-1.2-1.6-1.2H12V9.2Z"
            className="fill-card"
          />
        </svg>
      );
    case "csl":
      return (
        <svg viewBox="0 0 32 32" className={cn(common, className)} aria-hidden>
          <rect width="32" height="32" rx="8" className="fill-provider-csl" />
          <path
            d="M20.8 11.4c-.7-1.1-2.1-1.8-3.8-1.8-2.9 0-5 2-5 5.4s2.1 5.4 5 5.4c1.7 0 3.1-.7 3.8-1.8l-1.9-1.1c-.4.6-1.1 1-1.9 1-1.4 0-2.4-1.1-2.4-3.5s1-3.5 2.4-3.5c.8 0 1.5.4 1.9 1l1.9-1.1Z"
            className="fill-card"
          />
          <circle cx="22.6" cy="20.8" r="1.5" className="fill-card" />
        </svg>
      );
    case "icable":
      return (
        <svg viewBox="0 0 32 32" className={cn(common, className)} aria-hidden>
          <rect width="32" height="32" rx="8" className="fill-provider-icable" />
          <path
            d="M8 16c4-6 12-6 16 0"
            fill="none"
            stroke="currentColor"
            className="text-card"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M8 20.5c4-6 12-6 16 0"
            fill="none"
            stroke="currentColor"
            className="text-card"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="8" cy="16" r="1.8" className="fill-card" />
          <circle cx="24" cy="20.5" r="1.8" className="fill-card" />
        </svg>
      );
  }
}

export function ProviderLogo({
  id,
  size = "md",
}: {
  id: ProviderId;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-md shadow-[var(--shadow-border)]",
        size === "sm" && "size-6",
        size === "md" && "size-8",
        size === "lg" && "size-11",
      )}
    >
      <LogoSvg id={id} />
    </span>
  );
}

export function ProviderMark({
  id,
  size = "md",
  showEn = true,
}: {
  id: ProviderId;
  size?: "sm" | "md" | "lg";
  showEn?: boolean;
}) {
  const provider = PROVIDER_MAP[id];
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <ProviderLogo id={id} size={size} />
      <span className="min-w-0">
        <span className={cn("block font-medium leading-tight", size === "sm" ? "text-xs" : "text-sm")}>
          {provider.name}
        </span>
        {showEn && size !== "sm" ? (
          <span className="block text-xs leading-tight text-subtle">{provider.nameEn}</span>
        ) : null}
      </span>
    </span>
  );
}
