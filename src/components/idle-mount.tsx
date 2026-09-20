import { useEffect, useState, type ReactNode } from "react";

/** Mount children after the browser is idle so LCP/input stay free. */
export function IdleMount({
  children,
  timeoutMs = 2500,
}: {
  children: ReactNode;
  timeoutMs?: number;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timeout = 0;
    let idle = 0;
    const arm = () => setReady(true);
    const ric = window.requestIdleCallback;
    if (typeof ric === "function") {
      idle = ric(arm, { timeout: timeoutMs });
    } else {
      timeout = window.setTimeout(arm, Math.min(timeoutMs, 1200));
    }
    return () => {
      if (idle && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idle);
      }
      if (timeout) window.clearTimeout(timeout);
    };
  }, [timeoutMs]);

  if (!ready) return null;
  return children;
}
