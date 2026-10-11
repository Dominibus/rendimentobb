import test from 'node:test';
import assert from 'node:assert/strict';
import { safeAuthDestination, createAuthActionGuard } from '../js/auth-safety.js';
const origin = 'https://www.rendimentobb.it';
test('login redirects reject external, malformed and unapproved destinations', () => {
  for (const destination of ['https://evil.example/tool/', '//evil.example', 'javascript:alert(1)', '/\\evil.example', '/api/delete-lead', '/login/', '/dashboard-leads/', 'https://user:pass@www.rendimentobb.it/tool/', '/tool/\n']) {
    assert.equal(safeAuthDestination(destination, null, origin), '/dashboard/', destination);
  }
  assert.equal(safeAuthDestination('/tool/?mode=analysis#results', null, origin), '/tool/?mode=analysis#results');
  assert.equal(safeAuthDestination('/mutui/', null, origin), '/mutui/');
  assert.equal(safeAuthDestination('//evil.example', 'Roma', origin), '/immobili/roma/');
  assert.equal(safeAuthDestination(null, 'unknown', origin), '/dashboard/');
});
test('concurrent auth actions run once and recover after success and rejection', async () => {
  const guard = createAuthActionGuard(); let release; let calls = 0;
  const first = guard.run(async () => { calls++; await new Promise(resolve => { release = resolve; }); });
  assert.equal(guard.busy, true);
  assert.equal(await guard.run(async () => { calls++; }), false);
  release(); assert.equal(await first, true); assert.equal(calls, 1); assert.equal(guard.busy, false);
  await assert.rejects(guard.run(async () => { throw new Error('network'); }), /network/);
  assert.equal(guard.busy, false);
  assert.equal(await guard.run(async () => { calls++; }), true); assert.equal(calls, 2);
});
