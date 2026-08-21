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
 * Normalizes any parsed value into a valid tabs config, merging defaults.
 * Tolerant by design: corrupt or partial data degrades to defaults instead of throwing.
 * @param {*} raw
 * @returns {{tabs: Array, activeTabId: string|null, settings: {dateFormat: string}}}
 */
export function normalizeConfig(raw) {
  const base = emptyTabsConfig();
  if (!raw || typeof raw !== "object") return base;

  const tabs = Array.isArray(raw.tabs) ? raw.tabs.filter(isValidTab) : [];
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
  if (kind !== "note" && kind !== "tag") {
    throw new Error(`Invalid tab kind: ${kind}`);
  }
  return { id: newId("tab"), kind, name: String(name || "Untitled"), noteUUID, tag };
}

/** @returns {Object} a new config with the tab appended and activated if it's the first. */
export function addTab(config, tab) {
  const tabs = [...config.tabs, tab];
  return {
    ...config,
    tabs,
    activeTabId: config.activeTabId || tab.id,
  };
}

/** @returns {Object} a new config without the tab; activeTabId repaired if it pointed at the removed tab. */
export function removeTab(config, tabId) {
  const tabs = config.tabs.filter(t => t.id !== tabId);
  const activeTabId =
    config.activeTabId === tabId ? (tabs[0] ? tabs[0].id : null) : config.activeTabId;
  return { ...config, tabs, activeTabId };
}

/** @returns {Object} a new config with activeTabId set (no-op if tab missing). */
export function setActiveTab(config, tabId) {
  if (!config.tabs.some(t => t.id === tabId)) return config;
  return { ...config, activeTabId: tabId };
}

/** @returns {Object} a new config with the tab at fromIndex moved to toIndex. */
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

/** @returns {Object|null} the tab with the given id, or null. */
export function tabById(config, tabId) {
  return config.tabs.find(t => t.id === tabId) || null;
}
