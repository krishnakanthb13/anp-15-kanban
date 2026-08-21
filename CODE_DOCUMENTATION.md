# Code Documentation — Kanban Plugin

Technical reference for contributors. Scope: v0.0.9 (rebuild Phases 0–2).

## Entry Point (`kanban.js`)

The plugin object exposes three surfaces:

| Member | Role |
| :--- | :--- |
| `appOption["Open Kanban Board"]` | Launcher: `app.openEmbed()` + navigate to `https://www.amplenote.com/notes/plugins/{pluginUUID}` |
| `renderEmbed(app)` | Builds the full HTML document for the embed iframe on every render |
| `onEmbedCall(app, ...args)` | Command receiver for the sandboxed embed; bumps the session round-trip counter, then dispatches via `handleEmbedAction` |

`buildViewState(app)` (exported for testability) assembles the serializable state consumed by the client: tabs config, board snapshots per tab, theme/date settings, session meta.

## Module Map

```
lib/
  core/
    constants.js       # Settings keys ("Kanban Tabs" / "Kanban Theme" / "Kanban Date Format"),
                       # defaults, id generator, tab-shape validation
    tabsConfig.js      # JSON persistence (load/save) + pure CRUD ops (add/remove/activate/move)
    sessionState.js    # Module-scope session state (round-trip counter); never authoritative
    demoBoard.js       # Hardcoded demo tab shown while no real tabs are configured
  api/
    markdownIndex.js   # Pure parsing layer: markdown text → column spans → task placement
    noteBoard.js       # buildNoteBoard(): assembles a board snapshot via app.* calls
    taskOps.js         # Mutations: moveTaskToColumn, createTaskInColumn, setTaskCompleted,
                       # updateCardContent
  features/
    embedActions.js    # Command dispatch table: ping, saveTheme, setActiveTab, refreshTab,
                       # refreshAll, moveCard, createCard, editCard
  ui/
    themes.js          # 8-theme registry, palette tokens, CSS builder, isValidThemeId guard
    boardTemplate.js   # HTML document assembly (theme CSS + layout CSS + script injection)
    clientScript.js    # The embed-side JS source (ES5-style string; runs inside the iframe).
                       # CONSTRAINT: as a template literal it must contain no regex
                       # literals, backslash escapes, or embedded double quotes —
                       # they get unescaped in transit and corrupt the emitted script.
                       # Use String.fromCharCode() for such characters.
  utils/
    html.js            # escapeHtml, toJsonForScript (script-safe JSON embedding)
    formatTimestamp.js # Unix timestamp formatting
```

## The Embed Round-Trip Contract

The embed iframe is sandboxed — it cannot call `app.*`. Every privileged operation follows one loop:

1. **Dispatch** — client calls `window.callAmplenotePlugin(action, payload)`.
2. **Mutate** — `onEmbedCall` → `handleEmbedAction` routes to a handler which performs the real work against notes/tasks/settings.
3. **Re-render** — handler ends with `app.context.renderEmbed()`; `renderEmbed` re-derives **all** state fresh from the source of truth (embed args are never trusted).
4. **Optimistic UI** — the client updates its own DOM immediately on drag/drop; the next render reconciles any drift.

## Markdown Indexing (`api/markdownIndex.js`)

Tasks in Amplenote markdown carry their metadata in an HTML comment (`<!-- {"uuid": "..."} -->`), which makes physical lines locatable:

1. `parseHeadings` finds all heading lines; `findColumnLevel` picks the shallowest level present as the column level.
2. `buildColumnSpans` gives each column a line span ending at the next same-level heading — deeper sub-headings stay inside their parent column.
3. `findTaskLines` locates each task's line by tolerant uuid regex; `assignTasksToColumns` places tasks by position (tasks above the first heading → implicit "Unsorted" pseudo-column).

## Task Relocation (`api/taskOps.js`)

Moves compute a **minimal line diff on freshly-read markdown** and write once via whole-note `replaceNoteContent`.

> Deliberate deviation from ds.md §3: section-scoped `replaceNoteContent` was rejected because API section boundaries split at *every* heading — with nested sub-headings, a section-scoped write would truncate content below the sub-heading.

Index-shift handling: when the removed task line sits before the destination heading, the destination span shifts by one before insertion. Status strings (`moved` / `same-column` / `no-task` / …) let callers distinguish real moves from no-ops — completion only toggles on `"moved"`.

## Drop-to-Done Semantics (`features/embedActions.js`)

`handleMoveCard` re-checks against fresh markdown whether the target is the last heading column:
- last column → `setTaskCompleted(true)` (native strikethrough),
- any other column → reopen (`completedAt: null`),
- same-column drop → nothing is written.

## Rich Cards & WIP Limits

`buildNoteBoard` enriches every card via `app.htmlFromContent` (Amplenote's own editor markup — functional Rich Footnotes and links) with graceful fallback to the plain-text preview on failure, plus `imageUrl` extracted from the first inline `![...](...)`. Per-tab `columnLimits` (keyed by column name, sanitized in `normalizeConfig`) flow into columns as `wipLimit`; the client turns the count chip red past the limit — warnings only, drops are never blocked.

## Column Management & Confirm-Before-Write

`api/columnOps.js` performs structural heading operations as whole-note minimal rewrites on freshly-read markdown:

- **create** appends a heading matching the shallowest existing level (H2 if none),
- **rename** rewrites one heading line in place (markers preserved),
- **delete** extracts the column's content above the first remaining heading (or the very top, when deleting the first column); refuses to delete the last remaining column,
- **reorder** rebuilds the note from preamble + heading/content blocks in the requested order; malformed id permutations abort without writing.

Destructive actions gate on prompts in `embedActions`: `deleteColumn` requires an affirmative checkbox before any write runs.

## Theming (`ui/themes.js`)

All colors are `[data-theme="<id>"]` CSS custom properties (`--kb-*`). The client cycler switches the attribute (0ms), persists to `localStorage`, then round-trips `saveTheme` for cross-device sync. Server-side writes pass through `isValidThemeId` (strict registry check — unlike `resolveTheme`, no silent fallback).

## Testing & Build

```bash
npx jest "anp-15-kanban/test"     # scoped suite (needs --experimental-vm-modules)
node esbuild.js 15                # bundle → build/kanban.compiled.js
```

- Pure logic (indexing, config ops, template assembly) is tested without mocking; API-touching modules use an `app` mock object.
- **Compile check**: `clientScript.test.js` parses the emitted embed script with `new Function(source)` — a SyntaxError there means template-literal escaping corrupted the code. This guards a real production incident where `/["\\]/g` reached the browser as invalid `/["\]/g`.
- `test/smoke.bundle.cjs` executes the compiled artifact end-to-end (render → action → re-render) as a pre-release sanity check.
