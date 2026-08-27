import { toCardModel, renderCardHtml, resolveLabels } from "./noteBoard.js";
import { findTaskLines, detectTaskHierarchy } from "./markdownIndex.js";
import { NOTE_PREFIX } from "../core/constants.js";

/**
 * Builds a notes board snapshot via live account queries.
 *
 * @param {Object} app - The Amplenote app context.
 * @param {string} tag - The board's root tag; its notes become columns.
 * @returns {Promise<{kind: string, tag: string, columns: Array, hasHeadings: boolean}>}
 */
export async function buildNotesBoard(app, tag) {
  if (!tag) {
    return { kind: "notes", tag, columns: [], hasHeadings: false };
  }

  const notes = (await app.filterNotes({ tag })) || [];
  let colorMap = {};
  try {
    const tags = (await app.getTags()) || [];
    tags.forEach(t => { if (t?.text) colorMap[t.text.toLowerCase()] = t.color || null; });
  } catch {
    colorMap = {};
  }

  const columns = [];
  const allCards = [];
  for (const note of notes) {
    const rawTasks = (await app.getNoteTasks({ uuid: note.uuid }, { includeDone: false })) || [];
    const tasks = rawTasks.filter(t => !t.completedAt && !t.completed && !t.dismissedAt);
    try {
      const md = await app.getNoteContent({ uuid: note.uuid });
      if (typeof md === "string") {
        const lines = md.split("\n");
        const taskLines = findTaskLines(lines, tasks);
        detectTaskHierarchy(lines, tasks, taskLines);
        tasks.sort((a, b) => {
          const lineA = taskLines.get(a.uuid || a.id) ?? 0;
          const lineB = taskLines.get(b.uuid || b.id) ?? 0;
          return lineA - lineB;
        });
      } else {
        detectTaskHierarchy([], tasks, new Map());
      }
    } catch {
      detectTaskHierarchy([], tasks, new Map());
    }

    const cards = tasks.map(t => ({ ...toCardModel(t), noteName: note.name || "Untitled note" }));
    allCards.push(...cards);
    columns.push({
      id: NOTE_PREFIX + note.uuid,
      name: note.name || "Untitled note",
      color: null,
      wipLimit: null,
      cards,
      noteUUID: note.uuid,
    });
  }

  await renderCardHtml(app, allCards);
  allCards.forEach(card => { card.labels = resolveLabels(card.content, colorMap); });

  return {
    kind: "notes",
    tag,
    columns,
    hasHeadings: true,
  };
}

export { NOTE_PREFIX };
