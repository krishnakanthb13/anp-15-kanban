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

  var KIND_ICONS = { note: "\\uD83D\\uDFE4", tag: "\\uD83C\\uDFF7", notes: "\\uD83D\\uDCDD" };

  function renderTabs() {
    var host = document.getElementById("kb-tabs");
    if (!host) return;
    host.innerHTML = "";
    var tabs = STATE.tabs || [];
    var act = activeTab();
    tabs.forEach(function (tab) {
      var chip = el("div", "kb-tab" + (act && tab.id === act.id ? " kb-tab-active" : ""));
      chip.title = tab.name + " (" + tab.kind + " board)";
      chip.appendChild(el("span", "kb-tab-icon", KIND_ICONS[tab.kind] || "?"));
      chip.appendChild(el("span", "kb-tab-name", tab.name));

      var activate = function () {
        callPlugin("setActiveTab", { tabId: tab.id });
      };
      chip.addEventListener("click", activate);

      var tools = el("span", "kb-tab-tools");
      addTabTool(tools, "\\u2190", "Move tab left", function (e) {
        e.stopPropagation();
        callPlugin("moveTabDir", { tabId: tab.id, direction: "left" });
      });
      addTabTool(tools, "\\u2192", "Move tab right", function (e) {
        e.stopPropagation();
        callPlugin("moveTabDir", { tabId: tab.id, direction: "right" });
      });
      addTabTool(tools, "\\u2715", "Close tab", function (e) {
        e.stopPropagation();
        callPlugin("closeTab", { tabId: tab.id });
      });
      chip.appendChild(tools);
      host.appendChild(chip);
    });

    var addBtn = el("button", "kb-tab-add", "+ New tab");
    addBtn.type = "button";
    addBtn.title = "Add a note or tag board";
    addBtn.addEventListener("click", function () {
      callPlugin("addTab");
    });
    host.appendChild(addBtn);
  }

  function addTabTool(host, glyph, title, onClick) {
    var btn = el("button", "kb-tab-tool", glyph);
    btn.type = "button";
    btn.title = title;
    btn.addEventListener("click", onClick);
    host.appendChild(btn);
  }

  var searchQuery = "";

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

    var anyVisible = false;
    columns.forEach(function (col, colIndex) {
      var isLast = colIndex === columns.length - 1;
      var isTagBoard = data.kind === "tag";
      var isNotesBoard = data.kind === "notes";

      // Client-side search filter: hide non-matching cards and emptied columns.
      var visibleCards = (col.cards || []).filter(function (card) {
        if (!searchQuery) return true;
        var hay = ((card.title || "") + " " + (card.content || "") + " " +
          (card.tags || []).join(" ") + " " +
          (card.labels || []).map(function (l) { return l.name; }).join(" ")).toLowerCase();
        return hay.indexOf(searchQuery) !== -1;
      });
      if (searchQuery && !visibleCards.length) return; // skip emptied column
      anyVisible = anyVisible || visibleCards.length > 0;

      var colEl = el("section", "kb-column" + (isLast && data.kind === "note" ? " kb-column-last" : ""));
      colEl.setAttribute("data-column-id", col.id);

      var head = el("header", "kb-column-head");
      var titleWrap = el("div", "kb-col-titlewrap");
      if (isTagBoard) {
        titleWrap.appendChild(el("h3", "kb-column-title", col.name));
        if (col.color) {
          var dot = el("span", "kb-col-dot");
          dot.style.background = "#" + String(col.color).replace("#", "");
          dot.title = "Tag color";
          titleWrap.appendChild(dot);
        }
      } else {
        titleWrap.appendChild(el("h3", "kb-column-title", col.name));
      }
      head.appendChild(titleWrap);

      // Count chip doubles as the WIP-limit control on note boards; turns red past the limit.
      var over = data.kind === "note" && col.wipLimit && visibleCards.length > col.wipLimit;
      var count = el("span", "kb-count" + (over ? " kb-over" : ""),
        over ? visibleCards.length + " / " + col.wipLimit : String(visibleCards.length));
      if (data.kind === "note") {
        count.title = "Set WIP limit";
        count.addEventListener("click", function () {
          callPlugin("setWipLimit", { tabId: STATE.activeTabId, columnId: col.id });
        });
      }
      head.appendChild(count);
      colEl.appendChild(head);

      if (data.kind === "note") {
        var tools = el("div", "kb-col-tools");
        addTool(tools, "\\u2190", "Move column left", function () {
          callPlugin("moveColumn", { tabId: STATE.activeTabId, columnId: col.id, direction: "left" });
        });
        addTool(tools, "\\u2192", "Move column right", function () {
          callPlugin("moveColumn", { tabId: STATE.activeTabId, columnId: col.id, direction: "right" });
        });
        addTool(tools, "\\u270E", "Rename column", function () {
          callPlugin("renameColumn", { tabId: STATE.activeTabId, columnId: col.id });
        });
        addTool(tools, "\\u21E5", "Move column to another board tab", function () {
          callPlugin("moveColumnToTab", { tabId: STATE.activeTabId, columnId: col.id });
        });
        addTool(tools, "\\u2715", "Delete column (tasks move to top)", function () {
          callPlugin("deleteColumn", { tabId: STATE.activeTabId, columnId: col.id });
        });
        head.appendChild(tools);
      } else if (isNotesBoard) {
        var ntools = el("div", "kb-col-tools");
        addTool(ntools, "\\u270E", "Rename note", function () {
          callPlugin("renameNote", { tabId: STATE.activeTabId, columnId: col.id });
        });
        head.appendChild(ntools);
      }

      var addBtn = el("button", "kb-add-card", "+");
      addBtn.type = "button";
      addBtn.title = isTagBoard ? "New note in " + col.name : "Add card to " + col.name;
      addBtn.addEventListener("click", function () {
        callPlugin("createCard", { tabId: STATE.activeTabId, columnId: col.id });
      });
      head.appendChild(addBtn);

      var list = el("div", "kb-cards");
      wireDropZone(list, col, isTagBoard);
      visibleCards.forEach(function (card) {
        list.appendChild(buildCardEl(card, isTagBoard));
      });
      colEl.appendChild(list);
      board.appendChild(colEl);
    });

    if (searchQuery && !anyVisible) {
      board.appendChild(el("div", "kb-empty", "No cards match \\u201C" + searchQuery + "\\u201D."));
    }
  }

  function addTool(host, glyph, title, onClick) {
    var btn = el("button", "kb-col-btn", glyph);
    btn.type = "button";
    btn.title = title;
    btn.addEventListener("click", onClick);
    host.appendChild(btn);
  }

  /* ---------------- drag & drop ---------------- */

  var dragCardId = null;

  function buildCardEl(card, isTagBoard) {
    var cardEl = el("article", "kb-card" + (card.completedAt ? " kb-card-done" : ""));
    cardEl.setAttribute("data-card-id", card.id);
    cardEl.setAttribute("draggable", "true");

    // Rich body: Amplenote's own editor markup (functional Rich Footnotes,
    // links, formatting). Falls back to the plain-text preview.
    if (card.html) {
      var body = el("div", "kb-card-body");
      body.innerHTML = card.html;
      cardEl.appendChild(body);
    } else {
      cardEl.appendChild(el("div", "kb-card-title", card.title));
    }

    if (isTagBoard && card.tags && card.tags.length) {
      var chips = el("div", "kb-card-tags");
      card.tags.forEach(function (t) {
        chips.appendChild(el("span", "kb-tag-chip", t));
      });
      cardEl.appendChild(chips);
    }

    if (!isTagBoard && card.labels && card.labels.length) {
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

    // "More" menu button (note boards): label / start date / create note.
    if (!isTagBoard) {
      var more = el("button", "kb-card-menu", "\\u22EF");
      more.type = "button";
      more.title = "Label, start date, or create note";
      more.addEventListener("click", function (e) {
        e.stopPropagation();
        callPlugin("cardMenu", { cardId: card.id });
      });
      cardEl.appendChild(more);
    }

    if (card.imageUrl) {
      var img = document.createElement("img");
      img.className = "kb-card-img";
      img.loading = "lazy";
      img.src = card.imageUrl;
      img.alt = "";
      cardEl.appendChild(img);
    }

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

    // Click behavior by board kind: tag-board cards open their note;
    // note-board cards open the raw-markdown editor (links stay native).
    cardEl.addEventListener("click", function (e) {
      if (dragCardId) return;
      if (e.target && e.target.closest && e.target.closest("a")) return;
      if (isTagBoard) callPlugin("openCard", { cardId: card.id });
      else callPlugin("editCard", { cardId: card.id });
    });

    return cardEl;
  }

  function wireDropZone(listEl, col, isTagBoard) {
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
        if (!isTagBoard && listEl.closest(".kb-column-last")) cardEl.classList.add("kb-card-done");
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
    // NOTE: this script ships inside a template literal, so it must never
    // contain backslash escapes or embedded double quotes \u2014 both get
    // corrupted in transit. String.fromCharCode keeps this escape-free.
    var BS = String.fromCharCode(92);
    var DQ = String.fromCharCode(34);
    var s = String(value);
    s = s.split(BS).join(BS + BS);
    s = s.split(DQ).join(BS + DQ);
    return s;
  }

  function formatStamp(unixSeconds) {
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
        <input id="kb-search" class="kb-search" type="search" placeholder="Filter board (Enter = all notes)" spellcheck="false">
        <button id="kb-datefmt-btn" class="kb-btn" type="button" title="Date format for card chips">
            \u{1F4C5} <span id="kb-datefmt-label"></span>
        </button>
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
  if (kind !== "note" && kind !== "tag") {
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

// anp-15-kanban/lib/api/tagBoard.js
var NOSUB_ID = "nosub";
var SUB_PREFIX = "sub:";
function immediateSubTags(baseTag, tags) {
  const prefix = `${baseTag}/`;
  return (tags || []).filter((t) => typeof t?.text === "string" && t.text.startsWith(prefix)).filter((t) => !t.text.slice(prefix.length).includes("/")).map((t) => ({ text: t.text, color: t.color || null }));
}
function columnForNote(baseTag, subTags, noteTags) {
  const set = new Set(noteTags || []);
  const hit = subTags.find((st) => set.has(st.text));
  return hit ? SUB_PREFIX + hit.text : NOSUB_ID;
}
async function buildTagBoard(app, tag) {
  if (!tag) {
    return { kind: "tag", tag, columns: [], hasHeadings: false };
  }
  const [allTags, notes] = await Promise.all([
    app.getTags() || [],
    app.filterNotes({ tag }) || []
  ]);
  const subs = immediateSubTags(tag, allTags);
  const byId = /* @__PURE__ */ new Map();
  const makeColumn = (id, name, color) => {
    const col = { id, name, color, wipLimit: null, cards: [] };
    byId.set(id, col);
    return col;
  };
  subs.forEach((st) => makeColumn(SUB_PREFIX + st.text, st.text.slice(tag.length + 1), st.color));
  makeColumn(NOSUB_ID, "No sub-tag", null);
  for (const note of notes) {
    const col = byId.get(columnForNote(tag, subs, note.tags)) || byId.get(NOSUB_ID);
    col.cards.push(toNoteCard(note));
  }
  const columns = [...byId.values()];
  return {
    kind: "tag",
    tag,
    columns,
    hasHeadings: true
  };
}
function toNoteCard(note) {
  return {
    id: note.uuid,
    title: note.name || "Untitled note",
    tags: note.tags || [],
    completedAt: null,
    startAt: null,
    deadline: null,
    imageUrl: null,
    html: null,
    isNoteCard: true
  };
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
    deadline: task.deadline ?? null,
    important: !!task.important,
    urgent: !!task.urgent
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

// anp-15-kanban/lib/api/notesBoard.js
var NOTE_PREFIX = "note:";
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

// anp-15-kanban/lib/api/noteOps.js
async function retagNote(app, noteUUID, { fromSub, toSub }) {
  const handle = { uuid: noteUUID };
  let changed = false;
  if (fromSub && fromSub !== toSub) {
    await app.removeNoteTag(handle, fromSub);
    changed = true;
  }
  if (toSub && toSub !== fromSub) {
    await app.addNoteTag(handle, toSub);
    changed = true;
  }
  return changed;
}
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
async function handleAddTab(app) {
  const result = await app.prompt("Add board tab", {
    inputs: [
      {
        label: "Board type:",
        type: "radio",
        options: [
          { label: "Note board (headings as columns)", value: "note" },
          { label: "Tag board (sub-tags as columns)", value: "tag" }
        ]
      },
      { label: "Note to board (for note boards):", type: "note" },
      { label: "Tag to board (for tag boards):", type: "tags", limit: 1 }
    ]
  });
  if (!result) return;
  const [kind, noteHandle, tagValue] = result;
  const tagText = Array.isArray(tagValue) ? tagValue[0] : tagValue;
  let tab = null;
  if (kind === "note") {
    if (!noteHandle || !noteHandle.uuid) return;
    tab = createTab({
      kind: "note",
      name: noteHandle.name || "Note board",
      noteUUID: noteHandle.uuid
    });
  } else if (kind === "tag") {
    if (!tagText || !String(tagText).trim()) return;
    const clean = String(tagText).trim();
    tab = createTab({ kind: "tag", name: clean.split("/").pop(), tag: clean });
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
  const config = await loadTabsConfig(app);
  const result = await app.prompt("Date format for card chips", {
    inputs: [{
      label: "Format tokens: YYYY MM DD MMM (e.g. DD MMM YYYY):",
      type: "text",
      value: config.settings.dateFormat
    }]
  });
  const fmt = firstValue(result);
  if (!fmt || !String(fmt).trim()) return;
  config.settings.dateFormat = String(fmt).trim();
  await saveTabsConfig(app, config);
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
  if (tab.kind === "tag") {
    await moveNoteCard(app, tab, payload.cardId, payload.toColumnId);
    return;
  }
  if (tab.kind === "notes") {
    await moveTaskToNote(app, tab, payload.cardId, payload.toColumnId);
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
async function moveTaskToNote(app, tab, taskUuid, toColumnId) {
  const targetUUID = String(toColumnId).startsWith(NOTE_PREFIX) ? toColumnId.slice(NOTE_PREFIX.length) : null;
  if (!targetUUID) return;
  const board = await buildNotesBoard(app, tab.tag);
  const fromCol = board.columns.find((c) => c.cards.some((card) => card.id === taskUuid));
  if (fromCol && fromCol.id === String(toColumnId)) return;
  await app.updateTask(taskUuid, { noteUUID: targetUUID });
  await rerender(app);
}
async function moveNoteCard(app, tab, noteUUID, toColumnId) {
  const board = await buildTagBoard(app, tab.tag);
  const fromCol = board.columns.find((c) => c.cards.some((card) => card.id === noteUUID));
  const fromSub = fromCol && fromCol.id.startsWith(SUB_PREFIX) ? fromCol.id.slice(SUB_PREFIX.length) : null;
  const toSub = toColumnId.startsWith(SUB_PREFIX) ? toColumnId.slice(SUB_PREFIX.length) : null;
  const sameColumn = fromCol && fromCol.id === String(toColumnId) || !fromCol && toColumnId === NOSUB_ID;
  if (sameColumn) return;
  await retagNote(app, noteUUID, { fromSub, toSub });
  await rerender(app);
}
async function handleCreateCard(app, payload) {
  const tab = await resolveNoteTab(app, payload);
  if (!tab || !payload.columnId) return;
  if (tab.kind === "notes") {
    const targetUUID = String(payload.columnId).startsWith(NOTE_PREFIX) ? payload.columnId.slice(NOTE_PREFIX.length) : null;
    if (!targetUUID) return;
    const content2 = firstValue(await app.prompt("New task", {
      inputs: [{ label: "Task content (markdown):", type: "text" }]
    }));
    if (!content2) return;
    await app.insertTask({ uuid: targetUUID }, { content: content2 });
    await rerender(app);
    return;
  }
  if (tab.kind === "tag") {
    const result2 = await app.prompt("New note in column", {
      inputs: [{ label: "Note name:", type: "text" }]
    });
    const name = firstValue(result2);
    if (!name || !String(name).trim()) return;
    const toSub = String(payload.columnId).startsWith(SUB_PREFIX) ? payload.columnId.slice(SUB_PREFIX.length) : null;
    await createTaggedNote(app, name, toSub ? [toSub] : [tab.tag]);
    await rerender(app);
    return;
  }
  const result = await app.prompt("New card", {
    inputs: [{ label: "Card content (markdown):", type: "text" }]
  });
  const content = firstValue(result);
  if (!content) return;
  await createTaskInColumn(app, tab.noteUUID, { columnId: payload.columnId }, content);
  await rerender(app);
}
async function handleOpenCard(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;
  await openNote(app, cardId);
}
async function handleEditCard(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;
  const task = await app.getTask(cardId);
  if (!task) return;
  const result = await app.prompt("Edit card (raw markdown)", {
    inputs: [{ label: "Content:", type: "text", value: task.content || "" }]
  });
  const content = firstValue(result);
  if (content === null || content === void 0 || content === task.content) return;
  await updateCardContent(app, cardId, content);
  await rerender(app);
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
async function handleCardMenu(app, payload) {
  const cardId = payload && typeof payload.cardId === "string" ? payload.cardId : null;
  if (!cardId) return;
  const task = await app.getTask(cardId);
  if (!task) return;
  const choice = firstValue(await app.prompt("Card actions", {
    inputs: [{
      label: "What do you want to do?",
      type: "radio",
      options: [
        { label: "Add label (note link)", value: "label" },
        { label: "Set start date", value: "date" },
        { label: "Create note from card", value: "note" }
      ]
    }]
  }));
  if (!choice) return;
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
    const value = firstValue(await app.prompt("Set start date", {
      inputs: [{ label: "Start date (blank clears):", type: "date" }]
    }));
    if (value === null || value === void 0) return;
    const trimmed = String(value).trim();
    const startAt = trimmed ? Math.floor(new Date(trimmed).getTime() / 1e3) : null;
    if (trimmed && Number.isNaN(startAt)) return;
    await app.updateTask(cardId, { startAt });
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
  if (!tab || tab.kind !== "notes" || !payload.columnId) return;
  const noteUUID = String(payload.columnId).startsWith(NOTE_PREFIX) ? payload.columnId.slice(NOTE_PREFIX.length) : null;
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
var ACTIONS = {
  ping: handlePing,
  saveTheme: handleSaveTheme,
  setActiveTab: handleSetActiveTab,
  refreshTab: handleRefreshTab,
  refreshAll: handleRefreshAll,
  moveCard: handleMoveCard,
  createCard: handleCreateCard,
  editCard: handleEditCard,
  openCard: handleOpenCard,
  addTab: handleAddTab,
  closeTab: handleCloseTab,
  moveTabDir: handleMoveTabDir,
  setDateFormat: handleSetDateFormat,
  createColumn: handleCreateColumn,
  renameColumn: handleRenameColumn,
  deleteColumn: handleDeleteColumn,
  moveColumn: handleMoveColumn,
  setWipLimit: handleSetWipLimit,
  cardMenu: handleCardMenu,
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