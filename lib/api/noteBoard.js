import {
  buildColumnSpans,
  assignTasksToColumns,
} from "./markdownIndex.js";

/**
 * Builds a note board snapshot: columns from headings, cards from tasks.
 * Pure data assembly — all Amplenote API access is passed in via `app`.
 *
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID - The board note's UUID.
 * @returns {Promise<{kind: string, noteUUID: string, columns: Array, hasHeadings: boolean}>}
 */
export async function buildNoteBoard(app, noteUUID) {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  if (typeof markdown !== "string") {
    return { kind: "note", noteUUID, columns: [], hasHeadings: false };
  }

  const tasks = await app.getNoteTasks({ uuid: noteUUID }, { includeDone: true }) || [];
  const { columns } = buildColumnSpans(markdown);
  const lines = markdown.split("\n");
  const { columnCards, unsorted } = assignTasksToColumns(columns, lines, tasks);

  const boardColumns = columns.map(span => ({
    id: span.id,
    name: span.name,
    cards: (columnCards.get(span.id) || []).map(toCardModel),
  }));

  // Implicit "Unsorted" pseudo-column for tasks above the first heading.
  if (unsorted.length > 0) {
    boardColumns.unshift({
      id: "unsorted",
      name: "Unsorted",
      cards: unsorted.map(toCardModel),
    });
  }

  return {
    kind: "note",
    noteUUID,
    columns: boardColumns,
    hasHeadings: columns.length > 0,
  };
}

/**
 * Maps an Amplenote task to the serializable card model used by the embed.
 * @param {Object} task
 */
export function toCardModel(task) {
  return {
    id: task.uuid,
    title: plainPreview(task.content || ""),
    content: task.content || "",
    completedAt: task.completedAt ?? null,
    dismissedAt: task.dismissedAt ?? null,
    startAt: task.startAt ?? null,
    deadline: task.deadline ?? null,
    important: !!task.important,
    urgent: !!task.urgent,
  };
}

/**
 * Single-line plain-text preview of a card's markdown (first image/link
 * syntax stripped). Rich rendering arrives in Phase 2; this keeps Phase 1
 * cards readable without shipping a markdown parser into the embed.
 * @param {string} markdown
 * @returns {string}
 */
export function plainPreview(markdown) {
  return String(markdown
    .replace(/<!--[\s\S]*?-->/g, "")          // strip metadata comments
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")     // drop images (rendered separately in Phase 2)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")  // links -> text
    .replace(/[*_~`#>]/g, "")                 // emphasis/heading markers
    .replace(/\s+/g, " ")
    .trim());
}
