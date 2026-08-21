import { jest } from '@jest/globals';
import { retagNote, createTaggedNote, openNote } from '../lib/api/noteOps.js';

function makeApp() {
  return {
    addNoteTag: jest.fn().mockResolvedValue(true),
    removeNoteTag: jest.fn().mockResolvedValue(true),
    createNote: jest.fn().mockResolvedValue("new-note"),
    navigate: jest.fn().mockResolvedValue(),
  };
}

describe("noteOps", () => {
  describe("retagNote", () => {
    it("swaps sub-tags (remove old, add new)", async () => {
      const app = makeApp();
      const changed = await retagNote(app, "n1", {
        fromSub: "projects/alpha",
        toSub: "projects/beta",
      });

      expect(changed).toBe(true);
      expect(app.removeNoteTag).toHaveBeenCalledWith({ uuid: "n1" }, "projects/alpha");
      expect(app.addNoteTag).toHaveBeenCalledWith({ uuid: "n1" }, "projects/beta");
    });

    it("adds only when moving into a sub-tag from No sub-tag", async () => {
      const app = makeApp();
      await retagNote(app, "n1", { fromSub: null, toSub: "projects/beta" });
      expect(app.removeNoteTag).not.toHaveBeenCalled();
      expect(app.addNoteTag).toHaveBeenCalledTimes(1);
    });

    it("removes only when moving into No sub-tag", async () => {
      const app = makeApp();
      await retagNote(app, "n1", { fromSub: "projects/alpha", toSub: null });
      expect(app.addNoteTag).not.toHaveBeenCalled();
      expect(app.removeNoteTag).toHaveBeenCalledTimes(1);
    });

    it("changes nothing for identical or empty subs", async () => {
      const app = makeApp();
      expect(await retagNote(app, "n1", { fromSub: "projects/alpha", toSub: "projects/alpha" })).toBe(false);
      expect(await retagNote(app, "n1", {})).toBe(false);
      expect(app.addNoteTag).not.toHaveBeenCalled();
      expect(app.removeNoteTag).not.toHaveBeenCalled();
    });
  });

  describe("createTaggedNote", () => {
    it("creates a note with tags", async () => {
      const app = makeApp();
      const uuid = await createTaggedNote(app, "New doc", ["projects/beta"]);
      expect(uuid).toBe("new-note");
      expect(app.createNote).toHaveBeenCalledWith("New doc", ["projects/beta"]);
    });

    it("rejects blank titles", async () => {
      const app = makeApp();
      expect(await createTaggedNote(app, "   ")).toBeNull();
      expect(app.createNote).not.toHaveBeenCalled();
    });
  });

  describe("openNote", () => {
    it("navigates to the note URL", async () => {
      const app = makeApp();
      await openNote(app, "abc-123");
      expect(app.navigate).toHaveBeenCalledWith("https://www.amplenote.com/notes/abc-123");
    });
  });
});
