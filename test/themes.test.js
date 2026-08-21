import { THEMES, resolveTheme, buildThemeCss, themesJsonForClient } from '../lib/ui/themes.js';
import { DEFAULT_THEME_ID } from '../lib/core/constants.js';

describe("themes", () => {
  describe("registry", () => {
    it("has 8 themes with light/dark parity", () => {
      expect(THEMES).toHaveLength(8);
      expect(THEMES.filter(t => t.type === "light")).toHaveLength(4);
      expect(THEMES.filter(t => t.type === "dark")).toHaveLength(4);
    });

    it("has unique ids and includes the default", () => {
      const ids = THEMES.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toContain(DEFAULT_THEME_ID);
    });
  });

  describe("resolveTheme", () => {
    it("resolves by id and falls back to default for unknown/null", () => {
      expect(resolveTheme("dracula").id).toBe("dracula");
      expect(resolveTheme("nope").id).toBe(DEFAULT_THEME_ID);
      expect(resolveTheme(null).id).toBe(DEFAULT_THEME_ID);
    });
  });

  describe("buildThemeCss", () => {
    const css = buildThemeCss();

    it("emits a data-theme block per theme", () => {
      THEMES.forEach(t => expect(css).toContain(`[data-theme="${t.id}"]`));
    });

    it("exposes all kanban tokens in every block", () => {
      const tokenVars = [
        "--kb-bg:", "--kb-bg-header:", "--kb-bg-column:", "--kb-bg-card:",
        "--kb-text:", "--kb-text-muted:", "--kb-border:",
        "--kb-accent:", "--kb-accent-text:", "--kb-danger:", "--kb-shadow:",
      ];
      tokenVars.forEach(v => expect(css).toContain(v));
    });

    it("uses only hex/rgba color values (no unresolved placeholders)", () => {
      const declarations = css.match(/--kb-[a-z-]+:\s*([^;]+);/g) || [];
      expect(declarations.length).toBeGreaterThan(0);
      declarations.forEach(decl => {
        const value = decl.split(":")[1].trim().replace(/;$/, "");
        expect(value).toMatch(/^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))$/);
      });
    });
  });

  describe("themesJsonForClient", () => {
    it("serializes display metadata and escapes angle brackets", () => {
      const json = themesJsonForClient();
      expect(json).not.toContain("<");
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(THEMES.length);
      parsed.forEach(t => {
        expect(t).toHaveProperty("id");
        expect(t).toHaveProperty("name");
        expect(t).toHaveProperty("icon");
        expect(t).toHaveProperty("type");
      });
    });
  });
});
