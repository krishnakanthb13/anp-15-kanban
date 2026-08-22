({
    async noteOption(app, noteUUID) {
        const note = await app.notes.find(noteUUID);
        // const uuid = await app.createNote(`Kanban - ${note.name}`, ["kanban"]);
        // app.navigate(`https://www.amplenote.com/notes/${uuid}`);?
        app.insertNoteContent({ uuid: noteUUID }, `<object data="plugin://${app.context.pluginUUID}?${noteUUID}" data-aspect-ratio="1" />`);
        // app.openSidebarEmbed(1, noteUUID);
    },
    async renderEmbed(app, ...args) {
        this.noteUUID = args[0];
        try {
            const attachments = await app.getNoteAttachments(app.context.pluginUUID);
            const attachment = attachments.find(attachment => attachment.name === "build.html.json");
            if (!attachment) throw new Error("build.html.json attachment not found");
            return this._getAttachmentContent(app, attachment.uuid);
        } catch (error) {
            return `<div><em>renderEmbed error:</em> ${error.toString()}</div>`;
        }
    },
    async onEmbedCall(app, ...args) {
        if (args[0] == "get_taskmap") {
            const markdown = await app.getNoteContent({ uuid: this.noteUUID });
            let taskMap = await this.mapTasksToHeadings(app, markdown);
            console.log(taskMap)

            return taskMap
        }
        else if (args[0] == "get_colmap") {
            const markdown = await app.getNoteContent({ uuid: this.noteUUID });
            let colMap = await this.extractHeadings(markdown);
            console.log(colMap)

            return colMap
        }
        else if (args[0] == "update_note") {
            console.log("updating note")
            let embed_code = `<object data="plugin://${app.context.pluginUUID}?${this.noteUUID}" data-aspect-ratio="1" />`

            await app.replaceNoteContent({ uuid: this.noteUUID }, embed_code + '\n\n' + args[1]);
        }
        else if (args[0] == "add_task") {
            console.log(args)
            const taskUUID = await app.insertTask({ uuid: this.noteUUID }, { content: args[1] });
            const task = await app.getTask(taskUUID);

            return task
        }
        else if (args[0] == "update_task") {
            await app.updateTask(args[1], args[2]);
        }
        else if (args[0] === "prompt") {
            let result = await app.prompt(args[1]);
            return result.replace(/\n/g, '');
        }
        console.log("onEmbedCall", args);
        return "result";
    },

    async _getAttachmentContent(app, attachmentUUID) {
        const url = await app.getAttachmentURL(attachmentUUID);

        const proxyURL = new URL("https://plugins.amplenote.com/cors-proxy");
        proxyURL.searchParams.set("apiurl", url);

        const response = await fetch(proxyURL);
        return response.text();
    },
    async mapTasksToHeadings(app, markdown) {
        const headingRegex = /^(#+) (.+)$/gm;
        const taskRegex = /- \[ \] (.+?)<!-- {"uuid":"(.+?)"} -->/g;
        const mapping = [];
        let currentHeading = '';

        const lines = markdown.split('\n');

        for (const line of lines) {
            const headingMatch = headingRegex.exec(line);
            if (headingMatch) {
                // Store current heading
                currentHeading = headingMatch[2].trim();
            } else {
                // Match tasks under the current heading
                const taskMatch = taskRegex.exec(line);
                if (taskMatch && currentHeading) {
                    const taskContent = taskMatch[1].trim();
                    const taskUUID = taskMatch[2].trim();

                    // Fetch task information
                    const taskInfo = await app.getTask(taskUUID);
                    taskInfo.column = currentHeading.toLowerCase().replace(/ /g, "-");
                    if (taskInfo) {
                        mapping.push(taskInfo);
                    }
                }
            }
        }
        return mapping;
    },
    async extractHeadings(markdown) {
        const headingRegex = /^(#+) (.+)$/gm;
        const headingList = [];

        let match;
        while ((match = headingRegex.exec(markdown)) !== null) {
            const heading = match[2].trim();
            if (heading !== 'Completed tasks<!-- {"omit":true} -->') {
                headingList.push(heading);
            }
        }

        return headingList;
    }
})