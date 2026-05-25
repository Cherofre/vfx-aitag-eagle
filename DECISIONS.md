# Decisions

## Active Decisions
- 2026-05-25: Use Project Ledger Loop + Superpowers execution discipline for the single-screen UI rebuild.
- 2026-05-25: Work in the current repository on branch `codex/single-screen-workbench` with staged git commits.
- 2026-05-25: Use a right-side settings drawer and keep analysis results as the primary visible work area.

## Decision Log

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

## YYYY-MM-DD - Example Decision Format
- Status: superseded
- Decision: Replace this example with the first real decision.
- Reason: Shows the required decision fields.
- Alternatives considered: None.
- Consequences / follow-up: Keep active decisions indexed at the top.
- Superseded by: First real decision.
