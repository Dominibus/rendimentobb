import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const appSource = await readFile(
  new URL("../js/app.js", import.meta.url),
  "utf8"
);

const toolHTML = await readFile(
  new URL("../tool/index.html", import.meta.url),
  "utf8"
);

test("simulator flow logs are disabled unless debug mode is explicit", () => {
  const toolScript = toolHTML.slice(toolHTML.indexOf("const toolDebug"));

  assert.match(toolScript, /window\.RB_DEBUG === true/);
  assert.doesNotMatch(toolScript, /console\.log\s*\(/);
});

test("normal user alerts do not emit warnings or traces in production", () => {
  const alertStart = appSource.indexOf("window.rbAlert = function");
  const alertEnd = appSource.indexOf("// =====================================\n// 💣 GLOBAL MODAL FIX", alertStart);
  const alertSource = appSource.slice(alertStart, alertEnd);

  assert.match(alertSource, /window\.RB_DEBUG === true/);
  assert.match(alertSource, /appDebugWarn/);
  assert.match(alertSource, /console\.trace/);
});

test("simulator fallback warnings are debug-only", () => {
  assert.match(appSource, /const appDebugWarn =/);
  assert.match(appSource, /window\.RB_DEBUG === true/);

  const callsOutsideHelper = appSource
    .replace(/const appDebugWarn = \([\s\S]*?\n};/, "")
    .match(/console\.warn\s*\(/g) || [];

  assert.equal(callsOutsideHelper.length, 0);
});
