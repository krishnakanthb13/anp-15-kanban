# Kanban Plugin

Creates a visual, interactive Kanban board out of your tasks, using notes as columns.
Icon: `view_kanban`

## Installation

1. **Create a Plugin Note**: Create a new note in Amplenote named "Kanban Plugin".
2. **Setup Metadata Table**: At the very top of the note, create a table with the following rows:

| Field | Value |
| :--- | :--- |
| `name` | Kanban |
| `description` | Creates a visual Kanban board out of your tasks. |
| `icon` | view_kanban |
| `setting` | Kanban Filter Tag |
| `setting` | Toggle Sort |
| `setting` | Current_Note_UUID [Do not Edit!] |

3. **Insert Code Block**: Below the table, create a single Javascript code block (type ` ```javascript `).
4. **Paste Compiled Code**: Copy the content from `build/kanban.compiled.js` and paste it inside that code block.
5. **Activate**: Go to **Account Settings** -> **Plugins**, and select the note you just created.

## Usage

This plugin provides a full visual Kanban board within an Amplenote embed block.
- The board automatically extracts tasks from notes that match your `Kanban Filter Tag` (default: `-reports/-kanban`).
- **Features available directly on the board:**
  - Create new tasks and assign them to specific sections within notes.
  - Edit existing tasks, move them between columns, update their status (Completed/Dismissed), and modify their score/urgency.
  - Sort tasks based on `startDate`, `taskScore`, `important`, or `urgent` using the toggle sort button.
  - Create new notes to act as additional columns on the board.

The Kanban board will load into a new "Kanban Board" note when you trigger the plugin using the App Option `Tagged!`. You can interact with all aspects of the board using the UI buttons. 

## Technical Details

This plugin is highly modular to improve maintainability and performance. It is processed using `esbuild` to compile all modules into a single immediately-invoked function expression (IIFE) that Amplenote executes safely.
- `lib/api/` contains helpers to interact with Amplenote's API.
- `lib/features/` handles actions executed from embed buttons (e.g. `taskEdit`, `createTask`, `createNewNote`).
- `lib/ui/` contains the HTML/CSS/JS template for the board.
- `lib/utils/` contains string and date formatting helpers.
