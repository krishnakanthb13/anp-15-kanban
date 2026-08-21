import { toCardModel, renderCardHtml, resolveLabels } from "./noteBoard.js";

/**
 * Notes boards: the third board kind. A tag's NOTES become columns and the
 * tasks inside each note become cards — "one note per project" workflows.
 *
 * Interactions are natively simple: moving a card between columns is
 * updateTask({ noteUUID }) — no markdown surgery required.
 */

const NOTE_PREFIX = "note:";

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
    const tasks = (await app.getNoteTasks({ uuid: note.uuid }, { includeDone: true })) || [];
    const cards = tasks.map(t => toCardModel(t));
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
