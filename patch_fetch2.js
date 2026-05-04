const fs = require('fs');

const file = 'scripts/scraper.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /\}\)\(\)\);/g,
    `});`
);

fs.writeFileSync(file, content);
console.log("Patched scraper.js");
