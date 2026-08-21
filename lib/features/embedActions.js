import { SETTINGS_KEYS } from "../core/constants.js";
import { loadTabsConfig, saveTabsConfig, setActiveTab, tabById } from "../core/tabsConfig.js";
import { isValidThemeId } from "../ui/themes.js";
import { moveTaskToColumn, createTaskInColumn, setTaskCompleted, updateCardContent } from "../api/taskOps.js";
import { buildColumnSpans } from "../api/markdownIndex.js";

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
 * Resolves the note tab for an action, or null when the action can't apply.
 * @param {Object} app
 * @param {{tabId?: string}} payload
 */
async function resolveNoteTab(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return null;
  const tab = tabById(await loadTabsConfig(app), tabId);
  if (!tab || tab.kind !== "note" || !tab.noteUUID) return null;
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
 * Moves a card between columns (drag & drop). Dropping into the last column
 * completes the task (crossed out); dragging back out reopens it.
 * @param {Object} app
 * @param {{tabId?: string, cardId?: string, toColumnId?: string}} [payload]
 */
export async function handleMoveCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.cardId || !payload.toColumnId) return;

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
 * Creates a new card at the top of a column after prompting for content.
 * @param {Object} app
 * @param {{tabId?: string, columnId?: string}} [payload]
 */
export async function handleCreateCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.columnId) return;

  const result = await app.prompt("New card", {
    inputs: [{ label: "Card content (markdown):", type: "text" }],
  });
  if (!result || !result[0]) return;

  await createTaskInColumn(app, tab.noteUUID, { columnId: payload.columnId }, result[0]);
  await rerender(app);
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

const ACTIONS = {
  ping: handlePing,
  saveTheme: handleSaveTheme,
  setActiveTab: handleSetActiveTab,
  refreshTab: handleRefreshTab,
  refreshAll: handleRefreshAll,
  moveCard: handleMoveCard,
  createCard: handleCreateCard,
  editCard: handleEditCard,
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
