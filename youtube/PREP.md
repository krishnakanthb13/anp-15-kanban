# YouTube Video Preparation (PREP.md)

This document contains packaging metadata and a walkthrough script to assist in producing a video for the **Kanban Plugin** (v0.0.48) in Amplenote.

---

## 1. Packaging Metadata

### Title Options
*   **Option A (Clear & Direct):** How to Use the Kanban Plugin in Amplenote
*   **Option B (Benefit-driven):** Visual Task & Project Management in Amplenote: Multi-Tab Kanban, Tag Boards & Note Workflows!

### Thumbnail Plan
- **Background:** Use Amplenote's dark mode color (#1E1E1E) as the solid background color.
- **Text Formatting:**
  - **"AMPLENOTE PLUGIN:"** must be uppercase, using a vibrant Amplenote blue (#007AFF) or bold accent color, aligned to the center.
  - The **KANBAN** plugin name should be placed immediately below it in stark white, extra-large, bold typography.
- **Visual/Icon:** Place the official Amplenote logo/icon in the bottom right corner of the thumbnail.

### Description

📋 COMPLETE GUIDE TO THE KANBAN PLUGIN FOR AMPLENOTE

A straightforward, fact-based walkthrough of the Kanban plugin for Amplenote. In this video, we cover every single capability of this visual project and task management system—from multi-tab workflows, Single Note heading boards, and Tag boards with collapsible sections to Multi-Note pipelines, Tags boards with drag-and-drop retagging, visual sorting with note markdown persistence, and custom themes.

Whether managing daily sprint backlogs, tracking cross-project tag hierarchies, or retagging notes via drag-and-drop, this plugin transforms your notes and tasks into an interactive Kanban workspace.

🔗 Github Repository: https://github.com/krishnakanthb13/anp-15-kanban

🔗 Try Amplenote (Sign Up): https://www.amplenote.com/signup?ref=7JGSMI4H0
🔗 Explore My Amplenote Plugins: https://krishnakanthb13.github.io/A/
🔗 Alternative Plugins Page: https://public.amplenote.com/Y3dy91/krishna-plugins
🔗 Browse Official Amplenote Plugins: https://www.amplenote.com/plugins
🔗 Support My Work & Development: https://krishnakanthb13.github.io/S/

🕒 VIDEO TIMESTAMPS

0:00 - Introduction & Overview
0:31 - Installation & App Option Launch
1:17 - Tab Management & 4 Board Types Wizard
2:07 - Single Note Boards (`noteBoard.js`) & Heading Columns
2:22 - Task Cards, Lifecycle & Dedicated Completed Column
3:40 - Drag & Drop with Visual Indicator Lines (`taskOps.js`)
4:01 - Column Management & Movement Guardrails (`columnOps.js`)
4:55 - Tag Boards (`tagBoard.js`) & Collapsible Heading Sections
5:38 - Multi-Note Project Boards (`notesBoard.js`)
6:06 - Tags Boards (`tagsBoard.js`) & Drag-and-Drop Retagging
6:54 - Card Details, Inline Info & Context Menu (`...`)
7:34 - Dynamic Sorting & Persisting to Markdown (`taskOps.js`)
8:08 - Viewport Toolbar Controls (Search, Density, Empty, @ Date)
9:09 - Curated Themes & Keyboard Shortcuts (`themes.js`)
9:31 - Conclusion

📋 FEATURE BREAKDOWN

4 BOARD PARADIGMS
* Single Note Board (`note`): Turns markdown headings (`# H1`, `## H2`, `### H3`) into columns and tasks into draggable cards.
* Tag Board (`tag`): Groups all notes under a tag into columns, rendering each note's headings as collapsible sections (`▼ / ▶`).
* Multi-Note Board (`notes`): Maps notes under a tag into columns with a flat list of active tasks.
* Tags Board (`tags`): Maps multiple tags as columns and notes as cards, with drag-and-drop note retagging.

TASK LIFECYCLE & DRAG-AND-DROP
* Dedicated Completed Column: Automatically isolates completed and dismissed tasks at the far right. Dragging a card into Completed marks it complete; dragging out reopens it.
* Visual Insertion Indicators: Glowing drop indicator lines above or below cards, beside columns, and between tabs.
* Full Markdown Fidelity: Task reordering within or across headings rewrites note markdown directly with zero screen flicker.
* Subtask Tree Hierarchy: Indented child tasks render with progressive tree lines (`↳ Child Task`), and parent tasks display `📋 Parent Task`.

COLUMN & HEADING MANAGEMENT
* In-Place Controls: Reorder (`◀ / ▶`), rename (`✎`), delete (`✕`), or transfer columns (`⇥`) to another tab.
* Deletion Safety: Deleting a column safely migrates its tasks to the previous heading instead of leaving them orphaned.
* Boundary Guardrails: Protects `Unsorted` (pinned at left) and `Completed` (pinned at right) from invalid moves.
* WIP Limits: Click column count chips to enforce Work-In-Progress limits with visual alert highlights.

VIEW CONTROLS, SORTING & THEMES
* Dynamic Sorting: Non-destructive client-side sorting by Score, Date, Important, Urgent, Name, Created, or Updated, with a 1-click `💾 Save Sort` button to persist markdown order.
* View Options: Search with 1-click `✕` clear, 3-tier Density (`Cozy`, `Compact`, `Spacious`), Empty columns toggle, Expand all info, and Quick `@ Date` scheduling.
* 8 Curated Themes: Light and dark color palettes (Clean Daylight, Sepia Parchment, Matcha Latte, Nord Frost, Midnight Slate, Nord Arctic, Dracula Neo, Emerald Forest) switchable via `T` key.

#Amplenote #Kanban #TaskManagement #Productivity #ProjectManagement #PKM #VisualWorkflow #NoteTaking

---

## 2. Walkthrough Script (Fact-Based)

### **Introduction**
> **Speaker**: "Hello everyone! In this video, we're doing a complete, fact-based walkthrough of the Kanban Plugin for Amplenote. This plugin renders a multi-tab visual Kanban board inside Amplenote's persistent embed section. It supports four distinct board models: Single Note heading boards, Tag boards with collapsible sections, Multi-Note project boards, and Tags boards where dragging notes between columns re-tags them in real time. Let's look at installation, settings, and how every single feature works."

---

### **Section 1: Installation & Setup**
> **Speaker**: "To install the plugin, create a note named 'Kanban Plugin' in Amplenote. Add the metadata table with `name: Kanban`, `icon: view_kanban`, and two settings: `Kanban Tabs` and `Kanban Settings`. 
>
> Below the table, create a JavaScript code block and paste the compiled plugin code. Then go to **Account Settings** -> **Plugins** and activate it.
>
> To launch the board, click the **Open Kanban Board** button in your plugin launcher. This navigates to the plugin's dedicated addressable embed view inside Amplenote. If you have no tabs configured yet, the board starts with a pre-populated Demo Board so you can explore the interface right away."

---

### **Section 2: Tab Management & 4 Board Types Wizard (`tabsConfig.js`)**
> **Speaker**: "At the top of the interface is the Tab Bar. Clicking **`+ New tab`** launches a clean 2-step progressive disclosure wizard:
>
> - **Step 1**: Choose your board paradigm:
>   - Existing Note Board
>   - Create New Note Board (which creates a fresh note pre-formatted with default columns)
>   - Tag Board (notes as columns with collapsible heading sections)
>   - Multi-Note Board (one note per project with flat task cards)
>   - Tags Board (tags as columns and notes as cards)
> - **Step 2**: Enter the context-specific input—either selecting an existing note, entering a title for a new note, picking a tag, or choosing multiple tags.
>
> **TL;DR Tab Tools:**
> - **Reordering**: Click the `◀` or `▶` arrows on tab hover or drag-and-drop tabs directly across the bar.
> - **Closing**: Click `✕` to close a tab from your board view. Closing a tab never deletes your underlying Amplenote notes or tags.
> - **Direct Open**: Hovering any tab shows a `↗` icon to open the source note or tag in Amplenote immediately."

---

### **Section 3: Single Note Boards (`noteBoard.js`)**
> **Speaker**: "Let's explore the **Single Note Board**. Here, a single note is the source of truth:
>
> - **Columns**: Every markdown heading in the note (`# H1`, `## H2`, `### H3`) is parsed into a column with color-coded heading level badges.
> - **Unsorted Column**: Any tasks existing at the very top of your note before the first heading appear in an implicit 'Unsorted' column on the far left.
> - **Completed Column**: Completed tasks are gathered into a dedicated 'Completed' column on the far right.
> - **Subtask Hierarchy**: Indented child tasks render with tree guidelines and depth badges like `↳ Child Task` or `↳↳ Child Task`, while parent tasks display `📋 Parent Task`.
> - **Quick Add**: Clicking `+` on any column header creates a task directly under that specific heading at the top of that section. At the far right of the board, you also have dedicated cards to add a new task to Unsorted or append a new heading column."

---

### **Section 4: Task Lifecycle & Dedicated Completed Column**
> **Speaker**: "The Kanban board maps Amplenote's native task states directly:
>
> - **Active Tasks**: Render under their respective heading columns in physical line sequence.
> - **Completed Tasks**: Aggregated into the pinned Completed column. Dragging any active task into Completed marks it complete. Dragging a completed task back into any heading column reopens it under that heading in your note.
> - **Dismissed Tasks**: Render in the Completed column with strikethrough styling and a `✕ [timestamp]` badge.
> - **Snoozed Tasks**: Tasks with a future `hideUntil` timestamp stay under their heading with a `💤 Hide Until` badge so you know exactly when they wake up.
> - **Recurring Tasks**: Display a `🔁 Repeat` badge. Completing a recurring task records the completion while keeping the newly spawned recurring task active under its heading."

---

### **Section 5: Drag & Drop Mechanics (`taskOps.js`)**
> **Speaker**: "The plugin provides tactile drag-and-drop feedback:
>
> - **Glowing Indicator Lines**: Hovering over a card shows a horizontal insertion line above or below it based on mouse position.
> - **Across Columns**: Moving a card across columns physically moves the task markdown line under the target heading.
> - **Within the Same Column**: Dragging a card reorders the markdown sequence within that heading in document order.
> - **Sequential Write Locking**: Rapid moves use a serial write lock (`withNoteLock`), preventing markdown collision errors or race conditions.
> - **Verified Toast Feedback**: Operations display a green toast `✓` when the write confirms, and automatically roll back if an API error occurs."

---

### **Section 6: Column Management & Boundary Guardrails (`columnOps.js`)**
> **Speaker**: "Hovering over any column header reveals its management toolbar:
>
> - **Move Column (`◀ / ▶` or Drag)**: Reorders heading blocks in the underlying note markdown with zero screen flicker.
> - **Rename (`✎`)**: Renames the heading text in the note.
> - **Delete (`✕`)**: Safely removes the heading and migrates all its existing tasks into the preceding heading, preventing tasks from spilling into Unsorted.
> - **Transfer (`⇥`)**: Moves the heading and all of its tasks to another Note Board tab.
> - **WIP Limits**: Click the card count chip on any column to set a numeric Work-In-Progress limit. When exceeded, the badge turns red (`count / limit`).
> - **Boundary Guardrails**: The Unsorted column is pinned to position one and cannot be moved, nor can headings be moved before it. Similarly, headings cannot be moved past the pinned Completed column."

---

### **Section 7: Tag Boards (`tagBoard.js`) & Collapsible Sections**
> **Speaker**: "The second board type is the **Tag Board**. It maps all notes under a specific tag (like `#projects`) as columns:
>
> - **Collapsible Heading Sections**: Each note column displays its internal headings as collapsible sections (`▼ / ▶`) with H1, H2, and H3 level badges and card counts.
> - **Unsorted & Completed Sections**: Each note column contains its own top Unsorted section and bottom Completed section.
> - **Section Management**: Each section header features its own `+` to add tasks under that heading, `▲ / ▼` to reorder headings within that note, `✎` to rename, `⇥` to transfer headings to another note, and `✕` to delete headings safely.
> - **Column Header Tools**: Add tasks to the note, add new heading sections, rename the note, open it in Amplenote, or move it to Trash."

---

### **Section 8: Multi-Note Project Boards (`notesBoard.js`)**
> **Speaker**: "The third board type is the **Multi-Note Board** (`notes`):
>
> - **Pipeline Overview**: Notes with the selected tag appear as columns, and all active tasks across each note are displayed in a clean, flat list without heading subdivisions.
> - **Cross-Note Drag & Drop**: Dragging a task card from one column to another migrates the task directly between notes using Amplenote's native `app.updateTask({ noteUUID })` without altering formatting.
> - **Project Management**: Ideal for high-level pipeline overviews where each note represents a distinct client, sprint, or project."

---

### **Section 9: Tags Boards (`tagsBoard.js`) & Drag-and-Drop Retagging**
> **Speaker**: "The fourth board type is the **Tags Board** (`tags`):
>
> - **Tags as Columns**: Displays multiple Amplenote tags (like `#todo`, `#in-progress`, `#done`) as individual columns with color dots derived from your Amplenote account palette.
> - **Notes as Cards**: All notes tagged with that column's tag appear as cards. Clicking a card opens the note directly in Amplenote.
> - **Drag-and-Drop Retagging (`swapNoteTag`)**: Dragging a note card from one tag column to another seamlessly removes the old tag and applies the new tag in real time, while preserving all other tags on the note.
> - **Tag Column Tools**: Click `↗` to open that tag in Amplenote, `+` to create a note with that tag, `✕` to remove the column, or use the `+ Add Tag` card on the far right to add new tag columns."

---

### **Section 10: Card Context Menu (`...`), Inline Details (`ℹ`) & Task Editor**
> **Speaker**: "Every card on the board provides deep interaction controls:
>
> - **Card Click**: Opens the task details modal to edit task markdown, Eisenhower quadrants (Important/Urgent), move target headings or notes, adjust task scores, or change status.
> - **Inline Info (`ℹ`)**: Expands inline metadata showing Start Date, End Date, Deadline, Hide Until snooze date, Repeat schedule, and Score.
> - **Context Menu (`⋯`)**:
>   - `Mark as completed` / `Reopen task`
>   - `Dismiss / Archive task`
>   - `Add label` (links an Amplenote note as a colored tag chip)
>   - `Set start date / time`
>   - `Snooze / Hide Until`
>   - `Schedule Time Block`
>   - `Create note from card` (generates a new note titled from the card and embeds a clickable note link back on the task)
> - **Rich Content & Footnotes**: Supports bold, italics, clickable note links, embedded images with a full-resolution Lightbox zoom preview, and interactive Rich Footnotes with 1-click toast alerts."

---

### **Section 11: Dynamic Sorting & Markdown Persistence**
> **Speaker**: "Next is the dynamic sorting system:
>
> - **Context-Adaptive Sorting**:
>   - On task boards (`note`, `tag`, `notes`), cycle through: Default, **Sort: Score**, **Sort: Date**, **Sort: Important**, and **Sort: Urgent**.
>   - On tags boards (`tags`), cycle through: Default, **Sort: Name** (A-Z), **Sort: Created** (newest first), and **Sort: Updated** (recently modified first).
> - **Non-Destructive by Default**: Visual sorting does not modify your notes.
> - **`💾 Save Sort`**: On Note Boards, clicking `💾 Save Sort` prompts for confirmation and physically re-arranges the task markdown lines inside each heading for that note only.
> - **`↺ Reset Sort`**: Instantly restores the natural document order."

---

### **Section 12: View Toolbar Controls (Search, Density, Empty, @ Date)**
> **Speaker**: "The top header toolbar provides instant view customization:
>
> - **Two-Tier Search (`/`)**: Type any keyword to filter cards across all visible columns in real time. Click the circular `✕` button or press `Escape` to instantly clear the search. Pressing `Enter` launches Amplenote's global account search modal.
> - **Density Cycler**: Switch between **Cozy** (balanced padding), **Compact** (tight columns for high card density), and **Spacious** (relaxed view for large screens).
> - **Empty Columns (`Empty`)**: Toggle between hiding or showing empty columns and sections.
> - **Expand Info (`Info`)**: 1-click master switch to expand or collapse inline metadata across all visible cards.
> - **Quick `@ Date` Mode**: Toggles `@` buttons on all cards for 1-click date and time scheduling.
> - **Date Format**: Click to customize card date formats (e.g. `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`) with in-place zero-flicker updates.
> - **Horizontal Mouse Wheel Scrolling**: Hover over the toolbar or tab bar and roll your mouse wheel to scroll horizontally."

---

### **Section 13: Curated Themes & Keyboard Shortcuts (`themes.js`)**
> **Speaker**: "The plugin includes 8 curated themes with light and dark mode parity:
>
> - **Light Themes**: Clean Daylight, Sepia Parchment, Matcha Latte, Nord Frost.
> - **Dark Themes**: Midnight Slate, Nord Arctic, Dracula Neo, Emerald Forest.
>
> **TL;DR Shortcuts:**
> - **`T`**: Cycle through themes with 0ms client-side switching.
> - **`/`**: Instantly focus the card search bar.
> - **`Esc`**: Clear search filter and blur input.
> - **`Shift + Mouse Wheel`**: Horizontally pan across board columns from anywhere on the canvas."

---

### **Conclusion**
> **Speaker**: "That covers all the capabilities of the Kanban Plugin for Amplenote. It gives you flexible board models, full task lifecycle management, safe markdown synchronization, and deep customization. You can find the GitHub repository and installation guide in the description below. Thanks for watching!"
