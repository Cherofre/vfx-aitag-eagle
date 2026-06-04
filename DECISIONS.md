# Decisions

## Active Decisions
- 2026-05-25: Use Project Ledger Loop + Superpowers execution discipline for the single-screen UI rebuild.
- 2026-05-25: Work in the current repository on branch `codex/single-screen-workbench` with staged git commits.
- 2026-05-25: Use a right-side settings drawer and keep analysis results as the primary visible work area.
- 2026-05-25: Prefer native Codex executable and guarded Claude image reads for CLI backends.
- 2026-05-26: Merge author package updates selectively; do not replace the current CLI/workbench files wholesale.
- 2026-05-26: Fix author package import by using Eagle manifest localization placeholder instead of removing i18n.
- 2026-05-26: Use a fixed-v2 package and require Eagle reload/reinstall for open-path verification.
- 2026-05-26: Change the local plugin ID to `VFX_AI_TAGGER_CLI` so it does not collide with the author plugin.
- 2026-05-26: Merge author UI selectively into the local workbench instead of adopting the author page structure.
- 2026-05-26: Treat version `1.1.0` as the hardened CLI release package with release devTools disabled.
- 2026-06-02: Treat author 0601 as a selective feature source; prioritize behavior ports, not package/layout replacement.
- 2026-06-02: Merge 0601 reliability features on `codex/merge-author-0601-features` and package as version `1.1.4`.
- 2026-06-02: Build productivity workbench enhancements on `codex/productivity-workbench` with TDD and package as version `1.2.0`.
- 2026-06-02: Keep the topbar to primary global actions only; material actions live in the material panel and long material lists open in a local dialog.
- 2026-06-02: Closed local dialogs must use real hidden/display state so transparent fixed panels cannot intercept clicks.
- 2026-06-02: Use collection workflow instead of Eagle host-menu injection for right-click analysis.
- 2026-06-02: Collector bar mode should be a real small always-on-top floating window.
- 2026-06-02: Collector bar should be a prominent top collection control with icon actions, auto-collect-on-enter, and a clear queue action.
- 2026-06-02: Scale the collector window to `646×104`, clamp it inside the available screen, and use the generated tag-plus-sparkle logo.
- 2026-06-02: Restore full workbench bounds when Eagle persists collector-sized window bounds, and use styled manual tag suggestions instead of native `datalist`.
- 2026-06-02: Use `646×104` collector spacing and defer workbench restore on collector close to avoid a visible full-window flash.
- 2026-06-02: Declare `logo.png` as the page favicon with a version cache-buster so pinned/collector windows can use the same icon as `manifest.logo`.
- 2026-06-03: Persist undo history and stop active local CLI children on pause while keeping Eagle AI cancellation best-effort only.
- 2026-06-03: Replace the rejected dark neon logo with a bright blue flat app-icon mark.
- 2026-06-03: Ordinary plugin open/show must not auto-import Eagle's current selection; importing requires an explicit action or collector entry.
- 2026-06-03: Release `v1.0.1` should align manifest/favicon/package version to `1.0.1` and tag the reviewed commit explicitly.
- 2026-06-03: Release `v1.0.2` should tag the media-preview/tray commit and upload an English-named `.eagleplugin` asset.
- 2026-06-03: Release `v1.0.3` should supersede `v1.0.2` by removing collector-entry auto-collection.
- 2026-06-03: Merge the media-preview `1.0.3` work to `master`; keep the existing `v1.0.3` release asset because its digest matches the current package.
- 2026-06-03: Collector placement uses draggable remembered plugin-window bounds, not Eagle main-window following.
- 2026-06-04: Release `v1.0.4` from merged `master` with collector position memory and an English-named `.eagleplugin` asset.
- 2026-06-04: Media preview tag-only edits refresh only the preview side panel; the player node is rebuilt only when opening or navigating preview.
- 2026-06-04: Appending materials into an existing analysis result set creates pending results immediately and before pending filtering.
- 2026-06-04: Local video preview loops by default.
- 2026-06-03: Media acceptance preview should use a local plugin dialog first and Eagle native open as a codec/API fallback; branch package version is `1.0.2`.
- 2026-06-03: Use one compact activity progress slot and a three-slot selected-material thumbnail tray with explicit expansion.

## Decision Log

## 2026-06-04 - Default loop playback for local preview
- Status: active
- Decision: Add `loop` to the local media preview `<video>` element while keeping `controls autoplay muted playsinline preload="auto"`.
- Reason: VFX/material review usually benefits from repeated playback without manually replaying short clips, and this change does not affect images, Eagle-native opening, or analysis behavior.
- Alternatives considered: Add a UI toggle; skipped because the user asked for default loop and another control would add clutter. Loop only muted/autoplay videos conditionally; skipped because all local video previews share the same review behavior.
- Consequences / follow-up: Eagle smoke must verify short video previews loop and still keep playing through preview-side tag edits.

## 2026-06-04 - Incremental queue sync for appended materials
- Status: active
- Decision: When appending new Eagle-selected materials into an existing result set, create missing pending result records for those materials immediately. Also run the same sync before `analyzeSelected()` computes pending work.
- Reason: Paused analysis resumes by filtering `state.results` for pending items. New materials were only added to `state.selectedItems`, so they were invisible to the pending filter until the old pending batch finished and the user started again.
- Alternatives considered: Rebuild all results from `selectedItems` on every start; skipped because it would rerun completed/ready items unexpectedly. Only change the paused path; skipped because completed-result-plus-new-append has the same incremental queue need.
- Consequences / follow-up: Eagle smoke must confirm pause -> append -> start/continue processes old and new pending items in one run.

## 2026-06-04 - Stable video preview during tag review
- Status: active
- Decision: Split media preview rendering into player and details paths. Opening or navigating a preview may rebuild the media player; result-list refresh and preview-side tag edits must call a side-panel refresh only. Video previews use muted autoplay/playsinline plus a guarded `video.play()` call.
- Reason: Re-rendering the whole preview dialog after tag checkbox/delete changes replaced the `<video>` element, causing spinner/reload and returning to an unplayed state. Muted autoplay is the most reliable way to start playback inside the Eagle webview.
- Alternatives considered: Keep full preview re-render and try to restore playback time; skipped because it is more fragile and still causes visible reload. Use unmuted autoplay; skipped because browser/Electron autoplay policy can block it.
- Consequences / follow-up: Eagle smoke must verify the video starts automatically and keeps playing when preview-side tags are toggled or removed.

## 2026-06-04 - Release 1.0.4 publication
- Status: active
- Decision: Merge `codex/collector-position-memory` into `master`, tag merge commit `3e3b71c` as `v1.0.4`, and publish GitHub Release `v1.0.4` with asset `vfx-aitag-eagle-cli-1.0.4.eagleplugin`.
- Reason: The collector position memory package is versioned as `1.0.4`, tests and package inspection pass on `master`, and users need a downloadable release asset with a stable English filename.
- Alternatives considered: Reuse `v1.0.3`; skipped because the manifest/package version changed to `1.0.4`. Publish only the branch without merging; skipped because the user explicitly asked to merge and release.
- Consequences / follow-up: Eagle smoke still needs to verify native drag/restore behavior in the real host window.

## 2026-06-03 - Collector position memory
- Status: active
- Decision: Keep the existing collector bar shape, but remember the user's dragged collector window bounds in `vfxAiTagger.collectorWindowBounds`. Restore that position when entering `置顶采集`, clamp it to the visible screen, and keep collector imports explicit through `收集选中`.
- Reason: In non-fullscreen Eagle, a fixed screen-top collector bar feels detached from the user's working area. Remembered placement solves the awkward position without adding another capsule/minimized mode or depending on unavailable Eagle main-window bounds.
- Alternatives considered: Follow the Eagle main window; skipped because the plugin cannot reliably read the host app window bounds. Add a separate docked capsule mode; skipped for now because it creates another interaction shape and the user preferred方案 B first.
- Consequences / follow-up: Smoke in Eagle must verify native drag updates plugin bounds and that leaving/re-entering collector mode restores the saved position.

## 2026-06-03 - Merge 1.0.3 to master without retagging
- Status: active
- Decision: Merge `codex/media-preview-review` into `master` and push `master`. Do not move the existing `v1.0.3` tag or re-upload the release asset because the current package SHA256 matches the already-published GitHub Release asset.
- Reason: The user asked to merge to the main branch and upload release. The release already exists and contains the exact current package; force-moving a published tag or replacing an identical asset would add risk without changing the deliverable.
- Alternatives considered: Create `v1.0.4`; skipped because no code/package change exists beyond the published `1.0.3` artifact. Force-retag `v1.0.3` to the merge commit; skipped because mutating published tags is risky and unnecessary when the tag commit is reachable from `master`.
- Consequences / follow-up: `master` has been pushed to `origin/master`; run Eagle real-host smoke from the installed `1.0.3` files.

## 2026-06-03 - Collector entry no-auto-collect patch
- Status: active
- Decision: Remove automatic current-selection collection from `置顶采集` entry. Keep collection available only through explicit actions such as `追加当前选中`, collector `收集选中`, replace, and context-menu append. Package the fix as manifest/favicon version `1.0.3`.
- Reason: The user observed that entering collector mode still changed the queue by importing current Eagle selection, which conflicts with the newer expectation that opening or switching modes should not mutate the queue unexpectedly.
- Alternatives considered: Keep `v1.0.2` and document the behavior; skipped because the user flagged it during release handoff. Rewrite or delete the already-published `v1.0.2`; skipped because release/tag mutation is destructive and should not happen without explicit instruction.
- Consequences / follow-up: `v1.0.3` has been published and the local installed `VFX_AI_TAGGER_CLI` directory has been synchronized after it was found still running `1.0.2`. Verify in Eagle that `置顶采集` opens the always-on-top collector without importing until `收集选中` is clicked.

## 2026-06-03 - Release 1.0.2 publication
- Status: active
- Decision: Publish GitHub Release `v1.0.2` from commit `6384e03` with asset `vfx-aitag-eagle-cli-1.0.2.eagleplugin`.
- Reason: The package manifest is already aligned to `1.0.2`, and release users need an English-named asset for easier download and support.
- Alternatives considered: Upload the Chinese-named `dist\特效AI标签管理-cli.eagleplugin`; skipped to keep release assets consistent with `v1.0.0` and `v1.0.1`. Wait for Eagle host smoke before release; skipped because the user explicitly asked to upload the new release after checks, but the residual host-smoke risk remains documented.
- Consequences / follow-up: Install the GitHub release asset in Eagle and verify local preview, native open, unsupported-video fallback, tray expansion, and trash-remove behavior.

## 2026-06-03 - Selected-material thumbnail tray
- Status: active
- Decision: Keep selected-material confirmation compact by showing at most three tray slots in the main panel. When the queue has more than three materials, reserve the final visible slot for `展开全部 +N`; keep the header control as `展开素材`, and move full queue scrolling into the existing selected-material dialog titled `全部待分析素材`.
- Reason: The selected-material area is queue confirmation, not the main task surface. A vertical list or local scroller makes the results area feel squeezed and makes the expansion control unclear.
- Alternatives considered: Keep the full local scroller; skipped because it made the material area feel like a list page. Show three assets plus a separate fourth expand tile; skipped because the user wanted the main area capped around three visible cards. Hide the full dialog; skipped because users still need a complete queue review path.
- Consequences / follow-up: Eagle smoke must verify the tray stays fixed-height, thumbnails resolve, `展开素材` and `展开全部 +N` open the full dialog, and preview/right-click actions still work from both tray and dialog.

## 2026-06-03 - Compact progress and selected-material queue
- Status: superseded
- Decision: Collapse analysis/write progress into one active compact progress slot, hiding the inactive slot when the other starts. Render the full selected-material queue in the main selected panel with fixed-height local scrolling instead of clipping to the first 3 items.
- Reason: Stacked progress panels consumed too much vertical space in the primary result area, and the clipped selected-material panel made users depend on “完整列表” even for small queues.
- Alternatives considered: Move progress into a floating overlay; skipped because it can obscure result cards. Keep the selected panel as a summary plus full-list modal; skipped because it makes the normal workflow hard to scan. Expand the selected panel without a height cap; skipped because it would again squeeze analysis results.
- Consequences / follow-up: Eagle smoke must verify the selected-material panel scrolls locally with many assets and that analysis/write progress never stack visually.
- Superseded by: 2026-06-03 - Selected-material thumbnail tray.

## 2026-06-03 - Media acceptance preview flow
- Status: active
- Decision: Add `预览` entry points to selected-material rows and result cards. Use a local modal for image/video preview and tag validation, with `item.open({ window: true })` / `eagle.item.open(id, { window: true })` as the Eagle-native fallback. Package this branch as manifest/favicon version `1.0.2`.
- Reason: Users need to quickly verify whether AI tags match the actual media without losing the single-screen workbench context. Plugin-native playback is convenient but codec-limited, while Eagle native open is more reliable but switches context.
- Alternatives considered: Rely only on Eagle native preview; skipped because it breaks the tag-review flow. Embed videos directly in every list/card; skipped because it would add layout weight, scrolling pressure, and performance risk. Keep package version `1.0.1`; skipped because it would be hard to distinguish this branch artifact from the published release.
- Consequences / follow-up: Eagle smoke must verify native open behavior, video codec fallback, and preview-side tag edits before merging or releasing.

## 2026-06-03 - Release 1.0.1 version alignment and review fixes
- Status: active
- Decision: Treat GitHub Release `v1.0.1` as the public package version, aligning manifest and favicon cache-buster to `1.0.1`; fix subagent review findings before tagging.
- Reason: Publishing release `v1.0.1` with an internal `1.3.9` manifest would confuse users and make future support/version comparison harder.
- Alternatives considered: Publish `v1.3.9` instead; skipped because the user explicitly requested release `1.0.1`. Keep `1.3.9` manifest under a `v1.0.1` release; skipped because the release reviewer identified this as a P1 mismatch.
- Consequences / follow-up: Tag the exact reviewed commit and upload an English-named asset. Real Eagle smoke remains required after install.

## 2026-06-03 - No automatic import on ordinary open
- Status: active
- Decision: Remove startup current-selection append and plugin run/show auto-append binding. Keep current-selection reads only behind explicit controls: “追加当前选中”, “替换为当前选中”, internal context menu actions, and entering collector mode.
- Reason: Opening the plugin while browsing Eagle should not mutate the queue unexpectedly. The user wants to choose when selection is collected.
- Alternatives considered: Add a setting toggle; skipped for now because the request was to remove the behavior and another setting would add friction. Keep plugin-entry auto-import but disable startup import; skipped because the user described “每次打开” and plugin show/run can still feel like opening.
- Consequences / follow-up: Eagle smoke must verify ordinary open/show leaves the queue empty/unchanged while manual append and collector entry still collect selected assets.

## 2026-06-03 - Flat blue logo after visual rejection
- Status: active
- Decision: Replace the dark neon tag-plus-sparkle logo with a simple bright blue rounded-square app icon, a white filled tag mark, and small secondary sparkle; update manifest/favicon version to `1.3.8`.
- Reason: Eagle plugin list smoke showed the previous icon was visually noisy and ugly: the dark background blended into the UI while the purple/cyan outline mark looked busy at small sizes.
- Alternatives considered: Keep tweaking the previous dark logo; skipped because the user feedback was about the visual concept, not just size. Use a white-background icon; skipped because it may lose boundary clarity across Eagle themes.
- Consequences / follow-up: Install `1.3.8` and verify plugin-list, pinned, and collector-window icon paths. If an old icon remains, treat it as an Eagle/Windows cache issue after confirming the package contains the new PNG.

## 2026-06-03 - Persistent undo and CLI abort
- Status: active
- Decision: Store undo records in `vfxAiTagger.undoStack` and restore them on plugin launch; create a batch abort controller during analysis and pass its signal into Claude/Codex CLI calls so pausing kills active local child processes.
- Reason: Tag writes need a recovery path even after closing the plugin, and long local CLI requests need an immediate stop path instead of waiting for the current material to finish.
- Alternatives considered: Keep undo in memory only; skipped because closing the plugin discards the safety record. Kill all OS processes by name; skipped because it could terminate unrelated Claude/Codex sessions. Try to cancel Eagle AI directly; skipped because the host API does not expose a reliable cancellation contract here.
- Consequences / follow-up: Eagle smoke must verify persistent undo with a real selected item. Pausing Eagle AI-only analysis may still wait for the current host request to return.

## 2026-06-03 - Larger visible logo mark
- Status: superseded
- Decision: Keep the tag-plus-sparkle concept, but enlarge the bright mark, reduce perceived dark padding, and update the favicon cache-buster to `1.3.7`.
- Reason: In Eagle's dark plugin menus the previous dark-background logo blended into the UI, making only the smaller line mark visible compared with neighboring app icons.
- Alternatives considered: Generate a completely new logo; skipped because the current concept is already recognizable. Only resize the PNG canvas; skipped because the canvas was already `128×128` and the issue was visible mark size.
- Consequences / follow-up: Reinstall `1.3.7` and compare icon size in the plugin list and pinned bar. If icon cache persists, re-pin or restart Eagle.
- Superseded by: 2026-06-03 - Flat blue logo after visual rejection.

## 2026-06-02 - Page favicon for pinned window icon
- Status: active
- Decision: Add explicit `rel="icon"` and `rel="shortcut icon"` links to `index.html`, pointing at `logo.png?v=1.3.6`, while keeping `manifest.logo` as `/logo.png`.
- Reason: Eagle's plugin list already reads the new manifest logo, but the pinned/collector window path can fall back to the page favicon or cached default icon if the page does not declare one.
- Alternatives considered: Change `manifest.logo` again; skipped because installed/source/package logo hashes already matched the new icon. Clear Eagle or Windows icon caches first; skipped as a later smoke-test step because the plugin should declare the page icon regardless.
- Consequences / follow-up: Reinstall `1.3.6` and verify in Eagle. If the pinned icon is still old, the remaining likely cause is Eagle/Windows cache, not the package.

## 2026-06-02 - Collector compact spacing and close behavior
- Status: active
- Decision: Keep collector width at `646px`, reduce height to `104px`, use `7px 18px` collector padding, slightly reduce collector action/icon/close sizes, and on collector close write a pending restore flag instead of visibly restoring workbench bounds before `close()`.
- Reason: Eagle smoke showed the collector window looked too tight horizontally and slightly too tall. The previous close path restored `1180×760` before closing to prevent persisted small bounds, which caused a visible full-window flash.
- Alternatives considered: Increase collector width; skipped because the user asked for a compact collector. Keep restoring before close and hide only CSS content; skipped because the native window bounds change could still flash. Never restore after collector close; skipped because it could regress the earlier tiny-window reopen bug.
- Consequences / follow-up: Eagle smoke must verify collector close no longer flashes, and the next plugin open or explicit expand still restores full workbench bounds.

## 2026-06-02 - Workbench restore and styled tag suggestions
- Status: active
- Decision: Keep the collector minimum window size at `646×104`, restore the full `1180×760` workbench bounds on plugin init when current bounds look collector-sized or a pending restore flag exists, and replace the manual result tag editor's native `datalist` with a fixed-position styled menu constrained to the input and viewport.
- Reason: Eagle can persist the last plugin window size, so closing from collector mode can make the next full workbench open like a tiny collector bar. Native datalist popups cannot be styled consistently and appeared offset/oversized in Eagle.
- Alternatives considered: Raise `minWidth/minHeight` back to full workbench size; skipped because it would make the real collector bar impossible. Keep `datalist` and only adjust CSS; skipped because browser-native datalist popups ignore most CSS and positioning control.
- Consequences / follow-up: Eagle smoke must verify default reopen size after closing collector mode, and manual tag menu placement inside the real plugin window.

## 2026-06-02 - Scaled collector window and logo
- Status: superseded
- Decision: Use a `646×112` top floating collector window with `74×61` icon actions, clamp the collector bounds inside the available screen with an 8px margin, and replace `logo.png` with the generated minimal tag-plus-sparkle mark.
- Reason: Eagle smoke showed the collector entry needed stronger hierarchy while the collector window itself was too large. The logo also needed a simple silhouette that stays legible at plugin-list icon sizes.
- Alternatives considered: Keep the `760×132` collector window; skipped because it took too much space. Keep the old 128px logo; skipped because it was less aligned with the AI tagging concept.
- Consequences / follow-up: Eagle smoke must verify the smaller window still has readable controls, remains visible on different screen setups, and the new logo looks clear in the plugin list.
- Superseded by: 2026-06-02 - Collector compact spacing and close behavior.

## 2026-06-02 - Prominent collector action bar
- Status: superseded
- Decision: Use a `760×132` top floating collector window with large themed icon actions for collecting, starting analysis, clearing the queue, and returning to the workbench; entering collector mode silently appends the current Eagle selection.
- Reason: The smaller strip was easy to miss while browsing Eagle and still required extra clicks to add the current selection or clear the queue.
- Alternatives considered: Keep the `680×96` compact strip and only change text; skipped because it did not solve visibility or the missing queue-management action.
- Consequences / follow-up: Eagle smoke must verify the larger minimum still feels lightweight, stays top/always-on-top in collector mode, and restores full workbench bounds after returning.
- Superseded by: 2026-06-02 - Scaled collector window and logo.

## 2026-06-02 - Real collector bar window
- Status: active
- Decision: Lower manifest minimum window size enough for collector mode, then use Eagle window APIs to set a small top-center always-on-top floating window and restore previous bounds/top state on expand.
- Reason: Keeping `minWidth: 980` and `minHeight: 640` made collector mode appear as a small strip inside a large black window, which felt fake and was not visible enough while browsing Eagle.
- Alternatives considered: Keep the large window and only restyle the strip; skipped because it would still block Eagle content and fail the purpose of a collector bar.
- Consequences / follow-up: Eagle smoke must verify full workbench still opens at the configured default size and collector mode restores correctly after collapse/expand.

## 2026-06-02 - Collection workflow instead of host injection
- Status: active
- Decision: Do not patch or inject Eagle's host context menu. Use Eagle's plugin entry to open/show the plugin, then append current Eagle selection via plugin events; provide plugin-internal context menus through `eagle.contextMenu.open()` and a fallback menu.
- Reason: Official APIs support plugin-local context menus and selected item reads, while host menu injection would be fragile across Eagle updates and could destabilize the main app.
- Alternatives considered: Always-on-top full workbench and host DOM/menu patching; skipped because both increase visual friction or upgrade risk.
- Consequences / follow-up: Eagle smoke must verify that right-click plugin entry still preserves current selection when the plugin is opened or shown.

## 2026-06-02 - Closed dialog hit testing
- Status: active
- Decision: Any closed fixed-position local dialog must be removed from hit testing with `hidden` plus CSS `display: none`, and open/close functions must toggle that state alongside visual classes.
- Reason: The selected-material full-list dialog used opacity/transform without `hidden`, so it stayed above the workbench and made many underlying buttons unclickable.
- Alternatives considered: Rely on `aria-hidden` or opacity only; skipped because those affect accessibility/visual state but do not remove the element from pointer hit testing.
- Consequences / follow-up: Install package `1.2.2` in Eagle and verify buttons are clickable before and after opening/closing “完整列表”.

## 2026-06-02 - Compact toolbar and material list
- Status: active
- Decision: Keep topbar actions to settings, analysis controls, write, and close; move import/refresh/full-list into the material panel; move undo/clear/retry into result controls; show analysis progress in the result panel.
- Reason: Eagle smoke showed topbar wrapping and creating visible page scrollbars. Material actions and long material lists are local to selected assets, while analysis progress needs to stay visible near results.
- Alternatives considered: Keep import/refresh in topbar and only shrink button text; skipped because the minimum `980px` window still leaves too many same-level controls in the drag bar.
- Consequences / follow-up: Install package `1.2.1` in Eagle and verify no whole-page scrollbar appears at the plugin minimum size.

## 2026-06-02 - Productivity workbench branch
- Status: active
- Decision: Start `codex/productivity-workbench` from `codex/merge-author-0601-features` and implement health checks, presets, failed-result retry, and manual result editing with test-first slices.
- Reason: The requested enhancements touch CLI planning, settings UI, result state, and packaging, so an isolated branch and staged verification reduce regressions in the already-tested `1.1.4` workbench.
- Alternatives considered: Continue directly on `codex/merge-author-0601-features`; skipped because the work changes multiple user-facing workflows and should be easy to merge or abandon independently.
- Consequences / follow-up: Keep `VFX_AI_TAGGER_CLI`, single-screen layout, Claude/Codex/Eagle AI support, and existing storage compatibility; do not include unrelated `docs/vfx-tag-taxonomy-review.md`.

## 2026-06-02 - 0601 reliability feature merge branch
- Status: active
- Decision: Use branch `codex/merge-author-0601-features` for the 0601 selective merge, keep `VFX_AI_TAGGER_CLI`, and package the merged artifact as `1.1.4`.
- Reason: The merge changes user-facing analysis behavior and packaging, so it should be isolated from `master` until Eagle smoke confirms it.
- Alternatives considered: Continue directly on `master`; skipped because the work includes multiple behavior ports and a tracked release artifact.
- Consequences / follow-up: Do not push unless explicitly requested; install the local package in Eagle and smoke-test before merging back.

## 2026-06-02 - Author 0601 selective merge
- Status: active
- Decision: Do not merge `C:\Users\mumengfei\Downloads\AI 标签工具0601.eagleplugin` wholesale; evaluate and port compatible behavior such as title-in-prompt toggle, AI retry controls, request chunking, write progress, and result cache into the current CLI workbench.
- Reason: The 0601 package still uses the author plugin ID, has release/package hygiene issues, lacks Claude/Codex CLI backend support, and uses a page layout that conflicts with the current single-screen drawer workbench.
- Alternatives considered: Replace the current `plugin.js`, `index.html`, and `style.css` with 0601 versions; skipped because that would regress the local CLI/OAuth direction and likely reintroduce whole-page UI tradeoffs.
- Consequences / follow-up: Any merge should be staged behind focused tests and must preserve `VFX_AI_TAGGER_CLI`, CLI backend settings, no whole-page scrolling, and existing storage compatibility where possible.

## 2026-05-26 - Hardened CLI release package
- Status: active
- Decision: Bump the local CLI plugin package to version `1.1.0`, disable release `main.devTools`, document the new-ID settings migration, and keep `previewBeforeWrite` as a guard that prevents automatic high-confidence writes.
- Reason: Post-review findings showed release metadata, migration expectations, and the preview/manual-write setting were misleading or unsafe for normal use.
- Alternatives considered: Keep `devTools` enabled for easier debugging and leave preview as a stored-only setting; skipped because this package is intended for user smoke testing and the UI label promises manual confirmation.
- Consequences / follow-up: Use Eagle host smoke for final validation; if a debug build is needed later, create a separate dev package instead of changing the release manifest.

## 2026-05-26 - Local CLI plugin identity and UI merge
- Status: active
- Decision: Use `VFX_AI_TAGGER_CLI` as the local plugin ID, remove author/QQ credit text from the title area, and port only selected author UI ideas into the existing single-screen workbench.
- Reason: The author plugin has a different ID and Eagle-AI-only flow; the local plugin needs to coexist, preserve Claude/Codex support, and keep regional scrolling.
- Alternatives considered: Use the author ID or wholesale replace the local UI; skipped because that would collide with the author package and regress local CLI support.
- Consequences / follow-up: Existing localStorage origin changes with the plugin ID, so users may need to re-enter plugin settings after installing this package.

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
