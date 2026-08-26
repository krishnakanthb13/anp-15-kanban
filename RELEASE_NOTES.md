## v0.0.40

### 🚀 Enhancements & UX Streamlining
- **Native Tag Search & Dropdown for Note Creation in Tag Boards**:
  - Upgraded the **"Create Note in Tag"** prompt (`+ Add Note` column) to use the native Amplenote `type: "tags"` input with search, autocomplete dropdown, and a limit of 10 tags.
  - Added robust tag parsing (`normalizeTagList`) supporting both array of tags and formatted comma/space-delimited inputs.

## v0.0.38

### 🚀 Enhancements & UX Streamlining
- **Context-Adaptive Task Details Modal**:
  - Clicking an active task opens the full **"Edit Task Details"** dialog (content markdown, Important, Urgent, Move to Note, Move to Section, Score, and optional Status Change).
  - Clicking a completed task opens the **"Completed Task Details"** dialog (content markdown, Relocate on Reopen, optional Status Change, Important, and Urgent).
  - Client state (`card.completedAt`, `card.completed`, `.kb-card-done`) is passed seamlessly in `editCard`, `cardMenu`, and `quickSetDate` payloads to ensure the correct dialog branch is consistently opened even before server round-trips.
- **Simplified Status Action Options**:
  - Removed redundant *"Keep active"* and *"Keep completed"* radio items from task modals.
  - Introduced a clean `Change Status (optional)` dropdown defaulting to `-- None (keep status) --`, allowing users to edit text and metadata without unintended status modifications.
- **Cross-Note Migration in Edit Modal**:
  - Selecting a different note in the *"Move to Note"* picker cleanly removes the task line from the source note and places it into the target note's designated section (or unsorted) without creating duplicate lines.
  - **Visual Presentation of Dismissed / Archived Tasks**:
  - Dismissed tasks (`task.dismissedAt`) now render with the native **`✕` cross icon**: `✕ {timestamp}` (e.g. `✕ 24 Aug 18:35`), mirroring completed tasks (`✓ {timestamp}`).
  - Removed the redundant `"done "` prefix from timestamp formats across completed and dismissed task chips.
  - Tasks marked dismissed automatically receive `.kb-card-done` muted strikethrough styling and are routed into the dedicated **Completed / Archive** column.
  - Client interaction payloads (`editCard`, `cardMenu`, `quickSetDate`) now check `card.dismissedAt` alongside `card.completedAt` to ensure full state continuity.
- **Start Date & Time Timestamp Formatting**:
  - Tasks with scheduled start dates and times now render both the date and time on their metadata chip: `▶ {date} {time}` (e.g. `▶ 24 Aug 14:30`), while date-only tasks continue to render cleanly as `▶ {date}`.
  - Applied adaptive time rendering to `deadline` and `hideUntil` chips as well.
- **3-Dot Card Menu Note Linking & Sequence Streamlining**:
  - Replaced legacy wiki-link label insertion with direct **"Add note link"** picker: selecting an existing note appends a clickable markdown link `[Note Name](https://www.amplenote.com/notes/{uuid})` to the task content (without duplicating if already present).
  - Clicking the note link on any card navigates directly to that note in Amplenote.
  - Positioned **"Add note link"** directly above **"Create note from card"** for intuitive note-related grouping in the card action palette.
- **Interactive Rich Footnote Click Notifications**:
  - Tasks containing Amplenote Rich Footnotes (`[Note][^1]` and `[^1]: [Note]()\n\n message`) now automatically extract footnote bodies into `card.footnotes`.
  - **1-Click Toast Notification**: Clicking a Rich Footnote link displays a toast alert with the full footnote content: `📌 {footnoteText}`.
  - **Dotted Underline Styling**: Rich Footnote links receive subtle `.kb-rich-footnote` dotted accent styling and a `pointer` cursor.
  - **Clean Title Previews**: `plainPreview` strips trailing footnote definition blocks and footnote markers to keep card title previews clutter-free.

## v0.0.37

### 🐛 Bug Fixes & Stability
- **Tag Tab Header Creation & Live Viewer Update**:
  - `+ Add Header` cards inside Tag board columns now correctly bind through `handlePluginResult`, updating the in-memory board snapshot instantly without reloading the embed.
  - Adding a new heading automatically activates `showEmptyColumns` (`showEmpty: true`) so newly created empty headers are immediately visible in the viewer.
- **Notes Tab Column Streamlining**:
  - Removed the redundant `+ Add Header` card from the bottom of columns in the Notes Tab (Multi-Note Board), keeping the view focused purely on note-level task columns.
- **Notes Tab & Heading-Free Note Task Placement**:
  - `moveTaskToColumn` now supports notes with zero markdown headings, enabling cards in flat project notes (and Notes tabs) to be positioned before/after any target card or placed at the top/bottom.
  - `handleMoveCard` ensures relative placement (`targetCardId` + `position: before/after`) is executed across all Notes tab workflows.

## v0.0.36

### 🚀 New Features & Enhancements
- **Complete Glassmorphic Toast Notification System**:
  - Wired live, non-blocking toast notifications in the bottom-right viewport across all user operations:
    - **Task creation & editing**: `✓ Task added`, `✓ Task updated`.
    - **Card context menu (`⋯`)**: `✓ Task completed`, `✓ Task reopened`, `Task dismissed`, `✓ Label added`, `✓ Date updated`, `✓ Timeblock scheduled`, `✓ Task snoozed`, `✓ Note created from card`.
    - **Column & note lifecycle**: `✓ Column created`, `✓ Note created`, `✓ Column renamed`, `✓ Note renamed`, `✓ Column deleted`, `Note moved to Trash`, `✓ Column moved`.
    - **Tab operations**: `Tab moved`, `Board closed`.
    - **Drag & drop status updates**: `✓ Task completed` / `✓ Task reopened`.
  - Silent on cancel (avoids noise when dismissing dialogs or pressing Escape).

### 🐛 Bug Fixes & Stability
- **Fixed Task Duplication on Cross-Note Drag & Drop**:
  - Eliminated redundant `app.insertTask` calls when moving cards between different notes/tabs in Tag and Multi-Note boards.
  - Spliced transferred tasks directly under destination headings via `moveTaskToColumn`, preventing duplicate tasks from lingering at the top of the destination note.
- **Top-Level Embed Error Boundary & Service Worker Immunity**:
  - Wrapped `renderEmbed(app)` in a top-level error boundary returning valid fallback HTML, preventing Service Worker `TypeError: Failed to convert value to 'Response'` promise rejection crashes on missing notes.
  - Normalized noteUUID parameters to handle both string UUIDs and `{ uuid }` objects cleanly.
  - Hardened note creation with resilient fallback tags.

## v0.0.34

### 🚀 New Features & Enhancements
- **Honest Feedback, Verified State Confirmation & Auto-Rollback**:
  - Positive toasts (`✓ Column moved left`, `✓ Task added`) are shown only after the backend confirms that changes are saved to the source note.
  - Failures and rejected actions trigger explicit red danger alerts (`⚠️ Failed to save changes to note`) and initiate an automatic re-sync (`refreshTab`) to roll back the board state so it never drifts from the source note.
- **Sequential Note Write Queuing (`withNoteLock`)**:
  - Serializes rapid successive writes to the same note (e.g. clicking move arrows repeatedly) into a sequential Promise queue, eliminating write collisions and ProseMirror selection conflicts.
- **Dual-Matching Column Resolution (`resolveSpan`)**:
  - Matches column spans by both line ID and normalized column heading names, preventing failed moves when markdown line numbers shift dynamically between rapid reorders.

## v0.0.33

### 🚀 Zero-Flicker Architecture & Optimistic In-Memory Upgrades
- **0ms Tab Reordering & Instant Tab Closing**:
  - Clicking `◀` or `▶` directional arrows on tab chips now swaps positions in local client state (`STATE.tabs`) in **0ms** with zero screen flicker, saving tab configuration quietly in the background.
  - Closing a tab removes it immediately in local state and smoothly switches to the adjacent tab without reloading the embed iframe.
- **In-Memory Board Data Binding (`handlePluginResult`)**:
  - Eliminated full-iframe `renderEmbed()` reloads across all micro-actions and dialogs.
  - Task dialog edits (`editCard`), context menu actions (`cardMenu`), quick `@` date setting (`quickSetDate`), column operations (`renameColumn`, `deleteColumn`, `setWipLimit`, `moveColumnToTab`), header creation (`createColumn`, `createColumnNote`), note management (`renameNote`, `deleteNote`), and note sorting persistence (`saveSortToNote`) return updated board snapshots directly to the client and re-render board elements in-place with zero screen flash.

## v0.0.32

### 🚀 New Features & Enhancements
- **Contextual Task Creation (`+`) & Non-Task Text Isolation**:
  - **Beside Note in Tag / Notes Tab**: Clicking the `+` button on a note column header creates a new task at the very start of the note (line 0, above all headings in markdown), guaranteeing it automatically places under **Unsorted** even if the note begins with a heading.
  - **Beside Heading in Tag, Notes, Note Tab**: Clicking the `+` button beside any heading or section header inserts the task directly underneath that specific heading in markdown, rendering it immediately at the top of that column/section.
  - **Non-Task Text Isolation**: Automatically inserts clean blank line separation between new tasks and subsequent paragraph text, preventing Amplenote's native parser from merging user descriptions into task content.
  - **Backend Content Enforcement**: Immediately updates task content via `app.updateTask` upon creation to guarantee 1-to-1 data fidelity.
- **Unblocked Action Controls & Floating Tool Overlays**: Refactored `.kb-col-tools` and `.kb-section-tools` to float over title text on hover (`right: 58px` and `right: 32px`), ensuring tools fade into view cleanly without ever masking or blocking the `+` Add Card button or card counters.
- **Zero-Waste Header Density**: Column titles and section headers maintain clean single-line truncation with native title tooltips, eliminating wasted vertical space.

## v0.0.29

### 🚀 New Features & Enhancements
- **Free-Span Column Drag & Drop with Glowing Drop Line**: Columns can now be freely dragged across any number of positions across the entire board. Displays a prominent 4px vertical glowing accent line (`.kb-col-drop-before` / `.kb-col-drop-after`) in the column gap indicating the exact target insertion slot, with guardrails preventing placement before `Unsorted` or after `Completed`.
- **Instant 0ms Directional Move Buttons & Zero-Flicker Reordering**: The `<` and `>` arrow buttons now swap column and section headers instantly (optimistically in 0ms) in the UI while synchronizing the reordered heading markdown in the background without network delay, iframe reload, or screen flicker.
- **Color-Coded Multi-Level Heading Columns**: All note headings (`# H1`, `## H2`, `### H3`, etc.) are recognized as Kanban columns with zero wasted horizontal space. Levels are elegantly differentiated via top accent indicator bars and left border highlights (H1 = Theme Accent, H2 = Purple, H3 = Cyan/Teal, H4+ = Emerald).
- **Smart Column Deletion (Adjacent Header Migration)**: Deleting a column heading safely relocates all its existing tasks directly into the previous column heading (or next heading if deleting the first column), ensuring zero tasks are dumped into "Unsorted".
- **Streamlined Toolbar (Live Sync Architecture)**: Removed obsolete "Save Columns" and "Reset Columns" buttons since all column movements (drag & drop and directional arrows) now synchronize live to note markdown in real-time, keeping the toolbar clean and focused.
- **1-Click Note Navigation from Note Boards**: Added multiple quick-access navigation entry points to jump directly to the source note in Amplenote: a dedicated **`↗ Open Note`** button in the top action toolbar, a **`↗`** tab tool icon on the tab chip, and **`↗`** buttons on column header toolbars.

## v0.0.28 (2026-08-22) — Note Link Navigation, Outside Links Protection, Clean Note Conversion & Image Lightbox

### 🚀 New Features & Enhancements
- **Clean Task Score Display**: Score badges (`🎯 Score`) are now cleanly suppressed for standard default unscored tasks (`score: 1.0`), and only shown when a custom task score is computed/assigned.
- **Recursive Parent & Child Task Hierarchy**: Explicitly categorizes and renders task hierarchy (`subtaskDepth`). Tasks with subtasks display `📋 Parent Task`, while nested child tasks dynamically indent with left tree borders and display depth-aware badges (`↳ Child Task`, `↳↳ Child Task`).
- **Inline Hashtag & Tag Chip Extraction**: Extracted `#tag` and `#parent/subtag` along with `[[Note Name]]` wiki-links from task markdown, rendering them as styled colored chips on each card with matching account tag colors.
- **Clean Note Conversion (`Create note from card`)**: Prompts for a title, creates a fresh note with no tags, and cleanly converts the task content directly to `[Title](https://www.amplenote.com/notes/{uuid})` without redundant duplicate text.
- **Image Fit & Full-Resolution Lightbox Viewer**: Card images automatically fit within column bounds (`width: 100%; object-fit: cover; border-radius: 6px; cursor: zoom-in;`). Clicking any image opens a dark backdrop glassmorphic Lightbox modal with smooth zoom animations to view images in their full resolution.
- **Amplenote Note Link Navigation**: Clicking any linked Amplenote note within a card body seamlessly navigates Amplenote's main window to that note.
- **Outside Links Protection & Notification**: Outside web links in card content are prevented from failing within the iframe sandbox; clicking them triggers a friendly bottom-right toast notification (*"Outside links do not work here."*).
- **Image De-duplication & Clean Rendering**: Fixed duplicate image rendering where cards previously showed images in both `card.html` and `card.imageUrl`. Automatically strips raw `open_in_new` link artifacts generated by rich text conversion.

---

## v0.0.26 (2026-08-22) — Dedicated Task Dialogs, Completed Metadata & Instant Card Sync

### 🚀 New Features & Enhancements
- **`+ Add Task` Button at Board End**: Added a dedicated `+ Add Task` card alongside `+ Add Header` at the right end of the board, allowing users to add tasks at the top of the note (automatically placed in **Unsorted**).
- **Interactive Empty State Actions**: When no tasks are found or all columns are empty, the empty state displays informative guidance and instant action buttons (`+ Add Task`, `+ Add Header`, and `Show Empty Headers` if `hideEmptyColumns` is active).
- **Dedicated Task Dialog on Card Click**: Clicking directly on a card body opens a tailored modal:
  - **Active Tasks**: Full properties editor (Markdown content, Important/Urgent priority quadrant, move to note / heading dropdown, task score, and mark status: `Started`, `Completed`, `Dismissed`).
  - **Completed Tasks**: Completed task review modal (Markdown content, target heading dropdown to choose where the card returns when reopened, and lifecycle actions: `Reopen / Active`, `Dismiss / Archive`, `Keep completed`).
- **Context-Aware 3-Dots Action Menus (`...`)**: The card context menu automatically filters choices based on task state:
  - **Active Tasks**: `Mark as completed`, `Edit details`, `Add label`, `Set start date/time`, `Snooze / Hide Until`, `Schedule Time Block`, `Create note from card`.
  - **Completed Tasks**: `Reopen task (mark active)`, `Dismiss / Archive task`, `Edit details`, `Add label`, `Create note from card`.
- **Completed Date & Time Timestamp Badges**: Completed cards render exact completion timestamps formatted according to the user's date format settings (e.g. `✓ done 2026-08-22 17:05`).
- **Natural Document Order on Refresh**: Clicking `Refresh Tab` or `Refresh All` automatically clears temporary client sorting (`sortMode = "none"`), ensuring the board displays the source note's natural line order.

### 🐛 Bug Fixes & Reliability
- **Instant Card Creation Sync**: Fixed an issue where newly created tasks via `+` did not appear immediately due to asynchronous Amplenote database/markdown comment indexing. The plugin now provides resilient heading line insertion and guaranteed optimistic card injection directly into the returned board snapshot.

---

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
