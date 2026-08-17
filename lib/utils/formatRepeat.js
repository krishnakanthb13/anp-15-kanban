/**
 * Formats the task's repeat information.
 * @param {string} repeatInfo - The task's repeat information in RRULE string format.
 * @returns {string} - A formatted string displaying the repeat frequency, start date, and time.
 */
export function formatTaskRepeat(repeatInfo) {
  if (!repeatInfo || typeof repeatInfo !== 'string') {
    return "Not Available";
  }

  const lines = repeatInfo.split('\n').map(line => line.trim());

  const dtstartLine = lines[0];
  const rruleLine = lines[1];

  const dtstart = dtstartLine.substring(8); // Remove 'DTSTART:'
  const year = dtstart.substring(0, 4);
  const month = dtstart.substring(4, 6);
  const day = dtstart.substring(6, 8);
  const hours = dtstart.substring(8, 10);
  const minutes = dtstart.substring(10, 12);
  const seconds = dtstart.substring(12, 14);

  const formattedDate = `${month}/${day}/${year}`;
  const formattedTime = `${hours}:${minutes}:${seconds}`;

  const rrule = rruleLine.substring(10); // Remove 'RRULE:FREQ='
  const repeatFrequency = rrule.toUpperCase();

  return `${repeatFrequency.charAt(0).toUpperCase() + repeatFrequency.slice(1).toLowerCase()} <b>Starts At:</b> ${formattedDate} at ${formattedTime}`;
}
