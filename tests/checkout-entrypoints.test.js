import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const homepage = await readFile(new URL("../index.html", import.meta.url), "utf8");
const checkout = await readFile(new URL("../api/create-checkout-session.js", import.meta.url), "utf8");

test("upgrade popup uses authenticated purchase flow for both paid plans", () => {
  assert.doesNotMatch(homepage, /buy\.stripe\.com\//);
  assert.match(homepage, /triggerUpgradeFlow\(\{plan:'investor',source:'upgrade-modal'\}\)/);
  assert.match(homepage, /triggerUpgradeFlow\(\{plan:'pro',source:'upgrade-modal'\}\)/);
  assert.match(checkout, /guardedCheckout\(/);
});
