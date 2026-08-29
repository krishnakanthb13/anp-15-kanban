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
3. **Multi-Note Project Boards (`notes`)**: Notes = columns, all active tasks = flat cards. Ideal for "one note per project/client" workflows where dragging cards moves work across projects without altering note headings, automatically omitting completed tasks to keep project pipelines clean and actionable.

**Why:** Forcing all Amplenote structures into a single rigid column model either breaks note-level encapsulation or loses heading granularity. Providing three clear paradigms lets users match their board directly to their organizational hierarchy without friction.

---

## 13. Symmetrical Structural Authority Across Board Paradigms

Whether working in a Single Note Board or a Tag Hierarchy Board, users have symmetrical power to sculpt their information architecture directly from the canvas:
- **Right-end Column Adders**: The canvas provides an intuitive, discoverable `+ Add Header` (Note board) or `+ Add Note` (Tag board) action at the right end of the board.
- **Full Heading Operations in Tag Boards**: Note headings inside Tag boards enjoy the exact same structural capabilities (move up/down, rename, transfer between notes, delete) as top-level note board columns.
- **First-Class Note Lifecycle**: Tag and Multi-Note boards support direct note creation and safe note deletion to Trash (`app.deleteNote`) with confirmation safeguards.

**Why:** Users should not need to switch back to the standard markdown note editor just to add a new section, rename a stage, or prune an obsolete note. Empowering users with symmetrical tools across both note-level and heading-level structures makes the Kanban board a complete, autonomous cockpit.

---

## 14. Responsive Layout Density & Ergonomic Canvas Navigation

The visual board adapts to diverse monitor sizes, information volumes, and user preferences:
- **Layout Density System (`Cozy`, `Compact`, `Spacious`)**: The interface supports three distinct spacing densities powered by CSS custom properties, allowing power users to maximize screen real estate or enjoy relaxed readability without rewriting board HTML.
- **Strictly Separated Scroll Axes**: Standard mouse wheel scrolling maps exclusively to vertical column/card navigation, while `Shift + Wheel` executes horizontal canvas panning, preventing accidental cross-axis jumps or hijacked browser zoom.
- **Flexible Parent Bounding**: Board containers utilize flexible height clamping (`flex: 1 1 0; min-height: 0`) rather than rigid viewport percentages (`100vh`), ensuring cards and scrollbars are never sliced off by embedded iframe boundaries.

**Why:** A world-class Kanban tool must feel comfortable across varied display environments — from compact laptops to ultrawide workstations — with predictable, standard input mechanics that never fight the user's natural muscle memory.

---

## 15. Tactile Spatial Feedback & Precision Indicator Lines

When dragging cards, columns, or tabs across the canvas, the interface renders explicit **3px glowing accent indicator lines** before or after the hovered item:
- **Cards**: Top / bottom boundary lines show the exact relative insertion slot (both across columns and within the same heading).
- **Columns**: Vertical boundary lines in the canvas gap show where the column will dock.
- **Tabs**: Vertical accent lines on the tab chip show the new tab sequence.

**Why:** Vague drop targets or whole-container highlights create spatial ambiguity — users cannot tell whether their card will land at the top, bottom, or middle of a list. Direct midpoint thresholding and crisp insertion lines eliminate guesswork, giving users 100% confidence before releasing the mouse.

## 16. Flicker-Free Optimistic UI with Authoritative Markdown Persistence

Visual interactions (moving a card, reordering a column, toggling a section) update the client DOM instantaneously in 0ms while sending background mutation commands to Amplenote:
- **No Iframe Tearing**: Mutations do not trigger whole-embed re-renders, preventing screen flashes or scroll jumpiness.
- **Authoritative Markdown Splicing**: The backend splices the physical markdown line directly before or after the target task line, ensuring that when the note is opened in Amplenote, the exact visual layout is permanently preserved.

**Why:** Desktop-grade productivity tools must feel instant. Eliminating full-iframe rebuilds during continuous user workflows keeps the experience buttery smooth while guaranteeing that Amplenote markdown remains the clean, authoritative source of truth.

---

## 17. Dedicated Lifecycle Isolation & Clean Task State Separation

Active work and finished artifacts belong in distinct cognitive spaces:
- **Active Heading Focus**: Columns representing note headings contain only active, actionable tasks.
- **Dedicated "Completed" Container**: All completed and dismissed tasks are automatically separated and grouped into a dedicated **"Completed"** column at the far right of the board.
- **Amplenote End-of-Note Native Alignment**: When tasks are completed, Amplenote natively moves them to `<details><summary>Completed tasks</summary>` at the bottom of the note. Gathering completed tasks into a dedicated column mirrors Amplenote's native document architecture without polluting active heading columns.
- **Frictionless Reopening**: Dragging any card out of the Completed column into a heading column immediately clears the completion timestamp and splices the active task back under that heading in the note.

**Why:** Mixing completed tasks with active sprint items clutters board visibility and distorts column WIP limits. Isolating finished tasks into a dedicated completion space keeps columns actionable while preserving quick access to recently completed work.

---

## 18. Context-Aware Task Dialogs & Lifecycle Ergonomics

Card interactions dynamically adapt their modal interfaces and action menus based on the task's active vs completed lifecycle state:
- **Active Task Dialog**: Focuses on execution properties — markdown content, Eisenhower quadrants (Important / Urgent), task score, target note/heading assignment, and status milestones (`Started`, `Completed`, `Dismissed`).
- **Completed Task Dialog**: Focuses on review and restoration — displays completion metadata, provides a target heading selector for where to relocate the card when reopened, and offers clean status transitions (`Keep completed`, `Reopen / Active`, `Dismiss / Archive`).
- **Contextual 3-Dots Action Menus**: Menu options on active tasks highlight scheduling (Start Date, Snooze, Time-block) and completion, while completed tasks highlight reopening and archiving.

**Why:** Asking users to configure future start dates or snooze timers on already completed tasks is cognitive friction. Tailoring prompts to the task's exact lifecycle phase keeps workflows intuitive, purposeful, and free of irrelevant inputs.

---

## 19. Sandboxed Link Hygiene & Native Note Navigation

Plugin views execute within sandboxed iframes where unhandled URL navigation breaks embedding or fails silently:
- **Native Note Link Interception**: Clicks on internal Amplenote note links (`https://www.amplenote.com/notes/<uuid>` or `[[Note Name]]`) are intercepted and routed through `app.navigate` on the parent window, smoothly transitioning the user to the target note in the main editor.
- **Outside Link Protection**: External hyperlinks are non-destructively caught and accompanied by non-intrusive toast notifications, preventing broken navigation frames.
- **Image Artifact Hygiene**: Rich text conversion artifacts (such as orphaned `open_in_new` anchor tags) are automatically pruned, ensuring cards render clean, uncluttered visual media without duplication.

**Why:** A dashboard should be an integrated gateway into the Amplenote workspace. Seamlessly jumping to connected notes while protecting the sandbox environment guarantees stability and fluid workspace navigation.

---

## 20. Inclusive Multi-Level Structural Parsing & Color-Coded Spatial Hierarchy

Notes in Amplenote often mix heading depths (`# H1`, `## H2`, `### H3`) to create rich outlines. The Kanban parser treats the document structure inclusively:
- **Inclusive Column Spans**: Every heading in the note represents a distinct Kanban column rather than arbitrarily filtering by a single depth level and dumping other headings into "Unsorted".
- **Zero-Space Color-Coded Accents**: Heading depths are communicated through subtle, color-coded top and left accent indicator bars (H1 = Theme Accent, H2 = Purple, H3 = Cyan/Teal, H4+ = Emerald) rather than bulky text badges, preserving 100% of the horizontal width for user heading titles.
- **Adjacent Header Migration on Deletion**: Deleting a column heading safely relocates its tasks into the **previous column heading** (or next remaining heading), guaranteeing zero data loss and preserving task proximity within the note outline.

**Why:** Users should not have to rewrite their note headings into identical Markdown levels just to use a Kanban board. Recognizing the note's natural hierarchy and visually color-coding depth without consuming title space creates an adaptable, frictionless workspace.

---

## 21. Boundary Guardrails & Structural Preamble Integrity

The board enforces physical boundary constraints that mirror the structural layout of Amplenote notes:
- **Unsorted Column Anchoring**: Tasks at the top of a note above any heading (the preamble) naturally form the **Unsorted** column. Because the preamble physically precedes all headers in markdown, regular headings cannot be placed before `Unsorted`. Attempting to move or drop a header before `Unsorted` triggers an immediate, friendly toast notification.
- **Dynamic First Position**: If a note has *no* tasks above the first heading (no `Unsorted` column), any regular heading can freely move to the first position (`index 0`).
- **Completed Column Anchoring**: Amplenote places completed tasks in a `<details>` block at the bottom of the note. In the board, `Completed` is pinned at the far right. Regular headings cannot be placed after `Completed`, alerting the user if attempted. If no completed tasks exist, any heading can occupy the last position.
- **Pseudo-Column Immutability**: Neither `Unsorted` nor `Completed` can be dragged or reordered, protecting the note's top/bottom structural anchors while allowing all intermediate heading columns to be freely customized.

**Why:** Permitting heading movements before the preamble or after the completed block would violate document semantics and cause unexpected note rewriting. Establishing clear, dynamic boundaries backed by real-time notification feedback keeps user documents well-structured and predictable.

---

## 22. Unified Task Representation Across Tab Paradigms

Across all three tab modes (**Note**, **Tag**, and **Multi-Note / Notes**), the plugin treats tasks with complete presentation and semantic parity:
- **Universal Data & Enrichment Pipeline**: Every task—regardless of tab paradigm—is transformed through the same pipeline (`toCardModel` ➔ `detectTaskHierarchy` ➔ `renderCardHtml` ➔ `resolveLabels`).
- **Standardized Visual Grammar**: Subtask hierarchy (`subtaskDepth`, `📋 Parent Task`, `↳ Child Task`), priority indicators (`🔥 Urgent`, `⭐ Important`, `🎯 Score`), date chips (`✓ Done`, `🕒 Time Blocks`, `▶ Start`, `⏰ Due Date`), and account tag chips format identically across all views.
- **Zero Surprises Across Views**: Moving between a Single Note board, a Tag overview, and a Multi-Note project board never changes how task information is displayed, maintaining cognitive consistency throughout the workspace.

**Why:** Different board paradigms represent different structural groupings of work, not different task data. Maintaining 100% feature and visual parity across all tab kinds ensures a predictable, coherent user experience.

---

## 23. Contextual Creation Affordances & Zero-Collision Controls

Task creation is mapped to direct spatial context across the entire board:
- **Note-Level Creation Affordance**: Clicking the `+` button on a note column header (in Tag and Multi-Note boards) creates the task at the very top of the note (above all headings), cleanly routing it into the **Unsorted** section / top of the card stream.
- **Heading-Level Creation Affordance**: Clicking the `+` button beside any heading or section header (in Note, Tag, or Multi-Note boards) places the task directly underneath that specific heading line in the note markdown (with clean text separation), rendering it immediately at the top of that heading's cards (index 0).
- **Non-Task Text Isolation**: Creating a task never merges, absorbs, or overwrites neighboring note descriptions or paragraph text. Tasks and subsequent paragraphs are separated by newline spacing, preventing Amplenote from treating user notes as task content.
- **Collision-Free Tool Layouts**: Hover toolbars (`.kb-col-tools` and `.kb-section-tools`) float over title text at `right: 58px` and `right: 32px`, ensuring that toolbars fade into view gracefully without ever masking, clipping, or blocking the `+` Add Card button or card counters.
- **Zero-Waste Header Density**: Column titles and section headers maintain clean single-line truncation with native title tooltips, preventing excessive vertical blank space while preserving 1-hover full title inspection.

**Why:** Users should have immediate, 1-click precision over where a new task lands without filling out multiple modal dropdowns. Pairing intuitive spatial insertion points with strict text isolation and non-blocking hover controls guarantees a fast, frictionless, and data-safe authoring experience.

---

## 24. Zero-Flicker In-Memory State Binding (Optimistic UI & Silent Cloud Persistence)

Micro-interactions within the embed should never trigger a full iframe tear-down and rebuild:
- **In-Memory Board Updates Over Full Iframe Reloads**: In an iframe sandbox, invoking `renderEmbed()` forces Amplenote to discard and re-mount the entire DOM, resulting in a visible screen blink/flicker. Instead, action handlers return updated board snapshots directly to the client (`{ ok: true, tabId, board }`), allowing JavaScript to re-render board DOM elements in **0ms** without blinking.
- **Optimistic Local Tab Operations**: Moving tabs (`◀` / `▶` and drag-and-drop) and closing tabs mutate local state (`STATE.tabs`) instantly and trigger `renderTabs()`, while synchronizing settings to Amplenote cloud storage silently in the background.
- **Micro-Action Fluidity**: Task dialog submissions (`editCard`), context menu actions (`cardMenu`), quick dates (`quickSetDate`), date format token updates (`setDateFormat`), column operations (`renameColumn`, `deleteColumn`, `setWipLimit`), search resets (`✕`), and note sort persistence (`saveSortToNote`) update the card and column models in-place with instant feedback toasts.
- **Theme-Adaptive Visual Progress**: Network synchronization actions animate a progress bar that dynamically inherits the active theme's accent gradient and ambient glow without causing DOM re-mounts.

**Why:** Productivity applications require continuous visual stability. Eliminating screen flickering across all micro-actions, settings changes, and tab transitions ensures the board feels like a native desktop application rather than a web page reloading on every click.

---

## 25. Honest Feedback, Verified Confirmation & Automated State Recovery

A UI should never misrepresent the persistence state of user data:
- **Verified Positive Feedback**: Optimistic UI gives immediate tactile responsiveness, but positive confirmation messages (`✓`) are only displayed once the backend confirms that the mutation was written to the underlying note.
- **Explicit Failure Visibility**: If a network request, permission boundary, or parsing error prevents a write from completing, the user is immediately alerted with a high-contrast danger notification (`⚠️`).
- **Automated State Recovery (Rollback on Error)**: When an operation fails, the board immediately triggers a silent background refresh (`refreshTab`), rolling the DOM back to reflect the actual content of the source note. The interface never stays in a false "successful" state.
- **Serialized Write Locks (`withNoteLock`)**: Rapid successive interactions (e.g. clicking move arrows repeatedly) are queued sequentially per note to eliminate write collisions, ensuring clean markdown execution under all interaction speeds.

**Why:** Silent write failures or premature success toasts erode user trust. Guaranteeing that every success toast represents verified saved state—and pairing failures with automatic state rollbacks—ensures absolute data integrity.

---

## 26. Top-Level Embed Resilience & Service Worker Error Boundaries

Amplenote full-page embeds are intercepted and rendered via Amplenote's Service Worker:
- **Zero-Crash Fallback**: `renderEmbed(app)` is wrapped in an outermost `try/catch` error boundary. If note retrieval fails or a missing UUID is encountered, it returns structured, responsive fallback HTML rather than throwing an unhandled exception.
- **Service Worker Contract**: Because Service Workers convert embed return values into `new Response(html)`, returning valid HTML under all failure conditions prevents `TypeError: Failed to convert value to 'Response'` crashes and network rejection screens.
- **Robust UUID & Handle Normalization**: All note access methods accept both string UUIDs and Amplenote handle objects (`{ uuid: "..." }`), guaranteeing compatibility across varied Amplenote runtime contexts.

**Why:** A full-page dashboard must never crash the user's workspace with a white screen or Service Worker failure. Graceful degradation ensures the user can always navigate, switch tabs, or re-link notes even when network or note access is transiently interrupted.

---

## 27. Atomic Task Relocation Across Note Boundaries

When moving tasks between notes (e.g. across note columns in Tag Boards or Multi-Note Boards):
- **Single Entity Authority**: Task moves use Amplenote's native `app.updateTask(taskUuid, { noteUUID })` to transfer the existing task entity to the destination note.
- **No Duplicate Entity Insertion**: The board avoids creating parallel `app.insertTask` calls when moving existing cards, preventing task duplication between the top of the note and the target heading.
- **Resilient Markdown Relocation**: The task's physical markdown line is safely removed from the source note and spliced directly under the destination heading in the target note, ensuring 1-to-1 fidelity between note markdown and visual board columns.

**Why:** Moving work across projects should preserve the task's identity, timestamps, subtasks, and score without generating duplicate orphan tasks at the top of the document.

---

## 28. Separation of Workflow Stage Headings from System Completion Lifecycle

A Kanban system must distinguish between *workflow stage categories* (markdown headings) and *task lifecycle completion* (Amplenote's `completedAt` state):
- **Headings are Active Stages**: Markdown headings (such as `# To Do`, `# In Progress`, `# Review`, or user-created `# Done`) represent active phases of work. Moving tasks between these headings moves their physical line in the document while keeping them active.
- **Dedicated System Completion Column**: Completed and dismissed tasks are automatically isolated in the built-in system **`Completed`** column at the right end of the board. Dropping tasks into `Completed` marks them done; dragging them out reopens them.
- **Feature Flag Extensibility**: Rather than forcing rigid behavior, semantic completion rules and default board templates are governed by clean configuration flags (`AUTO_COMPLETE_ON_DONE_HEADER`, `NEW_NOTE_BOARD_INCLUDES_DONE_HEADER`) in `constants.js`.

**Why:** Treating headings named "Done" as automatic triggers to close tasks creates confusing duplicate columns (`[Done] [Completed]`) and strips user control. Clear separation guarantees predictable document structure while preserving seamless lifecycle transitions.

---

## 29. Self-Cleaning Concurrency Locks & Tail-Verified Eviction

Concurrency control in a persistent plugin runtime must prevent race conditions without unbounded memory leaks:
- **Per-Note Mutex Chains**: Sequential operations (`withNoteLock(noteUUID, fn)`) serialize rapid user writes per document into guaranteed sequential Promise chains.
- **Tail Verification on Settlement**: Rather than permanently holding resolved promises in memory or naively deleting the key on promise resolution (which would orphan incoming operations queued in the interim), the lock checks `if (noteLocks.get(key) === tail)` in a `.finally()` block.
- **Zero-Leak Idle Reclamation**: When a note's mutation queue settles and no subsequent writes are pending, its entry is automatically pruned from the Map, releasing memory immediately while maintaining complete queue safety.

**Why:** Users leave Kanban embeds open for days across dozens of notes. Concurrency locks must be robust under high load while consuming zero persistent memory when idle.

---

## 30. Unified Card Schema Stubs & Optimistic State Parity

Optimistic UI updates should never diverge in structure from official database queries:
- **Single Source of Schema Truth**: All card objects—whether constructed from `app.getNoteTasks` queries via `buildNoteBoard` or generated optimistically via `createCardStub`—pass through `toCardModel`.
- **Zero-Flicker Card Creation**: When a user creates a new card, the embed immediately presents the fully decorated card (with default scores, dates, tags, and label arrays) without waiting for background indexing or triggering an iframe reload.
- **Automatic Schema Inheritance**: Any future evolution of card properties, rich footnotes, or metadata chips automatically applies to both backend and optimistic code paths.

**Why:** Duplicating card object literals across action handlers creates subtle bugs where newly created cards lack methods, chips, or styling until a page reload. A unified factory guarantees immediate visual fidelity.

---

## 31. Adaptive Multi-Pane Ergonomics & Wheel-Scrollable Toolbars

Productivity workspaces are fluid environments where viewport widths fluctuate dynamically as users open side peek viewers, references, and split panes:
- **Multi-Pane Coexistence**: When the board container narrows (e.g. down to 600px or less alongside Amplenote's Peek Viewer), the toolbar flexes gracefully without dropping buttons into jagged multi-line wraps or clipping actions off-screen.
- **Intuitive Wheel Translation**: Modern desktop users expect horizontal toolbars and tab bars to scroll with the mouse wheel. Translating vertical wheel ticks (`deltaY`) and trackpad gestures (`deltaX`) into horizontal `scrollLeft` allows users to glide through options (`Open Note`, `Sort Tasks`, `Density`, `Empty`, `Info`, `@ Date`, `Date Format`, `Theme`) effortlessly.
- **Tiered Responsive Breakpoints**: Search inputs flex smoothly, redundant label text condenses on narrow screens, and touch/trackpad gestures remain fluid.

**Why:** Power users should never have their tools hidden, truncated, or broken simply because they opened a side document. Responsive flex architecture combined with frictionless wheel scrolling ensures that all board capabilities remain 100% accessible in any screen layout.



