# Next Actions

## Now
- [ ] Fully quit/reopen Eagle or reinstall `C:\Users\mumengfei\Downloads\aitag-fixed-v2.eagleplugin` from Eagle UI, then capture the log tail and confirm whether `Open plugin: AI 标签工具` / `Create plugin: AI 标签工具` appears.
- [ ] Decide merge scope for author package features: recommended path is selective merge, not wholesale replacement.
- [ ] If merging, first add compatible static assets/metadata: `_locales`, new logo assets, manifest language fields, while preserving plugin identity decision.
- [ ] Then port functional pieces one by one: diagnostics, continue/restart controls, AI retry, failure classification, theme/i18n if still wanted.
- [ ] After any merge, rerun static tests/checks, browser layout measurement, package inspection, and Eagle real-asset smoke.

## Handoff Notes
- Start here: fixed-v2 author package is `C:\Users\mumengfei\Downloads\AI 标签工具-fixed-v2.eagleplugin`, with a no-space duplicate at `C:\Users\mumengfei\Downloads\aitag-fixed-v2.eagleplugin`; original author package remains unchanged.
- Do not redo: ledger initialization, branch creation, workbench implementation, static tests, browser layout measurements, and CLI temp-frame smoke are done.
- Verify next: after trying fixed-v2 in Eagle, inspect `C:\Users\mumengfei\AppData\Roaming\Eagle\log.log` for `Open plugin: AI 标签工具` and `Create plugin: AI 标签工具`; after selective merge, `node --test tests/cli-backends.test.js tests/ui-workbench.test.js`, `node --check plugin.js`, `node --check cli-backends.js`, then repackage.
- Do not claim: author update has been merged; this step only evaluated and fixed import initialization for the standalone author package.
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
