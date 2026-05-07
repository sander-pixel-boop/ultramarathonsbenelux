const cheerio = require('cheerio');
const { fetchWithTimeout, saveRawData } = require('../scraperHelpers');

async function scrape_hardloopkalender() {
    const url = "https://hardloopkalender.nl/loopagenda-hardlopen/ultraloop/1";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetchWithTimeout(url, { headers, timeout: 15000 });
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
                const event_page = await fetchWithTimeout(full_url, { headers, timeout: 15000 });
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
            } catch {}

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

    await saveRawData('hardloopkalender', races);
}

scrape_hardloopkalender().catch(console.error);
