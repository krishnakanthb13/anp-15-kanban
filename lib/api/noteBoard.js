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
  const cleanUUID = typeof noteUUID === "object" && noteUUID !== null ? (noteUUID.uuid || noteUUID.id) : noteUUID;
  if (!cleanUUID || typeof cleanUUID !== "string") {
    return { kind: "note", noteUUID: cleanUUID, columns: [], hasHeadings: false };
  }

  let markdown = "";
  try {
    markdown = await app.getNoteContent({ uuid: cleanUUID });
  } catch (err) {
    console.error(`Failed to getNoteContent for ${cleanUUID}:`, err);
    return { kind: "note", noteUUID: cleanUUID, columns: [], hasHeadings: false };
  }

  if (typeof markdown !== "string") {
    return { kind: "note", noteUUID: cleanUUID, columns: [], hasHeadings: false };
  }

  const tasks = await app.getNoteTasks({ uuid: cleanUUID }, { includeDone: true }) || [];

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
  const { columnCards, unsorted, completed = [] } = assignTasksToColumns(columns, lines, tasks, { separateCompleted: true });

  const limits = options.columnLimits || {};
  const makeColumn = (span, cards) => ({
    id: span.id,
    name: span.name,
    level: span.level || null,
    wipLimit: Number.isInteger(limits[span.name]) && limits[span.name] > 0
      ? limits[span.name]
      : null,
    cards,
  });

  const boardColumns = columns.map(span =>
    makeColumn(span, (columnCards.get(span.id) || []).map(toCardModel))
  );

  // Implicit "Unsorted" pseudo-column for active tasks above the first heading.
  if (unsorted.length > 0) {
    boardColumns.unshift({
      id: "unsorted",
      name: "Unsorted",
      wipLimit: null,
      cards: unsorted.map(toCardModel),
    });
  }

  // Dedicated "Completed" column at the right end of the board for all completed tasks
  if (completed && completed.length > 0) {
    boardColumns.push({
      id: "completed",
      name: "Completed",
      wipLimit: null,
      cards: completed.map(toCardModel),
      isDoneColumn: true,
      isSystemColumn: true,
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
    footnotes: parseFootnotes(task.content || ""),
    completedAt: task.completedAt ?? null,
    dismissedAt: task.dismissedAt ?? null,
    startAt: task.startAt ?? null,
    endAt: task.endAt ?? null,
    deadline: task.deadline ?? null,
    hideUntil: task.hideUntil ?? null,
    repeat: task.repeat ?? null,
    isRepeating: !!task.isRepeating,
    isParent: !!task.isParent,
    isSubtask: !!task.isSubtask,
    subtaskDepth: typeof task.subtaskDepth === "number" ? task.subtaskDepth : (task.isSubtask ? 1 : 0),
    important: !!task.important,
    urgent: !!task.urgent,
    score: typeof task.score === "number" ? task.score : null,
    noteUUID: task.noteUUID || null,
  };
}

/**
 * Enriches an array of card models with rendered HTML (Amplenote's own
 * editor markup, including functional Rich Footnotes) via app.htmlFromContent in parallel.
 * Cards whose rendering fails keep their plain-text preview only.
 *
 * @param {Object} app - The Amplenote app context.
 * @param {Array<Object>} cards - Card models (mutated in place with `.html`).
 * @returns {Promise<Array<Object>>} the same cards, enriched.
 */
export async function renderCardHtml(app, cards) {
  if (!Array.isArray(cards) || !cards.length) return cards;
  await Promise.all(
    cards.map(async card => {
      try {
        if (typeof app?.htmlFromContent === "function" && card.content) {
          card.html = await app.htmlFromContent(card.content);
        } else {
          card.html = null;
        }
      } catch (error) {
        card.html = null;
      }
    })
  );
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
 * Extracts wiki-link label names ([[Note Name]]) and inline hashtags (#tag, #parent/subtag)
 * from content and resolves each to a color via the account tag color map (case-insensitive).
 * @param {string} markdown
 * @param {Object<string, string|null>} colorMap - lowercase tag text -> hex color.
 * @returns {Array<{name: string, color: string|null}>}
 */
export function resolveLabels(markdown, colorMap = {}) {
  const labels = [];
  const str = String(markdown || "");

  // 1. Wiki-links: [[Note Name]]
  const wikiRe = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = wikiRe.exec(str)) !== null) {
    const name = m[1].trim();
    if (name && !labels.some(l => l.name.toLowerCase() === name.toLowerCase())) {
      labels.push({
        name,
        color: colorMap[name.toLowerCase()] ?? null,
      });
    }
  }

  // 2. Hashtags: #tag or #parent/subtag
  const tagRe = /(?:^|\s)#([a-zA-Z][a-zA-Z0-9_\-\/]*)/g;
  while ((m = tagRe.exec(str)) !== null) {
    const rawTag = m[1].trim();
    const tagDisplay = "#" + rawTag;
    if (rawTag && !labels.some(l => l.name.toLowerCase() === tagDisplay.toLowerCase() || l.name.toLowerCase() === rawTag.toLowerCase())) {
      const matchedColor = colorMap[rawTag.toLowerCase()] ?? colorMap[tagDisplay.toLowerCase()] ?? null;
      labels.push({
        name: tagDisplay,
        color: matchedColor,
      });
    }
  }

  return labels;
}

/**
 * Parses markdown rich footnote definitions (`[^id]: ...`).
 * Extracts clean message text for each footnote reference.
 *
 * @param {string} markdown
 * @returns {Object<string, string>} map of footnote ID to message text
 */
export function parseFootnotes(markdown) {
  if (!markdown || typeof markdown !== "string") return {};
  const footnotes = {};
  const re = /\[\^([^\]]+)\]:\s*([^\n]*(?:\n+(?: {2,4}|\t)[^\n]*)*)/g;
  let m;
  while ((m = re.exec(markdown)) !== null) {
    const fnId = m[1].trim();
    let body = m[2] || "";
    // Remove the initial [Label]() wrapper if present
    body = body.replace(/^\s*\[[^\]]*\]\([^\)]*\)\s*/, "");
    // Clean leading indents
    const lines = body.split("\n").map(l => l.replace(/^(?: {2,4}|\t)/, "").trim()).filter(Boolean);
    const text = lines.join("\n").trim();
    if (fnId) {
      footnotes[fnId] = text || body.trim();
    }
  }
  return footnotes;
}

/**
 * Single-line plain-text preview of a card's markdown (fallback title).
 * @param {string} markdown
 * @returns {string}
 */
export function plainPreview(markdown) {
  return String(markdown
    .replace(/<!--[\s\S]*?-->/g, "")          // strip metadata comments
    .replace(/\[\^[^\]]+\]:\s*[\s\S]*$/g, "") // strip footnote definitions at the end
    .replace(/\[\^[^\]]+\]/g, "")             // strip footnote markers like [^1]
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")     // drop images (rendered separately)
    .replace(/\[\[([^\]]*)\]\]/g, "$1")       // wiki-links -> text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")  // links -> text
    .replace(/[*_~`#>]/g, "")                 // emphasis/heading markers
    .replace(/\s+/g, " ")
    .trim());
}
