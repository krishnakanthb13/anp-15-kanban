import {
  buildColumnSpans,
  resolveSpan,
} from "./markdownIndex.js";

/**
 * Structural column (heading) operations for note boards.
 *
 * All operations read fresh markdown immediately before writing and perform
 * whole-note minimal rewrites. Callers own the confirm-before-write UX
 * (see embedActions) — these functions execute without prompting.
 */

const HEADING_LINE_RE = /^(#{1,6})\s+(.*)$/;

async function readLines(app, noteUUID) {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  return markdown.split("\n");
}

function headingLevel(line) {
  const m = String(line).match(HEADING_LINE_RE);
  return m ? m[1].length : null;
}

/**
 * Appends a new column heading at the end of the note. The heading level
 * matches the specified level (1, 2, 3) or the note's shallowest existing level.
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID - The board note's UUID.
 * @param {string} name - New column name.
 * @param {number|string} [level] - Heading level (1, 2, 3, etc.).
 * @returns {Promise<boolean>} whether the column was created.
 */
export async function createColumn(app, noteUUID, name, level = null) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return false;

  let hLevel = level ? parseInt(String(level), 10) : null;
  if (!hLevel || hLevel < 1 || hLevel > 6) {
    const markdown = await app.getNoteContent({ uuid: noteUUID });
    const { columns } = buildColumnSpans(markdown);
    hLevel = columns.length ? headingLevel(markdown.split("\n")[columns[0].startLine]) : 2;
  }

  await app.insertNoteContent(
    { uuid: noteUUID },
    `\n${"#".repeat(hLevel)} ${trimmed}\n`,
    { atEnd: true }
  );
  return true;
}

/**
 * Renames a column by rewriting its heading line in place (markers preserved).
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID - The board note's UUID.
 * @param {string} columnId - Positional column id (heading line index).
 * @param {string} newName - Replacement heading text.
 * @returns {Promise<boolean>} whether a rename was performed.
 */
export async function renameColumn(app, noteUUID, columnId, newName) {
  const trimmed = String(newName || "").trim();
  if (!trimmed) return false;

  const lines = await readLines(app, noteUUID);
  const { columns } = buildColumnSpans(lines.join("\n"));
  const span = resolveSpan(columns, columnId);
  if (!span) return false;

  const level = headingLevel(lines[span.startLine]) || 1;
  lines[span.startLine] = `${"#".repeat(level)} ${trimmed}`;
  await app.replaceNoteContent({ uuid: noteUUID }, lines.join("\n"));
  return true;
}

/**
 * Deletes a column: its tasks/content are moved to the very top of the note
 * (under no heading), then the heading and its content are removed.
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID - The board note's UUID.
 * @param {string} columnId - Positional column id.
 * @returns {Promise<boolean>} whether a deletion was performed.
 */
export async function deleteColumn(app, noteUUID, columnId) {
  const lines = await readLines(app, noteUUID);
  const { columns } = buildColumnSpans(lines.join("\n"));
  const span = resolveSpan(columns, columnId);
  if (!span) return false;
  if (columns.length <= 1) return false; // never delete the last column into ambiguity

  // Extract content (trimmed of leading/trailing blanks), remove heading+content.
  const extracted = lines.slice(span.contentStart, span.contentEnd)
    .filter((line, i, arr) => !(line.trim() === "" && (i === 0 || i === arr.length - 1)));
  const next = [
    ...lines.slice(0, span.startLine),
    ...lines.slice(span.contentEnd),
  ];

  // Prepend extracted content "at the top of the note": deleting the FIRST
  // column puts its tasks above any preamble; deleting a later column slots
  // them directly above the first remaining heading.
  const insertAt = span.startLine === columns[0].startLine
    ? 0
    : Math.max(columns[0].startLine, 0);
  next.splice(insertAt, 0, ...extracted);

  await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
  return true;
}

/**
 * Reorders columns to match the given id order (whole-note rewrite of
 * heading+content blocks; preamble stays on top).
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID - The board note's UUID.
 * @param {string[]} orderedIds - Column ids in the desired order (must be a
 *   permutation of the current columns).
 * @returns {Promise<boolean>} whether a reorder was performed.
 */
export async function reorderColumns(app, noteUUID, orderedIds) {
  const lines = await readLines(app, noteUUID);
  const markdown = lines.join("\n");
  const { columns, preambleEnd } = buildColumnSpans(markdown);
  if (!columns.length || !Array.isArray(orderedIds)) return false;
  if (orderedIds.length !== columns.length) return false;

  const spans = orderedIds.map(id => resolveSpan(columns, id));
  if (spans.some(s => !s) || new Set(spans.map(s => s.id)).size !== columns.length) return false;

  // Preamble stays on top; each block is [heading line .. content end).
  const rebuilt = [...lines.slice(0, Math.max(preambleEnd - 1, 0))];
  for (const span of spans) {
    rebuilt.push(...lines.slice(span.startLine, span.contentEnd));
  }

  await app.replaceNoteContent({ uuid: noteUUID }, rebuilt.join("\n"));
  return true;
}

/**
 * Moves a whole column (heading + content) from one note to another.
 * Order of operations is insert-before-remove: a failure mid-way leaves a
 * visible duplicate in the source rather than silent data loss.
 * @param {Object} app - The Amplenote app context.
 * @param {string} sourceUUID - Source note UUID.
 * @param {string} columnId - Positional column id in the source note.
 * @param {string} targetUUID - Destination note UUID.
 * @returns {Promise<"moved"|"same-note"|"no-target"|"no-columns">}
 */
export async function transferColumn(app, sourceUUID, columnId, targetUUID) {
  if (sourceUUID === targetUUID) return "same-note";

  const lines = await readLines(app, sourceUUID);
  const { columns } = buildColumnSpans(lines.join("\n"));
  if (!columns.length) return "no-columns";
  const span = resolveSpan(columns, columnId);
  if (!span) return "no-target";

  const block = lines.slice(span.startLine, span.contentEnd);
  const trimmed = block.join("\n").replace(/\n+$/, "");

  // 1. Insert into target first (duplicate is recoverable; loss is not).
  await app.insertNoteContent({ uuid: targetUUID }, `\n${trimmed}\n`, { atEnd: true });

  // 2. Remove from source.
  const next = [...lines.slice(0, span.startLine), ...lines.slice(span.contentEnd)];
  await app.replaceNoteContent({ uuid: sourceUUID }, next.join("\n"));
  return "moved";
}
