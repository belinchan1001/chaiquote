import { PROVIDER_MAP, type ProviderId } from "@/lib/plan-meta";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LOGO: Record<ProviderId, { src: string; webp: string; fill?: boolean }> = {
  hkbn: { src: "/images/providers/hkbn.png", webp: "/images/providers/hkbn.webp" },
  netvigator: { src: "/images/providers/netvigator.png", webp: "/images/providers/netvigator.webp" },
  cmhk: { src: "/images/providers/cmhk.png", webp: "/images/providers/cmhk.webp" },
  hgc: { src: "/images/providers/hgc.png", webp: "/images/providers/hgc.webp", fill: true },
  smartone: { src: "/images/providers/smartone.png", webp: "/images/providers/smartone.webp", fill: true },
  three: { src: "/images/providers/three.png", webp: "/images/providers/three.webp" },
  csl: { src: "/images/providers/csl.png", webp: "/images/providers/csl.webp", fill: true },
  icable: { src: "/images/providers/icable.png", webp: "/images/providers/icable.webp" },
};

export function ProviderLogo({
  id,
  size = "md",
}: {
  id: ProviderId;
  size?: "sm" | "md" | "lg";
}) {
  const logo = LOGO[id];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-card shadow-[var(--shadow-border)]",
        size === "sm" && "size-7",
        size === "md" && "size-10",
        size === "lg" && "size-12",
        !logo.fill && size === "sm" && "p-0.5",
        !logo.fill && size !== "sm" && "p-1",
      )}
    >
      <picture>
        <source srcSet={logo.webp} type="image/webp" />
        <img
          src={logo.src}
          alt=""
          width={48}
          height={48}
          className={cn("size-full", logo.fill ? "object-cover" : "object-contain")}
          loading="lazy"
          decoding="async"
        />
      </picture>
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
  const { locale, providerName } = useI18n();
  const showSubtitle = showEn && size !== "sm" && locale === "zh";
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <ProviderLogo id={id} size={size} />
      <span className="min-w-0">
        <span className={cn("block font-medium leading-tight", size === "sm" ? "text-xs" : "text-sm")}>
          {providerName(id)}
        </span>
        {showSubtitle ? (
          <span className="block text-xs leading-tight text-subtle">{provider.nameEn}</span>
        ) : null}
      </span>
    </span>
  );
}
