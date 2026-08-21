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
        cursor: pointer;
        user-select: none;
    }
    .kb-tab-tools {
        display: flex;
        gap: 1px;
        opacity: 0;
        transition: opacity 0.15s ease;
    }
    .kb-tab:hover .kb-tab-tools { opacity: 1; }
    .kb-tab-tool {
        background: transparent;
        border: none;
        color: inherit;
        font-size: 10px;
        line-height: 1;
        padding: 2px 3px;
        border-radius: 3px;
    }
    .kb-tab-tool:hover {
        background: var(--kb-bg-card);
        color: var(--kb-accent);
    }
    .kb-tab-add {
        flex: 0 0 auto;
        padding: 6px 12px;
        border: 1px dashed var(--kb-border);
        border-radius: 8px 8px 0 0;
        background: transparent;
        color: var(--kb-text-muted);
        font-size: 12px;
        white-space: nowrap;
    }
    .kb-tab-add:hover {
        border-color: var(--kb-accent);
        color: var(--kb-accent);
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
        cursor: pointer;
    }
    .kb-count.kb-over {
        color: var(--kb-accent-text);
        background: var(--kb-danger);
        border-color: var(--kb-danger);
        font-weight: 700;
    }
    .kb-col-tools {
        display: flex;
        gap: 2px;
        opacity: 0;
        transition: opacity 0.15s ease;
    }
    .kb-column:hover .kb-col-tools { opacity: 1; }
    .kb-col-btn {
        background: transparent;
        border: none;
        color: var(--kb-text-muted);
        font-size: 12px;
        line-height: 1;
        padding: 3px 4px;
        border-radius: 4px;
    }
    .kb-col-btn:hover {
        background: var(--kb-bg-card);
        color: var(--kb-accent);
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
    .kb-col-titlewrap {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        margin-right: auto;
    }
    .kb-col-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex: 0 0 auto;
    }
    .kb-card-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
    }
    .kb-tag-chip {
        font-size: 10px;
        color: var(--kb-text-muted);
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 8px;
        padding: 1px 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 120px;
    }
    .kb-search {
        background: var(--kb-bg-card);
        color: var(--kb-text);
        border: 1px solid var(--kb-border);
        border-radius: 6px;
        padding: 5px 10px;
        font-size: 13px;
        width: 200px;
    }
    .kb-search:focus { outline: none; border-color: var(--kb-accent); }
    .kb-card-menu {
        position: absolute;
        top: 4px;
        right: 4px;
        background: transparent;
        border: none;
        color: var(--kb-text-muted);
        font-size: 14px;
        line-height: 1;
        padding: 2px 4px;
        border-radius: 4px;
        opacity: 0;
        transition: opacity 0.15s ease;
    }
    .kb-card:hover .kb-card-menu { opacity: 1; }
    .kb-card-menu:hover {
        background: var(--kb-bg-column);
        color: var(--kb-accent);
    }
    .kb-card { position: relative; }
    .kb-card-labels {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 8px;
    }
    .kb-label-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        color: var(--kb-text-muted);
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 8px;
        padding: 1px 7px;
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .kb-label-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        flex: 0 0 auto;
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
    .kb-card-body { font-size: 13px; overflow-wrap: break-word; }
    .kb-card-body img { max-width: 100%; border-radius: 6px; }
    .kb-card-body ample-editor,
    .kb-card-body .ample-editor { display: block; }
    .kb-card-body a { color: var(--kb-accent); }
    .kb-card-img {
        display: block;
        width: 100%;
        max-height: 160px;
        object-fit: cover;
        border-radius: 6px;
        margin-top: 8px;
    }
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
        <input id="kb-search" class="kb-search" type="search" placeholder="Filter board (Enter = all notes)" spellcheck="false">
        <button id="kb-datefmt-btn" class="kb-btn" type="button" title="Date format for card chips">
            📅 <span id="kb-datefmt-label"></span>
        </button>
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
