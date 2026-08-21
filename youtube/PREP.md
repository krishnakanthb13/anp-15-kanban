# YouTube Video Preparation (PREP.md)

This document contains packaging metadata and a walkthrough script to assist in producing a video for the **Kanban Plugin** in Amplenote.

> **Sync note:** reflects the completed rebuild (all phases). Future ideas live in the README roadmap.

---

## 1. Packaging Metadata

### Title Options
*   **Option A (Clear & Direct):** How to Use the Kanban Plugin in Amplenote (2026 Rebuild)
*   **Option B (Benefit-driven):** Turn Any Amplenote Note Into a Kanban Board

### Thumbnail Plan
- **Background:** Use Amplenote's dark mode color (#1E1E1E) as the solid background color.
- **Text Formatting:**
  - **"AMPLENOTE PLUGIN:"** must be uppercase, using a vibrant Amplenote blue (#007AFF) or bold accent color, aligned to the center.
  - The **KANBAN** plugin name should be placed immediately below it in stark white, extra-large, bold typography.
- **Visual/Icon:** Place the official Amplenote logo/icon in the bottom right corner of the thumbnail.

### Description

COMPLETE GUIDE TO THE KANBAN PLUGIN FOR AMPLENOTE (2026 REBUILD)

A straightforward, fact-based walkthrough of the rebuilt Kanban plugin for Amplenote. In this video, we turn a regular note into a living Kanban board - headings become columns, tasks become draggable cards - and every move you make writes straight back to your note. We also cover tag boards, where sub-tags become columns and notes become cards.

If you manage complex projects or want a bird's-eye view of your tasks, this is for you.

ESSENTIAL LINKS & RESOURCES
* GitHub Repo: https://github.com/krishnakanthb13/anp-15-kanban
* Try Amplenote (Sign Up): https://www.amplenote.com/signup?ref=7JGSMI4H0
* Explore My Amplenote Plugins: https://krishnakanthb13.github.io/A/
* Alternative Plugins Page: https://public.amplenote.com/Y3dy91/krishna-plugins
* Browse Official Amplenote Plugins: https://www.amplenote.com/plugins
* Support My Work & Development: https://krishnakanthb13.github.io/S/

VIDEO TIMESTAMPS

0:00 - Introduction & Installation
0:45 - Launching the Board (Open Kanban Board)
1:15 - How Notes Map to Boards (Headings = Columns)
2:00 - Dragging Cards Between Columns
2:40 - Drop-to-Done & Reopening Tasks
3:10 - Creating Cards with the + Button
3:35 - Editing Card Markdown
4:00 - Unsorted Column & Completed Cards
4:20 - Rich Cards & Card Images
4:45 - Column Tools & WIP Limits
5:10 - Tag Boards (Sub-Tags as Columns)
5:45 - Managing Tabs (+ New tab, Reorder, Close)
6:10 - Refresh Tab / Refresh All & Date Format
6:35 - Cycling Themes (Press T)

FEATURE BREAKDOWN

LAUNCHING THE BOARD
* Open Kanban Board: One app option opens the board as a persistent full-screen section - it stays docked like an app and has its own addressable URL.
* Demo Board: Before any tabs are configured, a demo board shows you the ropes.

NOTE BOARDS
* Headings as Columns: The note's top-level headings become columns; deeper sub-headings stay inside their parent column.
* Tasks as Cards: Every task under a heading appears as a card, in document order. Completed tasks render struck-through with a check chip.
* Unsorted Column: Tasks sitting above the first heading appear in their own column so nothing gets lost.

DRAG & DROP
* Move Between Columns: Drag a card onto another column and the task physically moves under that heading in the underlying note.
* Drop-to-Done: Dropping into the last column completes the task. Drag it back out to reopen it. Same-column drops are safe no-ops.

CREATE & EDIT
* + Button: Adds a new task directly at the top of the chosen column via a markdown prompt.
* Click to Edit: Clicking a card opens its raw markdown for editing; changes write back to the task instantly.

RICH CARDS & COLUMN TOOLS
* Native Rendering: Card bodies use Amplenote's own editor markup - Rich Footnotes, links, and formatting look exactly like they do in notes. The first image in a task shows at the bottom of its card.
* Column Tools: Hover a header to move (left/right arrows), rename (pencil), or delete (X) a column - with confirmation - and the note's headings follow along.
* WIP Limits: Click a column's count chip to set a limit; the chip turns red when the column is over.

TAG BOARDS
* Sub-Tags as Columns: A tag board lists each immediate sub-tag as its own column (plus "No sub-tag"), colored by the tag's color.
* Notes as Cards: Cards come live from the tag query - notes tagged anywhere show up automatically.
* Retag by Drag: Drag a note between columns to change its sub-tag; click a card to open the note; + creates a new note in that column.

NOTES BOARDS
* Notes as Columns: The third kind - a tag's notes each become a column, and their tasks become cards. Great for "one note per project".
* Native Moves: Dragging a task to another column moves it into that note directly.
* Rename in Place: Hover tools rename the note behind the column.

CARD EXTRAS & SEARCH
* Card Menu: Hover a card and click the dots to add a label (color-coded note link), set a start date, or create a note from the card.
* Two-Tier Search: The header box filters the board instantly as you type; press Enter for a full-text search across all notes.
* Cross-Tab Columns: Move an entire column - heading and tasks - to another note board from its header tools.

TABS, REFRESH & THEMES
* Tab Management: "+ New tab" adds a note or tag board; hover tabs to reorder or close them (the underlying notes/tags are never deleted).
* Refresh Tab / Refresh All: Manually re-pull board data for the active tab or every tab, with a progress bar.
* Date Format: Set the card date-chip format (YYYY / MM / DD / MMM tokens) from the header button.
* 8 Cycling Themes: Curated light/dark palettes with instant switching - click the palette button or press T. Your theme choice syncs across devices.

#Amplenote #PKM #ProductivityTools #Kanban #ProjectManagement #TaskManagement #NoteTaking

---

## 2. Walkthrough Script (Fact-Based)

### **Introduction**
> **Speaker**: "Hello everyone! In this video, we're walking through the rebuilt Kanban Plugin for Amplenote. The idea is simple: any note can become a Kanban board - and so can any tag. Headings or sub-tags become columns, tasks or notes become cards, and everything you do on the board writes straight back to your workspace. Let's dive in."

---

### **Section 1: Installation & Launch**
> **Speaker**: "After installing the plugin from the compiled build file, you'll find a new app option: Open Kanban Board. Clicking it opens the board as a persistent, full-screen section - think of it as an app panel inside Amplenote, with its own URL you can bookmark.
>
> Until you configure tabs, you'll see a demo board so you can try everything out safely."

---

### **Section 2: How Notes Become Boards**
> **Speaker**: "Here's my project note. Notice the mapping: each top-level heading becomes a column - Backlog, In Progress, Done. Every task under a heading becomes a card in that column, in the same order as the note.
>
> Two nice details: tasks sitting above the first heading show up in an 'Unsorted' column instead of disappearing, and completed tasks render struck-through with a little checkmark."

---

### **Section 3: Drag & Drop That Writes Back**
> **Speaker**: "Let's drag this task from Backlog to In Progress. Watch the note behind the board - the task physically moved under the right heading. This isn't a visual trick; the board and the note are always the same data.
>
> Now watch what happens when I drop a card into the last column: it gets completed - the real Amplenote strikethrough. And if I drag it back out of the done column, it reopens. Dropping a card back into its own column? Safe no-op."

---

### **Section 4: Creating and Editing Cards**
> **Speaker**: "The plus button on each column creates a task right at the top of that column - just type the content in markdown.
>
> To edit an existing card, simply click it. You get the raw markdown, change what you need, save, and the board updates immediately. Rich Footnotes and images inside tasks render right on the card, exactly like they do in the note."

---

### **Section 5: Column Tools & WIP Limits**
> **Speaker**: "Hover over a column header and you get tools: move it left or right, rename it, or delete it - deletion asks for confirmation first, and its tasks move safely to the top of your note rather than being lost.
>
> Click the count chip on any column to set a Work-In-Progress limit. Go past it and the chip turns red - a gentle warning, never a hard block."

---

### **Section 6: Tag Boards**
> **Speaker**: "Now the second board kind: tag boards. Pick a tag, and every immediate sub-tag becomes a column - colored to match - while the notes carrying those tags become cards.
>
> This board is live: tag a note anywhere in Amplenote and it appears here automatically. Even better, dragging a note between columns retags it. Clicking a card opens the note; the plus button creates a new note right in that column."

---

### **Section 7: Tabs, Refresh & Themes**
> **Speaker**: "All your boards live as tabs. Plus adds one, hovering gives you reorder and close controls - closing a tab never touches the underlying note or tag.
>
> If you edited things elsewhere, hit Refresh Tab or Refresh All and watch the progress bar. There's also a date-format setting for the chips on cards.
>
> And because everyone has aesthetic preferences, there are eight curated themes covering both light and dark moods. Click the palette button or just press T anywhere on the board. Your choices follow you across devices."

---

### **Conclusion**
> **Speaker**: "That's the rebuilt Kanban Plugin! Everything stays native - your notes remain plain notes, your tasks remain real tasks, your tags remain tags. Labels, start dates, search, and cross-tab column moves are all in - try them out. Links are in the description. Thanks for watching!"
