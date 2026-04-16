const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  await page.goto('http://localhost:8000/index.html', { waitUntil: 'networkidle0' });

  const raceCards = await page.$$eval('.race-card', cards => {
    return cards.map(card => {
        const h2 = card.querySelector('h2').innerText;
        const paragraphs = Array.from(card.querySelectorAll('p')).map(p => p.innerText);
        return { h2, paragraphs };
    });
  });

  console.log(JSON.stringify(raceCards.slice(0, 5), null, 2));

  await browser.close();
})();
