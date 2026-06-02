# Next Actions

## Now
- [ ] Install `I:\AI\Vibe Coding\vfx-aitag-eagle\dist\特效AI标签管理-cli.eagleplugin` version `1.1.4` in Eagle and confirm the ID `VFX_AI_TAGGER_CLI` appears as a separate plugin.
- [ ] Smoke-test on the other PC where Codex lives at `C:\Users\feiyu\AppData\Local\OpenAI\Codex\bin\codex.exe`; bare `codex` in plugin settings should resolve automatically.
- [ ] Smoke-test the reported `1999同人皮肤...Magesbox.mp4` case again: Codex CLI should no longer fail with `The command line is too long`, and diagnostic frame thumbnails should display.
- [ ] Smoke-test 0601 merged controls: title toggle off/on, AI retry count, request chunk K with many tags/frames, result restore after window reopen, and write progress on batch write.
- [ ] Smoke-test that the frameless rounded window can be dragged from the topbar, closed from the new top-right close button, and that buttons/inputs remain clickable.
- [ ] Smoke-test settings drawer tabs, diagnostic saving, selection refresh failure recovery, write/undo failure recovery, pause/continue/restart, and Claude/Codex CLI analysis on real selected assets.

## Handoff Notes
- Start here: packaged local CLI plugin is `I:\AI\Vibe Coding\vfx-aitag-eagle\dist\特效AI标签管理-cli.eagleplugin`.
- Do not redo: ledger initialization, branch creation, workbench implementation, post-review reliability/layout fixes, 0601 selective feature merge, static tests, and package inspection are done.
- Verify next: after installing the packaged local CLI plugin, inspect `C:\Users\mumengfei\AppData\Roaming\Eagle\log.log` and test a real selected asset.
- Do not claim: Eagle real-host smoke has passed; in-app Browser rejected the local `file://` URL this turn, so browser layout smoke was not performed.
- Watch out for: `dist/特效AI标签管理-cli.eagleplugin` is a tracked release artifact and should be intentionally replaced when packaging changes; the 0601 package should be treated as a feature reference, not as a replacement artifact.
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
