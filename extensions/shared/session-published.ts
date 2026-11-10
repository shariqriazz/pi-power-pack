/**
 * Per-session lists that one extension publishes and another reads, such as
 * the running terminals and subagents that Smart Compaction records in its
 * checkpoint. In-process subagents run their own sessions in the same process,
 * so a process-wide global would let a child overwrite or delete the parent's
 * entry; keying by the session keeps each session's list its own.
 */

type SessionKey = object;

/** Running background terminals, published by Background Terminals. */
export const ACTIVE_TERMINALS = "active-terminals";
/** Subagents that have not reported back, published by Subagents. */
export const RUNNING_SUBAGENTS = "running-subagents";
type Publisher = () => string[];

const REGISTRY_KEY = Symbol.for("pi-power-pack/session-published/v1");
// Pi loads each extension entrypoint as its own module instance, so the registry lives on globalThis.
const registry: Map<string, WeakMap<SessionKey, Publisher>> = ((globalThis as Record<symbol, unknown>)[REGISTRY_KEY] as
  Map<string, WeakMap<SessionKey, Publisher>> | undefined) ??
(((globalThis as Record<symbol, unknown>)[REGISTRY_KEY] = new Map<string, WeakMap<SessionKey, Publisher>>()) as Map<
  string,
  WeakMap<SessionKey, Publisher>
>);

/** The key for a session: its session manager, the same object every extension sees for that session. */
export function sessionKeyOf(ctx: { sessionManager?: unknown }): SessionKey {
  return (ctx.sessionManager ?? ctx) as SessionKey;
}

/** Publish `lines` for `session` under `name`; the returned function removes only this entry. */
export function publishSessionLines(name: string, session: SessionKey, lines: Publisher): () => void {
  let entries = registry.get(name);
  if (!entries) registry.set(name, (entries = new WeakMap()));
  entries.set(session, lines);
  return () => {
    if (entries.get(session) === lines) entries.delete(session);
  };
}

/** The lines `session` published under `name`, or none. Never throws. */
export function readSessionLines(name: string, session: SessionKey): string[] {
  try {
    const active = registry.get(name)?.get(session)?.();
    return Array.isArray(active)
      ? active.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      : [];
  } catch {
    return [];
  }
}
