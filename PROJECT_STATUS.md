# Project Status

## Current Snapshot
- Last Updated: 2026-06-02 19:12
- Phase: collector bar prominent-action fix packaged
- Superpowers Phase: executing-plans + TDD + project-ledger-loop
- Branch: codex/collection-workflow
- Goal: 修复采集条不够显眼、进入后不自动收集当前选中、且缺少清空队列入口的问题。
- Current Focus: Collector bar now uses prominent themed icon actions, auto-collects current Eagle selection when entering collector mode, exposes clear queue, and is packaged as version `1.3.2`.
- Superpowers Spec: none
- Superpowers Plan: `docs/superpowers/plans/2026-06-02-collection-workflow.md`
- Current Task: Install `dist\特效AI标签管理-cli.eagleplugin` version `1.3.2` in Eagle and smoke-test collector bar auto-collection/clear queue/shrink/always-on-top/restore.

## Resume Here
- Start with: install `I:\AI\Vibe Coding\vfx-aitag-eagle\dist\特效AI标签管理-cli.eagleplugin` version `1.3.2` in Eagle.
- Next verification: Eagle real-host smoke for collector bar entering at `760×132`, auto-collecting current selection, clearing queue from the bar, moving near the top of the screen, staying always-on-top while collapsed, restoring full workbench bounds/normal top state on expand, plus right-click plugin entry append and analysis/write flows.
- Watch out for: author package removes local CLI backend support; keep existing form IDs/storage keys compatible and preserve single-screen body no-scroll contract.

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

## Verification
- Last command: package inspection after `Compress-Archive`
- Result: pass
- Evidence / notes: Added RED UI contract test for prominent collector bar icon actions, auto-collect-on-enter, and clear queue; it initially failed because the bar lacked `collectorClearBtn` and still used old size/copy. After implementation, `node --test tests/cli-backends.test.js tests/ui-workbench.test.js` passed 28 tests; `node --check plugin.js` and `node --check cli-backends.js` passed. Package inspection shows only `cli-backends.js`, `index.html`, `logo.png`, `manifest.json`, `plugin.js`, `README.md`, and `style.css`; manifest inside package is ID `VFX_AI_TAGGER_CLI`, version `1.3.2`, `minWidth: 760`, `minHeight: 132`, `devTools: false`. Browser local smoke was not rerun because the current environment previously blocked local browser access; Eagle real-host smoke is still required. Unrelated untracked `docs/vfx-tag-taxonomy-review.md` remains untouched.

## Blockers And Risks
- Needs final manual smoke in Eagle with real selected assets and local CLI backends, especially collector bar top positioning, always-on-top state, and restore behavior.
- Current UI fix must preserve single-screen body no-scroll and keep material-list scrolling local to the selected-material modal/panel.
- New health checks must remain lightweight and must not perform real AI requests.
- Upstream merge is high-conflict in `plugin.js`, `index.html`, and `style.css`; wholesale replacement would regress local CLI backend and single-screen workbench.
- The 0601 package is not install/release clean as-is: it embeds nested packages, keeps the author plugin ID, leaves `devTools` enabled, and keeps the localized manifest shape that previously caused Eagle import/open ambiguity.
- Request chunking is covered by static tests and syntax checks, but still needs real Eagle/CLI smoke with many tags or many frames.
- Working tree may contain unrelated user file `docs/vfx-tag-taxonomy-review.md`; do not include or delete it unless explicitly requested.

## History
- Ledger initialized at 2026-05-25 12:58.
