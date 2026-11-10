// Shared number formatting for Context Usage.
// (docs/design-language.md §4). One unit, everywhere: counts render in fixed
// one-decimal k-units (0.1k, 1.2k, 52.3k) so magnitudes compare down a column —
// raw integers never appear. M is the only step-up, at ≥1M, where k becomes
// unreadable (9.1M, not 9100.0k). Char counts read `0.4k ch`.

export function compactCount(value: number): string {
  if (!Number.isFinite(value)) return "?";
  const rounded = Math.round(value);
  if (Math.abs(rounded) >= 999_950) return `${(rounded / 1_000_000).toFixed(1)}M`;
  return `${(rounded / 1000).toFixed(1)}k`;
}

/**
 * Token counts wear the estimate marker unless provider-reported: the ~/no-~
 * distinction is semantic, never stylistic (design language §4).
 */
export function formatTokens(value: number, options: { exact?: boolean } = {}): string {
  return `${options.exact ? "" : "~"}${compactCount(value)} tokens`;
}
