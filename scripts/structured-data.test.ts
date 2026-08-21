import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const testDirectory = fileURLToPath(new URL('.', import.meta.url));
const homepageSource = readFileSync(join(testDirectory, '..', 'app', 'page.tsx'), 'utf8');

test('homepage structured data describes the planner without claiming an unrated app rich result', () => {
  assert.match(homepageSource, /"@type": "CreativeWork"/);
  assert.doesNotMatch(homepageSource, /"@type": "SoftwareApplication"/);
  assert.doesNotMatch(homepageSource, /"@type": "WebApplication"/);
});
