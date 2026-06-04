# Next Actions

## Now
- [x] Fast-forward merged `codex/media-preview-video-stability` into `master`.
- [x] Verified merged `master` with `node --test tests/cli-backends.test.js tests/ui-workbench.test.js`, `node --check plugin.js`, and `node --check cli-backends.js`.
- [x] Regenerated and inspected `dist\特效AI标签管理-cli.eagleplugin`; manifest is `VFX_AI_TAGGER_CLI` version `1.0.4`, `devTools=false`.
- [x] Pushed `master`, force-moved tag `v1.0.4`, and overwrote GitHub Release asset `vfx-aitag-eagle-cli-1.0.4.eagleplugin`.
- [x] Verified remote release digest matches local package SHA256 `1DE29B3601A9541FACCAD209DCE1362EE72157E60BEFA1652099B2DA6479AFFD`.
- [ ] Reopen/restart Eagle and smoke-test: video preview autoplays, loops, and survives tag edits without reload.
- [ ] Smoke-test paused analysis append behavior: pause, append more selected materials, click `开始分析` or `继续`, and confirm all pending old+new items run in the same batch.

## Handoff Notes
- Start here: install or reopen the overwritten package from `https://github.com/Cherofre/vfx-aitag-eagle/releases/tag/v1.0.4`.
- Do not redo: feature implementation, branch merge, merged-master tests, syntax checks, package regeneration, package inspection, push, tag move, release upload, and remote digest verification are done.
- Verify next: Eagle real-host smoke for video loop/no-reload preview and pause -> append -> continue queue behavior.
- Do not claim: Eagle real-host smoke has passed until tested in Eagle.
- Watch out for: moving `v1.0.4` was intentional per user request; unrelated untracked `docs/vfx-tag-taxonomy-review.md` must remain untouched.
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
