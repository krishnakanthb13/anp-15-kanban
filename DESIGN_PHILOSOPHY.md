# Design Philosophy — Kanban Plugin

Why the board is built the way it is. Companion to [CODE_DOCUMENTATION.md](CODE_DOCUMENTATION.md) (the *how*) and [ds.md](ds.md) (the plan).

## 1. The Note Is the Source of Truth

The board is a **view**, never a store. Columns are headings, cards are tasks — there is no shadow copy of board data anywhere. Every render re-derives everything from notes and settings.

**Why:** Amplenote plugins are pull-based; nothing tells a plugin when a note changed. Any cached board state would silently diverce from what the user sees in their editor. Deriving fresh on every render makes divergence structurally impossible, at the cost of a few API calls per interaction — the right trade for data integrity.

## 2. Respect the Sandbox Boundary

The embed iframe cannot call `app.*`. Rather than fighting this, the architecture embraces it: the client speaks a small explicit command protocol (`moveCard`, `createCard`, `editCard`, …) and the plugin host does the privileged work.

**Why:** A single choke point for mutations means one place to validate input, one place to trigger re-renders, and an auditable list of everything the UI can do. Optimistic client updates keep drags feeling instant; authority always returns with the next server-derived render.

## 3. Destructive Writes Earn Confirmation

Simple field edits and card moves stay frictionless. Structural rewrites of user content — column reorder, delete, rename (Phase 2) — will require a plain-language confirm before writing, plus a staleness check (re-read immediately before writing; abort if the note changed underneath us).

**Why:** There is no optimistic locking on `replaceNoteContent`. The cost of a confirmation dialog is trivial next to the cost of silently clobbering a user's concurrent edits.

## 4. Minimal-Diff Writes Over Clever Section Surgery

Task relocation rewrites the whole note from a freshly-read, single-line diff instead of using section-scoped `replaceNoteContent`.

**Why:** API section boundaries split at *every* heading. With nested sub-headings, rewriting "a section" would truncate everything below a sub-heading boundary. A minimal diff computed by our own parser is strictly safer — we only ever change the lines we intend to change.

## 5. Native Semantics Beat Conventions

"Done" is Amplenote's native task completion (`completedAt`), not a strikethrough convention or a parallel status field. Dates are native `startAt`/`deadline` fields, not `@date` text markers.

**Why:** Anything modeled outside the task object forks the truth: two places to update, two places to be wrong. Native fields sync with the rest of Amplenote (task views, notifications) for free.

## 6. Light/Dark Parity Is Not Optional

Eight themes ship in balanced light/dark pairs. Every color flows through `[data-theme]` CSS custom properties (`--kb-*`) — no hardcoded hex in layout CSS.

**Why:** Tuning one palette table beats auditing every element for contrast. Instant attribute-based switching keeps theme cycling at 0ms even though persistence round-trips through settings.

## 7. Honest Sync

Amplenote plugins cannot observe changes. Refresh is therefore explicitly manual (Tab / All buttons), and the docs say so rather than implying live sync.

**Why:** A progress bar that pretends to be real-time sync is a lie users eventually discover. Predictable manual refresh builds more trust than flaky magic.

## 8. Isolation & Readability

Same values as the parent staging repo: each plugin is self-contained, bundles via esbuild into readable output, and keeps pure logic (parsing, config ops) separated from I/O so it tests without mocks.
