(() => {
// anp-15-kanban/lib/api/noteManager.js
async function refreshKanbanPage(app) {
  try {
    const destNoteUUID = await app.settings["Current_Note_UUID [Do not Edit!]"];
    if (!destNoteUUID) return;
    await app.replaceNoteContent({ uuid: destNoteUUID }, `Refreshing the Page!`);
    await new Promise((r) => setTimeout(r, 100));
    await app.replaceNoteContent(
      { uuid: destNoteUUID },
      `<object data="plugin://${app.context.pluginUUID}" data-aspect-ratio="1" />`
    );
    app.navigate(`https://www.amplenote.com/notes/${destNoteUUID}`);
  } catch (error) {
    console.error("Error refreshing Kanban page:", error);
  }
}
async function getOrCreateKanbanNote(app) {
  try {
    const existingUUID = await app.settings["Current_Note_UUID [Do not Edit!]"];
    if (existingUUID) return existingUUID;
    const newUUID = await app.createNote("Kanban Board", ["-reports/-kanban"]);
    await app.setSetting("Current_Note_UUID [Do not Edit!]", newUUID);
    return newUUID;
  } catch (error) {
    console.error("Error getting or creating Kanban note:", error);
    return null;
  }
}

// anp-15-kanban/lib/features/tagged.js
async function handleTagged(app) {
  const destNoteUUID = await getOrCreateKanbanNote(app);
  await app.replaceNoteContent(
    { uuid: destNoteUUID },
    `<object data="plugin://${app.context.pluginUUID}" data-aspect-ratio="1" />`
  );
  await app.navigate(`https://www.amplenote.com/notes/${destNoteUUID}`);
  return null;
}

// anp-15-kanban/lib/api/taskMover.js
async function moveTaskToHeader(app, noteUUID, uuidToMove, headerNumber) {
  try {
    const markdown = await app.getNoteContent({ uuid: noteUUID });
    if (!markdown) return "";
    const lines = markdown.split("\n");
    const updatedLines = [];
    let taskLine = null;
    const headers = [];
    for (let line of lines) {
      if (line.includes(`"uuid":"${uuidToMove}"`)) {
        taskLine = line;
      } else {
        updatedLines.push(line);
      }
      const headerMatch = line.match(/^(#+)\s*(.*)/);
      if (headerMatch) {
        headers.push(headerMatch[0]);
      }
    }
    if (taskLine) {
      const insertIndex = headerNumber === 0 ? 0 : updatedLines.indexOf(headers[headerNumber - 1]) + 1;
      updatedLines.splice(insertIndex, 0, taskLine);
    }
    return updatedLines.join("\n");
  } catch (error) {
    console.error(`Error moving task ${uuidToMove} to header:`, error);
    return "";
  }
}

// anp-15-kanban/lib/features/taskEdit.js
async function handleTaskEdit(app, taskUuid) {
  try {
    const task = await app.getTask(taskUuid);
    if (!task) return;
    const sections = await app.getNoteSections({ uuid: task.noteUUID });
    const transformedSections = sections.map((item, index) => {
      const headerValue = item.heading ? item.heading.text : "Main";
      return { label: headerValue, value: index };
    });
    const result = await app.prompt("Update Task Details", {
      inputs: [
        { label: "Update Task Content:", type: "text", value: `${task.content}` },
        { label: "Update Important:", type: "checkbox", value: task.important },
        { label: "Update Urgent:", type: "checkbox", value: task.urgent },
        { label: "Move to a Note or Header. Select Note:", type: "note", value: `${task.noteUUID}` },
        { label: "Select Section or Header (Caution: refrain from using --- in the note.):", type: "select", options: transformedSections },
        { label: "Update Score:", type: "string", value: `${task.score}` },
        { label: "Mark Task Status:", type: "radio", options: [
          { label: "Started", value: 3 },
          { label: "Completed", value: 1 },
          { label: "Dismissed", value: 2 }
        ] }
      ]
    });
    if (!result) return;
    let [taskContent, taskImportant, taskUrgent, taskNoteuuid, notesections, taskScore, taskStatus] = result;
    notesections = parseFloat(notesections);
    taskScore = parseFloat(taskScore);
    const currentTimeUnix = Math.floor(Date.now() / 1e3);
    const updatedFields = {};
    if (taskContent !== task.content) updatedFields.content = taskContent;
    if (taskImportant !== task.important) updatedFields.important = taskImportant;
    if (taskUrgent !== task.urgent) updatedFields.urgent = taskUrgent;
    if (taskNoteuuid && taskNoteuuid.uuid && taskNoteuuid.uuid !== task.noteUUID) {
      updatedFields.noteUUID = taskNoteuuid.uuid;
    }
    if (taskScore !== task.score) updatedFields.score = taskScore;
    if (taskStatus === 1) {
      updatedFields.completedAt = currentTimeUnix;
    } else if (taskStatus === 2) {
      updatedFields.dismissedAt = currentTimeUnix;
    } else if (taskStatus === 3) {
      updatedFields.startAt = currentTimeUnix;
    }
    if (Object.keys(updatedFields).length > 0) {
      await app.updateTask(taskUuid, updatedFields);
    }
    if (!isNaN(notesections) && notesections >= 0 && taskNoteuuid && taskNoteuuid.uuid == task.noteUUID) {
      const updatedMarkdown = await moveTaskToHeader(app, task.noteUUID, task.uuid, notesections);
      if (updatedMarkdown) {
        await app.replaceNoteContent({ uuid: task.noteUUID }, updatedMarkdown);
      }
    }
    await refreshKanbanPage(app);
  } catch (error) {
    console.error(`Error in handleTaskEdit for task ${taskUuid}:`, error);
  }
}

// anp-15-kanban/lib/features/createTask.js
async function handleCreateTask(app, noteName) {
  try {
    const kanbanTagz = await app.settings["Kanban Filter Tag"];
    const noteHandleCT = await app.findNote({ name: noteName, tag: kanbanTagz || "-reports/-kanban" });
    if (!noteHandleCT) return;
    const sections = await app.getNoteSections({ uuid: noteHandleCT.uuid });
    const transformedSections = sections.map((item, index) => {
      const headerValue = item.heading ? item.heading.text : "Main";
      return { label: headerValue, value: index };
    });
    const result = await app.prompt("Update Task Details", {
      inputs: [
        { label: "Update Task Content:", type: "text" },
        { label: "Update Important:", type: "checkbox" },
        { label: "Update Urgent:", type: "checkbox" },
        { label: "Move to a Note or Header. Select Note:", type: "note", value: `${noteHandleCT.uuid}` },
        { label: "Select Section or Header (Caution: refrain from using --- in the note.):", type: "select", options: transformedSections },
        { label: "Update Score:", type: "string" },
        { label: "Mark Task Status:", type: "radio", options: [
          { label: "Started", value: 3 },
          { label: "Completed", value: 1 },
          { label: "Dismissed", value: 2 }
        ] }
      ]
    });
    if (!result) return;
    let [taskContent, taskImportant, taskUrgent, taskNoteuuid, notesections, taskScore, taskStatus] = result;
    notesections = parseFloat(notesections);
    taskScore = parseFloat(taskScore);
    const currentTimeUnix = Math.floor(Date.now() / 1e3);
    const updatedFields = {};
    let taskUUID;
    if (taskNoteuuid && taskNoteuuid.uuid) {
      taskUUID = await app.insertTask({ uuid: taskNoteuuid.uuid }, { text: "" });
    } else {
      taskUUID = await app.insertTask({ uuid: noteHandleCT.uuid }, { text: "" });
      taskNoteuuid = { uuid: noteHandleCT.uuid };
    }
    if (taskContent) updatedFields.content = taskContent;
    if (taskImportant) updatedFields.important = true;
    if (taskUrgent) updatedFields.urgent = true;
    if (taskScore) updatedFields.score = taskScore;
    if (taskStatus === 1) {
      updatedFields.completedAt = currentTimeUnix;
    } else if (taskStatus === 2) {
      updatedFields.dismissedAt = currentTimeUnix;
    } else if (taskStatus === 3) {
      updatedFields.startAt = currentTimeUnix;
    }
    if (Object.keys(updatedFields).length > 0) {
      await app.updateTask(taskUUID, updatedFields);
    }
    if (!isNaN(notesections) && notesections >= 0 && taskNoteuuid && taskNoteuuid.uuid) {
      const updatedMarkdown = await moveTaskToHeader(app, taskNoteuuid.uuid, taskUUID, notesections);
      if (updatedMarkdown) {
        await app.replaceNoteContent({ uuid: taskNoteuuid.uuid }, updatedMarkdown);
      }
    }
    await refreshKanbanPage(app);
  } catch (error) {
    console.error("Error creating task in kanban:", error);
  }
}

// anp-15-kanban/lib/features/createNewNote.js
async function handleCreateNewNote(app) {
  const result = await app.prompt(`Details for New Note Creation`, {
    inputs: [
      { label: "Enter a Note Name:", type: "string" },
      { label: "Select a Note as Template w/ Tasks: (Optional)", type: "note" }
    ]
  });
  if (result) {
    const [noteName, copyNote] = result;
    const kanbanTagz = await app.settings["Kanban Filter Tag"];
    const uuidz = await app.createNote(noteName, [kanbanTagz || "-reports/-kanban"]);
    if (copyNote) {
      const markdown = await app.getNoteContent({ uuid: copyNote.uuid });
      await app.replaceNoteContent({ uuid: uuidz }, markdown);
    } else {
      const note = await app.notes.find(uuidz);
      await note.insertTask({ content: "Temp: This Task is created by [Kanban Plugin](https://www.amplenote.com/plugins?sort_by=newest)" });
    }
  } else {
    return;
  }
  refreshKanbanPage(app);
}

// anp-15-kanban/lib/features/updateTag.js
async function handleUpdateTag(app) {
  const tagSetting = await app.settings["Kanban Filter Tag"];
  const result = await app.prompt(`Details for Tag Filtering in Kanban. Current Selection:[${tagSetting}]`, {
    inputs: [
      { label: "Select a Tag: (1)", type: "tags", limit: 1, value: tagSetting }
    ]
  });
  if (result) {
    await app.setSetting("Kanban Filter Tag", result);
  } else {
    return;
  }
  refreshKanbanPage(app);
}

// anp-15-kanban/lib/features/toggleSort.js
async function handleToggleSort(app) {
  const sortSetting = await app.settings["Toggle Sort"];
  const result = await app.prompt(`Sort Tasks. Current Setting: ${sortSetting}`, {
    inputs: [
      {
        label: `Tasks Toggle Sort: [${sortSetting}]`,
        type: "select",
        options: [
          { label: "startDate", value: "startDate" },
          { label: "taskScore", value: "taskScore" },
          { label: "important", value: "important" },
          { label: "urgent", value: "urgent" }
        ]
      }
    ]
  });
  if (result) {
    await app.setSetting("Toggle Sort", result);
  } else {
    return;
  }
  refreshKanbanPage(app);
}

// anp-15-kanban/lib/features/refreshPage.js
async function handleRefreshPage(app) {
  refreshKanbanPage(app);
}

// anp-15-kanban/lib/utils/formatTimestamp.js
function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "Not Set!";
  }
  const date = new Date(timestamp * 1e3);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const formattedDate = `${month}/${day}/${year}`;
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  return `${formattedDate} at ${formattedTime}`;
}

// anp-15-kanban/lib/utils/formatRepeat.js
function formatTaskRepeat(repeatInfo) {
  if (!repeatInfo || typeof repeatInfo !== "string") {
    return "Not Available";
  }
  const lines = repeatInfo.split("\n").map((line) => line.trim());
  const dtstartLine = lines[0];
  const rruleLine = lines[1];
  const dtstart = dtstartLine.substring(8);
  const year = dtstart.substring(0, 4);
  const month = dtstart.substring(4, 6);
  const day = dtstart.substring(6, 8);
  const hours = dtstart.substring(8, 10);
  const minutes = dtstart.substring(10, 12);
  const seconds = dtstart.substring(12, 14);
  const formattedDate = `${month}/${day}/${year}`;
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  const rrule = rruleLine.substring(10);
  const repeatFrequency = rrule.toUpperCase();
  return `${repeatFrequency.charAt(0).toUpperCase() + repeatFrequency.slice(1).toLowerCase()} <b>Starts At:</b> ${formattedDate} at ${formattedTime}`;
}

// anp-15-kanban/lib/ui/kanbanTemplate.js
function buildKanbanTemplate(allTasksText) {
  return (
    /* html */
    `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kanban Board</title>
    <style>
        :root {
            --bg-gradient-start: #f5f7fa;
            --bg-gradient-end: #c3cfe2;
            --col-border: #ddd;
            --btn-text: #fff;
            --btn-hover-bg: #333;
            --btn-hover-text: #eee;
            --shadow: rgba(0, 0, 0, 0.1);
        }
        body {
            font-family: 'Inter', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
            color: #333;
        }
        button.top-btn {
            background-color: #fff;
            border: 1px solid var(--col-border);
            border-radius: 6px;
            padding: 8px 12px;
            margin-right: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px var(--shadow);
        }
        button.top-btn:hover {
            background-color: var(--btn-hover-bg);
            color: var(--btn-hover-text);
            border-color: var(--btn-hover-bg);
        }
        #kanban-board {
            display: flex;
            overflow-x: auto;
            gap: 16px;
            padding-bottom: 20px;
        }
        .column {
            flex: 0 0 auto;
            min-width: 320px;
            border: 1px solid var(--col-border);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.5);
            backdrop-filter: blur(4px);
            box-shadow: 0 4px 12px var(--shadow);
            padding: 12px;
        }
        .task-category {
            margin-bottom: 12px;
            cursor: pointer;
        }
        .task-category h3 {
            margin: 0;
            padding: 10px;
            background: transparent;
            border-radius: 6px;
            font-weight: 600;
        }
        .task {
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 8px;
            color: #111;
            font-size: 14px;
            position: relative;
            transition: transform 0.2s, box-shadow 0.2s;
			max-width: 320px;
            box-shadow: 0 2px 4px var(--shadow);
        }
        .task:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px var(--shadow);
        }
        .task-button {
            background-color: transparent;
			border-radius: 5px;
            border: none;
            color: var(--btn-text);
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
			position: absolute;
			right: 5px;
            transition: all 0.2s;
        }
        .task-button:hover {
			background-color: var(--btn-hover-bg);
            color: var(--btn-hover-text);
        }
        .task-button2 {
            background-color: transparent;
			border-radius: 5px;
            border: none;
            color: var(--btn-text);
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
			position: absolute;
			right: 28px;
            transition: all 0.2s;
        }
        .task-button2:hover {
			background-color: var(--btn-hover-bg);			
            color: var(--btn-hover-text);
        }
        .task-button3 {
            background-color: transparent;
			border-radius: 5px;
            border: none;
            color: #333;
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
            transition: all 0.2s;
        }
        .task-button3:hover {
			background-color: var(--btn-hover-bg);			
            color: var(--btn-hover-text);
        }
.high-urgent.high-important {
    background: radial-gradient(1023px at 3.1% 6.9%, rgb(255, 230, 230) 0%, rgb(165, 30, 63) 74.9%);
}

.high-urgent.low-important {
    background: radial-gradient(1023px at 3.1% 6.9%, rgb(255, 235, 200) 0%, rgb(221, 98, 98) 74.9%);
}

.low-urgent.high-important {
    background: radial-gradient(1023px at 3.1% 6.9%, rgb(230, 245, 255) 0%, rgb(82, 139, 215) 74.9%);
}

.low-urgent.low-important {
    background: radial-gradient(1023px at 3.1% 6.9%, rgb(240, 240, 240) 0%, rgb(139, 139, 139) 74.9%);
}
        .task-info {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            background-color: #fff;
            color: #000;
            border: 1px solid var(--col-border);
            border-radius: 6px;
            padding: 12px;
            box-shadow: 0 4px 12px var(--shadow);
            z-index: 1000;
            width: 250px;
        }
        .section-title {
            font-size: 13px;
            color: #555;
            margin: 12px 0 6px 0;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <button id="cycleButton" class="top-btn">Toggle Sort: <span id="valueDisplay">None</span></button>
	<button id="createNewNote" class="top-btn">Create New Note</button>
	<button id="updateTag" class="top-btn">Update Tag</button>
	<button id="refreshPage" class="top-btn">Refresh Page</button>
    <br><br>
    <div id="kanban-board"></div>

    <script>
        
  const tasks = ${allTasksText};

try {
    /**
     * Determines the CSS class based on the task's urgency and importance.
     */
    function getColor(task) {
        if (task.urgent && task.important) return 'high-urgent high-important';
        if (task.urgent) return 'high-urgent low-important';
        if (task.important) return 'low-urgent high-important';
        return 'low-urgent low-important';
    }

    const values = ['Start Date', 'Score', 'Important', 'Urgent'];
    let currentIndex = 0;
    const valueDisplay = document.getElementById('valueDisplay');
    const cycleButton = document.getElementById('cycleButton');
    const createNewNote = document.getElementById('createNewNote');
    const updateTag = document.getElementById('updateTag');
    const refreshPage = document.getElementById('refreshPage');

    function refreshPagecall() {
		window.callAmplenotePlugin("refreshPage")
    }

    refreshPage.addEventListener('click', refreshPagecall);

    function updateTagcall() {
		window.callAmplenotePlugin("updateTag")
    }

    updateTag.addEventListener('click', updateTagcall);

    function createNewNotecall() {
		window.callAmplenotePlugin("createNewNote")
    }

    createNewNote.addEventListener('click', createNewNotecall);

    function updateValue() {
        valueDisplay.textContent = values[currentIndex];
        currentIndex = (currentIndex + 1) % values.length;
        renderKanbanBoard();
        window.callAmplenotePlugin("togglesort");
    }

    cycleButton.addEventListener('click', updateValue);

    function showTaskInfo(task, element) {
        let infoDiv = element.querySelector('.task-info');
        if (!infoDiv) {
            infoDiv = document.createElement('div');
            infoDiv.className = 'task-info' + (document.body.classList.contains('dark-mode') ? ' dark-mode' : '');
            infoDiv.innerHTML = task.taskInfo;
            element.appendChild(infoDiv);
        }
        infoDiv.style.display = 'block';
    }

    function hideTaskInfo(element) {
        const infoDiv = element.querySelector('.task-info');
        if (infoDiv) {
            infoDiv.style.display = 'none';
        }
    }

    function createButton(text, className, clickHandler) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        button.onclick = clickHandler;
        return button;
    }

    function createTaskItem(task, container, isPending = true) {
        const taskItem = document.createElement('div');
        taskItem.className = 'task ' + getColor(task);
        taskItem.textContent = task.content;

        taskItem.appendChild(createButton('\u2139', 'task-button', () => showTaskInfo(task, taskItem)));

        if (isPending) {
            taskItem.appendChild(createButton('\u2699', 'task-button2', () => window.callAmplenotePlugin("taskEdit", task.uuid)));
        }

        taskItem.onmouseleave = () => hideTaskInfo(taskItem);

        container.appendChild(taskItem);
    }

    function sortTasks(tasks, sortBy) {
        switch (sortBy) {
            case 'Start Date':
                return tasks.sort((a, b) => (b.startAt || 0) - (a.startAt || 0));
            case 'Score':
                return tasks.sort((a, b) => (b.score || 0) - (a.score || 0));
            case 'Important':
                return tasks.sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));
            case 'Urgent':
                return tasks.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
            default:
                return tasks;
        }
    }

    function renderKanbanBoard() {
        const board = document.getElementById('kanban-board');
        const columns = {};

        tasks.forEach(task => {
            const note = task.notename;
            if (!columns[note]) {
                columns[note] = { pending: [], completed: [], dismissed: [] };
            }

            if (task.completedAt) {
                columns[note].completed.push(task);
            } else if (task.dismissedAt) {
                columns[note].dismissed.push(task);
            } else {
                columns[note].pending.push(task);
            }
        });

        board.innerHTML = '';

		Object.keys(columns).forEach(note => {
			const column = document.createElement('div');
			column.className = 'column';

			const header = document.createElement('h3');
			header.textContent = note;
			header.className = 'task-category';
			column.appendChild(header);
			header.append(createButton('\u2795', 'task-button3', () => window.callAmplenotePlugin("createTask", note)));

			const pendingList = document.createElement('div');
			pendingList.append(document.createTextNode('Pending: '));
			sortTasks(columns[note].pending, valueDisplay.textContent).forEach(task => createTaskItem(task, pendingList));

			const completedList = document.createElement('div');
			completedList.appendChild(document.createTextNode('Completed:'));
			columns[note].completed.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
				.forEach(task => createTaskItem(task, completedList, false));

			const dismissedList = document.createElement('div');
			dismissedList.appendChild(document.createTextNode('Dismissed:'));
			columns[note].dismissed.sort((a, b) => (b.dismissedAt || 0) - (a.dismissedAt || 0))
				.forEach(task => createTaskItem(task, dismissedList, false));

			column.appendChild(pendingList);
			column.appendChild(completedList);
			column.appendChild(dismissedList);

			board.appendChild(column);
		});

    }

    renderKanbanBoard();

} catch (error) {
    console.error("Error processing scripts:", error);
}

    </script>
</body>
</html>
`
  );
}

// anp-15-kanban/kanban.js
var plugin = {
  appOption: {
    /* ----------------------------------- */
    "Tagged!": handleTagged
    /* ----------------------------------- */
  },
  /* ----------------------------------- */
  async onEmbedCall(app, ...args) {
    switch (args[0]) {
      case "taskEdit":
        await handleTaskEdit(app, args[1]);
        break;
      case "createTask":
        await handleCreateTask(app, args[1]);
        break;
      case "createNewNote":
        await handleCreateNewNote(app);
        break;
      case "updateTag":
        await handleUpdateTag(app);
        break;
      case "togglesort":
        await handleToggleSort(app);
        break;
      case "refreshPage":
        await handleRefreshPage(app);
        break;
    }
  },
  /* ----------------------------------- */
  async renderEmbed(app, ...args) {
    let allTasksText;
    let taskSorting;
    const kanbanTagz = await app.settings["Kanban Filter Tag"];
    const noteHandles = await app.filterNotes({ tag: kanbanTagz || "-reports/-kanban" });
    if (noteHandles.length > 0) {
      let allTasks = [];
      const escapeHTML = (str) => String(str).replace(
        /[&<>'"]/g,
        (tag) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        })[tag]
      );
      for (let note of noteHandles) {
        const noteUUID = note.uuid;
        const noteTags = escapeHTML(note.tags.join(", "));
        const noteNameSafe = escapeHTML(note.name);
        const tasks = await app.getNoteTasks({ uuid: noteUUID }, { includeDone: true });
        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i];
          allTasks.push({
            ...task,
            notename: noteNameSafe,
            noteurl: `https://www.amplenote.com/notes/${note.uuid}`,
            tags: noteTags,
            startAtz: `${formatTimestamp(task.startAt)}`,
            hideUntilz: `${formatTimestamp(task.hideUntil)}`,
            endAtz: `${formatTimestamp(task.endAt)}`,
            repeatz: `${formatTaskRepeat(task.repeat)}`,
            taskInfo: `<b>Important:</b> ${task.important}<br><b>Urgent:</b> ${task.urgent}<br><b>Score:</b> ${task.score.toFixed(2)}<br><hr><b>Start At:</b> ${formatTimestamp(task.startAt)}<br><b>Hide Until:</b> ${formatTimestamp(task.hideUntil)}<br><b>End At:</b> ${formatTimestamp(task.endAt)}<br><b>Repeat:</b> ${formatTaskRepeat(task.repeat)}<br><hr><b>Completed At:</b> ${formatTimestamp(task.completedAt)}<br><b>Dismissed At:</b> ${formatTimestamp(task.dismissedAt)}<br><hr><b>Note Link:</b> <a href="https://www.amplenote.com/notes/${note.uuid}" target="_blank">${noteNameSafe}</a><br><b>Tags:</b> ${noteTags}`
          });
        }
      }
      taskSorting = app.settings["Toggle Sort"] || "taskScore";
      if (taskSorting === "startDate") {
        allTasks.sort((a, b) => (b.startAt || 0) - (a.startAt || 0));
      }
      if (taskSorting === "taskScore") {
        allTasks.sort((a, b) => b.score - a.score);
      }
      if (taskSorting === "important") {
        allTasks.sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));
      }
      if (taskSorting === "urgent") {
        allTasks.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
      }
      allTasksText = JSON.stringify(allTasks, null, 2);
    } else {
      const goalsSmall = ["Life Goals", "Yearly Goals", "Monthly Goals", "Today's Tasks"];
      for (const header of goalsSmall) {
        await app.createNote(header, ["-reports/-kanban"]);
        await app.setSetting("Kanban Filter Tag", "-reports/-kanban");
        app.alert("Success! Looks like it's your first time running the program, so we created a few notes with a specific tag to get you rolling. Now you can run the Kanban Plugin again and see at your brand-new board!");
      }
    }
    return buildKanbanTemplate(allTasksText);
  }
  /* ----------------------------------- */
};
var kanban_default = plugin;


return kanban_default;
})()