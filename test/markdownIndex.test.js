import {
  parseHeadings,
  findColumnLevel,
  buildColumnSpans,
  findTaskLines,
  assignTasksToColumns,
  sectionContent,
  removeLine,
  insertUnderHeading,
  resolveSpan,
} from '../lib/api/markdownIndex.js';

const MD = [
  "Intro text",
  "- [ ] loose task <!-- {\"uuid\": \"u0\"} -->",
  "# Alpha",
  "- [ ] task a1 <!-- {\"uuid\":\"u1\"} -->",
  "## Sub note",
  "- [ ] task a2 <!-- { \"uuid\": \"u2\" } -->",
  "# Beta",
  "- [ ] task b1 <!-- {\"uuid\":\"u3\"} -->",
].join("\n");

describe("markdownIndex", () => {
  describe("parseHeadings", () => {
    it("finds headings in order with level and trimmed text", () => {
      const hs = parseHeadings(MD);
      expect(hs).toEqual([
        { lineIndex: 2, level: 1, text: "Alpha" },
        { lineIndex: 4, level: 2, text: "Sub note" },
        { lineIndex: 6, level: 1, text: "Beta" },
      ]);
    });

    it("returns empty for heading-less markdown", () => {
      expect(parseHeadings("just text\nmore text")).toEqual([]);
    });
  });

  describe("findColumnLevel", () => {
    it("picks the shallowest level and null when none", () => {
      expect(findColumnLevel(parseHeadings(MD))).toBe(1);
      expect(findColumnLevel([])).toBeNull();
    });
  });

  describe("buildColumnSpans", () => {
    it("creates spans at the column level, nesting deeper headings inside", () => {
      const { columns, preambleEnd } = buildColumnSpans(MD);
      expect(columns.map(c => c.name)).toEqual(["Alpha", "Beta"]);
      expect(columns[0]).toMatchObject({ id: "2", startLine: 2, contentStart: 3, contentEnd: 6 });
      expect(columns[1]).toMatchObject({ startLine: 6, contentStart: 7 });
      expect(preambleEnd).toBe(3);

      // Beta's span reaches to end of document
      expect(columns[1].contentEnd).toBe(MD.split("\n").length);
    });

    it("supports an explicit column level override", () => {
      const { columns } = buildColumnSpans(MD, 2);
      expect(columns.map(c => c.name)).toEqual(["Sub note"]);
    });

    it("handles heading-less notes", () => {
      const { columns, preambleEnd } = buildColumnSpans("no headings here");
      expect(columns).toEqual([]);
      expect(preambleEnd).toBe(0);
    });
  });

  describe("findTaskLines", () => {
    it("matches uuids tolerantly (spaces in metadata JSON)", () => {
      const lines = MD.split("\n");
      const map = findTaskLines(lines, [{ uuid: "u0" }, { uuid: "u1" }, { uuid: "u2" }, { uuid: "ghost" }]);
      expect(map.get("u0")).toBe(1);
      expect(map.get("u1")).toBe(3);
      expect(map.get("u2")).toBe(5); // spaced JSON still matches
      expect(map.get("ghost")).toBe(-1);
    });
  });

  describe("assignTasksToColumns", () => {
    it("assigns tasks by position; preamble tasks go unsorted", () => {
      const { columns } = buildColumnSpans(MD);
      const lines = MD.split("\n");
      const tasks = [
        { uuid: "u0", content: "loose task" },
        { uuid: "u1", content: "task a1" },
        { uuid: "u2", content: "task a2" },
        { uuid: "u3", content: "task b1" },
      ];
      const { columnCards, unsorted } = assignTasksToColumns(columns, lines, tasks);

      expect(unsorted.map(t => t.uuid)).toEqual(["u0"]);
      expect(columnCards.get("2").map(t => t.uuid)).toEqual(["u1", "u2"]); // sub-heading task included
      expect(columnCards.get("6").map(t => t.uuid)).toEqual(["u3"]);
    });

    it("skips tasks whose lines cannot be found", () => {
      const { columns } = buildColumnSpans("# A");
      const { columnCards, unsorted } = assignTasksToColumns(columns, ["# A"], [{ uuid: "zzz" }]);
      expect(columnCards.get("0")).toEqual([]);
      expect(unsorted).toEqual([]);
    });
  });

  describe("sectionContent / removeLine / insertUnderHeading", () => {
    it("extracts content below the heading", () => {
      const lines = MD.split("\n");
      const { columns } = buildColumnSpans(MD);
      expect(sectionContent(lines, columns[0])).toContain("task a1");
      expect(sectionContent(lines, columns[0])).toContain("Sub note");
      expect(sectionContent(lines, columns[0])).not.toContain("# Beta");
    });

    it("removeLine does not mutate input", () => {
      const lines = ["a", "b", "c"];
      const next = removeLine(lines, 1);
      expect(lines).toEqual(["a", "b", "c"]);
      expect(next).toEqual(["a", "c"]);
    });

    it("insertUnderHeading inserts directly below the heading line", () => {
      const next = insertUnderHeading(["# A", "x", "# B"], { startLine: 0 }, "NEW");
      expect(next).toEqual(["# A", "NEW", "x", "# B"]);
    });
  });

  describe("resolveSpan", () => {
    it("resolves by id first, then name fallback, else null", () => {
      const { columns } = buildColumnSpans(MD);
      expect(resolveSpan(columns, "6").name).toBe("Beta");
      expect(resolveSpan(columns, "999", "Alpha").name).toBe("Alpha");
      expect(resolveSpan(columns, "999", "Ghost")).toBeNull();
      expect(resolveSpan(columns, "999")).toBeNull();
    });
  });
});
