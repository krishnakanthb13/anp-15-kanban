import { refreshKanbanPage } from "../api/noteManager.js";

/**
 * onEmbedCall "updateTag" handler.
 * Prompts user to update the tag used for filtering kanban notes.
 *
 * @param {Object} app - The Amplenote app context.
 */
export async function handleUpdateTag(app) {
  const tagSetting = await app.settings["Kanban Filter Tag"];

  const result = await app.prompt(`Details for Tag Filtering in Kanban. Current Selection:[${tagSetting}]`, {
    inputs: [
      { label: "Select a Tag: (1)", type: "tags", limit: 1, value: tagSetting }
    ]
  });

  if (result) {
    await app.setSetting("Kanban Filter Tag", result);
  } else {
    return;
  }

  refreshKanbanPage(app);
}
