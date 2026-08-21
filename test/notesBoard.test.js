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
  it("builds one column per tagged note, cards from its tasks", async () => {
    const app = makeApp({
      na: [{ uuid: "t1", content: "task [[urgent-label]]" }],
      nb: [{ uuid: "t2", content: "other", completedAt: 1700000000 }],
    });
    const board = await buildNotesBoard(app, "kanban");

    expect(board).toMatchObject({ kind: "notes", tag: "kanban", hasHeadings: true });
    expect(board.columns.map(c => c.name)).toEqual(["Project A", "Project B"]);
    expect(board.columns[0].id).toBe(NOTE_PREFIX + "na");
    expect(board.columns[0].cards.map(c => c.id)).toEqual(["t1"]);
    expect(board.columns[1].cards[0].completedAt).toBe(1700000000);
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

  it("returns an empty board for a missing tag", async () => {
    const board = await buildNotesBoard(makeApp({}), "");
    expect(board.columns).toEqual([]);
    expect(board.hasHeadings).toBe(false);
  });
});
