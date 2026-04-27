const fs = require('fs');

const file = 'scripts/scraper.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /const race_id = Buffer\.from\(`\${name}-\${year}`\)\.toString\('base64'\);/,
    "// Distances is an array usually\n            const maxDist = item.distances ? Math.max(...item.distances) : 0;\n            const dist_km = parseFloat(maxDist || 0);\n            const race_id = Buffer.from(`${name}-${year}-${dist_km}`).toString('base64');"
);

content = content.replace(
    /\/\/ Distances is an array usually\n            const maxDist = item\.distances \? Math\.max\(\.\.\.item\.distances\) : 0;\n            const dist_km = parseFloat\(maxDist \|\| 0\);\n\n/,
    ""
);

content = content.replace(
    /registration_url: item\.permalink \|\| "",\n                official_site_url: item\.permalink \|\| "",/g,
    `organizer_name: "",
                registration_page: item.permalink || "",
                event_homepage: item.permalink || "",
                registration_url: item.permalink || "",
                official_site_url: item.permalink || "",`
);

// CSV Export logic
const csvLogic = `
function exportAuditLogCSV(races) {
    const csvLines = ["Organizer,Race,KM,Date,SiteURL,RegURL"];
    races.forEach(r => {
        const org = \`"\${r.organizer_name || ''}"\`;
        const race = \`"\${r.name || ''}"\`;
        const km = r.dist_km;
        const date = r.date_iso;
        const site = \`"\${r.event_homepage || ''}"\`;
        const reg = \`"\${r.registration_page || ''}"\`;
        csvLines.push(\`\${org},\${race},\${km},\${date},\${site},\${reg}\`);
    });
    fs.writeFileSync(path.join(__dirname, 'audit_log.csv'), csvLines.join('\\n'));
    console.log("Saved audit log to scripts/audit_log.csv");
}
`;

content = content.replace(/async function runScraper\(\) \{/, csvLogic + '\nasync function runScraper() {');

content = content.replace(/console\.log\(`Saved \${finalRaces\.length} races to \${DATA_FILE}\.`\);/, "console.log(`Saved ${finalRaces.length} races to ${DATA_FILE}.`);\n    exportAuditLogCSV(finalRaces);");

fs.writeFileSync(file, content);
