import { buildThemeCss, themesJsonForClient } from "./themes.js";
import { buildClientScript } from "./clientScript.js";
import { toJsonForScript } from "../utils/html.js";

/**
 * Base layout CSS. Colors come exclusively from --kb-* theme variables so the
 * cycler can switch palettes instantly (see lib/ui/themes.js).
 * @returns {string} CSS source.
 */
function buildBaseCss() {
  return `
    * { box-sizing: border-box; }
    html, body {
        margin: 0;
        padding: 0;
        height: 100%;
    }
    body {
        font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        background: var(--kb-bg);
        color: var(--kb-text);
        display: flex;
        flex-direction: column;
        font-size: 14px;
    }
    button {
        font-family: inherit;
        cursor: pointer;
    }

    /* ---------- header ---------- */
    .kb-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: var(--kb-bg-header);
        border-bottom: 1px solid var(--kb-border);
        position: relative;
        flex: 0 0 auto;
    }
    .kb-brand {
        font-weight: 700;
        font-size: 15px;
        margin-right: auto;
        white-space: nowrap;
    }
    .kb-btn {
        background: var(--kb-bg-card);
        color: var(--kb-text);
        border: 1px solid var(--kb-border);
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 13px;
        transition: background 0.15s ease, border-color 0.15s ease;
        white-space: nowrap;
    }
    .kb-btn:hover { border-color: var(--kb-accent); }
    .kb-btn.kb-busy { opacity: 0.55; pointer-events: none; }
    .kb-roundtrips {
        font-size: 11px;
        color: var(--kb-text-muted);
        border: 1px dashed var(--kb-border);
        border-radius: 10px;
        padding: 2px 8px;
    }

    /* ---------- progress bar ---------- */
    .kb-progress {
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 3px;
        background: transparent;
        opacity: 0;
        transition: opacity 0.2s ease;
    }
    .kb-progress.kb-progress-visible { opacity: 1; }
    .kb-progress-bar {
        height: 100%;
        width: 0%;
        background: var(--kb-accent);
        transition: width 0.25s ease;
    }

    /* ---------- tabs ---------- */
    .kb-tabs {
        display: flex;
        gap: 6px;
        padding: 8px 14px 0 14px;
        overflow-x: auto;
        flex: 0 0 auto;
    }
    .kb-tab {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 220px;
        padding: 6px 12px;
        border: 1px solid var(--kb-border);
        border-bottom: none;
        border-radius: 8px 8px 0 0;
        background: var(--kb-bg-column);
        color: var(--kb-text-muted);
        font-size: 13px;
    }
    .kb-tab-active {
        background: var(--kb-bg-card);
        color: var(--kb-text);
        border-color: var(--kb-accent);
        box-shadow: inset 0 -2px 0 var(--kb-accent);
    }
    .kb-tab-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* ---------- board ---------- */
    .kb-board {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 14px 20px 14px;
        overflow-x: auto;
        flex: 1 1 auto;
        border-top: 1px solid var(--kb-border);
    }
    .kb-empty {
        margin: 40px auto;
        color: var(--kb-text-muted);
    }
    .kb-column {
        flex: 0 0 auto;
        width: 300px;
        max-height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 10px;
        box-shadow: 0 2px 8px var(--kb-shadow);
    }
    .kb-column-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-bottom: 1px solid var(--kb-border);
    }
    .kb-column-title {
        margin: 0;
        font-size: 13px;
        font-weight: 700;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .kb-count {
        font-size: 11px;
        color: var(--kb-text-muted);
        background: var(--kb-bg-card);
        border: 1px solid var(--kb-border);
        border-radius: 10px;
        padding: 1px 8px;
    }
    .kb-cards {
        padding: 8px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .kb-card {
        background: var(--kb-bg-card);
        border: 1px solid var(--kb-border);
        border-radius: 8px;
        padding: 10px;
        box-shadow: 0 1px 3px var(--kb-shadow);
        cursor: grab;
    }
    .kb-card:hover { border-color: var(--kb-accent); }
    .kb-card.kb-dragging { opacity: 0.45; }
    .kb-cards.kb-drop-hover {
        outline: 2px dashed var(--kb-accent);
        outline-offset: -2px;
        background: color-mix(in srgb, var(--kb-accent) 8%, transparent);
    }
    .kb-add-card {
        background: transparent;
        border: none;
        color: var(--kb-text-muted);
        font-size: 15px;
        line-height: 1;
        padding: 2px 6px;
        border-radius: 4px;
    }
    .kb-add-card:hover {
        background: var(--kb-accent);
        color: var(--kb-accent-text);
    }
    .kb-column-last .kb-column-title { color: var(--kb-accent); }
    .kb-card-title { font-size: 13px; }
    .kb-card-meta {
        margin-top: 4px;
        font-size: 11px;
        color: var(--kb-text-muted);
    }
    .kb-card-done .kb-card-title {
        text-decoration: line-through;
        color: var(--kb-text-muted);
    }

    /* ---------- scrollbars (theme-aware) ---------- */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-thumb {
        background: var(--kb-border);
        border-radius: 4px;
    }
    ::-webkit-scrollbar-track { background: transparent; }
    * { scrollbar-width: thin; scrollbar-color: var(--kb-border) transparent; }
  `;
}

/**
 * Assembles the complete embed HTML document for the board.
 * @param {Object} viewState - serializable state consumed by the client script.
 * @returns {string} full HTML document source.
 */
export function buildBoardHtml(viewState) {
  const stateJson = toJsonForScript(viewState);
  const themesJson = themesJsonForClient();
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kanban Board</title>
    <style>
${buildThemeCss()}
${buildBaseCss()}
    </style>
</head>
<body>
    <header class="kb-header">
        <div class="kb-brand">🗂 Kanban Board</div>
        <span id="kb-roundtrips" class="kb-roundtrips" title="Embed round trips this session">0</span>
        <button id="kb-ping" class="kb-btn" type="button">Ping</button>
        <button id="kb-refresh-tab" class="kb-btn" type="button" title="Re-pull the active tab">⟳ Tab</button>
        <button id="kb-refresh-all" class="kb-btn" type="button" title="Re-pull every tab">⇉ All</button>
        <button id="kb-theme-btn" class="kb-btn" type="button" title="Cycle themes (or press T)">
            <span id="kb-theme-icon">🎨</span> <span id="kb-theme-name">Theme</span>
        </button>
        <div class="kb-progress" id="kb-progress"><div class="kb-progress-bar" id="kb-progress-bar"></div></div>
    </header>
    <nav id="kb-tabs" class="kb-tabs"></nav>
    <main id="kb-board" class="kb-board"></main>
    <script>window.__KANBAN_THEMES__ = ${themesJson};</script>
    <script>window.__KANBAN_STATE__ = ${stateJson};</script>
    <script>
${buildClientScript()}
    </script>
</body>
</html>`;
}
