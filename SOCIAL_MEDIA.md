# Released: Kanban Plugin v0.0.51 — Data Integrity Hardening, Subtask Block Preservation & Deadlock-Free Multi-Note Mutex

## LinkedIn
🚀 Kanban Plugin for Amplenote v0.0.51 is officially live!

This release delivers comprehensive data integrity hardening, multi-note write resilience, and complex task block preservation across all board workflows.

When building visual productivity dashboards on top of document-based Markdown notes, simple multi-step operations like moving cards across notes or reordering sections carry real data integrity risks if network interruptions or concurrent edits occur. In v0.0.51, we systematically addressed these failure modes:

🛡️ Insert-Before-Delete Write Resilience: Cross-note card relocations and edit-dialog note migrations now update the task entity and place the task block in the destination document BEFORE removing it from the source note. If a network drop or API error occurs midway, the source document remains 100% untouched.

🌳 Hierarchical Task Block & Subtask Preservation: Markdown tasks are no longer treated as naive single lines. The parser now detects full task blocks—including indented subtask checklists, multiline descriptions, comments, and footnotes. Moving or sorting cards moves the entire subtree together without leaving orphaned child items behind.

🔒 Deadlock-Free Coordinated Multi-Note Mutex: Multi-document operations acquire sequential locks across all involved note UUIDs using lexicographical key ordering, eliminating race conditions and circular-wait deadlocks.

🧪 Test Suite Expansion: Added 15 comprehensive unit tests verifying concurrency safety, subtask preservation, and cross-note failure isolation, expanding our test suite to 291 tests across 21 suites (100% passing).

Explore the release and full source code on GitHub:
https://github.com/krishnakanthb13/anp-15-kanban

#OpenSource #Amplenote #Productivity #PKM #Kanban #WebDev #JavaScript #SoftwareArchitecture

---

## Twitter/X
🚀 Kanban Plugin for Amplenote v0.0.51 is here!

🛡️ Insert-before-delete cross-note moves (0% data loss risk)
🌳 Complete task block & indented subtask preservation
🔒 Deadlock-free multi-note mutex locks
🧪 291 passing tests (100% green)

https://github.com/krishnakanthb13/anp-15-kanban

---

## Bluesky
🚀 Kanban Plugin for Amplenote v0.0.51 is live!

Major write-integrity hardening update:
🛡️ Insert-before-delete cross-note moves
🌳 Hierarchical task block & subtask preservation
🔒 Deadlock-free multi-note mutex coordination
🧪 291 unit tests passing

https://github.com/krishnakanthb13/anp-15-kanban
#Amplenote #Productivity #Kanban

---

## Mastodon
🚀 Released: Kanban Plugin for Amplenote v0.0.51!

A major data-integrity and concurrency hardening release for our visual Markdown Kanban board:

• Insert-Before-Delete Resiliency: Cross-note card moves insert into destination before removing from source, preventing data loss on network drops.
• Hierarchical Task Blocks: Treats tasks as multi-line blocks, preserving indented subtasks and multiline notes during moves and sorting.
• Coordinated Multi-Note Mutex: Deadlock-free lexicographical locks across notes.
• 291 unit tests passing with 100% green coverage.

Source & Docs: https://github.com/krishnakanthb13/anp-15-kanban

#OpenSource #Amplenote #Kanban #Productivity #JavaScript #PKM

---

## Reddit
**Suggested Subreddits**: `r/Amplenote`, `r/Productivity`, `r/PKM`, `r/javascript`, `r/webdev`  
**Suggested Title**: Hardening a Markdown Kanban Board: Eliminating Data Loss in Non-Transactional Note APIs (v0.0.51 Release)

Hey everyone!

We just shipped **v0.0.51** of the open-source **Kanban Plugin for Amplenote**, focusing heavily on write-integrity hardening, multi-note concurrency safety, and nested subtask tree preservation.

### The Challenge with Document-Backed Kanban
Most Kanban boards store cards in a relational database with ACID transactions. But Amplenote plugins operate directly on live Markdown documents via REST-like plugin APIs. When dragging a card across notes or sorting columns, a mutation typically requires multiple asynchronous steps:
1. Splicing text in note A
2. Updating the backend task entity
3. Appending markdown in note B

If step 2 or 3 fails (due to a transient network timeout or rate limit), a naive "delete first, insert later" design permanently deletes the task from note A.

### How We Solved It in v0.0.51

1. **Insert-Before-Delete Two-Phase Relocation**:
   Instead of deleting first, we update the task entity `noteUUID` and place the card into the destination note's markdown first. Only after the destination write is verified do we remove the task block from the source note. If any intermediate call rejects, the original document remains completely intact.

2. **Hierarchical Task Block Extraction (`findTaskBlock`)**:
   In Markdown, tasks aren't just single checkbox lines—they often have indented subtask checklists (`    - [ ]`), multiline descriptions, code blocks, or footnote definitions. Moving or sorting tasks previously risked severing child subtasks. Our parser now extracts the full contiguous task block, keeping parents and children attached under all drag, drop, and sort operations.

3. **Deadlock-Free Coordinated Multi-Note Mutex (`withMultiNoteLock`)**:
   Moving content across two notes requires locking both documents to prevent concurrent interleaving. If operation 1 moves Note A → Note B while operation 2 moves Note B → Note A, naive locking deadlocks. We implemented a lexicographically sorted mutex acquisition chain that guarantees deadlock-free serialization across any number of documents.

4. **100% Test Coverage on Failure Modes**:
   We added 15 new test cases verifying network failure rollbacks, reverse concurrent locks, and multi-column sorting across 4 sort modes (`score`, `startDate`, `important`, `urgent`), bringing our test suite to **291 passing tests across 21 suites**.

Check out the full repository and install it in your Amplenote workspace:  
GitHub: https://github.com/krishnakanthb13/anp-15-kanban

Would love your feedback on the architecture and concurrency approach!

---

# Released: Kanban Plugin v0.0.48 — Tags Boards, Drag-and-Drop Retagging & Responsive Wheel Scrolling

## LinkedIn
🚀 Kanban Plugin for Amplenote v0.0.48 is live!

This release introduces the 4th major board paradigm: Tags Boards (tags as columns, notes as cards).

Here is what is new:
🏷️ Tags Boards: Organize your workflow by tags (#todo, #in-progress, #done). Notes matching each tag render as cards with title, creation date, and last modified timestamps.
🔄 Drag-and-Drop Retagging: Dragging a note card between tag columns automatically swaps tags on the note in real time.
🖱️ Wheel-Scrollable Toolbar: Hover over the header options or tab bar and roll your mouse wheel to glide through controls smoothly on narrow screens and Peek Viewer.
🔀 Context-Adaptive Sorting: "Sort Notes" mode lets you sort note cards by Name (A-Z), Created Date, or Last Modified Date with 1 click.
✨ Unified Note Details Info Box: Expandable ℹ card displays dates and tags as compact inline bubbles separated by clean dividers.

Check out the release and try it out on GitHub!

GitHub: https://github.com/krishnakanthb13/anp-15-kanban

#OpenSource #Amplenote #Productivity #PKM #Kanban #WebDev #JavaScript

---

## Twitter/X
🚀 Kanban Plugin for Amplenote v0.0.48 is out!

🏷️ Tags Boards: Tags = Columns, Notes = Cards
🔄 Drag-and-drop note retagging across tag columns
🖱️ Mouse wheel horizontal scrolling over toolbar & tabs
🔀 Adaptive "Sort Notes" (Name, Created, Updated)

https://github.com/krishnakanthb13/anp-15-kanban

---

## Bluesky
🚀 Kanban Plugin for Amplenote v0.0.48 is live!

🏷️ Tags Boards: Tags = Columns, Notes = Cards
🔄 Drag-and-drop note retagging across columns
🖱️ Wheel-scrollable toolbar & tabs for narrow screens
🔀 Adaptive "Sort Notes" by Name, Created, and Updated

https://github.com/krishnakanthb13/anp-15-kanban
#Amplenote #PKM #Kanban

---

## Mastodon
🚀 Released: Kanban Plugin for Amplenote v0.0.48!

Huge update introducing Tags Boards:
🏷️ Tags as Columns, Notes as Cards
🔄 Drag & drop notes across tag columns to retag in real time
🖱️ Wheel-scrollable toolbar options and tab bar for compact viewports
🔀 Adaptive "Sort Notes" mode (Name, Created Date, Last Modified)
✨ Unified expandable note details info box

100% open-source on GitHub:
https://github.com/krishnakanthb13/anp-15-kanban

#OpenSource #Amplenote #Productivity #PKM #Kanban #JavaScript

---

## Reddit

**Suggested Subreddits:** r/Amplenote, r/Productivity, r/PKM, r/NoteTaking

**Title:** Show r/Amplenote: Kanban Plugin v0.0.48 — Tags Boards, Note Retagging & Responsive Wheel Scrolling

**Body:**
Hey everyone!

I just pushed **v0.0.48** of the open-source Kanban plugin for Amplenote, introducing a major new board type: **Tags Boards (tags as columns, notes as cards)**!

### What's New in v0.0.48:
1. **Tags Boards (`tags`)**:
   - Instead of heading sections or single notes, you can now configure multiple tags (e.g. `#todo`, `#in-progress`, `#done` or `#project/alpha`, `#project/beta`) as columns.
   - All notes carrying each tag appear as draggable cards showing note title, created date, and last modified date.
2. **Drag-and-Drop Retagging**:
   - Dragging a note card between tag columns automatically removes the source tag and adds the destination tag to that note in real time.
3. **Smooth Wheel-Scrollable Toolbar**:
   - When using Amplenote's **Peek Viewer** or split screens, you can hover over the header options or tab bar and roll your mouse wheel to scroll horizontally across toolbar buttons with zero friction.
4. **Context-Adaptive Sorting ("Sort Notes")**:
   - The sort button dynamically transforms into "Sort Notes" on Tags boards, letting you sort cards by Title (A-Z), Created Date (newest first), or Last Updated.
5. **Clean Note Details Info Box**:
   - Expandable ℹ box with single-line timestamps and tags formatted as compact inline bubbles.

Check out the full documentation and install code on GitHub:
https://github.com/krishnakanthb13/anp-15-kanban

Let me know your thoughts and feature requests!

---

# Released: Kanban Plugin — The Big Rebuild Begins

## LinkedIn
🚀 The Kanban Plugin for Amplenote just got its biggest upgrade yet!

I rebuilt the plugin from the ground up. The board is no longer an inline note embed — it's now a persistent, full-screen app surface inside Amplenote. Your notes become Kanban boards: headings turn into columns, tasks turn into cards.

You can now:
✅ Drag & drop tasks between columns — the underlying note updates instantly.
✅ Drop a card into the Completed / Done column to complete it; drag it back out to reopen.
✅ Create and edit cards in raw markdown without leaving the board.
✅ Choose from 8 curated themes (light & dark parity) — press T to cycle.

Fully open-source. Check it out on GitHub!

GitHub: https://github.com/krishnakanthb13/anp-15-kanban

#OpenSource #Dev #Update #Amplenote #Productivity #ProjectManagement #Kanban

## Twitter/X
🚀 The rebuilt Kanban Plugin for Amplenote is here — a full rebuild!

Your notes ARE the board now: headings = columns, tasks = draggable cards. Drop into the Completed column to complete, edit markdown in place, 8 cycling themes (press T).

Check it out: https://github.com/krishnakanthb13/anp-15-kanban

## Bluesky
🚀 The rebuilt Kanban Plugin for Amplenote is here — a full rebuild!

Your notes ARE the board now: headings = columns, tasks = draggable cards. Drop into the Completed column to complete, edit markdown in place, 8 cycling themes (press T).

Check it out: https://github.com/krishnakanthb13/anp-15-kanban
#Amplenote #Productivity #Kanban

## Mastodon
🚀 Excited to share The rebuilt Kanban Plugin for Amplenote — rebuilt from scratch!

The board now runs as a persistent full-screen embed. Note headings become columns, tasks become draggable cards, and every move writes straight back to your note. Includes drop-to-complete, raw-markdown card editing, and 8 light/dark themes. Fully open-source.

Check out the repo here: https://github.com/krishnakanthb13/anp-15-kanban

#OpenSource #Amplenote #PKM #ProductivityTools #Kanban

## Reddit

**Suggested Subreddits:** r/Amplenote, r/Productivity, r/PKM, r/NoteTaking

**Title:** Show r/Amplenote: I rebuilt my Kanban plugin — your notes are now the board

**Body:**
Hey everyone!

A while back I shared a Kanban plugin for Amplenote. Since then I've rebuilt it from the ground up, and the core idea changed: instead of filtering tagged notes into columns, **a single note becomes the board** — its headings are the columns, its tasks are the cards.

**How it works:**
The board runs as a persistent full-screen plugin section inside Amplenote. Cards map 1:1 to real tasks, so everything stays native — no shadow copies of your data.

**Features in this milestone:**
*   **Drag & drop**: moving a card between columns physically relocates the task under the right heading in the note.
*   **Drop-to-done**: the Completed / Done column completes tasks (native strikethrough); drag back out to reopen.
*   **Quick create / edit**: `+` adds a task to a column; clicking a card opens a raw-markdown editor.
*   **Unsorted column**: tasks above the first heading don't get lost — they show up in their own column.
*   **8 cycling themes** with proper light/dark parity (press T).
*   **Refresh Tab / Refresh All** controls with a progress bar.

This is milestone 1 of a bigger roadmap — tag-based boards (sub-tags as columns, notes as cards), tab management UI, WIP limits, rich footnote rendering, and labels are coming next.

It's completely open-source and built using `esbuild` for maximum performance within Amplenote's constrained plugin runtime.

I'd love for you to try it out and let me know what you think!

**GitHub Repo:** [https://github.com/krishnakanthb13/anp-15-kanban](https://github.com/krishnakanthb13/anp-15-kanban)
