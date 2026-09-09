import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <TriangleAlert className="size-10 text-hot" aria-hidden />
      <h1 className="mt-4 text-title font-semibold">{t("errorTitle")}</h1>
      <p className="mt-3 text-sm text-muted">{error instanceof Error ? error.message : t("errorLead")}</p>
      <Link
        to="/"
        className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
