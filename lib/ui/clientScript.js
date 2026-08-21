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
