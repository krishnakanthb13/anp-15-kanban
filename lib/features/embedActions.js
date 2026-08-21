import { SETTINGS_KEYS } from "../core/constants.js";
import {
  loadTabsConfig,
  saveTabsConfig,
  setActiveTab,
  tabById,
  createTab,
  addTab,
  removeTab,
  moveTab,
} from "../core/tabsConfig.js";
import { isValidThemeId } from "../ui/themes.js";
import { moveTaskToColumn, createTaskInColumn, setTaskCompleted, updateCardContent } from "../api/taskOps.js";
import { buildColumnSpans, resolveSpan } from "../api/markdownIndex.js";
import {
  createColumn,
  renameColumn,
  deleteColumn,
  reorderColumns,
} from "../api/columnOps.js";
import { buildTagBoard, NOSUB_ID, SUB_PREFIX } from "../api/tagBoard.js";
import { buildNotesBoard, NOTE_PREFIX } from "../api/notesBoard.js";
import { retagNote, createTaggedNote, openNote } from "../api/noteOps.js";
import { addLabelToTask } from "../api/taskOps.js";
import { transferColumn } from "../api/columnOps.js";
import { firstValue } from "../utils/prompt.js";

/**
 * Re-renders the embed with fresh state. This is the standard tail of every
 * mutating action: mutate source-of-truth, then trigger a full re-render.
 * @param {Object} app - The Amplenote app context.
 */
async function rerender(app) {
  if (typeof app.context?.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}

/**
 * Proves the embed round trip: client -> onEmbedCall -> renderEmbed.
 * The session round-trip counter is bumped by the dispatcher in kanban.js,
 * and the fresh render displays it.
 */
export async function handlePing(app) {
  await rerender(app);
  return { ok: true };
}

/**
 * Persists the selected theme so it follows the user across devices.
 * @param {Object} app
 * @param {{themeId?: string}} [payload]
 */
export async function handleSaveTheme(app, payload) {
  const themeId = payload && typeof payload.themeId === "string" ? payload.themeId : null;
  if (!themeId || !isValidThemeId(themeId)) return;
  await app.setSetting(SETTINGS_KEYS.theme, themeId);
}

/**
 * Activates a tab and persists the choice.
 * @param {Object} app
 * @param {{tabId?: string}} [payload]
 */
export async function handleSetActiveTab(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return;
  const config = setActiveTab(await loadTabsConfig(app), tabId);
  await saveTabsConfig(app, config);
  await rerender(app);
}

/** Refreshes the active tab's board data (full re-render). */
export async function handleRefreshTab(app) {
  await rerender(app);
}

/** Refreshes all tabs' board data (full re-render). */
export async function handleRefreshAll(app) {
  await rerender(app);
}

/* ---------------- tab management (Phase 4) ---------------- */

/**
 * Adds a new tab via a single prompt: kind (note/tag) plus the note or tag
 * to board. The new tab is appended and activated.
 * @param {Object} app
 */
export async function handleAddTab(app) {
  const result = await app.prompt("Add board tab", {
    inputs: [
      {
        label: "Board type:",
        type: "radio",
        options: [
          { label: "Note board (headings as columns)", value: "note" },
          { label: "Tag board (sub-tags as columns)", value: "tag" },
        ],
      },
      { label: "Note to board (for note boards):", type: "note" },
      { label: "Tag to board (for tag boards):", type: "tags", limit: 1 },
    ],
  });
  if (!result) return;

  const [kind, noteHandle, tagValue] = result;
  const tagText = Array.isArray(tagValue) ? tagValue[0] : tagValue;

  let tab = null;
  if (kind === "note") {
    if (!noteHandle || !noteHandle.uuid) return;
    tab = createTab({
      kind: "note",
      name: noteHandle.name || "Note board",
      noteUUID: noteHandle.uuid,
    });
  } else if (kind === "tag") {
    if (!tagText || !String(tagText).trim()) return;
    const clean = String(tagText).trim();
    tab = createTab({ kind: "tag", name: clean.split("/").pop(), tag: clean });
  } else {
    return;
  }

  const config = addTab(await loadTabsConfig(app), tab);
  await saveTabsConfig(app, config);
  await rerender(app);
}

/**
 * Closes a tab (the underlying note/tag is untouched; only the board entry goes).
 * @param {Object} app
 * @param {{tabId?: string}} [payload]
 */
export async function handleCloseTab(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return;

  const config = removeTab(await loadTabsConfig(app), tabId);
  await saveTabsConfig(app, config);
  await rerender(app);
}

/**
 * Moves a tab one position left/right.
 * @param {Object} app
 * @param {{tabId?: string, direction?: string}} [payload]
 */
export async function handleMoveTabDir(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return;
  const direction = payload.direction === "left" ? "left" : "right";

  const config = await loadTabsConfig(app);
  const index = config.tabs.findIndex(t => t.id === tabId);
  if (index === -1) return;
  const target = direction === "left" ? index - 1 : index + 1;
  if (target < 0 || target >= config.tabs.length) return;

  await saveTabsConfig(app, moveTab(config, index, target));
  await rerender(app);
}

/**
 * Sets the date format used for card date chips (e.g. YYYY-MM-DD, DD MMM).
 * @param {Object} app
 */
export async function handleSetDateFormat(app) {
  const config = await loadTabsConfig(app);
  const result = await app.prompt("Date format for card chips", {
    inputs: [{
      label: "Format tokens: YYYY MM DD MMM (e.g. DD MMM YYYY):",
      type: "text",
      value: config.settings.dateFormat,
    }],
  });
  const fmt = firstValue(result);
  if (!fmt || !String(fmt).trim()) return;

  config.settings.dateFormat = String(fmt).trim();
  await saveTabsConfig(app, config);
  await rerender(app);
}

/**
 * Resolves a configured tab for an action, or null when the action can't apply.
 * @param {Object} app
 * @param {{tabId?: string}} payload
 */
async function resolveNoteTab(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return null;
  const tab = tabById(await loadTabsConfig(app), tabId);
  if (!tab) return null;
  if (tab.kind === "note" && !tab.noteUUID) return null;
  if ((tab.kind === "tag" || tab.kind === "notes") && !tab.tag) return null;
  return tab;
}

/**
 * Determines whether a column id refers to the last heading column of the
 * note (the implicit "Done" column per requirement 1.b).
 * @param {Object} app
 * @param {string} noteUUID
 * @param {string} columnId
 */
async function isLastColumn(app, noteUUID, columnId) {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  const { columns } = buildColumnSpans(markdown);
  return columns.length > 0 && columns[columns.length - 1].id === String(columnId);
}

/**
 * Moves a card between columns. Branches by board kind:
 * - note boards: relocate the task's line; last column completes/reopens.
 * - tag boards: retag the note (swap its sub-tag); "No sub-tag" clears it.
 * - notes boards: move the task to the target note (native noteUUID update).
 * @param {Object} app
 * @param {{tabId?: string, cardId?: string, toColumnId?: string}} [payload]
 */
export async function handleMoveCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.cardId || !payload.toColumnId) return;

  if (tab.kind === "tag") {
    await moveNoteCard(app, tab, payload.cardId, payload.toColumnId);
    return;
  }

  if (tab.kind === "notes") {
    await moveTaskToNote(app, tab, payload.cardId, payload.toColumnId);
    return;
  }

  const doneTarget = await isLastColumn(app, tab.noteUUID, payload.toColumnId);
  const status = await moveTaskToColumn(app, tab.noteUUID, payload.cardId, {
    columnId: payload.toColumnId,
  });

  // Completion only toggles on real moves — a no-op drop (same column)
  // must never silently complete/reopen a task.
  if (status === "moved") {
    await setTaskCompleted(app, payload.cardId, doneTarget);
    await rerender(app);
  }
}

/**
 * Moves a task to a different note column of a notes board. The source
 * column is derived from fresh board data; same-column drops are no-ops.
 * @param {Object} app
 * @param {{tag: string}} tab
 * @param {string} taskUuid
 * @param {string} toColumnId - "note:<uuid>"
 */
async function moveTaskToNote(app, tab, taskUuid, toColumnId) {
  const targetUUID = String(toColumnId).startsWith(NOTE_PREFIX)
    ? toColumnId.slice(NOTE_PREFIX.length)
    : null;
  if (!targetUUID) return;

  const board = await buildNotesBoard(app, tab.tag);
  const fromCol = board.columns.find(c => c.cards.some(card => card.id === taskUuid));
  if (fromCol && fromCol.id === String(toColumnId)) return; // same column

  await app.updateTask(taskUuid, { noteUUID: targetUUID });
  await rerender(app);
}

/**
 * Retags a note when its card is dropped on another sub-tag column of a tag
 * board. The source column is derived from fresh board data (source of truth).
 * @param {Object} app
 * @param {{tag: string}} tab
 * @param {string} noteUUID
 * @param {string} toColumnId
 */
async function moveNoteCard(app, tab, noteUUID, toColumnId) {
  const board = await buildTagBoard(app, tab.tag);
  const fromCol = board.columns.find(c => c.cards.some(card => card.id === noteUUID));
  const fromSub = fromCol && fromCol.id.startsWith(SUB_PREFIX)
    ? fromCol.id.slice(SUB_PREFIX.length)
    : null;
  const toSub = toColumnId.startsWith(SUB_PREFIX) ? toColumnId.slice(SUB_PREFIX.length) : null;

  const sameColumn = (fromCol && fromCol.id === String(toColumnId)) ||
    (!fromCol && toColumnId === NOSUB_ID);
  if (sameColumn) return;

  await retagNote(app, noteUUID, { fromSub, toSub });
  await rerender(app);
}

/**
 * Creates a new card at the top of a column after prompting for content.
 * - note boards: creates a task under the target heading.
 * - tag boards: creates a new note tagged with the target sub-tag (or base tag).
 * - notes boards: inserts a task directly into the target note.
 * @param {Object} app
 * @param {{tabId?: string, columnId?: string}} [payload]
 */
export async function handleCreateCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.columnId) return;

  if (tab.kind === "notes") {
    const targetUUID = String(payload.columnId).startsWith(NOTE_PREFIX)
      ? payload.columnId.slice(NOTE_PREFIX.length)
      : null;
    if (!targetUUID) return;

    const content = firstValue(await app.prompt("New task", {
      inputs: [{ label: "Task content (markdown):", type: "text" }],
    }));
    if (!content) return;
    await app.insertTask({ uuid: targetUUID }, { content });
    await rerender(app);
    return;
  }

  if (tab.kind === "tag") {
    const result = await app.prompt("New note in column", {
      inputs: [{ label: "Note name:", type: "text" }],
    });
    const name = firstValue(result);
    if (!name || !String(name).trim()) return;

    const toSub = String(payload.columnId).startsWith(SUB_PREFIX)
      ? payload.columnId.slice(SUB_PREFIX.length)
      : null;
    await createTaggedNote(app, name, toSub ? [toSub] : [tab.tag]);
    await rerender(app);
    return;
  }

  const result = await app.prompt("New card", {
    inputs: [{ label: "Card content (markdown):", type: "text" }],
  });
  const content = firstValue(result);
  if (!content) return;

  await createTaskInColumn(app, tab.noteUUID, { columnId: payload.columnId }, content);
  await rerender(app);
}

/**
 * Opens a tag-board card's note in the main editor.
 * @param {Object} app
 * @param {{cardId?: string}} [payload]
 */
export async function handleOpenCard(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;
  await openNote(app, cardId);
}

/**
 * Opens a raw-markdown editor prompt for a card and saves changes.
 * @param {Object} app
 * @param {{cardId?: string}} [payload]
 */
export async function handleEditCard(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;

  const task = await app.getTask(cardId);
  if (!task) return;

  const result = await app.prompt("Edit card (raw markdown)", {
    inputs: [{ label: "Content:", type: "text", value: task.content || "" }],
  });
  const content = firstValue(result);
  if (content === null || content === undefined || content === task.content) return;

  await updateCardContent(app, cardId, content);
  await rerender(app);
}

/* ---------------- column management (Phase 2) ---------------- */

/**
 * Resolves a configured NOTE-board tab for structural actions.
 * Tag-board columns are tags themselves — renaming/deleting/reordering them
 * is deliberately unsupported.
 * @param {Object} app
 * @param {{tabId?: string}} payload
 */
async function resolveNoteBoardTab(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  return tab && tab.kind === "note" ? tab : null;
}

/**
 * Resolves a note tab plus the current heading text of one of its columns.
 * @param {Object} app
 * @param {{tabId?: string, columnId?: string}} [payload]
 * @returns {Promise<{tab: Object, columnName: string}|null>}
 */
async function resolveColumn(app, payload) {
  const tab = await resolveNoteBoardTab(app, payload);
  if (!tab || !payload.columnId) return null;

  const markdown = await app.getNoteContent({ uuid: tab.noteUUID });
  const { columns } = buildColumnSpans(markdown);
  const span = resolveSpan(columns, payload.columnId);
  if (!span) return null;
  return { tab, columnName: span.name };
}

/**
 * Creates a new column (heading appended at the end of the note).
 * @param {Object} app
 * @param {{tabId?: string}} [payload]
 */
export async function handleCreateColumn(app, payload) {
  const tab = await resolveNoteBoardTab(app, payload);
  if (!tab) return;

  const result = await app.prompt("New column", {
    inputs: [{ label: "Column name:", type: "text" }],
  });
  const name = firstValue(result);
  if (!name || !String(name).trim()) return;

  const created = await createColumn(app, tab.noteUUID, name);
  if (created) await rerender(app);
}

/**
 * Renames a column heading in the note after prompting for the new name.
 * @param {Object} app
 * @param {{tabId?: string, columnId?: string}} [payload]
 */
export async function handleRenameColumn(app, payload) {
  const resolved = await resolveColumn(app, payload);
  if (!resolved) return;
  const { tab, columnName } = resolved;

  const result = await app.prompt("Rename column", {
    inputs: [{ label: "Column name:", type: "text", value: columnName }],
  });
  const name = firstValue(result);
  if (!name || !String(name).trim() || String(name) === columnName) return;

  const renamed = await renameColumn(app, tab.noteUUID, payload.columnId, name);
  if (renamed) await rerender(app);
}

/**
 * Deletes a column after explicit confirmation. Its tasks move to the top of
 * the note (under no heading). This is a destructive structural write, so it
 * requires an affirmative checkbox — no silent rewrites.
 * @param {Object} app
 * @param {{tabId?: string, columnId?: string}} [payload]
 */
export async function handleDeleteColumn(app, payload) {
  const resolved = await resolveColumn(app, payload);
  if (!resolved) return;
  const { tab, columnName } = resolved;

  const result = await app.prompt(`Delete "${columnName}"?`, {
    inputs: [
      {
        label: "I understand: the heading is removed and its tasks move to the top of the note.",
        type: "checkbox",
        value: false,
      },
    ],
  });
  if (firstValue(result) !== true) return;

  const deleted = await deleteColumn(app, tab.noteUUID, payload.columnId);
  if (deleted) await rerender(app);
}

/**
 * Moves a column one position left/right by rewriting the heading order.
 * @param {Object} app
 * @param {{tabId?: string, columnId?: string, direction?: string}} [payload]
 */
export async function handleMoveColumn(app, payload) {
  const tab = await resolveNoteBoardTab(app, payload);
  if (!tab || !payload.columnId) return;
  const direction = payload.direction === "left" ? "left" : "right";

  const markdown = await app.getNoteContent({ uuid: tab.noteUUID });
  const { columns } = buildColumnSpans(markdown);
  const index = columns.findIndex(c => c.id === String(payload.columnId));
  if (index === -1) return;

  const target = direction === "left" ? index - 1 : index + 1;
  if (target < 0 || target >= columns.length) return; // already at the edge

  const order = columns.map(c => c.id);
  [order[index], order[target]] = [order[target], order[index]];

  const moved = await reorderColumns(app, tab.noteUUID, order);
  if (moved) await rerender(app);
}

/**
 * Sets or clears a per-column WIP limit (keyed by column name on the tab).
 * A limit of 0 / blank clears it. Limits warn (red chip), never hard-block.
 * @param {Object} app
 * @param {{tabId?: string, columnId?: string}} [payload]
 */
export async function handleSetWipLimit(app, payload) {
  const resolved = await resolveColumn(app, payload);
  if (!resolved) return;
  const { tab, columnName } = resolved;

  const current = (tab.columnLimits && tab.columnLimits[columnName]) || "";
  const result = await app.prompt(`WIP limit for "${columnName}"`, {
    inputs: [{
      label: "Max cards (0 or blank = no limit):",
      type: "string",
      value: String(current),
    }],
  });
  const raw = firstValue(result);
  if (raw === null || raw === undefined) return;

  const parsed = parseInt(String(raw).trim(), 10);
  const config = await loadTabsConfig(app);
  const storedTab = tabById(config, tab.id);
  if (!storedTab) return;

  const limits = { ...(storedTab.columnLimits || {}) };
  if (Number.isInteger(parsed) && parsed > 0) limits[columnName] = parsed;
  else delete limits[columnName];
  storedTab.columnLimits = limits;

  await saveTabsConfig(app, config);
  await rerender(app);
}

/* ---------------- extras (Phase 5) ---------------- */

/**
 * Per-card "more" menu: add a label, set the start date, or create a note
 * from the card. Note boards only.
 * @param {Object} app
 * @param {{cardId?: string}} [payload]
 */
export async function handleCardMenu(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;

  const task = await app.getTask(cardId);
  if (!task) return;

  const choice = firstValue(await app.prompt("Card actions", {
    inputs: [{
      label: "What do you want to do?",
      type: "radio",
      options: [
        { label: "Add label (note link)", value: "label" },
        { label: "Set start date", value: "date" },
        { label: "Create note from card", value: "note" },
      ],
    }],
  }));
  if (!choice) return;

  if (choice === "label") {
    const handle = firstValue(await app.prompt("Add label", {
      inputs: [{ label: "Pick a note to use as label:", type: "note" }],
    }));
    if (!handle || !handle.name) return;
    await addLabelToTask(app, cardId, handle.name);
    await rerender(app);
    return;
  }

  if (choice === "date") {
    const value = firstValue(await app.prompt("Set start date", {
      inputs: [{ label: "Start date (blank clears):", type: "date" }],
    }));
    if (value === null || value === undefined) return;
    const trimmed = String(value).trim();
    const startAt = trimmed ? Math.floor(new Date(trimmed).getTime() / 1000) : null;
    if (trimmed && Number.isNaN(startAt)) return; // unparseable date: no write
    await app.updateTask(cardId, { startAt });
    await rerender(app);
    return;
  }

  if (choice === "note") {
    const title = String(task.content || "").replace(/\s+/g, " ").trim().slice(0, 80) || "Note from card";
    const uuid = await createTaggedNote(app, title);
    if (!uuid) return;
    // Non-destructive attach (plan §6 4.c option b): leave the task in place,
    // link the new note from it.
    await addLabelToTask(app, cardId, title);
    await rerender(app);
  }
}

/**
 * Full-text search across all notes (the second search tier). Shows a
 * selectable result list and opens the chosen note.
 * @param {Object} app
 * @param {{query?: string}} [payload]
 */
export async function handleGlobalSearch(app, payload) {
  const query = payload && typeof payload.query === "string" ? payload.query.trim() : "";
  if (!query) return;

  const results = (await app.searchNotes(query)) || [];
  if (!results.length) {
    await app.alert(`No notes found for "${query}"`);
    return;
  }

  const options = results.slice(0, 20).map(n => ({ label: n.name || n.uuid, value: n.uuid }));
  const picked = firstValue(await app.prompt(`Results for "${query}"`, {
    inputs: [{ label: `${results.length} matching note(s) - pick one to open:`, type: "select", options }],
  }));
  if (!picked) return;
  await openNote(app, picked);
}

/**
 * Moves a whole column (heading + tasks) to another note-board tab.
 * Insert-into-target happens before removal-from-source, so a mid-operation
 * failure leaves a visible duplicate rather than silent data loss.
 * @param {Object} app
 * @param {{tabId?: string, columnId?: string}} [payload]
 */
export async function handleMoveColumnToTab(app, payload) {
  const resolved = await resolveColumn(app, payload);
  if (!resolved) return;
  const { tab, columnName } = resolved;

  const config = await loadTabsConfig(app);
  const candidates = config.tabs.filter(t => t.kind === "note" && t.noteUUID && t.id !== tab.id);
  if (!candidates.length) {
    await app.alert("No other note-board tabs to move this column to.");
    return;
  }

  const targetId = firstValue(await app.prompt(`Move "${columnName}" to another board`, {
    inputs: [{
      label: "Target tab:",
      type: "select",
      options: candidates.map(t => ({ label: t.name, value: t.id })),
    }],
  }));
  if (!targetId) return;

  const target = tabById(config, targetId);
  if (!target || target.kind !== "note" || !target.noteUUID) return;

  const confirmed = firstValue(await app.prompt(`Move "${columnName}" to "${target.name}"?`, {
    inputs: [{
      label: "I understand: the heading and its tasks move to the other note.",
      type: "checkbox",
      value: false,
    }],
  }));
  if (confirmed !== true) return;

  const status = await transferColumn(app, tab.noteUUID, payload.columnId, target.noteUUID);
  if (status === "moved") await rerender(app);
}

/**
 * Renames a note column (the note itself) on a notes board.
 * @param {Object} app
 * @param {{tabId?: string, columnId?: string}} [payload]
 */
export async function handleRenameNote(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || tab.kind !== "notes" || !payload.columnId) return;
  const noteUUID = String(payload.columnId).startsWith(NOTE_PREFIX)
    ? payload.columnId.slice(NOTE_PREFIX.length)
    : null;
  if (!noteUUID) return;

  const note = await app.notes.find(noteUUID);
  const current = note?.name || "";
  const name = firstValue(await app.prompt("Rename note", {
    inputs: [{ label: "Note name:", type: "text", value: current }],
  }));
  if (!name || !String(name).trim() || String(name) === current) return;

  await app.setNoteName({ uuid: noteUUID }, String(name).trim());
  await rerender(app);
}

const ACTIONS = {
  ping: handlePing,
  saveTheme: handleSaveTheme,
  setActiveTab: handleSetActiveTab,
  refreshTab: handleRefreshTab,
  refreshAll: handleRefreshAll,
  moveCard: handleMoveCard,
  createCard: handleCreateCard,
  editCard: handleEditCard,
  openCard: handleOpenCard,
  addTab: handleAddTab,
  closeTab: handleCloseTab,
  moveTabDir: handleMoveTabDir,
  setDateFormat: handleSetDateFormat,
  createColumn: handleCreateColumn,
  renameColumn: handleRenameColumn,
  deleteColumn: handleDeleteColumn,
  moveColumn: handleMoveColumn,
  setWipLimit: handleSetWipLimit,
  cardMenu: handleCardMenu,
  globalSearch: handleGlobalSearch,
  moveColumnToTab: handleMoveColumnToTab,
  renameNote: handleRenameNote,
};

/**
 * Dispatches an embed action to its handler.
 * @param {Object} app - The Amplenote app context.
 * @param {Array} args - [action, payload] as passed from callAmplenotePlugin.
 * @returns {Promise<*>} handler result, or undefined for unknown actions.
 */
export async function handleEmbedAction(app, args) {
  const [action, payload] = args || [];
  const handler = ACTIONS[action];
  if (!handler) {
    console.warn(`Unknown embed action: ${action}`);
    return undefined;
  }
  return handler(app, payload);
}

