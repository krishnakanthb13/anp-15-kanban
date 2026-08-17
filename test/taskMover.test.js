import { jest } from '@jest/globals';
import { moveTaskToHeader } from '../lib/api/taskMover.js';

describe("taskMover - moveTaskToHeader", () => {
  let appMock;

  beforeEach(() => {
    appMock = {
      getNoteContent: jest.fn()
    };
  });

  describe("Happy Path", () => {
    it("moves task to the correct header", async () => {
      appMock.getNoteContent.mockResolvedValue(
        "# Header 1\nSome text\n- [ ] Task 1 {\"uuid\":\"task-1\"}\n# Header 2\n- [ ] Task 2 {\"uuid\":\"task-2\"}"
      );
      
      // Move task-2 to under Header 1 (headerNumber = 1)
      const result = await moveTaskToHeader(appMock, "note-1", "task-2", 1);
      
      // task-2 should be placed right after Header 1 (index 1 of updatedLines)
      expect(result).toBe("# Header 1\n- [ ] Task 2 {\"uuid\":\"task-2\"}\nSome text\n- [ ] Task 1 {\"uuid\":\"task-1\"}\n# Header 2");
    });
  });

  describe("Edge Cases", () => {
    it("returns empty string if markdown is empty", async () => {
      appMock.getNoteContent.mockResolvedValue(null);
      
      const result = await moveTaskToHeader(appMock, "note-1", "task-1", 1);
      
      expect(result).toBe('');
    });

    it("inserts at top if headerNumber is 0", async () => {
      appMock.getNoteContent.mockResolvedValue(
        "# Header 1\n- [ ] Task 1 {\"uuid\":\"task-1\"}"
      );
      
      const result = await moveTaskToHeader(appMock, "note-1", "task-1", 0);
      
      expect(result).toBe("- [ ] Task 1 {\"uuid\":\"task-1\"}\n# Header 1");
    });

    it("does not insert task if taskLine is not found", async () => {
      appMock.getNoteContent.mockResolvedValue(
        "# Header 1\nSome text"
      );
      
      const result = await moveTaskToHeader(appMock, "note-1", "non-existent-task", 1);
      
      expect(result).toBe("# Header 1\nSome text");
    });
  });

  describe("Error Handling", () => {
    it("catches errors and returns empty string", async () => {
      appMock.getNoteContent.mockRejectedValue(new Error("API Error"));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await moveTaskToHeader(appMock, "note-1", "task-1", 1);
      
      expect(result).toBe('');
      consoleSpy.mockRestore();
    });
  });
});
