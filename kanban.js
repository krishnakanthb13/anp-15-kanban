import { handleTagged } from "./lib/features/tagged.js";
import { handleTaskEdit } from "./lib/features/taskEdit.js";
import { handleCreateTask } from "./lib/features/createTask.js";
import { handleCreateNewNote } from "./lib/features/createNewNote.js";
import { handleUpdateTag } from "./lib/features/updateTag.js";
import { handleToggleSort } from "./lib/features/toggleSort.js";
import { handleRefreshPage } from "./lib/features/refreshPage.js";
import { formatTimestamp } from "./lib/utils/formatTimestamp.js";
import { formatTaskRepeat } from "./lib/utils/formatRepeat.js";
import { buildKanbanTemplate } from "./lib/ui/kanbanTemplate.js";

/* ----------------------------------- */
/**
 * Kanban Plugin
 * Creates a visual Kanban board for your tasks based on a specific tag.
 */
const plugin = {
  appOption: {
    /* ----------------------------------- */
    "Tagged!": handleTagged,
    /* ----------------------------------- */
  },
  /* ----------------------------------- */
  /**
   * Handles embed actions when a user interacts with the Kanban UI.
   * @param {object} app - The Amplenote App instance.
   * @param {...any} args - The arguments passed from the embed.
   */
  async onEmbedCall(app, ...args) {
    switch (args[0]) {
      case "taskEdit":
        await handleTaskEdit(app, args[1]);
        break;
      case "createTask":
        await handleCreateTask(app, args[1]);
        break;
      case "createNewNote":
        await handleCreateNewNote(app);
        break;
      case "updateTag":
        await handleUpdateTag(app);
        break;
      case "togglesort":
        await handleToggleSort(app);
        break;
      case "refreshPage":
        await handleRefreshPage(app);
        break;
    }
  },
  /* ----------------------------------- */
  /**
   * Renders the HTML/JS for the Kanban board in an embed block.
   * @param {object} app - The Amplenote App instance.
   * @param {...any} args - Additional arguments for rendering.
   * @returns {string} - The HTML template containing the board.
   */
  async renderEmbed(app, ...args) {
    let allTasksText;
    let taskSorting;

    const kanbanTagz = await app.settings["Kanban Filter Tag"];
    const noteHandles = await app.filterNotes({ tag: kanbanTagz || "-reports/-kanban" });

    if (noteHandles.length > 0) {
      let allTasks = [];

      /**
       * Escapes HTML entities for security.
       * @param {string} str - The string to escape.
       * @returns {string} - The safely escaped string.
       */
      const escapeHTML = str => String(str).replace(/[&<>'"]/g, 
        tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag]));

      for (let note of noteHandles) {
        const noteUUID = note.uuid;
        const noteTags = escapeHTML(note.tags.join(", "));
        const noteNameSafe = escapeHTML(note.name);

        const tasks = await app.getNoteTasks({ uuid: noteUUID }, { includeDone: true });

        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i];
          allTasks.push({
            ...task,
            notename: noteNameSafe,
            noteurl: `https://www.amplenote.com/notes/${note.uuid}`,
            tags: noteTags,
            startAtz: `${formatTimestamp(task.startAt)}`,
            hideUntilz: `${formatTimestamp(task.hideUntil)}`,
            endAtz: `${formatTimestamp(task.endAt)}`,
            repeatz: `${formatTaskRepeat(task.repeat)}`,
            taskInfo: `<b>Important:</b> ${task.important}<br><b>Urgent:</b> ${task.urgent}<br><b>Score:</b> ${task.score.toFixed(2)}<br><hr><b>Start At:</b> ${formatTimestamp(task.startAt)}<br><b>Hide Until:</b> ${formatTimestamp(task.hideUntil)}<br><b>End At:</b> ${formatTimestamp(task.endAt)}<br><b>Repeat:</b> ${formatTaskRepeat(task.repeat)}<br><hr><b>Completed At:</b> ${formatTimestamp(task.completedAt)}<br><b>Dismissed At:</b> ${formatTimestamp(task.dismissedAt)}<br><hr><b>Note Link:</b> <a href="https://www.amplenote.com/notes/${note.uuid}" target="_blank">${noteNameSafe}</a><br><b>Tags:</b> ${noteTags}`
          });
        }
      }

      taskSorting = app.settings["Toggle Sort"] || 'taskScore';
      if (taskSorting === 'startDate') {
        allTasks.sort((a, b) => (b.startAt || 0) - (a.startAt || 0));
      }
      if (taskSorting === 'taskScore') {
        allTasks.sort((a, b) => b.score - a.score);
      }
      if (taskSorting === 'important') {
        allTasks.sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));
      }
      if (taskSorting === 'urgent') {
        allTasks.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
      }

      allTasksText = JSON.stringify(allTasks, null, 2);
    } else {
      const goalsSmall = ["Life Goals", "Yearly Goals", "Monthly Goals", "Today's Tasks"];

      for (const header of goalsSmall) {
        await app.createNote(header, ["-reports/-kanban"]);
        await app.setSetting("Kanban Filter Tag", "-reports/-kanban");

        app.alert("Success! Looks like it's your first time running the program, so we created a few notes with a specific tag to get you rolling. Now you can run the Kanban Plugin again and see at your brand-new board!");
      }
    }

    return buildKanbanTemplate(allTasksText);
  },
  /* ----------------------------------- */
};

export default plugin;