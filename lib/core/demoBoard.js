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
        { id: "card_1", title: "Welcome to Kanban 👋", meta: "Demo card" },
        { id: "card_2", title: "Drag & drop arrives in Phase 1", meta: "Roadmap" },
        { id: "card_3", title: "Press T to cycle themes", meta: "Tip" },
      ],
    },
    {
      id: "col_doing",
      name: "In Progress",
      cards: [
        { id: "card_4", title: "Scaffold embed round trip", meta: "Phase 0" },
      ],
    },
    {
      id: "col_done",
      name: "Done",
      cards: [
        { id: "card_5", title: "Plugin plan approved", meta: "ds.md" },
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
