import {
  emptyTabsConfig,
  newId,
  isValidTab,
  SETTINGS_KEYS,
  DEFAULT_DATE_FORMAT,
  AUTO_COMPLETE_ON_DONE_HEADER,
  NEW_NOTE_BOARD_INCLUDES_DONE_HEADER,
  NOTE_PREFIX,
} from '../lib/core/constants.js';

describe("constants", () => {
  describe("feature flags and prefixes", () => {
    it("exposes boolean feature flags and NOTE_PREFIX", () => {
      expect(typeof AUTO_COMPLETE_ON_DONE_HEADER).toBe("boolean");
      expect(typeof NEW_NOTE_BOARD_INCLUDES_DONE_HEADER).toBe("boolean");
      expect(NOTE_PREFIX).toBe("note:");
    });
  });

  describe("SETTINGS_KEYS", () => {
    it("exposes stable setting keys", () => {
      expect(SETTINGS_KEYS.tabs).toBe("Kanban Tabs");
      expect(SETTINGS_KEYS.settings).toBe("Kanban Settings");
      expect(SETTINGS_KEYS.theme).toBe("Kanban Theme");
      expect(SETTINGS_KEYS.dateFormat).toBe("Kanban Date Format");
    });
  });

  describe("emptyTabsConfig", () => {
    it("returns a fresh default config each call", () => {
      const a = emptyTabsConfig();
      const b = emptyTabsConfig();
      expect(a).toEqual({ tabs: [], activeTabId: null, settings: { dateFormat: DEFAULT_DATE_FORMAT } });
      expect(a).not.toBe(b);
      expect(a.settings).not.toBe(b.settings);
    });
  });

  describe("newId", () => {
    it("uses the given prefix", () => {
      expect(newId("tab")).toMatch(/^tab_/);
    });

    it("generates unique ids", () => {
      const ids = new Set(Array.from({ length: 200 }, () => newId("x")));
      expect(ids.size).toBe(200);
    });
  });

  describe("isValidTab", () => {
    it("accepts note and tag tabs with ids", () => {
      expect(isValidTab({ id: "tab_1", kind: "note" })).toBe(true);
      expect(isValidTab({ id: "tab_2", kind: "tag" })).toBe(true);
      expect(isValidTab({ id: "tab_3", kind: "notes" })).toBe(true);
    });

    it("rejects malformed tabs", () => {
      expect(isValidTab(null)).toBe(false);
      expect(isValidTab(undefined)).toBe(false);
      expect(isValidTab({ kind: "note" })).toBe(false);
      expect(isValidTab({ id: "", kind: "note" })).toBe(false);
      expect(isValidTab({ id: "tab_1", kind: "bogus" })).toBe(false);
      expect(isValidTab("tab_1")).toBe(false);
    });
  });
});
