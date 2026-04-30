import { test } from 'node:test';
import assert from 'node:assert';
import { parseStandardDate } from './date.js';

test('parseStandardDate handles empty and invalid inputs', () => {
    assert.strictEqual(parseStandardDate(null), null);
    assert.strictEqual(parseStandardDate(undefined), null);
    assert.strictEqual(parseStandardDate(''), null);
    assert.strictEqual(parseStandardDate('   '), null);
    assert.strictEqual(parseStandardDate('invalid date string'), null);
    assert.strictEqual(parseStandardDate('2024/13/01'), null); // Invalid month
    assert.strictEqual(parseStandardDate('31/13/2024'), null); // Invalid month
});

test('parseStandardDate handles YYYY-MM-DD formats', () => {
    assert.deepStrictEqual(parseStandardDate('2024-05-15'), { year: 2024, month: 5, day: 15 });
    assert.deepStrictEqual(parseStandardDate('2024/12/31'), { year: 2024, month: 12, day: 31 });
    assert.deepStrictEqual(parseStandardDate('2024.01.01'), { year: 2024, month: 1, day: 1 });
    assert.deepStrictEqual(parseStandardDate(' 2024-05-15 '), { year: 2024, month: 5, day: 15 }); // with whitespace
});

test('parseStandardDate handles DD-MM-YYYY formats', () => {
    assert.deepStrictEqual(parseStandardDate('15-05-2024'), { year: 2024, month: 5, day: 15 });
    assert.deepStrictEqual(parseStandardDate('31/12/2024'), { year: 2024, month: 12, day: 31 });
    assert.deepStrictEqual(parseStandardDate('01.01.2024'), { year: 2024, month: 1, day: 1 });
    assert.deepStrictEqual(parseStandardDate('1-5-2024'), { year: 2024, month: 5, day: 1 });
});

test('parseStandardDate handles DD.MM.YY formats', () => {
    assert.deepStrictEqual(parseStandardDate('15-05-24'), { year: 2024, month: 5, day: 15 });
    assert.deepStrictEqual(parseStandardDate('31/12/24'), { year: 2024, month: 12, day: 31 });
    assert.deepStrictEqual(parseStandardDate('01.01.24'), { year: 2024, month: 1, day: 1 });
});

test('parseStandardDate handles DD Month YYYY formats', () => {
    assert.deepStrictEqual(parseStandardDate('15 May 2024'), { year: 2024, month: 5, day: 15 });
    assert.deepStrictEqual(parseStandardDate('1 may 2024'), { year: 2024, month: 5, day: 1 });
    assert.deepStrictEqual(parseStandardDate('31 December 2024'), { year: 2024, month: 12, day: 31 });
    assert.deepStrictEqual(parseStandardDate('01 January 2024'), { year: 2024, month: 1, day: 1 });
    assert.deepStrictEqual(parseStandardDate('15 Aug 2024'), { year: 2024, month: 8, day: 15 });
    assert.deepStrictEqual(parseStandardDate('1 sep 2024'), { year: 2024, month: 9, day: 1 });
    assert.deepStrictEqual(parseStandardDate('31 Dec 2024'), { year: 2024, month: 12, day: 31 });
    assert.deepStrictEqual(parseStandardDate('01 Jan 2024'), { year: 2024, month: 1, day: 1 });
    assert.deepStrictEqual(parseStandardDate('15    May   2024'), { year: 2024, month: 5, day: 15 }); // multiple spaces
});

test('parseStandardDate uses memoization effectively', () => {
    const dateStr = '2024-06-20';
    const firstCall = parseStandardDate(dateStr);
    const secondCall = parseStandardDate(dateStr);

    assert.deepStrictEqual(firstCall, { year: 2024, month: 6, day: 20 });
    assert.deepStrictEqual(secondCall, { year: 2024, month: 6, day: 20 });

    // Objects should have same values but be different instances to prevent mutation issues
    assert.notStrictEqual(firstCall, secondCall);
});

test('parseStandardDate returns distinct instances when returning null from memo', () => {
    const invalidDateStr = 'invalid';
    const firstCall = parseStandardDate(invalidDateStr);
    const secondCall = parseStandardDate(invalidDateStr);

    assert.strictEqual(firstCall, null);
    assert.strictEqual(secondCall, null);
});
