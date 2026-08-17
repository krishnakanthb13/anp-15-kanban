import { jest } from '@jest/globals';
import { handleTaskEdit } from '../lib/features/taskEdit.js';
import { refreshKanbanPage } from '../lib/api/noteManager.js';
import { moveTaskToHeader } from '../lib/api/taskMover.js';

describe("taskEdit - handleTaskEdit", () => {
  let appMock;

  beforeEach(() => {
    appMock = {
      getTask: jest.fn(),
      getNoteSections: jest.fn(),
      prompt: jest.fn(),
      updateTask: jest.fn(),
      getNoteContent: jest.fn(),
      replaceNoteContent: jest.fn()
    };
    jest.clearAllMocks();
  });

  it("updates task fields that changed", async () => {
    appMock.getTask.mockResolvedValue({
      uuid: "task-uuid",
      noteUUID: "note-uuid",
      content: "Old text",
      important: false,
      urgent: false,
      score: 1
    });
    appMock.getNoteSections.mockResolvedValue([{ heading: { text: "Section 1" } }]);
    
    appMock.prompt.mockResolvedValue([
      "New text", true, false, { uuid: "note-uuid" }, "0", "5", 1
    ]);
    appMock.getNoteContent.mockResolvedValue("# Header 1\n- [ ] Task 1 {\"uuid\":\"task-uuid\"}");
    appMock.replaceNoteContent.mockResolvedValue();
    appMock.settings = { "Current_Note_UUID [Do not Edit!]": "kanban-note" };
    
    await handleTaskEdit(appMock, "task-uuid");

    expect(appMock.updateTask).toHaveBeenCalledWith("task-uuid", expect.objectContaining({
      content: "New text",
      important: true,
      score: 5,
      completedAt: expect.any(Number)
    }));
    expect(appMock.replaceNoteContent).toHaveBeenCalled();
  });
});
