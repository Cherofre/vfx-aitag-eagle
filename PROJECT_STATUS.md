# Project Status

## Current Snapshot
- Last Updated: 2026-06-03 20:58
- Phase: 1.0.2 release-candidate material tray packaged
- Superpowers Phase: brainstorming + writing-plans + TDD + project-ledger-loop
- Branch: codex/media-preview-review
- Goal: 给结果卡和素材列表增加“验收预览”，让用户检查图片/视频与 AI 标签是否匹配，并提供 Eagle 原生打开兜底。
- Current Focus: Branch package `dist\特效AI标签管理-cli.eagleplugin` is regenerated as manifest version `1.0.2`; media preview remains included, analysis/write progress share one compact activity slot, and the selected-material panel is now a three-slot thumbnail tray with a clear `展开素材`/`展开全部 +N` expansion path plus a 2:1 preview/remove action row on material cards.
- Superpowers Spec: `docs/superpowers/specs/2026-06-03-selected-material-tray-design.md`
- Superpowers Plan: `docs/superpowers/plans/2026-06-03-selected-material-tray.md`
- Current Task: Commit the selected-material remove-button polish and then install the `1.0.2` package in Eagle for real-host smoke before release upload.

## Resume Here
- Start with: install `dist\特效AI标签管理-cli.eagleplugin` from branch `codex/media-preview-review` and import/select a mix of image, mp4/webm, and mov/mkv assets in Eagle.
- Next verification: Eagle smoke should confirm the selected-material panel shows at most three tray cards, the `展开素材` button and `展开全部 +N` card open the full local dialog, material cards in both tray/dialog show `预览` plus a right-side trash SVG remove button, only one compact progress slot is visible during analysis/write, then click `预览` from both material cards/dialog entries and result cards, verify image/video display, trigger `用 Eagle 打开`, test a video format unsupported by Chromium to confirm thumbnail/diagnostic fallback, and confirm preview tag toggle/delete updates the result card before writing.
- Watch out for: Browser static `file://` verification was blocked by Browser Use URL policy, so no local browser screenshot was captured. Eagle native open depends on host API support and `window: true` requires Eagle 4.0 build12+; plugin-native `<video>` playback still depends on Chromium codec support.

## Progress Summary
- [x] Initialized Project Ledger Loop files.
- [x] Created feature branch `codex/single-screen-workbench`.
- [x] Added RED UI regression test for single-screen workbench + settings drawer contract.
- [x] Implemented HTML/CSS/JS workbench refactor.
- [x] Run static tests and browser layout verification.
- [x] Repackage `dist/特效AI标签管理-cli.eagleplugin`.
- [x] Fixed Codex CLI path resolution for Eagle PATH gaps.
- [x] Fixed Claude CLI image-read permissions/argument order and added fallback when image reads fail.
- [x] Extracted and evaluated author package update without overwriting the repo.
- [x] Created fixed author package with localized manifest name placeholder.
- [x] Created fixed-open author package with `main.runAfterInstall: true` because Eagle logs showed fixed imports initialized but did not emit `Open plugin`.
- [x] Created fixed-v2 author package with version `1.0.1`, localized manifest name, `platform/arch`, top-level `devTools`, common window fields, and `main.runAfterInstall: true`; also copied no-space test file `C:\Users\mumengfei\Downloads\aitag-fixed-v2.eagleplugin`.
- [x] Patched installed author plugin manifest at `C:\Users\mumengfei\AppData\Roaming\Eagle\Plugins\81ae8109-ee4d-42e3-ab69-9bb73765d866\manifest.json` with backup `manifest.json.bak-codex-20260526-130840`.
- [x] Changed local plugin ID to `VFX_AI_TAGGER_CLI`, removed author/QQ title text, and enabled frameless draggable chrome.
- [x] Reworked settings drawer into tabs for AI backend, analysis parameters, frame extraction, and write/diagnostics.
- [x] Added result diagnostics UI with diagnostic frame saving, source/preview/frame details, and failure type labels.
- [x] Added explicit pause follow-up controls: continue and restart.
- [x] Repackaged `dist/特效AI标签管理-cli.eagleplugin`.
- [x] Fixed post-review state-machine risks: stale selection after Eagle read failure, per-item write failure recovery, reanalysis diagnostic cleanup, undo failure preservation, and `previewBeforeWrite` behavior.
- [x] Fixed post-review UI risks: workbench height clipping, drawer drag region, toolbar compression, and long text wrapping.
- [x] Bumped release manifest to `1.1.0`, disabled release devTools, updated README installation/migration notes, and repackaged.
- [x] Added a top-right close button for the frameless plugin window, bumped release manifest to `1.1.1`, and repackaged.
- [x] Fixed Codex CLI `The command line is too long` by piping prompt through stdin and limiting Codex image argv attachments to 16 evenly sampled frames.
- [x] Fixed broken diagnostic frame previews by embedding preview data URLs before temporary frame cleanup; saved diagnostics still use persistent file URLs.
- [x] Fixed Codex CLI discovery for other PCs where Codex is installed at `C:\Users\<user>\AppData\Local\OpenAI\Codex\bin\codex.exe`; added bounded discovery under `LOCALAPPDATA\OpenAI`, `LOCALAPPDATA\Programs`, and npm roots.
- [x] Published GitHub Release `v1.0.0` with asset `vfx-aitag-eagle-cli-1.0.0.eagleplugin`.
- [x] Extracted and evaluated author package `AI 标签工具0601.eagleplugin`; identified useful feature candidates but confirmed whole-package merge would regress CLI support and single-screen workbench behavior.
- [x] Selectively merged 0601 features: title-in-prompt toggle, AI retry count, request chunking, write progress, result cache, JSON repair, diagnostic directory validation, and directory picker fallback.
- [x] Bumped manifest to `1.1.4` and repackaged `dist\特效AI标签管理-cli.eagleplugin`.
- [x] Created branch `codex/productivity-workbench` from `codex/merge-author-0601-features`.
- [x] Baseline verified before productivity implementation.
- [x] Add RED tests for health checks, presets, failed-result retry, result editing, and packaging contract.
- [x] Implemented environment health checks, analysis presets, failed-result retry/filtering, and manual result tag editing.
- [x] Verified source implementation with unit/static tests and syntax checks.
- [x] Bumped manifest to `1.2.0`, updated README, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected package contents.
- [x] Fixed Eagle-reported UI regression where topbar wraps and creates page scrollbars.
- [x] Moved material import/refresh/full-list actions into the selected-material panel.
- [x] Added local selected-material full-list dialog and analysis progress bar.
- [x] Bumped manifest to `1.2.1`, updated README, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected package contents.
- [x] Fixed closed selected-material full-list dialog intercepting clicks by adding real `hidden` state, CSS `display: none`, and JS open/close hidden toggles.
- [x] Bumped manifest to `1.2.2`, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected package contents.
- [x] Pushed `codex/productivity-workbench` to `origin/codex/productivity-workbench`.
- [x] Created branch `codex/collection-workflow` from the packaged productivity workbench state.
- [x] Added plan `docs/superpowers/plans/2026-06-02-collection-workflow.md`.
- [x] Implemented append/replace/clear current Eagle selection, plugin event append, internal context menus, and collector bar mode.
- [x] Bumped manifest to `1.3.0`, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected package contents.
- [x] Fixed collector bar so it can really shrink by lowering manifest minimum window size, moving it to a top-center floating position, making it always-on-top while collapsed, and restoring window bounds/top state on expand.
- [x] Bumped manifest to `1.3.1`, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected package contents.
- [x] Made collector bar prominent with themed icon actions, changed copy to “素材采集 / 边选边收”, added clear queue, and auto-collected current selection on entering collector mode.
- [x] Bumped manifest to `1.3.2`, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected package contents.
- [x] Changed the workbench entry from a small “采集条” button to a first-position primary “置顶采集” action with icon.
- [x] Scaled collector window and actions down by 15% from `760×132` to `646×112`, added screen-bound clamping, and made the collector content fill the small window.
- [x] Replaced `logo.png` with the generated minimal tag-plus-sparkle logo resized to `128×128`.
- [x] Bumped manifest to `1.3.3`, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected package contents.
- [x] Fixed collector-sized persisted reopen by restoring workbench bounds on init and before closing from collector mode.
- [x] Changed analysis progress from completed-item-only ticks to staged per-item progress with current stage metadata.
- [x] Reduced review tag chip height and replaced native manual-tag `datalist` with a styled fixed-position suggestion menu constrained to the viewport.
- [x] Bumped manifest to `1.3.4`, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected package contents.
- [x] Increased collector left/right padding, reduced collector height to `646×104`, and slightly reduced collector action/icon/close sizes.
- [x] Fixed collector close flash by marking a pending workbench restore and closing the small window directly instead of expanding first.
- [x] Bumped manifest to `1.3.5`, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected package contents.
- [x] Added explicit page favicon links pointing at the generated logo with a `1.3.6` cache-buster so pinned/collector windows do not fall back to stale default icons.
- [x] Bumped manifest to `1.3.6`, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected package contents.
- [x] Added local CLI abort support via AbortController/signal and child `kill()` on pause.
- [x] Persisted undo stack in `localStorage` so a write can still be undone after closing/reopening the plugin, provided the Eagle item is reselected/imported.
- [x] Replaced `logo.png` with a larger, brighter tag-plus-sparkle mark and updated favicon cache-buster to `1.3.7`.
- [x] Bumped manifest to `1.3.7`, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected package contents.
- [x] Added RED tests for a bright blue app-icon logo and `1.3.8` favicon cache-buster; confirmed they failed against the old dark logo.
- [x] Replaced `logo.png` with a deterministic flat blue icon with a white tag mark and updated manifest/favicon to `1.3.8`.
- [x] Repackaged `dist\特效AI标签管理-cli.eagleplugin` version `1.3.8` and inspected archive contents.
- [x] Added RED test that ordinary plugin open/show must not auto-import Eagle's current selection, while collector entry still auto-collects.
- [x] Removed startup `appendSelectedItems("打开插件导入当前选中")` and plugin show/run auto-append binding; explicit append/replace/context-menu/collector actions remain.
- [x] Bumped manifest/favicon to `1.3.9`, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected archive contents.
- [x] Ran three read-only subagent reviews for UI/collector workflow, CLI/analysis/write safety, and release/package hygiene.
- [x] Fixed review findings: CLI abort no longer falls back to Eagle AI, multi-chunk pause throws `AbortError`, replace-selection failures preserve existing queue/results, unresolved PATH commands fail health checks, collector bar shows status feedback, and collector clear copy now says “清空全部”.
- [x] Aligned manifest/favicon/package to version `1.0.1`, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected archive contents.
- [x] Pushed tag `v1.0.1` and created GitHub Release `v1.0.1` with asset `vfx-aitag-eagle-cli-1.0.1.eagleplugin`.
- [x] Created branch `codex/media-preview-review` for media/tag acceptance preview.
- [x] Added RED UI contract coverage for media preview dialog, material/result preview buttons, Eagle-open fallback, video fallback, and preview-side tag editing.
- [x] Implemented local image/video preview dialog with previous/next navigation, thumbnail/diagnostic fallback, Eagle native open fallback, and preview-side tag toggle/delete.
- [x] Bumped branch package manifest/favicon to `1.0.2`, repackaged `dist\特效AI标签管理-cli.eagleplugin`, and inspected archive contents.
- [x] Compact progress UI so analysis/write progress share one activity slot and do not stack in the result panel.
- [x] Changed selected-material preview from a clipped summary to a fixed-height local scroller that renders the full imported queue.
- [x] Repackaged `dist\特效AI标签管理-cli.eagleplugin` version `1.0.2` and inspected archive contents.
- [x] Reworked selected-material preview into a compact three-slot thumbnail tray with a clear full-list expansion card/button, then repackaged version `1.0.2`.
- [x] Added a right-side trash SVG remove button next to each selected-material preview action in both the tray and full dialog, then repackaged version `1.0.2`.

## Verification
- Last command: package inspection after selected-material remove-button repackaging
- Result: pass
- Evidence / notes: RED run `node --test tests/ui-workbench.test.js` failed as expected on missing `data-remove-selected-item` / trash icon / 2:1 selected-card action layout. GREEN run `node --test tests/cli-backends.test.js tests/ui-workbench.test.js` passed 44/44 tests; `node --check plugin.js` and `node --check cli-backends.js` passed. Package inspection shows only `manifest.json`, `index.html`, `style.css`, `plugin.js`, `cli-backends.js`, `README.md`, and `logo.png`; manifest inside package is ID `VFX_AI_TAGGER_CLI`, version `1.0.2`, `devTools: false`, package includes `data-remove-selected-item`, `selected-trash-icon`, and `grid-template-columns: minmax(0, 2fr) minmax(42px, 1fr)`. Browser static `file://` verification was blocked earlier by Browser Use URL policy. Eagle real-host smoke is still required. Unrelated untracked `docs/vfx-tag-taxonomy-review.md` remains untouched.

## Blockers And Risks
- Needs Eagle real-host smoke for media preview, especially native `item.open({ window: true })`, codec-dependent `<video>` playback, fallback thumbnail/diagnostic-frame display, and tag edits inside the preview dialog.
- Browser static verification for `file://` was blocked by Browser Use URL policy; do not claim browser layout smoke for the preview dialog.
- Needs final manual smoke in Eagle with real selected assets and local CLI backends, especially collector bar top positioning, always-on-top state, and restore behavior.
- Pause can immediately stop local CLI children, but Eagle AI requests are still not truly cancellable by this plugin and will pause only after the current Eagle AI call returns.
- Persistent undo can restore the undo record after reopening, but the target Eagle item must be available in the current selected/imported list for the plugin to call `item.save()`.
- If the pinned/collector icon remains old after installing `1.3.8`, the remaining likely cause is Eagle or Windows icon cache; try unpin/re-pin or restart Eagle before clearing broader system caches.
- Current UI fix must preserve single-screen body no-scroll and keep the main material tray fixed-height, with full material scrolling only in the selected-material modal.
- New health checks must remain lightweight and must not perform real AI requests.
- Upstream merge is high-conflict in `plugin.js`, `index.html`, and `style.css`; wholesale replacement would regress local CLI backend and single-screen workbench.
- The 0601 package is not install/release clean as-is: it embeds nested packages, keeps the author plugin ID, leaves `devTools` enabled, and keeps the localized manifest shape that previously caused Eagle import/open ambiguity.
- Request chunking is covered by static tests and syntax checks, but still needs real Eagle/CLI smoke with many tags or many frames.
- Working tree may contain unrelated user file `docs/vfx-tag-taxonomy-review.md`; do not include or delete it unless explicitly requested.

## History
- Ledger initialized at 2026-05-25 12:58.
