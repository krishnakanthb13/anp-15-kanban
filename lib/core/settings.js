import { SETTINGS_KEYS, DEFAULT_SETTINGS } from "./constants.js";
import { isValidThemeId } from "../ui/themes.js";

const VALID_SORT_MODES = new Set(["none", "score", "startDate", "important", "urgent", "alpha", "date", "urgency"]);

/**
 * Parses a raw settings string safely.
 * @param {string|undefined|null} raw
 * @returns {Object|null}
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
 * Sanitizes a settings object, guaranteeing all keys exist with valid types.
 * @param {*} raw
 * @returns {typeof DEFAULT_SETTINGS}
 */
export function sanitizeSettings(raw) {
  const base = { ...DEFAULT_SETTINGS };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return base;
  }

  // theme
  if (typeof raw.theme === "string" && isValidThemeId(raw.theme)) {
    base.theme = raw.theme;
  }

  // dateFormat
  if (typeof raw.dateFormat === "string" && raw.dateFormat.trim()) {
    base.dateFormat = raw.dateFormat.trim();
  }

  // showEmptyColumns
  if (typeof raw.showEmptyColumns === "boolean") {
    base.showEmptyColumns = raw.showEmptyColumns;
  } else if (raw.showEmptyColumns === "true") {
    base.showEmptyColumns = true;
  }

  // quickDateEnabled
  if (typeof raw.quickDateEnabled === "boolean") {
    base.quickDateEnabled = raw.quickDateEnabled;
  } else if (raw.quickDateEnabled === "true") {
    base.quickDateEnabled = true;
  }

  // sortMode
  if (typeof raw.sortMode === "string" && VALID_SORT_MODES.has(raw.sortMode)) {
    base.sortMode = raw.sortMode;
  }

  // expandCardInfo
  if (typeof raw.expandCardInfo === "boolean") {
    base.expandCardInfo = raw.expandCardInfo;
  } else if (raw.expandCardInfo === "true") {
    base.expandCardInfo = true;
  }

  // density
  if (typeof raw.density === "string" && (raw.density === "compact" || raw.density === "cozy" || raw.density === "spacious")) {
    base.density = raw.density;
  }

  return base;
}

/**
 * Loads unified plugin settings from Amplenote, with legacy fallback.
 * @param {Object} app - The Amplenote App instance.
 * @returns {Promise<typeof DEFAULT_SETTINGS>}
 */
export async function loadPluginSettings(app) {
  let raw = null;
  try {
    raw = safeParse(app.settings?.[SETTINGS_KEYS.settings]);
  } catch {
    raw = null;
  }

  // If modern unified setting exists, sanitize and return
  if (raw && typeof raw === "object") {
    return sanitizeSettings(raw);
  }

  // Fallback to legacy single settings if present
  const fallback = { ...DEFAULT_SETTINGS };
  try {
    const legacyTheme = await app.settings?.[SETTINGS_KEYS.theme];
    if (legacyTheme && isValidThemeId(legacyTheme)) {
      fallback.theme = legacyTheme;
    }
  } catch {}

  try {
    const legacyDateFormat = await app.settings?.[SETTINGS_KEYS.dateFormat];
    if (legacyDateFormat && typeof legacyDateFormat === "string" && legacyDateFormat.trim()) {
      fallback.dateFormat = legacyDateFormat.trim();
    }
  } catch {}

  return fallback;
}

/**
 * Persists updated plugin settings to the unified 'Kanban Settings' setting.
 * @param {Object} app - The Amplenote App instance.
 * @param {Partial<typeof DEFAULT_SETTINGS>} updates - Partial or full settings to merge.
 * @returns {Promise<typeof DEFAULT_SETTINGS>} the saved sanitized settings object.
 */
export async function savePluginSettings(app, updates) {
  const current = await loadPluginSettings(app);
  const merged = sanitizeSettings({ ...current, ...updates });
  await app.setSetting(SETTINGS_KEYS.settings, JSON.stringify(merged));
  return merged;
}
