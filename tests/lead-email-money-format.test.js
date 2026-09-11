import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(
  new URL("../api/send-lead.js", import.meta.url),
  "utf8"
);

const start = source.indexOf("function formatMoney(");
const end = source.indexOf("function formatCity(", start);
const formatMoneySource = source.slice(start, end);

const context = { Intl };
vm.createContext(context);
vm.runInContext(
  `const safe = n => Number.isFinite(Number(n)) ? Number(n) : 0;\n${formatMoneySource}`,
  context
);

test("Italian lead emails use grouped Italian currency", () => {
  assert.equal(context.formatMoney(17097.91, "it"), "17.097,91 €");
  assert.equal(context.formatMoney(22500, "it"), "22.500 €");
});

test("English lead emails use grouped English currency", () => {
  assert.equal(context.formatMoney(17097.91, "en"), "€17,097.91");
  assert.equal(context.formatMoney(22500, "en"), "€22,500");
});

test("both user and admin email templates use the shared formatter", () => {
  const uses = source.match(/formatMoney\(/g) || [];
  assert.ok(uses.length >= 8);
  assert.match(source, /formatMoney\(profit, detectedLang\)/);
  assert.match(source, /formatMoney\(profit, "it"\)/);
});
