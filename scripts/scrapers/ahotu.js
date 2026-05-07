const cheerio = require('cheerio');
const { fetchWithTimeout, saveRawData } = require('../scraperHelpers');

async function scrape_ahotu() {
    const url = "https://www.ahotu.com/nl/kalender/trail-running/ultramarathon/belgie";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetchWithTimeout(url, { headers, timeout: 15000 });
        if (response.status === 403) {
            console.log("Ahotu returned 403 - blocked by Cloudflare");
            return await saveRawData('ahotu', races);
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        const events = $('a.event-link').toArray();
        const promises = [];
        for (const el of events) {
            const event = $(el);
            const title = event.text().trim();
            let event_url = event.attr('href') || '';

            promises.push((async () => {
                let original_url = event_url;

                if (event_url) {
                    if (!event_url.startsWith('http')) {
                        event_url = 'https://www.ahotu.com' + event_url;
                    }
                    try {
                        const event_page = await fetchWithTimeout(event_url, { headers, timeout: 15000 });
                        const event_html = await event_page.text();
                        const event_soup = cheerio.load(event_html);

                        event_soup('a[href]').each((i, link) => {
                            const l_href = $(link).attr('href');
                            if (l_href && l_href.includes('http') && !l_href.includes('ahotu.com') && !l_href.includes('facebook')) {
                                original_url = l_href;
                                return false; // break
                            }
                        });
                    } catch {}
                }

                races.push({
                    name: title,
                    country: "Belgium",
                    distance: "Ultra",
                    date: "TBD",
                    url: original_url,
                    city: ""
                });
            })());
        }
        await Promise.all(promises);
    } catch (e) {
        console.error(`Error scraping ahotu: ${e}`);
    }

    await saveRawData('ahotu', races);
}

scrape_ahotu().catch(console.error);
