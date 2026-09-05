import { useRouterState } from "@tanstack/react-router";

export function NavProgress() {
  const pending = useRouterState({ select: (s) => s.isLoading });
  if (!pending) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-accent/30" aria-hidden>
      <div className="h-full w-1/2 animate-pulse bg-accent" />
    </div>
  );
}
