import { ArrowLeft } from "lucide-react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function PageBackButton({ className }: { className?: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const { t } = useI18n();

  return (
    <button
      type="button"
      aria-label={t("backPrev")}
      onClick={() => {
        if (router.history.canGoBack()) {
          router.history.back();
          return;
        }
        void navigate({ to: "/" });
      }}
      className={cn(
        "chip-press -ml-2 inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted outline-none transition-[background-color,color] duration-75 ease-out hover:bg-surface hover:text-fg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        className,
      )}
    >
      <ArrowLeft className="size-4" strokeWidth={2.25} aria-hidden="true" />
      {t("backPrev")}
    </button>
  );
}
