(() => {
// anp-15-kanban/lib/core/constants.js
var SETTINGS_KEYS = {
  tabs: "Kanban Tabs",
  settings: "Kanban Settings",
  theme: "Kanban Theme",
  // retained for backward-compatibility lookup
  dateFormat: "Kanban Date Format"
};
var DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
var DEFAULT_THEME_ID = "light";
var DEFAULT_SETTINGS = {
  theme: DEFAULT_THEME_ID,
  dateFormat: DEFAULT_DATE_FORMAT,
  showEmptyColumns: false,
  quickDateEnabled: false,
  sortMode: "none",
  expandCardInfo: false
};
function emptyTabsConfig() {
  return {
    tabs: [],
    activeTabId: null,
    settings: { dateFormat: DEFAULT_DATE_FORMAT }
  };
}
var TAB_KINDS = /* @__PURE__ */ new Set(["note", "tag", "notes"]);
function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
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
  var SETTINGS_STORAGE_PREFIX = "ANP_KB_";
  var currentTheme = null;

  function getSetting(key, fallback) {
    if (STATE.settings && STATE.settings[key] !== undefined && STATE.settings[key] !== null) {
      return STATE.settings[key];
    }
    try {
      var cached = localStorage.getItem(SETTINGS_STORAGE_PREFIX + key);
      if (cached !== null) {
        try { return JSON.parse(cached); } catch (e) { return cached; }
      }
    } catch (e) {}
    return fallback;
  }

  function setLocalSetting(key, val) {
    try {
      localStorage.setItem(SETTINGS_STORAGE_PREFIX + key, JSON.stringify(val));
    } catch (e) {}
  }

  var sortMode = getSetting("sortMode", "none");
  var showEmptyColumns = !!getSetting("showEmptyColumns", false);
  var quickDateEnabled = !!getSetting("quickDateEnabled", false);
  var expandCardInfo = !!getSetting("expandCardInfo", false);
  var collapsedSections = {};
  var openInfoCards = {};
  var initialColumnOrders = {};
  var dragType = null; // "card" | "column" | "tab"
  var dragCardId = null;
  var dragColId = null;
  var dragTabIndex = null;

  /* ---------------- crisp svg icons ---------------- */

  var SVG_ICONS = {
    note: '<svg class="kb-icon kb-icon-stroke" width="13" height="13" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
    tag: '<svg class="kb-icon kb-icon-stroke" width="13" height="13" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
    chevronLeft: '<svg class="kb-icon kb-icon-stroke" width="11" height="11" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>',
    chevronRight: '<svg class="kb-icon kb-icon-stroke" width="11" height="11" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>',
    close: '<svg class="kb-icon kb-icon-stroke" width="11" height="11" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    plus: '<svg class="kb-icon kb-icon-stroke" width="12" height="12" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    edit: '<svg class="kb-icon kb-icon-stroke" width="12" height="12" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    transfer: '<svg class="kb-icon kb-icon-stroke" width="12" height="12" viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>',
    trash: '<svg class="kb-icon kb-icon-stroke" width="12" height="12" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
    externalLink: '<svg class="kb-icon kb-icon-stroke" width="12" height="12" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
    chevronDownSolid: '<svg class="kb-icon kb-icon-fill" width="10" height="10" viewBox="0 0 24 24"><polygon points="6 9 12 15 18 9"></polygon></svg>',
    chevronRightSolid: '<svg class="kb-icon kb-icon-fill" width="10" height="10" viewBox="0 0 24 24"><polygon points="9 6 15 12 9 18"></polygon></svg>',
    info: '<svg class="kb-icon kb-icon-stroke" width="12" height="12" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    more: '<svg class="kb-icon kb-icon-fill" width="12" height="12" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle><circle cx="5" cy="12" r="2"></circle></svg>',
    grip: '<svg class="kb-icon kb-icon-fill" width="10" height="14" viewBox="0 0 24 24"><circle cx="9" cy="5" r="2"></circle><circle cx="9" cy="12" r="2"></circle><circle cx="9" cy="19" r="2"></circle><circle cx="15" cy="5" r="2"></circle><circle cx="15" cy="12" r="2"></circle><circle cx="15" cy="19" r="2"></circle></svg>'
  };

  function svg(name) {
    var wrapper = document.createElement("span");
    wrapper.style.display = "inline-flex";
    wrapper.style.alignItems = "center";
    wrapper.style.justifyContent = "center";
    wrapper.innerHTML = SVG_ICONS[name] || "";
    return wrapper.firstElementChild || document.createTextNode("");
  }

  /* ---------------- toasts ---------------- */

  function showToast(msg) {
    var host = document.getElementById("kb-toasts");
    if (!host) return;
    var toast = document.createElement("div");
    toast.className = "kb-toast";
    toast.textContent = msg;
    host.appendChild(toast);
    setTimeout(function () { toast.classList.add("kb-toast-visible"); }, 10);
    setTimeout(function () {
      toast.classList.remove("kb-toast-visible");
      setTimeout(function () { if (toast.parentElement) toast.parentElement.removeChild(toast); }, 250);
    }, 2800);
  }

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
        setLocalSetting("theme", theme.id);
        callPlugin("saveTheme", { themeId: theme.id });
        showToast("Theme: " + theme.name);
      }
    } catch (e) { /* storage fallback */ }
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

  /* ---------------- rendering helpers ---------------- */

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

  /* ---------------- tabs with drag and drop ---------------- */

  function renderTabs() {
    var host = document.getElementById("kb-tabs");
    if (!host) return;
    host.innerHTML = "";
    var tabs = STATE.tabs || [];
    var act = activeTab();

    tabs.forEach(function (tab, tabIdx) {
      var chip = el("div", "kb-tab" + (act && tab.id === act.id ? " kb-tab-active" : ""));
      chip.setAttribute("draggable", "true");
      chip.setAttribute("data-tab-index", String(tabIdx));
      chip.title = (tab.kind === "tag" ? "Tag Board: #" : "Note Board: ") + tab.name;

      var badge = el("span", "kb-tab-badge kb-tab-badge-" + tab.kind);
      badge.appendChild(svg(tab.kind === "tag" ? "tag" : "note"));
      badge.appendChild(document.createTextNode(tab.kind === "tag" ? "TAG" : "NOTE"));
      chip.appendChild(badge);

      chip.appendChild(el("span", "kb-tab-name", tab.name));

      var activate = function () {
        if (STATE.activeTabId === tab.id) return;
        STATE.activeTabId = tab.id;
        renderAll();
        callPlugin("setActiveTab", { tabId: tab.id });
      };
      chip.addEventListener("click", activate);

      // Tab drag-and-drop
      chip.addEventListener("dragstart", function (e) {
        dragType = "tab";
        dragTabIndex = tabIdx;
        e.dataTransfer.setData("text/plain", "tab::" + tabIdx);
        e.dataTransfer.effectAllowed = "move";
        chip.classList.add("kb-tab-dragging");
      });
      chip.addEventListener("dragend", function () {
        dragType = null;
        dragTabIndex = null;
        chip.classList.remove("kb-tab-dragging");
      });
      chip.addEventListener("dragover", function (e) {
        if (dragType !== "tab") return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        chip.classList.add("kb-tab-drop-hover");
      });
      chip.addEventListener("dragleave", function () {
        chip.classList.remove("kb-tab-drop-hover");
      });
      chip.addEventListener("drop", function (e) {
        if (dragType !== "tab") return;
        e.preventDefault();
        chip.classList.remove("kb-tab-drop-hover");
        if (dragTabIndex === null || dragTabIndex === tabIdx) return;

        var fromIdx = dragTabIndex;
        var toIdx = tabIdx;
        var movedTab = STATE.tabs.splice(fromIdx, 1)[0];
        STATE.tabs.splice(toIdx, 0, movedTab);
        renderTabs();
        callPlugin("reorderTabs", { fromIndex: fromIdx, toIndex: toIdx });
        showToast("Tab reordered");
      });

      var tools = el("span", "kb-tab-tools");
      addTabToolSvg(tools, "chevronLeft", "Move tab left", function (e) {
        e.stopPropagation();
        callPlugin("moveTabDir", { tabId: tab.id, direction: "left" });
      });
      addTabToolSvg(tools, "chevronRight", "Move tab right", function (e) {
        e.stopPropagation();
        callPlugin("moveTabDir", { tabId: tab.id, direction: "right" });
      });
      addTabToolSvg(tools, "close", "Close tab", function (e) {
        e.stopPropagation();
        callPlugin("closeTab", { tabId: tab.id });
      });
      chip.appendChild(tools);
      host.appendChild(chip);
    });

    var addBtn = el("button", "kb-tab-add");
    addBtn.type = "button";
    addBtn.title = "Add a note or tag board";
    addBtn.appendChild(svg("plus"));
    addBtn.appendChild(document.createTextNode(" New tab"));
    addBtn.addEventListener("click", function () {
      callPlugin("addTab");
    });
    host.appendChild(addBtn);
  }

  function addTabToolSvg(host, iconName, title, onClick) {
    var btn = el("button", "kb-tab-tool");
    btn.type = "button";
    btn.title = title;
    btn.appendChild(svg(iconName));
    btn.addEventListener("click", onClick);
    host.appendChild(btn);
  }

  var searchQuery = "";

  /* ---------------- formatting ---------------- */

  function formatStamp(unixSec) {
    if (!unixSec) return "";
    var d = new Date(unixSec * 1000);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function formatFullStamp(unixSec) {
    if (!unixSec) return "";
    var d = new Date(unixSec * 1000);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function formatTimeRange(startSec, endSec) {
    return formatStamp(startSec) + " - " + formatStamp(endSec);
  }

  function formatTaskRepeat(repeatStr) {
    if (!repeatStr) return "repeat";
    if (/FREQ=DAILY/i.test(repeatStr)) return "daily";
    if (/FREQ=WEEKLY/i.test(repeatStr)) return "weekly";
    if (/FREQ=MONTHLY/i.test(repeatStr)) return "monthly";
    if (/FREQ=YEARLY/i.test(repeatStr)) return "yearly";
    return "repeat";
  }

  /* ---------------- sorting ---------------- */

  var SORT_MODES = ["none", "score", "startDate", "important", "urgent"];
  var SORT_LABELS = {
    none: "Sort Tasks",
    score: "Sort: Score",
    startDate: "Sort: Date",
    important: "Sort: Important",
    urgent: "Sort: Urgent"
  };

  function applySort(cards) {
    var copy = cards.slice();
    if (sortMode === "score") {
      copy.sort(function (a, b) { return (b.score || 0) - (a.score || 0); });
    } else if (sortMode === "startDate") {
      copy.sort(function (a, b) { return (b.startAt || 0) - (a.startAt || 0); });
    } else if (sortMode === "important") {
      copy.sort(function (a, b) { return (b.important ? 1 : 0) - (a.important ? 1 : 0); });
    } else if (sortMode === "urgent") {
      copy.sort(function (a, b) { return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0); });
    }
    return copy;
  }

  function cycleSort() {
    var idx = SORT_MODES.indexOf(sortMode);
    sortMode = SORT_MODES[(idx + 1) % SORT_MODES.length];
    setLocalSetting("sortMode", sortMode);
    callPlugin("saveSetting", { sortMode: sortMode });
    updateSortUi();
    renderBoard();
    if (sortMode !== "none") {
      showToast("Sorted by " + (SORT_LABELS[sortMode] || sortMode).replace("Sort: ", ""));
    } else {
      showToast("Reset to default task order");
    }
  }

  function updateSortUi() {
    var sortBtn = document.getElementById("kb-sort-btn");
    var sortLbl = document.getElementById("kb-sort-label");
    var isSorted = sortMode !== "none";
    if (sortLbl) sortLbl.textContent = SORT_LABELS[sortMode] || "Sort Tasks";
    if (sortBtn) sortBtn.classList.toggle("kb-btn-active", isSorted);

    var tab = activeTab();
    var isNoteBoard = tab && tab.kind === "note";

    var saveSortBtn = document.getElementById("kb-save-sort-btn");
    if (saveSortBtn) saveSortBtn.style.display = (isSorted && isNoteBoard) ? "inline-flex" : "none";

    var resetSortBtn = document.getElementById("kb-reset-sort-btn");
    if (resetSortBtn) resetSortBtn.style.display = isSorted ? "inline-flex" : "none";

    // Column reorder dirty state
    var currentCols = (tab && STATE.boards && STATE.boards[tab.id] && STATE.boards[tab.id].columns) || [];
    var initialCols = tab && initialColumnOrders[tab.id];
    var isColsDirty = false;
    if (initialCols && isNoteBoard) {
      var curIds = currentCols.map(function (c) { return c.id; }).join(",");
      var initIds = initialCols.map(function (c) { return c.id; }).join(",");
      isColsDirty = curIds !== initIds;
    }

    var saveColsBtn = document.getElementById("kb-save-cols-btn");
    if (saveColsBtn) saveColsBtn.style.display = (isColsDirty && isNoteBoard) ? "inline-flex" : "none";

    var resetColsBtn = document.getElementById("kb-reset-cols-btn");
    if (resetColsBtn) resetColsBtn.style.display = (isColsDirty && isNoteBoard) ? "inline-flex" : "none";
  }

  function resetSort() {
    sortMode = "none";
    setLocalSetting("sortMode", "none");
    callPlugin("saveSetting", { sortMode: "none" });
    updateSortUi();
    renderBoard();
    showToast("Reset to default task order");
  }

  function resetColumns() {
    var tab = activeTab();
    if (!tab || !initialColumnOrders[tab.id] || !STATE.boards || !STATE.boards[tab.id]) return;
    STATE.boards[tab.id].columns = initialColumnOrders[tab.id].slice();
    renderBoard();
    updateSortUi();
    showToast("Reset column order to source note");
  }

  /* ---------------- board rendering & column drag-and-drop ---------------- */

  function renderBoard() {
    var board = document.getElementById("kb-board");
    if (!board) return;
    board.innerHTML = "";
    var tab = activeTab();
    var data = tab && STATE.boards ? STATE.boards[tab.id] : null;
    var columns = data && data.columns ? data.columns : [];

    // Cache initial column order on first load
    if (tab && !initialColumnOrders[tab.id] && columns.length) {
      initialColumnOrders[tab.id] = columns.slice();
    }

    updateSortUi();

    if (!columns.length) {
      board.appendChild(el("div", "kb-empty", "No board data yet. Use \\u201CRefresh\\u201D or add a tab."));
      return;
    }

    var anyVisible = false;
    columns.forEach(function (col, colIndex) {
      var isLast = colIndex === columns.length - 1;
      var isTagBoard = data.kind === "tag";

      var allColCards = col.cards || [];
      var visibleCards = allColCards.filter(function (card) {
        if (!searchQuery) return true;
        var hay = ((card.title || "") + " " + (card.content || "") + " " +
          (card.tags || []).join(" ") + " " +
          (card.labels || []).map(function (l) { return l.name; }).join(" ")).toLowerCase();
        return hay.indexOf(searchQuery) !== -1;
      });

      // Hide empty columns unless showEmptyColumns is enabled
      if (!showEmptyColumns && !visibleCards.length) return;
      anyVisible = true;

      var colEl = el("section", "kb-column" + (isLast && data.kind === "note" ? " kb-column-last" : ""));
      colEl.setAttribute("data-column-id", col.id);
      colEl.setAttribute("data-column-index", String(colIndex));

      var head = el("header", "kb-column-head");
      head.setAttribute("draggable", "true");
      head.title = "Drag to reorder column";

      // Column drag-and-drop
      head.addEventListener("dragstart", function (e) {
        dragType = "column";
        dragColId = col.id;
        e.dataTransfer.setData("text/plain", "col::" + col.id);
        e.dataTransfer.effectAllowed = "move";
        colEl.classList.add("kb-col-dragging");
      });
      head.addEventListener("dragend", function () {
        dragType = null;
        dragColId = null;
        colEl.classList.remove("kb-col-dragging");
      });
      colEl.addEventListener("dragover", function (e) {
        if (dragType !== "column") return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        colEl.classList.add("kb-col-drop-hover");
      });
      colEl.addEventListener("dragleave", function () {
        colEl.classList.remove("kb-col-drop-hover");
      });
      colEl.addEventListener("drop", function (e) {
        if (dragType !== "column") return;
        e.preventDefault();
        colEl.classList.remove("kb-col-drop-hover");
        if (!dragColId || dragColId === col.id) return;

        var fromIdx = columns.findIndex(function (c) { return c.id === dragColId; });
        var toIdx = colIndex;
        if (fromIdx === -1 || fromIdx === toIdx) return;

        var moved = columns.splice(fromIdx, 1)[0];
        columns.splice(toIdx, 0, moved);
        renderBoard();
        showToast("Column reordered (Save to Note to persist)");
      });

      var titleWrap = el("div", "kb-col-titlewrap");
      var dragHandle = el("span", "kb-col-drag-handle");
      dragHandle.appendChild(svg("grip"));
      titleWrap.appendChild(dragHandle);
      titleWrap.appendChild(el("h3", "kb-column-title", col.name));
      head.appendChild(titleWrap);

      var actionsWrap = el("div", "kb-col-actions");

      // Column tools with crisp SVGs
      if (data.kind === "note") {
        var tools = el("div", "kb-col-tools");
        addColToolSvg(tools, "chevronLeft", "Move column left", function (e) {
          e.stopPropagation();
          callPlugin("moveColumn", { tabId: STATE.activeTabId, columnId: col.id, direction: "left" });
        });
        addColToolSvg(tools, "chevronRight", "Move column right", function (e) {
          e.stopPropagation();
          callPlugin("moveColumn", { tabId: STATE.activeTabId, columnId: col.id, direction: "right" });
        });
        addColToolSvg(tools, "edit", "Rename column", function (e) {
          e.stopPropagation();
          callPlugin("renameColumn", { tabId: STATE.activeTabId, columnId: col.id });
        });
        addColToolSvg(tools, "transfer", "Move column to another board tab", function (e) {
          e.stopPropagation();
          callPlugin("moveColumnToTab", { tabId: STATE.activeTabId, columnId: col.id });
        });
        addColToolSvg(tools, "trash", "Delete column (tasks move to top)", function (e) {
          e.stopPropagation();
          callPlugin("deleteColumn", { tabId: STATE.activeTabId, columnId: col.id });
        });
        actionsWrap.appendChild(tools);
      } else if (isTagBoard) {
        var ttools = el("div", "kb-col-tools");
        addColToolSvg(ttools, "externalLink", "Open note in Amplenote", function (e) {
          e.stopPropagation();
          callPlugin("openCard", { noteUUID: col.noteUUID });
        });
        addColToolSvg(ttools, "edit", "Rename note", function (e) {
          e.stopPropagation();
          callPlugin("renameNote", { tabId: STATE.activeTabId, columnId: col.id });
        });
        actionsWrap.appendChild(ttools);
      }

      var over = data.kind === "note" && col.wipLimit && visibleCards.length > col.wipLimit;
      var count = el("span", "kb-count" + (over ? " kb-over" : ""),
        over ? visibleCards.length + " / " + col.wipLimit : String(visibleCards.length));
      if (data.kind === "note") {
        count.title = "Set WIP limit";
        count.addEventListener("click", function (e) {
          e.stopPropagation();
          callPlugin("setWipLimit", { tabId: STATE.activeTabId, columnId: col.id });
        });
      }
      actionsWrap.appendChild(count);

      var addBtn = el("button", "kb-add-card");
      addBtn.type = "button";
      addBtn.title = "Add card to " + col.name;
      addBtn.appendChild(svg("plus"));
      addBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        callPlugin("createCard", { tabId: STATE.activeTabId, columnId: col.id, columnName: col.name });
      });
      actionsWrap.appendChild(addBtn);

      head.appendChild(actionsWrap);
      colEl.appendChild(head);

      // Section-based cards for Tag board vs Flat cards for Note board
      if (isTagBoard && col.sections && col.sections.length > 0) {
        var sectionsHost = el("div", "kb-sections");
        col.sections.forEach(function (sec) {
          var secCards = (sec.cards || []).filter(function (card) {
            if (!searchQuery) return true;
            var hay = ((card.title || "") + " " + (card.content || "") + " " +
              (card.tags || []).join(" ") + " " +
              (card.labels || []).map(function (l) { return l.name; }).join(" ")).toLowerCase();
            return hay.indexOf(searchQuery) !== -1;
          });

          // Omit empty sections
          if (!secCards.length) return;

          var secKey = col.id + "::" + sec.id;
          var isCollapsed = !!collapsedSections[secKey];

          var secEl = el("div", "kb-section");
          var secHead = el("div", "kb-section-head");
          var tw = el("div", "kb-section-titlewrap");
          var toggleIcon = el("span", "kb-section-toggle");
          toggleIcon.appendChild(svg(isCollapsed ? "chevronRightSolid" : "chevronDownSolid"));
          tw.appendChild(toggleIcon);
          tw.appendChild(el("span", "kb-section-title", sec.name + " (" + secCards.length + ")"));
          secHead.appendChild(tw);

          var secAdd = el("button", "kb-col-btn");
          secAdd.type = "button";
          secAdd.title = "Add task in " + sec.name;
          secAdd.appendChild(svg("plus"));
          secAdd.addEventListener("click", function (e) {
            e.stopPropagation();
            callPlugin("createCard", { tabId: STATE.activeTabId, columnId: col.id, sectionId: sec.id });
          });
          secHead.appendChild(secAdd);

          secHead.addEventListener("click", function () {
            collapsedSections[secKey] = !collapsedSections[secKey];
            renderBoard();
          });
          secEl.appendChild(secHead);

          var secList = el("div", "kb-section-cards" + (isCollapsed ? " kb-collapsed" : ""));
          wireDropZone(secList, col.id, sec.id);
          applySort(secCards).forEach(function (card) {
            secList.appendChild(buildCardEl(card));
          });
          secEl.appendChild(secList);
          sectionsHost.appendChild(secEl);
        });
        colEl.appendChild(sectionsHost);
      } else {
        var list = el("div", "kb-cards");
        wireDropZone(list, col.id, null);
        applySort(visibleCards).forEach(function (card) {
          list.appendChild(buildCardEl(card));
        });
        colEl.appendChild(list);
      }

      board.appendChild(colEl);
    });

    if (!anyVisible) {
      board.appendChild(el("div", "kb-empty", searchQuery
        ? "No cards match \\u201C" + searchQuery + "\\u201D."
        : "No tasks found in this board. Click \\u201C+\\u201D to add a task."));
    }
  }

  function addColToolSvg(host, iconName, title, onClick) {
    var btn = el("button", "kb-col-btn");
    btn.type = "button";
    btn.title = title;
    btn.appendChild(svg(iconName));
    btn.addEventListener("click", onClick);
    host.appendChild(btn);
  }

  /* ---------------- card building ---------------- */

  function buildCardEl(card) {
    var cardEl = el("article", "kb-card" + (card.completedAt ? " kb-card-done" : ""));
    cardEl.setAttribute("data-card-id", card.id);
    cardEl.setAttribute("draggable", "true");

    // Badges (Urgent, Important, Score, Subtasks) - only when values exist
    var hasBadges = card.urgent || card.important || (card.score !== null && card.score !== undefined) || card.isParent;
    if (hasBadges) {
      var badges = el("div", "kb-task-badges");
      if (card.urgent) badges.appendChild(el("span", "kb-badge kb-badge-urgent", "\\uD83D\\uDD25 Urgent"));
      if (card.important) badges.appendChild(el("span", "kb-badge kb-badge-important", "\\u2B50 Important"));
      if (card.score !== null && card.score !== undefined) {
        badges.appendChild(el("span", "kb-badge kb-badge-score", "\\uD83C\\uDFAF " + Number(card.score).toFixed(1)));
      }
      if (card.isParent) badges.appendChild(el("span", "kb-badge kb-badge-subtask", "\\uD83D\\uDCCB Subtasks"));
      cardEl.appendChild(badges);
    }

    // Card Action Buttons (Top Right) with crisp SVGs
    var actions = el("div", "kb-card-actions");

    if (quickDateEnabled) {
      var atBtn = el("button", "kb-card-at-btn", "@");
      atBtn.type = "button";
      atBtn.title = "Set task date (@)";
      atBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        callPlugin("quickSetDate", { cardId: card.id });
      });
      actions.appendChild(atBtn);
    }

    var infoBtn = el("button", "kb-card-info-btn");
    infoBtn.type = "button";
    infoBtn.title = "View task details";
    infoBtn.appendChild(svg("info"));
    infoBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var wasOpen = openInfoCards[card.id] !== undefined ? !!openInfoCards[card.id] : expandCardInfo;
      openInfoCards[card.id] = !wasOpen;
      renderBoard();
    });
    actions.appendChild(infoBtn);

    var moreBtn = el("button", "kb-card-menu");
    moreBtn.type = "button";
    moreBtn.title = "Card actions";
    moreBtn.appendChild(svg("more"));
    moreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      callPlugin("cardMenu", { cardId: card.id });
    });
    actions.appendChild(moreBtn);
    cardEl.appendChild(actions);

    // Body / Content
    if (card.html) {
      var body = el("div", "kb-card-body");
      body.innerHTML = card.html;
      cardEl.appendChild(body);
    } else {
      cardEl.appendChild(el("div", "kb-card-title", card.title || card.content));
    }

    // Labels
    if (card.labels && card.labels.length) {
      var labels = el("div", "kb-card-labels");
      card.labels.forEach(function (l) {
        var chip = el("span", "kb-label-chip", l.name);
        if (l.color) {
          var dot = el("span", "kb-label-dot");
          dot.style.background = "#" + String(l.color).replace("#", "");
          chip.insertBefore(dot, chip.firstChild);
        }
        labels.appendChild(chip);
      });
      cardEl.appendChild(labels);
    }

    // Tags
    if (card.tags && card.tags.length) {
      var tagChips = el("div", "kb-card-tags");
      card.tags.forEach(function (t) {
        tagChips.appendChild(el("span", "kb-tag-chip", t));
      });
      cardEl.appendChild(tagChips);
    }

    // Image
    if (card.imageUrl) {
      var img = document.createElement("img");
      img.className = "kb-card-img";
      img.loading = "lazy";
      img.src = card.imageUrl;
      img.alt = "";
      cardEl.appendChild(img);
    }

    // Meta chips - only when present
    var nowSec = Math.floor(Date.now() / 1000);
    var hasMeta = card.completedAt || card.startAt || card.deadline || card.repeat || card.isRepeating || (card.hideUntil && card.hideUntil > nowSec);
    if (hasMeta) {
      var bits = [];
      if (card.completedAt) bits.push("\\u2713 done");
      if (card.startAt && card.endAt) {
        bits.push("\\uD83D\\uDD52 " + formatTimeRange(card.startAt, card.endAt));
      } else if (card.startAt) {
        bits.push("\\u25B6 " + formatStamp(card.startAt));
      }
      if (card.deadline) bits.push("\\u23F0 " + formatStamp(card.deadline));
      if (card.hideUntil && card.hideUntil > nowSec) bits.push("\\uD83D\\uDE48 " + formatStamp(card.hideUntil));
      if (card.repeat) {
        bits.push("\\uD83D\\uDD01 " + formatTaskRepeat(card.repeat));
      } else if (card.isRepeating) {
        bits.push("\\uD83D\\uDD01 repeat");
      }
      if (bits.length) {
        cardEl.appendChild(el("div", "kb-card-meta", bits.join("  \\u00B7  ")));
      }
    }

    // Inline Task Details Popup (from \u2139 button or expandCardInfo)
    var isCardInfoOpen = openInfoCards[card.id] !== undefined ? !!openInfoCards[card.id] : expandCardInfo;
    if (isCardInfoOpen) {
      var details = el("div", "kb-task-details");
      var parts = [];

      var prio = [];
      if (card.important) prio.push("<b>Important:</b> Yes");
      if (card.urgent) prio.push("<b>Urgent:</b> Yes");
      if (card.score !== null && card.score !== undefined) prio.push("<b>Score:</b> " + Number(card.score).toFixed(2));
      if (prio.length) parts.push(prio.join(" | "));

      var dates = [];
      if (card.startAt) dates.push("<b>Start:</b> " + formatFullStamp(card.startAt));
      if (card.endAt) dates.push("<b>End:</b> " + formatFullStamp(card.endAt));
      if (card.deadline) dates.push("<b>Deadline:</b> " + formatFullStamp(card.deadline));
      if (card.hideUntil) dates.push("<b>Hide until:</b> " + formatFullStamp(card.hideUntil));
      if (dates.length) parts.push(dates.join("<br>"));

      if (card.repeat || card.isRepeating) {
        parts.push("<b>Repeat:</b> " + formatTaskRepeat(card.repeat || "Recurring"));
      }

      var status = [];
      if (card.completedAt) status.push("<b>Completed:</b> " + formatFullStamp(card.completedAt));
      if (card.dismissedAt) status.push("<b>Dismissed:</b> " + formatFullStamp(card.dismissedAt));
      if (status.length) parts.push(status.join("<br>"));

      if (card.noteName) parts.push("<b>Note:</b> " + card.noteName);

      details.innerHTML = parts.join("<hr>");
      cardEl.appendChild(details);
    }

    // Drag events
    cardEl.addEventListener("dragstart", function (e) {
      dragType = "card";
      dragCardId = card.id;
      e.dataTransfer.setData("text/plain", "card::" + card.id);
      e.dataTransfer.effectAllowed = "move";
      cardEl.classList.add("kb-dragging");
    });
    cardEl.addEventListener("dragend", function () {
      dragType = null;
      dragCardId = null;
      cardEl.classList.remove("kb-dragging");
    });

    // Click opens rich task editor
    cardEl.addEventListener("click", function (e) {
      if (dragCardId || dragType) return;
      if (e.target && e.target.closest && (e.target.closest("a") || e.target.closest("button"))) return;
      callPlugin("editCard", { cardId: card.id });
    });

    return cardEl;
  }

  /* ---------------- drop zone for cards ---------------- */

  function wireDropZone(listEl, columnId, sectionId) {
    listEl.addEventListener("dragover", function (e) {
      if (dragType && dragType !== "card") return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      listEl.classList.add("kb-drop-hover");
    });
    listEl.addEventListener("dragleave", function () {
      listEl.classList.remove("kb-drop-hover");
    });
    listEl.addEventListener("drop", function (e) {
      if (dragType && dragType !== "card") return;
      e.preventDefault();
      listEl.classList.remove("kb-drop-hover");
      var raw = (e.dataTransfer && e.dataTransfer.getData("text/plain")) || ("card::" + dragCardId);
      var cardId = raw.indexOf("card::") === 0 ? raw.slice(6) : (dragCardId || raw);
      if (!cardId) return;

      var board = document.getElementById("kb-board");
      var cardEl = board && board.querySelector('[data-card-id="' + cssEscape(cardId) + '"]');
      if (cardEl && cardEl.parentElement !== listEl) {
        listEl.insertBefore(cardEl, listEl.firstChild);
      }
      callPlugin("moveCard", {
        tabId: STATE.activeTabId,
        cardId: cardId,
        toColumnId: columnId,
        toSectionId: sectionId,
      });
    });
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    var BS = String.fromCharCode(92);
    var DQ = String.fromCharCode(34);
    var s = String(value);
    s = s.split(BS).join(BS + BS);
    s = s.split(DQ).join(BS + DQ);
    return s;
  }

  /* ---------------- formatters ---------------- */

  function formatStamp(unixSeconds) {
    if (!unixSeconds) return "";
    var d = new Date(unixSeconds * 1000);
    var fmt = (STATE.settings && STATE.settings.dateFormat) || "YYYY-MM-DD";
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return fmt
      .replace(/YYYY/g, String(d.getFullYear()))
      .replace(/MMM/g, months[d.getMonth()])
      .replace(/MM/g, pad(d.getMonth() + 1))
      .replace(/DD/g, pad(d.getDate()));
  }

  function formatTimeRange(startSec, endSec) {
    var d1 = new Date(startSec * 1000);
    var d2 = new Date(endSec * 1000);
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var t1 = pad(d1.getHours()) + ":" + pad(d1.getMinutes());
    var t2 = pad(d2.getHours()) + ":" + pad(d2.getMinutes());
    return formatStamp(startSec) + " " + t1 + "-" + t2;
  }

  function formatFullStamp(unixSeconds) {
    if (!unixSeconds) return "Not set";
    var d = new Date(unixSeconds * 1000);
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " +
      pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function formatTaskRepeat(repeatString) {
    if (!repeatString || typeof repeatString !== "string") return "Recurring";
    var m = repeatString.match(/FREQ=([^;\\s]+)/i);
    return m ? m[1].toLowerCase() : repeatString;
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

  function updateEmptyUi() {
    var btn = document.getElementById("kb-toggle-empty-btn");
    var lbl = document.getElementById("kb-empty-label");
    if (btn) btn.classList.toggle("kb-btn-active", showEmptyColumns);
    if (lbl) lbl.textContent = showEmptyColumns ? "Empty: Show" : "Empty";
  }

  function toggleEmptyColumns() {
    showEmptyColumns = !showEmptyColumns;
    setLocalSetting("showEmptyColumns", showEmptyColumns);
    callPlugin("saveSetting", { showEmptyColumns: showEmptyColumns });
    updateEmptyUi();
    renderBoard();
    showToast(showEmptyColumns ? "Showing all columns (including empty)" : "Hiding empty columns");
  }

  function updateInfoUi() {
    var btn = document.getElementById("kb-toggle-info-btn");
    var lbl = document.getElementById("kb-info-label");
    if (btn) btn.classList.toggle("kb-btn-active", expandCardInfo);
    if (lbl) lbl.textContent = expandCardInfo ? "Info: All" : "Info";
  }

  function toggleAllInfo() {
    var tab = activeTab();
    var data = tab && STATE.boards ? STATE.boards[tab.id] : null;
    var cols = (data && data.columns) || [];
    var allCards = [];
    cols.forEach(function (c) {
      if (c.cards) allCards = allCards.concat(c.cards);
      if (c.sections) {
        c.sections.forEach(function (s) {
          if (s.cards) allCards = allCards.concat(s.cards);
        });
      }
    });

    var totalCards = allCards.length;
    var openCount = 0;
    allCards.forEach(function (c) {
      var isOpen = openInfoCards[c.id] !== undefined ? !!openInfoCards[c.id] : expandCardInfo;
      if (isOpen) openCount++;
    });

    var shouldExpand = openCount < totalCards;
    allCards.forEach(function (c) {
      openInfoCards[c.id] = shouldExpand;
    });

    if (data && data.kind === "tag" && shouldExpand) {
      collapsedSections = {};
    }

    expandCardInfo = shouldExpand;
    setLocalSetting("expandCardInfo", expandCardInfo);
    callPlugin("saveSetting", { expandCardInfo: expandCardInfo });

    updateInfoUi();
    renderBoard();
    showToast(shouldExpand ? "Expanded all task details" : "Collapsed all task details");
  }

  function updateQuickDateUi() {
    var btn = document.getElementById("kb-toggle-date-action-btn");
    if (btn) btn.classList.toggle("kb-btn-active", quickDateEnabled);
  }

  function toggleQuickDate() {
    quickDateEnabled = !quickDateEnabled;
    setLocalSetting("quickDateEnabled", quickDateEnabled);
    callPlugin("saveSetting", { quickDateEnabled: quickDateEnabled });
    updateQuickDateUi();
    renderBoard();
    showToast(quickDateEnabled ? "Quick @ date buttons enabled on cards" : "Quick @ date buttons disabled");
  }

  /* ---------------- actions ---------------- */

  function wireControls() {
    var themeBtn = document.getElementById("kb-theme-btn");
    if (themeBtn) themeBtn.addEventListener("click", cycleTheme);

    var toggleEmptyBtn = document.getElementById("kb-toggle-empty-btn");
    if (toggleEmptyBtn) toggleEmptyBtn.addEventListener("click", toggleEmptyColumns);

    var toggleInfoBtn = document.getElementById("kb-toggle-info-btn");
    if (toggleInfoBtn) toggleInfoBtn.addEventListener("click", toggleAllInfo);

    var toggleDateBtn = document.getElementById("kb-toggle-date-action-btn");
    if (toggleDateBtn) toggleDateBtn.addEventListener("click", toggleQuickDate);

    var sortBtn = document.getElementById("kb-sort-btn");
    if (sortBtn) sortBtn.addEventListener("click", cycleSort);

    var resetSortBtn = document.getElementById("kb-reset-sort-btn");
    if (resetSortBtn) resetSortBtn.addEventListener("click", resetSort);

    var saveSortBtn = document.getElementById("kb-save-sort-btn");
    if (saveSortBtn) {
      saveSortBtn.addEventListener("click", function () {
        callPlugin("saveSortToNote", { tabId: STATE.activeTabId, sortMode: sortMode });
      });
    }

    var saveColsBtn = document.getElementById("kb-save-cols-btn");
    if (saveColsBtn) {
      saveColsBtn.addEventListener("click", function () {
        var tab = activeTab();
        var cols = (tab && STATE.boards && STATE.boards[tab.id] && STATE.boards[tab.id].columns) || [];
        var colIds = cols.map(function (c) { return c.id; });
        callPlugin("saveColumnsToNote", { tabId: STATE.activeTabId, columnIds: colIds });
      });
    }

    var resetColsBtn = document.getElementById("kb-reset-cols-btn");
    if (resetColsBtn) {
      resetColsBtn.addEventListener("click", resetColumns);
    }

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

    var fmtBtn = document.getElementById("kb-datefmt-btn");
    if (fmtBtn) {
      fmtBtn.addEventListener("click", function () {
        callPlugin("setDateFormat");
      });
      var fmtLabel = document.getElementById("kb-datefmt-label");
      if (fmtLabel && STATE.settings) fmtLabel.textContent = STATE.settings.dateFormat || "";
    }

    var search = document.getElementById("kb-search");
    if (search) {
      search.addEventListener("input", function () {
        searchQuery = search.value.trim().toLowerCase();
        renderBoard();
      });
      search.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && search.value.trim()) {
          callPlugin("globalSearch", { query: search.value.trim() });
        }
        if (e.key === "Escape") {
          search.value = "";
          searchQuery = "";
          renderBoard();
          search.blur();
        }
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
      if (e.key === "t" || e.key === "T") {
        cycleTheme();
      } else if (e.key === "/") {
        e.preventDefault();
        var s = document.getElementById("kb-search");
        if (s) { s.focus(); s.select(); }
      }
    });
  }

  /* ---------------- boot ---------------- */

  bootTheme();
  wireControls();
  updateEmptyUi();
  updateQuickDateUi();
  updateInfoUi();
  updateSortUi();
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

    /* ---------- board ---------- */
    .kb-board {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 14px 16px 24px 16px;
        overflow-x: auto;
        flex: 1 1 auto;
        border-top: 1px solid var(--kb-border);
    }
    .kb-empty {
        margin: 48px auto;
        color: var(--kb-text-muted);
        font-size: 14px;
        text-align: center;
        background: var(--kb-bg-column);
        border: 1px dashed var(--kb-border);
        border-radius: 12px;
        padding: 24px 32px;
        max-width: 440px;
        box-shadow: 0 2px 8px var(--kb-shadow);
    }
    .kb-column {
        flex: 0 0 auto;
        width: 324px;
        max-height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 12px;
        box-shadow: 0 2px 10px var(--kb-shadow);
        transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease;
    }
    .kb-column.kb-col-dragging {
        opacity: 0.4;
        transform: scale(0.98);
    }
    .kb-column.kb-col-drop-hover {
        outline: 2px dashed var(--kb-accent);
        outline-offset: 3px;
    }
    .kb-column-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 9px 12px;
        border-bottom: 1px solid var(--kb-border);
        cursor: grab;
        border-radius: 12px 12px 0 0;
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
    .kb-column:hover .kb-col-tools {
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
        border-radius: 8px;
        background: var(--kb-bg);
        overflow: hidden;
        box-shadow: 0 1px 3px var(--kb-shadow);
    }
    .kb-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 7px 10px;
        background: var(--kb-bg-column);
        cursor: pointer;
        user-select: none;
        font-size: 12px;
        font-weight: 600;
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
        gap: 8px;
        padding: 8px;
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
        border-radius: 9px;
        padding: 11px;
        box-shadow: 0 1px 3px var(--kb-shadow);
        cursor: grab;
        position: relative;
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
        gap: 5px;
        margin-bottom: 7px;
    }
    .kb-badge {
        font-size: 10.5px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 5px;
        line-height: 1.25;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        letter-spacing: 0.01em;
    }
    .kb-badge-urgent {
        background: color-mix(in srgb, var(--kb-danger) 14%, transparent);
        color: var(--kb-danger);
        border: 1px solid color-mix(in srgb, var(--kb-danger) 35%, transparent);
    }
    .kb-badge-important {
        background: color-mix(in srgb, var(--kb-accent) 14%, transparent);
        color: var(--kb-accent);
        border: 1px solid color-mix(in srgb, var(--kb-accent) 35%, transparent);
    }
    .kb-badge-score {
        background: var(--kb-bg-column);
        color: var(--kb-text-muted);
        border: 1px solid var(--kb-border);
        font-variant-numeric: tabular-nums;
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
        margin-top: 7px;
    }
    .kb-tag-chip {
        font-size: 10.5px;
        color: var(--kb-text-muted);
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 10px;
        padding: 1px 7px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 130px;
        transition: all 0.12s ease;
    }
    .kb-tag-chip:hover {
        color: var(--kb-text);
        border-color: var(--kb-accent);
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
        gap: 2px;
        padding: 2px;
        border-radius: 6px;
        background: var(--kb-bg-card);
        border: 1px solid var(--kb-border);
        box-shadow: 0 1px 4px var(--kb-shadow);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
        z-index: 2;
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
        margin-top: 8px;
    }
    .kb-label-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10.5px;
        color: var(--kb-text-muted);
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 10px;
        padding: 1px 8px;
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
        font-size: 13.5px;
        font-weight: 500;
        line-height: 1.4;
    }
    .kb-card-body {
        font-size: 13px;
        line-height: 1.45;
        overflow-wrap: break-word;
    }
    .kb-card-body img {
        max-width: 100%;
        border-radius: 6px;
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
    .kb-card-img {
        display: block;
        width: 100%;
        max-height: 160px;
        object-fit: cover;
        border-radius: 7px;
        margin-top: 8px;
    }
    .kb-card-meta {
        margin-top: 7px;
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
        opacity: 0.75;
    }

    /* ---------- task info details card ---------- */
    .kb-task-details {
        margin-top: 8px;
        padding: 9px;
        background: var(--kb-bg-column);
        border: 1px solid var(--kb-border);
        border-radius: 7px;
        font-size: 11px;
        line-height: 1.55;
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
        border-radius: 7px;
        padding: 9px 15px;
        font-size: 12.5px;
        font-weight: 500;
        box-shadow: 0 6px 18px var(--kb-shadow);
        opacity: 0;
        transform: translateY(10px) scale(0.98);
        transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
    }
    .kb-toast.kb-toast-visible {
        opacity: 1;
        transform: translateY(0) scale(1);
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
function buildBoardHtml(viewState) {
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
                <button id="kb-save-cols-btn" class="kb-btn" type="button" style="display:none;" title="Save dragged column order into note headings">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                    <span>Save Columns</span>
                </button>
                <button id="kb-reset-cols-btn" class="kb-btn" type="button" style="display:none;" title="Reset columns to original source note order">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                    <span>Reset Columns</span>
                </button>
                <button id="kb-sort-btn" class="kb-btn" type="button" title="Cycle card sort order">
                    <svg class="kb-icon kb-icon-stroke" width="14" height="14" viewBox="0 0 24 24"><path d="M7 15l5 5 5-5"></path><path d="M7 9l5-5 5 5"></path></svg>
                    <span id="kb-sort-label">Sort Tasks</span>
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
                <span id="kb-theme-icon">\u{1F3A8}</span> <span id="kb-theme-name">Theme</span>
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

// anp-15-kanban/lib/core/tabsConfig.js
function safeParse(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function normalizeColumnLimits(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out = {};
  for (const [name, limit] of Object.entries(raw)) {
    if (typeof name === "string" && name && Number.isInteger(limit) && limit > 0) {
      out[name] = limit;
    }
  }
  return out;
}
function normalizeConfig(raw) {
  const base = emptyTabsConfig();
  if (!raw || typeof raw !== "object") return base;
  const tabs = Array.isArray(raw.tabs) ? raw.tabs.filter(isValidTab).map((t) => ({ ...t, columnLimits: normalizeColumnLimits(t.columnLimits) })) : [];
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
function createTab({ kind, name, noteUUID = null, tag = null }) {
  if (kind !== "note" && kind !== "tag" && kind !== "notes") {
    throw new Error(`Invalid tab kind: ${kind}`);
  }
  return { id: newId("tab"), kind, name: String(name || "Untitled"), noteUUID, tag };
}
function addTab(config, tab) {
  const tabs = [...config.tabs, tab];
  return {
    ...config,
    tabs,
    activeTabId: config.activeTabId || tab.id
  };
}
function removeTab(config, tabId) {
  const tabs = config.tabs.filter((t) => t.id !== tabId);
  const activeTabId = config.activeTabId === tabId ? tabs[0] ? tabs[0].id : null : config.activeTabId;
  return { ...config, tabs, activeTabId };
}
function setActiveTab(config, tabId) {
  if (!config.tabs.some((t) => t.id === tabId)) return config;
  return { ...config, activeTabId: tabId };
}
function moveTab(config, fromIndex, toIndex) {
  const tabs = [...config.tabs];
  if (fromIndex < 0 || fromIndex >= tabs.length || toIndex < 0 || toIndex >= tabs.length || fromIndex === toIndex) {
    return config;
  }
  const [moved] = tabs.splice(fromIndex, 1);
  tabs.splice(toIndex, 0, moved);
  return { ...config, tabs };
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

// anp-15-kanban/lib/core/settings.js
var VALID_SORT_MODES = /* @__PURE__ */ new Set(["none", "score", "startDate", "important", "urgent", "alpha", "date", "urgency"]);
function safeParse2(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function sanitizeSettings(raw) {
  const base = { ...DEFAULT_SETTINGS };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return base;
  }
  if (typeof raw.theme === "string" && isValidThemeId(raw.theme)) {
    base.theme = raw.theme;
  }
  if (typeof raw.dateFormat === "string" && raw.dateFormat.trim()) {
    base.dateFormat = raw.dateFormat.trim();
  }
  if (typeof raw.showEmptyColumns === "boolean") {
    base.showEmptyColumns = raw.showEmptyColumns;
  } else if (raw.showEmptyColumns === "true") {
    base.showEmptyColumns = true;
  }
  if (typeof raw.quickDateEnabled === "boolean") {
    base.quickDateEnabled = raw.quickDateEnabled;
  } else if (raw.quickDateEnabled === "true") {
    base.quickDateEnabled = true;
  }
  if (typeof raw.sortMode === "string" && VALID_SORT_MODES.has(raw.sortMode)) {
    base.sortMode = raw.sortMode;
  }
  if (typeof raw.expandCardInfo === "boolean") {
    base.expandCardInfo = raw.expandCardInfo;
  } else if (raw.expandCardInfo === "true") {
    base.expandCardInfo = true;
  }
  return base;
}
async function loadPluginSettings(app) {
  let raw = null;
  try {
    raw = safeParse2(app.settings?.[SETTINGS_KEYS.settings]);
  } catch {
    raw = null;
  }
  if (raw && typeof raw === "object") {
    return sanitizeSettings(raw);
  }
  const fallback = { ...DEFAULT_SETTINGS };
  try {
    const legacyTheme = await app.settings?.[SETTINGS_KEYS.theme];
    if (legacyTheme && isValidThemeId(legacyTheme)) {
      fallback.theme = legacyTheme;
    }
  } catch {
  }
  try {
    const legacyDateFormat = await app.settings?.[SETTINGS_KEYS.dateFormat];
    if (legacyDateFormat && typeof legacyDateFormat === "string" && legacyDateFormat.trim()) {
      fallback.dateFormat = legacyDateFormat.trim();
    }
  } catch {
  }
  return fallback;
}
async function savePluginSettings(app, updates) {
  const current = await loadPluginSettings(app);
  const merged = sanitizeSettings({ ...current, ...updates });
  await app.setSetting(SETTINGS_KEYS.settings, JSON.stringify(merged));
  return merged;
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
  let targetName = target?.columnName;
  if (!targetName && target?.columnId && target.columnId !== "unsorted") {
    try {
      const { markdown } = await readNote(app, noteUUID);
      const { columns } = buildColumnSpans(markdown);
      const span = resolveSpan(columns, target.columnId);
      if (span) targetName = span.name;
    } catch {
      targetName = null;
    }
  }
  const taskUuid = await app.insertTask({ uuid: noteUUID }, { content: String(content || "") });
  if (!taskUuid) return null;
  if (target?.columnId === "unsorted") {
    return taskUuid;
  }
  try {
    await moveTaskToColumn(app, noteUUID, taskUuid, {
      columnId: target?.columnId,
      columnName: targetName
    });
  } catch (error) {
    console.error("createTaskInColumn relocate failed:", error);
  }
  return taskUuid;
}
async function setTaskCompleted(app, taskUuid, done = true) {
  await app.updateTask(taskUuid, { completedAt: done ? nowSeconds() : null });
}
async function addLabelToTask(app, taskUuid, labelName) {
  const name = String(labelName || "").trim();
  if (!name) return;
  const task = await app.getTask(taskUuid);
  if (!task) return;
  if (task.content && task.content.includes(`[[${name}]]`)) return;
  const content = `${task.content || ""}
[[${name}]]`;
  await app.updateTask(taskUuid, { content });
}
async function sortTasksInNoteMarkdown(app, noteUUID, sortMode = "score") {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  const tasks = await app.getNoteTasks({ uuid: noteUUID });
  if (!markdown || !tasks || !tasks.length) return false;
  const { columns } = buildColumnSpans(markdown);
  const lines = markdown.split("\n");
  const taskLineMap = findTaskLines(lines, tasks);
  const taskByUuid = new Map(tasks.map((t) => [t.uuid, t]));
  const compareFn = (uuidA, uuidB) => {
    const a = taskByUuid.get(uuidA) || {};
    const b = taskByUuid.get(uuidB) || {};
    if (sortMode === "score") {
      return (b.score || 0) - (a.score || 0);
    }
    if (sortMode === "startDate") {
      return (b.startAt || 0) - (a.startAt || 0);
    }
    if (sortMode === "important") {
      return (b.important ? 1 : 0) - (a.important ? 1 : 0);
    }
    if (sortMode === "urgent") {
      return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
    }
    return 0;
  };
  let nextLines = [...lines];
  for (const span of columns) {
    const spanTasks = [];
    for (const [uuid, lineIdx] of taskLineMap.entries()) {
      if (lineIdx >= span.contentStart && lineIdx < span.contentEnd) {
        spanTasks.push({ uuid, lineIdx, line: lines[lineIdx] });
      }
    }
    if (spanTasks.length <= 1) continue;
    spanTasks.sort((x, y) => compareFn(x.uuid, y.uuid));
    const originalIndices = spanTasks.map((t) => t.lineIdx).sort((a, b) => a - b);
    for (let i = 0; i < spanTasks.length; i++) {
      nextLines[originalIndices[i]] = spanTasks[i].line;
    }
  }
  await app.replaceNoteContent({ uuid: noteUUID }, nextLines.join("\n"));
  return true;
}

// anp-15-kanban/lib/api/columnOps.js
var HEADING_LINE_RE = /^(#{1,6})\s+(.*)$/;
async function readLines(app, noteUUID) {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  return markdown.split("\n");
}
function headingLevel(line) {
  const m = String(line).match(HEADING_LINE_RE);
  return m ? m[1].length : null;
}
async function createColumn(app, noteUUID, name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return false;
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  const { columns } = buildColumnSpans(markdown);
  const level = columns.length ? headingLevel(markdown.split("\n")[columns[0].startLine]) : 2;
  await app.insertNoteContent(
    { uuid: noteUUID },
    `
${"#".repeat(level)} ${trimmed}
`,
    { atEnd: true }
  );
  return true;
}
async function renameColumn(app, noteUUID, columnId, newName) {
  const trimmed = String(newName || "").trim();
  if (!trimmed) return false;
  const lines = await readLines(app, noteUUID);
  const { columns } = buildColumnSpans(lines.join("\n"));
  const span = resolveSpan(columns, columnId);
  if (!span) return false;
  const level = headingLevel(lines[span.startLine]) || 1;
  lines[span.startLine] = `${"#".repeat(level)} ${trimmed}`;
  await app.replaceNoteContent({ uuid: noteUUID }, lines.join("\n"));
  return true;
}
async function deleteColumn(app, noteUUID, columnId) {
  const lines = await readLines(app, noteUUID);
  const { columns } = buildColumnSpans(lines.join("\n"));
  const span = resolveSpan(columns, columnId);
  if (!span) return false;
  if (columns.length <= 1) return false;
  const extracted = lines.slice(span.contentStart, span.contentEnd).filter((line, i, arr) => !(line.trim() === "" && (i === 0 || i === arr.length - 1)));
  const next = [
    ...lines.slice(0, span.startLine),
    ...lines.slice(span.contentEnd)
  ];
  const insertAt = span.startLine === columns[0].startLine ? 0 : Math.max(columns[0].startLine, 0);
  next.splice(insertAt, 0, ...extracted);
  await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
  return true;
}
async function reorderColumns(app, noteUUID, orderedIds) {
  const lines = await readLines(app, noteUUID);
  const markdown = lines.join("\n");
  const { columns, preambleEnd } = buildColumnSpans(markdown);
  if (!columns.length || !Array.isArray(orderedIds)) return false;
  if (orderedIds.length !== columns.length) return false;
  const spans = orderedIds.map((id) => resolveSpan(columns, id));
  if (spans.some((s) => !s) || new Set(spans.map((s) => s.id)).size !== columns.length) return false;
  const rebuilt = [...lines.slice(0, Math.max(preambleEnd - 1, 0))];
  for (const span of spans) {
    rebuilt.push(...lines.slice(span.startLine, span.contentEnd));
  }
  await app.replaceNoteContent({ uuid: noteUUID }, rebuilt.join("\n"));
  return true;
}
async function transferColumn(app, sourceUUID, columnId, targetUUID) {
  if (sourceUUID === targetUUID) return "same-note";
  const lines = await readLines(app, sourceUUID);
  const { columns } = buildColumnSpans(lines.join("\n"));
  if (!columns.length) return "no-columns";
  const span = resolveSpan(columns, columnId);
  if (!span) return "no-target";
  const block = lines.slice(span.startLine, span.contentEnd);
  const trimmed = block.join("\n").replace(/\n+$/, "");
  await app.insertNoteContent({ uuid: targetUUID }, `
${trimmed}
`, { atEnd: true });
  const next = [...lines.slice(0, span.startLine), ...lines.slice(span.contentEnd)];
  await app.replaceNoteContent({ uuid: sourceUUID }, next.join("\n"));
  return "moved";
}

// anp-15-kanban/lib/api/noteBoard.js
async function buildNoteBoard(app, noteUUID, options = {}) {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  if (typeof markdown !== "string") {
    return { kind: "note", noteUUID, columns: [], hasHeadings: false };
  }
  const tasks = await app.getNoteTasks({ uuid: noteUUID }, { includeDone: true }) || [];
  let colorMap = {};
  try {
    const tags = await app.getTags() || [];
    tags.forEach((t) => {
      if (t?.text) colorMap[t.text.toLowerCase()] = t.color || null;
    });
  } catch {
    colorMap = {};
  }
  const { columns } = buildColumnSpans(markdown);
  const lines = markdown.split("\n");
  const { columnCards, unsorted } = assignTasksToColumns(columns, lines, tasks);
  const limits = options.columnLimits || {};
  const makeColumn = (span, cards) => ({
    id: span.id,
    name: span.name,
    wipLimit: Number.isInteger(limits[span.name]) && limits[span.name] > 0 ? limits[span.name] : null,
    cards
  });
  const boardColumns = columns.map(
    (span) => makeColumn(span, (columnCards.get(span.id) || []).map(toCardModel))
  );
  if (unsorted.length > 0) {
    boardColumns.unshift({
      id: "unsorted",
      name: "Unsorted",
      wipLimit: null,
      cards: unsorted.map(toCardModel)
    });
  }
  const allCards = boardColumns.flatMap((c) => c.cards);
  await renderCardHtml(app, allCards);
  allCards.forEach((card) => {
    card.labels = resolveLabels(card.content, colorMap);
  });
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
    imageUrl: firstImageUrl(task.content || ""),
    completedAt: task.completedAt ?? null,
    dismissedAt: task.dismissedAt ?? null,
    startAt: task.startAt ?? null,
    endAt: task.endAt ?? null,
    deadline: task.deadline ?? null,
    hideUntil: task.hideUntil ?? null,
    repeat: task.repeat ?? null,
    isRepeating: !!task.isRepeating,
    isParent: !!task.isParent,
    important: !!task.important,
    urgent: !!task.urgent,
    score: typeof task.score === "number" ? task.score : null,
    noteUUID: task.noteUUID || null
  };
}
async function renderCardHtml(app, cards) {
  for (const card of cards) {
    try {
      card.html = await app.htmlFromContent(card.content);
    } catch (error) {
      console.error("htmlFromContent failed for card:", error);
      card.html = null;
    }
  }
  return cards;
}
function firstImageUrl(markdown) {
  const m = String(markdown).match(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/);
  return m ? m[1] : null;
}
function resolveLabels(markdown, colorMap = {}) {
  const names = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = re.exec(String(markdown))) !== null) {
    const name = m[1].trim();
    if (name && !names.includes(name)) names.push(name);
  }
  return names.map((name) => ({ name, color: colorMap[name.toLowerCase()] ?? null }));
}
function plainPreview(markdown) {
  return String(markdown.replace(/<!--[\s\S]*?-->/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[\[([^\]]*)\]\]/g, "$1").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_~`#>]/g, "").replace(/\s+/g, " ").trim());
}

// anp-15-kanban/lib/api/tagBoard.js
var NOTE_PREFIX = "note:";
async function buildTagBoard(app, tag) {
  if (!tag) {
    return { kind: "tag", tag, columns: [], hasHeadings: false };
  }
  const [notes, allTags] = await Promise.all([
    app.filterNotes({ tag }) || [],
    app.getTags() || []
  ]);
  let colorMap = {};
  try {
    allTags.forEach((t) => {
      if (t?.text) colorMap[t.text.toLowerCase()] = t.color || null;
    });
  } catch {
    colorMap = {};
  }
  const columns = [];
  const allCards = [];
  for (const note of notes) {
    let markdown = "";
    try {
      markdown = await app.getNoteContent({ uuid: note.uuid }) || "";
    } catch {
      markdown = "";
    }
    const tasks = await app.getNoteTasks({ uuid: note.uuid }, { includeDone: true }) || [];
    const { columns: headingSpans } = buildColumnSpans(markdown);
    const lines = markdown.split("\n");
    const { columnCards, unsorted } = assignTasksToColumns(headingSpans, lines, tasks);
    const sections = [];
    if (unsorted.length > 0) {
      const unsortedCards = unsorted.map((t) => ({ ...toCardModel(t), noteName: note.name || "Untitled" }));
      sections.push({
        id: "unsorted",
        name: "Unsorted",
        cards: unsortedCards
      });
      allCards.push(...unsortedCards);
    }
    if (headingSpans.length > 0) {
      for (const span of headingSpans) {
        const spanTasks = columnCards.get(span.id) || [];
        const spanCards = spanTasks.map((t) => ({ ...toCardModel(t), noteName: note.name || "Untitled" }));
        sections.push({
          id: span.id,
          name: span.name,
          cards: spanCards
        });
        allCards.push(...spanCards);
      }
    } else if (unsorted.length === 0 && tasks.length > 0) {
      const noteCards = tasks.map((t) => ({ ...toCardModel(t), noteName: note.name || "Untitled" }));
      sections.push({
        id: "main",
        name: "Tasks",
        cards: noteCards
      });
      allCards.push(...noteCards);
    }
    const nonEmptySections = sections.filter((s) => s.cards && s.cards.length > 0);
    const flatCards = nonEmptySections.flatMap((s) => s.cards);
    if (flatCards.length > 0) {
      columns.push({
        id: NOTE_PREFIX + note.uuid,
        name: note.name || "Untitled note",
        noteUUID: note.uuid,
        tags: note.tags || [],
        sections: nonEmptySections,
        cards: flatCards,
        wipLimit: null
      });
    }
  }
  await renderCardHtml(app, allCards);
  allCards.forEach((card) => {
    card.labels = resolveLabels(card.content, colorMap);
  });
  return {
    kind: "tag",
    tag,
    columns,
    hasHeadings: true
  };
}

// anp-15-kanban/lib/api/noteOps.js
async function createTaggedNote(app, title, tags = []) {
  const clean = String(title || "").trim();
  if (!clean) return null;
  return tags.length ? app.createNote(clean, tags) : app.createNote(clean);
}
async function openNote(app, noteUUID) {
  await app.navigate(`https://www.amplenote.com/notes/${noteUUID}`);
}

// anp-15-kanban/lib/utils/prompt.js
function firstValue(result) {
  if (result === null || result === void 0) return null;
  return Array.isArray(result) ? result[0] : result;
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
  const themeId = payload && typeof payload.themeId === "string" ? payload.themeId : typeof payload === "string" ? payload : null;
  if (!themeId || !isValidThemeId(themeId)) return;
  await savePluginSettings(app, { theme: themeId });
}
async function handleSaveSetting(app, payload) {
  if (!payload || typeof payload !== "object") return;
  await savePluginSettings(app, payload);
}
async function handleSetActiveTab(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return;
  const config = setActiveTab(await loadTabsConfig(app), tabId);
  await saveTabsConfig(app, config);
}
async function handleRefreshTab(app) {
  await rerender(app);
}
async function handleRefreshAll(app) {
  await rerender(app);
}
function defaultKanbanNoteName(now = /* @__PURE__ */ new Date()) {
  const pad = (n) => (n < 10 ? "0" : "") + n;
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return `Kanban Board - ${dateStr}`;
}
async function handleAddTab(app) {
  const choice = firstValue(await app.prompt("Add Board Tab", {
    inputs: [
      {
        label: "Choose board type:",
        type: "radio",
        options: [
          { label: "Existing Note Board (headings as columns)", value: "note" },
          { label: "Create New Note Board (auto-creates note with columns)", value: "new_note" },
          { label: "Tag Board (all notes with tag as columns)", value: "tag" }
        ]
      }
    ]
  }));
  if (!choice) return;
  let tab = null;
  if (choice === "note") {
    const noteHandle = firstValue(await app.prompt("Select Note for Board", {
      inputs: [
        {
          label: "Choose an existing note (headings will become columns):",
          type: "note"
        }
      ]
    }));
    if (!noteHandle || !noteHandle.uuid) return;
    tab = createTab({
      kind: "note",
      name: noteHandle.name || "Note board",
      noteUUID: noteHandle.uuid
    });
  } else if (choice === "new_note") {
    const titleInput = firstValue(await app.prompt("Create New Note Board", {
      inputs: [
        {
          label: "Board title (optional \u2014 leave blank for timestamped name):",
          type: "string"
        }
      ]
    }));
    if (titleInput === null || titleInput === void 0) return;
    const title = titleInput && String(titleInput).trim() || defaultKanbanNoteName();
    const uuid = await app.createNote(title, ["-reports/-kanban"]);
    if (!uuid) return;
    await app.replaceNoteContent({ uuid }, "# To Do\n\n# In Progress\n\n# Done\n");
    tab = createTab({
      kind: "note",
      name: title,
      noteUUID: uuid
    });
  } else if (choice === "tag") {
    const tagVal = firstValue(await app.prompt("Select Tag for Board", {
      inputs: [
        {
          label: "Select or type a tag (all notes with this tag become columns):",
          type: "tags",
          limit: 1
        }
      ]
    }));
    const tagText = Array.isArray(tagVal) ? tagVal[0] : tagVal;
    if (!tagText || !String(tagText).trim()) return;
    const clean = String(tagText).trim();
    tab = createTab({ kind: "tag", name: clean, tag: clean });
  } else {
    return;
  }
  const config = addTab(await loadTabsConfig(app), tab);
  await saveTabsConfig(app, config);
  await rerender(app);
}
async function handleCloseTab(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return;
  const config = removeTab(await loadTabsConfig(app), tabId);
  await saveTabsConfig(app, config);
  await rerender(app);
}
async function handleMoveTabDir(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return;
  const direction = payload.direction === "left" ? "left" : "right";
  const config = await loadTabsConfig(app);
  const index = config.tabs.findIndex((t) => t.id === tabId);
  if (index === -1) return;
  const target = direction === "left" ? index - 1 : index + 1;
  if (target < 0 || target >= config.tabs.length) return;
  await saveTabsConfig(app, moveTab(config, index, target));
  await rerender(app);
}
async function handleSetDateFormat(app) {
  const settings = await loadPluginSettings(app);
  const result = await app.prompt("Date format for card chips", {
    inputs: [{
      label: "Format tokens: YYYY MM DD MMM (e.g. DD MMM YYYY):",
      type: "text",
      value: settings.dateFormat
    }]
  });
  const fmt = firstValue(result);
  if (!fmt || !String(fmt).trim()) return;
  await savePluginSettings(app, { dateFormat: String(fmt).trim() });
  await rerender(app);
}
async function resolveNoteTab(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return null;
  const tab = tabById(await loadTabsConfig(app), tabId);
  if (!tab) return null;
  if (tab.kind === "note" && !tab.noteUUID) return null;
  if ((tab.kind === "tag" || tab.kind === "notes") && !tab.tag) return null;
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
  if (tab.kind === "tag" || tab.kind === "notes") {
    const targetUUID = String(payload.toColumnId).startsWith(NOTE_PREFIX) ? payload.toColumnId.slice(NOTE_PREFIX.length) : payload.toColumnId;
    if (!targetUUID) return;
    const task = await app.getTask(payload.cardId);
    if (!task) return;
    if (task.noteUUID !== targetUUID) {
      await app.updateTask(payload.cardId, { noteUUID: targetUUID });
    }
    if (payload.toSectionId && payload.toSectionId !== "unsorted" && payload.toSectionId !== "main") {
      try {
        await moveTaskToColumn(app, targetUUID, payload.cardId, { columnId: payload.toSectionId });
      } catch (err) {
        console.error("Failed to relocate task to section:", err);
      }
    }
    await rerender(app);
    return;
  }
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
  if (tab.kind === "tag" || tab.kind === "notes") {
    const targetUUID = String(payload.columnId).startsWith(NOTE_PREFIX) ? payload.columnId.slice(NOTE_PREFIX.length) : payload.columnId;
    if (!targetUUID) return;
    const content2 = firstValue(await app.prompt("New task", {
      inputs: [{ label: "Task content (markdown):", type: "text" }]
    }));
    if (!content2) return;
    const taskUuid = await app.insertTask({ uuid: targetUUID }, { content: content2 });
    if (taskUuid && payload.sectionId && payload.sectionId !== "unsorted" && payload.sectionId !== "main") {
      try {
        await moveTaskToColumn(app, targetUUID, taskUuid, { columnId: payload.sectionId });
      } catch (err) {
        console.error("Failed to position new task under section:", err);
      }
    }
    await rerender(app);
    return;
  }
  const result = await app.prompt("New card", {
    inputs: [{ label: "Card content (markdown):", type: "text" }]
  });
  const content = firstValue(result);
  if (!content) return;
  await createTaskInColumn(app, tab.noteUUID, { columnId: payload.columnId, columnName: payload.columnName }, content);
  await rerender(app);
}
async function handleOpenCard(app, payload) {
  const noteUUID = payload?.noteUUID || payload?.cardId;
  if (!noteUUID) return;
  await openNote(app, noteUUID);
}
async function handleEditTaskDetails(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;
  const task = await app.getTask(cardId);
  if (!task) return;
  let sections = [];
  try {
    sections = await app.getNoteSections({ uuid: task.noteUUID }) || [];
  } catch {
    sections = [];
  }
  const sectionOptions = [
    { label: "Top / Unsorted", value: "__top__" },
    ...sections.filter((s) => s?.heading?.text).map((s) => ({
      label: s.heading.text,
      value: s.heading.text
    }))
  ];
  const result = await app.prompt("Edit Task Details", {
    inputs: [
      { label: "Task content (markdown):", type: "text", value: task.content || "" },
      { label: "Important:", type: "checkbox", value: !!task.important },
      { label: "Urgent:", type: "checkbox", value: !!task.urgent },
      { label: "Move to Note (optional):", type: "note", value: task.noteUUID },
      { label: "Move to Section / Heading:", type: "select", options: sectionOptions },
      { label: "Score:", type: "string", value: task.score !== void 0 && task.score !== null ? String(task.score) : "" },
      {
        label: "Mark Status:",
        type: "radio",
        options: [
          { label: "Keep current", value: "keep" },
          { label: "Started (startAt now)", value: "started" },
          { label: "Completed", value: "completed" },
          { label: "Dismissed", value: "dismissed" },
          { label: "Reopen / Active", value: "reopen" }
        ]
      }
    ]
  });
  if (!result) return;
  const [content, important, urgent, targetNote, targetSection, scoreStr, statusChoice] = result;
  const updates = {};
  if (content !== void 0 && content !== task.content) {
    updates.content = String(content);
  }
  if (typeof important === "boolean" && important !== !!task.important) {
    updates.important = important;
  }
  if (typeof urgent === "boolean" && urgent !== !!task.urgent) {
    updates.urgent = urgent;
  }
  const parsedScore = parseFloat(scoreStr);
  if (!Number.isNaN(parsedScore) && parsedScore !== task.score) {
    updates.score = parsedScore;
  }
  const now = Math.floor(Date.now() / 1e3);
  if (statusChoice === "started") {
    updates.startAt = now;
  } else if (statusChoice === "completed") {
    updates.completedAt = now;
    updates.dismissedAt = null;
  } else if (statusChoice === "dismissed") {
    updates.dismissedAt = now;
    updates.completedAt = null;
  } else if (statusChoice === "reopen") {
    updates.completedAt = null;
    updates.dismissedAt = null;
  }
  const targetNoteUUID = targetNote?.uuid || task.noteUUID;
  if (targetNoteUUID && targetNoteUUID !== task.noteUUID) {
    updates.noteUUID = targetNoteUUID;
  }
  if (Object.keys(updates).length > 0) {
    await app.updateTask(cardId, updates);
  }
  if (targetSection && targetSection !== "__top__") {
    try {
      await moveTaskToColumn(app, targetNoteUUID, cardId, { columnName: targetSection });
    } catch (err) {
      console.error("Failed to relocate task to heading section:", err);
    }
  }
  await rerender(app);
}
async function handleEditCard(app, payload) {
  return handleEditTaskDetails(app, payload);
}
async function resolveNoteBoardTab(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  return tab && tab.kind === "note" ? tab : null;
}
async function resolveColumn(app, payload) {
  const tab = await resolveNoteBoardTab(app, payload);
  if (!tab || !payload.columnId) return null;
  const markdown = await app.getNoteContent({ uuid: tab.noteUUID });
  const { columns } = buildColumnSpans(markdown);
  const span = resolveSpan(columns, payload.columnId);
  if (!span) return null;
  return { tab, columnName: span.name };
}
async function handleCreateColumn(app, payload) {
  const tab = await resolveNoteBoardTab(app, payload);
  if (!tab) return;
  const result = await app.prompt("New column", {
    inputs: [{ label: "Column name:", type: "text" }]
  });
  const name = firstValue(result);
  if (!name || !String(name).trim()) return;
  const created = await createColumn(app, tab.noteUUID, name);
  if (created) await rerender(app);
}
async function handleRenameColumn(app, payload) {
  const resolved = await resolveColumn(app, payload);
  if (!resolved) return;
  const { tab, columnName } = resolved;
  const result = await app.prompt("Rename column", {
    inputs: [{ label: "Column name:", type: "text", value: columnName }]
  });
  const name = firstValue(result);
  if (!name || !String(name).trim() || String(name) === columnName) return;
  const renamed = await renameColumn(app, tab.noteUUID, payload.columnId, name);
  if (renamed) await rerender(app);
}
async function handleDeleteColumn(app, payload) {
  const resolved = await resolveColumn(app, payload);
  if (!resolved) return;
  const { tab, columnName } = resolved;
  const result = await app.prompt(`Delete "${columnName}"?`, {
    inputs: [
      {
        label: "I understand: the heading is removed and its tasks move to the top of the note.",
        type: "checkbox",
        value: false
      }
    ]
  });
  if (firstValue(result) !== true) return;
  const deleted = await deleteColumn(app, tab.noteUUID, payload.columnId);
  if (deleted) await rerender(app);
}
async function handleMoveColumn(app, payload) {
  const tab = await resolveNoteBoardTab(app, payload);
  if (!tab || !payload.columnId) return;
  const direction = payload.direction === "left" ? "left" : "right";
  const markdown = await app.getNoteContent({ uuid: tab.noteUUID });
  const { columns } = buildColumnSpans(markdown);
  const index = columns.findIndex((c) => c.id === String(payload.columnId));
  if (index === -1) return;
  const target = direction === "left" ? index - 1 : index + 1;
  if (target < 0 || target >= columns.length) return;
  const order = columns.map((c) => c.id);
  [order[index], order[target]] = [order[target], order[index]];
  const moved = await reorderColumns(app, tab.noteUUID, order);
  if (moved) await rerender(app);
}
async function handleSetWipLimit(app, payload) {
  const resolved = await resolveColumn(app, payload);
  if (!resolved) return;
  const { tab, columnName } = resolved;
  const current = tab.columnLimits && tab.columnLimits[columnName] || "";
  const result = await app.prompt(`WIP limit for "${columnName}"`, {
    inputs: [{
      label: "Max cards (0 or blank = no limit):",
      type: "string",
      value: String(current)
    }]
  });
  const raw = firstValue(result);
  if (raw === null || raw === void 0) return;
  const parsed = parseInt(String(raw).trim(), 10);
  const config = await loadTabsConfig(app);
  const storedTab = tabById(config, tab.id);
  if (!storedTab) return;
  const limits = { ...storedTab.columnLimits || {} };
  if (Number.isInteger(parsed) && parsed > 0) limits[columnName] = parsed;
  else delete limits[columnName];
  storedTab.columnLimits = limits;
  await saveTabsConfig(app, config);
  await rerender(app);
}
function parseDateToUnixSeconds(val) {
  if (val === null || val === void 0) return null;
  if (typeof val === "number") {
    if (Number.isNaN(val) || val <= 0) return null;
    return val > 1e11 ? Math.floor(val / 1e3) : Math.floor(val);
  }
  if (val instanceof Date) {
    const ms = val.getTime();
    return Number.isNaN(ms) ? null : Math.floor(ms / 1e3);
  }
  if (typeof val === "object") {
    if (val.value !== void 0) return parseDateToUnixSeconds(val.value);
    if (val.date !== void 0) return parseDateToUnixSeconds(val.date);
    if (val.startAt !== void 0) return parseDateToUnixSeconds(val.startAt);
  }
  const str = String(val).trim();
  if (!str) return null;
  if (/^\d{9,14}$/.test(str)) {
    const num = Number(str);
    return num > 1e11 ? Math.floor(num / 1e3) : Math.floor(num);
  }
  const ymd = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymd) {
    const [, y, m, d] = ymd;
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), 0, 0, 0);
    const ms = date.getTime();
    return Number.isNaN(ms) ? null : Math.floor(ms / 1e3);
  }
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return Math.floor(parsed.getTime() / 1e3);
  }
  return null;
}
function parseTimeToHoursMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const s = timeStr.trim().toLowerCase();
  if (!s) return null;
  const m = s.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let hours = parseInt(m[1], 10);
  const minutes = m[2] ? parseInt(m[2], 10) : 0;
  const meridian = m[3];
  if (meridian === "pm" && hours < 12) hours += 12;
  if (meridian === "am" && hours === 12) hours = 0;
  if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
    return { hours, minutes };
  }
  return null;
}
function formatLocalTimeStr(unixSeconds) {
  if (!unixSeconds || typeof unixSeconds !== "number" || Number.isNaN(unixSeconds)) return "";
  const d = new Date(unixSeconds * 1e3);
  const hr = d.getHours();
  const min = d.getMinutes();
  if (hr === 0 && min === 0) return "";
  return `${String(hr).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
function combineDateAndTime(dateVal, timeStr) {
  const baseSeconds = parseDateToUnixSeconds(dateVal);
  if (!baseSeconds) return null;
  if (!timeStr || typeof timeStr !== "string" || !timeStr.trim()) {
    return baseSeconds;
  }
  const parsedTime = parseTimeToHoursMinutes(timeStr);
  if (!parsedTime) return baseSeconds;
  const d = new Date(baseSeconds * 1e3);
  d.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
  return Math.floor(d.getTime() / 1e3);
}
async function handleCardMenu(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;
  const task = await app.getTask(cardId);
  if (!task) return;
  const choice = firstValue(await app.prompt("Card Actions", {
    inputs: [{
      label: "Choose action:",
      type: "radio",
      options: [
        { label: "Edit task details (full dialog)", value: "edit_details" },
        { label: "Add label (note link)", value: "label" },
        { label: "Set start date / time", value: "date" },
        { label: "Snooze / Hide Until (set date)", value: "snooze" },
        { label: "Schedule Time Block (start & end time)", value: "timeblock" },
        { label: "Create note from card", value: "note" }
      ]
    }]
  }));
  if (!choice) return;
  if (choice === "edit_details") {
    await handleEditTaskDetails(app, { cardId });
    return;
  }
  if (choice === "label") {
    const handle = firstValue(await app.prompt("Add label", {
      inputs: [{ label: "Pick a note to use as label:", type: "note" }]
    }));
    if (!handle || !handle.name) return;
    await addLabelToTask(app, cardId, handle.name);
    await rerender(app);
    return;
  }
  if (choice === "date") {
    const currentVal = typeof task.startAt === "number" && task.startAt > 0 ? Math.floor(task.startAt) : null;
    const currentTime = formatLocalTimeStr(task.startAt);
    const result = await app.prompt("Set Start Date & Time", {
      inputs: [
        { label: "Start date (blank clears):", type: "date", value: currentVal },
        { label: "Start time (optional, e.g. 14:30 or 2:30 PM):", type: "string", value: currentTime, placeholder: "HH:MM" }
      ]
    });
    if (result === null || result === void 0) return;
    const [dateRaw, timeRaw] = Array.isArray(result) ? result : [result, ""];
    const startAt = combineDateAndTime(dateRaw, timeRaw);
    await app.updateTask(cardId, { startAt });
    await rerender(app);
    return;
  }
  if (choice === "snooze") {
    const currentVal = typeof task.hideUntil === "number" && task.hideUntil > 0 ? Math.floor(task.hideUntil) : null;
    const currentTime = formatLocalTimeStr(task.hideUntil);
    const result = await app.prompt("Snooze / Hide Until", {
      inputs: [
        { label: "Hide task until date (blank clears snooze):", type: "date", value: currentVal },
        { label: "Hide until time (optional, e.g. 14:30 or 2:30 PM):", type: "string", value: currentTime, placeholder: "HH:MM" }
      ]
    });
    if (result === null || result === void 0) return;
    const [dateRaw, timeRaw] = Array.isArray(result) ? result : [result, ""];
    const hideUntil = combineDateAndTime(dateRaw, timeRaw);
    await app.updateTask(cardId, { hideUntil });
    await rerender(app);
    return;
  }
  if (choice === "timeblock") {
    const sVal = typeof task.startAt === "number" && task.startAt > 0 ? Math.floor(task.startAt) : null;
    const sTime = formatLocalTimeStr(task.startAt);
    const eVal = typeof task.endAt === "number" && task.endAt > 0 ? Math.floor(task.endAt) : null;
    const eTime = formatLocalTimeStr(task.endAt);
    const res = await app.prompt("Schedule Time Block", {
      inputs: [
        { label: "Start Date:", type: "date", value: sVal },
        { label: "Start Time (e.g. 10:00 or 10am):", type: "string", value: sTime, placeholder: "10:00" },
        { label: "End Date:", type: "date", value: eVal },
        { label: "End Time (e.g. 11:30 or 11:30am):", type: "string", value: eTime, placeholder: "11:30" }
      ]
    });
    if (!res) return;
    const [sDate, sT, eDate, eT] = res;
    const startAt = combineDateAndTime(sDate, sT);
    const endAt = combineDateAndTime(eDate, eT);
    await app.updateTask(cardId, { startAt, endAt });
    await rerender(app);
    return;
  }
  if (choice === "note") {
    const title = String(task.content || "").replace(/\s+/g, " ").trim().slice(0, 80) || "Note from card";
    const uuid = await createTaggedNote(app, title);
    if (!uuid) return;
    await addLabelToTask(app, cardId, title);
    await rerender(app);
  }
}
async function handleSaveSortToNote(app, payload) {
  const tabId = payload && payload.tabId;
  const sortMode = payload && payload.sortMode;
  if (!tabId || !sortMode || sortMode === "none") {
    await app.alert("Select a valid sort mode (Score, Date, Important, or Urgent) before saving to note.");
    return;
  }
  const config = await loadTabsConfig(app);
  const tab = tabById(config, tabId);
  if (!tab || tab.kind !== "note" || !tab.noteUUID) {
    await app.alert("Saving sort order to note markdown is only supported on Note boards.");
    return;
  }
  const confirmed = firstValue(await app.prompt("Save Sort Order to Note", {
    inputs: [{
      label: `Re-order task items in the note markdown according to "${sortMode}"? (This modifies note content)`,
      type: "checkbox",
      value: true
    }]
  }));
  if (!confirmed) return;
  const ok = await sortTasksInNoteMarkdown(app, tab.noteUUID, sortMode);
  if (ok) {
    await app.alert(`Task order sorted by "${sortMode}" saved to note!`);
    await rerender(app);
  }
}
async function handleGlobalSearch(app, payload) {
  const query = payload && typeof payload.query === "string" ? payload.query.trim() : "";
  if (!query) return;
  const results = await app.searchNotes(query) || [];
  if (!results.length) {
    await app.alert(`No notes found for "${query}"`);
    return;
  }
  const options = results.slice(0, 20).map((n) => ({ label: n.name || n.uuid, value: n.uuid }));
  const picked = firstValue(await app.prompt(`Results for "${query}"`, {
    inputs: [{ label: `${results.length} matching note(s) - pick one to open:`, type: "select", options }]
  }));
  if (!picked) return;
  await openNote(app, picked);
}
async function handleMoveColumnToTab(app, payload) {
  const resolved = await resolveColumn(app, payload);
  if (!resolved) return;
  const { tab, columnName } = resolved;
  const config = await loadTabsConfig(app);
  const candidates = config.tabs.filter((t) => t.kind === "note" && t.noteUUID && t.id !== tab.id);
  if (!candidates.length) {
    await app.alert("No other note-board tabs to move this column to.");
    return;
  }
  const targetId = firstValue(await app.prompt(`Move "${columnName}" to another board`, {
    inputs: [{
      label: "Target tab:",
      type: "select",
      options: candidates.map((t) => ({ label: t.name, value: t.id }))
    }]
  }));
  if (!targetId) return;
  const target = tabById(config, targetId);
  if (!target || target.kind !== "note" || !target.noteUUID) return;
  const confirmed = firstValue(await app.prompt(`Move "${columnName}" to "${target.name}"?`, {
    inputs: [{
      label: "I understand: the heading and its tasks move to the other note.",
      type: "checkbox",
      value: false
    }]
  }));
  if (confirmed !== true) return;
  const status = await transferColumn(app, tab.noteUUID, payload.columnId, target.noteUUID);
  if (status === "moved") await rerender(app);
}
async function handleRenameNote(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.columnId) return;
  const noteUUID = String(payload.columnId).startsWith(NOTE_PREFIX) ? payload.columnId.slice(NOTE_PREFIX.length) : payload.columnId;
  if (!noteUUID) return;
  const note = await app.notes.find(noteUUID);
  const current = note?.name || "";
  const name = firstValue(await app.prompt("Rename note", {
    inputs: [{ label: "Note name:", type: "text", value: current }]
  }));
  if (!name || !String(name).trim() || String(name) === current) return;
  await app.setNoteName({ uuid: noteUUID }, String(name).trim());
  await rerender(app);
}
async function handleReorderTabs(app, payload) {
  const { fromIndex, toIndex } = payload || {};
  if (typeof fromIndex !== "number" || typeof toIndex !== "number") return;
  const config = await loadTabsConfig(app);
  const updated = moveTab(config, fromIndex, toIndex);
  await saveTabsConfig(app, updated);
}
async function handleSaveColumnsToNote(app, payload) {
  const { tabId, columnIds } = payload || {};
  if (!tabId || !Array.isArray(columnIds) || !columnIds.length) return;
  const config = await loadTabsConfig(app);
  const tab = tabById(config, tabId);
  if (!tab || tab.kind !== "note" || !tab.noteUUID) return;
  const confirmed = await app.prompt("Save new column order into note?", {
    inputs: [
      {
        label: "Reorder headings and all content in the note markdown",
        type: "checkbox",
        value: true
      }
    ]
  });
  if (!confirmed || !confirmed[0]) return;
  const ok = await reorderColumns(app, tab.noteUUID, columnIds);
  if (ok) {
    await rerender(app);
  }
}
async function handleQuickSetDate(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;
  const task = await app.getTask(cardId);
  if (!task) return;
  const currentVal = typeof task.startAt === "number" && task.startAt > 0 ? Math.floor(task.startAt) : null;
  const currentTime = formatLocalTimeStr(task.startAt);
  const result = await app.prompt("Set Task Date & Time (@)", {
    inputs: [
      { label: "Scheduled date (leave blank to clear):", type: "date", value: currentVal },
      { label: "Scheduled time (optional, e.g. 14:30 or 2:30 PM):", type: "string", value: currentTime, placeholder: "HH:MM" }
    ]
  });
  if (result === null || result === void 0) return;
  const [dateRaw, timeRaw] = Array.isArray(result) ? result : [result, ""];
  const startAt = combineDateAndTime(dateRaw, timeRaw);
  await app.updateTask(cardId, { startAt });
  await rerender(app);
}
var ACTIONS = {
  ping: handlePing,
  saveTheme: handleSaveTheme,
  saveSetting: handleSaveSetting,
  saveSettings: handleSaveSetting,
  setActiveTab: handleSetActiveTab,
  refreshTab: handleRefreshTab,
  refreshAll: handleRefreshAll,
  moveCard: handleMoveCard,
  createCard: handleCreateCard,
  editCard: handleEditCard,
  editTaskDetails: handleEditTaskDetails,
  openCard: handleOpenCard,
  addTab: handleAddTab,
  closeTab: handleCloseTab,
  moveTabDir: handleMoveTabDir,
  reorderTabs: handleReorderTabs,
  setDateFormat: handleSetDateFormat,
  createColumn: handleCreateColumn,
  renameColumn: handleRenameColumn,
  deleteColumn: handleDeleteColumn,
  moveColumn: handleMoveColumn,
  saveColumnsToNote: handleSaveColumnsToNote,
  setWipLimit: handleSetWipLimit,
  cardMenu: handleCardMenu,
  quickSetDate: handleQuickSetDate,
  saveSortToNote: handleSaveSortToNote,
  globalSearch: handleGlobalSearch,
  moveColumnToTab: handleMoveColumnToTab,
  renameNote: handleRenameNote
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

// anp-15-kanban/lib/api/notesBoard.js
var NOTE_PREFIX2 = "note:";
async function buildNotesBoard(app, tag) {
  if (!tag) {
    return { kind: "notes", tag, columns: [], hasHeadings: false };
  }
  const notes = await app.filterNotes({ tag }) || [];
  let colorMap = {};
  try {
    const tags = await app.getTags() || [];
    tags.forEach((t) => {
      if (t?.text) colorMap[t.text.toLowerCase()] = t.color || null;
    });
  } catch {
    colorMap = {};
  }
  const columns = [];
  const allCards = [];
  for (const note of notes) {
    const tasks = await app.getNoteTasks({ uuid: note.uuid }, { includeDone: true }) || [];
    const cards = tasks.map((t) => toCardModel(t));
    allCards.push(...cards);
    columns.push({
      id: NOTE_PREFIX2 + note.uuid,
      name: note.name || "Untitled note",
      color: null,
      wipLimit: null,
      cards,
      noteUUID: note.uuid
    });
  }
  await renderCardHtml(app, allCards);
  allCards.forEach((card) => {
    card.labels = resolveLabels(card.content, colorMap);
  });
  return {
    kind: "notes",
    tag,
    columns,
    hasHeadings: true
  };
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
    const settings = await loadPluginSettings(app);
    const boards = {};
    for (const tab of config.tabs) {
      try {
        if (tab.kind === "note" && tab.noteUUID) {
          boards[tab.id] = await buildNoteBoard(app, tab.noteUUID, {
            columnLimits: tab.columnLimits || {}
          });
        } else if (tab.kind === "tag" && tab.tag) {
          boards[tab.id] = await buildTagBoard(app, tab.tag);
        } else if (tab.kind === "notes" && tab.tag) {
          boards[tab.id] = await buildNotesBoard(app, tab.tag);
        }
      } catch (error) {
        console.error(`Failed to build board for tab ${tab.id}:`, error);
        boards[tab.id] = { kind: tab.kind, columns: [], hasHeadings: false };
      }
    }
    return {
      version: 1,
      activeTabId: config.activeTabId,
      tabs: config.tabs,
      boards,
      settings: {
        theme: settings.theme,
        dateFormat: settings.dateFormat,
        showEmptyColumns: settings.showEmptyColumns,
        quickDateEnabled: settings.quickDateEnabled,
        sortMode: settings.sortMode,
        expandCardInfo: settings.expandCardInfo
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