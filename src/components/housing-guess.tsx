import { classifyAddress, isImpracticalPlace } from "@/lib/address-search";
import { type Housing } from "@/lib/plans";
import { useI18n } from "@/lib/i18n";

export function HousingGuessNote({
  query,
  applied,
}: {
  query: string;
  applied?: Housing;
}) {
  const { t, housingLabel } = useI18n();
  if (!query.trim()) return null;
  if (isImpracticalPlace(query)) {
    return <p className="text-xs text-muted">{t("noisePlaceHint")}</p>;
  }
  const guess = classifyAddress(query);
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

export function resolvedHousing(query: string, fallback?: Housing): Housing | undefined {
  return classifyAddress(query).housing ?? fallback;
}
