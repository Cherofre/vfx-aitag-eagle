# Collector Position Memory Design

## Summary
Keep the existing collector bar shape, but let the user place it where it makes sense for non-fullscreen Eagle. The collector window remembers its last collector-mode position, restores it when entering `置顶采集`, and clamps it back into the visible screen if displays or resolutions change.

## Behavior
- Entering collector mode first tries the saved collector bounds from `localStorage`.
- If no saved bounds exist, the collector keeps the existing top-centered default.
- Saved bounds only apply to collector mode, never to the full workbench restore.
- Before leaving, closing, or starting analysis from collector mode, the plugin records the current collector window bounds.
- If a saved position is off-screen or larger than the available display, it is clamped with the existing `COLLECTOR_SCREEN_MARGIN`.
- The collector remains draggable through the existing frameless window drag region.

## Scope
- Modify `plugin.js`, `tests/ui-workbench.test.js`, `manifest.json`, `index.html`, `README.md`, package output, and project ledger files.
- Do not add a second minimized/capsule mode.
- Do not rely on Eagle exposing the main app window position; this feature works with plugin window bounds and screen information only.

## Verification
- Static UI tests must prove the storage key exists, saved collector bounds are read, clamped, used before default top-center bounds, and saved on collector exit/close/analyze paths.
- Syntax checks for `plugin.js` and `cli-backends.js` must pass.
- Package inspection must show version `1.0.4`, plugin ID `VFX_AI_TAGGER_CLI`, `main.devTools=false`, and no collector-entry auto-import string.
