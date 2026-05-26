const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("workbench shell keeps settings in a drawer and results in the primary column", () => {
  const html = read("index.html");

  assert.match(html, /<main class="app workbench-shell">/);
  assert.match(html, /id="openAiBtn"[^>]*>设置<\/button>/);
  assert.match(html, /class="toolbar-stats"/);
  assert.match(html, /class="panel settings-drawer"/);
  assert.match(html, /id="eagleAiSettingsBtn"/);
  assert.doesNotMatch(html, /InsanelyGreat|QQ群|plugin-credit/);

  const selectedIndex = html.indexOf('class="panel selected-panel"');
  const resultsIndex = html.indexOf('class="panel results-panel"');
  const drawerIndex = html.indexOf('class="panel settings-drawer"');

  assert.ok(selectedIndex > -1, "selected panel should exist");
  assert.ok(resultsIndex > selectedIndex, "results should follow selected items in the main column");
  assert.ok(drawerIndex > resultsIndex, "settings drawer markup should be outside the main work area");
});

test("plugin identity and chrome are local, frameless, and draggable", () => {
  const manifest = JSON.parse(read("manifest.json"));
  const css = read("style.css");

  assert.equal(manifest.id, "VFX_AI_TAGGER_CLI");
  assert.notEqual(manifest.id, "81ae8109-ee4d-42e3-ab69-9bb73765d866");
  assert.equal(manifest.main.frame, false);
  assert.equal(manifest.main.resizable, true);
  assert.equal(manifest.main.minWidth, 980);
  assert.equal(manifest.main.minHeight, 640);

  assert.match(css, /\.topbar\s*{[\s\S]*-webkit-app-region:\s*drag/);
  assert.match(css, /button,\s*input,\s*select,\s*textarea[\s\S]*-webkit-app-region:\s*no-drag/);
  assert.match(css, /\.top-actions\s*{[\s\S]*-webkit-app-region:\s*no-drag/);
  assert.match(css, /\.workbench-shell\s*{[\s\S]*border-radius:\s*18px/);
});

test("workbench css uses viewport locking and region scrolling", () => {
  const css = read("style.css");

  assert.match(css, /html,\s*body\s*{[\s\S]*height:\s*100%[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.workbench-shell\s*{[\s\S]*height:\s*100vh[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.layout\s*{[\s\S]*min-height:\s*0/);
  assert.match(css, /\.tag-panel\s*{[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.results-panel\s*{[\s\S]*min-height:\s*0/);
  assert.match(css, /\.results\s*{[\s\S]*overflow:\s*auto/);
  assert.match(css, /\.settings-overlay\.is-open/);
  assert.match(css, /\.settings-drawer\.is-open/);
});

test("settings drawer behavior is wired in plugin script", () => {
  const js = read("plugin.js");

  assert.match(js, /"settingsOverlay"/);
  assert.match(js, /"closeSettingsBtn"/);
  assert.match(js, /"eagleAiSettingsBtn"/);
  assert.match(js, /function openSettingsDrawer\(/);
  assert.match(js, /function closeSettingsDrawer\(/);
  assert.match(js, /eagleAiSettingsBtn\.addEventListener\("click", openAiSettings\)/);
  assert.match(js, /event\.key === "Escape"/);
});

test("settings drawer groups controls into tabs without changing field ids", () => {
  const html = read("index.html");
  const js = read("plugin.js");

  assert.match(html, /class="settings-tabs"/);
  assert.match(html, /data-settings-tab="backend"[\s\S]*AI 后端/);
  assert.match(html, /data-settings-tab="analysis"[\s\S]*分析参数/);
  assert.match(html, /data-settings-tab="frames"[\s\S]*抽帧/);
  assert.match(html, /data-settings-tab="write"[\s\S]*写入与诊断/);
  assert.match(html, /data-settings-panel="backend"/);
  assert.match(html, /data-settings-panel="analysis"/);
  assert.match(html, /data-settings-panel="frames"/);
  assert.match(html, /data-settings-panel="write"/);

  [
    "enableClaudeCli", "enableCodexCli", "enableEagleAi", "maxTags", "concurrency",
    "autoConfidence", "hideConfidence", "frameRateValue", "frameRateUnit",
    "maxVideoFrames", "maxAnimatedFrames", "skipStart", "skipEnd",
    "skipTagged", "previewBeforeWrite", "autoApplyHighConfidence",
    "writeAnnotation", "globalPrompt"
  ].forEach((id) => assert.match(html, new RegExp(`id="${id}"`), `${id} should stay in markup`));

  assert.match(js, /settingsTabs/);
  assert.match(js, /function activateSettingsTab\(/);
  assert.match(js, /settingsPanel/);
});
