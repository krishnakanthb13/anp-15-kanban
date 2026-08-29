import { TAG_PREFIX } from "../core/constants.js";
import { formatTimestamp } from "../utils/formatTimestamp.js";

/**
 * Normalizes a raw date / timestamp value into a readable string.
 * @param {number|string|Date} val
 * @param {string} [dateFormat]
 * @returns {string|null}
 */
function normalizeDateStr(val, dateFormat) {
  if (!val) return null;
  if (typeof val === "number") {
    // If timestamp in milliseconds (> 10^11), convert to seconds
    const sec = val > 1e11 ? Math.floor(val / 1000) : val;
    return formatTimestamp(sec, dateFormat);
  }
  if (typeof val === "string") {
    const parsed = Date.parse(val);
    if (!isNaN(parsed)) {
      return formatTimestamp(Math.floor(parsed / 1000), dateFormat);
    }
    return val;
  }
  return null;
}

/**
 * Builds a tags board snapshot where tags are columns and notes matching each tag are cards.
 *
 * @param {Object} app - The Amplenote app context.
 * @param {Array<string>} tags - The list of tags for the board columns.
 * @param {Object} [options]
 * @param {string} [options.dateFormat] - Configured date format template.
 * @returns {Promise<{kind: string, tags: Array<string>, columns: Array, hasHeadings: boolean}>}
 */
export async function buildTagsBoard(app, tags = [], options = {}) {
  const cleanTags = Array.isArray(tags)
    ? tags.map(t => (typeof t === "string" ? t.trim().replace(/^#/, "") : "")).filter(Boolean)
    : [];

  let colorMap = {};
  try {
    const allTags = (await app.getTags()) || [];
    allTags.forEach(t => {
      if (t?.text) {
        colorMap[t.text.toLowerCase().replace(/^#/, "")] = t.color || null;
      }
    });
  } catch {
    colorMap = {};
  }

  const columns = [];
  for (const tag of cleanTags) {
    let notes = [];
    try {
      notes = (await app.filterNotes({ tag })) || [];
    } catch (err) {
      console.warn(`Failed to filter notes for tag ${tag}:`, err);
      notes = [];
    }

    const cards = notes.map(note => {
      const createdStr =
        normalizeDateStr(note.created, options.dateFormat) ||
        normalizeDateStr(note.createdAt, options.dateFormat) ||
        "Not Set!";

      const updatedStr =
        normalizeDateStr(note.updated, options.dateFormat) ||
        normalizeDateStr(note.updatedAt, options.dateFormat) ||
        "Not Set!";

      const tagList = Array.isArray(note.tags)
        ? note.tags.map(t => (typeof t === "string" ? t.replace(/^#/, "") : String(t || "")).trim()).filter(Boolean)
        : [];

      const rawCreated = typeof note.created === "number" ? note.created : (typeof note.createdAt === "number" ? note.createdAt : (Date.parse(note.created || note.createdAt) || 0));
      const rawUpdated = typeof note.updated === "number" ? note.updated : (typeof note.updatedAt === "number" ? note.updatedAt : (Date.parse(note.updated || note.updatedAt) || 0));

      return {
        id: note.uuid,
        title: note.name || "Untitled note",
        noteUUID: note.uuid,
        tags: tagList,
        created: createdStr,
        updated: updatedStr,
        rawCreated,
        rawUpdated,
        isNoteCard: true,
        isTask: false,
        columnTag: tag,
      };
    });

    const tagColor = colorMap[tag.toLowerCase()] || null;

    columns.push({
      id: TAG_PREFIX + tag,
      name: "#" + tag,
      tag: tag,
      color: tagColor,
      wipLimit: null,
      cards,
      isTagColumn: true,
    });
  }

  return {
    kind: "tags",
    tags: cleanTags,
    columns,
    hasHeadings: false,
  };
}

export { TAG_PREFIX };
