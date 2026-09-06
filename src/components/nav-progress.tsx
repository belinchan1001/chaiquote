import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function NavProgress() {
  const loading = useRouterState({ select: (s) => s.isLoading });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShow(false);
      return;
    }
    const timer = window.setTimeout(() => setShow(true), 140);
    return () => window.clearTimeout(timer);
  }, [loading]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-accent/20 transition-opacity duration-150",
        show ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden
    >
      <div className="nav-progress-bar h-full w-1/3 bg-accent" />
    </div>
  );
}
