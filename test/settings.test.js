import { jest } from '@jest/globals';
import { loadPluginSettings, savePluginSettings, sanitizeSettings } from '../lib/core/settings.js';
import { SETTINGS_KEYS, DEFAULT_SETTINGS } from '../lib/core/constants.js';

function makeApp(initialSettings = {}) {
  const settings = { ...initialSettings };
  return {
    settings,
    setSetting: jest.fn().mockImplementation((key, val) => {
      settings[key] = val;
      return Promise.resolve();
    }),
  };
}

describe("settings", () => {
  describe("sanitizeSettings", () => {
    it("returns default settings for null / non-object input", () => {
      expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
      expect(sanitizeSettings("invalid")).toEqual(DEFAULT_SETTINGS);
      expect(sanitizeSettings([])).toEqual(DEFAULT_SETTINGS);
    });

    it("sanitizes partial updates and preserves valid values", () => {
      const sanitized = sanitizeSettings({
        theme: "nord",
        dateFormat: "DD/MM/YYYY",
        showEmptyColumns: true,
        quickDateEnabled: true,
        sortMode: "score",
        expandCardInfo: true,
        density: "compact",
      });

      expect(sanitized).toEqual({
        theme: "nord",
        dateFormat: "DD/MM/YYYY",
        showEmptyColumns: true,
        quickDateEnabled: true,
        sortMode: "score",
        expandCardInfo: true,
        density: "compact",
      });
    });

    it("rejects invalid theme or sortMode and falls back to defaults", () => {
      const sanitized = sanitizeSettings({
        theme: "nonexistent_theme",
        sortMode: "invalid_mode",
      });

      expect(sanitized.theme).toBe(DEFAULT_SETTINGS.theme);
      expect(sanitized.sortMode).toBe(DEFAULT_SETTINGS.sortMode);
    });
  });

  describe("loadPluginSettings", () => {
    it("loads unified JSON settings from Kanban Settings", async () => {
      const app = makeApp({
        [SETTINGS_KEYS.settings]: JSON.stringify({
          theme: "dracula",
          showEmptyColumns: true,
          sortMode: "urgent",
        }),
      });

      const loaded = await loadPluginSettings(app);
      expect(loaded.theme).toBe("dracula");
      expect(loaded.showEmptyColumns).toBe(true);
      expect(loaded.sortMode).toBe("urgent");
      expect(loaded.dateFormat).toBe(DEFAULT_SETTINGS.dateFormat);
    });

    it("falls back to legacy Kanban Theme when Kanban Settings is absent", async () => {
      const app = makeApp({
        [SETTINGS_KEYS.theme]: "midnight",
      });

      const loaded = await loadPluginSettings(app);
      expect(loaded.theme).toBe("midnight");
      expect(loaded.showEmptyColumns).toBe(false);
    });

    it("returns default settings when app settings are empty", async () => {
      const app = makeApp({});
      const loaded = await loadPluginSettings(app);
      expect(loaded).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe("savePluginSettings", () => {
    it("merges partial updates and writes JSON string to Kanban Settings", async () => {
      const app = makeApp();
      await savePluginSettings(app, { theme: "emerald", showEmptyColumns: true });

      expect(app.setSetting).toHaveBeenCalledWith(
        SETTINGS_KEYS.settings,
        expect.stringContaining('"theme":"emerald"')
      );
      expect(app.setSetting).toHaveBeenCalledWith(
        SETTINGS_KEYS.settings,
        expect.stringContaining('"showEmptyColumns":true')
      );

      const parsed = JSON.parse(app.settings[SETTINGS_KEYS.settings]);
      expect(parsed.theme).toBe("emerald");
      expect(parsed.showEmptyColumns).toBe(true);
      expect(parsed.sortMode).toBe("none");
    });
  });
});
