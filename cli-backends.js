(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.VfxAiTaggerBackends = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DEFAULT_BACKENDS = ["claude", "codex", "eagle"];

  function createAnalysisPrompt(options) {
    const itemName = options.itemName || "未命名素材";
    const mediaKind = options.mediaKind || "image";
    const frameCount = Number(options.frameCount) || 1;
    const maxTags = Number(options.maxTags) || 10;
    const allowedTags = Array.isArray(options.allowedTags) ? options.allowedTags : [];
    const imagePaths = Array.isArray(options.imagePaths) ? options.imagePaths : [];
    const globalPrompt = String(options.globalPrompt || "").trim();
    const kindText = mediaKind === "video"
      ? `视频抽帧，共 ${frameCount} 张代表帧`
      : mediaKind === "animated"
        ? `动图抽帧，共 ${frameCount} 张代表帧`
        : "静态图或预览图";
    const parts = [
      "你是游戏视觉特效素材标签管理员。",
      `请分析素材：${itemName}`,
      `素材类型：${kindText}`,
      "只能从标签池中选择标签，禁止创造新标签，禁止输出不在标签池里的同义词。",
      `每个素材最多选择 ${maxTags} 个最有检索价值的标签。`,
      "优先判断特效类型、元素属性、颜色、用途、风格。",
      "如果是视频或动图，请综合多帧动作变化判断，不要只看首帧。",
      "必须只输出 JSON，不要输出 Markdown，不要使用代码块。",
      "每个标签都必须给出 0 到 1 的 confidence，表示你对该标签适合此素材的把握。",
      "JSON 格式：{\"tags\":[{\"name\":\"标签1\",\"confidence\":0.92},{\"name\":\"标签2\",\"confidence\":0.66}],\"confidence\":0.8,\"reason\":\"简短原因\"}",
      `标签池：${allowedTags.join("、")}`
    ];
    if (globalPrompt) {
      parts.splice(6, 0, `用户全局分析偏好：\n${globalPrompt}`, "用户全局分析偏好不能覆盖标签池、JSON 格式和置信度要求。");
    }
    if (imagePaths.length) {
      parts.push("本地图片/帧路径：");
      imagePaths.forEach((imagePath, index) => {
        parts.push(`${index + 1}. ${imagePath}`);
      });
      parts.push("请读取这些本地图片路径后再判断标签。");
    }
    return parts.join("\n");
  }

  function parseCliJson(output) {
    const text = String(output || "").trim();
    if (!text) throw new Error("CLI 没有返回内容");
    const direct = tryParseJson(text);
    if (direct) return normalizeCliObject(direct);

    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      const parsed = tryParseJson(fenced[1].trim());
      if (parsed) return normalizeCliObject(parsed);
    }

    for (let start = 0; start < text.length; start += 1) {
      if (text[start] !== "{") continue;
      for (let end = text.length - 1; end > start; end -= 1) {
        if (text[end] !== "}") continue;
        const parsed = tryParseJson(text.slice(start, end + 1));
        if (parsed) return normalizeCliObject(parsed);
      }
    }
    throw new Error("CLI 返回内容中没有可解析的标签 JSON");
  }

  function normalizeCliObject(value) {
    if (typeof value === "string") return parseCliJson(value);
    if (!value || typeof value !== "object") throw new Error("CLI 返回的 JSON 不是对象");
    if (Array.isArray(value.tags)) return value;
    for (const key of ["result", "text", "message", "content", "output"]) {
      if (typeof value[key] === "string") return parseCliJson(value[key]);
    }
    throw new Error("CLI 返回 JSON 缺少 tags 数组");
  }

  function tryParseJson(text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return null;
    }
  }

  function createCliPlan(backend, settings, prompt, imagePaths) {
    const normalized = String(backend || "").toLowerCase();
    const timeoutMs = clampTimeout(settings && settings.cliTimeoutSeconds);
    const cwd = stringOrDefault(settings && settings.cliWorkingDir, undefined);
    const images = Array.isArray(imagePaths) ? imagePaths.filter(Boolean) : [];
    if (normalized === "claude") {
      const command = stringOrDefault(settings && settings.claudeCommand, "claude");
      const args = [
        "--print",
        "--output-format",
        "text",
        "--no-session-persistence",
        "--permission-mode",
        "dontAsk"
      ];
      args.push(...splitExtraArgs(settings && settings.claudeExtraArgs));
      args.push(prompt);
      return { backend: normalized, command, args, cwd, timeoutMs };
    }
    if (normalized === "codex") {
      const command = stringOrDefault(settings && settings.codexCommand, "codex");
      const args = [
        "exec",
        "--skip-git-repo-check",
        "--sandbox",
        "read-only"
      ];
      if (cwd) args.push("--cd", cwd);
      const model = String(settings && settings.codexModel || "").trim();
      if (model) args.push("--model", model);
      args.push(...splitExtraArgs(settings && settings.codexExtraArgs));
      args.push(prompt);
      images.forEach((imagePath) => {
        args.push("--image", imagePath);
      });
      return { backend: normalized, command, args, cwd, timeoutMs };
    }
    throw new Error(`未知 CLI 后端：${backend}`);
  }

  function runCliBackend(options) {
    const execFile = options.execFile;
    const spawn = options.spawn;
    if (typeof spawn === "function") return runCliBackendWithSpawn(options, spawn);
    if (typeof execFile !== "function") throw new Error("当前环境无法调用本地 CLI");
    const plan = createCliPlan(options.backend, options.settings || {}, options.prompt || "", options.imagePaths || []);
    return new Promise((resolve, reject) => {
      let settled = false;
      let timeoutId = null;
      const child = execFile(plan.command, plan.args, {
        cwd: plan.cwd,
        timeout: plan.timeoutMs,
        windowsHide: true,
        maxBuffer: 20 * 1024 * 1024,
        shell: isWindowsCommandScript(plan.command)
      }, (error, stdout, stderr) => {
        if (settled) return;
        settled = true;
        if (timeoutId) clearTimeout(timeoutId);
        if (error) {
          const message = [error.message, stderr && String(stderr).trim()].filter(Boolean).join("\n");
          reject(new Error(message || `${plan.backend} CLI 调用失败`));
          return;
        }
        try {
          resolve({
            backend: plan.backend,
            object: parseCliJson(stdout),
            stdout: String(stdout || ""),
            stderr: String(stderr || "")
          });
        } catch (parseError) {
          reject(parseError);
        }
      });
      if (!settled && child && typeof child.kill === "function" && plan.timeoutMs > 0) {
        timeoutId = setTimeout(() => {
          if (settled) return;
          settled = true;
          try { child.kill(); } catch (error) {}
          reject(new Error(`${plan.backend} CLI 超时`));
        }, plan.timeoutMs + 1000);
      }
    });
  }

  function runCliBackendWithSpawn(options, spawn) {
    const plan = createCliPlan(options.backend, options.settings || {}, options.prompt || "", options.imagePaths || []);
    return new Promise((resolve, reject) => {
      let settled = false;
      let timeoutId = null;
      let stdout = "";
      let stderr = "";
      const child = spawn(plan.command, plan.args, {
        cwd: plan.cwd,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
        shell: isWindowsCommandScript(plan.command)
      });
      if (child.stdout && typeof child.stdout.on === "function") {
        child.stdout.on("data", (chunk) => { stdout += String(chunk || ""); });
      }
      if (child.stderr && typeof child.stderr.on === "function") {
        child.stderr.on("data", (chunk) => { stderr += String(chunk || ""); });
      }
      child.on("error", (error) => {
        if (settled) return;
        settled = true;
        if (timeoutId) clearTimeout(timeoutId);
        reject(error);
      });
      child.on("exit", (code, signal) => {
        if (settled) return;
        settled = true;
        if (timeoutId) clearTimeout(timeoutId);
        if (code !== 0) {
          reject(new Error([`${plan.backend} CLI 退出码 ${code}${signal ? `，信号 ${signal}` : ""}`, stderr.trim()].filter(Boolean).join("\n")));
          return;
        }
        try {
          resolve({
            backend: plan.backend,
            object: parseCliJson(stdout),
            stdout,
            stderr
          });
        } catch (parseError) {
          reject(parseError);
        }
      });
      if (!settled && child && typeof child.kill === "function" && plan.timeoutMs > 0) {
        timeoutId = setTimeout(() => {
          if (settled) return;
          settled = true;
          try { child.kill(); } catch (error) {}
          reject(new Error(`${plan.backend} CLI 超时`));
        }, plan.timeoutMs + 1000);
      }
    });
  }

  async function runCliBackends(options) {
    const failures = [];
    const backends = Array.isArray(options.backends) ? options.backends : [];
    for (const backend of backends) {
      try {
        const result = await runCliBackend({
          backend,
          settings: options.settings || {},
          prompt: options.prompt || "",
          imagePaths: options.imagePaths || [],
          execFile: options.execFile,
          spawn: options.spawn
        });
        return { ...result, failures };
      } catch (error) {
        failures.push({ backend, message: error instanceof Error ? error.message : String(error) });
      }
    }
    const detail = failures.map((failure) => `${failure.backend}: ${failure.message}`).join("；");
    throw new Error(detail ? `所有 CLI 后端均失败：${detail}` : "没有启用可用的 CLI 后端");
  }

  function splitExtraArgs(value) {
    const text = String(value || "").trim();
    if (!text) return [];
    const args = [];
    const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
    let match;
    while ((match = pattern.exec(text))) {
      args.push(match[1] ?? match[2] ?? match[3]);
    }
    return args;
  }

  function stringOrDefault(value, fallback) {
    const text = String(value || "").trim();
    return text || fallback;
  }

  function clampTimeout(value) {
    const seconds = Number(value);
    const safe = Number.isFinite(seconds) ? Math.min(Math.max(seconds, 10), 600) : 120;
    return safe * 1000;
  }

  function isWindowsCommandScript(command) {
    return typeof process !== "undefined"
      && process.platform === "win32"
      && /\.(cmd|bat)$/i.test(String(command || ""));
  }

  return {
    DEFAULT_BACKENDS,
    createAnalysisPrompt,
    parseCliJson,
    createCliPlan,
    runCliBackend,
    runCliBackends,
    splitExtraArgs
  };
});
