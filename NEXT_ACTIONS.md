# Next Actions

## Now
- [x] Refactor `index.html` into single-screen workbench: compact toolbar, inline stats, left tag panel, right selected/results panels, settings drawer outside main work area.
- [x] Update `style.css` for `height: 100vh`, page overflow lock, region scrolling, right drawer, compact selected list, and clearer result cards.
- [x] Update `plugin.js` so top “设置” opens/closes the drawer, `Escape` closes it, and the drawer’s Eagle AI button calls the existing Eagle AI settings function.
- [x] Run full static verification: `node --test tests/cli-backends.test.js tests/ui-workbench.test.js`, `node --check plugin.js`, `node --check cli-backends.js`.
- [x] Browser-check `1180x760` and `1280x720`.
- [ ] Repackage `dist/特效AI标签管理-cli.eagleplugin`.
- [ ] Verify packaged archive contents and update final handoff notes.

## Handoff Notes
- Start here: package updated plugin archive from the current working tree.
- Do not redo: ledger initialization, branch creation, workbench implementation, static tests, and browser layout measurements are done.
- Verify next: archive inspection for `dist/特效AI标签管理-cli.eagleplugin`
- Do not claim: package update is not done yet.
- Watch out for: `dist/` was already untracked before this UI work; do not delete it unless packaging intentionally replaces the plugin archive.

## Later
- [ ] Compact this file if `Now` grows beyond 7 items.

## History
- [x] Ledger files initialized.
