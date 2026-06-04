const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const zlib = require("node:zlib");

const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function readPngRgba(file) {
  const buffer = fs.readFileSync(path.join(root, file));
  assert.equal(buffer.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  assert.equal(bitDepth, 8);
  assert.equal(colorType, 6);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const pixels = Buffer.alloc(stride * height);
  let rawOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[rawOffset++];
    const row = raw.subarray(rawOffset, rawOffset + stride);
    const outOffset = y * stride;
    rawOffset += stride;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= 4 ? pixels[outOffset + x - 4] : 0;
      const up = y > 0 ? pixels[outOffset - stride + x] : 0;
      const upLeft = y > 0 && x >= 4 ? pixels[outOffset - stride + x - 4] : 0;
      const paeth = paethPredictor(left, up, upLeft);
      const value = row[x];
      pixels[outOffset + x] = (value + [0, left, up, Math.floor((left + up) / 2), paeth][filter]) & 0xff;
    }
  }
  return { width, height, pixels };
}

function paethPredictor(left, up, upLeft) {
  const p = left + up - upLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - up);
  const pc = Math.abs(p - upLeft);
  if (pa <= pb && pa <= pc) return left;
  if (pb <= pc) return up;
  return upLeft;
}

function brightContentBounds(image) {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const offset = (y * image.width + x) * 4;
      const r = image.pixels[offset];
      const g = image.pixels[offset + 1];
      const b = image.pixels[offset + 2];
      const a = image.pixels[offset + 3];
      if (a > 20 && Math.max(r, g, b) > 80 && (Math.max(r, g, b) - Math.min(r, g, b) > 20 || Math.max(r, g, b) > 140)) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return { width: maxX - minX + 1, height: maxY - minY + 1 };
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
  assert.ok(manifest.main.width >= 1180);
  assert.ok(manifest.main.height >= 760);
  assert.ok(manifest.main.minWidth <= 780);
  assert.ok(manifest.main.minHeight <= 140);

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

test("page favicon uses the same logo as the plugin manifest", () => {
  const manifest = JSON.parse(read("manifest.json"));
  const html = read("index.html");

  assert.equal(manifest.logo, "/logo.png");
  assert.match(html, /<link rel="icon" type="image\/png" href="logo\.png\?v=1\.0\.5">/);
  assert.match(html, /<link rel="shortcut icon" type="image\/png" href="logo\.png\?v=1\.0\.5">/);
});

test("logo bright mark fills the plugin icon canvas", () => {
  const image = readPngRgba("logo.png");
  const bounds = brightContentBounds(image);

  assert.equal(image.width, 128);
  assert.equal(image.height, 128);
  assert.ok(bounds.width >= 92, `bright mark width should be at least 92px, got ${bounds.width}`);
  assert.ok(bounds.height >= 92, `bright mark height should be at least 92px, got ${bounds.height}`);
});

test("logo uses a bright blue app-icon background with a simple white mark", () => {
  const image = readPngRgba("logo.png");
  let blueBackgroundPixels = 0;
  let whiteMarkPixels = 0;

  for (let index = 0; index < image.pixels.length; index += 4) {
    const r = image.pixels[index];
    const g = image.pixels[index + 1];
    const b = image.pixels[index + 2];
    const a = image.pixels[index + 3];

    if (a > 230 && b > 140 && g > 95 && r < 100 && b - r > 80) {
      blueBackgroundPixels += 1;
    }
    if (a > 230 && r > 235 && g > 235 && b > 235) {
      whiteMarkPixels += 1;
    }
  }

  assert.ok(blueBackgroundPixels >= 9000, `blue background should cover most of the icon, got ${blueBackgroundPixels}px`);
  assert.ok(whiteMarkPixels >= 1500, `white mark should be readable at small sizes, got ${whiteMarkPixels}px`);
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

test("default VFX template includes requested tags and semantic prompt rules", () => {
  const js = read("plugin.js");
  const match = js.match(/const DEFAULT_VFX_TAGS = \[([\s\S]*?)\];/);
  assert.ok(match, "DEFAULT_VFX_TAGS should exist");
  const defaultTags = Array.from(match[1].matchAll(/"([^"]+)"/g), (item) => item[1]);

  [
    "预警", "环绕", "范围圈", "弹幕", "吐息", "瀑布", "螺旋", "碎片", "增益", "减益",
    "法阵", "刀光", "枪械", "地刺", "地裂", "治疗", "召唤", "附魔", "消失", "冲刺",
    "植物", "血", "破碎", "屏幕特效", "国风", "水墨风"
  ].forEach((tag) => assert.ok(defaultTags.includes(tag), `${tag} should be in DEFAULT_VFX_TAGS`));

  assert.equal(defaultTags.includes("魔法阵"), false);
  assert.match(js, /标签语义规则/);
  assert.match(js, /\["预警", "技能生效前的范围提示、红圈、地面警示/);
  assert.match(js, /\["吐息", "从口部或生物头部喷出的锥形火、毒、冰、雾/);
  assert.match(js, /\["水墨风", "整体水墨气质或国风水墨风格/);
  assert.match(js, /function buildTagSemanticGuidance\(/);
});

test("default template manager exposes local editable tags without mutating Eagle tags", () => {
  const html = read("index.html");
  const js = read("plugin.js");
  const css = read("style.css");

  assert.match(html, /id="manageDefaultTemplateBtn"/);
  assert.match(html, /id="defaultTemplateOverlay"/);
  assert.match(html, /id="defaultTemplateDialog"/);
  assert.match(html, /id="defaultTemplateSearch"/);
  assert.match(html, /id="defaultTemplateInput"/);
  assert.match(html, /id="addDefaultTemplateTagBtn"/);
  assert.match(html, /id="defaultTemplateList"/);
  assert.match(html, /id="resetDefaultTemplateBtn"/);
  assert.match(html, /id="importEditedDefaultTemplateBtn"/);
  assert.match(html, /id="closeDefaultTemplateBtn"/);

  assert.match(js, /defaultTemplateTags:\s*"vfxAiTagger\.defaultTemplateTags"/);
  assert.match(js, /defaultTemplateTags:\s*\[\]/);
  assert.match(js, /function loadDefaultTemplateTags\(/);
  assert.match(js, /function getDefaultTemplateTags\(/);
  assert.match(js, /function saveDefaultTemplateTags\(/);
  assert.match(js, /function openDefaultTemplateDialog\(/);
  assert.match(js, /function closeDefaultTemplateDialog\(/);
  assert.match(js, /function renderDefaultTemplateList\(/);
  assert.match(js, /function addDefaultTemplateTag\(/);
  assert.match(js, /function renameDefaultTemplateTag\(/);
  assert.match(js, /function removeDefaultTemplateTag\(/);
  assert.match(js, /function resetDefaultTemplateTags\(/);
  assert.match(js, /function importEditedDefaultTemplateTags\(/);
  assert.match(js, /state\.customAllowedTags\s*=\s*normalizeTagList\(\[\.\.\.state\.customAllowedTags,\s*\.\.\.getDefaultTemplateTags\(\)\]\)/);
  assert.doesNotMatch(js, /tag_create|tag_merge|tagGroup\.create/);

  assert.match(css, /\.default-template-overlay/);
  assert.match(css, /\.default-template-dialog\[hidden\]\s*{[\s\S]*display:\s*none/);
  assert.match(css, /\.default-template-list/);
});

test("default template acts as analysis fallback and marks gap tags with inline green plus", () => {
  const js = read("plugin.js");
  const css = read("style.css");

  assert.match(js, /function getAnalysisAllowedTags\(/);
  assert.match(js, /normalizeTagList\(\[\.\.\.baseAllowedTags,\s*\.\.\.getDefaultTemplateTags\(\)\]\)/);
  assert.match(js, /const baseAllowedTags = getAllowedTags\(\);\s*const allowedTags = getAnalysisAllowedTags\(baseAllowedTags\)/);
  assert.match(js, /function getReviewTagSource\(tagName,\s*baseAllowedSet\)/);
  assert.match(js, /source:\s*getReviewTagSource\(tag\.name,\s*baseAllowed\)/);
  assert.match(js, /autoTags = autoWriteEnabled \? highConfidenceTags\.filter\(\(tag\) => tag\.source !== "template"\) : \[\]/);
  assert.match(js, /tag\.source === "template" \|\| tag\.confidence < settings\.autoConfidence/);
  assert.match(js, /function renderReviewTagSourceBadge\(/);
  assert.match(js, /review-tag-source-add/);
  assert.match(js, /title="来自默认模板，当前标签池中不存在"/);
  assert.match(js, /aria-label="默认模板新增"/);
  assert.match(css, /\.review-tag\.template-gap/);
  assert.match(css, /\.review-tag-source-add\s*{[\s\S]*position:\s*relative[\s\S]*color:\s*#4ade80/);
  assert.match(css, /\.review-tag-source-add::before,\s*\.review-tag-source-add::after\s*{/);
  assert.match(css, /\.review-tag-source-add::after\s*{[\s\S]*rotate\(90deg\)/);
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

test("paused analysis includes newly appended materials in the next run", () => {
  const js = read("plugin.js");

  assert.match(js, /function syncPendingResultsForSelectedItems\(/);
  assert.match(js, /state\.results = \[\.\.\.state\.results, \.\.\.missingResults\]/);
  assert.match(js, /message:\s*options\.message \|\| "等待分析"/);
  assert.match(js, /!replacing && addedItems\.length && state\.results\.length/);
  assert.match(js, /syncPendingResultsForSelectedItems\(\{ message: "新增素材，等待分析" \}\)/);

  const analyzeStart = js.indexOf("async function analyzeSelected()");
  const existingResultsIndex = js.indexOf("const existingResults = new Map", analyzeStart);
  const syncIndex = js.indexOf("syncPendingResultsForSelectedItems", analyzeStart);
  assert.ok(syncIndex > analyzeStart, "analyzeSelected should sync missing queued items");
  assert.ok(syncIndex < existingResultsIndex, "missing selected items must become pending before pending filtering");
});

test("analysis pause aborts active CLI requests and undo history survives reopen", () => {
  const js = read("plugin.js");

  assert.match(js, /undoStack:\s*"vfxAiTagger\.undoStack"/);
  assert.match(js, /analysisAbortController:\s*null/);
  assert.match(js, /function createAnalysisAbortController\(/);
  assert.match(js, /function abortCurrentAnalysis\(/);
  assert.match(js, /function getAnalysisAbortSignal\(/);
  assert.match(js, /pauseAnalysis\(\)[\s\S]*abortCurrentAnalysis\(\)/);
  assert.match(js, /signal:\s*getAnalysisAbortSignal\(\)/);
  assert.match(js, /runCliBackends\(\{[\s\S]*signal/);
  assert.match(js, /function createAnalysisAbortError\(/);
  assert.match(js, /if \(isAnalysisAbortError\(error\)\) throw error/);
  assert.match(js, /if \(state\.pauseRequested\) throw createAnalysisAbortError\("分析已暂停"\)/);
  assert.match(js, /catch \(error\) \{[\s\S]*cliError = error;[\s\S]*if \(isAnalysisAbortError\(error\)\) throw error/);
  assert.match(js, /function saveUndoStack\(/);
  assert.match(js, /function readStoredUndoStack\(/);
  assert.match(js, /state\.undoStack\s*=\s*readStoredUndoStack\(\)/);
  assert.match(js, /state\.undoStack\.push\(\{[\s\S]*saveUndoStack\(\)/);
  assert.match(js, /state\.undoStack\.pop\(\);[\s\S]*saveUndoStack\(\)/);
});

test("failure-prone Eagle state transitions recover safely", () => {
  const js = read("plugin.js");

  assert.doesNotMatch(js, /async function replaceSelectedItems\([\s\S]*catch \(error\) \{\s*state\.selectedItems = \[\];\s*state\.results = \[\]/);
  assert.match(js, /async function replaceSelectedItems\([\s\S]*catch \(error\) \{[\s\S]*读取选中素材失败[\s\S]*待分析列表保持不变/);
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

  assert.equal(manifest.version, "1.0.5");
  assert.equal(manifest.main.devTools, false);
  assert.match(read("index.html"), /id="cliTimeoutSeconds" type="number" min="10" max="600" value="180"/);
  assert.match(readme, /dist\\特效AI标签管理-cli\.eagleplugin/);
  assert.match(readme, /VFX_AI_TAGGER_CLI/);
  assert.match(readme, /旧插件设置不会自动迁移/);
  assert.match(js, /function coerceStoredBoolean\(/);
  assert.match(js, /coerceStoredBoolean\(settings\[key\], els\[key\]\.checked\)/);
  assert.match(js, /cliTimeoutSeconds:\s*readInt\(els\.cliTimeoutSeconds\.value,\s*180,\s*10,\s*600\)/);
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
  assert.match(js, /runExecutableCliHealthChecks\(/);
  assert.match(js, /healthCheckTimeoutMs:\s*10000/);
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

test("selected material panel is a compact three-card tray with clear expansion", () => {
  const html = read("index.html");
  const js = read("plugin.js");
  const css = read("style.css");

  assert.match(html, /id="showSelectedListBtn"[^>]*>展开素材<\/button>/);
  assert.match(html, /id="selectedListTitle">全部待分析素材<\/h2>/);
  assert.doesNotMatch(html, /完整列表/);
  assert.match(js, /const SELECTED_TRAY_LIMIT = 3/);
  assert.match(js, /state\.selectedItems\.length > SELECTED_TRAY_LIMIT/);
  assert.match(js, /state\.selectedItems\.slice\(0,\s*SELECTED_TRAY_LIMIT - 1\)/);
  assert.match(js, /createSelectedItemCard\(item,\s*\{ compact:\s*true \}\)/);
  assert.match(js, /createSelectedExpandCard\(remainingCount\)/);
  assert.match(js, /className\s*=\s*"selected-expand-card"/);
  assert.match(js, /data-remove-selected-item/);
  assert.match(js, /removeSelectedItem\(removeButton\.dataset\.removeSelectedItem\)/);
  assert.match(js, /class="selected-trash-icon"/);
  assert.match(css, /\.selected-list\s*{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.selected-card\s*{/);
  assert.match(css, /\.selected-thumb\s*{/);
  assert.match(css, /\.selected-card-actions\s*{[\s\S]*grid-template-columns:\s*minmax\(0,\s*2fr\) minmax\(42px,\s*1fr\)/);
  assert.match(css, /\.selected-expand-card\s*{/);
  assert.match(css, /\.selected-remove-btn\s*{/);
  assert.match(css, /\.selected-preview-btn\s*{[\s\S]*min-height:\s*30px/);
});

test("analysis and write progress share one compact activity slot", () => {
  const js = read("plugin.js");
  const css = read("style.css");

  assert.match(js, /function hideWriteProgressSlot\(/);
  assert.match(js, /function hideAnalysisProgressSlot\(/);
  assert.match(js, /function updateAnalysisProgress\([\s\S]*hideWriteProgressSlot\(\)/);
  assert.match(js, /function updateWriteProgress\([\s\S]*hideAnalysisProgressSlot\(\)/);
  assert.match(css, /\.analysis-progress,\s*\.write-progress\s*{[\s\S]*grid-template-columns:\s*auto minmax\(0,\s*1fr\) auto[\s\S]*padding:\s*6px 8px/);
  assert.match(css, /\.analysis-progress-track,\s*\.write-progress-track\s*{[\s\S]*height:\s*5px/);
  assert.match(css, /\.analysis-progress-meta,\s*\.write-progress-meta\s*{[\s\S]*overflow:\s*hidden[\s\S]*text-overflow:\s*ellipsis[\s\S]*white-space:\s*nowrap/);
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

test("media preview review dialog opens from materials and results with Eagle fallback", () => {
  const html = read("index.html");
  const js = read("plugin.js");
  const css = read("style.css");

  assert.match(html, /id="mediaPreviewOverlay"/);
  assert.match(html, /id="mediaPreviewDialog"/);
  assert.match(html, /class="media-preview-title-block"/);
  assert.match(html, /id="mediaPreviewTitle"/);
  assert.match(html, /id="mediaPreviewMeta"/);
  assert.match(html, /id="mediaPreviewBody"/);
  assert.match(html, /id="mediaPreviewStatus"/);
  assert.match(html, /id="mediaPreviewTags"/);
  assert.match(html, /id="mediaPreviewReason"/);
  assert.match(html, /id="mediaPreviewPrevBtn"/);
  assert.match(html, /id="mediaPreviewNextBtn"/);
  assert.match(html, /id="mediaPreviewOpenEagleBtn"/);
  assert.match(html, /id="closeMediaPreviewBtn"/);

  const previewDialogIndex = html.indexOf('id="mediaPreviewDialog"');
  const settingsDrawerIndex = html.indexOf('id="settingsDrawer"');
  assert.ok(previewDialogIndex > html.indexOf('id="selectedListDialog"'));
  assert.ok(previewDialogIndex < settingsDrawerIndex);

  assert.match(js, /mediaPreview:\s*\{/);
  assert.match(js, /"mediaPreviewOverlay"/);
  assert.match(js, /"mediaPreviewDialog"/);
  assert.match(js, /"mediaPreviewBody"/);
  assert.match(js, /"mediaPreviewOpenEagleBtn"/);
  assert.match(js, /data-preview-item/);
  assert.match(js, /data-preview-result/);
  assert.match(js, /function openMediaPreview\(/);
  assert.match(js, /function closeMediaPreview\(/);
  assert.match(js, /function renderMediaPreview\(/);
  assert.match(js, /function buildMediaPreviewModel\(/);
  assert.match(js, /function openPreviewInEagle\(/);
  assert.match(js, /function handleMediaPreviewVideoError\(/);
  assert.match(js, /function bindMediaPreviewTagEvents\(/);
  assert.match(js, /data-preview-review-tag/);
  assert.match(js, /data-preview-remove-review-tag/);
  assert.match(js, /toggleReviewTag\(input\.dataset\.previewResultId,\s*input\.dataset\.previewReviewTag,\s*input\.checked\)/);
  assert.match(js, /removeReviewTag\(button\.dataset\.previewResultId,\s*button\.dataset\.previewRemoveReviewTag\)/);
  assert.match(js, /item\.open\(\{\s*window:\s*true\s*\}\)/);
  assert.match(js, /eagle\.item\.open\(model\.itemId,\s*\{\s*window:\s*true\s*\}\)/);
  assert.match(js, /<video controls autoplay muted playsinline loop preload="auto"/);
  assert.match(js, /<img src="\$\{escapeHtml\(model\.sourceUrl\)\}"/);

  assert.match(css, /\.media-preview-overlay/);
  assert.match(css, /\.media-preview-dialog\s*{[\s\S]*max-width:\s*92vw[\s\S]*max-height:\s*88vh/);
  assert.match(css, /\.media-preview-dialog\[hidden\]\s*{[\s\S]*display:\s*none/);
  assert.match(css, /\.media-preview-title-block\s*{[\s\S]*min-width:\s*0/);
  assert.match(css, /\.media-preview-head h2\s*{[\s\S]*overflow:\s*hidden[\s\S]*text-overflow:\s*ellipsis[\s\S]*white-space:\s*nowrap/);
  assert.match(css, /#mediaPreviewMeta\s*{[\s\S]*overflow:\s*hidden[\s\S]*text-overflow:\s*ellipsis[\s\S]*white-space:\s*nowrap/);
  assert.match(css, /\.media-preview-actions\s*{[\s\S]*flex-wrap:\s*nowrap/);
  assert.match(css, /\.media-preview-main/);
  assert.match(css, /\.media-preview-player\s*{[\s\S]*min-height:\s*0/);
  assert.match(css, /\.media-preview-player video,\s*\.media-preview-player img/);
  assert.match(css, /\.media-preview-tags/);
});

test("media preview video autoplay is not interrupted by tag-only updates", () => {
  const js = read("plugin.js");

  assert.match(js, /function renderMediaPreviewPlayer\(/);
  assert.match(js, /function renderMediaPreviewDetails\(/);
  assert.match(js, /function refreshMediaPreviewReview\(/);
  assert.match(js, /<video controls autoplay muted playsinline loop preload="auto"/);
  assert.match(js, /const playAttempt = video\.play\(\)/);
  assert.match(js, /playAttempt\.catch\(\(\) => \{\}\)/);
  assert.match(js, /if \(state\.mediaPreview\.open\) refreshMediaPreviewReview\(\)/);

  const renderResultsStart = js.indexOf("function renderResults()");
  const nextFunctionStart = js.indexOf("\n  function ", renderResultsStart + 1);
  const renderResultsBody = js.slice(renderResultsStart, nextFunctionStart);
  assert.doesNotMatch(renderResultsBody, /renderMediaPreview\(\)/);
});

test("media preview supports manual tag adding and closes stale preview state", () => {
  const js = read("plugin.js");
  const css = read("style.css");

  assert.match(js, /data-preview-manual-tag-input/);
  assert.match(js, /data-preview-add-manual-tag/);
  assert.match(js, /data-preview-manual-tag-menu/);
  assert.match(js, /function addPreviewManualTagToResult\(/);
  assert.match(js, /function updatePreviewManualTagMenu\(/);
  assert.match(js, /addManualTagToResult\(resultId,\s*tagName\)/);
  assert.match(js, /if \(state\.mediaPreview\.open\) refreshMediaPreviewReview\(\)/);
  assert.match(js, /function syncMediaPreviewAfterResultsChange\(/);
  assert.match(js, /function syncMediaPreviewAfterSelectedItemsChange\(/);
  assert.match(js, /closeMediaPreview\(\)/);

  const refreshStart = js.indexOf("function refreshMediaPreviewReview()");
  const refreshEnd = js.indexOf("\n  function ", refreshStart + 1);
  const refreshBody = js.slice(refreshStart, refreshEnd);
  assert.doesNotMatch(refreshBody, /renderMediaPreviewPlayer\(/);

  assert.match(css, /\.media-preview-tag-editor/);
});

test("collection workflow exposes append, replace, clear, context menus, and collector bar", () => {
  const html = read("index.html");
  const js = read("plugin.js");
  const css = read("style.css");

  assert.match(html, /id="appendSelectedBtn"[^>]*>追加当前选中<\/button>/);
  assert.match(html, /id="replaceSelectedBtn"[^>]*>替换为当前选中<\/button>/);
  assert.match(html, /id="clearSelectedBtn"[^>]*>清空<\/button>/);
  assert.match(html, /id="miniCollectorBtn"[^>]*class="collector-entry-btn"/);
  assert.match(html, /id="collectorBar"/);
  assert.match(html, /id="collectorAppendBtn"/);
  assert.match(html, /id="collectorAnalyzeBtn"/);
  assert.match(html, /id="collectorClearBtn"/);
  assert.match(html, /id="collectorStatus"/);
  assert.match(html, /id="collectorClearBtn"[^>]*aria-label="清空待分析队列和分析结果"/);
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
  assert.match(js, /function openWorkbenchContextMenu\(/);
  assert.match(js, /function enterCollectorMode\(/);
  assert.match(js, /function exitCollectorMode\(/);
  assert.match(js, /appendSelectedBtn\.addEventListener\("click", \(\) => appendSelectedItems\("追加当前选中"\)\)/);
  assert.match(js, /replaceSelectedBtn\.addEventListener\("click", \(\) => replaceSelectedItems\("替换为当前选中"\)\)/);
  assert.match(js, /collectorAppendBtn\.addEventListener\("click", \(\) => appendSelectedItems\("采集条追加当前选中"\)\)/);
  assert.match(js, /collectorClearBtn\.addEventListener\("click", \(\) => clearSelectedQueue\(\)\)/);
  assert.match(js, /els\.collectorStatus\.textContent = text/);
  assert.match(js, /eagle\.contextMenu\.open/);
  assert.match(js, /data-item-id/);
  assert.match(js, /collector-mode/);

  assert.match(css, /\.collector-bar\s*{/);
  assert.match(css, /\.collector-status/);
  assert.match(css, /body\.collector-mode\s+\.workbench-shell/);
  assert.match(css, /body\.collector-mode\s+\.collector-bar/);
});

test("opening or showing the plugin does not auto-import the current Eagle selection", () => {
  const js = read("plugin.js");

  assert.doesNotMatch(js, /打开插件导入当前选中/);
  assert.doesNotMatch(js, /插件入口追加当前选中/);
  assert.doesNotMatch(js, /进入采集条自动收集当前选中/);
  assert.doesNotMatch(js, /onPluginRun/);
  assert.doesNotMatch(js, /onPluginShow/);
  assert.match(js, /await Promise\.all\(\[refreshTags\(\),\s*refreshModelStatus\(\)\]\)/);
  assert.match(js, /collectorAppendBtn\.addEventListener\("click", \(\) => appendSelectedItems\("采集条追加当前选中"\)\)/);
});

test("collector bar becomes a real always-on-top floating window", () => {
  const js = read("plugin.js");
  const css = read("style.css");
  const manifest = JSON.parse(read("manifest.json"));

  assert.ok(manifest.main.minWidth <= 780, "manifest min width must allow real collector shrink");
  assert.ok(manifest.main.minHeight <= 140, "manifest min height must allow real collector shrink");
  assert.match(js, /COLLECTOR_WINDOW_BOUNDS/);
  assert.match(js, /collectorPreviousBounds/);
  assert.match(js, /collectorPreviousAlwaysOnTop/);
  assert.match(js, /setAlwaysOnTop\(true\)/);
  assert.match(js, /setAlwaysOnTop\(state\.collectorPreviousAlwaysOnTop/);
  assert.match(js, /setResizable\(false\)/);
  assert.match(js, /setResizable\(true\)/);
  assert.match(js, /setWindowBounds\(eagleWindow,\s*await getCollectorWindowBounds\(/);
  assert.match(js, /restoreWorkbenchWindow\(eagleWindow\)/);
  assert.match(js, /setWindowBounds\(eagleWindow,\s*getWorkbenchWindowBounds\(/);
  assert.match(js, /function getCollectorWindowBounds\(/);
  assert.match(js, /function getCurrentWindowBounds\(/);
  assert.match(js, /function getAvailableScreenBounds\(/);
  assert.match(js, /function clampCollectorWindowBounds\(/);
  assert.match(js, /COLLECTOR_SCREEN_MARGIN/);
  assert.match(css, /\.collector-bar\s*{[\s\S]*border:\s*1px solid rgba\(157,\s*191,\s*232,\s*\.72\)/);
  assert.match(css, /\.collector-count-badge/);
  assert.match(css, /\.collector-title/);
});

test("collector bar uses prominent themed icon actions and concise labels", () => {
  const html = read("index.html");
  const css = read("style.css");
  const js = read("plugin.js");
  const manifest = JSON.parse(read("manifest.json"));

  assert.equal(manifest.main.minWidth, 646);
  assert.equal(manifest.main.minHeight, 104);
  assert.match(js, /width:\s*646/);
  assert.match(js, /height:\s*104/);
  assert.doesNotMatch(js, /进入采集条自动收集当前选中/);
  assert.match(js, /collectorAppendBtn\.addEventListener\("click", \(\) => appendSelectedItems\("采集条追加当前选中"\)\)/);
  assert.match(html, /<strong>素材采集<\/strong>/);
  assert.match(html, /<span>边选边收<\/span>/);
  assert.match(html, /id="collectorAppendBtn"[^>]*class="collector-action collector-action-primary"/);
  assert.match(html, /id="collectorAnalyzeBtn"[^>]*class="collector-action collector-action-accent"/);
  assert.match(html, /id="collectorClearBtn"[^>]*class="collector-action collector-action-danger"/);
  assert.match(html, /id="collectorExpandBtn"[^>]*class="collector-action"/);
  assert.match(html, /class="collector-icon"/);
  assert.match(html, />收集选中<\/span>/);
  assert.match(html, />开始分析<\/span>/);
  assert.match(html, />清空全部<\/span>/);
  assert.match(html, />工作台<\/span>/);
  assert.match(css, /body\.collector-mode\s*{[\s\S]*place-items:\s*stretch/);
  assert.match(css, /body\.collector-mode\s+\.collector-bar\s*{[\s\S]*position:\s*fixed[\s\S]*inset:\s*0/);
  assert.match(css, /\.collector-bar\s*{[\s\S]*\n\s+height:\s*100%/);
  assert.match(css, /\.collector-bar\s*{[\s\S]*padding:\s*7px 18px/);
  assert.match(css, /\.collector-action\s*{[\s\S]*min-width:\s*74px[\s\S]*grid-template-rows:\s*22px auto/);
  assert.match(css, /\.collector-action\s*{[\s\S]*min-height:\s*57px/);
  assert.match(css, /\.collector-icon\s*{[\s\S]*width:\s*22px[\s\S]*height:\s*22px/);
  assert.match(css, /\.collector-action-primary\s*{[\s\S]*background:\s*linear-gradient\(135deg,\s*rgba\(157,\s*191,\s*232,\s*\.28\)/);
  assert.match(css, /\.collector-action-accent\s*{[\s\S]*background:\s*linear-gradient\(135deg,\s*#8cb8de,\s*#a69ae0\)/);
  assert.match(css, /\.collector-action-danger\s*{[\s\S]*border-color:\s*rgba\(223,\s*118,\s*109,\s*\.48\)/);
});

test("analysis progress shows staged per-item progress while long AI work is running", () => {
  const js = read("plugin.js");
  const css = read("style.css");

  assert.match(js, /function reportAnalysisStage\(/);
  assert.match(js, /updateAnalysisProgress\(processed,\s*itemsToAnalyze\.length,\s*item,\s*\{\s*stage,\s*itemProgress/);
  assert.match(js, /async function analyzeItem\(item,\s*model,\s*allowedTags,\s*settings,\s*onProgress = null\)/);
  assert.match(js, /reportAnalysisStage\(onProgress,\s*"准备素材"/);
  assert.match(js, /reportAnalysisStage\(onProgress,\s*"调用 AI"/);
  assert.match(js, /reportAnalysisStage\(onProgress,\s*"整理标签"/);
  assert.match(js, /async function prepareMedia\(item,\s*settings,\s*onProgress = null\)/);
  assert.match(js, /async function extractFramesMedia\(sourcePath,\s*kind,\s*maxFrames,\s*settings,\s*onProgress = null\)/);
  assert.match(js, /itemProgress:\s*Math\.min\(.+?0\.95/s);
  assert.match(js, /const effectiveDone = safeDone \+ safeItemProgress/);
  assert.match(js, /阶段：/);
  assert.match(css, /\.analysis-progress\.is-active\s+\.analysis-progress-bar::after/);
});

test("manual result tag editor uses a styled constrained suggestion menu and compact tags", () => {
  const js = read("plugin.js");
  const css = read("style.css");

  assert.doesNotMatch(js, /<datalist/);
  assert.match(js, /data-manual-tag-menu/);
  assert.match(js, /function renderManualTagSuggestions\(/);
  assert.match(js, /function positionManualTagMenu\(/);
  assert.match(js, /classList\.add\("is-open"\)/);
  assert.match(js, /window\.addEventListener\("resize", closeManualTagMenus\)/);
  assert.match(css, /\.review-tag\s*{[\s\S]*min-height:\s*28px[\s\S]*padding:\s*3px 7px/);
  assert.match(css, /\.review-tag-remove\s*{[\s\S]*width:\s*18px[\s\S]*height:\s*18px/);
  assert.match(css, /\.manual-tag-menu\s*{[\s\S]*position:\s*fixed[\s\S]*z-index:\s*80/);
  assert.match(css, /\.manual-tag-menu\[hidden\]\s*{[\s\S]*display:\s*none/);
  assert.match(css, /\.manual-tag-option\s*{/);
});

test("collector entry is a primary local action before secondary material actions", () => {
  const html = read("index.html");
  const css = read("style.css");

  const materialActions = html.match(/<div class="material-actions">([\s\S]*?)<\/div>/)?.[1] || "";
  assert.ok(materialActions.indexOf('id="miniCollectorBtn"') < materialActions.indexOf('id="appendSelectedBtn"'));
  assert.match(materialActions, /id="miniCollectorBtn"[^>]*class="collector-entry-btn"[^>]*aria-label="进入顶部置顶采集窗"/);
  assert.match(materialActions, /class="button-icon"/);
  assert.match(materialActions, />置顶采集<\/span>/);
  assert.match(css, /\.collector-entry-btn\s*{[\s\S]*background:\s*linear-gradient\(135deg,\s*#8cb8de,\s*#a69ae0\)/);
  assert.match(css, /\.button-icon\s*{[\s\S]*width:\s*16px[\s\S]*height:\s*16px/);
});

test("collector window clamps position and size to available screen", () => {
  const js = read("plugin.js");

  assert.match(js, /const COLLECTOR_SCREEN_MARGIN = 8/);
  assert.match(js, /function clampNumber\(/);
  assert.match(js, /function getAvailableScreenBounds\(fallbackBounds\)/);
  assert.match(js, /function clampCollectorWindowBounds\(bounds,\s*screenBounds\)/);
  assert.match(js, /const maxWidth = Math\.max\(1,\s*screenBounds\.width - COLLECTOR_SCREEN_MARGIN \* 2\)/);
  assert.match(js, /const width = Math\.min\(bounds\.width,\s*maxWidth\)/);
  assert.match(js, /const x = clampNumber\(bounds\.x,\s*minX,\s*maxX\)/);
  assert.match(js, /clampCollectorWindowBounds\(ideal,\s*screenBounds\)/);
});

test("workbench restores full bounds when Eagle reopens the last collector-sized window", () => {
  const js = read("plugin.js");
  const manifest = JSON.parse(read("manifest.json"));

  assert.equal(manifest.main.width, 1180);
  assert.equal(manifest.main.height, 760);
  assert.match(js, /const WORKBENCH_WINDOW_BOUNDS = \{\s*width:\s*1180,\s*height:\s*760\s*\}/);
  assert.match(js, /await ensureWorkbenchWindowBounds\(\)/);
  assert.match(js, /async function ensureWorkbenchWindowBounds\(/);
  assert.match(js, /function isCollectorSizedBounds\(/);
  assert.match(js, /bounds\.width <= COLLECTOR_WINDOW_BOUNDS\.width \+ COLLECTOR_RESTORE_TOLERANCE/);
  assert.match(js, /bounds\.height <= COLLECTOR_WINDOW_BOUNDS\.height \+ COLLECTOR_RESTORE_TOLERANCE/);
  assert.match(js, /await restoreWorkbenchWindow\(eagleWindow,\s*\{ clearCollectorState:\s*false \}\)/);
});

test("closing from collector mode marks workbench restore without flashing full window", () => {
  const js = read("plugin.js");

  assert.match(js, /async function closePluginWindow\(/);
  assert.match(js, /if \(document\.body\.classList\.contains\("collector-mode"\)\) \{\s*markWorkbenchRestorePending\(\);\s*\}/);
  assert.doesNotMatch(js, /if \(document\.body\.classList\.contains\("collector-mode"\)\) \{\s*await restoreWorkbenchWindow\(eagleWindow\);\s*\}/);
  assert.match(js, /restoreWorkbenchBounds:\s*"vfxAiTagger\.restoreWorkbenchBounds"/);
  assert.match(js, /function markWorkbenchRestorePending\(/);
  assert.match(js, /function consumeWorkbenchRestorePending\(/);
  assert.match(js, /async function restoreWorkbenchWindow\(eagleWindow,\s*options = \{\}\)/);
  assert.match(js, /document\.body\.classList\.remove\("collector-mode"\)/);
  assert.match(js, /setWindowBounds\(eagleWindow,\s*getWorkbenchWindowBounds\(/);
  assert.match(js, /state\.collectorPreviousBounds = null/);
});

test("collector bar remembers dragged position and restores it inside the screen", () => {
  const js = read("plugin.js");

  assert.match(js, /collectorWindowBounds:\s*"vfxAiTagger\.collectorWindowBounds"/);
  assert.match(js, /function readStoredCollectorWindowBounds\(/);
  assert.match(js, /function saveCollectorWindowBounds\(/);
  assert.match(js, /function removeStoredCollectorWindowBounds\(/);
  assert.match(js, /const storedBounds = readStoredCollectorWindowBounds\(\)/);
  assert.match(js, /if \(storedBounds\) \{\s*return clampCollectorWindowBounds\(/);
  assert.match(js, /width:\s*COLLECTOR_WINDOW_BOUNDS\.width/);
  assert.match(js, /height:\s*COLLECTOR_WINDOW_BOUNDS\.height/);
  assert.match(js, /async function persistCollectorWindowBounds\(eagleWindow\)/);
  assert.match(js, /await persistCollectorWindowBounds\(eagleWindow\);\s*await restoreWorkbenchWindow\(eagleWindow\)/);
  assert.match(js, /await persistCollectorWindowBounds\(eagleWindow\);\s*if \(document\.body\.classList\.contains\("collector-mode"\)\) \{/);
  assert.match(js, /await persistCollectorWindowBounds\(eagleWindow\);\s*await exitCollectorMode\(\);\s*await analyzeSelected\(\);/);
});
