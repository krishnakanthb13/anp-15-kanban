import { buildClientScript } from '../lib/ui/clientScript.js';

describe("clientScript", () => {
  const script = buildClientScript();

  it("boots from injected globals and bridges to the plugin host", () => {
    expect(script).toContain("__KANBAN_STATE__");
    expect(script).toContain("__KANBAN_THEMES__");
    expect(script).toContain("callAmplenotePlugin");
  });

  it("implements the cycling-themes standard", () => {
    expect(script).toContain('setAttribute("data-theme"');
    expect(script).toContain('"ANP_ACTIVE_THEME"');
    expect(script).toContain('"saveTheme"');
    expect(script).toContain('"t"'); // T keyboard shortcut
  });

  it("wires the phase-0 controls", () => {
    ["kb-theme-btn", "kb-refresh-tab", "kb-refresh-all", "kb-ping", "setActiveTab"].forEach(id => {
      expect(script).toContain(id);
    });
  });

  it("wires the phase-2 column controls and rich card rendering", () => {
    ["moveColumn", "renameColumn", "deleteColumn", "setWipLimit",
      "kb-card-body", "kb-card-img", "kb-over", "kb-col-btn"].forEach(id => {
      expect(script).toContain(id);
    });
  });

  it("wires the phase-3 tag-board behaviors", () => {
    ["openCard", "kb-col-dot", "kb-tag-chip"].forEach(id => {
      expect(script).toContain(id);
    });
  });

  it("wires the phase-4 tab management and date format controls", () => {
    ["addTab", "closeTab", "moveTabDir", "setDateFormat",
      "kb-tab-add", "kb-tab-tool", "kb-datefmt-btn"].forEach(id => {
      expect(script).toContain(id);
    });
  });

  it("wires the phase-5 extras (search, card menu, labels, transfer)", () => {
    ["globalSearch", "cardMenu", "moveColumnToTab",
      "kb-search", "kb-card-menu", "kb-label-chip"].forEach(id => {
      expect(script).toContain(id);
    });
  });

  it("supports the third board kind (notes boards)", () => {
    expect(script).toContain('"notes"');
    expect(script).toContain("renameNote");
  });

  it("contains no template literal interpolation that could leak server data", () => {
    expect(script).not.toContain("${");
  });

  it("compiles as valid JavaScript (guards against template-literal escape corruption)", () => {
    // new Function() parses the source without executing it. Regex literals
    // corrupted by template-literal unescaping (e.g. /["\\]/g -> /["\]/g)
    // surface here as SyntaxError instead of crashing live embeds.
    expect(() => new Function(script)).not.toThrow();
  });

  it("renders tabs, board, and meta from state", () => {
    ["renderTabs", "renderBoard", "renderMeta", "activeTabId"].forEach(fn => {
      expect(script).toContain(fn);
    });
  });
});
