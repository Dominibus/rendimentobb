import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const responseSource = await readFile(
  new URL("../js/chatbot/core/response-engine.js", import.meta.url),
  "utf8"
);

test("today attention requests exclude future routine tasks", () => {
  assert.match(responseSource, /isTodayAttentionRequest/);
  assert.match(responseSource, /immediateAttentionCodes/);
  assert.match(responseSource, /"arrival_today"/);
  assert.match(responseSource, /"departure_today"/);
  assert.match(responseSource, /"guest_issue_urgent"/);

  const immediateBlock = responseSource.match(
    /const immediateAttentionCodes = new Set\(\[([\s\S]*?)\]\);/
  )?.[1] || "";

  assert.doesNotMatch(immediateBlock, /tourist_tax_pending/);
  assert.doesNotMatch(immediateBlock, /guest_registration_incomplete/);
  assert.doesNotMatch(immediateBlock, /cleaning_to_schedule/);
});

test("attention responses can expose every action in the current result", () => {
  const attentionStart = responseSource.indexOf("// 🤖 BOOKINGS REQUIRING ATTENTION");
  const attentionEnd = responseSource.indexOf("// 📅 BOOKINGS BY MONTH", attentionStart);
  const attentionSource = responseSource.slice(attentionStart, attentionEnd);

  assert.match(attentionSource, /\.slice\(0, 5\)/);
});
