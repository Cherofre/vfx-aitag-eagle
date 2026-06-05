# Next Actions

## Now
- [x] Added Eagle starred/recent tag reads for manual tag suggestions: 收藏标签 first, 最近使用 second, then current tag pool candidates; result-card and media-preview menus now share the same helper.
- [x] Fixed the Codex CLI `spawn C:\Users\mumengfei\AppData\Roaming\npm\codex ENOENT` / `.cmd` / WindowsApps path chain and added explicit WindowsApps rejection before analysis spawn.
- [x] Added hover titles for non-obvious settings, workbench actions, result filters, default-template controls, media-preview actions, and collector controls; static audit found 84 identifiable static controls with no missing `title`/`aria-label`.
- [x] Verified 69/69 tests plus `node --check plugin.js` and `node --check cli-backends.js`; local Codex health checks for bare `codex` and explicit `%APPDATA%\npm\codex.cmd` resolve `%LOCALAPPDATA%\OpenAI\Codex\bin\716dda49c14d31a0\codex.exe` and return `codex-cli 0.136.0-alpha.2`.
- [x] Rebuilt local `dist\特效AI标签管理-cli.eagleplugin` with manifest version `1.0.5` and package SHA256 `24F6E71DBF34FF53FFC9C93CF51F25364522207AB762DEF328E32B2BD3414803`; synchronized installed Eagle plugin directory with backup `VFX_AI_TAGGER_CLI.backup-codex-20260605-174128`.
- [x] Pushed `master`, force-updated `v1.0.5`, replaced Release asset `texiao-ai-biaoqian-guanli-cli-1.0.5.eagleplugin`, and verified remote digest `sha256:24f6e71dbf34ff53ffc9c93cf51f25364522207ab762def328e32b2bd3414803`.
- [ ] Reopen/reload the installed Eagle plugin and smoke-test result-card plus preview-window tag suggestions, starred/recent ordering, hover titles, existing Eagle tag selection, and typed new-tag creation without video reload.

## Handoff Notes
- Start here: install/download refreshed Release asset `texiao-ai-biaoqian-guanli-cli-1.0.5.eagleplugin` or reopen/reload Eagle plugin `VFX_AI_TAGGER_CLI`; installed files have already been synchronized from this worktree.
- Do not redo: test-first implementation, local package rebuild, installed directory sync, syntax checks, local Codex health check, hover-title static audit, and package inspection for this slice are done.
- Verify next: Eagle real-host smoke for starred/recent manual tag suggestions, hover titles, and the plugin UI's Codex health check/analysis path. It should no longer stop at `C:\Users\mumengfei\AppData\Roaming\npm\codex.cmd` or WindowsApps.
- Do not claim: Eagle real-host smoke for this refreshed Release package has been completed; it has not been run in this slice.
- Watch out for: unrelated untracked docs may exist, including `docs/v1.0.5-tag-system-preview-plan.md` and `docs/vfx-tag-taxonomy-review.md`; do not include or delete them unless explicitly requested.

## Later
- [ ] Product suggestion: add an inline `添加标签` / search-add control inside the media preview review panel so users can add tags while previewing, without closing the preview and returning to the result card. It should reuse the current tag pool, allow manual new tags, and keep the video player node stable.
- [ ] Reopen/restart Eagle and run real-host smoke for dragging collector, returning to workbench, and re-entering collector at the remembered position.
- [ ] Optional future Eagle tag-library operations remain deferred: material parent-tag backfill or `武器附魔 -> 附魔` merge require a fresh backup and explicit approval.
- [ ] Compact this file if `Now` grows beyond 7 items.

## History
- [x] Ledger files initialized.
- [x] Refactored `index.html` into single-screen workbench: compact toolbar, inline stats, left tag panel, right selected/results panels, settings drawer outside main work area.
- [x] Updated `style.css` for `height: 100vh`, page overflow lock, region scrolling, right drawer, compact selected list, and clearer result cards.
- [x] Updated `plugin.js` so top “设置” opens/closes the drawer, `Escape` closes it, and the drawer’s Eagle AI button calls the existing Eagle AI settings function.
- [x] Ran full static verification: `node --test tests/cli-backends.test.js tests/ui-workbench.test.js`, `node --check plugin.js`, `node --check cli-backends.js`.
- [x] Browser-checked `1180x760` and `1280x720`.
- [x] Repackaged `dist/特效AI标签管理-cli.eagleplugin`.
- [x] Verified packaged archive contents.
- [x] Fixed Codex CLI path resolution to prefer native `codex.exe` over shell shims.
- [x] Fixed Claude CLI image-read mode with `bypassPermissions`, `--add-dir`, and image-read failure fallback.
- [x] Created fixed-v2 author package and patched installed manifest; found that launching `.eagleplugin` via command line while Eagle is already running only logs argv and does not execute the install/open path.
- [x] Selectively merged author UI improvements into local CLI plugin: frameless chrome, settings tabs, diagnostics UI, failure types, and continue/restart controls.
- [x] Repackaged `dist/特效AI标签管理-cli.eagleplugin`.
- [x] Fixed post-review reliability issues in selection refresh, write/apply, reanalysis diagnostics, undo, stored booleans, and preview-before-write behavior.
- [x] Fixed post-review layout/release issues and repackaged version `1.1.0`.
- [x] Added a top-right close button for the frameless window and repackaged version `1.1.1`.
- [x] Fixed Codex long-command failures and temporary diagnostic thumbnail breakage; repackaged version `1.1.2`.
- [x] Added cross-machine Codex CLI discovery for `LOCALAPPDATA\OpenAI\Codex\bin` and bounded local search roots; repackaged version `1.1.3`.
- [x] Published GitHub Release `v1.0.0` with asset `vfx-aitag-eagle-cli-1.0.0.eagleplugin`.
- [x] Evaluated `C:\Users\mumengfei\Downloads\AI 标签工具0601.eagleplugin`; useful candidates are selective feature ports, while manifest/package/layout should not be merged wholesale.
- [x] Merged 0601 reliability features into local CLI plugin and repackaged version `1.1.4`.
