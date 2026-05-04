const fs = require('fs');

const file = 'scripts/scraper.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /const rowPromises = \[\];/g,
    `const rowPromises = []; const MAX_CONCURRENT = 5;`
);

content = content.replace(
    /await Promise\.all\(rowPromises\);/g,
    `for (let i = 0; i < rowPromises.length; i += MAX_CONCURRENT) {
                        const batch = rowPromises.slice(i, i + MAX_CONCURRENT);
                        await Promise.all(batch.map(p => p()));
                    }`
);

content = content.replace(
    /rowPromises\.push\(\(async \(\) => \{/g,
    `rowPromises.push(async () => {`
);

content = content.replace(
    /\}\)\(\)\);/g,
    `});`
);

content = content.replace(
    /const \{ timeout = 5000 \} = options;/,
    `const { timeout = 30000, retries = 5, retryDelay = 2000 } = options;`
);

content = content.replace(
    /async function fetchWithTimeout\(resource, options = \{\}\) \{[\s\S]*?throw error;\n    \}\n\}/,
    `async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 30000, retries = 5, retryDelay = 2000 } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            if (attempt === retries) {
                throw error;
            }
            await sleep(retryDelay * attempt); // exponential backoff
        }
    }
}`
);

fs.writeFileSync(file, content);
console.log("Patched scraper.js");
