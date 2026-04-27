import { test } from 'node:test';
import assert from 'node:assert';
import { parseDistance, parseElevation } from './distance.js';

test('parseDistance handles various formats', () => {
    assert.strictEqual(parseDistance('50km'), 50);
    assert.strictEqual(parseDistance('100 km'), 100);
    assert.strictEqual(parseDistance('50mi'), 50 * 1.60934);
    assert.strictEqual(parseDistance('100 mi'), 100 * 1.60934);
    assert.strictEqual(parseDistance('24h'), 240);
    assert.strictEqual(parseDistance('6 h'), 60);
    assert.strictEqual(parseDistance('80'), 80);
    assert.strictEqual(parseDistance(''), 0);
    assert.strictEqual(parseDistance(null), 0);
    assert.strictEqual(parseDistance('Invalid'), 0);
});

test('parseElevation handles various formats', () => {
    assert.strictEqual(parseElevation('1000m'), 1000);
    assert.strictEqual(parseElevation('500 D+'), 500);
    assert.strictEqual(parseElevation('2,000m'), 2000);
    assert.strictEqual(parseElevation('3000'), 3000);
    assert.strictEqual(parseElevation(''), 0);
    assert.strictEqual(parseElevation(null), 0);
    assert.strictEqual(parseElevation('No elevation'), 0);
});

test('parseDistance and parseElevation use memoization', () => {
    const dist1 = parseDistance('100km');
    const dist2 = parseDistance('100km');
    assert.strictEqual(dist1, dist2);

    const elev1 = parseElevation('500m');
    const elev2 = parseElevation('500m');
    assert.strictEqual(elev1, elev2);
});
