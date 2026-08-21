/* global process */
const fs = require("fs");
const code = fs.readFileSync("anp-15-kanban/build/kanban.compiled.js", "utf8");
const plugin = eval(code);

const NOTE_MD = [
  "Preamble",
  "- [ ] loose <!-- {\"uuid\":\"u0\"} -->",
  "# Alpha",
  "- [ ] one ![pic](https://x/i.png) <!-- {\"uuid\":\"u1\"} -->",
  "# Beta",
  "- [x] done <!-- {\"uuid\":\"u2\", \"completedAt\": 1700000000} -->",
].join("\n");

(async () => {
  const app = {
    settings: {
      "Kanban Tabs": JSON.stringify({
        tabs: [
          { id: "t1", kind: "note", name: "My Board", noteUUID: "n1", columnLimits: { Alpha: 5 } },
          { id: "tg", kind: "tag", name: "projects", tag: "projects" },
        ],
        activeTabId: "tg",
        settings: {},
      }),
    },
    setSetting: async () => {},
    getNoteContent: async () => NOTE_MD,
    getNoteTasks: async () => ([
      { uuid: "u0", content: "loose" },
      { uuid: "u1", content: "one ![pic](https://x/i.png)" },
      { uuid: "u2", content: "done", completedAt: 1700000000 },
    ]),
    htmlFromContent: async (c) => `<div class="ample-editor"><p>${c}</p></div>`,
    getTags: async () => ([
      { text: "projects", color: "2563eb", noteCount: 2 },
      { text: "projects/alpha", color: "ff0000", noteCount: 1 },
    ]),
    filterNotes: async () => ([
      { uuid: "k1", name: "Alpha doc", tags: ["projects/alpha"] },
      { uuid: "k2", name: "Plain doc", tags: ["projects"] },
    ]),
    replaceNoteContent: async () => true,
    insertNoteContent: async () => {},
    insertTask: async () => "new-task",
    updateTask: async () => true,
    getTask: async () => ({ uuid: "u1", content: "one" }),
    prompt: async () => null,
    openEmbed: async () => {},
    navigate: async () => {},
    context: { pluginUUID: "p1", renderEmbed: async () => {} },
  };

  const html = await plugin.renderEmbed(app);
  const checks = {
    docStartsOk: html.startsWith("<!DOCTYPE html>"),
    boardBuilt: html.includes('"hasHeadings":true'),
    unsortedColumn: html.includes("Unsorted"),
    richHtmlRendered: html.includes("ample-editor"),
    firstImageExtracted: html.includes("https://x/i.png"),
    wipLimitMapped: html.includes('"wipLimit":5'),
    columnControlsWired: ["moveColumn", "renameColumn", "deleteColumn", "setWipLimit"]
      .every(a => html.includes(`"${a}"`)),
    themeSystem: html.includes('[data-theme="midnight"]'),
    dndWired: html.includes("dragstart") && html.includes("moveCard"),
    tagBoardBuilt: html.includes('"kind":"tag"') && html.includes("No sub-tag"),
    tagColorsMapped: html.includes("ff0000"),
    openCardWired: html.includes("openCard"),
    tabMgmtWired: ["addTab", "closeTab", "moveTabDir"].every(a => html.includes(`"${a}"`))
      && html.includes("kb-tab-add"),
    dateFormatWired: html.includes("setDateFormat") && html.includes("kb-datefmt-btn")
      && html.includes("YYYY-MM-DD"),
    searchWired: html.includes("kb-search") && html.includes("globalSearch"),
    cardMenuWired: html.includes("cardMenu") && html.includes("kb-card-menu"),
    labelsWired: html.includes("kb-label-chip") && html.includes('"labels"'),
    transferWired: html.includes("moveColumnToTab"),
  };
  console.log(checks);
  const allPass = Object.values(checks).every(Boolean);
  console.log(allPass ? "PHASE 5 SMOKE PASS" : "PHASE 5 SMOKE FAIL");
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error("SMOKE ERROR", e); process.exit(1); });
