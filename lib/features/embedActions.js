import { SETTINGS_KEYS } from "../core/constants.js";
import { loadTabsConfig, saveTabsConfig, setActiveTab } from "../core/tabsConfig.js";
import { isValidThemeId } from "../ui/themes.js";

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

const ACTIONS = {
  ping: handlePing,
  saveTheme: handleSaveTheme,
  setActiveTab: handleSetActiveTab,
  refreshTab: handleRefreshTab,
  refreshAll: handleRefreshAll,
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
