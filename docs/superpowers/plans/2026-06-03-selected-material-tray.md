# Selected Material Tray Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the selected-material vertical list with a compact three-card tray and a clearer expansion flow.

**Architecture:** Keep the existing selected-material dialog and event IDs. Add a tray limit constant in `plugin.js`, render compact cards in the main panel, render all items in the existing dialog, and update CSS so the tray is fixed-height while the full dialog scrolls locally.

**Tech Stack:** Eagle plugin HTML/CSS/JavaScript, existing Node `node --test` UI contract tests, PowerShell packaging with `Compress-Archive`.

---

### Task 1: RED UI Contract

**Files:**
- Modify: `tests/ui-workbench.test.js`

- [x] **Step 1: Replace the old selected-material scroll-list assertion**

Require `SELECTED_TRAY_LIMIT = 3`, `slice(0, SELECTED_TRAY_LIMIT)`, compact selected cards, a `selected-expand-card`, copy `展开素材`, and no `完整列表` copy in `index.html`.

- [x] **Step 2: Run test to verify it fails**

Run:

```powershell
node --test tests/ui-workbench.test.js
```

Expected: FAIL because current code renders all selected materials as rows and still uses `完整列表`.

### Task 2: Main Tray Markup And Rendering

**Files:**
- Modify: `index.html`
- Modify: `plugin.js`

- [x] **Step 1: Rename the expansion button copy**

Change `showSelectedListBtn` text from `完整列表` to `展开素材`.

- [x] **Step 2: Render only tray cards in the main panel**

Add `SELECTED_TRAY_LIMIT = 3`. `renderSelectedItems()` renders up to three cards, reserving the final visible card for an expand card when the queue is longer than the limit.

- [x] **Step 3: Keep the full dialog complete**

`renderSelectedFullList()` continues to render every selected item with a fuller row/card view.

### Task 3: Styling

**Files:**
- Modify: `style.css`

- [x] **Step 1: Convert `.selected-list` to a fixed tray grid**

Use three columns, stable height, hidden overflow, and compact card spacing.

- [x] **Step 2: Add thumbnail and expand-card styles**

Style `.selected-card`, `.selected-thumb`, `.selected-expand-card`, and compact preview buttons to fit the single-screen workbench.

- [x] **Step 3: Keep the full dialog locally scrollable**

Keep `.selected-full-list` as the full scroll region, using cards or rows that remain readable in the drawer-sized dialog.

### Task 4: Verification And Package

**Files:**
- Modify: `PROJECT_STATUS.md`
- Modify: `NEXT_ACTIONS.md`
- Modify: `DECISIONS.md`
- Regenerate: `dist/特效AI标签管理-cli.eagleplugin`

- [x] **Step 1: Run tests and syntax checks**

Run:

```powershell
node --test tests/cli-backends.test.js tests/ui-workbench.test.js
node --check plugin.js
node --check cli-backends.js
```

- [x] **Step 2: Repackage and inspect**

Use `Compress-Archive` to regenerate the package and inspect entries, manifest ID/version, and `devTools=false`.

- [x] **Step 3: Update ledger and commit**

Record verification evidence and commit the focused tray change. Leave unrelated `docs/vfx-tag-taxonomy-review.md` untouched.
