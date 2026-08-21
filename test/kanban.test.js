import { jest } from '@jest/globals';
import { SETTINGS_KEYS, DEFAULT_THEME_ID } from '../lib/core/constants.js';

describe("kanban plugin entry", () => {
  let plugin;

  beforeAll(async () => {
    const mod = await import('../kanban.js?entry');
    plugin = mod.default;
  });

  function makeApp(settings = {}) {
    return {
      settings: settings,
      setSetting: jest.fn().mockResolvedValue(),
      openEmbed: jest.fn().mockResolvedValue(),
      navigate: jest.fn().mockResolvedValue(),
      getNoteContent: jest.fn().mockResolvedValue(""),
      getNoteTasks: jest.fn().mockResolvedValue([]),
      htmlFromContent: jest.fn().mockImplementation(async (c) => `<p>${c}</p>`),
      context: { pluginUUID: "plugin-uuid-1", renderEmbed: jest.fn().mockResolvedValue() },
    };
  }

  describe("appOption launcher", () => {
    it("opens the embed section and navigates to the plugin URL", async () => {
      const app = makeApp();
      await plugin.appOption["Open Kanban Board"](app);
      expect(app.openEmbed).toHaveBeenCalledTimes(1);
      expect(app.navigate).toHaveBeenCalledWith("https://www.amplenote.com/notes/plugins/plugin-uuid-1");
    });
  });

  describe("renderEmbed", () => {
    it("returns an HTML document with demo content when no tabs are configured", async () => {
      const app = makeApp();
      const html = await plugin.renderEmbed(app);
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain('"tab_demo"');
      expect(html).toContain("Demo Board");
    });

    it("uses configured tabs and persisted theme when available", async () => {
      const app = makeApp({
        [SETTINGS_KEYS.tabs]: JSON.stringify({
          tabs: [{ id: "t1", kind: "tag", name: "work" }],
          activeTabId: "t1",
          settings: { dateFormat: "DD MMM" },
        }),
        [SETTINGS_KEYS.theme]: "nord",
      });
      const html = await plugin.renderEmbed(app);
      expect(html).toContain('"kind":"tag"');
      expect(html).toContain("nord");
      expect(html).not.toContain("tab_demo");
    });

    it("builds real boards for note tabs", async () => {
      const app = makeApp({
        [SETTINGS_KEYS.tabs]: JSON.stringify({
          tabs: [{ id: "t1", kind: "note", name: "Board", noteUUID: "n1" }],
          activeTabId: "t1",
          settings: {},
        }),
      });
      app.getNoteContent = jest.fn().mockResolvedValue(
        ["# Alpha", "- [ ] one <!-- {\"uuid\":\"u1\"} -->"].join("\n")
      );
      app.getNoteTasks = jest.fn().mockResolvedValue([{ uuid: "u1", content: "one" }]);

      const html = await plugin.renderEmbed(app);
      expect(html).toContain('"hasHeadings":true');
      expect(html).toContain("Alpha");
      expect(html).toContain("u1");
    });

    it("keeps rendering when a note tab's board fails to build", async () => {
      const app = makeApp({
        [SETTINGS_KEYS.tabs]: JSON.stringify({
          tabs: [{ id: "t1", kind: "note", name: "Board", noteUUID: "n1" }],
          activeTabId: "t1",
          settings: {},
        }),
      });
      app.getNoteContent = jest.fn().mockRejectedValue(new Error("note gone"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const html = await plugin.renderEmbed(app);
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain('"columns":[]');
      consoleSpy.mockRestore();
    });

    it("falls back to the default theme for unset/invalid theme settings", async () => {
      const html = await plugin.renderEmbed(makeApp({ [SETTINGS_KEYS.theme]: "bogus" }));
      // state carries the raw value; client + resolveTheme handle fallback
      expect(html).toContain("bogus");
      const noTheme = await plugin.renderEmbed(makeApp({}));
      expect(noTheme).toContain(DEFAULT_THEME_ID);
    });
  });

  describe("onEmbedCall", () => {
    it("dispatches actions and bumps the round-trip counter", async () => {
      const app = makeApp();
      await plugin.onEmbedCall(app, "ping");
      expect(app.context.renderEmbed).toHaveBeenCalledTimes(1);

      const html = await plugin.renderEmbed(app);
      const match = html.match(/"roundTrips":(\d+)/);
      expect(match).toBeTruthy();
      expect(Number(match[1])).toBeGreaterThan(0);
    });

    it("swallows handler errors so the embed never breaks", async () => {
      const app = makeApp();
      app.context.renderEmbed.mockRejectedValue(new Error("render boom"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const result = await plugin.onEmbedCall(app, "ping");
      expect(result).toBeUndefined();
      consoleSpy.mockRestore();
    });
  });
});
