const assert = require("node:assert/strict");
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
  assert.ok(codex.args.indexOf("PROMPT") < codex.args.indexOf("--image"));
});

test("createCliPlan resolves common Windows CLI shim paths before spawning", () => {
  const env = {
    APPDATA: "C:\\Users\\me\\AppData\\Roaming",
    LOCALAPPDATA: "C:\\Users\\me\\AppData\\Local",
    USERPROFILE: "C:\\Users\\me",
    PATH: "C:\\Windows\\System32"
  };
  const existing = new Set([
    "C:\\Users\\me\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\node_modules\\@openai\\codex-win32-x64\\vendor\\x86_64-pc-windows-msvc\\codex\\codex.exe",
    "C:\\Users\\me\\.local\\bin\\claude.exe"
  ]);
  const fileExists = (filePath) => existing.has(filePath);

  const codex = backends.createCliPlan("codex", { codexCommand: "codex" }, "PROMPT", [], { env, fileExists });
  const codexCmd = backends.createCliPlan("codex", { codexCommand: "codex.cmd" }, "PROMPT", [], { env, fileExists });
  const claude = backends.createCliPlan("claude", { claudeCommand: "claude" }, "PROMPT", [], { env, fileExists });

  assert.equal(codex.command, "C:\\Users\\me\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\node_modules\\@openai\\codex-win32-x64\\vendor\\x86_64-pc-windows-msvc\\codex\\codex.exe");
  assert.equal(codexCmd.command, "C:\\Users\\me\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\node_modules\\@openai\\codex-win32-x64\\vendor\\x86_64-pc-windows-msvc\\codex\\codex.exe");
  assert.equal(claude.command, "C:\\Users\\me\\.local\\bin\\claude.exe");
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

test("runCliBackend prefers spawn with ignored stdin when available", async () => {
  const calls = [];
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
      queueMicrotask(() => {
        stdoutHandlers.data(Buffer.from('{"tags":[{"name":"火焰","confidence":0.91}],"reason":"spawn ok"}'));
        handlers.exit(0, null);
      });
      return {
        stdout: { on(event, handler) { stdoutHandlers[event] = handler; } },
        stderr: { on(event, handler) { stderrHandlers[event] = handler; } },
        on(event, handler) { handlers[event] = handler; return this; },
        kill() {}
      };
    }
  });

  assert.equal(result.backend, "codex");
  assert.deepEqual(result.object.tags, [{ name: "火焰", confidence: 0.91 }]);
  assert.equal(calls[0].options.stdio[0], "ignore");
});
