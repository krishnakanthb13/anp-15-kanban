/**
 * HTML/JSON safety helpers for embedding data into the embed document.
 */

/**
 * Escapes HTML entities in a string.
 * @param {*} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, tag => (
    {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    }[tag]
  ));
}

/**
 * Serializes a value to JSON that is safe to place inside a <script> block:
 * escapes `<` and `>` (prevents `</script>` breakout) and line separators not valid in JS strings.
 * @param {*} value
 * @returns {string}
 */
export function toJsonForScript(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
