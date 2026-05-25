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

  const selectedIndex = html.indexOf('class="panel selected-panel"');
  const resultsIndex = html.indexOf('class="panel results-panel"');
  const drawerIndex = html.indexOf('class="panel settings-drawer"');

  assert.ok(selectedIndex > -1, "selected panel should exist");
  assert.ok(resultsIndex > selectedIndex, "results should follow selected items in the main column");
  assert.ok(drawerIndex > resultsIndex, "settings drawer markup should be outside the main work area");
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
