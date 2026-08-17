import { refreshKanbanPage } from "../api/noteManager.js";
import { moveTaskToHeader } from "../api/taskMover.js";

/**
 * onEmbedCall "taskEdit" handler.
 * Displays a prompt for editing task content, importance, urgency, note, section, score, and status.
 *
 * @param {Object} app - The Amplenote app context.
 * @param {string} taskUuid - The UUID of the task to edit.
 */
export async function handleTaskEdit(app, taskUuid) {
  try {
    const task = await app.getTask(taskUuid);
    if (!task) return;

    const sections = await app.getNoteSections({ uuid: task.noteUUID });

    const transformedSections = sections.map((item, index) => {
      const headerValue = item.heading ? item.heading.text : "Main";
      return { label: headerValue, value: index };
    });

    const result = await app.prompt("Update Task Details", {
      inputs: [
        { label: "Update Task Content:", type: "text", value: `${task.content}` },
        { label: "Update Important:", type: "checkbox", value: task.important },
        { label: "Update Urgent:", type: "checkbox", value: task.urgent },
        { label: "Move to a Note or Header. Select Note:", type: "note", value: `${task.noteUUID}` },
        { label: "Select Section or Header (Caution: refrain from using --- in the note.):", type: "select", options: transformedSections },
        { label: "Update Score:", type: "string", value: `${task.score}` },
        { label: "Mark Task Status:", type: "radio", options: [
          { label: "Started", value: 3 },
          { label: "Completed", value: 1 },
          { label: "Dismissed", value: 2 }
        ]}
      ]
    });

    if (!result) return;

    let [taskContent, taskImportant, taskUrgent, taskNoteuuid, notesections, taskScore, taskStatus] = result;
    notesections = parseFloat(notesections);
    taskScore = parseFloat(taskScore);

    const currentTimeUnix = Math.floor(Date.now() / 1000);
    const updatedFields = {};

    if (taskContent !== task.content) updatedFields.content = taskContent;
    if (taskImportant !== task.important) updatedFields.important = taskImportant;
    if (taskUrgent !== task.urgent) updatedFields.urgent = taskUrgent;

    if (taskNoteuuid && taskNoteuuid.uuid && taskNoteuuid.uuid !== task.noteUUID) {
      updatedFields.noteUUID = taskNoteuuid.uuid;
    }

    if (taskScore !== task.score) updatedFields.score = taskScore;

    if (taskStatus === 1) {
      updatedFields.completedAt = currentTimeUnix;
    } else if (taskStatus === 2) {
      updatedFields.dismissedAt = currentTimeUnix;
    } else if (taskStatus === 3) {
      updatedFields.startAt = currentTimeUnix;
    }

    if (Object.keys(updatedFields).length > 0) {
      await app.updateTask(taskUuid, updatedFields);
    }

    if (!isNaN(notesections) && notesections >= 0 && taskNoteuuid && taskNoteuuid.uuid == task.noteUUID) {
      const updatedMarkdown = await moveTaskToHeader(app, task.noteUUID, task.uuid, notesections);
      if (updatedMarkdown) {
        await app.replaceNoteContent({ uuid: task.noteUUID }, updatedMarkdown);
      }
    }

    await refreshKanbanPage(app);
  } catch (error) {
    console.error(`Error in handleTaskEdit for task ${taskUuid}:`, error);
  }
}
