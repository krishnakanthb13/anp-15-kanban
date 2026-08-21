(() => {
// anp-15-kanban/lib/core/constants.js
var SETTINGS_KEYS = {
  tabs: "Kanban Tabs",
  theme: "Kanban Theme",
  dateFormat: "Kanban Date Format"
};
var DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
var DEFAULT_THEME_ID = "light";
function emptyTabsConfig() {
  return {
    tabs: [],
    activeTabId: null,
    settings: { dateFormat: DEFAULT_DATE_FORMAT }
  };
}
var TAB_KINDS = /* @__PURE__ */ new Set(["note", "tag"]);
function isValidTab(tab) {
  return !!tab && typeof tab === "object" && typeof tab.id === "string" && tab.id.length > 0 && TAB_KINDS.has(tab.kind);
}

// anp-15-kanban/lib/ui/themes.js
var THEMES = [
  { id: "light", name: "Clean Daylight", icon: "\u2600\uFE0F", type: "light" },
  { id: "sepia", name: "Sepia Parchment", icon: "\u{1F4DC}", type: "light" },
  { id: "matcha", name: "Matcha Latte", icon: "\u{1F375}", type: "light" },
  { id: "nord-light", name: "Nord Frost", icon: "\u{1F9CA}", type: "light" },
  { id: "midnight", name: "Midnight Slate", icon: "\u{1F30C}", type: "dark" },
  { id: "nord", name: "Nord Arctic", icon: "\u2744\uFE0F", type: "dark" },
  { id: "dracula", name: "Dracula Neo", icon: "\u{1F9DB}", type: "dark" },
  { id: "emerald", name: "Emerald Forest", icon: "\u{1F332}", type: "dark" }
];
var PALETTES = {
  light: {
    bg: "#f8fafc",
    bgHeader: "#ffffff",
    bgColumn: "#f1f5f9",
    bgCard: "#ffffff",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
    accent: "#2563eb",
    accentText: "#ffffff",
    danger: "#dc2626",
    shadow: "rgba(15, 23, 42, 0.08)"
  },
  sepia: {
    bg: "#fbf7ee",
    bgHeader: "#f4ede0",
    bgColumn: "#f0e7d8",
    bgCard: "#fffdf8",
    text: "#44403c",
    textMuted: "#78716c",
    border: "#e7dcc8",
    accent: "#b45309",
    accentText: "#ffffff",
    danger: "#b91c1c",
    shadow: "rgba(68, 64, 60, 0.10)"
  },
  matcha: {
    bg: "#f6f8f5",
    bgHeader: "#edf2eb",
    bgColumn: "#e6ede3",
    bgCard: "#ffffff",
    text: "#1a2e22",
    textMuted: "#5f7268",
    border: "#d8e4d4",
    accent: "#15803d",
    accentText: "#ffffff",
    danger: "#b91c1c",
    shadow: "rgba(26, 46, 34, 0.10)"
  },
  "nord-light": {
    bg: "#f4f6f9",
    bgHeader: "#e9edf2",
    bgColumn: "#e5ebf2",
    bgCard: "#ffffff",
    text: "#2e3440",
    textMuted: "#616e7c",
    border: "#d8dee9",
    accent: "#0284c7",
    accentText: "#ffffff",
    danger: "#c2410c",
    shadow: "rgba(46, 52, 64, 0.10)"
  },
  midnight: {
    bg: "#0b0f19",
    bgHeader: "#131b2e",
    bgColumn: "#111a2c",
    bgCard: "#182238",
    text: "#f1f5f9",
    textMuted: "#94a3b8",
    border: "#24304a",
    accent: "#3b82f6",
    accentText: "#ffffff",
    danger: "#f87171",
    shadow: "rgba(0, 0, 0, 0.40)"
  },
  nord: {
    bg: "#242933",
    bgHeader: "#2e3440",
    bgColumn: "#333a46",
    bgCard: "#3b4252",
    text: "#eceff4",
    textMuted: "#9aa5b1",
    border: "#434c5e",
    accent: "#88c0d0",
    accentText: "#212733",
    danger: "#bf616a",
    shadow: "rgba(0, 0, 0, 0.35)"
  },
  dracula: {
    bg: "#1e1f29",
    bgHeader: "#282a36",
    bgColumn: "#2b2d3a",
    bgCard: "#343746",
    text: "#f8f8f2",
    textMuted: "#9ca0b0",
    border: "#44475a",
    accent: "#bd93f9",
    accentText: "#1e1f29",
    danger: "#ff5555",
    shadow: "rgba(0, 0, 0, 0.40)"
  },
  emerald: {
    bg: "#061e16",
    bgHeader: "#0b2e23",
    bgColumn: "#0d2a20",
    bgCard: "#124334",
    text: "#e6f4ea",
    textMuted: "#93b8a5",
    border: "#1b4636",
    accent: "#10b981",
    accentText: "#06251b",
    danger: "#f87171",
    shadow: "rgba(0, 0, 0, 0.40)"
  }
};
var TOKEN_VAR_NAMES = {
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
  shadow: "--kb-shadow"
};
function isValidThemeId(themeId) {
  return THEMES.some((t) => t.id === themeId);
}
function buildThemeCss() {
  const blocks = THEMES.map((theme) => {
    const palette = PALETTES[theme.id];
    if (!palette) return "";
    const vars = Object.entries(TOKEN_VAR_NAMES).map(([token, varName]) => `        ${varName}: ${palette[token]};`).join("\n");
    return `    [data-theme="${theme.id}"] {
${vars}
    }`;
  });
  return blocks.join("\n\n");
}
function themesJsonForClient() {
  return JSON.stringify(THEMES.map(({ id, name, icon, type }) => ({ id, name, icon, type }))).replace(/</g, "\\u003c");
}

// anp-15-kanban/lib/ui/clientScript.js
function buildClientScript() {
  return `
(function () {
  "use strict";

  var STATE = window.__KANBAN_STATE__ || {};
  var THEMES = window.__KANBAN_THEMES__ || [];
  var THEME_STORAGE_KEY = "ANP_ACTIVE_THEME";
  var currentTheme = null;

  /* ---------------- bridge ---------------- */

  function callPlugin(action, payload) {
    if (typeof window.callAmplenotePlugin === "function") {
      try {
        return window.callAmplenotePlugin(action, payload);
      } catch (err) {
        console.error("callAmplenotePlugin failed:", err);
      }
    }
    return null;
  }

  /* ---------------- theming ---------------- */

  function themeIndex(id) {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === id) return i;
    }
    return -1;
  }

  function applyTheme(themeId, persist) {
    var idx = themeIndex(themeId);
    if (idx === -1) idx = 0;
    var theme = THEMES[idx];
    if (!theme) return;
    currentTheme = theme.id;
    document.documentElement.setAttribute("data-theme", theme.id);
    try {
      if (persist) {
        localStorage.setItem(THEME_STORAGE_KEY, theme.id);
        callPlugin("saveTheme", theme.id);
      }
    } catch (e) { /* storage may be unavailable; theme still applies visually */ }
    var iconEl = document.getElementById("kb-theme-icon");
    var nameEl = document.getElementById("kb-theme-name");
    if (iconEl) iconEl.textContent = theme.icon;
    if (nameEl) nameEl.textContent = theme.name;
  }

  function cycleTheme() {
    var idx = themeIndex(currentTheme);
    var next = THEMES[(idx + 1) % THEMES.length];
    applyTheme(next.id, true);
  }

  function bootTheme() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_STORAGE_KEY); } catch (e) {}
    applyTheme(stored || STATE.settings && STATE.settings.theme || (THEMES[0] && THEMES[0].id), false);
  }

  /* ---------------- rendering ---------------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function activeTab() {
    var tabs = STATE.tabs || [];
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].id === STATE.activeTabId) return tabs[i];
    }
    return tabs[0] || null;
  }

  var KIND_ICONS = { note: "\\uD83D\\uDFE4", tag: "\\uD83C\\uDFF7" };

  function renderTabs() {
    var host = document.getElementById("kb-tabs");
    if (!host) return;
    host.innerHTML = "";
    var tabs = STATE.tabs || [];
    var act = activeTab();
    tabs.forEach(function (tab) {
      var chip = el("button", "kb-tab" + (act && tab.id === act.id ? " kb-tab-active" : ""));
      chip.type = "button";
      chip.title = tab.name + " (" + tab.kind + " board)";
      chip.appendChild(el("span", "kb-tab-icon", KIND_ICONS[tab.kind] || "?"));
      chip.appendChild(el("span", "kb-tab-name", tab.name));
      chip.addEventListener("click", function () {
        callPlugin("setActiveTab", { tabId: tab.id });
      });
      host.appendChild(chip);
    });
  }

  function renderBoard() {
    var board = document.getElementById("kb-board");
    if (!board) return;
    board.innerHTML = "";
    var tab = activeTab();
    var data = tab && STATE.boards ? STATE.boards[tab.id] : null;
    var columns = data && data.columns ? data.columns : [];

    if (!columns.length) {
      board.appendChild(el("div", "kb-empty", "No board data yet. Use \\u201CRefresh\\u201D or add a tab."));
      return;
    }

    columns.forEach(function (col, colIndex) {
      var isLast = colIndex === columns.length - 1;
      var colEl = el("section", "kb-column" + (isLast ? " kb-column-last" : ""));
      colEl.setAttribute("data-column-id", col.id);

      var head = el("header", "kb-column-head");
      head.appendChild(el("h3", "kb-column-title", col.name));
      head.appendChild(el("span", "kb-count", String(col.cards ? col.cards.length : 0)));
      colEl.appendChild(head);

      var addBtn = el("button", "kb-add-card", "+");
      addBtn.type = "button";
      addBtn.title = "Add card to " + col.name;
      addBtn.addEventListener("click", function () {
        callPlugin("createCard", { tabId: STATE.activeTabId, columnId: col.id });
      });
      head.appendChild(addBtn);

      var list = el("div", "kb-cards");
      wireDropZone(list, col);
      (col.cards || []).forEach(function (card) {
        list.appendChild(buildCardEl(card));
      });
      colEl.appendChild(list);
      board.appendChild(colEl);
    });
  }

  /* ---------------- drag & drop ---------------- */

  var dragCardId = null;

  function buildCardEl(card) {
    var cardEl = el("article", "kb-card" + (card.completedAt ? " kb-card-done" : ""));
    cardEl.setAttribute("data-card-id", card.id);
    cardEl.setAttribute("draggable", "true");

    var title = el("div", "kb-card-title", card.title);
    cardEl.appendChild(title);
    if (card.completedAt || card.startAt || card.deadline) {
      var bits = [];
      if (card.completedAt) bits.push("\\u2713 done");
      if (card.startAt) bits.push("\\u25B6 " + formatStamp(card.startAt));
      if (card.deadline) bits.push("\\u23F0 " + formatStamp(card.deadline));
      cardEl.appendChild(el("div", "kb-card-meta", bits.join("  \\u00B7  ")));
    }

    cardEl.addEventListener("dragstart", function (e) {
      dragCardId = card.id;
      e.dataTransfer.setData("text/plain", card.id);
      e.dataTransfer.effectAllowed = "move";
      cardEl.classList.add("kb-dragging");
    });
    cardEl.addEventListener("dragend", function () {
      dragCardId = null;
      cardEl.classList.remove("kb-dragging");
    });

    // Click (without drag) opens the raw-markdown editor.
    cardEl.addEventListener("click", function () {
      if (dragCardId) return;
      callPlugin("editCard", { cardId: card.id });
    });

    return cardEl;
  }

  function wireDropZone(listEl, col) {
    listEl.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      listEl.classList.add("kb-drop-hover");
    });
    listEl.addEventListener("dragleave", function () {
      listEl.classList.remove("kb-drop-hover");
    });
    listEl.addEventListener("drop", function (e) {
      e.preventDefault();
      listEl.classList.remove("kb-drop-hover");
      var cardId = (e.dataTransfer && e.dataTransfer.getData("text/plain")) || dragCardId;
      if (!cardId) return;

      // Optimistic UI: move the DOM node immediately; server re-render reconciles.
      var cardEl = board.querySelector('[data-card-id="' + cssEscape(cardId) + '"]');
      if (cardEl && cardEl.parentElement !== listEl) {
        listEl.insertBefore(cardEl, listEl.firstChild);
        bumpCount(col.id);
        if (listEl.closest(".kb-column-last")) cardEl.classList.add("kb-card-done");
        else cardEl.classList.remove("kb-card-done");
      }
      callPlugin("moveCard", { tabId: STATE.activeTabId, cardId: cardId, toColumnId: col.id });
    });
  }

  function bumpCount(columnId) {
    var colEl = board.querySelector('[data-column-id="' + cssEscape(String(columnId)) + '"]');
    if (!colEl) return;
    var count = colEl.querySelector(".kb-count");
    if (count) count.textContent = String(colEl.querySelectorAll(".kb-card").length);
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/["\\]/g, "\\$&");
  }

  function formatStamp(unixSeconds) {
    var d = new Date(unixSeconds * 1000);
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return m + "/" + day;
  }

  function renderMeta() {
    var counter = document.getElementById("kb-roundtrips");
    if (counter && STATE.meta) counter.textContent = String(STATE.meta.roundTrips || 0);
  }

  function renderAll() {
    renderTabs();
    renderBoard();
    renderMeta();
  }

  /* ---------------- progress ---------------- */

  function setProgress(ratio) {
    var wrap = document.getElementById("kb-progress");
    var bar = document.getElementById("kb-progress-bar");
    if (!wrap || !bar) return;
    if (ratio === null) {
      wrap.classList.remove("kb-progress-visible");
      bar.style.width = "0%";
      return;
    }
    wrap.classList.add("kb-progress-visible");
    bar.style.width = Math.max(0, Math.min(100, Math.round(ratio * 100))) + "%";
  }

  function setBusy(buttonId, busy) {
    var btn = document.getElementById(buttonId);
    if (btn) btn.classList.toggle("kb-busy", !!busy);
  }

  /* ---------------- actions ---------------- */

  function wireControls() {
    var themeBtn = document.getElementById("kb-theme-btn");
    if (themeBtn) themeBtn.addEventListener("click", cycleTheme);

    var refreshTabBtn = document.getElementById("kb-refresh-tab");
    if (refreshTabBtn) {
      refreshTabBtn.addEventListener("click", function () {
        setBusy("kb-refresh-tab", true);
        callPlugin("refreshTab", { tabId: STATE.activeTabId });
      });
    }

    var refreshAllBtn = document.getElementById("kb-refresh-all");
    if (refreshAllBtn) {
      refreshAllBtn.addEventListener("click", function () {
        setBusy("kb-refresh-all", true);
        setProgress(0.15);
        callPlugin("refreshAll");
      });
    }

    var pingBtn = document.getElementById("kb-ping");
    if (pingBtn) {
      pingBtn.addEventListener("click", function () {
        setBusy("kb-ping", true);
        callPlugin("ping");
      });
    }

    window.addEventListener("keydown", function (e) {
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "t" || e.key === "T") cycleTheme();
    });
  }

  /* ---------------- boot ---------------- */

  bootTheme();
  wireControls();
  renderAll();
})();
`;
}

// anp-15-kanban/lib/utils/html.js
function toJsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

// anp-15-kanban/lib/ui/boardTemplate.js
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
function buildBoardHtml(viewState) {
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
        <div class="kb-brand">\u{1F5C2} Kanban Board</div>
        <span id="kb-roundtrips" class="kb-roundtrips" title="Embed round trips this session">0</span>
        <button id="kb-ping" class="kb-btn" type="button">Ping</button>
        <button id="kb-refresh-tab" class="kb-btn" type="button" title="Re-pull the active tab">\u27F3 Tab</button>
        <button id="kb-refresh-all" class="kb-btn" type="button" title="Re-pull every tab">\u21C9 All</button>
        <button id="kb-theme-btn" class="kb-btn" type="button" title="Cycle themes (or press T)">
            <span id="kb-theme-icon">\u{1F3A8}</span> <span id="kb-theme-name">Theme</span>
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

// anp-15-kanban/lib/core/tabsConfig.js
function safeParse(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function normalizeConfig(raw) {
  const base = emptyTabsConfig();
  if (!raw || typeof raw !== "object") return base;
  const tabs = Array.isArray(raw.tabs) ? raw.tabs.filter(isValidTab) : [];
  const activeTabId = typeof raw.activeTabId === "string" && tabs.some((t) => t.id === raw.activeTabId) ? raw.activeTabId : tabs[0] ? tabs[0].id : null;
  const dateFormat = typeof raw.settings?.dateFormat === "string" && raw.settings.dateFormat.trim() ? raw.settings.dateFormat : base.settings.dateFormat;
  return { tabs, activeTabId, settings: { dateFormat } };
}
async function loadTabsConfig(app) {
  let raw = null;
  try {
    raw = safeParse(app.settings?.[SETTINGS_KEYS.tabs]);
  } catch {
    raw = null;
  }
  return normalizeConfig(raw);
}
async function saveTabsConfig(app, config) {
  await app.setSetting(SETTINGS_KEYS.tabs, JSON.stringify(normalizeConfig(config)));
  return config;
}
function setActiveTab(config, tabId) {
  if (!config.tabs.some((t) => t.id === tabId)) return config;
  return { ...config, activeTabId: tabId };
}
function tabById(config, tabId) {
  return config.tabs.find((t) => t.id === tabId) || null;
}

// anp-15-kanban/lib/core/sessionState.js
var session = {
  roundTrips: 0
};
function bumpRoundTrips() {
  session.roundTrips += 1;
  return session.roundTrips;
}
function getSessionSnapshot() {
  return { roundTrips: session.roundTrips };
}

// anp-15-kanban/lib/core/demoBoard.js
var DEMO_TAB_ID = "tab_demo";
function withDemoContent(viewState) {
  if (viewState.tabs && viewState.tabs.length > 0) return viewState;
  const columns = [
    {
      id: "col_todo",
      name: "To Do",
      cards: [
        { id: "card_1", title: "Welcome to Kanban \u{1F44B}", content: "", completedAt: null, startAt: null, deadline: null, important: false, urgent: false },
        { id: "card_2", title: "Drag me between columns", content: "", completedAt: null, startAt: null, deadline: null, important: false, urgent: false },
        { id: "card_3", title: "Press T to cycle themes", content: "", completedAt: null, startAt: null, deadline: null, important: false, urgent: false }
      ]
    },
    {
      id: "col_doing",
      name: "In Progress",
      cards: [
        { id: "card_4", title: "Scaffold embed round trip", content: "", completedAt: null, startAt: null, deadline: null, important: false, urgent: false }
      ]
    },
    {
      id: "col_done",
      name: "Done",
      cards: [
        { id: "card_5", title: "Plugin plan approved", content: "", completedAt: 1755e6, startAt: null, deadline: null, important: false, urgent: false }
      ]
    }
  ];
  return {
    ...viewState,
    activeTabId: DEMO_TAB_ID,
    tabs: [{ id: DEMO_TAB_ID, kind: "note", name: "Demo Board", noteUUID: null, tag: null }],
    boards: { [DEMO_TAB_ID]: { columns } }
  };
}

// anp-15-kanban/lib/api/markdownIndex.js
var HEADING_RE = /^(#{1,6})\s+(.*)$/;
var UUID_IN_LINE_RE = (uuid) => new RegExp(`["']uuid["']\\s*:\\s*["']${uuid}["']`);
function parseHeadings(markdown) {
  const headings = [];
  const lines = markdown.split("\n");
  lines.forEach((line, i) => {
    const m = line.match(HEADING_RE);
    if (m) headings.push({ lineIndex: i, level: m[1].length, text: m[2].trim() });
  });
  return headings;
}
function findColumnLevel(headings) {
  if (!headings.length) return null;
  return Math.min(...headings.map((h) => h.level));
}
function buildColumnSpans(markdown, columnLevel) {
  const headings = parseHeadings(markdown);
  const level = columnLevel ?? findColumnLevel(headings);
  if (level === null) return { columns: [], preambleEnd: 0 };
  const columnHeadings = headings.filter((h) => h.level === level);
  const columns = columnHeadings.map((h, i) => {
    const next = columnHeadings[i + 1];
    const contentEnd = next ? next.lineIndex : markdown.split("\n").length;
    return {
      id: String(h.lineIndex),
      name: h.text,
      startLine: h.lineIndex,
      contentStart: h.lineIndex + 1,
      contentEnd
    };
  });
  const preambleEnd = columns.length ? columns[0].contentStart : 0;
  return { columns, preambleEnd };
}
function findTaskLines(lines, tasks) {
  const result = /* @__PURE__ */ new Map();
  for (const task of tasks) {
    const re = UUID_IN_LINE_RE(task.uuid);
    let found = -1;
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) {
        found = i;
        break;
      }
    }
    result.set(task.uuid, found);
  }
  return result;
}
function assignTasksToColumns(columns, lines, tasks) {
  const taskLines = findTaskLines(lines, tasks);
  const columnCards = new Map(columns.map((c) => [c.id, []]));
  const unsorted = [];
  for (const task of tasks) {
    const lineIndex = taskLines.get(task.uuid);
    if (lineIndex === void 0 || lineIndex < 0) continue;
    const owner = columns.find((c) => lineIndex >= c.contentStart && lineIndex < c.contentEnd);
    if (owner) columnCards.get(owner.id).push(task);
    else unsorted.push(task);
  }
  return { columnCards, unsorted };
}
function removeLine(lines, taskLineIndex) {
  return [...lines.slice(0, taskLineIndex), ...lines.slice(taskLineIndex + 1)];
}
function insertUnderHeading(lines, span, taskLine) {
  return [...lines.slice(0, span.startLine + 1), taskLine, ...lines.slice(span.startLine + 1)];
}
function resolveSpan(spans, columnId, columnName) {
  const byId = spans.find((s) => s.id === String(columnId));
  if (byId) return byId;
  if (columnName) return spans.find((s) => s.name === columnName) || null;
  return null;
}

// anp-15-kanban/lib/api/taskOps.js
function nowSeconds() {
  return Math.floor(Date.now() / 1e3);
}
async function readNote(app, noteUUID) {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  return { markdown, lines: markdown.split("\n") };
}
async function moveTaskToColumn(app, noteUUID, taskUuid, target) {
  const { markdown, lines } = await readNote(app, noteUUID);
  const { columns } = buildColumnSpans(markdown);
  if (!columns.length) return "no-columns";
  const destSpan = resolveSpan(columns, target.columnId, target.columnName);
  if (!destSpan) return "no-target";
  const [taskLineIndex] = findTaskLines(lines, [{ uuid: taskUuid }]).values();
  if (taskLineIndex < 0) return "no-task";
  const sourceSpan = columns.find(
    (s) => taskLineIndex >= s.contentStart && taskLineIndex < s.contentEnd
  );
  if (sourceSpan && sourceSpan.id === destSpan.id) return "same-column";
  const taskLine = lines[taskLineIndex];
  let next = removeLine(lines, taskLineIndex);
  const shiftedDest = {
    ...destSpan,
    startLine: destSpan.startLine > taskLineIndex ? destSpan.startLine - 1 : destSpan.startLine
  };
  next = insertUnderHeading(next, shiftedDest, taskLine);
  await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
  return "moved";
}
async function createTaskInColumn(app, noteUUID, target, content) {
  const taskUuid = await app.insertTask({ uuid: noteUUID }, { content: String(content || "") });
  if (!taskUuid) return null;
  try {
    await moveTaskToColumn(app, noteUUID, taskUuid, target);
  } catch (error) {
    console.error("createTaskInColumn relocate failed:", error);
  }
  return taskUuid;
}
async function setTaskCompleted(app, taskUuid, done = true) {
  await app.updateTask(taskUuid, { completedAt: done ? nowSeconds() : null });
}
async function updateCardContent(app, taskUuid, content) {
  await app.updateTask(taskUuid, { content });
}

// anp-15-kanban/lib/features/embedActions.js
async function rerender(app) {
  if (typeof app.context?.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}
async function handlePing(app) {
  await rerender(app);
  return { ok: true };
}
async function handleSaveTheme(app, payload) {
  const themeId = payload && typeof payload.themeId === "string" ? payload.themeId : null;
  if (!themeId || !isValidThemeId(themeId)) return;
  await app.setSetting(SETTINGS_KEYS.theme, themeId);
}
async function handleSetActiveTab(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return;
  const config = setActiveTab(await loadTabsConfig(app), tabId);
  await saveTabsConfig(app, config);
  await rerender(app);
}
async function handleRefreshTab(app) {
  await rerender(app);
}
async function handleRefreshAll(app) {
  await rerender(app);
}
async function resolveNoteTab(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return null;
  const tab = tabById(await loadTabsConfig(app), tabId);
  if (!tab || tab.kind !== "note" || !tab.noteUUID) return null;
  return tab;
}
async function isLastColumn(app, noteUUID, columnId) {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  const { columns } = buildColumnSpans(markdown);
  return columns.length > 0 && columns[columns.length - 1].id === String(columnId);
}
async function handleMoveCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.cardId || !payload.toColumnId) return;
  const doneTarget = await isLastColumn(app, tab.noteUUID, payload.toColumnId);
  const status = await moveTaskToColumn(app, tab.noteUUID, payload.cardId, {
    columnId: payload.toColumnId
  });
  if (status === "moved") {
    await setTaskCompleted(app, payload.cardId, doneTarget);
    await rerender(app);
  }
}
async function handleCreateCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.columnId) return;
  const result = await app.prompt("New card", {
    inputs: [{ label: "Card content (markdown):", type: "text" }]
  });
  if (!result || !result[0]) return;
  await createTaskInColumn(app, tab.noteUUID, { columnId: payload.columnId }, result[0]);
  await rerender(app);
}
async function handleEditCard(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;
  const task = await app.getTask(cardId);
  if (!task) return;
  const result = await app.prompt("Edit card (raw markdown)", {
    inputs: [{ label: "Content:", type: "text", value: task.content || "" }]
  });
  if (!result || result[0] === void 0 || result[0] === task.content) return;
  await updateCardContent(app, cardId, result[0]);
  await rerender(app);
}
var ACTIONS = {
  ping: handlePing,
  saveTheme: handleSaveTheme,
  setActiveTab: handleSetActiveTab,
  refreshTab: handleRefreshTab,
  refreshAll: handleRefreshAll,
  moveCard: handleMoveCard,
  createCard: handleCreateCard,
  editCard: handleEditCard
};
async function handleEmbedAction(app, args) {
  const [action, payload] = args || [];
  const handler = ACTIONS[action];
  if (!handler) {
    console.warn(`Unknown embed action: ${action}`);
    return void 0;
  }
  return handler(app, payload);
}

// anp-15-kanban/lib/api/noteBoard.js
async function buildNoteBoard(app, noteUUID) {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  if (typeof markdown !== "string") {
    return { kind: "note", noteUUID, columns: [], hasHeadings: false };
  }
  const tasks = await app.getNoteTasks({ uuid: noteUUID }, { includeDone: true }) || [];
  const { columns } = buildColumnSpans(markdown);
  const lines = markdown.split("\n");
  const { columnCards, unsorted } = assignTasksToColumns(columns, lines, tasks);
  const boardColumns = columns.map((span) => ({
    id: span.id,
    name: span.name,
    cards: (columnCards.get(span.id) || []).map(toCardModel)
  }));
  if (unsorted.length > 0) {
    boardColumns.unshift({
      id: "unsorted",
      name: "Unsorted",
      cards: unsorted.map(toCardModel)
    });
  }
  return {
    kind: "note",
    noteUUID,
    columns: boardColumns,
    hasHeadings: columns.length > 0
  };
}
function toCardModel(task) {
  return {
    id: task.uuid,
    title: plainPreview(task.content || ""),
    content: task.content || "",
    completedAt: task.completedAt ?? null,
    dismissedAt: task.dismissedAt ?? null,
    startAt: task.startAt ?? null,
    deadline: task.deadline ?? null,
    important: !!task.important,
    urgent: !!task.urgent
  };
}
function plainPreview(markdown) {
  return String(markdown.replace(/<!--[\s\S]*?-->/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_~`#>]/g, "").replace(/\s+/g, " ").trim());
}

// anp-15-kanban/kanban.js
var plugin = {
  appOption: {
    /* ----------------------------------- */
    /**
     * Launcher: opens the plugin's persistent embed section and navigates
     * to its addressable URL (https://www.amplenote.com/notes/plugins/{pluginUUID}).
     * @param {Object} app - The Amplenote App instance.
     * @returns {Promise<void>}
     */
    "Open Kanban Board": async (app) => {
      await app.openEmbed();
      await app.navigate(`https://www.amplenote.com/notes/plugins/${app.context.pluginUUID}`);
    }
    /* ----------------------------------- */
  },
  /* ----------------------------------- */
  /**
   * Builds the serializable view state consumed by the embed client.
   * Always re-derived from source of truth (settings + notes/tags) — never
   * trusted from stale embed args.
   * @param {Object} app - The Amplenote App instance.
   */
  async buildViewState(app) {
    const config = await loadTabsConfig(app);
    let themeId = DEFAULT_THEME_ID;
    try {
      themeId = await app.settings?.[SETTINGS_KEYS.theme] || DEFAULT_THEME_ID;
    } catch {
      themeId = DEFAULT_THEME_ID;
    }
    const boards = {};
    for (const tab of config.tabs) {
      if (tab.kind === "note" && tab.noteUUID) {
        try {
          boards[tab.id] = await buildNoteBoard(app, tab.noteUUID);
        } catch (error) {
          console.error(`Failed to build board for tab ${tab.id}:`, error);
          boards[tab.id] = { kind: "note", noteUUID: tab.noteUUID, columns: [], hasHeadings: false };
        }
      }
    }
    return {
      version: 1,
      activeTabId: config.activeTabId,
      tabs: config.tabs,
      boards,
      settings: {
        theme: themeId,
        dateFormat: config.settings.dateFormat || DEFAULT_DATE_FORMAT
      },
      meta: { roundTrips: getSessionSnapshot().roundTrips }
    };
  },
  /* ----------------------------------- */
  /**
   * Renders the board HTML for the embed section.
   * @param {Object} app - The Amplenote App instance.
   * @returns {Promise<string>} full HTML document for the embed iframe.
   */
  async renderEmbed(app) {
    const viewState = await this.buildViewState(app);
    return buildBoardHtml(withDemoContent(viewState));
  },
  /* ----------------------------------- */
  /**
   * Handles actions dispatched from the embed via callAmplenotePlugin.
   * @param {Object} app - The Amplenote App instance.
   * @param {...any} args - [action, payload].
   */
  async onEmbedCall(app, ...args) {
    bumpRoundTrips();
    try {
      return await handleEmbedAction(app, args);
    } catch (error) {
      console.error(`Embed action failed:`, error);
      return void 0;
    }
  }
  /* ----------------------------------- */
};
var kanban_default = plugin;


return kanban_default;
})()