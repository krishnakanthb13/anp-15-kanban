/**
 * Normalizes an app.prompt result to its first input's value.
 *
 * Per the API docs, a single-input prompt with no actions resolves to that
 * input's value directly (string/boolean/noteHandle), while multi-input
 * prompts resolve to an Array in input order. This helper accepts both
 * shapes so handlers are correct regardless.
 *
 * @param {*} result - Raw app.prompt resolution.
 * @returns {*} The first input's value (or null for nullish results).
 */
export function firstValue(result) {
  if (result === null || result === undefined) return null;
  return Array.isArray(result) ? result[0] : result;
}
