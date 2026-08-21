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
        tabs: [{ id: "t1", kind: "note", name: "My Board", noteUUID: "n1", columnLimits: { Alpha: 5 } }],
        activeTabId: "t1",
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
  };
  console.log(checks);
  const allPass = Object.values(checks).every(Boolean);
  console.log(allPass ? "PHASE 2 SMOKE PASS" : "PHASE 2 SMOKE FAIL");
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error("SMOKE ERROR", e); process.exit(1); });
