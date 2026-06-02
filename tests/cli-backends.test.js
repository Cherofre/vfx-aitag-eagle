const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const backends = require("../cli-backends.js");

test("parseCliJson extracts tag JSON from plain and wrapped CLI output", () => {
  assert.deepEqual(
    backends.parseCliJson('{"tags":[{"name":"火焰","confidence":0.9}],"confidence":0.8,"reason":"ok"}'),
    { tags: [{ name: "火焰", confidence: 0.9 }], confidence: 0.8, reason: "ok" }
  );

  assert.deepEqual(
    backends.parseCliJson('前置说明\n```json\n{"tags":[{"name":"冰冻","confidence":0.7}],"reason":"cold"}\n```\n后置说明'),
    { tags: [{ name: "冰冻", confidence: 0.7 }], reason: "cold" }
  );

  assert.deepEqual(
    backends.parseCliJson('{"type":"result","result":"{\\"tags\\":[{\\"name\\":\\"闪电\\",\\"confidence\\":0.82}],\\"reason\\":\\"zap\\"}"}'),
    { tags: [{ name: "闪电", confidence: 0.82 }], reason: "zap" }
  );
});

test("createAnalysisPrompt includes allowed tags, media paths, and JSON contract", () => {
  const prompt = backends.createAnalysisPrompt({
    itemName: "skill_fire.mov",
    includeTitleInPrompt: true,
    mediaKind: "video",
    frameCount: 2,
    allowedTags: ["火焰", "冰冻"],
    maxTags: 3,
    globalPrompt: "优先判断技能用途",
    imagePaths: ["C:\\tmp\\frame-001.jpg", "C:\\tmp\\frame-002.jpg"]
  });

  assert.match(prompt, /skill_fire\.mov/);
  assert.match(prompt, /只能从标签池中选择/);
  assert.match(prompt, /火焰、冰冻/);
  assert.match(prompt, /C:\\tmp\\frame-001\.jpg/);
  assert.match(prompt, /优先判断技能用途/);
  assert.match(prompt, /"tags"/);
});

test("createAnalysisPrompt omits misleading titles unless explicitly enabled", () => {
  const withoutTitle = backends.createAnalysisPrompt({
    itemName: "皮肤教程标题可能误导.mov",
    includeTitleInPrompt: false,
    mediaKind: "video",
    frameCount: 3,
    allowedTags: ["火焰", "教程"],
    maxTags: 2,
    imagePaths: ["C:\\tmp\\frame-001.jpg"]
  });

  assert.doesNotMatch(withoutTitle, /皮肤教程标题可能误导/);
  assert.match(withoutTitle, /这个素材|素材类型/);

  const withTitle = backends.createAnalysisPrompt({
    itemName: "皮肤教程标题可能误导.mov",
    includeTitleInPrompt: true,
    mediaKind: "video",
    frameCount: 3,
    allowedTags: ["火焰", "教程"],
    maxTags: 2,
    imagePaths: ["C:\\tmp\\frame-001.jpg"]
  });

  assert.match(withTitle, /皮肤教程标题可能误导\.mov/);
});

test("parseCliJson repairs common AI JSON variants", () => {
  assert.deepEqual(
    backends.parseCliJson("```json\n{“labels”:[{“name”:“烟雾”,“confidence”:0.74,}],“reason”:“soft smoke”,}\n```"),
    { labels: [{ name: "烟雾", confidence: 0.74 }], reason: "soft smoke", tags: [{ name: "烟雾", confidence: 0.74 }] }
  );

  assert.deepEqual(
    backends.parseCliJson('["火焰","闪电"]'),
    { tags: ["火焰", "闪电"], confidence: 0.5, reason: "" }
  );
});

test("createCliPlan builds Claude and Codex non-interactive commands", () => {
  const claude = backends.createCliPlan("claude", {
    claudeCommand: "C:\\Tools\\claude.cmd",
    cliTimeoutSeconds: 90,
    cliWorkingDir: "I:\\AI\\Vibe Coding\\vfx-aitag-eagle"
  }, "PROMPT", ["C:\\tmp\\vfx-ai-tagger-123\\frame-001.jpg"]);

  assert.equal(claude.command, "C:\\Tools\\claude.cmd");
  assert.deepEqual(claude.args.slice(0, 3), ["--print", "--output-format", "text"]);
  assert.equal(claude.args[claude.args.indexOf("--permission-mode") + 1], "bypassPermissions");
  assert.equal(claude.args.includes("--allowedTools"), false);
  assert.equal(claude.args.includes("--allowed-tools"), false);
  assert.ok(claude.args.includes("--add-dir"));
  assert.equal(claude.args[claude.args.indexOf("--add-dir") + 1], "C:\\tmp\\vfx-ai-tagger-123");
  assert.ok(claude.args.indexOf("--add-dir") < claude.args.indexOf("--"));
  assert.ok(claude.args.indexOf("--") < claude.args.indexOf("PROMPT"));
  assert.equal(claude.args.at(-1), "PROMPT");
  assert.equal(claude.timeoutMs, 90000);

  const codex = backends.createCliPlan("codex", {
    codexCommand: "C:\\Tools\\codex.cmd",
    codexModel: "gpt-5.4",
    cliTimeoutSeconds: 120,
    cliWorkingDir: "I:\\AI\\Vibe Coding\\vfx-aitag-eagle"
  }, "PROMPT", ["C:\\tmp\\frame-001.jpg"]);

  assert.equal(codex.command, "C:\\Tools\\codex.cmd");
  assert.deepEqual(codex.args.slice(0, 2), ["exec", "--skip-git-repo-check"]);
  assert.equal(codex.args.includes("--ask-for-approval"), false);
  assert.ok(codex.args.includes("--model"));
  assert.ok(codex.args.includes("gpt-5.4"));
  assert.ok(codex.args.includes("--image"));
  assert.equal(codex.args.includes("PROMPT"), false);
  assert.equal(codex.args.at(-1), "-");
  assert.equal(codex.stdin, "PROMPT");
  assert.ok(codex.args.indexOf("--image") < codex.args.indexOf("-"));
});

test("createCliPlan keeps Codex argv short by piping prompts and capping images", () => {
  const longPrompt = "请分析这些特效帧。".repeat(4000);
  const images = Array.from({ length: 60 }, (_, index) => `C:\\very-long-folder-name-${index}\\1999同人皮肤-全流程设计练习-游戏特效原创作品-Magesbox-frame-${String(index).padStart(3, "0")}.jpg`);

  const codex = backends.createCliPlan("codex", {
    codexCommand: "codex",
    codexModel: "gpt-5.4",
    cliTimeoutSeconds: 120
  }, longPrompt, images);

  const imageCount = codex.args.filter((arg) => arg === "--image").length;
  const argvText = [codex.command, ...codex.args].join(" ");

  assert.equal(codex.stdin, longPrompt);
  assert.equal(codex.args.includes(longPrompt), false);
  assert.equal(codex.args.at(-1), "-");
  assert.ok(imageCount <= 16);
  assert.ok(argvText.length < 8000, `argv length should stay comfortably below Windows limits, got ${argvText.length}`);
});

test("createCliPlan resolves common Windows CLI shim paths before spawning", () => {
  const env = {
    APPDATA: "C:\\Users\\me\\AppData\\Roaming",
    LOCALAPPDATA: "C:\\Users\\me\\AppData\\Local",
    USERPROFILE: "C:\\Users\\me",
    PATH: "C:\\Windows\\System32"
  };
  const existing = new Set([
    "C:\\Users\\me\\AppData\\Local\\OpenAI\\Codex\\bin\\codex.exe",
    "C:\\Users\\me\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\node_modules\\@openai\\codex-win32-x64\\vendor\\x86_64-pc-windows-msvc\\codex\\codex.exe",
    "C:\\Users\\me\\.local\\bin\\claude.exe"
  ]);
  const fileExists = (filePath) => existing.has(filePath);

  const codex = backends.createCliPlan("codex", { codexCommand: "codex" }, "PROMPT", [], { env, fileExists });
  const codexCmd = backends.createCliPlan("codex", { codexCommand: "codex.cmd" }, "PROMPT", [], { env, fileExists });
  const claude = backends.createCliPlan("claude", { claudeCommand: "claude" }, "PROMPT", [], { env, fileExists });

  assert.equal(codex.command, "C:\\Users\\me\\AppData\\Local\\OpenAI\\Codex\\bin\\codex.exe");
  assert.equal(codexCmd.command, "C:\\Users\\me\\AppData\\Local\\OpenAI\\Codex\\bin\\codex.exe");
  assert.equal(claude.command, "C:\\Users\\me\\.local\\bin\\claude.exe");
});

test("createCliPlan discovers Codex under variable local install folders", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "vfx-codex-path-"));
  try {
    const codexDir = path.join(root, "OpenAI", "Codex", "app-1.2.3", "bin");
    const codexExe = path.join(codexDir, "codex.exe");
    fs.mkdirSync(codexDir, { recursive: true });
    fs.writeFileSync(codexExe, "");

    const codex = backends.createCliPlan("codex", { codexCommand: "codex" }, "PROMPT", [], {
      env: {
        APPDATA: path.join(root, "Roaming"),
        LOCALAPPDATA: root,
        USERPROFILE: path.join(root, "User"),
        PATH: ""
      },
      fs,
      path
    });

    assert.equal(codex.command, codexExe);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("createCliHealthChecks builds lightweight command plans without AI prompts", () => {
  const env = {
    APPDATA: "C:\\Users\\me\\AppData\\Roaming",
    LOCALAPPDATA: "C:\\Users\\me\\AppData\\Local",
    USERPROFILE: "C:\\Users\\me",
    PATH: "C:\\Windows\\System32"
  };
  const existing = new Set([
    "C:\\Users\\me\\.local\\bin\\claude.exe",
    "C:\\Users\\me\\AppData\\Local\\OpenAI\\Codex\\bin\\codex.exe"
  ]);
  const checks = backends.createCliHealthChecks(["claude", "codex", "eagle"], {
    claudeCommand: "claude",
    codexCommand: "codex",
    cliWorkingDir: "I:\\AI\\Vibe Coding\\vfx-aitag-eagle"
  }, {
    env,
    fileExists: (filePath) => existing.has(filePath)
  });

  assert.deepEqual(checks.map((check) => check.backend), ["claude", "codex", "eagle"]);
  assert.equal(checks[0].ok, true);
  assert.equal(checks[0].command, "C:\\Users\\me\\.local\\bin\\claude.exe");
  assert.deepEqual(checks[0].args, ["--version"]);
  assert.equal(checks[1].ok, true);
  assert.equal(checks[1].command, "C:\\Users\\me\\AppData\\Local\\OpenAI\\Codex\\bin\\codex.exe");
  assert.deepEqual(checks[1].args, ["--version"]);
  assert.equal(checks[2].ok, false);
  assert.equal(checks[2].command, "");
  assert.match(checks[2].message, /Eagle AI/);
  assert.equal(checks.some((check) => check.args && check.args.includes("PROMPT")), false);
});

test("runCliBackends falls back after a failed backend and parses the first success", async () => {
  const attempts = [];
  const result = await backends.runCliBackends({
    backends: ["claude", "codex"],
    settings: {
      claudeCommand: "C:\\Tools\\claude.cmd",
      codexCommand: "C:\\Tools\\codex.cmd",
      cliTimeoutSeconds: 30,
      cliWorkingDir: process.cwd()
    },
    prompt: "PROMPT",
    execFile: (command, args, options, callback) => {
      attempts.push(command);
      if (command.endsWith("claude.cmd")) {
        callback(new Error("not logged in"), "", "auth failed");
        return { kill() {} };
      }
      callback(null, '{"tags":[{"name":"能量","confidence":0.88}],"reason":"ok"}', "");
      return { kill() {} };
    }
  });

  assert.deepEqual(attempts, ["C:\\Tools\\claude.cmd", "C:\\Tools\\codex.cmd"]);
  assert.equal(result.backend, "codex");
  assert.deepEqual(result.object.tags, [{ name: "能量", confidence: 0.88 }]);
  assert.equal(result.failures.length, 1);
});

test("runCliBackends falls back when a backend admits it could not read image frames", async () => {
  const attempts = [];
  const result = await backends.runCliBackends({
    backends: ["claude", "codex"],
    settings: {
      claudeCommand: "C:\\Tools\\claude.cmd",
      codexCommand: "C:\\Tools\\codex.cmd",
      cliTimeoutSeconds: 30,
      cliWorkingDir: process.cwd()
    },
    prompt: "PROMPT",
    imagePaths: ["C:\\tmp\\frame-001.jpg"],
    execFile: (command, args, options, callback) => {
      attempts.push(command);
      if (command.endsWith("claude.cmd")) {
        callback(null, '{"tags":[{"name":"爆炸","confidence":0.9}],"confidence":0.5,"reason":"未能读取实际图片帧，仅依据文件名推断"}', "");
        return { kill() {} };
      }
      callback(null, '{"tags":[{"name":"能量","confidence":0.88}],"reason":"read image ok"}', "");
      return { kill() {} };
    }
  });

  assert.deepEqual(attempts, ["C:\\Tools\\claude.cmd", "C:\\Tools\\codex.cmd"]);
  assert.equal(result.backend, "codex");
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0].message, /未能读取图片帧/);
});

test("runCliBackend pipes Codex prompt through stdin when using spawn", async () => {
  const calls = [];
  let stdinText = "";
  const result = await backends.runCliBackend({
    backend: "codex",
    settings: {
      codexCommand: "codex",
      cliTimeoutSeconds: 30,
      cliWorkingDir: process.cwd()
    },
    prompt: "PROMPT",
    imagePaths: [],
    spawn: (command, args, options) => {
      calls.push({ command, args, options });
      const handlers = {};
      const stdoutHandlers = {};
      const stderrHandlers = {};
      const stdin = {
        write(chunk) { stdinText += String(chunk || ""); },
        end() {}
      };
      queueMicrotask(() => {
        stdoutHandlers.data(Buffer.from('{"tags":[{"name":"火焰","confidence":0.91}],"reason":"spawn ok"}'));
        handlers.exit(0, null);
      });
      return {
        stdin,
        stdout: { on(event, handler) { stdoutHandlers[event] = handler; } },
        stderr: { on(event, handler) { stderrHandlers[event] = handler; } },
        on(event, handler) { handlers[event] = handler; return this; },
        kill() {}
      };
    }
  });

  assert.equal(result.backend, "codex");
  assert.deepEqual(result.object.tags, [{ name: "火焰", confidence: 0.91 }]);
  assert.equal(calls[0].options.stdio[0], "pipe");
  assert.equal(calls[0].args.at(-1), "-");
  assert.equal(stdinText, "PROMPT");
});
