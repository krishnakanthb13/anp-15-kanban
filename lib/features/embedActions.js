import { SETTINGS_KEYS } from "../core/constants.js";
import { loadTabsConfig, saveTabsConfig, setActiveTab, tabById } from "../core/tabsConfig.js";
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
import { retagNote, createTaggedNote, openNote } from "../api/noteOps.js";

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
  if (tab.kind === "tag" && !tab.tag) return null;
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
 * @param {Object} app
 * @param {{tabId?: string, columnId?: string}} [payload]
 */
export async function handleCreateCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.columnId) return;

  if (tab.kind === "tag") {
    const result = await app.prompt("New note in column", {
      inputs: [{ label: "Note name:", type: "text" }],
    });
    if (!result || !result[0] || !String(result[0]).trim()) return;

    const toSub = String(payload.columnId).startsWith(SUB_PREFIX)
      ? payload.columnId.slice(SUB_PREFIX.length)
      : null;
    await createTaggedNote(app, result[0], toSub ? [toSub] : [tab.tag]);
    await rerender(app);
    return;
  }

  const result = await app.prompt("New card", {
    inputs: [{ label: "Card content (markdown):", type: "text" }],
  });
  if (!result || !result[0]) return;

  await createTaskInColumn(app, tab.noteUUID, { columnId: payload.columnId }, result[0]);
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
  if (!result || result[0] === undefined || result[0] === task.content) return;

  await updateCardContent(app, cardId, result[0]);
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
  if (!result || !result[0] || !String(result[0]).trim()) return;

  const created = await createColumn(app, tab.noteUUID, result[0]);
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
  if (!result || !result[0] || !String(result[0]).trim() || String(result[0]) === columnName) return;

  const renamed = await renameColumn(app, tab.noteUUID, payload.columnId, result[0]);
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
  if (!result || result[0] !== true) return;

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
  if (!result) return;

  const parsed = parseInt(String(result[0]).trim(), 10);
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
  createColumn: handleCreateColumn,
  renameColumn: handleRenameColumn,
  deleteColumn: handleDeleteColumn,
  moveColumn: handleMoveColumn,
  setWipLimit: handleSetWipLimit,
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
