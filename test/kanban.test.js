import { jest } from '@jest/globals';
import plugin from '../kanban.js';
import * as tagged from '../lib/features/tagged.js';
import * as taskEdit from '../lib/features/taskEdit.js';
import * as createTask from '../lib/features/createTask.js';
import * as createNewNote from '../lib/features/createNewNote.js';
import * as updateTag from '../lib/features/updateTag.js';
import * as toggleSort from '../lib/features/toggleSort.js';
import * as refreshPage from '../lib/features/refreshPage.js';
import * as kanbanTemplate from '../lib/ui/kanbanTemplate.js';

describe("kanban plugin entry", () => {
  let appMock;

  beforeEach(() => {
    appMock = {
      settings: {},
      filterNotes: jest.fn(),
      getNoteTasks: jest.fn(),
      createNote: jest.fn(),
      setSetting: jest.fn(),
      alert: jest.fn(),
      replaceNoteContent: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe("appOption", () => {
    it("handles Tagged!", () => {
      expect(plugin.appOption["Tagged!"]).toBe(tagged.handleTagged);
    });
  });

  describe("onEmbedCall", () => {
    it("calls underlying functions", async () => {
      appMock.settings = { "Current_Note_UUID [Do not Edit!]": "kanban-note" };
      appMock.replaceNoteContent.mockResolvedValue();
      appMock.getTask = jest.fn().mockResolvedValue(null);
      await plugin.onEmbedCall(appMock, "taskEdit", "uuid-1");
      expect(appMock.getTask).toHaveBeenCalledWith("uuid-1");
    });
  });

  describe("renderEmbed", () => {
    it("fetches notes and tasks and builds template", async () => {
      appMock.settings["Kanban Filter Tag"] = "-test";
      appMock.settings["Toggle Sort"] = "startDate";
      appMock.filterNotes.mockResolvedValue([
        { uuid: "note-1", name: "Note 1", tags: ["tag1"] }
      ]);
      appMock.getNoteTasks.mockResolvedValue([
        { uuid: "task-1", content: "T1", startAt: 100, score: 5, important: true, urgent: false }
      ]);
      const result = await plugin.renderEmbed(appMock);

      expect(appMock.filterNotes).toHaveBeenCalledWith({ tag: "-test" });
      expect(appMock.getNoteTasks).toHaveBeenCalledWith({ uuid: "note-1" }, { includeDone: true });
      expect(result).toContain("T1");
    });

    it("creates default notes if no notes found", async () => {
      appMock.filterNotes.mockResolvedValue([]);
      
      await plugin.renderEmbed(appMock);
      
      expect(appMock.createNote).toHaveBeenCalledTimes(4);
      expect(appMock.alert).toHaveBeenCalled();
    });
  });
});
