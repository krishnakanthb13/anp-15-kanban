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
  handleCreateColumnNote,
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
  parseDateToUnixSeconds,
  parseTimeToHoursMinutes,
  formatLocalTimeStr,
  combineDateAndTime,
  handleGlobalSearch,
  handleMoveColumnToTab,
  handleRenameNote,
  handleDeleteNote,
  handleReorderTabs,
  handleReorderColumns,
  handleSaveColumnsToNote,
  handleRefreshTab,
  handleRefreshAll,
  linkNoteInTaskContent,
  normalizeTagList,
  handleOpenTag,
} from '../lib/features/embedActions.js';
import { SETTINGS_KEYS } from '../lib/core/constants.js';

const NOTE_MD = ["# Alpha", "- [ ] one <!-- {\"uuid\":\"u1\"} -->", "# Done"].join("\n");

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
    deleteNote: jest.fn().mockResolvedValue(true),
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

function withNoteTab(app, tabId = "t1", noteUUID = "n1") {
  app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
    tabs: [{ id: tabId, kind: "note", name: "Board", noteUUID }],
    activeTabId: tabId,
    settings: {},
  });
  return app;
}

describe("embedActions", () => {
  describe("handleEmbedAction dispatcher", () => {
    it("routes registered actions to handlers", async () => {
      const app = makeApp();
      const result = await handleEmbedAction(app, ["ping", {}]);
      expect(result).toEqual({ ok: true });
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

  describe("handleRefreshTab and handleRefreshAll", () => {
    it("handleRefreshTab returns fresh board data without calling renderEmbed", async () => {
      const app = withNoteTab(makeApp());
      const res = await handleRefreshTab(app, { tabId: "t1" });
      expect(res.ok).toBe(true);
      expect(res.board).toBeDefined();
      expect(app.context.renderEmbed).not.toHaveBeenCalled();
    });

    it("handleRefreshAll returns all boards without calling renderEmbed", async () => {
      const app = withNoteTab(makeApp());
      const res = await handleRefreshAll(app);
      expect(res.ok).toBe(true);
      expect(res.boards).toBeDefined();
      expect(app.context.renderEmbed).not.toHaveBeenCalled();
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
    it("persists valid theme ids into unified settings", async () => {
      const app = makeApp();
      await handleSaveTheme(app, { themeId: "dracula" });
      expect(app.setSetting).toHaveBeenCalledWith(
        SETTINGS_KEYS.settings,
        expect.stringContaining('"theme":"dracula"')
      );
    });

    it("accepts string payload directly", async () => {
      const app = makeApp();
      await handleSaveTheme(app, "nord");
      expect(app.setSetting).toHaveBeenCalledWith(
        SETTINGS_KEYS.settings,
        expect.stringContaining('"theme":"nord"')
      );
    });

    it("rejects invalid theme ids without writing", async () => {
      const app = makeApp();
      await handleSaveTheme(app, { themeId: "hacker-theme" });
      await handleSaveTheme(app, {});
      await handleSaveTheme(app);
      expect(app.setSetting).not.toHaveBeenCalled();
    });
  });

  describe("handleSaveSetting", () => {
    it("persists top-bar view settings to unified settings", async () => {
      const app = makeApp();
      await handleEmbedAction(app, ["saveSetting", { showEmptyColumns: true, sortMode: "score" }]);
      expect(app.setSetting).toHaveBeenCalledWith(
        SETTINGS_KEYS.settings,
        expect.stringContaining('"showEmptyColumns":true')
      );
      expect(app.setSetting).toHaveBeenCalledWith(
        SETTINGS_KEYS.settings,
        expect.stringContaining('"sortMode":"score"')
      );
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
    it("moves to the completed column and completes the task", async () => {
      const app = withNoteTab(makeApp());
      await handleMoveCard(app, { tabId: "t1", cardId: "u1", toColumnId: "completed", toColumnName: "Completed" });

      const [, updates] = app.updateTask.mock.calls[0];
      expect(typeof updates.completedAt).toBe("number");
      expect(app.context.renderEmbed).not.toHaveBeenCalled();
    });

    it("moves to a markdown heading column (even named Done) without completing the task", async () => {
      const app = withNoteTab(makeApp());
      await handleMoveCard(app, { tabId: "t1", cardId: "u1", toColumnId: "2", toColumnName: "Done" });

      expect(app.updateTask).toHaveBeenCalledWith("u1", { completedAt: null });
      expect(app.replaceNoteContent).toHaveBeenCalledTimes(1);
    });

    it("triggers re-render when forceRerender is true", async () => {
      const app = withNoteTab(makeApp());
      await handleMoveCard(app, { tabId: "t1", cardId: "u1", toColumnId: "completed", toColumnName: "Completed", forceRerender: true });
      expect(app.context.renderEmbed).toHaveBeenCalledTimes(1);
    });

    it("moves to another column and reopens the task if it was completed", async () => {
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
    it("prompts, creates, relocates and returns fresh in-memory board snapshot without calling renderEmbed", async () => {
      // Simulate insertTask having placed the new task at the top of the note.
      const mdWithNew = [
        "- [ ] typed content <!-- {\"uuid\":\"new-task\"} -->",
        "# Alpha",
        "# Beta",
      ].join("\n");
      const app = withNoteTab(makeApp(mdWithNew));
      const res = await handleCreateCard(app, { tabId: "t1", columnId: "2" });

      expect(app.prompt).toHaveBeenCalled();
      expect(app.insertTask).toHaveBeenCalledWith({ uuid: "n1" }, { content: "typed content" });
      expect(app.replaceNoteContent).toHaveBeenCalledTimes(1);
      expect(app.context.renderEmbed).not.toHaveBeenCalled();
      expect(res).toEqual(expect.objectContaining({ ok: true, tabId: "t1", board: expect.any(Object) }));
    });

    it("calls renderEmbed if forceRerender is true", async () => {
      const mdWithNew = [
        "- [ ] typed content <!-- {\"uuid\":\"new-task\"} -->",
        "# Alpha",
        "# Beta",
      ].join("\n");
      const app = withNoteTab(makeApp(mdWithNew));
      await handleCreateCard(app, { tabId: "t1", columnId: "2", forceRerender: true });
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
    it("saves edited task details and returns updated board", async () => {
      const app = makeApp();
      app.prompt.mockResolvedValue(["**edited**", true, false, null, null, "5", "keep"]);
      const res = await handleEditCard(app, { cardId: "u1" });
      expect(app.updateTask).toHaveBeenCalledWith("u1", expect.objectContaining({ content: "**edited**", important: true, score: 5 }));
      expect(res).toEqual(expect.objectContaining({ ok: true, board: expect.any(Object) }));
    });

    it("handles completed task details dialog and reopening", async () => {
      const app = makeApp();
      app.getTask.mockResolvedValueOnce({ uuid: "u1", content: "done one", completedAt: 1700000000 });
      app.prompt.mockResolvedValue(["done one updated", "__top__", "reopen", false, false]);
      await handleEditCard(app, { cardId: "u1" });
      expect(app.updateTask).toHaveBeenCalledWith("u1", expect.objectContaining({ content: "done one updated", completedAt: null, dismissedAt: null }));
    });

    it("skips writes when unchanged, cancelled, or task missing", async () => {
      const app = makeApp();
      app.prompt.mockResolvedValue(["one", false, false, null, null, "", "keep"]); // unchanged
      await handleEditCard(app, { cardId: "u1" });
      app.prompt.mockResolvedValue(null);
      await handleEditCard(app, { cardId: "u1" });
      expect(app.updateTask).not.toHaveBeenCalled();

      app.prompt.mockResolvedValue(["changed", false, false, null, null, "", "keep"]);
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
      expect(app.context.renderEmbed).not.toHaveBeenCalled();
    });

    it("moveCard is a no-op for same note column drops", async () => {
      const app = tagApp();
      await handleMoveCard(app, { tabId: "tg", cardId: "u1", toColumnId: "note:n1" });
      expect(app.updateTask).not.toHaveBeenCalled();
    });

    it("createCard beside note creates a task at start of note (unsorted)", async () => {
      const app = tagApp();
      const res = await handleCreateCard(app, { tabId: "tg", columnId: "note:n2" });
      expect(app.insertTask).toHaveBeenCalledWith({ uuid: "n2" }, { content: "typed content" });
      expect(res).toEqual(expect.objectContaining({ ok: true, tabId: "tg", board: expect.any(Object) }));
    });

    it("createCard beside section header creates a task relocated under that header", async () => {
      const app = tagApp();
      app.getNoteContent = jest.fn().mockResolvedValue("# Header A\n- [ ] Task 1\n# Header B\n");
      app.insertTask = jest.fn().mockResolvedValue("new-task-uuid");
      app.getTask = jest.fn().mockResolvedValue({ uuid: "new-task-uuid", content: "typed content" });
      const res = await handleCreateCard(app, { tabId: "tg", columnId: "note:n1", sectionId: "3", sectionName: "Header B" });
      expect(app.insertTask).toHaveBeenCalledWith({ uuid: "n1" }, { content: "typed content" });
      expect(app.replaceNoteContent).toHaveBeenCalled();
      expect(res).toEqual(expect.objectContaining({ ok: true, tabId: "tg", board: expect.any(Object) }));
    });

    it("openCard navigates to the note", async () => {
      const app = makeApp();
      await handleOpenCard(app, { cardId: "abc" });
      expect(app.navigate).toHaveBeenCalledWith("https://www.amplenote.com/notes/abc");
    });

    it("structural column actions without sectionId are rejected on tag boards", async () => {
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

    it("handleCreateColumnNote creates a new tagged note with custom tags and returns board", async () => {
      const app = tagApp();
      app.prompt.mockResolvedValueOnce(["New Project Doc", "projects, active, priority"]);
      const res = await handleCreateColumnNote(app, { tabId: "tg" });

      expect(app.createNote).toHaveBeenCalledWith("New Project Doc", ["projects", "active", "priority"]);
      expect(res).toEqual(expect.objectContaining({ ok: true, tabId: "tg", board: expect.any(Object) }));
    });

    it("handleDeleteNote prompts confirmation and deletes note via app.deleteNote", async () => {
      const app = tagApp();
      app.prompt.mockResolvedValueOnce(true); // confirmed checkbox
      const res = await handleDeleteNote(app, { tabId: "tg", columnId: "note:n1", noteName: "Alpha doc" });

      expect(app.deleteNote).toHaveBeenCalledWith({ uuid: "n1" });
      expect(res).toEqual(expect.objectContaining({ ok: true, tabId: "tg", board: expect.any(Object) }));
    });

    it("handleDeleteNote aborts without confirmation", async () => {
      const app = tagApp();
      app.prompt.mockResolvedValueOnce(false); // unconfirmed
      await handleDeleteNote(app, { tabId: "tg", columnId: "note:n1", noteName: "Alpha doc" });

      expect(app.deleteNote).not.toHaveBeenCalled();
    });

    it("header operations on a specific note within a tag tab work with noteUUID, sectionId, and heading level", async () => {
      const app = tagApp();
      // Test createColumn in a specific note with heading level 1
      app.prompt.mockResolvedValueOnce(["Next Steps", "1"]);
      await handleCreateColumn(app, { tabId: "tg", noteUUID: "n1" });
      expect(app.insertNoteContent).toHaveBeenCalledWith({ uuid: "n1" }, "\n# Next Steps\n", { atEnd: true });

      // Test createColumn with heading level 3
      app.prompt.mockResolvedValueOnce(["Sub Stage", "3"]);
      await handleCreateColumn(app, { tabId: "tg", noteUUID: "n1" });
      expect(app.insertNoteContent).toHaveBeenCalledWith({ uuid: "n1" }, "\n### Sub Stage\n", { atEnd: true });

      // Test renameColumn on a section in note n1
      app.prompt.mockResolvedValueOnce(["Alpha Renamed"]);
      await handleRenameColumn(app, { tabId: "tg", noteUUID: "n1", sectionId: "0" });
      expect(app.replaceNoteContent).toHaveBeenCalledWith({ uuid: "n1" }, expect.stringContaining("# Alpha Renamed"));

      // Test deleteColumn on a section in note n1
      app.prompt.mockResolvedValueOnce(true);
      await handleDeleteColumn(app, { tabId: "tg", noteUUID: "n1", sectionId: "2" });
      expect(app.replaceNoteContent).toHaveBeenCalled();

      // Test moveColumn on a section in note n1
      await handleMoveColumn(app, { tabId: "tg", noteUUID: "n1", sectionId: "0", direction: "right" });
      expect(app.replaceNoteContent).toHaveBeenCalled();
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

    it("addTab locks in-flight execution to prevent duplicate notes on rapid concurrent calls", async () => {
      const app = makeApp();
      app.createNote.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve("new-note-uuid"), 15)));
      app.prompt
        .mockResolvedValueOnce("new_note")
        .mockResolvedValueOnce("Custom Kanban");

      // Concurrent invocation
      const p1 = handleAddTab(app);
      const p2 = handleAddTab(app);

      await Promise.all([p1, p2]);

      expect(app.createNote).toHaveBeenCalledTimes(1);
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

    it("addTab creates a notes tab for multi-note project boards", async () => {
      const app = makeApp();
      app.prompt
        .mockResolvedValueOnce("notes")
        .mockResolvedValueOnce(["clients"]);

      await handleAddTab(app);

      const written = JSON.parse(app.setSetting.mock.calls[0][1]);
      expect(written.tabs[0]).toMatchObject({ kind: "notes", name: "clients", tag: "clients" });
      expect(written.activeTabId).toBe(written.tabs[0].id);
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

    it("setDateFormat persists a non-empty format and returns in-place result without flicker", async () => {
      const app = withNoteTab(makeApp());
      app.prompt.mockResolvedValue(["DD MMM YYYY"]);
      const res = await handleSetDateFormat(app);

      expect(app.setSetting).toHaveBeenCalledWith(
        SETTINGS_KEYS.settings,
        expect.stringContaining('"dateFormat":"DD MMM YYYY"')
      );
      expect(app.context.renderEmbed).not.toHaveBeenCalled();
      expect(res).toEqual(expect.objectContaining({ ok: true, dateFormat: "DD MMM YYYY" }));

      app.prompt.mockResolvedValue(["   "]);
      const before = app.setSetting.mock.calls.length;
      const resCanceled = await handleSetDateFormat(app);
      expect(app.setSetting.mock.calls.length).toBe(before);
      expect(resCanceled).toEqual(expect.objectContaining({ ok: false, canceled: true }));
    });
  });

  describe("extras (Phase 5)", () => {
    describe("handleCardMenu", () => {
      it("link-note branch appends an Amplenote note link from the picked note", async () => {
        const app = makeApp();
        app.prompt
          .mockResolvedValueOnce("link_note")                        // menu choice (single value)
          .mockResolvedValueOnce({ uuid: "ln1", name: "My Label" }); // note picker

        const res = await handleCardMenu(app, { cardId: "u1" });

        expect(app.updateTask).toHaveBeenCalledWith("u1", { content: "one [My Label](https://www.amplenote.com/notes/ln1)" });
        expect(res).toEqual(expect.objectContaining({ ok: true, board: expect.any(Object) }));
      });

      describe("linkNoteInTaskContent", () => {
        it("appends clean note link to existing task content", () => {
          expect(linkNoteInTaskContent("Testing 3 Dots", "Kanban Test", "03a5d0aa"))
            .toBe("Testing 3 Dots [Kanban Test](https://www.amplenote.com/notes/03a5d0aa)");
        });

        it("does not duplicate note link if already present in content", () => {
          expect(linkNoteInTaskContent("Testing 3 Dots [Kanban Test](https://www.amplenote.com/notes/03a5d0aa)", "Kanban Test", "03a5d0aa"))
            .toBe("Testing 3 Dots [Kanban Test](https://www.amplenote.com/notes/03a5d0aa)");
        });

        it("handles empty task content by returning only the note link", () => {
          expect(linkNoteInTaskContent("", "Kanban Test", "03a5d0aa"))
            .toBe("[Kanban Test](https://www.amplenote.com/notes/03a5d0aa)");
        });
      });

      it("set-date branch writes a unix timestamp; blank clears", async () => {
        const app = makeApp();
        app.prompt
          .mockResolvedValueOnce("date")
          .mockResolvedValueOnce("2026-08-21");
        await handleCardMenu(app, { cardId: "u1" });

        const [, updates] = app.updateTask.mock.calls[0];
        expect(updates.startAt).toBe(Math.floor(new Date(2026, 7, 21, 0, 0, 0).getTime() / 1000));

        app.prompt
          .mockResolvedValueOnce("date")
          .mockResolvedValueOnce("");
        await handleCardMenu(app, { cardId: "u1" });
        expect(app.updateTask).toHaveBeenLastCalledWith("u1", { startAt: null });
      });

      it("create-note branch creates a fresh note and links it from the task", async () => {
        const app = makeApp();
        app.prompt
          .mockResolvedValueOnce("note")
          .mockResolvedValueOnce(["one"]);
        await handleCardMenu(app, { cardId: "u1" });

        expect(app.createNote).toHaveBeenCalledWith("one", []);
        expect(app.updateTask).toHaveBeenCalledWith("u1", { content: "[one](https://www.amplenote.com/notes/new-note)" });
      });

      it("complete and uncomplete branches toggle completion timestamp", async () => {
        const app = makeApp();
        app.prompt.mockResolvedValueOnce("complete");
        await handleCardMenu(app, { cardId: "u1" });
        expect(app.updateTask).toHaveBeenCalledWith("u1", expect.objectContaining({ completedAt: expect.any(Number) }));

        app.getTask.mockResolvedValueOnce({ uuid: "u1", content: "one", completedAt: 123456 });
        app.prompt.mockResolvedValueOnce("uncomplete");
        await handleCardMenu(app, { cardId: "u1" });
        expect(app.updateTask).toHaveBeenLastCalledWith("u1", { completedAt: null, dismissedAt: null });
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

    describe("handleQuickSetDate and parseDateToUnixSeconds", () => {
      it("parses diverse date formats reliably", () => {
        expect(parseDateToUnixSeconds(null)).toBeNull();
        expect(parseDateToUnixSeconds("")).toBeNull();
        expect(parseDateToUnixSeconds("   ")).toBeNull();
        expect(parseDateToUnixSeconds(1787270400)).toBe(1787270400);
        expect(parseDateToUnixSeconds(1787270400000)).toBe(1787270400);
        expect(parseDateToUnixSeconds("1787270400")).toBe(1787270400);
        expect(parseDateToUnixSeconds("2026-08-25")).toBe(Math.floor(new Date(2026, 7, 25, 0, 0, 0).getTime() / 1000));
        expect(parseDateToUnixSeconds(new Date("2026-08-25T00:00:00Z"))).toBe(Math.floor(new Date("2026-08-25T00:00:00Z").getTime() / 1000));
      });

      it("prompts with current date and updates startAt timestamp", async () => {
        const app = makeApp();
        app.getTask.mockResolvedValue({ uuid: "u1", startAt: Math.floor(new Date("2026-08-21").getTime() / 1000) });
        app.prompt.mockResolvedValueOnce("2026-08-25");

        const res = await handleQuickSetDate(app, { cardId: "u1" });

        const [, updates] = app.updateTask.mock.calls[0];
        expect(updates.startAt).toBe(Math.floor(new Date(2026, 7, 25, 0, 0, 0).getTime() / 1000));
        expect(res).toEqual(expect.objectContaining({ ok: true, board: expect.any(Object) }));
      });

      it("handles numeric epoch timestamp returns from Amplenote prompt", async () => {
        const app = makeApp();
        app.getTask.mockResolvedValue({ uuid: "u1", startAt: null });
        app.prompt.mockResolvedValueOnce(1787270400);

        const res = await handleQuickSetDate(app, { cardId: "u1" });

        const [, updates] = app.updateTask.mock.calls[0];
        expect(updates.startAt).toBe(1787270400);
        expect(res).toEqual(expect.objectContaining({ ok: true, board: expect.any(Object) }));
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

        const res = await handleMoveColumnToTab(app, { tabId: "t1", columnId: "0" });

        expect(app.insertNoteContent).toHaveBeenCalledWith(
          { uuid: "n2" }, expect.stringContaining("# Alpha"), { atEnd: true }
        );
        expect(app.replaceNoteContent).toHaveBeenCalledTimes(1);
        expect(res).toEqual(expect.objectContaining({ ok: true, tabId: "t1", board: expect.any(Object) }));
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
      expect(app.context.renderEmbed).not.toHaveBeenCalled();
    });

    it("moveCard is a no-op for same-column drops", async () => {
      const app = notesApp();
      await handleMoveCard(app, { tabId: "tn", cardId: "t1", toColumnId: "note:na" });
      expect(app.updateTask).not.toHaveBeenCalled();
    });

    it("createCard inserts a task directly into the target note and returns in-memory board snapshot", async () => {
      const app = notesApp();
      const res = await handleCreateCard(app, { tabId: "tn", columnId: "note:nb" });
      expect(app.insertTask).toHaveBeenCalledWith({ uuid: "nb" }, { content: "typed content" });
      expect(app.context.renderEmbed).not.toHaveBeenCalled();
      expect(res).toEqual(expect.objectContaining({ ok: true, tabId: "tn", board: expect.any(Object) }));
    });

    it("createColumnNote creates a note with tag prompt selection and refreshes board", async () => {
      const app = notesApp();
      app.createNote = jest.fn().mockResolvedValue("new-note-uuid");
      app.prompt.mockResolvedValue(["New Project", ["kanban", "clients"]]);

      const res = await handleCreateColumnNote(app, { tabId: "tn" });

      expect(app.createNote).toHaveBeenCalledWith("New Project", ["kanban", "clients"]);
      expect(res).toEqual(expect.objectContaining({ ok: true, tabId: "tn", board: expect.any(Object) }));
    });

    describe("normalizeTagList", () => {
      it("normalizes array of tag strings and enforces limit of 10", () => {
        const input = ["#one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
        const res = normalizeTagList(input);
        expect(res).toEqual(["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]);
      });

      it("normalizes comma/space-separated string", () => {
        expect(normalizeTagList("#alpha, beta; gamma")).toEqual(["alpha", "beta", "gamma"]);
      });

      it("falls back to defaultTag when empty", () => {
        expect(normalizeTagList("", "kanban")).toEqual(["kanban"]);
      });
    });

    it("renameNote renames the column's note", async () => {
      const app = notesApp();
      app.notes = { find: jest.fn().mockResolvedValue({ uuid: "nb", name: "Project B" }) };
      app.setNoteName = jest.fn().mockResolvedValue(true);
      app.prompt.mockResolvedValue(["Project B v2"]);

      const res = await handleRenameNote(app, { tabId: "tn", columnId: "note:nb" });

      expect(app.setNoteName).toHaveBeenCalledWith({ uuid: "nb" }, "Project B v2");
      expect(res).toEqual(expect.objectContaining({ ok: true, tabId: "tn", board: expect.any(Object) }));
    });

    it("openTag navigates to tag in Amplenote", async () => {
      const app = notesApp();
      app.navigate = jest.fn().mockResolvedValue(true);
      await handleOpenTag(app, { tag: "projects/kanban" });
      expect(app.navigate).toHaveBeenCalledWith("https://www.amplenote.com/notes?tag=projects%2Fkanban");
    });

    it("openCard navigates to note in Amplenote", async () => {
      const app = notesApp();
      app.navigate = jest.fn().mockResolvedValue(true);
      await handleOpenCard(app, { noteUUID: "nb" });
      expect(app.navigate).toHaveBeenCalledWith("https://www.amplenote.com/notes/nb");
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
        const res = await handleCreateColumn(app, { tabId: "t1" });
        expect(app.insertNoteContent).toHaveBeenCalledWith(
          { uuid: "n1" }, "\n# typed content\n", { atEnd: true }
        );
        expect(res).toEqual(expect.objectContaining({ ok: true, tabId: "t1", board: expect.any(Object) }));
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
        const res = await handleRenameColumn(app, { tabId: "t1", columnId: "0" });

        const promptArgs = app.prompt.mock.calls[0];
        expect(promptArgs[1].inputs[0].value).toBe("Alpha");
        expect(app.replaceNoteContent).toHaveBeenCalledTimes(1);
        expect(res).toEqual(expect.objectContaining({ ok: true, tabId: "t1", board: expect.any(Object) }));
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
        const res = await handleDeleteColumn(app, { tabId: "t1", columnId: "0" });
        expect(app.replaceNoteContent).toHaveBeenCalledTimes(1);
        expect(res).toEqual(expect.objectContaining({ ok: true, tabId: "t1", board: expect.any(Object) }));
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

    describe("handleReorderColumns", () => {
      it("saves drag-and-drop column order into note and returns updated board", async () => {
        const app = withNoteTab(makeApp());
        const res = await handleReorderColumns(app, { tabId: "t1", columnIds: ["2", "0"] });
        const written = app.replaceNoteContent.mock.calls[0][1];
        expect(written.indexOf("# Beta")).toBeLessThan(written.indexOf("# Alpha"));
        expect(res.ok).toBe(true);
        expect(res.board).toBeDefined();
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
        const res = await handleSetWipLimit(app, { tabId: "t1", columnId: "0" });

        const written = JSON.parse(app.setSetting.mock.calls[0][1]);
        expect(written.tabs[0].columnLimits).toEqual({ Alpha: 4 });
        expect(res).toEqual(expect.objectContaining({ ok: true, tabId: "t1", columnLimits: { Alpha: 4 } }));
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

    describe("handleSaveColumnsToNote / handleReorderColumns", () => {
      it("saves column order into note and returns updated board", async () => {
        const app = makeApp();
        app.settings[SETTINGS_KEYS.tabs] = JSON.stringify({
          tabs: [{ id: "t1", kind: "note", name: "A", noteUUID: "n1" }],
          activeTabId: "t1",
          settings: {},
        });

        const res = await handleSaveColumnsToNote(app, { tabId: "t1", columnIds: ["2", "0"] });

        expect(app.replaceNoteContent).toHaveBeenCalled();
        expect(res.ok).toBe(true);
        expect(res.board).toBeDefined();
      });

      it("no-ops when missing tab or invalid columnIds", async () => {
        const app = makeApp();
        await handleSaveColumnsToNote(app, { tabId: "nonexistent", columnIds: [] });
        expect(app.replaceNoteContent).not.toHaveBeenCalled();
      });
    });

    describe("time helpers & handleQuickSetDate with time", () => {
      it("parses various time formats accurately", () => {
        expect(parseTimeToHoursMinutes("14:30")).toEqual({ hours: 14, minutes: 30 });
        expect(parseTimeToHoursMinutes("2:30pm")).toEqual({ hours: 14, minutes: 30 });
        expect(parseTimeToHoursMinutes("9am")).toEqual({ hours: 9, minutes: 0 });
        expect(parseTimeToHoursMinutes("9:15 AM")).toEqual({ hours: 9, minutes: 15 });
        expect(parseTimeToHoursMinutes("12pm")).toEqual({ hours: 12, minutes: 0 });
        expect(parseTimeToHoursMinutes("12am")).toEqual({ hours: 0, minutes: 0 });
        expect(parseTimeToHoursMinutes("invalid")).toBeNull();
      });

      it("combines date with time string", () => {
        const combined = combineDateAndTime("2026-08-21", "14:30");
        expect(typeof combined).toBe("number");
        const d = new Date(combined * 1000);
        expect(d.getHours()).toBe(14);
        expect(d.getMinutes()).toBe(30);
      });

      it("handles quick set date and time prompt response", async () => {
        const app = makeApp();
        app.getTask.mockResolvedValue({ uuid: "t1", startAt: 1787270400 });
        app.prompt.mockResolvedValue(["2026-08-21", "15:45"]);

        await handleQuickSetDate(app, { cardId: "t1" });

        expect(app.updateTask).toHaveBeenCalled();
        const updated = app.updateTask.mock.calls[0][1];
        expect(typeof updated.startAt).toBe("number");
        const d = new Date(updated.startAt * 1000);
        expect(d.getHours()).toBe(15);
        expect(d.getMinutes()).toBe(45);
      });
    });
  });
});
