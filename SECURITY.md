# Security Audit — Kanban Plugin
**Date**: 2026-08-21 (re-audit after v0.0.9 rebuild, Phases 0–2)
**Auditor**: Agent
**Scope**: `kanban.js`, `lib/**`, embed client script, build artifact

## Summary
| Severity  | Count |
|-----------|-------|
| 🔴 Critical | 0 |
| 🟡 Warning  | 0 |
| 🟢 Passed   | 6 |

## Findings

### 🟡 Warning
- None.

### 🟢 Passed
- **Script-Breakout Prevention (state embedding)**: All dynamic state is serialized into the embed document via `toJsonForScript` (`lib/utils/html.js`), which escapes `<` to `\u003c` and JS line separators — preventing `</script>` breakout from note-derived content (task text, heading names). Covered by unit tests (`html.test.js`, `boardTemplate.test.js`).
- **No innerHTML with dynamic data**: The embed client builds all DOM with `createElement`/`textContent`; `innerHTML` is only ever assigned empty strings for clearing containers. Note/task content can therefore not inject markup.
- **Attribute-selector escaping**: Client-side queries interpolating ids use a `cssEscape` helper (delegates to `CSS.escape`) before building selector strings.
- **Input validation on persisted settings**: Theme ids are validated against the registry (`isValidThemeId`) before `setSetting`; tab config is normalized (`normalizeConfig`) on every load — corrupt or hostile JSON degrades to defaults instead of executing or crashing.
- **Secrets & dangerous APIs**: No hardcoded secrets; no `eval()` / `new Function()` / `document.write` in plugin code.
- **Dependencies**: `npm audit --omit=dev` reports **0 vulnerabilities**.

## Historical (v0.0.1 audit, 2026-07-11)
- Fixed: XSS via unescaped note names/tags in the legacy template's `innerHTML` (the legacy template has since been removed entirely in the rewrite).
- Fixed: transitive npm dependency vulnerabilities resolved via `npm audit fix`.

## Notes for reviewers
- The embed iframe is sandboxed by Amplenote; all privileged operations round-trip through `onEmbedCall`. The client cannot call `app.*` directly.
- Structural note writes are minimal-diff line rewrites of freshly-read markdown; confirm-before-write patterns for destructive column operations are planned for Phase 2 (see `ds.md` §7–§8).
