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

    columns.forEach(function (col) {
      var colEl = el("section", "kb-column");
      var head = el("header", "kb-column-head");
      head.appendChild(el("h3", "kb-column-title", col.name));
      head.appendChild(el("span", "kb-count", String(col.cards ? col.cards.length : 0)));
      colEl.appendChild(head);

      var list = el("div", "kb-cards");
      (col.cards || []).forEach(function (card) {
        var cardEl = el("article", "kb-card" + (card.completedAt ? " kb-card-done" : ""));
        cardEl.setAttribute("data-card-id", card.id);
        cardEl.appendChild(el("div", "kb-card-title", card.title));
        cardEl.appendChild(el("div", "kb-card-meta", card.meta || ""));
        list.appendChild(cardEl);
      });
      colEl.appendChild(list);
      board.appendChild(colEl);
    });
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
    }
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
        { id: "card_1", title: "Welcome to Kanban \u{1F44B}", meta: "Demo card" },
        { id: "card_2", title: "Drag & drop arrives in Phase 1", meta: "Roadmap" },
        { id: "card_3", title: "Press T to cycle themes", meta: "Tip" }
      ]
    },
    {
      id: "col_doing",
      name: "In Progress",
      cards: [
        { id: "card_4", title: "Scaffold embed round trip", meta: "Phase 0" }
      ]
    },
    {
      id: "col_done",
      name: "Done",
      cards: [
        { id: "card_5", title: "Plugin plan approved", meta: "ds.md" }
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
var ACTIONS = {
  ping: handlePing,
  saveTheme: handleSaveTheme,
  setActiveTab: handleSetActiveTab,
  refreshTab: handleRefreshTab,
  refreshAll: handleRefreshAll
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

// anp-15-kanban/kanban.js
var plugin = {
  appOption: {
    /* ----------------------------------- */
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
    return {
      version: 1,
      activeTabId: config.activeTabId,
      tabs: config.tabs,
      boards: {},
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