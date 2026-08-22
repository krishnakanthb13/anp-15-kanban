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
        width: 100%;
        overflow: hidden;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
    }
    body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background: var(--kb-bg);
        color: var(--kb-text);
        display: flex;
        flex-direction: column;
        font-size: 13.5px;
        line-height: 1.45;
        height: 100%;
        max-height: 100%;
        overflow: hidden;
    }
    button, input, select, textarea {
        font-family: inherit;
    }
    button {
        cursor: pointer;
    }
    :focus-visible {
        outline: 2px solid var(--kb-accent);
        outline-offset: 2px;
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
        justify-content: space-between;
        gap: 16px;
        padding: 9px 18px;
        background: var(--kb-bg-header);
        border-bottom: 1px solid var(--kb-border);
        position: sticky;
        top: 0;
        z-index: 100;
        flex: 0 0 auto;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
    }
    .kb-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 0 0 auto;
    }
    .kb-header-center {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1 1 auto;
        max-width: 480px;
        min-width: 220px;
    }
    .kb-header-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 0 auto;
    }
    .kb-btn-group {
        display: inline-flex;
        align-items: center;
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 8px;
        padding: 2px;
        gap: 2px;
    }
    .kb-btn-group .kb-btn {
        border: none;
        background: transparent;
        border-radius: 6px;
        padding: 5px 10px;
        box-shadow: none;
    }
    .kb-btn-group .kb-btn:hover {
        background: var(--kb-bg-card);
        color: var(--kb-accent);
        box-shadow: 0 1px 3px var(--kb-shadow);
    }
    .kb-select-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
    }
    .kb-select-icon {
        position: absolute;
        left: 8px;
        pointer-events: none;
        color: var(--kb-text-muted);
        display: flex;
        align-items: center;
        z-index: 2;
    }
    .kb-select-arrow {
        position: absolute;
        right: 8px;
        pointer-events: none;
        color: var(--kb-text-muted);
        display: flex;
        align-items: center;
        z-index: 2;
    }
    .kb-select {
        background: var(--kb-bg-card);
        color: var(--kb-text);
        border: 1px solid var(--kb-border);
        border-radius: 7px;
        padding: 5px 22px 5px 26px;
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 500;
        cursor: pointer;
        outline: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        line-height: 1.4;
        color-scheme: light dark;
    }
    .kb-select:hover {
        border-color: var(--kb-accent);
        color: var(--kb-accent);
        background: color-mix(in srgb, var(--kb-accent) 6%, var(--kb-bg-card));
    }
    .kb-select:focus {
        border-color: var(--kb-accent);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--kb-accent) 22%, transparent);
    }
    .kb-select option {
        background-color: var(--kb-bg-card) !important;
        color: var(--kb-text) !important;
        font-family: inherit;
        font-size: 12.5px;
        padding: 6px 10px;
    }
    .kb-btn-group .kb-select-wrap .kb-select {
        border: none;
        background: transparent;
        color: var(--kb-text-muted);
        border-radius: 6px;
        padding: 5px 22px 5px 24px;
        box-shadow: none;
    }
    .kb-btn-group .kb-select-wrap:hover .kb-select,
    .kb-btn-group .kb-select-wrap:focus-within .kb-select {
        background: var(--kb-bg-card);
        color: var(--kb-accent);
        box-shadow: 0 1px 3px var(--kb-shadow);
    }
    .kb-btn-group .kb-select-wrap .kb-select.kb-select-active {
        background: var(--kb-bg-card);
        color: var(--kb-accent);
        font-weight: 600;
        box-shadow: 0 1px 3px var(--kb-shadow);
    }
    .kb-btn-group .kb-select-wrap:hover .kb-select-icon,
    .kb-btn-group .kb-select-wrap:hover .kb-select-arrow,
    .kb-btn-group .kb-select-wrap:focus-within .kb-select-icon,
    .kb-btn-group .kb-select-wrap:focus-within .kb-select-arrow {
        color: var(--kb-accent);
    }
    .kb-search-wrap {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 440px;
        min-width: 240px;
    }
    .kb-search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--kb-text-muted);
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        z-index: 2;
        opacity: 0.75;
    }
    .kb-search-shortcut {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 11px;
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 600;
        color: var(--kb-text-muted);
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 4px;
        padding: 1px 6px;
        pointer-events: none;
        user-select: none;
        line-height: 1.3;
        z-index: 2;
    }
    .kb-search {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        height: 36px !important;
        background: var(--kb-bg-card);
        color: var(--kb-text);
        border: 1px solid var(--kb-border);
        border-radius: 8px;
        padding: 0 38px 0 38px !important;
        font-size: 13px;
        line-height: 34px;
        box-shadow: 0 1px 2px var(--kb-shadow);
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    }
    .kb-search::-webkit-search-decoration,
    .kb-search::-webkit-search-cancel-button,
    .kb-search::-webkit-search-results-button,
    .kb-search::-webkit-search-results-decoration {
        display: none;
    }
    .kb-search::placeholder {
        color: var(--kb-text-muted);
        opacity: 0.75;
    }
    .kb-search:focus {
        border-color: var(--kb-accent);
        background: var(--kb-bg-card);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--kb-accent) 22%, transparent), 0 2px 6px var(--kb-shadow);
    }
    .kb-search:focus ~ .kb-search-shortcut {
        opacity: 0.4;
    }
    .kb-brand {
        font-weight: 700;
        font-size: 14.5px;
        letter-spacing: -0.01em;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 7px;
        color: var(--kb-text);
    }
    .kb-btn {
        background: var(--kb-bg-card);
        color: var(--kb-text);
        border: 1px solid var(--kb-border);
        border-radius: 7px;
        padding: 5px 10px;
        font-size: 12.5px;
        font-weight: 500;
        transition: background 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                    border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                    color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                    transform 0.1s ease,
                    box-shadow 0.15s ease;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        user-select: none;
    }
    .kb-btn:hover {
        border-color: var(--kb-accent);
        color: var(--kb-accent);
        background: color-mix(in srgb, var(--kb-accent) 6%, var(--kb-bg-card));
        transform: translateY(-1px);
        box-shadow: 0 2px 5px var(--kb-shadow);
    }
    .kb-btn:active {
        transform: translateY(0) scale(0.98);
        box-shadow: none;
    }
    .kb-btn.kb-btn-active {
        background: color-mix(in srgb, var(--kb-accent) 16%, var(--kb-bg-card));
        color: var(--kb-accent);
        border-color: var(--kb-accent);
        font-weight: 600;
    }
    .kb-btn-group .kb-btn.kb-btn-active {
        background: var(--kb-bg-card);
        color: var(--kb-accent);
        border-color: var(--kb-accent);
        box-shadow: 0 1px 3px var(--kb-shadow);
    }
    .kb-btn.kb-busy {
        opacity: 0.55;
        pointer-events: none;
    }
    .kb-roundtrips {
        font-size: 11px;
        font-weight: 600;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        color: var(--kb-text-muted);
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 12px;
        padding: 2px 8px;
        letter-spacing: 0.02em;
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
        overflow: hidden;
    }
    .kb-progress.kb-progress-visible { opacity: 1; }
    .kb-progress-bar {
        height: 100%;
        width: 0%;
        background: var(--kb-accent);
        transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ---------- tabs ---------- */
    .kb-tabs {
        display: flex;
        gap: 6px;
        padding: 8px 16px 0 16px;
        overflow-x: auto;
        flex: 0 0 auto;
        scrollbar-width: none;
    }
    .kb-tabs::-webkit-scrollbar { display: none; }
    .kb-tab {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        max-width: 250px;
        padding: 7px 12px;
        border: 1px solid var(--kb-border);
        border-bottom: none;
        border-radius: 8px 8px 0 0;
        background: var(--kb-bg-column);
        color: var(--kb-text-muted);
        font-size: 12.5px;
        font-weight: 500;
        cursor: grab;
        user-select: none;
        transition: background 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                    border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                    color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                    transform 0.15s ease;
        position: relative;
        overflow: hidden;
    }
    .kb-tab:hover {
        color: var(--kb-text);
        background: color-mix(in srgb, var(--kb-accent) 6%, var(--kb-bg-column));
        border-color: color-mix(in srgb, var(--kb-accent) 40%, var(--kb-border));
    }
    .kb-tab.kb-tab-dragging {
        opacity: 0.4;
        transform: scale(0.96);
    }
    .kb-tab.kb-tab-drop-hover {
        border-color: var(--kb-accent);
        background: color-mix(in srgb, var(--kb-accent) 15%, var(--kb-bg-column));
        transform: translateY(-2px);
    }
    .kb-tab.kb-tab-drop-before::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--kb-accent);
        box-shadow: 0 0 8px var(--kb-accent);
        z-index: 10;
        pointer-events: none;
    }
    .kb-tab.kb-tab-drop-after::after {
        content: "";
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--kb-accent);
        box-shadow: 0 0 8px var(--kb-accent);
        z-index: 10;
        pointer-events: none;
    }
    .kb-tab-badge {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.04em;
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
        background: color-mix(in srgb, var(--kb-accent) 14%, transparent);
        color: var(--kb-accent);
        border: 1px solid color-mix(in srgb, var(--kb-accent) 28%, transparent);
    }
    .kb-tab-badge-notes {
        background: color-mix(in srgb, #8b5cf6 16%, transparent);
        color: color-mix(in srgb, #8b5cf6 85%, var(--kb-text));
        border: 1px solid color-mix(in srgb, #8b5cf6 35%, transparent);
    }
    .kb-tab-badge-tag {
        background: color-mix(in srgb, var(--kb-danger) 14%, transparent);
        color: var(--kb-danger);
        border: 1px solid color-mix(in srgb, var(--kb-danger) 28%, transparent);
    }
    .kb-tab-tools {
        position: absolute;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 1px;
        padding: 1px 3px;
        background: var(--kb-bg-card);
        border: 1px solid var(--kb-border);
        border-radius: 5px;
        box-shadow: 0 1px 4px var(--kb-shadow);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
        z-index: 2;
    }
    .kb-tab:hover .kb-tab-tools {
        opacity: 1;
        pointer-events: auto;
    }
    .kb-tab-tool {
        background: transparent;
        border: none;
        color: var(--kb-text-muted);
        padding: 2px 3px;
        border-radius: 3px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.12s ease, color 0.12s ease;
    }
    .kb-tab-tool:hover {
        background: color-mix(in srgb, var(--kb-accent) 15%, var(--kb-bg-card));
        color: var(--kb-accent);
    }
    .kb-tab-add {
        flex: 0 0 auto;
        padding: 7px 12px;
        border: 1px dashed var(--kb-border);
        border-bottom: none;
        border-radius: 8px 8px 0 0;
        background: transparent;
        color: var(--kb-text-muted);
        font-size: 12.5px;
        font-weight: 600;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
    }
    .kb-tab-add:hover {
        border-color: var(--kb-accent);
        color: var(--kb-accent);
        background: color-mix(in srgb, var(--kb-accent) 6%, transparent);
    }
    .kb-tab-active {
        background: var(--kb-bg-card);
        color: var(--kb-text);
        border-color: var(--kb-border);
        border-top: 2px solid var(--kb-accent);
        box-shadow: 0 -2px 8px var(--kb-shadow);
        font-weight: 600;
    }
    .kb-tab-name {
        max-width: 170px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* ---------- density modes (compact, cozy, spacious) ---------- */
    :root {
        --kb-board-gap: 10px;
        --kb-board-pad: 6px 10px 8px 10px;
        --kb-col-w: clamp(250px, 20vw, 320px);
        --kb-col-min-w: 230px;
        --kb-col-max-w: 360px;
        --kb-col-head-pad: 6px 9px;
        --kb-sec-gap: 4px;
        --kb-sec-pad: 4px 4px 6px 4px;
        --kb-sec-head-pad: 4px 7px;
        --kb-card-gap: 4px;
        --kb-card-pad: 6px 8px;
        --kb-card-font: 12px;
        --kb-card-title-font: 12.5px;
        --kb-card-radius: 6px;
        --kb-badge-font: 9.5px;
        --kb-badge-pad: 1px 4px;
    }
    body.kb-density-compact {
        --kb-board-gap: 6px;
        --kb-board-pad: 4px 6px 6px 6px;
        --kb-col-w: clamp(220px, 16vw, 270px);
        --kb-col-min-w: 200px;
        --kb-col-max-w: 300px;
        --kb-col-head-pad: 3px 6px;
        --kb-sec-gap: 3px;
        --kb-sec-pad: 2px 2px 4px 2px;
        --kb-sec-head-pad: 2px 5px;
        --kb-card-gap: 3px;
        --kb-card-pad: 4px 6px;
        --kb-card-font: 11px;
        --kb-card-title-font: 11.5px;
        --kb-card-radius: 4px;
        --kb-badge-font: 9px;
        --kb-badge-pad: 0 3px;
    }
    body.kb-density-cozy {
        --kb-board-gap: 10px;
        --kb-board-pad: 6px 10px 8px 10px;
        --kb-col-w: clamp(250px, 20vw, 320px);
        --kb-col-min-w: 230px;
        --kb-col-max-w: 360px;
        --kb-col-head-pad: 6px 9px;
        --kb-sec-gap: 4px;
        --kb-sec-pad: 4px 4px 6px 4px;
        --kb-sec-head-pad: 4px 7px;
        --kb-card-gap: 4px;
        --kb-card-pad: 6px 8px;
        --kb-card-font: 12px;
        --kb-card-title-font: 12.5px;
        --kb-card-radius: 6px;
        --kb-badge-font: 9.5px;
        --kb-badge-pad: 1px 4px;
    }
    body.kb-density-spacious {
        --kb-board-gap: 14px;
        --kb-board-pad: 10px 12px 12px 12px;
        --kb-col-w: clamp(280px, 24vw, 370px);
        --kb-col-min-w: 260px;
        --kb-col-max-w: 420px;
        --kb-col-head-pad: 8px 11px;
        --kb-sec-gap: 6px;
        --kb-sec-pad: 6px 6px 10px 6px;
        --kb-sec-head-pad: 6px 9px;
        --kb-card-gap: 6px;
        --kb-card-pad: 8px 10px;
        --kb-card-font: 13px;
        --kb-card-title-font: 13.5px;
        --kb-card-radius: 8px;
        --kb-badge-font: 10px;
        --kb-badge-pad: 1px 5px;
    }

    /* ---------- board ---------- */
    .kb-board {
        display: flex;
        align-items: flex-start;
        gap: var(--kb-board-gap);
        padding: var(--kb-board-pad);
        overflow-x: auto;
        overflow-y: hidden;
        flex: 1 1 0;
        min-height: 0;
        height: auto;
        border-top: 1px solid var(--kb-border);
    }
    .kb-empty {
        margin: 48px auto;
        color: var(--kb-text-muted);
        font-size: 13.5px;
        line-height: 1.5;
        text-align: center;
        background: var(--kb-bg-column);
        border: 1.5px dashed var(--kb-border);
        border-radius: 12px;
        padding: 24px 32px;
        max-width: 480px;
        box-shadow: 0 2px 8px var(--kb-shadow);
        align-self: flex-start;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
    }
    .kb-empty-msg {
        color: var(--kb-text);
        font-weight: 500;
    }
    .kb-empty-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
    }
    .kb-empty-btn {
        background: color-mix(in srgb, var(--kb-accent) 10%, var(--kb-bg-card));
        border: 1px solid color-mix(in srgb, var(--kb-accent) 35%, var(--kb-border));
        color: var(--kb-accent);
        font-size: 12px;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
    }
    .kb-empty-btn:hover {
        background: var(--kb-accent);
        color: var(--kb-bg);
        border-color: var(--kb-accent);
        transform: translateY(-1px);
        box-shadow: 0 2px 6px var(--kb-shadow);
    }
    .kb-column {
        position: relative;
        flex: 0 0 var(--kb-col-w);
        width: var(--kb-col-w);
        min-width: var(--kb-col-min-w);
        max-width: var(--kb-col-max-w);
        max-height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 10px;
        box-shadow: 0 2px 8px var(--kb-shadow);
        transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease;
        min-height: 0;
    }
    .kb-column.kb-col-dragging {
        opacity: 0.4;
        transform: scale(0.98);
    }
    .kb-column.kb-col-drop-hover {
        outline: 2px dashed var(--kb-accent);
        outline-offset: 3px;
    }
    .kb-column.kb-col-drop-before::before {
        content: "";
        position: absolute;
        left: -6px;
        top: 0;
        bottom: 0;
        width: 4px;
        background: var(--kb-accent);
        border-radius: 4px;
        box-shadow: 0 0 12px 2px var(--kb-accent);
        z-index: 50;
        pointer-events: none;
    }
    .kb-column.kb-col-drop-after::after {
        content: "";
        position: absolute;
        right: -6px;
        top: 0;
        bottom: 0;
        width: 4px;
        background: var(--kb-accent);
        border-radius: 4px;
        box-shadow: 0 0 12px 2px var(--kb-accent);
        z-index: 50;
        pointer-events: none;
    }
    .kb-column-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        padding: var(--kb-col-head-pad);
        border-bottom: 1px solid var(--kb-border);
        cursor: grab;
        border-radius: 10px 10px 0 0;
        background: color-mix(in srgb, var(--kb-bg-card) 30%, var(--kb-bg-column));
        position: relative;
    }
    .kb-col-titlewrap {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        flex: 1 1 auto;
        overflow: hidden;
    }
    .kb-col-drag-handle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--kb-text-muted);
        cursor: grab;
        opacity: 0.5;
        flex-shrink: 0;
        transition: opacity 0.15s ease, color 0.15s ease;
    }
    .kb-col-drag-handle:hover {
        opacity: 1;
        color: var(--kb-accent);
    }
    .kb-column-title {
        margin: 0;
        font-size: 13.5px;
        font-weight: 700;
        letter-spacing: -0.01em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1 1 auto;
        min-width: 0;
    }
    .kb-col-actions {
        display: flex;
        align-items: center;
        gap: 5px;
        flex-shrink: 0;
        margin-left: auto;
    }
    .kb-count {
        font-size: 11px;
        font-weight: 600;
        color: var(--kb-text-muted);
        background: var(--kb-bg-card);
        border: 1px solid var(--kb-border);
        border-radius: 10px;
        padding: 1px 7px;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.15s ease;
    }
    .kb-count:hover {
        border-color: var(--kb-accent);
        color: var(--kb-accent);
    }
    .kb-count.kb-over {
        color: var(--kb-accent-text);
        background: var(--kb-danger);
        border-color: var(--kb-danger);
        font-weight: 700;
        animation: kb-pulse 2s infinite ease-in-out;
    }
    @keyframes kb-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }
    .kb-add-card {
        background: transparent;
        border: 1px dashed var(--kb-border);
        color: var(--kb-text-muted);
        width: 22px;
        height: 22px;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.15s ease;
    }
    .kb-add-card:hover {
        background: var(--kb-bg-card);
        border-color: var(--kb-accent);
        color: var(--kb-accent);
        border-style: solid;
        transform: scale(1.08);
    }
    .kb-col-tools {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 1px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
        padding: 1px 3px;
        border-radius: 5px;
        background: var(--kb-bg-card);
        border: 1px solid var(--kb-border);
        box-shadow: 0 1px 4px var(--kb-shadow);
        z-index: 10;
    }
    .kb-column:hover .kb-col-tools,
    .kb-column-head:hover .kb-col-tools {
        opacity: 1;
        pointer-events: auto;
    }
    .kb-col-btn {
        background: transparent;
        border: none;
        color: var(--kb-text-muted);
        padding: 2px 3px;
        border-radius: 3px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.12s ease, color 0.12s ease;
    }
    .kb-col-btn:hover {
        background: color-mix(in srgb, var(--kb-accent) 15%, var(--kb-bg-card));
        color: var(--kb-accent);
    }

    /* ---------- add column group at right end of board ---------- */
    .kb-add-column-group {
        flex: 0 0 clamp(160px, 14vw, 210px);
        width: clamp(160px, 14vw, 210px);
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-self: flex-start;
    }
    .kb-add-column-card {
        width: 100%;
        min-height: auto;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: color-mix(in srgb, var(--kb-bg-column) 50%, transparent);
        border: 1.5px dashed var(--kb-border);
        border-radius: 8px;
        padding: 8px 12px;
        cursor: pointer;
        color: var(--kb-text-muted);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        box-sizing: border-box;
    }
    .kb-add-column-card:hover {
        border-color: var(--kb-accent);
        color: var(--kb-accent);
        background: color-mix(in srgb, var(--kb-accent) 6%, var(--kb-bg-column));
        transform: translateY(-1px);
        box-shadow: 0 2px 8px var(--kb-shadow);
    }
    .kb-add-column-card .kb-add-column-icon {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1px dashed currentColor;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.2s ease, border-style 0.2s ease;
    }
    .kb-add-column-card:hover .kb-add-column-icon {
        transform: scale(1.1);
        border-style: solid;
        background: color-mix(in srgb, var(--kb-accent) 15%, transparent);
    }
    .kb-add-column-card .kb-add-column-label {
        font-size: 11.5px;
        font-weight: 600;
        letter-spacing: -0.01em;
    }
    .kb-add-column-card .kb-add-column-sub {
        display: none;
    }

    /* ---------- sections (for tag boards with collapsible headers) ---------- */
    .kb-sections {
        display: flex;
        flex-direction: column;
        gap: var(--kb-sec-gap);
        padding: var(--kb-sec-pad);
        overflow-y: auto;
        flex: 1 1 auto;
        min-height: 0;
        scrollbar-width: thin;
    }
    .kb-section {
        border: 1px solid var(--kb-border);
        border-radius: 8px;
        background: var(--kb-bg);
        overflow: visible;
        box-shadow: 0 1px 3px var(--kb-shadow);
        flex-shrink: 0;
    }
    .kb-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--kb-sec-head-pad);
        background: var(--kb-bg-column);
        cursor: pointer;
        user-select: none;
        font-size: 11.5px;
        font-weight: 600;
        border-radius: 8px 8px 0 0;
        transition: background 0.15s ease;
    }
    .kb-section-head:hover {
        background: color-mix(in srgb, var(--kb-accent) 10%, var(--kb-bg-column));
    }
    .kb-section-titlewrap {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        flex: 1 1 auto;
        overflow: hidden;
    }
    .kb-section-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .kb-section-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
        margin-left: auto;
    }
    .kb-section-tools {
        display: flex;
        align-items: center;
        gap: 1px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
        padding: 1px 2px;
        border-radius: 5px;
        background: var(--kb-bg-card);
        border: 1px solid var(--kb-border);
        box-shadow: 0 1px 3px var(--kb-shadow);
    }
    .kb-section:hover .kb-section-tools {
        opacity: 1;
        pointer-events: auto;
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
        gap: var(--kb-card-gap);
        padding: 5px;
        min-height: fit-content;
    }
    .kb-section-cards.kb-collapsed {
        display: none;
    }

    /* ---------- add header button/card inside note column (tag/notes tab) ---------- */
    .kb-add-header-card {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 3px 6px;
        background: color-mix(in srgb, var(--kb-bg-column) 60%, transparent);
        border: 1px dashed var(--kb-border);
        border-radius: 5px;
        cursor: pointer;
        color: var(--kb-text-muted);
        font-size: 10.5px;
        font-weight: 600;
        transition: all 0.15s ease;
        user-select: none;
        margin-top: 1px;
        margin-bottom: 1px;
        flex: 0 0 auto;
    }
    .kb-add-header-card:hover {
        border-color: var(--kb-accent);
        color: var(--kb-accent);
        background: color-mix(in srgb, var(--kb-accent) 8%, var(--kb-bg-card));
        border-style: solid;
        box-shadow: 0 1px 4px var(--kb-shadow);
    }
    .kb-add-header-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .kb-cards {
        padding: var(--kb-sec-pad);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: var(--kb-card-gap);
        flex: 1 1 auto;
        min-height: 0;
        scrollbar-width: thin;
    }

    /* ---------- custom scrollbars for smooth scrolling ---------- */
    .kb-board::-webkit-scrollbar {
        height: 10px;
    }
    .kb-board::-webkit-scrollbar-track {
        background: color-mix(in srgb, var(--kb-bg) 70%, transparent);
        border-radius: 5px;
    }
    .kb-board::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--kb-border) 80%, transparent);
        border-radius: 5px;
        border: 2px solid transparent;
        background-clip: content-box;
    }
    .kb-board::-webkit-scrollbar-thumb:hover {
        background: var(--kb-text-muted);
        border: 2px solid transparent;
        background-clip: content-box;
    }
    .kb-sections::-webkit-scrollbar,
    .kb-cards::-webkit-scrollbar {
        width: 6px;
    }
    .kb-sections::-webkit-scrollbar-track,
    .kb-cards::-webkit-scrollbar-track {
        background: transparent;
    }
    .kb-sections::-webkit-scrollbar-thumb,
    .kb-cards::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--kb-border) 90%, transparent);
        border-radius: 3px;
    }
    .kb-sections::-webkit-scrollbar-thumb:hover,
    .kb-cards::-webkit-scrollbar-thumb:hover {
        background: var(--kb-text-muted);
    }
    .kb-card {
        background: var(--kb-bg-card);
        border: 1px solid var(--kb-border);
        border-radius: var(--kb-card-radius);
        padding: var(--kb-card-pad);
        font-size: var(--kb-card-font);
        box-shadow: 0 1px 3px var(--kb-shadow);
        cursor: grab;
        position: relative;
        flex-shrink: 0;
        min-height: fit-content;
        word-break: break-word;
        overflow-wrap: break-word;
        transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1),
                    border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .kb-card:hover {
        border-color: color-mix(in srgb, var(--kb-accent) 60%, var(--kb-border));
        transform: translateY(-2px);
        box-shadow: 0 6px 16px var(--kb-shadow);
    }
    .kb-card.kb-dragging {
        opacity: 0.45;
        transform: scale(0.98) rotate(1deg);
        cursor: grabbing;
    }
    .kb-card.kb-card-drop-before::before {
        content: "";
        position: absolute;
        top: calc(var(--kb-card-gap) * -0.5 - 1px);
        left: 0;
        right: 0;
        height: 3px;
        background: var(--kb-accent);
        border-radius: 2px;
        box-shadow: 0 0 8px var(--kb-accent);
        z-index: 15;
        pointer-events: none;
    }
    .kb-card.kb-card-drop-after::after {
        content: "";
        position: absolute;
        bottom: calc(var(--kb-card-gap) * -0.5 - 1px);
        left: 0;
        right: 0;
        height: 3px;
        background: var(--kb-accent);
        border-radius: 2px;
        box-shadow: 0 0 8px var(--kb-accent);
        z-index: 15;
        pointer-events: none;
    }
    .kb-cards.kb-drop-hover,
    .kb-section-cards.kb-drop-hover {
        outline: 2px dashed var(--kb-accent);
        outline-offset: -2px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--kb-accent) 8%, transparent);
    }

    /* ---------- card badges & metadata ---------- */
    .kb-task-badges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        margin-bottom: 5px;
    }
    .kb-badge {
        font-size: var(--kb-badge-font);
        font-weight: 600;
        border-radius: 4px;
        padding: var(--kb-badge-pad);
        display: inline-flex;
        align-items: center;
        gap: 3px;
        line-height: 1.2;
    }
    .kb-badge-urgent {
        background: color-mix(in srgb, var(--kb-urgent) 14%, transparent);
        color: var(--kb-urgent);
        border: 1px solid color-mix(in srgb, var(--kb-urgent) 30%, transparent);
    }
    .kb-badge-important {
        background: color-mix(in srgb, var(--kb-important) 14%, transparent);
        color: var(--kb-important);
        border: 1px solid color-mix(in srgb, var(--kb-important) 30%, transparent);
    }
    .kb-badge-score {
        background: color-mix(in srgb, var(--kb-accent) 12%, transparent);
        color: var(--kb-accent);
        font-family: 'JetBrains Mono', monospace;
        font-weight: 600;
    }
    .kb-badge-note {
        background: var(--kb-bg-column);
        color: var(--kb-text-muted);
        border: 1px solid var(--kb-border);
        font-size: 10px;
        max-width: 130px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .kb-badge-check {
        cursor: pointer;
        padding: 0 4px;
        border-radius: 4px;
        transition: background 0.12s ease, transform 0.1s ease;
    }
    .kb-badge-check:hover {
        background: color-mix(in srgb, var(--kb-accent) 20%, transparent);
        transform: scale(1.15);
    }

    .kb-card-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 3px;
        margin-top: 5px;
    }
    .kb-tag-chip {
        font-size: 10px;
        color: var(--kb-text-muted);
        background: color-mix(in srgb, var(--kb-text-muted) 10%, transparent);
        padding: 1px 6px;
        border-radius: 8px;
    }
    .kb-search {
        background: var(--kb-bg-card);
        color: var(--kb-text);
        border: 1px solid var(--kb-border);
        border-radius: 7px;
        padding: 6px 12px;
        font-size: 12.5px;
        width: 190px;
        transition: border-color 0.15s ease, box-shadow 0.15s ease, width 0.2s ease;
    }
    .kb-search::placeholder {
        color: var(--kb-text-muted);
        opacity: 0.8;
    }
    .kb-search:focus {
        outline: none;
        border-color: var(--kb-accent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--kb-accent) 20%, transparent);
        width: 220px;
    }
    
    .kb-card-actions {
        position: absolute;
        top: 6px;
        right: 6px;
        display: flex;
        align-items: center;
        gap: 1px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
        background: var(--kb-bg-card);
        border-radius: 6px;
        padding: 1px 2px;
        box-shadow: 0 1px 4px var(--kb-shadow);
        border: 1px solid var(--kb-border);
    }
    .kb-card:hover .kb-card-actions {
        opacity: 1;
        pointer-events: auto;
    }
    
    .kb-card-menu,
    .kb-card-info-btn,
    .kb-card-at-btn {
        background: transparent;
        border: none;
        color: var(--kb-text-muted);
        padding: 2px 4px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.12s ease, color 0.12s ease;
    }
    .kb-card-at-btn {
        font-size: 11.5px;
        font-weight: 700;
        line-height: 1;
        color: var(--kb-accent);
    }
    .kb-card-menu:hover,
    .kb-card-info-btn:hover,
    .kb-card-at-btn:hover {
        background: color-mix(in srgb, var(--kb-accent) 15%, var(--kb-bg-card));
        color: var(--kb-accent);
    }

    .kb-card-labels {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
    }
    .kb-label-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        color: var(--kb-text-muted);
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 10px;
        padding: 1px 7px;
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .kb-label-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex: 0 0 auto;
    }
    .kb-add-card {
        background: transparent;
        border: none;
        color: var(--kb-text-muted);
        padding: 3px 6px;
        border-radius: 5px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.12s ease, color 0.12s ease, transform 0.1s ease;
    }
    .kb-add-card:hover {
        background: var(--kb-accent);
        color: var(--kb-accent-text);
        transform: scale(1.05);
    }
    .kb-column-last .kb-column-title { color: var(--kb-accent); }
    .kb-card-title {
        font-size: var(--kb-card-title-font);
        font-weight: 500;
        line-height: 1.35;
    }
    .kb-card-body {
        font-size: var(--kb-card-font);
        line-height: 1.4;
        overflow-wrap: break-word;
    }
    .kb-card-body img,
    .kb-card-img {
        width: 100%;
        max-width: 100%;
        max-height: 220px;
        object-fit: cover;
        border-radius: 6px;
        display: block;
        margin: 6px 0;
        cursor: zoom-in;
        box-sizing: border-box;
        transition: transform 0.15s ease, opacity 0.15s ease;
    }
    .kb-card-body img:hover,
    .kb-card-img:hover {
        opacity: 0.93;
    }
    .kb-card-body ample-editor,
    .kb-card-body .ample-editor { display: block; }
    .kb-card-body a {
        color: var(--kb-accent);
        text-decoration: none;
    }
    .kb-card-body a:hover {
        text-decoration: underline;
    }
    .kb-card-body a.open_in_new,
    .kb-card-body a.open-in-new,
    .kb-card-body .open_in_new,
    .kb-card-body .open-in-new {
        display: none !important;
    }

    /* Lightbox Modal for Full-Resolution Image Viewing */
    .kb-lightbox-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.88);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        cursor: zoom-out;
        opacity: 0;
        animation: kb-lightbox-fade 0.2s ease forwards;
        padding: 24px;
        box-sizing: border-box;
    }
    @keyframes kb-lightbox-fade {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .kb-lightbox-img {
        max-width: 94vw;
        max-height: 92vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.75);
        cursor: default;
        animation: kb-lightbox-zoom 0.2s ease forwards;
    }
    @keyframes kb-lightbox-zoom {
        from { transform: scale(0.92); opacity: 0.8; }
        to { transform: scale(1); opacity: 1; }
    }
    .kb-lightbox-close {
        position: absolute;
        top: 16px;
        right: 20px;
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        transition: background 0.15s ease;
        z-index: 100000;
    }
    .kb-lightbox-close:hover {
        background: rgba(255, 255, 255, 0.4);
    }
    .kb-card-meta {
        margin-top: 6px;
        font-size: 10.5px;
        color: var(--kb-text-muted);
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        align-items: center;
    }
    .kb-card-meta-item {
        display: inline-flex;
        align-items: center;
        gap: 3px;
    }
    .kb-task-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 6px;
        align-items: center;
    }
    .kb-badge {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 10.5px;
        font-weight: 500;
        padding: 1px 6px;
        border-radius: 4px;
        background: color-mix(in srgb, var(--kb-text-muted) 10%, var(--kb-bg-card));
        color: var(--kb-text-muted);
        border: 1px solid color-mix(in srgb, var(--kb-border) 80%, transparent);
        line-height: 1.2;
    }
    .kb-badge-urgent {
        background: color-mix(in srgb, var(--kb-danger) 10%, var(--kb-bg-card));
        color: var(--kb-danger);
        border-color: color-mix(in srgb, var(--kb-danger) 25%, transparent);
    }
    .kb-badge-important {
        background: color-mix(in srgb, #f59e0b 10%, var(--kb-bg-card));
        color: #d97706;
        border-color: color-mix(in srgb, #f59e0b 25%, transparent);
    }
    .kb-badge-score {
        background: color-mix(in srgb, var(--kb-accent) 10%, var(--kb-bg-card));
        color: var(--kb-accent);
        border-color: color-mix(in srgb, var(--kb-accent) 20%, transparent);
    }
    .kb-badge-parent,
    .kb-badge-child,
    .kb-badge-subtask,
    .kb-badge-child-subtask {
        background: color-mix(in srgb, var(--kb-text-muted) 10%, var(--kb-bg-card));
        color: var(--kb-text-muted);
        border-color: var(--kb-border);
    }
    .kb-card-subtask {
        border-left: 3px solid color-mix(in srgb, var(--kb-accent) 45%, var(--kb-border));
        margin-left: 8px;
    }
    /* ---------- heading level color-coding (H1, H2, H3) ---------- */
    .kb-col-h1 .kb-column-head {
        border-top: 3px solid var(--kb-accent);
    }
    .kb-col-h2 .kb-column-head {
        border-top: 3px solid #8b5cf6;
    }
    .kb-col-h3 .kb-column-head {
        border-top: 3px solid #06b6d4;
    }
    .kb-col-h4 .kb-column-head,
    .kb-col-h5 .kb-column-head,
    .kb-col-h6 .kb-column-head {
        border-top: 3px solid #10b981;
    }

    .kb-section-h1 .kb-section-head {
        border-left: 3px solid var(--kb-accent);
    }
    .kb-section-h2 .kb-section-head {
        border-left: 3px solid #8b5cf6;
    }
    .kb-section-h3 .kb-section-head {
        border-left: 3px solid #06b6d4;
    }
    .kb-section-h4 .kb-section-head,
    .kb-section-h5 .kb-section-head,
    .kb-section-h6 .kb-section-head {
        border-left: 3px solid #10b981;
    }
    .kb-card-labels,
    .kb-card-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
    }
    .kb-label-chip,
    .kb-tag-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10.5px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--kb-accent) 12%, var(--kb-bg-card));
        color: var(--kb-accent);
        border: 1px solid color-mix(in srgb, var(--kb-accent) 25%, transparent);
        line-height: 1.2;
        letter-spacing: 0.01em;
    }
    .kb-tag-chip {
        background: color-mix(in srgb, var(--kb-text-muted) 14%, var(--kb-bg-card));
        color: var(--kb-text-muted);
        border-color: color-mix(in srgb, var(--kb-text-muted) 28%, transparent);
    }
    .kb-label-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        display: inline-block;
        flex-shrink: 0;
    }
    .kb-card-done .kb-card-title {
        text-decoration: line-through;
        color: var(--kb-text-muted);
        opacity: 0.75;
    }

    /* ---------- task info details card ---------- */
    .kb-task-details {
        margin-top: 6px;
        padding: 7px;
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 6px;
        font-size: 11px;
        color: var(--kb-text);
    }
    .kb-task-details table {
        width: 100%;
        border-collapse: collapse;
    }
    .kb-task-details td {
        padding: 2px 4px;
        vertical-align: top;
    }
    .kb-task-details td:first-child {
        color: var(--kb-text-muted);
        font-weight: 600;
        width: 75px;
        white-space: nowrap;
    }
    .kb-task-edit-btn {
        margin-top: 5px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        font-size: 11px;
        font-weight: 500;
        color: var(--kb-accent);
        background: color-mix(in srgb, var(--kb-accent) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--kb-accent) 25%, transparent);
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.12s ease, transform 0.1s ease;
    }
    .kb-task-edit-btn:hover {
        background: color-mix(in srgb, var(--kb-accent) 20%, transparent);
        transform: translateY(-1px);
    }

    /* ---------- toast notifications ---------- */
    .kb-toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 100000;
        pointer-events: none;
    }
    .kb-toast {
        background: var(--kb-bg-card);
        color: var(--kb-text);
        border: 1px solid var(--kb-border);
        border-radius: 8px;
        padding: 9px 16px;
        font-size: 12.5px;
        font-weight: 500;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        animation: kbToastIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .kb-toast.kb-toast-hiding {
        opacity: 0;
        transform: translateY(8px);
    }
    @keyframes kbToastIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* ---------- scrollbars ---------- */
    ::-webkit-scrollbar { width: 7px; height: 7px; }
    ::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--kb-text-muted) 35%, transparent);
        border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: color-mix(in srgb, var(--kb-text-muted) 55%, transparent);
    }
    ::-webkit-scrollbar-track { background: transparent; }
    * { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--kb-text-muted) 35%, transparent) transparent; }

    /* ---------- accessibility & motion ---------- */
    @media (prefers-reduced-motion: reduce) {
        *, ::before, ::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
        }
    }

    /* ---------- responsive layout ---------- */
    @media (max-width: 900px) {
        .kb-header {
            flex-wrap: wrap;
            padding: 8px 12px;
            gap: 8px;
        }
        .kb-header-center {
            order: 3;
            width: 100%;
            justify-content: space-between;
        }
        .kb-search-wrap {
            max-width: none;
            flex: 1 1 auto;
        }
    }
    @media (max-width: 600px) {
        .kb-header-left, .kb-header-right {
            width: auto;
        }
        .kb-brand span {
            display: none;
        }
        .kb-column {
            width: 280px;
        }
    }
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
    <style>
${buildThemeCss()}
${buildBaseCss()}
    </style>
</head>
<body>
    <header class="kb-header">
        <div class="kb-header-left">
            <div class="kb-brand">
                <svg class="kb-icon kb-icon-stroke" width="18" height="18" viewBox="0 0 24 24"><rect x="3" y="3" width="5" height="18" rx="1"></rect><rect x="10" y="3" width="5" height="12" rx="1"></rect><rect x="17" y="3" width="5" height="16" rx="1"></rect></svg>
                <span>Kanban Board</span>
            </div>
            <div class="kb-btn-group" role="group" aria-label="Sync options">
                <button id="kb-refresh-tab" class="kb-btn" type="button" title="Sync active tab">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    <span>Tab</span>
                </button>
                <button id="kb-refresh-all" class="kb-btn" type="button" title="Sync all tabs">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
                    <span>All</span>
                </button>
            </div>
        </div>

        <div class="kb-header-center">
            <div class="kb-search-wrap">
                <span class="kb-search-icon">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
                <input id="kb-search" class="kb-search" type="search" placeholder="Search cards..." spellcheck="false">
                <kbd class="kb-search-shortcut">/</kbd>
            </div>
        </div>

        <div class="kb-header-right">
            <div class="kb-btn-group" role="group" aria-label="Sort and view options">
                <button id="kb-save-sort-btn" class="kb-btn" type="button" style="display:none;" title="Save active card sort order into note markdown">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                    <span>Save Sort</span>
                </button>
                <button id="kb-reset-sort-btn" class="kb-btn" type="button" style="display:none;" title="Reset dashboard to original note order">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                    <span>Reset Sort</span>
                </button>
                <button id="kb-open-note-btn" class="kb-btn" type="button" style="display:none;" title="Open active note in Amplenote">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    <span>Open Note</span>
                </button>
                <button id="kb-sort-btn" class="kb-btn" type="button" title="Cycle card sort order">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><path d="M7 15l5 5 5-5"></path><path d="M7 9l5-5 5 5"></path></svg>
                    <span id="kb-sort-label">Sort Tasks</span>
                </button>
                <button id="kb-density-btn" class="kb-btn" type="button" title="Cycle layout density (Compact, Cozy, Spacious)">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="3" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                    <span id="kb-density-label">Cozy</span>
                </button>
                <button id="kb-toggle-empty-btn" class="kb-btn" type="button" title="Show or hide empty columns">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <span id="kb-empty-label">Empty</span>
                </button>
                <button id="kb-toggle-info-btn" class="kb-btn" type="button" title="Expand or collapse details on all cards">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    <span id="kb-info-label">Info</span>
                </button>
                <button id="kb-toggle-date-action-btn" class="kb-btn" type="button" title="Toggle quick @ date button on cards">
                    <span style="font-weight:700;font-size:13px;line-height:1;color:var(--kb-accent);">@</span>
                    <span id="kb-date-action-label">Date</span>
                </button>
            </div>
            <button id="kb-datefmt-btn" class="kb-btn" type="button" title="Date format for card chips">
                <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span id="kb-datefmt-label"></span>
            </button>
            <button id="kb-theme-btn" class="kb-btn" type="button" title="Cycle themes (or press T)">
                <span id="kb-theme-icon">🎨</span> <span id="kb-theme-name">Theme</span>
            </button>
            <div class="kb-btn-group" role="group" aria-label="Session diagnostics" style="display:none;">
                <button id="kb-ping" class="kb-btn" type="button" title="Test embed connection">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                    <span>Ping</span>
                </button>
                <span id="kb-roundtrips" class="kb-roundtrips" title="Embed round trips this session">0</span>
            </div>
        </div>
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
