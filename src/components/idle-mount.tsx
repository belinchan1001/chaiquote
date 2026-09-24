import { useEffect, useState, type ReactNode } from "react";

/** Mount children after load and idle so first paint's main thread stays free. */
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
    let armed = false;
    const arm = () => {
      if (armed) return;
      armed = true;
      setReady(true);
    };
    const start = () => {
      const ric = window.requestIdleCallback;
      if (typeof ric === "function") {
        idle = ric(arm, { timeout: timeoutMs });
      } else {
        timeout = window.setTimeout(arm, Math.min(timeoutMs, 1200));
      }
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (idle && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idle);
      }
      if (timeout) window.clearTimeout(timeout);
    };
  }, [timeoutMs]);

  if (!ready) return null;
  return children;
}
