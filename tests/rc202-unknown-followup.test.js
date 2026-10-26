import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function engine(lastIntent, extraFiles = []) {
  const context = {window: {rbChatMemory: {lastIntent, lastCity: 'roma'}}, console};
  vm.createContext(context);
  for (const name of ['semantic-router', 'entity-engine', 'intent-engine', ...extraFiles]) {
    vm.runInContext(readFileSync(new URL(`../js/chatbot/core/${name}.js`, import.meta.url), 'utf8'), context);
  }
  return context.window;
}

for (const previous of ['market_analysis', 'roi_analysis', 'pms_bookings']) {
  for (const message of ['asdfgh xyz???', 'qwerty zxcv', '???', 'non ho capito']) {
    test(`unrecognized request does not inherit ${previous}: ${message}`, () => {
      const result = engine(previous).rbDetectIntent(message);
      assert.equal(result.intent, 'generic');
      assert.equal(result.confidence, 0);
      assert.notEqual(result.category, 'followup');
    });
  }
  for (const message of ['continua', 'puoi approfondire?', 'tell me more', 'go on']) {
    test(`explicit continuation keeps ${previous}: ${message}`, () => {
      const result = engine(previous).rbDetectIntent(message);
      assert.equal(result.intent, previous);
      assert.equal(result.category, 'followup');
    });
  }
}

test('a fresh request overrides the previous topic', () => {
  const window = engine('market_analysis');
  assert.equal(window.rbDetectIntent('cashflow').intent, 'cashflow_analysis');
  assert.equal(window.rbDetectIntent('mutuo').intent, 'mortgage_analysis');
  assert.equal(window.rbDetectIntent('ROI').intent, 'roi_analysis');
});

test('a continuation without a previous topic is still generic', () => {
  assert.equal(engine(null).rbDetectIntent('continua').intent, 'generic');
});

for (const lastIntent of [null, 'market_analysis', 'roi_analysis', 'pms_bookings']) {
  test(`orchestrator clarifies unknown input with remembered financial context: ${lastIntent}`, async () => {
    const window = engine(lastIntent, ['practical-guide', 'chatbot-orchestrator']);
    window.lastAnalysisData = {city:'roma',roi:21.6,net:8627.28};
    const result = await window.rbProcessAIMessage('asdfgh xyz???');
    assert.equal(result.success, true, JSON.stringify(result));
    assert.equal(result.response.metadata.mode, 'clarification');
    assert.match(result.response.textIT, /Non ho una risposta verificata/);
    assert.match(result.response.textEN, /do not have a verified answer/);
    assert.doesNotMatch(result.response.textIT, /8.627|21,6|mercato/i);
    assert.equal(result.response.actions.length, 0);
  });
}
