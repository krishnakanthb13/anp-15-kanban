import { formatTimestamp } from '../lib/utils/formatTimestamp.js';

describe("formatTimestamp", () => {
  describe("Happy Path", () => {
    it("formats a valid unix timestamp correctly", () => {
      // 1697380200 = Oct 15 2023, 14:30:00 UTC
      // Wait, Date uses local time by default, so we mock or use something predictable,
      // but since we don't know the exact local time zone it will run in, 
      // maybe we just check if it returns a string with "at" or parse it back.
      // Better yet, just use a known timestamp and we mock Date or we just test for format regex.
      const timestamp = 1697380200; 
      const result = formatTimestamp(timestamp);
      // Result depends on timezone, but it should be MM/DD/YYYY at HH:MM:SS
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} at \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe("Edge Cases", () => {
    it("returns 'Not Set!' if timestamp is null", () => {
      expect(formatTimestamp(null)).toBe("Not Set!");
    });

    it("returns 'Not Set!' if timestamp is undefined", () => {
      expect(formatTimestamp(undefined)).toBe("Not Set!");
    });

    it("returns 'Not Set!' if timestamp is 0", () => {
      expect(formatTimestamp(0)).toBe("Not Set!");
    });
  });
});
