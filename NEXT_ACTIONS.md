# Next Actions

## Now
- [x] Completed three read-only review passes for media preview/tag review, analysis queue/CLI state, and release/package hygiene; no P0/P1 blockers found.
- [x] Re-verified `master` with `node --test tests/cli-backends.test.js tests/ui-workbench.test.js`, `node --check plugin.js`, and `node --check cli-backends.js`.
- [x] Changed GitHub Release `v1.0.4` to Chinese title/body and replaced the English asset with `texiao-ai-biaoqian-guanli-cli-1.0.4.eagleplugin` plus Chinese label.
- [x] Verified remote release digest matches local package SHA256 `1DE29B3601A9541FACCAD209DCE1362EE72157E60BEFA1652099B2DA6479AFFD`.
- [x] User confirmed Eagle smoke: video preview autoplays/loops and survives tag edits without reload.
- [x] User confirmed Eagle smoke: paused analysis append behavior works for old+new pending items.
- [ ] Follow up in the next patch on review P2s: stale preview when results/filter empty, preview of removed material, CLI wrapper process-tree abort, and health check command execution.

## Handoff Notes
- Start here: install or reopen the reviewed package from `https://github.com/Cherofre/vfx-aitag-eagle/releases/tag/v1.0.4`; download `texiao-ai-biaoqian-guanli-cli-1.0.4.eagleplugin` (`特效 AI 标签管理 CLI 安装包 1.0.4`).
- Do not redo: feature implementation, branch merge, merged-master tests, syntax checks, package regeneration, package inspection, push, tag move, release upload, three read-only review passes, and remote digest verification are done.
- Verify next: the remaining P2 review items if starting a new patch.
- Do not claim: the remaining P2 review items are fixed until implemented and verified.
- Watch out for: moving `v1.0.4` was intentional per user request; GitHub sanitized a pure Chinese asset filename, so the release uses a pinyin-safe filename with Chinese page copy and asset label; unrelated untracked `docs/vfx-tag-taxonomy-review.md` must remain untouched.
- Dirty tree note: unrelated untracked `docs/vfx-tag-taxonomy-review.md` may exist; leave it alone unless the user asks.

## Later
- [ ] Product suggestion: add an inline `添加标签` / search-add control inside the media preview review panel so users can add tags while previewing, without closing the preview and returning to the result card. It should reuse the current tag pool, allow manual new tags, and keep the video player node stable.
- [ ] Reopen/restart Eagle and run real-host smoke for dragging collector, returning to workbench, and re-entering collector at the remembered position.
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
