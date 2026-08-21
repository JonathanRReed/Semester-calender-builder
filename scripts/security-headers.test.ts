import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const testDirectory = fileURLToPath(new URL('.', import.meta.url));
const headers = readFileSync(join(testDirectory, '..', 'public', '_headers'), 'utf8');

void test('security headers allow the automatically injected Cloudflare analytics beacon', () => {
  assert.match(headers, /script-src[^;]*https:\/\/static\.cloudflareinsights\.com/);
  assert.match(headers, /connect-src[^;]*'self'/);
});
