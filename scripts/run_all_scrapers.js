const { execSync } = require('child_process');
const fs = require('fs');

const scrapers = [
  'ahotu.js',
  'duv.js',
  'finishers.js',
  'hardloopkalender.js',
  'trail_running.js',
  'ultraned.js',
  'ultraracecalendar.js'
];

async function main() {
  // Ensure the raw data directory exists and is clean
  if (fs.existsSync('data/raw')) {
    fs.rmSync('data/raw', { recursive: true, force: true });
  }
  fs.mkdirSync('data/raw', { recursive: true });

  for (const scraper of scrapers) {
    console.log(`\n--- Running ${scraper} ---`);
    try {
      execSync(`node scripts/scrapers/${scraper}`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Error running ${scraper}:`, e.message);
    }
  }

  console.log(`\n--- Merging Data ---`);
  execSync(`node scripts/merge_races.js`, { stdio: 'inherit' });
  console.log('All done!');
}

main();
