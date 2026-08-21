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
  handleAddTab,
  handleCloseTab,
  handleMoveTabDir,
  handleSetDateFormat,
  handleCardMenu,
  handleQuickSetDate,
  handleGlobalSearch,
  handleMoveColumnToTab,
  handleRenameNote,
  handleReorderTabs,
  handleSaveColumnsToNote,
} from '../lib/features/embedActions.js';
import { SETTINGS_KEYS } from '../lib/core/constants.js';

const NOTE_MD = ["# Alpha", "- [ ] one <!-- {\"uuid\":\"u1\"} -->", "# Beta"].join("\n");

function makeApp(markdown = NOTE_MD) {
  const app = {
    settings: {},
    setSetting: jest.fn(async (key, value) => { app.settings[key] = value; }),
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
    getNoteTasks: jest.fn().mockResolvedValue([]),
    searchNotes: jest.fn().mockResolvedValue([]),
    alert: jest.fn().mockResolvedValue(),
    context: { renderEmbed: jest.fn().mockResolvedValue() },
  };
  return app;
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
    it("saves the active tab", async () => {
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
      { uuid: "n1", name: "Alpha doc", tags: ["projects"] },
      { uuid: "n2", name: "Plain doc", tags: ["projects"] },
    ];

    function tagApp() {
      const app = withTagTab(makeApp());
      app.getTags.mockResolvedValue([
        { text: "projects", color: "2563eb" },
      ]);
      app.filterNotes.mockResolvedValue(TAG_NOTES);
      app.getTask.mockImplementation(async (id) => ({ uuid: id, noteUUID: "n1", content: "task 1" }));
      return app;
    }

    it("moveCard moves the task to target note column", async () => {
      const app = tagApp();
      await handleMoveCard(app, { tabId: "tg", cardId: "u1", toColumnId: "note:n2" });

      expect(app.updateTask).toHaveBeenCalledWith("u1", { noteUUID: "n2" });
      expect(app.context.renderEmbed).toHaveBeenCalled();
    });

    it("moveCard is a no-op for same note column drops", async () => {
      const app = tagApp();
      await handleMoveCard(app, { tabId: "tg", cardId: "u1", toColumnId: "note:n1" });
      expect(app.updateTask).not.toHaveBeenCalled();
    });

    it("createCard creates a task in the target note column", async () => {
      const app = tagApp();
      await handleCreateCard(app, { tabId: "tg", columnId: "note:n2" });
      expect(app.insertTask).toHaveBeenCalledWith({ uuid: "n2" }, { content: "typed content" });
    });

    it("openCard navigates to the note", async () => {
      const app = makeApp();
      await handleOpenCard(app, { cardId: "abc" });
      expect(app.navigate).toHaveBeenCalledWith("https://www.amplenote.com/notes/abc");
    });

    it("structural column actions are rejected on tag boards", async () => {
      const app = tagApp();
      await handleCreateColumn(app, { tabId: "tg" });
      await handleRenameColumn(app, { tabId: "tg", columnId: "note:n1" });
      await handleDeleteColumn(app, { tabId: "tg", columnId: "note:n1" });
      await handleMoveColumn(app, { tabId: "tg", columnId: "note:n1", direction: "left" });
      await handleSetWipLimit(app, { tabId: "tg", columnId: "note:n1" });
      expect(app.prompt).not.toHaveBeenCalled();
      expect(app.replaceNoteContent).not.toHaveBeenCalled();
      expect(app.setSetting).not.toHaveBeenCalled();
    });
  });

  describe("tab management (Phase 4)", () => {
    it("addTab creates a note tab from a picked note and activates it", async () => {
      const app = withNoteTab(makeApp());
      app.prompt
        .mockResolvedValueOnce("note")
        .mockResolvedValueOnce({ uuid: "n9", name: "Picked Note" });

      await handleAddTab(app);

      const written = JSON.parse(app.setSetting.mock.calls[0][1]);
      expect(written.tabs).toHaveLength(2);
      expect(written.tabs[1]).toMatchObject({ kind: "note", name: "Picked Note", noteUUID: "n9" });
      expect(written.activeTabId).toBe("t1"); // existing active stays
      expect(app.context.renderEmbed).toHaveBeenCalled();
    });

    it("addTab creates a new note board under -reports/-kanban", async () => {
      const app = makeApp();
      app.createNote.mockResolvedValue("new-note-uuid");
      app.prompt
        .mockResolvedValueOnce("new_note")
        .mockResolvedValueOnce("Custom Kanban");

      await handleAddTab(app);

      expect(app.createNote).toHaveBeenCalledWith("Custom Kanban", ["-reports/-kanban"]);
      expect(app.replaceNoteContent).toHaveBeenCalledWith(
        { uuid: "new-note-uuid" },
        expect.stringContaining("# To Do")
      );
      const written = JSON.parse(app.setSetting.mock.calls[0][1]);
      expect(written.tabs[0]).toMatchObject({
        kind: "note",
        name: "Custom Kanban",
        noteUUID: "new-note-uuid",
      });
    });

    it("addTab creates a tag tab named after the last path segment", async () => {
      const app = makeApp();
      app.prompt
        .mockResolvedValueOnce("tag")
        .mockResolvedValueOnce(["work/projects"]);

      await handleAddTab(app);

      const written = JSON.parse(app.setSetting.mock.calls[0][1]);
      expect(written.tabs[0]).toMatchObject({ kind: "tag", name: "work/projects", tag: "work/projects" });
      expect(written.activeTabId).toBe(written.tabs[0].id); // first tab activates
    });

    it("addTab aborts on cancel or missing selection", async () => {
      const app = makeApp();
      app.prompt.mockResolvedValueOnce(null);
      await handleAddTab(app);
      app.prompt
        .mockResolvedValueOnce("note")
        .mockResolvedValueOnce(null);
      await handleAddTab(app);
      app.prompt.mockResolvedValueOnce("bogus");
      await handleAddTab(app);
      expect(app.setSetting).not.toHaveBeenCalled();
    });

    it("closeTab removes the tab and repairs the active id", async () => {
      const app = makeApp();
      app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
        tabs: [{ id: "a", kind: "note", name: "A", noteUUID: "n1" },
               { id: "b", kind: "tag", name: "B", tag: "b" }],
        activeTabId: "a",
        settings: {},
      });

      await handleCloseTab(app, { tabId: "a" });

      const written = JSON.parse(app.setSetting.mock.calls[0][1]);
      expect(written.tabs.map(t => t.id)).toEqual(["b"]);
      expect(written.activeTabId).toBe("b");
    });

    it("moveTabDir swaps adjacent tabs without touching data", async () => {
      const app = makeApp();
      app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
        tabs: [{ id: "a", kind: "note", name: "A", noteUUID: "n1" },
               { id: "b", kind: "tag", name: "B", tag: "b" }],
        activeTabId: "a",
        settings: {},
      });

      await handleMoveTabDir(app, { tabId: "b", direction: "left" });
      let written = JSON.parse(app.setSetting.mock.calls[0][1]);
      expect(written.tabs.map(t => t.id)).toEqual(["b", "a"]);

      await handleMoveTabDir(app, { tabId: "a", direction: "right" }); // already last
      expect(app.setSetting.mock.calls.length).toBe(1); // no second write
    });

    it("setDateFormat persists a non-empty format and re-renders", async () => {
      const app = withNoteTab(makeApp());
      app.prompt.mockResolvedValue(["DD MMM YYYY"]);
      await handleSetDateFormat(app);

      const written = JSON.parse(app.setSetting.mock.calls[0][1]);
      expect(written.settings.dateFormat).toBe("DD MMM YYYY");
      expect(app.context.renderEmbed).toHaveBeenCalled();

      app.prompt.mockResolvedValue(["   "]);
      const before = app.setSetting.mock.calls.length;
      await handleSetDateFormat(app);
      expect(app.setSetting.mock.calls.length).toBe(before);
    });
  });

  describe("extras (Phase 5)", () => {
    describe("handleCardMenu", () => {
      it("add-label branch appends a wiki-link from the picked note", async () => {
        const app = makeApp();
        app.prompt
          .mockResolvedValueOnce("label")                       // menu choice (single value)
          .mockResolvedValueOnce({ uuid: "ln1", name: "My Label" }); // note picker

        await handleCardMenu(app, { cardId: "u1" });

        expect(app.updateTask).toHaveBeenCalledWith("u1", { content: "one\n[[My Label]]" });
        expect(app.context.renderEmbed).toHaveBeenCalled();
      });

      it("set-date branch writes a unix timestamp; blank clears", async () => {
        const app = makeApp();
        app.prompt
          .mockResolvedValueOnce("date")
          .mockResolvedValueOnce("2026-08-21");
        await handleCardMenu(app, { cardId: "u1" });

        const [, updates] = app.updateTask.mock.calls[0];
        expect(updates.startAt).toBe(Math.floor(new Date("2026-08-21").getTime() / 1000));

        app.prompt
          .mockResolvedValueOnce("date")
          .mockResolvedValueOnce("");
        await handleCardMenu(app, { cardId: "u1" });
        expect(app.updateTask).toHaveBeenLastCalledWith("u1", { startAt: null });
      });

      it("create-note branch creates a note and links it from the task", async () => {
        const app = makeApp();
        app.prompt.mockResolvedValueOnce("note");
        await handleCardMenu(app, { cardId: "u1" });

        expect(app.createNote).toHaveBeenCalledWith("one");
        expect(app.updateTask).toHaveBeenCalledWith("u1", { content: "one\n[[one]]" });
      });

      it("does nothing on cancel or missing task", async () => {
        const app = makeApp();
        app.prompt.mockResolvedValue(null);
        await handleCardMenu(app, { cardId: "u1" });
        app.getTask.mockResolvedValue(null);
        await handleCardMenu(app, { cardId: "ghost" });
        expect(app.updateTask).not.toHaveBeenCalled();
      });
    });

    describe("handleQuickSetDate", () => {
      it("prompts with current date and updates startAt timestamp", async () => {
        const app = makeApp();
        app.getTask.mockResolvedValue({ uuid: "u1", startAt: Math.floor(new Date("2026-08-21").getTime() / 1000) });
        app.prompt.mockResolvedValueOnce("2026-08-25");

        await handleQuickSetDate(app, { cardId: "u1" });

        const [, updates] = app.updateTask.mock.calls[0];
        expect(updates.startAt).toBe(Math.floor(new Date("2026-08-25").getTime() / 1000));
        expect(app.context.renderEmbed).toHaveBeenCalled();
      });

      it("clears startAt when prompt submitted blank", async () => {
        const app = makeApp();
        app.getTask.mockResolvedValue({ uuid: "u1", startAt: 123456 });
        app.prompt.mockResolvedValueOnce("");

        await handleQuickSetDate(app, { cardId: "u1" });

        expect(app.updateTask).toHaveBeenCalledWith("u1", { startAt: null });
      });

      it("aborts when cancelled or task missing", async () => {
        const app = makeApp();
        app.prompt.mockResolvedValueOnce(null);
        await handleQuickSetDate(app, { cardId: "u1" });
        app.getTask.mockResolvedValueOnce(null);
        await handleQuickSetDate(app, { cardId: "missing" });
        expect(app.updateTask).not.toHaveBeenCalled();
      });
    });

    describe("handleGlobalSearch", () => {
      it("searches all notes and opens the pick", async () => {
        const app = makeApp();
        app.searchNotes.mockResolvedValue([{ uuid: "r1", name: "Result One" }]);
        app.prompt.mockResolvedValue("r1");

        await handleGlobalSearch(app, { query: "hello" });

        expect(app.searchNotes).toHaveBeenCalledWith("hello");
        const promptArgs = app.prompt.mock.calls[0];
        expect(promptArgs[1].inputs[0].options[0]).toEqual({ label: "Result One", value: "r1" });
        expect(app.navigate).toHaveBeenCalledWith("https://www.amplenote.com/notes/r1");
      });

      it("alerts when nothing matches and ignores empty queries", async () => {
        const app = makeApp();
        await handleGlobalSearch(app, { query: "nothing-here" });
        expect(app.alert).toHaveBeenCalled();

        const before = app.searchNotes.mock.calls.length;
        await handleGlobalSearch(app, {});
        expect(app.searchNotes.mock.calls.length).toBe(before);
      });
    });

    describe("handleMoveColumnToTab", () => {
      function withTwoNoteTabs(app) {
        app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
          tabs: [
            { id: "t1", kind: "note", name: "Board A", noteUUID: "n1" },
            { id: "t2", kind: "note", name: "Board B", noteUUID: "n2" },
          ],
          activeTabId: "t1",
          settings: {},
        });
        return app;
      }

      it("transfers the column after target selection + confirmation", async () => {
        const app = withTwoNoteTabs(makeApp());
        app.prompt
          .mockResolvedValueOnce("t2")   // target select
          .mockResolvedValueOnce(true);  // confirm checkbox

        await handleMoveColumnToTab(app, { tabId: "t1", columnId: "0" });

        expect(app.insertNoteContent).toHaveBeenCalledWith(
          { uuid: "n2" }, expect.stringContaining("# Alpha"), { atEnd: true }
        );
        expect(app.replaceNoteContent).toHaveBeenCalledTimes(1);
        expect(app.context.renderEmbed).toHaveBeenCalled();
      });

      it("aborts without confirmation or candidate tabs", async () => {
        const app = withTwoNoteTabs(makeApp());
        app.prompt
          .mockResolvedValueOnce("t2")
          .mockResolvedValueOnce(false);
        await handleMoveColumnToTab(app, { tabId: "t1", columnId: "0" });
        expect(app.replaceNoteContent).not.toHaveBeenCalled();

        const lonely = makeApp(); // only one note tab -> no candidates
        lonely.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
          tabs: [{ id: "t1", kind: "note", name: "A", noteUUID: "n1" }],
          activeTabId: "t1",
          settings: {},
        });
        await handleMoveColumnToTab(lonely, { tabId: "t1", columnId: "0" });
        expect(lonely.alert).toHaveBeenCalled();
      });
    });
  });

  describe("notes boards (third kind)", () => {
    const NB_NOTES = [
      { uuid: "na", name: "Project A", tags: ["kanban"] },
      { uuid: "nb", name: "Project B", tags: ["kanban"] },
    ];

    function notesApp() {
      const app = makeApp();
      app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
        tabs: [{ id: "tn", kind: "notes", name: "Kanban", tag: "kanban" }],
        activeTabId: "tn",
        settings: {},
      });
      app.filterNotes.mockResolvedValue(NB_NOTES);
      app.getNoteTasks.mockResolvedValue([{ uuid: "t1", content: "task" }]);
      app.getTask.mockImplementation(async (id) => ({ uuid: id, noteUUID: "na", content: "task" }));
      return app;
    }

    it("moveCard moves the task to the target note natively", async () => {
      const app = notesApp();
      await handleMoveCard(app, { tabId: "tn", cardId: "t1", toColumnId: "note:nb" });
      expect(app.updateTask).toHaveBeenCalledWith("t1", { noteUUID: "nb" });
      expect(app.context.renderEmbed).toHaveBeenCalled();
    });

    it("moveCard is a no-op for same-column drops", async () => {
      const app = notesApp();
      await handleMoveCard(app, { tabId: "tn", cardId: "t1", toColumnId: "note:na" });
      expect(app.updateTask).not.toHaveBeenCalled();
    });

    it("createCard inserts a task directly into the target note", async () => {
      const app = notesApp();
      await handleCreateCard(app, { tabId: "tn", columnId: "note:nb" });
      expect(app.insertTask).toHaveBeenCalledWith({ uuid: "nb" }, { content: "typed content" });
      expect(app.context.renderEmbed).toHaveBeenCalled();
    });

    it("renameNote renames the column's note", async () => {
      const app = notesApp();
      app.notes = { find: jest.fn().mockResolvedValue({ uuid: "nb", name: "Project B" }) };
      app.setNoteName = jest.fn().mockResolvedValue(true);
      app.prompt.mockResolvedValue(["Project B v2"]);

      await handleRenameNote(app, { tabId: "tn", columnId: "note:nb" });

      expect(app.setNoteName).toHaveBeenCalledWith({ uuid: "nb" }, "Project B v2");
      expect(app.context.renderEmbed).toHaveBeenCalled();
    });

    it("structural heading actions are rejected on notes boards", async () => {
      const app = notesApp();
      await handleCreateColumn(app, { tabId: "tn" });
      await handleDeleteColumn(app, { tabId: "tn", columnId: "note:nb" });
      await handleMoveColumnToTab(app, { tabId: "tn", columnId: "note:nb" });
      expect(app.prompt).not.toHaveBeenCalled();
      expect(app.replaceNoteContent).not.toHaveBeenCalled();
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

    describe("handleReorderTabs", () => {
      it("reorders tabs array based on drag indices", async () => {
        const app = makeApp();
        app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
          tabs: [
            { id: "t1", kind: "note", name: "A", noteUUID: "n1" },
            { id: "t2", kind: "note", name: "B", noteUUID: "n2" },
          ],
          activeTabId: "t1",
          settings: {},
        });

        await handleReorderTabs(app, { fromIndex: 0, toIndex: 1 });

        const written = JSON.parse(app.setSetting.mock.calls[0][1]);
        expect(written.tabs[0].id).toBe("t2");
        expect(written.tabs[1].id).toBe("t1");
      });
    });

    describe("handleSaveColumnsToNote", () => {
      it("prompts for confirmation and rewrites note headings", async () => {
        const app = makeApp();
        app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
          tabs: [{ id: "t1", kind: "note", name: "A", noteUUID: "n1" }],
          activeTabId: "t1",
          settings: {},
        });
        app.prompt.mockResolvedValue([true]);

        await handleSaveColumnsToNote(app, { tabId: "t1", columnIds: ["2", "0"] });

        expect(app.prompt).toHaveBeenCalled();
        expect(app.replaceNoteContent).toHaveBeenCalled();
        expect(app.context.renderEmbed).toHaveBeenCalled();
      });

      it("aborts when user cancels the prompt", async () => {
        const app = makeApp();
        app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
          tabs: [{ id: "t1", kind: "note", name: "A", noteUUID: "n1" }],
          activeTabId: "t1",
          settings: {},
        });
        app.prompt.mockResolvedValue(null);

        await handleSaveColumnsToNote(app, { tabId: "t1", columnIds: ["2", "0"] });

        expect(app.replaceNoteContent).not.toHaveBeenCalled();
      });
    });
  });
});
