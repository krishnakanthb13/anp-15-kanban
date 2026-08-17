import { jest } from '@jest/globals';
import { refreshKanbanPage, getOrCreateKanbanNote } from '../lib/api/noteManager.js';

describe("noteManager", () => {
  let appMock;

  beforeEach(() => {
    appMock = {
      settings: {},
      context: { pluginUUID: "plugin-123" },
      replaceNoteContent: jest.fn().mockResolvedValue(),
      navigate: jest.fn(),
      createNote: jest.fn(),
      setSetting: jest.fn().mockResolvedValue()
    };
  });

  describe("refreshKanbanPage", () => {
    describe("Happy Path", () => {
      it("refreshes the page by replacing content twice and navigating", async () => {
        appMock.settings["Current_Note_UUID [Do not Edit!]"] = "note-uuid";
        
        await refreshKanbanPage(appMock);
        
        expect(appMock.replaceNoteContent).toHaveBeenCalledTimes(2);
        expect(appMock.replaceNoteContent).toHaveBeenNthCalledWith(
          1, { uuid: "note-uuid" }, "Refreshing the Page!"
        );
        expect(appMock.replaceNoteContent).toHaveBeenNthCalledWith(
          2, { uuid: "note-uuid" }, `<object data="plugin://plugin-123" data-aspect-ratio="1" />`
        );
        expect(appMock.navigate).toHaveBeenCalledWith("https://www.amplenote.com/notes/note-uuid");
      });
    });

    describe("Edge Cases", () => {
      it("returns early if destNoteUUID is not set", async () => {
        await refreshKanbanPage(appMock);
        
        expect(appMock.replaceNoteContent).not.toHaveBeenCalled();
        expect(appMock.navigate).not.toHaveBeenCalled();
      });
    });

    describe("Error Handling", () => {
      it("catches and logs errors without throwing", async () => {
        appMock.settings["Current_Note_UUID [Do not Edit!]"] = "note-uuid";
        appMock.replaceNoteContent.mockRejectedValue(new Error("Network error"));
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        await refreshKanbanPage(appMock);
        
        expect(consoleSpy).toHaveBeenCalledWith("Error refreshing Kanban page:", expect.any(Error));
        consoleSpy.mockRestore();
      });
    });
  });

  describe("getOrCreateKanbanNote", () => {
    describe("Happy Path", () => {
      it("returns existing UUID if present in settings", async () => {
        appMock.settings["Current_Note_UUID [Do not Edit!]"] = "existing-uuid";
        
        const result = await getOrCreateKanbanNote(appMock);
        
        expect(result).toBe("existing-uuid");
        expect(appMock.createNote).not.toHaveBeenCalled();
      });

      it("creates a new note and updates settings if not present", async () => {
        appMock.createNote.mockResolvedValue("new-uuid");
        
        const result = await getOrCreateKanbanNote(appMock);
        
        expect(result).toBe("new-uuid");
        expect(appMock.createNote).toHaveBeenCalledWith("Kanban Board", ["-reports/-kanban"]);
        expect(appMock.setSetting).toHaveBeenCalledWith("Current_Note_UUID [Do not Edit!]", "new-uuid");
      });
    });

    describe("Error Handling", () => {
      it("returns null on error", async () => {
        appMock.createNote.mockRejectedValue(new Error("API Error"));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        const result = await getOrCreateKanbanNote(appMock);
        
        expect(result).toBeNull();
        consoleSpy.mockRestore();
      });
    });
  });
});
