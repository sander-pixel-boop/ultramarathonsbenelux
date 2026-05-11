const cheerio = require('cheerio');
const { fetchWithTimeout, geocode, verify_and_correct_race, sleep } = require('../utils/scraperUtils');

async function scrape_trail_running() {
    const url = "https://www.trail-running.eu/wp-json/trail-running/v1/get-events?lang=en";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetchWithTimeout(url, { headers, timeout: 15000 });
        if (response.status === 403) return races;

        const data = await response.json();
        const items = data.items || [];
        const MAX_CONCURRENT = 5;

        for (let i = 0; i < items.length; i += MAX_CONCURRENT) {
            const chunk = items.slice(i, i + MAX_CONCURRENT);
            const chunkPromises = chunk.map(async (item) => {
                const title = item.title || "";
                const date_str = item.date_nice || item.date || "";
                const distances = item.distances_nice || "";
                const event_url = item.permalink || "";

                let original_url = event_url;
                try {
                    if (event_url) {
                        const event_page = await fetchWithTimeout(event_url, { headers, timeout: 15000 });
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
                } catch {}

                return {
                    name: title,
                    country: "Netherlands",
                    distance: distances,
                    date: date_str,
                    url: original_url,
                    city: ""
                };
            });

            const results = await Promise.all(chunkPromises);
            for (const res of results) {
                if (res) races.push(res);
            }
        }
    } catch (e) {
        console.error(`Error scraping Trail-running.eu: ${e}`);
    }
    return races;
}

module.exports = scrape_trail_running;
