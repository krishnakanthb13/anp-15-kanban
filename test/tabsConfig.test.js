import { jest } from '@jest/globals';
import {
  normalizeConfig,
  loadTabsConfig,
  saveTabsConfig,
  createTab,
  addTab,
  removeTab,
  setActiveTab,
  moveTab,
  tabById,
} from '../lib/core/tabsConfig.js';
import { SETTINGS_KEYS, DEFAULT_DATE_FORMAT } from '../lib/core/constants.js';

function makeApp(rawSetting) {
  return { settings: { [SETTINGS_KEYS.tabs]: rawSetting }, setSetting: jest.fn().mockResolvedValue() };
}

describe("tabsConfig", () => {
  describe("normalizeConfig", () => {
    it("returns defaults for null/undefined/garbage", () => {
      expect(normalizeConfig(null)).toEqual({ tabs: [], activeTabId: null, settings: { dateFormat: DEFAULT_DATE_FORMAT } });
      expect(normalizeConfig(undefined)).toEqual(normalizeConfig(null));
      expect(normalizeConfig("not an object")).toEqual(normalizeConfig(null));
      expect(normalizeConfig(42)).toEqual(normalizeConfig(null));
    });

    it("drops invalid tabs and keeps valid ones", () => {
      const good = { id: "t1", kind: "note", name: "A" };
      const config = normalizeConfig({ tabs: [good, null, { kind: "note" }, { id: "t2", kind: "weird" }, "junk"] });
      expect(config.tabs).toHaveLength(1);
      expect(config.tabs[0]).toBe(good);
    });

    it("repairs activeTabId when it points at a removed tab", () => {
      const config = normalizeConfig({
        tabs: [{ id: "t1", kind: "note" }, { id: "t2", kind: "tag" }],
        activeTabId: "missing",
      });
      expect(config.activeTabId).toBe("t1");
    });

    it("keeps a valid activeTabId", () => {
      const config = normalizeConfig({
        tabs: [{ id: "t1", kind: "note" }, { id: "t2", kind: "tag" }],
        activeTabId: "t2",
      });
      expect(config.activeTabId).toBe("t2");
    });

    it("falls back to default date format when missing/blank", () => {
      expect(normalizeConfig({ settings: {} }).settings.dateFormat).toBe(DEFAULT_DATE_FORMAT);
      expect(normalizeConfig({ settings: { dateFormat: "   " } }).settings.dateFormat).toBe(DEFAULT_DATE_FORMAT);
      expect(normalizeConfig({ settings: { dateFormat: "DD MMM" } }).settings.dateFormat).toBe("DD MMM");
    });
  });

  describe("loadTabsConfig / saveTabsConfig", () => {
    it("loads defaults when setting is unset or corrupt JSON", async () => {
      expect(await loadTabsConfig(makeApp(undefined))).toEqual(normalizeConfig(null));
      expect(await loadTabsConfig(makeApp("{broken json"))).toEqual(normalizeConfig(null));
    });

    it("round-trips a saved config", async () => {
      const app = makeApp(undefined);
      let config = addTab(normalizeConfig(null), createTab({ kind: "tag", name: "projects", tag: "projects" }));
      await saveTabsConfig(app, config);

      expect(app.setSetting).toHaveBeenCalledWith(SETTINGS_KEYS.tabs, expect.any(String));
      const written = JSON.parse(app.setSetting.mock.calls[0][1]);
      expect(written.tabs).toHaveLength(1);
      expect(written.activeTabId).toBe(written.tabs[0].id);
    });
  });

  describe("createTab", () => {
    it("creates note and tag tabs with generated ids", () => {
      const noteTab = createTab({ kind: "note", name: "My Note", noteUUID: "uuid-1" });
      expect(noteTab).toMatchObject({ kind: "note", name: "My Note", noteUUID: "uuid-1", tag: null });
      expect(noteTab.id).toMatch(/^tab_/);

      const tagTab = createTab({ kind: "tag", name: "work", tag: "work" });
      expect(tagTab).toMatchObject({ kind: "tag", name: "work", tag: "work", noteUUID: null });
    });

    it("defaults the name and rejects bad kinds", () => {
      expect(createTab({ kind: "note" }).name).toBe("Untitled");
      expect(() => createTab({ kind: "nope" })).toThrow(/Invalid tab kind/);
    });
  });

  describe("addTab", () => {
    it("appends and activates the first tab", () => {
      let config = normalizeConfig(null);
      const t1 = createTab({ kind: "note", name: "One" });
      config = addTab(config, t1);
      expect(config.activeTabId).toBe(t1.id);

      const t2 = createTab({ kind: "note", name: "Two" });
      config = addTab(config, t2);
      expect(config.tabs).toHaveLength(2);
      expect(config.activeTabId).toBe(t1.id); // unchanged
    });
  });

  describe("removeTab", () => {
    it("removes and repairs activeTabId", () => {
      let config = normalizeConfig(null);
      const t1 = createTab({ kind: "note", name: "One" });
      const t2 = createTab({ kind: "note", name: "Two" });
      config = addTab(addTab(config, t1), t2);

      config = removeTab(config, t1.id);
      expect(config.tabs.map(t => t.id)).toEqual([t2.id]);
      expect(config.activeTabId).toBe(t2.id); // stale pointer repaired to first remaining
    });

    it("keeps activeTabId when removing another tab", () => {
      let config = normalizeConfig(null);
      const t1 = createTab({ kind: "note", name: "One" });
      const t2 = createTab({ kind: "note", name: "Two" });
      config = setActiveTab(addTab(addTab(config, t1), t2), t2.id);
      config = removeTab(config, t1.id);
      expect(config.activeTabId).toBe(t2.id);
    });
  });

  describe("setActiveTab", () => {
    it("ignores unknown tab ids", () => {
      const config = addTab(normalizeConfig(null), createTab({ kind: "note", name: "One" }));
      expect(setActiveTab(config, "ghost")).toBe(config);
    });
  });

  describe("moveTab", () => {
    it("reorders tabs", () => {
      let config = normalizeConfig(null);
      const ids = ["a", "b", "c"].map(n => createTab({ kind: "note", name: n }).id ? createTab({ kind: "note", name: n }) : null);
      config = ids.reduce((acc, t) => addTab(acc, t), config);
      const moved = moveTab(config, 0, 2);
      expect(moved.tabs.map(t => t.name)).toEqual(["b", "c", "a"]);
    });

    it("is a no-op for out-of-range indices", () => {
      const config = addTab(normalizeConfig(null), createTab({ kind: "note", name: "One" }));
      expect(moveTab(config, -1, 5)).toBe(config);
      expect(moveTab(config, 0, 0)).toBe(config);
    });
  });

  describe("tabById", () => {
    it("finds tabs or returns null", () => {
      const t1 = createTab({ kind: "note", name: "One" });
      const config = addTab(normalizeConfig(null), t1);
      expect(tabById(config, t1.id)).toBe(t1);
      expect(tabById(config, "ghost")).toBeNull();
    });
  });
});
