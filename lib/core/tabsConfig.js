import { SETTINGS_KEYS, emptyTabsConfig, newId, isValidTab } from "./constants.js";

/**
 * Parses a raw settings string into an object, tolerating garbage.
 * @param {string|undefined} raw
 * @returns {*}
 */
function safeParse(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Sanitizes a tab's optional WIP-limit map ({columnName: limit}).
 * @param {*} raw
 * @returns {Object<string, number>} valid limits only (empty object otherwise).
 */
function normalizeColumnLimits(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out = {};
  for (const [name, limit] of Object.entries(raw)) {
    if (typeof name === "string" && name && Number.isInteger(limit) && limit > 0) {
      out[name] = limit;
    }
  }
  return out;
}

/**
 * Normalizes any parsed value into a valid tabs config, merging defaults.
 * Tolerant by design: corrupt or partial data degrades to defaults instead of throwing.
 * @param {*} raw
 * @returns {{tabs: Array, activeTabId: string|null, settings: {dateFormat: string}}}
 */
export function normalizeConfig(raw) {
  const base = emptyTabsConfig();
  if (!raw || typeof raw !== "object") return base;

  const tabs = Array.isArray(raw.tabs)
    ? raw.tabs.filter(isValidTab).map(t => ({ ...t, columnLimits: normalizeColumnLimits(t.columnLimits) }))
    : [];
  const activeTabId =
    typeof raw.activeTabId === "string" && tabs.some(t => t.id === raw.activeTabId)
      ? raw.activeTabId
      : (tabs[0] ? tabs[0].id : null);

  const dateFormat =
    typeof raw.settings?.dateFormat === "string" && raw.settings.dateFormat.trim()
      ? raw.settings.dateFormat
      : base.settings.dateFormat;

  return { tabs, activeTabId, settings: { dateFormat } };
}

/**
 * Loads the tabs configuration from plugin settings.
 * @param {Object} app - The Amplenote app context.
 * @returns {Promise<{tabs: Array, activeTabId: string|null, settings: {dateFormat: string}}>}
 */
export async function loadTabsConfig(app) {
  let raw = null;
  try {
    raw = safeParse(app.settings?.[SETTINGS_KEYS.tabs]);
  } catch {
    raw = null;
  }
  return normalizeConfig(raw);
}

/**
 * Persists the tabs configuration.
 * Note: per API docs, app.settings is not guaranteed to reflect the write immediately,
 * so callers must not read-modify-write rapidly. UI should debounce.
 * @param {Object} app - The Amplenote app context.
 * @param {{tabs: Array, activeTabId: string|null, settings: {dateFormat: string}}} config
 * @returns {Promise<{tabs: Array, activeTabId: string|null, settings: {dateFormat: string}}>} the saved config
 */
export async function saveTabsConfig(app, config) {
  await app.setSetting(SETTINGS_KEYS.tabs, JSON.stringify(normalizeConfig(config)));
  return config;
}

/**
 * Creates a tab descriptor.
 * @param {{kind: "note"|"tag", name: string, noteUUID?: string|null, tag?: string|null}} spec
 * @returns {{id: string, kind: string, name: string, noteUUID: string|null, tag: string|null}}
 */
export function createTab({ kind, name, noteUUID = null, tag = null }) {
  if (kind !== "note" && kind !== "tag" && kind !== "notes") {
    throw new Error(`Invalid tab kind: ${kind}`);
  }
  return { id: newId("tab"), kind, name: String(name || "Untitled"), noteUUID, tag };
}

/**
 * Appends a tab and activates it when it is the first one.
 * @param {Object} config - Current tabs config.
 * @param {{id: string, kind: string, name: string}} tab - Tab to append.
 * @returns {Object} A new config with the tab appended.
 */
export function addTab(config, tab) {
  const tabs = [...config.tabs, tab];
  return {
    ...config,
    tabs,
    activeTabId: config.activeTabId || tab.id,
  };
}

/**
 * Removes a tab; repairs activeTabId if it pointed at the removed tab.
 * @param {Object} config - Current tabs config.
 * @param {string} tabId - Id of the tab to remove.
 * @returns {Object} A new config without the tab.
 */
export function removeTab(config, tabId) {
  const tabs = config.tabs.filter(t => t.id !== tabId);
  const activeTabId =
    config.activeTabId === tabId ? (tabs[0] ? tabs[0].id : null) : config.activeTabId;
  return { ...config, tabs, activeTabId };
}

/**
 * Sets the active tab (no-op when the id is unknown).
 * @param {Object} config - Current tabs config.
 * @param {string} tabId - Id of the tab to activate.
 * @returns {Object} A new config with activeTabId set.
 */
export function setActiveTab(config, tabId) {
  if (!config.tabs.some(t => t.id === tabId)) return config;
  return { ...config, activeTabId: tabId };
}

/**
 * Moves a tab from one index to another (no-op for out-of-range indices).
 * @param {Object} config - Current tabs config.
 * @param {number} fromIndex - Current index of the tab.
 * @param {number} toIndex - Desired index of the tab.
 * @returns {Object} A new config with reordered tabs.
 */
export function moveTab(config, fromIndex, toIndex) {
  const tabs = [...config.tabs];
  if (
    fromIndex < 0 || fromIndex >= tabs.length ||
    toIndex < 0 || toIndex >= tabs.length ||
    fromIndex === toIndex
  ) {
    return config;
  }
  const [moved] = tabs.splice(fromIndex, 1);
  tabs.splice(toIndex, 0, moved);
  return { ...config, tabs };
}

/**
 * Looks up a tab by id.
 * @param {Object} config - Current tabs config.
 * @param {string} tabId - Id to find.
 * @returns {Object|null} The tab descriptor, or null when absent.
 */
export function tabById(config, tabId) {
  return config.tabs.find(t => t.id === tabId) || null;
}
