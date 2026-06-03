# Selected Material Tray Design

## Goal
Make the selected-material area read as a compact analysis queue, not a full vertical list.

## Design
The main selected-material panel shows a fixed three-card tray. Each card uses a thumbnail when Eagle provides one, otherwise a file-type placeholder. Cards show the filename, file type, existing-tag count, and a preview action.

When more than three materials are queued, the tray reserves the last visible slot for an expand card labelled `展开全部 +N`. The header action keeps the same `showSelectedListBtn` ID but changes copy to `展开素材`, so the control clearly belongs to the queue expansion flow.

The full selected-material dialog remains the place for all queued assets. Its title changes to `全部待分析素材`, and its hint explains that users can view, preview, or remove all queued materials there. The dialog keeps local scrolling and does not affect the single-screen body no-scroll contract.

## Constraints
- Preserve plugin ID `VFX_AI_TAGGER_CLI`.
- Do not change analysis, write, CLI, or Eagle AI behavior.
- Keep body/page scrolling disabled; only local tray/dialog/result regions can scroll when needed.
- Preserve existing DOM IDs so existing event wiring stays compatible.

## Verification
- UI contract tests assert the three-card tray limit, expand card, renamed copy, thumbnail class names, and local full-dialog scrolling.
- Syntax checks cover `plugin.js` and `cli-backends.js`.
- Package inspection confirms the regenerated `.eagleplugin` still includes only core plugin files and manifest version `1.0.2`.
