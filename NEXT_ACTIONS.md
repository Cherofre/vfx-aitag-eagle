# Next Actions

## Now
- [x] Added and verified RED/GREEN UI regression coverage for paused analysis appending new materials into the next run.
- [x] Implemented missing-result queue synchronization after append into an existing result set and before pending filtering in `analyzeSelected()`.
- [x] Verified `node --test tests/cli-backends.test.js tests/ui-workbench.test.js`, `node --check plugin.js`, and `node --check cli-backends.js`.
- [x] Backed up and synchronized installed `C:\Users\mumengfei\AppData\Roaming\Eagle\Plugins\VFX_AI_TAGGER_CLI\plugin.js`.
- [ ] Reopen/restart Eagle and smoke-test: analyze several materials, pause, append more selected materials, click `开始分析` or `继续`, and confirm all pending old+new items run in the same batch.
- [ ] Also smoke-test the previous preview fix: video preview autoplay and tag-toggle playback preservation.
- [ ] After Eagle smoke, decide whether to package/release a small patch containing both fixes.

## Handoff Notes
- Start here: close and reopen the plugin window or restart Eagle if it keeps the old renderer cached; installed `plugin.js` has been synchronized from `codex/media-preview-video-stability`.
- Do not redo: root-cause investigation, RED/GREEN static tests, queue-sync implementation, preview-stability implementation, source/installed hash comparisons, and syntax/unit verification are done.
- Verify next: start a real analysis batch, pause after pending items remain, append additional selected materials, then click `开始分析` or `继续` and confirm the newly appended materials become pending and run immediately with the old pending batch.
- Do not claim: Eagle real-host paused-append queue behavior has passed until the above smoke is done in Eagle.
- Watch out for: append controls are disabled while `state.running` is true, so wait for the pause state to finish before appending. If Eagle keeps old renderer code, restart Eagle before judging the behavior.
- Dirty tree note: unrelated untracked `docs/vfx-tag-taxonomy-review.md` may exist; leave it alone unless the user asks.

## Later
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
