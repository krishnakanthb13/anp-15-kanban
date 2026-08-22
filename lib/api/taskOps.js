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
 * Design note: moves rewrite the whole note via a minimal line diff instead of
 * two section-scoped replaceNoteContent calls. Reason: API section boundaries
 * split at EVERY heading, so with nested sub-headings a section-scoped write
 * would truncate content below the sub-heading. A freshly-read, single-line
 * diff is strictly safer here.
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
export async function moveTaskToColumn(app, noteUUID, taskUuid, target = {}) {
  const { markdown, lines } = await readNote(app, noteUUID);
  const cleanLines = lines.map(l => String(l || "").replace(/\r/g, ""));
  const { columns } = buildColumnSpans(cleanLines.join("\n"));
  if (!columns.length) return "no-columns";

  let taskObj = null;
  try {
    taskObj = await app.getTask(taskUuid);
  } catch {
    taskObj = null;
  }

  const [taskLineIndex] = findTaskLines(cleanLines, [{ uuid: taskUuid, content: taskObj?.content }]).values();
  if (taskLineIndex === undefined || taskLineIndex < 0) return "no-task";

  const taskLine = cleanLines[taskLineIndex];

  // Relative positioning before or after a target card (enables intra-header reordering)
  if (target.targetCardId && target.targetCardId !== taskUuid) {
    let targetTaskObj = null;
    try {
      targetTaskObj = await app.getTask(target.targetCardId);
    } catch {}

    const [targetLineIndex] = findTaskLines(cleanLines, [{ uuid: target.targetCardId, content: targetTaskObj?.content }]).values();
    if (targetLineIndex !== undefined && targetLineIndex >= 0 && targetLineIndex !== taskLineIndex) {
      let next = removeLine(cleanLines, taskLineIndex);
      const shiftedTargetIdx = targetLineIndex > taskLineIndex ? targetLineIndex - 1 : targetLineIndex;
      const insertAt = target.position === "after" ? shiftedTargetIdx + 1 : shiftedTargetIdx;
      next.splice(insertAt, 0, taskLine);
      await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
      return "moved";
    }
  }

  let next = removeLine(cleanLines, taskLineIndex);

  if (target.columnId === "completed" || target.columnName === "Completed") {
    try {
      await app.updateTask(taskUuid, { completedAt: Date.now() });
    } catch {}
    return "moved";
  }

  if (target.columnId === "unsorted" || target.columnName === "Unsorted") {
    const insertAt = columns[0] ? Math.max(0, columns[0].startLine) : 0;
    next.splice(insertAt, 0, taskLine);
    await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
    return "moved";
  }

  const destSpan = resolveSpan(columns, target.columnId, target.columnName);
  if (!destSpan) return "no-target";

  const sourceSpan = columns.find(
    s => taskLineIndex >= s.contentStart && taskLineIndex < s.contentEnd
  );
  if (sourceSpan && sourceSpan.id === destSpan.id && !target.targetCardId) {
    return "same-column";
  }

  // Shift destination startLine if it was after the removed line
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
  let targetName = target?.columnName;
  if (!targetName && target?.columnId && target.columnId !== "unsorted") {
    try {
      const { markdown } = await readNote(app, noteUUID);
      const { columns } = buildColumnSpans(markdown);
      const span = resolveSpan(columns, target.columnId);
      if (span) targetName = span.name;
    } catch {
      targetName = null;
    }
  }

  const taskUuid = await app.insertTask({ uuid: noteUUID }, { content: String(content || "") });
  if (!taskUuid) return null;

  if (target?.columnId === "unsorted") {
    return taskUuid;
  }

  try {
    const res = await moveTaskToColumn(app, noteUUID, taskUuid, {
      columnId: target?.columnId,
      columnName: targetName,
    });
    if (res === "no-task") {
      // Fallback: If Amplenote hasn't indexed the task comment in getNoteContent yet,
      // explicitly insert the task markdown line under the target heading.
      const { markdown } = await readNote(app, noteUUID);
      const { columns } = buildColumnSpans(markdown);
      const span = resolveSpan(columns, target.columnId, targetName);
      if (span) {
        let lines = markdown.split("\n");
        const cleanContent = String(content || "").trim();
        const preambleIndex = lines.findIndex((l, i) => i < span.startLine && (l.includes(taskUuid) || (cleanContent && l.includes(cleanContent))));
        if (preambleIndex !== -1) {
          lines.splice(preambleIndex, 1);
        }
        const taskLine = `- [ ] ${content} <!-- {"uuid":"${taskUuid}"} -->`;
        lines = insertUnderHeading(lines, span, taskLine);
        await app.replaceNoteContent({ uuid: noteUUID }, lines.join("\n"));
      }
    }
  } catch (error) {
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

/**
 * Re-arranges task lines in the note markdown under each heading according
 * to the specified sortMode ('score' | 'startDate' | 'important' | 'urgent').
 *
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID - Note uuid to rewrite.
 * @param {string} sortMode - Mode to sort tasks by.
 * @returns {Promise<boolean>} true if modified and saved.
 */
export async function sortTasksInNoteMarkdown(app, noteUUID, sortMode = "score") {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  const tasks = await app.getNoteTasks({ uuid: noteUUID });
  if (!markdown || !tasks || !tasks.length) return false;

  const { columns } = buildColumnSpans(markdown);
  const lines = markdown.split("\n");
  const taskLineMap = findTaskLines(lines, tasks);
  const taskByUuid = new Map(tasks.map(t => [t.uuid, t]));

  const compareFn = (uuidA, uuidB) => {
    const a = taskByUuid.get(uuidA) || {};
    const b = taskByUuid.get(uuidB) || {};
    if (sortMode === "score") {
      return (b.score || 0) - (a.score || 0);
    }
    if (sortMode === "startDate") {
      return (b.startAt || 0) - (a.startAt || 0);
    }
    if (sortMode === "important") {
      return (b.important ? 1 : 0) - (a.important ? 1 : 0);
    }
    if (sortMode === "urgent") {
      return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
    }
    return 0;
  };

  let nextLines = [...lines];
  for (const span of columns) {
    const spanTasks = [];
    for (const [uuid, lineIdx] of taskLineMap.entries()) {
      if (lineIdx >= span.contentStart && lineIdx < span.contentEnd) {
        spanTasks.push({ uuid, lineIdx, line: lines[lineIdx] });
      }
    }
    if (spanTasks.length <= 1) continue;

    spanTasks.sort((x, y) => compareFn(x.uuid, y.uuid));

    const originalIndices = spanTasks.map(t => t.lineIdx).sort((a, b) => a - b);
    for (let i = 0; i < spanTasks.length; i++) {
      nextLines[originalIndices[i]] = spanTasks[i].line;
    }
  }

  await app.replaceNoteContent({ uuid: noteUUID }, nextLines.join("\n"));
  return true;
}

