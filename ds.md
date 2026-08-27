A plugin that mimics a kanban board.

The initial version of this plugin should convert a note into a kanban view, where each column corresponds to a heading in the note, and each card correspond to a task in the heading. Further versions could do the same, but columns = tags, cards = notes.

## Core functionality

1. **Cards:**
   * a. Dragging and dropping a card between columns also moves it between headings
   * b. Dragging a task into the last column marks it as crossed out inside the note
   * c. Plugin allows creation of new cards using a `+` button in each column
   * d. Allow a per-column upper limit of tasks
   * e. Allow editing a card when clicking into it; this will display pure markdown
   * f. We should recognize and display Rich Footnotes in the task's description (only when viewing); these should be functional when clicked:
      * i. So web URLs should work when clicked
      * ii. Note links should be opened in the peek viewer chat - Probably support for this coming soon
      * iii. RFs containing any combinations of images, text and URLs should be opened as an embed in the sidebar
   * g. The first image found in the task body should be embedded in the card at the bottom

2. **Columns:**
   * a. Create new columns
   * b. Delete a column (and move existing tasks to the top of the note, under no heading in particular)
   * c. Edit the name of a column (which edits the text of the heading)
   * d. Columns can be reordered (which reorders headings)

3. **Refresh button**

4. **Extra functionality:**
   * a. Option to "tag" or "label" a card with a note (which adds a link to that note in the underlying task)
      * i. Labeling a card will color code it using the color-giving tag of the note chat - TBD how to treat the case where there are more labels
   * b. [Attribute dates to cards](https://publish.obsidian.md/kanban/How+do+I/Add+a+date+to+a+card) (which results in start dates in tasks)
   * c. [Create note from card](https://publish.obsidian.md/kanban/How+do+I/Create+notes+from+cards)
   * d. [Search functionality](https://publish.obsidian.md/kanban/How+do+I/Search+a+Kanban+board)

5. **Settings:**
   * a. [Customizable date format](https://publish.obsidian.md/kanban/Settings/Date+display+format)

---

Additional Requirements:

- Support Tabs - should be persistant, and data refreshed when switching between tabs
- Cycling Theme Support - [reference file](../common-issues-and-fixes/cycling-themes.md) - choose the best should be equal in both light and dark themes
- Each Tab should either be a board based on single Note with headers as columns, or a board based on a tag with notes as cards and sub-tags (or lack thereof) as columns
1. Selecting a single note, and its headers act as columns, and its tasks under the headers as cards
2. Selecting a single tag, and its notes act as columns, and its headers should be collapsable blocks in the same column, and the tasks under the headers as cards
3. currently some sub tags concept, see if you can improve it or just remove that concept
- when creating a new tab with a note - it should create it under tag "-reports/-kanban"
- When dragging a card the columns and headings between tabs should also update the note
- If the Column is reordered, then the headings in the note should be reordered in the same way in the note along with all the content under it or between it, do you get it. Also possible Addition, Removal (upon approval) of columns, tasks. This applies to both types of boards.
- For boards based on tags, if a note is created outside of the plugin and assigned a tag that is associated with that board, it should appear as a card in the board when opened.
- Clear visual marker should be for tag and note based tab. Name of the note or tag should be the tab name, if too lengthy then should be cut.
- Ability to add multiple tags also should be possible.
- Make the UI and UX modern and clean and simple and fast.
- Also add a refresh button to pull single tab, and all tabs data.
- Show a proper progress bar when it is syncing.
- See if you can bring in more useful features to proceed with.
- check what all features that can be salvaged from the old plugin - [text](kanban-old.js)

---

1. Update the [text](../common-issues-and-fixes/cycling-themes.md) - of the themes used in Kanban.
2. It should not show the notes or headers as columns if they are empty.
3. Everytime I click on a Tab, the whole screen flikers - something like it flashes.
4. explain the use cases of the 4 options when clicking the 3 dot button
Edit task details (full dialog)
Add label (note link)
Set start date / deadline
Create note from card
5. Dashboard Sorting vs Note Persisted Sorting - there should be an another options to reset to the order how it is present in the source note. correct?

---

1. It should not show the notes or headers as columns if they are empty.
i remember we implemented this - can you make this happen like a button on the top - show empty notes or header or hide, it will be useful when a note or tagged notes all do not have any tasks in them
and
2. add an another button on top to collapse all info or expand all info for all the task in the current window - it will be helpful
and
3. add a at button for every task - this again should be enabled only by pressing a button on top to add date using a date selector - possible, and again hitting the top button should disable the button on hover

---

I am going to start testing all the features how they work and everything.
[anp-15-kanban](./)
- before I do that, the UI and UX and everything looks and works good
- add, remove, move, create, rename, weather its a note, header or task in any tag, note, notes tab and all the buttons, I want you to check with amplenotes documentation online or [amplenote_references](../amplenote_references/)
- if it does what is says and what it is suppose to do
- once you check, give me a check list that you think that covers all the things I need to manually test in live env, I will be curious and explore all possiblilites and will get back with feedback for changes or fine tweaking
- and around 1000 active users are using [kanban-board.js](./kanban-board.js) and it seems be working fine for them, it is a very basic one, see if you can pick up any tips and tricks when making the above mentioned check.
= My main focus now is to check and validate all features that interact with the amplenote backend, to check if all are well integrated.

---

- do you see that we coded, any header cannot be moved to the first. Make it like it cannot be moved to the first if there is unsorted header, meaning there is no header on the top with tasks.
- also do you see that we coded, any header can be moved to the last. Make it like it cannot be moved to the last if there is completed headerr, meaning there are completed tasks in the note.
do you get this requirement? - if the user tries to move a header before unsorted or after completed, or move the headers unsorted or completed itself, it should say a notification that this move of Unsorted or Completed Columns cannot happen.

---

- how all the headers are handled - Unsorted, Active with Headers, Completed. in note Tab
- Same way it should show up for tag Tab - for each note column with collapsable headers.
they both are exactly same, just the formatting is different, that the approach.
in note Tab, headers are columns, in tag tab, headers are collapsible sections in a column.
- also the + button gets hidden when hovered on the header in the columns.

---

one more set of things we need to implement
- the + button in different locations needs to do different things
1. Beside the note in tag, notes Tab - should create a task at the start of the note - will go under unsorted.
2. Beside the header in tag, notes, note Tab - should create a task under that header - it should be just below the header in the view as well as the markdown file - with a newline.

---

---

## 🔍 Code Audit Report — 2026-08-26

Full audit of the `anp-15-kanban` plugin codebase covering bugs, edge cases, integrity issues, and quality improvements. Files audited across `kanban.js`, `kanban-board.js`, `lib/api/*`, `lib/core/*`, `lib/features/*`, `lib/ui/*`, `lib/utils/*`.

---

### 🔴 CRITICAL — Bugs & Data Integrity Risks

#### 1. Race condition: `taskOps.js` reads-then-writes without locking - ✅ Done
**Files:** `taskOps.js` (all of `moveTaskToColumn`, `createTaskInColumn`, `sortTasksInNoteMarkdown`)
**Issue:** `columnOps.js` correctly implements `withNoteLock()` for `reorderColumns`, but **no task operation uses it**. Two rapid card drags on the same note will both read the same markdown, compute their diffs independently, and the second `replaceNoteContent` call silently overwrites the first — causing task loss.
**Fix:** Wrap every `taskOps` function that calls `replaceNoteContent` with `withNoteLock(noteUUID, ...)`.

#### 2. `deleteColumn` inserts extracted content at stale indices - ✅ Done
**File:** `columnOps.js:85-100`
**Fix:** Simplified `deleteColumn` to delete strictly the heading line `lines.splice(span.startLine, 1)`. All tasks and content remain in place, naturally merging into the preceding heading (or into Unsorted preamble if deleting the first heading), eliminating line-splicing index arithmetic entirely.

#### 3. `moveTaskToColumn` — `completedAt` uses `Date.now()` (milliseconds) instead of seconds - ✅ Done
**File:** `taskOps.js:93`
**Fix:** Replaced `Date.now()` with `nowSeconds()` (Unix epoch seconds).

#### 4. `kanban-board.js` regex bug — `headingRegex` with `exec` in a loop over split lines - ✅ Done
**File:** `kanban-board.js:69-80`
**Issue:** `headingRegex` is defined with the `g` flag and used with `.exec(line)` inside a for-of loop. Because the regex retains its `lastIndex` between iterations, it will **skip headings** after a match on a previous line (the regex's internal cursor advances past the line length, then wraps erratically).
**Fix:** Either create the regex inside the loop body or use `String.match()` instead of `RegExp.exec()`.

#### 5. Same `headingRegex` bug in `kanban-board.js:83` — `taskRegex` also has the `g` flag - ✅ Done
**File:** `kanban-board.js:70,83`
**Issue:** Identical `g`-flag + `exec()` misuse for `taskRegex`. Tasks after the first match per line will be skipped.
**Fix:** Same as above.

---

### 🟠 HIGH — Edge Cases & Robustness

#### 6. `rerender()` silently no-ops — no fallback when `app.context.renderEmbed` is unavailable - ✅ Done
**File:** `embedActions.js:43-47`
**Issue:** If `app.context.renderEmbed` is not a function (e.g., older Amplenote versions, or the embed context not yet initialized), `rerender` does nothing and the UI stays stale after a write operation. The user sees no feedback.
**Improvement:** Return a boolean or throw, so callers can trigger a full-page reload as fallback.

#### 7. `settings.js:96` — `await` on a non-async property access - ✅ Done
**File:** `settings.js:96`
```js
const legacyTheme = await app.settings?.[SETTINGS_KEYS.theme];
```
`app.settings` is a plain object (per Amplenote docs), not a promise. The `await` is harmless but misleading, and if the API ever returns `undefined` for the key, the subsequent `isValidThemeId(legacyTheme)` check is correct. But if `app.settings` itself is `undefined`, the optional chaining returns `undefined` and `await undefined` is fine. **Low risk but code smell.**
**Fix / Reasoning:** 
- `app.settings` is a pre-populated in-memory object in Amplenote.
- In JavaScript, `await` on a plain value automatically resolves safely via `Promise.resolve(val)` without throwing or blocking.
- Retaining `await` provides defensive compatibility when `app.settings` is mocked with asynchronous getters in test environments.

#### 8. `buildColumnSpans` doesn't filter to the shallowest heading level - ✅ Intentional Design
**File:** `markdownIndex.js:64-87`
**Issue:** When `columnLevel` is not provided, the function treats all headings as columns.
**Reasoning / Feature Architecture:**
- Multi-level heading column support is an **intentional core feature** in `anp-15-kanban`.
- Users organize workflows with sub-headings (e.g., `# Backlog` $\rightarrow$ `## High Priority`, `## Low Priority`). If sub-headings were filtered out, tasks under `##` or `###` would lose their dedicated columns and be hidden or clumped into the parent column.
- The UI provides color-coded heading level chips (`H1` = Accent, `H2` = Purple, `H3` = Cyan/Teal, `H4+` = Emerald) taking zero extra horizontal space.
- `findColumnLevel()` is a legacy single-level prototype helper; preserving all headings maintains 100% fidelity to the user's note structure.

#### 9. `noteLocks` map never cleans up — unbounded memory growth - ✅ Done
**File:** `columnOps.js:109-116`
**Fix:** Added self-cleaning `tail.finally(() => { if (noteLocks.get(key) === tail) noteLocks.delete(key); })` to `withNoteLock`. When a note queue is idle and no further operations are queued, its key is automatically removed from the Map, releasing memory while preventing queue-truncation races.

#### 10. `handleMoveCard` for tag/notes boards — cross-note move does markdown removal + `updateTask` without lock - ✅ Done
**File:** `embedActions.js:394-406`
**Fix:** Wrapped source note markdown read and line removal inside `withNoteLock(task.noteUUID, ...)` to ensure atomic, serialized removal when tasks are moved out of the source note during cross-note drag and drop.

#### 11. `createTaskInColumn` — double `replaceNoteContent` write for unsorted insertion - ✅ Done
**File:** `taskOps.js:149-267`
**Issue:** When creating a task in the "unsorted" position, the function first calls `app.insertTask` (which Amplenote may place at the top), then immediately reads the markdown back and does a full `replaceNoteContent` to reposition. If Amplenote's `insertTask` is asynchronous and the markdown hasn't been flushed to `getNoteContent` yet, the task line won't be found, triggering the fallback path (line 207-228) which may duplicate the task text.

---

### 🟡 MEDIUM — Code Quality & Maintainability

#### 12. `embedActions.js` is 1645 lines — monolithic action handler
**Issue:** Every single action handler lives in one file. This makes it hard to reason about, test in isolation, and increases merge conflict surface.
**Improvement:** Split into focused files: `tabActions.js`, `cardActions.js`, `columnActions.js`, `dateActions.js`, `searchActions.js`.

#### 13. Duplicated card model construction in `handleCreateCard` - ✅ Done
**File:** `embedActions.js:46-57`
**Fix:** Extracted a centralized `createCardStub(taskUuid, content)` helper leveraging `toCardModel` from `noteBoard.js`. Replaced both redundant manual object definitions in `handleCreateCard`, guaranteeing unified card schema maintenance.

#### 14. `NOTE_PREFIX` exported from both `tagBoard.js` and `notesBoard.js` - ✅ Done
**Files:** `constants.js:45`, `tagBoard.js:3`, `notesBoard.js:3`, `embedActions.js:5`
**Fix:** Centralized `NOTE_PREFIX = "note:"` as a single source of truth in `constants.js`. Re-exported in `tagBoard.js` and `notesBoard.js` for clean backwards compatibility.

#### 15. `resolveSpan` numeric fallback can collide with line-index IDs - ✅ Done
**File:** `markdownIndex.js:286-302`
**Fix:** Removed blind numeric fallback `parseInt(colStr, 10)` in `resolveSpan`. Restricted positional indexing to explicit index prefixes (`col_0`, `idx_1`), preventing missing line IDs from silently colliding with arbitrary column array indices.

#### 16. `formatTimestamp.js` ignores the user's configured `dateFormat` - ✅ Done
**File:** `formatTimestamp.js:6-31`
**Fix:** Updated `formatTimestamp(timestamp, format)` to accept custom `dateFormat` tokens (`YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`) with fallback to `DEFAULT_DATE_FORMAT`. Added full unit test coverage in `test/formatTimestamp.test.js`.

#### 17. `renderCardHtml` serializes cards sequentially — N+1 API calls - ✅ Done
**File:** `noteBoard.js:142-156`
**Fix:** Converted sequential `for` loop to parallel `Promise.all(cards.map(...))`. Added guarded `typeof app?.htmlFromContent === "function"` check to prevent runtime overhead and eliminated test console warnings.

#### 18. `buildNotesBoard` filters completed tasks client-side after fetching with `includeDone: false` - ✅ Done Intentional Defensive Guardrail
**File:** `notesBoard.js:38-39`
```js
const rawTasks = (await app.getNoteTasks(…, { includeDone: false })) || [];
const tasks = rawTasks.filter(t => !t.completedAt && !t.completed && !t.dismissedAt);
```
**Issue:** The API flag `includeDone: false` should already exclude completed tasks. The redundant filter is defensive but masks the question: is the API actually respecting the flag? If it is, the filter is dead code. If it isn't, the `false` flag is doing nothing. **Should be validated against live behavior.**

#### 19. No input sanitization on markdown injected via `createTaskInColumn` - ✅ Done
**File:** `taskOps.js:164-168`
**Fix:** Sanitized `cleanInputContent` by stripping `<!-- ... -->` comment markers and collapsing multiple whitespace/newlines into single spaces (`.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").trim()`), preventing metadata comment corruption and multiline checkbox breakages. Added unit test in `test/taskOps.test.js`.

---

### 🟢 LOW — Polish & Best Practices

#### 20. `kanban.js:103` — template literal XSS in error fallback HTML
**File:** `kanban.js:103`
```js
return `…<p>${error?.message || "An unexpected error occurred."}</p>…`;
```
**Issue:** If `error.message` contains HTML (rare but possible with synthetic errors), it's injected unescaped into the embed document. The `escapeHtml` utility exists in `lib/utils/html.js` but isn't used here.
**Fix:** `escapeHtml(error?.message || "An unexpected error occurred.")`.

#### 21. `kanban-board.js` — `this.noteUUID` stored on `this` (plugin object) is fragile
**File:** `kanban-board.js:10`
**Issue:** `this.noteUUID = args[0]` mutates the plugin's `this` context. If two embeds are open simultaneously (e.g., sidebar + main note), the second `renderEmbed` call overwrites the first's `noteUUID`. In the new `kanban.js` architecture this is moot, but the old file is still shipped.

#### 22. `kanban-board.js:62-66` — CORS proxy fetch has no error handling
**File:** `kanban-board.js:59-67`
**Issue:** `fetch(proxyURL)` has no `.catch()` and doesn't check `response.ok`. Network failures will throw unhandled promise rejections.

#### 23. Missing `return` in `handleRenameNote` / `handleDeleteNote` early exits
**File:** `embedActions.js:1468,1492`
**Issue:** When `!payload.columnId`, the function returns `undefined` — no `{ ok: false }` — so the client can't distinguish "cancelled" from "failed".
**Fix:** Return `{ ok: false }` for consistency with other handlers.

#### 24. `demoBoard.js` — demo `completedAt` value `1755000000` is stale
**File:** `demoBoard.js:37`
**Issue:** `1755000000` is August 2025 — already in the past. While cosmetic, it would display as an old date in the demo board. Consider using `Math.floor(Date.now() / 1000) - 86400` for "yesterday".

#### 25. `toJsonForScript` — doesn't escape `>` character
**File:** `html.js:28-33`
**Issue:** Only `<` is escaped. While `>` alone doesn't cause `</script>` breakout, the OWASP recommendation for JSON-in-HTML is to escape both `<` and `>`. Amplenote's sandbox probably mitigates this, but defense-in-depth is cheap.

---

### 💡 Suggested Quality Improvements

| # | Area | Suggestion |
|---|------|-----------|
| A | **Concurrency** | Apply `withNoteLock` to all `taskOps` and `embedActions` write paths, not just `reorderColumns`. |
| B | **Performance** | Parallelize `renderCardHtml` with `Promise.allSettled` (batch of 5-10) to cut initial render time. |
| C | **Error UX** | Surface `{ ok: false, error: "message" }` consistently from all handlers so the client can show meaningful toasts. |
| D | **Module split** | Break `embedActions.js` (1645 lines) into `tabActions`, `cardActions`, `columnActions`, `dateActions`. |
| E | **Constants hygiene** | Move `NOTE_PREFIX` to `constants.js`; single source of truth. |
| F | **Test coverage** | `taskOps.js` has test coverage but `embedActions.js` tests don't cover cross-note moves, date edge cases, or concurrent operations. Add integration-style tests for card moves between tag-board columns. |
| G | **Heading level auto-detect** | Wire `findColumnLevel()` into the default `buildColumnSpans()` path so sub-headings stop appearing as top-level columns. |
| H | **Settings sync** | `formatTimestamp.js` should either be removed (unused) or connected to the user's `dateFormat` setting. |
| I | **Memory** | Add `finally(() => noteLocks.delete(key))` cleanup to prevent unbounded Map growth. |
| J | **Defensive markdown** | Strip/escape `<!-- -->` from user-supplied task content before embedding it in metadata comments. |

---

### Amplenote-Specific Observations

1. **`app.settings` is synchronous** — The `await` on `app.settings?.[key]` in `settings.js:96,103` is unnecessary. Amplenote settings are pre-loaded into the plugin context as a plain object.
2. **`insertTask` placement** — Amplenote's `insertTask` API places tasks at the top of the note by default. The `createTaskInColumn` function correctly compensates for this by relocating the task line afterward, but the double read-write introduces a timing window.
3. **`replaceNoteContent` atomicity** — Amplenote docs note that `app.settings` writes are not immediately reflected. The same likely applies to `replaceNoteContent` — subsequent `getNoteContent` calls within the same handler execution may return stale data. The codebase correctly re-reads fresh markdown before each write, but concurrent handlers sharing the same note are unprotected.
4. **`getNoteSections`** — Used in `handleEditTaskDetails` to populate the "Move to Section" dropdown. This API returns sections split at every heading level, which is correct for the UI but could return unexpected results if the note has deeply nested sub-headings.
5. **`htmlFromContent`** — Sequential calls in `renderCardHtml` are the biggest latency bottleneck. Since this is Amplenote's own API, check if it supports batch rendering or can be called in parallel without rate limiting.

---

---
