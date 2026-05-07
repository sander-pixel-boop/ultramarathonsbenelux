const cheerio = require('cheerio');
const { fetchWithTimeout, saveRawData } = require('../scraperHelpers');

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

        const promises = [];
        for (const a of events) {
            const href = $(a).attr('href');
            if (href && href.includes('/nl/evenement/') && !visited.has(href)) {
                visited.add(href);
                let full_url = "https://www.finishers.com" + href;
                let original_url = full_url;

                promises.push((async () => {
                    try {
                        const event_page = await fetchWithTimeout(full_url, { headers, timeout: 15000 });
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
                    } catch {}
                })());
            }
        }
        await Promise.all(promises);
    } catch (e) {
        console.error(`Error scraping Finishers: ${e}`);
    }

    await saveRawData('finishers', races);
}

scrape_finishers().catch(console.error);
