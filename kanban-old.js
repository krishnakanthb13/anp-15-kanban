{
    appOption: {
        /* ----------------------------------- */
        "Tagged!": async function (app) {

            // console.log("Lets get it started.");

            const destNoteUUID = await (async () => {
                const existingUUID = await app.settings["Current_Note_UUID [Do not Edit!]"];
                // console.log("existingUUID",existingUUID);
                if (existingUUID)
                    return existingUUID;
                const newUUID = await app.createNote("Kanban Board", ["-reports/-kanban"]);
                await app.setSetting("Current_Note_UUID [Do not Edit!]", newUUID);
                return newUUID;
                // console.log("newUUID",newUUID);
            })();
            // console.log("destNoteUUID",destNoteUUID);

            /**
             * Inserts an object element into the selection in the application context.
             * 
             * This function updates the current selection in the application context 
             * with an HTML object tag that points to a plugin using its UUID.
             * The object tag includes a data-aspect-ratio attribute to control its display ratio.
             * 
             * @returns {null} - The function does not return any meaningful value.
             */

            // Replace the current selection in the app's context with the plugin's object data
            await app.replaceNoteContent(
                { uuid: destNoteUUID },
                `<object data="plugin://${app.context.pluginUUID}" data-aspect-ratio="1" />`
            );
            await app.navigate(`https://www.amplenote.com/notes/${destNoteUUID}`);
            // console.log("Plugin Inserted into Note", destNoteUUID);

            // Return null as no further action is required
            return null;

        }
        /* ----------------------------------- */
    },
/* ----------------------------------- */
async onEmbedCall(app, ...args) {

        /**
         * Handles task editing and sorting based on the provided arguments.
         * 
         * When the "taskEdit" argument is passed, the function allows editing of a task's content, importance, urgency, 
         * note association, section (header), score, and status. 
         * When the "togglesort" argument is passed, the function allows the user to toggle task sorting settings.
         *
         * @param {Array} args - The arguments that specify the operation (e.g., "taskEdit", "togglesort").
         */
        if (args[0] === "taskEdit") {
            // Get the task UUID from arguments
            const taskUuid = args[1];
            // console.log(`Editing task with UUID: ${taskUuid}`);

            // Fetch the task details using its UUID
            const task = await app.getTask(taskUuid);
            // console.log(task, JSON.stringify(task));

            // Create options for updating task importance and urgency
            const importantValue = task.important
                ? [{ label: "True", value: "" }, { label: "False", value: "false" }]
                : [{ label: "True", value: "true" }, { label: "False", value: "" }];
            // console.log("importantValue", importantValue);

            const urgentValue = task.urgent
                ? [{ label: "True", value: "" }, { label: "False", value: "false" }]
                : [{ label: "True", value: "true" }, { label: "False", value: "" }];
            // console.log("urgentValue", urgentValue);

            // Fetch sections (headers) from the note associated with the task
            const sections = await app.getNoteSections({ uuid: task.noteUUID });
            // console.log("sections", sections);

            // Transform sections into a label-value format for easier selection in the prompt
            const transformedSections = sections.map((item, index) => {
                const headerValue = item.heading ? item.heading.text : "Main"; // Default to "Main" if no heading
                return { label: headerValue, value: index };
            });
            // console.log("transformedSections:", transformedSections);

            // Display a prompt to update task details
            const result = await app.prompt("Update Task Details", {
                inputs: [
                    { label: "Update Task Content:", type: "text", value: `${task.content}` },
                    { label: "Update Important:", type: "checkbox", value: task.important },
                    { label: "Update Urgent:", type: "checkbox", value: task.urgent },
                    { label: "Move to a Note or Header. Select Note:", type: "note", value: `${task.noteUUID}` },
                    { label: "Select Section or Header (Caution: refrain from using --- in the note.):", type: "select", options: transformedSections },
                    { label: "Update Score:", type: "string", value: `${task.score}` },
                    {
                        label: "Mark Task Status:", type: "radio", options: [
                            { label: "Started", value: 3 },
                            { label: "Completed", value: 1 },
                            { label: "Dismissed", value: 2 }
                        ]
                    }
                ]
            });

            if (result) {
                // Destructure the result for easy access to task fields
                let [taskContent, taskImportant, taskUrgent, taskNoteuuid, notesections, taskScore, taskStatus] = result;
                notesections = parseFloat(notesections);
                taskScore = parseFloat(taskScore);
                // console.log("result", result);
                // console.log(taskContent, taskImportant, taskUrgent, taskNoteuuid, notesections, taskScore, taskStatus);

                const currentTimeUnix = Math.floor(Date.now() / 1000);

                // Prepare an object to hold updated task fields
                const updatedFields = {};

                /**
                 * Move the task to a specific header within the note.
                 * 
                 * @param {string} noteUUID - The UUID of the note containing the task.
                 * @param {string} uuidToMove - The UUID of the task to move.
                 * @param {number} headerNumber - The header number to move the task under.
                 * @returns {string} - The updated markdown content.
                 */
                async function moveTaskToHeader(noteUUID, uuidToMove, headerNumber) {
                    const markdown = await app.getNoteContent({ uuid: noteUUID });
                    // console.log("markdown", markdown);
                    const lines = markdown.split('\n');
                    const updatedLines = [];
                    let taskLine = null;
                    const headers = [];

                    // Iterate through the lines to find the task and headers
                    for (let line of lines) {
                        if (line.includes(`"uuid":"${uuidToMove}"`)) {
                            taskLine = line; // Save task line for later insertion
                        } else {
                            updatedLines.push(line); // Keep non-task lines
                        }

                        // Detect headers in markdown
                        const headerMatch = line.match(/^(#+)\s*(.*)/);
                        if (headerMatch) {
                            headers.push(headerMatch[0]);
                        }
                        // console.log("headers", headers);
                    }
                    // console.log("updatedLines", updatedLines);
                    // console.log("taskLine", taskLine);

                    // Insert task under the correct header
                    if (taskLine) {
                        const insertIndex = headerNumber === 0
                            ? 0
                            : updatedLines.indexOf(headers[headerNumber - 1]) + 1;
                        updatedLines.splice(insertIndex, 0, taskLine); // Insert task
                    }

                    return updatedLines.join('\n'); // Rejoin markdown content
                }

                let updatedMarkdown;

                // Check which fields have changed and update them
                if (taskContent !== task.content) updatedFields.content = taskContent;
                if (taskImportant !== task.important) updatedFields.important = taskImportant;
                if (taskUrgent !== task.urgent) updatedFields.urgent = taskUrgent;

                if (taskNoteuuid.uuid !== task.noteUUID) {
                    updatedFields.noteUUID = taskNoteuuid.uuid;
                }

                if (taskScore !== task.score) updatedFields.score = taskScore;

                // Update task status based on user input
                if (taskStatus === 1) {
                    updatedFields.completedAt = currentTimeUnix;
                    // console.log("Task marked as completed.");
                } else if (taskStatus === 2) {
                    updatedFields.dismissedAt = currentTimeUnix;
                    // console.log("Task marked as dismissed.");
                } else if (taskStatus === 3) {
                    updatedFields.startAt = currentTimeUnix;
                    // console.log("Task marked as started.");
                }

                // Update the task if any fields have changed
                if (Object.keys(updatedFields).length > 0) {
                    await app.updateTask(taskUuid, updatedFields);
                    // console.log("Task Updated with changes:", updatedFields);
                } else {
                    // console.log("No changes detected, task not updated.");
                }

                if (notesections >= 0 && taskNoteuuid.uuid == task.noteUUID) {
                    updatedMarkdown = await moveTaskToHeader(task.noteUUID, task.uuid, notesections);
                    // console.log("updatedMarkdown", updatedMarkdown);
                    await app.replaceNoteContent({ uuid: task.noteUUID }, updatedMarkdown);
                    // console.log("Task Moved Successfully.");
                }

            } else {
                // User canceled the prompt
                return;
            }

            // Function to refresh the Kanban Plugin Page
            async function refreshKanbanPage() {
                const destNoteUUID = await app.settings["Current_Note_UUID [Do not Edit!]"];

                // Replace current selection with a message indicating page refresh
                await app.replaceNoteContent({ uuid: destNoteUUID }, `Refreshing the Page!`);

                // Wait for 3 seconds, then replace the note content with the plugin's object data
                setTimeout(async () => {
                    await app.replaceNoteContent({ uuid: destNoteUUID }, `<object data="plugin://${app.context.pluginUUID}" data-aspect-ratio="1" />`);

                    // Navigate to the refreshed page after content is updated
                    app.navigate(`https://www.amplenote.com/notes/${destNoteUUID}`);
                    // console.log("Page refreshed!");
                }, 100);
            }

            // Call the function to refresh the page
            refreshKanbanPage();

        } else if (args[0] === "createTask") {
            const noteName = args[1];
            // console.log("noteName:", noteName);
            const kanbanTagz = await app.settings["Kanban Filter Tag"];
            const noteHandleCT = await app.findNote({ name: noteName, tag: kanbanTagz || "-reports/-kanban" });
            // console.log("noteHandleCT:", noteHandleCT);

            // Fetch sections (headers) from the note associated with the task
            const sections = await app.getNoteSections({ uuid: noteHandleCT.uuid });
            // console.log("sections", sections);

            // Transform sections into a label-value format for easier selection in the prompt
            const transformedSections = sections.map((item, index) => {
                const headerValue = item.heading ? item.heading.text : "Main"; // Default to "Main" if no heading
                return { label: headerValue, value: index };
            });
            // console.log("transformedSections:", transformedSections);

            // Display a prompt to update task details
            const result = await app.prompt("Update Task Details", {
                inputs: [
                    { label: "Update Task Content:", type: "text" },
                    { label: "Update Important:", type: "checkbox" },
                    { label: "Update Urgent:", type: "checkbox" },
                    { label: "Move to a Note or Header. Select Note:", type: "note", value: `${noteHandleCT.uuid}` },
                    { label: "Select Section or Header (Caution: refrain from using --- in the note.):", type: "select", options: transformedSections },
                    { label: "Update Score:", type: "string" },
                    {
                        label: "Mark Task Status:", type: "radio", options: [
                            { label: "Started", value: 3 },
                            { label: "Completed", value: 1 },
                            { label: "Dismissed", value: 2 }
                        ]
                    }
                ]
            });

            if (result) {
                // Destructure the result for easy access to task fields
                let [taskContent, taskImportant, taskUrgent, taskNoteuuid, notesections, taskScore, taskStatus] = result;
                notesections = parseFloat(notesections);
                taskScore = parseFloat(taskScore);
                // console.log("result", result);
                // console.log(taskContent, taskImportant, taskUrgent, taskNoteuuid, notesections, taskScore, taskStatus);

                const currentTimeUnix = Math.floor(Date.now() / 1000);

                // Prepare an object to hold updated task fields
                const updatedFields = {};

                /**
                 * Move the task to a specific header within the note.
                 * 
                 * @param {string} noteUUID - The UUID of the note containing the task.
                 * @param {string} uuidToMove - The UUID of the task to move.
                 * @param {number} headerNumber - The header number to move the task under.
                 * @returns {string} - The updated markdown content.
                 */
                async function moveTaskToHeader(noteUUID, uuidToMove, headerNumber) {
                    const markdown = await app.getNoteContent({ uuid: noteUUID });
                    // console.log("markdown", markdown);
                    const lines = markdown.split('\n');
                    const updatedLines = [];
                    let taskLine = null;
                    const headers = [];

                    // Iterate through the lines to find the task and headers
                    for (let line of lines) {
                        if (line.includes(`"uuid":"${uuidToMove}"`)) {
                            taskLine = line; // Save task line for later insertion
                        } else {
                            updatedLines.push(line); // Keep non-task lines
                        }

                        // Detect headers in markdown
                        const headerMatch = line.match(/^(#+)\s*(.*)/);
                        if (headerMatch) {
                            headers.push(headerMatch[0]);
                        }
                        // console.log("headers", headers);
                    }
                    // console.log("updatedLines", updatedLines);
                    // console.log("taskLine", taskLine);

                    // Insert task under the correct header
                    if (taskLine) {
                        const insertIndex = headerNumber === 0
                            ? 0
                            : updatedLines.indexOf(headers[headerNumber - 1]) + 1;
                        updatedLines.splice(insertIndex, 0, taskLine); // Insert task
                    }

                    return updatedLines.join('\n'); // Rejoin markdown content
                }

                let updatedMarkdown;
                let taskUUID;

                // Check which fields have changed and update them
                if (taskNoteuuid) {
                    taskUUID = await app.insertTask({ uuid: taskNoteuuid.uuid }, { text: "" });
                    // console.log("Task is created and taskUUID:", taskUUID);
                }
                if (taskContent) updatedFields.content = taskContent;
                if (taskImportant) updatedFields.important = true;
                if (taskUrgent) updatedFields.urgent = true;
                if (taskScore) updatedFields.score = taskScore;
                // Update task status based on user input
                if (taskStatus === 1) {
                    updatedFields.completedAt = currentTimeUnix;
                    // console.log("Task marked as completed.");
                } else if (taskStatus === 2) {
                    updatedFields.dismissedAt = currentTimeUnix;
                    // console.log("Task marked as dismissed.");
                } else if (taskStatus === 3) {
                    updatedFields.startAt = currentTimeUnix;
                    // console.log("Task marked as started.");
                }
                // Update the task if any fields have changed
                if (Object.keys(updatedFields).length > 0) {
                    await app.updateTask(taskUUID, updatedFields);
                    // console.log("Task Updated with changes:", updatedFields);
                } else {
                    // console.log("No changes detected, task not updated.");
                }

                if (notesections >= 0 && taskNoteuuid.uuid) {
                    updatedMarkdown = await moveTaskToHeader(taskNoteuuid.uuid, taskUUID, notesections);
                    // console.log("updatedMarkdown", updatedMarkdown);
                    await app.replaceNoteContent({ uuid: taskNoteuuid.uuid }, updatedMarkdown);
                    // console.log("Task Moved Successfully.");
                }

            } else {
                // User canceled the prompt
                return;
            }

            // Function to refresh the Kanban Plugin Page
            async function refreshKanbanPage() {
                const destNoteUUID = await app.settings["Current_Note_UUID [Do not Edit!]"];

                // Replace current selection with a message indicating page refresh
                await app.replaceNoteContent({ uuid: destNoteUUID }, `Refreshing the Page!`);

                // Wait for 3 seconds, then replace the note content with the plugin's object data
                setTimeout(async () => {
                    await app.replaceNoteContent({ uuid: destNoteUUID }, `<object data="plugin://${app.context.pluginUUID}" data-aspect-ratio="1" />`);

                    // Navigate to the refreshed page after content is updated
                    app.navigate(`https://www.amplenote.com/notes/${destNoteUUID}`);
                    // console.log("Page refreshed!");
                }, 100);
            }

            // Call the function to refresh the page
            refreshKanbanPage();

        } else if (args[0] === "createNewNote") {
            const details = args[0];
            // console.log("details:", details);

            // Display prompt to note creation settings
            const result = await app.prompt(`Details for New Note Creation`, {
                inputs: [
                    { label: "Enter a Note Name:", type: "string" },
                    { label: "Select a Note as Template w/ Tasks: (Optional)", type: "note" }
                ]
            });

            if (result) {
                // console.log("result", result);
                const [noteName, copyNote] = result;
                // console.log("noteName:", noteName);
                // console.log("copyNote:", copyNote);
                const kanbanTagz = await app.settings["Kanban Filter Tag"];
                const uuidz = await app.createNote(noteName, [kanbanTagz || "-reports/-kanban"]);
                // console.log("uuidz:", uuidz);
                // console.log("createNote Successful");
                if (copyNote) {
                    const markdown = await app.getNoteContent({ uuid: copyNote.uuid });
                    // console.log("markdown:", markdown);
                    await app.replaceNoteContent({ uuid: uuidz }, markdown);
                    // console.log("Template Successfully Pasted");
                } else {
                    const note = await app.notes.find(uuidz);
                    const taskUUID = await note.insertTask({ content: "Temp: This Task is created by [Kanban Plugin](https://www.amplenote.com/plugins?sort_by=newest)" });
                }

            } else {
                return; // User canceled the prompt
            }

            // Function to refresh the Kanban Plugin Page
            async function refreshKanbanPage() {
                const destNoteUUID = await app.settings["Current_Note_UUID [Do not Edit!]"];

                // Replace current selection with a message indicating page refresh
                await app.replaceNoteContent({ uuid: destNoteUUID }, `Refreshing the Page!`);

                // Wait for 3 seconds, then replace the note content with the plugin's object data
                setTimeout(async () => {
                    await app.replaceNoteContent({ uuid: destNoteUUID }, `<object data="plugin://${app.context.pluginUUID}" data-aspect-ratio="1" />`);

                    // Navigate to the refreshed page after content is updated
                    app.navigate(`https://www.amplenote.com/notes/${destNoteUUID}`);
                    // console.log("Page refreshed!");
                }, 100);
            }

            // Call the function to refresh the page
            refreshKanbanPage();

        } else if (args[0] === "updateTag") {
            const details = args[0];
            // console.log("details:", details);

            // Handle sorting settings
            const tagSetting = await app.settings["Kanban Filter Tag"];
            // console.log("tagSetting:", tagSetting);

            // Display prompt to Update Tag settings
            const result = await app.prompt(`Details for Tag Filtering in Kanban. Current Selection:[${tagSetting}]`, {
                inputs: [
                    { label: "Select a Tag: (1)", type: "tags", limit: 1, value: tagSetting }
                ]
            });

            if (result) {
                // console.log("result", result);
                await app.setSetting("Kanban Filter Tag", result);
                // console.log("Tag updated successfully");
            } else {
                return; // User canceled the prompt
            }

            // Function to refresh the Kanban Plugin Page
            async function refreshKanbanPage() {
                const destNoteUUID = await app.settings["Current_Note_UUID [Do not Edit!]"];

                // Replace current selection with a message indicating page refresh
                await app.replaceNoteContent({ uuid: destNoteUUID }, `Refreshing the Page!`);

                // Wait for 3 seconds, then replace the note content with the plugin's object data
                setTimeout(async () => {
                    await app.replaceNoteContent({ uuid: destNoteUUID }, `<object data="plugin://${app.context.pluginUUID}" data-aspect-ratio="1" />`);

                    // Navigate to the refreshed page after content is updated
                    app.navigate(`https://www.amplenote.com/notes/${destNoteUUID}`);
                    // console.log("Page refreshed!");
                }, 100);
            }

            // Call the function to refresh the page
            refreshKanbanPage();

        } else if (args[0] === "togglesort") {
            // Handle sorting settings
            const sortSetting = await app.settings["Toggle Sort"];
            // console.log("sortSetting:", sortSetting);

            // Display prompt to toggle sort settings
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
                // console.log("result", result);
                await app.setSetting("Toggle Sort", result);
            } else {
                return; // User canceled the prompt
            }

            // Function to refresh the Kanban Plugin Page
            async function refreshKanbanPage() {
                const destNoteUUID = await app.settings["Current_Note_UUID [Do not Edit!]"];

                // Replace current selection with a message indicating page refresh
                await app.replaceNoteContent({ uuid: destNoteUUID }, `Refreshing the Page!`);

                // Wait for 3 seconds, then replace the note content with the plugin's object data
                setTimeout(async () => {
                    await app.replaceNoteContent({ uuid: destNoteUUID }, `<object data="plugin://${app.context.pluginUUID}" data-aspect-ratio="1" />`);

                    // Navigate to the refreshed page after content is updated
                    app.navigate(`https://www.amplenote.com/notes/${destNoteUUID}`);
                    // console.log("Page refreshed!");
                }, 100);
            }

            // Call the function to refresh the page
            refreshKanbanPage();

        } else if (args[0] === "refreshPage") {

            // Function to refresh the Kanban Plugin Page
            async function refreshKanbanPage() {
                const destNoteUUID = await app.settings["Current_Note_UUID [Do not Edit!]"];

                // Replace current selection with a message indicating page refresh
                await app.replaceNoteContent({ uuid: destNoteUUID }, `Refreshing the Page!`);

                // Wait for 3 seconds, then replace the note content with the plugin's object data
                setTimeout(async () => {
                    await app.replaceNoteContent({ uuid: destNoteUUID }, `<object data="plugin://${app.context.pluginUUID}" data-aspect-ratio="1" />`);

                    // Navigate to the refreshed page after content is updated
                    app.navigate(`https://www.amplenote.com/notes/${destNoteUUID}`);
                    // console.log("Page refreshed!");
                }, 100);
            }

            // Call the function to refresh the page
            refreshKanbanPage();

        } else {
            // console.log("Does not seem to be working!", args);
        }
    },
/* ----------------------------------- */
async renderEmbed(app, ...args) {
        let _args = JSON.stringify(args[0]);
        // console.log(_args);

        let htmlTemplate = ""; // Placeholder for HTML output (if needed)
        let allTasksText; // Stores the JSON string of all tasks for logging
        let taskSorting; // Stores the current sorting setting

        // Check if any notes have the tag "-reports/-kanban"
        const kanbanTagz = await app.settings["Kanban Filter Tag"];
        const kanbanTag = (await app.filterNotes({ tag: kanbanTagz || "-reports/-kanban" })).length > 0;
        // console.log("kanbanTag:", kanbanTag);

        /**
         * Formats the task's repeat information.
         * @param {string} repeatInfo - The task's repeat information in a specific string format.
         * @returns {string} - A formatted string displaying the repeat frequency, start date, and time.
         */
        function formatTaskRepeat(repeatInfo) {
            if (!repeatInfo || typeof repeatInfo !== 'string') {
                return "Not Available"; // Return default message if repeatInfo is missing or not a string
            }

            // Split the repeatInfo into lines
            const lines = repeatInfo.split('\n').map(line => line.trim());

            // Extract date and time from DTSTART
            const dtstartLine = lines[0];
            const rruleLine = lines[1];

            const dtstart = dtstartLine.substring(8); // Remove 'DTSTART:'
            const year = dtstart.substring(0, 4);
            const month = dtstart.substring(4, 6);
            const day = dtstart.substring(6, 8);
            const hours = dtstart.substring(8, 10);
            const minutes = dtstart.substring(10, 12);
            const seconds = dtstart.substring(12, 14);

            // Format date and time
            const formattedDate = `${month}/${day}/${year}`;
            const formattedTime = `${hours}:${minutes}:${seconds}`;

            // Parse RRULE to get the repeat frequency
            const rrule = rruleLine.substring(10); // Remove 'RRULE:FREQ='
            const repeatFrequency = rrule.toUpperCase(); // Convert frequency to uppercase

            // Format and return the output
            return `${repeatFrequency.charAt(0).toUpperCase() + repeatFrequency.slice(1).toLowerCase()} <b>Starts At:</b> ${formattedDate} at ${formattedTime}`;
        }

        /**
         * Formats a Unix timestamp into a readable date and time string.
         * @param {number} timestamp - The Unix timestamp (in seconds).
         * @returns {string} - A formatted string with the date and time or "Not Set!" if no timestamp.
         */
        function formatTimestamp(timestamp) {
            if (!timestamp) {
                return 'Not Set!'; // Return if timestamp is null or undefined
            }

            // Create a new Date object from the Unix timestamp (in milliseconds)
            const date = new Date(timestamp * 1000);

            // Extract date and time components
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            // Format and return date and time
            const formattedDate = `${month}/${day}/${year}`;
            const formattedTime = `${hours}:${minutes}:${seconds}`;

            return `${formattedDate} at ${formattedTime}`;
        }

        if (kanbanTag) {
            let allTasks = []; // Array to store all tasks

            // Retrieve notes with the kanban tag
            const noteHandles = await app.filterNotes({ tag: kanbanTagz || "-reports/-kanban" });
            // console.log("noteHandles:", noteHandles);

            // Iterate through each note to retrieve tasks
            for (let note of noteHandles) {
                const noteUUID = note.uuid;
                const noteTags = note.tags.join(", ");
                // console.log("noteUUID:", noteUUID);
                // console.log("noteTags:", noteTags);

                // Fetch tasks from the current note
                const tasks = await app.getNoteTasks({ uuid: noteUUID }, { includeDone: true });
                // console.log("tasks:", tasks);

                // Process each task and add relevant info
                for (let i = 0; i < tasks.length; i++) {
                    const task = tasks[i];
                    allTasks.push({
                        ...task,
                        notename: note.name,
                        noteurl: `https://www.amplenote.com/notes/${note.uuid}`,
                        tags: noteTags,
                        startAtz: `${formatTimestamp(task.startAt)}`,
                        hideUntilz: `${formatTimestamp(task.hideUntil)}`,
                        endAtz: `${formatTimestamp(task.endAt)}`,
                        repeatz: `${formatTaskRepeat(task.repeat)}`,
                        taskInfo: `<b>Important:</b> ${task.important}<br><b>Urgent:</b> ${task.urgent}<br><b>Score:</b> ${task.score.toFixed(2)}<br><hr><b>Start At:</b> ${formatTimestamp(task.startAt)}<br><b>Hide Until:</b> ${formatTimestamp(task.hideUntil)}<br><b>End At:</b> ${formatTimestamp(task.endAt)}<br><b>Repeat:</b> ${formatTaskRepeat(task.repeat)}<br><hr><b>Completed At:</b> ${formatTimestamp(task.completedAt)}<br><b>Dismissed At:</b> ${formatTimestamp(task.dismissedAt)}<br><hr><b>Note Link:</b> <a href="https://www.amplenote.com/notes/${note.uuid}" target="_blank">${note.name}</a><br><b>Tags:</b> ${noteTags}`
                    });
                }
            }

            // console.log("allTasks:", allTasks);

            // Sorting logic based on user settings
            taskSorting = app.settings["Toggle Sort"] || 'taskScore'; // Default to 'taskScore' if not set
            if (taskSorting === 'startDate') {
                allTasks.sort((a, b) => new Date(b.startAtz) - new Date(a.startAtz));
            }
            if (taskSorting === 'taskScore') {
                allTasks.sort((a, b) => b.score - a.score);
            }
            if (taskSorting === 'important') {
                allTasks.sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));
            }
            if (taskSorting === 'urgent') {
                allTasks.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
            }

            // Convert all tasks to JSON for logging
            allTasksText = JSON.stringify(allTasks, null, 2);
            // console.log("allTasksText:", allTasksText);

        } else {
            // Define the headers for Kanban notes
            const headersBig = ["To Do", "In Progress", "Review", "Blocked", "Completed", "Backlog", "On Hold", "Ready for Testing", "Deployed", "Archived"];
            const headersSmall = ["To Do", "In Progress", "Review", "Completed"];
            const goalsSmall = ["Life Goals", "Yearly Goals", "Monthly Goals", "Today's Tasks"];
            // console.log("headersBig:", headersBig);
            // console.log("headersSmall:", headersSmall);
            // console.log("goalsSmall:", goalsSmall);

            // Create initial notes for Kanban if none exist
            for (const header of goalsSmall) {
                const uuid = await app.createNote(header, ["-reports/-kanban"]);
                await app.setSetting("Kanban Filter Tag", "-reports/-kanban");
                // console.log("uuid:", uuid);

                // Alert the user upon successful note creation
                app.alert("Success! Looks like it’s your first time running the program, so we created a few notes with a specific tag to get you rolling. Now you can run the Kanban Plugin again and see at your brand-new board!");
            }
        }

        htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kanban Board</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        #kanban-board {
            display: flex;
            overflow-x: auto;
            gap: 10px;
            padding-bottom: 20px;
        }
        .column {
            flex: 0 0 auto;
            min-width: 300px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background: transparent;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 10px;
        }
        .task-category {
            margin-bottom: 10px;
            cursor: pointer;
        }
        .task-category h3 {
            margin: 0;
            padding: 10px;
            background: transparent;
            border-radius: 10px;
        }
        .task {
            padding: 5px;
            border-radius: 5px;
            margin-bottom: 5px;
            color: black;
            font-size: 14px;
            position: relative;
            transition: background-color 0.3s;
			max-width: 300px;
        }
        .task-button {
            background-color: transparent;
			border-radius: 5px;
            border: none;
            color: #fff;
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
			position: absolute;
			right: 5px;
        }
        .task-button:hover {
			background-color: black;
            color: #ddd;
        }
        .task-button2 {
            background-color: transparent;
			border-radius: 5px;
            border: none;
            color: #fff;
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
			position: absolute;
			right: 20px;
        }
        .task-button2:hover {
			background-color: black;			
            color: #ddd;
        }
        .task-button3 {
            background-color: transparent;
			border-radius: 5px;
            border: none;
            color: #fff;
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
        }
        .task-button3:hover {
			background-color: black;			
            color: #ddd;
        }
.high-urgent.high-important {
    background: radial-gradient(1023px at 3.1% 6.9%, rgb(255, 230, 230) 0%, rgb(165, 30, 63) 74.9%); /* Lighter red to darker red */
}

.high-urgent.low-important {
    background: radial-gradient(1023px at 3.1% 6.9%, rgb(255, 235, 200) 0%, rgb(221, 98, 98) 74.9%); /* Lighter orange to darker orange */
}

.low-urgent.high-important {
    background: radial-gradient(1023px at 3.1% 6.9%, rgb(230, 245, 255) 0%, rgb(82, 139, 215) 74.9%); /* Lighter blue to darker blue */
}

.low-urgent.low-important {
    background: radial-gradient(1023px at 3.1% 6.9%, rgb(240, 240, 240) 0%, rgb(139, 139, 139) 74.9%); /* Lighter gray to darker gray */
}
        .task-info {
            display: none;
            position: relative;
            top: 100%;
            left: 30;
            background-color: #fff;
            color: #000;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            z-index: 1000;
        }
    </style>
</head>
<body>
    <button id="cycleButton">Toggle Sort: <div id="valueDisplay">None</div></button>
	<button id="createNewNote">Create New Note</button>
	<button id="updateTag">Update Tag</button>
	<button id="refreshPage">Refresh Page</button>
    <br><br>
    <div id="kanban-board"></div>

    <script>
        
  const tasks = ${allTasksText};
  // console.log("tasks:", tasks);

try {
    /**
     * Determines the CSS class based on the task's urgency and importance.
     * 
     * @param {Object} task - The task object containing urgency and importance flags.
     * @returns {string} CSS class that reflects the urgency and importance level of the task.
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

    /**
     * Update the tag used in Kanban
     */
    function refreshPagecall() {
		window.callAmplenotePlugin("refreshPage")
    }

    refreshPage.addEventListener('click', refreshPagecall);

    /**
     * Update the tag used in Kanban
     */
    function updateTagcall() {
		window.callAmplenotePlugin("updateTag")
    }

    updateTag.addEventListener('click', updateTagcall);

    /**
     * Create a new note call function.
     */
    function createNewNotecall() {
		window.callAmplenotePlugin("createNewNote")
    }

    createNewNote.addEventListener('click', createNewNotecall);

    /**
     * Cycles through sorting values (Start Date, Score, Important, Urgent),
     * updates the display, and re-renders the Kanban board.
     */
    function updateValue() {
        valueDisplay.textContent = values[currentIndex];
        currentIndex = (currentIndex + 1) % values.length;
        renderKanbanBoard();
        window.callAmplenotePlugin("togglesort");
    }

    cycleButton.addEventListener('click', updateValue);

    /**
     * Displays detailed task information when hovering over a task.
     * 
     * @param {Object} task - The task object containing detailed information.
     * @param {HTMLElement} element - The DOM element representing the task.
     */
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

    /**
     * Hides the task information when the mouse leaves the task element.
     * 
     * @param {HTMLElement} element - The DOM element representing the task.
     */
    function hideTaskInfo(element) {
        const infoDiv = element.querySelector('.task-info');
        if (infoDiv) {
            infoDiv.style.display = 'none';
        }
    }

    /**
     * Helper function to create a button for task items.
     * 
     * @param {string} text - The text content of the button.
     * @param {string} className - The CSS class to be applied to the button.
     * @param {function} clickHandler - The function to handle click events.
     * @returns {HTMLElement} The created button element.
     */
    function createButton(text, className, clickHandler) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        button.onclick = clickHandler;
        return button;
    }

    /**
     * Creates and appends a task item to the specified container.
     * 
     * @param {Object} task - The task object to be displayed.
     * @param {HTMLElement} container - The DOM element representing the task list (pending, completed, or dismissed).
     * @param {boolean} isPending - Whether the task is in the pending state (default is true).
     */
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

    /**
     * Sorts tasks based on the specified sorting criterion (Start Date, Score, Important, Urgent).
     * 
     * @param {Array} tasks - The array of tasks to be sorted.
     * @param {string} sortBy - The criterion to sort the tasks by.
     * @returns {Array} The sorted array of tasks.
     */
    function sortTasks(tasks, sortBy) {
        switch (sortBy) {
            case 'Start Date':
                return tasks.sort((a, b) => new Date(b.startAtz) - new Date(a.startAtz));
            case 'Score':
                return tasks.sort((a, b) => b.score - a.score);
            case 'Important':
                return tasks.sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));
            case 'Urgent':
                return tasks.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
            default:
                return tasks;
        }
    }

    /**
     * Renders the Kanban board by creating columns for each note and sorting tasks into pending, completed, and dismissed.
     */
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

        board.innerHTML = '';  // Clear board before rendering

		Object.keys(columns).forEach(note => {
			const column = document.createElement('div');
			column.className = 'column';

			// Create the header with note name
			const header = document.createElement('h3');
			header.textContent = note;
			header.className = 'task-category';
			column.appendChild(header);
			header.append(createButton('➕', 'task-button3', () => window.callAmplenotePlugin("createTask", note)));

			// Pending tasks list
			const pendingList = document.createElement('div');
			pendingList.append(document.createTextNode('Pending: '));
			sortTasks(columns[note].pending, valueDisplay.textContent).forEach(task => createTaskItem(task, pendingList));

			// Completed tasks list
			const completedList = document.createElement('div');
			completedList.appendChild(document.createTextNode('Completed:'));
			columns[note].completed.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
				.forEach(task => createTaskItem(task, completedList, false));

			// Dismissed tasks list
			const dismissedList = document.createElement('div');
			dismissedList.appendChild(document.createTextNode('Dismissed:'));
			columns[note].dismissed.sort((a, b) => new Date(b.dismissedAt) - new Date(a.dismissedAt))
				.forEach(task => createTaskItem(task, dismissedList, false));

			// Append lists to the column
			column.appendChild(pendingList);
			column.appendChild(completedList);
			column.appendChild(dismissedList);

			// Append the column to the board
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

        return (htmlTemplate);
        // console.log(htmlTemplate);

    },

}