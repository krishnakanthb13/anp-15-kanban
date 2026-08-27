import { formatTimestamp } from '../lib/utils/formatTimestamp.js';

describe("formatTimestamp", () => {
  it("returns 'Not Set!' for null/undefined/invalid timestamp", () => {
    expect(formatTimestamp(null)).toBe("Not Set!");
    expect(formatTimestamp(undefined)).toBe("Not Set!");
    expect(formatTimestamp(0)).toBe("Not Set!");
    expect(formatTimestamp("invalid")).toBe("Not Set!");
  });

  it("formats timestamp with default YYYY-MM-DD format", () => {
    // 1700000000 -> 2023-11-14 (UTC/local)
    const res = formatTimestamp(1700000000);
    expect(res).toContain(" at ");
    expect(res).toMatch(/\d{4}-\d{2}-\d{2} at \d{2}:\d{2}:\d{2}/);
  });

  it("formats timestamp with custom DD/MM/YYYY format", () => {
    const res = formatTimestamp(1700000000, "DD/MM/YYYY");
    expect(res).toMatch(/\d{2}\/\d{2}\/\d{4} at \d{2}:\d{2}:\d{2}/);
  });

  it("formats timestamp with custom MM/DD/YYYY format", () => {
    const res = formatTimestamp(1700000000, "MM/DD/YYYY");
    expect(res).toMatch(/\d{2}\/\d{2}\/\d{4} at \d{2}:\d{2}:\d{2}/);
  });
});
