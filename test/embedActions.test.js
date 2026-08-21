import { jest } from '@jest/globals';
import {
  handleEmbedAction,
  handlePing,
  handleSaveTheme,
  handleSetActiveTab,
  handleMoveCard,
  handleCreateCard,
  handleEditCard,
  handleCreateColumn,
  handleRenameColumn,
  handleDeleteColumn,
  handleMoveColumn,
  handleSetWipLimit,
  handleOpenCard,
} from '../lib/features/embedActions.js';
import { SETTINGS_KEYS } from '../lib/core/constants.js';

const NOTE_MD = ["# Alpha", "- [ ] one <!-- {\"uuid\":\"u1\"} -->", "# Beta"].join("\n");

function makeApp(markdown = NOTE_MD) {
  return {
    settings: {},
    setSetting: jest.fn().mockResolvedValue(),
    getNoteContent: jest.fn().mockResolvedValue(markdown),
    replaceNoteContent: jest.fn().mockResolvedValue(true),
    insertNoteContent: jest.fn().mockResolvedValue(),
    insertTask: jest.fn().mockResolvedValue("new-task"),
    updateTask: jest.fn().mockResolvedValue(true),
    getTask: jest.fn().mockResolvedValue({ uuid: "u1", content: "one" }),
    prompt: jest.fn().mockResolvedValue(["typed content"]),
    navigate: jest.fn().mockResolvedValue(),
    createNote: jest.fn().mockResolvedValue("new-note"),
    addNoteTag: jest.fn().mockResolvedValue(true),
    removeNoteTag: jest.fn().mockResolvedValue(true),
    getTags: jest.fn().mockResolvedValue([]),
    filterNotes: jest.fn().mockResolvedValue([]),
    context: { renderEmbed: jest.fn().mockResolvedValue() },
  };
}

function withTagTab(app) {
  app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
    tabs: [{ id: "tg", kind: "tag", name: "projects", tag: "projects" }],
    activeTabId: "tg",
    settings: {},
  });
  return app;
}

function withNoteTab(app) {
  app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
    tabs: [{ id: "t1", kind: "note", name: "Board", noteUUID: "n1" }],
    activeTabId: "t1",
    settings: {},
  });
  return app;
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

  describe("handleMoveCard", () => {
    it("moves to the last column and completes the task", async () => {
      const app = withNoteTab(makeApp());
      // NOTE_MD columns: Alpha id "0", Beta id "2" (last)
      await handleMoveCard(app, { tabId: "t1", cardId: "u1", toColumnId: "2" });

      const [, updates] = app.updateTask.mock.calls[0];
      expect(typeof updates.completedAt).toBe("number");
      expect(app.replaceNoteContent).toHaveBeenCalledTimes(1);
      expect(app.context.renderEmbed).toHaveBeenCalled();
    });

    it("moves to a non-last column and reopens the task", async () => {
      // Task sits in Beta (last); moving it to Alpha must reopen it.
      const md = ["# Alpha", "# Beta", "- [ ] one <!-- {\"uuid\":\"u1\"} -->"].join("\n");
      const app = withNoteTab(makeApp(md));
      await handleMoveCard(app, { tabId: "t1", cardId: "u1", toColumnId: "0" });
      expect(app.updateTask).toHaveBeenCalledWith("u1", { completedAt: null });
    });

    it("does nothing when the drop is a same-column no-op", async () => {
      const md = ["# Alpha", "- [ ] one <!-- {\"uuid\":\"u1\"} -->", "# Beta"].join("\n");
      const app = withNoteTab(makeApp(md));
      await handleMoveCard(app, { tabId: "t1", cardId: "u1", toColumnId: "0" });
      expect(app.replaceNoteContent).not.toHaveBeenCalled();
      expect(app.updateTask).not.toHaveBeenCalled();
      expect(app.context.renderEmbed).not.toHaveBeenCalled();
    });

    it("ignores invalid payloads and non-note tabs", async () => {
      const app = makeApp();
      app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
        tabs: [{ id: "tg", kind: "tag", name: "x", tag: "x" }],
        activeTabId: "tg",
        settings: {},
      });
      await handleMoveCard(app, { tabId: "tg", cardId: "u1", toColumnId: "0" });
      await handleMoveCard(app, {});
      await handleMoveCard();
      expect(app.getNoteContent).not.toHaveBeenCalled();
    });
  });

  describe("handleCreateCard", () => {
    it("prompts, creates, relocates and re-renders", async () => {
      // Simulate insertTask having placed the new task at the top of the note.
      const mdWithNew = [
        "- [ ] typed content <!-- {\"uuid\":\"new-task\"} -->",
        "# Alpha",
        "# Beta",
      ].join("\n");
      const app = withNoteTab(makeApp(mdWithNew));
      await handleCreateCard(app, { tabId: "t1", columnId: "2" });

      expect(app.prompt).toHaveBeenCalled();
      expect(app.insertTask).toHaveBeenCalledWith({ uuid: "n1" }, { content: "typed content" });
      expect(app.replaceNoteContent).toHaveBeenCalledTimes(1);
      expect(app.context.renderEmbed).toHaveBeenCalled();
    });

    it("does nothing when the prompt is cancelled or empty", async () => {
      const app = withNoteTab(makeApp());
      app.prompt.mockResolvedValue(null);
      await handleCreateCard(app, { tabId: "t1", columnId: "2" });
      app.prompt.mockResolvedValue([""]);
      await handleCreateCard(app, { tabId: "t1", columnId: "2" });
      expect(app.insertTask).not.toHaveBeenCalled();
    });
  });

  describe("handleEditCard", () => {
    it("saves edited markdown and re-renders", async () => {
      const app = makeApp();
      app.prompt.mockResolvedValue(["**edited**"]);
      await handleEditCard(app, { cardId: "u1" });
      expect(app.updateTask).toHaveBeenCalledWith("u1", { content: "**edited**" });
      expect(app.context.renderEmbed).toHaveBeenCalled();
    });

    it("skips writes when unchanged, cancelled, or task missing", async () => {
      const app = makeApp();
      app.prompt.mockResolvedValue(["one"]); // unchanged
      await handleEditCard(app, { cardId: "u1" });
      app.prompt.mockResolvedValue(null);
      await handleEditCard(app, { cardId: "u1" });
      expect(app.updateTask).not.toHaveBeenCalled();

      app.prompt.mockResolvedValue(["changed"]);
      app.getTask.mockResolvedValue(null);
      await handleEditCard(app, { cardId: "ghost" });
      expect(app.updateTask).not.toHaveBeenCalled();
    });
  });

  describe("tag boards (Phase 3)", () => {
    const TAG_NOTES = [
      { uuid: "n1", name: "Alpha doc", tags: ["projects", "projects/alpha"] },
      { uuid: "n2", name: "Plain doc", tags: ["projects"] },
    ];

    function tagApp() {
      const app = withTagTab(makeApp());
      app.getTags.mockResolvedValue([
        { text: "projects", color: "2563eb" },
        { text: "projects/alpha", color: "ff0000" },
      ]);
      app.filterNotes.mockResolvedValue(TAG_NOTES);
      return app;
    }

    it("moveCard retags the note when dropped on another sub-tag column", async () => {
      const app = tagApp();
      await handleMoveCard(app, { tabId: "tg", cardId: "n2", toColumnId: "sub:projects/alpha" });

      expect(app.addNoteTag).toHaveBeenCalledWith({ uuid: "n2" }, "projects/alpha");
      expect(app.context.renderEmbed).toHaveBeenCalled();
    });

    it("moveCard clears the sub-tag when dropped on No sub-tag", async () => {
      const app = tagApp();
      await handleMoveCard(app, { tabId: "tg", cardId: "n1", toColumnId: "nosub" });
      expect(app.removeNoteTag).toHaveBeenCalledWith({ uuid: "n1" }, "projects/alpha");
      expect(app.addNoteTag).not.toHaveBeenCalled();
    });

    it("moveCard is a no-op for same-column drops", async () => {
      const app = tagApp();
      await handleMoveCard(app, { tabId: "tg", cardId: "n1", toColumnId: "sub:projects/alpha" });
      expect(app.addNoteTag).not.toHaveBeenCalled();
      expect(app.removeNoteTag).not.toHaveBeenCalled();
    });

    it("createCard creates a note tagged with the target sub-tag", async () => {
      const app = tagApp();
      await handleCreateCard(app, { tabId: "tg", columnId: "sub:projects/alpha" });
      expect(app.createNote).toHaveBeenCalledWith("typed content", ["projects/alpha"]);
    });

    it("createCard uses the base tag for the No sub-tag column", async () => {
      const app = tagApp();
      await handleCreateCard(app, { tabId: "tg", columnId: "nosub" });
      expect(app.createNote).toHaveBeenCalledWith("typed content", ["projects"]);
    });

    it("openCard navigates to the note", async () => {
      const app = makeApp();
      await handleOpenCard(app, { cardId: "abc" });
      expect(app.navigate).toHaveBeenCalledWith("https://www.amplenote.com/notes/abc");
    });

    it("structural column actions are rejected on tag boards", async () => {
      const app = tagApp();
      await handleCreateColumn(app, { tabId: "tg" });
      await handleRenameColumn(app, { tabId: "tg", columnId: "sub:projects/alpha" });
      await handleDeleteColumn(app, { tabId: "tg", columnId: "sub:projects/alpha" });
      await handleMoveColumn(app, { tabId: "tg", columnId: "sub:projects/alpha", direction: "left" });
      await handleSetWipLimit(app, { tabId: "tg", columnId: "sub:projects/alpha" });
      expect(app.prompt).not.toHaveBeenCalled();
      expect(app.replaceNoteContent).not.toHaveBeenCalled();
      expect(app.setSetting).not.toHaveBeenCalled();
    });
  });

  describe("column management (Phase 2)", () => {
    describe("handleCreateColumn", () => {
      it("prompts for a name and appends the heading", async () => {
        const app = withNoteTab(makeApp());
        await handleCreateColumn(app, { tabId: "t1" });
        expect(app.insertNoteContent).toHaveBeenCalledWith(
          { uuid: "n1" }, "\n# typed content\n", { atEnd: true }
        );
        expect(app.context.renderEmbed).toHaveBeenCalled();
      });

      it("does nothing when cancelled or blank", async () => {
        const app = withNoteTab(makeApp());
        app.prompt.mockResolvedValue(null);
        await handleCreateColumn(app, { tabId: "t1" });
        app.prompt.mockResolvedValue(["   "]);
        await handleCreateColumn(app, { tabId: "t1" });
        expect(app.insertNoteContent).not.toHaveBeenCalled();
      });
    });

    describe("handleRenameColumn", () => {
      it("prefills the current name and writes renames", async () => {
        const app = withNoteTab(makeApp());
        app.prompt.mockResolvedValue(["Alpha Renamed"]);
        await handleRenameColumn(app, { tabId: "t1", columnId: "0" });

        const promptArgs = app.prompt.mock.calls[0];
        expect(promptArgs[1].inputs[0].value).toBe("Alpha");
        expect(app.replaceNoteContent).toHaveBeenCalledTimes(1);
        expect(app.context.renderEmbed).toHaveBeenCalled();
      });

      it("skips unchanged names", async () => {
        const app = withNoteTab(makeApp());
        app.prompt.mockResolvedValue(["Alpha"]);
        await handleRenameColumn(app, { tabId: "t1", columnId: "0" });
        expect(app.replaceNoteContent).not.toHaveBeenCalled();
      });
    });

    describe("handleDeleteColumn", () => {
      it("requires an affirmative confirmation checkbox", async () => {
        const app = withNoteTab(makeApp());
        app.prompt.mockResolvedValue([false]);
        await handleDeleteColumn(app, { tabId: "t1", columnId: "0" });
        app.prompt.mockResolvedValue(null);
        await handleDeleteColumn(app, { tabId: "t1", columnId: "0" });
        expect(app.replaceNoteContent).not.toHaveBeenCalled();

        app.prompt.mockResolvedValue([true]);
        await handleDeleteColumn(app, { tabId: "t1", columnId: "0" });
        expect(app.replaceNoteContent).toHaveBeenCalledTimes(1);
        expect(app.context.renderEmbed).toHaveBeenCalled();
      });
    });

    describe("handleMoveColumn", () => {
      it("swaps with the right neighbor and re-renders", async () => {
        const app = withNoteTab(makeApp());
        await handleMoveColumn(app, { tabId: "t1", columnId: "0", direction: "right" });
        const written = app.replaceNoteContent.mock.calls[0][1];
        expect(written.indexOf("# Beta")).toBeLessThan(written.indexOf("# Alpha"));
      });

      it("swaps with the left neighbor and no-ops at edges", async () => {
        const app = withNoteTab(makeApp());
        await handleMoveColumn(app, { tabId: "t1", columnId: "2", direction: "left" });
        const written = app.replaceNoteContent.mock.calls[0][1];
        expect(written.indexOf("# Beta")).toBeLessThan(written.indexOf("# Alpha"));

        const edge = withNoteTab(makeApp());
        await handleMoveColumn(edge, { tabId: "t1", columnId: "0", direction: "left" });
        expect(edge.replaceNoteContent).not.toHaveBeenCalled();
      });
    });

    describe("handleSetWipLimit", () => {
      function withLimits(app) {
        app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
          tabs: [{ id: "t1", kind: "note", name: "Board", noteUUID: "n1", columnLimits: {} }],
          activeTabId: "t1",
          settings: {},
        });
        return app;
      }

      it("saves a positive limit keyed by column name", async () => {
        const app = withLimits(makeApp());
        app.prompt.mockResolvedValue(["4"]);
        await handleSetWipLimit(app, { tabId: "t1", columnId: "0" });

        const written = JSON.parse(app.setSetting.mock.calls[0][1]);
        expect(written.tabs[0].columnLimits).toEqual({ Alpha: 4 });
        expect(app.context.renderEmbed).toHaveBeenCalled();
      });

      it("clears limits with 0 or blank and ignores cancels", async () => {
        const app = withLimits(makeApp());
        app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
          tabs: [{ id: "t1", kind: "note", name: "Board", noteUUID: "n1", columnLimits: { Alpha: 4 } }],
          activeTabId: "t1",
          settings: {},
        });

        app.prompt.mockResolvedValue(["0"]);
        await handleSetWipLimit(app, { tabId: "t1", columnId: "0" });
        let written = JSON.parse(app.setSetting.mock.calls[0][1]);
        expect(written.tabs[0].columnLimits).toEqual({});

        const before = app.setSetting.mock.calls.length;
        app.prompt.mockResolvedValue(null);
        await handleSetWipLimit(app, { tabId: "t1", columnId: "0" });
        expect(app.setSetting.mock.calls.length).toBe(before);
      });
    });
  });
});
