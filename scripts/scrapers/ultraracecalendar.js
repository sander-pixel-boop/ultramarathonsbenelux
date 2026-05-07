const cheerio = require('cheerio');
const { fetchWithTimeout, saveRawData } = require('../scraperHelpers');

async function scrape_ultraracecalendar() {
    const url = "https://ultraracecalendar.com/calendar/all/ultras/";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetchWithTimeout(url, { headers, timeout: 15000 });
        if (response.status === 403) {
            console.log("Ultraracecalendar returned 403 - blocked by Cloudflare");
            return await saveRawData('ultraracecalendar', races);
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        const events = $('.event-card').toArray();
        const chunkSize = 5;
        for (let i = 0; i < events.length; i += chunkSize) {
            const chunk = events.slice(i, i + chunkSize);
            const chunkPromises = chunk.map(async (el) => {
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
                        const event_page = await fetchWithTimeout(event_url, { headers, timeout: 15000 });
                        const event_html = await event_page.text();
                        const event_soup = cheerio.load(event_html);

                        event_soup('a[href]').each((i, link) => {
                            const l_href = $(link).attr('href');
                            if (l_href && l_href.includes('http') && !l_href.includes('ultraracecalendar.com') && !l_href.includes('facebook')) {
                                original_url = l_href;
                                return false; // break
                            }
                        });
                    } catch {}
                }

                return {
                    name: title,
                    country: "Unknown",
                    distance: "Ultra",
                    date: date_str,
                    url: original_url,
                    city: ""
                };
            });
            const chunkResults = await Promise.all(chunkPromises);
            races.push(...chunkResults);
        }
    } catch (e) {
        console.error(`Error scraping ultraracecalendar: ${e}`);
    }
    await saveRawData('ultraracecalendar', races);
}

scrape_ultraracecalendar().catch(console.error);
