import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import test from 'node:test';

test('--version prints 1.0.0', () => {
  const out = execFileSync(process.execPath, ['./bin/cli.mjs', '--version'], {
    encoding: 'utf8',
  }).trim();
  assert.equal(out, '1.0.0');
});

test('missing OPENVIDEO_API_KEY returns JSON-RPC -32002 error', () => {
  const res = spawnSync(process.execPath, ['./bin/cli.mjs'], {
    input: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' }) + '\n',
    encoding: 'utf8',
    env: { ...process.env, OPENVIDEO_API_KEY: '' },
  });
  assert.equal(res.status, 0);
  const parsed = JSON.parse(res.stdout.trim());
  assert.equal(parsed.id, 1);
  assert.equal(parsed.error.code, -32002);
});
