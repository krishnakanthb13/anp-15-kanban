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

Settings are stored via `app.settings` / `app.setSetting` and sync across devices and notes. All values are strings.

| Setting | Purpose | Example value |
| :--- | :--- | :--- |
| `Kanban Tabs` | JSON tab configuration: which notes/tags are boarded, their order, and the active tab. Written by the plugin; edit by hand only for repair. | `{"tabs":[{"id":"tab_x","kind":"note","name":"My Board","noteUUID":"…"}],"activeTabId":"tab_x","settings":{"dateFormat":"YYYY-MM-DD"}}` |
| `Kanban Settings` | **Unified JSON Plugin Settings & View Preferences**: Persists theme, date format, empty column visibility, quick `@` date button state, card sort mode, and expanded card details across sessions, notes, and devices. | `{"theme":"light","dateFormat":"YYYY-MM-DD","showEmptyColumns":false,"quickDateEnabled":false,"sortMode":"none","expandCardInfo":false}` |

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

### Board Types: `note` vs `tag` vs `notes`

| Tab Kind | Source of Truth | Columns Represent | Cards Represent | Drag & Drop Action |
| :--- | :--- | :--- | :--- | :--- |
| **`note`** *(Single Note Board)* | **1 specific note** (`noteUUID`) | **Headings** inside that note (`# To Do`, `# In Progress`, `# Done`) | **Tasks** under each heading | Moves the task markdown line between headings in that note |
| **`tag`** *(Tag Hierarchy Board)* | **All notes with a tag** (`tag`) | **Notes** with that tag | **Tasks** grouped into **collapsible heading sections** within each note | Moves tasks across headings or across notes |
| **`notes`** *(Multi-Note Project Board)* | **All notes with a tag** (`tag`) | **Notes** with that tag | **All tasks** in each note (flat card list, no heading breakdown) | Reassigns the task from one note to another natively (`updateTask`) |

```
1. Note Board (`note`):
   [ Note Document ] ──► [ Column: # To Do ] ──► [ Card: Task 1 ]
                     ──► [ Column: # Doing ] ──► [ Card: Task 2 ]
                     ──► [ Column: # Done  ] ──► [ Card: Task 3 (completed) ]

2. Tag Board (`tag`):
   [ Tag: #projects ] ──► [ Col: Note A ] ──► [ Sec: # Backlog ] ──► [ Task 1 ]
                                          ──► [ Sec: # Done    ] ──► [ Task 2 ]
                      ──► [ Col: Note B ] ──► [ Sec: # Sprint  ] ──► [ Task 3 ]

3. Multi-Note Board (`notes`):
   [ Tag: #clients  ] ──► [ Col: Client A Note ] ──► [ Flat Task 1 ]
                                                  ──► [ Flat Task 2 ]
                      ──► [ Col: Client B Note ] ──► [ Flat Task 3 ]
```

---

### 1. Note Boards (`note`)

A note board maps one single note onto the board:

- **Columns** = the note's headings at the shallowest heading level present (H1s if the note uses H1s, etc.). Deeper sub-headings stay inside their parent column.
- **Cards** = tasks under each heading, in document order. Tasks above the first heading appear in an implicit **Unsorted** column.
- **Drag & drop** a card onto another column to move it — the task physically moves under the target heading in the note markdown.
- **Drop into the last column** to complete the task (crossed out via Amplenote's native completion). Dragging it back out reopens it. Dropping a card back into its own column is a safe no-op.
- **`+` on a column header** creates a new task at the top of that column (prompted for markdown content).
- **`+ Add Header` card at the right end of the board**: Click to instantly create a new heading column at the end of the note, with heading level selection (**H1**, **H2**, **H3**).
- **Click a card** opens the rich task editor dialog (markdown content, Important/Urgent quadrant, target note & heading section, task score, and lifecycle status).
- **`ℹ` button on a card** toggles an inline task details inspector showing all non-empty properties (Start At, End At, Deadline, Hide Until, Repeat schedule, Completed/Dismissed status, and Note link).

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

### View Toolbar Controls (Empty Columns, Expand Info, Quick @ Date)

- **👁️ Empty Button (`Empty`)**: Click to toggle between hiding and showing empty columns across all board types (**Note Boards**, **Tag Boards** with empty notes or heading sections, and **Notes Boards**). When enabled, columns and sections with 0 tasks remain visible for easy task creation (`+`).
- **ℹ️ Info Button (`Info`)**: 1-click master switch to expand or collapse inline task details (`Start At`, `End At`, `Deadline`, `Hide Until`, `Score`, `Repeat`, `Parent Note`) across all visible cards at once.
- **📅 @ Date Button (`@ Date`)**: Toggles the **Quick @ Date Mode**. When active, every task card displays a dedicated `@` button in its top-right action bar — clicking it prompts with a native Date Selector and optional Time input (e.g. `14:30` or `2:30 PM`) to schedule the exact start timestamp or clear it.

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
