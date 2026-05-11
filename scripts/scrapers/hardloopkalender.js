const cheerio = require('cheerio');
const { fetchWithTimeout, geocode, verify_and_correct_race, sleep } = require('../utils/scraperUtils');

async function scrape_hardloopkalender() {
    const url = "https://hardloopkalender.nl/loopagenda-hardlopen/ultraloop/1";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetchWithTimeout(url, { headers, timeout: 15000 });
        const html = await response.text();
        const $ = cheerio.load(html);

        const rows = $('tr').toArray();
        const MAX_CONCURRENT = 5;

        for (let i = 0; i < rows.length; i += MAX_CONCURRENT) {
            const chunk = rows.slice(i, i + MAX_CONCURRENT);
            const chunkPromises = chunk.map(async (row) => {
                const cells = $(row).find('td');
                if (cells.length === 0) return null;

                const date_str = $(cells[0]).text().trim();
                if (!date_str) return null;

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

                if (!event_link) return null;

                let full_url = event_link.startsWith('/') ? "https://hardloopkalender.nl" + event_link : event_link;
                let original_url = full_url;
                let distance = "Ultra";

                try {
                    const event_page = await fetchWithTimeout(full_url, { headers, timeout: 15000 });
                    const event_html = await event_page.text();
                    const event_soup = cheerio.load(event_html);

                    let found = false;
                    event_soup('a').each((i, a) => {
                        const text = $(a).text().toLowerCase();
                        if (text.includes("website")) {
                            const link = $(a).attr('href');
                            if (link && !link.includes('hardloopkalender')) {
                                original_url = link;
                                found = true;
                                return false; // break
                            }
                        }
                    });

                    if (!found) {
                        event_soup('a[target="_blank"]').each((i, a) => {
                            const link = $(a).attr('href');
                            if (link && !link.includes('hardloopkalender') && !link.includes('facebook') && !link.includes('twitter')) {
                                original_url = link;
                                return false; // break
                            }
                        });
                    }

                    const bodyText = event_soup('body').text();
                    const distMatch = bodyText.match(/\b(\d+(?:\.\d+)?)\s*(km|mi|miles|k)\b/i);
                    if (distMatch) {
                        distance = distMatch[0];
                    }
                } catch {}

                return {
                    name: title,
                    country: "Netherlands",
                    distance: distance,
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
        console.error(`Error scraping Hardloopkalender: ${e}`);
    }
    return races;
}

module.exports = scrape_hardloopkalender;
