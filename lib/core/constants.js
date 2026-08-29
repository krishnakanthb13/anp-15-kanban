/**
 * Central constants for the Kanban plugin.
 */

/** Plugin setting keys (values are always strings). */
export const SETTINGS_KEYS = {
  tabs: "Kanban Tabs",
  settings: "Kanban Settings",
  theme: "Kanban Theme", // retained for backward-compatibility lookup
  dateFormat: "Kanban Date Format",
};

export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";

export const DEFAULT_THEME_ID = "light";

/** Default values for unified Kanban Settings JSON. */
export const DEFAULT_SETTINGS = {
  theme: DEFAULT_THEME_ID,
  dateFormat: DEFAULT_DATE_FORMAT,
  showEmptyColumns: false,
  quickDateEnabled: false,
  sortMode: "none",
  expandCardInfo: false,
  density: "cozy",
};

/** localStorage key used by the client-side theme cycler (per cycling-themes.md standard). */
export const THEME_STORAGE_KEY = "ANP_ACTIVE_THEME";

/**
 * Feature Flags:
 * - AUTO_COMPLETE_ON_DONE_HEADER:
 *   - false (default): Only dropping into the dedicated 'Completed' column marks tasks completed. Moving to markdown headings named 'Done' keeps the task active.
 *   - true: Moving a task to any markdown heading matching 'Done/Finished/Closed/Archive' automatically marks it completed.
 *
 * - NEW_NOTE_BOARD_INCLUDES_DONE_HEADER:
 *   - false (default): 'Create New Note Board' seeds '# To Do\n\n# In Progress\n' (since Completed column is built-in).
 *   - true: 'Create New Note Board' seeds '# To Do\n\n# In Progress\n\n# Done\n'.
 */
export const AUTO_COMPLETE_ON_DONE_HEADER = false;
export const NEW_NOTE_BOARD_INCLUDES_DONE_HEADER = true;

/** Prefix used for note column IDs in tag and notes boards. */
export const NOTE_PREFIX = "note:";

/** Prefix used for tag column IDs in tags boards. */
export const TAG_PREFIX = "tag:";

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

const TAB_KINDS = new Set(["note", "tag", "notes", "tags"]);

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
