import { withDemoContent } from '../lib/core/demoBoard.js';

const BASE_STATE = {
  version: 1,
  activeTabId: null,
  tabs: [],
  boards: {},
  settings: { theme: "light", dateFormat: "YYYY-MM-DD" },
  meta: { roundTrips: 0 },
};

describe("demoBoard", () => {
  it("injects a demo tab and board when no tabs are configured", () => {
    const state = withDemoContent(BASE_STATE);
    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0].id).toBe("tab_demo");
    expect(state.activeTabId).toBe("tab_demo");
    expect(state.boards.tab_demo.columns.length).toBeGreaterThan(0);
    state.boards.tab_demo.columns.forEach(col => {
      expect(col.cards.length).toBeGreaterThan(0);
      col.cards.forEach(card => {
        expect(card).toHaveProperty("id");
        expect(card).toHaveProperty("title");
      });
    });
  });

  it("leaves states with existing tabs untouched", () => {
    const populated = {
      ...BASE_STATE,
      activeTabId: "t1",
      tabs: [{ id: "t1", kind: "tag", name: "work" }],
    };
    expect(withDemoContent(populated)).toBe(populated);
  });
});
