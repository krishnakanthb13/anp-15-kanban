import { jest } from '@jest/globals';
import { handleCreateNewNote } from '../lib/features/createNewNote.js';
import { refreshKanbanPage } from '../lib/api/noteManager.js';

describe("createNewNote - handleCreateNewNote", () => {
  let appMock;

  beforeEach(() => {
    appMock = {
      settings: {},
      prompt: jest.fn(),
      createNote: jest.fn(),
      getNoteContent: jest.fn(),
      replaceNoteContent: jest.fn(),
      notes: { find: jest.fn() }
    };
    jest.clearAllMocks();
  });

  describe("Happy Path", () => {
    it("creates a new note without template", async () => {
      appMock.prompt.mockResolvedValue(["New Note", null]);
      appMock.settings["Kanban Filter Tag"] = "-my-tag";
      appMock.createNote.mockResolvedValue("new-uuid");
      const mockNote = { insertTask: jest.fn().mockResolvedValue() };
      appMock.notes.find.mockResolvedValue(mockNote);

      await handleCreateNewNote(appMock);

      expect(appMock.createNote).toHaveBeenCalledWith("New Note", ["-my-tag"]);
      expect(appMock.notes.find).toHaveBeenCalledWith("new-uuid");
      expect(mockNote.insertTask).toHaveBeenCalled();
    });

    it("creates a new note using template", async () => {
      appMock.prompt.mockResolvedValue(["New Note", { uuid: "template-uuid" }]);
      appMock.createNote.mockResolvedValue("new-uuid");
      appMock.getNoteContent.mockResolvedValue("# Template content");

      await handleCreateNewNote(appMock);

      expect(appMock.createNote).toHaveBeenCalledWith("New Note", ["-reports/-kanban"]);
      expect(appMock.getNoteContent).toHaveBeenCalledWith({ uuid: "template-uuid" });
      expect(appMock.replaceNoteContent).toHaveBeenCalledWith({ uuid: "new-uuid" }, "# Template content");
    });
  });

  describe("Edge Cases", () => {
    it("returns early if prompt is cancelled", async () => {
      appMock.prompt.mockResolvedValue(null);

      await handleCreateNewNote(appMock);

      expect(appMock.createNote).not.toHaveBeenCalled();
    });
  });
});
