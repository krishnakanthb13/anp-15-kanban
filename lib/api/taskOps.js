import {
  buildColumnSpans,
  findTaskLines,
  findTaskBlock,
  removeTaskBlock,
  resolveSpan,
  removeLine,
  insertUnderHeading,
} from "./markdownIndex.js";
import { withNoteLock } from "./columnOps.js";

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
 * Internal implementation of moveTaskToColumn without note locking.
 */
async function _moveTaskToColumn(app, noteUUID, taskUuid, target = {}) {
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

  let [taskLineIndex] = findTaskLines(cleanLines, [{ uuid: taskUuid, content: taskObj?.content }]).values();
  let taskBlockLines = [];
  let next = cleanLines;
  let countRemoved = 0;
  if (taskLineIndex !== undefined && taskLineIndex >= 0) {
    const block = findTaskBlock(cleanLines, taskLineIndex);
    taskBlockLines = block.lines;
    countRemoved = block.endIndex - block.startIndex;
    next = [...cleanLines.slice(0, block.startIndex), ...cleanLines.slice(block.endIndex)];
  } else if (taskObj && (taskObj.uuid === taskUuid || taskObj.id === taskUuid) && taskObj.content) {
    taskBlockLines = [`- [ ] ${taskObj.content}`];
    taskLineIndex = -1;
    countRemoved = 0;
  } else {
    return "no-task";
  }

  // Relative positioning before or after a target card (enables intra-header reordering)
  if (target.targetCardId && target.targetCardId !== taskUuid) {
    let targetTaskObj = null;
    try {
      targetTaskObj = await app.getTask(target.targetCardId);
    } catch {}

    const [targetLineIndex] = findTaskLines(cleanLines, [{ uuid: target.targetCardId, content: targetTaskObj?.content }]).values();
    if (targetLineIndex !== undefined && targetLineIndex >= 0 && targetLineIndex !== taskLineIndex) {
      let shiftedTargetIdx = targetLineIndex;
      if (taskLineIndex >= 0 && targetLineIndex > taskLineIndex) {
        shiftedTargetIdx = targetLineIndex - countRemoved;
      }
      let insertAt = shiftedTargetIdx;
      if (target.position === "after") {
        const targetBlock = findTaskBlock(next, shiftedTargetIdx);
        insertAt = targetBlock.endIndex;
      }
      next.splice(insertAt, 0, ...taskBlockLines);
      await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
      return "moved";
    }
  }

  // If no columns/headings exist in the note, insert at top or bottom
  if (!columns.length) {
    if (target.position === "bottom") {
      next.push(...taskBlockLines);
    } else {
      next.unshift(...taskBlockLines);
    }
    await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
    return "moved";
  }

  if (target.columnId === "completed" || target.columnName === "Completed") {
    try {
      await app.updateTask(taskUuid, { completedAt: nowSeconds() });
    } catch {}
    return "moved";
  }

  if ((!target.columnId && !target.columnName) || target.columnId === "unsorted" || target.columnName === "Unsorted" || target.columnId === "main") {
    const insertAt = columns[0] ? Math.max(0, columns[0].startLine) : 0;
    const nextLine = next[insertAt];
    if (
      nextLine !== undefined &&
      nextLine.trim() !== "" &&
      !/^\s*[-*+]\s*\[[ xX]\]/.test(nextLine) &&
      !/^#{1,6}\s+/.test(nextLine)
    ) {
      next.splice(insertAt, 0, ...taskBlockLines, "");
    } else {
      next.splice(insertAt, 0, ...taskBlockLines);
    }
    await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
    return "moved";
  }

  const destSpan = resolveSpan(columns, target.columnId, target.columnName);
  if (!destSpan) return "no-target";

  const sourceSpan = taskLineIndex >= 0
    ? columns.find(s => taskLineIndex >= s.contentStart && taskLineIndex < s.contentEnd)
    : null;
  if (sourceSpan && sourceSpan.id === destSpan.id && !target.targetCardId) {
    return "same-column";
  }

  // Shift destination startLine if it was after the removed task block
  const shiftedDest = {
    ...destSpan,
    startLine: (taskLineIndex >= 0 && destSpan.startLine > taskLineIndex) ? destSpan.startLine - countRemoved : destSpan.startLine,
  };
  next = insertUnderHeading(next, shiftedDest, taskBlockLines);

  await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
  return "moved";
}

/**
 * Moves a task's physical line under a different column heading.
 * Wrapped with withNoteLock to serialize note writes and prevent race conditions.
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID
 * @param {string} taskUuid
 * @param {{columnId?: string, columnName?: string}} target - column selector.
 * @param {{skipLock?: boolean}} [options]
 * @returns {Promise<"moved"|"same-column"|"no-task"|"no-columns"|"no-target">}
 */
export async function moveTaskToColumn(app, noteUUID, taskUuid, target = {}, options = {}) {
  if (options && options.skipLock) {
    return _moveTaskToColumn(app, noteUUID, taskUuid, target);
  }
  return withNoteLock(noteUUID, () => _moveTaskToColumn(app, noteUUID, taskUuid, target));
}

export { _moveTaskToColumn };

/**
 * Internal implementation of createTaskInColumn without note locking.
 */
async function _createTaskInColumn(app, noteUUID, target, content) {
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

  const cleanInputContent = String(content || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const taskUuid = await app.insertTask({ uuid: noteUUID }, { content: cleanInputContent });
  if (!taskUuid) return null;

  // Guarantee that the task entity content in Amplenote backend strictly matches the user's input
  try {
    await app.updateTask(taskUuid, { content: cleanInputContent });
  } catch {}

  const isUnsorted = target?.columnId === "unsorted" || target?.columnName === "Unsorted" || !target?.columnId;

  if (isUnsorted) {
    try {
      const { markdown, lines } = await readNote(app, noteUUID);
      let cleanLines = lines.map(l => String(l || "").replace(/\r/g, ""));

      let taskObj = null;
      try {
        taskObj = await app.getTask(taskUuid);
      } catch {
        taskObj = null;
      }

      const [taskIdx] = findTaskLines(cleanLines, [{ uuid: taskUuid, content: taskObj?.content || cleanInputContent }]).values();
      const taskLine = `- [ ] ${cleanInputContent} <!-- {"uuid":"${taskUuid}"} -->`;

      if (taskIdx !== undefined && taskIdx > 0) {
        // If task was placed after line 0 (e.g. Amplenote placed it below the first heading),
        // move it to line 0 (beginning of the note before any headers).
        let next = removeLine(cleanLines, taskIdx);
        const nextLine = next[0];
        if (
          nextLine !== undefined &&
          nextLine.trim() !== "" &&
          !/^\s*[-*+]\s*\[[ xX]\]/.test(nextLine) &&
          !/^#{1,6}\s+/.test(nextLine)
        ) {
          next.unshift(taskLine, "");
        } else {
          next.unshift(taskLine);
        }
        await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
      } else if (taskIdx === undefined || taskIdx < 0) {
        // Fallback: if Amplenote hasn't indexed the task comment in getNoteContent yet,
        // explicitly insert the task markdown line at the beginning of the note (line 0).
        const existingIdx = cleanLines.findIndex(l => {
          if (l.includes(taskUuid)) return true;
          if (!/^\s*[-*+]\s*\[[ xX]\]/.test(l)) return false;
          const clean = l.replace(/^\s*[-*+]\s*\[[ xX]\]\s*/, "").replace(/<!--[\s\S]*?-->/g, "").trim();
          return cleanInputContent && clean === cleanInputContent;
        });
        if (existingIdx !== -1) {
          cleanLines.splice(existingIdx, 1);
        }
        const nextLine = cleanLines[0];
        if (
          nextLine !== undefined &&
          nextLine.trim() !== "" &&
          !/^\s*[-*+]\s*\[[ xX]\]/.test(nextLine) &&
          !/^#{1,6}\s+/.test(nextLine)
        ) {
          cleanLines.unshift(taskLine, "");
        } else {
          cleanLines.unshift(taskLine);
        }
        await app.replaceNoteContent({ uuid: noteUUID }, cleanLines.join("\n"));
      }
    } catch (error) {
      console.error("createTaskInColumn unsorted relocate failed:", error);
    }
    return taskUuid;
  }

  try {
    const res = await _moveTaskToColumn(app, noteUUID, taskUuid, {
      columnId: target?.columnId,
      columnName: targetName,
    });
    if (res === "no-task" || res === "same-column") {
      // Fallback: If Amplenote hasn't indexed the task comment in getNoteContent yet,
      // explicitly insert the task markdown line under the target heading.
      const { markdown } = await readNote(app, noteUUID);
      const { columns } = buildColumnSpans(markdown);
      const span = resolveSpan(columns, target.columnId, targetName);
      if (span) {
        let lines = markdown.split("\n");
        const preambleIndex = lines.findIndex((l, i) => {
          if (i >= span.startLine) return false;
          if (l.includes(taskUuid)) return true;
          if (!/^\s*[-*+]\s*\[[ xX]\]/.test(l)) return false;
          const clean = l.replace(/^\s*[-*+]\s*\[[ xX]\]\s*/, "").replace(/<!--[\s\S]*?-->/g, "").trim();
          return cleanInputContent && clean === cleanInputContent;
        });
        if (preambleIndex !== -1) {
          lines.splice(preambleIndex, 1);
        }
        const taskLine = `- [ ] ${cleanInputContent} <!-- {"uuid":"${taskUuid}"} -->`;
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
 * Creates a task directly inside a column. insertTask always lands at the top
 * of the note, so the new task is relocated underneath the target heading.
 * Wrapped with withNoteLock to serialize note writes and prevent race conditions.
 * @param {Object} app
 * @param {string} noteUUID
 * @param {{columnId?: string, columnName?: string}} target
 * @param {string} content - markdown content for the new task.
 * @returns {Promise<string|null>} the new task's uuid, or null on failure.
 */
export async function createTaskInColumn(app, noteUUID, target, content) {
  return withNoteLock(noteUUID, () => _createTaskInColumn(app, noteUUID, target, content));
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
 * Internal implementation of sortTasksInNoteMarkdown without note locking.
 */
async function _sortTasksInNoteMarkdown(app, noteUUID, sortMode = "score") {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  const tasks = await app.getNoteTasks({ uuid: noteUUID });
  if (!markdown || !tasks || !tasks.length) return false;

  const { columns, preambleEnd } = buildColumnSpans(markdown);
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

  // Rebuild whole document preserving preamble and heading hierarchy
  const preambleLimit = columns.length ? columns[0].startLine : lines.length;
  const rebuilt = [...lines.slice(0, preambleLimit)];

  for (let c = 0; c < columns.length; c++) {
    const span = columns[c];
    // Add heading line
    rebuilt.push(lines[span.startLine]);

    const spanTasks = [];
    for (const [uuid, lineIdx] of taskLineMap.entries()) {
      if (lineIdx >= span.contentStart && lineIdx < span.contentEnd) {
        const block = findTaskBlock(lines, lineIdx);
        spanTasks.push({ uuid, lineIdx, blockLines: block.lines, blockEnd: block.endIndex });
      }
    }

    // Filter to top-level tasks in this column so indented subtasks stay attached to parent blocks
    const topLevelTasks = spanTasks
      .filter(t => !spanTasks.some(other => other !== t && t.lineIdx > other.lineIdx && t.lineIdx < other.blockEnd))
      .sort((a, b) => a.lineIdx - b.lineIdx);

    if (topLevelTasks.length <= 1) {
      // No reordering needed; keep existing span content as-is
      rebuilt.push(...lines.slice(span.contentStart, span.contentEnd));
      continue;
    }

    const sortedTasks = [...topLevelTasks].sort((x, y) => compareFn(x.uuid, y.uuid));

    // Reconstruct span lines: slots where tasks were get sorted task blocks; interstitial lines are preserved
    const spanNewLines = [];
    let curLine = span.contentStart;
    for (let i = 0; i < topLevelTasks.length; i++) {
      const origTask = topLevelTasks[i];
      while (curLine < origTask.lineIdx) {
        spanNewLines.push(lines[curLine]);
        curLine++;
      }
      spanNewLines.push(...sortedTasks[i].blockLines);
      curLine = origTask.blockEnd;
    }
    while (curLine < span.contentEnd) {
      spanNewLines.push(lines[curLine]);
      curLine++;
    }

    rebuilt.push(...spanNewLines);
  }

  // Any trailing lines after last column span
  const lastColEnd = columns.length ? columns[columns.length - 1].contentEnd : lines.length;
  if (lastColEnd < lines.length) {
    rebuilt.push(...lines.slice(lastColEnd));
  }

  await app.replaceNoteContent({ uuid: noteUUID }, rebuilt.join("\n"));
  return true;
}

/**
 * Re-arranges task lines in the note markdown under each heading according
 * to the specified sortMode ('score' | 'startDate' | 'important' | 'urgent').
 * Wrapped with withNoteLock to serialize note writes and prevent race conditions.
 *
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID - Note uuid to rewrite.
 * @param {string} sortMode - Mode to sort tasks by.
 * @returns {Promise<boolean>} true if modified and saved.
 */
export async function sortTasksInNoteMarkdown(app, noteUUID, sortMode = "score") {
  return withNoteLock(noteUUID, () => _sortTasksInNoteMarkdown(app, noteUUID, sortMode));
}

