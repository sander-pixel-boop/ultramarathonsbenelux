const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  const raceCards = await page.$$eval('.race-card', cards => {
    return cards.map(card => {
        const h2 = card.querySelector('h2').innerText;
        const paragraphs = Array.from(card.querySelectorAll('p')).map(p => p.innerText);
        return { h2, paragraphs };
    });
  });

  console.log('Race Cards Content (First 2):', JSON.stringify(raceCards.slice(0, 2), null, 2));

  // Click the first race card to open modal
  await page.click('.race-card');

  // Wait for the modal to be visible
  await page.waitForSelector('.modal-overlay', { visible: true });

  // Check modal contents
  const modalData = await page.$eval('.modal-content', modal => {
    const title = modal.querySelector('h2').innerText;
    const subscribeBtn = modal.querySelector('.subscribe-btn');
    return {
      title,
      hasSubscribeButton: !!subscribeBtn
    };
  });

  console.log('Modal Data:', modalData);

  // Close the modal
  await page.click('.modal-close');

  // Wait for modal to disappear
  await page.waitForSelector('.modal-overlay', { hidden: true });

  console.log('Modal closed successfully.');

  await browser.close();
})();
