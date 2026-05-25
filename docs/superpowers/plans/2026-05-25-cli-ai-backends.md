# CLI AI Backends Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add local Claude and Codex CLI backends so the Eagle plugin can analyze assets without Eagle AI SDK/API-key setup.

**Architecture:** Keep the existing Eagle AI SDK path as a fallback. Add a plain browser-compatible `cli-backends.js` helper module that can also be required by Node tests. The plugin UI stores enabled backends and command settings, then tries backends in user-configured order until one returns valid tag JSON.

**Tech Stack:** Eagle plugin HTML/CSS/JS, Electron Node APIs (`child_process`, `fs`, `path`), Node built-in test runner/assertions.

---

### Task 1: Test CLI Backend Helpers

**Files:**
- Create: `tests/cli-backends.test.js`
- Create: `cli-backends.js`

- [ ] **Step 1: Write tests for JSON extraction, prompt building, backend command args, and fallback execution**

Run: `node --test tests/cli-backends.test.js`

Expected: FAIL because `cli-backends.js` does not exist yet.

- [ ] **Step 2: Implement `cli-backends.js`**

Expose `createAnalysisPrompt`, `parseCliJson`, `createCliPlan`, `runCliBackend`, `runCliBackends`, and `DEFAULT_BACKENDS` through CommonJS and `window.VfxAiTaggerBackends`.

- [ ] **Step 3: Re-run tests**

Run: `node --test tests/cli-backends.test.js`

Expected: PASS.

### Task 2: Wire Plugin UI And Settings

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `plugin.js`

- [ ] **Step 1: Add backend controls**

Add backend selector fields for Claude CLI, Codex CLI, fallback to Eagle AI, command names, timeout, and optional args.

- [ ] **Step 2: Persist settings**

Extend existing `readSettings`, `saveSettings`, and `loadSettings` paths with the new control IDs.

- [ ] **Step 3: Route analysis**

Replace the single `getAiModel` requirement with backend availability checks. Try selected CLI backends first; call existing Eagle SDK function only when selected and configured.

### Task 3: Verify And Commit

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document the new local CLI mode**

Describe Claude and Codex login prerequisites and expected commands.

- [ ] **Step 2: Run verification**

Run: `node --test tests/cli-backends.test.js`, `node --check cli-backends.js`, `node --check plugin.js`.

- [ ] **Step 3: Commit**

Run: `git add . && git commit -m "Add local CLI AI backends"`.
