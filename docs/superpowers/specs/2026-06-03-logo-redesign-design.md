# Logo Redesign Design

## Summary
Replace the current dark neon tag icon with a simpler flat app icon that stays readable in Eagle's dark plugin list and pinned collector window.

## Direction
- Use a bright blue rounded-square background so the icon does not disappear into Eagle's dark UI.
- Use one central white tag glyph with a small AI sparkle accent.
- Avoid diagonal composition, neon double strokes, heavy dark padding, and decorative line complexity.
- Keep `logo.png` at `128x128`, keep manifest logo path `/logo.png`, and update favicon cache-busting with the package version.

## Acceptance
- The icon reads clearly at small plugin-list sizes.
- The logo background is visibly blue rather than near-black.
- The bright glyph occupies enough of the canvas to avoid the previous "smaller than other icons" issue.
- Package version bumps to `1.3.8` and `dist\特效AI标签管理-cli.eagleplugin` includes the updated files.

## Verification
- Add a failing UI asset test for the blue app-icon background and bright simple foreground.
- Run `node --test tests/cli-backends.test.js tests/ui-workbench.test.js`.
- Run `node --check plugin.js` and `node --check cli-backends.js`.
- Inspect the packaged `.eagleplugin` manifest and contents.
