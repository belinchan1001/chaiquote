/** Split a limits paragraph into card lines after the full string is translated. */
export function limitDisplayLines(text: string | undefined): string[] {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return [];
  if (trimmed.includes("。")) {
    return trimmed
      .split(/(?<=。)/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return trimmed
    .split(/(?<=\.)\s+(?=[A-Z0-9])/)
    .map((line) => line.trim())
    .filter(Boolean);
}
