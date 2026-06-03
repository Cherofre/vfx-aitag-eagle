# Next Actions

## Now
- [x] Created branch `codex/collector-position-memory`.
- [x] Wrote and verified RED/GREEN tests for collector position memory.
- [x] Implemented collector-only bounds persistence and screen clamping.
- [x] Bumped and packaged version `1.0.4`, then synchronized the local Eagle install.
- [x] Verified 45/45 tests, syntax checks, package contents, and installed plugin version.
- [ ] Commit the branch changes.
- [ ] Reopen/restart Eagle and run real-host smoke for dragging collector, returning to workbench, and re-entering collector at the remembered position.

## Handoff Notes
- Start here: commit branch `codex/collector-position-memory`, then close and reopen the plugin window or restart Eagle if it keeps the old renderer cached; the installed files at `C:\Users\mumengfei\AppData\Roaming\Eagle\Plugins\VFX_AI_TAGGER_CLI` are now synchronized to `1.0.4`.
- Do not redo: collector position memory implementation, RED/GREEN static tests, version bump to `1.0.4`, package regeneration, archive inspection, and local installed-file synchronization are done.
- Verify next: in Eagle, click `置顶采集`, drag the collector bar to a comfortable non-top position, click `工作台`, click `置顶采集` again, and confirm it restores the dragged position; also confirm it remains on-screen and still only imports selected assets after clicking `收集选中`.
- Do not claim: Eagle real-host drag/restore smoke has passed; static tests only verify the code/storage contract.
- Watch out for: Eagle may cache renderer files until the plugin window or Eagle itself is restarted. Collector position uses plugin window bounds and screen info only; it does not know the main Eagle window bounds.
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
