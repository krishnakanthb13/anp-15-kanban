import { firstValue } from '../lib/utils/prompt.js';

describe("prompt utils", () => {
  it("unwraps single-value resolutions", () => {
    expect(firstValue("text")).toBe("text");
    expect(firstValue(true)).toBe(true);
    expect(firstValue(false)).toBe(false);
    expect(firstValue({ uuid: "n1" })).toEqual({ uuid: "n1" });
  });

  it("unwraps array resolutions to the first input", () => {
    expect(firstValue(["a", "b"])).toBe("a");
    expect(firstValue([false])).toBe(false);
  });

  it("maps nullish results to null", () => {
    expect(firstValue(null)).toBeNull();
    expect(firstValue(undefined)).toBeNull();
  });
});
