# Test Report — Visual Kanban Board (`anp-15`)

| Metric | Result |
| :--- | :--- |
| **Total Test Suites** | **18 passed**, 18 total ✅ |
| **Total Tests** | **190 passed**, 190 total ✅ |
| **Failed Tests** | **0** ❌ |
| **Skipped Tests** | **0** ⚠️ |
| **Confidence Score** | **10 / 10** 🎯 |
| **Regression Coverage** | Yes (Markdown Spans, Eisenhower Quadrants, Task Metadata Badges, Drag-and-Drop Columns & Tabs, Note/Tag Tabs, In-Memory 0ms Tab Switching, Note Heading Ordering, WIP Limits, Dynamic Sorting, Label Chips, 8 Themes) |

---

## Test Suite Breakdown

### 1. `noteBoard.test.js` (10 tests)
- **Happy Path**: Maps note markdown headings to columns and tasks to draggable cards.
- **Unsorted Column**: Preamble tasks above the first heading automatically group into an "Unsorted" column.
- **Rich Footnotes & Editor Markup**: Renders Amplenote rich editor content, images, and colored label pills.
- **Metadata & Badges**: Extracts Urgent, Important, Score, Time-blocks, Start/Due dates, and Recurring rules.
- **Edge Cases**: Empty notes, notes without headings, and notes with deeply nested sub-headings.

### 2. `tagBoard.test.js` (3 tests)
- **Happy Path**: Maps notes under a tag to columns, with headings inside each note structured as collapsible sections (`▼ / ▶`).
- **Card Organization**: Organizes tasks into their respective note headings.
- **Suppression**: Hides empty note columns and empty heading sections automatically.

### 3. `notesBoard.test.js` (4 tests)
- **Happy Path**: Lists tagged notes as columns and all internal tasks as cards.
- **Enrichment**: Enriches cards with rich HTML and colored tag labels.

### 4. `taskOps.test.js` (9 tests)
- **Task Movement (`moveTaskToColumn`)**: Relocates task lines under target headings in note markdown via minimal line diff.
- **Task Creation (`createTaskInColumn`)**: Inserts tasks directly under the designated heading.
- **Lifecycle**: Native completion toggling (`completedAt`), markdown content updates, and note-link label attachment.

### 5. `columnOps.test.js` (10 tests)
- **Column Creation (`createColumn`)**: Appends matching-level headings (`#`, `##`) to note markdown.
- **Column Renaming (`renameColumn`)**: Rewrites heading line preserving content markers.
- **Column Deletion (`deleteColumn`)**: Confirms and deletes heading, moving tasks to top.
- **Column Reordering (`reorderColumns`)**: Whole-note heading+content block reordering preserving preambles.
- **Cross-Note Transfer (`transferColumn`)**: Moves heading and its tasks safely to another note (insert-before-remove).

### 6. `tabsConfig.test.js` (16 tests)
- **Normalization & Persistence**: Robust JSON settings parsing, fallback defaults, corruption tolerance.
- **Tab Operations**: Adding Note/Tag tabs, removing tabs, repairing `activeTabId`, moving tabs left/right.
- **Drag & Drop Reordering (`moveTab`)**: Reorders tab array by drag index.
- **WIP Limit Sanitization**: Validates and sanitizes per-column WIP limits.

### 7. `embedActions.test.js` (24 tests)
- **Dispatcher**: Strict validation and routing for all client iframe actions.
- **0ms Tab Switching (`handleSetActiveTab`)**: Persists active tab silently in settings without disruptive iframe re-renders.
- **Tab Drag & Drop (`handleReorderTabs`)**: Reorders tabs and saves config quietly in the background.
- **Column Reorder Persistence (`handleSaveColumnsToNote`)**: Prompts confirmation before rewriting note headings.
- **Card Menu & Triage**: Edit full details modal, labels, start/due dates, snooze, and new note creation.
- **Search & Transfers**: Global search navigation and cross-board column transfers.

### 8. `themes.test.js` (7 tests)
- **Registry & Parity**: 8 curated themes (4 Light, 4 Dark) with 1:1 light/dark parity.
- **CSS Variable Token System**: Exposes full `--kb-*` design tokens on `[data-theme="<id>"]`.
- **Security**: Escapes angle brackets and JSON characters for safe client-side embedding.

### 9. `boardTemplate.test.js` (6 tests)
- **HTML Assembly**: Complete HTML document generation with injected state and theme globals.
- **Security**: Script breakout prevention via `toJsonForScript`.
- **Controls**: Header toolbar with vector SVG icons, tab bar, board canvas, and toast container.

### 10. `clientScript.test.js` (11 tests)
- **Client Boot**: Boots from injected state with 0ms theme and tab initialization.
- **Column & Tab Drag-and-Drop**: Live in-memory visual reordering and drop zone event binding.
- **Sorting & Reset**: In-memory sorting (`Note Order`, `Score`, `Date`, `Important`, `Urgent`), `💾 Save Sort`, and `↺ Reset`.
- **Rich UX & Hotkeys**: Search focus on `/`, theme cycle on `T`, and animated toast notifications.

### 11. `markdownIndex.test.js` (14 tests)
- **Heading Parser**: Detects heading levels and builds column boundary spans.
- **Task Line Locator**: Tolerant UUID parsing in Amplenote task comments.
- **Section Content Slicers**: Extracts and updates lines under specific headings without corrupting nested content.

### 12. `kanban.test.js` (4 tests)
- **Plugin Lifecycle**: Validates `renderEmbed`, `onEmbedCall`, and launch option wiring.

### 13. `demoBoard.test.js` (2 tests)
- **Zero-Config Onboarding**: Injects a guided Demo Board when no user tabs are configured.

### 14. `sessionState.test.js` (2 tests)
- **Round-Trip Counter**: Session round-trip bump and snapshot isolation.

### 15. `constants.test.js` (5 tests)
- **Constants & Validation**: Schema validation, default tab configuration, unique ID generator.

### 16. `html.test.js` (5 tests)
- **HTML Utilities**: HTML sanitization and script escape utilities.

### 17. `prompt.test.js` (3 tests)
- **Prompt Utilities**: Safe modal prompt unboxing and array resolution.

### 18. `noteOps.test.js` (7 tests)
- **Note Operations**: Note tag swapping, creation under `-reports/-kanban`, and Amplenote navigation.
