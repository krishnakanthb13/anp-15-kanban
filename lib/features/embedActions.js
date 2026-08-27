import {
  SETTINGS_KEYS,
  AUTO_COMPLETE_ON_DONE_HEADER,
  NEW_NOTE_BOARD_INCLUDES_DONE_HEADER,
  NOTE_PREFIX,
} from "../core/constants.js";
import { loadPluginSettings, savePluginSettings } from "../core/settings.js";
import {
  loadTabsConfig,
  saveTabsConfig,
  setActiveTab,
  tabById,
  createTab,
  addTab,
  removeTab,
  moveTab,
} from "../core/tabsConfig.js";
import { isValidThemeId } from "../ui/themes.js";
import {
  moveTaskToColumn,
  createTaskInColumn,
  setTaskCompleted,
  updateCardContent,
  addLabelToTask,
  sortTasksInNoteMarkdown,
} from "../api/taskOps.js";
import {
  buildColumnSpans,
  resolveSpan,
  findTaskLines,
  removeLine,
} from "../api/markdownIndex.js";
import {
  createColumn,
  renameColumn,
  deleteColumn,
  reorderColumns,
  transferColumn,
  withNoteLock,
} from "../api/columnOps.js";
import { buildTagBoard } from "../api/tagBoard.js";
import { toCardModel } from "../api/noteBoard.js";
import { createTaggedNote, openNote, openTag } from "../api/noteOps.js";
import { firstValue } from "../utils/prompt.js";

/**
 * Creates a clean card model stub for optimistic UI insertion.
 * @param {string} taskUuid
 * @param {string} content
 * @returns {Object}
 */
function createCardStub(taskUuid, content) {
  const card = toCardModel({
    uuid: taskUuid,
    content: content || "",
  });
  card.tags = [];
  card.labels = [];
  return card;
}

/**
 * Re-renders the embed with fresh state if the embed context is available.
 * @param {Object} app - The Amplenote app context.
 * @returns {Promise<boolean>} true if renderEmbed was invoked, false otherwise.
 */
async function rerender(app) {
  if (typeof app.context?.renderEmbed === "function") {
    await app.context.renderEmbed();
    return true;
  }
  return false;
}

/**
 * Proves the embed round trip: client -> onEmbedCall -> renderEmbed.
 */
export async function handlePing(app) {
  await rerender(app);
  return { ok: true };
}

/**
 * Persists the selected theme.
 * @param {Object} app
 * @param {{themeId?: string}|string} [payload]
 */
export async function handleSaveTheme(app, payload) {
  const themeId =
    payload && typeof payload.themeId === "string"
      ? payload.themeId
      : typeof payload === "string"
        ? payload
        : null;
  if (!themeId || !isValidThemeId(themeId)) return;
  await savePluginSettings(app, { theme: themeId });
}

/**
 * Persists top-bar settings/preferences to unified Kanban Settings.
 * @param {Object} app
 * @param {Object} payload
 */
export async function handleSaveSetting(app, payload) {
  if (!payload || typeof payload !== "object") return;
  await savePluginSettings(app, payload);
}

/**
 * Activates a tab and persists the choice.
 * @param {Object} app
 * @param {{tabId?: string}} [payload]
 */
export async function handleSetActiveTab(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return;
  const config = setActiveTab(await loadTabsConfig(app), tabId);
  await saveTabsConfig(app, config);
}

import { buildNoteBoard } from "../api/noteBoard.js";
import { buildNotesBoard } from "../api/notesBoard.js";

/** Builds a single board snapshot fresh from source of truth. */
export async function buildSingleBoard(app, tab) {
  if (!tab) return { kind: "note", columns: [], hasHeadings: false };
  if (tab.kind === "note" && tab.noteUUID) {
    return await buildNoteBoard(app, tab.noteUUID, { columnLimits: tab.columnLimits || {} });
  } else if (tab.kind === "tag" && tab.tag) {
    return await buildTagBoard(app, tab.tag);
  } else if (tab.kind === "notes" && tab.tag) {
    return await buildNotesBoard(app, tab.tag);
  }
  return { kind: tab.kind, columns: [], hasHeadings: false };
}

/** Refreshes the active tab's board data in-memory without iframe reload. */
export async function handleRefreshTab(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab) {
    if (payload && payload.forceRerender) await rerender(app);
    return { ok: false };
  }
  const board = await buildSingleBoard(app, tab);
  if (payload && payload.forceRerender) await rerender(app);
  return { ok: true, tabId: tab.id, board };
}

/** Refreshes all tabs' board data in-memory without iframe reload. */
export async function handleRefreshAll(app, payload) {
  const config = await loadTabsConfig(app);
  const boards = {};
  for (const tab of config.tabs) {
    try {
      boards[tab.id] = await buildSingleBoard(app, tab);
    } catch {
      boards[tab.id] = { kind: tab.kind, columns: [], hasHeadings: false };
    }
  }
  if (payload && payload.forceRerender) await rerender(app);
  return { ok: true, boards, config };
}

/* ---------------- tab management ---------------- */

export function defaultKanbanNoteName(now = new Date()) {
  const pad = (n) => (n < 10 ? "0" : "") + n;
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return `Kanban Board - ${dateStr}`;
}

/**
 * Adds a new tab via a 2-step prompt wizard:
 * Step 1: Choose board type (Existing Note / Create New Note / Tag Board)
 * Step 2: Show only the relevant follow-up field for that specific choice
 * @param {Object} app
 */
export async function handleAddTab(app) {
  const choice = firstValue(await app.prompt("Add Board Tab", {
    inputs: [
      {
        label: "Choose board type:",
        type: "radio",
        options: [
          { label: "Existing Note Board (headings as columns)", value: "note" },
          { label: "Create New Note Board (auto-creates note with columns)", value: "new_note" },
          { label: "Tag Board (notes as columns with collapsible heading sections)", value: "tag" },
          { label: "Multi-Note Board (one note per project, flat task cards)", value: "notes" },
        ],
      },
    ],
  }));
  if (!choice) return;

  let tab = null;

  if (choice === "note") {
    const noteHandle = firstValue(await app.prompt("Select Note for Board", {
      inputs: [
        {
          label: "Choose an existing note (headings will become columns):",
          type: "note",
        },
      ],
    }));
    if (!noteHandle || (!noteHandle.uuid && !noteHandle.id)) return;
    const noteUUID = noteHandle.uuid || noteHandle.id;
    tab = createTab({
      kind: "note",
      name: noteHandle.name || "Note board",
      noteUUID,
    });
  } else if (choice === "new_note") {
    const titleInput = firstValue(await app.prompt("Create New Note Board", {
      inputs: [
        {
          label: "Board title (optional — leave blank for timestamped name):",
          type: "text",
        },
      ],
    }));
    if (titleInput === null || titleInput === undefined) return;
    const title = (titleInput && String(titleInput).trim()) || defaultKanbanNoteName();
    let uuid = null;
    try {
      uuid = await app.createNote(title, ["-reports/-kanban"]);
    } catch (err) {
      console.warn("createNote with '-reports/-kanban' failed, trying fallback:", err);
      try {
        uuid = await app.createNote(title, ["reports/kanban"]);
      } catch {
        try {
          uuid = await app.createNote(title);
        } catch (createErr) {
          console.error("createNote failed completely:", createErr);
          return;
        }
      }
    }
    const cleanUUID = typeof uuid === "object" && uuid !== null ? (uuid.uuid || uuid.id) : uuid;
    if (!cleanUUID) return;

    try {
      const defaultContent = NEW_NOTE_BOARD_INCLUDES_DONE_HEADER
        ? "# To Do\n\n# In Progress\n\n# Done\n"
        : "# To Do\n\n# In Progress\n";
      await app.replaceNoteContent({ uuid: cleanUUID }, defaultContent);
    } catch (err) {
      console.warn("Failed to initialize note content for new board:", err);
    }

    tab = createTab({
      kind: "note",
      name: title,
      noteUUID: cleanUUID,
    });
  } else if (choice === "tag") {
    const tagVal = firstValue(await app.prompt("Select Tag for Board", {
      inputs: [
        {
          label: "Select or type a tag (all notes with this tag become columns):",
          type: "tags",
          limit: 1,
        },
      ],
    }));
    const tagText = Array.isArray(tagVal) ? tagVal[0] : tagVal;
    if (!tagText || !String(tagText).trim()) return;
    const clean = String(tagText).trim();
    tab = createTab({ kind: "tag", name: clean, tag: clean });
  } else if (choice === "notes") {
    const tagVal = firstValue(await app.prompt("Select Tag for Multi-Note Board", {
      inputs: [
        {
          label: "Select or type a tag (all notes with this tag become columns):",
          type: "tags",
          limit: 1,
        },
      ],
    }));
    const tagText = Array.isArray(tagVal) ? tagVal[0] : tagVal;
    if (!tagText || !String(tagText).trim()) return;
    const clean = String(tagText).trim();
    tab = createTab({ kind: "notes", name: clean, tag: clean });
  } else {
    return;
  }

  const config = addTab(await loadTabsConfig(app), tab);
  await saveTabsConfig(app, config);
  await rerender(app);
}

/**
 * Closes a tab.
 * @param {Object} app
 * @param {{tabId?: string}} [payload]
 */
export async function handleCloseTab(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return;

  const config = removeTab(await loadTabsConfig(app), tabId);
  await saveTabsConfig(app, config);
  return { ok: true, tabId };
}

/**
 * Moves a tab one position left/right.
 * @param {Object} app
 * @param {{tabId?: string, direction?: string}} [payload]
 */
export async function handleMoveTabDir(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return;
  const direction = payload.direction === "left" ? "left" : "right";

  const config = await loadTabsConfig(app);
  const index = config.tabs.findIndex(t => t.id === tabId);
  if (index === -1) return;
  const target = direction === "left" ? index - 1 : index + 1;
  if (target < 0 || target >= config.tabs.length) return;

  await saveTabsConfig(app, moveTab(config, index, target));
}

/**
 * Sets the date format used for card date chips.
 * @param {Object} app
 */
export async function handleSetDateFormat(app) {
  const settings = await loadPluginSettings(app);
  const result = await app.prompt("Date format for card chips", {
    inputs: [{
      label: "Format tokens: YYYY MM DD MMM (e.g. DD MMM YYYY):",
      type: "text",
      value: settings.dateFormat,
    }],
  });
  const fmt = firstValue(result);
  if (!fmt || !String(fmt).trim()) return { ok: false, canceled: true };

  const dateFormat = String(fmt).trim();
  await savePluginSettings(app, { dateFormat });
  return { ok: true, dateFormat, toast: "Date format: " + dateFormat };
}

/**
 * Resolves a configured tab for an action.
 * @param {Object} app
 * @param {{tabId?: string}} payload
 */
async function resolveNoteTab(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return null;
  const tab = tabById(await loadTabsConfig(app), tabId);
  if (!tab) return null;
  if (tab.kind === "note" && !tab.noteUUID) return null;
  if ((tab.kind === "tag" || tab.kind === "notes") && !tab.tag) return null;
  return tab;
}

async function resolveCurrentBoardTab(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (tab) return tab;
  const config = await loadTabsConfig(app);
  const targetId = payload?.tabId || config.activeTabId;
  return config.tabs.find(t => t.id === targetId) || null;
}

async function isCompletedColumn(app, noteUUID, columnId, columnName) {
  const isSystemCompleted = String(columnId || "").toLowerCase() === "completed" || String(columnName || "").trim().toLowerCase() === "completed";
  if (isSystemCompleted) return true;
  if (!AUTO_COMPLETE_ON_DONE_HEADER) return false;

  if (columnName && /^(done|completed|finished|closed|archive)/i.test(String(columnName).trim())) {
    return true;
  }
  if (app && noteUUID) {
    try {
      const markdown = await app.getNoteContent({ uuid: noteUUID });
      const { columns } = buildColumnSpans(markdown);
      const targetSpan = resolveSpan(columns, columnId, columnName);
      if (targetSpan && /^(done|completed|finished|closed|archive)/i.test(String(targetSpan.name).trim())) {
        return true;
      }
    } catch {}
  }
  return false;
}

/**
 * Moves a card between columns, headings, or notes without flashing the embed.
 * @param {Object} app
 * @param {{tabId?: string, cardId?: string, toColumnId?: string, toColumnName?: string, toSectionId?: string, toSectionName?: string}} [payload]
 */
export async function handleMoveCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.cardId || !payload.toColumnId) return { ok: false };

  if (tab.kind === "tag" || tab.kind === "notes") {
    const isPrefixed = String(payload.toColumnId).startsWith(NOTE_PREFIX);
    const targetUUID = isPrefixed
      ? payload.toColumnId.slice(NOTE_PREFIX.length)
      : (String(payload.toColumnId).length > 1 ? payload.toColumnId : null);
    if (!targetUUID) return { ok: false };

    const task = await app.getTask(payload.cardId);
    if (!task) return { ok: false };

    if (task.noteUUID && task.noteUUID !== targetUUID) {
      // 1. Remove task line from source note markdown (with mutex lock on source note)
      try {
        await withNoteLock(task.noteUUID, async () => {
          const sourceMarkdown = await app.getNoteContent({ uuid: task.noteUUID });
          if (sourceMarkdown) {
            const srcLines = sourceMarkdown.split("\n");
            const [srcIdx] = findTaskLines(srcLines, [{ uuid: payload.cardId, content: task.content }]).values();
            if (srcIdx !== undefined && srcIdx >= 0) {
              const nextSrc = removeLine(srcLines, srcIdx);
              await app.replaceNoteContent({ uuid: task.noteUUID }, nextSrc.join("\n"));
            }
          }
        });
      } catch (err) {
        console.error("Failed to remove task from source note:", err);
      }

      // 2. Call app.updateTask to move the task entity to target note
      try {
        await app.updateTask(payload.cardId, { noteUUID: targetUUID });
      } catch (err) {
        console.error("Failed to update task noteUUID:", err);
      }

      // 3. Relocate under target section / relative position in target note
      const isDoneSection = (String(payload.toSectionId || "").toLowerCase() === "completed" || String(payload.toSectionName || "").trim().toLowerCase() === "completed" || String(payload.toColumnId || "").toLowerCase() === "completed" || String(payload.toColumnName || "").trim().toLowerCase() === "completed") || (AUTO_COMPLETE_ON_DONE_HEADER && (/^(done|completed|finished|closed|archive)/i.test(String(payload.toSectionName || "").trim()) || /^(done|completed|finished|closed|archive)/i.test(String(payload.toColumnName || "").trim())));
      if (isDoneSection) {
        await setTaskCompleted(app, payload.cardId, true);
      } else {
        try {
          await moveTaskToColumn(app, targetUUID, payload.cardId, {
            columnId: payload.toSectionId,
            columnName: payload.toSectionName,
            targetCardId: payload.targetCardId,
            position: payload.position,
          });
        } catch (err) {
          console.error("Failed to relocate task in target note:", err);
        }
        await setTaskCompleted(app, payload.cardId, false);
      }
      if (payload.forceRerender) await rerender(app);
      return {
        ok: true,
        newCardId: payload.cardId,
        taskCompleted: isDoneSection,
        completedAt: isDoneSection ? Math.floor(Date.now() / 1000) : null,
      };
    } else if (payload.toSectionId || payload.targetCardId) {
      // Same note: move between heading sections or reorder relative to targetCardId
      const isDoneSection = (String(payload.toSectionId || "").toLowerCase() === "completed" || String(payload.toSectionName || "").trim().toLowerCase() === "completed" || String(payload.toColumnId || "").toLowerCase() === "completed" || String(payload.toColumnName || "").trim().toLowerCase() === "completed") || (AUTO_COMPLETE_ON_DONE_HEADER && (/^(done|completed|finished|closed|archive)/i.test(String(payload.toSectionName || "").trim()) || /^(done|completed|finished|closed|archive)/i.test(String(payload.toColumnName || "").trim())));
      if (isDoneSection) {
        await setTaskCompleted(app, payload.cardId, true);
      } else {
        await moveTaskToColumn(app, targetUUID, payload.cardId, {
          columnId: payload.toSectionId,
          columnName: payload.toSectionName,
          targetCardId: payload.targetCardId,
          position: payload.position,
        });
        await setTaskCompleted(app, payload.cardId, false);
      }
      if (payload.forceRerender) await rerender(app);
      return {
        ok: true,
        taskCompleted: isDoneSection,
        completedAt: isDoneSection ? Math.floor(Date.now() / 1000) : null,
      };
    }
    if (payload.forceRerender) await rerender(app);
    return { ok: true };
  }

  const doneTarget = await isCompletedColumn(app, tab.noteUUID, payload.toColumnId, payload.toColumnName);
  const status = await moveTaskToColumn(app, tab.noteUUID, payload.cardId, {
    columnId: payload.toColumnId,
    columnName: payload.toColumnName,
    targetCardId: payload.targetCardId,
    position: payload.position,
  });

  if (status === "moved") {
    await setTaskCompleted(app, payload.cardId, doneTarget);
  }

  if (payload.forceRerender) {
    await rerender(app);
  }

  return {
    ok: true,
    status,
    taskCompleted: doneTarget,
    completedAt: doneTarget ? Math.floor(Date.now() / 1000) : null,
  };
}

/**
 * Creates a new card in a column or section.
 * @param {Object} app
 * @param {{tabId?: string, columnId?: string, sectionId?: string}} [payload]
 */
export async function handleCreateCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload?.columnId) return { ok: false };

  if (tab.kind === "tag" || tab.kind === "notes") {
    const targetUUID = String(payload.columnId).startsWith(NOTE_PREFIX)
      ? payload.columnId.slice(NOTE_PREFIX.length)
      : payload.columnId;
    if (!targetUUID) return { ok: false };

    const content = firstValue(await app.prompt("New task", {
      inputs: [{ label: "Task content (markdown):", type: "text" }],
    }));
    if (!content) return { ok: false, canceled: true };

    const targetSection = payload.sectionId
      ? { columnId: payload.sectionId, columnName: payload.sectionName }
      : { columnId: "unsorted", columnName: "Unsorted" };

    const taskUuid = await createTaskInColumn(app, targetUUID, targetSection, content);
    const board = await buildSingleBoard(app, tab);
    if (taskUuid && board && Array.isArray(board.columns)) {
      const alreadyInBoard = board.columns.some(col =>
        (col.cards || []).some(c => c.id === taskUuid || c.uuid === taskUuid) ||
        (col.sections || []).some(sec => (sec.cards || []).some(c => c.id === taskUuid || c.uuid === taskUuid))
      );
      if (!alreadyInBoard) {
        const targetCol = board.columns.find(c => c.id === payload.columnId || c.noteUUID === targetUUID) || board.columns[0];
        if (targetCol) {
          const newCard = createCardStub(taskUuid, content);
          if (payload.sectionId && payload.sectionId !== "unsorted" && Array.isArray(targetCol.sections)) {
            const sec = targetCol.sections.find(s => s.id === payload.sectionId) || targetCol.sections[0];
            if (sec) {
              sec.cards = sec.cards || [];
              sec.cards.unshift(newCard);
            }
          } else if (Array.isArray(targetCol.sections)) {
            let unsortedSec = targetCol.sections.find(s => s.id === "unsorted");
            if (!unsortedSec) {
              unsortedSec = {
                id: "unsorted",
                name: "Unsorted",
                level: null,
                cards: [],
              };
              targetCol.sections.unshift(unsortedSec);
            }
            unsortedSec.cards = unsortedSec.cards || [];
            unsortedSec.cards.unshift(newCard);
          } else {
            targetCol.cards = targetCol.cards || [];
            targetCol.cards.unshift(newCard);
          }
        }
      }
    }
    if (payload && payload.forceRerender) await rerender(app);
    return { ok: true, tabId: tab.id, board, toast: "Task added" };
  }

  const result = await app.prompt("New card", {
    inputs: [{ label: "Card content (markdown):", type: "text" }],
  });
  const content = firstValue(result);
  if (!content) return { ok: false, canceled: true };

  const taskUuid = await createTaskInColumn(app, tab.noteUUID, { columnId: payload.columnId, columnName: payload.columnName }, content);
  const board = await buildSingleBoard(app, tab);
  if (taskUuid && board && Array.isArray(board.columns)) {
    const alreadyInBoard = board.columns.some(col => (col.cards || []).some(c => c.id === taskUuid || c.uuid === taskUuid));
    if (!alreadyInBoard) {
      let targetCol = board.columns.find(c => c.id === payload.columnId || c.name === payload.columnName);
      if (!targetCol && (payload.columnId === "unsorted" || payload.columnName === "Unsorted")) {
        targetCol = {
          id: "unsorted",
          name: "Unsorted",
          level: null,
          cards: [],
        };
        board.columns.unshift(targetCol);
      } else if (!targetCol) {
        targetCol = board.columns[0];
      }
      if (targetCol) {
        targetCol.cards = targetCol.cards || [];
        targetCol.cards.unshift(createCardStub(taskUuid, content));
      }
    }
  }
  if (payload && payload.forceRerender) await rerender(app);
  return { ok: true, tabId: tab.id, board, toast: "Task added" };
}

/**
 * Opens a card's note in the editor.
 * @param {Object} app
 * @param {{cardId?: string, noteUUID?: string}} [payload]
 */
export async function handleOpenCard(app, payload) {
  const noteUUID = payload?.noteUUID || payload?.cardId;
  if (!noteUUID) return;
  await openNote(app, noteUUID);
}

/**
 * Full task editing prompt matching all capabilities of kanban-old.js:
 * - Markdown Content
 * - Important (checkbox)
 * - Urgent (checkbox)
 * - Move to Note (note selector)
 * - Move to Section / Heading (dropdown)
 * - Score (number/string)
 * - Status (radio: keep / started / completed / dismissed / reopen)
 * @param {Object} app
 * @param {{cardId?: string}} [payload]
 */
export async function handleEditTaskDetails(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;

  const task = await app.getTask(cardId);
  if (!task) return;

  const isDone = !!(task.completedAt || task.completed || payload?.isCompleted || payload?.completedAt);
  const isDismissed = !!task.dismissedAt;

  let sections = [];
  try {
    sections = (await app.getNoteSections({ uuid: task.noteUUID })) || [];
  } catch {
    sections = [];
  }

  const sectionOptions = [
    { label: "Top / Unsorted", value: "__top__" },
    ...sections.filter(s => s?.heading?.text).map(s => ({
      label: s.heading.text,
      value: s.heading.text,
    })),
  ];

  if (isDone || isDismissed) {
    // Completed Task Dialog
    const result = await app.prompt("Completed Task Details", {
      inputs: [
        { label: "Task content (markdown):", type: "text", value: task.content || "" },
        { label: "Relocate under Heading (on reopen):", type: "select", options: sectionOptions },
        {
          label: "Change Status (optional):",
          type: "select",
          options: [
            { label: "-- None (keep status) --", value: "" },
            { label: "Reopen / Mark Active", value: "reopen" },
            { label: isDismissed ? "Un-dismiss task (reopen)" : "Dismiss / Archive", value: "dismiss" },
          ],
        },
        { label: "Important:", type: "checkbox", value: !!task.important },
        { label: "Urgent:", type: "checkbox", value: !!task.urgent },
      ],
    });
    if (!result) return { ok: false, canceled: true };

    const [content, targetSection, statusChoice, important, urgent] = result;
    const updates = {};
    if (content !== undefined && content !== task.content) {
      updates.content = String(content);
    }
    if (typeof important === "boolean" && important !== !!task.important) {
      updates.important = important;
    }
    if (typeof urgent === "boolean" && urgent !== !!task.urgent) {
      updates.urgent = urgent;
    }
    const now = Math.floor(Date.now() / 1000);
    if (statusChoice === "reopen") {
      updates.completedAt = null;
      updates.dismissedAt = null;
    } else if (statusChoice === "dismiss") {
      updates.dismissedAt = isDismissed ? null : now;
      updates.completedAt = null;
    }

    if (Object.keys(updates).length > 0) {
      await app.updateTask(cardId, updates);
    }

    if (statusChoice === "reopen" && targetSection && targetSection !== "__top__") {
      try {
        await moveTaskToColumn(app, task.noteUUID, cardId, { columnName: targetSection });
      } catch (err) {
        console.error("Failed to relocate reopened task:", err);
      }
    }

    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    if (payload.forceRerender) await rerender(app);
    return { ok: true, tabId: tab?.id, board, toast: "Task updated" };
  }

  // Active Task Dialog
  const result = await app.prompt("Edit Task Details", {
    inputs: [
      { label: "Task content (markdown):", type: "text", value: task.content || "" },
      { label: "Important:", type: "checkbox", value: !!task.important },
      { label: "Urgent:", type: "checkbox", value: !!task.urgent },
      { label: "Move to Note (optional):", type: "note", value: task.noteUUID },
      { label: "Move to Section / Heading:", type: "select", options: sectionOptions },
      { label: "Score:", type: "string", value: task.score !== undefined && task.score !== null ? String(task.score) : "" },
      {
        label: "Change Status (optional):",
        type: "select",
        options: [
          { label: "-- None (keep status) --", value: "" },
          { label: "Started (startAt now)", value: "started" },
          { label: "Mark as Completed", value: "completed" },
          { label: "Dismiss / Archive", value: "dismissed" },
        ],
      },
    ],
  });

  if (!result) return;

  const [content, important, urgent, targetNote, targetSection, scoreStr, statusChoice] = result;
  const updates = {};

  if (content !== undefined && content !== task.content) {
    updates.content = String(content);
  }
  if (typeof important === "boolean" && important !== !!task.important) {
    updates.important = important;
  }
  if (typeof urgent === "boolean" && urgent !== !!task.urgent) {
    updates.urgent = urgent;
  }
  const parsedScore = parseFloat(scoreStr);
  if (!Number.isNaN(parsedScore) && parsedScore !== task.score) {
    updates.score = parsedScore;
  }

  const now = Math.floor(Date.now() / 1000);
  if (statusChoice === "started") {
    updates.startAt = now;
  } else if (statusChoice === "completed") {
    updates.completedAt = now;
    updates.dismissedAt = null;
  } else if (statusChoice === "dismissed") {
    updates.dismissedAt = now;
    updates.completedAt = null;
  }

  const targetNoteUUID = targetNote?.uuid || task.noteUUID;
  if (targetNoteUUID && targetNoteUUID !== task.noteUUID) {
    try {
      const sourceMarkdown = await app.getNoteContent({ uuid: task.noteUUID });
      if (sourceMarkdown) {
        const srcLines = sourceMarkdown.split("\n");
        const [srcIdx] = findTaskLines(srcLines, [{ uuid: cardId, content: task.content }]).values();
        if (srcIdx !== undefined && srcIdx >= 0) {
          const nextSrc = removeLine(srcLines, srcIdx);
          await app.replaceNoteContent({ uuid: task.noteUUID }, nextSrc.join("\n"));
        }
      }
    } catch (err) {
      console.error("Failed to remove task from source note:", err);
    }
    updates.noteUUID = targetNoteUUID;
  }

  if (Object.keys(updates).length > 0) {
    await app.updateTask(cardId, updates);
  }

  if (targetSection && targetSection !== "__top__") {
    try {
      await moveTaskToColumn(app, targetNoteUUID, cardId, { columnName: targetSection });
    } catch (err) {
      console.error("Failed to relocate task to heading section:", err);
    }
  } else if (targetNoteUUID && targetNoteUUID !== task.noteUUID) {
    try {
      await moveTaskToColumn(app, targetNoteUUID, cardId, { columnId: "unsorted" });
    } catch (err) {
      console.error("Failed to insert task in target note:", err);
    }
  }

  const tab = await resolveCurrentBoardTab(app, payload);
  const board = tab ? await buildSingleBoard(app, tab) : null;
  return { ok: true, tabId: tab?.id, board, toast: "Task updated" };
}

/**
 * Opens task editor on card click.
 * @param {Object} app
 * @param {{cardId?: string}} [payload]
 */
export async function handleEditCard(app, payload) {
  return handleEditTaskDetails(app, payload);
}

/* ---------------- column & header management ---------------- */

async function resolveNoteBoardTab(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  return tab && tab.kind === "note" ? tab : null;
}

async function resolveHeading(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab) return null;

  let noteUUID = payload?.noteUUID || null;
  if (!noteUUID && payload?.columnId && String(payload.columnId).startsWith(NOTE_PREFIX)) {
    noteUUID = payload.columnId.slice(NOTE_PREFIX.length);
  }
  if (!noteUUID && tab.kind === "note" && tab.noteUUID) {
    noteUUID = tab.noteUUID;
  }
  if (!noteUUID) return null;

  const headingId = payload?.sectionId || payload?.columnId;
  if (!headingId) return null;

  let markdown = "";
  try {
    markdown = (await app.getNoteContent({ uuid: noteUUID })) || "";
  } catch {
    return null;
  }

  const { columns } = buildColumnSpans(markdown);
  const span = resolveSpan(columns, headingId);
  if (!span) return null;

  return { tab, noteUUID, columnId: span.id, columnName: span.name, span, columns };
}

const resolveColumn = resolveHeading;

export async function handleCreateColumn(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab) return { ok: false };

  let noteUUID = payload?.noteUUID || null;
  if (!noteUUID && payload?.columnId && String(payload.columnId).startsWith(NOTE_PREFIX)) {
    noteUUID = payload.columnId.slice(NOTE_PREFIX.length);
  }
  if (!noteUUID && tab.kind === "note") {
    noteUUID = tab.noteUUID;
  }
  if (!noteUUID) return { ok: false };

  const result = await app.prompt("New Header / Column", {
    inputs: [
      { label: "Header name:", type: "text" },
      {
        label: "Heading type / level (1, 2, 3):",
        type: "select",
        options: [
          { label: "H1 (# Large)", value: "1" },
          { label: "H2 (## Medium)", value: "2" },
          { label: "H3 (### Small)", value: "3" },
        ],
        value: "2",
      },
    ],
  });
  if (!result) return { ok: false, canceled: true };
  const [name, levelRaw] = Array.isArray(result) ? result : [result, null];
  if (!name || !String(name).trim()) return { ok: false, canceled: true };

  const level = levelRaw ? (parseInt(String(levelRaw), 10) || null) : null;
  const created = await createColumn(app, noteUUID, String(name).trim(), level);
  if (created) {
    const board = await buildSingleBoard(app, tab);
    return { ok: true, tabId: tab.id, board, toast: "Header created", showEmpty: true };
  }
  return { ok: false, error: "Could not create header" };
}

/**
 * Normalizes tags from prompt results (arrays or comma-separated strings) up to a limit of 10.
 * @param {any} tagsInput
 * @param {string} [defaultTag]
 * @returns {string[]}
 */
export function normalizeTagList(tagsInput, defaultTag = "") {
  if (Array.isArray(tagsInput)) {
    const list = tagsInput.map(item => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") return item.value || item.name || item.label || item.tag || "";
      return "";
    }).map(t => String(t || "").replace(/^#/, "").trim()).filter(Boolean);
    return list.length ? list.slice(0, 10) : (defaultTag ? [defaultTag.replace(/^#/, "").trim()] : []);
  }
  if (typeof tagsInput === "string") {
    const list = tagsInput
      .split(/[,;\s]+/)
      .map(t => t.replace(/^#/, "").trim())
      .filter(Boolean);
    return list.length ? list.slice(0, 10) : (defaultTag ? [defaultTag.replace(/^#/, "").trim()] : []);
  }
  return defaultTag ? [defaultTag.replace(/^#/, "").trim()] : [];
}

export async function handleCreateColumnNote(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab) return;

  const defaultTag = tab.tag ? tab.tag : "";
  const tagLabel = defaultTag ? `#${defaultTag}` : "new note";
  const result = await app.prompt(`Create New Note in ${tagLabel}`, {
    inputs: [
      { label: "Note title:", type: "text" },
      {
        label: "Tag(s) to assign:",
        type: "tags",
        value: defaultTag,
        limit: 10,
      },
    ],
  });
  if (!result) return;
  const [title, tagsRaw] = Array.isArray(result) ? result : [result, defaultTag];
  if (!title || !String(title).trim()) return;

  const tags = normalizeTagList(tagsRaw, defaultTag);

  const noteUUID = await createTaggedNote(app, String(title).trim(), tags);
  if (noteUUID) {
    const board = await buildSingleBoard(app, tab);
    return { ok: true, tabId: tab.id, board, toast: "Note created" };
  }
}

export async function handleRenameColumn(app, payload) {
  const resolved = await resolveHeading(app, payload);
  if (!resolved) return;
  const { tab, noteUUID, columnId, columnName } = resolved;

  const result = await app.prompt("Rename Column / Header", {
    inputs: [{ label: "Name:", type: "text", value: columnName }],
  });
  const name = firstValue(result);
  if (!name || !String(name).trim() || String(name) === columnName) return;

  const renamed = await renameColumn(app, noteUUID, columnId, name);
  if (renamed) {
    const board = await buildSingleBoard(app, tab);
    return { ok: true, tabId: tab.id, board, toast: "Column renamed" };
  }
}

export async function handleDeleteColumn(app, payload) {
  const resolved = await resolveHeading(app, payload);
  if (!resolved) return;
  const { tab, noteUUID, columnId, columnName } = resolved;

  const result = await app.prompt(`Delete "${columnName}"?`, {
    inputs: [
      {
        label: "I understand: the heading is removed and its tasks move to the previous header.",
        type: "checkbox",
        value: false,
      },
    ],
  });
  if (firstValue(result) !== true) return;

  const deleted = await deleteColumn(app, noteUUID, columnId);
  if (deleted) {
    const board = await buildSingleBoard(app, tab);
    return { ok: true, tabId: tab.id, board, toast: "Column deleted" };
  }
}

export async function handleMoveColumn(app, payload) {
  const resolved = await resolveHeading(app, payload);
  if (!resolved) return;
  const { noteUUID, columnId, columns } = resolved;
  const direction = payload.direction === "left" || payload.direction === "up" ? "left" : "right";

  const index = columns.findIndex(c => c.id === String(columnId));
  if (index === -1) return;

  const target = direction === "left" ? index - 1 : index + 1;
  if (target < 0 || target >= columns.length) return;

  const order = columns.map(c => c.id);
  [order[index], order[target]] = [order[target], order[index]];

  const moved = await reorderColumns(app, noteUUID, order);
  if (moved) {
    const board = await buildSingleBoard(app, resolved.tab);
    return { ok: true, board, tabId: resolved.tab.id };
  }
}

export async function handleSetWipLimit(app, payload) {
  const resolved = await resolveHeading(app, payload);
  if (!resolved) return;
  const { tab, columnName } = resolved;

  const current = (tab.columnLimits && tab.columnLimits[columnName]) || "";
  const result = await app.prompt(`WIP limit for "${columnName}"`, {
    inputs: [{
      label: "Max cards (0 or blank = no limit):",
      type: "string",
      value: String(current),
    }],
  });
  const raw = firstValue(result);
  if (raw === null || raw === undefined) return;

  const parsed = parseInt(String(raw).trim(), 10);
  const config = await loadTabsConfig(app);
  const storedTab = tabById(config, tab.id);
  if (!storedTab) return;

  const limits = { ...(storedTab.columnLimits || {}) };
  if (Number.isInteger(parsed) && parsed > 0) limits[columnName] = parsed;
  else delete limits[columnName];
  storedTab.columnLimits = limits;

  await saveTabsConfig(app, config);
  const board = await buildSingleBoard(app, storedTab);
  return { ok: true, tabId: tab.id, board, columnLimits: limits };
}

/**
 * Formats a unix timestamp (seconds) to local YYYY-MM-DD for date picker inputs.
 * Avoids UTC timezone conversion shift bugs.
 * @param {number|null} unixSeconds
 * @returns {string}
 */
export function formatLocalIsoDate(unixSeconds) {
  if (!unixSeconds || typeof unixSeconds !== "number" || Number.isNaN(unixSeconds)) return "";
  const d = new Date(unixSeconds * 1000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Reliably parses any date input from Amplenote prompt (numeric epoch, ISO string,
 * YYYY-MM-DD, Date object, etc.) to Unix epoch seconds.
 * Returns null if blank or invalid.
 * @param {any} val
 * @returns {number|null}
 */
export function parseDateToUnixSeconds(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") {
    if (Number.isNaN(val) || val <= 0) return null;
    return val > 1e11 ? Math.floor(val / 1000) : Math.floor(val);
  }
  if (val instanceof Date) {
    const ms = val.getTime();
    return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
  }
  if (typeof val === "object") {
    if (val.value !== undefined) return parseDateToUnixSeconds(val.value);
    if (val.date !== undefined) return parseDateToUnixSeconds(val.date);
    if (val.startAt !== undefined) return parseDateToUnixSeconds(val.startAt);
  }
  const str = String(val).trim();
  if (!str) return null;

  // Numeric string (seconds or milliseconds)
  if (/^\d{9,14}$/.test(str)) {
    const num = Number(str);
    return num > 1e11 ? Math.floor(num / 1000) : Math.floor(num);
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const ymd = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymd) {
    const [, y, m, d] = ymd;
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), 0, 0, 0);
    const ms = date.getTime();
    return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
  }

  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return Math.floor(parsed.getTime() / 1000);
  }

  return null;
}

/**
 * Parses time strings (e.g. "14:30", "2:30pm", "9am", "9:00", "09:30") into { hours, minutes }.
 * @param {string} timeStr
 * @returns {{hours: number, minutes: number}|null}
 */
export function parseTimeToHoursMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const s = timeStr.trim().toLowerCase();
  if (!s) return null;

  const m = s.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;

  let hours = parseInt(m[1], 10);
  const minutes = m[2] ? parseInt(m[2], 10) : 0;
  const meridian = m[3];

  if (meridian === "pm" && hours < 12) hours += 12;
  if (meridian === "am" && hours === 12) hours = 0;

  if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
    return { hours, minutes };
  }
  return null;
}

/**
 * Returns "HH:MM" (local time) if unix timestamp has a non-midnight time component.
 * @param {number|null} unixSeconds
 * @returns {string}
 */
export function formatLocalTimeStr(unixSeconds) {
  if (!unixSeconds || typeof unixSeconds !== "number" || Number.isNaN(unixSeconds)) return "";
  const d = new Date(unixSeconds * 1000);
  const hr = d.getHours();
  const min = d.getMinutes();
  if (hr === 0 && min === 0) return "";
  return `${String(hr).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/**
 * Combines date input (epoch / ISO) and optional time string into UTC epoch seconds.
 * @param {any} dateVal
 * @param {string} [timeStr]
 * @returns {number|null}
 */
export function combineDateAndTime(dateVal, timeStr) {
  const baseSeconds = parseDateToUnixSeconds(dateVal);
  if (!baseSeconds) return null;

  if (!timeStr || typeof timeStr !== "string" || !timeStr.trim()) {
    return baseSeconds;
  }

  const parsedTime = parseTimeToHoursMinutes(timeStr);
  if (!parsedTime) return baseSeconds;

  const d = new Date(baseSeconds * 1000);
  d.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

/**
 * Appends a note link to task content if not already present.
 * @param {string} content - Raw task content markdown
 * @param {string} noteName - Note title
 * @param {string} noteUUID - Note uuid
 * @returns {string} Updated markdown with note link appended
 */
export function linkNoteInTaskContent(content, noteName, noteUUID) {
  if (!noteUUID) return content || "";
  const name = String(noteName || "Note").trim();
  const noteLink = `[${name}](https://www.amplenote.com/notes/${noteUUID})`;
  const text = String(content || "").trim();

  // If the task content already contains this note link, don't duplicate
  if (text.includes(`https://www.amplenote.com/notes/${noteUUID}`)) {
    return text;
  }

  return text ? `${text} ${noteLink}` : noteLink;
}

export async function handleCardMenu(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;

  const task = await app.getTask(cardId);
  if (!task) return;

  const isDone = !!(task.completedAt || task.completed || payload?.isCompleted || payload?.completedAt);
  const isDismissed = !!task.dismissedAt;

  const options = isDone || isDismissed ? [
    { label: "Reopen task (mark active)", value: "uncomplete" },
    { label: isDismissed ? "Un-dismiss task (reopen)" : "Dismiss / Archive task", value: "dismiss" },
    { label: "Edit task details (full dialog)", value: "edit_details" },
    { label: "Add note link", value: "link_note" },
    { label: "Create note from card", value: "note" },
  ] : [
    { label: "Mark as completed", value: "complete" },
    { label: "Edit task details (full dialog)", value: "edit_details" },
    { label: "Set start date / time", value: "date" },
    { label: "Snooze / Hide Until (set date)", value: "snooze" },
    { label: "Schedule Time Block (start & end time)", value: "timeblock" },
    { label: "Add note link", value: "link_note" },
    { label: "Create note from card", value: "note" },
  ];

  const choice = firstValue(await app.prompt(isDone || isDismissed ? "Completed Card Actions" : "Card Actions", {
    inputs: [{
      label: "Choose action:",
      type: "radio",
      options,
    }],
  }));
  if (!choice) return;

  if (choice === "complete") {
    await app.updateTask(cardId, { completedAt: Math.floor(Date.now() / 1000), dismissedAt: null });
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: "Task completed" };
  }

  if (choice === "uncomplete") {
    await app.updateTask(cardId, { completedAt: null, dismissedAt: null });
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: "Task reopened" };
  }

  if (choice === "dismiss") {
    await app.updateTask(cardId, { dismissedAt: isDismissed ? null : Math.floor(Date.now() / 1000), completedAt: null });
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: isDismissed ? "Task reopened" : "Task dismissed" };
  }

  if (choice === "edit_details") {
    return await handleEditTaskDetails(app, {
      cardId,
      tabId: payload?.tabId,
      isCompleted: isDone,
      completedAt: task.completedAt || payload?.completedAt,
    });
  }

  if (choice === "link_note" || choice === "label") {
    const handle = firstValue(await app.prompt("Add Note Link", {
      inputs: [{ label: "Pick a note to link:", type: "note" }],
    }));
    if (!handle) return;

    const noteUUID = handle.uuid || handle.value || (typeof handle === "string" ? handle : null);
    const noteName = handle.name || handle.label || "Note";
    if (!noteUUID) return;

    const currentContent = String(task.content || "").trim();
    const newContent = linkNoteInTaskContent(currentContent, noteName, noteUUID);

    if (newContent !== currentContent) {
      await app.updateTask(cardId, { content: newContent });
    }

    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: "Note link added" };
  }

  if (choice === "date") {
    const currentVal = (typeof task.startAt === "number" && task.startAt > 0) ? Math.floor(task.startAt) : null;
    const currentTime = formatLocalTimeStr(task.startAt);
    const result = await app.prompt("Set Start Date & Time", {
      inputs: [
        { label: "Start date (blank clears):", type: "date", value: currentVal },
        { label: "Start time (optional, e.g. 14:30 or 2:30 PM):", type: "string", value: currentTime, placeholder: "HH:MM" },
      ],
    });
    if (result === null || result === undefined) return;
    const [dateRaw, timeRaw] = Array.isArray(result) ? result : [result, ""];
    const startAt = combineDateAndTime(dateRaw, timeRaw);
    await app.updateTask(cardId, { startAt });
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: "Date updated" };
  }

  if (choice === "snooze") {
    const currentVal = (typeof task.hideUntil === "number" && task.hideUntil > 0) ? Math.floor(task.hideUntil) : null;
    const currentTime = formatLocalTimeStr(task.hideUntil);
    const result = await app.prompt("Snooze / Hide Until", {
      inputs: [
        { label: "Hide task until date (blank clears snooze):", type: "date", value: currentVal },
        { label: "Hide until time (optional, e.g. 14:30 or 2:30 PM):", type: "string", value: currentTime, placeholder: "HH:MM" },
      ],
    });
    if (result === null || result === undefined) return;
    const [dateRaw, timeRaw] = Array.isArray(result) ? result : [result, ""];
    const hideUntil = combineDateAndTime(dateRaw, timeRaw);
    await app.updateTask(cardId, { hideUntil });
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: "Task snoozed" };
  }

  if (choice === "timeblock") {
    const sVal = (typeof task.startAt === "number" && task.startAt > 0) ? Math.floor(task.startAt) : null;
    const sTime = formatLocalTimeStr(task.startAt);
    const eVal = (typeof task.endAt === "number" && task.endAt > 0) ? Math.floor(task.endAt) : null;
    const eTime = formatLocalTimeStr(task.endAt);
    const res = await app.prompt("Schedule Time Block", {
      inputs: [
        { label: "Start Date:", type: "date", value: sVal },
        { label: "Start Time (e.g. 10:00 or 10am):", type: "string", value: sTime, placeholder: "10:00" },
        { label: "End Date:", type: "date", value: eVal },
        { label: "End Time (e.g. 11:30 or 11:30am):", type: "string", value: eTime, placeholder: "11:30" },
      ],
    });
    if (!res) return;
    const [sDate, sT, eDate, eT] = res;
    const startAt = combineDateAndTime(sDate, sT);
    const endAt = combineDateAndTime(eDate, eT);
    await app.updateTask(cardId, { startAt, endAt });
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: "Timeblock scheduled" };
  }

  if (choice === "note") {
    const defaultTitle = String(task.content || "").replace(/\[\[[^\]]+\]\]/g, "").replace(/\[[^\]]+\]\([^)]+\)/g, "").replace(/\s+/g, " ").trim().slice(0, 80) || "Note from card";
    const promptRes = await app.prompt("Create Note from Card", {
      inputs: [
        { label: "Note Title:", type: "text", value: defaultTitle },
      ],
    });
    const title = firstValue(promptRes) || defaultTitle;
    if (!title || !title.trim()) return;

    const uuid = await app.createNote(title.trim(), []);
    if (!uuid) return;

    const noteLink = `[${title.trim()}](https://www.amplenote.com/notes/${uuid})`;
    await app.updateTask(cardId, { content: noteLink });
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: "Note created from card" };
  }
}

export async function handleSaveSortToNote(app, payload) {
  const tabId = payload && payload.tabId;
  const sortMode = payload && payload.sortMode;
  if (!tabId || !sortMode || sortMode === "none") {
    await app.alert("Select a valid sort mode (Score, Date, Important, or Urgent) before saving to note.");
    return;
  }
  const config = await loadTabsConfig(app);
  const tab = tabById(config, tabId);
  if (!tab || tab.kind !== "note" || !tab.noteUUID) {
    await app.alert("Saving sort order to note markdown is only supported on Note boards.");
    return;
  }

  const confirmed = firstValue(await app.prompt("Save Sort Order to Note", {
    inputs: [{
      label: `Re-order task items in the note markdown according to "${sortMode}"? (This modifies note content)`,
      type: "checkbox",
      value: true,
    }],
  }));
  if (!confirmed) return;

  const ok = await sortTasksInNoteMarkdown(app, tab.noteUUID, sortMode);
  if (ok) {
    await app.alert(`Task order sorted by "${sortMode}" saved to note!`);
    const board = await buildSingleBoard(app, tab);
    return { ok: true, tabId: tab.id, board };
  }
}

export async function handleGlobalSearch(app, payload) {
  const query = payload && typeof payload.query === "string" ? payload.query.trim() : "";
  if (!query) return;

  const results = (await app.searchNotes(query)) || [];
  if (!results.length) {
    await app.alert(`No notes found for "${query}"`);
    return;
  }

  const options = results.slice(0, 20).map(n => ({ label: n.name || n.uuid, value: n.uuid }));
  const picked = firstValue(await app.prompt(`Results for "${query}"`, {
    inputs: [{ label: `${results.length} matching note(s) - pick one to open:`, type: "select", options }],
  }));
  if (!picked) return;
  await openNote(app, picked);
}

export async function handleMoveColumnToTab(app, payload) {
  const resolved = await resolveHeading(app, payload);
  if (!resolved) return;
  const { tab, noteUUID, columnId, columnName } = resolved;

  const config = await loadTabsConfig(app);
  let options = [];
  if (tab.kind === "tag" || tab.kind === "notes") {
    const tagNotes = (await app.filterNotes({ tag: tab.tag })) || [];
    options = tagNotes
      .filter(n => n.uuid !== noteUUID)
      .map(n => ({ label: n.name || "Untitled note", value: n.uuid }));
  } else {
    options = config.tabs
      .filter(t => t.kind === "note" && t.noteUUID && t.id !== tab.id)
      .map(t => ({ label: t.name, value: t.id }));
  }

  if (!options.length) {
    await app.alert("No other notes or note-board tabs to move this header to.");
    return;
  }

  const picked = firstValue(await app.prompt(`Move "${columnName}" to another board`, {
    inputs: [{
      label: "Target tab / note:",
      type: "select",
      options,
    }],
  }));
  if (!picked) return;

  const targetTab = tabById(config, picked);
  const targetUUID = (targetTab && targetTab.noteUUID) ? targetTab.noteUUID : picked;
  if (!targetUUID) return;

  const confirmed = firstValue(await app.prompt(`Move "${columnName}" to selected destination?`, {
    inputs: [{
      label: "I understand: the heading and its tasks move to the other note.",
      type: "checkbox",
      value: false,
    }],
  }));
  if (confirmed !== true) return;

  const status = await transferColumn(app, noteUUID, columnId, targetUUID);
  if (status === "moved") {
    const board = await buildSingleBoard(app, tab);
    return { ok: true, tabId: tab.id, board, toast: "Column moved" };
  }
}

export async function handleRenameNote(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.columnId) return { ok: false };
  const noteUUID = String(payload.columnId).startsWith(NOTE_PREFIX)
    ? payload.columnId.slice(NOTE_PREFIX.length)
    : payload.columnId;
  if (!noteUUID) return { ok: false };

  const note = await app.notes.find(noteUUID);
  const current = note?.name || "";
  const name = firstValue(await app.prompt("Rename note", {
    inputs: [{ label: "Note name:", type: "text", value: current }],
  }));
  if (!name || !String(name).trim() || String(name) === current) return { ok: false };

  await app.setNoteName({ uuid: noteUUID }, String(name).trim());
  const board = await buildSingleBoard(app, tab);
  return { ok: true, tabId: tab.id, board, toast: "Note renamed" };
}

export async function handleDeleteNote(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab) return { ok: false };
  const noteUUID = payload?.noteUUID || (String(payload?.columnId).startsWith(NOTE_PREFIX)
    ? payload.columnId.slice(NOTE_PREFIX.length)
    : payload?.columnId);
  if (!noteUUID) return { ok: false };

  let noteName = payload?.noteName;
  if (!noteName) {
    try {
      const note = await app.notes.find(noteUUID);
      noteName = note?.name || "this note";
    } catch {
      noteName = "this note";
    }
  }

  const result = await app.prompt(`Delete note "${noteName}"?`, {
    inputs: [
      {
        label: "I understand: this note will be moved to Amplenote Trash (restorable for 30 days).",
        type: "checkbox",
        value: false,
      },
    ],
  });
  if (firstValue(result) !== true) return { ok: false };

  try {
    await app.deleteNote({ uuid: noteUUID });
  } catch (err) {
    console.error("Failed to delete note:", err);
    return { ok: false, error: err?.message || "Failed to delete note" };
  }
  const board = await buildSingleBoard(app, tab);
  return { ok: true, tabId: tab.id, board };
}

/**
 * Reorders tabs (drag-and-drop) and persists silently in background.
 * @param {Object} app
 * @param {{fromIndex?: number, toIndex?: number}} [payload]
 */
export async function handleReorderTabs(app, payload) {
  const { fromIndex, toIndex } = payload || {};
  if (typeof fromIndex !== "number" || typeof toIndex !== "number") return;
  const config = await loadTabsConfig(app);
  const updated = moveTab(config, fromIndex, toIndex);
  await saveTabsConfig(app, updated);
}

/**
 * Directly saves drag-and-drop column order into note markdown.
 * @param {Object} app
 * @param {{tabId?: string, columnIds?: string[]}} [payload]
 */
export async function handleReorderColumns(app, payload) {
  const { tabId, columnIds, columnNames } = payload || {};
  if (!tabId || !Array.isArray(columnIds) || !columnIds.length) return;

  const config = await loadTabsConfig(app);
  const tab = tabById(config, tabId);
  if (!tab) return;

  const noteUUID = payload?.noteUUID || (tab.kind === "note" ? tab.noteUUID : null);
  if (!noteUUID) return;

  const cleanIds = columnIds.filter(id => id !== "unsorted" && id !== "completed" && id !== "main");
  const ok = await reorderColumns(app, noteUUID, cleanIds, columnNames);
  if (ok) {
    const board = await buildSingleBoard(app, tab);
    return { ok: true, board, tabId };
  }
}

export const handleSaveColumnsToNote = handleReorderColumns;

export async function handleQuickSetDate(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return { ok: false };

  const task = await app.getTask(cardId);
  if (!task) return { ok: false };

  const currentVal = (typeof task.startAt === "number" && task.startAt > 0) ? Math.floor(task.startAt) : null;
  const currentTime = formatLocalTimeStr(task.startAt);

  const result = await app.prompt("Set Task Date & Time (@)", {
    inputs: [
      { label: "Scheduled date (leave blank to clear):", type: "date", value: currentVal },
      { label: "Scheduled time (optional, e.g. 14:30 or 2:30 PM):", type: "string", value: currentTime, placeholder: "HH:MM" },
    ],
  });
  if (result === null || result === undefined) return { ok: false, canceled: true };
  const [dateRaw, timeRaw] = Array.isArray(result) ? result : [result, ""];
  const startAt = combineDateAndTime(dateRaw, timeRaw);
  await app.updateTask(cardId, { startAt });
  const tab = await resolveCurrentBoardTab(app, payload);
  const board = tab ? await buildSingleBoard(app, tab) : null;
  return { ok: true, tabId: tab?.id, board, toast: startAt ? "Date updated" : "Date cleared" };
}

export async function handleOpenTag(app, payload) {
  const tag = payload?.tag;
  if (!tag) return;
  await openTag(app, tag);
}

const ACTIONS = {
  ping: handlePing,
  saveTheme: handleSaveTheme,
  saveSetting: handleSaveSetting,
  saveSettings: handleSaveSetting,
  setActiveTab: handleSetActiveTab,
  refreshTab: handleRefreshTab,
  refreshAll: handleRefreshAll,
  moveCard: handleMoveCard,
  createCard: handleCreateCard,
  editCard: handleEditCard,
  editTaskDetails: handleEditTaskDetails,
  openCard: handleOpenCard,
  openTag: handleOpenTag,
  addTab: handleAddTab,
  closeTab: handleCloseTab,
  moveTabDir: handleMoveTabDir,
  reorderTabs: handleReorderTabs,
  setDateFormat: handleSetDateFormat,
  createColumn: handleCreateColumn,
  createSection: handleCreateColumn,
  createColumnNote: handleCreateColumnNote,
  createNote: handleCreateColumnNote,
  renameColumn: handleRenameColumn,
  renameSection: handleRenameColumn,
  deleteColumn: handleDeleteColumn,
  deleteSection: handleDeleteColumn,
  moveColumn: handleMoveColumn,
  moveSection: handleMoveColumn,
  reorderColumns: handleReorderColumns,
  saveColumnsToNote: handleReorderColumns,
  setWipLimit: handleSetWipLimit,
  cardMenu: handleCardMenu,
  quickSetDate: handleQuickSetDate,
  saveSortToNote: handleSaveSortToNote,
  globalSearch: handleGlobalSearch,
  moveColumnToTab: handleMoveColumnToTab,
  moveSectionToNote: handleMoveColumnToTab,
  renameNote: handleRenameNote,
  deleteNote: handleDeleteNote,
};

export async function handleEmbedAction(app, args) {
  const [action, payload] = args || [];
  const handler = ACTIONS[action];
  if (!handler) {
    console.warn(`Unknown embed action: ${action}`);
    return undefined;
  }
  return handler(app, payload);
}
