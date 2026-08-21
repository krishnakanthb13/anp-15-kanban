/**
 * Central constants for the Kanban plugin.
 */

/** Plugin setting keys (values are always strings). */
export const SETTINGS_KEYS = {
  tabs: "Kanban Tabs",
  theme: "Kanban Theme",
  dateFormat: "Kanban Date Format",
};

export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";

export const DEFAULT_THEME_ID = "light";

/** localStorage key used by the client-side theme cycler (per cycling-themes.md standard). */
export const THEME_STORAGE_KEY = "ANP_ACTIVE_THEME";

/**
 * Returns a fresh, empty tabs configuration object.
 * @returns {{tabs: Array, activeTabId: string|null, settings: {dateFormat: string}}}
 */
export function emptyTabsConfig() {
  return {
    tabs: [],
    activeTabId: null,
    settings: { dateFormat: DEFAULT_DATE_FORMAT },
  };
}

const TAB_KINDS = new Set(["note", "tag", "notes"]);

/**
 * Generates a reasonably unique id with the given prefix.
 * @param {string} prefix
 * @returns {string}
 */
export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Validates a tab object shape.
 * @param {*} tab
 * @returns {boolean}
 */
export function isValidTab(tab) {
  return (
    !!tab &&
    typeof tab === "object" &&
    typeof tab.id === "string" &&
    tab.id.length > 0 &&
    TAB_KINDS.has(tab.kind)
  );
}
