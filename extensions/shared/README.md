# Shared extension helpers

Runtime helpers used by more than one extension. This directory is not an extension and has no entry in the package manifest.

## Modules

- `activity-dock.ts`: one bounded **Active work** widget that merges live rows from Task List, Background Terminals, and Subagents, ordered by urgency. Headless child sessions never touch it.
- `child-session.ts`: trust-aware resource loading for child sessions, the tool denylist for children, and bounded child shutdown.
- `context-utilization.ts`: context usage and capacity formatting.
- `session-published.ts`: per-session lists that one extension publishes and another reads, such as the running terminals and subagents that Smart Compaction records in its checkpoint. Entries are keyed by session, so an in-process subagent loading the same extensions cannot replace or remove its parent's list.
- `settlement-delivery.ts`: one queue per Pi session for asynchronous results. While the parent runs, results wait privately; at `agent_before_settle` they are appended as custom messages and continue the same run, so hosts never see Pi settle with a result waiting. Results that arrive while idle, or after an aborted run, are delivered at the idle edge and the last one starts a single model turn. `hold(key, done)` keeps the run from settling until `done` resolves; a new user message cancels every hold. A sender can key a result and withdraw it before delivery when the model already saw it through a tool.
- `tool-card.ts`: compact tool call and result cards with expandable output.
- `tui-dashboard.ts`: width-safe, sanitized drawing helpers for terminal dashboards.

Pi loads each extension entrypoint as its own module instance, so state that several extensions share (the dock, the settlement queue, and the per-session lists) lives on a process-wide `globalThis` registry rather than in module variables. In-process subagents run their own sessions in the same process, so anything one session publishes for another extension is keyed by its session.

Keep behavior that only one extension uses inside that extension. Move code here only when several extensions share the same contract, and delete a module here once nothing imports it.
