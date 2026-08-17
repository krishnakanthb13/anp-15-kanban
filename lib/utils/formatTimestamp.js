/**
 * Formats a Unix timestamp into a readable date and time string.
 * @param {number} timestamp - The Unix timestamp (in seconds).
 * @returns {string} - A formatted string with the date and time or "Not Set!" if no timestamp.
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) {
    return 'Not Set!';
  }

  const date = new Date(timestamp * 1000);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const formattedDate = `${month}/${day}/${year}`;
  const formattedTime = `${hours}:${minutes}:${seconds}`;

  return `${formattedDate} at ${formattedTime}`;
}
