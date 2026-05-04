import test from 'node:test';
import assert from 'node:assert';
import { getGearRecommendations } from './gear.js';

test('getGearRecommendations', async (t) => {
    await t.test('standard kit when conditions are mild', () => {
        const result = getGearRecommendations(500, 50, '2024-06-15');
        assert.deepStrictEqual(result, {
            highElevation: false,
            technicalTrail: false,
            winter: false,
            standardKit: true
        });
    });

    await t.test('high elevation recommendations', () => {
        assert.strictEqual(getGearRecommendations(1501, 50, '2024-06-15').highElevation, true);
        assert.strictEqual(getGearRecommendations(1500, 50, '2024-06-15').highElevation, false);
    });

    await t.test('technical trail recommendations', () => {
        assert.strictEqual(getGearRecommendations(500, 71, '2024-06-15').technicalTrail, true);
        assert.strictEqual(getGearRecommendations(500, 70, '2024-06-15').technicalTrail, false);
    });

    await t.test('winter kit recommendations', () => {
        assert.strictEqual(getGearRecommendations(500, 50, '2024-01-15').winter, true);
        assert.strictEqual(getGearRecommendations(500, 50, '2024-02-15').winter, true);
        assert.strictEqual(getGearRecommendations(500, 50, '2024-12-15').winter, true);
        assert.strictEqual(getGearRecommendations(500, 50, '2024-03-15').winter, false);
        assert.strictEqual(getGearRecommendations(500, 50, '2024-11-15').winter, false);
        assert.strictEqual(getGearRecommendations(500, 50, null).winter, false);
        assert.strictEqual(getGearRecommendations(500, 50, '').winter, false);
    });

    await t.test('multiple recommendations can be active simultaneously', () => {
        const result = getGearRecommendations(2000, 80, '2024-01-15');
        assert.deepStrictEqual(result, {
            highElevation: true,
            technicalTrail: true,
            winter: true,
            standardKit: false
        });
    });
});
