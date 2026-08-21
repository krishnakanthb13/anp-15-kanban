## v0.0.8 (2026-08-21) — Rebuild Milestone 1 (Phases 0–1)

### 🚀 New Features
- **Full-Screen Board App**: The board now lives in a persistent, addressable plugin section (`app.openEmbed`) instead of an inline note embed — open it once via the new **Open Kanban Board** app option and keep it docked like an app.
- **Note Boards**: A note's headings become columns (at the shallowest heading level) and its tasks become cards, mapped by a new markdown indexing layer. Tasks above the first heading surface in an implicit **Unsorted** column.
- **Drag & Drop**: Drag cards between columns to physically relocate tasks under the target heading in the note.
- **Drop-to-Done**: Dropping a card into the last column completes the task (native strikethrough); dragging it back out reopens it.
- **Quick Card Creation**: A `+` button on every column creates a task directly at the top of that column.
- **Raw Markdown Editing**: Click any card to edit its markdown in place; changes write back to the underlying task.
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
