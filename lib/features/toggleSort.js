import { refreshKanbanPage } from "../api/noteManager.js";

/**
 * onEmbedCall "togglesort" handler.
 * Prompts user to change the task sorting criterion.
 *
 * @param {Object} app - The Amplenote app context.
 */
export async function handleToggleSort(app) {
  const sortSetting = await app.settings["Toggle Sort"];

  const result = await app.prompt(`Sort Tasks. Current Setting: ${sortSetting}`, {
    inputs: [
      {
        label: `Tasks Toggle Sort: [${sortSetting}]`,
        type: "select",
        options: [
          { label: "startDate", value: "startDate" },
          { label: "taskScore", value: "taskScore" },
          { label: "important", value: "important" },
          { label: "urgent", value: "urgent" }
        ]
      }
    ]
  });

  if (result) {
    await app.setSetting("Toggle Sort", result);
  } else {
    return;
  }

  refreshKanbanPage(app);
}
