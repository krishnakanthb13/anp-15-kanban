import { refreshKanbanPage } from "../api/noteManager.js";
import { moveTaskToHeader } from "../api/taskMover.js";

/**
 * onEmbedCall "createTask" handler.
 * Prompts user to create a new task in a specific note column.
 *
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteName - The name of the note to create the task in.
 */
export async function handleCreateTask(app, noteName) {
  try {
    const kanbanTagz = await app.settings["Kanban Filter Tag"];
    const noteHandleCT = await app.findNote({ name: noteName, tag: kanbanTagz || "-reports/-kanban" });
    if (!noteHandleCT) return;

    const sections = await app.getNoteSections({ uuid: noteHandleCT.uuid });

    const transformedSections = sections.map((item, index) => {
      const headerValue = item.heading ? item.heading.text : "Main";
      return { label: headerValue, value: index };
    });

    const result = await app.prompt("Update Task Details", {
      inputs: [
        { label: "Update Task Content:", type: "text" },
        { label: "Update Important:", type: "checkbox" },
        { label: "Update Urgent:", type: "checkbox" },
        { label: "Move to a Note or Header. Select Note:", type: "note", value: `${noteHandleCT.uuid}` },
        { label: "Select Section or Header (Caution: refrain from using --- in the note.):", type: "select", options: transformedSections },
        { label: "Update Score:", type: "string" },
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
    let taskUUID;

    if (taskNoteuuid && taskNoteuuid.uuid) {
      taskUUID = await app.insertTask({ uuid: taskNoteuuid.uuid }, { text: "" });
    } else {
      taskUUID = await app.insertTask({ uuid: noteHandleCT.uuid }, { text: "" });
      taskNoteuuid = { uuid: noteHandleCT.uuid };
    }

    if (taskContent) updatedFields.content = taskContent;
    if (taskImportant) updatedFields.important = true;
    if (taskUrgent) updatedFields.urgent = true;
    if (taskScore) updatedFields.score = taskScore;

    if (taskStatus === 1) {
      updatedFields.completedAt = currentTimeUnix;
    } else if (taskStatus === 2) {
      updatedFields.dismissedAt = currentTimeUnix;
    } else if (taskStatus === 3) {
      updatedFields.startAt = currentTimeUnix;
    }

    if (Object.keys(updatedFields).length > 0) {
      await app.updateTask(taskUUID, updatedFields);
    }

    if (!isNaN(notesections) && notesections >= 0 && taskNoteuuid && taskNoteuuid.uuid) {
      const updatedMarkdown = await moveTaskToHeader(app, taskNoteuuid.uuid, taskUUID, notesections);
      if (updatedMarkdown) {
        await app.replaceNoteContent({ uuid: taskNoteuuid.uuid }, updatedMarkdown);
      }
    }

    await refreshKanbanPage(app);
  } catch (error) {
    console.error("Error creating task in kanban:", error);
  }
}
