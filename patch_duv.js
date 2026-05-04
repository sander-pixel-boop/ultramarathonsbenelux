const fs = require('fs');

const file = 'scripts/scraper.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /const rowPromises = \[\];\s+for \(const row of rows\) \{/g,
    `const rowPromises = [];
                    const rowFuncs = [];
                    for (const row of rows) {`
);

content = content.replace(
    /rowPromises\.push\(\(async \(\) => \{/g,
    `rowFuncs.push((async () => {`
);

content = content.replace(
    /await Promise\.all\(rowPromises\);/g,
    `const MAX_CONCURRENT = 5;
                    for (let i = 0; i < rowFuncs.length; i += MAX_CONCURRENT) {
                        const batch = rowFuncs.slice(i, i + MAX_CONCURRENT);
                        await Promise.all(batch.map(f => f()));
                    }`
);

fs.writeFileSync(file, content);
console.log("Patched scraper.js");
