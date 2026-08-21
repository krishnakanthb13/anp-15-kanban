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
- When dragging a column between tabs should also update the note
- If the Column is reordered, then the headings in the note should be reordered in the same way in the note. Also possible Addition, Removal (upon approval) of columns, tasks. This applies to both types of boards.
- For boards based on tags, if a note is created outside of the plugin and assigned a tag that is associated with that board, it should appear as a card in the board when opened.
- Clear visual marker should be for tag and note based tab. Name of the note or tag should be the tab name, if too lengthy then should be cut.
- Ability to add multiple tags also should be possible.
- Make the UI and UX modern and clean and simple and fast.
- Also add a refresh button to pull single tab, and all tabs data.
- Show a proper progress bar when it is syncing.
- See if you can bring in more useful features to proceed with.

---

The plan is grounded against the live Amplenote Plugin API docs (App Interface, Note Interface, Appendix I types) rather than assumptions — I pulled the actual `app.*` function signatures, task/section/noteHandle shapes, and Rich Footnote mechanics before writing this.

The single biggest architectural call it makes: the board has to live in an `app.openEmbed` section, not inline in the note, because plugins can't take over note rendering the way Obsidian's Kanban plugin does — and the embed iframe is sandboxed, so every drag/edit becomes a round trip through `onEmbedCall` rather than a direct `app.*` call from the UI. That constraint shapes almost everything downstream (optimistic UI caching, why tag-boards can skip sync logic entirely since `filterNotes` is always live, etc.).

A few things flagged as genuine open problems rather than papered over:
- "Open note links in Peek Viewer" isn't a primitive that exists yet — it'd be a plugin-drawn preview embed, not Amplenote's native peek.
- No optimistic locking on `replaceNoteContent`, so structural rewrites (column reorder/delete/rename) need a confirm-before-write pattern to avoid silently clobbering concurrent edits.
- Peek Viewer doesn't exist on mobile at all, so 1.f.ii/iii need a fallback path.

I couldn't find the `cycling-themes.md` reference file in this environment (it's not on disk here) — flagged that gap explicitly in §8 rather than guessing at its contents.

---

# Amplenote Kanban Plugin — Implementation Plan

Grounded against the current Amplenote Plugin API (App Interface, Note Interface, Appendix I: Types, and Actions docs, checked live against `amplenote.com/help/developing_amplenote_plugins*`). Function names, argument shapes, and return values below are the real ones — not guesses — so this can be built against directly.

---

## 1. The one architectural decision everything else depends on

Amplenote plugins have **no way to take over the main note-editing surface**. You cannot replace the note view the way Obsidian's Kanban plugin replaces a note's rendering. The tools available to render custom UI are:

- **Inline embed** — a `renderEmbed`-backed block placed in a note via embed markdown syntax, rendered in an isolated iframe.
- **`app.openSidebarEmbed`** — opens the same `renderEmbed` output in the Peek Viewer (desktop/web only — **returns `false` on mobile**, since there's no Peek Viewer there).
- **`app.openEmbed`** — adds a persistent sidebar/drawer section running `renderEmbed`, navigable via a generated URL (`https://www.amplenote.com/notes/plugins/{pluginUUID}`). This is the closest thing to a "full app" surface and is the right home for a multi-tab kanban board.
- **`app.prompt` with `type: "embed"`** — embeds inside a dialog. Not useful here beyond small pickers.

**Decision: the board lives in an `app.openEmbed` section** (a dedicated, addressable plugin surface, one per plugin — not per note), with an internal tab bar built inside the embed's own HTML/JS. This gives you:
- A stable place to deep-link to (bookmark, sidebar shortcut).
- Room for a real drag-and-drop UI, unconstrained by note-rendering limits.
- The ability to keep it open persistently rather than re-invoking a note-scoped embed each time.

A secondary, optional inline embed (`{embed}` block placed at the top of the source note itself) can offer a "preview" launcher — a static-ish render with a "Open board" button that calls `app.openSidebarEmbed` — but the primary editable board should not try to live inline in the note, both for performance (SortableJS + many cards in a note-embedded iframe is heavy) and because inline embeds re-render awkwardly when the plugin needs to push frequent state updates.

**Critical embed constraint to design around:** the embed iframe is fully sandboxed — it cannot call `app.*` directly. It communicates back to the plugin's Node-ish execution context via `window.callAmplenotePlugin(...)`, which invokes the plugin's `onEmbedCall(app, ...args)` action, which *does* have `app` access. All actual reads/writes to notes/tasks must be round-tripped through `onEmbedCall`. This has real implications:
- Every drag-and-drop action, card edit, column rename, etc. becomes an async round trip: embed UI → `callAmplenotePlugin` → `onEmbedCall` (does the `app.*` work) → returns data → embed updates itself (or calls `app.context.renderEmbed()` to force a full re-render).
- The embed should hold a **client-side cached copy of board state** and optimistically update it, then reconcile with the authoritative result of the `onEmbedCall` round trip, rather than re-fetching everything on every interaction (or the UI will feel laggy).
- `app.context.updateEmbedArgs` + `app.context.renderEmbed()` is the mechanism to push a fresh board snapshot into the embed after a mutation.

---

## 2. Data model

### 2.1 Board types

Two board "kinds," matching the two milestones in the brief:

**Note board** (v1): one board = one note. Columns = the note's headings (via `app.getNoteSections`). Cards = tasks (`app.getNoteTasks`) that fall within each section's span.

**Tag board** (v2): one board = one tag. Columns = sub-tags of that tag (or a synthetic "No sub-tag" column). Cards = notes (`app.filterNotes({ tag })` / `app.notes.filter`) carrying that tag.

### 2.2 Tabs and persistence

A user can have many boards open as tabs. Tab configuration (which notes/tags are boarded, tab order, per-column settings like WIP limits, per-board date format overrides) is **not** something that lives naturally in any single note — it's plugin-level configuration. Store it via `app.setSetting` / `app.settings`:

```js
// app.settings values are always strings, so serialize
await app.setSetting("kanban.tabs", JSON.stringify(tabsConfig));
```

`tabsConfig` shape:

```json
{
  "tabs": [
    {
      "id": "tab_uuid_1",
      "kind": "note",
      "noteUUID": "…",
      "order": 0,
      "columnLimits": { "In Progress": 3 },
      "collapsed": false
    },
    {
      "id": "tab_uuid_2",
      "kind": "tag",
      "tag": "projects/partython",
      "order": 1,
      "columnLimits": {}
    }
  ],
  "activeTabId": "tab_uuid_1",
  "settings": {
    "dateFormat": "YYYY-MM-DD"
  }
}
```

This syncs across the user's devices automatically (that's what `app.setSetting` is for), satisfying "tabs should be persistent." Caveat called out honestly: `app.setSetting` docs note the updated value "is not guaranteed to be updated in `app.settings` before the next invocation" — so **don't** read-modify-write `app.settings` rapidly (e.g., on every drag). Debounce tab-config writes, and treat `app.context.refreshSettings()` as the way to pull the latest cross-device state when the embed section is (re)opened, not on every interaction.

Per-tab **board content** (columns/cards) is *not* stored in settings — it is always derived live from the note/tag, which is the source of truth. Settings only stores the *shape* of the tab list and per-column preferences layered on top.

### 2.3 Note board → column/card mapping

- `app.getNoteSections({ uuid })` returns ordered `section` objects, each with `heading: { text, level, anchor, index, href } | null`. Filter to sections whose `heading` is non-null and at the target level (recommend: only H1 **or** only H2, configurable per-board, to avoid ambiguity with nested headings) → these are your columns, in document order. That document order *is* the column order — no separate ordering field needed.
- The section with `heading: null` at the top of the note (content before the first matching heading) becomes an implicit "Unsorted" pseudo-column — this is also the drop target for 2.b ("delete a column... move existing tasks to the top of the note, under no heading in particular").
- Cards per column: `app.getNoteTasks({ uuid })` returns **all** tasks in the note flat, each task object includes `noteUUID` but **not** which section it's under — there is no direct "task → section" API. You must derive it yourself: get raw markdown via `app.getNoteContent`, locate each heading's line span (or use `app.getNoteSections` boundaries), and match each task's `content` text against the markdown between section boundaries to determine membership. This is the plugin's own parsing layer — build one `NoteMarkdownIndex` helper that, given note markdown + section list + task list, produces `{ sectionKey: [taskUUIDs] }`. This index is also what makes column-limit ordering deterministic (position within the section = card order).
- Last column = "Done": per requirement 1.b, dropping a card there should cross it out in the note. Use `app.updateTask(taskUUID, { completedAt: <now> })` — Amplenote's native task completion *is* the crossed-out state, so no custom strikethrough hacking is needed. This also means the "Done" column's cards should be sourced from `app.getNoteTasks({ uuid }, { includeDone: true })`, since done tasks are excluded by default.

### 2.4 Tag board → column/card mapping

- Columns = distinct immediate sub-tags of the board's tag. Get all tags via `app.getTags()` (returns `{ text, color, noteCount }` for every tag in the account), filter to `text.startsWith(boardTag + "/")` **and** exactly one path segment deeper (skip grandchildren — treat `parent/child/grandchild` as belonging to the `child` column, not a separate `child/grandchild` column, to keep the board 2-dimensional). A synthetic "No sub-tag" column holds notes that have the base tag but no matching sub-tag.
- Cards = notes: `app.filterNotes({ tag: "<column-tag>" })` (or `app.notes.filter`) returns `noteHandle[]`. Card display fields (title, first image, etc.) come from `app.getNoteContent` / `app.getNoteImages` per note, or `app.findNote` for metadata (`name`, `tags`, `updated`).
- **Externally-created notes auto-appearing** (explicit requirement): since tag-board cards are just a live `filterNotes` query, not a stored list, a note tagged from anywhere in Amplenote is automatically included next time the board queries — no special sync code needed. This is *why* tag boards should re-query on refresh rather than diffing a cached note list; it's the natural consequence of tags being the source of truth. Combine with `onNoteCreated` (a documented plugin action hook fired when notes are created) so the embed can proactively refresh instead of waiting for a manual refresh, when the plugin is actively open.

### 2.5 Task ↔ Card field mapping

| Card feature | Task field(s) |
|---|---|
| Card body / description | `task.content` (markdown) |
| Crossed out (Done column) | `task.completedAt` via `app.updateTask` |
| Start date (4.b) | `task.startAt` |
| Due/deadline chip | `task.deadline` |
| Important/urgent badges (bonus) | `task.important`, `task.urgent` |
| Repeat indicator (bonus) | `task.isRepeating`, `task.repeat` (RRULE string) |
| Label/tag-on-card (4.a) | encode as a note-link inside `task.content` (see §4.4) |
| First image (1.g) | parsed from `task.content` markdown (`![...](url)`) — tasks aren't covered by `app.getNoteImages` (that's note-scoped, not task-scoped), so this is a regex/markdown-AST scan of `task.content` itself for the first image node |

---

## 3. Cards — implementation notes per sub-requirement

**1.a Drag between columns → moves between headings.** On drop, the `onEmbedCall` handler needs to physically relocate the task's markdown line from under the old heading to under the new one. There is no `moveTask` primitive, so: read `task.content`, remove the task line from its old position via `app.replaceNoteContent(noteHandle, newSectionContent, { section: oldSection })`, then insert it at the target position via `app.replaceNoteContent(noteHandle, newSectionContent, { section: newSection })` (or `app.insertNoteContent` at end-of-section if appending). Do this as two section-scoped replacements rather than one whole-note replacement — section-scoped `replaceNoteContent` is safer against clobbering concurrent edits elsewhere in the note. Note the section-replace behavior: "the heading will not be replaced, only the *content* of the section" — so you're rewriting the column's task list as a block, not touching the heading text.

**1.b Drop into last column → crossed out.** `app.updateTask(taskUUID, { completedAt: Math.floor(Date.now()/1000) })`. Combine with the move logic above if the "Done" column corresponds to a real heading (recommended, so completed-under-a-heading matches user mental model) — otherwise just leave it in place and rely on `completedAt` alone with `includeDone: true` queries to surface it there.

**1.c `+` button per column.** `app.insertTask({ uuid }, { content })` inserts at the **beginning of the note**, not the column — so after inserting, immediately relocate it into the correct section the same way as 1.a (or, cleaner: build content-insertion directly via `app.insertNoteContent` targeted with `{ section }` at the right position instead of `insertTask` + relocate). Confirm with a quick prompt (`app.prompt`) or an inline embed text field for the card title before creating.

**1.d Per-column task limit (WIP limit).** Pure plugin-side concern — stored in `tabsConfig.tabs[].columnLimits`, enforced in the embed's UI (block/warn on drop past limit; Amplenote itself has no native column concept to limit). Show a `count / limit` chip in the column header; turn it red past limit rather than hard-blocking, since hard-blocking a drag the user has already committed to is bad UX — Obsidian's Kanban plugin also just warns.

**1.e Edit card → raw markdown.** Open a text-input surface in the embed (or `app.prompt` with a `type: "text"` input, pre-filled with `task.content`) and on submit call `app.updateTask(taskUUID, { content: newMarkdown })`.

**1.f Rich Footnotes in the read (non-editing) card view.**
- Rich Footnotes are just markdown links with a `description`: `[text][^1]` with a matching `[^1]: [href]() description text` block — this is literally the `link` type (`href`, `description`) from the API's type reference. In the embed's **read-only** card render, don't reinvent a markdown parser: call `app.htmlFromContent(task.content)` (returns HTML using Amplenote's own editor markup, wrapped in a readonly `ample-editor` container) and inject that HTML into the card. This automatically gets you correct Rich Footnote, bold/italic, checkbox, and link rendering for free, matching in-app appearance exactly.
- **i. Web URLs clickable** — comes for free from `app.htmlFromContent`; the anchor tags are real `<a href>`s. Just make sure the embed doesn't block target `_blank` navigation.
- **ii. Note links open in Peek Viewer.** Intercept clicks on internal note-link anchors (Amplenote note URLs match `https://www.amplenote.com/notes/{uuid}` — detectable by pattern) in the embed's JS, `preventDefault()`, and call back via `callAmplenotePlugin` to an `onEmbedCall` handler that runs `app.openSidebarEmbed(...)` rendering a small "note preview" sub-embed (itself just calling `app.getNoteContent` + `app.htmlFromContent` for that note). This is a real gap today: **there's no documented `app.openNotePeek(uuid)` primitive** — Peek Viewer is currently only reachable as *the destination for a plugin's own `renderEmbed` output*, not as a generic "peek at this note" opener. So "open in peek viewer" for arbitrary note links means the plugin renders its own lightweight note-preview embed into the Peek Viewer, not that it invokes Amplenote's native note-peek UI. Flag this explicitly to the user as a v1 approximation (a plugin-drawn preview, not Amplenote's native hover-peek), matching the brief's own "Probably support for this coming soon" hedge.
- **iii. RF combos (image + text + URL) → sidebar embed.** Same `app.openSidebarEmbed` mechanism, rendering the full RF `description` markdown (via `app.htmlFromContent`) inside the sidebar embed rather than a plain popup.

**1.g First image embedded at card bottom.** Scan `task.content` for the first `![...](...)` markdown image token (a simple regex is sufficient — task content markdown is a constrained subset per Appendix III) and render an `<img>` in the card footer. If the image is a Rich-Footnote-embedded image rather than an inline one, it won't be caught by this — scope 1.g to literal inline images only, per the requirement's own wording ("first image found in the task body").

---

## 4. Columns

**2.a Create column.** Prompt for a name, insert a new heading at the end of the note (`app.insertNoteContent({ uuid }, "\n## New Column\n", { atEnd: true })`), refresh sections.

**2.b Delete column → tasks move to top, no heading.** Read the section's task content, `app.replaceNoteContent(noteHandle, "", { section })` to blank the section (this removes the heading's *content* but — confirmed from docs — does **not** remove the heading itself), then separately strip the heading line via a whole-note `app.replaceNoteContent` pass (since there's no "delete this heading" primitive), and prepend the extracted task lines to the note's leading unheaded section. Needs explicit **user confirmation** (`app.alert` with actions) before running, since it's a destructive multi-step rewrite.

**2.c Rename column → edits heading text.** No direct "rename heading" call exists either; do it as a full-note markdown replace: fetch `app.getNoteContent`, string-replace the specific heading line (matched by section `anchor`/`index` for disambiguation when duplicate heading text exists), write back via `app.replaceNoteContent`. Because you're patching the *whole* note markdown here (not a section), do this as a targeted, minimal diff (replace exactly the heading line) rather than round-tripping the fully reserialized content, to reduce risk of clobbering concurrent user edits or losing formatting nuances not modeled by your board's understanding of the note.

**2.d Reorder columns → reorders headings in the note.** Same whole-note-markdown-rewrite approach as 2.c: reconstruct the note by reassembling sections (each section's heading + its content block) in the new order and writing the full document via `app.replaceNoteContent(noteHandle, fullContent)` (no `section` option = whole-note replace). This is the single riskiest write in the plugin — see §7 (conflict handling) before shipping it.

---

## 5. Refresh & Sync

**3. Refresh button.** Two tiers, both explicit UI buttons per the brief ("refresh button to pull single tab, and all tabs"):
- **Per-tab refresh:** re-run `getNoteSections` + `getNoteTasks` (note board) or `getTags` + `filterNotes` (tag board) for just the active tab, rebuild that tab's board state, `updateEmbedArgs` + `renderEmbed()`.
- **Refresh all:** loop tabs sequentially (not `Promise.all` in parallel — be considerate of Amplenote's backend and avoid a burst of simultaneous requests when a user has many tabs), updating a progress indicator between each.

There is **no push/webhook mechanism** for plugins to be told "this note changed elsewhere" — Amplenote plugins are pull-based. So "refresh" is fundamentally manual-trigger or timed-poll, never truly real-time. Be upfront about this rather than implying live sync. A reasonable middle ground: poll the *active* tab only, on a conservative interval (e.g. every 60–120s) **only while the embed is visibly open**, using `app.context.renderEmbedTarget` to detect that, and stop polling entirely when the section isn't the frontmost surface (no such visibility signal is exposed, so in practice: poll only while `openEmbed`'s section is active, accept it'll keep ticking in the background if the user navigates away and don't over-engineer visibility detection for v1).

**Progress bar while syncing (explicit ask).** Since each tab's refresh is a handful of sequential awaited calls, drive a simple `x / totalTabs` progress bar in the embed UI during "refresh all," and a lightweight spinner (not a bar — nothing to show fractional progress of) during single-tab refresh, which is normally 1–3 API calls and should complete in well under a second on a warm connection.

---

## 6. Extra functionality

**4.a Label a card with a note, color-coded.** "Labeling" = adding a note-link to the task pointing at the label note, e.g. append `#[[Label Name]]` (Amplenote's tag-style note reference) or a plain `[[Label Name]]` link into `task.content`. Color: pull the label note's **tag** color via `app.getTags()` (tag objects carry a hex `color`) — i.e., the natural way to "color-code by label" is to require the label to itself be a tagged/colored note, and use that tag's color for the card accent, not to invent a separate color picker. **Multiple labels on one card** (explicit requirement 4.a.i, and the "multiple tags" bonus ask): render as multiple small color chips rather than trying to blend/pick one dominant color — blending is a worse UX than just showing 2–4 dots.

**4.b Start dates on cards.** Not a text convention (Obsidian's `@{date}` approach) — Amplenote tasks natively have `startAt`/`deadline`/`endAt` fields. Expose a native date picker in the card-edit view (`app.prompt` with a `type: "date"` input, or a custom date field in the embed) writing straight to `app.updateTask(taskUUID, { startAt })`. This is materially better than the Obsidian reference model since there's no markdown-convention parsing/round-tripping risk at all.

**4.c Create note from card.** `app.createNote(title)` → returns a UUID; then either (a) move the task's full content into the new note's body via `app.insertNoteContent` and delete/replace the original task with a link to the new note (`app.getNoteURL({ uuid })` gives the linkable URL), or (b) leave the task in place and just attach the new note as a "detail" link (safer default — non-destructive, matches how 4.a already models note-linking on cards).

**4.d Search.** Two tiers: (1) instant client-side filter over the currently-loaded board's cached card titles/content — zero API calls, typeahead-fast; (2) "search everywhere" fallback using `app.searchNotes(query)` for tag boards (full-text) when the user wants results beyond what's currently boarded. Keep these visibly distinct in the UI (a "search this board" vs. "search all notes" toggle) so users aren't confused about scope.

---

## 7. Settings

**5.a Customizable date format.** Store a format string (e.g. `"YYYY-MM-DD"`, `"DD MMM"`) per-account in `tabsConfig.settings.dateFormat` (§2.2), applied when rendering `startAt`/`deadline` chips. Needs a date-formatting library loaded into the embed per **Appendix IV: Loading external libraries** (e.g. day.js, which the existing "Timestamp Generator" community plugin already uses successfully per the ecosystem search above) — load it inside the embed's HTML via a `<script src="...">` tag pointing at a CDN, not inside the sandboxed plugin-code execution environment (which has its own, separate constraints per Appendix II).

Also expose per-board settings pulled from `app.getNoteSettings`/`app.setNoteSetting` where they map naturally — e.g. `maxOpenTasks` already exists as a native note setting and is conceptually adjacent to (but not a replacement for) your per-column WIP limits; surface it as a read-only reference, don't conflate the two.

---

## 8. Tabs, theming, and cross-tab behavior (the "Additional Requirements" block)

**Tab persistence + refresh-on-switch.** Tab list lives in `app.setSetting` (§2.2); switching tabs re-derives that tab's board state fresh rather than trusting a stale cache, satisfying "data refreshed when switching between tabs" without needing background polling for inactive tabs.

**Theme support.** Use `app.context.lightDarkMode` (`"light"` | `"dark"`) to pick a CSS variable set at embed-render time, and re-check it on every `renderEmbed` invocation (it can change between renders if the user flips app-wide theme). Per the frontend-design guidance for this environment: define your palette as CSS custom properties (`--kanban-bg`, `--kanban-column-bg`, `--kanban-card-bg`, `--kanban-accent`, etc.) computed once per render from `lightDarkMode`, rather than hardcoding hex values scattered through markup — this is what makes "should be equal in both light and dark themes" tractable, since you're tuning one small palette table instead of auditing every element. (The referenced `cycling-themes.md` common-issues file wasn't available to fetch in this environment — if it documents specific known Amplenote theming pitfalls beyond light/dark parity, e.g. how `lightDarkMode` interacts with OS-level auto theme switching or specific CSS properties that don't reliably inherit into embed iframes, route it into this section before build starts.)

**Drag a column between tabs → updates the note.** This is the most structurally awkward requirement in the brief: a "column" (heading+tasks) moving from Tab A's note into Tab B's note is really "cut this section out of Note A, paste it as a new section into Note B." Implement as: extract section content from source note (same mechanics as column delete, §4.2.b), append as a new heading+content block into the target note (`app.insertNoteContent(..., atEnd: true)`), then remove it from the source. Sequence matters for safety — **insert into the target before removing from the source**, so a mid-operation failure leaves you with a duplicate (recoverable/visible) rather than data loss (silent). Note this only makes sense between two **note boards** — moving a "column" onto a tag board doesn't have a coherent meaning (tag-board columns are sub-tags, not headings), so this drag interaction should be visually disabled/rejected when the target tab is tag-based.

**Column/task reorder, add, remove propagating to the note — "upon approval."** Treat every structural note-mutating action (not simple field edits like moving a card or ticking a date) as requiring a confirm step: batch the intended diff, show a plain-language summary ("Move 'Fix login bug' to Done, cross out 3 tasks"), and only call the `app.replaceNoteContent`/`app.updateTask` calls after the user confirms. This is cheap insurance against the note-rewrite operations in §4 (2.b–2.d) going wrong silently, and matches the brief's own explicit "(upon approval)" caveat.

**Tab visual markers + name truncation.** Note-board tabs get one icon/accent (e.g. a document glyph), tag-board tabs get another (a tag glyph + the tag's own color from `app.getTags()`), so board *kind* is legible even before reading the label. Tab label = note name (`noteHandle.name`) or tag text, CSS `text-overflow: ellipsis` truncated with the full name in a `title` tooltip — simple, no need for custom truncation logic in JS.

---

## 9. Suggested phased roadmap

**Phase 0 — scaffold.** Plugin note with manifest table, `app.openEmbed` entry point, empty `renderEmbed`/`onEmbedCall` round-trip proven end-to-end (a "hello world" board with hardcoded columns) before touching real note parsing. Reuse the AI-provider-abstraction and shared-reference patterns already established across the grammar-review and habit-tracker plugins for project layout consistency.

**Phase 1 — Note board MVP.** Sections→columns, tasks→cards, drag between columns (1.a), drop-to-done (1.b), `+` new card (1.c), raw-markdown card edit (1.e), manual refresh (3). No labels, no dates-UI, no tag boards yet. This alone is a shippable v1 matching the brief's stated "initial version."

**Phase 2 — Rich card rendering + column management.** Rich Footnote read rendering via `app.htmlFromContent` (1.f), first-image footer (1.g), WIP limits (1.d), column create/delete/rename/reorder (2.a–2.d) with the confirm-before-destructive-write pattern (§8).

**Phase 3 — Tag boards.** Second board kind, sub-tag columns, external-note auto-appearance (§2.4), tab-kind visual markers.

**Phase 4 — Multi-tab shell + settings.** Tab bar, persistent `tabsConfig`, per-tab refresh vs. refresh-all with progress bar, date-format setting, theme-variable pass for light/dark parity.

**Phase 5 — Extras.** Labels with tag-color coding + multi-label chips (4.a), native start-date field (4.b), create-note-from-card (4.c), two-tier search (4.d), cross-tab column drag (§8).

---

## 10. Open risks and questions to resolve before Phase 2

1. **Concurrent edit safety on structural rewrites** (heading rename, reorder, column delete/merge) — Amplenote has no plugin-facing optimistic-locking/version-check on `replaceNoteContent`. Two clients (or the user editing the note directly while the board is open in another tab) racing a structural rewrite can silently clobber each other. Mitigate with the confirm-before-write pattern (§8) plus, ideally, a "note changed since you opened this board" staleness check — re-fetch `getNoteContent` immediately before any structural write and diff against what the board last read, aborting with a re-sync prompt if they differ.
2. **Heading-level ambiguity.** If a note mixes H1 and H2 headings, which level defines "a column"? Recommend making this a per-board setting (default: the shallowest heading level present in the note) rather than a hardcoded H2 assumption.
3. **Column-delete cross-tab semantics** — deferred to Phase 5/§8, but worth deciding early whether "delete column" ever cascades into a cross-tab drag-remove, or stays strictly single-note.
4. **Mobile degradation.** No Peek Viewer on mobile means 1.f.ii/iii (sidebar-opened links/RF embeds) need a mobile fallback — likely a full-screen `app.prompt`-hosted embed or plain `app.alert` text dump — and `app.openSidebarEmbed` returning `false` should be the trigger to branch into that fallback, not a silent no-op.
5. **Performance ceiling** for large tag boards — `app.getTaskDomainTasks`-style large datasets are documented as recommending async-iterator consumption over array materialization; the equivalent caution applies to `filterNotes` over a heavily-used tag. Paginate/virtualize card rendering in the embed rather than mounting hundreds of DOM cards at once.
6. **100k-character content limits** on `insertNoteContent`/`replaceNoteContent` — irrelevant for normal boards, but the whole-note rewrites in §4 (2.c/2.d) should defensively check note size first on very large notes rather than assuming the call will succeed.

---
