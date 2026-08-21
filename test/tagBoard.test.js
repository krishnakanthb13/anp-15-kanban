import { jest } from '@jest/globals';
import {
  immediateSubTags,
  columnForNote,
  buildTagBoard,
  toNoteCard,
  NOSUB_ID,
} from '../lib/api/tagBoard.js';

const TAGS = [
  { text: "projects", color: "2563eb", noteCount: 10 },
  { text: "projects/alpha", color: "ff0000", noteCount: 3 },
  { text: "projects/beta", color: null, noteCount: 2 },
  { text: "projects/alpha/deep", color: "00ff00", noteCount: 1 }, // grandchild
  { text: "unrelated", color: "123456", noteCount: 7 },
];

function makeApp(notes) {
  return {
    getTags: jest.fn().mockResolvedValue(TAGS),
    filterNotes: jest.fn().mockResolvedValue(notes),
  };
}

describe("tagBoard", () => {
  describe("immediateSubTags", () => {
    it("returns only direct children with their colors", () => {
      const subs = immediateSubTags("projects", TAGS);
      expect(subs).toEqual([
        { text: "projects/alpha", color: "ff0000" },
        { text: "projects/beta", color: null },
      ]);
    });

    it("excludes the base tag itself and unrelated tags", () => {
      expect(immediateSubTags("unrelated", TAGS)).toEqual([]);
      expect(immediateSubTags("missing", TAGS)).toEqual([]);
    });
  });

  describe("columnForNote", () => {
    const subs = immediateSubTags("projects", TAGS);

    it("matches a carried sub-tag", () => {
      expect(columnForNote("projects", subs, ["projects/alpha"])).toBe("sub:projects/alpha");
    });

    it("falls back to nosub when no sub-tag is carried", () => {
      expect(columnForNote("projects", subs, ["projects"])).toBe(NOSUB_ID);
      expect(columnForNote("projects", subs, [])).toBe(NOSUB_ID);
    });

    it("uses the first matching sub-tag when several are carried", () => {
      expect(columnForNote("projects", subs, ["projects/beta", "projects/alpha"]))
        .toBe("sub:projects/alpha");
    });
  });

  describe("buildTagBoard", () => {
    const NOTES = [
      { uuid: "n1", name: "Alpha doc", tags: ["projects", "projects/alpha"] },
      { uuid: "n2", name: "Deep doc", tags: ["projects/alpha/deep"] }, // grandchild-only → nosub
      { uuid: "n3", name: "Plain", tags: ["projects"] },
    ];

    it("builds sub-tag columns plus No sub-tag, assigning notes live", async () => {
      const board = await buildTagBoard(makeApp(NOTES), "projects");

      expect(board.kind).toBe("tag");
      expect(board.columns.map(c => c.name)).toEqual(["alpha", "beta", "No sub-tag"]);
      expect(board.columns[0].color).toBe("ff0000");
      expect(board.columns[0].cards.map(c => c.id)).toEqual(["n1"]);
      expect(board.columns[2].cards.map(c => c.id)).toEqual(["n2", "n3"]);
      expect(board.hasHeadings).toBe(true);
    });

    it("queries notes live by the board tag", async () => {
      const app = makeApp([]);
      await buildTagBoard(app, "projects");
      expect(app.filterNotes).toHaveBeenCalledWith({ tag: "projects" });
    });

    it("returns an empty board for a missing tag", async () => {
      const board = await buildTagBoard(makeApp([]), "");
      expect(board.columns).toEqual([]);
      expect(board.hasHeadings).toBe(false);
    });
  });

  describe("toNoteCard", () => {
    it("maps a noteHandle to the card model", () => {
      const card = toNoteCard({ uuid: "n9", name: "My note", tags: ["a"] });
      expect(card).toMatchObject({
        id: "n9",
        title: "My note",
        tags: ["a"],
        isNoteCard: true,
        html: null,
        imageUrl: null,
      });
    });

    it("tolerates missing name/tags", () => {
      expect(toNoteCard({ uuid: "nx" })).toMatchObject({ title: "Untitled note", tags: [] });
    });
  });
});
