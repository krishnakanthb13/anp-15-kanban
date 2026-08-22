import { jest } from '@jest/globals';
import {
  createColumn,
  renameColumn,
  deleteColumn,
  reorderColumns,
  transferColumn,
} from '../lib/api/columnOps.js';

const MD = [
  "Intro",
  "# Alpha",
  "- [ ] a1 <!-- {\"uuid\":\"u1\"} -->",
  "## sub",
  "- [ ] a2 <!-- {\"uuid\":\"u2\"} -->",
  "# Beta",
  "- [ ] b1 <!-- {\"uuid\":\"u3\"} -->",
].join("\n");

function makeApp(markdown = MD) {
  return {
    getNoteContent: jest.fn().mockResolvedValue(markdown),
    replaceNoteContent: jest.fn().mockResolvedValue(true),
    insertNoteContent: jest.fn().mockResolvedValue(),
  };
}

describe("columnOps", () => {
  describe("createColumn", () => {
    it("appends a heading matching the shallowest existing level", async () => {
      const app = makeApp();
      const ok = await createColumn(app, "n1", "Gamma");

      expect(ok).toBe(true);
      expect(app.insertNoteContent).toHaveBeenCalledWith(
        { uuid: "n1" },
        "\n# Gamma\n",
        { atEnd: true }
      );
    });

    it("uses H2 when the note has no headings yet", async () => {
      const app = makeApp("just text");
      await createColumn(app, "n1", "First");
      expect(app.insertNoteContent).toHaveBeenCalledWith(
        { uuid: "n1" },
        "\n## First\n",
        { atEnd: true }
      );
    });

    it("respects explicit heading levels (1, 2, 3)", async () => {
      const app = makeApp();
      await createColumn(app, "n1", "Heading One", 1);
      expect(app.insertNoteContent).toHaveBeenCalledWith(
        { uuid: "n1" },
        "\n# Heading One\n",
        { atEnd: true }
      );

      await createColumn(app, "n1", "Heading Three", "3");
      expect(app.insertNoteContent).toHaveBeenCalledWith(
        { uuid: "n1" },
        "\n### Heading Three\n",
        { atEnd: true }
      );
    });

    it("rejects blank names without writing", async () => {
      const app = makeApp();
      expect(await createColumn(app, "n1", "   ")).toBe(false);
      expect(await createColumn(app, "n1", "")).toBe(false);
      expect(app.insertNoteContent).not.toHaveBeenCalled();
    });
  });

  describe("renameColumn", () => {
    it("rewrites the heading line preserving markers", async () => {
      const app = makeApp();
      const ok = await renameColumn(app, "n1", "5", "Beta v2"); // Beta heading at line 5

      expect(ok).toBe(true);
      const written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).toContain("# Beta v2");
      expect(written).toContain("## sub"); // untouched
      expect(written).not.toContain("# Beta\n");
    });

    it("rejects blank names and unknown columns", async () => {
      const app = makeApp();
      expect(await renameColumn(app, "n1", "5", "  ")).toBe(false);
      expect(await renameColumn(app, "n1", "999", "X")).toBe(false);
      expect(app.replaceNoteContent).not.toHaveBeenCalled();
    });
  });

  describe("deleteColumn", () => {
    it("moves tasks of the FIRST column to the very top of the note", async () => {
      const app = makeApp();
      const ok = await deleteColumn(app, "n1", "1"); // Alpha starts at line 1

      expect(ok).toBe(true);
      const written = app.replaceNoteContent.mock.calls[0][1];
      const lines = written.split("\n");
      // Both extracted tasks land above everything else; sub-heading travels with them.
      expect(lines.findIndex(l => l.includes("u1"))).toBe(0);
      expect(lines.findIndex(l => l.includes("u2"))).toBeLessThan(lines.findIndex(l => l.startsWith("# ")));
      expect(written).not.toContain("# Alpha");
      expect(written).toContain("# Beta");
    });

    it("slots tasks of a LATER column above the first remaining heading", async () => {
      const app = makeApp();
      const ok = await deleteColumn(app, "n1", "5"); // Beta

      expect(ok).toBe(true);
      const written = app.replaceNoteContent.mock.calls[0][1];
      const lines = written.split("\n");
      const u3Idx = lines.findIndex(l => l.includes("u3"));
      const firstHeadingIdx = lines.findIndex(l => l.startsWith("# "));
      expect(u3Idx).toBeGreaterThan(-1);
      expect(u3Idx).toBeLessThan(firstHeadingIdx);
      expect(lines[0]).toBe("Intro"); // preamble stays on top
      expect(written).not.toContain("# Beta");
      expect(written).toContain("# Alpha");
    });

    it("refuses to delete the last remaining column", async () => {
      const app = makeApp("# Only\n- [ ] x <!-- {\"uuid\":\"u9\"} -->");
      expect(await deleteColumn(app, "n1", "0")).toBe(false);
      expect(app.replaceNoteContent).not.toHaveBeenCalled();
    });

    it("returns false for unknown columns", async () => {
      const app = makeApp();
      expect(await deleteColumn(app, "n1", "999")).toBe(false);
    });
  });

  describe("reorderColumns", () => {
    it("rewrites the note with columns in the requested order", async () => {
      const app = makeApp();
      const ok = await reorderColumns(app, "n1", ["5", "1"]); // Beta first

      expect(ok).toBe(true);
      const written = app.replaceNoteContent.mock.calls[0][1];
      expect(written.indexOf("# Beta")).toBeLessThan(written.indexOf("# Alpha"));
      expect(written).toContain("Intro"); // preamble preserved on top
      expect(written).toContain("u1");    // contents travel with their heading
      expect(written).toContain("b1");
    });

    it("rejects malformed orders without writing", async () => {
      const app = makeApp();
      expect(await reorderColumns(app, "n1", ["1"])).toBe(false);            // wrong length
      expect(await reorderColumns(app, "n1", ["1", "1"])).toBe(false);       // duplicate
      expect(await reorderColumns(app, "n1", ["1", "999"])).toBe(false);     // unknown id
      expect(app.replaceNoteContent).not.toHaveBeenCalled();
    });
  });

  describe("transferColumn", () => {
    it("inserts into the target BEFORE removing from the source", async () => {
      const app = makeApp();
      const status = await transferColumn(app, "src", "1", "dst");

      expect(status).toBe("moved");
      // insertNoteContent (target) must be called before replaceNoteContent (source removal)
      const insertIdx = app.insertNoteContent.mock.invocationCallOrder[0];
      const replaceIdx = app.replaceNoteContent.mock.invocationCallOrder[0];
      expect(insertIdx).toBeLessThan(replaceIdx);

      const inserted = app.insertNoteContent.mock.calls[0][1];
      expect(inserted).toContain("# Alpha");
      expect(inserted).toContain("u1"); // tasks travel with the heading

      const written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).not.toContain("# Alpha");
      expect(written).toContain("# Beta");
    });

    it("guards against same-note transfers and unknown columns", async () => {
      const app = makeApp();
      expect(await transferColumn(app, "n1", "1", "n1")).toBe("same-note");
      expect(await transferColumn(app, "n1", "999", "dst")).toBe("no-target");
      expect(app.insertNoteContent).not.toHaveBeenCalled();
      expect(app.replaceNoteContent).not.toHaveBeenCalled();
    });
  });
});
