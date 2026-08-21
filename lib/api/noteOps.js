/**
 * Note-level operations for tag boards: retagging (drag between sub-tag
 * columns), creating tagged notes, and opening notes.
 */

/**
 * Moves a note between sub-tag columns by swapping its tags. The board's
 * base tag always stays; only the sub-tag component changes.
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID - The note being moved.
 * @param {{fromSub?: string|null, toSub?: string|null}} subs - Full sub-tag
 *   texts (null/"nosub" means the "No sub-tag" column).
 * @returns {Promise<boolean>} whether any tag change was made.
 */
export async function retagNote(app, noteUUID, { fromSub, toSub }) {
  const handle = { uuid: noteUUID };
  let changed = false;

  if (fromSub && fromSub !== toSub) {
    await app.removeNoteTag(handle, fromSub);
    changed = true;
  }
  if (toSub && toSub !== fromSub) {
    await app.addNoteTag(handle, toSub);
    changed = true;
  }
  return changed;
}

/**
 * Creates a note with the given tags.
 * @param {Object} app - The Amplenote app context.
 * @param {string} title - Note name.
 * @param {string[]} [tags] - Tags to assign.
 * @returns {Promise<string|null>} the new note's uuid.
 */
export async function createTaggedNote(app, title, tags = []) {
  const clean = String(title || "").trim();
  if (!clean) return null;
  return app.createNote(clean, tags);
}

/**
 * Opens a note in the main editor.
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID
 */
export async function openNote(app, noteUUID) {
  await app.navigate(`https://www.amplenote.com/notes/${noteUUID}`);
}
