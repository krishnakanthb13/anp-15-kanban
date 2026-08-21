import { buildBoardHtml } from '../lib/ui/boardTemplate.js';

const VIEW_STATE = {
  version: 1,
  activeTabId: "tab_x",
  tabs: [{ id: "tab_x", kind: "note", name: "My Note <evil>" }],
  boards: {
    tab_x: {
      columns: [
        { id: "col_1", name: "To Do", cards: [{ id: "c1", title: "Card <b>one</b>", meta: "meta" }] },
      ],
    },
  },
  settings: { theme: "midnight", dateFormat: "YYYY-MM-DD" },
  meta: { roundTrips: 3 },
};

describe("boardTemplate", () => {
  const html = buildBoardHtml(VIEW_STATE);

  it("produces a complete HTML document", () => {
    expect(html).toMatch(/^<!DOCTYPE html>/);
    expect(html).toContain("</html>");
    expect(html).toContain('lang="en"');
  });

  it("embeds state and theme registry as script globals", () => {
    expect(html).toContain("window.__KANBAN_STATE__ = ");
    expect(html).toContain("window.__KANBAN_THEMES__ = ");
    expect(html).toContain('"activeTabId":"tab_x"');
  });

  it("prevents script breakout from embedded state", () => {
    expect(html).not.toContain("My Note <evil>");
    expect(html).toContain("My Note \\u003cevil>");
  });

  it("includes theme CSS blocks and base layout", () => {
    expect(html).toContain('[data-theme="light"]');
    expect(html).toContain('[data-theme="midnight"]');
    expect(html).toContain("--kb-accent:");
    expect(html).toContain(".kb-board");
  });

  it("includes the header controls and containers", () => {
    [
      "kb-roundtrips", "kb-ping", "kb-refresh-tab", "kb-refresh-all",
      "kb-theme-btn", "kb-tabs", "kb-board", "kb-sort-btn",
      "kb-toggle-empty-btn", "kb-toggle-info-btn", "kb-toggle-date-action-btn"
    ].forEach(id => {
      expect(html).toContain(`id="${id}"`);
    });
  });

  it("inlines the client script", () => {
    expect(html).toContain("callAmplenotePlugin");
  });
});
