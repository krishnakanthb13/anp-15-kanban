import { jest } from '@jest/globals';
import { buildTagBoard, NOTE_PREFIX } from '../lib/api/tagBoard.js';

const NOTES = [
  { uuid: "n1", name: "Alpha Project", tags: ["projects"] },
  { uuid: "n2", name: "Beta Project", tags: ["projects"] },
];

function makeApp(notes = NOTES) {
  return {
    getTags: jest.fn().mockResolvedValue([{ text: "projects", color: "2563eb" }]),
    filterNotes: jest.fn().mockResolvedValue(notes),
    getNoteContent: jest.fn().mockImplementation(async ({ uuid }) => {
      if (uuid === "n1") return "# To Do\n\n- [ ] Task 1 <!-- {\"uuid\":\"t1\"} -->\n\n# Done\n\n- [x] Task 2 <!-- {\"uuid\":\"t2\"} -->";
      return "- [ ] Unsorted task <!-- {\"uuid\":\"t3\"} -->";
    }),
    getNoteTasks: jest.fn().mockImplementation(async ({ uuid }) => {
      if (uuid === "n1") {
        return [
          { uuid: "t1", content: "Task 1", completedAt: null, important: true, urgent: false },
          { uuid: "t2", content: "Task 2", completedAt: 100, important: false, urgent: true },
        ];
      }
      return [{ uuid: "t3", content: "Unsorted task", completedAt: null }];
    }),
    htmlFromContent: jest.fn().mockImplementation(async (c) => `<p>${c}</p>`),
  };
}

describe("tagBoard", () => {
  describe("buildTagBoard", () => {
    it("builds note columns with collapsible heading sections and tasks as cards", async () => {
      const app = makeApp();
      const board = await buildTagBoard(app, "projects");

      expect(board.kind).toBe("tag");
      expect(board.tag).toBe("projects");
      expect(board.columns.length).toBe(2);

      const col1 = board.columns[0];
      expect(col1.id).toBe(NOTE_PREFIX + "n1");
      expect(col1.name).toBe("Alpha Project");
      expect(col1.sections.length).toBe(2);
      expect(col1.sections[0].name).toBe("To Do");
      expect(col1.sections[0].cards.map(c => c.id)).toEqual(["t1"]);
      expect(col1.sections[1].name).toBe("Done");
      expect(col1.sections[1].cards.map(c => c.id)).toEqual(["t2"]);

      const col2 = board.columns[1];
      expect(col2.id).toBe(NOTE_PREFIX + "n2");
      expect(col2.name).toBe("Beta Project");
      expect(col2.sections.length).toBe(1);
      expect(col2.sections[0].cards.map(c => c.id)).toEqual(["t3"]);
    });

    it("queries notes live by the board tag", async () => {
      const app = makeApp([]);
      await buildTagBoard(app, "projects");
      expect(app.filterNotes).toHaveBeenCalledWith({ tag: "projects" });
    });

    it("preserves empty notes and empty heading sections for empty toggle support", async () => {
      const app = makeApp([
        { uuid: "empty1", name: "Empty Note", tags: ["projects"] },
        { uuid: "empty_headings", name: "Note With Empty Headings", tags: ["projects"] },
      ]);
      app.getNoteContent = jest.fn().mockImplementation(async ({ uuid }) => {
        if (uuid === "empty_headings") return "# Backlog\n\n# In Progress\n";
        return "";
      });
      app.getNoteTasks = jest.fn().mockResolvedValue([]);

      const board = await buildTagBoard(app, "projects");
      expect(board.columns.length).toBe(2);
      expect(board.columns[0].name).toBe("Empty Note");
      expect(board.columns[0].cards).toEqual([]);
      expect(board.columns[1].name).toBe("Note With Empty Headings");
      expect(board.columns[1].sections.length).toBe(2);
      expect(board.columns[1].sections[0].name).toBe("Backlog");
      expect(board.columns[1].sections[0].cards).toEqual([]);
    });

    it("returns an empty board for a missing tag", async () => {
      const board = await buildTagBoard(makeApp([]), "");
      expect(board.columns).toEqual([]);
      expect(board.hasHeadings).toBe(false);
    });
  });
});
