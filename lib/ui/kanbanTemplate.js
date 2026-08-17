/**
 * Builds the complete Kanban board HTML template string.
 *
 * @param {string} allTasksText - JSON-stringified array of task objects.
 * @returns {string} - The full HTML document string for the kanban board embed.
 */
export function buildKanbanTemplate(allTasksText) {
  return /* html */ `
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

        taskItem.appendChild(createButton('ℹ', 'task-button', () => showTaskInfo(task, taskItem)));

        if (isPending) {
            taskItem.appendChild(createButton('⚙', 'task-button2', () => window.callAmplenotePlugin("taskEdit", task.uuid)));
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
			header.append(createButton('➕', 'task-button3', () => window.callAmplenotePlugin("createTask", note)));

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
`;
}
