# Changelog

## [0.11.1] - 2026-11-10

- In-process subagents no longer clear or replace the parent's Context Usage card, running-terminal list, or running-subagent list.
- Goals: a goal no longer spends a turn waiting while its subagents run, a request Pi is about to retry no longer counts as a blocked or idle turn, and `/goal resume` always sends the goal back to the model. Subagents no longer get goal tools.
- Background Terminals: `write_terminal` waits for output after its input even when older output is unread, and a terminal whose exit it already showed is not reported again. Cancelling `start_terminal` stops the terminal quietly and releases its hold.
- Subagents: a process child that exits or closes while asking a question no longer leaves `wait_agent` stuck on it. After `send_message` or `resume_from`, the agent shows as running right away. New agent ids are shorter.
- Smart Compaction escapes every tag that wraps quoted text, and tells apart custom messages sent in the same millisecond.
- Web Fetch blocks NAT64 addresses written in hex that point at local or private networks, and sends `Secure` cookies only over HTTPS.
- Media Understanding forgets the latest request when you switch sessions or branches, and crops images without converting the whole image first.

## [0.11.0] - 2026-11-01

- The package is now `pi-power-pack`, formerly `shariq-pi-extensions`. To switch, run `pi remove npm:shariq-pi-extensions` and `pi install npm:pi-power-pack`; extension settings files keep working.
- Firecrawl web tools register only when a Firecrawl API key is available, and a one-time notice explains how to add one.
