import { buildBoardHtml } from "./lib/ui/boardTemplate.js";
import { loadTabsConfig } from "./lib/core/tabsConfig.js";
import { getSessionSnapshot, bumpRoundTrips } from "./lib/core/sessionState.js";
import { withDemoContent } from "./lib/core/demoBoard.js";
import { handleEmbedAction } from "./lib/features/embedActions.js";
import { buildNoteBoard } from "./lib/api/noteBoard.js";
import { SETTINGS_KEYS, DEFAULT_THEME_ID, DEFAULT_DATE_FORMAT } from "./lib/core/constants.js";

/* ----------------------------------- */
/**
 * Kanban Plugin
 * A multi-tab visual Kanban board: note boards (headings = columns,
 * tasks = cards) and tag boards (sub-tags = columns, notes = cards).
 * The board lives in a persistent app.openEmbed section.
 */
const plugin = {
  appOption: {
    /* ----------------------------------- */
    /**
     * Launcher: opens the plugin's persistent embed section and navigates
     * to its addressable URL (https://www.amplenote.com/notes/plugins/{pluginUUID}).
     * @param {Object} app - The Amplenote App instance.
     * @returns {Promise<void>}
     */
    "Open Kanban Board": async (app) => {
      await app.openEmbed();
      await app.navigate(`https://www.amplenote.com/notes/plugins/${app.context.pluginUUID}`);
    },
    /* ----------------------------------- */
  },
  /* ----------------------------------- */
  /**
   * Builds the serializable view state consumed by the embed client.
   * Always re-derived from source of truth (settings + notes/tags) — never
   * trusted from stale embed args.
   * @param {Object} app - The Amplenote App instance.
   */
  async buildViewState(app) {
    const config = await loadTabsConfig(app);
    let themeId = DEFAULT_THEME_ID;
    try {
      themeId = (await app.settings?.[SETTINGS_KEYS.theme]) || DEFAULT_THEME_ID;
    } catch {
      themeId = DEFAULT_THEME_ID;
    }

    // Derive board snapshots fresh from source of truth. Note boards are
    // built from their note; tag boards arrive in Phase 3.
    const boards = {};
    for (const tab of config.tabs) {
      if (tab.kind === "note" && tab.noteUUID) {
        try {
          boards[tab.id] = await buildNoteBoard(app, tab.noteUUID, {
            columnLimits: tab.columnLimits || {},
          });
        } catch (error) {
          console.error(`Failed to build board for tab ${tab.id}:`, error);
          boards[tab.id] = { kind: "note", noteUUID: tab.noteUUID, columns: [], hasHeadings: false };
        }
      }
    }

    return {
      version: 1,
      activeTabId: config.activeTabId,
      tabs: config.tabs,
      boards,
      settings: {
        theme: themeId,
        dateFormat: config.settings.dateFormat || DEFAULT_DATE_FORMAT,
      },
      meta: { roundTrips: getSessionSnapshot().roundTrips },
    };
  },
  /* ----------------------------------- */
  /**
   * Renders the board HTML for the embed section.
   * @param {Object} app - The Amplenote App instance.
   * @returns {Promise<string>} full HTML document for the embed iframe.
   */
  async renderEmbed(app) {
    const viewState = await this.buildViewState(app);
    return buildBoardHtml(withDemoContent(viewState));
  },
  /* ----------------------------------- */
  /**
   * Handles actions dispatched from the embed via callAmplenotePlugin.
   * @param {Object} app - The Amplenote App instance.
   * @param {...any} args - [action, payload].
   */
  async onEmbedCall(app, ...args) {
    bumpRoundTrips();
    try {
      return await handleEmbedAction(app, args);
    } catch (error) {
      console.error(`Embed action failed:`, error);
      return undefined;
    }
  },
  /* ----------------------------------- */
};

export default plugin;
