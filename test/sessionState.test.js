import { jest } from '@jest/globals';
import { bumpRoundTrips, getSessionSnapshot } from '../lib/core/sessionState.js';

describe("sessionState", () => {
  it("bumps and snapshots the round-trip counter", () => {
    const before = getSessionSnapshot().roundTrips;
    const value = bumpRoundTrips();
    expect(value).toBe(before + 1);
    expect(getSessionSnapshot().roundTrips).toBe(value);
  });

  it("returns a copy (snapshot mutations do not leak)", () => {
    const snap = getSessionSnapshot();
    snap.roundTrips = 99999;
    expect(getSessionSnapshot().roundTrips).not.toBe(99999);
  });
});
