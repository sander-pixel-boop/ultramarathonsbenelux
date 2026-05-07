const cheerio = require('cheerio');
const { fetchWithTimeout, saveRawData } = require('../scraperHelpers');

async function scrape_duv() {
    const countries = { 'BEL': 'Belgium', 'NED': 'Netherlands', 'LUX': 'Luxembourg' };
    let all_races = [];
    const headers = { "User-Agent": "Mozilla/5.0" };

    const pagePromises = [];

    for (const [c_code, c_name] of Object.entries(countries)) {
        const currentYear = new Date().getFullYear();
        for (const year of [currentYear.toString(), (currentYear + 1).toString(), (currentYear + 2).toString()]) {
            pagePromises.push(async () => {
                const url = `https://statistik.d-u-v.org/calendar.php?year=${year}&country=${c_code}`;
                const page_races = [];
                try {
                    const response = await fetchWithTimeout(url, { headers, timeout: 15000 });
                    const html = await response.text();
                    const $ = cheerio.load(html);

                    const rows = $('tr').toArray();
                    const rowPromises = []; const MAX_CONCURRENT = 5;

                    for (const row of rows) {
                        const cols = $(row).find('td');
                        if (cols.length >= 4) {
                            const dateText = $(cols[0]).text().trim();
                            if ((dateText.match(/\./g) || []).length === 2) {
                                rowPromises.push(async () => {
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
                                            const event_response = await fetchWithTimeout(link, { headers, timeout: 15000 });
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

                                    page_races.push({
                                        name: name,
                                        country: c_name,
                                        distance: distance,
                                        date: date,
                                        url: original_url,
                                        city: city
                                    });
                                });
                            }
                        }
                    }
                    for (let i = 0; i < rowPromises.length; i += MAX_CONCURRENT) {
                        const batch = rowPromises.slice(i, i + MAX_CONCURRENT);
                        await Promise.all(batch.map(p => p()));
                    }
                } catch (e) {
                    console.error(`Error scraping DUV ${c_code} ${year}: ${e.message}`);
                }
                return page_races;
            });
        }
    }

    const results = [];
    for (let i = 0; i < pagePromises.length; i += 2) {
        const batch = pagePromises.slice(i, i + 2);
        const batchResults = await Promise.all(batch.map(p => p()));
        results.push(...batchResults);
    }
    results.forEach(res => {
        all_races = all_races.concat(res);
    });

    await saveRawData('duv', all_races);
}

scrape_duv().catch(console.error);
