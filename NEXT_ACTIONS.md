# Next Actions

## Now
- [x] Refactor `index.html` into single-screen workbench: compact toolbar, inline stats, left tag panel, right selected/results panels, settings drawer outside main work area.
- [x] Update `style.css` for `height: 100vh`, page overflow lock, region scrolling, right drawer, compact selected list, and clearer result cards.
- [x] Update `plugin.js` so top “设置” opens/closes the drawer, `Escape` closes it, and the drawer’s Eagle AI button calls the existing Eagle AI settings function.
- [ ] Run full static verification: `node --test tests/cli-backends.test.js tests/ui-workbench.test.js`, `node --check plugin.js`, `node --check cli-backends.js`.
- [ ] Browser-check `1180x760` and `1280x720`, then repackage the `.eagleplugin`.

## Handoff Notes
- Start here: run full static verification, then browser-check layout dimensions before packaging.
- Do not redo: ledger initialization, branch creation, RED test creation, and initial workbench implementation are done.
- Verify next: `node --test tests/cli-backends.test.js tests/ui-workbench.test.js`
- Do not claim: browser layout verification and package update are not done yet.
- Watch out for: `dist/` was already untracked before this UI work; do not delete it unless packaging intentionally replaces the plugin archive.

## Later
- [ ] Compact this file if `Now` grows beyond 7 items.

## History
- [x] Ledger files initialized.
