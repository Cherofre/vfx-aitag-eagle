# Project Status

## Current Snapshot
- Last Updated: 2026-06-01 11:09
- Phase: Release published
- Superpowers Phase: executing-plans + TDD + project-ledger-loop
- Branch: codex/single-screen-workbench
- Goal: 特效 AI 标签管理 Eagle 插件单屏工作台优化、CLI 图像读取修复、验证并重新打包；评估作者新版插件可合并内容
- Current Focus: Published the current packaged Eagle plugin artifact to GitHub Releases as `v1.0.0`.
- Superpowers Spec: none
- Superpowers Plan: `docs/superpowers/plans/2026-05-26-author-ui-merge.md`
- Current Task: Hand off GitHub release `v1.0.0` and continue Eagle real-host smoke testing when available.

## Resume Here
- Start with: install `I:\AI\Vibe Coding\vfx-aitag-eagle\dist\特效AI标签管理-cli.eagleplugin` in Eagle and smoke-test selection refresh failures, write failures, frameless dragging, settings tabs, diagnostics, and pause/continue/restart controls.
- Next verification: after merge, run `node --test tests/cli-backends.test.js tests/ui-workbench.test.js`, `node --check plugin.js`, `node --check cli-backends.js`, then repackage and inspect archive.
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

## Verification
- Last command: `Compress-Archive` packaged `dist\特效AI标签管理-cli.eagleplugin` and inspected archive entries.
- Result: pass
- Evidence / notes: `node --test tests/cli-backends.test.js tests/ui-workbench.test.js` passed 18 tests. `node --check plugin.js` and `node --check cli-backends.js` passed. Node smoke for a 40,000-character Codex prompt plus 60 long frame paths produced argv length 1406, stdin length 40000, imageCount 16, final arg `-`. Package inspection confirmed `manifest.json`, `index.html`, `style.css`, `plugin.js`, `cli-backends.js`, `README.md`, and `logo.png` are present. `gh release view v1.0.0` confirmed release URL `https://github.com/Cherofre/vfx-aitag-eagle/releases/tag/v1.0.0`, asset `vfx-aitag-eagle-cli-1.0.0.eagleplugin`, size 32931, sha256 `2465d9a5ef78969268c1d834d7f3a3189ae57ad84c9d59bdd5774cd218c1230b`. Eagle real-host smoke is still required.

## Blockers And Risks
- Needs final manual smoke in Eagle with real selected assets and local CLI backends.
- Upstream merge is high-conflict in `plugin.js`, `index.html`, and `style.css`; wholesale replacement would regress local CLI backend and single-screen workbench.
- Working tree may contain unrelated user file `docs/vfx-tag-taxonomy-review.md`; do not include or delete it unless explicitly requested.

## History
- Ledger initialized at 2026-05-25 12:58.
