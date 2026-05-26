# Next Actions

## Now
- [ ] Install `I:\AI\Vibe Coding\vfx-aitag-eagle\dist\特效AI标签管理-cli.eagleplugin` in Eagle and confirm the new ID `VFX_AI_TAGGER_CLI` appears as a separate plugin.
- [ ] Smoke-test that the frameless rounded window can be dragged from the topbar and that buttons/inputs remain clickable.
- [ ] Smoke-test settings drawer tabs, diagnostic saving, pause/continue/restart, and Claude/Codex CLI analysis on real selected assets.
- [ ] If Eagle smoke passes, decide whether to port any remaining author features such as i18n/theme toggle or AI retry count.

## Handoff Notes
- Start here: packaged local CLI plugin is `I:\AI\Vibe Coding\vfx-aitag-eagle\dist\特效AI标签管理-cli.eagleplugin`.
- Do not redo: ledger initialization, branch creation, workbench implementation, static tests, browser layout measurements, and CLI temp-frame smoke are done.
- Verify next: after installing the packaged local CLI plugin, inspect `C:\Users\mumengfei\AppData\Roaming\Eagle\log.log` and test a real selected asset.
- Do not claim: Eagle real-host smoke has passed; Browser MCP timed out during local HTML verification.
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
- [x] Created fixed-v2 author package and patched installed manifest; found that launching `.eagleplugin` via command line while Eagle is already running only logs argv and does not execute the install/open path.
- [x] Selectively merged author UI improvements into local CLI plugin: frameless chrome, settings tabs, diagnostics UI, failure types, and continue/restart controls.
- [x] Repackaged `dist/特效AI标签管理-cli.eagleplugin`.
