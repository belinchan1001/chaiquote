import { useEffect, useState } from "react";
import type { Housing } from "@/lib/plan-meta";
import { useI18n } from "@/lib/i18n";

type Guess = { housing?: Housing; confidence: "high" | "medium" | "none" };

export function HousingGuessNote({
  query,
  applied,
}: {
  query: string;
  applied?: Housing;
}) {
  const { t, housingLabel } = useI18n();
  const [state, setState] = useState<{ query: string; impractical: boolean; guess: Guess } | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    let cancel = false;
    void import("@/lib/address-search").then(({ classifyAddress, isImpracticalPlace }) => {
      if (cancel) return;
      setState({
        query: trimmed,
        impractical: isImpracticalPlace(trimmed),
        guess: classifyAddress(trimmed),
      });
    });
    return () => {
      cancel = true;
    };
  }, [query]);

  const trimmed = query.trim();
  if (!trimmed || !state || state.query !== trimmed) return null;
  if (state.impractical) {
    return <p className="text-xs text-muted">{t("noisePlaceHint")}</p>;
  }
  const guess = state.guess;
  if (!guess.housing) {
    return <p className="text-xs text-muted">{t("guessNone")}</p>;
  }
  const label = housingLabel(guess.housing);
  const matched = applied === guess.housing;
  return (
    <p className="text-xs text-muted">
      {guess.confidence === "high" ? t("guessHigh") : t("guessMid")}
      <span className="font-medium text-fg"> {label}</span>
      {matched ? t("guessApplied") : t("guessApply")}
      {guess.confidence === "medium" ? t("guessWrong") : ""}
    </p>
  );
}

export async function housingFromQuery(query: string, fallback?: Housing): Promise<Housing | undefined> {
  const trimmed = query.trim();
  if (!trimmed) return fallback;
  const { classifyAddress } = await import("@/lib/address-search");
  return classifyAddress(trimmed).housing ?? fallback;
}
