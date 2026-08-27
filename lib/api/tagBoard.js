import { buildColumnSpans, assignTasksToColumns } from "./markdownIndex.js";
import { toCardModel, renderCardHtml, resolveLabels } from "./noteBoard.js";
import { NOTE_PREFIX } from "../core/constants.js";

/**
 * Builds a tag board snapshot via live account queries.
 * A tag's notes become columns, and each note's headings become collapsible
 * sections containing tasks as cards.
 *
 * @param {Object} app - The Amplenote app context.
 * @param {string} tag - The board's root tag.
 * @returns {Promise<{kind: string, tag: string, columns: Array, hasHeadings: boolean}>}
 */
export async function buildTagBoard(app, tag) {
  if (!tag) {
    return { kind: "tag", tag, columns: [], hasHeadings: false };
  }

  const [notes, allTags] = await Promise.all([
    app.filterNotes({ tag }) || [],
    app.getTags() || [],
  ]);

  let colorMap = {};
  try {
    allTags.forEach(t => { if (t?.text) colorMap[t.text.toLowerCase()] = t.color || null; });
  } catch {
    colorMap = {};
  }

  const columns = [];
  const allCards = [];

  for (const note of notes) {
    let markdown = "";
    try {
      markdown = (await app.getNoteContent({ uuid: note.uuid })) || "";
    } catch {
      markdown = "";
    }

    const tasks = (await app.getNoteTasks({ uuid: note.uuid }, { includeDone: true })) || [];
    const { columns: headingSpans } = buildColumnSpans(markdown);
    const lines = markdown.split("\n");
    const { columnCards, unsorted, completed = [] } = assignTasksToColumns(headingSpans, lines, tasks, { separateCompleted: true });

    const sections = [];
    if (unsorted.length > 0) {
      const unsortedCards = unsorted.map(t => ({ ...toCardModel(t), noteName: note.name || "Untitled" }));
      sections.push({
        id: "unsorted",
        name: "Unsorted",
        cards: unsortedCards,
      });
      allCards.push(...unsortedCards);
    }

    if (headingSpans.length > 0) {
      for (const span of headingSpans) {
        const spanTasks = columnCards.get(span.id) || [];
        const spanCards = spanTasks.map(t => ({ ...toCardModel(t), noteName: note.name || "Untitled" }));
        sections.push({
          id: span.id,
          name: span.name,
          level: span.level || null,
          cards: spanCards,
        });
        allCards.push(...spanCards);
      }
    } else if (unsorted.length === 0 && (!completed || completed.length === 0)) {
      const noteCards = tasks.map(t => ({ ...toCardModel(t), noteName: note.name || "Untitled" }));
      sections.push({
        id: "main",
        name: "Tasks",
        cards: noteCards,
      });
      allCards.push(...noteCards);
    }

    if (completed && completed.length > 0) {
      const completedCards = completed.map(t => ({ ...toCardModel(t), noteName: note.name || "Untitled" }));
      sections.push({
        id: "completed",
        name: "Completed",
        cards: completedCards,
        isDoneSection: true,
        isSystemSection: true,
      });
      allCards.push(...completedCards);
    }

    const flatCards = sections.flatMap(s => s.cards || []);

    columns.push({
      id: NOTE_PREFIX + note.uuid,
      name: note.name || "Untitled note",
      noteUUID: note.uuid,
      tags: note.tags || [],
      sections,
      cards: flatCards,
      wipLimit: null,
    });
  }

  await renderCardHtml(app, allCards);
  allCards.forEach(card => { card.labels = resolveLabels(card.content, colorMap); });

  return {
    kind: "tag",
    tag,
    columns,
    hasHeadings: true,
  };
}

export { NOTE_PREFIX };
