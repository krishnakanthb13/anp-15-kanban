/**
 * NoteMarkdownIndex — pure parsing layer mapping a note's raw markdown onto
 * kanban columns (headings) and cards (tasks).
 *
 * Task lines carry their metadata in an HTML comment (see Markdown reference):
 *   - [ ] Task text <!-- {"uuid": "...", ...} -->
 * which lets us locate each task's physical line reliably.
 */

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const UUID_IN_LINE_RE = (uuid) => new RegExp(`["']?uuid["']?\\s*:\\s*["']?${uuid}["']?`, "i");

/**
 * Parses all headings in document order, ignoring html details/summary tags.
 * @param {string} markdown
 * @returns {Array<{lineIndex: number, level: number, text: string}>}
 */
export function parseHeadings(markdown) {
  const headings = [];
  const lines = String(markdown || "").split("\n");
  lines.forEach((line, i) => {
    const clean = line.replace(/\r/g, "").trim();
    if (!clean) return;
    // Ignore html tags like <details>, <summary>, comments
    if (/^<details/i.test(clean) || /^<summary/i.test(clean) || /^<!--/i.test(clean)) return;

    const m = clean.match(HEADING_RE);
    if (m) {
      const text = m[2].replace(/<[^>]+>/g, "").trim();
      // Ignore Amplenote auto-generated completed tasks heading
      if (/^completed\s+tasks/i.test(text)) return;
      headings.push({ lineIndex: i, level: m[1].length, text });
    }
  });
  return headings;
}

/**
 * The shallowest heading level present defines the column level.
 * If the note has a single top-level H1 (document title) and multiple H2s,
 * level 2 is chosen as the column level.
 * @param {Array<{level: number}>} headings
 * @returns {number|null}
 */
export function findColumnLevel(headings) {
  if (!headings.length) return null;
  const levelCounts = {};
  headings.forEach(h => { levelCounts[h.level] = (levelCounts[h.level] || 0) + 1; });
  const minLevel = Math.min(...headings.map(h => h.level));
  if (minLevel === 1 && levelCounts[1] === 1 && (levelCounts[2] || 0) >= 2) {
    return 2;
  }
  return minLevel;
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
  const totalLines = String(markdown || "").split("\n").length;
  const columns = columnHeadings.map((h, i) => {
    const next = columnHeadings[i + 1];
    // Content ends where the next SAME-LEVEL column begins. Everything
    // between (including deeper headings) belongs to this column.
    const contentEnd = next ? next.lineIndex : totalLines;
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
 * Locates the physical line index of each task by its metadata uuid or content.
 * @param {string[]} lines
 * @param {Array<{uuid?: string, id?: string, content?: string}>} tasks
 * @returns {Map<string, number>} uuid -> lineIndex (-1 when not found)
 */
export function findTaskLines(lines, tasks) {
  const result = new Map();
  if (!Array.isArray(lines) || !Array.isArray(tasks)) return result;

  for (const task of tasks) {
    const uuid = task.uuid || task.id;
    const re = uuid ? UUID_IN_LINE_RE(uuid) : null;
    let found = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = String(lines[i] || "").replace(/\r/g, "");
      if (re && re.test(line)) {
        found = i;
        break;
      }
      if (uuid && line.indexOf(uuid) !== -1) {
        found = i;
        break;
      }
      // Content fallback if UUID comment is not present in markdown
      if (task.content) {
        const cleanTaskContent = String(task.content).trim();
        const cleanLineContent = line.replace(/^[-*+]\s*\[[ xX]\]\s*/, "").replace(/<!--[\s\S]*?-->/g, "").trim();
        if (cleanTaskContent && (cleanLineContent === cleanTaskContent || line.indexOf(cleanTaskContent) !== -1)) {
          found = i;
          break;
        }
      }
    }
    result.set(uuid || task.content, found);
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
export function assignTasksToColumns(columns, lines, tasks, options = {}) {
  const { separateCompleted = false } = options;
  const taskLines = findTaskLines(lines, tasks);
  const columnCards = new Map(columns.map(c => [c.id, []]));
  const unsorted = [];
  const completed = [];

  for (const task of tasks) {
    const lineIndex = taskLines.get(task.uuid || task.id);
    if (lineIndex !== undefined && lineIndex >= 0) {
      const rawLine = String(lines[lineIndex] || "");
      const indentMatch = rawLine.match(/^(\s+)[-*+]\s*\[/);
      if (indentMatch) {
        const spaces = indentMatch[1].replace(/\t/g, "    ").length;
        task.subtaskDepth = spaces >= 4 ? Math.floor(spaces / 4) : 1;
        task.isSubtask = true;
      } else {
        task.subtaskDepth = 0;
        task.isSubtask = false;
      }
    } else {
      task.subtaskDepth = 0;
      task.isSubtask = false;
    }

    // When separateCompleted is requested (Note boards), completed & dismissed tasks go to dedicated Completed column
    if (separateCompleted && (task.completedAt || task.completed || task.dismissedAt)) {
      completed.push(task);
      continue;
    }
    if (lineIndex === undefined || lineIndex < 0) continue;
    const owner = columns.find(c => lineIndex >= c.contentStart && lineIndex < c.contentEnd);
    if (owner) columnCards.get(owner.id).push(task);
    else unsorted.push(task);
  }

  // Sort tasks in each column strictly by their physical line index in the note markdown
  for (const [colId, cardList] of columnCards.entries()) {
    cardList.sort((a, b) => {
      const lineA = taskLines.get(a.uuid || a.id) ?? 0;
      const lineB = taskLines.get(b.uuid || b.id) ?? 0;
      return lineA - lineB;
    });
  }

  unsorted.sort((a, b) => {
    const lineA = taskLines.get(a.uuid || a.id) ?? 0;
    const lineB = taskLines.get(b.uuid || b.id) ?? 0;
    return lineA - lineB;
  });

  completed.sort((a, b) => {
    const timeA = typeof a.completedAt === "number" ? a.completedAt : 0;
    const timeB = typeof b.completedAt === "number" ? b.completedAt : 0;
    return timeB - timeA;
  });

  return { columnCards, unsorted, completed };
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
  if (!spans || !spans.length) return null;
  const colStr = String(columnId || "");
  const byId = spans.find(s => s.id === colStr);
  if (byId) return byId;

  if (columnName) {
    const cleanName = String(columnName).trim().toLowerCase();
    const byName = spans.find(s => s.name.trim().toLowerCase() === cleanName);
    if (byName) return byName;
  }

  // Fallback if columnId is a 0-based column index
  const idx = parseInt(colStr, 10);
  if (!Number.isNaN(idx) && idx >= 0 && idx < spans.length) {
    return spans[idx];
  }
  return null;
}
