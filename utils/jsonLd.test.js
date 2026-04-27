import { test } from 'node:test';
import assert from 'node:assert';
import { safeJsonLd } from './jsonLd.js';

test('safeJsonLd escapes dangerous characters', () => {
  const input = {
    name: 'Test <script>alert(1)</script>',
    description: 'A & B > C',
    unicode: '\u2028 and \u2029'
  };
  const result = safeJsonLd(input);

  assert.strictEqual(result.includes('<'), false, 'Should not contain <');
  assert.strictEqual(result.includes('>'), false, 'Should not contain >');
  assert.strictEqual(result.includes('&'), false, 'Should not contain &');
  assert.strictEqual(result.includes('\u2028'), false, 'Should not contain \u2028');
  assert.strictEqual(result.includes('\u2029'), false, 'Should not contain \u2029');

  assert.strictEqual(result.includes('\\u003c'), true, 'Should contain \\u003c');
  assert.strictEqual(result.includes('\\u003e'), true, 'Should contain \\u003e');
  assert.strictEqual(result.includes('\\u0026'), true, 'Should contain \\u0026');
  assert.strictEqual(result.includes('\\u2028'), true, 'Should contain \\u2028');
  assert.strictEqual(result.includes('\\u2029'), true, 'Should contain \\u2029');

  // Verify it's still valid JSON (when unescaped or parsed by a JSON parser)
  const parsed = JSON.parse(result);
  assert.deepStrictEqual(parsed, input);
});
