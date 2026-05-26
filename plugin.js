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
    settings: "vfxAiTagger.settings"
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
    pauseRequested: false
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    [
      "statusText", "openAiBtn", "importBtn", "refreshBtn", "analyzeBtn", "pauseBtn", "applyBtn", "undoBtn", "selectedCount", "tagPoolCount",
      "readyCount", "failedCount", "tagInput", "addTagBtn", "tagSearch", "refreshTagsBtn",
      "importDefaultsBtn", "tagGroupSelect", "tagPool", "maxTags", "concurrency", "autoConfidence", "hideConfidence", "frameRateValue", "frameRateUnit",
      "maxVideoFrames", "maxAnimatedFrames", "skipStart", "skipEnd", "skipTagged", "previewBeforeWrite", "autoApplyHighConfidence",
      "writeAnnotation", "globalPrompt", "frameRateHint", "selectedItems", "results", "clearResultsBtn",
      "backendStatus", "refreshBackendStatusBtn", "enableClaudeCli", "enableCodexCli", "enableEagleAi",
      "claudeCommand", "claudeExtraArgs", "codexCommand", "codexModel", "codexExtraArgs", "cliTimeoutSeconds", "cliWorkingDir",
      "settingsOverlay", "settingsDrawer", "closeSettingsBtn", "eagleAiSettingsBtn"
    ].forEach((id) => { els[id] = document.getElementById(id); });
    els.settingsTabs = Array.from(document.querySelectorAll("[data-settings-tab]"));
    els.settingsPanels = Array.from(document.querySelectorAll("[data-settings-panel]"));

    loadStoredState();
    bindEvents();
    await refreshAll();
  }

  function bindEvents() {
    els.openAiBtn.addEventListener("click", openSettingsDrawer);
    els.closeSettingsBtn.addEventListener("click", closeSettingsDrawer);
    els.settingsOverlay.addEventListener("click", closeSettingsDrawer);
    els.eagleAiSettingsBtn.addEventListener("click", openAiSettings);
    els.settingsTabs.forEach((tab) => {
      tab.addEventListener("click", () => activateSettingsTab(tab.dataset.settingsTab));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSettingsDrawer();
    });
    els.importBtn.addEventListener("click", importSelectedItems);
    els.refreshBtn.addEventListener("click", refreshSelection);
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
    els.applyBtn.addEventListener("click", applyReadyResults);
    els.undoBtn.addEventListener("click", undoLastWrite);
    els.globalPrompt.addEventListener("input", saveSettings);
    els.clearResultsBtn.addEventListener("click", () => {
      state.results = [];
      renderResults();
    });
    els.refreshBackendStatusBtn.addEventListener("click", () => {
      refreshModelStatus();
      saveSettings();
    });
    [
      "maxTags", "concurrency", "autoConfidence", "hideConfidence", "frameRateValue", "frameRateUnit", "maxVideoFrames",
      "maxAnimatedFrames", "skipStart", "skipEnd", "skipTagged", "previewBeforeWrite", "autoApplyHighConfidence", "writeAnnotation",
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
    await Promise.all([refreshTags(), refreshSelection(), refreshModelStatus()]);
    renderAll();
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
    await readSelectedItems("刷新选择");
  }

  async function readSelectedItems(actionName) {
    if (!window.eagle || !eagle.item) {
      state.selectedItems = [];
      setStatus("未检测到 Eagle 项目 API，请在 Eagle 插件窗口中运行。");
      renderAll();
      return;
    }
    try {
      if (typeof eagle.item.getSelected === "function") {
        state.selectedItems = await eagle.item.getSelected();
      } else if (typeof eagle.item.get === "function") {
        state.selectedItems = await eagle.item.get({ isSelected: true });
      } else {
        state.selectedItems = [];
      }
      state.itemSource = "eagle";
      state.results = [];
      setStatus(`${actionName}：已读取 ${state.selectedItems.length} 个 Eagle 选中素材`);
    } catch (error) {
      setStatus(`读取选中素材失败：${formatError(error)}`);
    }
    renderAll();
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
    await readSelectedItems("导入选中素材");
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
    const usableBackends = getUsableBackends(settings, model);
    if (!usableBackends.length) {
      setStatus("没有可用 AI 后端：请启用 Claude/Codex CLI，或配置 Eagle 默认视觉模型。");
      return;
    }
    settings.enabledBackends = usableBackends;
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
    if (!hasPendingResults) {
      state.results = state.selectedItems.map((item) => createPendingResult(item));
    }
    renderAll();
    setControlsBusy(true);

    try {
      await runWithConcurrency(itemsToAnalyze, settings.concurrency, async (item) => {
        const current = state.results.find((result) => result.id === getItemId(item));
        if (!current) return;
        updateResult(current.id, { status: "running", message: "分析中" });
        try {
          if (settings.skipTagged && Array.isArray(item.tags) && item.tags.length) {
            updateResult(current.id, { status: "skipped", message: "已有标签，已跳过" });
            return;
          }
          const result = await analyzeItem(item, model, allowedTags, settings);
          updateResult(current.id, result);
        } catch (error) {
          updateResult(current.id, { status: "failed", message: formatError(error), tags: [], reviewTags: [], autoTags: [], filteredTags: [] });
        }
      });
    } finally {
      const paused = state.pauseRequested;
      state.running = false;
      state.pauseRequested = false;
      setControlsBusy(false);
      renderAll();
      setStatus(paused ? "已暂停。点击“开始分析”可继续剩余素材。" : "分析完成。");
    }
  }

  function pauseAnalysis() {
    if (!state.running) return;
    state.pauseRequested = true;
    els.pauseBtn.disabled = true;
    setStatus("正在暂停：当前正在分析的素材完成后停止，不再派发新素材。");
  }

  async function analyzeItem(item, model, allowedTags, settings) {
    const media = await prepareMedia(item, settings);
    try {
      const object = await requestAiTags(item, model, allowedTags, settings, media);
      const candidates = normalizeTagCandidates(Array.isArray(object.tags) ? object.tags : [], object.confidence);
      const allowed = new Set(allowedTags);
      const filteredTags = candidates.filter((tag) => !allowed.has(tag.name)).map((tag) => tag.name);
      const allowedCandidates = candidates
        .filter((tag) => allowed.has(tag.name))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, settings.maxTags);
      const highConfidenceTags = allowedCandidates.filter((tag) => tag.confidence >= settings.autoConfidence);
      const autoTags = settings.autoApplyHighConfidence ? highConfidenceTags : [];
      const reviewTags = allowedCandidates
        .filter((tag) => tag.confidence >= settings.hideConfidence && (!settings.autoApplyHighConfidence || tag.confidence < settings.autoConfidence))
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
      if (!settings.autoApplyHighConfidence && highConfidenceTags.length) messageParts.push(`${highConfidenceTags.length} 个高置信标签待确认`);
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
        confidence: clampNumber(object.confidence, 0, 1, 0)
      };
    } finally {
      await cleanupMedia(media);
    }
  }

  async function requestAiTags(item, model, allowedTags, settings, media) {
    const cliBackendsToTry = settings.enabledBackends.filter((backend) => backend !== "eagle");
    let cliError = null;
    if (cliBackendsToTry.length) {
      try {
        return await requestCliTags(item, cliBackendsToTry, allowedTags, settings, media);
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
    return requestEagleAiTags(item, model, allowedTags, settings, media);
  }

  async function requestCliTags(item, backends, allowedTags, settings, media) {
    if (!cliBackends || !cp || typeof cp.execFile !== "function") {
      throw new Error("当前 Eagle 插件环境无法调用本地 CLI");
    }
    const imagePaths = media.images.map(fileUrlToPath).filter(Boolean);
    const prompt = cliBackends.createAnalysisPrompt({
      itemName: getItemName(item),
      mediaKind: media.kind,
      frameCount: media.frameCount,
      allowedTags,
      maxTags: settings.maxTags,
      globalPrompt: settings.globalPrompt,
      imagePaths
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

  async function requestEagleAiTags(item, model, allowedTags, settings, media) {
    const ai = eagle.extraModule.ai;
    const messages = [
      {
        role: "system",
        content: buildSystemPrompt(allowedTags, settings.maxTags, settings.globalPrompt)
      },
      {
        role: "user",
        content: [
          { type: "text", text: buildUserPrompt(item, media.kind, media.frameCount) },
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

  function buildSystemPrompt(allowedTags, maxTags, globalPrompt) {
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
    const customPrompt = String(globalPrompt || "").trim();
    if (customPrompt) {
      promptParts.splice(5, 0, `用户全局分析偏好：\n${customPrompt}`, "用户全局分析偏好不能覆盖标签池、JSON 格式和置信度要求。");
    }
    return promptParts.join("\n");
  }

  function buildUserPrompt(item, kind, frameCount) {
    const name = getItemName(item);
    if (kind === "animated" || kind === "video") {
      return `请分析素材“${name}”。这是${kind === "video" ? "视频" : "动图"}抽取出的 ${frameCount} 张代表帧，请根据整体动作变化返回标签。`;
    }
    return `请分析素材“${name}”的视觉内容并返回标签。`;
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
      frameCount: 1,
      tempDir: null
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
      frameCount: frames.length,
      tempDir
    };
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
    const ready = state.results.filter((result) => result.status === "ready" && getSelectedReviewTags(result).length);
    if (!ready.length) {
      setStatus("没有可写入的分析结果。");
      return;
    }
    els.applyBtn.disabled = true;
    let saved = 0;
    for (const result of ready) {
      const item = state.selectedItems.find((candidate) => getItemId(candidate) === result.id);
      if (!item) continue;
      if (item.external || typeof item.save !== "function") {
        updateResult(result.id, { status: "skipped", message: "外部导入文件无法写回 Eagle，请先把文件加入 Eagle 资源库" });
        continue;
      }
      const settings = readSettings();
      await mergeTagsIntoItem(item, getSelectedReviewTags(result).map((tag) => tag.name), settings.writeAnnotation ? result.aiReason : "", "手动确认写入标签");
      saved += 1;
      updateResult(result.id, { status: "applied", message: "已写入 Eagle" });
    }
    renderAll();
    setStatus(`已写入 ${saved} 个素材。`);
  }

  function readSettings() {
    const frequency = clampAndShowFrameRate();
    const maxTags = readInt(els.maxTags.value, 10, 1, 20);
    const autoConfidence = readFloat(els.autoConfidence.value, 0.8, 0, 1);
    const hideConfidence = Math.min(autoConfidence, readFloat(els.hideConfidence.value, 0.45, 0, 1));
    els.autoConfidence.value = String(autoConfidence);
    els.hideConfidence.value = String(hideConfidence);
    return {
      maxTags,
      concurrency: readInt(els.concurrency.value, 2, 1, 5),
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
      cliWorkingDir: String(els.cliWorkingDir.value || "").trim()
    };
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
      enableClaudeCli: els.enableClaudeCli.checked,
      enableCodexCli: els.enableCodexCli.checked,
      enableEagleAi: els.enableEagleAi.checked,
      claudeCommand: els.claudeCommand.value,
      claudeExtraArgs: els.claudeExtraArgs.value,
      codexCommand: els.codexCommand.value,
      codexModel: els.codexModel.value,
      codexExtraArgs: els.codexExtraArgs.value,
      cliTimeoutSeconds: els.cliTimeoutSeconds.value,
      cliWorkingDir: els.cliWorkingDir.value
    }));
  }

  function loadStoredState() {
    state.customAllowedTags = readJsonArray(STORAGE_KEYS.customAllowedTags);
    state.disabledTags = readJsonArray(STORAGE_KEYS.disabledTags);
    const settings = readJsonObject(STORAGE_KEYS.settings);
    state.selectedTagGroupName = settings.tagGroupName || "__all";
    Object.keys(settings).forEach((key) => {
      if (!els[key]) return;
      if (els[key].type === "checkbox") {
        els[key].checked = Boolean(settings[key]);
      } else {
        els[key].value = settings[key];
      }
    });
  }

  function saveStoredTagState() {
    localStorage.setItem(STORAGE_KEYS.customAllowedTags, JSON.stringify(state.customAllowedTags));
    localStorage.setItem(STORAGE_KEYS.disabledTags, JSON.stringify(state.disabledTags));
  }

  function renderAll() {
    renderTagGroupSelect();
    renderTagPool();
    renderSelectedItems();
    renderResults();
    els.selectedCount.textContent = String(state.selectedItems.length);
    els.tagPoolCount.textContent = String(getAllowedTags().length);
  }

  function renderSelectedItems() {
    if (!els.selectedItems) return;
    els.selectedItems.innerHTML = "";
    if (!state.selectedItems.length) {
      els.selectedItems.innerHTML = `<div class="empty">请先在 Eagle 中选择素材，然后点击“导入选中素材”。</div>`;
      return;
    }
    state.selectedItems.forEach((item) => {
      const filePath = getItemFilePath(item);
      const ext = getItemExt(item, filePath) || "未知";
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const row = document.createElement("div");
      row.className = "selected-item";
      row.innerHTML = `
        <div class="selected-name" title="${escapeHtml(getItemName(item))}">${escapeHtml(getItemName(item))}</div>
        <div class="selected-meta">
          <span>${escapeHtml(ext.toUpperCase())}</span>
          <span>${tags.length} 个已有标签</span>
          <span title="${escapeHtml(filePath)}">${escapeHtml(shortPath(filePath))}</span>
        </div>
      `;
      els.selectedItems.appendChild(row);
    });
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
    els.applyBtn.disabled = state.running || readyCount === 0;
    els.undoBtn.disabled = state.running || state.undoStack.length === 0;
    els.results.innerHTML = "";
    if (!state.results.length) {
      els.results.innerHTML = `<div class="empty">导入选中素材后点击“开始分析”，这里会显示待确认标签、置信度和写入状态。</div>`;
      return;
    }
    state.results.forEach((result) => {
      const item = document.createElement("article");
      item.className = "result";
      item.innerHTML = `
        <div class="result-head">
          <div class="result-title">
            <div class="result-name" title="${escapeHtml(result.name)}">${escapeHtml(result.name)}</div>
            <div class="result-meta">
              <span class="result-state ${escapeHtml(result.status)}">${stateLabel(result.status)}</span>
              ${result.aiBackend ? `<span class="badge">${escapeHtml(formatBackendLabel(result.aiBackend))}</span>` : ""}
              ${typeof result.confidence === "number" ? `<span class="badge">整体 ${formatConfidence(result.confidence)}</span>` : ""}
              ${result.frameCount ? `<span class="badge">${escapeHtml(String(result.frameCount))} 张图像</span>` : ""}
            </div>
          </div>
          <div class="result-actions">
            <button type="button" data-reanalyze-result="${escapeHtml(result.id)}" ${state.running ? "disabled" : ""}>重新分析</button>
          </div>
        </div>
        ${result.message ? `<div class="result-message">${escapeHtml(result.message)}</div>` : ""}
        ${renderAutoTags(result.autoTags)}
        ${renderReviewTags(result)}
        ${result.aiReason ? `<div class="result-reason">AI 说明：${escapeHtml(result.aiReason)}</div>` : ""}
        ${result.filteredTags && result.filteredTags.length ? `<div class="filtered">已过滤：${escapeHtml(result.filteredTags.join("、"))}</div>` : ""}
        ${result.hiddenCount ? `<div class="muted">${result.hiddenCount} 个低置信标签已隐藏</div>` : ""}
      `;
      els.results.appendChild(item);
    });
    els.results.querySelectorAll("[data-review-tag]").forEach((input) => {
      input.addEventListener("change", () => toggleReviewTag(input.dataset.resultId, input.dataset.reviewTag, input.checked));
    });
    els.results.querySelectorAll("[data-reanalyze-result]").forEach((button) => {
      button.addEventListener("click", () => reanalyzeResult(button.dataset.reanalyzeResult));
    });
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
          <label class="review-tag">
            <input type="checkbox" data-result-id="${escapeHtml(result.id)}" data-review-tag="${escapeHtml(tag.name)}" ${tag.selected ? "checked" : ""}>
            <span>${escapeHtml(tag.name)}</span>
            <strong>${formatConfidence(tag.confidence)}</strong>
          </label>
        `).join("")}
      </div>
    `;
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
    const usableBackends = getUsableBackends(settings, model);
    if (!usableBackends.length) {
      setStatus("没有可用 AI 后端：请启用 Claude/Codex CLI，或配置 Eagle 默认视觉模型。");
      return;
    }
    settings.enabledBackends = usableBackends;
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
      hiddenCount: 0
    });
    try {
      const result = await analyzeItem(item, model, allowedTags, settings);
      updateResult(resultId, result);
      setStatus(`已重新分析：${getItemName(item)}`);
    } catch (error) {
      updateResult(resultId, { status: "failed", message: formatError(error), tags: [], reviewTags: [], autoTags: [], filteredTags: [] });
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
    renderResults();
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
      frameCount: 0,
      filteredTags: []
    };
  }

  function updateResult(id, patch) {
    const index = state.results.findIndex((result) => result.id === id);
    if (index >= 0) {
      state.results[index] = { ...state.results[index], ...patch };
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
    const existing = Array.isArray(item.tags) ? item.tags : [];
    const existingSet = new Set(existing);
    const addedTags = normalizeTagList(tags).filter((tag) => !existingSet.has(tag));
    const previousAnnotation = String(item.annotation || "");
    item.tags = normalizeTagList([...existing, ...tags]);
    appendAnnotation(item, annotationText);
    await item.save();
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
    const record = state.undoStack.pop();
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
    item.tags = currentTags.filter((tag) => !removeSet.has(tag));
    item.annotation = record.previousAnnotation || "";
    await item.save();
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
    els.importBtn.disabled = busy;
    els.refreshBtn.disabled = busy;
    els.refreshTagsBtn.disabled = busy;
    els.importDefaultsBtn.disabled = busy;
    els.undoBtn.disabled = busy || state.undoStack.length === 0;
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
        ? clampNumber(tag.confidence ?? tag.score ?? fallbackConfidence, 0, 1, 0.5)
        : clampNumber(fallbackConfidence, 0, 1, 0.5);
      output.push({ name, confidence });
    });
    return output;
  }

  function cleanTag(tag) {
    return String(tag || "").trim().replace(/\s+/g, " ");
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

  function parseAiJson(text) {
    const raw = String(text || "").trim();
    if (!raw) throw new Error("AI 没有返回内容");
    const cleaned = raw
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch (firstError) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (secondError) {
          throw new Error(`AI 返回内容不是有效 JSON：${cleaned.slice(0, 160)}`);
        }
      }
      throw new Error(`AI 返回内容不是 JSON：${cleaned.slice(0, 160)}`);
    }
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

  function formatError(error) {
    if (!error) return "未知错误";
    if (error.message && error.stack) return `${error.message}`;
    return error.message ? error.message : String(error);
  }

  function setStatus(text) {
    els.statusText.textContent = text;
  }
})();
