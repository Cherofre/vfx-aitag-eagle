# Collection Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Eagle selection collection feel continuous by appending current selections, adding clear controls, adding plugin-internal context menus, and adding a compact collector bar mode.

**Architecture:** Keep the current single-screen workbench and backend analysis flow. Add small UI controls in `index.html`, focused layout rules in `style.css`, and selection/collector/context-menu helpers in `plugin.js`. Do not inject Eagle host menus; the host right-click plugin entry only opens/shows the plugin, then plugin events append the current Eagle selection.

**Tech Stack:** Eagle plugin APIs (`eagle.item.getSelected`, `eagle.event`, `eagle.contextMenu`, `eagle.window` where available), vanilla HTML/CSS/JS, Node test runner static contract tests.

---

### Task 1: Collection Contracts

**Files:**
- Modify: `tests/ui-workbench.test.js`

- [ ] **Step 1: Write failing UI contract tests**

Add tests that assert:
- material controls expose `appendSelectedBtn`, `replaceSelectedBtn`, `clearSelectedBtn`, `showSelectedListBtn`, and `miniCollectorBtn`
- plugin script exposes `appendSelectedItems`, `replaceSelectedItems`, `clearSelectedQueue`, `mergeSelectedItems`, `bindPluginRunCollection`, `enterCollectorMode`, `exitCollectorMode`, and `openWorkbenchContextMenu`
- selected rows expose `data-item-id` for item-level context menus
- collector bar markup and CSS exist

- [ ] **Step 2: Run RED**

Run:

```powershell
node --test tests/ui-workbench.test.js
```

Expected: FAIL because the new controls/functions are not present yet.

### Task 2: Append, Replace, Clear

**Files:**
- Modify: `index.html`
- Modify: `plugin.js`
- Modify: `style.css`
- Modify: `README.md`

- [ ] **Step 1: Implement material controls**

Replace the old ambiguous material buttons with:
- `追加当前选中`
- `替换为当前选中`
- `清空`
- `完整列表`
- `采集条`

- [ ] **Step 2: Implement selection queue helpers**

Add helpers:
- `fetchEagleSelectedItems()`
- `mergeSelectedItems(nextItems, mode)`
- `appendSelectedItems(actionName)`
- `replaceSelectedItems(actionName)`
- `clearSelectedQueue()`

Rules:
- append deduplicates by Eagle item id, then by local file path
- replace clears selected items and existing results before inserting new items
- clear clears selected items, results, analysis progress, write progress, and closes the full-list dialog
- status text reports added/skipped counts

- [ ] **Step 3: Preserve analysis behavior**

Keep `analyzeSelected()` reading `state.selectedItems` exactly as before after the queue has been updated.

### Task 3: Plugin Run Collection

**Files:**
- Modify: `plugin.js`
- Modify: `README.md`

- [ ] **Step 1: Bind Eagle plugin events defensively**

Add `bindPluginRunCollection()` during initialization.

Behavior:
- first open keeps the existing initialization read as append
- `onPluginRun` and `onPluginShow` append the current Eagle selection when available
- event binding must no-op outside Eagle or on Eagle versions without these events
- do not start analysis from these events

- [ ] **Step 2: Avoid duplicate noise**

If no new items are added, status says `当前选中素材已在待分析列表中` rather than replacing the queue.

### Task 4: Plugin-Internal Context Menus

**Files:**
- Modify: `plugin.js`
- Modify: `style.css`

- [ ] **Step 1: Add right-click handlers**

Add plugin-internal context menus using `eagle.contextMenu.open()` when available, with a DOM fallback for unsupported hosts.

Menus:
- selected panel empty area: append current selection, replace current selection, clear queue, open full list, enter collector bar
- selected item row: analyze this item, remove this item, copy file path
- result card: reanalyze item, write this item when ready, copy selected tags, remove result
- tag chip: copy tag name, remove from this session tag pool

- [ ] **Step 2: Keep disabled states clear**

Menu items that cannot run should either be omitted or disabled by local checks.

### Task 5: Collector Bar Mode

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `plugin.js`

- [ ] **Step 1: Add collector bar shell**

Add a hidden `collectorBar` outside the main workbench with:
- queue count
- append current selection
- analyze
- expand workbench
- close

- [ ] **Step 2: Implement mode switch**

`enterCollectorMode()` stores the current workbench window size when possible, adds `collector-mode` to `body`, and asks Eagle window API for a compact size when available. `exitCollectorMode()` restores the full workbench class and previous size when possible.

- [ ] **Step 3: Keep analysis deliberate**

Collector bar `分析` expands the workbench and focuses the normal analysis flow; it does not silently analyze unless the normal analyze button behavior is explicitly invoked by the user.

### Task 6: Verification, Packaging, Handoff

**Files:**
- Modify: `manifest.json`
- Modify: `dist/特效AI标签管理-cli.eagleplugin`
- Modify: `PROJECT_STATUS.md`
- Modify: `NEXT_ACTIONS.md`
- Modify: `DECISIONS.md`

- [ ] **Step 1: Run checks**

Run:

```powershell
node --test tests/cli-backends.test.js tests/ui-workbench.test.js
node --check plugin.js
node --check cli-backends.js
```

- [ ] **Step 2: Bump and package**

Bump manifest to `1.3.0` and repackage only:

```text
cli-backends.js
index.html
logo.png
manifest.json
plugin.js
README.md
style.css
```

- [ ] **Step 3: Inspect package**

Confirm package manifest is `VFX_AI_TAGGER_CLI`, version `1.3.0`, `devTools=false`.

- [ ] **Step 4: Update ledger and commit**

Record verification evidence, Eagle smoke gaps, and dirty-tree note for `docs/vfx-tag-taxonomy-review.md`.
