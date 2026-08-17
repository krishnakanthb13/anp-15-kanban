import { getOrCreateKanbanNote } from "../api/noteManager.js";

/**
 * appOption["Tagged!"] handler.
 * Inserts the kanban plugin embed into the destination note and navigates to it.
 *
 * @param {Object} app - The Amplenote app context.
 * @returns {null}
 */
export async function handleTagged(app) {
  const destNoteUUID = await getOrCreateKanbanNote(app);

  await app.replaceNoteContent(
    { uuid: destNoteUUID },
    `<object data="plugin://${app.context.pluginUUID}" data-aspect-ratio="1" />`
  );
  await app.navigate(`https://www.amplenote.com/notes/${destNoteUUID}`);

  return null;
}
