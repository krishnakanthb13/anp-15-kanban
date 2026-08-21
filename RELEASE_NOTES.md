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
