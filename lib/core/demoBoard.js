/**
 * Phase 0 scaffold content: a hardcoded demo board shown when no tabs are
 * configured yet. Proves the renderEmbed/onEmbedCall pipeline end to end
 * before real note/tag parsing lands in later phases.
 */

const DEMO_TAB_ID = "tab_demo";

/**
 * @param {Object} viewState
 * @returns {Object} viewState augmented with a demo tab + board when empty.
 */
export function withDemoContent(viewState) {
  if (viewState.tabs && viewState.tabs.length > 0) return viewState;

  const columns = [
    {
      id: "col_todo",
      name: "To Do",
      cards: [
        { id: "card_1", title: "Welcome to Kanban 👋", content: "", completedAt: null, startAt: null, deadline: null, important: false, urgent: false },
        { id: "card_2", title: "Drag me between columns", content: "", completedAt: null, startAt: null, deadline: null, important: false, urgent: false },
        { id: "card_3", title: "Press T to cycle themes", content: "", completedAt: null, startAt: null, deadline: null, important: false, urgent: false },
      ],
    },
    {
      id: "col_doing",
      name: "In Progress",
      cards: [
        { id: "card_4", title: "Scaffold embed round trip", content: "", completedAt: null, startAt: null, deadline: null, important: false, urgent: false },
      ],
    },
    {
      id: "col_done",
      name: "Done",
      cards: [
        { id: "card_5", title: "Plugin plan approved", content: "", completedAt: Math.floor(Date.now() / 1000) - 86400, startAt: null, deadline: null, important: false, urgent: false },
      ],
    },
  ];

  return {
    ...viewState,
    activeTabId: DEMO_TAB_ID,
    tabs: [{ id: DEMO_TAB_ID, kind: "note", name: "Demo Board", noteUUID: null, tag: null }],
    boards: { [DEMO_TAB_ID]: { columns } },
  };
}
