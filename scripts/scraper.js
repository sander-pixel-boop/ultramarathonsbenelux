const fs = require('fs/promises');
const { preloadGeoCache, verify_and_correct_race, geocode } = require('./utils/scraperUtils');

const scrape_ultraned = require('./scrapers/ultraned');
const scrape_hardloopkalender = require('./scrapers/hardloopkalender');
const scrape_finishers = require('./scrapers/finishers');
const scrape_trail_running = require('./scrapers/trail_running');
const scrape_ultraracecalendar = require('./scrapers/ultraracecalendar');
const scrape_ahotu = require('./scrapers/ahotu');
const scrape_duv = require('./scrapers/duv');

async function main() {
    let all_races = [];

    try {
        const existingRaces = JSON.parse(await fs.readFile('data/races.json', 'utf8'));
        preloadGeoCache(existingRaces);
        console.log(`Preloaded coordinates from existing races.json`);
    } catch (e) {
        console.log("No existing races.json found to preload geocache.");
    }

    console.log("Scraping DUV...");
    const duv_races = await scrape_duv();
    all_races = all_races.concat(duv_races);

    console.log("Scraping Ultraned...");
    const ultraned_races = await scrape_ultraned();
    all_races = all_races.concat(ultraned_races);

    console.log("Scraping Hardloopkalender...");
    const hardloopkalender_races = await scrape_hardloopkalender();
    all_races = all_races.concat(hardloopkalender_races);

    console.log("Scraping Finishers...");
    const finishers_races = await scrape_finishers();
    all_races = all_races.concat(finishers_races);

    console.log("Scraping Trail-running.eu...");
    const trail_races = await scrape_trail_running();
    all_races = all_races.concat(trail_races);

    console.log("Scraping Ultraracecalendar...");
    const ultrarace_races = await scrape_ultraracecalendar();
    all_races = all_races.concat(ultrarace_races);

    console.log("Scraping Ahotu...");
    const ahotu_races = await scrape_ahotu();
    all_races = all_races.concat(ahotu_races);

    console.log("Verifying and correcting races...");
    const verified_races = [];
    const batchSize = 50;
    for (let i = 0; i < all_races.length; i += batchSize) {
        const batch = all_races.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(race => verify_and_correct_race(race)));
        verified_races.push(...results);
    }

    console.log("Normalizing all dates as fallback...");
    verified_races.forEach(r => {
        if (r.date && r.date !== 'TBD') {
            const parts = r.date.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/);
            if (parts) {
                let dNum = parseInt(parts[1], 10);
                let mNum = parseInt(parts[2], 10);
                if (dNum >= 1 && dNum <= 31 && mNum >= 1 && mNum <= 12) {
                    let day = parts[1].padStart(2, '0');
                    let month = parts[2].padStart(2, '0');
                    let year = parts[3];
                    if (year.length === 2) year = "20" + year;
                    r.date = `${day}/${month}/${year}`;
                }
            } else {
                const globalMonthMap = { "januari": "01", "january": "01", "februari": "02", "february": "02", "maart": "03", "march": "03", "april": "04", "mei": "05", "may": "05", "juni": "06", "june": "06", "juli": "07", "july": "07", "augustus": "08", "august": "08", "september": "09", "sep": "09", "oktober": "10", "october": "10", "november": "11", "december": "12" };
                const textDateRegex = new RegExp(`\\b(\\d{1,2})\\s+(${Object.keys(globalMonthMap).join('|')})\\s+(\\d{4})\\b`, 'i');
                const textMatch = r.date.match(textDateRegex);
                if (textMatch) {
                    const day = textMatch[1].padStart(2, '0');
                    const month = globalMonthMap[textMatch[2].toLowerCase()];
                    const year = textMatch[3];
                    r.date = `${day}/${month}/${year}`;
                }
            }
        }
    });

    console.log("Geocoding races...");
    for (const race of verified_races) {
        if (race.city) {
            const { lat, lon } = await geocode(race.city, race.country || '');
            if (lat !== null && lon !== null) {
                race.lat = lat;
                race.lng = lon;
            }
        }
    }

    // Inject highly detailed hardcoded target events as Single Source of Truth
    for (const race of verified_races) {
        if (race.name && race.name.toLowerCase().includes('bello gallico')) {
            race.elevation_points = [
                { d: 0, e: 100 },
                { d: 10, e: 200 },
                { d: 20, e: 150 },
                { d: 30, e: 300 },
                { d: 40, e: 250 },
                { d: 50, e: 400 },
                { d: 60, e: 100 },
                { d: 70, e: 50 },
                { d: 80, e: 100 }
            ];
            race.aid_stations = [15, 30, 45, 60, 75];
        }
    }


    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const valid_races = verified_races.filter(race => {
        if (!race.date || race.date === 'TBD' || !race.distance || race.distance === 'Ultra') {
            return false;
        }

        // Filter out past races
        const dateParts = race.date.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/);
        if (dateParts) {
            let day = parseInt(dateParts[1], 10);
            let month = parseInt(dateParts[2], 10) - 1;
            let yearStr = dateParts[3];
            let year = yearStr.length === 2 ? parseInt("20" + yearStr, 10) : parseInt(yearStr, 10);

            const raceDate = new Date(year, month, day);
            if (raceDate < today) {
                return false;
            }
        }

        const lower = race.distance.toLowerCase();
        let isMiles = /\b(mi|miles|mile)\b/i.test(lower);
        let isHours = /\b(h|hour|hours|uur)\b/i.test(lower) || /\d+h\b/i.test(lower);

        let numbers = race.distance.replace(',', '.').match(/\d+(\.\d+)?/g);
        if (!numbers) return false;

        let maxNum = Math.max(...numbers.map(n => parseFloat(n)));

        if (isHours) {
            return maxNum >= 6;
        } else if (isMiles) {
            return maxNum > 26.2;
        } else {
            return maxNum > 42;
        }
    });

    const prefixRegex = /^\d+(?:[eè]me|ère|er|nd|rd|th|st|e|°|\.)?\s+(?!(?:km|h|hour|uur|miles|mi)\b)/i;

    const filtered_races = [];
    valid_races.forEach(race => {
        if (race.name) {
            race.name = race.name.replace(prefixRegex, '').trim();
        }

        let distStr = race.distance ? race.distance.replace(/[^\d.]/g, '') : '0';
        let distVal = parseFloat(distStr) || 0;

        let isDuplicate = false;
        for (let i = 0; i < filtered_races.length; i++) {
            let existing = filtered_races[i];
            if (existing.name === race.name && existing.date === race.date) {
                let existingDistStr = existing.distance ? existing.distance.replace(/[^\d.]/g, '') : '0';
                let existingDistVal = parseFloat(existingDistStr) || 0;

                // If distance is within 5km, consider it a duplicate
                if (Math.abs(existingDistVal - distVal) <= 5) {
                    isDuplicate = true;

                    // Prefer distance format with 'km' if missing
                    if (!existing.distance.includes('km') && race.distance.includes('km')) {
                        existing.distance = race.distance;
                    }
                    if (!existing.url && race.url) {
                        existing.url = race.url;
                    }
                    break;
                }
            }
        }

        if (!isDuplicate) {
            filtered_races.push(race);
        }
    });

    function generateSlug(name, dateStr) {
        let slug = (name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        let year = "";
        if (dateStr) {
            const match = dateStr.match(/\b(20\d{2})\b/);
            if (match) year = `-${match[1]}`;
        }
        return `${slug}${year}`;
    }
    filtered_races.forEach(race => { race.slug = generateSlug(race.name, race.date); });

        // Read permanent fixes
    let permanentFixes = {};
    try {
        const fixesData = await fs.readFile('data/permanent_fixes.json', 'utf8');
        permanentFixes = JSON.parse(fixesData);
    } catch (e) {
        // File might not exist
    }

    // Apply permanent fixes to filtered races
    filtered_races.forEach(race => {
        if (permanentFixes[race.slug]) {
            const fix = permanentFixes[race.slug];
            if (fix.distance) race.distance = fix.distance;
            if (fix.name) race.name = fix.name;
            if (fix.date) race.date = fix.date;
            if (fix.elevation) race.elevation = fix.elevation;
            if (fix.city) race.city = fix.city;
            if (fix.country) race.country = fix.country;
        }
    });

    // Write audit log
    // Filter out races marked for removal
    const final_races = filtered_races.filter(race => !permanentFixes[race.slug] || !permanentFixes[race.slug].remove);

    // Write audit log
    const auditHeaders = [
        'slug', 'name', 'date', 'distance', 'elevation', 'city', 'country',
        'corrected_distance', 'corrected_name', 'corrected_date',
        'corrected_elevation', 'corrected_city', 'corrected_country', 'remove'
    ];
    const auditLines = [auditHeaders.join(',')];
    final_races.forEach(race => {
        // Escape quotes if present
        const safeName = '"' + (race.name || '').replace(/"/g, '""') + '"';
        const safeDate = '"' + (race.date || '').replace(/"/g, '""') + '"';
        const safeDist = '"' + (race.distance || '').replace(/"/g, '""') + '"';
        const safeElev = '"' + (race.elevation || '').toString().replace(/"/g, '""') + '"';
        const safeCity = '"' + (race.city || '').replace(/"/g, '""') + '"';
        const safeCountry = '"' + (race.country || '').replace(/"/g, '""') + '"';
        auditLines.push(`${race.slug},${safeName},${safeDate},${safeDist},${safeElev},${safeCity},${safeCountry},,,,,,,`);
    });

    await fs.writeFile('data/audit_log.csv', auditLines.join('\n'));

    await fs.writeFile('data/races.json', JSON.stringify(final_races, null, 4));
    console.log(`Successfully scraped and verified ${final_races.length} races and saved to races.json`);
}

main().catch(console.error);
