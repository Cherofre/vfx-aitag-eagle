# Next Actions

## Now
- [ ] Manual smoke in Eagle: install/open the updated package, import selected assets, open/close settings drawer, and confirm results are visible without whole-page scrolling.
- [ ] Analyze a real animated/video asset and confirm Claude/Codex read actual frames instead of returning file-name-only inference.
- [ ] Decide whether to merge `codex/single-screen-workbench` back to `master` after the Eagle host smoke.

## Handoff Notes
- Start here: install/open updated `dist/特效AI标签管理-cli.eagleplugin` in Eagle for final manual smoke.
- Do not redo: ledger initialization, branch creation, workbench implementation, static tests, browser layout measurements, and CLI temp-frame smoke are done.
- Verify next: real Eagle plugin window smoke test with selected assets and actual frame-reading result.
- Do not claim: real Eagle host smoke is complete; it has not been run in the Eagle app yet.
- Watch out for: `dist/` was already untracked before this UI work; do not delete it unless packaging intentionally replaces the plugin archive.

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
