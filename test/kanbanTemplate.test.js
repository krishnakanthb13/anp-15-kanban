import { buildKanbanTemplate } from '../lib/ui/kanbanTemplate.js';

describe("kanbanTemplate - buildKanbanTemplate", () => {
  it("injects allTasksText into the HTML string", () => {
    const tasksJSON = JSON.stringify([{ uuid: "task-1", content: "Test task" }]);
    const html = buildKanbanTemplate(tasksJSON);

    expect(html).toContain("const tasks = " + tasksJSON + ";");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("id=\"kanban-board\"");
  });
});
