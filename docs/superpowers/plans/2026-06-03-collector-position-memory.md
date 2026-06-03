# Collector Position Memory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing collector bar remember and restore the user's dragged position while staying on-screen.

**Architecture:** Add a collector-only bounds value in localStorage. `getCollectorWindowBounds()` reads saved bounds first, clamps them with existing screen helpers, and falls back to the old top-centered ideal. Collector mode exit paths call a small save helper before changing size or closing.

**Tech Stack:** Plain JavaScript, Eagle plugin window APIs, Node test runner static UI contract tests, PowerShell package inspection.

---

### Task 1: Lock Position Memory Contract

**Files:**
- Modify: `tests/ui-workbench.test.js`

- [x] Add a static test that asserts `plugin.js` exposes `collectorWindowBounds` storage, `readStoredCollectorWindowBounds()`, `saveCollectorWindowBounds()`, uses the saved bounds in `getCollectorWindowBounds()`, and saves before collector exit/close/analyze.

- [x] Run `node --test tests/ui-workbench.test.js` and verify the new test fails because those functions do not exist yet.

### Task 2: Implement Collector Bounds Persistence

**Files:**
- Modify: `plugin.js`

- [x] Add `collectorWindowBounds` to `STORAGE_KEYS`.
- [x] Implement JSON read/write helpers for collector bounds.
- [x] Update `getCollectorWindowBounds()` to prefer saved collector bounds, normalized to collector width/height and clamped to the current available screen.
- [x] Save current collector bounds before exiting collector mode, starting analysis from collector mode, and closing from collector mode.
- [x] Keep the existing top-centered default when no saved bounds exists.

- [x] Run `node --test tests/ui-workbench.test.js` and verify the new test passes.

### Task 3: Package as 1.0.4

**Files:**
- Modify: `manifest.json`
- Modify: `index.html`
- Modify: `README.md`
- Modify: `dist/特效AI标签管理-cli.eagleplugin`

- [x] Bump manifest version and favicon cache-buster from `1.0.3` to `1.0.4`.
- [x] Add a short README note that the collector bar position is remembered and clamped on-screen.
- [x] Rebuild `dist/特效AI标签管理-cli.eagleplugin`.
- [x] Inspect the package contents and manifest.

### Task 4: Verify and Sync Local Install

**Files:**
- Modify: project ledger files

- [x] Run `node --test tests/cli-backends.test.js tests/ui-workbench.test.js`.
- [x] Run `node --check plugin.js` and `node --check cli-backends.js`.
- [x] Copy the core plugin files into `C:\Users\mumengfei\AppData\Roaming\Eagle\Plugins\VFX_AI_TAGGER_CLI`.
- [ ] Update ledger files with verification evidence and the remaining Eagle smoke checklist.
- [x] Commit the implementation branch.
