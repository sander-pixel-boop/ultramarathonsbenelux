const cheerio = require('cheerio');
const { fetchWithTimeout, geocode, verify_and_correct_race, sleep } = require('../utils/scraperUtils');

async function scrape_finishers() {
    const url = "https://www.finishers.com/nl/activiteiten/stratenloop/ultralopen";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetchWithTimeout(url, { headers, timeout: 15000 });
        const html = await response.text();
        const $ = cheerio.load(html);

        const events = $('a[href]').toArray();
        const visited = new Set();
        const validEvents = [];

        for (const a of events) {
            const href = $(a).attr('href');
            if (href && href.includes('/nl/evenement/') && !visited.has(href)) {
                visited.add(href);
                validEvents.push(href);
            }
        }

        const MAX_CONCURRENT = 5;
        for (let i = 0; i < validEvents.length; i += MAX_CONCURRENT) {
            const chunk = validEvents.slice(i, i + MAX_CONCURRENT);
            const chunkPromises = chunk.map(async (href) => {
                let full_url = "https://www.finishers.com" + href;
                let original_url = full_url;
                let title = "";

                try {
                    const event_page = await fetchWithTimeout(full_url, { headers, timeout: 15000 });
                    const event_html = await event_page.text();
                    const event_soup = cheerio.load(event_html);

                    const title_elem = event_soup('h1');
                    title = title_elem.length > 0 ? title_elem.text().trim() : href.split('/').pop();

                    event_soup('a[href]').each((i, link) => {
                        const l_href = $(link).attr('href');
                        if (l_href && l_href.includes('http') && !l_href.includes('finishers.com') && !l_href.includes('facebook') && !l_href.includes('instagram') && !l_href.includes('twitter')) {
                            original_url = l_href;
                            return false; // break
                        }
                    });

                    let distance = "Ultra";
                    let date = "TBD";

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

                    return {
                        name: title,
                        country: "Netherlands",
                        distance: distance,
                        date: date,
                        url: original_url,
                        city: ""
                    }
                } catch {
                    return null;
                }
            });

            const results = await Promise.all(chunkPromises);
            for (const res of results) {
                if (res) races.push(res);
            }
        }
    } catch (e) {
        console.error(`Error scraping Finishers: ${e}`);
    }
    return races;
}

module.exports = scrape_finishers;
