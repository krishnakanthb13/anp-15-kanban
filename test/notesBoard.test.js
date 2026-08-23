import { jest } from '@jest/globals';
import { buildNotesBoard, NOTE_PREFIX } from '../lib/api/notesBoard.js';

const NOTES = [
  { uuid: "na", name: "Project A", tags: ["kanban"] },
  { uuid: "nb", name: "Project B", tags: ["kanban"] },
];

function makeApp(tasksByNote) {
  return {
    filterNotes: jest.fn().mockResolvedValue(NOTES),
    getTags: jest.fn().mockResolvedValue([{ text: "urgent-label", color: "ff0000" }]),
    getNoteTasks: jest.fn().mockImplementation(async ({ uuid }) => tasksByNote[uuid] || []),
    htmlFromContent: jest.fn().mockImplementation(async (c) => `<p>${c}</p>`),
  };
}

describe("notesBoard", () => {
  it("builds one column per tagged note, cards from its active tasks", async () => {
    const app = makeApp({
      na: [{ uuid: "t1", content: "task [[urgent-label]]" }],
      nb: [{ uuid: "t2", content: "active task" }, { uuid: "t3", content: "done", completedAt: 1700000000 }],
    });
    const board = await buildNotesBoard(app, "kanban");

    expect(board).toMatchObject({ kind: "notes", tag: "kanban", hasHeadings: true });
    expect(board.columns.map(c => c.name)).toEqual(["Project A", "Project B"]);
    expect(board.columns[0].id).toBe(NOTE_PREFIX + "na");
    expect(board.columns[0].cards.map(c => c.id)).toEqual(["t1"]);
    expect(board.columns[1].cards.map(c => c.id)).toEqual(["t2"]);
  });

  it("enriches cards with rich HTML and colored labels", async () => {
    const app = makeApp({ na: [{ uuid: "t1", content: "task [[urgent-label]]" }] });
    const board = await buildNotesBoard(app, "kanban");
    const card = board.columns[0].cards[0];
    expect(card.html).toContain("<p>");
    expect(card.labels).toEqual([{ name: "urgent-label", color: "ff0000" }]);
  });

  it("queries notes live by the board tag", async () => {
    const app = makeApp({});
    await buildNotesBoard(app, "kanban");
    expect(app.filterNotes).toHaveBeenCalledWith({ tag: "kanban" });
  });

  it("detects parent and child task hierarchy from markdown indentation", async () => {
    const app = makeApp({
      na: [
        { uuid: "p1", content: "Parent task" },
        { uuid: "c1", content: "Child task level 1" },
        { uuid: "c2", content: "Child task level 2" },
      ],
    });
    app.getNoteContent = jest.fn().mockResolvedValue(
      "- [ ] Parent task <!-- {\"uuid\":\"p1\"} -->\n" +
      "    - [ ] Child task level 1 <!-- {\"uuid\":\"c1\"} -->\n" +
      "        - [ ] Child task level 2 <!-- {\"uuid\":\"c2\"} -->\n"
    );

    const board = await buildNotesBoard(app, "kanban");
    const cards = board.columns[0].cards;
    expect(cards[0].isParent).toBe(true);
    expect(cards[0].subtaskDepth).toBe(0);
    expect(cards[0].isSubtask).toBe(false);

    expect(cards[1].isParent).toBe(true);
    expect(cards[1].subtaskDepth).toBe(1);
    expect(cards[1].isSubtask).toBe(true);

    expect(cards[2].isParent).toBe(false);
    expect(cards[2].subtaskDepth).toBe(2);
    expect(cards[2].isSubtask).toBe(true);
  });

  it("returns an empty board for a missing tag", async () => {
    const board = await buildNotesBoard(makeApp({}), "");
    expect(board.columns).toEqual([]);
    expect(board.hasHeadings).toBe(false);
  });
});
