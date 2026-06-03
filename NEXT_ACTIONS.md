# Next Actions

## Now
- [x] Created branch `codex/media-preview-review`.
- [x] Added TDD coverage and implemented media preview dialog with material/result preview buttons, Eagle-open fallback, video fallback, and preview-side tag editing.
- [x] Compact progress UI into one active slot.
- [x] Replace selected-material display with a compact three-slot thumbnail tray, explicit `展开素材` flow, and right-side trash SVG remove buttons in both tray and full dialog.
- [x] Verified tests, syntax checks, package contents, and published GitHub Release `v1.0.2`.
- [x] Removed collector-entry auto-collection and repackaged manifest version `1.0.3`.
- [ ] Publish GitHub Release `v1.0.3`, then install the release package in Eagle and run real-host smoke.

## Handoff Notes
- Start here: publish `v1.0.3` from the current branch package, then install `vfx-aitag-eagle-cli-1.0.3.eagleplugin`.
- Do not redo: media preview plan, RED/GREEN UI contract tests, local preview dialog implementation, selected-material tray/remove-button fix, compact progress activity slot, `1.0.2` release upload, collector auto-collect fix, `1.0.3` manifest/favicon bump, package regeneration, and archive inspection are done.
- Verify next: in Eagle, click `置顶采集` while assets are selected and confirm it does not import until `收集选中` is clicked; import many selected assets and confirm the selected-material panel shows at most three tray cards, `展开素材` and `展开全部 +N` open the full dialog, and the trash SVG button removes the material from both tray and full dialog; then run analysis/write and confirm only one compact progress slot is visible; click `预览` from material cards/dialog entries and result cards, test image playback, mp4/webm playback, unsupported video fallback, `用 Eagle 打开`, previous/next navigation, and preview-side tag toggle/delete before writing.
- Do not claim: Eagle native playback/open smoke has passed; Browser `file://` static verification was blocked by Browser Use URL policy.
- Watch out for: `item.open({ window: true })` relies on Eagle host API support, and plugin-native `<video>` support depends on Chromium codecs. Persistent undo still requires the affected Eagle item to be imported/selected again so `item.save()` is available.
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
