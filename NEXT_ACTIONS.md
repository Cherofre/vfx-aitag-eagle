# Next Actions

## Now
- [x] Fixed the `1.0.5` media-preview manual tag input on a clean master-derived branch: suggestions now render from `previewManualTagMenuLayer` outside the transformed preview dialog, so the menu is not clipped or visually offset.
- [x] Verified 59/59 tests plus `node --check plugin.js` and `node --check cli-backends.js`; rebuilt `dist\特效AI标签管理-cli.eagleplugin` with manifest version `1.0.5` and package SHA256 `3C033FD867DECA068CB98096747E314958BCFF0498671A14AFFFC785E6877DDD`.
- [x] Published GitHub Release `v1.0.5` with asset `texiao-ai-biaoqian-guanli-cli-1.0.5.eagleplugin`; remote digest matches local package SHA256 `79C9ED576AF2911A61D73D03575FF1E669C6E5454210F334081F43A0D8406A89`.
- [ ] Install the refreshed local `dist\特效AI标签管理-cli.eagleplugin` in Eagle and smoke-test preview-window tag search/add suggestions, including existing Eagle tag selection and typed new-tag creation without video reload.
- [ ] If Eagle smoke passes, decide whether to replace the public GitHub Release `v1.0.5` asset or keep this as a local 1.0.5 hotfix package.
- [ ] Optional future Eagle tag-library operations remain deferred: material parent-tag backfill or `武器附魔 -> 附魔` merge require a fresh backup and explicit approval.

## Handoff Notes
- Start here: install local `dist\特效AI标签管理-cli.eagleplugin` from this master-line `1.0.5` worktree.
- Do not redo: 1.0.5 source implementation, subagent review, `.cmd/.bat` CLI analysis hardening, merge to `master`, push, tag, release creation, package inspection, and digest verification are done.
- Verify next: Eagle real-host smoke for preview-side tag suggestion popup inside the media preview dialog; Browser visual smoke was blocked by the in-app Browser `file://` URL policy.
- Do not claim: Eagle real-host smoke for the refreshed 1.0.5 preview-tag fix has been completed; it remains a manual host check.
- Watch out for: unrelated untracked docs may exist, including `docs/v1.0.5-tag-system-preview-plan.md` and `docs/vfx-tag-taxonomy-review.md`; do not include or delete them unless explicitly requested.

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
