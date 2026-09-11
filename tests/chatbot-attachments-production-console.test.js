import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("chatbot attachment diagnostics are silent in production", () => {
  const files = [
    "js/chatbot/pdf-extraction-engine.js",
    "js/chatbot/core/chatbot-file-dispatcher.js",
    "js/chatbot/document-engine.js",
    "js/chatbot/reasoning-engine.js"
  ];

  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /(^|\n)\s*console\.log\s*\(/, file);
  }

  const pdf = read(files[0]);
  assert.match(pdf, /window\.RB_DEBUG === true/);
  assert.match(pdf, /console\.error\("PDF Extraction Error"\)/);
});
