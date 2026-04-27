import test from 'node:test';
import assert from 'node:assert';
import { getAffiliateLinks } from './geoAffiliate.js';

test('getAffiliateLinks', async (t) => {
    const item = 'running shoes';
    const encodedItem = encodeURIComponent(item);

    await t.test('returns correct links for NL', () => {
        const links = getAffiliateLinks(item, 'NL');
        assert.strictEqual(links.length, 3);
        assert.strictEqual(links[0].store, 'Amazon');
        assert.ok(links[0].url.includes('amazon.nl'));
        assert.ok(links[0].url.includes(encodedItem));

        assert.strictEqual(links[1].store, 'Decathlon');
        assert.ok(links[1].url.includes('decathlon.nl'));
        assert.ok(links[1].url.includes(encodedItem));

        assert.strictEqual(links[2].store, 'Futurumshop');
        assert.ok(links[2].url.includes('futurumshop.nl'));
        assert.ok(links[2].url.includes(encodedItem));
    });

    await t.test('returns correct links for BE', () => {
        const links = getAffiliateLinks(item, 'BE');
        assert.strictEqual(links.length, 3);
        assert.strictEqual(links[0].store, 'Amazon');
        assert.ok(links[0].url.includes('amazon.de'));
        assert.ok(links[0].url.includes(encodedItem));

        assert.strictEqual(links[1].store, 'Decathlon');
        assert.ok(links[1].url.includes('decathlon.be'));
        assert.ok(links[1].url.includes(encodedItem));

        assert.strictEqual(links[2].store, 'AS Adventure');
        assert.ok(links[2].url.includes('asadventure.com'));
        assert.ok(links[2].url.includes(encodedItem));
    });

    await t.test('returns correct links for LU', () => {
        const links = getAffiliateLinks(item, 'LU');
        assert.strictEqual(links.length, 3);
        assert.strictEqual(links[0].store, 'Amazon');
        assert.ok(links[0].url.includes('amazon.de'));
        assert.ok(links[0].url.includes(encodedItem));

        assert.strictEqual(links[1].store, 'Decathlon');
        assert.ok(links[1].url.includes('decathlon.be'));
        assert.ok(links[1].url.includes(encodedItem));

        assert.strictEqual(links[2].store, 'AS Adventure');
        assert.ok(links[2].url.includes('asadventure.com'));
        assert.ok(links[2].url.includes(encodedItem));
    });

    await t.test('returns default links for other countries (e.g., US)', () => {
        const links = getAffiliateLinks(item, 'US');
        assert.strictEqual(links.length, 2);
        assert.strictEqual(links[0].store, 'Amazon');
        assert.ok(links[0].url.includes('amazon.com'));
        assert.ok(links[0].url.includes(encodedItem));

        assert.strictEqual(links[1].store, 'Decathlon');
        assert.ok(links[1].url.includes('decathlon.com'));
        assert.ok(links[1].url.includes(encodedItem));
    });

    await t.test('correctly encodes special characters in keyword', () => {
        const specialItem = 'trail shoes & socks';
        const encodedSpecial = encodeURIComponent(specialItem);
        const links = getAffiliateLinks(specialItem, 'US');

        assert.ok(links[0].url.includes(encodedSpecial));
        assert.ok(!links[0].url.includes('&socks')); // It should be encoded
    });
});
