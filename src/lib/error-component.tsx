import { useEffect } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { reloadOnceForChunkError, rootErrorFields } from "@/lib/public-error";

export function AppErrorInner({ error }: ErrorComponentProps) {
  const { t } = useI18n();
  const fields = rootErrorFields(t);

  useEffect(() => {
    console.error(error);
    reloadOnceForChunkError(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <TriangleAlert className="size-10 text-hot" aria-hidden />
      <h1 className="mt-4 text-title font-semibold">{fields.title}</h1>
      <p className="mt-3 text-sm text-muted">{fields.lead}</p>
      <Link
        to="/"
        className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}

/** defaultErrorComponent replaces the root layout, so it must carry its own provider. */
export function AppErrorComponent(props: ErrorComponentProps) {
  return (
    <I18nProvider>
      <AppErrorInner {...props} />
    </I18nProvider>
  );
}
