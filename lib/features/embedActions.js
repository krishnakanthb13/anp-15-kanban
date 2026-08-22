import { SETTINGS_KEYS } from "../core/constants.js";
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
  const settings = await loadPluginSettings(app);
  const result = await app.prompt("Date format for card chips", {
    inputs: [{
      label: "Format tokens: YYYY MM DD MMM (e.g. DD MMM YYYY):",
      type: "text",
      value: settings.dateFormat,
    }],
  });
  const fmt = firstValue(result);
  if (!fmt || !String(fmt).trim()) return;

  await savePluginSettings(app, { dateFormat: String(fmt).trim() });
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

  await createTaskInColumn(app, tab.noteUUID, { columnId: payload.columnId, columnName: payload.columnName }, content);
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

export async function handleCardMenu(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;

  const task = await app.getTask(cardId);
  if (!task) return;

  const choice = firstValue(await app.prompt("Card Actions", {
    inputs: [{
      label: "Choose action:",
      type: "radio",
      options: [
        { label: "Edit task details (full dialog)", value: "edit_details" },
        { label: "Add label (note link)", value: "label" },
        { label: "Set start date / time", value: "date" },
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
    await rerender(app);
    return;
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
    await rerender(app);
    return;
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

export async function handleQuickSetDate(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;

  const task = await app.getTask(cardId);
  if (!task) return;

  const currentVal = (typeof task.startAt === "number" && task.startAt > 0) ? Math.floor(task.startAt) : null;
  const currentTime = formatLocalTimeStr(task.startAt);

  const result = await app.prompt("Set Task Date & Time (@)", {
    inputs: [
      { label: "Scheduled date (leave blank to clear):", type: "date", value: currentVal },
      { label: "Scheduled time (optional, e.g. 14:30 or 2:30 PM):", type: "string", value: currentTime, placeholder: "HH:MM" },
    ],
  });
  if (result === null || result === undefined) return;
  const [dateRaw, timeRaw] = Array.isArray(result) ? result : [result, ""];
  const startAt = combineDateAndTime(dateRaw, timeRaw);
  await app.updateTask(cardId, { startAt });
  await rerender(app);
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
  quickSetDate: handleQuickSetDate,
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
