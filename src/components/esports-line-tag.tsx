import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { ESPORTS_LINE_SEARCH } from "@/lib/site";
import { cn } from "@/lib/utils";

function EsportsMark({ label }: { label: string }) {
  return (
    <>
      {label}
      <span className="signal-bars" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </>
  );
}

const chipClass =
  "esports-line-chip chip-press inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

export function EsportsLineChip() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [armed, setArmed] = useState(false);
  const timer = useRef(0);
  const search = ESPORTS_LINE_SEARCH;
  const label = t("shortcutGaming");

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <Link
      to="/plans"
      search={search}
      aria-pressed={armed}
      aria-label={`${label} 2500M+`}
      data-armed={armed ? "true" : "false"}
      className={chipClass}
      onClick={(event) => {
        if (armed) return;
        event.preventDefault();
        setArmed(true);
        const wait = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 280;
        timer.current = window.setTimeout(() => {
          void navigate({ to: "/plans", search });
        }, wait);
      }}
    >
      <EsportsMark label={label} />
    </Link>
  );
}

export function EsportsLineToggle({
  armed,
  onToggle,
  className,
}: {
  armed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  const label = t("shortcutGaming");
  return (
    <button
      type="button"
      aria-pressed={armed}
      aria-label={`${label} 2500M+`}
      data-armed={armed ? "true" : "false"}
      className={cn(chipClass, className)}
      onClick={onToggle}
    >
      <EsportsMark label={label} />
    </button>
  );
}
