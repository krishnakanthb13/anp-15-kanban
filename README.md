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
- **0ms Tab Navigation & Reordering**: Click `◀` or `▶` arrows to instantly swap tab chips in-place with **zero screen flicker**, or drag-and-drop tabs to reorder.
- **Instant Tab Closing**: Closing a tab removes it immediately in local state and smoothly switches to the adjacent board without reloading the embed.
- **Zero-Flicker Card & Column Management**: All micro-actions (editing task details, setting dates, toggling completion, renaming/deleting columns, setting WIP limits) update the board in-place via smooth in-memory data binding without iframe flashes.
- **Verified Feedback & Auto-Rollback**: Operations display green confirmation toasts (`✓`) only after the server write is confirmed; if a write fails, a red warning toast (`⚠️`) is shown and the board automatically re-syncs to reflect the true note state.
- **Sequential Write Lock (`withNoteLock`)**: Rapid successive actions (e.g. clicking move arrows repeatedly) are processed in serial order to eliminate markdown write collisions and race conditions.

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
  - **Auto-Completion & Dedicated Completed Column**: In single note boards, all completed tasks are automatically aggregated into a dedicated **"Completed"** column at the far right of the board. Dragging any active task into the dedicated "Completed" column marks it complete (`completedAt: timestamp`). Dragging a completed task out of "Completed" into any heading reopens the task (`completedAt: null`) directly under that heading in your note. Moving tasks between markdown headings (including `# Done`, `# To Do`, `# In Progress`) preserves active task state and moves the task line under that heading without closing it (configurable via `AUTO_COMPLETE_ON_DONE_HEADER`).
- **Columns**: Hovering a column header shows a vertical drop line in the board gap to the left or right, allowing seamless column reordering.
- **Tabs**: Hovering a tab displays a vertical accent line on the left or right edge, enabling instant tab bar reordering.

### Task States & Lifecycle Handling

Amplenote tasks carry multiple lifecycle states that the Kanban plugin maps natively onto columns and visual badges:

| Task State | Amplenote Native Behavior | Kanban Board Representation |
| :--- | :--- | :--- |
| **Active Tasks** (`[ ]`) | Sit physically under a heading in the note markdown. | Displayed in their **exact heading column** in 1-to-1 document line order. |
| **Completed Tasks** (`completedAt` or `[x]`) | Amplenote automatically moves them to the end of the note inside `<details><summary>Completed tasks</summary>`. | **Aggregated into the dedicated "Completed" column** at the far right of the board, keeping heading columns 100% focused on active work. |
| **Dismissed / Archived Tasks** (`dismissedAt`) | Crossed out / dismissed at the note level. | **Placed in the "Completed" column** with strikethrough styling and a `✕ [timestamp]` chip. |
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

- **Columns** = all headings in the note (`# H1`, `## H2`, `### H3`, etc.) are recognized as distinct columns with clean color-coded level indicator accents (H1 = Theme Accent, H2 = Purple, H3 = Cyan/Teal, H4+ = Emerald) preserving maximum horizontal space for title text.
- **Cards** = tasks under each heading, in document order. Tasks above the first heading appear in an implicit **Unsorted** column.
- **Parent & Child Task Hierarchy**: Indented subtasks (4-space standard) render with progressive left tree lines and depth-aware labels (`↳ Child Task`, `↳↳ Child Task`), while containing tasks display `📋 Parent Task`.
- **Clean Score Badges**: Task score badges (`🎯 Score`) are cleanly hidden for default or zero-score tasks (`score: 1.0` and `score: 0.0`) and only display when a custom score is assigned.
- **Drag & Drop Reordering**:
  - **Cards**: Drag and drop cards across or within columns to physically reposition tasks under target headings in note markdown.
  - **Columns**: Freely drag and drop column headers across any number of positions across the entire board (with zero screen flickering and automatic guardrails protecting `Unsorted` and `Completed`).
- **Column Movement Guardrails & Boundary Protection**:
  - **Unsorted Column Boundary**: When an `Unsorted` pseudo-column is present (tasks exist at the top of the note before any heading), it remains pinned at the very first position. Regular headings cannot be moved before `Unsorted` (via drag-and-drop or `◀` Move left); attempting to do so triggers a notification: *"Cannot move column before Unsorted"*. If no `Unsorted` tasks exist, any regular heading can freely be moved to the first position.
  - **Completed Column Boundary**: When a `Completed` column is present (completed tasks exist in the note), it remains pinned at the end. Regular headings cannot be moved after `Completed` (via drag-and-drop or `▶` Move right); attempting to do so triggers a notification: *"Cannot move column after Completed"*. If no completed tasks exist, any regular heading can freely be moved to the last position.
  - **Pinned Column Immutability**: Neither `Unsorted` nor `Completed` columns can be dragged or reordered. Attempting to move either triggers a notification: *"Moving Unsorted/Completed column is not allowed"*.
- **Drop into the Completed / Done column** to complete the task (crossed out via Amplenote's native completion). Dragging it back out reopens it. Dropping a card back into its own column is a safe no-op.
- **Column Management**:
  - **Reorder Columns** (`chevronLeft` / `chevronRight` / Drag & Drop): Reorders headings directly in note markdown with zero screen flicker, honoring Unsorted and Completed boundary rules.
  - **Delete Column** (`trash`): Safely deletes the heading and migrates all its existing tasks into the **previous column heading** (or next remaining heading), preventing tasks from spilling into Unsorted.
  - **Rename Column** (`edit`): Renames the heading text in note markdown.
  - **Move Column to Tab** (`transfer`): Moves heading and its tasks to another note board tab.
  - **Open Note in Amplenote** (`externalLink`): Directly navigates to the source note in Amplenote. Also available via the top toolbar **`↗ Open Note`** button and the tab chip.
- **`+` on a column header (Note Board)**: Creates a new task directly under that specific heading, placed immediately below the header line in markdown and at the top of that column.
- **`+ Add Task` card at the right end of the board**: Click to instantly add a task at the top of the note (automatically placed in the **Unsorted** column).
- **`+ Add Header` card at the right end of the board**: Click to create a new heading column at the end of the note, with heading level selection (**H1**, **H2**, **H3**).
- **Click a card** opens the dedicated task editor dialog:
  - **On Active Tasks**: Full Task Details modal (markdown content, Important/Urgent quadrants, move to note / heading dropdown, task score, and optional status change: `Started`, `Completed`, `Dismissed`).
  - **On Completed Tasks**: Specialized Completed Details modal (markdown content, target heading dropdown for where to relocate on reopen, optional status change: `Reopen / Mark Active`, `Dismiss / Archive`, and Important/Urgent flags).
- **`ℹ` button on a card** toggles an inline task details inspector showing all non-empty properties (Start At, End At, Deadline, Hide Until, Repeat schedule, Completed/Dismissed status, and Note link).
- **`...` 3-dots button on a card** opens a context-aware action menu:
  - **Active Tasks**: `Mark as completed`, `Edit details`, `Add label`, `Set start date/time`, `Snooze / Hide Until`, `Schedule Time Block`, `Create note from card` (prompts for title, creates a fresh note with no tags, and embeds a clickable note link `[Title](https://www.amplenote.com/notes/{uuid})`).
  - **Completed Tasks**: `Reopen task (mark active)`, `Dismiss / Archive task`, `Edit details`, `Add label`, `Create note from card`.
- **Note Links & Navigation**: Clicking any linked Amplenote note inside a task navigates the main Amplenote application window directly to that note.
- **Outside Links Protection**: External web links inside cards are safely blocked within the plugin embed and display a friendly bottom-right toast notification (*"Outside links do not work here."*).
- **Rich Editor Content & Clean Images**: Supports bold, italics, Rich Footnotes, and embedded images (with automatic column fitting, full-resolution glassmorphic Lightbox zoom preview on click, de-duplication, and clean stripping of `open_in_new` markup artifacts).

### 2. Tag Boards (`tag`)

The second kind groups notes by an Amplenote tag:

- **Columns** = all notes that carry that tag (e.g. `#projects`, `#clients`). Column titles display full note names and tag color badges matching your Amplenote account palette.
- **Collapsible Heading Sections (Complete Note Symmetry)**: Within each note column, sections strictly mirror the note's structural layout:
  1. **Unsorted Section**: Automatically captures active tasks above the first heading in that note.
  2. **Active Heading Sections**: Each heading in the note renders as an individual collapsible section (`▼ / ▶`) with color-coded level indicators (`H1`, `H2`, `H3`), section title, card count, and action buttons.
  3. **Completed Section**: Gathers all completed/dismissed tasks from the note into a pinned bottom section. Dragging a card into this section marks it completed; dragging it back out reopens it.
- **Contextual Task Creation (`+`)**:
  - **Beside the Note Title (`+` on Note Column Header)**: Creates a new task at the very start of the note (above all headings), automatically landing under **Unsorted**.
  - **Beside a Heading Section (`+` on Section Header)**: Inserts a task directly under that specific heading, placed right below the header line in the note's markdown and positioned at the top of that section's cards.
- **Full Header Management on Every Section**:
  - **Move Header Up / Down** (`chevronUp` / `chevronDown`): Reorders the heading in the note's markdown with instant update and zero screen flash (with Unsorted/Completed boundary guardrails).
  - **Rename Header** (`edit`): Renames the heading line in place.
  - **Transfer Header** (`transfer`): Moves the heading and all its tasks to another note under the same tag or another note-board tab.
  - **Delete Header** (`trash`): Confirms and deletes the heading line, safely relocating all its tasks to the previous heading in that note.
  - **Add Task** (`+`): Inserts a task directly under that specific heading section.
- **Column Header Actions**:
  - **Add Task to Note (`+`)**: Inserts a task at the top of the note (placed under Unsorted).
  - **Add Header to Note** (`plus` tool): Appends a new heading section to that note with heading level selection (H1, H2, H3).
  - **Rename Note** (`edit`): Renames the note title in Amplenote.
  - **Open Note in Amplenote** (`externalLink`): Navigates to the note in the main editor.
  - **Delete Note** (`trash`): Safely moves the note to Amplenote Trash with confirmation.
- **Inline `Add Header +` Card in Each Note Column**: A dedicated card at the bottom of each note column to quickly add a new heading section directly into that note.
  - **Delete Note** (`trash`): Safely moves the note to Amplenote Trash with confirmation.
- **Inline `Add Header +` Card in Each Note Column**: A dedicated card at the bottom of each note column to quickly add a new heading section directly into that note.
- **`+ Add Note` card at the right end of the board**: Click to create a new note with native search & autocomplete dropdown tag selection (capped at 10 tags, pre-filled with the active board's tag).

### 3. Multi-Note Project Boards (`notes`)

The third kind maps a tag where notes act as columns and active tasks inside each note are listed as cards:

- **Columns** = notes carrying the selected tag (one column per project/client note).
- **Cards** = all **active tasks** inside that note listed flatly without heading breakdown (completed tasks are omitted to keep project pipelines clean and actionable).
- **Drag & drop** between columns moves the task to that note natively (`app.updateTask({ noteUUID })`), without touching markdown formatting.
- **Column Header Actions**:
  - **Add Task to Note (`+`)**: Inserts a task at the start of the note (top of the column).
  - **Rename Note** (`edit`): Renames the note title.
  - **Open Note in Amplenote** (`externalLink`): Navigates to the note in Amplenote.
  - **Delete Note** (`trash`): Moves note to Trash with confirmation.
- **Inline `Add Header +` Card in Each Note Column**: Add headings directly to individual project notes from the board.
- **`+ Add Note` card at the right end of the board**: Click to create a new project/client note with native search & autocomplete tag selection (up to 10 tags).

### Board Navigation (`↗ Open Note` & `↗ Open Tag`)

- **Dynamic Toolbar Button**: The top toolbar button dynamically adapts to the active board:
  - **Note Boards**: Displays **`↗ Open Note`**, navigating directly to the note in Amplenote.
  - **Tag & Notes Boards**: Displays **`↗ Open Tag`**, navigating directly to `https://www.amplenote.com/notes?tag={tag}` in Amplenote.
- **Tab Chip Tools**: Hovering over any tab chip provides a dedicated **`↗`** tool to open that specific note or tag immediately.

### Rich Card Badges & Conditional Indicators

Task cards dynamically display badges and metadata chips **only when those values are present**:

- **✓ Completed / ✕ Dismissed Timestamp**: Displays exact completed (`✓ 2026-08-22 17:05`) or dismissed (`✕ 2026-08-22 17:05`) timestamp formatted to your settings.
- **🔥 Urgent** / **⭐ Important**: Eisenhower priority quadrant badges.
- **🎯 Task Score**: Computed Amplenote task score (e.g. `🎯 12.5`), shown only when modified and different from default/zero (`1.0` or `0.0`).
- **📋 Parent Task**: Displayed when a task has child subtasks (`isParent`).
- **↳ Child Task**: Displayed when a task is an indented child task (with `↳↳ Child Task` for nested levels and a left accent border).
- **🏷️ Tag & Label Chips**: Inline `#tag` and `#parent/subtag` hashtags, alongside `[[Note Name]]` labels, rendered as color-coordinated chips matching your Amplenote account palette.
- **🕒 Time Block**: Displayed when both start and end times are set (e.g. `🕒 2026-08-21 10:00-11:30`).
- **▶ Start Date & Time** / **⏰ Due Date**: Scheduled start date and optional time (e.g. `▶ 2026-08-24 14:30`), or deadline timestamp.
- **🙈 Snoozed**: Displayed when a task has a future `hideUntil` snooze timestamp.
- **🔁 Repeat**: Displays recurrence frequency (e.g. `🔁 daily`, `🔁 weekly`).
- **Rich Editor Content & Interactive Footnotes**: Supports bold, italics, inline images (with 1-click Lightbox zoom), clickable Amplenote note links, and **Interactive Rich Footnotes** (with 1-click `📌 {text}` toast alerts and dotted accent styling).

### Dynamic Sorting & Persisting to Note

- **🔀 Sort Tasks Cycling Button**: Click the header sort button to cycle through client-side sorting:
  - **Sort Tasks** (Source note sequence)
  - **Sort: Score** (High to low)
  - **Sort: Date** (Scheduled/start date)
  - **Sort: Important** (Eisenhower Important first)
  - **Sort: Urgent** (Eisenhower Urgent first)
  *Visual dashboard sorting is non-destructive and does not rewrite the note.*
- **💾 Save Sort**: When a sort mode is active on a Note Board, the `💾 Save Sort` button appears on the left of the sort button. Clicking it prompts for confirmation and re-arranges physical task lines inside each heading in the underlying note markdown for the **active tab's note only** (leaving other tabs and notes completely untouched).
- **↺ Reset Sort**: Instantly restores the dashboard view back to the natural task order.
- **🔄 Tab & All Refresh**: Clicking **Refresh Tab** or **Refresh All** animates the theme-adaptive progress bar and automatically resets sort to natural document order.

### View Toolbar Controls (Density, Empty Columns, Expand Info, Quick @ Date, Search & Clear)

- **🔍 Search & 1-Click Clear (`✕`)**:
  - Type any keyword into the top search bar to filter cards in real time across all visible columns.
  - An interactive circular **`✕` clear button** appears when text is present — clicking it (or pressing `Escape`) immediately clears the search and restores the full board view with zero lag.
  - The keyboard shortcut indicator (`/`) dynamically toggles with the `✕` button.
  - Pressing `Enter` triggers Amplenote's global account search modal.
- **📐 Density Button (`Cozy` / `Compact` / `Spacious`)**: 1-click layout spacing cycler with responsive CSS custom properties:
  - **`Cozy`** (default): Streamlined, refined column padding with comfortable touch targets.
  - **`Compact`**: High-density cards, tight column widths (`clamp(230px, 18vw, 280px)`), and reduced margins for power users.
  - **`Spacious`**: Relaxed margins and wider columns for large desktop monitors.
- **👁️ Empty Button (`Empty`)**: Click to toggle between hiding and showing empty columns across all board types (**Note Boards**, **Tag Boards** with empty notes or heading sections, and **Notes Boards**). When enabled, columns and sections with 0 tasks remain visible for easy task creation (`+`).
- **ℹ️ Info Button (`Info`)**: 1-click master switch to expand or collapse inline task details (`Start At`, `End At`, `Deadline`, `Hide Until`, `Score`, `Repeat`, `Parent Note`) across all visible cards at once.
- **📅 @ Date Button (`@ Date`)**: Toggles the **Quick @ Date Mode**. When active, every task card displays a dedicated `@` button in its top-right action bar — clicking it prompts with a native Date Selector and optional Time input (e.g. `14:30` or `2:30 PM`) to schedule the exact start timestamp or clear it.
- **⚡ Zero-Flicker Date Format Configuration**: Click the Date Format button (`YYYY-MM-DD`) to customize card date tokens (e.g. `DD MMM YYYY`). Updates apply in-place across all card date chips without reloading or flickering the iframe.
- **🌈 Theme-Adaptive Sync Progress Bar**: The progress bar dynamically inherits your active theme's accent color gradient and ambient glow (`box-shadow: 0 0 8px var(--kb-accent)`), smoothly animating during single-tab and all-tab synchronizations.

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
- **`Esc`**: Clear search filter, restore full board, and blur search input.
- **Live Toast Notifications**: Non-intrusive bottom-right feedback for theme changes, density/view toggles, sorting, column reordering, guardrail alerts, and note synchronization.

### Toast Notification System

The Kanban board provides non-blocking, glassmorphic toast notifications in the bottom-right corner for visual feedback across actions:

| Category | Trigger Event | Notification Message |
| :--- | :--- | :--- |
| **🎨 Themes & View Options** | Cycle Theme (`T` key or 🎨 button) | `Theme: [Theme Name]` (e.g. `Theme: Clean Daylight`, `Theme: Dracula Neo`) |
| | Cycle Density (Density button) | `Density: [Compact / Cozy / Spacious]` |
| | Toggle Empty Columns (Empty button) | `Showing all columns (including empty)` / `Hiding empty columns` |
| | Toggle Card Info (Info button) | `Expanded all task details` / `Collapsed all task details` |
| | Toggle Quick Date (Date button) | `Quick @ date buttons enabled on cards` / `Quick @ date buttons disabled` |
| | Cycle Sort Mode (Sort Tasks button) | `Sorted by [Score / Urgency / Date / etc.]` |
| | Reset Sort to natural order | `Reset to default task order` |
| **🔄 Sync & Tabs** | Sync Active Tab (Tab sync icon) | `✓ Tab refreshed (default order)` |
| | Sync All Tabs (All sync icon) | `✓ All boards refreshed (default order)` |
| | Reorder Tabs (Drag-and-drop / Arrows) | `Tab reordered` / `Tab moved` |
| | Close Tab (`×` icon) | `Board closed` |
| **📋 Columns & Headers** | Reorder Columns (Drag-and-drop) | `Column reordered` |
| | Create Column / Note (`+` button) | `✓ Column created` / `✓ Note created` |
| | Rename Column / Note (pencil icon) | `✓ Column renamed` / `✓ Note renamed` |
| | Delete Column / Note (trash icon) | `✓ Column deleted` / `Note moved to Trash` |
| | Move Column Left / Right (`‹` / `›` tools) | `✓ Column moved left` / `✓ Column moved right` |
| | Move Section Up / Down (Tag boards) | `✓ Header moved up` / `✓ Header moved down` |
| | Transfer Column to Another Board | `✓ Column moved` |
| | Column Movement Guardrails | `ℹ️ Cannot move column before Unsorted`<br>`ℹ️ Cannot move column after Completed`<br>`ℹ️ Column is already at the first/last position` |
| **📝 Tasks & Context Menu** | Task Creation (`+` button on column/section) | `✓ Task added` |
| | Edit Task Details (Task details dialog) | `✓ Task updated` |
| | Drag to Completed / Active column | `✓ Task completed` / `✓ Task reopened` |
| | Card Menu (`⋯`): Complete / Reopen | `✓ Task completed` / `✓ Task reopened` |
| | Card Menu (`⋯`): Dismiss / Archive | `Task dismissed` |
| | Card Menu (`⋯`): Add Label | `✓ Label added` |
| | Card Menu (`⋯`): Set Date / Timeblock | `✓ Date updated` / `✓ Timeblock scheduled` |
| | Card Menu (`⋯`): Snooze / Hide Until | `✓ Task snoozed` |
| | Card Menu (`⋯`): Create Note from Card | `✓ Note created from card` |
| | Click External Web Link in Card | `Outside links do not work here.` |
| | Note Sync / API Errors | `⚠️ Action could not be completed` / `⚠️ Failed to save changes to note` |

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
test/                      # Jest suites (run: node --experimental-vm-modules node_modules/jest/bin/jest.js anp-15-kanban) (20 suites, 256 tests)
build/
  kanban.compiled.js       # Build artifact to paste into the plugin note
```

Build with `node esbuild.js 15` from the repository root.
