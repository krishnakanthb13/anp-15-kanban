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
| `completedAt` | `task.completedAt` | Unix timestamp of completion |
| `dismissedAt` | `task.dismissedAt` | Unix timestamp of dismissal |
| `startAt` | `task.startAt` | Scheduled start timestamp (UTC seconds) |
| `endAt` | `task.endAt` | Scheduled end timestamp for time-blocking |
| `deadline` | `task.deadline` | Task due date timestamp |
| `hideUntil` | `task.hideUntil` | Snooze timestamp |
| `repeat` | `task.repeat` | iCalendar RRULE recurrence string |
| `isRepeating`| `task.isRepeating` | Recurrence boolean flag |
| `isParent` | `task.isParent` | Subtask indicator boolean flag |
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

| Tab Kind | Source of Truth | Columns Represent | Cards Represent | Drag & Drop Action |
| :--- | :--- | :--- | :--- | :--- |
| **`note`** | `tab.noteUUID` | Headings in note (`# To Do`, `# Doing`, `# Done`) | Tasks under each heading | Moves task markdown line between headings or reorders within the same heading |
| **`tag`** | `tab.tag` | Notes with tag (`filterNotes({ tag })`) | Tasks inside collapsible heading sections per note | Relocates under heading or migrates task across notes |
| **`notes`** | `tab.tag` | Notes with tag (`filterNotes({ tag })`) | All tasks in note (flat list) | Migrates task across notes via markdown splice & insertTask |

```
1. Note Board (`kind: "note"`):
   [ Note Document ] ──► [ Column: # To Do ] ──► [ Card: Task 1 ]
                     ──► [ Column: # Doing ] ──► [ Card: Task 2 ]
                     ──► [ Column: # Done  ] ──► [ Card: Task 3 (completed) ]

2. Tag Board (`kind: "tag"`):
   [ Tag: #projects ] ──► [ Col: Note A ] ──► [ Sec: # Backlog ] ──► [ Task 1 ]
                                          ──► [ Sec: # Done    ] ──► [ Task 2 ]
                      ──► [ Col: Note B ] ──► [ Sec: # Sprint  ] ──► [ Task 3 ]

3. Multi-Note Board (`kind: "notes"`):
   [ Tag: #clients  ] ──► [ Col: Client A Note ] ──► [ Flat Task 1 ]
                                                  ──► [ Flat Task 2 ]
                      ──► [ Col: Client B Note ] ──► [ Flat Task 3 ]
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
   - **Completed & Dismissed Tasks** (`task.completedAt`, `task.completed`, `task.dismissedAt`): In single note boards, these tasks are isolated and routed into the dedicated **"Completed"** column at the far right of the board.
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
2. **Markdown Task Sorting (`sortTasksInNoteMarkdown`)**:
   - Triggered only via the explicit user action `handleSaveSortToNote`.
   - Reads note markdown and tasks via `app.getNoteTasks`.
   - Groups tasks under each heading section and sorts task lines in place according to `sortMode` (`score`, `startDate`, `important`, `urgent`).
   - Writes sorted markdown back to the note safely.

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
| `closeTab` | `handleCloseTab` | Removes tab configuration |
| `moveTabDir` | `handleMoveTabDir` | Moves tab left or right in tab bar |
| `reorderTabs` | `handleReorderTabs` | Persists drag-and-drop tab ordering to settings |
| `setDateFormat` | `handleSetDateFormat` | Configures date chip formatting string in unified settings |
| `moveCard` | `handleMoveCard` | Moves tasks across headings, sections, or notes |
| `createCard` | `handleCreateCard` | Inserts task in column heading or note |
| `editCard` | `handleEditCard` | Quick raw-markdown task editor |
| `editTaskDetails`| `handleEditTaskDetails` | Full task properties editor dialog |
| `openCard` | `handleOpenCard` | Navigates to note in Amplenote |
| `saveSortToNote` | `handleSaveSortToNote` | Prompts confirmation & rewrites note with sorted tasks |
| `saveColumnsToNote`| `handleSaveColumnsToNote` | Prompts confirmation & rewrites note headings with new column order |
| `cardMenu` | `handleCardMenu` | Context menu (edit details, label, date & time, snooze, timeblock, create note) |
| `quickSetDate` | `handleQuickSetDate` | Direct date and optional time picker prompt for card startAt (powered by universal `combineDateAndTime`) |
| `globalSearch` | `handleGlobalSearch` | Searches account notes and navigates to selection |
| `moveColumnToTab`| `handleMoveColumnToTab` | Transfers column heading & tasks to another Note Board or note in tag board |
| `moveSectionToNote`| `handleMoveColumnToTab` | Alias for moving heading section to another note |
| `createColumn` | `handleCreateColumn` | Appends a new heading to note markdown (Note boards or specific note in Tag boards) |
| `createSection`| `handleCreateColumn` | Alias for creating heading in note |
| `createColumnNote`| `handleCreateColumnNote`| Creates new note auto-tagged with board tag for Tag/Notes boards |
| `createNote` | `handleCreateColumnNote`| Alias for creating tagged column note |
| `renameColumn` | `handleRenameColumn` | Renames heading in note markdown (Note boards & Tag board sections) |
| `renameSection`| `handleRenameColumn` | Alias for renaming heading section |
| `deleteColumn` | `handleDeleteColumn` | Confirms and deletes heading, moving tasks to top (Note boards & Tag board sections) |
| `deleteSection`| `handleDeleteColumn` | Alias for deleting heading section |
| `moveColumn` | `handleMoveColumn` | Re-orders headings in note markdown (Note boards & Tag board sections) |
| `moveSection` | `handleMoveColumn` | Alias for re-ordering heading sections |
| `setWipLimit` | `handleSetWipLimit` | Sets WIP limit for column |
| `renameNote` | `handleRenameNote` | Renames note on Tag / Notes boards |
| `deleteNote` | `handleDeleteNote` | Confirms and deletes note to Amplenote Trash via `app.deleteNote` |

---
 
 ## UI & Design Architecture (`ui/`)

- **`themes.js`**:
  - 8-theme registry (`Clean Daylight`, `Sepia Parchment`, `Matcha Latte`, `Nord Frost`, `Midnight Slate`, `Nord Arctic`, `Dracula Neo`, `Emerald Forest`).
  - CSS custom property declarations (`--kb-*`) enforcing light/dark parity across backgrounds, borders, headers, cards, text, accents, danger states, and elevations.
- **`boardTemplate.js`**:
  - Assembles full HTML document with Google Fonts preconnects for **Inter** (400, 500, 600, 700) and **JetBrains Mono** (500, 600).
  - **Layout Density System**: Defines responsive CSS custom property tokens for three layout modes (`.kb-density-compact`, `.kb-density-cozy`, `.kb-density-spacious`) controlling board gaps, column widths, section padding, card padding, and font sizes.
  - Sticky glassmorphic header (`backdrop-filter: blur(8px)`), cycling sort button (`#kb-sort-btn`), density cycler button (`#kb-density-btn`), view toolbar toggles (`#kb-toggle-empty-btn`, `#kb-toggle-info-btn`, `#kb-toggle-date-action-btn`), tactile button animations, hover card elevations (`translateY(-2px)` + soft drop shadows), WCAG `:focus-visible` focus rings, and responsive `@media (max-width: 900px)` breakpoints.
  - Column header layout with wide column title and right-aligned action group (`.kb-col-actions`) hosting count badge (`.kb-count`), `+` button, and micro floating tool palette (`.kb-col-tools`).
  - Section header toolbars (`.kb-section-tools`), inline `Add Header +` cards inside columns, and right-end add column/note placeholder (`.kb-add-column-card`).
  - Reduced-motion accessibility via `@media (prefers-reduced-motion: reduce)`.
- **`clientScript.js`**:
  - Sandboxed embed controller: DOM rendering, drag-and-drop ghost animations, density cycler (`#kb-density-btn`), cycling sort mode switching (`#kb-sort-btn`), empty column visibility filtering, expand/collapse all info inspector, quick `@` date & time mode, search filtering, card inspector, right-end column/note creator, tag board section tools, 0ms client theme cycler with unified cloud and local persistence, and native scroll listeners (`wheel` exclusively vertical, `Shift + wheel` exclusively horizontal).

---

## Architectural Evolution & Safeguards (Legacy Comparison)

The architecture in `anp-15-kanban` solves fundamental data safety and performance bottlenecks identified from the legacy implementations ([`kanban-board.js`](./kanban-board.js) and [`kanban-old.js`](./kanban-old.js)):

1. **Non-Destructive Line Diff Mutations ([`lib/api/taskOps.js`](./lib/api/taskOps.js))**:
   - Instead of replacing the entire note text (which wiped preambles and non-task text in legacy versions), [`markdownIndex.js`](./lib/api/markdownIndex.js) partitions notes into **Column Spans** (`[startLine, contentStart, contentEnd)`). Moving tasks uses index-shifted line replacements, preserving note preambles, formatting, and sub-headings.
2. **Robust Task Identification ([`lib/api/markdownIndex.js`](./lib/api/markdownIndex.js))**:
   - Replaces brittle regexes with [`UUID_IN_LINE_RE`](./lib/api/markdownIndex.js). Fetches all tasks via a single bulk `app.getNoteTasks` query instead of $N$ synchronous `app.getTask` roundtrips.
3. **Two-Phase Column Transfers & Zero-Loss Deletions ([`lib/api/columnOps.js`](./lib/api/columnOps.js))**:
   - Column transfers append to the target note before removing from the source note, ensuring network drops leave a recoverable duplicate rather than lost data.
   - Column deletions lift existing tasks to the top of the note (above all headings) before deleting the heading line.

For full live validation steps, see [`checklist.md`](./checklist.md).

---

## Testing Strategy

```bash
npm test -- anp-15-kanban          # Jest unit and integration suites (19 suites, 214 tests)
node esbuild.js 15                 # Compiles bundle to build/kanban.compiled.js
node anp-15-kanban/test/smoke.bundle.cjs # End-to-end bundle verification
```

