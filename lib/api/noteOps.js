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
 * Swaps a tag on a note by removing fromTag and adding toTag.
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID - The note being retagged.
 * @param {string} [fromTag] - Tag to remove.
 * @param {string} [toTag] - Tag to add.
 * @returns {Promise<boolean>} whether any tag change was made.
 */
export async function swapNoteTag(app, noteUUID, fromTag, toTag) {
  const handle = { uuid: noteUUID };
  let changed = false;
  const cleanFrom = fromTag ? String(fromTag).replace(/^#/, "").trim() : null;
  const cleanTo = toTag ? String(toTag).replace(/^#/, "").trim() : null;

  if (cleanFrom && cleanFrom !== cleanTo) {
    try {
      await app.removeNoteTag(handle, cleanFrom);
      changed = true;
    } catch (err) {
      console.warn("Failed to remove tag from note:", err);
    }
  }
  if (cleanTo && cleanTo !== cleanFrom) {
    try {
      await app.addNoteTag(handle, cleanTo);
      changed = true;
    } catch (err) {
      console.warn("Failed to add tag to note:", err);
    }
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
  return tags.length ? app.createNote(clean, tags) : app.createNote(clean);
}

/**
 * Opens a note in the main editor.
 * @param {Object} app - The Amplenote app context.
 * @param {string} noteUUID
 */
export async function openNote(app, noteUUID) {
  await app.navigate(`https://www.amplenote.com/notes/${noteUUID}`);
}

/**
 * Opens notes filtered by tag in Amplenote.
 * @param {Object} app - The Amplenote app context.
 * @param {string} tag - Tag name.
 */
export async function openTag(app, tag) {
  const clean = String(tag || "").trim().replace(/^#/, "").trim();
  if (!clean) return;
  await app.navigate(`https://www.amplenote.com/notes?tag=${encodeURIComponent(clean)}`);
}
