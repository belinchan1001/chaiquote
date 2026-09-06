import { PROVIDER_MAP, type ProviderId } from "@/lib/plans";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LOGO_SRC: Record<ProviderId, string> = {
  hkbn: "/images/providers/hkbn.svg",
  netvigator: "/images/providers/netvigator.svg",
  cmhk: "/images/providers/cmhk.svg",
  hgc: "/images/providers/hgc.png",
  smartone: "/images/providers/smartone.svg",
  three: "/images/providers/three.png",
  csl: "/images/providers/csl.png",
  icable: "/images/providers/icable.png",
};

export function ProviderLogo({
  id,
  size = "md",
}: {
  id: ProviderId;
  size?: "sm" | "md" | "lg";
}) {
  const provider = PROVIDER_MAP[id];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-card shadow-[var(--shadow-border)]",
        size === "sm" && "size-7 p-0.5",
        size === "md" && "size-10 p-1",
        size === "lg" && "size-12 p-1.5",
      )}
    >
      <img
        src={LOGO_SRC[id]}
        alt=""
        width={40}
        height={40}
        className="size-full object-contain"
        loading="lazy"
        decoding="async"
      />
      <span className="sr-only">{provider.name}</span>
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
