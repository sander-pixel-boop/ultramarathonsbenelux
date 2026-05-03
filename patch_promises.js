const fs = require('fs');

const file = 'scripts/scraper.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /const results = await Promise\.all\(pagePromises\);/g,
    `const results = [];
    for (let i = 0; i < pagePromises.length; i += 2) {
        const batch = pagePromises.slice(i, i + 2);
        const batchResults = await Promise.all(batch.map(p => p()));
        results.push(...batchResults);
    }`
);

content = content.replace(
    /pagePromises\.push\(\(async \(\) => \{/g,
    `pagePromises.push(async () => {`
);

content = content.replace(
    /                return page_races;\n            \}\)\(\)\);/g,
    `                return page_races;
            });`
);

fs.writeFileSync(file, content);
console.log("Patched scraper.js");
