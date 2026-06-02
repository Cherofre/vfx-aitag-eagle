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
  const html = read("index.html");
  const js = read("plugin.js");
  const css = read("style.css");

  assert.equal(manifest.id, "VFX_AI_TAGGER_CLI");
  assert.notEqual(manifest.id, "81ae8109-ee4d-42e3-ab69-9bb73765d866");
  assert.equal(manifest.main.frame, false);
  assert.equal(manifest.main.resizable, true);
  assert.equal(manifest.main.minWidth, 980);
  assert.equal(manifest.main.minHeight, 640);

  assert.match(html, /id="closeWindowBtn"[^>]*class="window-close-btn"/);
  assert.match(html, /id="closeWindowBtn"[^>]*aria-label="关闭窗口"/);
  assert.match(js, /"closeWindowBtn"/);
  assert.match(js, /closeWindowBtn\.addEventListener\("click", closePluginWindow\)/);
  assert.match(js, /function closePluginWindow\(/);
  assert.match(css, /\.topbar\s*{[\s\S]*-webkit-app-region:\s*drag/);
  assert.match(css, /button,\s*input,\s*select,\s*textarea[\s\S]*-webkit-app-region:\s*no-drag/);
  assert.match(css, /\.top-actions\s*{[\s\S]*-webkit-app-region:\s*no-drag/);
  assert.match(css, /\.window-close-btn\s*{[\s\S]*-webkit-app-region:\s*no-drag/);
  assert.match(css, /\.workbench-shell\s*{[\s\S]*border-radius:\s*18px/);
});

test("workbench css uses viewport locking and region scrolling", () => {
  const css = read("style.css");

  assert.match(css, /html,\s*body\s*{[\s\S]*height:\s*100%[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.app\s*{[\s\S]*height:\s*100vh[\s\S]*padding:\s*10px/);
  assert.match(css, /\.workbench-shell\s*{[\s\S]*height:\s*100%[\s\S]*overflow:\s*hidden/);
  assert.doesNotMatch(css, /\.workbench-shell\s*{[\s\S]*height:\s*100vh/);
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

test("result cards expose diagnostics and actionable failure details", () => {
  const html = read("index.html");
  const js = read("plugin.js");
  const css = read("style.css");

  assert.match(html, /id="diagnosticEnabled"/);
  assert.match(html, /id="diagnosticDir"/);
  assert.match(html, /id="chooseDiagnosticDirBtn"/);

  assert.match(js, /function renderDiagnostics\(/);
  assert.match(js, /function createDiagnosticPreviewUrl\(/);
  assert.match(js, /function classifyError\(/);
  assert.match(js, /failureTypeLabel/);
  assert.match(js, /diagnosticPath/);
  assert.match(js, /diagnostics/);
  assert.match(js, /previewUrl:\s*createDiagnosticPreviewUrl/);
  assert.match(js, /image\.previewUrl \|\| image\.url/);
  assert.match(js, /<details class="diagnostics"/);
  assert.match(js, /class="failure-type"/);
  assert.match(js, /class="result-summary"/);

  assert.match(css, /\.result-summary/);
  assert.match(css, /\.diagnostics/);
  assert.match(css, /\.diagnostic-grid/);
  assert.match(css, /\.failure-type/);
});

test("analysis controls expose continue and restart after pause", () => {
  const html = read("index.html");
  const js = read("plugin.js");

  assert.match(html, /id="continueBtn"[^>]*>继续<\/button>/);
  assert.match(html, /id="restartBtn"[^>]*>重新开始<\/button>/);
  assert.match(js, /"continueBtn"/);
  assert.match(js, /"restartBtn"/);
  assert.match(js, /function continueAnalysis\(/);
  assert.match(js, /function restartAnalysis\(/);
  assert.match(js, /function updateAnalysisControls\(/);
  assert.match(js, /state\.paused/);
});

test("failure-prone Eagle state transitions recover safely", () => {
  const js = read("plugin.js");

  assert.match(js, /catch \(error\) \{\s*state\.selectedItems = \[\];\s*state\.results = \[\];[\s\S]*读取选中素材失败/);
  assert.match(js, /async function applyReadyResults\(\) \{[\s\S]*try \{[\s\S]*await mergeTagsIntoItem[\s\S]*\} catch \(error\) \{[\s\S]*写入失败[\s\S]*\}[\s\S]*finally \{[\s\S]*renderAll\(\)/);
  assert.match(js, /async function reanalyzeResult\(resultId\) \{[\s\S]*diagnosticPath:\s*""[\s\S]*diagnostics:\s*null[\s\S]*errorType:\s*""/);
  assert.match(js, /catch \(error\) \{[\s\S]*errorType:\s*classifyError\(error\)[\s\S]*diagnosticPath:\s*error\.diagnosticPath \|\| ""[\s\S]*diagnostics:\s*error\.diagnostics \|\| null/);
  assert.match(js, /const record = state\.undoStack\[state\.undoStack\.length - 1\]/);
  assert.match(js, /await item\.save\(\);[\s\S]*state\.undoStack\.pop\(\)/);
});

test("settings, release metadata, and long text are production-ready", () => {
  const manifest = JSON.parse(read("manifest.json"));
  const readme = read("README.md");
  const js = read("plugin.js");
  const css = read("style.css");

  assert.notEqual(manifest.version, "1.0.0");
  assert.equal(manifest.main.devTools, false);
  assert.match(readme, /dist\\特效AI标签管理-cli\.eagleplugin/);
  assert.match(readme, /VFX_AI_TAGGER_CLI/);
  assert.match(readme, /旧插件设置不会自动迁移/);
  assert.match(js, /function coerceStoredBoolean\(/);
  assert.match(js, /coerceStoredBoolean\(settings\[key\], els\[key\]\.checked\)/);
  assert.match(css, /\.settings-drawer-head\s*{[\s\S]*-webkit-app-region:\s*drag/);
  assert.match(css, /\.result-message,\s*\.diagnostic-saved,\s*\.result-reason,\s*\.review-tag span\s*{[\s\S]*overflow-wrap:\s*anywhere/);
});

test("0601 reliability features are selectively exposed in the CLI workbench", () => {
  const html = read("index.html");
  const js = read("plugin.js");
  const css = read("style.css");

  assert.match(html, /id="aiRetryCount"/);
  assert.match(html, /id="requestChunkK"/);
  assert.match(html, /id="includeTitleInPrompt"/);
  assert.match(html, /id="writeProgressPanel"/);
  assert.match(html, /id="writeProgressBar"/);
  assert.match(html, /<script src="cli-backends\.js"><\/script>/);

  assert.match(js, /results:\s*"vfxAiTagger\.results"/);
  assert.match(js, /"aiRetryCount"/);
  assert.match(js, /"requestChunkK"/);
  assert.match(js, /"includeTitleInPrompt"/);
  assert.match(js, /function requestAiTagsWithRetry\(/);
  assert.match(js, /function buildAiRequestPlan\(/);
  assert.match(js, /function mergeAiObjects\(/);
  assert.match(js, /function ensureDiagnosticSettings\(/);
  assert.match(js, /function updateWriteProgress\(/);
  assert.match(js, /function saveResultsState\(/);
  assert.match(js, /function readStoredResults\(/);
  assert.match(js, /saveResultsState\(\)/);
  assert.match(js, /includeTitleInPrompt:\s*els\.includeTitleInPrompt\.checked/);
  assert.match(js, /requestChunkK:\s*els\.requestChunkK\.value/);

  assert.match(css, /\.write-progress\s*{/);
  assert.match(css, /\.write-progress-bar\s*{/);
  assert.match(css, /\.write-progress\.has-failures\s+\.write-progress-bar/);
});

test("productivity workbench exposes health checks, presets, retry filters, and result editing", () => {
  const html = read("index.html");
  const js = read("plugin.js");
  const css = read("style.css");
  const manifest = JSON.parse(read("manifest.json"));

  assert.equal(manifest.id, "VFX_AI_TAGGER_CLI");

  assert.match(html, /id="healthCheckPanel"/);
  assert.match(html, /id="runHealthCheckBtn"[^>]*>环境检查<\/button>/);
  assert.match(html, /id="healthStatusList"/);
  assert.match(html, /id="analysisPresetSelect"/);
  ["快速粗标", "精细分析", "长视频省钱", "只用 Claude", "只用 Codex", "Eagle AI 兜底"].forEach((label) => {
    assert.match(html, new RegExp(label));
  });
  assert.match(html, /class="result-filters"/);
  assert.match(html, /data-result-filter="failed"/);
  assert.match(html, /id="retryFailedBtn"[^>]*>重试失败项<\/button>/);

  assert.match(js, /healthStatus:\s*\[\]/);
  assert.match(js, /activeResultFilter:\s*"all"/);
  assert.match(js, /activePresetName:\s*""/);
  assert.match(js, /function runHealthCheck\(/);
  assert.match(js, /function ensureHealthyBeforeAnalysis\(/);
  assert.match(js, /function applyAnalysisPreset\(/);
  assert.match(js, /function retryFailedResults\(/);
  assert.match(js, /function getFilteredResults\(/);
  assert.match(js, /function removeReviewTag\(/);
  assert.match(js, /function addManualTagToResult\(/);
  assert.match(js, /source:\s*"manual"/);
  assert.match(js, /activePresetName:\s*state\.activePresetName/);
  assert.match(js, /analysisPresetName:\s*state\.activePresetName/);
  assert.match(js, /runHealthCheckBtn\.addEventListener\("click", \(\) => runHealthCheck\(/);
  assert.match(js, /retryFailedBtn\.addEventListener\("click", retryFailedResults\)/);
  assert.match(js, /data-remove-review-tag/);
  assert.match(js, /data-add-manual-tag/);
  assert.match(js, /data-manual-tag-input/);

  assert.match(css, /\.health-check-panel/);
  assert.match(css, /\.preset-panel/);
  assert.match(css, /\.result-filters/);
  assert.match(css, /\.result-editor/);
  assert.match(css, /\.review-tag\.manual/);
});

test("compact workbench keeps material actions local and exposes analysis progress", () => {
  const html = read("index.html");
  const js = read("plugin.js");
  const css = read("style.css");

  const topActions = html.match(/<div class="top-actions">([\s\S]*?)<\/div>/)?.[1] || "";
  assert.match(topActions, /id="openAiBtn"/);
  assert.match(topActions, /id="analyzeBtn"/);
  assert.match(topActions, /id="applyBtn"/);
  assert.match(topActions, /id="closeWindowBtn"/);
  assert.doesNotMatch(topActions, /id="importBtn"|id="refreshBtn"|id="undoBtn"/);

  const selectedPanel = html.slice(html.indexOf('class="panel selected-panel"'), html.indexOf('class="panel results-panel"'));
  assert.match(selectedPanel, /id="appendSelectedBtn"/);
  assert.match(selectedPanel, /id="replaceSelectedBtn"/);
  assert.match(selectedPanel, /id="clearSelectedBtn"/);
  assert.match(selectedPanel, /id="showSelectedListBtn"/);
  assert.match(selectedPanel, /id="miniCollectorBtn"/);
  assert.match(selectedPanel, /id="selectedSummary"/);
  assert.match(selectedPanel, /id="selectedItems"/);

  assert.match(html, /id="selectedListOverlay"/);
  assert.match(html, /id="selectedListDialog"/);
  assert.match(html, /id="selectedItemsFullList"/);
  assert.match(html, /id="closeSelectedListBtn"/);
  assert.match(html, /id="analysisProgressPanel"/);
  assert.match(html, /id="analysisProgressText"/);
  assert.match(html, /id="analysisProgressBar"/);
  assert.match(html, /id="analysisProgressMeta"/);

  assert.match(js, /"showSelectedListBtn"/);
  assert.match(js, /function openSelectedListDialog\(/);
  assert.match(js, /function closeSelectedListDialog\(/);
  assert.match(js, /function renderSelectedSummary\(/);
  assert.match(js, /function renderSelectedFullList\(/);
  assert.match(js, /function updateAnalysisProgress\(/);
  assert.match(js, /function resetAnalysisProgress\(/);
  assert.match(js, /updateAnalysisProgress\(processed,\s*itemsToAnalyze\.length/);

  assert.match(css, /\.top-actions\s*{[\s\S]*flex-wrap:\s*nowrap[\s\S]*overflow:\s*hidden/);
  assert.doesNotMatch(css, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.topbar\s*{[\s\S]*?flex-direction:\s*column/);
  assert.match(css, /\.material-actions/);
  assert.match(css, /\.selected-list-dialog/);
  assert.match(css, /\.selected-full-list\s*{[\s\S]*overflow:\s*auto/);
  assert.match(css, /\.analysis-progress\s*{/);
  assert.match(css, /\.analysis-progress-bar\s*{/);
});

test("closed selected material dialog is removed from hit testing", () => {
  const html = read("index.html");
  const js = read("plugin.js");
  const css = read("style.css");

  const dialogTag = html.match(/<section id="selectedListDialog"[^>]*>/)?.[0] || "";
  assert.match(dialogTag, /\shidden(?:\s|>)/);
  assert.match(css, /\.selected-list-dialog\[hidden\]\s*{[\s\S]*display:\s*none/);
  assert.match(js, /els\.selectedListDialog\.hidden\s*=\s*false/);
  assert.match(js, /els\.selectedListDialog\.hidden\s*=\s*true/);
});

test("collection workflow exposes append, replace, clear, context menus, and collector bar", () => {
  const html = read("index.html");
  const js = read("plugin.js");
  const css = read("style.css");

  assert.match(html, /id="appendSelectedBtn"[^>]*>追加当前选中<\/button>/);
  assert.match(html, /id="replaceSelectedBtn"[^>]*>替换为当前选中<\/button>/);
  assert.match(html, /id="clearSelectedBtn"[^>]*>清空<\/button>/);
  assert.match(html, /id="miniCollectorBtn"[^>]*>采集条<\/button>/);
  assert.match(html, /id="collectorBar"/);
  assert.match(html, /id="collectorAppendBtn"/);
  assert.match(html, /id="collectorAnalyzeBtn"/);
  assert.match(html, /id="collectorExpandBtn"/);
  assert.match(html, /id="collectorCloseBtn"/);

  assert.match(js, /"appendSelectedBtn"/);
  assert.match(js, /"replaceSelectedBtn"/);
  assert.match(js, /"clearSelectedBtn"/);
  assert.match(js, /"miniCollectorBtn"/);
  assert.match(js, /function fetchEagleSelectedItems\(/);
  assert.match(js, /function mergeSelectedItems\(/);
  assert.match(js, /function appendSelectedItems\(/);
  assert.match(js, /function replaceSelectedItems\(/);
  assert.match(js, /function clearSelectedQueue\(/);
  assert.match(js, /function bindPluginRunCollection\(/);
  assert.match(js, /function openWorkbenchContextMenu\(/);
  assert.match(js, /function enterCollectorMode\(/);
  assert.match(js, /function exitCollectorMode\(/);
  assert.match(js, /eagle\.contextMenu\.open/);
  assert.match(js, /data-item-id/);
  assert.match(js, /collector-mode/);

  assert.match(css, /\.collector-bar\s*{/);
  assert.match(css, /body\.collector-mode\s+\.workbench-shell/);
  assert.match(css, /body\.collector-mode\s+\.collector-bar/);
});
