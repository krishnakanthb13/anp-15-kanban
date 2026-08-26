# Code Documentation — Kanban Plugin

Technical reference for contributors and developers working on the Kanban plugin codebase.

## Entry Point (`kanban.js`)

The plugin object exposes three main surfaces:

| Member | Role |
| :--- | :--- |
| `appOption["Open Kanban Board"]` | Launcher: calls `app.openEmbed()` + navigates to `https://www.amplenote.com/notes/plugins/{pluginUUID}` |
| `renderEmbed(app)` | Builds the full HTML document for the embed iframe on every render cycle |
| `onEmbedCall(app, ...args)` | Command receiver for the sandboxed embed; increments the session round-trip counter, then dispatches via `handleEmbedAction` |

`buildViewState(app)` (exported for testability) assembles the serializable state consumed by the client: tabs configuration, board snapshots per tab, theme/date settings, and session metadata.

---

## Module Map

```
lib/
  core/
    constants.js       # Settings keys ("Kanban Tabs" / "Kanban Settings"),
                       # defaults, id generator, tab-shape validation
    settings.js        # Unified JSON settings loader/saver with backward compatibility fallback
    tabsConfig.js      # JSON persistence (load/save) + pure CRUD ops (add/remove/activate/move)
    sessionState.js    # Module-scope session state (round-trip counter); non-authoritative
    demoBoard.js       # Hardcoded demo tab shown while no real tabs are configured
  api/
    markdownIndex.js   # Pure parsing layer: markdown text → column spans → task line index
    noteBoard.js       # buildNoteBoard(): assembles note board snapshot with full task attributes
    tagBoard.js        # buildTagBoard(): notes as columns with collapsible heading sections & tasks
    notesBoard.js      # buildNotesBoard(): tagged notes as columns, tasks as cards
    taskOps.js         # Mutations: moveTaskToColumn, createTaskInColumn, setTaskCompleted,
                       # updateCardContent, addLabelToTask, sortTasksInNoteMarkdown
    columnOps.js       # Structural heading ops: create/rename/delete/reorder/transfer
    noteOps.js         # Note operations: createTaggedNote, openNote
  features/
    embedActions.js    # Command dispatch table: handleAddTab, handleMoveCard, handleCreateCard,
                       # handleEditTaskDetails, handleSaveSortToNote, handleCardMenu, etc.
  ui/
    themes.js          # 8-theme registry, palette tokens, CSS builder, isValidThemeId guard
    boardTemplate.js   # HTML document assembly (theme CSS + layout CSS + sort/save header controls)
    clientScript.js    # Embed-side JS: rendering, DnD, collapsible sections, conditional badges,
                       # sort cycler, saveSort trigger, theme cycler (ES5 template-safe string).
  utils/
    html.js            # escapeHtml, toJsonForScript (script-safe JSON embedding)
    prompt.js          # firstValue(): normalizes single- vs multi-input prompt results
    formatTimestamp.js # Unix timestamp formatting
```

---

## Task Schema & Card Model (`api/noteBoard.js`)

Amplenote tasks map into rich card objects with all native metadata:

| Field | Source Property | Description |
| :--- | :--- | :--- |
| `id` | `task.uuid` | Unique task identifier |
| `title` | `plainPreview(task.content)` | Plaintext summary of task content |
| `content` | `task.content` | Raw markdown content |
| `imageUrl` | `firstImageUrl(...)` | First embedded image URL in markdown |
| `footnotes` | `parseFootnotes(task.content)` | Map of footnote reference IDs to extracted footnote message text |
| `completedAt` | `task.completedAt` | Unix timestamp of completion |
| `dismissedAt` | `task.dismissedAt` | Unix timestamp of dismissal |
| `startAt` | `task.startAt` | Scheduled start timestamp (UTC seconds) |
| `endAt` | `task.endAt` | Scheduled end timestamp for time-blocking |
| `deadline` | `task.deadline` | Task due date timestamp |
| `hideUntil` | `task.hideUntil` | Snooze timestamp |
| `repeat` | `task.repeat` | iCalendar RRULE recurrence string |
| `isRepeating`| `task.isRepeating` | Recurrence boolean flag |
| `isParent` | `task.isParent` | Parent task with nested subtasks boolean flag |
| `isSubtask` | `task.isSubtask` | Subtask indicator boolean flag |
| `subtaskDepth` | `task.subtaskDepth` | Indentation nesting level (0 = root, 1 = child, 2+ = nested) |
| `important` | `task.important` | Eisenhower Important boolean flag |
| `urgent` | `task.urgent` | Eisenhower Urgent boolean flag |
| `score` | `task.score` | Calculated Amplenote task score (number) |
| `noteUUID` | `task.noteUUID` | Parent note identifier |

---

## Tab Types & Creation Contract (`features/embedActions.js`)

`handleAddTab` executes a 2-step progressive disclosure wizard:

- **Step 1 (Board Type Selection)**: Prompts user with a 4-option radio selector:
  1. `note`: Existing Note Board (headings as columns)
  2. `new_note`: Create New Note Board (auto-creates note with columns)
  3. `tag`: Tag Board (notes as columns with collapsible heading sections)
  4. `notes`: Multi-Note Board (one note per project, flat task cards)

- **Step 2 (Context-Specific Prompt)**: Sequentially displays only the required input:
  - **If `note`**: Displays a single `{ type: "note" }` picker prompt.
  - **If `new_note`**: Displays a single `{ type: "string" }` prompt for the board title (falling back to `defaultKanbanNoteName()` if blank). Creates note under tag `["-reports/-kanban"]` with default `# To Do`, `# In Progress`, `# Done` headings.
  - **If `tag` or `notes`**: Displays a single `{ type: "tags", limit: 1 }` tag selector prompt.

### Tab Architecture & Data Model Comparison

| Tab Kind | Badge | Badge Color | Source of Truth | Columns Represent | Cards Represent | Drag & Drop Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`note`** | `NOTE` | Accent Blue (`--kb-accent`) | `tab.noteUUID` | Headings in note (`# To Do`, `# Doing`) | Tasks under each heading | Moves task markdown line between headings or reorders within the same heading |
| **`notes`** | `NOTES` | Violet Purple (`#8b5cf6`) | `tab.tag` | Notes with tag (`filterNotes({ tag })`) | Active tasks in note (flat list) | Migrates task across notes via markdown splice & insertTask |
| **`tag`** | `TAG` | Coral Red (`--kb-danger`) | `tab.tag` | Notes with tag (`filterNotes({ tag })`) | Tasks inside collapsible heading sections per note | Relocates under heading or migrates task across notes |

### Sorting Architecture Across Board Types

1. **Columns Order**:
   - **`note` Boards**: Parsed in strict physical markdown heading sequence (`parseHeadings`).
   - **`tag` / `notes` Boards**: Initialized via Amplenote API's `app.filterNotes({ tag })` (ordered by **Last Updated / Recently Modified**). Reordering columns via drag-and-drop or `<` / `>` persists custom order in `tab.columnOrder`.
2. **Cards Order Inside Columns / Sections**:
   - In all board types (`note`, `notes`, `tag`), tasks are ordered strictly by their **physical document `lineIndex` in the note markdown** (top-to-bottom). Dragging cards updates the markdown document line order.

```
1. Note Board (`kind: "note"`):
   [ Note Document ] ──► [ Column: # To Do ] ──► [ Card: Task 1 ]
                     ──► [ Column: # Doing ] ──► [ Card: Task 2 ]
                     ──► [ Column: Completed ] ──► [ Card: Task 3 (done) ]

2. Multi-Note Board (`kind: "notes"`):
   [ Tag: #clients  ] ──► [ Col: Client A Note ] ──► [ Flat Task 1 ]
                                                  ──► [ Flat Task 2 ]
                      ──► [ Col: Client B Note ] ──► [ Flat Task 3 ]

3. Tag Board (`kind: "tag"`):
   [ Tag: #projects ] ──► [ Col: Note A ] ──► [ Sec: Unsorted  ] ──► [ Task 0 ]
                                          ──► [ Sec: # Backlog ] ──► [ Task 1 ]
                                          ──► [ Sec: # Done    ] ──► [ Task 2 ]
                                          ──► [ Sec: Completed ] ──► [ Task 3 (done) ]
                      ──► [ Col: Note B ] ──► [ Sec: # Sprint  ] ──► [ Task 4 ]
```

---

## Drag-and-Drop Engine & Relative Placement (`ui/clientScript.js` & `api/taskOps.js`)

1. **Visual Insertion Indicator Lines**:
   - **Cards**: `clientY` midpoint thresholding (`e.clientY > rect.top + rect.height / 2`) toggles `.kb-card-drop-before` or `.kb-card-drop-after`, displaying a 3px glowing accent line directly above or below the target card.
   - **Columns**: `clientX` midpoint thresholding toggles `.kb-col-drop-before` or `.kb-col-drop-after`, showing a vertical accent bar in the board gap.
   - **Tabs**: `clientX` midpoint thresholding toggles `.kb-tab-drop-before` or `.kb-tab-drop-after`, displaying a vertical boundary line on the tab chip.

2. **Cross-Header & Intra-Header Relative Splicing (`moveTaskToColumn`)**:
   - Accepts `{ columnId, columnName, targetCardId, position: "before" | "after" | "top" | "bottom" }`.
   - Locates both the moving task line and the reference `targetCardId` line in the note markdown using [`findTaskLines`](lib/api/markdownIndex.js).
   - Strips the task line and re-inserts it directly before or after the reference task line.
   - Saves the updated note markdown via `app.replaceNoteContent`.

3. **Cross-Note Task Migration in Tag & Multi-Note Boards (`handleMoveCard`)**:
   - Removes task line from source note markdown via `replaceNoteContent`.
   - Inserts task into target note via `app.insertTask({ uuid: targetNoteUUID }, taskDetails)`.
   - Relocates under destination heading inside target note if specified.

4. **Physical Note Line Order by Default (`assignTasksToColumns`)**:
   - Rather than relying on `app.getNoteTasks` API database return order, tasks in every column and section are sorted strictly by their physical `lineIndex` in the note markdown, matching the author's note sequence 1-to-1.

5. **Semantic Completion Targeting (`isDoneTarget` / `isLastColumn`)**:
   - Only marks tasks completed when dragged into an explicitly designated completion column (e.g. named `Done`, `Completed`, `Finished`, `Closed`, `Archive`), avoiding false completion when moving between general custom note headings.

6. **Task State & Lifecycle Routing (`assignTasksToColumns`)**:
   - **Completed & Dismissed Tasks** (`task.completedAt`, `task.completed`, `task.dismissedAt`): In single note boards, these tasks are isolated and routed into the dedicated **"Completed"** column at the far right of the board. Completed tasks display a `✓ {timestamp}` chip, while dismissed tasks display a `✕ {timestamp}` chip.
   - **Snoozed Tasks** (`task.hideUntil`): Kept active under their respective physical column with a `💤 Hide Until` badge.
   - **Recurring Tasks** (`task.repeat`): Kept active under their respective physical column with a `🔁 Repeat` badge.
   - **Preamble Tasks**: Placed into the **"Unsorted"** column at index 0.

7. **Resilient Task Line Indexing & Heading Cleaning (`api/markdownIndex.js`)**:
   - Sanitizes CRLF (`\r\n`) line endings before line mapping.
   - Ignores Amplenote auto-generated `<details><summary>Completed tasks</summary>` blocks during heading discovery.
   - Matches case-insensitive quoted or unquoted metadata UUID comments (`/["']?uuid["']?\s*:\s*["']?${uuid}["']?/i`).
   - Falls back to clean task content matching if markdown comments are absent before Amplenote server indexing.

---

## Task Operations & Sorting Persistence (`api/taskOps.js`)

1. **Task Relocation (`moveTaskToColumn`)**:
   - Reads fresh markdown from note.
   - Locates target heading span and source task line.
   - Computes single-line relocation diff and writes back via `app.replaceNoteContent`.
2. **Contextual Task Creation (`createTaskInColumn`) & Content Isolation**:
   - Handles both note-level (Unsorted) and heading-level task creation across all board types.
   - **Non-Task Text Safeguard & Strict Syntax Validation**: `findTaskLines` strictly enforces that only genuine markdown task checkbox lines (`^\s*[-*+]\s*\[[ xX]\]`) can be matched for tasks. Regular note text, paragraphs, descriptions, headers, or quotes under headings or at note preambles are **never** matched as tasks, never deleted, and never pulled into task content.
   - **Blank Line Text Separation (`insertUnderHeading`)**: When creating a task under a heading or at note preamble, if the following line is regular non-task text, the insertion logic automatically injects a blank line (`""`) after the task line. This prevents Amplenote's native markdown parser from interpreting subsequent text as the task's body/description.
   - **Backend Task Content Enforcement**: `createTaskInColumn` invokes `app.updateTask(taskUuid, { content })` immediately after creation, guaranteeing that the task entity in Amplenote's database strictly matches the user's input.
   - **Beside Note in Tag/Notes Tab (Guaranteed Line 0 Preamble)**: When inserting at the note level (Unsorted), if the note begins with a heading, `createTaskInColumn` safely relocates the task line to **line 0** (the very start of the note, before any `# Heading`).
   - **Beside Heading in Tag/Notes/Note Tab**: Resolves target heading span and positions the new task directly underneath the heading line (`insertUnderHeading`), guaranteeing existing text below the heading remains 100% intact.
   - **Resilient Fallback**: If Amplenote has not indexed the newly inserted task comment in `getNoteContent` yet, the fallback checks strictly for matching task lines or uuid before moving.
3. **Markdown Task Sorting (`sortTasksInNoteMarkdown`)**:
   - Triggered only via the explicit user action `handleSaveSortToNote`.
   - Reads note markdown and tasks via `app.getNoteTasks`.
   - Groups tasks under each heading section and sorts task lines in place according to `sortMode` (`score`, `startDate`, `important`, `urgent`).
   - Writes sorted markdown back to the note safely.
4. **Collision-Free Tool Layouts & Hover Overlays (`ui/boardTemplate.js`)**:
   - `.kb-col-tools` and `.kb-section-tools` use absolute floating placement (`right: 58px` and `right: 32px`), hovering over the right edge of title text on hover.
   - The card count badges and `+` Add Card buttons at the right of columns and sections remain 100% visible, unblocked, and clickable at all times.
   - Column titles and section titles use sleek single-line text truncation (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`) to prevent tall empty header space, while providing native browser `title` tooltips displaying full note/heading names on hover.

---

## Embed Action Dispatcher (`features/embedActions.js`)

All communication from the sandboxed iframe routes through `handleEmbedAction`:

| Action | Handler | Description |
| :--- | :--- | :--- |
| `ping` | `handlePing` | Bumps round-trip counter and triggers re-render |
| `saveTheme` | `handleSaveTheme` | Persists theme choice to unified Kanban Settings |
| `saveSetting` | `handleSaveSetting` | Persists top-bar view settings (empty, date, sort, info) to unified settings |
| `setActiveTab` | `handleSetActiveTab` | Switches active tab and refreshes view |
| `refreshTab` | `handleRefreshTab` | Re-queries active board data |
| `refreshAll` | `handleRefreshAll` | Re-queries all tabs |
| `addTab` | `handleAddTab` | Prompts for Note Board, New Note Board, or Tag Board |
| `closeTab` | `handleCloseTab` | Removes tab configuration (optimistic 0ms local tab removal without iframe reload) |
| `moveTabDir` | `handleMoveTabDir` | Moves tab left or right in tab bar (optimistic 0ms local tab swap without iframe reload) |
| `reorderTabs` | `handleReorderTabs` | Persists drag-and-drop tab ordering to settings |
| `setDateFormat` | `handleSetDateFormat` | Configures date chip formatting string in unified settings |
| `moveCard` | `handleMoveCard` | Moves tasks across headings, sections, or notes |
| `createCard` | `handleCreateCard` | Inserts task in column heading or note (flicker-free with immediate optimistic board update) |
| `editCard` | `handleEditCard` | Opens dedicated task details modal (returns fresh board snapshot to render in-place) |
| `editTaskDetails`| `handleEditTaskDetails` | Context-adaptive task modal: Active tasks (quadrant, cross-note migration, section, score, optional status change) vs Completed tasks (target heading on reopen, uncomplete/reopen, dismiss/archive, optional status dropdown) (returns fresh board snapshot) |
| `openCard` | `handleOpenCard` | Navigates to note in Amplenote |
| `saveSortToNote` | `handleSaveSortToNote` | Prompts confirmation & rewrites note with sorted tasks (updates board in-place with toast) |
| `saveColumnsToNote`| `handleSaveColumnsToNote` | Prompts confirmation & rewrites note headings with new column order |
| `cardMenu` | `handleCardMenu` | Context-aware menu: Complete/Reopen, Dismiss, Edit details, Date, Snooze, Timeblock, Add note link (`linkNoteInTaskContent`), Create note from card (returns fresh board snapshot for 0ms in-place update) |
| `quickSetDate` | `handleQuickSetDate` | Direct date and optional time picker prompt for card startAt (returns fresh board snapshot) |
| `globalSearch` | `handleGlobalSearch` | Searches account notes and navigates to selection |
| `moveColumnToTab`| `handleMoveColumnToTab` | Transfers column heading & tasks to another Note Board or note in tag board (returns fresh board snapshot) |
| `moveSectionToNote`| `handleMoveColumnToTab` | Alias for moving heading section to another note |
| `createColumn` | `handleCreateColumn` | Appends a new heading to note markdown (returns fresh board snapshot) |
| `createSection`| `handleCreateColumn` | Alias for creating heading in note |
| `createColumnNote`| `handleCreateColumnNote`| Creates new note auto-tagged with board tag for Tag/Notes boards (returns fresh board snapshot) |
| `createNote` | `handleCreateColumnNote`| Alias for creating tagged column note |
| `renameColumn` | `handleRenameColumn` | Renames heading in note markdown (returns fresh board snapshot) |
| `renameSection`| `handleRenameColumn` | Alias for renaming heading section |
| `deleteColumn` | `handleDeleteColumn` | Confirms and deletes heading, moving tasks to previous/adjacent header (returns fresh board snapshot) |
| `deleteSection`| `handleDeleteColumn` | Alias for deleting heading section |
| `moveColumn` | `handleMoveColumn` | Re-orders headings in note markdown (returns fresh board snapshot) |
| `moveSection` | `handleMoveColumn` | Alias for re-ordering heading sections |
| `setWipLimit` | `handleSetWipLimit` | Sets WIP limit for column (returns fresh board and updated limits) |
| `renameNote` | `handleRenameNote` | Renames note on Tag / Notes boards (returns fresh board snapshot) |
| `deleteNote` | `handleDeleteNote` | Confirms and deletes note to Amplenote Trash via `app.deleteNote` (returns fresh board snapshot) |

---
 
 ## UI & Design Architecture (`ui/`)

- **`themes.js`**:
  - 8-theme registry (`Clean Daylight`, `Sepia Parchment`, `Matcha Latte`, `Nord Frost`, `Midnight Slate`, `Nord Arctic`, `Dracula Neo`, `Emerald Forest`).
  - CSS custom property declarations (`--kb-*`) enforcing light/dark parity across backgrounds, borders, headers, cards, text, accents, danger states, and elevations.
- **`boardTemplate.js`**:
  - Assembles full HTML document with Google Fonts preconnects for **Inter** (400, 500, 600, 700) and **JetBrains Mono** (500, 600).
  - **Layout Density System**: Defines responsive CSS custom property tokens for three layout modes (`.kb-density-compact`, `.kb-density-cozy`, `.kb-density-spacious`) controlling board gaps, column widths, section padding, card padding, and font sizes.
  - Sticky glassmorphic header (`backdrop-filter: blur(8px)`), Open Note button (`#kb-open-note-btn`), cycling sort button (`#kb-sort-btn`), density cycler button (`#kb-density-btn`), view toolbar toggles (`#kb-toggle-empty-btn`, `#kb-toggle-info-btn`, `#kb-toggle-date-action-btn`), tactile button animations, hover card elevations (`translateY(-2px)` + soft drop shadows), WCAG `:focus-visible` focus rings, and responsive `@media (max-width: 900px)` breakpoints.
  - Column header layout with wide column title and right-aligned action group (`.kb-col-actions`) hosting count badge (`.kb-count`), `+` button, and micro floating tool palette (`.kb-col-tools`).
  - Section header toolbars (`.kb-section-tools`), inline `Add Header +` cards inside Tag board columns (with automatic in-memory refresh and `showEmpty: true` auto-reveal), clean Notes tab columns omitting redundant inner heading tools, stacked single-column right-end action group (`.kb-add-column-group` containing `+ Add Header`/`+ Add Note` and `+ Add Task`), actionable empty state container (`.kb-empty-actions`), color-coordinated tag chips (`.kb-label-chip`, `.kb-tag-chip`, `.kb-label-dot`), hierarchical task badges (`.kb-badge-parent`, `.kb-badge-child`, `.kb-card-subtask`), and full-resolution image Lightbox modal (`.kb-lightbox-overlay`).
  - Reduced-motion accessibility via `@media (prefers-reduced-motion: reduce)`.
- **`clientScript.js`**:
  - **Zero-Flicker Sandboxed Embed Controller**: Sandboxed controller utilizing `handlePluginResult` to bind backend action return promises directly into local state (`STATE.boards`, `STATE.tabs`), eliminating all full-iframe `renderEmbed` reload flashes. Auto-activates `showEmptyColumns` when new empty headers are created.
  - **Glassmorphic Toast Notification System (`showToast`)**:
    - `.kb-toast-container` is fixed to the bottom-right corner (`position: fixed; bottom: 24px; right: 24px; z-index: 99999; pointer-events: none`).
    - `.kb-toast` cards feature backdrop blur (`backdrop-filter: blur(12px)`), theme surface coloring (`var(--kb-surface-card)`), smooth `@keyframes kb-toast-in` slide-up animations, and auto-dismiss fade-out (`.kb-toast-hiding`).
    - Visual hierarchy across notification types:
      - `success` (green left accent `#10b981` + `✓ ` prefix): e.g. Column moved, Tab refreshed, All boards refreshed.
      - `error` (red left accent `#ef4444` + `⚠️ ` prefix): e.g. Failed to save changes, Action could not be completed.
      - `warning` (amber left accent `#f59e0b` + `ℹ️ ` prefix): e.g. Boundary guardrails (*Cannot move column before Unsorted*, *Cannot move column after Completed*).
      - `info` (theme accent `var(--kb-accent)`): Theme changes, Density cycling, View option toggles, Sort mode changes, Outside link warnings.
    - Positive completion toasts are dispatched upon verified backend operations (`res.ok === true`).
    - If a background mutation fails or rejects, an error alert is displayed and `handlePluginResult` automatically fetches fresh board state via `refreshTab` to rollback the UI to the source note's true state.
  - **Sequential Write Lock (`withNoteLock` in `columnOps.js`)**:
    - Serializes concurrent note mutation requests across rapid UI interactions into a Promise chain, eliminating ProseMirror editor selection conflicts and data collisions.
  - **Dual-Matching Column Resolution (`resolveSpan` in `markdownIndex.js`)**:
    - Matches column spans by both line ID and normalized column heading names, preventing failed moves when markdown line numbers shift dynamically between rapid reorders.
  - DOM rendering, drag-and-drop ghost animations, 1-click source note navigation (`#kb-open-note-btn`, tab chip tools, column header tools), density cycler (`#kb-density-btn`), cycling sort mode switching (`#kb-sort-btn`), empty column visibility filtering, expand/collapse all info inspector, quick `@` date & time mode, search filtering, card inspector, right-end column/task creation group, tag board section tools, 0ms client theme cycler with unified cloud and local persistence, native scroll listeners (`wheel` exclusively vertical, `Shift + wheel` exclusively horizontal), click interception for Amplenote note links (routes to `openCard`), interactive Rich Footnote handling (shows dedicated toast `📌 {text}` on click with `.kb-rich-footnote` dotted underline styling), outside link protection with bottom-right toasts, clean default `1.0` score suppression, recursive parent/child task tree hierarchy, full-resolution image Lightbox viewer (`openImageLightbox`), and image artifact stripping.
  - **Column Movement Boundary Guardrails**:
    - When `Unsorted` is present at index 0, headers cannot be dropped or moved before it (triggers *"Cannot move column before Unsorted"* toast).
    - When `Completed` is present at the end, headers cannot be dropped or moved after it (triggers *"Cannot move column after Completed"* toast).
    - Pinned pseudo-columns (`Unsorted` and `Completed`) reject drag attempts and trigger informative boundary alerts.
    - In absence of `Unsorted` or `Completed`, regular note headings can freely occupy index 0 or the last column position.

---

## Architectural Evolution & Safeguards (Legacy Comparison)

The architecture in `anp-15-kanban` solves fundamental data safety and performance bottlenecks identified from the legacy implementations ([`kanban-board.js`](./kanban-board.js) and [`kanban-old.js`](./kanban-old.js)):

1. **Non-Destructive Line Diff Mutations ([`lib/api/taskOps.js`](./lib/api/taskOps.js))**:
   - Instead of replacing the entire note text (which wiped preambles and non-task text in legacy versions), [`markdownIndex.js`](./lib/api/markdownIndex.js) partitions notes into **Column Spans** (`[startLine, contentStart, contentEnd)`). Moving tasks uses index-shifted line replacements, preserving note preambles, formatting, and sub-headings.
2. **Robust Task Identification ([`lib/api/markdownIndex.js`](./lib/api/markdownIndex.js))**:
   - Replaces brittle regexes with [`UUID_IN_LINE_RE`](./lib/api/markdownIndex.js). Fetches all tasks via a single bulk `app.getNoteTasks` query instead of $N$ synchronous `app.getTask` roundtrips.
3. **Two-Phase Column Transfers & Zero-Loss Adjacent Migrations ([`lib/api/columnOps.js`](./lib/api/columnOps.js))**:
   - Column transfers append to the target note before removing from the source note, ensuring network drops leave a recoverable duplicate rather than lost data.
   - Column deletions safely relocate existing tasks directly into the **previous column heading** (or next remaining heading) before deleting the heading line, preventing tasks from spilling into Unsorted.
4. **Color-Coded Multi-Level Heading Columns & 0ms Directional Moves**:
   - All heading depths (`# H1`, `## H2`, `### H3`, etc.) are recognized as distinct columns with clean color-coded level indicators (H1 = Theme Accent, H2 = Purple, H3 = Cyan/Teal, H4+ = Emerald) taking zero extra horizontal space.
   - Columns can be freely dragged across any number of positions with glowing vertical drop lines, and directional `<` / `>` buttons swap columns instantly in 0ms with zero screen flicker.
5. **Top-Level Service Worker Boundary & Embed Crash Immunity ([`kanban.js`](./kanban.js))**:
   - `renderEmbed(app)` is protected by an error boundary returning structured fallback HTML to guarantee that Amplenote's Service Worker receives a valid `Response(html)`, eliminating `TypeError: Failed to convert value to 'Response'` fetch promise crashes.
   - Note access methods normalize between string UUIDs and handle objects (`{ uuid: "..." }`) and supply fallback tags during note creation.
6. **Atomic Cross-Note Task Relocation ([`lib/features/embedActions.js`](./lib/features/embedActions.js) & [`lib/api/taskOps.js`](./lib/api/taskOps.js))**:
   - Moving cards across notes transfers the existing task entity directly via `app.updateTask(taskUuid, { noteUUID })` and splices it under the target heading section, completely eliminating duplicate task creation at the top of destination notes.
7. **Heading-Free Note Support & Relative Card Positioning ([`lib/api/taskOps.js`](./lib/api/taskOps.js))**:
   - `moveTaskToColumn` supports notes with zero markdown headings (such as flat project notes in Notes tabs), allowing tasks to be placed before or after any `targetCardId` or placed at top/bottom without requiring `# Heading` lines.

For full live validation steps, see [`checklist.md`](./checklist.md).

---

## Testing Strategy

```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js anp-15-kanban # Jest test suite (19 suites, 229 tests)
node esbuild.js 15                                                        # Compiles bundle to build/kanban.compiled.js
node anp-15-kanban/test/smoke.bundle.cjs                                  # End-to-end bundle verification
```
