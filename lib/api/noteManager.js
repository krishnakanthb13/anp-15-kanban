/**
 * Refreshes the Kanban plugin page by briefly replacing content then re-embedding.
 * Deduplicated from 6 identical copies across the original monolith.
 *
 * @param {Object} app - The Amplenote app context.
 */
export async function refreshKanbanPage(app) {
  try {
    const destNoteUUID = await app.settings["Current_Note_UUID [Do not Edit!]"];
    if (!destNoteUUID) return;

    await app.replaceNoteContent({ uuid: destNoteUUID }, `Refreshing the Page!`);
    await new Promise(r => setTimeout(r, 100));

    await app.replaceNoteContent(
      { uuid: destNoteUUID },
      `<object data="plugin://${app.context.pluginUUID}" data-aspect-ratio="1" />`
    );

    app.navigate(`https://www.amplenote.com/notes/${destNoteUUID}`);
  } catch (error) {
    console.error("Error refreshing Kanban page:", error);
  }
}

/**
 * Gets or creates the Kanban board destination note.
 * Returns the UUID for the note where the plugin embed lives.
 *
 * @param {Object} app - The Amplenote app context.
 * @returns {Promise<string>} - The destination note UUID.
 */
export async function getOrCreateKanbanNote(app) {
  try {
    const existingUUID = await app.settings["Current_Note_UUID [Do not Edit!]"];
    if (existingUUID) return existingUUID;

    const newUUID = await app.createNote("Kanban Board", ["-reports/-kanban"]);
    await app.setSetting("Current_Note_UUID [Do not Edit!]", newUUID);
    return newUUID;
  } catch (error) {
    console.error("Error getting or creating Kanban note:", error);
    return null;
  }
}
