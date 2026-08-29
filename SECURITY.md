# Security Audit — Kanban Plugin
**Date**: 2026-08-29 (Full security sweep for Tags Board, Quad-Modal Architecture, and Adaptive Controls)
**Auditor**: Antigravity Agent
**Scope**: `kanban.js`, `lib/**`, embed client script, build artifact `build/kanban.compiled.js`

## Summary
| Severity  | Count |
|-----------|-------|
| 🔴 Critical | 0 |
| 🟡 Warning  | 0 |
| 🟢 Passed   | 7 |

## Findings

### 🔴 Critical
- None.

### 🟡 Warning
- None.

### 🟢 Passed
- **Script-Breakout & Injection Prevention (`toJsonForScript`)**: All dynamic state injected into the embed document is serialized using `toJsonForScript` (`lib/utils/html.js`), which escapes `<` to `\u003c` and JS line separators (`\u2028`/`\u2029`), preventing `</script>` breakout from note names, tags, or task content.
- **XSS Prevention & Strict Link Interception**: The embed client script constructs DOM elements via `createElement` and `textContent`. Dynamic link clicks (`a[href]`) are intercepted in the capture phase to prevent external iframe redirection, `javascript:` execution, or iframe breakout; valid Amplenote links route through `openCard`.
- **Secrets & Credentials**: No hardcoded API keys, tokens, passwords, or credentials exist in plugin source files.
- **Dangerous APIs**: No use of `eval()`, `new Function()`, or `document.write()` in runtime application code.
- **Concurrent Write Serialization (`withNoteLock`)**: Thread-safe mutex serialization on markdown mutations prevents race conditions and data corruption across concurrent task moves, column reordering, and note creations.
- **Input Validation & Sanitization**: Settings, theme IDs, and tab configurations are strictly validated and normalized (`normalizeConfig`, `isValidThemeId`) before persistence; corrupted configurations degrade gracefully to safe defaults.
- **Zero Runtime Dependencies**: The plugin is compiled to a pure, self-contained ESM/vanilla JS bundle (`npm audit --omit=dev` reports **0 vulnerabilities**).

---

## Historical Audits

### Audit: 2026-08-21 (Ground-up Rebuild)
- Passed: Script-breakout prevention, DOM construction security, CSS escaping, settings validation, 0 runtime vulnerabilities.

## Historical (v0.0.1 audit, 2026-07-11)
- Fixed: XSS via unescaped note names/tags in the legacy template's `innerHTML` (the legacy template has since been removed entirely in the rewrite).
- Fixed: transitive npm dependency vulnerabilities resolved via `npm audit fix`.

## Notes for reviewers
- The embed iframe is sandboxed by Amplenote; all privileged operations round-trip through `onEmbedCall`. The client cannot call `app.*` directly.
- Structural note writes are minimal-diff line rewrites of freshly-read markdown; destructive operations (column delete, cross-tab column move) are gated behind explicit confirmation prompts in `embedActions`, and cross-tab transfers insert into the target before removing from the source.
- Prompt results are normalized through `firstValue` (`utils/prompt.js`) because single- vs multi-input prompts resolve to different shapes — handlers must never index raw results.
