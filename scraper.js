const fs = require('fs/promises');
const cheerio = require('cheerio');

const GEO_CACHE = {};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 5000 } = options;

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
        const response = await fetch(url.toString(), {
            headers: { "User-Agent": "BeneluxUltraRacesScraper/1.0" }
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
    const url = race.url || '';
    if (!url || !url.startsWith('http')) {
        return race;
    }

    try {
        const response = await fetchWithTimeout(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 5000
        });

        if (!response.ok) throw new Error("Unreachable");

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove scripts and styles before extracting text to mirror BeautifulSoup's get_text somewhat
        $('script, style').remove();
        const text = $('body').text().replace(/\s+/g, ' ').trim();

        // Verify / Correct Date
        const currentDate = race.date || 'TBD';
        if (currentDate === 'TBD' || !currentDate) {
            const dateMatch = text.match(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/);
            if (dateMatch) race.date = dateMatch[0];
        } else if (!text.includes(currentDate)) {
            const dateMatch = text.match(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/);
            if (dateMatch) race.date = dateMatch[0];
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

    } catch (e) {
        // If the original website is unreachable or times out, we just keep what we have.
    }

    return race;
}

async function scrape_ultraned() {
    const url = "https://ultraned.org/?post_type=tribe_events";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetch(url, { headers });
        const html = await response.text();
        const $ = cheerio.load(html);

        const events = $('.type-tribe_events').toArray();
        for (const el of events) {
            const event = $(el);
            let title = '';
            let event_url = '';
            let date_str = '';

            const linkTag = event.find('a.tribe-events-calendar-list__event-title-link');
            if (linkTag.length > 0) {
                title = linkTag.text().trim();
                event_url = linkTag.attr('href');
                const timeTag = event.find('time');
                if (timeTag.length > 0) {
                    date_str = timeTag.attr('datetime') || timeTag.text().trim();
                }
            } else {
                const title_a = event.find('h3.tribe-events-list-event-title a');
                if (title_a.length === 0) continue;
                title = title_a.text().trim();
                event_url = title_a.attr('href');
                const timeTag = event.find('.tribe-event-schedule-details');
                if (timeTag.length > 0) {
                    date_str = timeTag.text().trim();
                }
            }

            let original_url = event_url;
            try {
                if (event_url) {
                    const event_page = await fetch(event_url, { headers });
                    const event_html = await event_page.text();
                    const event_soup = cheerio.load(event_html);

                    const url_elem = event_soup('.tribe-events-event-url a');
                    if (url_elem.length > 0) {
                        original_url = url_elem.attr('href');
                    } else {
                        event_soup('a').each((i, aTag) => {
                            const href = $(aTag).attr('href') || '';
                            if (href && href.includes('http') && !href.includes('ultraned.org') && !href.includes('facebook') && !href.includes('google')) {
                                original_url = href;
                                return false; // break each loop
                            }
                        });
                    }
                }
            } catch (err) {}

            races.push({
                name: title,
                country: "Netherlands",
                distance: "Ultra",
                date: date_str,
                url: original_url,
                city: ""
            });
        }
    } catch (e) {
        console.error(`Error scraping Ultraned: ${e}`);
    }
    return races;
}

async function scrape_hardloopkalender() {
    const url = "https://hardloopkalender.nl/loopagenda-hardlopen/ultraloop/1";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetch(url, { headers });
        const html = await response.text();
        const $ = cheerio.load(html);

        const rows = $('tr').toArray();
        for (const row of rows) {
            const cells = $(row).find('td');
            if (cells.length === 0) continue;

            const date_str = $(cells[0]).text().trim();
            if (!date_str) continue;

            let event_link = null;
            let title = "";
            $(cells[1]).find('a[href]').each((i, a) => {
                const href = $(a).attr('href');
                if (href.includes('/loopevenement/') || href.includes('/hardloopevenement/')) {
                    event_link = href;
                    title = $(a).attr('title') || $(a).text().trim();
                    return false; // break
                }
            });

            if (!event_link) continue;

            let full_url = event_link.startsWith('/') ? "https://hardloopkalender.nl" + event_link : event_link;
            let original_url = full_url;

            try {
                const event_page = await fetch(full_url, { headers });
                const event_html = await event_page.text();
                const event_soup = cheerio.load(event_html);

                let found = false;
                event_soup('a').each((i, a) => {
                    const text = $(a).text().toLowerCase();
                    if (text.includes('website')) {
                        const href = $(a).attr('href');
                        if (href) {
                            original_url = href;
                            found = true;
                            return false; // break
                        }
                    }
                });
            } catch (err) {}

            races.push({
                name: title,
                country: "Netherlands",
                distance: "Ultra",
                date: date_str,
                url: original_url,
                city: ""
            });
        }
    } catch (e) {
        console.error(`Error scraping Hardloopkalender: ${e}`);
    }
    return races;
}

async function scrape_finishers() {
    const url = "https://www.finishers.com/nl/activiteiten/stratenloop/ultralopen";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetch(url, { headers });
        const html = await response.text();
        const $ = cheerio.load(html);

        const events = $('a[href]').toArray();
        const visited = new Set();

        for (const a of events) {
            const href = $(a).attr('href');
            if (href && href.includes('/nl/evenement/') && !visited.has(href)) {
                visited.add(href);
                let full_url = "https://www.finishers.com" + href;
                let original_url = full_url;

                try {
                    const event_page = await fetch(full_url, { headers });
                    const event_html = await event_page.text();
                    const event_soup = cheerio.load(event_html);

                    const title_elem = event_soup('h1');
                    let title = title_elem.length > 0 ? title_elem.text().trim() : href.split('/').pop();

                    event_soup('a[href]').each((i, link) => {
                        const l_href = $(link).attr('href');
                        if (l_href && l_href.includes('http') && !l_href.includes('finishers.com') && !l_href.includes('facebook') && !l_href.includes('instagram') && !l_href.includes('twitter')) {
                            original_url = l_href;
                            return false; // break
                        }
                    });

                    races.push({
                        name: title,
                        country: "Netherlands",
                        distance: "Ultra",
                        date: "TBD",
                        url: original_url,
                        city: ""
                    });
                } catch (err) {}
            }
        }
    } catch (e) {
        console.error(`Error scraping Finishers: ${e}`);
    }
    return races;
}

async function scrape_trail_running() {
    const url = "https://www.trail-running.eu/wp-json/trail-running/v1/get-events?lang=en";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetch(url, { headers });
        if (response.status === 403) return races;

        const data = await response.json();
        const items = data.items || [];

        for (const item of items) {
            const title = item.title || "";
            const date_str = item.date_nice || item.date || "";
            const distances = item.distances_nice || "";
            const event_url = item.permalink || "";

            let original_url = event_url;
            try {
                if (event_url) {
                    const event_page = await fetch(event_url, { headers });
                    const event_html = await event_page.text();
                    const event_soup = cheerio.load(event_html);

                    event_soup('a[href]').each((i, link) => {
                        const l_href = $(link).attr('href');
                        if (l_href && l_href.includes('http') && !l_href.includes('trail-running.eu') && !l_href.includes('facebook') && !l_href.includes('google')) {
                            original_url = l_href;
                            return false; // break
                        }
                    });
                }
            } catch (err) {}

            races.push({
                name: title,
                country: "Netherlands",
                distance: distances,
                date: date_str,
                url: original_url,
                city: ""
            });
        }
    } catch (e) {
        console.error(`Error scraping Trail-running.eu: ${e}`);
    }
    return races;
}

async function scrape_ultraracecalendar() {
    const url = "https://ultraracecalendar.com/calendar/all/ultras/";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetch(url, { headers });
        if (response.status === 403) {
            console.log("Ultraracecalendar returned 403 - blocked by Cloudflare");
            return races;
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        const events = $('.event-card').toArray();
        for (const el of events) {
            const event = $(el);
            const title_elem = event.find('h3');
            const title = title_elem.length > 0 ? title_elem.text().trim() : "Unknown Race";

            const date_elem = event.find('.event-date');
            const date_str = date_elem.length > 0 ? date_elem.text().trim() : "";

            const link_elem = event.find('a[href]');
            const event_url = link_elem.length > 0 ? link_elem.attr('href') : "";
            let original_url = event_url;

            if (event_url) {
                try {
                    const event_page = await fetch(event_url, { headers });
                    const event_html = await event_page.text();
                    const event_soup = cheerio.load(event_html);

                    event_soup('a[href]').each((i, link) => {
                        const l_href = $(link).attr('href');
                        if (l_href && l_href.includes('http') && !l_href.includes('ultraracecalendar.com') && !l_href.includes('facebook')) {
                            original_url = l_href;
                            return false; // break
                        }
                    });
                } catch (err) {}
            }

            races.push({
                name: title,
                country: "Unknown",
                distance: "Ultra",
                date: date_str,
                url: original_url,
                city: ""
            });
        }
    } catch (e) {
        console.error(`Error scraping ultraracecalendar: ${e}`);
    }
    return races;
}

async function scrape_ahotu() {
    const url = "https://www.ahotu.com/nl/kalender/trail-running/ultramarathon/belgie";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetch(url, { headers });
        if (response.status === 403) {
            console.log("Ahotu returned 403 - blocked by Cloudflare");
            return races;
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        const events = $('a.event-link').toArray();
        for (const el of events) {
            const event = $(el);
            const title = event.text().trim();
            let event_url = event.attr('href') || '';
            let original_url = event_url;

            if (event_url) {
                if (!event_url.startsWith('http')) {
                    event_url = 'https://www.ahotu.com' + event_url;
                }
                try {
                    const event_page = await fetch(event_url, { headers });
                    const event_html = await event_page.text();
                    const event_soup = cheerio.load(event_html);

                    event_soup('a[href]').each((i, link) => {
                        const l_href = $(link).attr('href');
                        if (l_href && l_href.includes('http') && !l_href.includes('ahotu.com') && !l_href.includes('facebook')) {
                            original_url = l_href;
                            return false; // break
                        }
                    });
                } catch (err) {}
            }

            races.push({
                name: title,
                country: "Belgium",
                distance: "Ultra",
                date: "TBD",
                url: original_url,
                city: ""
            });
        }
    } catch (e) {
        console.error(`Error scraping ahotu: ${e}`);
    }
    return races;
}

async function scrape_duv() {
    const countries = { 'BEL': 'Belgium', 'NED': 'Netherlands', 'LUX': 'Luxembourg' };
    const all_races = [];
    const headers = { "User-Agent": "Mozilla/5.0" };

    for (const [c_code, c_name] of Object.entries(countries)) {
        for (const year of ['2024', '2025', '2026', '2027']) {
            const url = `https://statistik.d-u-v.org/calendar.php?year=${year}&country=${c_code}`;
            try {
                const response = await fetch(url, { headers });
                const html = await response.text();
                const $ = cheerio.load(html);

                const rows = $('tr').toArray();
                for (const row of rows) {
                    const cols = $(row).find('td');
                    // A valid event row typically has ~7 columns and first column is a date
                    if (cols.length >= 4) {
                        const dateText = $(cols[0]).text().trim();
                        if ((dateText.match(/\./g) || []).length === 2) {
                            const date = dateText;
                            const name = $(cols[1]).text().trim();
                            const distance = $(cols[2]).text().trim();

                            const city_raw = $(cols[3]).text().trim();
                            const city = city_raw.replace(/\s*\([^)]*\)$/, '').trim();

                            const link_tag = $(cols[1]).find('a');
                            const link_href = link_tag.attr('href');
                            const link = link_href ? "https://statistik.d-u-v.org/" + link_href : "";

                            let original_url = link;
                            if (link) {
                                try {
                                    const event_response = await fetch(link, { headers });
                                    const event_html = await event_response.text();
                                    const event_soup = cheerio.load(event_html);

                                    let foundWebPage = false;
                                    event_soup('b').each((i, b) => {
                                        if ($(b).text().includes('Web page:')) {
                                            foundWebPage = true;
                                            const td_sibling = $(b).parent().next('td');
                                            if (td_sibling.length > 0) {
                                                const a_tag = td_sibling.find('a');
                                                if (a_tag.length > 0 && a_tag.attr('href')) {
                                                    original_url = a_tag.attr('href');
                                                }
                                            }
                                            return false; // break
                                        }
                                    });
                                } catch (err) {
                                    console.error(`Error fetching original url for ${link}: ${err.message}`);
                                }
                            }

                            all_races.push({
                                name: name,
                                country: c_name,
                                distance: distance,
                                date: date,
                                url: original_url,
                                city: city
                            });
                        }
                    }
                }
            } catch (e) {
                console.error(`Error scraping DUV ${c_code} ${year}: ${e.message}`);
            }
        }
    }

    return all_races;
}

async function main() {
    let all_races = [];

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
    for (const race of all_races) {
        const verified = await verify_and_correct_race(race);
        verified_races.push(verified);
    }

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

    await fs.writeFile('races.json', JSON.stringify(verified_races, null, 4));
    console.log(`Successfully scraped and verified ${verified_races.length} races and saved to races.json`);
}

main().catch(console.error);
