import { jest } from '@jest/globals';
import {
  moveTaskToColumn,
  createTaskInColumn,
  setTaskCompleted,
  updateCardContent,
  addLabelToTask,
} from '../lib/api/taskOps.js';

const MD_A_B = [
  "# Alpha",
  "- [ ] one <!-- {\"uuid\":\"u1\"} -->",
  "# Beta",
].join("\n");

function makeApp(markdown = MD_A_B) {
  return {
    getNoteContent: jest.fn().mockResolvedValue(markdown),
    replaceNoteContent: jest.fn().mockResolvedValue(true),
    insertTask: jest.fn().mockResolvedValue("new-task"),
    updateTask: jest.fn().mockResolvedValue(true),
    getTask: jest.fn().mockResolvedValue({ uuid: "u1", content: "existing" }),
  };
}

describe("taskOps", () => {
  describe("moveTaskToColumn", () => {
    it("moves a task line under the destination heading (forward)", async () => {
      const app = makeApp();
      const status = await moveTaskToColumn(app, "n1", "u1", { columnId: "2" });

      expect(status).toBe("moved");
      const written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).toBe(["# Alpha", "# Beta", "- [ ] one <!-- {\"uuid\":\"u1\"} -->"].join("\n"));
    });

    it("handles index shift when moving backward", async () => {
      const md = ["# Alpha", "# Beta", "- [ ] two <!-- {\"uuid\":\"u2\"} -->"].join("\n");
      const app = makeApp(md);
      const status = await moveTaskToColumn(app, "n1", "u2", { columnId: "0" });

      expect(status).toBe("moved");
      const written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).toBe(["# Alpha", "- [ ] two <!-- {\"uuid\":\"u2\"} -->", "# Beta"].join("\n"));
    });

    it("reports same-column drops without writing", async () => {
      const app = makeApp();
      const status = await moveTaskToColumn(app, "n1", "u1", { columnId: "0" });
      expect(status).toBe("same-column");
      expect(app.replaceNoteContent).not.toHaveBeenCalled();
    });

    it("reports no-task / no-target / no-columns without writing", async () => {
      const app = makeApp();
      expect(await moveTaskToColumn(app, "n1", "ghost", { columnId: "2" })).toBe("no-task");
      expect(await moveTaskToColumn(app, "n1", "u1", { columnId: "999" })).toBe("no-target");

      const bare = makeApp("just text");
      expect(await moveTaskToColumn(bare, "n1", "u1", { columnId: "0" })).toBe("no-columns");
      expect(app.replaceNoteContent).not.toHaveBeenCalled();
      expect(bare.replaceNoteContent).not.toHaveBeenCalled();
    });
  });

  describe("createTaskInColumn", () => {
    it("inserts the task then relocates it into the target column", async () => {
      // Simulate insertTask having placed the new task at the top of the note.
      const mdWithNew = [
        "- [ ] New card <!-- {\"uuid\":\"new-task\"} -->",
        "# Alpha",
        "# Beta",
      ].join("\n");
      const app = makeApp(mdWithNew);
      const uuid = await createTaskInColumn(app, "n1", { columnId: "2" }, "New card");

      expect(uuid).toBe("new-task");
      expect(app.insertTask).toHaveBeenCalledWith({ uuid: "n1" }, { content: "New card" });
      expect(app.replaceNoteContent).toHaveBeenCalledTimes(1);
      const written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).toContain("# Beta\n- [ ] New card");
    });

    it("tolerates relocation failure and still returns the uuid", async () => {
      const app = makeApp();
      app.getNoteContent
        .mockResolvedValueOnce(MD_A_B)   // relocate read
        .mockRejectedValue(new Error("gone"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const uuid = await createTaskInColumn(app, "n1", { columnId: "2" }, "New card");
      expect(uuid).toBe("new-task");
      consoleSpy.mockRestore();
    });
  });

  describe("setTaskCompleted", () => {
    it("completes with a timestamp and reopens with null", async () => {
      const app = makeApp();
      await setTaskCompleted(app, "u1", true);
      const [uuid, updates] = app.updateTask.mock.calls[0];
      expect(uuid).toBe("u1");
      expect(typeof updates.completedAt).toBe("number");

      await setTaskCompleted(app, "u1", false);
      expect(app.updateTask).toHaveBeenLastCalledWith("u1", { completedAt: null });
    });
  });

  describe("updateCardContent", () => {
    it("writes new content", async () => {
      const app = makeApp();
      await updateCardContent(app, "u1", "**new**");
      expect(app.updateTask).toHaveBeenCalledWith("u1", { content: "**new**" });
    });
  });

  describe("addLabelToTask", () => {
    it("appends a wiki-link label to the task content", async () => {
      const app = makeApp();
      await addLabelToTask(app, "u1", "My Label");
      expect(app.getTask).toHaveBeenCalledWith("u1");
      expect(app.updateTask).toHaveBeenCalledWith("u1", { content: "existing\n[[My Label]]" });
    });

    it("skips duplicates, blank names, and missing tasks", async () => {
      const app = makeApp();
      app.getTask.mockResolvedValue({ uuid: "u1", content: "has [[My Label]] already" });
      await addLabelToTask(app, "u1", "My Label");
      expect(app.updateTask).not.toHaveBeenCalled();

      await addLabelToTask(app, "u1", "   ");
      expect(app.updateTask).not.toHaveBeenCalled();

      app.getTask.mockResolvedValue(null);
      await addLabelToTask(app, "ghost", "X");
      expect(app.updateTask).not.toHaveBeenCalled();
    });
  });
});
