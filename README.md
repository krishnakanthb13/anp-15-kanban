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
| `setting` | Kanban Settings |

3. **Insert Code Block**: Below the table, create a single Javascript code block (type ` ```javascript `).
4. **Paste Compiled Code**: Copy the content from `build/kanban.compiled.js` and paste it inside that code block.
5. **Activate**: Go to **Account Settings** -> **Plugins**, and select the note you just created.

## Settings

Settings are stored via `app.settings` / `app.setSetting` and synchronized across devices and notes automatically. All values are stored as strings.

### 📋 `Kanban Tabs`
Stores board tab definitions, tab ordering, and active tab state. Managed automatically by the plugin.

```json
{
  "tabs": [
    {
      "id": "tab_1",
      "kind": "note",
      "name": "Sprint Tasks",
      "noteUUID": "692c8152-7b19-4a41-b841-32b03c200547"
    }
  ],
  "activeTabId": "tab_1"
}
```

### ⚙️ `Kanban Settings`
**Unified JSON Plugin Settings & View Preferences**: Persists all appearance and view preferences across sessions, notes, and devices:

- **`theme`**: Active color palette (`"light"`, `"sepia"`, `"matcha"`, `"nord-light"`, `"midnight"`, `"nord"`, `"dracula"`, `"emerald"`)
- **`density`**: Layout spacing density (`"cozy"`, `"compact"`, `"spacious"`)
- **`sortMode`**: Default visual card sorting (`"none"`, `"score"`, `"startDate"`, `"important"`, `"urgent"`)
- **`dateFormat`**: Custom date chip format (`"YYYY-MM-DD"`, `"DD/MM/YYYY"`, `"MM/DD/YYYY"`)
- **`showEmptyColumns`**: Keep empty columns visible (`true` / `false`)
- **`quickDateEnabled`**: Show quick `@` date button on cards (`true` / `false`)
- **`expandCardInfo`**: Expand inline task details on all cards (`true` / `false`)

```json
{
  "theme": "light",
  "density": "cozy",
  "dateFormat": "YYYY-MM-DD",
  "showEmptyColumns": false,
  "quickDateEnabled": false,
  "sortMode": "none",
  "expandCardInfo": false
}
```

## Usage

### Opening the board

Run the **Open Kanban Board** app option (the plugin's launch button). This opens the plugin's persistent sidebar section and navigates to the board URL (`https://www.amplenote.com/notes/plugins/{pluginUUID}`), where it stays available like an app.

Until tabs are configured, the board shows a **Demo Board** so you can explore the UI.

### Managing tabs & Board Types

The tab bar sits above the board:

- **+ New tab** opens a clean **2-step progressive disclosure wizard**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Step 1: "Add Board Tab"                                                │
│                                                                        │
│ Choose board type:                                                     │
│  ○ Existing Note Board (headings as columns)                  → 'note' │
│  ○ Create New Note Board (auto-creates note with columns)     → 'note' │
│  ○ Tag Board (notes as columns with collapsible sections)     → 'tag'  │
│  ○ Multi-Note Board (one note per project, flat task cards)   → 'notes'│
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Step 2: Context-Specific Input                                         │
│                                                                        │
│ • If 'note': Prompts for Note Picker (select existing note)            │
│ • If 'new_note': Prompts for Board Title (creates note with columns)   │
│ • If 'tag' or 'notes': Prompts for Tag Picker (select #tag)            │
└────────────────────────────────────────────────────────────────────────┘
```

- **Click** a tab to switch boards; data is re-derived fresh on every switch.
- **Drag & Drop** tabs to reorder them in your tab bar.
- **Hover a tab** for its tools: ← / → reorder tabs, ✕ closes it (the underlying note/tag is never deleted).

---

### Drag & Drop Reordering & Visual Indicator Lines

The Kanban board provides tactile visual feedback with **glowing accent insertion indicator lines** across all board elements:

- **Cards**:
  - **Visual Indicator**: Hovering over a card shows a horizontal glowing indicator line **above** or **below** the card based on cursor position.
  - **Across Headers**: Moving a card across different column headings shifts the task markdown under the target heading at the exact slot.
  - **Within the Same Header**: Dragging a card before or after another card within the same column rewrites the note markdown to persist the exact custom task ordering.
  - **Auto-Completion & Dedicated Completed Column**: In single note boards, all completed tasks are automatically aggregated into a dedicated **"Completed"** column at the far right of the board. Dragging any active task into "Completed" (or any column named "Done" / "Completed") marks it complete (`completedAt: timestamp`). Dragging a completed task out of "Completed" into any heading reopens the task (`completedAt: null`) directly under that heading in your note. Moving between custom headers preserves active task state.
- **Columns**: Hovering a column header shows a vertical drop line in the board gap to the left or right, allowing seamless column reordering.
- **Tabs**: Hovering a tab displays a vertical accent line on the left or right edge, enabling instant tab bar reordering.

### Task States & Lifecycle Handling

Amplenote tasks carry multiple lifecycle states that the Kanban plugin maps natively onto columns and visual badges:

| Task State | Amplenote Native Behavior | Kanban Board Representation |
| :--- | :--- | :--- |
| **Active Tasks** (`[ ]`) | Sit physically under a heading in the note markdown. | Displayed in their **exact heading column** in 1-to-1 document line order. |
| **Completed Tasks** (`completedAt` or `[x]`) | Amplenote automatically moves them to the end of the note inside `<details><summary>Completed tasks</summary>`. | **Aggregated into the dedicated "Completed" column** at the far right of the board, keeping heading columns 100% focused on active work. |
| **Dismissed / Archived Tasks** (`dismissedAt`) | Crossed out / dismissed at the note level. | **Placed in the "Completed" column** with dismissed/done status. |
| **Hidden / Snoozed Tasks** (`hideUntil` in future) | Stays under its physical heading, but hidden in normal task views until wake date. | **Remains active under its heading column**, displaying a `💤 Hide Until: [date]` badge so you always know when it wakes up. |
| **Recurring Tasks** (`repeat` rule) | Stays under its physical heading. When completed, Amplenote creates/schedules the next instance under the same heading. | **Active instance remains under its heading column** with a `🔁 Repeat` badge. When marked complete, the completed instance is logged, and the newly spawned recurrence stays active under the heading. |
| **Preamble Tasks** (above first heading) | Sit at the very top of the note before any `# Heading`. | **Grouped into the "Unsorted" pseudo-column** on the far left. |

---

### Board Types: `note` vs `tag` vs `notes`

| Tab Kind | Badge | Source of Truth | Columns Represent | Cards Represent | Drag & Drop Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`note`** *(Single Note Board)* | <span style="color:#2563eb">`NOTE`</span> | **1 specific note** (`noteUUID`) | **Headings** inside that note (`# To Do`, `# In Progress`) | **Tasks** under each heading | Moves task markdown line between headings or reorders within the same heading |
| **`notes`** *(Multi-Note Project Board)* | <span style="color:#8b5cf6">`NOTES`</span> | **All notes with a tag** (`tag`) | **Notes** with that tag | **All tasks** in each note (flat card list) | Migrates tasks between notes |
| **`tag`** *(Tag Hierarchy Board)* | <span style="color:#dc2626">`TAG`</span> | **All notes with a tag** (`tag`) | **Notes** with that tag | **Tasks** grouped into **collapsible heading sections** within each note | Moves tasks across headings or migrates tasks between notes |

```
1. Note Board (`note`):
   [ Note Document ] ──► [ Column: # To Do ] ──► [ Card: Task 1 ]
                     ──► [ Column: # Doing ] ──► [ Card: Task 2 ]
                     ──► [ Column: Completed ] ──► [ Card: Task 3 (done) ]

2. Multi-Note Board (`notes`):
   [ Tag: #clients  ] ──► [ Col: Client A Note ] ──► [ Flat Task 1 ]
                                                  ──► [ Flat Task 2 ]
                      ──► [ Col: Client B Note ] ──► [ Flat Task 3 ]

3. Tag Board (`tag`):
   [ Tag: #projects ] ──► [ Col: Note A ] ──► [ Sec: # Backlog ] ──► [ Task 1 ]
                                          ──► [ Sec: # Done    ] ──► [ Task 2 ]
                      ──► [ Col: Note B ] ──► [ Sec: # Sprint  ] ──► [ Task 3 ]
```

### Board Sorting Mechanics

| Board Scope | Component | Default Sort Order | How to Reorder / Customize |
| :--- | :--- | :--- | :--- |
| **Single Note Board (`note`)** | **Columns (Headings)** | Physical Markdown heading order in note. | Drag-and-drop column headers or `<` / `>` buttons (persists in tab settings / note content). |
| | **Cards Inside Column** | Strict physical `lineIndex` in note markdown (top-to-bottom). | Drag-and-drop cards (rewrites note markdown line sequence). |
| **Multi-Note Board (`notes`)** | **Columns (Notes)** | **Last Updated / Recently Modified** from Amplenote `app.filterNotes({ tag })`. | Drag-and-drop column headers or `<` / `>` buttons (persists custom order in tab `columnOrder`). |
| | **Cards Inside Column** | Strict physical `lineIndex` in each note's markdown. | Drag-and-drop cards (rewrites note markdown line sequence). |
| **Tag Board (`tag`)** | **Columns (Notes)** | **Last Updated / Recently Modified** from Amplenote `app.filterNotes({ tag })`. | Drag-and-drop column headers or `<` / `>` buttons (persists in tab `columnOrder`). |
| | **Heading Sections** | Physical Markdown heading order inside each note. | Add/remove headers or collapse sections. |
| | **Cards Inside Section** | Strict physical `lineIndex` under that specific heading. | Drag-and-drop cards between sections or within section. |

---

### 1. Note Boards (`note`)

A note board maps one single note onto the board:

- **Columns** = the note's headings at the shallowest heading level present (H1s if the note uses H1s, etc.). Deeper sub-headings stay inside their parent column.
- **Cards** = tasks under each heading, in document order. Tasks above the first heading appear in an implicit **Unsorted** column.
- **Drag & drop** a card onto another column to move it — the task physically moves under the target heading in the note markdown.
- **Drop into the Completed / Done column** to complete the task (crossed out via Amplenote's native completion). Dragging it back out reopens it. Dropping a card back into its own column is a safe no-op.
- **`+` on a column header** creates a new task at the top of that column (prompted for markdown content).
- **`+ Add Header` card at the right end of the board**: Click to instantly create a new heading column at the end of the note, with heading level selection (**H1**, **H2**, **H3**).
- **Click a card** opens the dedicated task editor dialog:
  - **On Active Tasks**: Full Task Details modal (markdown content, Important/Urgent quadrants, move to note / heading dropdown, task score, and mark status: `Started`, `Completed`, `Dismissed`).
  - **On Completed Tasks**: Specialized Completed Details modal (markdown content, target heading dropdown for where to relocate on reopen, and lifecycle actions: `Reopen / Active`, `Dismiss / Archive`, `Keep completed`).
- **`ℹ` button on a card** toggles an inline task details inspector showing all non-empty properties (Start At, End At, Deadline, Hide Until, Repeat schedule, Completed/Dismissed status, and Note link).
- **`...` 3-dots button on a card** opens a context-aware action menu:
  - **Active Tasks**: `Mark as completed`, `Edit details`, `Add label`, `Set start date/time`, `Snooze / Hide Until`, `Schedule Time Block`, `Create note from card`.
  - **Completed Tasks**: `Reopen task (mark active)`, `Dismiss / Archive task`, `Edit details`, `Add label`, `Create note from card`.

### 2. Tag Boards (`tag`)

A tag board turns notes under a tag into columns with collapsible heading sections:

- **Columns** = notes carrying the selected tag.
- **Collapsible Heading Blocks** = within each note column, each heading is rendered as a collapsible section (`▼ / ▶`) showing the section title, card count, and action buttons.
- **Full Header Management on Every Section**:
  - **Move Header Up / Down** (`chevronUp` / `chevronDown`): Reorders the heading in the note's markdown.
  - **Rename Header** (`edit`): Renames the heading line in place.
  - **Transfer Header** (`transfer`): Moves the heading and all its tasks to another note under the same tag or another note-board tab.
  - **Delete Header** (`trash`): Confirms and deletes the heading line, moving all its tasks to the top of that note.
  - **Add Task** (`+`): Inserts a task directly under that specific heading section.
- **Column Header Actions**:
  - **Add Header to Note** (`+`): Appends a new heading section to that note with heading level selection (H1, H2, H3).
  - **Rename Note** (`edit`): Renames the note title in Amplenote.
  - **Open Note in Amplenote** (`externalLink`): Navigates to the note in the main editor.
  - **Delete Note** (`trash`): Safely moves the note to Amplenote Trash with confirmation.
- **Inline `Add Header +` Card in Each Note Column**: A dedicated card at the bottom of each note column to quickly add a new heading section directly into that note.
- **`+ Add Note` card at the right end of the board**: Click to create a new note, with custom tag assignment (pre-filled with the active board's tag).

### 3. Multi-Note Project Boards (`notes`)

The third kind maps a tag where notes act as columns and all tasks inside each note are listed as cards:

- **Columns** = notes carrying the selected tag (one column per project/client note).
- **Cards** = all tasks inside that note listed flatly without heading breakdown.
- **Drag & drop** between columns moves the task to that note natively (`app.updateTask({ noteUUID })`), without touching markdown formatting.
- **Column Header Actions**: rename note (✎), delete note to Trash (🗑), or open note in Amplenote (↗).
- **`+` on a column header** inserts a task directly into the target note.
- **Inline `Add Header +` Card in Each Note Column**: Add headings directly to individual project notes from the board.
- **`+ Add Note` card at the right end of the board**: Click to create a new project/client note with customizable tags.

### Rich Card Badges & Conditional Indicators

Task cards dynamically display badges and metadata chips **only when those values are present**:

- **✓ Done Timestamp**: Displays exact completed date and time formatted to your settings (e.g. `✓ done 2026-08-22 17:05`).
- **🔥 Urgent** / **⭐ Important**: Eisenhower priority quadrant badges.
- **🎯 Task Score**: Computed Amplenote task score (e.g. `🎯 12.5`).
- **📋 Subtasks**: Displayed when a task has child subtasks (`isParent`).
- **🕒 Time Block**: Displayed when both start and end times are set (e.g. `🕒 2026-08-21 10:00-11:30`).
- **▶ Start Date** / **⏰ Due Date**: Scheduled start date or deadline timestamp.
- **🙈 Snoozed**: Displayed when a task has a future `hideUntil` snooze timestamp.
- **🔁 Repeat**: Displays recurrence frequency (e.g. `🔁 daily`, `🔁 weekly`).
- **Rich Editor Content**: Supports bold, italics, Rich Footnotes, inline images, and clickable URLs.

### Dynamic Sorting & Persisting to Note

- **🔀 Sort Tasks Cycling Button**: Click the header sort button to cycle through client-side sorting:
  - **Sort Tasks** (Source note sequence)
  - **Sort: Score** (High to low)
  - **Sort: Date** (Scheduled/start date)
  - **Sort: Important** (Eisenhower Important first)
  - **Sort: Urgent** (Eisenhower Urgent first)
  *Visual dashboard sorting is non-destructive and does not rewrite the note.*
- **💾 Save Sort**: When a sort mode is active on a Note Board, the `💾 Save Sort` button appears on the left of the sort button. Clicking it prompts for confirmation and re-arranges physical task lines inside each heading in the underlying note markdown.
- **↺ Reset Sort**: Instantly restores the dashboard view back to the natural task order.
- **🔄 Tab & All Refresh**: Clicking **Refresh Tab** or **Refresh All** pulls fresh data and automatically resets sort to natural document order so you always see the true, un-sorted note layout.

### View Toolbar Controls (Density, Empty Columns, Expand Info, Quick @ Date)

- **📐 Density Button (`Cozy` / `Compact` / `Spacious`)**: 1-click layout spacing cycler with responsive CSS custom properties:
  - **`Cozy`** (default): Streamlined, refined column padding with comfortable touch targets.
  - **`Compact`**: High-density cards, tight column widths (`clamp(230px, 18vw, 280px)`), and reduced margins for power users.
  - **`Spacious`**: Relaxed margins and wider columns for large desktop monitors.
- **👁️ Empty Button (`Empty`)**: Click to toggle between hiding and showing empty columns across all board types (**Note Boards**, **Tag Boards** with empty notes or heading sections, and **Notes Boards**). When enabled, columns and sections with 0 tasks remain visible for easy task creation (`+`).
- **ℹ️ Info Button (`Info`)**: 1-click master switch to expand or collapse inline task details (`Start At`, `End At`, `Deadline`, `Hide Until`, `Score`, `Repeat`, `Parent Note`) across all visible cards at once.
- **📅 @ Date Button (`@ Date`)**: Toggles the **Quick @ Date Mode**. When active, every task card displays a dedicated `@` button in its top-right action bar — clicking it prompts with a native Date Selector and optional Time input (e.g. `14:30` or `2:30 PM`) to schedule the exact start timestamp or clear it.

### Drag & Drop Column Reordering & Heading Persistence

- **Drag Columns Directly**: Click and drag any column header (or its `⠿` grip handle) to reorder columns visually across the board in real time.
- **💾 Save Columns**: When column order is modified, a `💾 Save Columns` button appears in the header. Clicking it prompts for confirmation and rewrites the note markdown so heading sections match your new column layout.
- **↺ Reset Columns**: Restores the board columns back to the note's original heading sequence without modifying the note.

### Drag & Drop Tab Reordering

- **Drag Tabs**: Click and drag any tab in the top tab bar to reorder your boards. The new sequence is persisted quietly in the background.

### Scrolling & Keyboard Shortcuts

- **Mouse Wheel**: Native vertical scrolling over columns and cards.
- **`Shift + Wheel`**: Horizontal scrolling across columns from anywhere on the canvas.
- **`T` / `t`**: Cycle through the 8 themes with 0ms client-side switching.
- **`/`**: Instantly focus and select the card filter search input.
- **`Esc`**: Clear search filter and blur search input.
- **Live Toast Notifications**: Non-intrusive bottom-right toast feedback for reorders, theme switches, and note updates.

### Card Context Menu (`⋯`)

Clicking the **⋯** menu on any card offers quick actions:
- **Edit task details**: Opens the full task configuration dialog.
- **Add label**: Links a note as a label (`[[Note Name]]`), rendered as a colored chip matching account tags.
- **Set start date / time**: Sets native start date and optional time.
- **Snooze / Hide Until**: Sets a date and optional time to hide the task until.
- **Schedule Time Block**: Configures start and end dates/times for calendar blocking.
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
    settings.js            # Unified JSON settings management (load, save, fallback)
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
    embedActions.js        # Command dispatch table for all embed actions (create/delete note, headers, etc.)
  ui/
    themes.js              # 8-theme registry + CSS variable palettes
    boardTemplate.js       # Full HTML document assembly (theme CSS + layout + right-end add card)
    clientScript.js        # Embed-side JS: rendering, DnD, badges, sort, section tools, right-end add button
  utils/
    html.js                # HTML escaping + script-safe JSON embedding
    prompt.js              # Prompt normalization helper
    formatTimestamp.js     # Timestamp formatting helper
test/                      # Jest suites (run: npx jest "anp-15-kanban/test") (19 suites, 213 tests)
build/
  kanban.compiled.js       # Build artifact to paste into the plugin note
```

Build with `node esbuild.js 15` from the repository root.
