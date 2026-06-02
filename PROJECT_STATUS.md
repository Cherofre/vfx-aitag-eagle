# Project Status

## Current Snapshot
- Last Updated: 2026-06-02 10:10
- Phase: 0601 selective merge packaged
- Superpowers Phase: executing-plans + TDD + project-ledger-loop
- Branch: codex/merge-author-0601-features
- Goal: 特效 AI 标签管理 Eagle 插件单屏工作台优化、CLI 图像读取修复、验证并重新打包；评估作者新版插件可合并内容
- Current Focus: Selectively merged 0601 reliability features into the local CLI workbench and repackaged version `1.1.4`.
- Superpowers Spec: none
- Superpowers Plan: `docs/superpowers/plans/2026-05-26-author-ui-merge.md`
- Current Task: Install `dist\特效AI标签管理-cli.eagleplugin` in Eagle and smoke-test CLI/Eagle AI analysis with the new settings.

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
- [x] Extracted and evaluated author package `AI 标签工具0601.eagleplugin`; identified useful feature candidates but confirmed whole-package merge would regress CLI support and single-screen workbench behavior.
- [x] Selectively merged 0601 features: title-in-prompt toggle, AI retry count, request chunking, write progress, result cache, JSON repair, diagnostic directory validation, and directory picker fallback.
- [x] Bumped manifest to `1.1.4` and repackaged `dist\特效AI标签管理-cli.eagleplugin`.

## Verification
- Last command: `System.IO.Compression.ZipFile` listed entries in `dist\特效AI标签管理-cli.eagleplugin`.
- Result: pass
- Evidence / notes: `node --test tests/cli-backends.test.js tests/ui-workbench.test.js` passed 21 tests. `node --check plugin.js` and `node --check cli-backends.js` passed. Package inspection shows only `cli-backends.js`, `index.html`, `logo.png`, `manifest.json`, `plugin.js`, `README.md`, and `style.css`; manifest inside package is ID `VFX_AI_TAGGER_CLI`, version `1.1.4`, `devTools: false`. In-app Browser rejected `file:///I:/AI/Vibe%20Coding/vfx-aitag-eagle/index.html` by URL policy, so no browser layout smoke was performed this turn. Eagle real-host smoke is still required.

## Blockers And Risks
- Needs final manual smoke in Eagle with real selected assets and local CLI backends.
- Upstream merge is high-conflict in `plugin.js`, `index.html`, and `style.css`; wholesale replacement would regress local CLI backend and single-screen workbench.
- The 0601 package is not install/release clean as-is: it embeds nested packages, keeps the author plugin ID, leaves `devTools` enabled, and keeps the localized manifest shape that previously caused Eagle import/open ambiguity.
- Request chunking is covered by static tests and syntax checks, but still needs real Eagle/CLI smoke with many tags or many frames.
- Working tree may contain unrelated user file `docs/vfx-tag-taxonomy-review.md`; do not include or delete it unless explicitly requested.

## History
- Ledger initialized at 2026-05-25 12:58.
