const ALLOWED_COUNTRIES = new Set(['belgium', 'netherlands', 'luxembourg']);

export function getTranslatedCountry(country, translations) {
    if (!country) return country;
    const lowerCountry = country.toLowerCase();

    if (ALLOWED_COUNTRIES.has(lowerCountry) && Object.hasOwn(translations, lowerCountry)) {
        return translations[lowerCountry];
    }
    return country;
}

export function formatLocationStr(city, translatedCountry) {
    if (city) {
        return `${city}, ${translatedCountry}`;
    }
    return translatedCountry;
}
