const cheerio = require('cheerio');
const fetchWithTimeout = async (url, options = {}) => {
    const timeout = options.timeout || 15000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
};

async function scrape_ultraned() {
    const url = "https://ultraned.org/?post_type=tribe_events";
    const headers = { "User-Agent": "Mozilla/5.0" };
    const races = [];
    try {
        const response = await fetchWithTimeout(url, { headers, timeout: 15000 });
        const html = await response.text();
        const $ = cheerio.load(html);

        const events = $('.type-tribe_events').toArray();
        const eventsData = [];

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
            eventsData.push({ title, event_url, date_str });
        }

        const BATCH_SIZE = 5;
        for (let i = 0; i < eventsData.length; i += BATCH_SIZE) {
            const batch = eventsData.slice(i, i + BATCH_SIZE);
            const promises = batch.map(async (data) => {
                let original_url = data.event_url;
                try {
                    if (data.event_url) {
                        const event_page = await fetchWithTimeout(data.event_url, { headers, timeout: 15000 });
                        const event_html = await event_page.text();
                        const event_soup = cheerio.load(event_html);

                        const url_elem = event_soup('.tribe-events-event-url a');
                        if (url_elem.length > 0) {
                            original_url = url_elem.attr('href');
                        } else {
                            event_soup('a').each((i, aTag) => {
                                const href = event_soup(aTag).attr('href') || '';
                                if (href && href.includes('http') && !href.includes('ultraned.org') && !href.includes('facebook') && !href.includes('google')) {
                                    original_url = href;
                                    return false; // break each loop
                                }
                            });
                        }
                    }
                } catch {}

                return {
                    name: data.title,
                    country: "Netherlands",
                    distance: "Ultra",
                    date: data.date_str,
                    url: original_url,
                    city: ""
                };
            });

            const results = await Promise.all(promises);
            races.push(...results);
        }

    } catch (e) {
        console.error(`Error scraping Ultraned: ${e}`);
    }
    return races;
}

(async () => {
    console.time("scrape_ultraned_optimized");
    const result = await scrape_ultraned();
    console.timeEnd("scrape_ultraned_optimized");
    console.log("Races found:", result.length);
})();
