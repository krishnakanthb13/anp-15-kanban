/**
 * Tag boards: one board per tag. Columns are the tag's immediate sub-tags
 * (plus a synthetic "No sub-tag" column); cards are the notes carrying the
 * tag. Data is always queried live via filterNotes, so notes tagged anywhere
 * in Amplenote appear on the board automatically — no sync logic needed.
 */

const NOSUB_ID = "nosub";
const SUB_PREFIX = "sub:";

/**
 * Returns the immediate children of a tag (grandchildren excluded — they
 * belong to their own parent column, keeping the board two-dimensional).
 * @param {string} baseTag - The board's root tag, e.g. "projects".
 * @param {Array<{text: string, color?: string}>} tags - All account tags.
 * @returns {Array<{text: string, color: string|null}>}
 */
export function immediateSubTags(baseTag, tags) {
  const prefix = `${baseTag}/`;
  return (tags || [])
    .filter(t => typeof t?.text === "string" && t.text.startsWith(prefix))
    .filter(t => !t.text.slice(prefix.length).includes("/"))
    .map(t => ({ text: t.text, color: t.color || null }));
}

/**
 * Resolves which column a note belongs to based on its tags.
 * A note carrying several sub-tags lands in the first match (document order).
 * @param {string} baseTag
 * @param {Array<{text: string}>} subTags - Immediate sub-tags of the board tag.
 * @param {string[]} noteTags - The note's tags.
 * @returns {string} column id ("sub:<text>" or "nosub").
 */
export function columnForNote(baseTag, subTags, noteTags) {
  const set = new Set(noteTags || []);
  const hit = subTags.find(st => set.has(st.text));
  return hit ? SUB_PREFIX + hit.text : NOSUB_ID;
}

/**
 * Builds a tag board snapshot via live account queries.
 *
 * @param {Object} app - The Amplenote app context.
 * @param {string} tag - The board's root tag.
 * @returns {Promise<{kind: string, tag: string, columns: Array, hasHeadings: boolean}>}
 */
export async function buildTagBoard(app, tag) {
  if (!tag) {
    return { kind: "tag", tag, columns: [], hasHeadings: false };
  }

  const [allTags, notes] = await Promise.all([
    app.getTags() || [],
    app.filterNotes({ tag }) || [],
  ]);

  const subs = immediateSubTags(tag, allTags);
  const byId = new Map();

  const makeColumn = (id, name, color) => {
    const col = { id, name, color, wipLimit: null, cards: [] };
    byId.set(id, col);
    return col;
  };

  subs.forEach(st => makeColumn(SUB_PREFIX + st.text, st.text.slice(tag.length + 1), st.color));
  makeColumn(NOSUB_ID, "No sub-tag", null);

  for (const note of notes) {
    const col = byId.get(columnForNote(tag, subs, note.tags)) || byId.get(NOSUB_ID);
    col.cards.push(toNoteCard(note));
  }

  // Drop empty sub-tag columns that don't exist in the account anymore is
  // unnecessary (they come FROM getTags), but keep stable ordering: sub-tags
  // in account order, then No sub-tag last.
  const columns = [...byId.values()];

  return {
    kind: "tag",
    tag,
    columns,
    hasHeadings: true,
  };
}

/**
 * Maps a noteHandle to the serializable card model used by the embed.
 * @param {{uuid: string, name?: string, tags?: string[]}} note
 */
export function toNoteCard(note) {
  return {
    id: note.uuid,
    title: note.name || "Untitled note",
    tags: note.tags || [],
    completedAt: null,
    startAt: null,
    deadline: null,
    imageUrl: null,
    html: null,
    isNoteCard: true,
  };
}

export { NOSUB_ID, SUB_PREFIX };
