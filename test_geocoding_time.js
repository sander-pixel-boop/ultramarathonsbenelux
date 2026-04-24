const fs = require('fs/promises');

const GEO_CACHE = {};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 5000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
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

async function main() {
    console.time("Load JSON");
    const races = JSON.parse(await fs.readFile('./races.json', 'utf8'));
    console.timeEnd("Load JSON");

    console.time("Geocoding");
    let count = 0;
    for (const race of races) {
        if (race.city) {
            const query = `${race.city}, ${race.country}`;
            if (!GEO_CACHE[query]) {
                count++;
            }
            const { lat, lon } = await geocode(race.city, race.country || '');
        }
    }
    console.timeEnd("Geocoding");
    console.log(`Unique queries: ${count}`);
}

main();
