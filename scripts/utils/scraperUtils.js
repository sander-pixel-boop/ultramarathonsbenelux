const cheerio = require('cheerio');

const GEO_CACHE = {};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 30000, retries = 5, retryDelay = 2000 } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            if (attempt === retries) {
                throw error;
            }
            await sleep(retryDelay * attempt); // exponential backoff
        }
    }
}

async function geocode(city, country) {
    if (!city) {
        return { lat: null, lon: null };
    }

    const query = `${city}, ${country}`;
    if (GEO_CACHE[query]) {
        return GEO_CACHE[query];
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.append("city", city);
    url.searchParams.append("country", country);
    url.searchParams.append("format", "json");
    url.searchParams.append("limit", "1");

    try {
        const response = await fetchWithTimeout(url.toString(), {
            headers: { "User-Agent": "BeneluxUltraRacesScraper/1.0" },
            timeout: 10000
        });
        const data = await response.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            GEO_CACHE[query] = { lat, lon };
            await sleep(1000); // Be nice to Nominatim API
            return { lat, lon };
        }
    } catch (e) {
        console.error(`Error geocoding ${query}: ${e.message}`);
    }

    GEO_CACHE[query] = { lat: null, lon: null };
    await sleep(1000);
    return { lat: null, lon: null };
}

async function verify_and_correct_race(race) {
    try {
        // User requested not to cross-reference the actual race website
        // We will process the text we already have from the aggregator instead
        const text = `${race.name || ''} ${race.distance || ''} ${race.date || ''}`;

        // Verify / Correct Date
        const currentDate = race.date || 'TBD';

        const monthMap = {
            "janvier": "01", "january": "01", "januari": "01",
            "février": "02", "february": "02", "februari": "02",
            "mars": "03", "march": "03", "maart": "03",
            "avril": "04", "april": "04",
            "mai": "05", "may": "05", "mei": "05",
            "juin": "06", "june": "06", "juni": "06",
            "juillet": "07", "july": "07", "juli": "07",
            "août": "08", "august": "08", "augustus": "08",
            "septembre": "09", "september": "09",
            "octobre": "10", "october": "10", "oktober": "10",
            "novembre": "11", "november": "11",
            "décembre": "12", "december": "12"
        };

        function normalizeDate(d) {
            if (!d || d === 'TBD') return null;
            const parts = d.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/);
            if (parts) {
                let dNum = parseInt(parts[1], 10);
                let mNum = parseInt(parts[2], 10);
                if (dNum < 1 || dNum > 31 || mNum < 1 || mNum > 12) return null;
                let day = parts[1].padStart(2, '0');
                let month = parts[2].padStart(2, '0');
                let year = parts[3];
                if (year.length === 2) year = "20" + year;
                return `${day}/${month}/${year}`;
            }
            return null;
        }

        function extractDates(text) {
            const dates = [];

            const textDateRegex = new RegExp(`\\b(\\d{1,2})\\s+(${Object.keys(monthMap).join('|')})\\s+(\\d{4})\\b`, 'gi');
            let match;
            while ((match = textDateRegex.exec(text)) !== null) {
                const day = match[1].padStart(2, '0');
                const month = monthMap[match[2].toLowerCase()];
                const year = match[3];
                dates.push(`${day}/${month}/${year}`);
            }

            const numericDateRegex = /\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/g;
            while ((match = numericDateRegex.exec(text)) !== null) {
                let dNum = parseInt(match[1], 10);
                let mNum = parseInt(match[2], 10);
                if (dNum < 1 || dNum > 31 || mNum < 1 || mNum > 12) continue;
                let day = match[1].padStart(2, '0');
                let month = match[2].padStart(2, '0');
                let year = match[3];
                if (year.length === 2) year = "20" + year;
                dates.push(`${day}/${month}/${year}`);
            }

            return dates;
        }

        const normCurrent = normalizeDate(currentDate);
        const foundDates = extractDates(text);

        if (currentDate === 'TBD' || !currentDate) {
            if (foundDates.length > 0) {
                race.date = foundDates[0];
            }
        } else if (normCurrent && foundDates.includes(normCurrent)) {
            // we already know this is a correct date, do nothing
            // wait, we can standardise the format!
            race.date = normCurrent;
        } else if (foundDates.length > 0) {
            race.date = foundDates[0];
        }

        // Verify / Correct Distance
        const currentDist = race.distance || 'Ultra';
        if (currentDist === 'Ultra' || !currentDist) {
            const distMatch = text.match(/\b\d{2,3}\s*(km|mi|miles)\b/i);
            if (distMatch) race.distance = distMatch[0];
        } else if (!text.includes(currentDist)) {
            const distMatch = text.match(/\b\d{2,3}\s*(km|mi|miles)\b/i);
            if (distMatch) race.distance = distMatch[0];
        }

        // Heuristic extraction for pSEO data points
        const elevRegex = /(?:D\+|elevation\s*gain|ascent|hoogtemeters|hoogteverschil)[^\d]*(\d{2,5})\s*m?|(\d{2,5})\s*m?\s*(?:D\+|elevation\s*gain|ascent|hoogtemeters|hoogteverschil)/i;
        const elevMatch = text.match(elevRegex);
        if (elevMatch) {
            race.elevation = (elevMatch[1] || elevMatch[2]) + 'm';
        }

        const terrainMatch = text.match(/\b(trail|gravel|road|asphalt|paved|track)\b/i);
        if (terrainMatch) {
            race.terrain = terrainMatch[1].toLowerCase();
        }

        if (/\butmb\b/i.test(text) || /\bUTMB\s*Index\b/i.test(text)) {
            race.utmb_index = true;
        }

    } catch (e) {
        // Ignored
    }

    return race;
}


function preloadGeoCache(races) {
    for (const race of races) {
        if (race.city && race.lat && race.lng) {
            const query = `${race.city}, ${race.country || ''}`;
            GEO_CACHE[query] = { lat: race.lat, lon: race.lng };
        }
    }
}

module.exports = { fetchWithTimeout, geocode, verify_and_correct_race, sleep, preloadGeoCache };
