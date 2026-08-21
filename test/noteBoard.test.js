import { jest } from '@jest/globals';
import { buildNoteBoard, toCardModel, plainPreview } from '../lib/api/noteBoard.js';

const MD = [
  "Preamble",
  "- [ ] loose <!-- {\"uuid\":\"u0\"} -->",
  "# Alpha",
  "- [ ] first <!-- {\"uuid\":\"u1\"} -->",
  "- [x] done one <!-- {\"uuid\":\"u2\", \"completedAt\": 1700000000} -->",
  "# Beta",
  "- [ ] second <!-- {\"uuid\":\"u3\"} -->",
].join("\n");

const TASKS = [
  { uuid: "u0", content: "loose" },
  { uuid: "u1", content: "first" },
  { uuid: "u2", content: "done one", completedAt: 1700000000 },
  { uuid: "u3", content: "**second** with [link](https://x.y)" },
];

function makeApp() {
  return {
    getNoteContent: jest.fn().mockResolvedValue(MD),
    getNoteTasks: jest.fn().mockResolvedValue(TASKS),
  };
}

describe("noteBoard", () => {
  describe("buildNoteBoard", () => {
    it("builds columns from headings and assigns tasks, including done ones", async () => {
      const board = await buildNoteBoard(makeApp(), "note-1");

      expect(board).toMatchObject({ kind: "note", noteUUID: "note-1", hasHeadings: true });
      expect(board.columns.map(c => c.name)).toEqual(["Unsorted", "Alpha", "Beta"]);
      expect(board.columns[1].cards.map(c => c.id)).toEqual(["u1", "u2"]);
      expect(board.columns[2].cards.map(c => c.id)).toEqual(["u3"]);
    });

    it("requests completed tasks via includeDone", async () => {
      const app = makeApp();
      await buildNoteBoard(app, "note-1");
      expect(app.getNoteTasks).toHaveBeenCalledWith({ uuid: "note-1" }, { includeDone: true });
    });

    it("marks completed cards", async () => {
      const board = await buildNoteBoard(makeApp(), "note-1");
      const done = board.columns[1].cards.find(c => c.id === "u2");
      expect(done.completedAt).toBe(1700000000);
    });

    it("returns an empty board for missing/invalid markdown", async () => {
      const app = makeApp();
      app.getNoteContent.mockResolvedValue(undefined);
      const board = await buildNoteBoard(app, "note-1");
      expect(board.columns).toEqual([]);
      expect(board.hasHeadings).toBe(false);
    });

    it("survives a task API failure", async () => {
      const app = makeApp();
      app.getNoteTasks.mockRejectedValue(new Error("boom"));
      await expect(buildNoteBoard(app, "note-1")).rejects.toThrow("boom");
    });
  });

  describe("toCardModel", () => {
    it("maps task fields to the card model", () => {
      const card = toCardModel({
        uuid: "t1",
        content: "Hello **world**",
        completedAt: null,
        startAt: 100,
        deadline: 200,
        important: 1,
        urgent: undefined,
      });
      expect(card).toEqual({
        id: "t1",
        title: "Hello world",
        content: "Hello **world**",
        completedAt: null,
        dismissedAt: null,
        startAt: 100,
        deadline: 200,
        important: true,
        urgent: false,
      });
    });
  });

  describe("plainPreview", () => {
    it("strips metadata comments, images, links and emphasis", () => {
      expect(plainPreview('<!-- {"uuid":"x"} --> Buy ![pic](https://i) milk')).toBe("Buy milk");
      expect(plainPreview("[label](https://example.com)")).toBe("label");
      expect(plainPreview("# Heading *bold* _it_ `code`")).toBe("Heading bold it code");
    });

    it("collapses whitespace across lines and trims", () => {
      expect(plainPreview("one\ntwo\nthree")).toBe("one two three");
    });
  });
});
