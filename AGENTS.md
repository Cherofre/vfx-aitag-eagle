# Agent Instructions

## Project Ledger Loop

Before starting task work in this repository:
1. Read `AGENTS.md`.
2. Read `PROJECT_STATUS.md`.
3. Read `NEXT_ACTIONS.md`.
4. Read `DECISIONS.md`.
5. Inspect `git status --short --branch`.

Keep `PROJECT_STATUS.md`, `NEXT_ACTIONS.md`, and `DECISIONS.md` updated when phase, scope, verification, blockers, or key decisions change.

Keep current state at the top:
- `PROJECT_STATUS.md` starts with `Current Snapshot`.
- `NEXT_ACTIONS.md` starts with `Now` and keeps only 3-7 active items.
- Superseded decisions in `DECISIONS.md` must be marked `Status: superseded`.

Use Superpowers as the main build workflow for complex feature, fix, package, or ship work. Use these ledger files as the durable handoff layer for Superpowers and non-Superpowers sessions.

When resuming work, run `scripts/check_ledger.py <repo-path>` if the Project Ledger Loop skill is available.

Do not push to remote unless the user explicitly asks or project instructions require it.
