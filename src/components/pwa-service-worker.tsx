import { useEffect } from "react";
import { PWA_SERVICE_WORKER_URL, shouldRegisterServiceWorker } from "@/lib/pwa";

/** Registers the installability SW on the live www host only. */
export function PwaServiceWorker() {
  useEffect(() => {
    if (!shouldRegisterServiceWorker(window.location.hostname)) return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      void navigator.serviceWorker.register(PWA_SERVICE_WORKER_URL, { scope: "/" }).catch(() => {
        /* ignore — install tip still works without a controlling SW */
      });
    };
    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);
  return null;
}
