// Context Usage terminal styling.
// Identity lives in glyphs and layout, not colour: all ink is theme-derived through
// ink(), with raw-ANSI fallbacks only for surfaces rendered before a Theme handle
// exists and for the one tone pi's theme has no faithful role for ("running").

import type { Theme, ThemeColor } from "@earendil-works/pi-coding-agent";
import { homedir } from "node:os";
import { OSC_SEQUENCE } from "./ansi.ts";

/** Line-kind glyphs: one per line, gutter position (design language §1). */
export const GLYPH = {
  /** a tool action (one trace row) — traceline */
  tool: "\u203a", // ›
  /** a loop-economics fact (clock, notice, ledger line) — cachemire */
  econ: "\u25cd", // ◍
  /** an expandable/summarizable section header — Context Usage */
  section: "\u25b8", // ▸
  /** tool-block rail — the dim left edge that fuses a run of trace rows into one block */
  rail: "\u258f", // ▏
} as const;

/** The only inline fact separator (design language §5). */
export const SEP = " \u00b7 "; // ·

/**
 * Ink tones (design language §2): the neutral ramp (text/muted/dim), the status
 * tones (success/warning/error/running), and the family accent.
 */
export type Tone = "text" | "muted" | "dim" | "success" | "warning" | "error" | "running" | "accent";

const THEME_ROLE: Partial<Record<Tone, ThemeColor>> = {
  text: "text",
  muted: "muted",
  dim: "dim",
  success: "success",
  warning: "warning",
  error: "error",
  accent: "accent",
  // "running" has no faithful theme role (accent would collide with brand/total
  // highlights; warning overloads "fading") — resolved to the ANSI-blue raw tone
  // (design language §2).
};

const RESET = "\x1b[0m";

// Raw fallbacks: basic ANSI only (widest terminal support), used when no Theme is
// available yet. "text" and "accent" fall back to uncoloured text — plain is honest
// before the theme exists.
const RAW: Record<Tone, string> = {
  text: "",
  muted: "\x1b[90m",
  dim: "\x1b[90m",
  success: "\x1b[32m",
  warning: "\x1b[33m",
  error: "\x1b[31m",
  running: "\x1b[34m",
  accent: "",
};

/** All family ink flows through here (design language §3). */
export function ink(theme: Theme | undefined, tone: Tone, text: string): string {
  if (text.length === 0) return text;
  const role = THEME_ROLE[tone];
  if (theme && role) {
    try {
      return theme.fg(role, text);
    } catch {
      // fall through to the raw tone — never let styling break a render
    }
  }
  const open = RAW[tone];
  return open ? `${open}${text}${RESET}` : text;
}

// --- panel headers (design language §8) -------------------------------------------------

/** Mode pips for a panel header: active mode accent-bold, others dim, `→` dim. */
export function panelPips(theme: Theme | undefined, modes: readonly string[], active: string): string {
  return modes
    .map((mode) => (mode === active ? ink(theme, "accent", bold(theme, mode)) : ink(theme, "dim", mode)))
    .join(ink(theme, "dim", " → "));
}

/**
 * The family panel-header form (design language §8): `[Name]` in bold accent, optional
 * mode pips, then one dim hint line carrying keybinding, scope, and the panel's
 * methodology — stated here once, never on data rows.
 */
export function panelHeader(
  theme: Theme | undefined,
  name: string,
  options: { modes?: readonly string[]; active?: string; hint?: string } = {},
): string[] {
  const brand = ink(theme, "accent", bold(theme, `[${name}]`));
  const pips = options.modes && options.active ? ` ${panelPips(theme, options.modes, options.active)}` : "";
  const lines = ["", `${brand}${pips}`];
  if (options.hint) lines.push(`  ${ink(theme, "dim", options.hint)}`);
  return lines;
}

function bold(theme: Theme | undefined, text: string): string {
  try {
    return theme?.bold ? theme.bold(text) : text;
  } catch {
    return text;
  }
}

// --- layout helpers (design language §5) -----------------------------------------------

export const ELLIPSIS = "\u2026"; // …

// Replace an absolute home-directory prefix with ~ so boilerplate path heads stop eating
// width (e.g. bash `cd /Users/me/... && ...` -> `cd ~/... && ...`). OSC sequences are
// skipped: a read row's OSC 8 hyperlink carries a file:// URL containing the home path,
// and tildifying *that* would corrupt the click target. The pattern is built once —
// tildify runs for every visible row on every frame.
const TILDIFY_PATTERN = (() => {
  const home = homedir();
  if (!home) return undefined;
  return new RegExp(`${OSC_SEQUENCE.source}|${home.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g");
})();

export function tildify(text: string): string {
  if (!TILDIFY_PATTERN) return text;
  return text.replace(TILDIFY_PATTERN, (match) => (match.startsWith("\x1b") ? match : "~"));
}

// --- severity (design language §6) -------------------------------------------------------
