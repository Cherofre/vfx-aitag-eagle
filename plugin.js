(function () {
  const nodeRequire = typeof require === "function" ? require : null;
  const fs = nodeRequire ? nodeRequire("fs") : null;
  const os = nodeRequire ? nodeRequire("os") : null;
  const path = nodeRequire ? nodeRequire("path") : null;
  const cp = nodeRequire ? nodeRequire("child_process") : null;
  const url = nodeRequire ? nodeRequire("url") : null;
  const cliBackends = window.VfxAiTaggerBackends || null;

  const STORAGE_KEYS = {
    customAllowedTags: "vfxAiTagger.customAllowedTags",
    disabledTags: "vfxAiTagger.disabledTags",
    settings: "vfxAiTagger.settings",
    results: "vfxAiTagger.results"
  };

  const DEFAULT_VFX_TAGS = [
    "爆炸", "火焰", "闪电", "冰冻", "烟雾", "冲击波", "光束", "魔法阵", "传送门", "能量球",
    "护盾", "拖尾", "命中特效", "技能释放", "蓄力", "受击", "循环特效", "环境特效", "UI特效",
    "火", "冰", "雷", "电", "风", "水", "毒", "暗", "光", "能量", "机械", "自然", "时间", "草地", "星空",
    "红色", "蓝色", "紫色", "金色", "绿色", "白色", "黑色", "黄色", "橙色", "青色",
    "攻击", "释放", "循环", "转场", "场景氛围",
    "写实", "卡通", "二次元", "科幻", "魔幻", "低多边形"
  ];

  const STATIC_IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "bmp", "tif", "tiff", "heic", "avif"]);
  const WEBP_EXT = "webp";
  const ANIMATED_EXTS = new Set(["gif", "apng"]);
  const VIDEO_EXTS = new Set(["mp4", "mov", "webm", "avi", "mkv", "ts", "m4v", "wmv"]);
  const PREVIEW_EXTS = new Set(["svg", "psd", "ai", "pdf", "eps", "sketch"]);
  const DIAGNOSTIC_PREVIEW_LIMIT = 8;
  const AI_RETRY_COUNT = 2;
  const AI_RETRY_BASE_DELAY_MS = 1200;
  const DEFAULT_REQUEST_CHUNK_K = 256;
  const MIN_REQUEST_CHUNK_K = 4;
  const MAX_REQUEST_CHUNK_K = 256;
  const REQUEST_SAFETY_TOKENS = 512;
  const MIN_TAG_BUDGET_TOKENS = 512;
  const ESTIMATED_IMAGE_TOKENS = 3072;
  const ANALYSIS_PRESETS = {
    "快速粗标": {
      maxTags: 6,
      concurrency: 3,
      aiRetryCount: 1,
      requestChunkK: 128,
      autoConfidence: 0.85,
      hideConfidence: 0.55,
      frameRateValue: 1,
      frameRateUnit: "spf",
      maxVideoFrames: 18,
      maxAnimatedFrames: 10
    },
    "精细分析": {
      maxTags: 12,
      concurrency: 1,
      aiRetryCount: 3,
      requestChunkK: 192,
      autoConfidence: 0.78,
      hideConfidence: 0.35,
      frameRateValue: 1,
      frameRateUnit: "fps",
      maxVideoFrames: 72,
      maxAnimatedFrames: 36
    },
    "长视频省钱": {
      maxTags: 8,
      concurrency: 1,
      aiRetryCount: 1,
      requestChunkK: 96,
      autoConfidence: 0.82,
      hideConfidence: 0.5,
      frameRateValue: 2,
      frameRateUnit: "spf",
      maxVideoFrames: 20,
      maxAnimatedFrames: 12
    },
    "只用 Claude": {
      enableClaudeCli: true,
      enableCodexCli: false,
      enableEagleAi: false
    },
    "只用 Codex": {
      enableClaudeCli: false,
      enableCodexCli: true,
      enableEagleAi: false
    },
    "Eagle AI 兜底": {
      enableClaudeCli: true,
      enableCodexCli: true,
      enableEagleAi: true
    }
  };

  const els = {};
  const state = {
    running: false,
    selectedItems: [],
    itemSource: "eagle",
    eagleTagRecords: [],
    eagleTags: [],
    eagleTagGroups: [],
    selectedTagGroupName: "__all",
    customAllowedTags: [],
    disabledTags: [],
    sessionRemovedTags: [],
    undoStack: [],
    results: [],
    healthStatus: [],
    activeResultFilter: "all",
    activePresetName: "",
    collectorPreviousSize: null,
    pluginRunCollectionBound: false,
    pauseRequested: false,
    paused: false,
    writing: false
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    [
      "statusText", "openAiBtn", "appendSelectedBtn", "replaceSelectedBtn", "clearSelectedBtn", "miniCollectorBtn", "analyzeBtn", "pauseBtn", "continueBtn", "restartBtn", "applyBtn", "undoBtn", "closeWindowBtn", "selectedCount", "tagPoolCount",
      "readyCount", "failedCount", "tagInput", "addTagBtn", "tagSearch", "refreshTagsBtn",
      "importDefaultsBtn", "tagGroupSelect", "tagPool", "maxTags", "concurrency", "aiRetryCount", "requestChunkK", "autoConfidence", "hideConfidence", "frameRateValue", "frameRateUnit",
      "maxVideoFrames", "maxAnimatedFrames", "skipStart", "skipEnd", "skipTagged", "previewBeforeWrite", "autoApplyHighConfidence",
      "writeAnnotation", "includeTitleInPrompt", "diagnosticEnabled", "diagnosticDir", "chooseDiagnosticDirBtn", "globalPrompt", "frameRateHint", "selectedSummary",
      "selectedItems", "showSelectedListBtn", "selectedListOverlay", "selectedListDialog", "selectedItemsFullList", "closeSelectedListBtn",
      "collectorBar", "collectorCount", "collectorAppendBtn", "collectorAnalyzeBtn", "collectorExpandBtn", "collectorCloseBtn",
      "results", "clearResultsBtn", "analysisProgressPanel", "analysisProgressText", "analysisProgressPercent", "analysisProgressBar", "analysisProgressMeta",
      "writeProgressPanel", "writeProgressText", "writeProgressPercent", "writeProgressBar", "writeProgressMeta",
      "backendStatus", "refreshBackendStatusBtn", "enableClaudeCli", "enableCodexCli", "enableEagleAi",
      "claudeCommand", "claudeExtraArgs", "codexCommand", "codexModel", "codexExtraArgs", "cliTimeoutSeconds", "cliWorkingDir",
      "healthCheckPanel", "healthSummary", "healthStatusList", "runHealthCheckBtn",
      "analysisPresetSelect", "applyPresetBtn", "presetHint", "retryFailedBtn",
      "settingsOverlay", "settingsDrawer", "closeSettingsBtn", "eagleAiSettingsBtn"
    ].forEach((id) => { els[id] = document.getElementById(id); });
    els.settingsTabs = Array.from(document.querySelectorAll("[data-settings-tab]"));
    els.settingsPanels = Array.from(document.querySelectorAll("[data-settings-panel]"));
    els.resultFilterButtons = Array.from(document.querySelectorAll("[data-result-filter]"));

    loadStoredState();
    bindEvents();
    bindPluginRunCollection();
    await refreshAll();
    await runHealthCheck({ silent: true });
  }

  function bindEvents() {
    els.openAiBtn.addEventListener("click", openSettingsDrawer);
    els.showSelectedListBtn.addEventListener("click", openSelectedListDialog);
    els.closeSelectedListBtn.addEventListener("click", closeSelectedListDialog);
    els.selectedListOverlay.addEventListener("click", closeSelectedListDialog);
    els.closeSettingsBtn.addEventListener("click", closeSettingsDrawer);
    els.settingsOverlay.addEventListener("click", closeSettingsDrawer);
    els.eagleAiSettingsBtn.addEventListener("click", openAiSettings);
    els.chooseDiagnosticDirBtn.addEventListener("click", chooseDiagnosticDir);
    els.diagnosticDir.addEventListener("input", saveSettings);
    els.settingsTabs.forEach((tab) => {
      tab.addEventListener("click", () => activateSettingsTab(tab.dataset.settingsTab));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSelectedListDialog();
        closeSettingsDrawer();
      }
    });
    els.appendSelectedBtn.addEventListener("click", () => appendSelectedItems("追加当前选中"));
    els.replaceSelectedBtn.addEventListener("click", () => replaceSelectedItems("替换为当前选中"));
    els.clearSelectedBtn.addEventListener("click", () => clearSelectedQueue());
    els.miniCollectorBtn.addEventListener("click", enterCollectorMode);
    els.collectorAppendBtn.addEventListener("click", () => appendSelectedItems("采集条追加当前选中"));
    els.collectorAnalyzeBtn.addEventListener("click", async () => {
      await exitCollectorMode();
      await analyzeSelected();
    });
    els.collectorExpandBtn.addEventListener("click", exitCollectorMode);
    els.collectorCloseBtn.addEventListener("click", closePluginWindow);
    els.selectedItems.addEventListener("contextmenu", (event) => openWorkbenchContextMenu(event, "selected-panel"));
    els.selectedItemsFullList.addEventListener("contextmenu", (event) => openWorkbenchContextMenu(event, "selected-panel"));
    els.tagPool.addEventListener("contextmenu", (event) => openWorkbenchContextMenu(event, "tag-pool"));
    els.results.addEventListener("contextmenu", (event) => openWorkbenchContextMenu(event, "results"));
    els.refreshTagsBtn.addEventListener("click", refreshTags);
    els.importDefaultsBtn.addEventListener("click", importDefaultTags);
    els.addTagBtn.addEventListener("click", addCustomTag);
    els.tagInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") addCustomTag();
    });
    els.tagGroupSelect.addEventListener("change", () => {
      state.selectedTagGroupName = els.tagGroupSelect.value || "__all";
      applyTagGroupFilter();
      saveSettings();
      renderAll();
      setStatus(`标签池来源已切换为：${getSelectedTagGroupLabel()}`);
    });
    els.tagSearch.addEventListener("input", renderTagPool);
    els.analyzeBtn.addEventListener("click", analyzeSelected);
    els.pauseBtn.addEventListener("click", pauseAnalysis);
    els.continueBtn.addEventListener("click", continueAnalysis);
    els.restartBtn.addEventListener("click", restartAnalysis);
    els.applyBtn.addEventListener("click", applyReadyResults);
    els.undoBtn.addEventListener("click", undoLastWrite);
    els.closeWindowBtn.addEventListener("click", closePluginWindow);
    els.globalPrompt.addEventListener("input", saveSettings);
    els.clearResultsBtn.addEventListener("click", () => {
      state.results = [];
      saveResultsState();
      resetAnalysisProgress();
      resetWriteProgress();
      renderResults();
    });
    els.resultFilterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.activeResultFilter = button.dataset.resultFilter || "all";
        renderResults();
      });
    });
    els.retryFailedBtn.addEventListener("click", retryFailedResults);
    els.runHealthCheckBtn.addEventListener("click", () => runHealthCheck({ silent: false }));
    els.analysisPresetSelect.addEventListener("change", () => {
      state.activePresetName = els.analysisPresetSelect.value || "";
      saveSettings();
      renderPresetHint();
    });
    els.applyPresetBtn.addEventListener("click", () => applyAnalysisPreset(els.analysisPresetSelect.value));
    els.refreshBackendStatusBtn.addEventListener("click", () => {
      refreshModelStatus();
      saveSettings();
    });
    [
      "maxTags", "concurrency", "aiRetryCount", "requestChunkK", "autoConfidence", "hideConfidence", "frameRateValue", "frameRateUnit", "maxVideoFrames",
      "maxAnimatedFrames", "skipStart", "skipEnd", "skipTagged", "previewBeforeWrite", "autoApplyHighConfidence", "writeAnnotation", "includeTitleInPrompt", "diagnosticEnabled",
      "enableClaudeCli", "enableCodexCli", "enableEagleAi", "claudeCommand", "claudeExtraArgs", "codexCommand", "codexModel",
      "codexExtraArgs", "cliTimeoutSeconds", "cliWorkingDir"
    ].forEach((id) => {
      els[id].addEventListener("change", () => {
        clampAndShowFrameRate();
        saveSettings();
        refreshModelStatus();
      });
    });
  }

  async function refreshAll() {
    await Promise.all([refreshTags(), appendSelectedItems("打开插件导入当前选中", { silentWhenEmpty: true }), refreshModelStatus()]);
    renderAll();
  }

  function closePluginWindow() {
    closeSettingsDrawer();
    try {
      const eagleWindow = window.eagle && (eagle.window || eagle.pluginWindow);
      if (eagleWindow && typeof eagleWindow.close === "function") {
        eagleWindow.close();
        return;
      }
    } catch (error) {
      setStatus(`关闭窗口失败：${formatError(error)}`);
      return;
    }
    try {
      window.close();
    } catch (error) {
      setStatus(`关闭窗口失败：${formatError(error)}`);
    }
  }

  function bindPluginRunCollection() {
    if (state.pluginRunCollectionBound || !window.eagle) return;
    const eventApi = eagle.event || eagle;
    const handler = () => appendSelectedItems("插件入口追加当前选中", { silentWhenEmpty: true });
    let bound = false;
    ["onPluginRun", "onPluginShow"].forEach((eventName) => {
      if (eventApi && typeof eventApi[eventName] === "function") {
        eventApi[eventName](handler);
        bound = true;
      }
    });
    state.pluginRunCollectionBound = bound;
  }

  function getPluginWindowApi() {
    return window.eagle && (eagle.window || eagle.pluginWindow);
  }

  async function enterCollectorMode() {
    closeSelectedListDialog();
    closeSettingsDrawer();
    state.collectorPreviousSize = state.collectorPreviousSize || {
      width: window.outerWidth || 1180,
      height: window.outerHeight || 760
    };
    document.body.classList.add("collector-mode");
    if (els.collectorBar) els.collectorBar.hidden = false;
    updateCollectorBar();
    try {
      const eagleWindow = getPluginWindowApi();
      if (eagleWindow && typeof eagleWindow.setSize === "function") {
        await eagleWindow.setSize(560, 72);
      }
    } catch (error) {
      setStatus(`切换采集条失败：${formatError(error)}`);
    }
  }

  async function exitCollectorMode() {
    document.body.classList.remove("collector-mode");
    if (els.collectorBar) els.collectorBar.hidden = true;
    try {
      const eagleWindow = getPluginWindowApi();
      const previous = state.collectorPreviousSize;
      if (previous && eagleWindow && typeof eagleWindow.setSize === "function") {
        await eagleWindow.setSize(previous.width, previous.height);
      }
    } catch (error) {
      setStatus(`展开工作台失败：${formatError(error)}`);
    }
  }

  function openWorkbenchContextMenu(event, scope) {
    event.preventDefault();
    event.stopPropagation();
    const itemRow = event.target.closest("[data-item-id]");
    const resultCard = event.target.closest("[data-result-id]");
    const poolTag = event.target.closest("[data-pool-tag]");
    const reviewTag = event.target.closest("[data-review-tag-name]");
    if (itemRow) {
      openContextMenu(event, [
        { label: "分析此素材", action: () => analyzeSingleItem(itemRow.dataset.itemId) },
        { label: "从列表移除", action: () => removeSelectedItem(itemRow.dataset.itemId) },
        { label: "复制文件路径", action: () => copyItemPath(itemRow.dataset.itemId) }
      ]);
      return;
    }
    if (reviewTag) {
      openContextMenu(event, [
        { label: "移除此标签", action: () => removeReviewTag(reviewTag.dataset.resultId, reviewTag.dataset.reviewTagName) },
        { label: "复制标签名", action: () => copyText(reviewTag.dataset.reviewTagName) }
      ]);
      return;
    }
    if (resultCard) {
      const resultId = resultCard.dataset.resultId;
      const result = state.results.find((item) => item.id === resultId);
      openContextMenu(event, [
        { label: "重新分析", action: () => reanalyzeResult(resultId), disabled: state.running },
        { label: "写入此项标签", action: () => applySingleResult(resultId), disabled: !result || result.status !== "ready" || !getSelectedReviewTags(result).length },
        { label: "复制推荐标签", action: () => copyResultTags(resultId), disabled: !result || !getSelectedReviewTags(result).length },
        { label: "从结果中移除", action: () => removeResult(resultId) }
      ]);
      return;
    }
    if (poolTag) {
      openContextMenu(event, [
        { label: "复制标签名", action: () => copyText(poolTag.dataset.poolTag) },
        { label: "从本次标签池移除", action: () => removeFromPool(poolTag.dataset.poolTag) }
      ]);
      return;
    }
    if (scope === "tag-pool") return;
    openContextMenu(event, [
      { label: "追加当前选中", action: () => appendSelectedItems("右键菜单追加当前选中") },
      { label: "替换为当前选中", action: () => replaceSelectedItems("右键菜单替换当前选中") },
      { label: "清空待分析素材", action: () => clearSelectedQueue() },
      { label: "打开完整列表", action: openSelectedListDialog, disabled: !state.selectedItems.length },
      { label: "收起为采集条", action: enterCollectorMode }
    ]);
  }

  function openContextMenu(event, items) {
    const availableItems = items.filter((item) => !item.hidden);
    const nativeMenu = window.eagle && eagle.contextMenu && eagle.contextMenu.open;
    if (typeof nativeMenu === "function") {
      nativeMenu.call(eagle.contextMenu, availableItems.map((item) => ({
        label: item.label,
        disabled: Boolean(item.disabled),
        enabled: !item.disabled,
        click: item.disabled ? undefined : item.action
      })));
      return;
    }
    showFallbackContextMenu(event, availableItems);
  }

  function showFallbackContextMenu(event, items) {
    closeFallbackContextMenu();
    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.style.left = `${Math.min(event.clientX, window.innerWidth - 190)}px`;
    menu.style.top = `${Math.min(event.clientY, window.innerHeight - 40)}px`;
    items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item.label;
      button.disabled = Boolean(item.disabled);
      button.addEventListener("click", () => {
        closeFallbackContextMenu();
        if (!item.disabled) item.action();
      });
      menu.appendChild(button);
    });
    document.body.appendChild(menu);
    window.setTimeout(() => {
      document.addEventListener("click", closeFallbackContextMenu, { once: true });
    }, 0);
  }

  function closeFallbackContextMenu() {
    document.querySelectorAll(".context-menu").forEach((menu) => menu.remove());
  }

  async function analyzeSingleItem(itemId) {
    const item = state.selectedItems.find((candidate) => getItemId(candidate) === itemId);
    if (!item) {
      setStatus("找不到这个素材，请重新导入当前选中素材后再试。");
      return;
    }
    state.results = state.results.filter((result) => result.id !== itemId);
    state.results.push(createPendingResult(item));
    saveResultsState();
    renderAll();
    await analyzeSelected();
  }

  function removeSelectedItem(itemId) {
    state.selectedItems = state.selectedItems.filter((item) => getItemId(item) !== itemId);
    state.results = state.results.filter((result) => result.id !== itemId);
    saveResultsState();
    renderAll();
    setStatus("已从待分析列表移除 1 个素材。");
  }

  function removeResult(resultId) {
    state.results = state.results.filter((result) => result.id !== resultId);
    saveResultsState();
    resetAnalysisProgress();
    renderAll();
    setStatus("已从结果中移除 1 项。");
  }

  async function applySingleResult(resultId) {
    if (state.writing || state.running) return;
    const result = state.results.find((item) => item.id === resultId);
    const selectedTags = result ? getSelectedReviewTags(result) : [];
    if (!result || result.status !== "ready" || !selectedTags.length) {
      setStatus("这个结果没有可写入的标签。");
      return;
    }
    const item = state.selectedItems.find((candidate) => getItemId(candidate) === resultId);
    if (!item || item.external || typeof item.save !== "function") {
      updateResult(resultId, { status: "ready", message: "找不到可写回的 Eagle 素材", errorType: "write" });
      return;
    }
    state.writing = true;
    updateWriteProgress(0, 1, 0);
    try {
      const settings = readSettings();
      await mergeTagsIntoItem(item, selectedTags.map((tag) => tag.name), settings.writeAnnotation ? result.aiReason : "", "右键菜单写入标签");
      updateResult(resultId, { status: "applied", message: "已写入 Eagle", errorType: "" });
      updateWriteProgress(1, 1, 0, "已写入 1 个素材。");
      setStatus("已写入 1 个素材。");
    } catch (error) {
      updateResult(resultId, { status: "ready", message: `写入失败：${formatError(error)}`, errorType: "write" });
      updateWriteProgress(1, 1, 1, "写入失败 1 个素材。");
    } finally {
      state.writing = false;
      renderAll();
    }
  }

  function copyItemPath(itemId) {
    const item = state.selectedItems.find((candidate) => getItemId(candidate) === itemId);
    copyText(getItemFilePath(item));
  }

  function copyResultTags(resultId) {
    const result = state.results.find((item) => item.id === resultId);
    copyText(getSelectedReviewTags(result || {}).map((tag) => tag.name).join("、"));
  }

  async function copyText(text) {
    const value = String(text || "");
    if (!value) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const input = document.createElement("textarea");
        input.value = value;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      setStatus("已复制到剪贴板。");
    } catch (error) {
      setStatus(`复制失败：${formatError(error)}`);
    }
  }

  function openSelectedListDialog() {
    if (!els.selectedListDialog || !els.selectedListOverlay) return;
    renderSelectedFullList();
    els.selectedListOverlay.hidden = false;
    els.selectedListDialog.hidden = false;
    requestAnimationFrame(() => {
      els.selectedListOverlay.classList.add("is-open");
      els.selectedListDialog.classList.add("is-open");
      els.selectedListDialog.setAttribute("aria-hidden", "false");
    });
  }

  function closeSelectedListDialog() {
    if (!els.selectedListDialog || !els.selectedListOverlay || els.selectedListOverlay.hidden) return;
    els.selectedListOverlay.classList.remove("is-open");
    els.selectedListDialog.classList.remove("is-open");
    els.selectedListDialog.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      if (!els.selectedListOverlay.classList.contains("is-open")) {
        els.selectedListOverlay.hidden = true;
        els.selectedListDialog.hidden = true;
      }
    }, 180);
  }

  async function refreshTags() {
    if (!window.eagle || !eagle.tag || !eagle.tag.get) {
      state.eagleTagRecords = [];
      state.eagleTags = [];
      state.eagleTagGroups = [];
      setStatus("未检测到 Eagle 标签 API，请在 Eagle 插件窗口中运行。");
      return;
    }
    try {
      const tags = await eagle.tag.get();
      state.eagleTagRecords = Array.isArray(tags) ? tags : [];
      state.eagleTagGroups = await readEagleTagGroups();
      applyTagGroupFilter();
      state.customAllowedTags = [];
      state.disabledTags = [];
      state.sessionRemovedTags = [];
      saveStoredTagState();
      setStatus(`已从 ${getSelectedTagGroupLabel()} 读取 ${state.eagleTags.length} 个 Eagle 标签`);
    } catch (error) {
      setStatus(`读取 Eagle 标签失败：${formatError(error)}`);
    }
    renderAll();
  }

  async function readEagleTagGroups() {
    const api = window.eagle && (eagle.tagGroup || eagle.tagGroups);
    if (!api || typeof api.get !== "function") return [];
    try {
      const groups = await api.get();
      return Array.isArray(groups) ? groups : [];
    } catch (error) {
      setStatus(`读取 Eagle 标签组失败，将使用全部标签：${formatError(error)}`);
      return [];
    }
  }

  function applyTagGroupFilter() {
    const selectedName = state.selectedTagGroupName || "__all";
    if (selectedName === "__all") {
      state.eagleTags = normalizeTagList(state.eagleTagRecords.map(extractTagName));
      return;
    }
    const selectedGroup = state.eagleTagGroups.find((group) => getTagGroupName(group) === selectedName);
    if (selectedGroup && Array.isArray(selectedGroup.tags)) {
      state.eagleTags = normalizeTagList(selectedGroup.tags.map(extractTagName));
      return;
    }
    state.selectedTagGroupName = "__all";
    state.eagleTags = normalizeTagList(state.eagleTagRecords.map(extractTagName));
  }

  function getSelectedTagGroupLabel() {
    if (!state.selectedTagGroupName || state.selectedTagGroupName === "__all") return "全部 Eagle 标签";
    return `标签组「${state.selectedTagGroupName}」`;
  }

  async function refreshSelection() {
    await replaceSelectedItems("刷新当前选中");
  }

  async function fetchEagleSelectedItems() {
    if (!window.eagle || !eagle.item) {
      throw new Error("未检测到 Eagle 项目 API，请在 Eagle 插件窗口中运行。");
    }
    if (typeof eagle.item.getSelected === "function") {
      return await eagle.item.getSelected();
    }
    if (typeof eagle.item.get === "function") {
      return await eagle.item.get({ isSelected: true });
    }
    return [];
  }

  function getQueueKey(item) {
    const id = getItemId(item);
    if (id) return `id:${id}`;
    const filePath = getItemFilePath(item);
    return filePath ? `path:${filePath}` : `name:${getItemName(item)}`;
  }

  function mergeSelectedItems(nextItems, mode) {
    const incoming = Array.isArray(nextItems) ? nextItems.filter(Boolean) : [];
    const replacing = mode === "replace";
    if (replacing) {
      state.selectedItems = [];
      state.results = [];
      resetAnalysisProgress();
      resetWriteProgress();
    }
    const seen = new Set(state.selectedItems.map(getQueueKey));
    const addedItems = [];
    let skipped = 0;
    incoming.forEach((item) => {
      const key = getQueueKey(item);
      if (seen.has(key)) {
        skipped += 1;
        return;
      }
      seen.add(key);
      addedItems.push(item);
    });
    state.selectedItems = [...state.selectedItems, ...addedItems];
    state.itemSource = "eagle";
    saveResultsState();
    renderAll();
    return { added: addedItems.length, skipped, total: incoming.length };
  }

  async function appendSelectedItems(actionName, options = {}) {
    try {
      const nextItems = await fetchEagleSelectedItems();
      const summary = mergeSelectedItems(nextItems, "append");
      if (!summary.total && !options.silentWhenEmpty) {
        setStatus("没有读取到 Eagle 当前选中素材。");
      } else if (summary.added) {
        setStatus(`${actionName}：新增 ${summary.added} 个，跳过已存在 ${summary.skipped} 个。`);
      } else if (summary.total && !options.silentWhenEmpty) {
        setStatus("当前选中素材已在待分析列表中。");
      }
    } catch (error) {
      setStatus(`读取选中素材失败：${formatError(error)}`);
      renderAll();
    }
  }

  async function replaceSelectedItems(actionName) {
    try {
      const nextItems = await fetchEagleSelectedItems();
      if (!nextItems.length) {
        setStatus("没有读取到 Eagle 当前选中素材，待分析列表保持不变。");
        return;
      }
      const summary = mergeSelectedItems(nextItems, "replace");
      setStatus(`${actionName}：已导入 ${summary.added} 个 Eagle 选中素材。`);
    } catch (error) {
      state.selectedItems = [];
      state.results = [];
      setStatus(`读取选中素材失败：${formatError(error)}`);
      renderAll();
    }
  }

  function clearSelectedQueue(options = {}) {
    if (state.running || state.writing) {
      setStatus("正在分析或写入，不能清空待分析素材。");
      return;
    }
    const hasContent = state.selectedItems.length || state.results.length;
    if (!hasContent) {
      setStatus("待分析素材已经是空的。");
      return;
    }
    if (!options.skipConfirm && typeof window.confirm === "function" && !window.confirm("清空待分析素材和当前分析结果？")) {
      return;
    }
    closeSelectedListDialog();
    state.selectedItems = [];
    state.results = [];
    resetAnalysisProgress();
    resetWriteProgress();
    saveResultsState();
    renderAll();
    setStatus("已清空待分析素材和当前分析结果。");
  }

  async function refreshModelStatus() {
    try {
      const settings = readSettings();
      const model = getAiModel();
      if (els.modelStatus) els.modelStatus.textContent = model ? "视觉模型已配置" : "未配置视觉模型";
      if (els.backendStatus) {
        const labels = settings.enabledBackends.map(formatBackendLabel);
        const cliReady = cliBackends && cp ? "" : "（当前环境不能调用 CLI）";
        const eagleNote = settings.enabledBackends.includes("eagle") && !model ? "，Eagle AI 未配置" : "";
        els.backendStatus.textContent = labels.length ? `已启用：${labels.join(" -> ")}${cliReady}${eagleNote}` : "未启用任何 AI 后端";
      }
    } catch (error) {
      if (els.modelStatus) els.modelStatus.textContent = "AI SDK 不可用";
      if (els.backendStatus) els.backendStatus.textContent = "后端状态检测失败";
    }
  }

  function getAiModel() {
    const ai = window.eagle && eagle.extraModule && eagle.extraModule.ai;
    if (!ai || !ai.getDefaultModel || !ai.getModel) return null;
    if (typeof ai.reload === "function") ai.reload();
    const modelId = ai.getDefaultModel("image");
    return modelId ? ai.getModel(modelId) : null;
  }

  function openSettingsDrawer() {
    if (!els.settingsDrawer || !els.settingsOverlay) return;
    els.settingsOverlay.hidden = false;
    requestAnimationFrame(() => {
      els.settingsOverlay.classList.add("is-open");
      els.settingsDrawer.classList.add("is-open");
      els.settingsDrawer.setAttribute("aria-hidden", "false");
    });
  }

  function closeSettingsDrawer() {
    if (!els.settingsDrawer || !els.settingsOverlay || els.settingsOverlay.hidden) return;
    els.settingsOverlay.classList.remove("is-open");
    els.settingsDrawer.classList.remove("is-open");
    els.settingsDrawer.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      if (!els.settingsOverlay.classList.contains("is-open")) {
        els.settingsOverlay.hidden = true;
      }
    }, 180);
  }

  function activateSettingsTab(tabName) {
    const nextTab = tabName || "backend";
    els.settingsTabs.forEach((tab) => {
      const active = tab.dataset.settingsTab === nextTab;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    els.settingsPanels.forEach((panel) => {
      const active = panel.dataset.settingsPanel === nextTab;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  }

  function openAiSettings() {
    const ai = window.eagle && eagle.extraModule && eagle.extraModule.ai;
    if (ai && typeof ai.open === "function") {
      ai.open();
    } else {
      setStatus("当前 Eagle 版本未提供 AI 设置入口。");
    }
  }

  function getUsableBackends(settings, eagleModel) {
    const requested = Array.isArray(settings.enabledBackends) ? settings.enabledBackends : [];
    return requested.filter((backend) => {
      if (backend === "eagle") return Boolean(eagleModel);
      return Boolean(cliBackends && cp && typeof cp.execFile === "function");
    });
  }

  function formatBackendLabel(backend) {
    if (backend === "claude") return "Claude CLI";
    if (backend === "codex") return "Codex CLI";
    if (backend === "eagle") return "Eagle AI";
    return String(backend || "未知后端");
  }

  async function importSelectedItems() {
    await appendSelectedItems("追加当前选中");
  }

  function importDefaultTags() {
    state.customAllowedTags = normalizeTagList([...state.customAllowedTags, ...DEFAULT_VFX_TAGS]);
    state.disabledTags = state.disabledTags.filter((tag) => !DEFAULT_VFX_TAGS.includes(tag));
    state.sessionRemovedTags = state.sessionRemovedTags.filter((tag) => !DEFAULT_VFX_TAGS.includes(tag));
    saveStoredTagState();
    renderAll();
    setStatus("已导入默认特效标签模板。");
  }

  function addCustomTag() {
    const tag = cleanTag(els.tagInput.value);
    if (!tag) return;
    state.customAllowedTags = normalizeTagList([...state.customAllowedTags, tag]);
    state.disabledTags = state.disabledTags.filter((item) => item !== tag);
    state.sessionRemovedTags = state.sessionRemovedTags.filter((item) => item !== tag);
    els.tagInput.value = "";
    saveStoredTagState();
    renderAll();
  }

  function removeFromPool(tag) {
    if (!state.sessionRemovedTags.includes(tag)) {
      state.sessionRemovedTags.push(tag);
    }
    renderAll();
  }

  async function analyzeSelected() {
    if (state.running) return;
    const allowedTags = getAllowedTags();
    if (!allowedTags.length) {
      setStatus("标签池为空，请先刷新 Eagle 标签或导入默认模板。");
      return;
    }
    if (!state.selectedItems.length) {
      setStatus("请先在 Eagle 中选择要分析的素材。");
      return;
    }
    const settings = readSettings();
    const model = settings.enabledBackends.includes("eagle") ? getAiModel() : null;
    if (!await ensureHealthyBeforeAnalysis(settings, model)) return;
    const usableBackends = getUsableBackends(settings, model);
    if (!usableBackends.length) {
      setStatus("没有可用 AI 后端：请启用 Claude/Codex CLI，或配置 Eagle 默认视觉模型。");
      return;
    }
    settings.enabledBackends = usableBackends;
    if (!ensureDiagnosticSettings(settings)) return;
    const existingResults = new Map(state.results.map((result) => [result.id, result]));
    const hasPendingResults = state.results.some((result) => result.status === "pending");
    const itemsToAnalyze = hasPendingResults
      ? state.selectedItems.filter((item) => {
        const result = existingResults.get(getItemId(item));
        return result && result.status === "pending";
      })
      : state.selectedItems;
    if (!itemsToAnalyze.length) {
      setStatus("没有待分析的素材。如需重跑单个素材，请点击结果里的“重新分析”。");
      return;
    }
    state.running = true;
    state.pauseRequested = false;
    state.paused = false;
    let processed = 0;
    updateAnalysisProgress(processed, itemsToAnalyze.length, itemsToAnalyze[0]);
    if (!hasPendingResults) {
      state.results = state.selectedItems.map((item) => createPendingResult(item));
      resetWriteProgress();
      saveResultsState();
    }
    renderAll();
    setControlsBusy(true);

    try {
      await runWithConcurrency(itemsToAnalyze, settings.concurrency, async (item) => {
        const current = state.results.find((result) => result.id === getItemId(item));
        try {
          if (!current) return;
          updateAnalysisProgress(processed, itemsToAnalyze.length, item);
          updateResult(current.id, { status: "running", message: "分析中" });
          if (settings.skipTagged && Array.isArray(item.tags) && item.tags.length) {
            updateResult(current.id, { status: "skipped", message: "已有标签，已跳过" });
            return;
          }
          const result = await analyzeItem(item, model, allowedTags, settings);
          updateResult(current.id, result);
        } catch (error) {
          updateResult(current.id, {
            status: "failed",
            message: formatError(error),
            errorType: classifyError(error),
            diagnosticPath: error && error.diagnosticPath ? error.diagnosticPath : current.diagnosticPath,
            diagnostics: error && error.diagnostics ? error.diagnostics : current.diagnostics,
            tags: [],
            reviewTags: [],
            autoTags: [],
            filteredTags: []
          });
        } finally {
          processed += 1;
          updateAnalysisProgress(processed, itemsToAnalyze.length, item);
        }
      });
    } finally {
      const paused = state.pauseRequested;
      state.running = false;
      state.pauseRequested = false;
      state.paused = paused && state.results.some((result) => result.status === "pending");
      setControlsBusy(false);
      renderAll();
      setStatus(state.paused ? "已暂停。点击“继续”处理剩余素材，或点击“重新开始”重跑当前批次。" : "分析完成。");
    }
  }

  function pauseAnalysis() {
    if (!state.running) return;
    state.pauseRequested = true;
    els.pauseBtn.disabled = true;
    setStatus("正在暂停：当前正在分析的素材完成后停止，不再派发新素材。");
  }

  async function continueAnalysis() {
    if (state.running) return;
    state.paused = false;
    await analyzeSelected();
  }

  async function restartAnalysis() {
    if (state.running) return;
    state.paused = false;
    state.pauseRequested = false;
    state.results = [];
    renderAll();
    await analyzeSelected();
  }

  async function analyzeItem(item, model, allowedTags, settings) {
    const media = await prepareMedia(item, settings);
    let diagnosticPath = "";
    let diagnostics = null;
    try {
      const savedDiagnostics = saveDiagnostics(item, media, settings);
      diagnosticPath = savedDiagnostics.path;
      diagnostics = savedDiagnostics.diagnostics;
      const object = await requestAiTagsWithRetry(item, model, allowedTags, settings, media);
      const candidates = normalizeTagCandidates(Array.isArray(object.tags) ? object.tags : [], object.confidence);
      const allowed = new Set(allowedTags);
      const filteredTags = candidates.filter((tag) => !allowed.has(tag.name)).map((tag) => tag.name);
      const allowedCandidates = candidates
        .filter((tag) => allowed.has(tag.name))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, settings.maxTags);
      const highConfidenceTags = allowedCandidates.filter((tag) => tag.confidence >= settings.autoConfidence);
      const autoWriteEnabled = settings.autoApplyHighConfidence && !settings.previewBeforeWrite;
      const autoTags = autoWriteEnabled ? highConfidenceTags : [];
      const reviewTags = allowedCandidates
        .filter((tag) => tag.confidence >= settings.hideConfidence && (!autoWriteEnabled || tag.confidence < settings.autoConfidence))
        .map((tag) => ({ ...tag, selected: true }));
      const hiddenCount = allowedCandidates.filter((tag) => tag.confidence < settings.hideConfidence).length;
      let autoSaved = false;
      if (autoTags.length && typeof item.save === "function" && !item.external) {
        await mergeTagsIntoItem(item, autoTags.map((tag) => tag.name), settings.writeAnnotation ? object.reason : "", "自动写入高置信标签");
        autoSaved = true;
      }
      const tags = reviewTags.map((tag) => tag.name);
      const messageParts = [];
      if (object.backend) messageParts.push(`后端：${formatBackendLabel(object.backend)}`);
      if (autoTags.length) messageParts.push(autoSaved ? `已自动写入 ${autoTags.length} 个高置信标签` : `${autoTags.length} 个高置信标签待写入`);
      if (!autoWriteEnabled && highConfidenceTags.length) messageParts.push(`${highConfidenceTags.length} 个高置信标签待确认`);
      if (reviewTags.length) messageParts.push(`${reviewTags.length} 个标签需要确认`);
      if (hiddenCount) messageParts.push(`${hiddenCount} 个低置信标签已隐藏`);
      return {
        status: reviewTags.length ? "ready" : (autoTags.length ? "applied" : "failed"),
        message: messageParts.length ? `${messageParts.join("，")}。${object.reason || ""}` : "AI 未返回达到置信度门槛的标签",
        tags,
        autoTags,
        reviewTags,
        filteredTags,
        hiddenCount,
        aiReason: object.reason || "",
        aiBackend: object.backend || "",
        frameCount: media.frameCount,
        requestCount: object.__requestPlan ? object.__requestPlan.requestCount : 0,
        mediaChunkCount: object.__requestPlan ? object.__requestPlan.mediaChunkCount : 0,
        tagChunkCount: object.__requestPlan ? object.__requestPlan.tagChunkCount : 0,
        diagnosticPath,
        diagnostics,
        confidence: clampNumber(object.confidence, 0, 1, 0)
      };
    } catch (error) {
      if (diagnosticPath) error.diagnosticPath = diagnosticPath;
      if (diagnostics) error.diagnostics = diagnostics;
      throw error;
    } finally {
      await cleanupMedia(media);
    }
  }

  async function requestAiTagsWithRetry(item, model, allowedTags, settings, media) {
    let lastError = null;
    const retryCount = clampNumber(settings.aiRetryCount, 0, 10, AI_RETRY_COUNT);
    for (let attempt = 0; attempt <= retryCount; attempt += 1) {
      try {
        return await requestAiTags(item, model, allowedTags, settings, media);
      } catch (error) {
        lastError = error;
        if (attempt >= retryCount || !isRetryableAiError(error)) break;
        await delay(AI_RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
      }
    }
    throw new Error(`AI 请求失败，已重试 ${retryCount} 次：${formatError(lastError)}`);
  }

  async function requestAiTags(item, model, allowedTags, settings, media) {
    const plan = buildAiRequestPlan(item, allowedTags, settings, media);
    if (plan.requestCount > 1) {
      const message = `AI 请求将分为 ${plan.requestCount} 次：图片组 ${plan.mediaChunkCount}，标签组 ${plan.maxTagChunkCount}。`;
      setStatus(message);
      updateResult(getItemId(item), {
        message,
        requestCount: plan.requestCount,
        mediaChunkCount: plan.mediaChunkCount,
        tagChunkCount: plan.maxTagChunkCount
      });
    }
    const objects = [];
    for (let index = 0; index < plan.requests.length; index += 1) {
      if (state.pauseRequested) throw new Error("分析已暂停");
      const request = plan.requests[index];
      const object = await requestAiTagsSingle(item, model, request.allowedTags, settings, request.media, {
        ...request.chunkInfo,
        chunkIndex: index,
        chunkCount: plan.requestCount
      });
      object.__allowedTags = request.allowedTags;
      object.__chunkInfo = request.chunkInfo;
      objects.push(object);
    }
    const merged = mergeAiObjects(objects, plan.requestCount > 1 ? Math.max(settings.maxTags * 3, settings.maxTags + 12) : settings.maxTags);
    merged.__requestPlan = {
      requestCount: plan.requestCount,
      mediaChunkCount: plan.mediaChunkCount,
      tagChunkCount: plan.maxTagChunkCount
    };
    return merged;
  }

  async function requestAiTagsSingle(item, model, allowedTags, settings, media, chunkInfo = {}) {
    const cliBackendsToTry = settings.enabledBackends.filter((backend) => backend !== "eagle");
    let cliError = null;
    if (cliBackendsToTry.length) {
      try {
        return await requestCliTags(item, cliBackendsToTry, allowedTags, settings, media, chunkInfo);
      } catch (error) {
        cliError = error;
        if (!settings.enabledBackends.includes("eagle")) throw error;
      }
    }
    if (!settings.enabledBackends.includes("eagle")) {
      throw cliError || new Error("没有启用可用的 AI 后端");
    }
    if (!model) {
      throw cliError || new Error("未配置默认视觉模型，请先打开 AI 设置。");
    }
    return requestEagleAiTags(item, model, allowedTags, settings, media, chunkInfo);
  }

  async function requestCliTags(item, backends, allowedTags, settings, media, chunkInfo = {}) {
    if (!cliBackends || !cp || typeof cp.execFile !== "function") {
      throw new Error("当前 Eagle 插件环境无法调用本地 CLI");
    }
    const imagePaths = Array.isArray(media.filePaths) && media.filePaths.length
      ? media.filePaths
      : media.images.map(fileUrlToPath).filter(Boolean);
    const prompt = cliBackends.createAnalysisPrompt({
      itemName: getItemName(item),
      includeTitleInPrompt: settings.includeTitleInPrompt,
      mediaKind: media.kind,
      frameCount: media.frameCount,
      allowedTags,
      maxTags: settings.maxTags,
      globalPrompt: settings.globalPrompt,
      imagePaths,
      chunkInfo
    });
    const result = await cliBackends.runCliBackends({
      backends,
      settings: {
        ...settings,
        cliWorkingDir: settings.cliWorkingDir || getDefaultCliWorkingDir(item, imagePaths)
      },
      prompt,
      imagePaths,
      fs,
      path,
      env: typeof process !== "undefined" ? process.env : undefined,
      execFile: cp.execFile,
      spawn: cp.spawn
    });
    return {
      ...result.object,
      backend: result.backend,
      backendFailures: result.failures
    };
  }

  async function requestEagleAiTags(item, model, allowedTags, settings, media, chunkInfo = {}) {
    const ai = eagle.extraModule.ai;
    const messages = [
      {
        role: "system",
        content: buildSystemPrompt(allowedTags, settings.maxTags, settings.globalPrompt, chunkInfo)
      },
      {
        role: "user",
        content: [
          { type: "text", text: buildUserPrompt(item, media.kind, media.frameCount, settings, chunkInfo) },
          ...media.images.map((image) => ({ type: "image", image }))
        ]
      }
    ];
    if (typeof ai.generateText !== "function") {
      throw new Error("当前 AI SDK 没有 generateText()，请更新 Eagle AI 模型套件");
    }
    const response = await ai.generateText({
      model,
      messages
    });
    const text = typeof response === "string" ? response : response && response.text;
    return {
      ...parseAiJson(text),
      backend: "eagle"
    };
  }

  function buildSystemPrompt(allowedTags, maxTags, globalPrompt, chunkInfo = {}) {
    const promptParts = [
      "你是游戏视觉特效素材标签管理员。",
      "只能从给定标签池中选择标签，禁止创造新标签，禁止输出不在标签池里的同义词。",
      `每个素材最多选择 ${maxTags} 个最有检索价值的标签。`,
      "优先判断特效类型、元素属性、颜色、用途、风格。",
      "如果是视频或动图，请综合多帧动作变化判断，不要只看首帧。",
      "必须只输出 JSON，不要输出 Markdown，不要使用代码块。",
      "每个标签都必须给出 0 到 1 的 confidence，表示你对该标签适合此素材的把握。",
      "JSON 格式：{\"tags\":[{\"name\":\"标签1\",\"confidence\":0.92},{\"name\":\"标签2\",\"confidence\":0.66}],\"confidence\":0.8,\"reason\":\"简短原因\"}",
      `标签池：${allowedTags.join("、")}`
    ];
    if (chunkInfo.chunkCount > 1) {
      const parts = [`这是 AI 请求分块 ${chunkInfo.chunkIndex + 1}/${chunkInfo.chunkCount}`];
      if (chunkInfo.mediaChunkCount > 1) parts.push(`图片组 ${chunkInfo.mediaChunkIndex + 1}/${chunkInfo.mediaChunkCount}`);
      if (chunkInfo.tagChunkCount > 1) parts.push(`标签池组 ${chunkInfo.tagChunkIndex + 1}/${chunkInfo.tagChunkCount}`);
      promptParts.splice(2, 0, `${parts.join("，")}。只从本次请求给出的标签池中选择；最终结果会由插件合并。`);
    }
    const customPrompt = String(globalPrompt || "").trim();
    if (customPrompt) {
      promptParts.splice(5, 0, `用户全局分析偏好：\n${customPrompt}`, "用户全局分析偏好不能覆盖标签池、JSON 格式和置信度要求。");
    }
    return promptParts.join("\n");
  }

  function buildUserPrompt(item, kind, frameCount, settings = {}, chunkInfo = {}) {
    const name = settings.includeTitleInPrompt ? `素材“${getItemName(item)}”` : "这个素材";
    const mediaPart = chunkInfo.mediaChunkCount > 1
      ? `这是第 ${chunkInfo.mediaChunkIndex + 1}/${chunkInfo.mediaChunkCount} 组图片，本组包含 ${frameCount} 张。`
      : "";
    if (kind === "animated" || kind === "video") {
      return `请分析${name}。这是${kind === "video" ? "视频" : "动图"}抽取出的 ${frameCount} 张代表帧。${mediaPart}请根据可见动作变化返回标签。`;
    }
    return `请分析${name}的视觉内容并返回标签。${mediaPart}`;
  }

  function buildAiRequestPlan(item, allowedTags, settings, media) {
    const mediaChunks = buildMediaChunks(item, allowedTags, settings, media);
    const requests = [];
    let maxTagChunkCount = 1;
    mediaChunks.forEach((mediaChunk, mediaChunkIndex) => {
      const mediaChunkInfo = {
        mediaChunkIndex,
        mediaChunkCount: mediaChunks.length
      };
      const tagChunks = buildAllowedTagChunks(item, allowedTags, settings, mediaChunk, mediaChunkInfo);
      maxTagChunkCount = Math.max(maxTagChunkCount, tagChunks.length);
      tagChunks.forEach((tagChunk, tagChunkIndex) => {
        requests.push({
          media: mediaChunk,
          allowedTags: tagChunk,
          chunkInfo: {
            mediaChunkIndex,
            mediaChunkCount: mediaChunks.length,
            tagChunkIndex,
            tagChunkCount: tagChunks.length
          }
        });
      });
    });
    return {
      requests,
      requestCount: requests.length,
      mediaChunkCount: mediaChunks.length,
      maxTagChunkCount
    };
  }

  function buildMediaChunks(item, allowedTags, settings, media) {
    const images = Array.isArray(media.images) ? media.images : [];
    const filePaths = Array.isArray(media.filePaths) ? media.filePaths : [];
    if (images.length <= 1) return [media];
    const tokenLimit = getRequestTokenLimit(settings);
    const baseTokens = estimateBasePromptTokens(item, settings, media, { mediaChunkIndex: 0, mediaChunkCount: 1 });
    const sampleTagTokens = estimateSampleTagBudget(allowedTags);
    const imageBudget = Math.max(
      ESTIMATED_IMAGE_TOKENS,
      tokenLimit - baseTokens - sampleTagTokens - REQUEST_SAFETY_TOKENS
    );
    const maxImagesPerRequest = Math.max(1, Math.floor(imageBudget / ESTIMATED_IMAGE_TOKENS));
    if (images.length <= maxImagesPerRequest) return [media];
    const chunks = [];
    for (let start = 0; start < images.length; start += maxImagesPerRequest) {
      const chunkImages = images.slice(start, start + maxImagesPerRequest);
      chunks.push({
        ...media,
        images: chunkImages,
        filePaths: filePaths.slice(start, start + maxImagesPerRequest),
        frameCount: chunkImages.length,
        totalFrameCount: media.frameCount,
        frameStartIndex: start
      });
    }
    return chunks;
  }

  function buildAllowedTagChunks(item, allowedTags, settings, media, mediaChunkInfo = {}) {
    const tokenLimit = getRequestTokenLimit(settings);
    const imageTokens = estimateImageTokens(media);
    const baseTokens = estimateBasePromptTokens(item, settings, media, mediaChunkInfo);
    const tagBudget = Math.max(
      MIN_TAG_BUDGET_TOKENS,
      tokenLimit - baseTokens - imageTokens - REQUEST_SAFETY_TOKENS
    );
    const chunks = [];
    let current = [];
    let currentTokens = 0;
    allowedTags.forEach((tag) => {
      const tagTokens = estimateTextTokens(tag) + 2;
      if (current.length && currentTokens + tagTokens > tagBudget) {
        chunks.push(current);
        current = [];
        currentTokens = 0;
      }
      current.push(tag);
      currentTokens += tagTokens;
    });
    if (current.length) chunks.push(current);
    return chunks.length ? chunks : [allowedTags];
  }

  function estimateBasePromptTokens(item, settings, media, mediaChunkInfo = {}) {
    return estimateTextTokens(
      buildSystemPrompt([], settings.maxTags, settings.globalPrompt, { chunkIndex: 0, chunkCount: 1, ...mediaChunkInfo }) +
      "\n" +
      buildUserPrompt(item, media.kind, media.frameCount, settings, mediaChunkInfo)
    );
  }

  function estimateImageTokens(media) {
    const count = Array.isArray(media.images) ? media.images.length : 0;
    return count * ESTIMATED_IMAGE_TOKENS;
  }

  function estimateSampleTagBudget(allowedTags) {
    if (!Array.isArray(allowedTags) || !allowedTags.length) return MIN_TAG_BUDGET_TOKENS;
    const sampleTokens = allowedTags
      .slice(0, Math.min(allowedTags.length, 120))
      .reduce((sum, tag) => sum + estimateTextTokens(tag) + 2, 0);
    return Math.max(MIN_TAG_BUDGET_TOKENS, Math.min(sampleTokens, MIN_TAG_BUDGET_TOKENS * 2));
  }

  function getRequestTokenLimit(settings) {
    return Math.max(MIN_REQUEST_CHUNK_K, Math.min(MAX_REQUEST_CHUNK_K, settings.requestChunkK || DEFAULT_REQUEST_CHUNK_K)) * 1024;
  }

  function mergeAiObjects(objects, maxTags) {
    const byName = new Map();
    const reasons = [];
    let confidenceTotal = 0;
    let confidenceCount = 0;
    const backends = new Set();
    objects.forEach((object) => {
      if (!object || typeof object !== "object") return;
      if (object.backend) backends.add(object.backend);
      if (object.reason) reasons.push(object.reason);
      const confidence = normalizeConfidenceValue(object.confidence, NaN);
      if (Number.isFinite(confidence)) {
        confidenceTotal += confidence;
        confidenceCount += 1;
      }
      normalizeTagCandidates(Array.isArray(object.tags) ? object.tags : [], object.confidence).forEach((tag) => {
        const existing = byName.get(tag.name);
        if (!existing || tag.confidence > existing.confidence) byName.set(tag.name, tag);
      });
    });
    return {
      tags: [...byName.values()].sort((a, b) => b.confidence - a.confidence).slice(0, maxTags),
      confidence: confidenceCount ? confidenceTotal / confidenceCount : 0.5,
      reason: dedupeReasonParts(reasons).join("；"),
      backend: [...backends].join(" + ")
    };
  }

  function dedupeReasonParts(parts) {
    const seen = new Set();
    const output = [];
    parts.forEach((part) => {
      const text = String(part || "").trim();
      if (!text || seen.has(text)) return;
      seen.add(text);
      output.push(text);
    });
    return output;
  }

  async function prepareMedia(item, settings) {
    const sourcePath = getItemFilePath(item);
    const ext = getItemExt(item, sourcePath);
    if (!sourcePath && !getItemPreviewPath(item)) {
      throw new Error("找不到原文件或预览图路径");
    }
    if (ext === "png" && await isAnimatedPng(sourcePath)) {
      return extractFramesMedia(sourcePath, "animated", settings.maxAnimatedFrames, settings);
    }
    if (STATIC_IMAGE_EXTS.has(ext)) {
      return singleImageMedia(sourcePath || getItemPreviewPath(item), "image");
    }
    if (ext === WEBP_EXT) {
      const animated = await isAnimatedWebp(sourcePath);
      return animated ? extractFramesMedia(sourcePath, "animated", settings.maxAnimatedFrames, settings) : singleImageMedia(sourcePath, "image");
    }
    if (ANIMATED_EXTS.has(ext)) {
      return extractFramesMedia(sourcePath, "animated", settings.maxAnimatedFrames, settings);
    }
    if (VIDEO_EXTS.has(ext)) {
      return extractFramesMedia(sourcePath, "video", settings.maxVideoFrames, settings);
    }
    if (PREVIEW_EXTS.has(ext)) {
      const preview = getItemPreviewPath(item);
      if (!preview) throw new Error("该设计文件没有可用预览图");
      return singleImageMedia(preview, "preview");
    }
    throw new Error(`暂不支持该文件格式：${ext || "未知"}`);
  }

  function singleImageMedia(filePath, kind) {
    return {
      kind,
      images: [toFileUrl(filePath)],
      filePaths: [filePath],
      frameCount: 1,
      tempDir: null,
      sourcePath: filePath,
      previewPath: ""
    };
  }

  async function extractFramesMedia(sourcePath, kind, maxFrames, settings) {
    if (!sourcePath) throw new Error("找不到可抽帧的原文件路径");
    if (!fs || !os || !path || !cp) throw new Error("当前插件环境缺少 Node.js 能力，无法抽帧");
    const ffmpegPaths = await getFfmpegPaths();
    if (!ffmpegPaths.ffmpeg || !ffmpegPaths.ffprobe) throw new Error("未检测到 Eagle FFmpeg 扩展");
    const duration = await probeDuration(sourcePath);
    const times = computeFrameTimes(duration, settings.frameStepSeconds, maxFrames, settings.skipStart, settings.skipEnd);
    if (!times.length) throw new Error("无法计算抽帧时间点");
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vfx-ai-tagger-"));
    const frames = [];
    for (let index = 0; index < times.length; index += 1) {
      const output = path.join(tempDir, `frame-${String(index + 1).padStart(3, "0")}.jpg`);
      await runFfmpegExtract(ffmpegPaths.ffmpeg, sourcePath, output, times[index]);
      if (fs.existsSync(output)) frames.push(output);
    }
    if (!frames.length) throw new Error("抽帧失败，没有生成可分析图片");
    return {
      kind,
      images: frames.map(toFileUrl),
      filePaths: frames,
      frameCount: frames.length,
      tempDir,
      sourcePath,
      previewPath: ""
    };
  }

  function saveDiagnostics(item, media, settings) {
    const diagnostics = buildDiagnostics(item, media, "");
    if (!settings.diagnosticEnabled) return { path: "", diagnostics };
    if (!fs || !path) throw new Error("当前插件环境缺少 Node.js 能力，无法保存诊断");
    if (!settings.diagnosticDir) throw new Error("已开启诊断保存，请先选择诊断保存文件夹");
    const targetDir = path.join(settings.diagnosticDir, `${Date.now()}-${safeFileName(getItemName(item))}`);
    fs.mkdirSync(targetDir, { recursive: true });
    diagnostics.images.forEach((image, index) => {
      if (!image.exists || !image.path) return;
      const ext = path.extname(image.path) || ".jpg";
      const dest = path.join(targetDir, `frame-${String(index + 1).padStart(3, "0")}${ext}`);
      fs.copyFileSync(image.path, dest);
      image.path = dest;
      image.url = toFileUrl(dest);
      image.previewUrl = image.url;
      image.size = getFileSize(dest);
    });
    diagnostics.diagnosticPath = targetDir;
    fs.writeFileSync(path.join(targetDir, "diagnostic.json"), JSON.stringify(diagnostics, null, 2), "utf8");
    return { path: targetDir, diagnostics };
  }

  function buildDiagnostics(item, media, diagnosticPath) {
    const sourcePath = media.sourcePath || getItemFilePath(item);
    const previewPath = media.previewPath || getItemPreviewPath(item);
    const images = (media.images || []).map((image, index) => {
      const imagePath = fileUrlToPath(image);
      const exists = Boolean(imagePath && fs && fs.existsSync(imagePath));
      return {
        path: imagePath,
        url: image,
        previewUrl: createDiagnosticPreviewUrl(imagePath, index),
        exists,
        size: exists ? getFileSize(imagePath) : 0
      };
    });
    return { sourcePath, previewPath, diagnosticPath, images };
  }

  function getFfmpegApi() {
    return window.eagle && eagle.extraModule && (eagle.extraModule.ffmpeg || eagle.extraModule.FFmpeg);
  }

  async function getFfmpegPaths() {
    const ffmpeg = getFfmpegApi();
    if (!ffmpeg) throw new Error("未检测到 Eagle FFmpeg 扩展");
    if (typeof ffmpeg.isInstalled === "function") {
      const installed = await ffmpeg.isInstalled();
      if (!installed) {
        if (typeof ffmpeg.install === "function") await ffmpeg.install();
        throw new Error("需要先安装 Eagle FFmpeg 依赖插件");
      }
    } else if (ffmpeg.isInstalled === false) {
      if (typeof ffmpeg.install === "function") await ffmpeg.install();
      throw new Error("需要先安装 Eagle FFmpeg 依赖插件");
    }
    if (typeof ffmpeg.getPaths === "function") {
      return await ffmpeg.getPaths();
    }
    if (ffmpeg.paths) {
      return ffmpeg.paths;
    }
    throw new Error("无法读取 FFmpeg 路径");
  }

  async function probeDuration(sourcePath) {
    const ffmpegPaths = await getFfmpegPaths();
    if (!ffmpegPaths.ffprobe) throw new Error("无法读取 ffprobe 路径");
    if (!cp) throw new Error("无法调用 ffprobe");
    return new Promise((resolve, reject) => {
      cp.execFile(ffmpegPaths.ffprobe, ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", sourcePath], (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        const duration = Number(String(stdout).trim());
        duration > 0 ? resolve(duration) : reject(new Error("无法读取媒体时长"));
      });
    });
  }

  async function runFfmpegExtract(ffmpegBinary, sourcePath, outputPath, second) {
    const args = ["-y", "-ss", String(second), "-i", sourcePath, "-frames:v", "1", "-q:v", "2", outputPath];
    return new Promise((resolve, reject) => {
      cp.execFile(ffmpegBinary, args, (error) => error ? reject(error) : resolve());
    });
  }

  async function isAnimatedWebp(filePath) {
    if (!filePath || !fs) return false;
    try {
      const fd = fs.openSync(filePath, "r");
      const buffer = Buffer.alloc(Math.min(2048, fs.statSync(filePath).size));
      fs.readSync(fd, buffer, 0, buffer.length, 0);
      fs.closeSync(fd);
      return buffer.includes(Buffer.from("ANIM"));
    } catch (error) {
      return false;
    }
  }

  async function isAnimatedPng(filePath) {
    if (!filePath || !fs) return false;
    try {
      const fd = fs.openSync(filePath, "r");
      const buffer = Buffer.alloc(Math.min(4096, fs.statSync(filePath).size));
      fs.readSync(fd, buffer, 0, buffer.length, 0);
      fs.closeSync(fd);
      return buffer.includes(Buffer.from("acTL"));
    } catch (error) {
      return false;
    }
  }

  function computeFrameTimes(duration, stepSeconds, maxFrames, skipStart, skipEnd) {
    const start = clampNumber(skipStart, 0, duration, 0);
    const end = Math.max(start, duration - clampNumber(skipEnd, 0, duration, 0));
    const usable = Math.max(0.05, end - start);
    const cappedMax = Math.max(1, Math.min(120, Math.floor(maxFrames)));
    const step = clampNumber(stepSeconds, 0.125, 3, 1);
    const estimated = Math.max(1, Math.floor(usable / step) + 1);
    const count = Math.min(cappedMax, estimated);
    if (count === 1) return [roundTime(start + usable / 2)];
    const interval = usable / (count - 1);
    const times = [];
    for (let index = 0; index < count; index += 1) {
      times.push(roundTime(Math.min(end, start + interval * index)));
    }
    return [...new Set(times)];
  }

  async function cleanupMedia(media) {
    if (!media || !media.tempDir || !fs) return;
    try {
      fs.rmSync(media.tempDir, { recursive: true, force: true });
    } catch (error) {
      setStatus(`临时抽帧目录清理失败：${formatError(error)}`);
    }
  }

  async function applyReadyResults() {
    if (state.writing) return;
    const ready = state.results.filter((result) => result.status === "ready" && getSelectedReviewTags(result).length);
    if (!ready.length) {
      resetWriteProgress();
      setStatus("没有可写入的分析结果。");
      return;
    }
    state.writing = true;
    els.applyBtn.disabled = true;
    updateWriteProgress(0, ready.length, 0);
    let saved = 0;
    let failed = 0;
    try {
      const settings = readSettings();
      for (const result of ready) {
        updateWriteProgress(saved + failed, ready.length, failed);
        const item = state.selectedItems.find((candidate) => getItemId(candidate) === result.id);
        if (!item) {
          failed += 1;
          updateResult(result.id, { status: "ready", message: "找不到对应素材，请重新导入当前选中素材后再试", errorType: "write" });
          updateWriteProgress(saved + failed, ready.length, failed);
          continue;
        }
        if (item.external || typeof item.save !== "function") {
          failed += 1;
          updateResult(result.id, { status: "ready", message: "外部导入文件无法写回 Eagle，请先把文件加入 Eagle 资源库", errorType: "write" });
          updateWriteProgress(saved + failed, ready.length, failed);
          continue;
        }
        try {
          await mergeTagsIntoItem(item, getSelectedReviewTags(result).map((tag) => tag.name), settings.writeAnnotation ? result.aiReason : "", "手动确认写入标签");
          saved += 1;
          updateResult(result.id, { status: "applied", message: "已写入 Eagle", errorType: "" });
        } catch (error) {
          failed += 1;
          updateResult(result.id, { status: "ready", message: `写入失败：${formatError(error)}`, errorType: "write" });
        }
        updateWriteProgress(saved + failed, ready.length, failed);
      }
    } finally {
      state.writing = false;
      renderAll();
    }
    const finalStatus = failed ? `已写入 ${saved} 个素材，${failed} 个写入失败。` : `已写入 ${saved} 个素材。`;
    setStatus(finalStatus);
    updateWriteProgress(saved + failed, ready.length, failed, finalStatus);
  }

  function updateAnalysisProgress(processed, total, currentItem) {
    if (!els.analysisProgressPanel || !els.analysisProgressBar) return;
    const safeTotal = Math.max(0, Number(total) || 0);
    if (!safeTotal) {
      resetAnalysisProgress();
      return;
    }
    const safeDone = Math.min(safeTotal, Math.max(0, Number(processed) || 0));
    const percent = Math.round((safeDone / safeTotal) * 100);
    const counts = getAnalysisProgressCounts();
    const currentName = currentItem ? getItemName(currentItem) : "";
    els.analysisProgressPanel.hidden = false;
    els.analysisProgressText.textContent = safeDone >= safeTotal ? `分析完成 ${safeDone}/${safeTotal}` : `分析中 ${safeDone}/${safeTotal}`;
    els.analysisProgressPercent.textContent = `${percent}%`;
    els.analysisProgressBar.style.width = `${percent}%`;
    const track = els.analysisProgressPanel.querySelector(".analysis-progress-track");
    if (track) track.setAttribute("aria-valuenow", String(percent));
    els.analysisProgressMeta.textContent = [
      currentName && safeDone < safeTotal ? `当前：${currentName}` : "",
      `待写入 ${counts.ready}`,
      `已写入 ${counts.applied}`,
      `失败 ${counts.failed}`,
      `跳过 ${counts.skipped}`
    ].filter(Boolean).join(" · ");
  }

  function resetAnalysisProgress() {
    if (!els.analysisProgressPanel || !els.analysisProgressBar) return;
    els.analysisProgressPanel.hidden = true;
    els.analysisProgressText.textContent = "等待分析";
    els.analysisProgressPercent.textContent = "0%";
    els.analysisProgressBar.style.width = "0%";
    if (els.analysisProgressMeta) els.analysisProgressMeta.textContent = "";
    const track = els.analysisProgressPanel.querySelector(".analysis-progress-track");
    if (track) track.setAttribute("aria-valuenow", "0");
  }

  function getAnalysisProgressCounts() {
    return state.results.reduce((counts, result) => {
      if (result.status === "ready") counts.ready += 1;
      if (result.status === "applied") counts.applied += 1;
      if (result.status === "failed") counts.failed += 1;
      if (result.status === "skipped") counts.skipped += 1;
      return counts;
    }, { ready: 0, applied: 0, failed: 0, skipped: 0 });
  }

  function updateWriteProgress(done, total, failed = 0, message = "") {
    if (!els.writeProgressPanel || !els.writeProgressBar) return;
    const safeTotal = Math.max(0, Number(total) || 0);
    const safeDone = Math.min(safeTotal, Math.max(0, Number(done) || 0));
    const percent = safeTotal ? Math.round((safeDone / safeTotal) * 100) : 0;
    const text = message || `正在写入 ${safeDone}/${safeTotal} 个素材...`;
    els.writeProgressPanel.hidden = false;
    els.writeProgressPanel.classList.toggle("has-failures", failed > 0);
    els.writeProgressText.textContent = text;
    els.writeProgressPercent.textContent = `${percent}%`;
    els.writeProgressBar.style.width = `${percent}%`;
    const track = els.writeProgressPanel.querySelector(".write-progress-track");
    if (track) track.setAttribute("aria-valuenow", String(percent));
    if (els.writeProgressMeta) els.writeProgressMeta.textContent = failed ? `${safeDone}/${safeTotal}，失败 ${failed}` : `${safeDone}/${safeTotal}`;
    if (!message) setStatus(text);
  }

  function resetWriteProgress() {
    if (!els.writeProgressPanel || !els.writeProgressBar) return;
    els.writeProgressPanel.hidden = true;
    els.writeProgressPanel.classList.remove("has-failures");
    els.writeProgressText.textContent = "";
    els.writeProgressPercent.textContent = "0%";
    els.writeProgressBar.style.width = "0%";
    if (els.writeProgressMeta) els.writeProgressMeta.textContent = "";
    const track = els.writeProgressPanel.querySelector(".write-progress-track");
    if (track) track.setAttribute("aria-valuenow", "0");
  }

  function readSettings() {
    const frequency = clampAndShowFrameRate();
    const maxTags = readInt(els.maxTags.value, 10, 1, 20);
    const aiRetryCount = readInt(els.aiRetryCount.value, AI_RETRY_COUNT, 0, 10);
    const requestChunkK = readInt(els.requestChunkK.value, DEFAULT_REQUEST_CHUNK_K, MIN_REQUEST_CHUNK_K, MAX_REQUEST_CHUNK_K);
    const autoConfidence = readFloat(els.autoConfidence.value, 0.8, 0, 1);
    const hideConfidence = Math.min(autoConfidence, readFloat(els.hideConfidence.value, 0.45, 0, 1));
    els.aiRetryCount.value = String(aiRetryCount);
    els.requestChunkK.value = String(requestChunkK);
    els.autoConfidence.value = String(autoConfidence);
    els.hideConfidence.value = String(hideConfidence);
    return {
      maxTags,
      concurrency: readInt(els.concurrency.value, 2, 1, 5),
      aiRetryCount,
      requestChunkK,
      autoConfidence,
      hideConfidence,
      frameStepSeconds: frequency.stepSeconds,
      maxVideoFrames: readInt(els.maxVideoFrames.value, 60, 1, 120),
      maxAnimatedFrames: readInt(els.maxAnimatedFrames.value, 24, 1, 120),
      skipStart: readFloat(els.skipStart.value, 0.2, 0, 10),
      skipEnd: readFloat(els.skipEnd.value, 0.2, 0, 10),
      skipTagged: els.skipTagged.checked,
      previewBeforeWrite: els.previewBeforeWrite.checked,
      autoApplyHighConfidence: els.autoApplyHighConfidence.checked,
      globalPrompt: String(els.globalPrompt.value || "").trim(),
      writeAnnotation: els.writeAnnotation.checked,
      includeTitleInPrompt: els.includeTitleInPrompt.checked,
      diagnosticEnabled: els.diagnosticEnabled.checked,
      diagnosticDir: String(els.diagnosticDir.value || "").trim(),
      enabledBackends: [
        ...(els.enableClaudeCli.checked ? ["claude"] : []),
        ...(els.enableCodexCli.checked ? ["codex"] : []),
        ...(els.enableEagleAi.checked ? ["eagle"] : [])
      ],
      claudeCommand: String(els.claudeCommand.value || "claude").trim() || "claude",
      claudeExtraArgs: String(els.claudeExtraArgs.value || "").trim(),
      codexCommand: String(els.codexCommand.value || "codex").trim() || "codex",
      codexModel: String(els.codexModel.value || "").trim(),
      codexExtraArgs: String(els.codexExtraArgs.value || "").trim(),
      cliTimeoutSeconds: readInt(els.cliTimeoutSeconds.value, 120, 10, 600),
      cliWorkingDir: String(els.cliWorkingDir.value || "").trim(),
      analysisPresetName: state.activePresetName
    };
  }

  function applyAnalysisPreset(name) {
    const presetName = String(name || "").trim();
    const preset = ANALYSIS_PRESETS[presetName];
    state.activePresetName = presetName;
    if (els.analysisPresetSelect) els.analysisPresetSelect.value = presetName;
    if (!preset) {
      saveSettings();
      renderPresetHint();
      return;
    }
    Object.keys(preset).forEach((key) => {
      if (!els[key]) return;
      if (els[key].type === "checkbox") {
        els[key].checked = Boolean(preset[key]);
      } else {
        els[key].value = String(preset[key]);
      }
    });
    clampAndShowFrameRate();
    saveSettings();
    refreshModelStatus();
    renderPresetHint();
    runHealthCheck({ silent: true });
    setStatus(`已应用分析预设：${presetName}`);
  }

  function renderPresetHint() {
    if (!els.presetHint) return;
    const presetName = state.activePresetName || "";
    if (!presetName) {
      els.presetHint.textContent = "预设只覆盖分析关键参数，不改全局提示词和诊断目录。";
      return;
    }
    els.presetHint.textContent = `当前预设：${presetName}。应用后会保存到下次打开。`;
  }

  function clampAndShowFrameRate() {
    let value = Number(els.frameRateValue.value);
    const unit = els.frameRateUnit.value;
    if (!Number.isFinite(value) || value <= 0) value = unit === "fps" ? 1 : 1;
    let stepSeconds = unit === "fps" ? 1 / value : value;
    stepSeconds = clampNumber(stepSeconds, 0.125, 3, 1);
    const clampedValue = unit === "fps" ? 1 / stepSeconds : stepSeconds;
    els.frameRateValue.value = String(roundTime(clampedValue));
    els.frameRateHint.textContent = `当前抽帧间隔约 ${roundTime(stepSeconds)} 秒，范围：最高 8 帧/秒，最低 3 秒/帧。`;
    return { stepSeconds };
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({
      tagGroupName: state.selectedTagGroupName || "__all",
      maxTags: els.maxTags.value,
      concurrency: els.concurrency.value,
      aiRetryCount: els.aiRetryCount.value,
      requestChunkK: els.requestChunkK.value,
      autoConfidence: els.autoConfidence.value,
      hideConfidence: els.hideConfidence.value,
      frameRateValue: els.frameRateValue.value,
      frameRateUnit: els.frameRateUnit.value,
      maxVideoFrames: els.maxVideoFrames.value,
      maxAnimatedFrames: els.maxAnimatedFrames.value,
      skipStart: els.skipStart.value,
      skipEnd: els.skipEnd.value,
      skipTagged: els.skipTagged.checked,
      previewBeforeWrite: els.previewBeforeWrite.checked,
      autoApplyHighConfidence: els.autoApplyHighConfidence.checked,
      globalPrompt: els.globalPrompt.value,
      writeAnnotation: els.writeAnnotation.checked,
      includeTitleInPrompt: els.includeTitleInPrompt.checked,
      diagnosticEnabled: els.diagnosticEnabled.checked,
      diagnosticDir: els.diagnosticDir.value,
      enableClaudeCli: els.enableClaudeCli.checked,
      enableCodexCli: els.enableCodexCli.checked,
      enableEagleAi: els.enableEagleAi.checked,
      claudeCommand: els.claudeCommand.value,
      claudeExtraArgs: els.claudeExtraArgs.value,
      codexCommand: els.codexCommand.value,
      codexModel: els.codexModel.value,
      codexExtraArgs: els.codexExtraArgs.value,
      cliTimeoutSeconds: els.cliTimeoutSeconds.value,
      cliWorkingDir: els.cliWorkingDir.value,
      activePresetName: state.activePresetName,
      analysisPresetName: state.activePresetName
    }));
  }

  async function chooseDiagnosticDir() {
    try {
      const folder = await openDirectoryPicker();
      if (!folder) {
        setStatus("当前环境无法打开文件夹选择器，请手动粘贴本地文件夹路径。");
        return;
      }
      els.diagnosticDir.value = folder;
      saveSettings();
    } catch (error) {
      setStatus(`选择诊断目录失败：${formatError(error)}`);
    }
  }

  async function runHealthCheck(options = {}) {
    const settings = options.settings || readSettings();
    const model = Object.prototype.hasOwnProperty.call(options, "model")
      ? options.model
      : (settings.enabledBackends.includes("eagle") ? getAiModel() : null);
    state.healthStatus = await buildHealthStatus(settings, model);
    renderHealthStatus();
    if (!options.silent) {
      const blockers = state.healthStatus.filter((check) => check.blocking && !check.ok);
      setStatus(blockers.length ? `环境检查发现 ${blockers.length} 个阻断项。` : "环境检查完成，未发现阻断项。");
    }
    return state.healthStatus;
  }

  async function ensureHealthyBeforeAnalysis(settings, model) {
    const checks = await runHealthCheck({ silent: true, settings, model });
    const blockers = checks.filter((check) => check.blocking && !check.ok);
    if (!blockers.length) return true;
    openSettingsDrawer();
    activateSettingsTab("backend");
    setStatus(`开始分析前请先处理：${blockers.map((check) => check.label).join("、")}`);
    return false;
  }

  async function buildHealthStatus(settings, model) {
    const checks = [];
    const enabledCliBackends = (settings.enabledBackends || []).filter((backend) => backend !== "eagle");
    const selectedNeedsFfmpeg = state.selectedItems.some(itemNeedsFfmpeg);

    checks.push({
      id: "node",
      label: "Node 能力",
      ok: Boolean(nodeRequire && fs && path),
      blocking: Boolean(enabledCliBackends.length || selectedNeedsFfmpeg || settings.diagnosticEnabled),
      message: nodeRequire && fs && path ? "Node、fs、path 可用" : "当前插件环境缺少 Node.js 文件能力"
    });
    checks.push({
      id: "child_process",
      label: "child_process",
      ok: Boolean(cp && typeof cp.execFile === "function"),
      blocking: Boolean(enabledCliBackends.length || selectedNeedsFfmpeg),
      message: cp && typeof cp.execFile === "function" ? "可调用本地命令" : "无法调用本地 CLI 或 FFmpeg"
    });

    if (enabledCliBackends.length) {
      if (!cliBackends || typeof cliBackends.createCliHealthChecks !== "function") {
        enabledCliBackends.forEach((backend) => {
          checks.push({
            id: `cli-${backend}`,
            label: formatBackendLabel(backend),
            ok: false,
            blocking: true,
            message: "CLI 后端模块未加载"
          });
        });
      } else {
        cliBackends.createCliHealthChecks(enabledCliBackends, settings, {
          fs,
          path,
          env: typeof process !== "undefined" ? process.env : undefined
        }).forEach((plan) => {
          checks.push({
            id: `cli-${plan.backend}`,
            label: formatBackendLabel(plan.backend),
            ok: Boolean(plan.ok && cp && typeof cp.execFile === "function"),
            blocking: true,
            command: plan.command,
            message: `${plan.message}${plan.command ? `：${plan.command}` : ""}`
          });
        });
      }
    } else {
      checks.push({
        id: "cli-disabled",
        label: "本地 CLI",
        ok: true,
        blocking: false,
        message: "未启用 Claude/Codex CLI"
      });
    }

    if (settings.enabledBackends.includes("eagle")) {
      checks.push({
        id: "eagle-ai",
        label: "Eagle AI 模型",
        ok: Boolean(model),
        blocking: true,
        message: model ? "已配置默认视觉模型" : "未配置 Eagle 默认视觉模型"
      });
    }

    checks.push(await checkFfmpegHealth(selectedNeedsFfmpeg));
    checks.push(checkDiagnosticHealth(settings));
    checks.push(checkSelectedPathHealth());
    return checks.map(normalizeHealthCheck);
  }

  function normalizeHealthCheck(check) {
    const ok = Boolean(check && check.ok);
    const blocking = Boolean(check && check.blocking);
    return {
      id: check.id || check.label || "check",
      label: check.label || "检查项",
      ok,
      blocking,
      severity: ok ? "ok" : (blocking ? "fail" : "warn"),
      message: check.message || (ok ? "通过" : "需要处理"),
      command: check.command || ""
    };
  }

  async function checkFfmpegHealth(required) {
    if (!required) {
      return {
        id: "ffmpeg",
        label: "FFmpeg",
        ok: true,
        blocking: false,
        message: "当前素材不需要抽帧"
      };
    }
    const ffmpeg = getFfmpegApi();
    if (!ffmpeg) {
      return {
        id: "ffmpeg",
        label: "FFmpeg",
        ok: false,
        blocking: true,
        message: "未检测到 Eagle FFmpeg 扩展"
      };
    }
    try {
      if (typeof ffmpeg.isInstalled === "function" && !await ffmpeg.isInstalled()) {
        return { id: "ffmpeg", label: "FFmpeg", ok: false, blocking: true, message: "Eagle FFmpeg 扩展未安装" };
      }
      if (ffmpeg.isInstalled === false) {
        return { id: "ffmpeg", label: "FFmpeg", ok: false, blocking: true, message: "Eagle FFmpeg 扩展未安装" };
      }
      const paths = typeof ffmpeg.getPaths === "function" ? await ffmpeg.getPaths() : ffmpeg.paths;
      const ok = Boolean(paths && paths.ffmpeg && paths.ffprobe);
      return {
        id: "ffmpeg",
        label: "FFmpeg",
        ok,
        blocking: true,
        message: ok ? "FFmpeg/ffprobe 路径可用" : "无法读取 FFmpeg/ffprobe 路径"
      };
    } catch (error) {
      return {
        id: "ffmpeg",
        label: "FFmpeg",
        ok: false,
        blocking: true,
        message: formatError(error)
      };
    }
  }

  function checkDiagnosticHealth(settings) {
    if (!settings.diagnosticEnabled) {
      return {
        id: "diagnostic",
        label: "诊断目录",
        ok: true,
        blocking: false,
        message: "未启用诊断保存"
      };
    }
    if (!settings.diagnosticDir) {
      return {
        id: "diagnostic",
        label: "诊断目录",
        ok: false,
        blocking: true,
        message: "已开启诊断保存，但尚未选择文件夹"
      };
    }
    if (!fs || !path) {
      return {
        id: "diagnostic",
        label: "诊断目录",
        ok: false,
        blocking: true,
        message: "缺少 Node.js 文件能力，无法写入诊断目录"
      };
    }
    try {
      fs.mkdirSync(settings.diagnosticDir, { recursive: true });
      const probe = path.join(settings.diagnosticDir, `.vfx-ai-tagger-health-${Date.now()}.tmp`);
      fs.writeFileSync(probe, "ok", "utf8");
      fs.rmSync(probe, { force: true });
      return {
        id: "diagnostic",
        label: "诊断目录",
        ok: true,
        blocking: true,
        message: "诊断目录可写"
      };
    } catch (error) {
      return {
        id: "diagnostic",
        label: "诊断目录",
        ok: false,
        blocking: true,
        message: formatError(error)
      };
    }
  }

  function checkSelectedPathHealth() {
    if (!state.selectedItems.length) {
      return {
        id: "selected-paths",
        label: "素材路径",
        ok: true,
        blocking: false,
        message: "尚未导入素材，开始分析前会再次检查"
      };
    }
    const missing = state.selectedItems.filter((item) => {
      const candidates = [getItemFilePath(item), getItemPreviewPath(item)]
        .map((candidate) => candidate && fileUrlToPath(candidate))
        .filter(Boolean);
      if (!candidates.length) return true;
      return Boolean(fs && !candidates.some((candidate) => fs.existsSync(candidate)));
    });
    return {
      id: "selected-paths",
      label: "素材路径",
      ok: missing.length === 0,
      blocking: true,
      message: missing.length
        ? `${missing.length} 个素材路径不存在或不可访问`
        : `${state.selectedItems.length} 个素材路径可访问`
    };
  }

  function itemNeedsFfmpeg(item) {
    const filePath = getItemFilePath(item);
    const ext = getItemExt(item, filePath);
    return VIDEO_EXTS.has(ext) || ANIMATED_EXTS.has(ext) || ext === WEBP_EXT;
  }

  function renderHealthStatus() {
    if (!els.healthStatusList || !els.healthSummary) return;
    const checks = Array.isArray(state.healthStatus) ? state.healthStatus : [];
    const blockers = checks.filter((check) => check.blocking && !check.ok);
    els.healthSummary.textContent = checks.length
      ? (blockers.length ? `${blockers.length} 个阻断项` : "环境可用")
      : "等待检查";
    els.healthStatusList.innerHTML = checks.map((check) => `
      <div class="health-item ${escapeHtml(check.severity)}">
        <strong>${check.ok ? "通过" : (check.blocking ? "阻断" : "提醒")}</strong>
        <span>${escapeHtml(check.label)}：${escapeHtml(check.message)}</span>
      </div>
    `).join("");
  }

  async function openDirectoryPicker() {
    const dialog = getElectronDialog();
    if (dialog && typeof dialog.showOpenDialog === "function") {
      const result = await dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] });
      const filePaths = result && result.filePaths;
      return Array.isArray(filePaths) && filePaths.length ? filePaths[0] : "";
    }
    const eagleDialog = window.eagle && eagle.dialog;
    if (eagleDialog && typeof eagleDialog.showOpenDialog === "function") {
      const result = await eagleDialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] });
      if (Array.isArray(result)) return result[0] || "";
      const filePaths = result && result.filePaths;
      return Array.isArray(filePaths) && filePaths.length ? filePaths[0] : "";
    }
    return "";
  }

  function getElectronDialog() {
    if (!nodeRequire) return null;
    try {
      const electron = nodeRequire("electron");
      return electron && ((electron.remote && electron.remote.dialog) || electron.dialog);
    } catch (error) {
      try {
        const remote = nodeRequire("@electron/remote");
        return remote && remote.dialog;
      } catch (remoteError) {
        return null;
      }
    }
  }

  function ensureDiagnosticSettings(settings) {
    if (!settings.diagnosticEnabled) return true;
    if (!settings.diagnosticDir) {
      setStatus("已开启诊断保存，请先选择诊断保存文件夹。");
      return false;
    }
    if (!fs || !path) {
      setStatus("当前插件环境缺少 Node.js 能力，无法验证诊断保存文件夹。");
      return false;
    }
    try {
      fs.mkdirSync(settings.diagnosticDir, { recursive: true });
      const stat = fs.statSync(settings.diagnosticDir);
      if (!stat.isDirectory()) throw new Error("不是文件夹");
      return true;
    } catch (error) {
      setStatus(`诊断保存文件夹不可用：${formatError(error)}`);
      return false;
    }
  }

  function loadStoredState() {
    state.customAllowedTags = readJsonArray(STORAGE_KEYS.customAllowedTags);
    state.disabledTags = readJsonArray(STORAGE_KEYS.disabledTags);
    state.results = readStoredResults();
    state.paused = state.results.some((result) => result.status === "pending");
    const settings = readJsonObject(STORAGE_KEYS.settings);
    state.selectedTagGroupName = settings.tagGroupName || "__all";
    Object.keys(settings).forEach((key) => {
      if (!els[key]) return;
      if (els[key].type === "checkbox") {
        els[key].checked = coerceStoredBoolean(settings[key], els[key].checked);
      } else {
        els[key].value = settings[key];
      }
    });
    state.activePresetName = settings.analysisPresetName || settings.activePresetName || "";
    if (els.analysisPresetSelect) els.analysisPresetSelect.value = state.activePresetName;
    renderPresetHint();
  }

  function coerceStoredBoolean(value, fallback) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "on"].includes(normalized)) return true;
      if (["false", "0", "no", "off", ""].includes(normalized)) return false;
    }
    return Boolean(fallback);
  }

  function saveStoredTagState() {
    localStorage.setItem(STORAGE_KEYS.customAllowedTags, JSON.stringify(state.customAllowedTags));
    localStorage.setItem(STORAGE_KEYS.disabledTags, JSON.stringify(state.disabledTags));
  }

  function saveResultsState() {
    try {
      const results = state.results.map((result) => ({
        id: result.id,
        name: result.name,
        status: result.status === "running" ? "pending" : result.status,
        message: result.message,
        tags: result.tags,
        autoTags: result.autoTags,
        reviewTags: result.reviewTags,
        aiReason: result.aiReason,
        aiBackend: result.aiBackend,
        frameCount: result.frameCount,
        requestCount: result.requestCount,
        mediaChunkCount: result.mediaChunkCount,
        tagChunkCount: result.tagChunkCount,
        diagnosticPath: result.diagnosticPath,
        diagnostics: null,
        filteredTags: result.filteredTags,
        hiddenCount: result.hiddenCount,
        confidence: result.confidence,
        errorType: result.errorType
      }));
      localStorage.setItem(STORAGE_KEYS.results, JSON.stringify(results));
    } catch (error) {
      // Result cache is a recovery aid. Analysis/write flow should continue if storage is full.
    }
  }

  function readStoredResults() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEYS.results) || "[]");
      if (!Array.isArray(value)) return [];
      return value
        .filter((result) => result && typeof result === "object" && result.id)
        .map((result) => ({
          ...createStoredResultSkeleton(result),
          ...result,
          status: result.status === "running" ? "pending" : result.status
        }));
    } catch (error) {
      return [];
    }
  }

  function createStoredResultSkeleton(result) {
    return {
      id: String(result.id || ""),
      name: String(result.name || "未命名素材"),
      status: "pending",
      message: "从上次会话恢复",
      tags: [],
      autoTags: [],
      reviewTags: [],
      aiReason: "",
      aiBackend: "",
      frameCount: 0,
      requestCount: 0,
      mediaChunkCount: 0,
      tagChunkCount: 0,
      diagnosticPath: "",
      diagnostics: null,
      filteredTags: [],
      hiddenCount: 0,
      confidence: 0,
      errorType: ""
    };
  }

  function renderAll() {
    renderTagGroupSelect();
    renderTagPool();
    renderSelectedSummary();
    renderSelectedItems();
    renderSelectedFullList();
    renderResults();
    updateCollectorBar();
    els.selectedCount.textContent = String(state.selectedItems.length);
    els.tagPoolCount.textContent = String(getAllowedTags().length);
  }

  function updateCollectorBar() {
    if (els.collectorCount) {
      els.collectorCount.textContent = `${state.selectedItems.length} 个待分析`;
    }
    if (els.collectorAnalyzeBtn) {
      els.collectorAnalyzeBtn.disabled = state.running || state.writing || !state.selectedItems.length;
    }
    if (els.collectorAppendBtn) {
      els.collectorAppendBtn.disabled = state.running || state.writing;
    }
    if (els.clearSelectedBtn) {
      els.clearSelectedBtn.disabled = state.running || state.writing || (!state.selectedItems.length && !state.results.length);
    }
    if (els.appendSelectedBtn) els.appendSelectedBtn.disabled = state.running || state.writing;
    if (els.replaceSelectedBtn) els.replaceSelectedBtn.disabled = state.running || state.writing;
    if (els.miniCollectorBtn) els.miniCollectorBtn.disabled = state.running || state.writing;
  }

  function renderSelectedSummary() {
    if (!els.selectedSummary) return;
    const total = state.selectedItems.length;
    const withTags = state.selectedItems.filter((item) => Array.isArray(item.tags) && item.tags.length).length;
    const pending = state.results.filter((result) => result.status === "pending" || result.status === "running").length;
    const failed = state.results.filter((result) => result.status === "failed").length;
    els.selectedSummary.innerHTML = [
      `<span>已导入 ${total} 个</span>`,
      `<span>已有标签 ${withTags} 个</span>`,
      pending ? `<span>待处理 ${pending} 个</span>` : "",
      failed ? `<span>失败 ${failed} 个</span>` : ""
    ].filter(Boolean).join("");
    if (els.showSelectedListBtn) els.showSelectedListBtn.disabled = total === 0;
  }

  function renderSelectedItems() {
    if (!els.selectedItems) return;
    els.selectedItems.innerHTML = "";
    if (!state.selectedItems.length) {
      els.selectedItems.innerHTML = `<div class="empty">请先在 Eagle 中选择素材，然后点击“追加当前选中”。</div>`;
      return;
    }
    state.selectedItems.slice(0, 3).forEach((item) => {
      els.selectedItems.appendChild(createSelectedItemRow(item));
    });
    if (state.selectedItems.length > 3) {
      const more = document.createElement("div");
      more.className = "selected-more";
      more.textContent = `还有 ${state.selectedItems.length - 3} 个素材，点击“完整列表”查看。`;
      els.selectedItems.appendChild(more);
    }
  }

  function renderSelectedFullList() {
    if (!els.selectedItemsFullList) return;
    els.selectedItemsFullList.innerHTML = "";
    if (!state.selectedItems.length) {
      els.selectedItemsFullList.innerHTML = `<div class="empty">还没有导入素材。</div>`;
      return;
    }
    state.selectedItems.forEach((item) => {
      els.selectedItemsFullList.appendChild(createSelectedItemRow(item));
    });
  }

  function createSelectedItemRow(item) {
    const filePath = getItemFilePath(item);
    const ext = getItemExt(item, filePath) || "未知";
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const row = document.createElement("div");
    row.className = "selected-item";
    row.setAttribute("data-item-id", getItemId(item));
    row.innerHTML = `
      <div class="selected-name" title="${escapeHtml(getItemName(item))}">${escapeHtml(getItemName(item))}</div>
      <div class="selected-meta">
        <span>${escapeHtml(ext.toUpperCase())}</span>
        <span>${tags.length} 个已有标签</span>
        <span title="${escapeHtml(filePath)}">${escapeHtml(shortPath(filePath))}</span>
      </div>
    `;
    return row;
  }

  function renderTagPool() {
    const query = cleanTag(els.tagSearch.value).toLowerCase();
    const tags = getAllowedTags().filter((tag) => !query || tag.toLowerCase().includes(query));
    els.tagPool.innerHTML = "";
    if (!tags.length) {
      els.tagPool.innerHTML = `<div class="empty">标签池为空</div>`;
      return;
    }
    tags.forEach((tag) => {
      const chip = document.createElement("div");
      chip.className = "tag-chip";
      chip.setAttribute("data-pool-tag", tag);
      chip.innerHTML = `<span title="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.title = "从候选池移除";
      remove.addEventListener("click", () => removeFromPool(tag));
      chip.appendChild(remove);
      els.tagPool.appendChild(chip);
    });
  }

  function renderTagGroupSelect() {
    if (!els.tagGroupSelect) return;
    const groupNames = [...new Set(state.eagleTagGroups.map(getTagGroupName).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
    const currentValue = groupNames.includes(state.selectedTagGroupName) ? state.selectedTagGroupName : "__all";
    if (currentValue !== state.selectedTagGroupName) {
      state.selectedTagGroupName = currentValue;
      applyTagGroupFilter();
    }
    els.tagGroupSelect.innerHTML = [
      `<option value="__all">全部 Eagle 标签</option>`,
      ...groupNames.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    ].join("");
    els.tagGroupSelect.value = currentValue;
  }

  function renderResults() {
    const readyCount = state.results.filter((result) => result.status === "ready" && getSelectedReviewTags(result).length).length;
    const failedCount = state.results.filter((result) => result.status === "failed" || result.status === "skipped").length;
    els.readyCount.textContent = String(readyCount);
    els.failedCount.textContent = String(failedCount);
    els.applyBtn.disabled = state.running || state.writing || readyCount === 0;
    els.undoBtn.disabled = state.running || state.writing || state.undoStack.length === 0;
    if (els.retryFailedBtn) els.retryFailedBtn.disabled = state.running || state.writing || !state.results.some((result) => result.status === "failed");
    updateResultFilterButtons();
    updateAnalysisControls();
    els.results.innerHTML = "";
    if (!state.results.length) {
      els.results.innerHTML = `<div class="empty">追加当前选中素材后点击“开始分析”，这里会显示待确认标签、置信度和写入状态。</div>`;
      return;
    }
    const visibleResults = getFilteredResults();
    if (!visibleResults.length) {
      els.results.innerHTML = `<div class="empty">当前过滤条件下没有结果。</div>`;
      return;
    }
    visibleResults.forEach((result) => {
      const item = document.createElement("article");
      item.className = "result";
      item.setAttribute("data-result-id", result.id);
      item.innerHTML = `
        <div class="result-head">
          <div class="result-title">
            <div class="result-name" title="${escapeHtml(result.name)}">${escapeHtml(result.name)}</div>
            <div class="result-meta">
              <span class="result-state ${escapeHtml(result.status)}">${stateLabel(result.status)}</span>
              ${result.aiBackend ? `<span class="badge">${escapeHtml(formatBackendLabel(result.aiBackend))}</span>` : ""}
              ${typeof result.confidence === "number" ? `<span class="badge">整体 ${formatConfidence(result.confidence)}</span>` : ""}
              ${result.frameCount ? `<span class="badge">${escapeHtml(String(result.frameCount))} 张图像</span>` : ""}
              ${result.requestCount > 1 ? `<span class="badge">${escapeHtml(String(result.requestCount))} 次请求</span>` : ""}
            </div>
          </div>
          <div class="result-actions">
            <button type="button" data-reanalyze-result="${escapeHtml(result.id)}" ${state.running ? "disabled" : ""}>重新分析</button>
          </div>
        </div>
        <div class="result-summary">
          ${result.message ? `<div class="result-message">${escapeHtml(result.message)}</div>` : ""}
          ${result.errorType ? `<div class="failure-type">失败类型：${escapeHtml(failureTypeLabel(result.errorType))}</div>` : ""}
          ${result.diagnosticPath ? `<div class="diagnostic-saved">诊断文件已保存：${escapeHtml(result.diagnosticPath)}</div>` : ""}
        </div>
        ${renderAutoTags(result.autoTags)}
        ${renderReviewTags(result)}
        ${renderResultEditor(result)}
        ${result.aiReason ? `<div class="result-reason">AI 说明：${escapeHtml(result.aiReason)}</div>` : ""}
        ${result.filteredTags && result.filteredTags.length ? `<div class="filtered">已过滤：${escapeHtml(result.filteredTags.join("、"))}</div>` : ""}
        ${result.hiddenCount ? `<div class="muted">${result.hiddenCount} 个低置信标签已隐藏</div>` : ""}
        ${renderDiagnostics(result.diagnostics)}
      `;
      els.results.appendChild(item);
    });
    els.results.querySelectorAll("[data-review-tag]").forEach((input) => {
      input.addEventListener("change", () => toggleReviewTag(input.dataset.resultId, input.dataset.reviewTag, input.checked));
    });
    els.results.querySelectorAll("[data-remove-review-tag]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        removeReviewTag(button.dataset.resultId, button.dataset.removeReviewTag);
      });
    });
    els.results.querySelectorAll("[data-add-manual-tag]").forEach((button) => {
      button.addEventListener("click", () => addManualTagToResult(button.dataset.addManualTag));
    });
    els.results.querySelectorAll("[data-manual-tag-input]").forEach((input) => {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") addManualTagToResult(input.dataset.manualTagInput);
      });
    });
    els.results.querySelectorAll("[data-reanalyze-result]").forEach((button) => {
      button.addEventListener("click", () => reanalyzeResult(button.dataset.reanalyzeResult));
    });
  }

  function getFilteredResults() {
    const filter = state.activeResultFilter || "all";
    if (filter === "all") return state.results;
    if (filter === "ready") return state.results.filter((result) => result.status === "ready");
    if (filter === "failed") return state.results.filter((result) => result.status === "failed");
    if (filter === "applied") return state.results.filter((result) => result.status === "applied");
    if (filter === "skipped") return state.results.filter((result) => result.status === "skipped");
    return state.results;
  }

  function updateResultFilterButtons() {
    if (!els.resultFilterButtons) return;
    els.resultFilterButtons.forEach((button) => {
      button.classList.toggle("is-active", (button.dataset.resultFilter || "all") === (state.activeResultFilter || "all"));
    });
  }

  function renderDiagnostics(diagnostics) {
    if (!diagnostics || !Array.isArray(diagnostics.images) || !diagnostics.images.length) return "";
    const images = diagnostics.images.slice(0, DIAGNOSTIC_PREVIEW_LIMIT);
    return `
      <details class="diagnostics">
        <summary>诊断信息</summary>
        <div class="diagnostic-line">原文件：${escapeHtml(shortPath(diagnostics.sourcePath || ""))}</div>
        <div class="diagnostic-line">预览图：${escapeHtml(shortPath(diagnostics.previewPath || ""))}</div>
        ${diagnostics.diagnosticPath ? `<div class="diagnostic-line">诊断目录：${escapeHtml(diagnostics.diagnosticPath)}</div>` : ""}
        <div class="diagnostic-line">实际图片：${diagnostics.images.length} 张，显示前 ${images.length} 张</div>
        <div class="diagnostic-grid">
          ${images.map((image, index) => `
            <figure class="diagnostic-frame">
              ${image.exists ? `<img src="${escapeHtml(image.previewUrl || image.url)}" alt="frame ${index + 1}">` : `<div class="diagnostic-missing">不存在</div>`}
              <figcaption>${index + 1} · ${image.exists ? "存在" : "缺失"} · ${formatBytes(image.size)}</figcaption>
            </figure>
          `).join("")}
        </div>
      </details>
    `;
  }

  function renderAutoTags(tags) {
    if (!Array.isArray(tags) || !tags.length) return "";
    return `
      <div class="tag-section-title">已自动写入</div>
      <div class="result-tags auto-tags">
        ${tags.map((tag) => `<span class="tag-chip"><span>${escapeHtml(tag.name)} ${formatConfidence(tag.confidence)}</span></span>`).join("")}
      </div>
    `;
  }

  function renderReviewTags(result) {
    if (!Array.isArray(result.reviewTags) || !result.reviewTags.length) return "";
    return `
      <div class="tag-section-title">待确认</div>
      <div class="review-tags">
        ${result.reviewTags.map((tag) => `
          <label class="review-tag ${tag.source === "manual" ? "manual" : ""}" data-result-id="${escapeHtml(result.id)}" data-review-tag-name="${escapeHtml(tag.name)}">
            <input type="checkbox" data-result-id="${escapeHtml(result.id)}" data-review-tag="${escapeHtml(tag.name)}" ${tag.selected ? "checked" : ""}>
            <span>${escapeHtml(tag.name)}</span>
            <strong>${tag.source === "manual" ? "人工" : formatConfidence(tag.confidence)}</strong>
            <button class="review-tag-remove" type="button" data-result-id="${escapeHtml(result.id)}" data-remove-review-tag="${escapeHtml(tag.name)}" title="删除标签">×</button>
          </label>
        `).join("")}
      </div>
    `;
  }

  function renderResultEditor(result) {
    if (["pending", "running"].includes(result.status)) return "";
    const options = getAllowedTags()
      .slice(0, 400)
      .map((tag) => `<option value="${escapeHtml(tag)}"></option>`)
      .join("");
    const listId = `tag-options-${safeDomId(result.id)}`;
    return `
      <div class="result-editor">
        <input type="search" list="${escapeHtml(listId)}" data-manual-tag-input="${escapeHtml(result.id)}" placeholder="搜索或输入标签">
        <datalist id="${escapeHtml(listId)}">${options}</datalist>
        <button type="button" data-add-manual-tag="${escapeHtml(result.id)}">添加标签</button>
      </div>
    `;
  }

  async function retryFailedResults() {
    if (state.running) return;
    const failedIds = state.results.filter((result) => result.status === "failed").map((result) => result.id);
    if (!failedIds.length) {
      setStatus("没有失败项需要重试。");
      return;
    }
    const failedSet = new Set(failedIds);
    state.results = state.results.map((result) => failedSet.has(result.id)
      ? { ...createPendingResult({ id: result.id, name: result.name }), message: "等待重试" }
      : result);
    state.paused = false;
    saveResultsState();
    renderResults();
    setStatus(`准备重试 ${failedIds.length} 个失败项。`);
    await analyzeSelected();
  }

  async function reanalyzeResult(resultId) {
    if (state.running) return;
    const item = state.selectedItems.find((candidate) => getItemId(candidate) === resultId);
    if (!item) {
      setStatus("找不到这个素材，请重新导入当前选中素材后再试。");
      return;
    }
    const allowedTags = getAllowedTags();
    if (!allowedTags.length) {
      setStatus("标签池为空，请先刷新 Eagle 标签或导入默认模板。");
      return;
    }
    const settings = readSettings();
    const model = settings.enabledBackends.includes("eagle") ? getAiModel() : null;
    if (!await ensureHealthyBeforeAnalysis(settings, model)) return;
    const usableBackends = getUsableBackends(settings, model);
    if (!usableBackends.length) {
      setStatus("没有可用 AI 后端：请启用 Claude/Codex CLI，或配置 Eagle 默认视觉模型。");
      return;
    }
    settings.enabledBackends = usableBackends;
    if (!ensureDiagnosticSettings(settings)) return;
    state.running = true;
    state.pauseRequested = false;
    setControlsBusy(true);
    updateResult(resultId, {
      status: "running",
      message: "重新分析中",
      tags: [],
      autoTags: [],
      reviewTags: [],
      filteredTags: [],
      hiddenCount: 0,
      aiReason: "",
      aiBackend: "",
      confidence: 0,
      frameCount: 0,
      diagnosticPath: "",
      diagnostics: null,
      errorType: ""
    });
    try {
      const result = await analyzeItem(item, model, allowedTags, settings);
      updateResult(resultId, result);
      setStatus(`已重新分析：${getItemName(item)}`);
    } catch (error) {
      updateResult(resultId, {
        status: "failed",
        message: formatError(error),
        errorType: classifyError(error),
        diagnosticPath: error.diagnosticPath || "",
        diagnostics: error.diagnostics || null,
        tags: [],
        reviewTags: [],
        autoTags: [],
        filteredTags: []
      });
      setStatus(`重新分析失败：${formatError(error)}`);
    } finally {
      state.running = false;
      state.pauseRequested = false;
      setControlsBusy(false);
      renderAll();
    }
  }

  function toggleReviewTag(resultId, tagName, selected) {
    const result = state.results.find((item) => item.id === resultId);
    if (!result || !Array.isArray(result.reviewTags)) return;
    const tag = result.reviewTags.find((item) => item.name === tagName);
    if (tag) tag.selected = selected;
    result.tags = getSelectedReviewTags(result).map((item) => item.name);
    saveResultsState();
    renderResults();
  }

  function removeReviewTag(resultId, tagName) {
    const result = state.results.find((item) => item.id === resultId);
    if (!result || !Array.isArray(result.reviewTags)) return;
    result.reviewTags = result.reviewTags.filter((tag) => tag.name !== tagName);
    result.tags = getSelectedReviewTags(result).map((item) => item.name);
    saveResultsState();
    renderResults();
  }

  function addManualTagToResult(resultId) {
    const result = state.results.find((item) => item.id === resultId);
    if (!result) return;
    const input = Array.from(els.results.querySelectorAll("[data-manual-tag-input]"))
      .find((candidate) => candidate.dataset.manualTagInput === resultId);
    const tagName = cleanTag(input && input.value);
    if (!tagName) return;
    const existing = new Set((Array.isArray(result.reviewTags) ? result.reviewTags : []).map((tag) => tag.name));
    if (!existing.has(tagName)) {
      result.reviewTags = [
        ...(Array.isArray(result.reviewTags) ? result.reviewTags : []),
        { name: tagName, confidence: 1, selected: true, source: "manual" }
      ];
    } else {
      result.reviewTags = result.reviewTags.map((tag) => tag.name === tagName ? { ...tag, selected: true } : tag);
    }
    if (!getAllowedTags().includes(tagName)) {
      state.customAllowedTags = normalizeTagList([...state.customAllowedTags, tagName]);
      saveStoredTagState();
    }
    if (["failed", "skipped", "applied"].includes(result.status)) {
      result.status = "ready";
      result.message = "已人工添加标签，可直接写入或重新分析。";
      result.errorType = "";
    }
    result.tags = getSelectedReviewTags(result).map((item) => item.name);
    if (input) input.value = "";
    saveResultsState();
    renderAll();
  }

  function createPendingResult(item) {
    return {
      id: getItemId(item),
      name: getItemName(item),
      status: "pending",
      message: "等待分析",
      tags: [],
      autoTags: [],
      reviewTags: [],
      aiReason: "",
      aiBackend: "",
      frameCount: 0,
      requestCount: 0,
      mediaChunkCount: 0,
      tagChunkCount: 0,
      diagnosticPath: "",
      confidence: 0,
      errorType: "",
      diagnostics: null,
      filteredTags: []
    };
  }

  function updateResult(id, patch) {
    const index = state.results.findIndex((result) => result.id === id);
    if (index >= 0) {
      state.results[index] = { ...state.results[index], ...patch };
      saveResultsState();
      renderResults();
    }
  }

  function getAllowedTags() {
    const disabled = new Set(state.disabledTags);
    const removed = new Set(state.sessionRemovedTags);
    const custom = state.customAllowedTags.filter((tag) => !disabled.has(tag));
    return normalizeTagList([...state.eagleTags, ...custom]).filter((tag) => !removed.has(tag));
  }

  function getSelectedReviewTags(result) {
    return Array.isArray(result.reviewTags) ? result.reviewTags.filter((tag) => tag.selected) : [];
  }

  async function mergeTagsIntoItem(item, tags, annotationText, source) {
    const previousTags = Array.isArray(item.tags) ? [...item.tags] : [];
    const existing = previousTags;
    const existingSet = new Set(existing);
    const addedTags = normalizeTagList(tags).filter((tag) => !existingSet.has(tag));
    const previousAnnotation = String(item.annotation || "");
    item.tags = normalizeTagList([...existing, ...tags]);
    appendAnnotation(item, annotationText);
    try {
      await item.save();
    } catch (error) {
      item.tags = previousTags;
      item.annotation = previousAnnotation;
      throw error;
    }
    if (addedTags.length || previousAnnotation !== String(item.annotation || "")) {
      state.undoStack.push({
        itemId: getItemId(item),
        addedTags,
        previousAnnotation,
        source: source || "写入标签",
        at: Date.now()
      });
      renderResults();
    }
  }

  async function undoLastWrite() {
    const record = state.undoStack[state.undoStack.length - 1];
    if (!record) {
      renderResults();
      return;
    }
    const item = state.selectedItems.find((candidate) => getItemId(candidate) === record.itemId);
    if (!item || typeof item.save !== "function") {
      setStatus("找不到可撤销的 Eagle 素材，请重新导入当前选中素材后再试。");
      renderResults();
      return;
    }
    const removeSet = new Set(record.addedTags || []);
    const currentTags = Array.isArray(item.tags) ? item.tags : [];
    const previousTags = [...currentTags];
    const previousAnnotation = String(item.annotation || "");
    item.tags = currentTags.filter((tag) => !removeSet.has(tag));
    item.annotation = record.previousAnnotation || "";
    try {
      await item.save();
    } catch (error) {
      item.tags = previousTags;
      item.annotation = previousAnnotation;
      setStatus(`撤销失败：${formatError(error)}。撤销记录已保留，可稍后重试。`);
      renderResults();
      return;
    }
    state.undoStack.pop();
    setStatus(`已撤销：${record.source || "上次写入"}。移除 ${removeSet.size} 个标签。`);
    renderResults();
  }

  function appendAnnotation(item, annotationText) {
    const text = cleanAnnotation(annotationText);
    if (!text) return;
    const marker = "[特效 AI 分析]";
    const existing = String(item.annotation || "").trim();
    const addition = `${marker}\n${text}`;
    if (existing.includes(addition)) return;
    item.annotation = existing ? `${existing}\n\n${addition}` : addition;
  }

  function cleanAnnotation(text) {
    return String(text || "").trim().replace(/\s+/g, " ");
  }

  async function runWithConcurrency(items, concurrency, worker) {
    let cursor = 0;
    const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (cursor < items.length) {
        if (state.pauseRequested) return;
        const item = items[cursor];
        cursor += 1;
        await worker(item);
      }
    });
    await Promise.all(runners);
  }

  function setControlsBusy(busy) {
    els.analyzeBtn.disabled = busy;
    els.pauseBtn.disabled = !busy || state.pauseRequested;
    updateAnalysisControls();
    els.appendSelectedBtn.disabled = busy;
    els.replaceSelectedBtn.disabled = busy;
    els.clearSelectedBtn.disabled = busy || (!state.selectedItems.length && !state.results.length);
    els.miniCollectorBtn.disabled = busy;
    updateCollectorBar();
    els.refreshTagsBtn.disabled = busy;
    els.importDefaultsBtn.disabled = busy;
    els.applyBtn.disabled = busy || state.writing || state.results.filter((result) => result.status === "ready" && getSelectedReviewTags(result).length).length === 0;
    els.undoBtn.disabled = busy || state.writing || state.undoStack.length === 0;
  }

  function updateAnalysisControls() {
    const hasPending = state.results.some((result) => result.status === "pending");
    const showPausedActions = Boolean(state.paused && hasPending && !state.running);
    els.pauseBtn.hidden = showPausedActions;
    els.continueBtn.hidden = !showPausedActions;
    els.restartBtn.hidden = !showPausedActions;
    els.continueBtn.disabled = !showPausedActions;
    els.restartBtn.disabled = !showPausedActions;
    if (!showPausedActions) {
      els.pauseBtn.hidden = false;
    }
  }

  function getItemId(item) {
    return String(item.id || item._id || item.filePath || item.name);
  }

  function getItemName(item) {
    if (item.name || item.filename || item.title) return item.name || item.filename || item.title;
    if (path && item.filePath) return path.basename(item.filePath);
    return "未命名素材";
  }

  function getItemFilePath(item) {
    return item.filePath || item.path || item.file || "";
  }

  function getItemPreviewPath(item) {
    return item.thumbnailPath || item.previewPath || item.thumbPath || item.thumbnail || "";
  }

  function getItemExt(item, filePath) {
    const ext = item.ext || item.extension || (filePath && path ? path.extname(filePath).slice(1) : "");
    return String(ext || "").toLowerCase();
  }

  function shortPath(filePath) {
    if (!filePath) return "无路径";
    if (!path) return filePath;
    const dir = path.dirname(filePath);
    const base = path.basename(filePath);
    const parent = path.basename(dir);
    return parent ? `${parent}\\${base}` : base;
  }

  function toFileUrl(filePath) {
    return url && url.pathToFileURL ? url.pathToFileURL(filePath).href : `file://${String(filePath).replace(/\\/g, "/")}`;
  }

  function createDiagnosticPreviewUrl(filePath, index) {
    if (index >= DIAGNOSTIC_PREVIEW_LIMIT || !filePath || !fs || !fs.existsSync(filePath)) return "";
    try {
      const bytes = fs.readFileSync(filePath);
      return `data:${getImageMimeType(filePath)};base64,${bytes.toString("base64")}`;
    } catch (error) {
      return toFileUrl(filePath);
    }
  }

  function getImageMimeType(filePath) {
    const ext = path ? path.extname(filePath).toLowerCase() : "";
    if (ext === ".png") return "image/png";
    if (ext === ".webp") return "image/webp";
    if (ext === ".gif") return "image/gif";
    if (ext === ".svg") return "image/svg+xml";
    if (ext === ".bmp") return "image/bmp";
    return "image/jpeg";
  }

  function fileUrlToPath(fileUrl) {
    const text = String(fileUrl || "");
    if (!text) return "";
    try {
      if (url && url.fileURLToPath && text.startsWith("file:")) return url.fileURLToPath(text);
    } catch (error) {}
    if (!text.startsWith("file://")) return text;
    const withoutScheme = decodeURIComponent(text.replace(/^file:\/\/\/?/, ""));
    return withoutScheme.replace(/\//g, "\\");
  }

  function getDefaultCliWorkingDir(item, imagePaths) {
    const candidates = [
      getItemFilePath(item),
      getItemPreviewPath(item),
      ...(Array.isArray(imagePaths) ? imagePaths : [])
    ];
    for (const candidate of candidates) {
      if (candidate && path) return path.dirname(candidate);
    }
    return typeof process !== "undefined" && process.cwd ? process.cwd() : "";
  }

  function extractTagName(tag) {
    if (typeof tag === "string") return tag;
    if (!tag || typeof tag !== "object") return "";
    return tag.name || tag.title || tag.label || tag.tag || "";
  }

  function getTagGroupName(group) {
    if (typeof group === "string") return cleanTag(group);
    if (!group || typeof group !== "object") return "";
    return cleanTag(group.name || group.title || group.label || group.groupName);
  }

  function normalizeTagList(tags) {
    const seen = new Set();
    const output = [];
    tags.forEach((tag) => {
      const cleaned = cleanTag(tag);
      if (cleaned && !seen.has(cleaned)) {
        seen.add(cleaned);
        output.push(cleaned);
      }
    });
    return output;
  }

  function normalizeTagCandidates(tags, fallbackConfidence) {
    const seen = new Set();
    const output = [];
    tags.forEach((tag) => {
      const name = cleanTag(typeof tag === "string" ? tag : tag && (tag.name || tag.tag || tag.label));
      if (!name || seen.has(name)) return;
      seen.add(name);
      const confidence = typeof tag === "object" && tag
        ? normalizeConfidenceValue(tag.confidence ?? tag.score ?? fallbackConfidence, 0.5)
        : normalizeConfidenceValue(fallbackConfidence, 0.5);
      output.push({ name, confidence });
    });
    return output;
  }

  function normalizeConfidenceValue(value, fallback = 0.5) {
    if (typeof value === "string" && value.trim().endsWith("%")) {
      return clampNumber(Number(value.trim().slice(0, -1)) / 100, 0, 1, fallback);
    }
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return clampNumber(number > 1 ? number / 100 : number, 0, 1, fallback);
  }

  function cleanTag(tag) {
    return String(tag || "").trim().replace(/\s+/g, " ");
  }

  function safeDomId(value) {
    return String(value || "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      || "item";
  }

  function readJsonArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? normalizeTagList(value) : [];
    } catch (error) {
      return [];
    }
  }

  function readJsonObject(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch (error) {
      return {};
    }
  }

  function readInt(value, fallback, min, max) {
    const number = parseInt(value, 10);
    return Math.max(min, Math.min(max, Number.isFinite(number) ? number : fallback));
  }

  function readFloat(value, fallback, min, max) {
    const number = parseFloat(value);
    return Math.max(min, Math.min(max, Number.isFinite(number) ? number : fallback));
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, number));
  }

  function roundTime(value) {
    return Math.round(value * 1000) / 1000;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, Number(ms) || 0)));
  }

  function isRetryableAiError(error) {
    const message = formatError(error).toLowerCase();
    if (message.includes("未配置默认视觉模型") || message.includes("没有启用可用") || message.includes("无法调用本地 cli")) return false;
    return true;
  }

  function estimateTextSize(text) {
    return String(text || "").length;
  }

  function estimateTextTokens(text) {
    return Math.ceil(estimateTextSize(text) / 2);
  }

  function parseAiJson(text) {
    const raw = String(text || "").trim();
    if (!raw) throw new Error("AI 没有返回内容");
    const cleaned = raw
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    try {
      return normalizeAiObject(JSON.parse(repairJsonText(cleaned)));
    } catch (firstError) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return normalizeAiObject(JSON.parse(repairJsonText(match[0])));
        } catch (secondError) {
          throw new Error(`AI 返回内容不是有效 JSON：${cleaned.slice(0, 160)}`);
        }
      }
      if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
        try {
          return normalizeAiObject(JSON.parse(repairJsonText(cleaned)));
        } catch (arrayError) {}
      }
      throw new Error(`AI 返回内容不是 JSON：${cleaned.slice(0, 160)}`);
    }
  }

  function repairJsonText(text) {
    return String(text || "")
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/[“”]/g, "\"")
      .replace(/[‘’]/g, "'");
  }

  function normalizeAiObject(value) {
    if (Array.isArray(value)) return { tags: value, confidence: 0.5, reason: "" };
    if (!value || typeof value !== "object") {
      throw new Error(`AI 返回内容不是 JSON：${String(value).slice(0, 160)}`);
    }
    if (Array.isArray(value.tags)) return value;
    if (Array.isArray(value.labels)) return { ...value, tags: value.labels };
    if (Array.isArray(value.result)) return { ...value, tags: value.result };
    return value;
  }

  function stateLabel(status) {
    return {
      pending: "等待",
      running: "分析中",
      ready: "待写入",
      failed: "失败",
      skipped: "跳过",
      applied: "已写入"
    }[status] || status;
  }

  function formatConfidence(confidence) {
    return `${Math.round(clampNumber(confidence, 0, 1, 0) * 100)}%`;
  }

  function classifyError(error) {
    const message = formatError(error).toLowerCase();
    if (message.includes("json")) return "json";
    if (message.includes("没有返回") || message.includes("no content")) return "empty-ai";
    if (message.includes("抽帧") || message.includes("frame")) return "frames";
    if (message.includes("ffmpeg") || message.includes("ffprobe")) return "ffmpeg";
    if (message.includes("cli") || message.includes("claude") || message.includes("codex")) return "cli";
    if (message.includes("视觉模型") || message.includes("ai sdk")) return "eagle-ai";
    if (message.includes("路径") || message.includes("文件") || message.includes("预览")) return "file";
    return "unknown";
  }

  function failureTypeLabel(type) {
    return {
      "json": "AI 返回格式错误",
      "empty-ai": "AI 未返回内容",
      "frames": "抽帧失败",
      "ffmpeg": "FFmpeg 不可用",
      "cli": "本地 CLI 调用失败",
      "eagle-ai": "Eagle AI 配置问题",
      "file": "素材路径或预览不可用",
      "unknown": "未知错误"
    }[type] || "未知错误";
  }

  function getFileSize(filePath) {
    try {
      return fs && fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
    } catch (error) {
      return 0;
    }
  }

  function formatBytes(size) {
    if (!Number.isFinite(size) || size <= 0) return "大小未知";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  function safeFileName(value) {
    return String(value || "item").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").slice(0, 80) || "item";
  }

  function formatError(error) {
    if (!error) return "未知错误";
    if (error.message && error.stack) return `${error.message}`;
    return error.message ? error.message : String(error);
  }

  function setStatus(text) {
    els.statusText.textContent = text;
  }
})();
