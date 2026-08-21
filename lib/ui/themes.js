import { DEFAULT_THEME_ID } from "../core/constants.js";

/**
 * Theme registry per the cross-plugin cycling-themes standard:
 * - `[data-theme="<id>"]` CSS custom properties on <html> for 0ms client-side switching
 * - cycler button + `T` keyboard shortcut
 * - localStorage persistence (client) + settings persistence (host)
 * Palettes balanced for light/dark parity (4 light, 4 dark).
 */
export const THEMES = [
  { id: "light", name: "Clean Daylight", icon: "☀️", type: "light" },
  { id: "sepia", name: "Sepia Parchment", icon: "📜", type: "light" },
  { id: "matcha", name: "Matcha Latte", icon: "🍵", type: "light" },
  { id: "nord-light", name: "Nord Frost", icon: "🧊", type: "light" },
  { id: "midnight", name: "Midnight Slate", icon: "🌌", type: "dark" },
  { id: "nord", name: "Nord Arctic", icon: "❄️", type: "dark" },
  { id: "dracula", name: "Dracula Neo", icon: "🧛", type: "dark" },
  { id: "emerald", name: "Emerald Forest", icon: "🌲", type: "dark" },
];

/**
 * Kanban design tokens per theme. All UI CSS must only reference these
 * variables — never hardcoded colors — so themes stay tunable in one place.
 *
 * Tokens:
 *   bg          app background
 *   bgHeader    header/tab bar background
 *   bgColumn    column background
 *   bgCard      card background
 *   text        primary text
 *   textMuted   secondary text
 *   border      hairline borders
 *   accent      primary accent (buttons, active tab)
 *   accentText  text/icon color on accent surfaces
 *   danger      destructive / over-limit accents
 *   shadow      box-shadow color
 */
const PALETTES = {
  light: {
    bg: "#f8fafc", bgHeader: "#ffffff", bgColumn: "#f1f5f9", bgCard: "#ffffff",
    text: "#0f172a", textMuted: "#64748b", border: "#e2e8f0",
    accent: "#2563eb", accentText: "#ffffff", danger: "#dc2626", shadow: "rgba(15, 23, 42, 0.08)",
  },
  sepia: {
    bg: "#fbf7ee", bgHeader: "#f4ede0", bgColumn: "#f0e7d8", bgCard: "#fffdf8",
    text: "#44403c", textMuted: "#78716c", border: "#e7dcc8",
    accent: "#b45309", accentText: "#ffffff", danger: "#b91c1c", shadow: "rgba(68, 64, 60, 0.10)",
  },
  matcha: {
    bg: "#f6f8f5", bgHeader: "#edf2eb", bgColumn: "#e6ede3", bgCard: "#ffffff",
    text: "#1a2e22", textMuted: "#5f7268", border: "#d8e4d4",
    accent: "#15803d", accentText: "#ffffff", danger: "#b91c1c", shadow: "rgba(26, 46, 34, 0.10)",
  },
  "nord-light": {
    bg: "#f4f6f9", bgHeader: "#e9edf2", bgColumn: "#e5ebf2", bgCard: "#ffffff",
    text: "#2e3440", textMuted: "#616e7c", border: "#d8dee9",
    accent: "#0284c7", accentText: "#ffffff", danger: "#c2410c", shadow: "rgba(46, 52, 64, 0.10)",
  },
  midnight: {
    bg: "#0b0f19", bgHeader: "#131b2e", bgColumn: "#111a2c", bgCard: "#182238",
    text: "#f1f5f9", textMuted: "#94a3b8", border: "#24304a",
    accent: "#3b82f6", accentText: "#ffffff", danger: "#f87171", shadow: "rgba(0, 0, 0, 0.40)",
  },
  nord: {
    bg: "#242933", bgHeader: "#2e3440", bgColumn: "#333a46", bgCard: "#3b4252",
    text: "#eceff4", textMuted: "#9aa5b1", border: "#434c5e",
    accent: "#88c0d0", accentText: "#212733", danger: "#bf616a", shadow: "rgba(0, 0, 0, 0.35)",
  },
  dracula: {
    bg: "#1e1f29", bgHeader: "#282a36", bgColumn: "#2b2d3a", bgCard: "#343746",
    text: "#f8f8f2", textMuted: "#9ca0b0", border: "#44475a",
    accent: "#bd93f9", accentText: "#1e1f29", danger: "#ff5555", shadow: "rgba(0, 0, 0, 0.40)",
  },
  emerald: {
    bg: "#061e16", bgHeader: "#0b2e23", bgColumn: "#0d2a20", bgCard: "#124334",
    text: "#e6f4ea", textMuted: "#93b8a5", border: "#1b4636",
    accent: "#10b981", accentText: "#06251b", danger: "#f87171", shadow: "rgba(0, 0, 0, 0.40)",
  },
};

const TOKEN_VAR_NAMES = {
  bg: "--kb-bg",
  bgHeader: "--kb-bg-header",
  bgColumn: "--kb-bg-column",
  bgCard: "--kb-bg-card",
  text: "--kb-text",
  textMuted: "--kb-text-muted",
  border: "--kb-border",
  accent: "--kb-accent",
  accentText: "--kb-accent-text",
  danger: "--kb-danger",
  shadow: "--kb-shadow",
};

/**
 * @param {string} themeId
 * @returns {Object} the theme descriptor, falling back to the default theme.
 */
export function resolveTheme(themeId) {
  return THEMES.find(t => t.id === themeId) || THEMES.find(t => t.id === DEFAULT_THEME_ID);
}

/**
 * Strict check used to validate persisted input (unlike resolveTheme, no fallback).
 * @param {string} themeId
 * @returns {boolean}
 */
export function isValidThemeId(themeId) {
  return THEMES.some(t => t.id === themeId);
}

/**
 * Builds the full `[data-theme]` CSS variable blocks for every registered theme.
 * @returns {string} CSS source.
 */
export function buildThemeCss() {
  const blocks = THEMES.map(theme => {
    const palette = PALETTES[theme.id];
    if (!palette) return "";
    const vars = Object.entries(TOKEN_VAR_NAMES)
      .map(([token, varName]) => `        ${varName}: ${palette[token]};`)
      .join("\n");
    return `    [data-theme="${theme.id}"] {\n${vars}\n    }`;
  });
  return blocks.join("\n\n");
}

/**
 * Builds a small JS snippet (for the embed client) mapping theme ids to their
 * display metadata, so the cycler button can show icon + name without a re-render.
 * @returns {string} JSON source safe for inline script embedding.
 */
export function themesJsonForClient() {
  return JSON.stringify(THEMES.map(({ id, name, icon, type }) => ({ id, name, icon, type })))
    .replace(/</g, "\\u003c");
}
