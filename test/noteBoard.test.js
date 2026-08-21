import { jest } from '@jest/globals';
import { buildNoteBoard, toCardModel, plainPreview, firstImageUrl, renderCardHtml, resolveLabels } from '../lib/api/noteBoard.js';

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
    htmlFromContent: jest.fn().mockImplementation(async (content) => `<p>${content}</p>`),
    getTags: jest.fn().mockResolvedValue([
      { text: "urgent-label", color: "ff0000" },
    ]),
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

    it("enriches cards with rendered HTML via htmlFromContent", async () => {
      const board = await buildNoteBoard(makeApp(), "note-1");
      const all = board.columns.flatMap(c => c.cards);
      expect(all.length).toBeGreaterThan(0);
      all.forEach(card => {
        expect(card.html).toContain("<p>");
        expect(card.html).toContain(card.content);
      });
    });

    it("keeps cards usable when htmlFromContent fails", async () => {
      const app = makeApp();
      app.htmlFromContent.mockRejectedValue(new Error("render boom"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const board = await buildNoteBoard(app, "note-1");
      board.columns.flatMap(c => c.cards).forEach(card => expect(card.html).toBeNull());
      consoleSpy.mockRestore();
    });

    it("maps per-column WIP limits by column name", async () => {
      const board = await buildNoteBoard(makeApp(), "note-1", {
        columnLimits: { Alpha: 3, Unsorted: 0, Ghost: 2 },
      });
      const alpha = board.columns.find(c => c.name === "Alpha");
      const unsorted = board.columns.find(c => c.name === "Unsorted");
      expect(alpha.wipLimit).toBe(3);
      expect(unsorted.wipLimit).toBeNull(); // 0 and unknown names are ignored
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
        imageUrl: null,
        completedAt: null,
        dismissedAt: null,
        startAt: 100,
        endAt: null,
        deadline: 200,
        hideUntil: null,
        repeat: null,
        isRepeating: false,
        isParent: false,
        important: true,
        urgent: false,
        score: null,
        noteUUID: null,
      });
    });

    it("extracts the first inline image url", () => {
      expect(toCardModel({ uuid: "t2", content: "a ![one](https://i/1.png) ![two](https://i/2.png)" }).imageUrl)
        .toBe("https://i/1.png");
      expect(toCardModel({ uuid: "t3", content: "no image here" }).imageUrl).toBeNull();
    });
  });

  describe("firstImageUrl", () => {
    it("handles titles, query strings, and absence", () => {
      expect(firstImageUrl("![alt text](https://x/y.jpg \"title\")")).toBe("https://x/y.jpg");
      expect(firstImageUrl("![q](https://x/y.jpg?a=1&b=2)")).toBe("https://x/y.jpg?a=1&b=2");
      expect(firstImageUrl("[link](https://x) not image")).toBeNull();
    });
  });

  describe("renderCardHtml", () => {
    it("mutates cards in place and returns them", async () => {
      const app = makeApp();
      const cards = [{ id: "c1", content: "body" }];
      const out = await renderCardHtml(app, cards);
      expect(out).toBe(cards);
      expect(cards[0].html).toBe("<p>body</p>");
    });
  });

  describe("resolveLabels", () => {
    it("extracts unique wiki-link names in order", () => {
      expect(resolveLabels("[[Beta]] text [[Alpha]] more [[Beta]]", {}))
        .toEqual([{ name: "Beta", color: null }, { name: "Alpha", color: null }]);
    });

    it("resolves colors case-insensitively from the tag map", () => {
      const map = { "urgent-label": "ff0000" };
      expect(resolveLabels("see [[Urgent-Label]] now", map))
        .toEqual([{ name: "Urgent-Label", color: "ff0000" }]);
      expect(resolveLabels("[[unknown]]", map)[0].color).toBeNull();
    });

    it("returns an empty array without labels", () => {
      expect(resolveLabels("no links here", {})).toEqual([]);
    });
  });

  describe("buildNoteBoard labels integration", () => {
    it("attaches parsed labels with colors to cards", async () => {
      const app = makeApp();
      app.getNoteTasks.mockResolvedValue([
        { uuid: "u1", content: "task [[urgent-label]]" },
      ]);
      const board = await buildNoteBoard(app, "note-1");
      const card = board.columns.flatMap(c => c.cards).find(c => c.id === "u1");
      expect(card.labels).toEqual([{ name: "urgent-label", color: "ff0000" }]);
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
