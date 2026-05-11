const cheerio = require('cheerio');
const { fetchWithTimeout, geocode, verify_and_correct_race, sleep } = require('../utils/scraperUtils');

async function scrape_ahotu() {
    const url = "https://www.ahotu.com/nl/kalender/trail-running/ultramarathon/belgie";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetchWithTimeout(url, { headers, timeout: 15000 });
        if (response.status === 403) {
            console.log("Ahotu returned 403 - blocked by Cloudflare");
            return races;
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        const events = $('a.event-link').toArray();
        const MAX_CONCURRENT = 5;

        for (let i = 0; i < events.length; i += MAX_CONCURRENT) {
            const chunk = events.slice(i, i + MAX_CONCURRENT);
            const chunkPromises = chunk.map(async (el) => {
                const event = $(el);
                const title = event.text().trim();
                let event_url = event.attr('href') || '';
                let original_url = event_url;

                let distance = "Ultra";
                let date = "TBD";

                if (event_url) {
                    if (!event_url.startsWith('http')) {
                        event_url = 'https://www.ahotu.com' + event_url;
                    }
                    try {
                        const event_page = await fetchWithTimeout(event_url, { headers, timeout: 15000 });
                        const event_html = await event_page.text();
                        const event_soup = cheerio.load(event_html);

                        // Extract actual URL
                        event_soup('a[href]').each((i, link) => {
                            const l_href = $(link).attr('href');
                            if (l_href && l_href.includes('http') && !l_href.includes('ahotu.com') && !l_href.includes('facebook')) {
                                original_url = l_href;
                                return false; // break
                            }
                        });

                        // Extract distance and date from page text
                        const bodyText = event_soup('body').text();

                        // Extract distance
                        const distMatch = bodyText.match(/\b(\d+(?:\.\d+)?)\s*(km|mi|miles|k)\b/i);
                        if (distMatch) {
                            distance = distMatch[0];
                        }

                        // Extract date
                        const dateMatch = bodyText.match(/\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|januari|februari|maart|mei|juni|juli|augustus|oktober|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})\b/i);
                        if (dateMatch) {
                            date = dateMatch[0];
                        }

                    } catch {}
                }

                return {
                    name: title,
                    country: "Belgium",
                    distance: distance,
                    date: date,
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
        console.error(`Error scraping ahotu: ${e}`);
    }
    return races;
}

module.exports = scrape_ahotu;
