# Author UI Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the useful parts of the author UI into the local CLI-capable Eagle plugin while preserving the single-screen workbench, local Claude/Codex backends, and regional scrolling.

**Architecture:** Keep the current `index.html` workbench shell and `plugin.js` analysis flow. Port visual polish, frameless draggable chrome, settings drawer tabs, richer result diagnostics, and continue/restart controls as local incremental changes. Keep existing form IDs and storage keys unless explicitly changing the plugin ID in `manifest.json`.

**Tech Stack:** Eagle plugin HTML/CSS/JavaScript, Node test runner, Playwright/browser smoke when available.

---

### Task 1: Chrome, Identity, And Visual Polish

**Files:**
- Modify: `manifest.json`
- Modify: `index.html`
- Modify: `style.css`
- Test: `tests/ui-workbench.test.js`

- [ ] Add failing UI tests for a unique plugin ID, no author credit in the title area, frameless window settings, and draggable chrome with no-drag controls.
- [ ] Update `manifest.json` to a local unique ID and frameless rounded-window options.
- [ ] Remove the author/QQ credit from `index.html`.
- [ ] Polish base colors, panels, buttons, and drag/no-drag CSS without reintroducing body scrolling.
- [ ] Run `node --test tests/ui-workbench.test.js`, `node --check plugin.js`, and commit.

### Task 2: Settings Drawer Tabs

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `plugin.js`
- Test: `tests/ui-workbench.test.js`

- [ ] Add failing UI tests for drawer tabs: AI backend, analysis parameters, frame extraction, write/diagnostics, and prompt section.
- [ ] Reorganize drawer markup into tabs while keeping all existing input IDs and localStorage fields.
- [ ] Add tab switching logic in `plugin.js`.
- [ ] Style tabs and drawer scrolling.
- [ ] Run targeted tests and commit.

### Task 3: Result Cards And Diagnostics UI

**Files:**
- Modify: `index.html` if needed
- Modify: `style.css`
- Modify: `plugin.js`
- Test: `tests/ui-workbench.test.js`

- [ ] Add failing tests for result cards showing status, file name, backend, confidence, frame count, AI reason, failure type, and diagnostics details.
- [ ] Add diagnostic settings controls and persist fields compatibly.
- [ ] Add diagnostic metadata during media preparation and error paths.
- [ ] Render richer result cards with collapsible diagnostic details.
- [ ] Run targeted tests and commit.

### Task 4: Continue And Restart Workflow

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `plugin.js`
- Test: `tests/ui-workbench.test.js`

- [ ] Add failing tests for continue and restart controls.
- [ ] Add `continueBtn` and `restartBtn` markup near pause/start controls.
- [ ] Track paused state and pending results.
- [ ] Implement continue for pending queue and restart for current selected batch.
- [ ] Run all tests, browser layout checks, package, update ledger, and commit.
