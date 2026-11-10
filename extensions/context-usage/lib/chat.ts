// Shared structural detection of pi's chat tree. All detection is duck-typed
// against extension-visible component shapes and contract-tested against the
// installed pi (tests/contract/pi-internals.test.ts), never imported from
// pi internals — that is what lets the family survive `pi update`.
import { stripAnsi } from "./ansi.ts";

export interface ToolResultDetailsLike {
  diff?: unknown;
  patch?: unknown;
}

export interface ToolResultLike {
  isError?: unknown;
  content?: unknown;
  details?: ToolResultDetailsLike;
}

export interface ContainerLike {
  children: unknown[];
  addChild?: (child: unknown) => void;
}

/** Depth-first search for the container whose direct children satisfy `predicate`. */
export function findContainerBy(
  node: unknown,
  predicate: (children: unknown[]) => boolean,
  seen = new Set<unknown>(),
): ContainerLike | undefined {
  if (!node || typeof node !== "object" || seen.has(node)) return undefined;
  seen.add(node);
  const children = (node as { children?: unknown[] }).children;
  if (Array.isArray(children)) {
    if (predicate(children)) return node as unknown as ContainerLike;
    for (const child of children) {
      const found = findContainerBy(child, predicate, seen);
      if (found) return found;
    }
  }
  return undefined;
}

// The startup resource listing pi renders at session start: leaf ExpandableText
// sections whose first line is a [Section] header. Since pi 0.80 it lives in a
// loadedResourcesContainer rendered immediately before the chat container, making it
// the one reliable pre-rows landmark for finding that container in a fresh session
// (the welcome/changelog block is gated on updates). Same seam Context Usage has
// anchored on since v1.
export const RESOURCE_HEADER_RE = /^\s*\[(Context|Skills|Prompts|Extensions|Themes)\]/m;

/** A single startup resource section: a leaf component whose render carries a [Section] header. */
export function isResourceRow(component: unknown): boolean {
  const c = component as { render?: (width: number) => string[]; children?: unknown };
  if (!c || typeof c.render !== "function" || Array.isArray(c.children)) return false;
  try {
    return RESOURCE_HEADER_RE.test(stripAnsi(c.render(200).join("\n")));
  } catch {
    return false;
  }
}
