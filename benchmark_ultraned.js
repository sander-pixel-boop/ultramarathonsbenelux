const fs = require('fs');
const path = require('path');

// Extract fetchWithTimeout and other dependencies from scraper.js
const scraperCode = fs.readFileSync('scraper.js', 'utf8');

const setupCode = `
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
`;

const extractFuncCode = scraperCode.substring(scraperCode.indexOf('async function scrape_ultraned()'), scraperCode.indexOf('async function scrape_hardloopkalender()'));

const testCode = setupCode + extractFuncCode + `
(async () => {
    console.time("scrape_ultraned");
    const result = await scrape_ultraned();
    console.timeEnd("scrape_ultraned");
    console.log("Races found:", result.length);
})();
`;

fs.writeFileSync('test_ultraned.js', testCode);
