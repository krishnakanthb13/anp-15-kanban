const fs = require("fs");
const code = fs.readFileSync("anp-15-kanban/build/kanban.compiled.js", "utf8");
const plugin = eval(code);

const NOTE_MD = [
  "Preamble",
  "- [ ] loose <!-- {\"uuid\":\"u0\"} -->",
  "# Alpha",
  "- [ ] one <!-- {\"uuid\":\"u1\"} -->",
  "# Beta",
  "- [x] done <!-- {\"uuid\":\"u2\", \"completedAt\": 1700000000} -->",
].join("\n");

(async () => {
  const app = {
    settings: {
      "Kanban Tabs": JSON.stringify({
        tabs: [{ id: "t1", kind: "note", name: "My Board", noteUUID: "n1" }],
        activeTabId: "t1",
        settings: {},
      }),
    },
    setSetting: async () => {},
    getNoteContent: async () => NOTE_MD,
    getNoteTasks: async () => ([
      { uuid: "u0", content: "loose" },
      { uuid: "u1", content: "one" },
      { uuid: "u2", content: "done", completedAt: 1700000000 },
    ]),
    replaceNoteContent: async () => true,
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
    columnsAlphaBeta: html.includes("Alpha") && html.includes("Beta"),
    doneCardStruck: html.includes('"completedAt":1700000000'),
    themeSystem: html.includes('[data-theme="midnight"]'),
    dndWired: html.includes("dragstart") && html.includes("moveCard"),
    createWired: html.includes("createCard"),
    editWired: html.includes("editCard"),
  };
  console.log(checks);
  const allPass = Object.values(checks).every(Boolean);
  console.log(allPass ? "PHASE 1 SMOKE PASS" : "PHASE 1 SMOKE FAIL");
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error("SMOKE ERROR", e); process.exit(1); });
