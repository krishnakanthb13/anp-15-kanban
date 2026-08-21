import {
  buildColumnSpans,
  findTaskLines,
  resolveSpan,
  removeLine,
  insertUnderHeading,
} from "./markdownIndex.js";

/**
 * Task mutation operations for note boards.
 *
 * Design note (deviation from ds.md §3): moves rewrite the whole note via a
 * minimal line diff instead of two section-scoped replaceNoteContent calls.
 * Reason: API section boundaries split at EVERY heading, so with nested
 * sub-headings a section-scoped write would truncate content below the
 * sub-heading. A freshly-read, single-line diff is strictly safer here.
 */

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Reads fresh markdown and returns { markdown, lines }.
 * @param {Object} app
 * @param {string} noteUUID
 */
async function readNote(app, noteUUID) {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  return { markdown, lines: markdown.split("\n") };
}

/**
 * Moves a task's physical line under a different column heading.
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID
 * @param {string} taskUuid
 * @param {{columnId?: string, columnName?: string}} target - column selector.
 * @returns {Promise<"moved"|"same-column"|"no-task"|"no-columns"|"no-target">}
 */
export async function moveTaskToColumn(app, noteUUID, taskUuid, target) {
  const { markdown, lines } = await readNote(app, noteUUID);
  const { columns } = buildColumnSpans(markdown);
  if (!columns.length) return "no-columns";

  const destSpan = resolveSpan(columns, target.columnId, target.columnName);
  if (!destSpan) return "no-target";

  const [taskLineIndex] = findTaskLines(lines, [{ uuid: taskUuid }]).values();
  if (taskLineIndex < 0) return "no-task";

  const sourceSpan = columns.find(
    s => taskLineIndex >= s.contentStart && taskLineIndex < s.contentEnd
  );
  if (sourceSpan && sourceSpan.id === destSpan.id) return "same-column";

  const taskLine = lines[taskLineIndex];
  let next = removeLine(lines, taskLineIndex);

  // Removal shifts lines after the removed index by one.
  const shiftedDest = {
    ...destSpan,
    startLine: destSpan.startLine > taskLineIndex ? destSpan.startLine - 1 : destSpan.startLine,
  };
  next = insertUnderHeading(next, shiftedDest, taskLine);

  await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
  return "moved";
}

/**
 * Creates a task directly inside a column. insertTask always lands at the top
 * of the note, so the new task is relocated underneath the target heading.
 * @param {Object} app
 * @param {string} noteUUID
 * @param {{columnId?: string, columnName?: string}} target
 * @param {string} content - markdown content for the new task.
 * @returns {Promise<string|null>} the new task's uuid, or null on failure.
 */
export async function createTaskInColumn(app, noteUUID, target, content) {
  const taskUuid = await app.insertTask({ uuid: noteUUID }, { content: String(content || "") });
  if (!taskUuid) return null;

  try {
    await moveTaskToColumn(app, noteUUID, taskUuid, target);
  } catch (error) {
    // Task exists but couldn't be relocated; it will surface in Unsorted/first column.
    console.error("createTaskInColumn relocate failed:", error);
  }
  return taskUuid;
}

/**
 * Marks a task completed (crossed out) or reopens it.
 * @param {Object} app - The Amplenote app context.
 * @param {string} taskUuid - The task's uuid.
 * @param {boolean} [done=true] - true completes the task, false reopens it.
 * @returns {Promise<void>}
 */
export async function setTaskCompleted(app, taskUuid, done = true) {
  await app.updateTask(taskUuid, { completedAt: done ? nowSeconds() : null });
}

/**
 * Replaces a task's markdown content.
 * @param {Object} app - The Amplenote app context.
 * @param {string} taskUuid - The task's uuid.
 * @param {string} content - New markdown content.
 * @returns {Promise<void>}
 */
export async function updateCardContent(app, taskUuid, content) {
  await app.updateTask(taskUuid, { content });
}

/**
 * Appends a wiki-link label ([[Note Name]]) to a task's content.
 * @param {Object} app - The Amplenote app context.
 * @param {string} taskUuid - The task's uuid.
 * @param {string} labelName - Note name to link as label.
 * @returns {Promise<void>}
 */
export async function addLabelToTask(app, taskUuid, labelName) {
  const name = String(labelName || "").trim();
  if (!name) return;
  const task = await app.getTask(taskUuid);
  if (!task) return;
  if (task.content && task.content.includes(`[[${name}]]`)) return; // already labeled
  const content = `${task.content || ""}\n[[${name}]]`;
  await app.updateTask(taskUuid, { content });
}
