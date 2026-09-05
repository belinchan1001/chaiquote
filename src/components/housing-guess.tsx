import { classifyAddress } from "@/lib/address-search";
import { HOUSING_LABEL, type Housing } from "@/lib/plans";

export function HousingGuessNote({
  query,
  applied,
}: {
  query: string;
  applied?: Housing;
}) {
  const guess = classifyAddress(query);
  if (!query.trim()) return null;
  if (!guess.housing) {
    return (
      <p className="text-xs text-muted">未能自動判斷樓宇類型，請揀公屋、居屋、私人樓或村屋，再篩選計劃。</p>
    );
  }
  const label = HOUSING_LABEL[guess.housing];
  const matched = applied === guess.housing;
  return (
    <p className="text-xs text-muted">
      {guess.confidence === "high" ? "已辨識為" : "初步判斷為"}
      <span className="font-medium text-fg"> {label}</span>
      {matched ? "，下面已篩選呢類樓宇計劃。" : "。撳「自動篩選計劃」即可只睇相應計劃。"}
      {guess.confidence === "medium" ? " 如不正確請改下面選項。" : ""}
    </p>
  );
}

export function resolvedHousing(query: string, fallback?: Housing): Housing | undefined {
  return classifyAddress(query).housing ?? fallback;
}
