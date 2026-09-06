import { useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function NavProgress() {
  const pending = useRouterState({ select: (s) => s.isLoading });
  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-accent/20 transition-opacity duration-150",
        pending ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden
    >
      <div className="nav-progress-bar h-full w-1/3 bg-accent" />
    </div>
  );
}
