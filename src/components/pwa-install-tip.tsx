import { useCallback, useEffect, useId, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { PWA, isStandaloneDisplay, pwaInstallPlatform, pwaInstallTip } from "@/lib/pwa";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallTip() {
  const titleId = useId();
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<ReturnType<typeof pwaInstallPlatform>>("other");
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  useHydrateDesk();
  const lifted = useDesk((s) => s.compare.length > 0 || Boolean(s.notice));

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(PWA.dismissStorageKey, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    if (isStandaloneDisplay(window)) return;
    try {
      if (localStorage.getItem(PWA.dismissStorageKey) === "1") return;
    } catch {
      return;
    }
    setPlatform(pwaInstallPlatform(navigator.userAgent, navigator.maxTouchPoints ?? 0));

    let shown = false;
    function show() {
      if (shown) return;
      shown = true;
      setVisible(true);
    }
    function tourDone() {
      try {
        return localStorage.getItem("chaiquote-tour-done") === "1";
      } catch {
        return true;
      }
    }

    // Sit behind the first-visit tour; appear shortly after it is dismissed.
    if (tourDone()) {
      const timer = window.setTimeout(show, 800);
      return () => window.clearTimeout(timer);
    }
    const started = Date.now();
    const poll = window.setInterval(() => {
      if (tourDone() || Date.now() - started > 12_000) {
        window.clearInterval(poll);
        show();
      }
    }, 300);
    return () => window.clearInterval(poll);
  }, []);

  useEffect(() => {
    function onPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstallEvent(null);
      dismiss();
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [dismiss]);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    try {
      await installEvent.userChoice;
    } catch {
      /* ignore */
    }
    setInstallEvent(null);
  }

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-labelledby={titleId}
      className={cn(
        "fixed left-4 z-30 w-[min(22rem,calc(100vw-5.5rem))] rounded-xl bg-card p-4 shadow-[var(--shadow-border-hover)] transition-[bottom] duration-200 ease-out",
        lifted ? "bottom-36 sm:bottom-32" : "bottom-6",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-primary">
          <Smartphone className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p id={titleId} className="text-sm font-medium">
            加到主畫面
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{pwaInstallTip(platform)}</p>
          <p className="mt-2 text-xs leading-relaxed text-subtle">{PWA.disclaimer}</p>
          {installEvent ? (
            <Button type="button" size="sm" className="mt-3" onClick={() => void install()}>
              加到主畫面
            </Button>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="關閉"
          className="relative -mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center text-muted after:absolute after:inset-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2"
          onClick={dismiss}
        >
          <X className="size-4" />
        </button>
      </div>
    </aside>
  );
}
