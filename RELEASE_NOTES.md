## v0.0.19 (2026-08-22) — Column Adders, Tag Board Header Tools & Note Lifecycle

### 🚀 New Features & Enhancements
- **Layout Density Cycler (`Cozy` / `Compact` / `Spacious`)**: Added a tactile density button in the top toolbar to effortlessly switch between three layout spacing modes:
  - **`Cozy`** (default): Streamlined, refined column and card padding with reduced margins.
  - **`Compact`**: Ultra high-density cards, tight column widths, and minimized spacing for maximum information density.
  - **`Spacious`**: Relaxed padding and breathing room for wide displays.
- **Scroll Behavior Standards**: Mouse wheel rolls exclusively vertically, and `Shift + Wheel` rolls horizontally across board columns without cross-axis interference.
- **Flexible Column & Section Layout**: Upgraded columns to adaptive sizing with generous scroll padding and visible section cards, eliminating bottom card clipping.
- **Inline `Add Header +` Cards for Note Columns**: Each note column in Tag and Multi-Note boards now features a small, tactile `Add Header` card at the bottom of its sections list to directly create new headings inside that note without leaving the board view.
- **Heading Type / Level Selector**: When creating a new header or column, the prompt allows choosing the heading level (**H1 Large**, **H2 Medium**, or **H3 Small**), giving fine-grained control over note structure.
- **Custom Tag Assignment on Note Creation**: Creating a note from the board prompts for both title and tags (pre-filling with the active board's tag and supporting comma-separated additional tags).
- **Right-End Column Adder Placeholder**: A tactile `+ Add Header` / `+ Add Note` button at the right end of the board allows adding a new heading (Note board) or creating a new tagged note (Tag / Multi-note board) in one click.
- **Symmetrical Header Actions in Tag Tabs**: Every heading section in a Tag board note now supports full structural tools: Move Up (`chevronUp`), Move Down (`chevronDown`), Rename (`edit`), Transfer to another note/tab (`transfer`), Delete heading with task relocation (`trash`), and Create task under heading (`plus`).
- **Add Header to Note in Tag Boards**: Note columns in Tag boards now have an "Add header to this note" (`+`) tool in their column header toolbar.
- **Delete Note in Tag & Multi-Note Boards**: Added a Delete Note (`trash`) option to note columns with a safety confirmation checkbox moving the note directly to Amplenote Trash (`app.deleteNote`).

---

## v0.0.18 (2026-08-21) — Date & Time Scheduling & Task Sorting Refinements

### 🚀 New Features & Enhancements
- **Combined Date & Time Scheduling**: The `@` quick-date button and card action dialogs now provide both a visual date picker and an optional time field (e.g. `14:30` or `2:30 PM`), combining them into precise UTC timestamps for native Amplenote calendar time-blocking.
- **Tactile Sort Tasks Button**: Renamed the default sorting state to `Sort Tasks` and positioned `💾 Save Sort` & `↺ Reset Sort` to the left of the sort button so expanding controls never shift the button under your cursor.
- **Date Dialog 1970 Epoch Fix**: Passed raw numeric epoch seconds directly to Amplenote's native `{ type: "date" }` prompt inputs so existing task dates prefill accurately instead of showing Jan 1 1970.

---

## v0.0.16 (2026-08-21) — View Controls, Ergonomic Layout & Sync Fixes

### 🚀 New Features & Enhancements
- **Tactile Sort Cycling Button**: Click `#kb-sort-btn` in the header to cycle through client-side sorting modes (`Sort Tasks` ➔ `Sort: Score` ➔ `Sort: Date` ➔ `Sort: Important` ➔ `Sort: Urgent`), featuring active state highlighting and 1-click markdown persistence (`💾 Save Sort`).
- **View Toolbar Master Controls**:
  - **👁️ Show/Hide Empty Columns (`Empty`)**: Instantly toggle empty column/header visibility.
  - **ℹ️ Expand/Collapse All Info (`Info`)**: Master 1-click toggle to reveal or hide inline metadata (Start/End date & time, Deadline, Snooze/Hide Until, Score, Recurrence, and Parent Note) across all cards simultaneously.
  - **📅 Quick Date Mode (`@ Date`)**: Toggles dedicated `@` quick-date action buttons directly on cards for rapid date & time scheduling without opening context menus.
- **Ergonomic Column Headers & Micro-Toolbars**: Moved the task count badge (`.kb-count`) to the far right alongside `+`, allocating full flex width to column titles to prevent premature text truncation. Tightened hover toolbars into compact floating micro-palettes across tabs, headers, and cards.
- **Two-Step Tab Creation Wizard**: Simplified the "New Tab" prompt into a guided 2-step process (choose board type first, then configure only that specific selection) to eliminate cognitive clutter.

### 🐛 Bug Fixes & Reliability
- **Universal Date Parsing & Local Timezone Alignment**: Added `formatLocalIsoDate` to eliminate UTC date shifts in date picker dialogs and `parseDateToUnixSeconds` to reliably normalize epoch seconds, milliseconds, numeric strings, and ISO dates when writing to Amplenote servers.
- **Reliable Task Creation in Columns**: Fixed heading relocation when clicking column `+` buttons by pre-resolving destination heading names before insertion, ensuring tasks never get misplaced by line-number shifts.

---

## v0.0.15 (2026-08-21) — UI/UX Pro Max & Typography Polish

### 🚀 New Features & Enhancements
- **Google Fonts Typography**: Loaded **Inter** (wght@400;500;600;700) and **JetBrains Mono** (wght@500;600) with calibrated line-heights, letter-spacing, and smooth font antialiasing.
- **Tactile Micro-Interactions**: Smooth hover elevations (`translateY(-2px)` + soft drop shadows), button press scaling (`scale(0.98)`), animated card drag tilt, and pulsing WIP limit warning indicators.
- **Glassmorphic Sticky Header**: Subtle backdrop blur (`backdrop-filter: blur(8px)`) with sticky top positioning and expanded focus glow on search.
- **Accessibility & Motion Compliance**: Integrated WCAG `:focus-visible` focus rings for keyboard navigation and full `@media (prefers-reduced-motion: reduce)` support.
- **Mobile & Narrow Layout Responsiveness**: Added `@media (max-width: 768px)` breakpoints for compact search and horizontal scrolling columns.

---

## v0.0.13 (2026-08-21) — Notes Boards

### 🚀 New Features
- **Notes Boards (third board kind)**: A tag's notes become columns and the tasks inside each note become cards — perfect for "one note per project" workflows. Dragging a card between columns moves the task to that note natively; `+` inserts a task into the note; hover tools rename it.

---

## v0.0.12 (2026-08-21) — Labels, Search & Card Extras

### 🚀 New Features
- **Card Labels**: Attach note links (`[[Note Name]]`) to any task from a card's ⋯ menu. Labels render as chips on the card and are color-coded when the label name matches one of your tags; multiple labels supported.
- **Start Dates**: Set or clear a task's native start date from a date picker in the card menu.
- **Create Note from Card**: Turn a card into a new note with one action — the note is created and linked back to the task, which stays in place (non-destructive).
- **Two-Tier Search**: The header search box filters the active board instantly as you type (titles, content, labels, tags); pressing Enter runs a full-text search across all your notes with a pick-to-open result list.
- **Cross-Tab Column Move**: Move an entire column — heading plus tasks — to another note board from its header tools. Confirmation-gated, and the transfer inserts into the target before removing from the source so data can only duplicate visibly, never vanish.

---

## v0.0.11 (2026-08-21) — Multi-Tab Management

### 🚀 New Features
- **Tab Management UI**: A **+ New tab** button adds any board — pick *note board* (then a note) or *tag board* (then a tag). Hover tabs to reorder (← / →) or close them (✕); closing only removes the board entry, never the underlying note or tag.
- **Date Format Setting**: Click the 📅 header button to set the card date-chip format using `YYYY` / `MM` / `DD` / `MMM` tokens (e.g. `DD MMM YYYY`); the choice persists with your tab configuration.
- **Sync Progress Bar**: The ⇉ All refresh now shows a progress bar while boards are being re-pulled.

---

## v0.0.10 (2026-08-21) — Tag Boards

### 🚀 New Features
- **Tag Boards**: The second board kind — columns are a tag's immediate sub-tags (plus a synthetic **No sub-tag** column) and cards are the notes carrying the tag. Data is queried live on every render, so notes tagged anywhere in Amplenote appear automatically.
- **Retag by Drag & Drop**: Dropping a note card on another column swaps its sub-tag; dropping on *No sub-tag* clears it. The base tag always stays.
- **Open Notes from Cards**: Clicking a tag-board card opens that note in the main editor; `+` creates a new note directly in the target column's sub-tag.
- **Tag Color Markers**: Column headers show each sub-tag's color as a dot; tab-kind icons (📄 note / 🏷 tag) keep board types legible at a glance.

---

## v0.0.9 (2026-08-21) — Rich Cards & Column Management

### 🚀 New Features
- **Rich Card Rendering**: Card bodies render with Amplenote's own editor markup (`htmlFromContent`) — Rich Footnotes, links, checkboxes, and formatting behave exactly as they do in notes, with clickable web URLs. Cards fall back to a clean plain-text preview if rendering fails.
- **Card Images**: The first inline image in a task's content is embedded at the bottom of its card (lazy-loaded).
- **Column Management**: Hover tools on every note-board column — move left/right, rename, and delete. Heading order and text stay in sync with the underlying note; deleting requires an explicit confirmation and moves its tasks to the top of the note; the last remaining column cannot be deleted.
- **WIP Limits**: Per-column Work-In-Progress limits (click the count chip to set/clear). Past the limit, the chip turns red showing `count / limit` — warnings only, drops are never blocked.

---

## v0.0.8 (2026-08-21) — Rebuild Milestone 1 (Phases 0–1)

### 🚀 New Features
- **Full-Screen Board App**: The board now lives in a persistent, addressable plugin section (`app.openEmbed`) instead of an inline note embed — open it once via the new **Open Kanban Board** app option and keep it docked like an app.
- **Note Boards**: A note's headings become columns (at the shallowest heading level) and its tasks become cards, mapped by a new markdown indexing layer. Tasks above the first heading surface in an implicit **Unsorted** column.
- **Drag & Drop**: Drag cards between columns to physically relocate tasks under the target heading in the note.
- **Drop-to-Done**: Dropping a card into the last column completes the task (native strikethrough); dragging it back out reopens it.
- **Quick Card Creation**: A `+` button on every column creates a task directly at the top of that column.
- **Raw Markdown Editing**: Click any card to edit its markdown in place; changes write back to the task.
- **Refresh Tab / Refresh All**: Manual re-pull controls for single-tab or full-board sync, with a progress indicator.
- **8 Cycling Themes**: Curated light/dark palettes (Clean Daylight, Sepia, Matcha, Nord Frost, Midnight Slate, Nord Arctic, Dracula Neo, Emerald Forest) with instant 0ms switching, `T` keyboard shortcut, and cross-device persistence.
- **Synced Configuration**: Tab configuration persists through account settings and syncs across devices.

### ⚠️ Breaking Changes
- The legacy tag-filtered board (notes-as-columns), the `Tagged!` launcher, `Kanban Filter Tag`, `Toggle Sort`, and `Current_Note_UUID [Do not Edit!]` settings have been removed as part of a ground-up rewrite.
- Until tab management UI arrives (Phase 4), tabs are configured via the `Kanban Tabs` setting; with no tabs configured the board shows a demo board.

---

## v0.0.1 (2026-07-11)

### 🚀 New Features
- **Visual Kanban Board**: First official release! Converts tagged notes into an interactive Kanban board directly within Amplenote.
- **In-Place Task Management**: Create, edit, move, and update tasks across columns (notes) and headers without leaving the board view.
- **Automated Categorization**: Sort tasks into Pending, Completed, and Dismissed automatically.
- **Dynamic Sorting**: Reorder tasks in real-time by Start Date, Score, Importance, or Urgency.
- **Note Integration**: Add new columns by creating new notes seamlessly from the UI.
