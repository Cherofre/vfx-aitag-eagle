# Decisions

## Active Decisions
- 2026-05-25: Use Project Ledger Loop + Superpowers execution discipline for the single-screen UI rebuild.
- 2026-05-25: Work in the current repository on branch `codex/single-screen-workbench` with staged git commits.
- 2026-05-25: Use a right-side settings drawer and keep analysis results as the primary visible work area.
- 2026-05-25: Prefer native Codex executable and guarded Claude image reads for CLI backends.
- 2026-05-26: Merge author package updates selectively; do not replace the current CLI/workbench files wholesale.
- 2026-05-26: Fix author package import by using Eagle manifest localization placeholder instead of removing i18n.
- 2026-05-26: Use a fixed-v2 package and require Eagle reload/reinstall for open-path verification.

## Decision Log

## 2026-05-26 - Author package open-path v2
- Status: active
- Decision: Ship a fixed-v2 author package with version `1.0.1`, localized manifest name, explicit `platform/arch`, top-level `devTools`, common window fields, and `main.runAfterInstall: true`; also keep a no-space filename duplicate for testing.
- Reason: The first fixed package removed the manifest load crash but did not auto-open, and command-line launches while Eagle is already running only append argv to the log rather than executing the install/open path.
- Alternatives considered: Keep iterating only on the original fixed package; skipped because it leaves run-after-install and command-line filename/path issues ambiguous.
- Consequences / follow-up: Verify by reloading/restarting Eagle or reinstalling from Eagle UI, then checking for `Open plugin` / `Create plugin` log lines.

## 2026-05-26 - Author package import fix
- Status: active
- Decision: For the standalone author package, keep `fallbackLanguage`/`languages` and change manifest `name` to `{{manifest.app.name}}`.
- Reason: Eagle 4.0.0 `loadManifest` assumes localized manifests contain at least one `{{...}}` placeholder; a plain `name` with `languages` triggers `Cannot read properties of null (reading 'forEach')`.
- Alternatives considered: Remove i18n fields and `_locales`; skipped because the author already ships locale files and the placeholder fix is smaller.
- Consequences / follow-up: Use `C:\Users\mumengfei\Downloads\AI 标签工具-fixed.eagleplugin` for import tests; original download is unchanged.

## 2026-05-26 - Author package merge strategy
- Status: active
- Decision: Treat `C:\Users\mumengfei\Downloads\AI 标签工具.eagleplugin` as an upstream feature source and port compatible pieces selectively into the current CLI/workbench branch.
- Reason: The author package adds useful diagnostics/i18n/theme/run-control features, but its `plugin.js`, `index.html`, and `style.css` conflict heavily with local Claude/Codex CLI support and the single-screen workbench.
- Alternatives considered: Replace current files with author package; skipped because it removes local CLI backend support and regresses the no-whole-page-scroll UI.
- Consequences / follow-up: Merge in small commits with tests after each slice; preserve existing storage keys and UI contract.

## 2026-05-25 - UI rebuild workflow
- Status: active
- Decision: Use `executing-plans`, TDD, `ui-ux-pro-max`, `verification-before-completion`, and Project Ledger Loop for this UI rebuild.
- Reason: The task spans layout, JS interaction, visual verification, packaging, and handoff, so durable state and staged verification reduce resume risk.
- Alternatives considered: Single final uncommitted patch; skipped because the user requested handoff and phased git.
- Consequences / follow-up: Keep `PROJECT_STATUS.md` and `NEXT_ACTIONS.md` current at phase boundaries and commit stable slices.

## 2026-05-25 - Branch and commit cadence
- Status: active
- Decision: Work on `codex/single-screen-workbench` in the current checkout and commit by stage.
- Reason: The user asked for staged git, and keeping work in this checkout preserves the plugin package path they are testing.
- Alternatives considered: New worktree; skipped to avoid moving the expected local plugin workspace.
- Consequences / follow-up: Do not push unless explicitly asked.

## 2026-05-25 - Single-screen UI shape
- Status: active
- Decision: Move low-frequency AI/backend/analysis settings into a right drawer; keep selected assets and results visible in the main work area.
- Reason: User wants all operations on one screen, with only regional scrolling and analysis results visible without whole-page scrolling.
- Alternatives considered: Modal settings and tabbed pages; skipped because they hide either context or the primary workflow.
- Consequences / follow-up: Preserve existing input IDs and localStorage keys to avoid breaking saved settings.

## 2026-05-25 - CLI image backend reliability
- Status: active
- Decision: Resolve bare Codex commands to native `codex.exe`; run Claude with `bypassPermissions` and `--add-dir <frame-dir> -- <prompt>`; fallback when a backend admits it did not read image frames.
- Reason: Eagle's child process PATH can miss `codex`, Node spawning `.cmd` shims changes argument parsing, and Claude `dontAsk` mode can fail to read local image paths.
- Alternatives considered: Require users to manually enter absolute CLI paths; skipped because it would keep the plugin fragile across Eagle launches.
- Consequences / follow-up: Real Eagle host smoke is still required with actual selected assets.

## YYYY-MM-DD - Example Decision Format
- Status: superseded
- Decision: Replace this example with the first real decision.
- Reason: Shows the required decision fields.
- Alternatives considered: None.
- Consequences / follow-up: Keep active decisions indexed at the top.
- Superseded by: First real decision.
