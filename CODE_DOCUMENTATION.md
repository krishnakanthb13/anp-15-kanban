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
 
- **Step 1 (Board Type Selection)**: Prompts user with a 3-option radio selector:
  1. `note`: Existing Note Board (headings as columns)
  2. `new_note`: Create New Note Board (auto-creates note with columns)
  3. `tag`: Tag Board (all notes with tag as columns)

- **Step 2 (Context-Specific Prompt)**: Sequentially displays only the required input:
  - **If `note`**: Displays a single `{ type: "note" }` picker prompt.
  - **If `new_note`**: Displays a single `{ type: "string" }` prompt for the board title (falling back to `defaultKanbanNoteName()` if blank). Creates note under tag `["-reports/-kanban"]` with default `# To Do`, `# In Progress`, `# Done` headings.
  - **If `tag`**: Displays a single `{ type: "tags", limit: 1 }` tag selector prompt.

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
| `moveColumnToTab`| `handleMoveColumnToTab` | Transfers column heading & tasks to another Note Board |
| `createColumn` | `handleCreateColumn` | Appends a new heading to note markdown |
| `renameColumn` | `handleRenameColumn` | Renames heading in note markdown |
| `deleteColumn` | `handleDeleteColumn` | Confirms and deletes heading, moving tasks to top |
| `moveColumn` | `handleMoveColumn` | Re-orders headings in note markdown |
| `setWipLimit` | `handleSetWipLimit` | Sets WIP limit for column |
| `renameNote` | `handleRenameNote` | Renames note on Tag / Notes boards |

---
 
 ## UI & Design Architecture (`ui/`)
 
 - **`themes.js`**:
   - 8-theme registry (`Clean Daylight`, `Sepia Parchment`, `Matcha Latte`, `Nord Frost`, `Midnight Slate`, `Nord Arctic`, `Dracula Neo`, `Emerald Forest`).
   - CSS custom property declarations (`--kb-*`) enforcing light/dark parity across backgrounds, borders, headers, cards, text, accents, danger states, and elevations.
 - **`boardTemplate.js`**:
    - Assembles full HTML document with Google Fonts preconnects for **Inter** (400, 500, 600, 700) and **JetBrains Mono** (500, 600).
    - Sticky glassmorphic header (`backdrop-filter: blur(8px)`), cycling sort button (`#kb-sort-btn`), view toolbar toggles (`#kb-toggle-empty-btn`, `#kb-toggle-info-btn`, `#kb-toggle-date-action-btn`), tactile button animations, hover card elevations (`translateY(-2px)` + soft drop shadows), WCAG `:focus-visible` focus rings, and responsive `@media (max-width: 900px)` breakpoints.
    - Column header layout with wide column title and right-aligned action group (`.kb-col-actions`) hosting count badge (`.kb-count`), `+` button, and micro floating tool palette (`.kb-col-tools`).
    - Reduced-motion accessibility via `@media (prefers-reduced-motion: reduce)`.
 - **`clientScript.js`**:
    - Sandboxed embed controller: DOM rendering, drag-and-drop ghost animations, cycling sort mode switching (`#kb-sort-btn`), empty column visibility filtering, expand/collapse all info inspector, quick `@` date & time mode, search filtering, card inspector, and 0ms client theme cycler with unified cloud and local persistence.
 
 ---
 
 ## Testing Strategy
 
 ```bash
 npx jest "anp-15-kanban/test"     # Jest unit and integration suites (19 suites, 207 tests)
 node esbuild.js 15                # Compiles bundle to build/kanban.compiled.js
 node anp-15-kanban/test/smoke.bundle.cjs # End-to-end bundle verification
 ```
