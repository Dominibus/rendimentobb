import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const langSource = await readFile(
  new URL("../js/lang.js", import.meta.url),
  "utf8"
);

const appSource = await readFile(
  new URL("../js/app.js", import.meta.url),
  "utf8"
);

const toolHTML = await readFile(
  new URL("../tool/index.html", import.meta.url),
  "utf8"
);

test("global language engine never triggers calculations or saves", () => {
  const rerenderBody = langSource.match(
    /function rerenderDynamic\(\)\{([\s\S]*?)\n  \}/
  )?.[1] || "";

  assert.doesNotMatch(rerenderBody, /runRealCalculation\s*\(/);
  assert.doesNotMatch(rerenderBody, /compareMortgages\s*\(/);
  assert.doesNotMatch(rerenderBody, /(?:window\.)?calculate\s*\(/);
  assert.doesNotMatch(rerenderBody, /saveAnalysis\s*\(/);
});

test("tool language refresh only rebuilds presentation", () => {
  const marker = "// LANGUAGE-ONLY REFRESH";
  const refreshSource = appSource.slice(appSource.indexOf(marker));
  const executableSource = refreshSource.replace(/\/\/.*$/gm, "");

  assert.ok(refreshSource.includes("rb_language_changed"));
  assert.doesNotMatch(executableSource, /window\.calculate\s*\(/);
  assert.doesNotMatch(executableSource, /saveAnalysis\s*\(/);
});

test("tool language refresh reformats cached KPI values locally", () => {
  const marker = "// LANGUAGE-ONLY REFRESH";
  const refreshSource = appSource.slice(appSource.indexOf(marker));

  assert.match(refreshSource, /renderUniversalKPI\s*\(/);
  assert.match(refreshSource, /profit-live/);
  assert.match(refreshSource, /revenue-live/);
  assert.match(refreshSource, /formatCurrency\s*\(/);
});

test("break-even unit follows the selected language", () => {
  assert.match(appSource, /payback\.toFixed\(1\) \+ t\(" anni", " years"\)/);
});

test("new simulations render every executive panel before any language switch", () => {
  const scoreMarker = "// Lo Score deve leggere esclusivamente lo snapshot della simulazione corrente.";
  const memoryMarker = "// 🧠 CITY MEMORY ENGINE";
  const start = appSource.indexOf(scoreMarker);
  const end = appSource.indexOf(memoryMarker, start);
  const initialRenderSource = appSource.slice(start, end);

  assert.match(initialRenderSource, /renderInvestmentScore\s*\(/);
  assert.match(initialRenderSource, /renderRiskMeter\s*\(/);
  assert.match(initialRenderSource, /renderInvestmentVerdict\s*\(/);
  assert.match(initialRenderSource, /renderInvestmentRanking\s*\(/);
  assert.match(initialRenderSource, /renderROIMarketComparison\s*\(/);
});

test("every static Tool translation has both Italian and English", () => {
  const translatedTags = toolHTML.match(/<[^>]+data-(?:it|en)=[^>]*>/gs) || [];
  const incompleteTags = translatedTags.filter(tag =>
    !(/\bdata-it=/.test(tag) && /\bdata-en=/.test(tag))
  );

  assert.deepEqual(incompleteTags, []);
});

test("dynamic score renderer uses the canonical language state", () => {
  assert.match(toolHTML, /window\.currentLang === "en"/);
  assert.doesNotMatch(toolHTML, /localStorage\.getItem\("lang"\)/);
});
