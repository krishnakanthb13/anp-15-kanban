/**
 * Moves a task to a specific header section within a note's markdown content.
 * Deduplicated from 2 identical copies across the original monolith.
 *
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID - The UUID of the note containing the task.
 * @param {string} uuidToMove - The UUID of the task to move.
 * @param {number} headerNumber - The header index to move the task under.
 * @returns {Promise<string>} - The updated markdown content.
 */
export async function moveTaskToHeader(app, noteUUID, uuidToMove, headerNumber) {
  try {
    const markdown = await app.getNoteContent({ uuid: noteUUID });
    if (!markdown) return '';

    const lines = markdown.split('\n');
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
      const insertIndex = headerNumber === 0
        ? 0
        : updatedLines.indexOf(headers[headerNumber - 1]) + 1;
      updatedLines.splice(insertIndex, 0, taskLine);
    }

    return updatedLines.join('\n');
  } catch (error) {
    console.error(`Error moving task ${uuidToMove} to header:`, error);
    return '';
  }
}
