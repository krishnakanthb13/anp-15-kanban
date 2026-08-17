import { refreshKanbanPage } from "../api/noteManager.js";

/**
 * onEmbedCall "createNewNote" handler.
 * Prompts user to create a new kanban note, optionally copying tasks from a template.
 *
 * @param {Object} app - The Amplenote app context.
 */
export async function handleCreateNewNote(app) {
  const result = await app.prompt(`Details for New Note Creation`, {
    inputs: [
      { label: "Enter a Note Name:", type: "string" },
      { label: "Select a Note as Template w/ Tasks: (Optional)", type: "note" }
    ]
  });

  if (result) {
    const [noteName, copyNote] = result;
    const kanbanTagz = await app.settings["Kanban Filter Tag"];
    const uuidz = await app.createNote(noteName, [kanbanTagz || "-reports/-kanban"]);

    if (copyNote) {
      const markdown = await app.getNoteContent({ uuid: copyNote.uuid });
      await app.replaceNoteContent({ uuid: uuidz }, markdown);
    } else {
      const note = await app.notes.find(uuidz);
      await note.insertTask({ content: "Temp: This Task is created by [Kanban Plugin](https://www.amplenote.com/plugins?sort_by=newest)" });
    }
  } else {
    return;
  }

  refreshKanbanPage(app);
}
