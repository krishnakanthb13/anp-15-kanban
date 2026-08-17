import { formatTaskRepeat } from '../lib/utils/formatRepeat.js';

describe("formatTaskRepeat", () => {
  describe("Happy Path", () => {
    it("formats a daily repeat rule correctly", () => {
      const input = "DTSTART:20231015143000\nRRULE:FREQ=DAILY;INTERVAL=1";
      const expected = "=daily;interval=1 <b>Starts At:</b> 10/15/2023 at 14:30:00";
      expect(formatTaskRepeat(input)).toBe(expected);
    });

    it("formats a weekly repeat rule correctly", () => {
      const input = "DTSTART:20231015143000\nRRULE:FREQ=WEEKLY";
      const expected = "=weekly <b>Starts At:</b> 10/15/2023 at 14:30:00";
      expect(formatTaskRepeat(input)).toBe(expected);
    });
  });

  describe("Edge Cases", () => {
    it("returns 'Not Available' if repeatInfo is null", () => {
      expect(formatTaskRepeat(null)).toBe("Not Available");
    });

    it("returns 'Not Available' if repeatInfo is undefined", () => {
      expect(formatTaskRepeat(undefined)).toBe("Not Available");
    });

    it("returns 'Not Available' if repeatInfo is not a string", () => {
      expect(formatTaskRepeat({})).toBe("Not Available");
      expect(formatTaskRepeat(123)).toBe("Not Available");
    });
  });
});
