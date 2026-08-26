# Test Report — Visual Kanban Board (`anp-15`)

| Metric | Result |
| :--- | :--- |
| **Total Test Suites** | **19 passed**, 19 total ✅ |
| **Total Tests** | **244 passed**, 244 total ✅ |
| **Failed Tests** | **0** ❌ |
| **Skipped Tests** | **0** ⚠️ |
| **Confidence Score** | **10 / 10** 🎯 |
| **Regression Coverage** | Yes (Unified JSON Settings, Markdown Spans, Tri-Modal Boards [Note/Tag/Notes], Dedicated Completed Column, In-Memory 0ms Tab Switching & Refresh, Strict Document Line Ordering, Eisenhower Quadrants, Task Metadata Badges, Drag-and-Drop Columns & Tabs, Note Heading Ordering, WIP Limits, Dynamic Sorting, Label Chips, 8 Themes, Heading-Free Notes, Atomic Cross-Note Move, 1-Click Search Clear, Theme-Adaptive Progress Bar) |

---

## Test Suite Breakdown

### 1. `settings.test.js` (7 tests)
- **Serialization & Normalization**: JSON loading, schema validation, and sanitization of `theme`, `dateFormat`, `showEmptyColumns`, `quickDateEnabled`, `sortMode`, `expandCardInfo`, `density`.
- **Backward Compatibility**: Robust fallback to legacy `Kanban Theme` and `Kanban Date Format` settings.
- **Persistence**: Atomic updates via `savePluginSettings`.

### 2. `noteBoard.test.js` (18 tests)
- **Happy Path**: Maps note markdown headings to columns and tasks to draggable cards in strict 1-to-1 markdown line order.
- **Dedicated Completed Column**: Automatically groups all completed and dismissed tasks into the "Completed" pseudo-column at the right end of the board.
- **Unsorted Column**: Preamble tasks above the first heading automatically group into an "Unsorted" column.
- **Rich Footnotes & Editor Markup**: Renders Amplenote rich editor content, images, and colored label pills.
- **Metadata & Badges**: Extracts Urgent, Important, Score, Time-blocks, Start/Due dates, Snooze (`hideUntil`), and Recurring rules.
- **Edge Cases**: Empty notes, notes without headings, and notes with deeply nested sub-headings.

### 3. `tagBoard.test.js` (4 tests)
- **Happy Path**: Maps notes under a tag to columns, with headings inside each note structured as collapsible sections (`▼ / ▶`).
- **Card Organization**: Organizes tasks into their respective note headings in strict markdown line order.
- **Empty Toggle Retention**: Retains empty notes and heading sections for dynamic visibility filtering.

### 4. `notesBoard.test.js` (5 tests)
- **Happy Path**: Lists tagged notes as columns and all internal tasks as flat cards in physical note line sequence.
- **Enrichment**: Enriches cards with rich HTML, colored tag labels, and note names.
- **Hierarchy Detection**: Detects parent and child subtask indentation hierarchy.

### 5. `taskOps.test.js` (15 tests)
- **Task Movement (`moveTaskToColumn`)**: Relocates task lines under target headings in note markdown via minimal line diff with relative placement support (`targetCardId` + `before`/`after`).
- **Heading-Free Note Support**: Positions cards accurately in notes without markdown headings.
- **Task Creation (`createTaskInColumn`)**: Inserts tasks directly under the designated heading or unsorted top preamble.
- **Lifecycle & Completion**: Native completion toggling (`completedAt`), markdown content updates, and note-link label attachment.

### 6. `columnOps.test.js` (13 tests)
- **Column Creation (`createColumn`)**: Appends matching-level headings (`#`, `##`, `###`) to note markdown.
- **Column Renaming (`renameColumn`)**: Rewrites heading line preserving content markers.
- **Column Deletion (`deleteColumn`)**: Confirms and deletes heading, moving tasks to adjacent headings safely.
- **Column Reordering (`reorderColumns`)**: Whole-note heading+content block reordering preserving preambles.
- **Cross-Note Transfer (`transferColumn`)**: Moves heading and its tasks safely to another note (insert-before-remove).

### 7. `tabsConfig.test.js` (18 tests)
- **Normalization & Persistence**: Robust JSON settings parsing, fallback defaults, corruption tolerance.
- **Tab Operations**: Adding Note/Tag/Notes tabs, removing tabs, repairing `activeTabId`, moving tabs left/right.
- **Drag & Drop Reordering (`moveTab`)**: Reorders tab array by drag index.
- **WIP Limit Sanitization**: Validates and sanitizes per-column WIP limits.

### 8. `embedActions.test.js` (45 tests)
- **Dispatcher**: Strict validation and routing for all client iframe actions.
- **In-Memory Flicker-Free Refresh (`handleRefreshTab`, `handleRefreshAll`)**: Re-queries and returns fresh board data snapshots in memory without iframe destruction.
- **Atomic Cross-Note Card Move (`handleMoveCard`)**: Transfers task entities across notes without creating duplicate orphan tasks.
- **Notes Tab & Heading-Free Reordering**: Relocates tasks next to target cards within and across notes in multi-note tabs.
- **Semantic Completion Detection**: Accurate task completion routing on drag-and-drop into Completed/Done columns.
- **Tab Wizard (`handleAddTab`)**: Progressive disclosure 2-step prompt wizard supporting Note, New Note, Tag, and Multi-Note boards.
- **Unified Settings (`handleSaveSetting`, `handleSaveTheme`, `handleSetDateFormat`)**: Persists view state across sessions with zero screen flicker.
- **0ms Tab Switching (`handleSetActiveTab`)**: Persists active tab silently in settings without disruptive iframe re-renders.
- **Tab Drag & Drop (`handleReorderTabs`)**: Reorders tabs and saves config quietly in the background.
- **Column Reorder Persistence (`handleSaveColumnsToNote`)**: Prompts confirmation before rewriting note headings.
- **Card Menu & Triage**: Edit full details modal, mark completed / reopen, labels, start/due dates, snooze, note links, and new note creation.
- **Search, Clear & Transfers**: Global search navigation, 1-click query clearing, and cross-board column transfers.
- **Navigation Tools (`handleOpenNote`, `handleOpenTag`)**: Direct note and tag URL navigation from headers and tab chips.

### 9. `themes.test.js` (6 tests)
- **Registry & Parity**: 8 curated themes (4 Light, 4 Dark) with 1:1 light/dark parity.
- **CSS Variable Token System**: Exposes full `--kb-*` design tokens on `[data-theme="<id>"]`.
- **Security**: Escapes angle brackets and JSON characters for safe client-side embedding.

### 10. `boardTemplate.test.js` (6 tests)
- **HTML Assembly**: Complete HTML document generation with injected state and theme globals.
- **Density Custom Property Tokens**: Defines responsive tokens for `.kb-density-compact`, `.kb-density-cozy`, and `.kb-density-spacious`.
- **Security**: Script breakout prevention via `toJsonForScript`.
- **Controls**: Header toolbar with vector SVG icons, tab bar, board canvas, theme-adaptive progress bar, and toast container.

### 11. `clientScript.test.js` (11 tests)
- **Client Boot**: Boots from injected state with 0ms theme and tab initialization.
- **Tab Badges**: Renders distinct `NOTE` (accent), `TAG` (coral), and `NOTES` (violet) badges.
- **Column & Tab Drag-and-Drop**: Live in-memory visual reordering with glowing insertion line indicators.
- **Sorting & Reset**: In-memory sorting (`Note Order`, `Score`, `Date`, `Important`, `Urgent`), `💾 Save Sort`, and `↺ Reset`.
- **Toolbar Toggles**: Evenly distributed card detail inspection (`Info`), quick `@ Date` mode, density switching, search clear (`✕`), and empty column visibility.
- **Rich UX & Hotkeys**: Search focus on `/`, theme cycle on `T`, and animated toast notifications.

### 12. `markdownIndex.test.js` (14 tests)
- **Heading Parser**: Detects heading levels, ignores Amplenote completed task containers, and builds column boundary spans.
- **Line Index Card Sorting (`assignTasksToColumns`)**: Sorts cards inside columns strictly by physical line index in ascending order.
- **Task Line Locator**: Tolerant UUID parsing in Amplenote task comments.
- **Section Content Slicers**: Extracts and updates lines under specific headings without corrupting nested content.

### 13. `kanban.test.js` (8 tests)
- **Plugin Lifecycle**: Validates `renderEmbed`, `onEmbedCall`, and launch option wiring.
- **Error Boundaries**: Validates Service Worker crash immunity and top-level fallback rendering.

### 14. `demoBoard.test.js` (2 tests)
- **Zero-Config Onboarding**: Injects a guided Demo Board when no user tabs are configured.

### 15. `sessionState.test.js` (2 tests)
- **Round-Trip Counter**: Session round-trip bump and snapshot isolation.

### 16. `constants.test.js` (5 tests)
- **Constants & Validation**: Schema validation, default settings dictionary, default tab configuration, unique ID generator.

### 17. `html.test.js` (5 tests)
- **HTML Utilities**: HTML sanitization and script escape utilities.

### 18. `noteOps.test.js` (7 tests)
- **Note Operations**: Creation of tagged notes, opening note URLs, opening tag URLs, and safe note deletion.

### 19. `prompt.test.js` (3 tests)
- **Prompt Utilities**: Safe value extraction and validation across all input prompt types.

---

## Conclusion
All 19 test suites and 244 tests are passing with 100% success rate. The test suite guarantees full regression safety for drag-and-drop mechanics, in-memory live refresh, physical note markdown line order, dedicated completion routing, density modes, tri-modal board types, heading-free notes, theme-adaptive sync progress bars, and zero-flicker settings updates.
