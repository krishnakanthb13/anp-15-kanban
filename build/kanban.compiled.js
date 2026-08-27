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
  expandCardInfo: false,
  density: "cozy"
};
var AUTO_COMPLETE_ON_DONE_HEADER = false;
var NEW_NOTE_BOARD_INCLUDES_DONE_HEADER = true;
var NOTE_PREFIX = "note:";
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
  var dragType = null; // "card" | "column" | "tab"
  var dragCardId = null;
  var dragColId = null;
  var dragTabIndex = null;

  /* ---------------- crisp svg icons ---------------- */

  var SVG_ICONS = {
    note: '<svg class="kb-icon kb-icon-stroke" width="13" height="13" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
    notes: '<svg class="kb-icon kb-icon-stroke" width="13" height="13" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    tag: '<svg class="kb-icon kb-icon-stroke" width="13" height="13" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
    chevronUp: '<svg class="kb-icon kb-icon-stroke" width="11" height="11" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>',
    chevronDown: '<svg class="kb-icon kb-icon-stroke" width="11" height="11" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>',
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

  function showToast(msg, type) {
    var host = document.getElementById("kb-toasts");
    if (!host) return;
    var toast = document.createElement("div");
    var cls = "kb-toast";
    if (type === "success") cls += " kb-toast-success";
    else if (type === "error") cls += " kb-toast-error";
    else if (type === "warning") cls += " kb-toast-warning";
    toast.className = cls;

    var prefix = "";
    if (type === "success") prefix = "\u2713 ";
    else if (type === "error") prefix = "\u26A0\uFE0F ";
    else if (type === "warning") prefix = "\u2139\uFE0F ";

    toast.textContent = prefix + msg;
    host.appendChild(toast);
    setTimeout(function () {
      toast.classList.add("kb-toast-hiding");
      setTimeout(function () {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 220);
    }, type === "error" ? 3800 : 2800);
  }

  /* ---------------- bridge ---------------- */

  function callPlugin(action, payload) {
    if (typeof window.callAmplenotePlugin === "function") {
      try {
        var res = window.callAmplenotePlugin(action, payload);
        return Promise.resolve(res);
      } catch (err) {
        console.error("callAmplenotePlugin failed:", err);
        return Promise.reject(err);
      }
    }
    return Promise.resolve(null);
  }

  function handlePluginResult(p, successMsg) {
    if (p && typeof p.then === "function") {
      return p.then(function (res) {
        if (res === null || res === undefined) {
          return res;
        }
        if (res && res.ok === false) {
          showToast(res.error || "Action could not be completed", "error");
          return res;
        }
        if (res.board && res.tabId) {
          STATE.boards[res.tabId] = res.board;
        }
        if (res.columnLimits && res.tabId) {
          var t = STATE.tabs.find(function (x) { return x.id === res.tabId; });
          if (t) t.columnLimits = res.columnLimits;
        }
        if (res && res.showEmpty && !showEmptyColumns) {
          showEmptyColumns = true;
          setLocalSetting("showEmptyColumns", true);
          callPlugin("saveSetting", { showEmptyColumns: true });
          updateEmptyUi();
        }
        renderAll();
        if (res && res.toast) {
          showToast(res.toast, res.toastType || "success");
        } else if (successMsg) {
          showToast(successMsg, "success");
        }
        return res;
      }).catch(function (err) {
        console.error("Action error:", err);
        showToast("Failed to save changes to note", "error");
        if (STATE.activeTabId) {
          callPlugin("refreshTab", { tabId: STATE.activeTabId }).then(function (res) {
            if (res && res.board) {
              STATE.boards[STATE.activeTabId] = res.board;
              renderAll();
            }
          });
        }
      });
    }
    return Promise.resolve(null);
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
      var isNotes = tab.kind === "notes";
      var isTag = tab.kind === "tag";
      chip.title = (isTag ? "Tag Board: #" : isNotes ? "Multi-Note Board: #" : "Note Board: ") + tab.name;

      var kindLabel = isTag ? "TAG" : isNotes ? "NOTES" : "NOTE";
      var badge = el("span", "kb-tab-badge kb-tab-badge-" + tab.kind);
      badge.appendChild(svg(isTag ? "tag" : isNotes ? "notes" : "note"));
      badge.appendChild(document.createTextNode(kindLabel));
      chip.appendChild(badge);

      chip.appendChild(el("span", "kb-tab-name", tab.name));

      var activate = function () {
        if (STATE.activeTabId === tab.id) return;
        STATE.activeTabId = tab.id;
        openInfoCards = {};
        if (expandCardInfo && tab.kind === "tag") {
          collapsedSections = {};
        }
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
        chip.classList.remove("kb-tab-dragging", "kb-tab-drop-before", "kb-tab-drop-after");
        var allChips = host.querySelectorAll(".kb-tab");
        allChips.forEach(function (c) { c.classList.remove("kb-tab-drop-before", "kb-tab-drop-after"); });
      });
      chip.addEventListener("dragover", function (e) {
        if (dragType !== "tab") return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        var rect = chip.getBoundingClientRect();
        var isAfter = e.clientX > (rect.left + rect.width / 2);
        chip.classList.toggle("kb-tab-drop-before", !isAfter);
        chip.classList.toggle("kb-tab-drop-after", isAfter);
      });
      chip.addEventListener("dragleave", function () {
        chip.classList.remove("kb-tab-drop-before", "kb-tab-drop-after");
      });
      chip.addEventListener("drop", function (e) {
        if (dragType !== "tab") return;
        e.preventDefault();
        var rect = chip.getBoundingClientRect();
        var isAfter = e.clientX > (rect.left + rect.width / 2);
        chip.classList.remove("kb-tab-drop-before", "kb-tab-drop-after");
        if (dragTabIndex === null) return;

        var fromIdx = dragTabIndex;
        var toIdx = tabIdx;
        if (isAfter && fromIdx > toIdx) toIdx++;
        else if (!isAfter && fromIdx < toIdx) toIdx--;
        toIdx = Math.max(0, Math.min(STATE.tabs.length - 1, toIdx));
        if (fromIdx === toIdx) return;

        var movedTab = STATE.tabs.splice(fromIdx, 1)[0];
        STATE.tabs.splice(toIdx, 0, movedTab);
        renderTabs();
        callPlugin("reorderTabs", { fromIndex: fromIdx, toIndex: toIdx });
        showToast("Tab reordered");
      });

      var tools = el("span", "kb-tab-tools");
      if (tab.kind === "note" && tab.noteUUID) {
        addTabToolSvg(tools, "externalLink", "Open note in Amplenote", function (e) {
          e.stopPropagation();
          callPlugin("openCard", { noteUUID: tab.noteUUID });
        });
      } else if ((tab.kind === "tag" || tab.kind === "notes") && tab.tag) {
        addTabToolSvg(tools, "externalLink", "Open tag in Amplenote", function (e) {
          e.stopPropagation();
          callPlugin("openTag", { tag: tab.tag });
        });
      }
      addTabToolSvg(tools, "chevronLeft", "Move tab left", function (e) {
        e.stopPropagation();
        var fromIdx = STATE.tabs.findIndex(function (t) { return t.id === tab.id; });
        if (fromIdx <= 0) return;
        var toIdx = fromIdx - 1;
        var moved = STATE.tabs.splice(fromIdx, 1)[0];
        STATE.tabs.splice(toIdx, 0, moved);
        renderTabs();
        showToast("Tab moved");
        callPlugin("moveTabDir", { tabId: tab.id, direction: "left" });
      });
      addTabToolSvg(tools, "chevronRight", "Move tab right", function (e) {
        e.stopPropagation();
        var fromIdx = STATE.tabs.findIndex(function (t) { return t.id === tab.id; });
        if (fromIdx === -1 || fromIdx >= STATE.tabs.length - 1) return;
        var toIdx = fromIdx + 1;
        var moved = STATE.tabs.splice(fromIdx, 1)[0];
        STATE.tabs.splice(toIdx, 0, moved);
        renderTabs();
        showToast("Tab moved");
        callPlugin("moveTabDir", { tabId: tab.id, direction: "right" });
      });
      addTabToolSvg(tools, "close", "Close tab", function (e) {
        e.stopPropagation();
        var tabIdx = STATE.tabs.findIndex(function (t) { return t.id === tab.id; });
        if (tabIdx === -1) return;
        var wasActive = STATE.activeTabId === tab.id;
        STATE.tabs.splice(tabIdx, 1);
        if (wasActive) {
          if (STATE.tabs.length > 0) {
            var nextIdx = Math.min(tabIdx, STATE.tabs.length - 1);
            STATE.activeTabId = STATE.tabs[nextIdx].id;
          } else {
            STATE.activeTabId = null;
          }
        }
        renderAll();
        showToast("Board closed");
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

    var openNoteBtn = document.getElementById("kb-open-note-btn");
    var openNoteLabel = document.getElementById("kb-open-note-label");
    if (openNoteBtn) {
      if (isNoteBoard && tab && tab.noteUUID) {
        openNoteBtn.style.display = "inline-flex";
        openNoteBtn.title = "Open active note in Amplenote";
        if (openNoteLabel) openNoteLabel.textContent = "Open Note";
      } else if (tab && (tab.kind === "tag" || tab.kind === "notes") && tab.tag) {
        openNoteBtn.style.display = "inline-flex";
        openNoteBtn.title = "Open tag #" + tab.tag + " in Amplenote";
        if (openNoteLabel) openNoteLabel.textContent = "Open Tag";
      } else {
        openNoteBtn.style.display = "none";
      }
    }
  }

  function resetSort() {
    sortMode = "none";
    setLocalSetting("sortMode", "none");
    callPlugin("saveSetting", { sortMode: "none" });
    updateSortUi();
    renderBoard();
    showToast("Reset to default task order");
  }

  /* ---------------- density management ---------------- */

  var DENSITY_MODES = ["cozy", "compact", "spacious"];
  var DENSITY_LABELS = {
    cozy: "Cozy",
    compact: "Compact",
    spacious: "Spacious"
  };
  var density = (STATE.settings && STATE.settings.density) || "cozy";

  function applyDensity(mode) {
    density = mode || "cozy";
    document.body.classList.remove("kb-density-compact", "kb-density-cozy", "kb-density-spacious");
    document.body.classList.add("kb-density-" + density);
    var label = document.getElementById("kb-density-label");
    if (label) {
      label.textContent = DENSITY_LABELS[density] || "Cozy";
    }
  }

  function cycleDensity() {
    var idx = DENSITY_MODES.indexOf(density);
    var next = DENSITY_MODES[(idx + 1) % DENSITY_MODES.length];
    applyDensity(next);
    setLocalSetting("density", next);
    callPlugin("saveSetting", { density: next });
    showToast("Density: " + (DENSITY_LABELS[next] || next));
  }

  /* ---------------- board rendering & column drag-and-drop ---------------- */

  function renderBoard() {
    var board = document.getElementById("kb-board");
    if (!board) return;
    board.innerHTML = "";
    var tab = activeTab();
    var data = tab && STATE.boards ? STATE.boards[tab.id] : null;
    var columns = data && data.columns ? data.columns : [];

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
      if (isTagBoard && col.sections) {
        var collected = [];
        col.sections.forEach(function (s) {
          if (s.cards) collected = collected.concat(s.cards);
        });
        allColCards = collected;
      }

      var visibleCards = allColCards.filter(function (card) {
        if (!searchQuery) return true;
        var hay = ((card.title || "") + " " + (card.content || "") + " " +
          (card.tags || []).join(" ") + " " +
          (card.labels || []).map(function (l) { return l.name; }).join(" ")).toLowerCase();
        return hay.indexOf(searchQuery) !== -1;
      });

      // Hide empty columns unless showEmptyColumns is enabled (works for note, tag, and notes tabs)
      if (!showEmptyColumns && !visibleCards.length) return;
      anyVisible = true;

      var colEl = el("section", "kb-column" + (isLast && data.kind === "note" ? " kb-column-last" : "") + (col.level ? " kb-col-h" + col.level : ""));
      colEl.setAttribute("data-column-id", col.id);
      colEl.setAttribute("data-column-index", String(colIndex));

      var head = el("header", "kb-column-head");
      head.setAttribute("draggable", "true");
      head.title = "Drag to reorder column";

      // Column drag-and-drop
      head.addEventListener("dragstart", function (e) {
        if (col.id === "unsorted" || col.id === "completed") {
          e.preventDefault();
          showToast("Moving " + (col.id === "unsorted" ? "Unsorted" : "Completed") + " column is not allowed");
          return;
        }
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
        var board = document.getElementById("kb-board");
        if (board) {
          board.querySelectorAll(".kb-column").forEach(function (c) {
            c.classList.remove("kb-col-drop-before", "kb-col-drop-after");
          });
        }
      });
      colEl.addEventListener("dragover", function (e) {
        if (dragType !== "column") return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        var rect = colEl.getBoundingClientRect();
        var isAfter = e.clientX > (rect.left + rect.width / 2);

        if ((col.id === "unsorted" && !isAfter) || (col.id === "completed" && isAfter) || dragColId === col.id) {
          colEl.classList.remove("kb-col-drop-before", "kb-col-drop-after");
          return;
        }

        colEl.classList.toggle("kb-col-drop-before", !isAfter);
        colEl.classList.toggle("kb-col-drop-after", isAfter);
      });
      colEl.addEventListener("dragleave", function (e) {
        if (e.relatedTarget && colEl.contains(e.relatedTarget)) return;
        colEl.classList.remove("kb-col-drop-before", "kb-col-drop-after");
      });
      colEl.addEventListener("drop", function (e) {
        if (dragType !== "column") return;
        e.preventDefault();
        var rect = colEl.getBoundingClientRect();
        var isAfter = e.clientX > (rect.left + rect.width / 2);
        colEl.classList.remove("kb-col-drop-before", "kb-col-drop-after");
        if (col.id === "unsorted" && !isAfter) {
          showToast("Cannot move column before Unsorted");
          return;
        }
        if (col.id === "completed" && isAfter) {
          showToast("Cannot move column after Completed");
          return;
        }
        if (dragColId === "unsorted" || dragColId === "completed") {
          showToast("Moving " + (dragColId === "unsorted" ? "Unsorted" : "Completed") + " column is not allowed");
          return;
        }

        var fromIdx = columns.findIndex(function (c) { return c.id === dragColId; });
        if (fromIdx === -1) return;

        var moved = columns.splice(fromIdx, 1)[0];
        var newTargetIdx = columns.findIndex(function (c) { return c.id === col.id; });
        var insertIdx = isAfter ? newTargetIdx + 1 : newTargetIdx;

        // Ensure moved column never lands before Unsorted (index 0 if Unsorted exists)
        if (columns[0] && columns[0].id === "unsorted" && insertIdx < 1) {
          columns.splice(fromIdx, 0, moved);
          showToast("Cannot move column before Unsorted");
          return;
        }
        // Ensure moved column never lands after Completed (last index if Completed exists)
        var lastCol = columns[columns.length - 1];
        if (lastCol && lastCol.id === "completed" && insertIdx > columns.length - 1) {
          columns.splice(fromIdx, 0, moved);
          showToast("Cannot move column after Completed");
          return;
        }

        insertIdx = Math.max(0, Math.min(columns.length, insertIdx));
        columns.splice(insertIdx, 0, moved);
        renderBoard();
        showToast("Column reordered");

        if (data.kind === "note") {
          var headingIds = columns.filter(function (c) {
            return c.id !== "unsorted" && c.id !== "completed" && !c.isSystemColumn;
          }).map(function (c) { return c.id; });
          var p = callPlugin("reorderColumns", {
            tabId: STATE.activeTabId,
            columnIds: headingIds
          });
          if (p && typeof p.then === "function") {
            p.then(function (res) {
              if (res && res.board && res.tabId) {
                STATE.boards[res.tabId] = res.board;
              }
            });
          }
        }
      });

      var titleWrap = el("div", "kb-col-titlewrap");
      titleWrap.title = col.name;
      var dragHandle = el("span", "kb-col-drag-handle");
      dragHandle.appendChild(svg("grip"));
      titleWrap.appendChild(dragHandle);
      var titleEl = el("h3", "kb-column-title", col.name);
      titleEl.title = col.name;
      titleWrap.appendChild(titleEl);
      head.appendChild(titleWrap);

      var actionsWrap = el("div", "kb-col-actions");

      // Column tools with crisp SVGs
      if (data.kind === "note" && col.id !== "unsorted" && col.id !== "completed") {
        var tools = el("div", "kb-col-tools");
        addColToolSvg(tools, "externalLink", "Open note in Amplenote", function (e) {
          e.stopPropagation();
          var t = activeTab();
          if (t && t.noteUUID) callPlugin("openCard", { noteUUID: t.noteUUID });
        });
        addColToolSvg(tools, "chevronLeft", "Move column left", function (e) {
          e.stopPropagation();
          var colIdx = columns.findIndex(function (c) { return c.id === col.id; });
          if (colIdx <= 0) {
            showToast("Column is already at the first position", "warning");
            return;
          }
          var targetIdx = colIdx - 1;
          if (columns[targetIdx] && columns[targetIdx].id === "unsorted") {
            showToast("Cannot move column before Unsorted", "warning");
            return;
          }

          var moved = columns.splice(colIdx, 1)[0];
          columns.splice(targetIdx, 0, moved);
          renderBoard();

          if (data.kind === "note") {
            var headingNames = columns.filter(function (c) {
              return c.id !== "unsorted" && c.id !== "completed" && !c.isSystemColumn;
            }).map(function (c) { return c.name || c.id; });
            var headingIds = columns.filter(function (c) {
              return c.id !== "unsorted" && c.id !== "completed" && !c.isSystemColumn;
            }).map(function (c) { return c.id; });
            var p = callPlugin("reorderColumns", {
              tabId: STATE.activeTabId,
              columnIds: headingIds,
              columnNames: headingNames
            });
            if (p && typeof p.then === "function") {
              p.then(function (res) {
                if (res && res.board && res.tabId) {
                  STATE.boards[res.tabId] = res.board;
                  showToast("Column moved left", "success");
                } else if (res && res.ok === false) {
                  showToast("Could not move column in note", "error");
                }
              }).catch(function () {
                showToast("Failed to move column", "error");
              });
            }
          }
        });
        addColToolSvg(tools, "chevronRight", "Move column right", function (e) {
          e.stopPropagation();
          var colIdx = columns.findIndex(function (c) { return c.id === col.id; });
          if (colIdx === -1 || colIdx >= columns.length - 1) {
            showToast("Column is already at the last position", "warning");
            return;
          }
          var targetIdx = colIdx + 1;
          if (columns[targetIdx] && columns[targetIdx].id === "completed") {
            showToast("Cannot move column after Completed", "warning");
            return;
          }

          var moved = columns.splice(colIdx, 1)[0];
          columns.splice(targetIdx, 0, moved);
          renderBoard();

          if (data.kind === "note") {
            var headingNames = columns.filter(function (c) {
              return c.id !== "unsorted" && c.id !== "completed" && !c.isSystemColumn;
            }).map(function (c) { return c.name || c.id; });
            var headingIds = columns.filter(function (c) {
              return c.id !== "unsorted" && c.id !== "completed" && !c.isSystemColumn;
            }).map(function (c) { return c.id; });
            var p = callPlugin("reorderColumns", {
              tabId: STATE.activeTabId,
              columnIds: headingIds,
              columnNames: headingNames
            });
            if (p && typeof p.then === "function") {
              p.then(function (res) {
                if (res && res.board && res.tabId) {
                  STATE.boards[res.tabId] = res.board;
                  showToast("Column moved right", "success");
                } else if (res && res.ok === false) {
                  showToast("Could not move column in note", "error");
                }
              }).catch(function () {
                showToast("Failed to move column", "error");
              });
            }
          }
        });
        addColToolSvg(tools, "edit", "Rename column", function (e) {
          e.stopPropagation();
          handlePluginResult(callPlugin("renameColumn", { tabId: STATE.activeTabId, columnId: col.id }));
        });
        addColToolSvg(tools, "transfer", "Move column to another board tab", function (e) {
          e.stopPropagation();
          handlePluginResult(callPlugin("moveColumnToTab", { tabId: STATE.activeTabId, columnId: col.id }));
        });
        addColToolSvg(tools, "trash", "Delete column (tasks move to previous header)", function (e) {
          e.stopPropagation();
          handlePluginResult(callPlugin("deleteColumn", { tabId: STATE.activeTabId, columnId: col.id }));
        });
        head.appendChild(tools);
      } else if (isTagBoard || data.kind === "notes") {
        var ttools = el("div", "kb-col-tools");
        addColToolSvg(ttools, "externalLink", "Open note in Amplenote", function (e) {
          e.stopPropagation();
          callPlugin("openCard", { noteUUID: col.noteUUID });
        });
        if (isTagBoard) {
          addColToolSvg(ttools, "plus", "Add header to this note", function (e) {
            e.stopPropagation();
            handlePluginResult(callPlugin("createColumn", { tabId: STATE.activeTabId, noteUUID: col.noteUUID, columnId: col.id }));
          });
        }
        addColToolSvg(ttools, "edit", "Rename note", function (e) {
          e.stopPropagation();
          handlePluginResult(callPlugin("renameNote", { tabId: STATE.activeTabId, columnId: col.id }));
        });
        addColToolSvg(ttools, "trash", "Delete note (move to Trash)", function (e) {
          e.stopPropagation();
          handlePluginResult(callPlugin("deleteNote", { tabId: STATE.activeTabId, columnId: col.id, noteUUID: col.noteUUID, noteName: col.name }));
        });
        head.appendChild(ttools);
      }

      var over = data.kind === "note" && col.wipLimit && visibleCards.length > col.wipLimit;
      var count = el("span", "kb-count" + (over ? " kb-over" : ""),
        over ? visibleCards.length + " / " + col.wipLimit : String(visibleCards.length));
      if (data.kind === "note" && col.id !== "completed" && col.id !== "unsorted") {
        count.title = "Set WIP limit";
        count.addEventListener("click", function (e) {
          e.stopPropagation();
          handlePluginResult(callPlugin("setWipLimit", { tabId: STATE.activeTabId, columnId: col.id }));
        });
      }
      actionsWrap.appendChild(count);

      if (col.id !== "completed") {
        var addBtn = el("button", "kb-add-card");
        addBtn.type = "button";
        addBtn.title = "Add card to " + col.name;
        addBtn.appendChild(svg("plus"));
        addBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          var p = callPlugin("createCard", { tabId: STATE.activeTabId, columnId: col.id, columnName: col.name });
          if (p && typeof p.then === "function") {
            p.then(function (res) {
              if (res && res.board && res.tabId) {
                STATE.boards[res.tabId] = res.board;
                renderBoard();
                if (!res.canceled) {
                  showToast(res.toast || "Task added", "success");
                }
              }
            });
          }
        });
        actionsWrap.appendChild(addBtn);
      }

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

          // Omit empty sections unless showEmptyColumns is enabled
          if (!showEmptyColumns && !secCards.length) return;

          var secKey = col.id + "::" + sec.id;
          var isCollapsed = !!collapsedSections[secKey];

          var secEl = el("div", "kb-section" + (sec.level ? " kb-section-h" + sec.level : ""));
          var secHead = el("div", "kb-section-head");
          var tw = el("div", "kb-section-titlewrap");
          tw.title = sec.name;
          var toggleIcon = el("span", "kb-section-toggle");
          toggleIcon.appendChild(svg(isCollapsed ? "chevronRightSolid" : "chevronDownSolid"));
          tw.appendChild(toggleIcon);
          var secTitleEl = el("span", "kb-section-title", sec.name + " (" + secCards.length + ")");
          secTitleEl.title = sec.name;
          tw.appendChild(secTitleEl);
          secHead.appendChild(tw);

          var secActions = el("div", "kb-section-actions");

          // Header tools for Tag tab sections (available for actual note headings)
          if (sec.id !== "unsorted" && sec.id !== "main" && sec.id !== "completed") {
            var sectools = el("div", "kb-section-tools");
            addColToolSvg(sectools, "chevronUp", "Move header up", function (e) {
              e.stopPropagation();
              var secIdx = col.sections.findIndex(function (s) { return s.id === sec.id; });
              if (secIdx <= 0) {
                showToast("Header is already at the top", "warning");
                return;
              }
              var targetIdx = secIdx - 1;
              if (col.sections[targetIdx] && col.sections[targetIdx].id === "unsorted") {
                showToast("Cannot move header before Unsorted", "warning");
                return;
              }

              var moved = col.sections.splice(secIdx, 1)[0];
              col.sections.splice(targetIdx, 0, moved);
              renderBoard();

              var headingNames = col.sections.filter(function (s) {
                return s.id !== "unsorted" && s.id !== "main" && s.id !== "completed";
              }).map(function (s) { return s.name || s.id; });
              var headingIds = col.sections.filter(function (s) {
                return s.id !== "unsorted" && s.id !== "main" && s.id !== "completed";
              }).map(function (s) { return s.id; });

              var p = callPlugin("reorderColumns", {
                tabId: STATE.activeTabId,
                noteUUID: col.noteUUID,
                columnIds: headingIds,
                columnNames: headingNames
              });
              if (p && typeof p.then === "function") {
                p.then(function (res) {
                  if (res && res.board && res.tabId) {
                    STATE.boards[res.tabId] = res.board;
                    showToast("Header moved up", "success");
                  } else if (res && res.ok === false) {
                    showToast("Could not move header in note", "error");
                  }
                }).catch(function () {
                  showToast("Failed to move header", "error");
                });
              }
            });
            addColToolSvg(sectools, "chevronDown", "Move header down", function (e) {
              e.stopPropagation();
              var secIdx = col.sections.findIndex(function (s) { return s.id === sec.id; });
              if (secIdx === -1 || secIdx >= col.sections.length - 1) {
                showToast("Header is already at the bottom", "warning");
                return;
              }
              var targetIdx = secIdx + 1;
              if (col.sections[targetIdx] && col.sections[targetIdx].id === "completed") {
                showToast("Cannot move header after Completed", "warning");
                return;
              }

              var moved = col.sections.splice(secIdx, 1)[0];
              col.sections.splice(targetIdx, 0, moved);
              renderBoard();

              var headingNames = col.sections.filter(function (s) {
                return s.id !== "unsorted" && s.id !== "main" && s.id !== "completed";
              }).map(function (s) { return s.name || s.id; });
              var headingIds = col.sections.filter(function (s) {
                return s.id !== "unsorted" && s.id !== "main" && s.id !== "completed";
              }).map(function (s) { return s.id; });

              var p = callPlugin("reorderColumns", {
                tabId: STATE.activeTabId,
                noteUUID: col.noteUUID,
                columnIds: headingIds,
                columnNames: headingNames
              });
              if (p && typeof p.then === "function") {
                p.then(function (res) {
                  if (res && res.board && res.tabId) {
                    STATE.boards[res.tabId] = res.board;
                    showToast("Header moved down", "success");
                  } else if (res && res.ok === false) {
                    showToast("Could not move header in note", "error");
                  }
                }).catch(function () {
                  showToast("Failed to move header", "error");
                });
              }
            });
            addColToolSvg(sectools, "edit", "Rename header", function (e) {
              e.stopPropagation();
              handlePluginResult(callPlugin("renameColumn", { tabId: STATE.activeTabId, noteUUID: col.noteUUID, columnId: col.id, sectionId: sec.id }));
            });
            addColToolSvg(sectools, "transfer", "Move header to another note / tab", function (e) {
              e.stopPropagation();
              handlePluginResult(callPlugin("moveColumnToTab", { tabId: STATE.activeTabId, noteUUID: col.noteUUID, columnId: col.id, sectionId: sec.id }));
            });
            addColToolSvg(sectools, "trash", "Delete header (tasks move to previous header)", function (e) {
              e.stopPropagation();
              handlePluginResult(callPlugin("deleteColumn", { tabId: STATE.activeTabId, noteUUID: col.noteUUID, columnId: col.id, sectionId: sec.id }));
            });
            secHead.appendChild(sectools);
          }

          if (sec.id !== "completed") {
            var secAdd = el("button", "kb-col-btn");
            secAdd.type = "button";
            secAdd.title = "Add task in " + sec.name;
            secAdd.appendChild(svg("plus"));
            secAdd.addEventListener("click", function (e) {
              e.stopPropagation();
              var p = callPlugin("createCard", { tabId: STATE.activeTabId, columnId: col.id, sectionId: sec.id, sectionName: sec.name });
              if (p && typeof p.then === "function") {
                p.then(function (res) {
                  if (res && res.board && res.tabId) {
                    STATE.boards[res.tabId] = res.board;
                    renderBoard();
                    if (!res.canceled) {
                      showToast(res.toast || "Task added", "success");
                    }
                  }
                });
              }
            });
            secActions.appendChild(secAdd);
          }

          secHead.appendChild(secActions);

          secHead.addEventListener("click", function (e) {
            if (e.target && e.target.closest && (e.target.closest(".kb-col-btn") || e.target.closest(".kb-section-tools"))) return;
            collapsedSections[secKey] = !collapsedSections[secKey];
            renderBoard();
          });
          secEl.appendChild(secHead);

          var secList = el("div", "kb-section-cards" + (isCollapsed ? " kb-collapsed" : ""));
          wireDropZone(secList, col.id, sec.id, col.name, sec.name);
          applySort(secCards).forEach(function (card) {
            secList.appendChild(buildCardEl(card));
          });
          secEl.appendChild(secList);
          sectionsHost.appendChild(secEl);
        });

        // Small "+ Add Header" card at bottom of sections in tag tab
        var addSecCard = el("div", "kb-add-header-card");
        addSecCard.title = "Add a new heading section to " + col.name;
        var asIcon = el("span", "kb-add-header-icon");
        asIcon.appendChild(svg("plus"));
        addSecCard.appendChild(asIcon);
        addSecCard.appendChild(el("span", "kb-add-header-label", "Add Header"));
        addSecCard.addEventListener("click", function (e) {
          e.stopPropagation();
          handlePluginResult(callPlugin("createColumn", { tabId: STATE.activeTabId, noteUUID: col.noteUUID, columnId: col.id }));
        });
        sectionsHost.appendChild(addSecCard);

        colEl.appendChild(sectionsHost);
      } else {
        var list = el("div", "kb-cards");
        wireDropZone(list, col.id, null, col.name, null);
        applySort(visibleCards).forEach(function (card) {
          list.appendChild(buildCardEl(card));
        });

        if (isTagBoard) {
          var addNotesSecCard = el("div", "kb-add-header-card");
          addNotesSecCard.title = "Add a new heading to " + col.name;
          var ansIcon = el("span", "kb-add-header-icon");
          ansIcon.appendChild(svg("plus"));
          addNotesSecCard.appendChild(ansIcon);
          addNotesSecCard.appendChild(el("span", "kb-add-header-label", "Add Header"));
          addNotesSecCard.addEventListener("click", function (e) {
            e.stopPropagation();
            handlePluginResult(callPlugin("createColumn", { tabId: STATE.activeTabId, noteUUID: col.noteUUID, columnId: col.id }));
          });
          list.appendChild(addNotesSecCard);
        }

        colEl.appendChild(list);
      }

      board.appendChild(colEl);
    });

    // Add Column / Add Task group at the right end of the board (stacked in one column)
    var isNoteTab = data.kind === "note";
    var addGroupEl = el("div", "kb-add-column-group");

    var addHeaderCardEl = el("div", "kb-add-column-card");
    addHeaderCardEl.title = isNoteTab
      ? "Add new column / header to note"
      : ("Create new note under tag " + (data.tag ? "#" + data.tag : ""));

    var iconWrap = el("div", "kb-add-column-icon");
    iconWrap.appendChild(svg("plus"));
    addHeaderCardEl.appendChild(iconWrap);

    addHeaderCardEl.appendChild(el("span", "kb-add-column-label", isNoteTab ? "+ Add Header" : "+ Add Note"));
    addHeaderCardEl.appendChild(el("span", "kb-add-column-sub", isNoteTab ? "New column heading" : "New column note"));

    addHeaderCardEl.addEventListener("click", function () {
      if (isNoteTab) {
        handlePluginResult(callPlugin("createColumn", { tabId: STATE.activeTabId }));
      } else {
        handlePluginResult(callPlugin("createColumnNote", { tabId: STATE.activeTabId }));
      }
    });
    addGroupEl.appendChild(addHeaderCardEl);

    var addTaskCardEl = el("div", "kb-add-column-card kb-add-task-card");
    addTaskCardEl.title = isNoteTab
      ? "Add task at top of note (Unsorted)"
      : "Add task to board";

    var taskIconWrap = el("div", "kb-add-column-icon");
    taskIconWrap.appendChild(svg("plus"));
    addTaskCardEl.appendChild(taskIconWrap);
    addTaskCardEl.appendChild(el("span", "kb-add-column-label", "+ Add Task"));
    addTaskCardEl.appendChild(el("span", "kb-add-column-sub", isNoteTab ? "Add to Unsorted" : "New task"));
    addTaskCardEl.addEventListener("click", function () {
      if (isNoteTab) {
        callPlugin("createCard", { tabId: STATE.activeTabId, columnId: "unsorted", columnName: "Unsorted" }).then(function (res) {
          if (res && res.board && res.tabId) {
            STATE.boards[res.tabId] = res.board;
            renderBoard();
            showToast("Task added");
          }
        });
      } else {
        var firstCol = data && data.columns && data.columns[0];
        if (firstCol) {
          callPlugin("createCard", { tabId: STATE.activeTabId, columnId: firstCol.id, columnName: firstCol.name }).then(function (res) {
            if (res && res.board && res.tabId) {
              STATE.boards[res.tabId] = res.board;
              renderBoard();
              showToast("Task added");
            }
          });
        } else {
          handlePluginResult(callPlugin("createColumnNote", { tabId: STATE.activeTabId }));
        }
      }
    });
    addGroupEl.appendChild(addTaskCardEl);

    board.appendChild(addGroupEl);

    if (!anyVisible) {
      var emptyEl = el("div", "kb-empty");
      if (searchQuery) {
        emptyEl.textContent = "No cards match \u201C" + searchQuery + "\u201D.";
      } else {
        var msg = el("div", "kb-empty-msg");
        msg.textContent = "No tasks found in this board. Click \u201CEmpty\u201D in the toolbar to view empty headers, or click \u201C+ Add Task\u201D to create a task.";
        emptyEl.appendChild(msg);

        var actionsWrap = el("div", "kb-empty-actions");

        var emptyAddTBtn = el("button", "kb-btn kb-empty-btn");
        emptyAddTBtn.type = "button";
        emptyAddTBtn.textContent = "+ Add Task";
        emptyAddTBtn.addEventListener("click", function () {
          if (isNoteTab) {
            callPlugin("createCard", { tabId: STATE.activeTabId, columnId: "unsorted", columnName: "Unsorted" }).then(function (res) {
              if (res && res.board && res.tabId) {
                STATE.boards[res.tabId] = res.board;
                renderBoard();
                showToast("Task added");
              }
            });
          } else {
            var fCol = data && data.columns && data.columns[0];
            if (fCol) {
              callPlugin("createCard", { tabId: STATE.activeTabId, columnId: fCol.id, columnName: fCol.name }).then(function (res) {
                if (res && res.board && res.tabId) {
                  STATE.boards[res.tabId] = res.board;
                  renderBoard();
                  showToast("Task added");
                }
              });
            } else {
              handlePluginResult(callPlugin("createColumnNote", { tabId: STATE.activeTabId }));
            }
          }
        });
        actionsWrap.appendChild(emptyAddTBtn);

        var emptyAddHBtn = el("button", "kb-btn kb-empty-btn");
        emptyAddHBtn.type = "button";
        emptyAddHBtn.textContent = isNoteTab ? "+ Add Header" : "+ Add Note";
        emptyAddHBtn.addEventListener("click", function () {
          if (isNoteTab) {
            handlePluginResult(callPlugin("createColumn", { tabId: STATE.activeTabId }));
          } else {
            handlePluginResult(callPlugin("createColumnNote", { tabId: STATE.activeTabId }));
          }
        });
        actionsWrap.appendChild(emptyAddHBtn);

        if (!showEmptyColumns) {
          var toggleEBtn = el("button", "kb-btn kb-empty-btn");
          toggleEBtn.type = "button";
          toggleEBtn.textContent = "Show Empty Headers";
          toggleEBtn.addEventListener("click", toggleEmptyColumns);
          actionsWrap.appendChild(toggleEBtn);
        }

        emptyEl.appendChild(actionsWrap);
      }
      board.appendChild(emptyEl);
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
    var depth = card.subtaskDepth || (card.isSubtask ? 1 : 0);
    var isDoneState = !!(card.completedAt || card.completed || card.dismissedAt);
    var cardClasses = "kb-card" + (isDoneState ? " kb-card-done" : "") + (depth > 0 ? " kb-card-subtask" : "");
    var cardEl = el("article", cardClasses);
    cardEl.setAttribute("data-card-id", card.id);
    cardEl.setAttribute("draggable", "true");

    if (depth > 1) {
      cardEl.style.marginLeft = Math.min(depth * 8, 28) + "px";
    }

    // Badges (Urgent, Important, Score [if != 1.0 and != 0.0], Parent Subtasks, Child Subtask)
    var numScore = card.score !== null && card.score !== undefined ? Number(card.score) : NaN;
    var showScore = !Number.isNaN(numScore) && Math.abs(numScore - 1.0) > 0.001 && Math.abs(numScore - 0.0) > 0.001;
    var hasBadges = card.urgent || card.important || showScore || card.isParent || depth > 0;
    if (hasBadges) {
      var badges = el("div", "kb-task-badges");
      if (card.urgent) badges.appendChild(el("span", "kb-badge kb-badge-urgent", "\u{1F525} Urgent"));
      if (card.important) badges.appendChild(el("span", "kb-badge kb-badge-important", "\u2B50 Important"));
      if (showScore) {
        badges.appendChild(el("span", "kb-badge kb-badge-score", "\u{1F3AF} " + numScore.toFixed(1)));
      }
      if (card.isParent) {
        badges.appendChild(el("span", "kb-badge kb-badge-parent", "\u{1F4CB} Parent Task"));
      }
      if (depth > 0) {
        var childLabel = depth > 1 ? "\u21B3".repeat(Math.min(depth, 3)) + " Child Task" : "\u21B3 Child Task";
        badges.appendChild(el("span", "kb-badge kb-badge-child", childLabel));
      }
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
        var isComp = !!card.completedAt || !!card.completed || !!card.dismissedAt || cardEl.classList.contains("kb-card-done");
        handlePluginResult(callPlugin("quickSetDate", { cardId: card.id, tabId: STATE.activeTabId, isCompleted: isComp, completedAt: card.completedAt }));
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
      var isComp = !!card.completedAt || !!card.completed || !!card.dismissedAt || cardEl.classList.contains("kb-card-done");
      handlePluginResult(callPlugin("cardMenu", { cardId: card.id, tabId: STATE.activeTabId, isCompleted: isComp, completedAt: card.completedAt }));
    });
    actions.appendChild(moreBtn);
    cardEl.appendChild(actions);

    // Body / Content
    if (card.html) {
      var body = el("div", "kb-card-body");
      body.innerHTML = card.html;
      var links = body.querySelectorAll("a");
      for (var lIdx = 0; lIdx < links.length; lIdx++) {
        var a = links[lIdx];
        var aText = (a.textContent || "").trim();
        if (aText === "open_in_new" || a.classList.contains("open_in_new") || a.classList.contains("open-in-new")) {
          a.remove();
          continue;
        }

        var aHref = (a.getAttribute("href") || "").trim();
        var isFootnote = aHref.indexOf("plugins.amplenote.com") !== -1 ||
          aHref.indexOf("/notes/plugins") !== -1 ||
          a.classList.contains("footnote") ||
          a.classList.contains("rich-footnote") ||
          a.hasAttribute("data-footnote");

        if (isFootnote) {
          var fnText = getCardFootnoteText(card, a, aHref, aText);
          if (fnText) {
            a.setAttribute("data-footnote-text", fnText);
            a.title = fnText;
            a.classList.add("kb-rich-footnote");
          }
        }
      }
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

    // Image (only append if card.html didn't already render an image)
    var htmlHasImg = !!(card.html && (card.html.indexOf("<img") !== -1 || card.html.indexOf("<picture") !== -1));
    if (card.imageUrl && !htmlHasImg) {
      var img = document.createElement("img");
      img.className = "kb-card-img";
      img.loading = "lazy";
      img.src = card.imageUrl;
      img.alt = "";
      cardEl.appendChild(img);
    }

    // Task Description (plain markdown expandable toggle or snippet)
    if (card.description) {
      cardEl.appendChild(el("div", "kb-card-desc", card.description));
    }

    // Meta chips - only when present
    var nowSec = Math.floor(Date.now() / 1000);
    var hasMeta = card.completedAt || card.dismissedAt || card.startAt || card.deadline || card.repeat || card.isRepeating || (card.hideUntil && card.hideUntil > nowSec);
    if (hasMeta) {
      var bits = [];
      if (card.dismissedAt) {
        bits.push("\u2715 " + formatCompletedStamp(card.dismissedAt));
      } else if (card.completedAt) {
        bits.push("\u2713 " + formatCompletedStamp(card.completedAt));
      }
      if (card.startAt && card.endAt) {
        bits.push("\u{1F552} " + formatTimeRange(card.startAt, card.endAt));
      } else if (card.startAt) {
        bits.push("\u25B6 " + formatStartStamp(card.startAt));
      }
      if (card.deadline) bits.push("\u23F0 " + formatStartStamp(card.deadline));
      if (card.hideUntil && card.hideUntil > nowSec) bits.push("\u{1F648} " + formatStartStamp(card.hideUntil));
      if (card.repeat) {
        bits.push("\u{1F501} " + formatTaskRepeat(card.repeat));
      } else if (card.isRepeating) {
        bits.push("\u{1F501} repeat");
      }
      if (bits.length) {
        cardEl.appendChild(el("div", "kb-card-meta", bits.join("  \xB7  ")));
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

      if (card.isParent) {
        parts.push("<b>Role:</b> Parent Task (has subtasks)");
      }
      if (depth > 0) {
        parts.push("<b>Hierarchy:</b> Child Task (Level " + depth + ")");
      }

      if (card.noteName) parts.push("<b>Note:</b> " + card.noteName);

      details.innerHTML = parts.join("<hr>");
      cardEl.appendChild(details);
    }

    // Drag events
    cardEl.addEventListener("dragstart", function (e) {
      dragType = "card";
      dragCardId = card.id;
      cardEl.classList.add("kb-dragging");
      e.dataTransfer.setData("text/plain", "card::" + card.id);
      e.dataTransfer.effectAllowed = "move";
    });
    cardEl.addEventListener("dragend", function () {
      dragType = null;
      dragCardId = null;
      cardEl.classList.remove("kb-dragging");
    });

    // Click handling: note link navigation, external link toast, or open task editor
    cardEl.addEventListener("click", function (e) {
      if (dragCardId || dragType) return;
      if (e.target && e.target.closest && e.target.closest("button")) return;

      var link = e.target && e.target.closest ? e.target.closest("a") : null;
      if (link) {
        e.stopPropagation();
        var href = (link.getAttribute("href") || "").trim();
        var noteUuid = (link.getAttribute("data-note-uuid") || "").trim();
        var fnMsg = link.getAttribute("data-footnote-text") || getCardFootnoteText(card, link, href, (link.textContent || "").trim());

        // Check if it is an Amplenote note link
        var anpLinkRe = new RegExp("amplenote\\.com/notes/([a-zA-Z0-9_-]+)", "i");
        var anpPathRe = new RegExp("^/notes/([a-zA-Z0-9_-]+)", "i");
        var m = href.match(anpLinkRe) || href.match(anpPathRe);
        var targetNoteUUID = noteUuid || (m ? m[1] : null);

        // Check if it is a Rich Footnote link
        var isRichFootnote = !!fnMsg || (targetNoteUUID === "plugins") ||
          href.indexOf("plugins.amplenote.com") !== -1 ||
          href.indexOf("/notes/plugins") !== -1 ||
          link.classList.contains("footnote") ||
          link.classList.contains("rich-footnote") ||
          link.classList.contains("kb-rich-footnote") ||
          link.hasAttribute("data-footnote");

        if (isRichFootnote) {
          e.preventDefault();
          if (fnMsg) {
            showToast("\u{1F4CC} " + fnMsg);
          } else {
            showToast("Rich Footnotes do not work here.");
          }
          return;
        }

        if (targetNoteUUID) {
          e.preventDefault();
          callPlugin("openCard", { noteUUID: targetNoteUUID });
          return;
        }

        if (href.startsWith("#") || href.startsWith("javascript:")) {
          return;
        }

        e.preventDefault();
        showToast("Outside links do not work here.");
        return;
      }

      var isComp = !!card.completedAt || !!card.completed || !!card.dismissedAt || cardEl.classList.contains("kb-card-done");
      handlePluginResult(callPlugin("editCard", { cardId: card.id, tabId: STATE.activeTabId, isCompleted: isComp, completedAt: card.completedAt, dismissedAt: card.dismissedAt }));
    });

    return cardEl;
  }

  function getCardFootnoteText(card, a, href, aText) {
    if (!card) return "";
    var fns = card.footnotes || {};
    var keys = Object.keys(fns);
    if (keys.length === 0) return "";

    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if ((href && href.indexOf(k) !== -1) || (aText && aText.indexOf(k) !== -1)) {
        return fns[k];
      }
    }
    return fns[keys[0]] || "";
  }

  /* ---------------- drop zone for cards ---------------- */

  function wireDropZone(listEl, columnId, sectionId, columnName, sectionName) {
    listEl.addEventListener("dragover", function (e) {
      if (dragType && dragType !== "card") return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      var targetCard = e.target && e.target.closest ? e.target.closest(".kb-card") : null;
      var allCards = listEl.querySelectorAll(".kb-card");
      allCards.forEach(function (c) {
        if (c !== targetCard) {
          c.classList.remove("kb-card-drop-before", "kb-card-drop-after");
        }
      });

      if (targetCard && targetCard.getAttribute("data-card-id") !== dragCardId) {
        var rect = targetCard.getBoundingClientRect();
        var isAfter = e.clientY > (rect.top + rect.height / 2);
        targetCard.classList.toggle("kb-card-drop-before", !isAfter);
        targetCard.classList.toggle("kb-card-drop-after", isAfter);
        listEl.classList.remove("kb-drop-hover");
      } else {
        listEl.classList.add("kb-drop-hover");
      }
    });

    listEl.addEventListener("dragleave", function (e) {
      if (!listEl.contains(e.relatedTarget)) {
        listEl.classList.remove("kb-drop-hover");
        var allCards = listEl.querySelectorAll(".kb-card");
        allCards.forEach(function (c) {
          c.classList.remove("kb-card-drop-before", "kb-card-drop-after");
        });
      }
    });

    listEl.addEventListener("drop", function (e) {
      if (dragType && dragType !== "card") return;
      e.preventDefault();
      listEl.classList.remove("kb-drop-hover");
      var allCards = listEl.querySelectorAll(".kb-card");
      allCards.forEach(function (c) {
        c.classList.remove("kb-card-drop-before", "kb-card-drop-after");
      });

      var raw = (e.dataTransfer && e.dataTransfer.getData("text/plain")) || ("card::" + dragCardId);
      var cardId = raw.indexOf("card::") === 0 ? raw.slice(6) : (dragCardId || raw);
      if (!cardId) return;

      var board = document.getElementById("kb-board");
      var cardEl = board && board.querySelector('[data-card-id="' + cssEscape(cardId) + '"]');

      var targetCard = e.target && e.target.closest ? e.target.closest(".kb-card") : null;
      var targetCardId = null;
      var position = "top";

      if (cardEl) {
        if (targetCard && targetCard !== cardEl) {
          targetCardId = targetCard.getAttribute("data-card-id");
          var rect = targetCard.getBoundingClientRect();
          var isAfter = e.clientY > (rect.top + rect.height / 2);
          position = isAfter ? "after" : "before";
          if (isAfter) {
            listEl.insertBefore(cardEl, targetCard.nextSibling);
          } else {
            listEl.insertBefore(cardEl, targetCard);
          }
        } else if (cardEl.parentElement !== listEl) {
          listEl.appendChild(cardEl);
          position = "bottom";
        }
      }

      callPlugin("moveCard", {
        tabId: STATE.activeTabId,
        cardId: cardId,
        toColumnId: columnId,
        toColumnName: columnName,
        toSectionId: sectionId,
        toSectionName: sectionName,
        targetCardId: targetCardId,
        position: position,
      }).then(function (res) {
        if (!res) return;
        var newId = res.newCardId || cardId;
        var tabData = STATE.boards ? STATE.boards[STATE.activeTabId] : null;
        var targetCardModel = null;
        if (tabData && tabData.columns) {
          tabData.columns.forEach(function (c) {
            (c.cards || []).forEach(function (cd) {
              if (cd.id === cardId || cd.id === newId) targetCardModel = cd;
            });
            (c.sections || []).forEach(function (s) {
              (s.cards || []).forEach(function (cd) {
                if (cd.id === cardId || cd.id === newId) targetCardModel = cd;
              });
            });
          });
        }

        if (res.newCardId && targetCardModel) {
          targetCardModel.id = res.newCardId;
          targetCardModel.uuid = res.newCardId;
        }

        if (res.taskCompleted !== undefined) {
          var wasCompleted = targetCardModel ? !!targetCardModel.completedAt : (cardEl ? cardEl.classList.contains("kb-card-done") : false);
          if (targetCardModel) {
            targetCardModel.completedAt = res.taskCompleted ? (res.completedAt || Math.floor(Date.now() / 1000)) : null;
            targetCardModel.completed = !!res.taskCompleted;
          }
          if (targetCardModel && cardEl && cardEl.parentElement) {
            var freshCardEl = buildCardEl(targetCardModel);
            cardEl.replaceWith(freshCardEl);
          } else if (cardEl) {
            if (res.newCardId) cardEl.setAttribute("data-card-id", res.newCardId);
            cardEl.classList.toggle("kb-card-done", !!res.taskCompleted);
          }
          if (res.taskCompleted && !wasCompleted) {
            showToast("Task completed", "success");
          } else if (!res.taskCompleted && wasCompleted) {
            showToast("Task reopened", "success");
          }
        } else if (res.newCardId && cardEl) {
          cardEl.setAttribute("data-card-id", res.newCardId);
        }
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

  function formatStartStamp(unixSeconds) {
    if (!unixSeconds) return "";
    var d = new Date(unixSeconds * 1000);
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    return formatStamp(unixSeconds) + (hasTime ? " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) : "");
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

  function formatCompletedStamp(unixSeconds) {
    if (!unixSeconds) return "";
    var d = new Date(unixSeconds * 1000);
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return formatStamp(unixSeconds) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
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

  /* ---------------- image lightbox ---------------- */

  function openImageLightbox(src) {
    if (!src) return;
    var overlay = el("div", "kb-lightbox-overlay");
    var img = document.createElement("img");
    img.className = "kb-lightbox-img";
    img.src = src;
    img.alt = "Enlarged preview";
    img.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    var closeBtn = el("button", "kb-lightbox-close", "\xD7");
    closeBtn.type = "button";
    closeBtn.title = "Close preview (Esc)";
    closeBtn.addEventListener("click", function () {
      overlay.remove();
      window.removeEventListener("keydown", handleKey);
    });

    function handleKey(e) {
      if (e.key === "Escape") {
        overlay.remove();
        window.removeEventListener("keydown", handleKey);
      }
    }
    window.addEventListener("keydown", handleKey);

    overlay.addEventListener("click", function () {
      overlay.remove();
      window.removeEventListener("keydown", handleKey);
    });

    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
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
      if (c.sections && c.sections.length > 0) {
        c.sections.forEach(function (s) {
          if (s.cards) allCards = allCards.concat(s.cards);
        });
      } else if (c.cards) {
        allCards = allCards.concat(c.cards);
      }
    });

    var totalCards = allCards.length;
    var openCount = 0;
    allCards.forEach(function (c) {
      var isOpen = openInfoCards[c.id] !== undefined ? !!openInfoCards[c.id] : expandCardInfo;
      if (isOpen) openCount++;
    });

    var shouldExpand = openCount < totalCards;
    openInfoCards = {};

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

    var densityBtn = document.getElementById("kb-density-btn");
    if (densityBtn) densityBtn.addEventListener("click", cycleDensity);

    var resetSortBtn = document.getElementById("kb-reset-sort-btn");
    if (resetSortBtn) resetSortBtn.addEventListener("click", resetSort);

    var saveSortBtn = document.getElementById("kb-save-sort-btn");
    if (saveSortBtn) {
      saveSortBtn.addEventListener("click", function () {
        handlePluginResult(callPlugin("saveSortToNote", { tabId: STATE.activeTabId, sortMode: sortMode }));
      });
    }

    var openNoteBtn = document.getElementById("kb-open-note-btn");
    if (openNoteBtn) {
      openNoteBtn.addEventListener("click", function () {
        var tab = activeTab();
        if (!tab) return;
        if (tab.kind === "note" && tab.noteUUID) {
          callPlugin("openCard", { noteUUID: tab.noteUUID });
        } else if ((tab.kind === "tag" || tab.kind === "notes") && tab.tag) {
          callPlugin("openTag", { tag: tab.tag });
        }
      });
    }



    var refreshTabBtn = document.getElementById("kb-refresh-tab");
    if (refreshTabBtn) {
      refreshTabBtn.addEventListener("click", function () {
        setBusy("kb-refresh-tab", true);
        setProgress(0.4);
        sortMode = "none";
        setLocalSetting("sortMode", "none");
        updateSortUi();
        callPlugin("refreshTab", { tabId: STATE.activeTabId }).then(function (res) {
          setBusy("kb-refresh-tab", false);
          setProgress(1.0);
          setTimeout(function () { setProgress(null); }, 350);
          if (res && res.board && res.tabId) {
            STATE.boards[res.tabId] = res.board;
            renderBoard();
            showToast("Tab refreshed (default order)");
          }
        }).catch(function () {
          setBusy("kb-refresh-tab", false);
          setProgress(null);
        });
      });
    }

    var refreshAllBtn = document.getElementById("kb-refresh-all");
    if (refreshAllBtn) {
      refreshAllBtn.addEventListener("click", function () {
        setBusy("kb-refresh-all", true);
        setProgress(0.25);
        sortMode = "none";
        setLocalSetting("sortMode", "none");
        updateSortUi();
        callPlugin("refreshAll").then(function (res) {
          setBusy("kb-refresh-all", false);
          setProgress(1.0);
          setTimeout(function () { setProgress(null); }, 350);
          if (res && res.boards) {
            STATE.boards = res.boards;
            if (res.config) STATE.config = res.config;
            renderAll();
            showToast("All boards refreshed (default order)");
          }
        }).catch(function () {
          setBusy("kb-refresh-all", false);
          setProgress(null);
        });
      });
    }

    var fmtBtn = document.getElementById("kb-datefmt-btn");
    if (fmtBtn) {
      fmtBtn.addEventListener("click", function () {
        callPlugin("setDateFormat").then(function (res) {
          if (res && res.ok && res.dateFormat) {
            STATE.settings = STATE.settings || {};
            STATE.settings.dateFormat = res.dateFormat;
            var fmtLabel = document.getElementById("kb-datefmt-label");
            if (fmtLabel) fmtLabel.textContent = res.dateFormat;
            renderBoard();
            if (res.toast) showToast(res.toast);
          }
        });
      });
      var fmtLabel = document.getElementById("kb-datefmt-label");
      if (fmtLabel && STATE.settings) fmtLabel.textContent = STATE.settings.dateFormat || "";
    }

    var search = document.getElementById("kb-search");
    var searchClear = document.getElementById("kb-search-clear");
    var searchShortcut = document.getElementById("kb-search-shortcut");

    function updateSearchClearUi() {
      var hasText = search && search.value.trim().length > 0;
      if (searchClear) searchClear.style.display = hasText ? "flex" : "none";
      if (searchShortcut) searchShortcut.style.display = hasText ? "none" : "block";
    }

    if (search) {
      search.addEventListener("input", function () {
        searchQuery = search.value.trim().toLowerCase();
        updateSearchClearUi();
        renderBoard();
      });
      search.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && search.value.trim()) {
          callPlugin("globalSearch", { query: search.value.trim() });
        }
        if (e.key === "Escape") {
          search.value = "";
          searchQuery = "";
          updateSearchClearUi();
          renderBoard();
          search.blur();
        }
      });
    }

    if (searchClear) {
      searchClear.addEventListener("click", function () {
        if (search) {
          search.value = "";
          searchQuery = "";
          updateSearchClearUi();
          renderBoard();
          search.focus();
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

    window.addEventListener("wheel", function (e) {
      // Shift + Wheel: strictly for horizontal scrolling across board columns
      if (e.shiftKey) {
        var boardEl = document.getElementById("kb-board");
        if (boardEl) {
          e.preventDefault();
          var delta = e.deltaY || e.deltaX;
          boardEl.scrollLeft += delta * 1.5;
        }
      }
      // Without Shift: pure native vertical scroll only
    }, { passive: false });

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

    // Global capture-phase interception for images (lightbox) and links
    document.addEventListener("click", function (e) {
      // 1. Image click -> open full-resolution lightbox modal
      var imgEl = e.target && e.target.closest ? e.target.closest(".kb-card-body img, .kb-card-img") : null;
      if (imgEl) {
        var src = imgEl.getAttribute("src");
        if (src) {
          e.preventDefault();
          e.stopPropagation();
          openImageLightbox(src);
          return;
        }
      }

      // 2. Link click
      var link = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!link) return;

      var href = (link.getAttribute("href") || "").trim();
      var noteUuid = (link.getAttribute("data-note-uuid") || "").trim();

      // Ignore hash anchors or void scripts
      if (href.startsWith("#") || href.startsWith("javascript:") || !href) {
        return;
      }

      // Always prevent native iframe navigation or popup attempts
      e.preventDefault();
      e.stopPropagation();

      // Check if it is an Amplenote note URL
      var anpLinkRe = new RegExp("amplenote\\.com/notes/([a-zA-Z0-9_-]+)", "i");
      var anpPathRe = new RegExp("^/notes/([a-zA-Z0-9_-]+)", "i");
      var m = href.match(anpLinkRe) || href.match(anpPathRe);
      var targetNoteUUID = noteUuid || (m ? m[1] : null);

      if (targetNoteUUID && targetNoteUUID !== "plugins") {
        callPlugin("openCard", { noteUUID: targetNoteUUID });
        return;
      }

      // External link: show friendly notification
      showToast("Outside links do not work here.");
    }, true);
  }

  /* ---------------- boot ---------------- */

  bootTheme();
  applyDensity(density);
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
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (tag) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[tag]);
}
function toJsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

// anp-15-kanban/lib/ui/boardTemplate.js
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
    .kb-search-clear {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: none;
        background: var(--kb-bg-column);
        color: var(--kb-text-muted);
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: all 0.15s ease;
        z-index: 3;
    }
    .kb-search-clear:hover {
        background: color-mix(in srgb, var(--kb-accent) 15%, var(--kb-bg-card));
        color: var(--kb-accent);
        transform: translateY(-50%) scale(1.1);
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
        background: color-mix(in srgb, var(--kb-accent) 15%, transparent);
        opacity: 0;
        transition: opacity 0.2s ease;
        overflow: hidden;
        z-index: 101;
    }
    .kb-progress.kb-progress-visible { opacity: 1; }
    .kb-progress-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, var(--kb-accent), color-mix(in srgb, var(--kb-accent) 70%, #ffffff));
        box-shadow: 0 0 8px var(--kb-accent);
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
        margin-left: 4px;
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
        right: 58px;
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
        position: relative;
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
        flex: 1 1 auto;
        min-width: 0;
    }
    .kb-section-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
        margin-left: 4px;
    }
    .kb-section-tools {
        position: absolute;
        right: 32px;
        top: 50%;
        transform: translateY(-50%);
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
        z-index: 10;
    }
    .kb-section:hover .kb-section-tools,
    .kb-section-head:hover .kb-section-tools {
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
    .kb-card-body a.kb-rich-footnote {
        text-decoration: underline dotted var(--kb-accent);
        text-underline-offset: 3px;
        cursor: help;
        position: relative;
    }
    .kb-card-body a.kb-rich-footnote:hover {
        text-decoration: underline solid var(--kb-accent);
        color: var(--kb-accent-hover, var(--kb-accent));
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
    .kb-toast.kb-toast-success {
        border-color: var(--kb-accent, #10b981);
    }
    .kb-toast.kb-toast-error {
        border-color: var(--kb-danger, #ef4444);
        color: var(--kb-danger, #ef4444);
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.25);
    }
    .kb-toast.kb-toast-warning {
        border-color: #f59e0b;
        color: #d97706;
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
    /* ---------- Toast Notifications ---------- */
    .kb-toast-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
        max-width: 380px;
    }
    .kb-toast {
        pointer-events: auto;
        background: var(--kb-surface-card);
        color: var(--kb-text);
        padding: 10px 16px;
        border-radius: 8px;
        border: 1px solid var(--kb-border);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.4;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: kb-toast-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-left: 4px solid var(--kb-accent);
        transition: opacity 0.22s ease-out, transform 0.22s ease-out;
    }
    .kb-toast-success {
        border-left-color: #10b981;
    }
    .kb-toast-error {
        border-left-color: #ef4444;
    }
    .kb-toast-warning {
        border-left-color: #f59e0b;
    }
    .kb-toast-hiding {
        opacity: 0;
        transform: translateY(8px) scale(0.96);
    }
    @keyframes kb-toast-in {
        from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
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
        .kb-toast-container {
            bottom: 16px;
            right: 16px;
            left: 16px;
            max-width: none;
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
                <button id="kb-search-clear" class="kb-search-clear" type="button" style="display:none;" title="Clear search (Escape)">
                    <svg class="kb-icon kb-icon-stroke" width="12" height="12" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <kbd id="kb-search-shortcut" class="kb-search-shortcut">/</kbd>
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
                    <span id="kb-open-note-label">Open Note</span>
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
  const cleanNoteUUID = typeof noteUUID === "object" && noteUUID !== null ? noteUUID.uuid || noteUUID.id || null : noteUUID;
  return { id: newId("tab"), kind, name: String(name || "Untitled"), noteUUID: cleanNoteUUID, tag };
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
        { id: "card_5", title: "Plugin plan approved", content: "", completedAt: Math.floor(Date.now() / 1e3) - 86400, startAt: null, deadline: null, important: false, urgent: false }
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
  if (typeof raw.density === "string" && (raw.density === "compact" || raw.density === "cozy" || raw.density === "spacious")) {
    base.density = raw.density;
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
var UUID_IN_LINE_RE = (uuid) => new RegExp(`["']?uuid["']?\\s*:\\s*["']?${uuid}["']?`, "i");
function parseHeadings(markdown) {
  const headings = [];
  const lines = String(markdown || "").split("\n");
  lines.forEach((line, i) => {
    const clean = line.replace(/\r/g, "").trim();
    if (!clean) return;
    if (/^<details/i.test(clean) || /^<summary/i.test(clean) || /^<!--/i.test(clean)) return;
    const m = clean.match(HEADING_RE);
    if (m) {
      const text = m[2].replace(/<[^>]+>/g, "").trim();
      if (/^completed\s+tasks/i.test(text)) return;
      headings.push({ lineIndex: i, level: m[1].length, text });
    }
  });
  return headings;
}
function buildColumnSpans(markdown, columnLevel) {
  const headings = parseHeadings(markdown);
  if (!headings.length) return { columns: [], preambleEnd: 0 };
  const columnHeadings = columnLevel !== void 0 && columnLevel !== null ? headings.filter((h) => h.level === columnLevel) : headings;
  const totalLines = String(markdown || "").split("\n").length;
  const columns = columnHeadings.map((h, i) => {
    const next = columnHeadings[i + 1];
    const contentEnd = next ? next.lineIndex : totalLines;
    return {
      id: String(h.lineIndex),
      name: h.text,
      level: h.level,
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
  if (!Array.isArray(lines) || !Array.isArray(tasks)) return result;
  for (const task of tasks) {
    const uuid = task.uuid || task.id;
    const re = uuid ? UUID_IN_LINE_RE(uuid) : null;
    let found = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = String(lines[i] || "").replace(/\r/g, "");
      if (re && re.test(line)) {
        found = i;
        break;
      }
      if (uuid && line.indexOf(uuid) !== -1) {
        found = i;
        break;
      }
      if (task.content && /^\s*[-*+]\s*\[[ xX]\]/.test(line)) {
        const cleanTaskContent = String(task.content).trim();
        const cleanLineContent = line.replace(/^\s*[-*+]\s*\[[ xX]\]\s*/, "").replace(/<!--[\s\S]*?-->/g, "").trim();
        if (cleanTaskContent && cleanLineContent === cleanTaskContent) {
          found = i;
          break;
        }
      }
    }
    result.set(uuid || task.content, found);
  }
  return result;
}
function detectTaskHierarchy(lines, tasks, taskLines) {
  if (!tasks || tasks.length === 0) return;
  const lookup = taskLines || (lines ? findTaskLines(lines, tasks) : /* @__PURE__ */ new Map());
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const lineIndex = lookup.get(task.uuid || task.id);
    if (lineIndex !== void 0 && lineIndex >= 0 && lines && lines[lineIndex] !== void 0) {
      const rawLine = String(lines[lineIndex] || "");
      const indentMatch = rawLine.match(/^(\s+)[-*+]\s*\[/);
      if (indentMatch) {
        const spaces = indentMatch[1].replace(/\t/g, "    ").length;
        task.subtaskDepth = spaces >= 4 ? Math.floor(spaces / 4) : 1;
        task.isSubtask = true;
      } else {
        task.subtaskDepth = 0;
        task.isSubtask = false;
      }
    } else {
      task.subtaskDepth = typeof task.subtaskDepth === "number" ? task.subtaskDepth : task.isSubtask ? 1 : 0;
      task.isSubtask = !!task.isSubtask || task.subtaskDepth > 0;
    }
  }
  for (let i = 0; i < tasks.length; i++) {
    const current = tasks[i];
    const currentDepth = current.subtaskDepth || 0;
    let hasChildren = !!current.hasChildren || !!current.isParent;
    if (!hasChildren && i + 1 < tasks.length) {
      const next = tasks[i + 1];
      const nextDepth = next.subtaskDepth || 0;
      if (nextDepth > currentDepth) {
        hasChildren = true;
      }
    }
    current.isParent = hasChildren;
  }
}
function assignTasksToColumns(columns, lines, tasks, options = {}) {
  const { separateCompleted = false } = options;
  const taskLines = findTaskLines(lines, tasks);
  detectTaskHierarchy(lines, tasks, taskLines);
  const columnCards = new Map(columns.map((c) => [c.id, []]));
  const unsorted = [];
  const completed = [];
  for (const task of tasks) {
    const lineIndex = taskLines.get(task.uuid || task.id);
    if (separateCompleted && (task.completedAt || task.completed || task.dismissedAt)) {
      completed.push(task);
      continue;
    }
    if (lineIndex === void 0 || lineIndex < 0) continue;
    const owner = columns.find((c) => lineIndex >= c.contentStart && lineIndex < c.contentEnd);
    if (owner) columnCards.get(owner.id).push(task);
    else unsorted.push(task);
  }
  for (const [colId, cardList] of columnCards.entries()) {
    cardList.sort((a, b) => {
      const lineA = taskLines.get(a.uuid || a.id) ?? 0;
      const lineB = taskLines.get(b.uuid || b.id) ?? 0;
      return lineA - lineB;
    });
  }
  unsorted.sort((a, b) => {
    const lineA = taskLines.get(a.uuid || a.id) ?? 0;
    const lineB = taskLines.get(b.uuid || b.id) ?? 0;
    return lineA - lineB;
  });
  completed.sort((a, b) => {
    const timeA = typeof a.completedAt === "number" ? a.completedAt : 0;
    const timeB = typeof b.completedAt === "number" ? b.completedAt : 0;
    return timeB - timeA;
  });
  return { columnCards, unsorted, completed };
}
function removeLine(lines, taskLineIndex) {
  return [...lines.slice(0, taskLineIndex), ...lines.slice(taskLineIndex + 1)];
}
function insertUnderHeading(lines, span, taskLine) {
  const insertIndex = span.startLine + 1;
  const nextLine = lines[insertIndex];
  if (nextLine !== void 0 && nextLine.trim() !== "" && !/^\s*[-*+]\s*\[[ xX]\]/.test(nextLine) && !/^#{1,6}\s+/.test(nextLine)) {
    return [...lines.slice(0, insertIndex), taskLine, "", ...lines.slice(insertIndex)];
  }
  return [...lines.slice(0, insertIndex), taskLine, ...lines.slice(insertIndex)];
}
function resolveSpan(spans, columnId, columnName) {
  if (!spans || !spans.length) return null;
  const colStr = String(columnId || "").trim();
  const byId = spans.find((s) => s.id === colStr);
  if (byId) return byId;
  const targetName = String(columnName || colStr).trim().toLowerCase();
  const byName = spans.find((s) => s.name.trim().toLowerCase() === targetName);
  if (byName) return byName;
  if (/^(?:col_|idx_)\d+$/i.test(colStr)) {
    const idx = parseInt(colStr.replace(/^(?:col_|idx_)/i, ""), 10);
    if (!Number.isNaN(idx) && idx >= 0 && idx < spans.length) {
      return spans[idx];
    }
  }
  return null;
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
async function createColumn(app, noteUUID, name, level = null) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return false;
  let hLevel = level ? parseInt(String(level), 10) : null;
  if (!hLevel || hLevel < 1 || hLevel > 6) {
    const markdown = await app.getNoteContent({ uuid: noteUUID });
    const { columns } = buildColumnSpans(markdown);
    hLevel = columns.length ? headingLevel(markdown.split("\n")[columns[0].startLine]) : 2;
  }
  await app.insertNoteContent(
    { uuid: noteUUID },
    `
${"#".repeat(hLevel)} ${trimmed}
`,
    { atEnd: true }
  );
  return true;
}
async function renameColumn(app, noteUUID, columnId, newName) {
  return withNoteLock(noteUUID, async () => {
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
  });
}
async function deleteColumn(app, noteUUID, columnId) {
  return withNoteLock(noteUUID, async () => {
    const lines = await readLines(app, noteUUID);
    const { columns } = buildColumnSpans(lines.join("\n"));
    const span = resolveSpan(columns, columnId);
    if (!span) return false;
    if (columns.length <= 1) return false;
    lines.splice(span.startLine, 1);
    await app.replaceNoteContent({ uuid: noteUUID }, lines.join("\n"));
    return true;
  });
}
var noteLocks = /* @__PURE__ */ new Map();
async function withNoteLock(noteUUID, fn) {
  const key = String(noteUUID || "__global__");
  const previous = noteLocks.get(key) || Promise.resolve();
  const next = previous.catch(() => {
  }).then(fn);
  const tail = next.catch(() => {
  }).finally(() => {
    if (noteLocks.get(key) === tail) {
      noteLocks.delete(key);
    }
  });
  noteLocks.set(key, tail);
  return next;
}
async function reorderColumns(app, noteUUID, orderedIds, orderedNames) {
  return withNoteLock(noteUUID, async () => {
    const lines = await readLines(app, noteUUID);
    const markdown = lines.join("\n");
    const { columns, preambleEnd } = buildColumnSpans(markdown);
    if (!columns.length || !Array.isArray(orderedIds)) return false;
    if (orderedIds.length !== columns.length) return false;
    const spans = orderedIds.map((id, idx) => {
      const name = orderedNames && orderedNames[idx] || id;
      return resolveSpan(columns, id, name);
    });
    if (spans.some((s) => !s) || new Set(spans.map((s) => s.id)).size !== columns.length) return false;
    const rebuilt = [...lines.slice(0, Math.max(preambleEnd - 1, 0))];
    for (const span of spans) {
      rebuilt.push(...lines.slice(span.startLine, span.contentEnd));
    }
    await app.replaceNoteContent({ uuid: noteUUID }, rebuilt.join("\n"));
    return true;
  });
}
async function transferColumn(app, sourceUUID, columnId, targetUUID) {
  return withNoteLock(sourceUUID, async () => {
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
  });
}

// anp-15-kanban/lib/api/taskOps.js
function nowSeconds() {
  return Math.floor(Date.now() / 1e3);
}
async function readNote(app, noteUUID) {
  const markdown = await app.getNoteContent({ uuid: noteUUID });
  return { markdown, lines: markdown.split("\n") };
}
async function _moveTaskToColumn(app, noteUUID, taskUuid, target = {}) {
  const { markdown, lines } = await readNote(app, noteUUID);
  const cleanLines = lines.map((l) => String(l || "").replace(/\r/g, ""));
  const { columns } = buildColumnSpans(cleanLines.join("\n"));
  if (!columns.length) return "no-columns";
  let taskObj = null;
  try {
    taskObj = await app.getTask(taskUuid);
  } catch {
    taskObj = null;
  }
  let [taskLineIndex] = findTaskLines(cleanLines, [{ uuid: taskUuid, content: taskObj?.content }]).values();
  let taskLine = "";
  let next = cleanLines;
  if (taskLineIndex !== void 0 && taskLineIndex >= 0) {
    taskLine = cleanLines[taskLineIndex];
    next = removeLine(cleanLines, taskLineIndex);
  } else if (taskObj && (taskObj.uuid === taskUuid || taskObj.id === taskUuid) && taskObj.content) {
    taskLine = `- [ ] ${taskObj.content}`;
    taskLineIndex = -1;
  } else {
    return "no-task";
  }
  if (target.targetCardId && target.targetCardId !== taskUuid) {
    let targetTaskObj = null;
    try {
      targetTaskObj = await app.getTask(target.targetCardId);
    } catch {
    }
    const [targetLineIndex] = findTaskLines(cleanLines, [{ uuid: target.targetCardId, content: targetTaskObj?.content }]).values();
    if (targetLineIndex !== void 0 && targetLineIndex >= 0 && targetLineIndex !== taskLineIndex) {
      const shiftedTargetIdx = taskLineIndex >= 0 && targetLineIndex > taskLineIndex ? targetLineIndex - 1 : targetLineIndex;
      const insertAt = target.position === "after" ? shiftedTargetIdx + 1 : shiftedTargetIdx;
      next.splice(insertAt, 0, taskLine);
      await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
      return "moved";
    }
  }
  if (!columns.length) {
    if (target.position === "bottom") {
      next.push(taskLine);
    } else {
      next.unshift(taskLine);
    }
    await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
    return "moved";
  }
  if (target.columnId === "completed" || target.columnName === "Completed") {
    try {
      await app.updateTask(taskUuid, { completedAt: nowSeconds() });
    } catch {
    }
    return "moved";
  }
  if (!target.columnId || target.columnId === "unsorted" || target.columnName === "Unsorted" || target.columnId === "main") {
    const insertAt = columns[0] ? Math.max(0, columns[0].startLine) : 0;
    const nextLine = next[insertAt];
    if (nextLine !== void 0 && nextLine.trim() !== "" && !/^\s*[-*+]\s*\[[ xX]\]/.test(nextLine) && !/^#{1,6}\s+/.test(nextLine)) {
      next.splice(insertAt, 0, taskLine, "");
    } else {
      next.splice(insertAt, 0, taskLine);
    }
    await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
    return "moved";
  }
  const destSpan = resolveSpan(columns, target.columnId, target.columnName);
  if (!destSpan) return "no-target";
  const sourceSpan = taskLineIndex >= 0 ? columns.find((s) => taskLineIndex >= s.contentStart && taskLineIndex < s.contentEnd) : null;
  if (sourceSpan && sourceSpan.id === destSpan.id && !target.targetCardId) {
    return "same-column";
  }
  const shiftedDest = {
    ...destSpan,
    startLine: taskLineIndex >= 0 && destSpan.startLine > taskLineIndex ? destSpan.startLine - 1 : destSpan.startLine
  };
  next = insertUnderHeading(next, shiftedDest, taskLine);
  await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
  return "moved";
}
async function moveTaskToColumn(app, noteUUID, taskUuid, target = {}) {
  return withNoteLock(noteUUID, () => _moveTaskToColumn(app, noteUUID, taskUuid, target));
}
async function _createTaskInColumn(app, noteUUID, target, content) {
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
  const cleanInputContent = String(content || "").replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").trim();
  const taskUuid = await app.insertTask({ uuid: noteUUID }, { content: cleanInputContent });
  if (!taskUuid) return null;
  try {
    await app.updateTask(taskUuid, { content: cleanInputContent });
  } catch {
  }
  const isUnsorted = target?.columnId === "unsorted" || target?.columnName === "Unsorted" || !target?.columnId;
  if (isUnsorted) {
    try {
      const { markdown, lines } = await readNote(app, noteUUID);
      let cleanLines = lines.map((l) => String(l || "").replace(/\r/g, ""));
      let taskObj = null;
      try {
        taskObj = await app.getTask(taskUuid);
      } catch {
        taskObj = null;
      }
      const [taskIdx] = findTaskLines(cleanLines, [{ uuid: taskUuid, content: taskObj?.content || cleanInputContent }]).values();
      const taskLine = `- [ ] ${cleanInputContent} <!-- {"uuid":"${taskUuid}"} -->`;
      if (taskIdx !== void 0 && taskIdx > 0) {
        let next = removeLine(cleanLines, taskIdx);
        const nextLine = next[0];
        if (nextLine !== void 0 && nextLine.trim() !== "" && !/^\s*[-*+]\s*\[[ xX]\]/.test(nextLine) && !/^#{1,6}\s+/.test(nextLine)) {
          next.unshift(taskLine, "");
        } else {
          next.unshift(taskLine);
        }
        await app.replaceNoteContent({ uuid: noteUUID }, next.join("\n"));
      } else if (taskIdx === void 0 || taskIdx < 0) {
        const existingIdx = cleanLines.findIndex((l) => {
          if (l.includes(taskUuid)) return true;
          if (!/^\s*[-*+]\s*\[[ xX]\]/.test(l)) return false;
          const clean = l.replace(/^\s*[-*+]\s*\[[ xX]\]\s*/, "").replace(/<!--[\s\S]*?-->/g, "").trim();
          return cleanInputContent && clean === cleanInputContent;
        });
        if (existingIdx !== -1) {
          cleanLines.splice(existingIdx, 1);
        }
        const nextLine = cleanLines[0];
        if (nextLine !== void 0 && nextLine.trim() !== "" && !/^\s*[-*+]\s*\[[ xX]\]/.test(nextLine) && !/^#{1,6}\s+/.test(nextLine)) {
          cleanLines.unshift(taskLine, "");
        } else {
          cleanLines.unshift(taskLine);
        }
        await app.replaceNoteContent({ uuid: noteUUID }, cleanLines.join("\n"));
      }
    } catch (error) {
      console.error("createTaskInColumn unsorted relocate failed:", error);
    }
    return taskUuid;
  }
  try {
    const res = await _moveTaskToColumn(app, noteUUID, taskUuid, {
      columnId: target?.columnId,
      columnName: targetName
    });
    if (res === "no-task" || res === "same-column") {
      const { markdown } = await readNote(app, noteUUID);
      const { columns } = buildColumnSpans(markdown);
      const span = resolveSpan(columns, target.columnId, targetName);
      if (span) {
        let lines = markdown.split("\n");
        const preambleIndex = lines.findIndex((l, i) => {
          if (i >= span.startLine) return false;
          if (l.includes(taskUuid)) return true;
          if (!/^\s*[-*+]\s*\[[ xX]\]/.test(l)) return false;
          const clean = l.replace(/^\s*[-*+]\s*\[[ xX]\]\s*/, "").replace(/<!--[\s\S]*?-->/g, "").trim();
          return cleanInputContent && clean === cleanInputContent;
        });
        if (preambleIndex !== -1) {
          lines.splice(preambleIndex, 1);
        }
        const taskLine = `- [ ] ${cleanInputContent} <!-- {"uuid":"${taskUuid}"} -->`;
        lines = insertUnderHeading(lines, span, taskLine);
        await app.replaceNoteContent({ uuid: noteUUID }, lines.join("\n"));
      }
    }
  } catch (error) {
    console.error("createTaskInColumn relocate failed:", error);
  }
  return taskUuid;
}
async function createTaskInColumn(app, noteUUID, target, content) {
  return withNoteLock(noteUUID, () => _createTaskInColumn(app, noteUUID, target, content));
}
async function setTaskCompleted(app, taskUuid, done = true) {
  await app.updateTask(taskUuid, { completedAt: done ? nowSeconds() : null });
}
async function _sortTasksInNoteMarkdown(app, noteUUID, sortMode = "score") {
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
async function sortTasksInNoteMarkdown(app, noteUUID, sortMode = "score") {
  return withNoteLock(noteUUID, () => _sortTasksInNoteMarkdown(app, noteUUID, sortMode));
}

// anp-15-kanban/lib/api/noteBoard.js
async function buildNoteBoard(app, noteUUID, options = {}) {
  const cleanUUID = typeof noteUUID === "object" && noteUUID !== null ? noteUUID.uuid || noteUUID.id : noteUUID;
  if (!cleanUUID || typeof cleanUUID !== "string") {
    return { kind: "note", noteUUID: cleanUUID, columns: [], hasHeadings: false };
  }
  let markdown = "";
  try {
    markdown = await app.getNoteContent({ uuid: cleanUUID });
  } catch (err) {
    console.error(`Failed to getNoteContent for ${cleanUUID}:`, err);
    return { kind: "note", noteUUID: cleanUUID, columns: [], hasHeadings: false };
  }
  if (typeof markdown !== "string") {
    return { kind: "note", noteUUID: cleanUUID, columns: [], hasHeadings: false };
  }
  const tasks = await app.getNoteTasks({ uuid: cleanUUID }, { includeDone: true }) || [];
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
  const { columnCards, unsorted, completed = [] } = assignTasksToColumns(columns, lines, tasks, { separateCompleted: true });
  const limits = options.columnLimits || {};
  const makeColumn = (span, cards) => ({
    id: span.id,
    name: span.name,
    level: span.level || null,
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
  if (completed && completed.length > 0) {
    boardColumns.push({
      id: "completed",
      name: "Completed",
      wipLimit: null,
      cards: completed.map(toCardModel),
      isDoneColumn: true,
      isSystemColumn: true
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
    footnotes: parseFootnotes(task.content || ""),
    completedAt: task.completedAt ?? null,
    dismissedAt: task.dismissedAt ?? null,
    startAt: task.startAt ?? null,
    endAt: task.endAt ?? null,
    deadline: task.deadline ?? null,
    hideUntil: task.hideUntil ?? null,
    repeat: task.repeat ?? null,
    isRepeating: !!task.isRepeating,
    isParent: !!task.isParent,
    isSubtask: !!task.isSubtask,
    subtaskDepth: typeof task.subtaskDepth === "number" ? task.subtaskDepth : task.isSubtask ? 1 : 0,
    important: !!task.important,
    urgent: !!task.urgent,
    score: typeof task.score === "number" ? task.score : null,
    noteUUID: task.noteUUID || null
  };
}
async function renderCardHtml(app, cards) {
  if (!Array.isArray(cards) || !cards.length) return cards;
  await Promise.all(
    cards.map(async (card) => {
      try {
        if (typeof app?.htmlFromContent === "function" && card.content) {
          card.html = await app.htmlFromContent(card.content);
        } else {
          card.html = null;
        }
      } catch (error) {
        card.html = null;
      }
    })
  );
  return cards;
}
function firstImageUrl(markdown) {
  const m = String(markdown).match(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/);
  return m ? m[1] : null;
}
function resolveLabels(markdown, colorMap = {}) {
  const labels = [];
  const str = String(markdown || "");
  const wikiRe = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = wikiRe.exec(str)) !== null) {
    const name = m[1].trim();
    if (name && !labels.some((l) => l.name.toLowerCase() === name.toLowerCase())) {
      labels.push({
        name,
        color: colorMap[name.toLowerCase()] ?? null
      });
    }
  }
  const tagRe = /(?:^|\s)#([a-zA-Z][a-zA-Z0-9_\-\/]*)/g;
  while ((m = tagRe.exec(str)) !== null) {
    const rawTag = m[1].trim();
    const tagDisplay = "#" + rawTag;
    if (rawTag && !labels.some((l) => l.name.toLowerCase() === tagDisplay.toLowerCase() || l.name.toLowerCase() === rawTag.toLowerCase())) {
      const matchedColor = colorMap[rawTag.toLowerCase()] ?? colorMap[tagDisplay.toLowerCase()] ?? null;
      labels.push({
        name: tagDisplay,
        color: matchedColor
      });
    }
  }
  return labels;
}
function parseFootnotes(markdown) {
  if (!markdown || typeof markdown !== "string") return {};
  const footnotes = {};
  const re = /\[\^([^\]]+)\]:\s*([^\n]*(?:\n+(?: {2,4}|\t)[^\n]*)*)/g;
  let m;
  while ((m = re.exec(markdown)) !== null) {
    const fnId = m[1].trim();
    let body = m[2] || "";
    body = body.replace(/^\s*\[[^\]]*\]\([^\)]*\)\s*/, "");
    const lines = body.split("\n").map((l) => l.replace(/^(?: {2,4}|\t)/, "").trim()).filter(Boolean);
    const text = lines.join("\n").trim();
    if (fnId) {
      footnotes[fnId] = text || body.trim();
    }
  }
  return footnotes;
}
function plainPreview(markdown) {
  return String(markdown.replace(/<!--[\s\S]*?-->/g, "").replace(/\[\^[^\]]+\]:\s*[\s\S]*$/g, "").replace(/\[\^[^\]]+\]/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[\[([^\]]*)\]\]/g, "$1").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_~`#>]/g, "").replace(/\s+/g, " ").trim());
}

// anp-15-kanban/lib/api/tagBoard.js
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
    const { columnCards, unsorted, completed = [] } = assignTasksToColumns(headingSpans, lines, tasks, { separateCompleted: true });
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
          level: span.level || null,
          cards: spanCards
        });
        allCards.push(...spanCards);
      }
    } else if (unsorted.length === 0 && (!completed || completed.length === 0)) {
      const noteCards = tasks.map((t) => ({ ...toCardModel(t), noteName: note.name || "Untitled" }));
      sections.push({
        id: "main",
        name: "Tasks",
        cards: noteCards
      });
      allCards.push(...noteCards);
    }
    if (completed && completed.length > 0) {
      const completedCards = completed.map((t) => ({ ...toCardModel(t), noteName: note.name || "Untitled" }));
      sections.push({
        id: "completed",
        name: "Completed",
        cards: completedCards,
        isDoneSection: true,
        isSystemSection: true
      });
      allCards.push(...completedCards);
    }
    const flatCards = sections.flatMap((s) => s.cards || []);
    columns.push({
      id: NOTE_PREFIX + note.uuid,
      name: note.name || "Untitled note",
      noteUUID: note.uuid,
      tags: note.tags || [],
      sections,
      cards: flatCards,
      wipLimit: null
    });
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
async function openTag(app, tag) {
  const clean = String(tag || "").replace(/^#/, "").trim();
  if (!clean) return;
  await app.navigate(`https://www.amplenote.com/notes?tag=${encodeURIComponent(clean)}`);
}

// anp-15-kanban/lib/utils/prompt.js
function firstValue(result) {
  if (result === null || result === void 0) return null;
  return Array.isArray(result) ? result[0] : result;
}

// anp-15-kanban/lib/api/notesBoard.js
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
    const rawTasks = await app.getNoteTasks({ uuid: note.uuid }, { includeDone: false }) || [];
    const tasks = rawTasks.filter((t) => !t.completedAt && !t.completed && !t.dismissedAt);
    try {
      const md = await app.getNoteContent({ uuid: note.uuid });
      if (typeof md === "string") {
        const lines = md.split("\n");
        const taskLines = findTaskLines(lines, tasks);
        detectTaskHierarchy(lines, tasks, taskLines);
        tasks.sort((a, b) => {
          const lineA = taskLines.get(a.uuid || a.id) ?? 0;
          const lineB = taskLines.get(b.uuid || b.id) ?? 0;
          return lineA - lineB;
        });
      } else {
        detectTaskHierarchy([], tasks, /* @__PURE__ */ new Map());
      }
    } catch {
      detectTaskHierarchy([], tasks, /* @__PURE__ */ new Map());
    }
    const cards = tasks.map((t) => ({ ...toCardModel(t), noteName: note.name || "Untitled note" }));
    allCards.push(...cards);
    columns.push({
      id: NOTE_PREFIX + note.uuid,
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

// anp-15-kanban/lib/features/embedActions.js
function createCardStub(taskUuid, content) {
  const card = toCardModel({
    uuid: taskUuid,
    content: content || ""
  });
  card.tags = [];
  card.labels = [];
  return card;
}
async function rerender(app) {
  if (typeof app.context?.renderEmbed === "function") {
    await app.context.renderEmbed();
    return true;
  }
  return false;
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
async function buildSingleBoard(app, tab) {
  if (!tab) return { kind: "note", columns: [], hasHeadings: false };
  if (tab.kind === "note" && tab.noteUUID) {
    return await buildNoteBoard(app, tab.noteUUID, { columnLimits: tab.columnLimits || {} });
  } else if (tab.kind === "tag" && tab.tag) {
    return await buildTagBoard(app, tab.tag);
  } else if (tab.kind === "notes" && tab.tag) {
    return await buildNotesBoard(app, tab.tag);
  }
  return { kind: tab.kind, columns: [], hasHeadings: false };
}
async function handleRefreshTab(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab) {
    if (payload && payload.forceRerender) await rerender(app);
    return { ok: false };
  }
  const board = await buildSingleBoard(app, tab);
  if (payload && payload.forceRerender) await rerender(app);
  return { ok: true, tabId: tab.id, board };
}
async function handleRefreshAll(app, payload) {
  const config = await loadTabsConfig(app);
  const boards = {};
  for (const tab of config.tabs) {
    try {
      boards[tab.id] = await buildSingleBoard(app, tab);
    } catch {
      boards[tab.id] = { kind: tab.kind, columns: [], hasHeadings: false };
    }
  }
  if (payload && payload.forceRerender) await rerender(app);
  return { ok: true, boards, config };
}
function defaultKanbanNoteName(now = /* @__PURE__ */ new Date()) {
  const pad = (n) => (n < 10 ? "0" : "") + n;
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return `Kanban Board - ${dateStr}`;
}
var inFlightAddTab = false;
var inFlightCreateColumnNote = false;
async function handleAddTab(app) {
  if (inFlightAddTab) return;
  inFlightAddTab = true;
  try {
    const choice = firstValue(await app.prompt("Add Board Tab", {
      inputs: [
        {
          label: "Choose board type:",
          type: "radio",
          options: [
            { label: "Existing Note Board (headings as columns)", value: "note" },
            { label: "Create New Note Board (auto-creates note with columns)", value: "new_note" },
            { label: "Tag Board (notes as columns with collapsible heading sections)", value: "tag" },
            { label: "Multi-Note Board (one note per project, flat task cards)", value: "notes" }
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
      if (!noteHandle || !noteHandle.uuid && !noteHandle.id) return;
      const noteUUID = noteHandle.uuid || noteHandle.id;
      tab = createTab({
        kind: "note",
        name: noteHandle.name || "Note board",
        noteUUID
      });
    } else if (choice === "new_note") {
      const titleInput = firstValue(await app.prompt("Create New Note Board", {
        inputs: [
          {
            label: "Board title (optional \u2014 leave blank for timestamped name):",
            type: "text"
          }
        ]
      }));
      if (titleInput === null || titleInput === void 0) return;
      const title = titleInput && String(titleInput).trim() || defaultKanbanNoteName();
      let uuid = null;
      try {
        uuid = await app.createNote(title, ["-reports/-kanban"]);
      } catch (err) {
        console.warn("createNote with '-reports/-kanban' failed, trying fallback:", err);
        try {
          uuid = await app.createNote(title, ["reports/kanban"]);
        } catch {
          try {
            uuid = await app.createNote(title);
          } catch (createErr) {
            console.error("createNote failed completely:", createErr);
            return;
          }
        }
      }
      const cleanUUID = typeof uuid === "object" && uuid !== null ? uuid.uuid || uuid.id : uuid;
      if (!cleanUUID) return;
      try {
        const defaultContent = NEW_NOTE_BOARD_INCLUDES_DONE_HEADER ? "# To Do\n\n# In Progress\n\n# Done\n" : "# To Do\n\n# In Progress\n";
        await app.replaceNoteContent({ uuid: cleanUUID }, defaultContent);
      } catch (err) {
        console.warn("Failed to initialize note content for new board:", err);
      }
      tab = createTab({
        kind: "note",
        name: title,
        noteUUID: cleanUUID
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
    } else if (choice === "notes") {
      const tagVal = firstValue(await app.prompt("Select Tag for Multi-Note Board", {
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
      tab = createTab({ kind: "notes", name: clean, tag: clean });
    } else {
      return;
    }
    const config = addTab(await loadTabsConfig(app), tab);
    await saveTabsConfig(app, config);
    await rerender(app);
  } finally {
    inFlightAddTab = false;
  }
}
async function handleCloseTab(app, payload) {
  const tabId = payload && typeof payload.tabId === "string" ? payload.tabId : null;
  if (!tabId) return;
  const config = removeTab(await loadTabsConfig(app), tabId);
  await saveTabsConfig(app, config);
  return { ok: true, tabId };
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
  if (!fmt || !String(fmt).trim()) return { ok: false, canceled: true };
  const dateFormat = String(fmt).trim();
  await savePluginSettings(app, { dateFormat });
  return { ok: true, dateFormat, toast: "Date format: " + dateFormat };
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
async function resolveCurrentBoardTab(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (tab) return tab;
  const config = await loadTabsConfig(app);
  const targetId = payload?.tabId || config.activeTabId;
  return config.tabs.find((t) => t.id === targetId) || null;
}
async function isCompletedColumn(app, noteUUID, columnId, columnName) {
  const isSystemCompleted = String(columnId || "").toLowerCase() === "completed" || String(columnName || "").trim().toLowerCase() === "completed";
  if (isSystemCompleted) return true;
  if (!AUTO_COMPLETE_ON_DONE_HEADER) return false;
  if (columnName && /^(done|completed|finished|closed|archive)/i.test(String(columnName).trim())) {
    return true;
  }
  if (app && noteUUID) {
    try {
      const markdown = await app.getNoteContent({ uuid: noteUUID });
      const { columns } = buildColumnSpans(markdown);
      const targetSpan = resolveSpan(columns, columnId, columnName);
      if (targetSpan && /^(done|completed|finished|closed|archive)/i.test(String(targetSpan.name).trim())) {
        return true;
      }
    } catch {
    }
  }
  return false;
}
async function handleMoveCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.cardId || !payload.toColumnId) return { ok: false };
  if (tab.kind === "tag" || tab.kind === "notes") {
    const isPrefixed = String(payload.toColumnId).startsWith(NOTE_PREFIX);
    const targetUUID = isPrefixed ? payload.toColumnId.slice(NOTE_PREFIX.length) : String(payload.toColumnId).length > 1 ? payload.toColumnId : null;
    if (!targetUUID) return { ok: false };
    const task = await app.getTask(payload.cardId);
    if (!task) return { ok: false };
    if (task.noteUUID && task.noteUUID !== targetUUID) {
      try {
        await withNoteLock(task.noteUUID, async () => {
          const sourceMarkdown = await app.getNoteContent({ uuid: task.noteUUID });
          if (sourceMarkdown) {
            const srcLines = sourceMarkdown.split("\n");
            const [srcIdx] = findTaskLines(srcLines, [{ uuid: payload.cardId, content: task.content }]).values();
            if (srcIdx !== void 0 && srcIdx >= 0) {
              const nextSrc = removeLine(srcLines, srcIdx);
              await app.replaceNoteContent({ uuid: task.noteUUID }, nextSrc.join("\n"));
            }
          }
        });
      } catch (err) {
        console.error("Failed to remove task from source note:", err);
      }
      try {
        await app.updateTask(payload.cardId, { noteUUID: targetUUID });
      } catch (err) {
        console.error("Failed to update task noteUUID:", err);
      }
      const isDoneSection = String(payload.toSectionId || "").toLowerCase() === "completed" || String(payload.toSectionName || "").trim().toLowerCase() === "completed" || String(payload.toColumnId || "").toLowerCase() === "completed" || String(payload.toColumnName || "").trim().toLowerCase() === "completed" || AUTO_COMPLETE_ON_DONE_HEADER && (/^(done|completed|finished|closed|archive)/i.test(String(payload.toSectionName || "").trim()) || /^(done|completed|finished|closed|archive)/i.test(String(payload.toColumnName || "").trim()));
      if (isDoneSection) {
        await setTaskCompleted(app, payload.cardId, true);
      } else {
        try {
          await moveTaskToColumn(app, targetUUID, payload.cardId, {
            columnId: payload.toSectionId,
            columnName: payload.toSectionName,
            targetCardId: payload.targetCardId,
            position: payload.position
          });
        } catch (err) {
          console.error("Failed to relocate task in target note:", err);
        }
        await setTaskCompleted(app, payload.cardId, false);
      }
      if (payload.forceRerender) await rerender(app);
      return {
        ok: true,
        newCardId: payload.cardId,
        taskCompleted: isDoneSection,
        completedAt: isDoneSection ? Math.floor(Date.now() / 1e3) : null
      };
    } else if (payload.toSectionId || payload.targetCardId) {
      const isDoneSection = String(payload.toSectionId || "").toLowerCase() === "completed" || String(payload.toSectionName || "").trim().toLowerCase() === "completed" || String(payload.toColumnId || "").toLowerCase() === "completed" || String(payload.toColumnName || "").trim().toLowerCase() === "completed" || AUTO_COMPLETE_ON_DONE_HEADER && (/^(done|completed|finished|closed|archive)/i.test(String(payload.toSectionName || "").trim()) || /^(done|completed|finished|closed|archive)/i.test(String(payload.toColumnName || "").trim()));
      if (isDoneSection) {
        await setTaskCompleted(app, payload.cardId, true);
      } else {
        await moveTaskToColumn(app, targetUUID, payload.cardId, {
          columnId: payload.toSectionId,
          columnName: payload.toSectionName,
          targetCardId: payload.targetCardId,
          position: payload.position
        });
        await setTaskCompleted(app, payload.cardId, false);
      }
      if (payload.forceRerender) await rerender(app);
      return {
        ok: true,
        taskCompleted: isDoneSection,
        completedAt: isDoneSection ? Math.floor(Date.now() / 1e3) : null
      };
    }
    if (payload.forceRerender) await rerender(app);
    return { ok: true };
  }
  const doneTarget = await isCompletedColumn(app, tab.noteUUID, payload.toColumnId, payload.toColumnName);
  const status = await moveTaskToColumn(app, tab.noteUUID, payload.cardId, {
    columnId: payload.toColumnId,
    columnName: payload.toColumnName,
    targetCardId: payload.targetCardId,
    position: payload.position
  });
  if (status === "moved") {
    await setTaskCompleted(app, payload.cardId, doneTarget);
  }
  if (payload.forceRerender) {
    await rerender(app);
  }
  return {
    ok: true,
    status,
    taskCompleted: doneTarget,
    completedAt: doneTarget ? Math.floor(Date.now() / 1e3) : null
  };
}
async function handleCreateCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload?.columnId) return { ok: false };
  if (tab.kind === "tag" || tab.kind === "notes") {
    const targetUUID = String(payload.columnId).startsWith(NOTE_PREFIX) ? payload.columnId.slice(NOTE_PREFIX.length) : payload.columnId;
    if (!targetUUID) return { ok: false };
    const content2 = firstValue(await app.prompt("New task", {
      inputs: [{ label: "Task content (markdown):", type: "text" }]
    }));
    if (!content2) return { ok: false, canceled: true };
    const targetSection = payload.sectionId ? { columnId: payload.sectionId, columnName: payload.sectionName } : { columnId: "unsorted", columnName: "Unsorted" };
    const taskUuid2 = await createTaskInColumn(app, targetUUID, targetSection, content2);
    const board2 = await buildSingleBoard(app, tab);
    if (taskUuid2 && board2 && Array.isArray(board2.columns)) {
      const alreadyInBoard = board2.columns.some(
        (col) => (col.cards || []).some((c) => c.id === taskUuid2 || c.uuid === taskUuid2) || (col.sections || []).some((sec) => (sec.cards || []).some((c) => c.id === taskUuid2 || c.uuid === taskUuid2))
      );
      if (!alreadyInBoard) {
        const targetCol = board2.columns.find((c) => c.id === payload.columnId || c.noteUUID === targetUUID) || board2.columns[0];
        if (targetCol) {
          const newCard = createCardStub(taskUuid2, content2);
          if (payload.sectionId && payload.sectionId !== "unsorted" && Array.isArray(targetCol.sections)) {
            const sec = targetCol.sections.find((s) => s.id === payload.sectionId) || targetCol.sections[0];
            if (sec) {
              sec.cards = sec.cards || [];
              sec.cards.unshift(newCard);
            }
          } else if (Array.isArray(targetCol.sections)) {
            let unsortedSec = targetCol.sections.find((s) => s.id === "unsorted");
            if (!unsortedSec) {
              unsortedSec = {
                id: "unsorted",
                name: "Unsorted",
                level: null,
                cards: []
              };
              targetCol.sections.unshift(unsortedSec);
            }
            unsortedSec.cards = unsortedSec.cards || [];
            unsortedSec.cards.unshift(newCard);
          } else {
            targetCol.cards = targetCol.cards || [];
            targetCol.cards.unshift(newCard);
          }
        }
      }
    }
    if (payload && payload.forceRerender) await rerender(app);
    return { ok: true, tabId: tab.id, board: board2, toast: "Task added" };
  }
  const result = await app.prompt("New card", {
    inputs: [{ label: "Card content (markdown):", type: "text" }]
  });
  const content = firstValue(result);
  if (!content) return { ok: false, canceled: true };
  const taskUuid = await createTaskInColumn(app, tab.noteUUID, { columnId: payload.columnId, columnName: payload.columnName }, content);
  const board = await buildSingleBoard(app, tab);
  if (taskUuid && board && Array.isArray(board.columns)) {
    const alreadyInBoard = board.columns.some((col) => (col.cards || []).some((c) => c.id === taskUuid || c.uuid === taskUuid));
    if (!alreadyInBoard) {
      let targetCol = board.columns.find((c) => c.id === payload.columnId || c.name === payload.columnName);
      if (!targetCol && (payload.columnId === "unsorted" || payload.columnName === "Unsorted")) {
        targetCol = {
          id: "unsorted",
          name: "Unsorted",
          level: null,
          cards: []
        };
        board.columns.unshift(targetCol);
      } else if (!targetCol) {
        targetCol = board.columns[0];
      }
      if (targetCol) {
        targetCol.cards = targetCol.cards || [];
        targetCol.cards.unshift(createCardStub(taskUuid, content));
      }
    }
  }
  if (payload && payload.forceRerender) await rerender(app);
  return { ok: true, tabId: tab.id, board, toast: "Task added" };
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
  const isDone = !!(task.completedAt || task.completed || payload?.isCompleted || payload?.completedAt);
  const isDismissed = !!task.dismissedAt;
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
  if (isDone || isDismissed) {
    const result2 = await app.prompt("Completed Task Details", {
      inputs: [
        { label: "Task content (markdown):", type: "text", value: task.content || "" },
        { label: "Relocate under Heading (on reopen):", type: "select", options: sectionOptions },
        {
          label: "Change Status (optional):",
          type: "select",
          options: [
            { label: "-- None (keep status) --", value: "" },
            { label: "Reopen / Mark Active", value: "reopen" },
            { label: isDismissed ? "Un-dismiss task (reopen)" : "Dismiss / Archive", value: "dismiss" }
          ]
        },
        { label: "Important:", type: "checkbox", value: !!task.important },
        { label: "Urgent:", type: "checkbox", value: !!task.urgent }
      ]
    });
    if (!result2) return { ok: false, canceled: true };
    const [content2, targetSection2, statusChoice2, important2, urgent2] = result2;
    const updates2 = {};
    if (content2 !== void 0 && content2 !== task.content) {
      updates2.content = String(content2);
    }
    if (typeof important2 === "boolean" && important2 !== !!task.important) {
      updates2.important = important2;
    }
    if (typeof urgent2 === "boolean" && urgent2 !== !!task.urgent) {
      updates2.urgent = urgent2;
    }
    const now2 = Math.floor(Date.now() / 1e3);
    if (statusChoice2 === "reopen") {
      updates2.completedAt = null;
      updates2.dismissedAt = null;
    } else if (statusChoice2 === "dismiss") {
      updates2.dismissedAt = isDismissed ? null : now2;
      updates2.completedAt = null;
    }
    if (Object.keys(updates2).length > 0) {
      await app.updateTask(cardId, updates2);
    }
    if (statusChoice2 === "reopen" && targetSection2 && targetSection2 !== "__top__") {
      try {
        await moveTaskToColumn(app, task.noteUUID, cardId, { columnName: targetSection2 });
      } catch (err) {
        console.error("Failed to relocate reopened task:", err);
      }
    }
    const tab2 = await resolveCurrentBoardTab(app, payload);
    const board2 = tab2 ? await buildSingleBoard(app, tab2) : null;
    if (payload.forceRerender) await rerender(app);
    return { ok: true, tabId: tab2?.id, board: board2, toast: "Task updated" };
  }
  const result = await app.prompt("Edit Task Details", {
    inputs: [
      { label: "Task content (markdown):", type: "text", value: task.content || "" },
      { label: "Important:", type: "checkbox", value: !!task.important },
      { label: "Urgent:", type: "checkbox", value: !!task.urgent },
      { label: "Move to Note (optional):", type: "note", value: task.noteUUID },
      { label: "Move to Section / Heading:", type: "select", options: sectionOptions },
      { label: "Score:", type: "string", value: task.score !== void 0 && task.score !== null ? String(task.score) : "" },
      {
        label: "Change Status (optional):",
        type: "select",
        options: [
          { label: "-- None (keep status) --", value: "" },
          { label: "Started (startAt now)", value: "started" },
          { label: "Mark as Completed", value: "completed" },
          { label: "Dismiss / Archive", value: "dismissed" }
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
  }
  const targetNoteUUID = targetNote?.uuid || task.noteUUID;
  if (targetNoteUUID && targetNoteUUID !== task.noteUUID) {
    try {
      const sourceMarkdown = await app.getNoteContent({ uuid: task.noteUUID });
      if (sourceMarkdown) {
        const srcLines = sourceMarkdown.split("\n");
        const [srcIdx] = findTaskLines(srcLines, [{ uuid: cardId, content: task.content }]).values();
        if (srcIdx !== void 0 && srcIdx >= 0) {
          const nextSrc = removeLine(srcLines, srcIdx);
          await app.replaceNoteContent({ uuid: task.noteUUID }, nextSrc.join("\n"));
        }
      }
    } catch (err) {
      console.error("Failed to remove task from source note:", err);
    }
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
  } else if (targetNoteUUID && targetNoteUUID !== task.noteUUID) {
    try {
      await moveTaskToColumn(app, targetNoteUUID, cardId, { columnId: "unsorted" });
    } catch (err) {
      console.error("Failed to insert task in target note:", err);
    }
  }
  const tab = await resolveCurrentBoardTab(app, payload);
  const board = tab ? await buildSingleBoard(app, tab) : null;
  return { ok: true, tabId: tab?.id, board, toast: "Task updated" };
}
async function handleEditCard(app, payload) {
  return handleEditTaskDetails(app, payload);
}
async function resolveHeading(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab) return null;
  let noteUUID = payload?.noteUUID || null;
  if (!noteUUID && payload?.columnId && String(payload.columnId).startsWith(NOTE_PREFIX)) {
    noteUUID = payload.columnId.slice(NOTE_PREFIX.length);
  }
  if (!noteUUID && tab.kind === "note" && tab.noteUUID) {
    noteUUID = tab.noteUUID;
  }
  if (!noteUUID) return null;
  const headingId = payload?.sectionId || payload?.columnId;
  if (!headingId) return null;
  let markdown = "";
  try {
    markdown = await app.getNoteContent({ uuid: noteUUID }) || "";
  } catch {
    return null;
  }
  const { columns } = buildColumnSpans(markdown);
  const span = resolveSpan(columns, headingId);
  if (!span) return null;
  return { tab, noteUUID, columnId: span.id, columnName: span.name, span, columns };
}
async function handleCreateColumn(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab) return { ok: false };
  let noteUUID = payload?.noteUUID || null;
  if (!noteUUID && payload?.columnId && String(payload.columnId).startsWith(NOTE_PREFIX)) {
    noteUUID = payload.columnId.slice(NOTE_PREFIX.length);
  }
  if (!noteUUID && tab.kind === "note") {
    noteUUID = tab.noteUUID;
  }
  if (!noteUUID) return { ok: false };
  const result = await app.prompt("New Header / Column", {
    inputs: [
      { label: "Header name:", type: "text" },
      {
        label: "Heading type / level (1, 2, 3):",
        type: "select",
        options: [
          { label: "H1 (# Large)", value: "1" },
          { label: "H2 (## Medium)", value: "2" },
          { label: "H3 (### Small)", value: "3" }
        ],
        value: "2"
      }
    ]
  });
  if (!result) return { ok: false, canceled: true };
  const [name, levelRaw] = Array.isArray(result) ? result : [result, null];
  if (!name || !String(name).trim()) return { ok: false, canceled: true };
  const level = levelRaw ? parseInt(String(levelRaw), 10) || null : null;
  const created = await createColumn(app, noteUUID, String(name).trim(), level);
  if (created) {
    const board = await buildSingleBoard(app, tab);
    return { ok: true, tabId: tab.id, board, toast: "Header created", showEmpty: true };
  }
  return { ok: false, error: "Could not create header" };
}
function normalizeTagList(tagsInput, defaultTag = "") {
  if (Array.isArray(tagsInput)) {
    const list = tagsInput.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") return item.value || item.name || item.label || item.tag || "";
      return "";
    }).map((t) => String(t || "").replace(/^#/, "").trim()).filter(Boolean);
    return list.length ? list.slice(0, 10) : defaultTag ? [defaultTag.replace(/^#/, "").trim()] : [];
  }
  if (typeof tagsInput === "string") {
    const list = tagsInput.split(/[,;\s]+/).map((t) => t.replace(/^#/, "").trim()).filter(Boolean);
    return list.length ? list.slice(0, 10) : defaultTag ? [defaultTag.replace(/^#/, "").trim()] : [];
  }
  return defaultTag ? [defaultTag.replace(/^#/, "").trim()] : [];
}
async function handleCreateColumnNote(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab) return;
  const defaultTag = tab.tag ? tab.tag : "";
  const tagLabel = defaultTag ? `#${defaultTag}` : "new note";
  const result = await app.prompt(`Create New Note in ${tagLabel}`, {
    inputs: [
      { label: "Note title:", type: "text" },
      {
        label: "Tag(s) to assign:",
        type: "tags",
        value: defaultTag,
        limit: 10
      }
    ]
  });
  if (!result) return;
  const [title, tagsRaw] = Array.isArray(result) ? result : [result, defaultTag];
  if (!title || !String(title).trim()) return;
  const tags = normalizeTagList(tagsRaw, defaultTag);
  const noteUUID = await createTaggedNote(app, String(title).trim(), tags);
  if (noteUUID) {
    const board = await buildSingleBoard(app, tab);
    return { ok: true, tabId: tab.id, board, toast: "Note created" };
  }
}
async function handleRenameColumn(app, payload) {
  const resolved = await resolveHeading(app, payload);
  if (!resolved) return;
  const { tab, noteUUID, columnId, columnName } = resolved;
  const result = await app.prompt("Rename Column / Header", {
    inputs: [{ label: "Name:", type: "text", value: columnName }]
  });
  const name = firstValue(result);
  if (!name || !String(name).trim() || String(name) === columnName) return;
  const renamed = await renameColumn(app, noteUUID, columnId, name);
  if (renamed) {
    const board = await buildSingleBoard(app, tab);
    return { ok: true, tabId: tab.id, board, toast: "Column renamed" };
  }
}
async function handleDeleteColumn(app, payload) {
  const resolved = await resolveHeading(app, payload);
  if (!resolved) return;
  const { tab, noteUUID, columnId, columnName } = resolved;
  const result = await app.prompt(`Delete "${columnName}"?`, {
    inputs: [
      {
        label: "I understand: the heading is removed and its tasks move to the previous header.",
        type: "checkbox",
        value: false
      }
    ]
  });
  if (firstValue(result) !== true) return;
  const deleted = await deleteColumn(app, noteUUID, columnId);
  if (deleted) {
    const board = await buildSingleBoard(app, tab);
    return { ok: true, tabId: tab.id, board, toast: "Column deleted" };
  }
}
async function handleMoveColumn(app, payload) {
  const resolved = await resolveHeading(app, payload);
  if (!resolved) return;
  const { noteUUID, columnId, columns } = resolved;
  const direction = payload.direction === "left" || payload.direction === "up" ? "left" : "right";
  const index = columns.findIndex((c) => c.id === String(columnId));
  if (index === -1) return;
  const target = direction === "left" ? index - 1 : index + 1;
  if (target < 0 || target >= columns.length) return;
  const order = columns.map((c) => c.id);
  [order[index], order[target]] = [order[target], order[index]];
  const moved = await reorderColumns(app, noteUUID, order);
  if (moved) {
    const board = await buildSingleBoard(app, resolved.tab);
    return { ok: true, board, tabId: resolved.tab.id };
  }
}
async function handleSetWipLimit(app, payload) {
  const resolved = await resolveHeading(app, payload);
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
  const board = await buildSingleBoard(app, storedTab);
  return { ok: true, tabId: tab.id, board, columnLimits: limits };
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
function linkNoteInTaskContent(content, noteName, noteUUID) {
  if (!noteUUID) return content || "";
  const name = String(noteName || "Note").trim();
  const noteLink = `[${name}](https://www.amplenote.com/notes/${noteUUID})`;
  const text = String(content || "").trim();
  if (text.includes(`https://www.amplenote.com/notes/${noteUUID}`)) {
    return text;
  }
  return text ? `${text} ${noteLink}` : noteLink;
}
async function handleCardMenu(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;
  const task = await app.getTask(cardId);
  if (!task) return;
  const isDone = !!(task.completedAt || task.completed || payload?.isCompleted || payload?.completedAt);
  const isDismissed = !!task.dismissedAt;
  const options = isDone || isDismissed ? [
    { label: "Reopen task (mark active)", value: "uncomplete" },
    { label: isDismissed ? "Un-dismiss task (reopen)" : "Dismiss / Archive task", value: "dismiss" },
    { label: "Edit task details (full dialog)", value: "edit_details" },
    { label: "Add note link", value: "link_note" },
    { label: "Create note from card", value: "note" }
  ] : [
    { label: "Mark as completed", value: "complete" },
    { label: "Edit task details (full dialog)", value: "edit_details" },
    { label: "Set start date / time", value: "date" },
    { label: "Snooze / Hide Until (set date)", value: "snooze" },
    { label: "Schedule Time Block (start & end time)", value: "timeblock" },
    { label: "Add note link", value: "link_note" },
    { label: "Create note from card", value: "note" }
  ];
  const choice = firstValue(await app.prompt(isDone || isDismissed ? "Completed Card Actions" : "Card Actions", {
    inputs: [{
      label: "Choose action:",
      type: "radio",
      options
    }]
  }));
  if (!choice) return;
  if (choice === "complete") {
    await app.updateTask(cardId, { completedAt: Math.floor(Date.now() / 1e3), dismissedAt: null });
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: "Task completed" };
  }
  if (choice === "uncomplete") {
    await app.updateTask(cardId, { completedAt: null, dismissedAt: null });
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: "Task reopened" };
  }
  if (choice === "dismiss") {
    await app.updateTask(cardId, { dismissedAt: isDismissed ? null : Math.floor(Date.now() / 1e3), completedAt: null });
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: isDismissed ? "Task reopened" : "Task dismissed" };
  }
  if (choice === "edit_details") {
    return await handleEditTaskDetails(app, {
      cardId,
      tabId: payload?.tabId,
      isCompleted: isDone,
      completedAt: task.completedAt || payload?.completedAt
    });
  }
  if (choice === "link_note" || choice === "label") {
    const handle = firstValue(await app.prompt("Add Note Link", {
      inputs: [{ label: "Pick a note to link:", type: "note" }]
    }));
    if (!handle) return;
    const noteUUID = handle.uuid || handle.value || (typeof handle === "string" ? handle : null);
    const noteName = handle.name || handle.label || "Note";
    if (!noteUUID) return;
    const currentContent = String(task.content || "").trim();
    const newContent = linkNoteInTaskContent(currentContent, noteName, noteUUID);
    if (newContent !== currentContent) {
      await app.updateTask(cardId, { content: newContent });
    }
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: "Note link added" };
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
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: "Date updated" };
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
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: "Task snoozed" };
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
    const tab = await resolveCurrentBoardTab(app, payload);
    const board = tab ? await buildSingleBoard(app, tab) : null;
    return { ok: true, tabId: tab?.id, board, toast: "Timeblock scheduled" };
  }
  if (choice === "note") {
    if (inFlightCreateColumnNote) return;
    inFlightCreateColumnNote = true;
    try {
      const defaultTitle = String(task.content || "").replace(/\[\[[^\]]+\]\]/g, "").replace(/\[[^\]]+\]\([^)]+\)/g, "").replace(/\s+/g, " ").trim().slice(0, 80) || "Note from card";
      const promptRes = await app.prompt("Create Note from Card", {
        inputs: [
          { label: "Note Title:", type: "text", value: defaultTitle }
        ]
      });
      const title = firstValue(promptRes) || defaultTitle;
      if (!title || !title.trim()) return;
      const uuid = await app.createNote(title.trim(), []);
      if (!uuid) return;
      const noteLink = `[${title.trim()}](https://www.amplenote.com/notes/${uuid})`;
      await app.updateTask(cardId, { content: noteLink });
      const tab = await resolveCurrentBoardTab(app, payload);
      const board = tab ? await buildSingleBoard(app, tab) : null;
      return { ok: true, tabId: tab?.id, board, toast: "Note created from card" };
    } finally {
      inFlightCreateColumnNote = false;
    }
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
    const board = await buildSingleBoard(app, tab);
    return { ok: true, tabId: tab.id, board };
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
  const resolved = await resolveHeading(app, payload);
  if (!resolved) return;
  const { tab, noteUUID, columnId, columnName } = resolved;
  const config = await loadTabsConfig(app);
  let options = [];
  if (tab.kind === "tag" || tab.kind === "notes") {
    const tagNotes = await app.filterNotes({ tag: tab.tag }) || [];
    options = tagNotes.filter((n) => n.uuid !== noteUUID).map((n) => ({ label: n.name || "Untitled note", value: n.uuid }));
  } else {
    options = config.tabs.filter((t) => t.kind === "note" && t.noteUUID && t.id !== tab.id).map((t) => ({ label: t.name, value: t.id }));
  }
  if (!options.length) {
    await app.alert("No other notes or note-board tabs to move this header to.");
    return;
  }
  const picked = firstValue(await app.prompt(`Move "${columnName}" to another board`, {
    inputs: [{
      label: "Target tab / note:",
      type: "select",
      options
    }]
  }));
  if (!picked) return;
  const targetTab = tabById(config, picked);
  const targetUUID = targetTab && targetTab.noteUUID ? targetTab.noteUUID : picked;
  if (!targetUUID) return;
  const confirmed = firstValue(await app.prompt(`Move "${columnName}" to selected destination?`, {
    inputs: [{
      label: "I understand: the heading and its tasks move to the other note.",
      type: "checkbox",
      value: false
    }]
  }));
  if (confirmed !== true) return;
  const status = await transferColumn(app, noteUUID, columnId, targetUUID);
  if (status === "moved") {
    const board = await buildSingleBoard(app, tab);
    return { ok: true, tabId: tab.id, board, toast: "Column moved" };
  }
}
async function handleRenameNote(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.columnId) return { ok: false };
  const noteUUID = String(payload.columnId).startsWith(NOTE_PREFIX) ? payload.columnId.slice(NOTE_PREFIX.length) : payload.columnId;
  if (!noteUUID) return { ok: false };
  const note = await app.notes.find(noteUUID);
  const current = note?.name || "";
  const name = firstValue(await app.prompt("Rename note", {
    inputs: [{ label: "Note name:", type: "text", value: current }]
  }));
  if (!name || !String(name).trim() || String(name) === current) return { ok: false };
  await app.setNoteName({ uuid: noteUUID }, String(name).trim());
  const board = await buildSingleBoard(app, tab);
  return { ok: true, tabId: tab.id, board, toast: "Note renamed" };
}
async function handleDeleteNote(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab) return { ok: false };
  const noteUUID = payload?.noteUUID || (String(payload?.columnId).startsWith(NOTE_PREFIX) ? payload.columnId.slice(NOTE_PREFIX.length) : payload?.columnId);
  if (!noteUUID) return { ok: false };
  let noteName = payload?.noteName;
  if (!noteName) {
    try {
      const note = await app.notes.find(noteUUID);
      noteName = note?.name || "this note";
    } catch {
      noteName = "this note";
    }
  }
  const result = await app.prompt(`Delete note "${noteName}"?`, {
    inputs: [
      {
        label: "I understand: this note will be moved to Amplenote Trash (restorable for 30 days).",
        type: "checkbox",
        value: false
      }
    ]
  });
  if (firstValue(result) !== true) return { ok: false };
  try {
    await app.deleteNote({ uuid: noteUUID });
  } catch (err) {
    console.error("Failed to delete note:", err);
    return { ok: false, error: err?.message || "Failed to delete note" };
  }
  const board = await buildSingleBoard(app, tab);
  return { ok: true, tabId: tab.id, board };
}
async function handleReorderTabs(app, payload) {
  const { fromIndex, toIndex } = payload || {};
  if (typeof fromIndex !== "number" || typeof toIndex !== "number") return;
  const config = await loadTabsConfig(app);
  const updated = moveTab(config, fromIndex, toIndex);
  await saveTabsConfig(app, updated);
}
async function handleReorderColumns(app, payload) {
  const { tabId, columnIds, columnNames } = payload || {};
  if (!tabId || !Array.isArray(columnIds) || !columnIds.length) return;
  const config = await loadTabsConfig(app);
  const tab = tabById(config, tabId);
  if (!tab) return;
  const noteUUID = payload?.noteUUID || (tab.kind === "note" ? tab.noteUUID : null);
  if (!noteUUID) return;
  const cleanIds = columnIds.filter((id) => id !== "unsorted" && id !== "completed" && id !== "main");
  const ok = await reorderColumns(app, noteUUID, cleanIds, columnNames);
  if (ok) {
    const board = await buildSingleBoard(app, tab);
    return { ok: true, board, tabId };
  }
}
async function handleQuickSetDate(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return { ok: false };
  const task = await app.getTask(cardId);
  if (!task) return { ok: false };
  const currentVal = typeof task.startAt === "number" && task.startAt > 0 ? Math.floor(task.startAt) : null;
  const currentTime = formatLocalTimeStr(task.startAt);
  const result = await app.prompt("Set Task Date & Time (@)", {
    inputs: [
      { label: "Scheduled date (leave blank to clear):", type: "date", value: currentVal },
      { label: "Scheduled time (optional, e.g. 14:30 or 2:30 PM):", type: "string", value: currentTime, placeholder: "HH:MM" }
    ]
  });
  if (result === null || result === void 0) return { ok: false, canceled: true };
  const [dateRaw, timeRaw] = Array.isArray(result) ? result : [result, ""];
  const startAt = combineDateAndTime(dateRaw, timeRaw);
  await app.updateTask(cardId, { startAt });
  const tab = await resolveCurrentBoardTab(app, payload);
  const board = tab ? await buildSingleBoard(app, tab) : null;
  return { ok: true, tabId: tab?.id, board, toast: startAt ? "Date updated" : "Date cleared" };
}
async function handleOpenTag(app, payload) {
  const tag = payload?.tag;
  if (!tag) return;
  await openTag(app, tag);
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
  openTag: handleOpenTag,
  addTab: handleAddTab,
  closeTab: handleCloseTab,
  moveTabDir: handleMoveTabDir,
  reorderTabs: handleReorderTabs,
  setDateFormat: handleSetDateFormat,
  createColumn: handleCreateColumn,
  createSection: handleCreateColumn,
  createColumnNote: handleCreateColumnNote,
  createNote: handleCreateColumnNote,
  renameColumn: handleRenameColumn,
  renameSection: handleRenameColumn,
  deleteColumn: handleDeleteColumn,
  deleteSection: handleDeleteColumn,
  moveColumn: handleMoveColumn,
  moveSection: handleMoveColumn,
  reorderColumns: handleReorderColumns,
  saveColumnsToNote: handleReorderColumns,
  setWipLimit: handleSetWipLimit,
  cardMenu: handleCardMenu,
  quickSetDate: handleQuickSetDate,
  saveSortToNote: handleSaveSortToNote,
  globalSearch: handleGlobalSearch,
  moveColumnToTab: handleMoveColumnToTab,
  moveSectionToNote: handleMoveColumnToTab,
  renameNote: handleRenameNote,
  deleteNote: handleDeleteNote
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
    try {
      const viewState = await this.buildViewState(app);
      const html = buildBoardHtml(withDemoContent(viewState));
      return typeof html === "string" ? html : "<!DOCTYPE html><html><body>Error rendering board</body></html>";
    } catch (error) {
      console.error("renderEmbed failed:", error);
      try {
        return buildBoardHtml(withDemoContent({
          version: 1,
          activeTabId: null,
          tabs: [],
          boards: {},
          settings: {},
          meta: { roundTrips: 0 }
        }));
      } catch (fallbackError) {
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kanban Board</title></head><body style="font-family:sans-serif;padding:24px;color:#fff;background:#1e1e1e;"><h3>Kanban Board Loading Error</h3><p>${escapeHtml(error?.message || "An unexpected error occurred.")}</p></body></html>`;
      }
    }
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