# Kanban Plugin

A multi-tab visual Kanban board for Amplenote, rendered as a full-screen plugin embed. Note boards turn a note's headings into columns and its tasks into draggable cards.
Icon: `view_kanban`

> **Status:** Major rebuild in progress (plan: `ds.md`). Phases 0–3 are implemented — the persistent embed shell, theming, the note board MVP, rich card rendering, WIP limits, column management, and tag boards. Tab-management UI lands in Phase 4 (see [Roadmap](#roadmap)).

## Installation

1. **Create a Plugin Note**: Create a new note in Amplenote named "Kanban Plugin".
2. **Setup Metadata Table**: At the very top of the note, create a table with the following rows:

| Field | Value |
| :--- | :--- |
| `name` | Kanban |
| `description` | A visual Kanban board: note headings as columns, tasks as cards. |
| `icon` | view_kanban |
| `setting` | Kanban Tabs |
| `setting` | Kanban Theme |
| `setting` | Kanban Date Format |

3. **Insert Code Block**: Below the table, create a single Javascript code block (type ` ```javascript `).
4. **Paste Compiled Code**: Copy the content from `build/kanban.compiled.js` and paste it inside that code block.
5. **Activate**: Go to **Account Settings** -> **Plugins**, and select the note you just created.

## Settings

Settings are stored via `app.settings` / `app.setSetting` and sync across devices. All values are strings.

| Setting | Purpose | Example value |
| :--- | :--- | :--- |
| `Kanban Tabs` | JSON tab configuration: which notes/tags are boarded, their order, and the active tab. Written by the plugin; edit by hand only for repair. | `{"tabs":[{"id":"tab_x","kind":"note","name":"My Board","noteUUID":"…"}],"activeTabId":"tab_x","settings":{"dateFormat":"YYYY-MM-DD"}}` |
| `Kanban Theme` | Active theme id (also changeable from the board's theme button). | `midnight` |
| `Kanban Date Format` | Format used for date chips on cards. | `YYYY-MM-DD` |

## Usage

### Opening the board

Run the **Open Kanban Board** app option (the plugin's launch button). This opens the plugin's persistent sidebar section and navigates to the board URL (`https://www.amplenote.com/notes/plugins/{pluginUUID}`), where it stays available like an app.

Until tabs are configured, the board shows a **Demo Board** so you can explore the UI. Tab management UI arrives in Phase 4; today tabs live in the `Kanban Tabs` setting.

### Board interactions (note boards)

A note board maps one note onto the board:

- **Columns** = the note's headings at the shallowest heading level present (H1s if the note uses H1s, etc.). Deeper sub-headings stay inside their parent column.
- **Cards** = tasks under each heading, in document order. Tasks above the first heading appear in an implicit **Unsorted** column.
- **Drag & drop** a card onto another column to move it — the task physically moves under the target heading in the note.
- **Drop into the last column** to complete the task (crossed out via Amplenote's native completion). Dragging it back out reopens it. Dropping a card back into its own column is a safe no-op.
- **`+` on a column header** creates a new task at the top of that column (prompted for markdown content).
- **Click a card** to edit its raw markdown (changes write back to the task). Links inside a card open natively.
- Completed cards render struck-through with a ✓ chip; start/deadline dates show as chips when set.

### Rich cards

Card bodies render with Amplenote's own editor markup (`htmlFromContent`) — bold/italic, checkboxes, links, and Rich Footnotes look and behave exactly as they do in notes, including clickable web URLs. The first inline image in a task's content is embedded at the bottom of its card.

### Column management

Hover a column header for its tools:

- **← / →** move the column left/right — headings are reordered in the note to match.
- **✎ renames** the column by editing the heading text in place.
- **✕ deletes** the column after an explicit confirmation checkbox; its tasks move to the top of the note (under no heading). The last remaining column cannot be deleted.

### WIP limits

Click a column's count chip to set a Work-In-Progress limit (0 or blank clears it). Once a column exceeds its limit, the chip turns red showing `count / limit`. Limits warn rather than block drops, and are stored per-tab keyed by column name.

### Tag boards

A tab can also be a **tag board**: columns are the tag's immediate sub-tags (plus a synthetic **No sub-tag** column), and cards are the notes carrying the tag.

- **Live data**: cards come straight from a tag query on every render — notes tagged anywhere in Amplenote appear automatically, no refresh gymnastics needed.
- **Drag & drop retags**: dropping a note card on another column swaps its sub-tag; dropping on *No sub-tag* removes the sub-tag. The base tag always stays.
- **`+` creates a note** in the target column's sub-tag (or the base tag).
- **Click a card** to open that note in the main editor.
- Column headers show a color dot matching each sub-tag's color. Structural column tools (rename/delete/reorder/WIP) don't apply here — those columns *are* tags.

### Refresh & sync

The board is pull-based (Amplenote plugins have no push notifications):

- **⟳ Tab** re-pulls the active tab's board data.
- **⇉ All** re-pulls every tab (progress bar shown; full behavior lands in Phase 4).

### Themes

Click the 🎨 theme button or press **T** (outside inputs) to cycle 8 curated palettes with light/dark parity. The choice persists locally (instant) and to your account settings (cross-device).

| Theme | Type | | Theme | Type |
| :--- | :--- | :--- | :--- | :--- |
| ☀️ Clean Daylight | light | | 🌌 Midnight Slate | dark |
| 📜 Sepia Parchment | light | | ❄️ Nord Arctic | dark |
| 🍵 Matcha Latte | light | | 🧛 Dracula Neo | dark |
| 🧊 Nord Frost | light | | 🌲 Emerald Forest | dark |

## Technical Details

This plugin is modular and compiled with `esbuild` into a single IIFE-style artifact that Amplenote executes safely.

```
kanban.js                  # Entry: appOption launcher, renderEmbed, onEmbedCall dispatcher
lib/
  core/
    constants.js           # Settings keys, defaults, id generation
    tabsConfig.js          # Tab persistence (validated load/save + pure CRUD ops)
    sessionState.js        # Session-scoped state (round-trip counter)
    demoBoard.js           # Hardcoded demo content shown before any tabs exist
  api/
    markdownIndex.js       # Pure parsing layer: markdown → columns/cards mapping
    noteBoard.js           # Builds a note board snapshot via the API
    taskOps.js             # Task mutations: move/complete/create/edit
    columnOps.js           # Structural heading ops: create/rename/delete/reorder
  features/
    embedActions.js        # Command dispatch table for all embed actions
  ui/
    themes.js              # 8-theme registry + CSS variable palettes
    boardTemplate.js       # Full HTML document assembly (theme CSS + layout)
    clientScript.js        # Embed-side JS: rendering, DnD, theme cycler
  utils/
    html.js                # HTML escaping + script-safe JSON embedding
    formatTimestamp.js     # Timestamp formatting helper
test/                      # Jest suites (run: npx jest "anp-15-kanban/test")
build/
  kanban.compiled.js       # Build artifact to paste into the plugin note
```

Build with `node esbuild.js 15` from the repository root (or `npm run build -- 15`).

### Architecture notes

- **Embed round trip:** the embed iframe is sandboxed and cannot call `app.*`. Every action flows `callAmplenotePlugin(action, payload)` → `onEmbedCall` → mutation → `app.context.renderEmbed()` with freshly derived state. The client applies optimistic DOM updates between dispatch and re-render.
- **Source of truth:** board data is always re-derived from notes/settings at render time; nothing board-shaped is cached server-side.
- **Task relocation:** moves rewrite the note with a minimal line diff (tasks carry their metadata in an HTML comment, making lines locatable). Section-scoped `replaceNoteContent` is deliberately avoided because API section boundaries split at *every* heading, which would truncate content below sub-headings.
- **Theming:** all colors are `[data-theme]` CSS custom properties (`--kb-*`), enabling 0ms client-side theme switching per the cross-plugin cycling-themes standard.

## Roadmap

- **Phase 4** — Multi-tab management UI, per-tab vs refresh-all progress, date-format setting UI
- **Phase 5** — Labels with tag-color coding, start-date picker, create-note-from-card, search, cross-tab column drag
