import test from 'node:test';
import assert from 'node:assert';
import { sanitizeUrl } from './sanitizeUrl.js';

test('sanitizeUrl', async (t) => {
    await t.test('returns # for empty, null, or undefined input', () => {
        assert.strictEqual(sanitizeUrl(''), '#');
        assert.strictEqual(sanitizeUrl(null), '#');
        assert.strictEqual(sanitizeUrl(undefined), '#');
    });

    await t.test('returns the original URL for allowed protocols', () => {
        assert.strictEqual(sanitizeUrl('http://example.com'), 'http://example.com');
        assert.strictEqual(sanitizeUrl('https://example.com'), 'https://example.com');
        assert.strictEqual(sanitizeUrl('mailto:test@example.com'), 'mailto:test@example.com');
        assert.strictEqual(sanitizeUrl('tel:+123456789'), 'tel:+123456789');
    });

    await t.test('returns original URL for relative paths', () => {
        assert.strictEqual(sanitizeUrl('/path/to/resource'), '/path/to/resource');
        assert.strictEqual(sanitizeUrl('path/to/resource'), 'path/to/resource');
    });

    await t.test('returns # for unsafe protocols', () => {
        assert.strictEqual(sanitizeUrl('javascript:alert(1)'), '#');
        assert.strictEqual(sanitizeUrl('data:text/html,<html></html>'), '#');
        assert.strictEqual(sanitizeUrl('vbscript:msgbox(1)'), '#');
    });

    await t.test('returns # for XSS bypass attempts using control characters and whitespace', () => {
        assert.strictEqual(sanitizeUrl(' javascript:alert(1)'), '#');
        assert.strictEqual(sanitizeUrl('j a v a s c r i p t :alert(1)'), '#');
        assert.strictEqual(sanitizeUrl('\x01javascript:alert(1)'), '#');
        assert.strictEqual(sanitizeUrl('java\nscript:alert(1)'), '#');
        assert.strictEqual(sanitizeUrl('javascript\t:alert(1)'), '#');
        assert.strictEqual(sanitizeUrl('JaVaScRiPt:alert(1)'), '#');
    });

    await t.test('returns # for unsafe protocols with control characters (bypass test)', () => {
        assert.strictEqual(sanitizeUrl(' javascript:alert(1)'), '#');
        assert.strictEqual(sanitizeUrl('java\nscript:alert(1)'), '#');
        assert.strictEqual(sanitizeUrl('\x14javascript:alert(1)'), '#');
        assert.strictEqual(sanitizeUrl('j\x01avascript:alert(1)'), '#');
        assert.strictEqual(sanitizeUrl('j\x02avascript:alert(1)'), '#');
    });

    await t.test('returns # for malformed URLs that cause URL constructor to throw', () => {
        // A URL that is invalid even with a base
        assert.strictEqual(sanitizeUrl('http://example.com:80:80'), '#');
    });
});
