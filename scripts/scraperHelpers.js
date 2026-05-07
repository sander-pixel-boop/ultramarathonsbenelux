const fs = require('fs/promises');

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
            timeout: 5000,
            retries: 3
        });

        if (!response.ok) {
           console.log(`Geocoding failed for ${query} with status ${response.status}`);
           return { lat: null, lon: null };
        }

        const data = await response.json();
        if (data && data.length > 0) {
            GEO_CACHE[query] = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            await sleep(1000); // Respect nominatim API limits
            return GEO_CACHE[query];
        }
    } catch (error) {
        console.error(`Geocoding error for ${query}:`, error.message);
    }

    GEO_CACHE[query] = { lat: null, lon: null }; // negative cache
    return GEO_CACHE[query];
}

async function loadGeoCache() {
    try {
        const racesData = await fs.readFile('data/races.json', 'utf8');
        const races = JSON.parse(racesData);
        for (const race of races) {
            if (race.city && race.lat && race.lng) {
                const query = `${race.city}, ${race.country || ''}`;
                GEO_CACHE[query] = { lat: race.lat, lon: race.lng };
            }
        }
        console.log(`Preloaded ${Object.keys(GEO_CACHE).length} coordinates from existing races.json`);
    } catch (e) {
        console.log("No existing races.json found to preload geocache.");
    }
}

async function saveRawData(filename, data) {
    try {
        await fs.mkdir('data/raw', { recursive: true });
        await fs.writeFile(`data/raw/${filename}.json`, JSON.stringify(data, null, 2));
        console.log(`Saved ${data.length} races to data/raw/${filename}.json`);
    } catch (e) {
        console.error(`Failed to save raw data for ${filename}:`, e);
    }
}

module.exports = {
    sleep,
    fetchWithTimeout,
    geocode,
    loadGeoCache,
    saveRawData
};
