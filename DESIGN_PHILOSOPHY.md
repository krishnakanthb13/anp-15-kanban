# Design Philosophy — Kanban Plugin

Why the board is built the way it is. Companion to [CODE_DOCUMENTATION.md](CODE_DOCUMENTATION.md) (the *how*) and [README.md](README.md) (the *usage & configuration*).

---

## 1. The Note Is the Source of Truth

The board is a **view**, never a separate database or shadow store. Columns are headings (or notes), and cards are tasks. Every render re-derives state fresh from notes and settings.

**Why:** Amplenote plugins are pull-based; nothing pushes background note mutations to a plugin embed. Any cached board representation would silently drift from what the user sees when editing their notes. Deriving state fresh on every render guarantees consistency and data integrity.

---

## 2. Respect the Sandbox Boundary

The embed iframe cannot and should not call `app.*` directly. The client speaks an explicit, strictly typed command protocol (`moveCard`, `createCard`, `editTaskDetails`, `saveSortToNote`, …), while the plugin host performs the privileged work.

**Why:** A unified choke point for mutations ensures clean validation, error boundaries, predictable state derivation, and security isolation. Optimistic client DOM updates provide immediate responsiveness without sacrificing server authority.

---

## 3. Visual Exploration is Free; Note Modifications Earn Explicit Triggers

Visual actions on the board (such as client-side sorting by Score, Date, or Priority) operate completely in-memory and non-destructively. When the user wishes to rewrite the physical order of tasks in their note, they do so through an explicit, intentional action (**`💾 Save to Note`**).

**Why:** Users frequently want to inspect or triage tasks in different dimensions (e.g. "What is most urgent right now?") without permanently altering their note's curated layout. Making note rewrites an opt-in trigger protects user formatting while providing flexible view analytics.

---

## 4. Conditional Display Over Visual Clutter

Metadata indicators (Eisenhower badges, task scores, subtask counters, time-block ranges, snooze chips, recurrence badges) only render **when that data is actually present on the task**.

**Why:** Kanban cards must remain scannable and readable. Populating every card with placeholder values or empty tags creates visual noise. Showing only meaningful, defined attributes keeps cards focused and information-dense.

---

## 5. Destructive Writes Earn Confirmation

Simple task moves and field edits remain frictionless. Structural changes to user content — such as deleting a column heading or transferring a column to another note — prompt for explicit confirmation before writing.

**Why:** Because Amplenote note operations do not use optimistic locking, the small cost of a confirmation step prevents accidental loss of complex heading structures.

---

## 6. Minimal-Diff Writes Over Clever Section Surgery

Task relocation and sorting rewrite the note from a minimal line diff rather than using section-scoped `replaceNoteContent`.

**Why:** API section boundaries split at *every* heading. In notes with nested sub-headings, section-scoped writes risk truncating text below deeper sub-headings. A minimal diff computed by the plugin parser is strictly safer.

---

## 7. Native Semantics Beat Conventions

"Done" uses Amplenote's native task completion (`completedAt`), not a markdown comment flag or parallel status field. Dates use native `startAt`, `endAt`, `deadline`, and `hideUntil` timestamps. Recurrence uses native RRULE strings.

**Why:** Maintaining state outside native task properties creates duplicate sources of truth that fail to synchronize with Amplenote's native task views, Jots calendar, and reminders.

---

## 8. Light/Dark Parity Is Not Optional

Eight curated themes ship in balanced light/dark pairs using pure CSS custom properties (`--kb-*`).

**Why:** Theming should never require auditing dozens of layout components for contrast bugs. Standardized CSS tokens enable instant 0ms client-side theme cycling while synchronizing theme preferences cross-device.

---

## 9. Tactile, Accessible, and High-Performance UI Aesthetics

The interface combines Google Fonts typography (**Inter** + **JetBrains Mono**), calibrated typography scales, and tactile micro-interactions (hover elevations, button active scales, WIP pulsing warnings, and drag-drop ghost tilts) with full WCAG focus-visible rings and `@media (prefers-reduced-motion: reduce)` support.

**Why:** Productivity tools must feel delightful and responsive without sacrificing legibility or accessibility. Smooth hardware-accelerated transitions and distinct visual hierarchies turn raw task lists into an engaging, state-of-the-art workflow board.

---

## 10. Progressive Disclosure & Ergonomic Controls

Complex configuration is broken into sequential single-purpose steps (e.g. 2-step prompt wizard for adding board tabs: choose type first, then configure only that specific selection). Quick action buttons (cycling sort order, Empty columns show/hide, Expand/Collapse all info, and Quick `@` date mode) give power users immediate, frictionless board customizability without visual clutter or modal fatigue.

**Why:** Presenting users with irrelevant or conditional inputs in a single monolithic modal creates cognitive overload and confusion. Progressive disclosure and direct 1-click controls minimize friction, make options immediately discoverable, and provide clear mental models for everyday operations.

---

## 11. Unified Settings & Persistent UX State

All user preferences and top-bar button states (Theme, Date format, Empty columns toggle, Quick `@` date mode, Card sort mode, Expanded details) are consolidated into a single, cohesive **`Kanban Settings`** JSON object in `app.settings`.

**Why:** Scattering plugin configuration across half a dozen discrete setting keys clutters the user's Amplenote settings and complicates state synchronization. A unified JSON setting paired with a two-tier hydration model (instant local caching + asynchronous Amplenote cloud sync) ensures that every button and view preference is remembered seamlessly across browser sessions, notes, and devices with zero UI flicker.

---

## 12. Tri-Modal Board Paradigms (Single Note vs Tag Hierarchy vs Multi-Note)

The Kanban plugin embraces three distinct, purpose-built board models to reflect how knowledge workers organize information:
1. **Single Note Boards (`note`)**: Headings = columns, tasks = cards. Ideal for sprint backlogs, daily planners, and self-contained document workflows.
2. **Tag Hierarchy Boards (`tag`)**: Notes = columns, headings = collapsible sections. Ideal for high-level portfolio oversight where each note represents a major workstream with internal stages.
3. **Multi-Note Project Boards (`notes`)**: Notes = columns, all tasks = flat cards. Ideal for "one note per project/client" workflows where dragging cards moves work across projects without altering note headings.

**Why:** Forcing all Amplenote structures into a single rigid column model either breaks note-level encapsulation or loses heading granularity. Providing three clear paradigms lets users match their board directly to their organizational hierarchy without friction.
