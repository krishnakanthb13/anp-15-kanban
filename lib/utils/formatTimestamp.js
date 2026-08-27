import { DEFAULT_DATE_FORMAT } from "../core/constants.js";

/**
 * Formats a Unix timestamp into a readable date and time string based on the configured dateFormat.
 * @param {number} timestamp - The Unix timestamp (in seconds).
 * @param {string} [format="YYYY-MM-DD"] - The date format template (e.g. "YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY").
 * @returns {string} - A formatted string with the date and time or "Not Set!" if no timestamp.
 */
export function formatTimestamp(timestamp, format = DEFAULT_DATE_FORMAT) {
  if (!timestamp || typeof timestamp !== "number") {
    return "Not Set!";
  }

  const date = new Date(timestamp * 1000);
  if (isNaN(date.getTime())) return "Not Set!";

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const datePart = String(format || DEFAULT_DATE_FORMAT)
    .replace(/YYYY/g, year)
    .replace(/MM/g, month)
    .replace(/DD/g, day);

  const formattedTime = `${hours}:${minutes}:${seconds}`;

  return `${datePart} at ${formattedTime}`;
}
