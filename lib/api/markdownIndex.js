/**
 * NoteMarkdownIndex — pure parsing layer mapping a note's raw markdown onto
 * kanban columns (headings) and cards (tasks).
 *
 * Task lines carry their metadata in an HTML comment (see Markdown reference):
 *   - [ ] Task text <!-- {"uuid": "...", ...} -->
 * which lets us locate each task's physical line reliably.
 */

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const UUID_IN_LINE_RE = (uuid) => new RegExp(`["']uuid["']\\s*:\\s*["']${uuid}["']`);

/**
 * Parses all headings in document order.
 * @param {string} markdown
 * @returns {Array<{lineIndex: number, level: number, text: string}>}
 */
export function parseHeadings(markdown) {
  const headings = [];
  const lines = markdown.split("\n");
  lines.forEach((line, i) => {
    const m = line.match(HEADING_RE);
    if (m) headings.push({ lineIndex: i, level: m[1].length, text: m[2].trim() });
  });
  return headings;
}

/**
 * The shallowest heading level present defines the column level
 * (per plan §10.2 — avoids ambiguity when notes mix H1/H2).
 * @param {Array<{level: number}>} headings
 * @returns {number|null}
 */
export function findColumnLevel(headings) {
  if (!headings.length) return null;
  return Math.min(...headings.map(h => h.level));
}

/**
 * Builds column spans: each column starts at its heading line and extends
 * until the next heading with level <= columnLevel. Deeper headings stay
 * inside the parent column.
 * @param {string} markdown
 * @param {number|null} [columnLevel] defaults to the shallowest level found
 * @returns {{columns: Array<{id: string, name: string, startLine: number, contentStart: number, contentEnd: number}>, preambleEnd: number}}
 */
export function buildColumnSpans(markdown, columnLevel) {
  const headings = parseHeadings(markdown);
  const level = columnLevel ?? findColumnLevel(headings);
  if (level === null) return { columns: [], preambleEnd: 0 };

  const columnHeadings = headings.filter(h => h.level === level);
  const columns = columnHeadings.map((h, i) => {
    const next = columnHeadings[i + 1];
    // Content ends where the next SAME-LEVEL column begins. Everything
    // between (including deeper headings) belongs to this column.
    const contentEnd = next ? next.lineIndex : markdown.split("\n").length;
    return {
      id: String(h.lineIndex),
      name: h.text,
      startLine: h.lineIndex,
      contentStart: h.lineIndex + 1,
      contentEnd,
    };
  });
  const preambleEnd = columns.length ? columns[0].contentStart : 0;
  return { columns, preambleEnd };
}

/**
 * Locates the physical line index of each task by its metadata uuid.
 * @param {string[]} lines
 * @param {Array<{uuid: string}>} tasks
 * @returns {Map<string, number>} uuid -> lineIndex (-1 when not found)
 */
export function findTaskLines(lines, tasks) {
  const result = new Map();
  for (const task of tasks) {
    const re = UUID_IN_LINE_RE(task.uuid);
    let found = -1;
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) { found = i; break; }
    }
    result.set(task.uuid, found);
  }
  return result;
}

/**
 * Assigns tasks to columns by physical position. A task belongs to the last
 * column whose heading sits above its line. Tasks above the first column land
 * in the implicit "Unsorted" pseudo-column.
 * @param {Array} columns - spans from buildColumnSpans
 * @param {string[]} lines
 * @param {Array<Object>} tasks - Amplenote task objects
 * @returns {{columnCards: Map<string, Object[]>, unsorted: Object[]}}
 */
export function assignTasksToColumns(columns, lines, tasks) {
  const taskLines = findTaskLines(lines, tasks);
  const columnCards = new Map(columns.map(c => [c.id, []]));
  const unsorted = [];

  for (const task of tasks) {
    const lineIndex = taskLines.get(task.uuid);
    if (lineIndex === undefined || lineIndex < 0) continue;
    const owner = columns.find(c => lineIndex >= c.contentStart && lineIndex < c.contentEnd);
    if (owner) columnCards.get(owner.id).push(task);
    else unsorted.push(task);
  }
  return { columnCards, unsorted };
}

/**
 * Extracts a column's content markdown (everything below its heading up to
 * the next same-level column).
 * @param {string[]} lines
 * @param {{contentStart: number, contentEnd: number}} span
 * @returns {string}
 */
export function sectionContent(lines, span) {
  return lines.slice(span.contentStart, span.contentEnd).join("\n");
}

/**
 * Produces a new lines array with a task line removed.
 * @param {string[]} lines
 * @param {number} taskLineIndex
 * @returns {string[]}
 */
export function removeLine(lines, taskLineIndex) {
  return [...lines.slice(0, taskLineIndex), ...lines.slice(taskLineIndex + 1)];
}

/**
 * Produces a new lines array with a task line inserted directly below a
 * column's heading (top of the column).
 * @param {string[]} lines
 * @param {{startLine: number}} span
 * @param {string} taskLine
 * @returns {string[]}
 */
export function insertUnderHeading(lines, span, taskLine) {
  return [...lines.slice(0, span.startLine + 1), taskLine, ...lines.slice(span.startLine + 1)];
}

/**
 * Finds a column span by positional id, falling back to name match.
 * @param {Array<{id: string, name: string}>} spans - Column spans.
 * @param {string} columnId - Positional column id (heading line index).
 * @param {string} [columnName] - Fallback heading text match.
 * @returns {Object|null} The matching span, or null.
 */
export function resolveSpan(spans, columnId, columnName) {
  const byId = spans.find(s => s.id === String(columnId));
  if (byId) return byId;
  if (columnName) return spans.find(s => s.name === columnName) || null;
  return null;
}
