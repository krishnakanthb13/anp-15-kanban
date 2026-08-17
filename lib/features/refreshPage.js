import { refreshKanbanPage } from "../api/noteManager.js";

/**
 * onEmbedCall "refreshPage" handler.
 * Simply refreshes the kanban board page.
 *
 * @param {Object} app - The Amplenote app context.
 */
export async function handleRefreshPage(app) {
  refreshKanbanPage(app);
}
