# Kanban Plugin

A multi-tab visual Kanban board for Amplenote, rendered as a full-screen plugin embed. Note boards turn a note's headings into columns and its tasks into draggable cards, while Tag boards turn notes under a tag into columns with collapsible heading sections.
Icon: `view_kanban`

> **Status:** Fully updated with Note Boards, Create New Note Boards, Tag Boards (with collapsible heading blocks), Notes Boards, rich task metadata & editing, Eisenhower matrix badges, visual sorting with note-persistence triggers, and responsive theme support.

## Installation

1. **Create a Plugin Note**: Create a new note in Amplenote named "Kanban Plugin".
2. **Setup Metadata Table**: At the very top of the note, create a table with the following rows:

| Field | Value |
| :--- | :--- |
| `name` | Kanban |
| `description` | A visual Kanban board: note headings as columns, tasks as cards. |
| `icon` | view_kanban |
| `setting` | Kanban Tabs |
| `setting` | Kanban Theme |
| `setting` | Kanban Date Format |

3. **Insert Code Block**: Below the table, create a single Javascript code block (type ` ```javascript `).
4. **Paste Compiled Code**: Copy the content from `build/kanban.compiled.js` and paste it inside that code block.
5. **Activate**: Go to **Account Settings** -> **Plugins**, and select the note you just created.

## Settings

Settings are stored via `app.settings` / `app.setSetting` and sync across devices. All values are strings.

| Setting | Purpose | Example value |
| :--- | :--- | :--- |
| `Kanban Tabs` | JSON tab configuration: which notes/tags are boarded, their order, and the active tab. Written by the plugin; edit by hand only for repair. | `{"tabs":[{"id":"tab_x","kind":"note","name":"My Board","noteUUID":"…"}],"activeTabId":"tab_x","settings":{"dateFormat":"YYYY-MM-DD"}}` |
| `Kanban Theme` | Active theme id (also changeable from the board's theme button). | `midnight` |
| `Kanban Date Format` | Format used for date chips on cards. | `YYYY-MM-DD` |

## Usage

### Opening the board

Run the **Open Kanban Board** app option (the plugin's launch button). This opens the plugin's persistent sidebar section and navigates to the board URL (`https://www.amplenote.com/notes/plugins/{pluginUUID}`), where it stays available like an app.

Until tabs are configured, the board shows a **Demo Board** so you can explore the UI.

### Managing tabs

The tab bar sits above the board:

- **+ New tab** opens the tab creation dialog with 3 clear options:
  1. **Note Board (Existing Note)**: Select an existing note where headings act as columns.
  2. **Create New Note Board**: Specify an optional note name (defaults to `Kanban Board - YYYY-MM-DD HH:mm` if blank); auto-creates the note tagged `-reports/-kanban` with default `# To Do`, `# In Progress`, and `# Done` columns.
  3. **Tag Board**: Select a tag where notes under that tag act as columns with collapsible heading sections.
- **Click** a tab to switch boards; data is re-derived fresh on every switch.
- **Hover a tab** for its tools: ← / → reorder tabs, ✕ closes it (the underlying note/tag is never deleted).

### Board interactions (Note Boards)

A note board maps one note onto the board:

- **Columns** = the note's headings at the shallowest heading level present (H1s if the note uses H1s, etc.). Deeper sub-headings stay inside their parent column.
- **Cards** = tasks under each heading, in document order. Tasks above the first heading appear in an implicit **Unsorted** column.
- **Drag & drop** a card onto another column to move it — the task physically moves under the target heading in the note.
- **Drop into the last column** to complete the task (crossed out via Amplenote's native completion). Dragging it back out reopens it. Dropping a card back into its own column is a safe no-op.
- **`+` on a column header** creates a new task at the top of that column (prompted for markdown content).
- **Click a card** opens the rich task editor dialog (markdown content, Important/Urgent quadrant, target note & heading section, task score, and lifecycle status).
- **`ℹ` button on a card** toggles an inline task details inspector showing all non-empty properties (Start At, End At, Deadline, Hide Until, Repeat schedule, Completed/Dismissed status, and Note link).

### Tag Boards (Notes as Columns with Collapsible Sections)

A tab can also be a **Tag Board**:
- **Columns** = notes carrying the selected tag.
- **Collapsible Heading Blocks** = within each note column, each heading is rendered as a collapsible section (`▼ / ▶`) showing the section title, card count, and a `+` button to create tasks directly under that heading.
- **Drag & drop** across sections or columns automatically relocates the task under that heading or updates its parent note.
- **Column Header Actions**: rename note (✎) or open the note directly in Amplenote (↗).

### Notes Boards

The third kind maps a tag where notes act as columns and all tasks inside each note are listed as cards:
- Dragging a card between columns moves the task to that note natively (`updateTask`), without touching markdown formatting.
- `+` inserts a task directly into the target note.

### Rich Card Badges & Conditional Indicators

Task cards dynamically display badges and metadata chips **only when those values are present**:

- **🔥 Urgent** / **⭐ Important**: Eisenhower priority quadrant badges.
- **🎯 Task Score**: Computed Amplenote task score (e.g. `🎯 12.5`).
- **📋 Subtasks**: Displayed when a task has child subtasks (`isParent`).
- **🕒 Time Block**: Displayed when both start and end times are set (e.g. `🕒 2026-08-21 10:00-11:30`).
- **▶ Start Date** / **⏰ Due Date**: Scheduled start date or deadline timestamp.
- **🙈 Snoozed**: Displayed when a task has a future `hideUntil` snooze timestamp.
- **🔁 Repeat**: Displays recurrence frequency (e.g. `🔁 daily`, `🔁 weekly`).
- **Rich Editor Content**: Supports bold, italics, Rich Footnotes, inline images, and clickable URLs.

### Dynamic Sorting & Persisting to Note

- **🔀 Sort Control**: Click the sort button in the header to cycle client-side sorting instantly:
  `Note Order ➔ Score ➔ Date ➔ Important ➔ Urgent`.
  *Visual dashboard sorting is non-destructive and does not rewrite the note.*
- **💾 Save Sort**: When a sort mode is active on a Note Board, the `💾 Save Sort` button appears in the header. Clicking it prompts for confirmation and re-arranges physical task lines inside each heading in the underlying note markdown.
- **↺ Reset Sort**: Instantly restores the dashboard view back to the natural source note order.

### Drag & Drop Column Reordering & Heading Persistence

- **Drag Columns Directly**: Click and drag any column header (or its `⠿` grip handle) to reorder columns visually across the board in real time.
- **💾 Save Columns**: When column order is modified, a `💾 Save Columns` button appears in the header. Clicking it prompts for confirmation and rewrites the note markdown so heading sections match your new column layout.
- **↺ Reset Columns**: Restores the board columns back to the note's original heading sequence without modifying the note.

### Drag & Drop Tab Reordering

- **Drag Tabs**: Click and drag any tab in the top tab bar to reorder your boards. The new sequence is persisted quietly in the background.

### Keyboard Shortcuts & Rich UX

- **`T` / `t`**: Cycle through the 8 themes with 0ms client-side switching.
- **`/`**: Instantly focus and select the card filter search input.
- **`Esc`**: Clear search filter and blur search input.
- **Live Toast Notifications**: Non-intrusive bottom-right toast feedback for reorders, theme switches, and note updates.

### Card Context Menu (`⋯`)

Clicking the **⋯** menu on any card offers quick actions:
- **Edit task details**: Opens the full task configuration dialog.
- **Add label**: Links a note as a label (`[[Note Name]]`), rendered as a colored chip matching account tags.
- **Set start date / deadline**: Sets native start time or deadline.
- **Snooze / Hide Until**: Sets a date to hide the task until.
- **Schedule Time Block**: Configures start and end times for calendar blocking.
- **Create note from card**: Creates a new note titled from the card and links it back to the task.

### Column management (Note Boards)

Hover a column header for its tools:
- **← / →** move the column left/right — headings are reordered in the note to match.
- **✎ renames** the column by editing the heading text in place.
- **✕ deletes** the column after an explicit confirmation checkbox; its tasks move to the top of the note.
- **⇥ Move column to another board**: Transfers the heading and all its tasks to another Note Board tab safely.

### WIP Limits

Click a column's count chip to set a Work-In-Progress limit (0 or blank clears it). Once a column exceeds its limit, the chip turns red showing `count / limit`.

### Two-Tier Search

The header search box filters the active board client-side in real time (titles, content, labels, tags). Pressing **Enter** runs a full-text search across all notes in your account and lets you navigate to any match.

### Themes & Design System

Click the 🎨 theme button or press **T** (outside inputs) to cycle 8 curated palettes with light/dark parity. Powered by Google Fonts (**Inter** + **JetBrains Mono**), tactile micro-interactions, accessible focus rings, and smooth hardware-accelerated transitions.

| Theme | Type | | Theme | Type |
| :--- | :--- | :--- | :--- | :--- |
| ☀️ Clean Daylight | light | | 🌌 Midnight Slate | dark |
| 📜 Sepia Parchment | light | | ❄️ Nord Arctic | dark |
| 🍵 Matcha Latte | light | | 🧛 Dracula Neo | dark |
| 🧊 Nord Frost | light | | 🌲 Emerald Forest | dark |

## Technical Details

```
kanban.js                  # Entry: appOption launcher, renderEmbed, onEmbedCall dispatcher
lib/
  core/
    constants.js           # Settings keys, defaults, id generation
    tabsConfig.js          # Tab persistence (validated load/save + pure CRUD ops)
    sessionState.js        # Session-scoped state (round-trip counter)
    demoBoard.js           # Hardcoded demo content shown before any tabs exist
  api/
    markdownIndex.js       # Pure parsing layer: markdown → columns/cards mapping
    noteBoard.js           # Builds note board snapshot with full task models
    tagBoard.js            # Builds tag board with note columns & collapsible sections
    notesBoard.js          # Builds notes board with note columns & task cards
    taskOps.js             # Task mutations: move, complete, create, edit, sort in markdown
    columnOps.js           # Structural heading ops: create/rename/delete/reorder/transfer
    noteOps.js             # Note operations: createTaggedNote, openNote
  features/
    embedActions.js        # Command dispatch table for all embed actions
  ui/
    themes.js              # 8-theme registry + CSS variable palettes
    boardTemplate.js       # Full HTML document assembly (theme CSS + layout + header controls)
    clientScript.js        # Embed-side JS: rendering, DnD, badges, sort, theme cycler
  utils/
    html.js                # HTML escaping + script-safe JSON embedding
    prompt.js              # Prompt normalization helper
    formatTimestamp.js     # Timestamp formatting helper
test/                      # Jest suites (run: npx jest "anp-15-kanban/test") (18 suites, 190 tests)
build/
  kanban.compiled.js       # Build artifact to paste into the plugin note
```

Build with `node esbuild.js 15` from the repository root.
