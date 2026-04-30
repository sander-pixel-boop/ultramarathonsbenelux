import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getTranslatedCountry, formatLocationStr } from './country.js';

describe('country.js', () => {
    describe('getTranslatedCountry', () => {
        const translations = {
            belgium: 'België',
            netherlands: 'Nederland',
            luxembourg: 'Luxemburg'
        };

        it('should translate matching countries regardless of case', () => {
            assert.strictEqual(getTranslatedCountry('Belgium', translations), 'België');
            assert.strictEqual(getTranslatedCountry('belgium', translations), 'België');
            assert.strictEqual(getTranslatedCountry('BELGIUM', translations), 'België');
        });

        it('should return the original country if no translation is found', () => {
            assert.strictEqual(getTranslatedCountry('Germany', translations), 'Germany');
            assert.strictEqual(getTranslatedCountry('France', translations), 'France');
        });

        it('should return null or undefined if country is null or undefined', () => {
            assert.strictEqual(getTranslatedCountry(null, translations), null);
            assert.strictEqual(getTranslatedCountry(undefined, translations), undefined);
            assert.strictEqual(getTranslatedCountry('', translations), '');
        });
    });

    describe('formatLocationStr', () => {
        it('should return "city, translatedCountry" when city is provided', () => {
            assert.strictEqual(formatLocationStr('Brussels', 'België'), 'Brussels, België');
            assert.strictEqual(formatLocationStr('Amsterdam', 'Nederland'), 'Amsterdam, Nederland');
        });

        it('should return translatedCountry when city is not provided', () => {
            assert.strictEqual(formatLocationStr(null, 'België'), 'België');
            assert.strictEqual(formatLocationStr(undefined, 'Nederland'), 'Nederland');
            assert.strictEqual(formatLocationStr('', 'Luxemburg'), 'Luxemburg');
        });
    });
});
