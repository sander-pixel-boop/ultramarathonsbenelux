import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getAffiliateLinks } from './geoAffiliate.js';

describe('geoAffiliate.js', () => {
    describe('getAffiliateLinks', () => {
        it('should return NL specific links when country is NL', () => {
            const keyword = 'running shoes';
            const links = getAffiliateLinks(keyword, 'NL');

            assert.strictEqual(links.length, 3);

            const stores = links.map(l => l.store);
            assert.ok(stores.includes('Amazon'));
            assert.ok(stores.includes('Decathlon'));
            assert.ok(stores.includes('Futurumshop'));

            const amazonLink = links.find(l => l.store === 'Amazon');
            assert.ok(amazonLink.url.includes('amazon.nl'));
            assert.ok(amazonLink.url.includes(encodeURIComponent(keyword)));

            const decathlonLink = links.find(l => l.store === 'Decathlon');
            assert.ok(decathlonLink.url.includes('decathlon.nl'));

            const futurumLink = links.find(l => l.store === 'Futurumshop');
            assert.ok(futurumLink.url.includes('futurumshop.nl'));
        });

        it('should return BE specific links when country is BE', () => {
            const keyword = 'socks';
            const links = getAffiliateLinks(keyword, 'BE');

            assert.strictEqual(links.length, 3);

            const stores = links.map(l => l.store);
            assert.ok(stores.includes('Amazon'));
            assert.ok(stores.includes('Decathlon'));
            assert.ok(stores.includes('AS Adventure'));

            const amazonLink = links.find(l => l.store === 'Amazon');
            assert.ok(amazonLink.url.includes('amazon.de'));

            const decathlonLink = links.find(l => l.store === 'Decathlon');
            assert.ok(decathlonLink.url.includes('decathlon.be'));

            const asAdventureLink = links.find(l => l.store === 'AS Adventure');
            assert.ok(asAdventureLink.url.includes('asadventure.com'));
        });

        it('should return BE specific links when country is LU', () => {
            const links = getAffiliateLinks('bag', 'LU');
            assert.strictEqual(links.length, 3);
            assert.ok(links.find(l => l.store === 'AS Adventure'));
        });

        it('should return default links for unknown countries', () => {
            const keyword = 'watch';
            const links = getAffiliateLinks(keyword, 'US');

            assert.strictEqual(links.length, 2);

            const stores = links.map(l => l.store);
            assert.ok(stores.includes('Amazon'));
            assert.ok(stores.includes('Decathlon'));

            const amazonLink = links.find(l => l.store === 'Amazon');
            assert.ok(amazonLink.url.includes('amazon.com'));

            const decathlonLink = links.find(l => l.store === 'Decathlon');
            assert.ok(decathlonLink.url.includes('decathlon.com'));
        });

        it('should correctly encode special characters in keyword', () => {
            const keyword = 'shoe & bag';
            const encodedKeyword = encodeURIComponent(keyword);
            const links = getAffiliateLinks(keyword, 'NL');

            links.forEach(link => {
                assert.ok(link.url.includes(encodedKeyword));
                assert.ok(!link.url.includes('shoe & bag'));
            });
        });

        it('should use environment variable tags when provided', () => {
            const originalEnv = { ...process.env };

            process.env.NEXT_PUBLIC_AMAZON_TAG = 'custom-amazon-tag';
            process.env.NEXT_PUBLIC_DECATHLON_TAG = 'custom-decathlon-tag';
            process.env.NEXT_PUBLIC_FUTURUMSHOP_TAG = 'custom-futurum-tag';

            try {
                const links = getAffiliateLinks('shoes', 'NL');

                const amazonLink = links.find(l => l.store === 'Amazon');
                assert.ok(amazonLink.url.includes('tag=custom-amazon-tag'));

                const decathlonLink = links.find(l => l.store === 'Decathlon');
                assert.ok(decathlonLink.url.includes('affiliate=custom-decathlon-tag'));

                const futurumLink = links.find(l => l.store === 'Futurumshop');
                assert.ok(futurumLink.url.includes('affiliate=custom-futurum-tag'));
            } finally {
                // Restore original env
                process.env.NEXT_PUBLIC_AMAZON_TAG = originalEnv.NEXT_PUBLIC_AMAZON_TAG;
                process.env.NEXT_PUBLIC_DECATHLON_TAG = originalEnv.NEXT_PUBLIC_DECATHLON_TAG;
                process.env.NEXT_PUBLIC_FUTURUMSHOP_TAG = originalEnv.NEXT_PUBLIC_FUTURUMSHOP_TAG;
            }
        });
    });
});
