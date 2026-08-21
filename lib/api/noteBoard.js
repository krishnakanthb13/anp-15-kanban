import {
  buildColumnSpans,
  assignTasksToColumns,
} from "./markdownIndex.js";

/**
 * Builds a note board snapshot: columns from headings, cards from tasks.
 *
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID - The board note's UUID.
 * @param {{columnLimits?: Object<string, number>}} [options] - Per-column
 *   WIP limits keyed by column name (from the owning tab's config).
 * @returns {Promise<{kind: string, noteUUID: string, columns: Array, hasHeadings: boolean}>}
 */
export async function buildNoteBoard(app, noteUUID, options = {}) {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  if (typeof markdown !== "string") {
    return { kind: "note", noteUUID, columns: [], hasHeadings: false };
  }

  const tasks = await app.getNoteTasks({ uuid: noteUUID }, { includeDone: true }) || [];

  // Tag color map for label chips: label names matching an account tag
  // inherit that tag's color.
  let colorMap = {};
  try {
    const tags = (await app.getTags()) || [];
    tags.forEach(t => { if (t?.text) colorMap[t.text.toLowerCase()] = t.color || null; });
  } catch {
    colorMap = {};
  }

  const { columns } = buildColumnSpans(markdown);
  const lines = markdown.split("\n");
  const { columnCards, unsorted } = assignTasksToColumns(columns, lines, tasks);

  const limits = options.columnLimits || {};
  const makeColumn = (span, cards) => ({
    id: span.id,
    name: span.name,
    wipLimit: Number.isInteger(limits[span.name]) && limits[span.name] > 0
      ? limits[span.name]
      : null,
    cards,
  });

  const boardColumns = columns.map(span =>
    makeColumn(span, (columnCards.get(span.id) || []).map(toCardModel))
  );

  // Implicit "Unsorted" pseudo-column for tasks above the first heading.
  if (unsorted.length > 0) {
    boardColumns.unshift({
      id: "unsorted",
      name: "Unsorted",
      wipLimit: null,
      cards: unsorted.map(toCardModel),
    });
  }

  // Rich rendering (Amplenote editor markup incl. Rich Footnotes) for every card,
  // plus label parsing with tag-color resolution.
  const allCards = boardColumns.flatMap(c => c.cards);
  await renderCardHtml(app, allCards);
  allCards.forEach(card => { card.labels = resolveLabels(card.content, colorMap); });

  return {
    kind: "note",
    noteUUID,
    columns: boardColumns,
    hasHeadings: columns.length > 0,
  };
}

/**
 * Maps an Amplenote task to the serializable card model used by the embed.
 * Rich HTML is rendered lazily by the caller via `renderCardHtml` because
 * htmlFromContent is async and this mapper is synchronous.
 *
 * @param {Object} task - Amplenote task object.
 * @returns {Object} serializable card model.
 */
export function toCardModel(task) {
  return {
    id: task.uuid,
    title: plainPreview(task.content || ""),
    content: task.content || "",
    imageUrl: firstImageUrl(task.content || ""),
    completedAt: task.completedAt ?? null,
    dismissedAt: task.dismissedAt ?? null,
    startAt: task.startAt ?? null,
    endAt: task.endAt ?? null,
    deadline: task.deadline ?? null,
    hideUntil: task.hideUntil ?? null,
    repeat: task.repeat ?? null,
    isRepeating: !!task.isRepeating,
    isParent: !!task.isParent,
    important: !!task.important,
    urgent: !!task.urgent,
    score: typeof task.score === "number" ? task.score : null,
    noteUUID: task.noteUUID || null,
  };
}

/**
 * Enriches an array of card models with rendered HTML (Amplenote's own
 * editor markup, including functional Rich Footnotes) via app.htmlFromContent.
 * Cards whose rendering fails keep their plain-text preview only.
 *
 * @param {Object} app - The Amplenote app context.
 * @param {Array<Object>} cards - Card models (mutated in place with `.html`).
 * @returns {Promise<Array<Object>>} the same cards, enriched.
 */
export async function renderCardHtml(app, cards) {
  for (const card of cards) {
    try {
      card.html = await app.htmlFromContent(card.content);
    } catch (error) {
      console.error("htmlFromContent failed for card:", error);
      card.html = null;
    }
  }
  return cards;
}

/**
 * Extracts the first inline markdown image URL from content.
 * @param {string} markdown
 * @returns {string|null}
 */
export function firstImageUrl(markdown) {
  const m = String(markdown).match(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/);
  return m ? m[1] : null;
}

/**
 * Extracts wiki-link label names ([[Note Name]]) from content and resolves
 * each to a color via the account tag color map (case-insensitive).
 * @param {string} markdown
 * @param {Object<string, string|null>} colorMap - lowercase tag text -> hex color.
 * @returns {Array<{name: string, color: string|null}>}
 */
export function resolveLabels(markdown, colorMap = {}) {
  const names = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = re.exec(String(markdown))) !== null) {
    const name = m[1].trim();
    if (name && !names.includes(name)) names.push(name);
  }
  return names.map(name => ({ name, color: colorMap[name.toLowerCase()] ?? null }));
}

/**
 * Single-line plain-text preview of a card's markdown (fallback title).
 * @param {string} markdown
 * @returns {string}
 */
export function plainPreview(markdown) {
  return String(markdown
    .replace(/<!--[\s\S]*?-->/g, "")          // strip metadata comments
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")     // drop images (rendered separately)
    .replace(/\[\[([^\]]*)\]\]/g, "$1")       // wiki-links -> text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")  // links -> text
    .replace(/[*_~`#>]/g, "")                 // emphasis/heading markers
    .replace(/\s+/g, " ")
    .trim());
}
