import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <TriangleAlert className="size-10 text-hot" aria-hidden />
      <h1 className="mt-4 text-title font-semibold">呢頁暫時出咗問題</h1>
      <p className="mt-3 text-sm text-muted">{error.message || "請重新整理，或者返去首頁再試。"}</p>
      <Link
        to="/"
        className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
      >
        返去首頁
      </Link>
    </div>
  );
}
