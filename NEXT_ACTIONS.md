# Next Actions

## Now
- [x] Collector bar now has prominent themed icon actions and copy: “素材采集 / 边选边收”.
- [x] Entering collector mode auto-collects current Eagle selection, and the collector bar has a “清空队列” action.
- [x] `node --test tests/cli-backends.test.js tests/ui-workbench.test.js`, `node --check plugin.js`, and `node --check cli-backends.js` pass.
- [x] Manifest bumped to `1.3.2`, `dist\特效AI标签管理-cli.eagleplugin` repackaged, and archive contents inspected.
- [ ] Install version `1.3.2` in Eagle and smoke-test collector bar with real selected assets.

## Handoff Notes
- Start here: install `I:\AI\Vibe Coding\vfx-aitag-eagle\dist\特效AI标签管理-cli.eagleplugin` version `1.3.2` in Eagle.
- Do not redo: collection workflow implementation, collector bar visibility/action fix, static tests, syntax checks, version bump, and package inspection are done.
- Verify next: Eagle smoke-test right-click plugin entry append, entering collector mode auto-collects current selection, “清空队列” clears pending items/results, collector bar shrinks to the top floating window, stays always-on-top, expands back to the full workbench, and restores normal top state.
- Do not claim: Eagle real-host smoke has passed; Browser local smoke was not rerun because current environment policy previously blocked local browser access.
- Watch out for: `dist/特效AI标签管理-cli.eagleplugin` is a tracked release artifact and should be intentionally replaced when packaging changes; the new collection event hooks must not auto-start analysis.
- Dirty tree note: unrelated untracked `docs/vfx-tag-taxonomy-review.md` may exist; leave it alone unless the user asks.

## Later
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
