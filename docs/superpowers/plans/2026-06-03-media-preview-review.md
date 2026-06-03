# Media Preview Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a media preview review flow so users can inspect images/videos while validating AI tags.

**Architecture:** Keep the single-screen workbench intact and add a local preview dialog outside the main grid. Result cards and selected-material rows open the same dialog; the dialog chooses plugin-native image/video preview when possible and exposes Eagle's own `item.open({ window: true })` as the reliable fallback.

**Tech Stack:** Eagle plugin HTML/CSS/JavaScript, Node/NW file URL helpers, existing `node --test` UI contract tests.

---

### Task 1: UI Contract Tests

**Files:**
- Modify: `tests/ui-workbench.test.js`

- [ ] **Step 1: Write the failing test**

Add assertions that require:
- `index.html` contains `mediaPreviewOverlay`, `mediaPreviewDialog`, `mediaPreviewBody`, `mediaPreviewTags`, `mediaPreviewPrevBtn`, `mediaPreviewNextBtn`, `mediaPreviewOpenEagleBtn`, and `closeMediaPreviewBtn`.
- `plugin.js` contains `openMediaPreview`, `renderMediaPreview`, `openPreviewInEagle`, `buildMediaPreviewModel`, and event bindings for `data-preview-item` / `data-preview-result`.
- `style.css` contains `.media-preview-dialog`, `.media-preview-main`, `.media-preview-player video`, and `.media-preview-tags`.

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node --test tests/ui-workbench.test.js
```

Expected: FAIL because the media preview dialog and JS functions do not exist.

### Task 2: Preview Dialog Markup And Styling

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Step 1: Add dialog markup**

Add a modal after the selected-material dialog and before the settings drawer:

```html
<div id="mediaPreviewOverlay" class="media-preview-overlay" hidden></div>
<section id="mediaPreviewDialog" class="panel media-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="mediaPreviewTitle" aria-hidden="true" hidden>
  <div class="media-preview-head">
    <div>
      <h2 id="mediaPreviewTitle">素材预览</h2>
      <p id="mediaPreviewMeta" class="hint"></p>
    </div>
    <div class="media-preview-actions">
      <button id="mediaPreviewPrevBtn" type="button">上一个</button>
      <button id="mediaPreviewNextBtn" type="button">下一个</button>
      <button id="mediaPreviewOpenEagleBtn" type="button">用 Eagle 打开</button>
      <button id="closeMediaPreviewBtn" type="button">关闭</button>
    </div>
  </div>
  <div class="media-preview-main">
    <div id="mediaPreviewBody" class="media-preview-player"></div>
    <aside class="media-preview-side">
      <div id="mediaPreviewStatus" class="media-preview-status"></div>
      <div id="mediaPreviewTags" class="media-preview-tags"></div>
      <div id="mediaPreviewReason" class="media-preview-reason"></div>
    </aside>
  </div>
</section>
```

- [ ] **Step 2: Add styles**

Add CSS that keeps the whole page no-scroll, centers the dialog, constrains it to `92vw`/`88vh`, gives the media area stable dimensions, and makes only the side panel/dialog contents scroll when needed.

### Task 3: Selected Row And Result Card Entry Points

**Files:**
- Modify: `plugin.js`

- [ ] **Step 1: Add preview buttons**

In `createSelectedItemRow(item)`, add a `预览` button with `data-preview-item="<id>"`.

In each result card's `.result-actions`, add a `预览` button with `data-preview-result="<id>"`.

- [ ] **Step 2: Bind click handlers**

After rendering selected rows and results, bind the new buttons to:

```js
button.addEventListener("click", () => openMediaPreview({ itemId: button.dataset.previewItem }));
button.addEventListener("click", () => openMediaPreview({ resultId: button.dataset.previewResult }));
```

### Task 4: Preview Data Model And Rendering

**Files:**
- Modify: `plugin.js`

- [ ] **Step 1: Add state**

Add:

```js
mediaPreview: {
  open: false,
  itemId: "",
  resultId: "",
  order: []
}
```

- [ ] **Step 2: Build preview model**

Implement `buildMediaPreviewModel({ itemId, resultId })` to resolve:
- selected item,
- matching result if present,
- file path,
- preview path,
- media kind (`video`, `image`, or `unknown`),
- file URL,
- fallback preview URL,
- selected/review tags and AI reason.

- [ ] **Step 3: Render media**

Implement `renderMediaPreview()`:
- Video: `<video controls preload="metadata" src="file://..."></video>`
- Image/GIF: `<img src="file://...">`
- Unknown/missing: show a clear empty state plus the Eagle-open button.
- Add a video `error` listener that swaps to preview image or diagnostic frames if available.

### Task 5: Eagle Open Fallback And Keyboard/Overlay Controls

**Files:**
- Modify: `plugin.js`

- [ ] **Step 1: Open in Eagle**

Implement `openPreviewInEagle()` to call the item API when available:

```js
if (item && typeof item.open === "function") await item.open({ window: true });
else if (eagle?.item?.open) await eagle.item.open(itemId, { window: true });
```

Use `showError()` for failures.

- [ ] **Step 2: Navigation and close**

Bind overlay click, close button, `Escape`, and previous/next buttons. Keep next/previous within current filtered results when opened from a result, otherwise within selected items.

### Task 6: Verification And Packaging

**Files:**
- Modify: `PROJECT_STATUS.md`
- Modify: `NEXT_ACTIONS.md`
- Modify: `DECISIONS.md`
- Optional Modify: `manifest.json`
- Optional Modify: `dist/特效AI标签管理-cli.eagleplugin`

- [ ] **Step 1: Run tests**

```powershell
node --test tests/cli-backends.test.js tests/ui-workbench.test.js
node --check plugin.js
node --check cli-backends.js
```

- [ ] **Step 2: Package if manifest/files changed as a testable artifact**

Use the existing package command pattern:

```powershell
Compress-Archive -Path cli-backends.js,index.html,logo.png,manifest.json,plugin.js,README.md,style.css -DestinationPath dist\特效AI标签管理-cli.eagleplugin -Force
```

- [ ] **Step 3: Commit**

Commit only the feature files and ledger updates, leaving unrelated `docs/vfx-tag-taxonomy-review.md` untracked.
