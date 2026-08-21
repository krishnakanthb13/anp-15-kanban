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
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

    /* ---------- SVG Icons ---------- */
    .kb-icon {
        display: inline-block;
        vertical-align: middle;
        stroke-width: 2.2;
        stroke-linecap: round;
        stroke-linejoin: round;
        flex-shrink: 0;
    }
    .kb-icon-stroke {
        stroke: currentColor;
        fill: none;
    }
    .kb-icon-fill {
        fill: currentColor;
        stroke: none;
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
        display: flex;
        align-items: center;
        gap: 7px;
    }
    .kb-btn {
        background: var(--kb-bg-card);
        color: var(--kb-text);
        border: 1px solid var(--kb-border);
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 13px;
        font-weight: 500;
        transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }
    .kb-btn:hover {
        border-color: var(--kb-accent);
        color: var(--kb-accent);
    }
    .kb-btn.kb-busy { opacity: 0.55; pointer-events: none; }
    .kb-roundtrips {
        font-size: 11px;
        font-weight: 600;
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
        gap: 7px;
        max-width: 250px;
        padding: 6px 10px;
        border: 1px solid var(--kb-border);
        border-bottom: none;
        border-radius: 8px 8px 0 0;
        background: var(--kb-bg-column);
        color: var(--kb-text-muted);
        font-size: 13px;
        cursor: grab;
        user-select: none;
        transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
    }
    .kb-tab.kb-tab-dragging {
        opacity: 0.4;
        transform: scale(0.96);
    }
    .kb-tab.kb-tab-drop-hover {
        border-color: var(--kb-accent);
        background: color-mix(in srgb, var(--kb-accent) 15%, var(--kb-bg-column));
    }
    .kb-tab-badge {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        padding: 2px 5px;
        border-radius: 4px;
        line-height: 1;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 3px;
    }
    .kb-tab-badge-note {
        background: color-mix(in srgb, var(--kb-accent) 15%, transparent);
        color: var(--kb-accent);
        border: 1px solid color-mix(in srgb, var(--kb-accent) 30%, transparent);
    }
    .kb-tab-badge-tag {
        background: color-mix(in srgb, var(--kb-danger) 15%, transparent);
        color: var(--kb-danger);
        border: 1px solid color-mix(in srgb, var(--kb-danger) 30%, transparent);
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
        padding: 2px 3px;
        border-radius: 3px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
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
        font-weight: 600;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 4px;
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
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 600;
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
        font-size: 14px;
    }
    .kb-column {
        flex: 0 0 auto;
        width: 320px;
        max-height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 10px;
        box-shadow: 0 2px 8px var(--kb-shadow);
        transition: transform 0.15s ease, opacity 0.15s ease;
    }
    .kb-column.kb-col-dragging {
        opacity: 0.4;
        transform: scale(0.98);
    }
    .kb-column.kb-col-drop-hover {
        outline: 2px dashed var(--kb-accent);
        outline-offset: 2px;
    }
    .kb-column-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-bottom: 1px solid var(--kb-border);
        cursor: grab;
    }
    .kb-col-drag-handle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--kb-text-muted);
        cursor: grab;
        opacity: 0.6;
        margin-right: 4px;
        flex-shrink: 0;
    }
    .kb-col-drag-handle:hover {
        opacity: 1;
        color: var(--kb-accent);
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
        gap: 3px;
        opacity: 0;
        transition: opacity 0.15s ease;
    }
    .kb-column:hover .kb-col-tools { opacity: 1; }
    .kb-col-btn {
        background: transparent;
        border: none;
        color: var(--kb-text-muted);
        padding: 3px 4px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .kb-col-btn:hover {
        background: var(--kb-bg-card);
        color: var(--kb-accent);
    }

    /* ---------- sections (for tag boards with collapsible headers) ---------- */
    .kb-sections {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px;
        overflow-y: auto;
    }
    .kb-section {
        border: 1px solid var(--kb-border);
        border-radius: 6px;
        background: var(--kb-bg);
        overflow: hidden;
    }
    .kb-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        background: var(--kb-bg-column);
        cursor: pointer;
        user-select: none;
        font-size: 12px;
        font-weight: 600;
    }
    .kb-section-head:hover {
        background: color-mix(in srgb, var(--kb-accent) 10%, var(--kb-bg-column));
    }
    .kb-section-titlewrap {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
    }
    .kb-section-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--kb-text-muted);
    }
    .kb-section-cards {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 6px;
    }
    .kb-section-cards.kb-collapsed {
        display: none;
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
        position: relative;
    }
    .kb-card:hover { border-color: var(--kb-accent); }
    .kb-card.kb-dragging { opacity: 0.45; }
    .kb-cards.kb-drop-hover,
    .kb-section-cards.kb-drop-hover {
        outline: 2px dashed var(--kb-accent);
        outline-offset: -2px;
        background: color-mix(in srgb, var(--kb-accent) 8%, transparent);
    }

    /* ---------- card badges & metadata ---------- */
    .kb-task-badges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        margin-bottom: 6px;
    }
    .kb-badge {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
        line-height: 1.2;
        display: inline-flex;
        align-items: center;
        gap: 3px;
    }
    .kb-badge-urgent {
        background: color-mix(in srgb, var(--kb-danger) 15%, transparent);
        color: var(--kb-danger);
        border: 1px solid var(--kb-danger);
    }
    .kb-badge-important {
        background: color-mix(in srgb, var(--kb-accent) 15%, transparent);
        color: var(--kb-accent);
        border: 1px solid var(--kb-accent);
    }
    .kb-badge-score {
        background: var(--kb-bg-column);
        color: var(--kb-text-muted);
        border: 1px solid var(--kb-border);
    }
    .kb-badge-subtask {
        background: color-mix(in srgb, var(--kb-accent) 12%, transparent);
        border: 1px solid var(--kb-border);
        color: var(--kb-text);
    }

    .kb-col-titlewrap {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        margin-right: auto;
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
        width: 180px;
    }
    .kb-search:focus { outline: none; border-color: var(--kb-accent); }
    
    .kb-card-actions {
        position: absolute;
        top: 6px;
        right: 6px;
        display: flex;
        align-items: center;
        gap: 3px;
        opacity: 0;
        transition: opacity 0.15s ease;
    }
    .kb-card:hover .kb-card-actions { opacity: 1; }
    
    .kb-card-menu,
    .kb-card-info-btn {
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        color: var(--kb-text-muted);
        padding: 3px 5px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .kb-card-menu:hover,
    .kb-card-info-btn:hover {
        background: var(--kb-bg-card);
        color: var(--kb-accent);
        border-color: var(--kb-accent);
    }

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
        padding: 3px 6px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .kb-add-card:hover {
        background: var(--kb-accent);
        color: var(--kb-accent-text);
    }
    .kb-column-last .kb-column-title { color: var(--kb-accent); }
    .kb-card-title { font-size: 13px; font-weight: 500; }
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
        margin-top: 6px;
        font-size: 11px;
        color: var(--kb-text-muted);
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
    }
    .kb-card-meta-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }
    .kb-card-done .kb-card-title {
        text-decoration: line-through;
        color: var(--kb-text-muted);
    }

    /* ---------- task info details card ---------- */
    .kb-task-details {
        margin-top: 8px;
        padding: 8px;
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 6px;
        font-size: 11px;
        line-height: 1.5;
    }
    .kb-task-details hr {
        border: none;
        border-top: 1px solid var(--kb-border);
        margin: 6px 0;
    }

    /* ---------- toasts ---------- */
    .kb-toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
    }
    .kb-toast {
        background: var(--kb-bg-header);
        color: var(--kb-text);
        border: 1px solid var(--kb-border);
        border-left: 3px solid var(--kb-accent);
        border-radius: 6px;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 500;
        box-shadow: 0 4px 12px var(--kb-shadow);
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.2s ease, transform 0.2s ease;
        pointer-events: auto;
    }
    .kb-toast.kb-toast-visible {
        opacity: 1;
        transform: translateY(0);
    }

    /* ---------- scrollbars ---------- */
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
        <div class="kb-brand">
            <svg class="kb-icon kb-icon-stroke" width="18" height="18" viewBox="0 0 24 24"><rect x="3" y="3" width="5" height="18" rx="1"></rect><rect x="10" y="3" width="5" height="12" rx="1"></rect><rect x="17" y="3" width="5" height="16" rx="1"></rect></svg>
            <span>Kanban Board</span>
        </div>
        <span id="kb-roundtrips" class="kb-roundtrips" title="Embed round trips this session">0</span>
        <button id="kb-ping" class="kb-btn" type="button" title="Test embed connection">
            <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            <span>Ping</span>
        </button>
        <button id="kb-refresh-tab" class="kb-btn" type="button" title="Re-pull the active tab">
            <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            <span>Tab</span>
        </button>
        <button id="kb-refresh-all" class="kb-btn" type="button" title="Re-pull every tab">
            <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
            <span>All</span>
        </button>
        <button id="kb-sort-btn" class="kb-btn" type="button" title="Cycle card sorting">
            <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><path d="M7 15l5 5 5-5"></path><path d="M7 9l5-5 5 5"></path></svg>
            <span id="kb-sort-label">Sort: Note Order</span>
        </button>
        <button id="kb-save-sort-btn" class="kb-btn" type="button" style="display:none;" title="Save active card sort order into note markdown">
            <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <span>Save Sort</span>
        </button>
        <button id="kb-save-cols-btn" class="kb-btn" type="button" style="display:none;" title="Save dragged column order into note headings">
            <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <span>Save Columns</span>
        </button>
        <button id="kb-reset-cols-btn" class="kb-btn" type="button" style="display:none;" title="Reset columns to original source note order">
            <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
            <span>Reset Columns</span>
        </button>
        <button id="kb-reset-sort-btn" class="kb-btn" type="button" style="display:none;" title="Reset dashboard to original note order">
            <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
            <span>Reset Sort</span>
        </button>
        <input id="kb-search" class="kb-search" type="search" placeholder="Filter cards (Press / to focus)" spellcheck="false">
        <button id="kb-datefmt-btn" class="kb-btn" type="button" title="Date format for card chips">
            <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span id="kb-datefmt-label"></span>
        </button>
        <button id="kb-theme-btn" class="kb-btn" type="button" title="Cycle themes (or press T)">
            <span id="kb-theme-icon">🎨</span> <span id="kb-theme-name">Theme</span>
        </button>
        <div class="kb-progress" id="kb-progress"><div class="kb-progress-bar" id="kb-progress-bar"></div></div>
    </header>
    <nav id="kb-tabs" class="kb-tabs"></nav>
    <main id="kb-board" class="kb-board"></main>
    <div id="kb-toasts" class="kb-toast-container"></div>
    <script>window.__KANBAN_THEMES__ = ${themesJson};</script>
    <script>window.__KANBAN_STATE__ = ${stateJson};</script>
    <script>
${buildClientScript()}
    </script>
</body>
</html>`;
}
