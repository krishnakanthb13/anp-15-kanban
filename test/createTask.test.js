import { jest } from '@jest/globals';
import { handleCreateTask } from '../lib/features/createTask.js';
import { refreshKanbanPage } from '../lib/api/noteManager.js';
import { moveTaskToHeader } from '../lib/api/taskMover.js';

describe("createTask - handleCreateTask", () => {
  let appMock;

  beforeEach(() => {
    appMock = {
      settings: {},
      findNote: jest.fn(),
      getNoteSections: jest.fn(),
      prompt: jest.fn(),
      insertTask: jest.fn(),
      updateTask: jest.fn(),
      getNoteContent: jest.fn(),
      replaceNoteContent: jest.fn()
    };
    jest.clearAllMocks();
    
    appMock.findNote.mockResolvedValue({ uuid: "note-uuid" });
    appMock.getNoteSections.mockResolvedValue([
      { heading: { text: "Section 1" } }
    ]);
  });

  it("creates task and updates it", async () => {
    appMock.prompt.mockResolvedValue([
      "New task", true, false, { uuid: "dest-note" }, "0", "5", 1
    ]);
    appMock.insertTask.mockResolvedValue("new-task-uuid");
    appMock.getNoteContent.mockResolvedValue("# Header 1\n- [ ] Task 1 {\"uuid\":\"new-task-uuid\"}");
    appMock.replaceNoteContent.mockResolvedValue();
    appMock.settings = { "Current_Note_UUID [Do not Edit!]": "kanban-note" };

    await handleCreateTask(appMock, "Kanban Note");

    expect(appMock.insertTask).toHaveBeenCalledWith({ uuid: "dest-note" }, { text: "" });
    expect(appMock.updateTask).toHaveBeenCalledWith("new-task-uuid", expect.objectContaining({
      content: "New task",
      important: true,
      score: 5,
      completedAt: expect.any(Number)
    }));
    expect(appMock.replaceNoteContent).toHaveBeenCalled();
  });

  it("returns early if note not found", async () => {
    appMock.findNote.mockResolvedValue(null);
    await handleCreateTask(appMock, "Kanban Note");
    expect(appMock.prompt).not.toHaveBeenCalled();
  });
});
