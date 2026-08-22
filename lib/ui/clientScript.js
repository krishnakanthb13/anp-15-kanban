/**
 * Builds the client-side script that runs inside the embed iframe.
 *
 * The embed is sandboxed: it cannot call app.* directly. All server work goes
 * through window.callAmplenotePlugin(action, payload) -> onEmbedCall, followed
 * by a full re-render (renderEmbed) with fresh state. The client keeps an
 * optimistic UI between action dispatch and re-render.
 *
 * Written as ES5-ish string-concat code on purpose: it is embedded verbatim in
 * the HTML document, so it must not rely on the plugin bundler or template literals.
 *
 * @returns {string} JavaScript source.
 */
export function buildClientScript() {
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

  function showToast(msg) {
    var host = document.getElementById("kb-toasts");
    if (!host) return;
    var toast = document.createElement("div");
    toast.className = "kb-toast";
    toast.textContent = msg;
    host.appendChild(toast);
    setTimeout(function () {
      toast.classList.add("kb-toast-hiding");
      setTimeout(function () {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 220);
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
      }
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

    var openNoteBtn = document.getElementById("kb-open-note-btn");
    if (openNoteBtn) openNoteBtn.style.display = (isNoteBoard && tab && tab.noteUUID) ? "inline-flex" : "none";
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
        if (col.id === "unsorted" && !isAfter) return;
        if (col.id === "completed" && isAfter) return;

        var fromIdx = columns.findIndex(function (c) { return c.id === dragColId; });
        if (fromIdx === -1) return;

        var moved = columns.splice(fromIdx, 1)[0];
        var newTargetIdx = columns.findIndex(function (c) { return c.id === col.id; });
        var insertIdx = isAfter ? newTargetIdx + 1 : newTargetIdx;

        // Ensure moved column never lands before Unsorted (index 0 if Unsorted exists)
        if (columns[0] && columns[0].id === "unsorted" && insertIdx < 1) {
          insertIdx = 1;
        }
        // Ensure moved column never lands after Completed (last index if Completed exists)
        var lastCol = columns[columns.length - 1];
        if (lastCol && lastCol.id === "completed" && insertIdx > columns.length - 1) {
          insertIdx = columns.length - 1;
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
          if (colIdx <= 0) return;
          var targetIdx = colIdx - 1;
          if (columns[targetIdx].id === "unsorted") return;

          var moved = columns.splice(colIdx, 1)[0];
          columns.splice(targetIdx, 0, moved);
          renderBoard();
          showToast("Column moved left");

          if (data.kind === "note") {
            var headingIds = columns.filter(function (c) {
              return c.id !== "unsorted" && c.id !== "completed" && !c.isSystemColumn;
            }).map(function (c) { return c.id; });
            callPlugin("reorderColumns", {
              tabId: STATE.activeTabId,
              columnIds: headingIds
            });
          }
        });
        addColToolSvg(tools, "chevronRight", "Move column right", function (e) {
          e.stopPropagation();
          var colIdx = columns.findIndex(function (c) { return c.id === col.id; });
          if (colIdx === -1 || colIdx >= columns.length - 1) return;
          var targetIdx = colIdx + 1;
          if (columns[targetIdx].id === "completed") return;

          var moved = columns.splice(colIdx, 1)[0];
          columns.splice(targetIdx, 0, moved);
          renderBoard();
          showToast("Column moved right");

          if (data.kind === "note") {
            var headingIds = columns.filter(function (c) {
              return c.id !== "unsorted" && c.id !== "completed" && !c.isSystemColumn;
            }).map(function (c) { return c.id; });
            callPlugin("reorderColumns", {
              tabId: STATE.activeTabId,
              columnIds: headingIds
            });
          }
        });
        addColToolSvg(tools, "edit", "Rename column", function (e) {
          e.stopPropagation();
          callPlugin("renameColumn", { tabId: STATE.activeTabId, columnId: col.id });
        });
        addColToolSvg(tools, "transfer", "Move column to another board tab", function (e) {
          e.stopPropagation();
          callPlugin("moveColumnToTab", { tabId: STATE.activeTabId, columnId: col.id });
        });
        addColToolSvg(tools, "trash", "Delete column (tasks move to previous header)", function (e) {
          e.stopPropagation();
          callPlugin("deleteColumn", { tabId: STATE.activeTabId, columnId: col.id });
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
            callPlugin("createColumn", { tabId: STATE.activeTabId, noteUUID: col.noteUUID, columnId: col.id });
          });
        }
        addColToolSvg(ttools, "edit", "Rename note", function (e) {
          e.stopPropagation();
          callPlugin("renameNote", { tabId: STATE.activeTabId, columnId: col.id });
        });
        addColToolSvg(ttools, "trash", "Delete note (move to Trash)", function (e) {
          e.stopPropagation();
          callPlugin("deleteNote", { tabId: STATE.activeTabId, columnId: col.id, noteUUID: col.noteUUID, noteName: col.name });
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
          callPlugin("setWipLimit", { tabId: STATE.activeTabId, columnId: col.id });
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
          var toggleIcon = el("span", "kb-section-toggle");
          toggleIcon.appendChild(svg(isCollapsed ? "chevronRightSolid" : "chevronDownSolid"));
          tw.appendChild(toggleIcon);
          tw.appendChild(el("span", "kb-section-title", sec.name + " (" + secCards.length + ")"));
          secHead.appendChild(tw);

          var secActions = el("div", "kb-section-actions");

          // Header tools for Tag tab sections (available for actual note headings)
          if (sec.id !== "unsorted" && sec.id !== "main") {
            var sectools = el("div", "kb-section-tools");
            addColToolSvg(sectools, "chevronUp", "Move header up", function (e) {
              e.stopPropagation();
              var secIdx = col.sections.findIndex(function (s) { return s.id === sec.id; });
              if (secIdx <= 0) return;
              var targetIdx = secIdx - 1;
              if (col.sections[targetIdx].id === "unsorted") return;

              var moved = col.sections.splice(secIdx, 1)[0];
              col.sections.splice(targetIdx, 0, moved);
              renderBoard();
              showToast("Header moved up");

              var headingIds = col.sections.filter(function (s) {
                return s.id !== "unsorted" && s.id !== "main";
              }).map(function (s) { return s.id; });

              callPlugin("reorderColumns", {
                tabId: STATE.activeTabId,
                noteUUID: col.noteUUID,
                columnIds: headingIds
              });
            });
            addColToolSvg(sectools, "chevronDown", "Move header down", function (e) {
              e.stopPropagation();
              var secIdx = col.sections.findIndex(function (s) { return s.id === sec.id; });
              if (secIdx === -1 || secIdx >= col.sections.length - 1) return;
              var targetIdx = secIdx + 1;
              if (col.sections[targetIdx].id === "completed") return;

              var moved = col.sections.splice(secIdx, 1)[0];
              col.sections.splice(targetIdx, 0, moved);
              renderBoard();
              showToast("Header moved down");

              var headingIds = col.sections.filter(function (s) {
                return s.id !== "unsorted" && s.id !== "main";
              }).map(function (s) { return s.id; });

              callPlugin("reorderColumns", {
                tabId: STATE.activeTabId,
                noteUUID: col.noteUUID,
                columnIds: headingIds
              });
            });
            addColToolSvg(sectools, "edit", "Rename header", function (e) {
              e.stopPropagation();
              callPlugin("renameColumn", { tabId: STATE.activeTabId, noteUUID: col.noteUUID, columnId: col.id, sectionId: sec.id });
            });
            addColToolSvg(sectools, "transfer", "Move header to another note / tab", function (e) {
              e.stopPropagation();
              callPlugin("moveColumnToTab", { tabId: STATE.activeTabId, noteUUID: col.noteUUID, columnId: col.id, sectionId: sec.id });
            });
            addColToolSvg(sectools, "trash", "Delete header (tasks move to previous header)", function (e) {
              e.stopPropagation();
              callPlugin("deleteColumn", { tabId: STATE.activeTabId, noteUUID: col.noteUUID, columnId: col.id, sectionId: sec.id });
            });
            secActions.appendChild(sectools);
          }

          var secAdd = el("button", "kb-col-btn");
          secAdd.type = "button";
          secAdd.title = "Add task in " + sec.name;
          secAdd.appendChild(svg("plus"));
          secAdd.addEventListener("click", function (e) {
            e.stopPropagation();
            var p = callPlugin("createCard", { tabId: STATE.activeTabId, columnId: col.id, sectionId: sec.id });
            if (p && typeof p.then === "function") {
              p.then(function (res) {
                if (res && res.board && res.tabId) {
                  STATE.boards[res.tabId] = res.board;
                  renderBoard();
                }
              });
            }
          });
          secActions.appendChild(secAdd);

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
          callPlugin("createColumn", { tabId: STATE.activeTabId, noteUUID: col.noteUUID, columnId: col.id });
        });
        sectionsHost.appendChild(addSecCard);

        colEl.appendChild(sectionsHost);
      } else {
        var list = el("div", "kb-cards");
        wireDropZone(list, col.id, null, col.name, null);
        applySort(visibleCards).forEach(function (card) {
          list.appendChild(buildCardEl(card));
        });

        if (isTagBoard || data.kind === "notes") {
          var addNotesSecCard = el("div", "kb-add-header-card");
          addNotesSecCard.title = "Add a new heading to " + col.name;
          var ansIcon = el("span", "kb-add-header-icon");
          ansIcon.appendChild(svg("plus"));
          addNotesSecCard.appendChild(ansIcon);
          addNotesSecCard.appendChild(el("span", "kb-add-header-label", "Add Header"));
          addNotesSecCard.addEventListener("click", function (e) {
            e.stopPropagation();
            callPlugin("createColumn", { tabId: STATE.activeTabId, noteUUID: col.noteUUID, columnId: col.id });
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
        callPlugin("createColumn", { tabId: STATE.activeTabId });
      } else {
        callPlugin("createColumnNote", { tabId: STATE.activeTabId });
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
          callPlugin("createColumnNote", { tabId: STATE.activeTabId });
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
              callPlugin("createColumnNote", { tabId: STATE.activeTabId });
            }
          }
        });
        actionsWrap.appendChild(emptyAddTBtn);

        var emptyAddHBtn = el("button", "kb-btn kb-empty-btn");
        emptyAddHBtn.type = "button";
        emptyAddHBtn.textContent = isNoteTab ? "+ Add Header" : "+ Add Note";
        emptyAddHBtn.addEventListener("click", function () {
          if (isNoteTab) {
            callPlugin("createColumn", { tabId: STATE.activeTabId });
          } else {
            callPlugin("createColumnNote", { tabId: STATE.activeTabId });
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
    var cardClasses = "kb-card" + (card.completedAt ? " kb-card-done" : "") + (depth > 0 ? " kb-card-subtask" : "");
    var cardEl = el("article", cardClasses);
    cardEl.setAttribute("data-card-id", card.id);
    cardEl.setAttribute("draggable", "true");

    if (depth > 1) {
      cardEl.style.marginLeft = Math.min(depth * 8, 28) + "px";
    }

    // Badges (Urgent, Important, Score [if != 1.0], Parent Subtasks, Child Subtask)
    var showScore = card.score !== null && card.score !== undefined && !Number.isNaN(Number(card.score)) && Math.abs(Number(card.score) - 1.0) > 0.001;
    var hasBadges = card.urgent || card.important || showScore || card.isParent || depth > 0;
    if (hasBadges) {
      var badges = el("div", "kb-task-badges");
      if (card.urgent) badges.appendChild(el("span", "kb-badge kb-badge-urgent", "\\uD83D\\uDD25 Urgent"));
      if (card.important) badges.appendChild(el("span", "kb-badge kb-badge-important", "\\u2B50 Important"));
      if (showScore) {
        badges.appendChild(el("span", "kb-badge kb-badge-score", "\\uD83C\\uDFAF " + Number(card.score).toFixed(1)));
      }
      if (card.isParent) {
        badges.appendChild(el("span", "kb-badge kb-badge-parent", "\\uD83D\\uDCCB Parent Task"));
      }
      if (depth > 0) {
        var childLabel = depth > 1 ? "\\u21B3".repeat(Math.min(depth, 3)) + " Child Task" : "\\u21B3 Child Task";
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
      var links = body.querySelectorAll("a");
      for (var lIdx = 0; lIdx < links.length; lIdx++) {
        var a = links[lIdx];
        var aText = (a.textContent || "").trim();
        if (aText === "open_in_new" || a.classList.contains("open_in_new") || a.classList.contains("open-in-new")) {
          a.remove();
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

    // Meta chips - only when present
    var nowSec = Math.floor(Date.now() / 1000);
    var hasMeta = card.completedAt || card.startAt || card.deadline || card.repeat || card.isRepeating || (card.hideUntil && card.hideUntil > nowSec);
    if (hasMeta) {
      var bits = [];
      if (card.completedAt) bits.push("\\u2713 " + formatCompletedStamp(card.completedAt));
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

    // Inline Task Details Popup (from ℹ button or expandCardInfo)
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
      e.dataTransfer.setData("text/plain", "card::" + card.id);
      e.dataTransfer.effectAllowed = "move";
      cardEl.classList.add("kb-dragging");
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

        // Check if it is an Amplenote note link
        var anpLinkRe = new RegExp("amplenote\\.com/notes/([a-zA-Z0-9_-]+)", "i");
        var anpPathRe = new RegExp("^/notes/([a-zA-Z0-9_-]+)", "i");
        var m = href.match(anpLinkRe) || href.match(anpPathRe);
        var targetNoteUUID = noteUuid || (m ? m[1] : null);

        if (targetNoteUUID && targetNoteUUID !== "plugins") {
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

      callPlugin("editCard", { cardId: card.id });
    });

    return cardEl;
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
        if (res && res.newCardId && cardEl) {
          cardEl.setAttribute("data-card-id", res.newCardId);
        }
        if (res && res.taskCompleted !== undefined && cardEl) {
          if (res.taskCompleted) {
            cardEl.classList.add("kb-card-done");
          } else {
            cardEl.classList.remove("kb-card-done");
          }
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
    if (!unixSeconds) return "done";
    var d = new Date(unixSeconds * 1000);
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return "done " + formatStamp(unixSeconds) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
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

    var closeBtn = el("button", "kb-lightbox-close", "\u00D7");
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
        callPlugin("saveSortToNote", { tabId: STATE.activeTabId, sortMode: sortMode });
      });
    }

    var openNoteBtn = document.getElementById("kb-open-note-btn");
    if (openNoteBtn) {
      openNoteBtn.addEventListener("click", function () {
        var tab = activeTab();
        if (tab && tab.noteUUID) callPlugin("openCard", { noteUUID: tab.noteUUID });
      });
    }



    var refreshTabBtn = document.getElementById("kb-refresh-tab");
    if (refreshTabBtn) {
      refreshTabBtn.addEventListener("click", function () {
        setBusy("kb-refresh-tab", true);
        sortMode = "none";
        setLocalSetting("sortMode", "none");
        updateSortUi();
        callPlugin("refreshTab", { tabId: STATE.activeTabId }).then(function (res) {
          setBusy("kb-refresh-tab", false);
          if (res && res.board && res.tabId) {
            STATE.boards[res.tabId] = res.board;
            renderBoard();
            showToast("Tab refreshed (default order)");
          }
        }).catch(function () {
          setBusy("kb-refresh-tab", false);
        });
      });
    }

    var refreshAllBtn = document.getElementById("kb-refresh-all");
    if (refreshAllBtn) {
      refreshAllBtn.addEventListener("click", function () {
        setBusy("kb-refresh-all", true);
        setProgress(0.2);
        sortMode = "none";
        setLocalSetting("sortMode", "none");
        updateSortUi();
        callPlugin("refreshAll").then(function (res) {
          setBusy("kb-refresh-all", false);
          setProgress(1.0);
          if (res && res.boards) {
            STATE.boards = res.boards;
            if (res.config) STATE.config = res.config;
            renderAll();
            showToast("All boards refreshed (default order)");
          }
        }).catch(function () {
          setBusy("kb-refresh-all", false);
        });
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
