/**
 * Tiny module-level session state.
 * The plugin execution context is kept loaded between calls (Appendix II),
 * so this persists for the lifetime of a plugin session — useful as a
 * lightweight round-trip counter and transient flags. Never store
 * authoritative data here; notes/tags/settings are the source of truth.
 */
const session = {
  roundTrips: 0,
};

export function bumpRoundTrips() {
  session.roundTrips += 1;
  return session.roundTrips;
}

/**
 * @returns {{roundTrips: number}} a shallow copy of session state safe to embed in view state.
 */
export function getSessionSnapshot() {
  return { roundTrips: session.roundTrips };
}
