import { SETTINGS_KEYS } from "../core/constants.js";
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
import { buildColumnSpans, resolveSpan } from "../api/markdownIndex.js";
import {
  createColumn,
  renameColumn,
  deleteColumn,
  reorderColumns,
} from "../api/columnOps.js";
import { buildTagBoard, NOTE_PREFIX } from "../api/tagBoard.js";
import { createTaggedNote, openNote } from "../api/noteOps.js";
import { transferColumn } from "../api/columnOps.js";
import { firstValue } from "../utils/prompt.js";

/**
 * Re-renders the embed with fresh state.
 * @param {Object} app - The Amplenote app context.
 */
async function rerender(app) {
  if (typeof app.context?.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
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
 * @param {{themeId?: string}} [payload]
 */
export async function handleSaveTheme(app, payload) {
  const themeId = payload && typeof payload.themeId === "string" ? payload.themeId : null;
  if (!themeId || !isValidThemeId(themeId)) return;
  await app.setSetting(SETTINGS_KEYS.theme, themeId);
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

/** Refreshes the active tab's board data. */
export async function handleRefreshTab(app) {
  await rerender(app);
}

/** Refreshes all tabs' board data. */
export async function handleRefreshAll(app) {
  await rerender(app);
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
          { label: "Tag Board (all notes with tag as columns)", value: "tag" },
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
    if (!noteHandle || !noteHandle.uuid) return;
    tab = createTab({
      kind: "note",
      name: noteHandle.name || "Note board",
      noteUUID: noteHandle.uuid,
    });
  } else if (choice === "new_note") {
    const titleInput = firstValue(await app.prompt("Create New Note Board", {
      inputs: [
        {
          label: "Board title (optional — leave blank for timestamped name):",
          type: "string",
        },
      ],
    }));
    if (titleInput === null || titleInput === undefined) return;
    const title = (titleInput && String(titleInput).trim()) || defaultKanbanNoteName();
    const uuid = await app.createNote(title, ["-reports/-kanban"]);
    if (!uuid) return;
    await app.replaceNoteContent({ uuid }, "# To Do\n\n# In Progress\n\n# Done\n");
    tab = createTab({
      kind: "note",
      name: title,
      noteUUID: uuid,
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
  await rerender(app);
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
  await rerender(app);
}

/**
 * Sets the date format used for card date chips.
 * @param {Object} app
 */
export async function handleSetDateFormat(app) {
  const config = await loadTabsConfig(app);
  const result = await app.prompt("Date format for card chips", {
    inputs: [{
      label: "Format tokens: YYYY MM DD MMM (e.g. DD MMM YYYY):",
      type: "text",
      value: config.settings.dateFormat,
    }],
  });
  const fmt = firstValue(result);
  if (!fmt || !String(fmt).trim()) return;

  config.settings.dateFormat = String(fmt).trim();
  await saveTabsConfig(app, config);
  await rerender(app);
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

/**
 * Checks if a column id is the last heading of a note.
 * @param {Object} app
 * @param {string} noteUUID
 * @param {string} columnId
 */
async function isLastColumn(app, noteUUID, columnId) {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  const { columns } = buildColumnSpans(markdown);
  return columns.length > 0 && columns[columns.length - 1].id === String(columnId);
}

/**
 * Moves a card between columns or headings.
 * @param {Object} app
 * @param {{tabId?: string, cardId?: string, toColumnId?: string, toSectionId?: string}} [payload]
 */
export async function handleMoveCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.cardId || !payload.toColumnId) return;

  if (tab.kind === "tag" || tab.kind === "notes") {
    const targetUUID = String(payload.toColumnId).startsWith(NOTE_PREFIX)
      ? payload.toColumnId.slice(NOTE_PREFIX.length)
      : payload.toColumnId;
    if (!targetUUID) return;

    const task = await app.getTask(payload.cardId);
    if (!task) return;

    if (task.noteUUID !== targetUUID) {
      await app.updateTask(payload.cardId, { noteUUID: targetUUID });
    }

    if (payload.toSectionId && payload.toSectionId !== "unsorted" && payload.toSectionId !== "main") {
      try {
        await moveTaskToColumn(app, targetUUID, payload.cardId, { columnId: payload.toSectionId });
      } catch (err) {
        console.error("Failed to relocate task to section:", err);
      }
    }

    await rerender(app);
    return;
  }

  const doneTarget = await isLastColumn(app, tab.noteUUID, payload.toColumnId);
  const status = await moveTaskToColumn(app, tab.noteUUID, payload.cardId, {
    columnId: payload.toColumnId,
  });

  if (status === "moved") {
    await setTaskCompleted(app, payload.cardId, doneTarget);
    await rerender(app);
  }
}

/**
 * Creates a new card in a column or section.
 * @param {Object} app
 * @param {{tabId?: string, columnId?: string, sectionId?: string}} [payload]
 */
export async function handleCreateCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.columnId) return;

  if (tab.kind === "tag" || tab.kind === "notes") {
    const targetUUID = String(payload.columnId).startsWith(NOTE_PREFIX)
      ? payload.columnId.slice(NOTE_PREFIX.length)
      : payload.columnId;
    if (!targetUUID) return;

    const content = firstValue(await app.prompt("New task", {
      inputs: [{ label: "Task content (markdown):", type: "text" }],
    }));
    if (!content) return;

    const taskUuid = await app.insertTask({ uuid: targetUUID }, { content });
    if (taskUuid && payload.sectionId && payload.sectionId !== "unsorted" && payload.sectionId !== "main") {
      try {
        await moveTaskToColumn(app, targetUUID, taskUuid, { columnId: payload.sectionId });
      } catch (err) {
        console.error("Failed to position new task under section:", err);
      }
    }
    await rerender(app);
    return;
  }

  const result = await app.prompt("New card", {
    inputs: [{ label: "Card content (markdown):", type: "text" }],
  });
  const content = firstValue(result);
  if (!content) return;

  await createTaskInColumn(app, tab.noteUUID, { columnId: payload.columnId }, content);
  await rerender(app);
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

  const result = await app.prompt("Edit Task Details", {
    inputs: [
      { label: "Task content (markdown):", type: "text", value: task.content || "" },
      { label: "Important:", type: "checkbox", value: !!task.important },
      { label: "Urgent:", type: "checkbox", value: !!task.urgent },
      { label: "Move to Note (optional):", type: "note", value: task.noteUUID },
      { label: "Move to Section / Heading:", type: "select", options: sectionOptions },
      { label: "Score:", type: "string", value: task.score !== undefined && task.score !== null ? String(task.score) : "" },
      {
        label: "Mark Status:",
        type: "radio",
        options: [
          { label: "Keep current", value: "keep" },
          { label: "Started (startAt now)", value: "started" },
          { label: "Completed", value: "completed" },
          { label: "Dismissed", value: "dismissed" },
          { label: "Reopen / Active", value: "reopen" },
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
  } else if (statusChoice === "reopen") {
    updates.completedAt = null;
    updates.dismissedAt = null;
  }

  const targetNoteUUID = targetNote?.uuid || task.noteUUID;
  if (targetNoteUUID && targetNoteUUID !== task.noteUUID) {
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
  }

  await rerender(app);
}

/**
 * Opens task editor on card click.
 * @param {Object} app
 * @param {{cardId?: string}} [payload]
 */
export async function handleEditCard(app, payload) {
  return handleEditTaskDetails(app, payload);
}

/* ---------------- column management ---------------- */

async function resolveNoteBoardTab(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  return tab && tab.kind === "note" ? tab : null;
}

async function resolveColumn(app, payload) {
  const tab = await resolveNoteBoardTab(app, payload);
  if (!tab || !payload.columnId) return null;

  const markdown = await app.getNoteContent({ uuid: tab.noteUUID });
  const { columns } = buildColumnSpans(markdown);
  const span = resolveSpan(columns, payload.columnId);
  if (!span) return null;
  return { tab, columnName: span.name };
}

export async function handleCreateColumn(app, payload) {
  const tab = await resolveNoteBoardTab(app, payload);
  if (!tab) return;

  const result = await app.prompt("New column", {
    inputs: [{ label: "Column name:", type: "text" }],
  });
  const name = firstValue(result);
  if (!name || !String(name).trim()) return;

  const created = await createColumn(app, tab.noteUUID, name);
  if (created) await rerender(app);
}

export async function handleRenameColumn(app, payload) {
  const resolved = await resolveColumn(app, payload);
  if (!resolved) return;
  const { tab, columnName } = resolved;

  const result = await app.prompt("Rename column", {
    inputs: [{ label: "Column name:", type: "text", value: columnName }],
  });
  const name = firstValue(result);
  if (!name || !String(name).trim() || String(name) === columnName) return;

  const renamed = await renameColumn(app, tab.noteUUID, payload.columnId, name);
  if (renamed) await rerender(app);
}

export async function handleDeleteColumn(app, payload) {
  const resolved = await resolveColumn(app, payload);
  if (!resolved) return;
  const { tab, columnName } = resolved;

  const result = await app.prompt(`Delete "${columnName}"?`, {
    inputs: [
      {
        label: "I understand: the heading is removed and its tasks move to the top of the note.",
        type: "checkbox",
        value: false,
      },
    ],
  });
  if (firstValue(result) !== true) return;

  const deleted = await deleteColumn(app, tab.noteUUID, payload.columnId);
  if (deleted) await rerender(app);
}

export async function handleMoveColumn(app, payload) {
  const tab = await resolveNoteBoardTab(app, payload);
  if (!tab || !payload.columnId) return;
  const direction = payload.direction === "left" ? "left" : "right";

  const markdown = await app.getNoteContent({ uuid: tab.noteUUID });
  const { columns } = buildColumnSpans(markdown);
  const index = columns.findIndex(c => c.id === String(payload.columnId));
  if (index === -1) return;

  const target = direction === "left" ? index - 1 : index + 1;
  if (target < 0 || target >= columns.length) return;

  const order = columns.map(c => c.id);
  [order[index], order[target]] = [order[target], order[index]];

  const moved = await reorderColumns(app, tab.noteUUID, order);
  if (moved) await rerender(app);
}

export async function handleSetWipLimit(app, payload) {
  const resolved = await resolveColumn(app, payload);
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
  await rerender(app);
}

/* ---------------- extras ---------------- */

export async function handleCardMenu(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;

  const task = await app.getTask(cardId);
  if (!task) return;

  const choice = firstValue(await app.prompt("Card actions", {
    inputs: [{
      label: "What do you want to do?",
      type: "radio",
      options: [
        { label: "Edit task details (full dialog)", value: "edit_details" },
        { label: "Add label (note link)", value: "label" },
        { label: "Set start date / deadline", value: "date" },
        { label: "Snooze / Hide Until (set date)", value: "snooze" },
        { label: "Schedule Time Block (start & end time)", value: "timeblock" },
        { label: "Create note from card", value: "note" },
      ],
    }],
  }));
  if (!choice) return;

  if (choice === "edit_details") {
    await handleEditTaskDetails(app, { cardId });
    return;
  }

  if (choice === "label") {
    const handle = firstValue(await app.prompt("Add label", {
      inputs: [{ label: "Pick a note to use as label:", type: "note" }],
    }));
    if (!handle || !handle.name) return;
    await addLabelToTask(app, cardId, handle.name);
    await rerender(app);
    return;
  }

  if (choice === "date") {
    const value = firstValue(await app.prompt("Set start date", {
      inputs: [{ label: "Start date (blank clears):", type: "date" }],
    }));
    if (value === null || value === undefined) return;
    const trimmed = String(value).trim();
    const startAt = trimmed ? Math.floor(new Date(trimmed).getTime() / 1000) : null;
    if (trimmed && Number.isNaN(startAt)) return;
    await app.updateTask(cardId, { startAt });
    await rerender(app);
    return;
  }

  if (choice === "snooze") {
    const value = firstValue(await app.prompt("Snooze / Hide Until", {
      inputs: [{ label: "Hide task until date (blank clears snooze):", type: "date" }],
    }));
    if (value === null || value === undefined) return;
    const trimmed = String(value).trim();
    const hideUntil = trimmed ? Math.floor(new Date(trimmed).getTime() / 1000) : null;
    await app.updateTask(cardId, { hideUntil });
    await rerender(app);
    return;
  }

  if (choice === "timeblock") {
    const res = await app.prompt("Schedule Time Block", {
      inputs: [
        { label: "Start Date/Time:", type: "date" },
        { label: "End Date/Time (must be after start):", type: "date" },
      ],
    });
    if (!res) return;
    const [startVal, endVal] = res;
    const sTrim = String(startVal || "").trim();
    const eTrim = String(endVal || "").trim();
    const startAt = sTrim ? Math.floor(new Date(sTrim).getTime() / 1000) : null;
    const endAt = eTrim ? Math.floor(new Date(eTrim).getTime() / 1000) : null;
    await app.updateTask(cardId, { startAt, endAt });
    await rerender(app);
    return;
  }

  if (choice === "note") {
    const title = String(task.content || "").replace(/\s+/g, " ").trim().slice(0, 80) || "Note from card";
    const uuid = await createTaggedNote(app, title);
    if (!uuid) return;
    await addLabelToTask(app, cardId, title);
    await rerender(app);
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
    await rerender(app);
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
  const resolved = await resolveColumn(app, payload);
  if (!resolved) return;
  const { tab, columnName } = resolved;

  const config = await loadTabsConfig(app);
  const candidates = config.tabs.filter(t => t.kind === "note" && t.noteUUID && t.id !== tab.id);
  if (!candidates.length) {
    await app.alert("No other note-board tabs to move this column to.");
    return;
  }

  const targetId = firstValue(await app.prompt(`Move "${columnName}" to another board`, {
    inputs: [{
      label: "Target tab:",
      type: "select",
      options: candidates.map(t => ({ label: t.name, value: t.id })),
    }],
  }));
  if (!targetId) return;

  const target = tabById(config, targetId);
  if (!target || target.kind !== "note" || !target.noteUUID) return;

  const confirmed = firstValue(await app.prompt(`Move "${columnName}" to "${target.name}"?`, {
    inputs: [{
      label: "I understand: the heading and its tasks move to the other note.",
      type: "checkbox",
      value: false,
    }],
  }));
  if (confirmed !== true) return;

  const status = await transferColumn(app, tab.noteUUID, payload.columnId, target.noteUUID);
  if (status === "moved") await rerender(app);
}

export async function handleRenameNote(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.columnId) return;
  const noteUUID = String(payload.columnId).startsWith(NOTE_PREFIX)
    ? payload.columnId.slice(NOTE_PREFIX.length)
    : payload.columnId;
  if (!noteUUID) return;

  const note = await app.notes.find(noteUUID);
  const current = note?.name || "";
  const name = firstValue(await app.prompt("Rename note", {
    inputs: [{ label: "Note name:", type: "text", value: current }],
  }));
  if (!name || !String(name).trim() || String(name) === current) return;

  await app.setNoteName({ uuid: noteUUID }, String(name).trim());
  await rerender(app);
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
 * Saves drag-and-drop column order into the note markdown after user confirmation.
 * @param {Object} app
 * @param {{tabId?: string, columnIds?: string[]}} [payload]
 */
export async function handleSaveColumnsToNote(app, payload) {
  const { tabId, columnIds } = payload || {};
  if (!tabId || !Array.isArray(columnIds) || !columnIds.length) return;

  const config = await loadTabsConfig(app);
  const tab = tabById(config, tabId);
  if (!tab || tab.kind !== "note" || !tab.noteUUID) return;

  const confirmed = await app.prompt("Save new column order into note?", {
    inputs: [
      {
        label: "Reorder headings and all content in the note markdown",
        type: "checkbox",
        value: true,
      },
    ],
  });
  if (!confirmed || !confirmed[0]) return;

  const ok = await reorderColumns(app, tab.noteUUID, columnIds);
  if (ok) {
    await rerender(app);
  }
}

const ACTIONS = {
  ping: handlePing,
  saveTheme: handleSaveTheme,
  setActiveTab: handleSetActiveTab,
  refreshTab: handleRefreshTab,
  refreshAll: handleRefreshAll,
  moveCard: handleMoveCard,
  createCard: handleCreateCard,
  editCard: handleEditCard,
  editTaskDetails: handleEditTaskDetails,
  openCard: handleOpenCard,
  addTab: handleAddTab,
  closeTab: handleCloseTab,
  moveTabDir: handleMoveTabDir,
  reorderTabs: handleReorderTabs,
  setDateFormat: handleSetDateFormat,
  createColumn: handleCreateColumn,
  renameColumn: handleRenameColumn,
  deleteColumn: handleDeleteColumn,
  moveColumn: handleMoveColumn,
  saveColumnsToNote: handleSaveColumnsToNote,
  setWipLimit: handleSetWipLimit,
  cardMenu: handleCardMenu,
  saveSortToNote: handleSaveSortToNote,
  globalSearch: handleGlobalSearch,
  moveColumnToTab: handleMoveColumnToTab,
  renameNote: handleRenameNote,
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
