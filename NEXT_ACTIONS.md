# Next Actions

## Now
- [x] Implemented 1.0.5 editable local default-template workflow, default-template fallback analysis candidates with inline green `+` gap markers, prompt semantic guidance, preview-side tag adding, executable CLI health checks, 180-second default timeout, and Windows wrapper process-tree abort support.
- [x] Verified 55/55 tests plus `node --check plugin.js` and `node --check cli-backends.js`.
- [x] Regenerated `dist\特效AI标签管理-cli.eagleplugin`; package contains only the 7 core plugin files, manifest ID `VFX_AI_TAGGER_CLI`, version `1.0.5`, and `main.devTools=false`.
- [ ] Install the local `1.0.5` package in Eagle and smoke-test template manager, edited-template import, default-template gap tags showing green `+`, preview-side tag add/delete/toggle without video reload, and real Claude/Codex health checks.
- [ ] After smoke, decide whether to merge/push/publish `1.0.5`; do not push or create a release without explicit user instruction.
- [ ] Optional future Eagle tag-library operations remain deferred: material parent-tag backfill or `武器附魔 -> 附魔` merge require a fresh backup and explicit approval.

## Handoff Notes
- Start here: install `dist\特效AI标签管理-cli.eagleplugin` from branch `codex/v1.0.5-tag-workflow` if the user wants to test before merge/release.
- Do not redo: 1.0.5 source implementation, README update, package build, and package inspection are done.
- Verify next: Eagle real-host smoke with actual media and local CLI backend settings.
- Do not claim: `1.0.5` has been pushed, merged, or published; no Eagle global tag merge/rename/delete/material backfill was performed in this branch.
- Watch out for: unrelated untracked docs may exist, including `docs/v1.0.5-tag-system-preview-plan.md` and `docs/vfx-tag-taxonomy-review.md`; do not include or delete them unless explicitly requested.

## Later
- [ ] Product suggestion: add an inline `添加标签` / search-add control inside the media preview review panel so users can add tags while previewing, without closing the preview and returning to the result card. It should reuse the current tag pool, allow manual new tags, and keep the video player node stable.
- [ ] Reopen/restart Eagle and run real-host smoke for dragging collector, returning to workbench, and re-entering collector at the remembered position.
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
