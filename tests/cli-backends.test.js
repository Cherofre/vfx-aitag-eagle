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
  }, "PROMPT");

  assert.equal(claude.command, "C:\\Tools\\claude.cmd");
  assert.deepEqual(claude.args.slice(0, 3), ["--print", "--output-format", "text"]);
  assert.ok(claude.args.includes("--allowedTools"));
  assert.equal(claude.timeoutMs, 90000);

  const codex = backends.createCliPlan("codex", {
    codexCommand: "codex",
    codexModel: "gpt-5.4",
    cliTimeoutSeconds: 120,
    cliWorkingDir: "I:\\AI\\Vibe Coding\\vfx-aitag-eagle"
  }, "PROMPT");

  assert.equal(codex.command, "codex");
  assert.deepEqual(codex.args.slice(0, 2), ["exec", "--skip-git-repo-check"]);
  assert.ok(codex.args.includes("--model"));
  assert.ok(codex.args.includes("gpt-5.4"));
  assert.ok(codex.args.includes("--image") === false);
});

test("runCliBackends falls back after a failed backend and parses the first success", async () => {
  const attempts = [];
  const result = await backends.runCliBackends({
    backends: ["claude", "codex"],
    settings: {
      claudeCommand: "claude",
      codexCommand: "codex",
      cliTimeoutSeconds: 30,
      cliWorkingDir: process.cwd()
    },
    prompt: "PROMPT",
    execFile: (command, args, options, callback) => {
      attempts.push(command);
      if (command === "claude") {
        callback(new Error("not logged in"), "", "auth failed");
        return { kill() {} };
      }
      callback(null, '{"tags":[{"name":"能量","confidence":0.88}],"reason":"ok"}', "");
      return { kill() {} };
    }
  });

  assert.deepEqual(attempts, ["claude", "codex"]);
  assert.equal(result.backend, "codex");
  assert.deepEqual(result.object.tags, [{ name: "能量", confidence: 0.88 }]);
  assert.equal(result.failures.length, 1);
});
