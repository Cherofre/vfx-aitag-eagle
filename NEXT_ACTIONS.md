# Next Actions

## Now
- [x] Added RED logo contract tests for a bright blue app-icon background, simple white mark, and `logo.png?v=1.3.8`.
- [x] Replaced `logo.png` with a deterministic flat blue icon and bumped manifest/favicon references to `1.3.8`.
- [x] Repackaged `dist\特效AI标签管理-cli.eagleplugin` and inspected that only core plugin files are included.
- [ ] Install version `1.3.8` in Eagle and smoke-test the new icon plus persistent undo, CLI pause/abort, collector spacing/height, close-without-flash, and default reopen restore.

## Handoff Notes
- Start here: install `I:\AI\Vibe Coding\vfx-aitag-eagle\dist\特效AI标签管理-cli.eagleplugin` version `1.3.8` in Eagle.
- Do not redo: collection workflow implementation, collector entry/action fix, collector `646×104` spacing/height update, screen-bound clamping, window restore hotfix, close-without-full-window-flash fix, staged progress UI, compact/manual tag menu UI, flat blue logo replacement, static tests, syntax checks, browser static smoke, version bump, and package inspection are done.
- Verify next: Eagle smoke-test persistent undo after plugin close/reopen, pausing a long Claude/Codex request and confirming the child process stops, plugin-list/pinned/collector icon size, right-click plugin entry append, “置顶采集” visibility, entering collector mode auto-collects current selection, “清空队列” clears pending items/results, collector bar shrinks to the top floating window with balanced side padding, stays within visible screen bounds, stays always-on-top, close does not flash a full workbench window, expands back to the full workbench, default reopen is not collector-sized, progress stages update during analysis, and manual tag menu appears near the input.
- Do not claim: Eagle real-host smoke has passed; Browser local smoke only covered static layout/menu behavior outside the Eagle host.
- Watch out for: pause aborts local CLI children only; Eagle AI itself is still host-controlled. Persistent undo requires the affected Eagle item to be imported/selected again so `item.save()` is available.
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
