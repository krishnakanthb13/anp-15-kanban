import { jest } from '@jest/globals';
import {
  handleEmbedAction,
  handlePing,
  handleSaveTheme,
  handleSetActiveTab,
} from '../lib/features/embedActions.js';
import { SETTINGS_KEYS } from '../lib/core/constants.js';

function makeApp() {
  return {
    settings: {},
    setSetting: jest.fn().mockResolvedValue(),
    context: { renderEmbed: jest.fn().mockResolvedValue() },
  };
}

describe("embedActions", () => {
  describe("handleEmbedAction dispatch", () => {
    it("routes known actions to handlers", async () => {
      const app = makeApp();
      await handleEmbedAction(app, ["ping"]);
      expect(app.context.renderEmbed).toHaveBeenCalled();
    });

    it("ignores unknown actions without throwing", async () => {
      const app = makeApp();
      const result = await handleEmbedAction(app, ["bogus", {}]);
      expect(result).toBeUndefined();
      expect(app.context.renderEmbed).not.toHaveBeenCalled();
    });

    it("tolerates missing args", async () => {
      const app = makeApp();
      await expect(handleEmbedAction(app, [])).resolves.not.toThrow();
      await expect(handleEmbedAction(app)).resolves.toBeUndefined();
    });
  });

  describe("handlePing", () => {
    it("triggers a re-render (round trip proof)", async () => {
      const app = makeApp();
      const result = await handlePing(app);
      expect(result).toEqual({ ok: true });
      expect(app.context.renderEmbed).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleSaveTheme", () => {
    it("persists valid theme ids", async () => {
      const app = makeApp();
      await handleSaveTheme(app, { themeId: "dracula" });
      expect(app.setSetting).toHaveBeenCalledWith(SETTINGS_KEYS.theme, "dracula");
    });

    it("rejects invalid theme ids without writing", async () => {
      const app = makeApp();
      await handleSaveTheme(app, { themeId: "hacker-theme" });
      await handleSaveTheme(app, {});
      await handleSaveTheme(app);
      expect(app.setSetting).not.toHaveBeenCalled();
    });
  });

  describe("handleSetActiveTab", () => {
    it("saves the active tab and re-renders", async () => {
      const app = makeApp();
      app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
        tabs: [{ id: "t1", kind: "note", name: "A" }, { id: "t2", kind: "tag", name: "B" }],
        activeTabId: "t1",
        settings: {},
      });

      await handleSetActiveTab(app, { tabId: "t2" });

      expect(app.setSetting).toHaveBeenCalledWith(
        SETTINGS_KEYS.tabs,
        expect.stringContaining('"activeTabId":"t2"')
      );
      expect(app.context.renderEmbed).toHaveBeenCalled();
    });

    it("does nothing for missing tab ids", async () => {
      const app = makeApp();
      await handleSetActiveTab(app, {});
      expect(app.setSetting).not.toHaveBeenCalled();
      expect(app.context.renderEmbed).not.toHaveBeenCalled();
    });
  });
});
