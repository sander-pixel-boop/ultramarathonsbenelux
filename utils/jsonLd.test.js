import test from 'node:test';
import assert from 'node:assert';
import { safeJsonLd } from './jsonLd.js';

test('safeJsonLd', async (t) => {
    await t.test('escapes < character', () => {
        const input = { a: '<script>' };
        const output = safeJsonLd(input);
        assert.strictEqual(output, '{"a":"\\u003cscript\\u003e"}');
    });

    await t.test('escapes > character', () => {
        const input = { a: '</script>' };
        const output = safeJsonLd(input);
        assert.strictEqual(output, '{"a":"\\u003c/script\\u003e"}');
    });

    await t.test('escapes & character', () => {
        const input = { a: 'A & B' };
        const output = safeJsonLd(input);
        assert.strictEqual(output, '{"a":"A \\u0026 B"}');
    });

    await t.test('escapes line separator', () => {
        const input = { a: 'A\u2028B' };
        const output = safeJsonLd(input);
        assert.strictEqual(output, '{"a":"A\\u2028B"}');
    });

    await t.test('escapes paragraph separator', () => {
        const input = { a: 'A\u2029B' };
        const output = safeJsonLd(input);
        assert.strictEqual(output, '{"a":"A\\u2029B"}');
    });
});
