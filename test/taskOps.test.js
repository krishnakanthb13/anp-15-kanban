import { jest } from '@jest/globals';
import {
  moveTaskToColumn,
  createTaskInColumn,
  setTaskCompleted,
  updateCardContent,
  addLabelToTask,
  sortTasksInNoteMarkdown,
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

    it("reports same-column drops without writing when no targetCardId is provided", async () => {
      const app = makeApp();
      const status = await moveTaskToColumn(app, "n1", "u1", { columnId: "0" });
      expect(status).toBe("same-column");
      expect(app.replaceNoteContent).not.toHaveBeenCalled();
    });

    it("reorders tasks within the same column when targetCardId is provided", async () => {
      const multiMd = [
        "# Alpha",
        "- [ ] task 1 <!-- {\"uuid\":\"u1\"} -->",
        "- [ ] task 2 <!-- {\"uuid\":\"u2\"} -->",
        "- [ ] task 3 <!-- {\"uuid\":\"u3\"} -->",
      ].join("\n");
      const app = makeApp(multiMd);
      // Move task 3 before task 1
      const status = await moveTaskToColumn(app, "n1", "u3", {
        columnId: "0",
        targetCardId: "u1",
        position: "before",
      });
      expect(status).toBe("moved");
      const written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).toBe([
        "# Alpha",
        "- [ ] task 3 <!-- {\"uuid\":\"u3\"} -->",
        "- [ ] task 1 <!-- {\"uuid\":\"u1\"} -->",
        "- [ ] task 2 <!-- {\"uuid\":\"u2\"} -->",
      ].join("\n"));
    });

    it("reorders tasks after a target card within the same column", async () => {
      const multiMd = [
        "# Alpha",
        "- [ ] task 1 <!-- {\"uuid\":\"u1\"} -->",
        "- [ ] task 2 <!-- {\"uuid\":\"u2\"} -->",
        "- [ ] task 3 <!-- {\"uuid\":\"u3\"} -->",
      ].join("\n");
      const app = makeApp(multiMd);
      // Move task 1 after task 2
      const status = await moveTaskToColumn(app, "n1", "u1", {
        columnId: "0",
        targetCardId: "u2",
        position: "after",
      });
      expect(status).toBe("moved");
      const written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).toBe([
        "# Alpha",
        "- [ ] task 2 <!-- {\"uuid\":\"u2\"} -->",
        "- [ ] task 1 <!-- {\"uuid\":\"u1\"} -->",
        "- [ ] task 3 <!-- {\"uuid\":\"u3\"} -->",
      ].join("\n"));
    });

    it("moves a task from one header to a specific card position in another header", async () => {
      const multiMd = [
        "# Alpha",
        "- [ ] alpha 1 <!-- {\"uuid\":\"a1\"} -->",
        "# Beta",
        "- [ ] beta 1 <!-- {\"uuid\":\"b1\"} -->",
        "- [ ] beta 2 <!-- {\"uuid\":\"b2\"} -->",
        "- [ ] beta 3 <!-- {\"uuid\":\"b3\"} -->",
      ].join("\n");
      const app = makeApp(multiMd);
      // Move alpha 1 into Beta after beta 2 (position 3 under Beta)
      const status = await moveTaskToColumn(app, "n1", "a1", {
        columnId: "2",
        columnName: "Beta",
        targetCardId: "b2",
        position: "after",
      });
      expect(status).toBe("moved");
      const written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).toBe([
        "# Alpha",
        "# Beta",
        "- [ ] beta 1 <!-- {\"uuid\":\"b1\"} -->",
        "- [ ] beta 2 <!-- {\"uuid\":\"b2\"} -->",
        "- [ ] alpha 1 <!-- {\"uuid\":\"a1\"} -->",
        "- [ ] beta 3 <!-- {\"uuid\":\"b3\"} -->",
      ].join("\n"));
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

    it("relocates task to line 0 (before headers) when target is unsorted", async () => {
      // Simulate Amplenote placing the task below the first header
      const mdWithNew = [
        "# Alpha",
        "- [ ] New card <!-- {\"uuid\":\"new-task\"} -->",
        "# Beta",
      ].join("\n");
      const app = makeApp(mdWithNew);
      const uuid = await createTaskInColumn(app, "n1", { columnId: "unsorted" }, "New card");

      expect(uuid).toBe("new-task");
      expect(app.replaceNoteContent).toHaveBeenCalledTimes(1);
      const written = app.replaceNoteContent.mock.calls[0][1];
      expect(written.startsWith("- [ ] New card")).toBe(true);
    });

    it("preserves existing text under header when creating task in column", async () => {
      const mdWithText = [
        "- [ ] New card <!-- {\"uuid\":\"new-task\"} -->",
        "# Alpha",
        "Here is some testing notes and description.",
        "# Beta",
      ].join("\n");
      const app = makeApp(mdWithText);
      const uuid = await createTaskInColumn(app, "n1", { columnId: "1" }, "testing");

      expect(uuid).toBe("new-task");
      expect(app.updateTask).toHaveBeenCalledWith("new-task", { content: "testing" });
      const written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).toContain("# Alpha\n- [ ] New card <!-- {\"uuid\":\"new-task\"} -->\n\nHere is some testing notes and description.");
    });

    it("sanitizes task content by stripping comment markers and collapsing newlines", async () => {
      const mdWithNew = [
        "- [ ] New card <!-- {\"uuid\":\"new-task\"} -->",
        "# Alpha",
      ].join("\n");
      const app = makeApp(mdWithNew);
      const uuid = await createTaskInColumn(app, "n1", { columnId: "1" }, "Task title <!-- fake --> \n multi-line");

      expect(uuid).toBe("new-task");
      expect(app.insertTask).toHaveBeenCalledWith({ uuid: "n1" }, { content: "Task title multi-line" });
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

  describe("concurrency & write locks", () => {
    it("serializes concurrent moveTaskToColumn operations on the same note", async () => {
      let currentContent = [
        "# Alpha",
        "- [ ] task 1 <!-- {\"uuid\":\"u1\"} -->",
        "- [ ] task 2 <!-- {\"uuid\":\"u2\"} -->",
        "# Beta",
      ].join("\n");

      const executionOrder = [];

      const app = {
        getNoteContent: jest.fn(async () => {
          // Add artificial delay to simulate async network latency
          await new Promise(r => setTimeout(r, 10));
          return currentContent;
        }),
        replaceNoteContent: jest.fn(async ({ uuid }, newContent) => {
          executionOrder.push(newContent);
          currentContent = newContent;
          return true;
        }),
        getTask: jest.fn(async (id) => ({ uuid: id, content: `task ${id === 'u1' ? '1' : '2'}` })),
        updateTask: jest.fn().mockResolvedValue(true),
      };

      // Trigger two rapid moves concurrently on the same note
      const p1 = moveTaskToColumn(app, "n1", "u1", { columnId: "3", columnName: "Beta" });
      const p2 = moveTaskToColumn(app, "n1", "u2", { columnId: "3", columnName: "Beta" });

      const results = await Promise.all([p1, p2]);
      expect(results).toEqual(["moved", "moved"]);
      expect(app.replaceNoteContent).toHaveBeenCalledTimes(2);

      // Final content should have BOTH tasks under # Beta (no silent overwrite / data loss)
      expect(currentContent).toContain("# Alpha");
      expect(currentContent).toContain("# Beta");
      expect(currentContent).toContain("- [ ] task 1 <!-- {\"uuid\":\"u1\"} -->");
      expect(currentContent).toContain("- [ ] task 2 <!-- {\"uuid\":\"u2\"} -->");
    });

    it("completes task with unix timestamp in seconds when moved to Completed column", async () => {
      const app = makeApp();
      await moveTaskToColumn(app, "n1", "u1", { columnId: "completed" });
      expect(app.updateTask).toHaveBeenCalled();
      const [uuid, updates] = app.updateTask.mock.calls[0];
      expect(uuid).toBe("u1");
      // Timestamp in seconds is 10 digits (e.g. ~1.7e9), milliseconds is 13 digits (>1e12)
      expect(updates.completedAt).toBeLessThan(1e11);
      expect(updates.completedAt).toBeGreaterThan(1e9);
    });

    it("moves parent task along with its indented subtasks to destination column", async () => {
      const markdown = [
        "# Alpha",
        "- [ ] Parent 1 <!-- {\"uuid\":\"p1\"} -->",
        "    - [ ] Subtask 1.1",
        "    Multiline note line",
        "- [ ] Parent 2 <!-- {\"uuid\":\"p2\"} -->",
        "# Beta",
      ].join("\n");

      let current = markdown;
      const app = {
        getNoteContent: jest.fn(async () => current),
        replaceNoteContent: jest.fn(async (_, next) => { current = next; return true; }),
        getTask: jest.fn(async (id) => ({ uuid: id, content: id === "p1" ? "Parent 1" : "Parent 2" })),
      };

      await moveTaskToColumn(app, "n1", "p1", { columnName: "Beta" });

      expect(current).toBe([
        "# Alpha",
        "- [ ] Parent 2 <!-- {\"uuid\":\"p2\"} -->",
        "# Beta",
        "- [ ] Parent 1 <!-- {\"uuid\":\"p1\"} -->",
        "    - [ ] Subtask 1.1",
        "    Multiline note line",
      ].join("\n"));
    });

    it("moves task with subtasks relative to target card (after)", async () => {
      const markdown = [
        "# Alpha",
        "- [ ] Target <!-- {\"uuid\":\"t1\"} -->",
        "    - [ ] Target subtask",
        "- [ ] Moving <!-- {\"uuid\":\"m1\"} -->",
        "    - [ ] Moving subtask",
      ].join("\n");

      let current = markdown;
      const app = {
        getNoteContent: jest.fn(async () => current),
        replaceNoteContent: jest.fn(async (_, next) => { current = next; return true; }),
        getTask: jest.fn(async (id) => ({ uuid: id, content: id === "t1" ? "Target" : "Moving" })),
      };

      await moveTaskToColumn(app, "n1", "m1", { targetCardId: "t1", position: "after" });

      expect(current).toBe([
        "# Alpha",
        "- [ ] Target <!-- {\"uuid\":\"t1\"} -->",
        "    - [ ] Target subtask",
        "- [ ] Moving <!-- {\"uuid\":\"m1\"} -->",
        "    - [ ] Moving subtask",
      ].join("\n"));
    });
  });

  describe("sortTasksInNoteMarkdown", () => {
    it("sorts tasks in note markdown by score", async () => {
      const markdown = [
        "# Col 1",
        "- [ ] Low score <!-- {\"uuid\":\"t1\"} -->",
        "- [ ] High score <!-- {\"uuid\":\"t2\"} -->",
      ].join("\n");

      const app = {
        getNoteContent: jest.fn().mockResolvedValue(markdown),
        getNoteTasks: jest.fn().mockResolvedValue([
          { uuid: "t1", score: 10 },
          { uuid: "t2", score: 50 },
        ]),
        replaceNoteContent: jest.fn().mockResolvedValue(true),
      };

      const result = await sortTasksInNoteMarkdown(app, "n1", "score");
      expect(result).toBe(true);
      const written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).toBe([
        "# Col 1",
        "- [ ] High score <!-- {\"uuid\":\"t2\"} -->",
        "- [ ] Low score <!-- {\"uuid\":\"t1\"} -->",
      ].join("\n"));
    });

    it("preserves attached subtasks and non-task paragraphs when sorting tasks", async () => {
      const markdown = [
        "Intro preamble line",
        "# Backlog",
        "Column description paragraph.",
        "- [ ] Task A (low) <!-- {\"uuid\":\"ta\"} -->",
        "    - [ ] Subtask of A",
        "    Multiline detail for A",
        "",
        "- [ ] Task B (high) <!-- {\"uuid\":\"tb\"} -->",
        "Trailing column note.",
        "# Done",
        "- [ ] Task C (done) <!-- {\"uuid\":\"tc\"} -->",
      ].join("\n");

      const app = {
        getNoteContent: jest.fn().mockResolvedValue(markdown),
        getNoteTasks: jest.fn().mockResolvedValue([
          { uuid: "ta", score: 5 },
          { uuid: "tb", score: 95 },
          { uuid: "tc", score: 20 },
        ]),
        replaceNoteContent: jest.fn().mockResolvedValue(true),
      };

      const result = await sortTasksInNoteMarkdown(app, "n1", "score");
      expect(result).toBe(true);
      const written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).toBe([
        "Intro preamble line",
        "# Backlog",
        "Column description paragraph.",
        "- [ ] Task B (high) <!-- {\"uuid\":\"tb\"} -->",
        "",
        "- [ ] Task A (low) <!-- {\"uuid\":\"ta\"} -->",
        "    - [ ] Subtask of A",
        "    Multiline detail for A",
        "Trailing column note.",
        "# Done",
        "- [ ] Task C (done) <!-- {\"uuid\":\"tc\"} -->",
      ].join("\n"));
    });

    it("sorts across multiple columns and respects different sort modes (startDate, important, urgent)", async () => {
      const markdown = [
        "# Column 1",
        "- [ ] Task 1 <!-- {\"uuid\":\"t1\"} -->",
        "- [ ] Task 2 <!-- {\"uuid\":\"t2\"} -->",
        "# Column 2",
        "- [ ] Task 3 <!-- {\"uuid\":\"t3\"} -->",
        "- [ ] Task 4 <!-- {\"uuid\":\"t4\"} -->",
      ].join("\n");

      const tasks = [
        { uuid: "t1", startAt: 100, important: false, urgent: true },
        { uuid: "t2", startAt: 500, important: true, urgent: false },
        { uuid: "t3", startAt: 200, important: false, urgent: false },
        { uuid: "t4", startAt: 900, important: true, urgent: true },
      ];

      const app = {
        getNoteContent: jest.fn().mockResolvedValue(markdown),
        getNoteTasks: jest.fn().mockResolvedValue(tasks),
        replaceNoteContent: jest.fn().mockResolvedValue(true),
      };

      // Test startDate sort
      await sortTasksInNoteMarkdown(app, "n1", "startDate");
      let written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).toContain("- [ ] Task 2 <!-- {\"uuid\":\"t2\"} -->\n- [ ] Task 1 <!-- {\"uuid\":\"t1\"} -->");
      expect(written).toContain("- [ ] Task 4 <!-- {\"uuid\":\"t4\"} -->\n- [ ] Task 3 <!-- {\"uuid\":\"t3\"} -->");

      // Test important sort
      app.replaceNoteContent.mockClear();
      await sortTasksInNoteMarkdown(app, "n1", "important");
      written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).toContain("- [ ] Task 2 <!-- {\"uuid\":\"t2\"} -->\n- [ ] Task 1 <!-- {\"uuid\":\"t1\"} -->");
      expect(written).toContain("- [ ] Task 4 <!-- {\"uuid\":\"t4\"} -->\n- [ ] Task 3 <!-- {\"uuid\":\"t3\"} -->");

      // Test urgent sort
      app.replaceNoteContent.mockClear();
      await sortTasksInNoteMarkdown(app, "n1", "urgent");
      written = app.replaceNoteContent.mock.calls[0][1];
      expect(written).toContain("- [ ] Task 1 <!-- {\"uuid\":\"t1\"} -->\n- [ ] Task 2 <!-- {\"uuid\":\"t2\"} -->");
      expect(written).toContain("- [ ] Task 4 <!-- {\"uuid\":\"t4\"} -->\n- [ ] Task 3 <!-- {\"uuid\":\"t3\"} -->");
    });
  });
});
