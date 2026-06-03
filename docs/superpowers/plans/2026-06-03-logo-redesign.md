# Logo Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the disliked dark neon logo with a simple blue flat app icon and package version `1.3.8`.

**Architecture:** This is an asset and metadata update only. The PNG is generated deterministically from a tiny SVG-like drawing script, while tests assert the visual contract and versioned favicon reference.

**Tech Stack:** Node.js tests, PNG asset, Eagle plugin manifest/package zip.

---

### Task 1: Add Logo Visual Contract

**Files:**
- Modify: `tests/ui-workbench.test.js`

- [x] **Step 1: Write the failing test**

Add assertions that `logo.png` uses a blue app-icon background and enough white foreground pixels.

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/ui-workbench.test.js`
Expected: FAIL because the current logo background is near-black.

### Task 2: Replace Logo And Version References

**Files:**
- Modify: `logo.png`
- Modify: `index.html`
- Modify: `manifest.json`
- Modify: `tests/ui-workbench.test.js`

- [x] **Step 1: Generate a deterministic flat logo**

Draw a `128x128` PNG with a bright blue rounded-square background, white tag glyph, and small cyan sparkle.

- [x] **Step 2: Bump version references**

Set `manifest.json` version to `1.3.8` and favicon links to `logo.png?v=1.3.8`.

- [x] **Step 3: Run source checks**

Run:
`node --test tests/cli-backends.test.js tests/ui-workbench.test.js`
`node --check plugin.js`
`node --check cli-backends.js`

### Task 3: Package And Handoff

**Files:**
- Modify: `dist\特效AI标签管理-cli.eagleplugin`
- Modify: `PROJECT_STATUS.md`
- Modify: `NEXT_ACTIONS.md`
- Modify: `DECISIONS.md`

- [x] **Step 1: Repackage plugin**

Create `dist\特效AI标签管理-cli.eagleplugin` from the core plugin files only.

- [x] **Step 2: Inspect package**

Confirm the package contains the expected files and manifest version `1.3.8`.

- [x] **Step 3: Update ledger and commit**

Record verification evidence and commit the logo redesign.
